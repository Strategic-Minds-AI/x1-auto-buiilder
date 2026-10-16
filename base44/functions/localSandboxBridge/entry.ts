import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';

// Local Sandbox Bridge — connects a user's local computer to the app as a live sandbox.
// The local agent (a Node.js script the user runs on their machine) polls this endpoint
// for pending commands, executes them locally, and reports results back.
// GPT (or the pipeline, or an admin) sends commands through this bridge.
//
// Protocol:
//   POST { action: "register" }                     → creates a session, returns session_id + auth token
//   POST { action: "heartbeat", session_id }         → updates last_heartbeat, marks online
//   POST { action: "poll", session_id }               → returns next pending command (assigns it)
//   POST { action: "report", session_id, command_id, result } → stores execution result
//   POST { action: "command", session_id, command }  → admin/GPT enqueues a new command
//   GET  { action: "status" }                          → lists all sessions + queue stats

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin required' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const { action } = body;

    // ── REGISTER: local agent announces itself ──
    if (action === 'register') {
      const { machineName, capabilities, workingDir, os, nodeVersion } = body;
      if (!machineName) return Response.json({ error: 'machineName required' }, { status: 400 });

      const sessionId = crypto.randomUUID();
      const authToken = crypto.randomUUID().replace(/-/g, '');

      const session = await base44.asServiceRole.entities.LocalSandboxSession.create({
        session_id: sessionId,
        machine_name: machineName,
        status: 'online',
        capabilities: capabilities || ['shell', 'filesystem', 'npm', 'node'],
        working_dir: workingDir || '',
        os: os || 'unknown',
        node_version: nodeVersion || '',
        last_heartbeat: new Date().toISOString(),
        commands_executed: 0,
        commands_failed: 0,
        auth_token: authToken,
      });

      return Response.json({
        ok: true,
        session_id: sessionId,
        auth_token: authToken,
        poll_interval_seconds: 5,
        message: `Local sandbox "${machineName}" registered. Run the agent with this token.`,
      });
    }

    // ── HEARTBEAT: keep session alive ──
    if (action === 'heartbeat') {
      const { sessionId } = body;
      if (!sessionId) return Response.json({ error: 'sessionId required' }, { status: 400 });

      const { items } = await base44.asServiceRole.entities.LocalSandboxSession.filter(
        { session_id: sessionId },
        { limit: 1 }
      );
      if (!items.length) return Response.json({ error: 'Session not found' }, { status: 404 });

      await base44.asServiceRole.entities.LocalSandboxSession.update(items[0].id, {
        status: 'online',
        last_heartbeat: new Date().toISOString(),
      });

      return Response.json({ ok: true, timestamp: new Date().toISOString() });
    }

    // ── POLL: local agent fetches next command ──
    if (action === 'poll') {
      const { sessionId } = body;
      if (!sessionId) return Response.json({ error: 'sessionId required' }, { status: 400 });

      const { items: sessions } = await base44.asServiceRole.entities.LocalSandboxSession.filter(
        { session_id: sessionId },
        { limit: 1 }
      );
      if (!sessions.length) return Response.json({ error: 'Session not found' }, { status: 404 });

      // Find next pending command for this session, ordered by priority then created_date
      const { items: pending } = await base44.asServiceRole.entities.LocalSandboxCommand.filter(
        { session_id: sessionId, status: 'pending' },
        { sort: '-created_date', limit: 1 }
      );

      if (!pending.length) {
        return Response.json({ ok: true, command: null, message: 'No pending commands' });
      }

      const cmd = pending[0];
      await base44.asServiceRole.entities.LocalSandboxCommand.update(cmd.id, {
        status: 'assigned',
        assigned_at: new Date().toISOString(),
      });
      await base44.asServiceRole.entities.LocalSandboxSession.update(sessions[0].id, {
        current_command_id: cmd.command_id,
      });

      return Response.json({
        ok: true,
        command: {
          command_id: cmd.command_id,
          command_type: cmd.command_type,
          payload: cmd.payload,
          timeout_seconds: cmd.timeout_seconds,
          source: cmd.source,
        },
      });
    }

    // ── REPORT: local agent sends execution result ──
    if (action === 'report') {
      const { sessionId, commandId, result, status } = body;
      if (!sessionId || !commandId) return Response.json({ error: 'sessionId and commandId required' }, { status: 400 });

      const { items: cmds } = await base44.asServiceRole.entities.LocalSandboxCommand.filter(
        { session_id: sessionId, command_id: commandId },
        { limit: 1 }
      );
      if (!cmds.length) return Response.json({ error: 'Command not found' }, { status: 404 });

      const finalStatus = status || (result?.exit_code === 0 ? 'completed' : 'failed');
      await base44.asServiceRole.entities.LocalSandboxCommand.update(cmds[0].id, {
        status: finalStatus,
        result: result || {},
        completed_at: new Date().toISOString(),
      });

      // Update session stats
      const { items: sessions } = await base44.asServiceRole.entities.LocalSandboxSession.filter(
        { session_id: sessionId },
        { limit: 1 }
      );
      if (sessions.length) {
        const s = sessions[0];
        await base44.asServiceRole.entities.LocalSandboxSession.update(s.id, {
          current_command_id: '',
          last_command_at: new Date().toISOString(),
          commands_executed: (s.commands_executed || 0) + 1,
          commands_failed: (s.commands_failed || 0) + (finalStatus === 'failed' ? 1 : 0),
        });
      }

      return Response.json({ ok: true, status: finalStatus });
    }

    // ── COMMAND: admin or GPT enqueues a new command ──
    if (action === 'command') {
      const { sessionId, commandType, payload, source, priority, timeoutSeconds } = body;
      if (!sessionId) return Response.json({ error: 'sessionId required' }, { status: 400 });

      const { items: sessions } = await base44.asServiceRole.entities.LocalSandboxSession.filter(
        { session_id: sessionId },
        { limit: 1 }
      );
      if (!sessions.length) return Response.json({ error: 'Session not found' }, { status: 404 });

      const commandId = crypto.randomUUID();
      await base44.asServiceRole.entities.LocalSandboxCommand.create({
        session_id: sessionId,
        command_id: commandId,
        source: source || 'admin',
        command_type: commandType || 'shell',
        payload: payload || {},
        status: 'pending',
        priority: priority || 'p2',
        timeout_seconds: timeoutSeconds || 120,
      });

      return Response.json({ ok: true, command_id: commandId, message: 'Command enqueued — local agent will pick it up on next poll' });
    }

    // ── STATUS: overview of all sessions + queue ──
    if (action === 'status') {
      const { items: sessions } = await base44.asServiceRole.entities.LocalSandboxSession.filter(
        {},
        { sort: '-created_date', limit: 50 }
      );
      const now = Date.now();
      const enriched = sessions.map((s: any) => ({
        ...s,
        online: s.last_heartbeat ? (now - Date.parse(s.last_heartbeat)) < 30000 : false,
      }));

      const { items: pendingCmds } = await base44.asServiceRole.entities.LocalSandboxCommand.filter(
        { status: 'pending' },
        { limit: 50 }
      );

      return Response.json({
        sessions: enriched,
        pending_commands: pendingCmds.length,
        online_count: enriched.filter((s: any) => s.online).length,
      });
    }

    return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}