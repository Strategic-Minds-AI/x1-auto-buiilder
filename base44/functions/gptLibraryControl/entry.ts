// GPT Library Control — enables the GPT tool library, controls the autonomous
// coding system, triggers bidirectional sync, and logs every action as a
// SyncReceipt so there is a permanent audit trail.
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';

const LOG_TAG = 'gptLibraryControl';

async function logReceipt(base44, action, status, summary, meta = {}) {
  try {
    await base44.asServiceRole.entities.SyncReceipt.create({
      receipt_id: crypto.randomUUID(),
      idempotency_key: meta.idempotency_key || '',
      action: 'execute',
      entity: LOG_TAG,
      operation: action,
      status,
      record_id: meta.record_id || '',
      summary: String(summary).slice(0, 400),
    });
  } catch { /* never block on log failure */ }
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin required' }, { status: 403 });

    const body = await req.json();
    const { action } = body;

    // ── status: aggregate GPT library + autonomous sync + recent logs ────────
    if (action === 'status') {
      const [autonomousRes, toolsRes, recentLogs] = await Promise.allSettled([
        base44.functions.invoke('gptAutonomousSync', { action: 'status' }),
        base44.functions.invoke('gptControlBridge', { action: 'list_tools' }),
        base44.asServiceRole.entities.SyncReceipt.filter(
          { entity: LOG_TAG },
          { sort: '-created_date', limit: 20 }
        ),
      ]);

      const autonomous = autonomousRes.status === 'fulfilled' ? autonomousRes.value?.data : null;
      const tools = toolsRes.status === 'fulfilled' ? toolsRes.value?.data : null;
      const logs = recentLogs.status === 'fulfilled' ? (recentLogs.value?.items || []) : [];

      const apiKeyConfigured = !!(secrets.get('GPT_SYNC_API_KEY'));
      const engineConfigured = !!(secrets.get('ENGINE_URL') && secrets.get('ENGINE_API_KEY'));

      return Response.json({
        enabled: apiKeyConfigured,
        engine_ready: engineConfigured && autonomous?.last_push?.status === 'success' && autonomous?.last_pull?.status === 'success',
        engine_configured: engineConfigured,
        autonomous: autonomous || { engine_configured: engineConfigured },
        tools: tools?.tools || [],
        recent_logs: logs,
      });
    }

    // ── enable: mark GPT library as enabled ─────────────────────────────────
    if (action === 'enable') {
      const apiKey = secrets.get('GPT_SYNC_API_KEY');
      if (!apiKey) {
        await logReceipt(base44, 'enable', 'error', 'GPT_SYNC_API_KEY secret not set');
        return Response.json({ error: 'GPT_SYNC_API_KEY secret not set. Add it in Dashboard → Secrets.' }, { status: 400 });
      }
      await logReceipt(base44, 'enable', 'success', 'GPT library enabled — tools available to authorized AI clients');
      return Response.json({ enabled: true, message: 'GPT library is now enabled' });
    }

    // ── disable: mark GPT library as disabled ───────────────────────────────
    if (action === 'disable') {
      await logReceipt(base44, 'disable', 'error', 'Disable requires a verified runtime kill switch; no enforcement changed');
      return Response.json({ disabled: false, error: 'No enforced disable path exists. No change was made.' }, { status: 501 });
    }

    // ── autonomous_start: trigger a sync cycle ──────────────────────────────
    if (action === 'autonomous_start') {
      try {
        const res = await base44.functions.invoke('gptAutonomousSync', { action: 'cycle' });
        const sync = res?.data || {};
        const ok = sync.success === true && sync.pushed?.ok === true && sync.pulled?.ok === true;
        await logReceipt(base44, 'autonomous_start', ok ? 'success' : 'error',
          ok ? 'Autonomous sync cycle verified' : 'Autonomous cycle failed or is missing required evidence');
        return Response.json({ started: ok, result: sync, ...(ok ? {} : { error: 'Sync did not pass both directions' }) }, { status: ok ? 200 : 502 });
      } catch (err) {
        await logReceipt(base44, 'autonomous_start', 'error', String(err.message || err));
        return Response.json({ error: String(err.message || err) }, { status: 500 });
      }
    }

    // ── autonomous_stop: log stop intent ────────────────────────────────────
    if (action === 'autonomous_stop') {
      await logReceipt(base44, 'autonomous_stop', 'error', 'No verified stop signal sent to the scheduled workflow');
      return Response.json({ stopped: false, error: 'Scheduled workflow has not been disabled' }, { status: 501 });
    }

    // ── sync_now: trigger a bidirectional sync cycle ─────────────────────────
    if (action === 'sync_now') {
      try {
        const res = await base44.functions.invoke('gptAutonomousSync', { action: 'cycle' });
        const sync = res?.data || {};
        const ok = sync.success === true && sync.pushed?.ok === true && sync.pulled?.ok === true;
        await logReceipt(base44, 'sync_now', ok ? 'success' : 'error',
          ok ? 'Bidirectional GPT sync cycle verified' : 'Bidirectional sync failed or lacked two-way evidence');
        return Response.json({ synced: ok, result: sync, ...(ok ? {} : { error: 'Sync did not pass both directions' }) }, { status: ok ? 200 : 502 });
      } catch (err) {
        await logReceipt(base44, 'sync_now', 'error', String(err.message || err));
        return Response.json({ error: String(err.message || err) }, { status: 500 });
      }
    }

    // ── invoke_tool: proxy a tool call through the control bridge ──────────
    if (action === 'invoke_tool') {
      const { tool, params } = body;
      if (!tool) return Response.json({ error: 'tool required' }, { status: 400 });
      try {
        const res = await base44.functions.invoke('gptControlBridge', { action: 'invoke', tool, params: params || {} });
        await logReceipt(base44, 'invoke_tool:' + tool, 'success', 'Tool ' + tool + ' invoked successfully');
        return Response.json({ tool, result: res?.data });
      } catch (err) {
        await logReceipt(base44, 'invoke_tool:' + tool, 'error', String(err.message || err));
        return Response.json({ error: String(err.message || err) }, { status: 500 });
      }
    }

    // ── logs: return recent GPT control logs ─────────────────────────────────
    if (action === 'logs') {
      const { items } = await base44.asServiceRole.entities.SyncReceipt.filter(
        { entity: LOG_TAG },
        { sort: '-created_date', limit: body.limit || 50 }
      );
      return Response.json({ logs: items || [] });
    }

    return Response.json({ error: 'Unknown action', allowed: ['status', 'enable', 'disable', 'autonomous_start', 'autonomous_stop', 'sync_now', 'invoke_tool', 'logs'] }, { status: 400 });
  } catch (error) {
    return Response.json({ error: String(error.message || error) }, { status: 500 });
  }
}