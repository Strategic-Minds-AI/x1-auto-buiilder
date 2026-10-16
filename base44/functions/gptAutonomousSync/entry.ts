import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';

// Fully autonomous bi-directional JSON sync between the app and an external GPT engine.
// PUSH: sends a JSON snapshot of app state to ENGINE_URL.
// PULL: fetches pending commands from ENGINE_URL and executes them through gptSyncEngine.
// ACK: confirms completed commands back to the engine.
// Runs autonomously via the GPTAutonomousSync workflow (every 5 minutes).

const SNAPSHOT_ENTITIES = [
  'WebsiteProject', 'DesignTemplate', 'LaunchCampaign', 'GenerationItem',
  'ApexMission', 'ApexOpportunity', 'Lead', 'SocialCampaign', 'ApprovalRequest',
  'CloneProject', 'Client', 'BuildProject', 'PromptPack', 'SiteTemplate',
  'FreeAsset', 'Template', 'FaultLineScan', 'MockupProject',
];

const RECENT_ENTITIES = [
  'WebsiteProject', 'LaunchCampaign', 'ApexMission', 'ApprovalRequest', 'Lead',
  'PromptPack', 'DesignTemplate', 'CloneProject',
];

const FIELD_MAP = {
  WebsiteProject: ['id', 'business_name', 'industry', 'status', 'created_date', 'updated_date'],
  LaunchCampaign: ['id', 'campaign_name', 'status', 'created_date', 'updated_date'],
  ApexMission: ['id', 'title', 'mission_type', 'status', 'priority', 'assigned_agent', 'created_date'],
  ApprovalRequest: ['id', 'approval_type', 'status', 'description', 'created_date'],
  Lead: ['id', 'name', 'email', 'status', 'service', 'created_date'],
  CloneProject: ['id', 'source_url', 'source_title', 'status', 'industry', 'created_date'],
  PromptPack: ['id', 'name', 'category', 'prompt_type', 'usage_count', 'created_date'],
  DesignTemplate: ['id', 'name', 'industry', 'layout', 'created_date'],
};

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin required' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const { action = 'cycle' } = body;

    let engineUrl = secrets.get('ENGINE_URL');
    const engineKey = secrets.get('ENGINE_API_KEY');
    const syncKey = secrets.get('GPT_SYNC_API_KEY');
    const appUrl = req.headers.get('X-Base44-App-Url') || '';

    // Normalize engine URL — ensure it has a protocol
    if (engineUrl && !engineUrl.startsWith('http://') && !engineUrl.startsWith('https://')) {
      engineUrl = 'https://' + engineUrl;
    }
    // Remove trailing slash
    if (engineUrl && engineUrl.endsWith('/')) engineUrl = engineUrl.slice(0, -1);

    if (!engineUrl || !engineKey) {
      return Response.json({
        error: 'ENGINE_URL and ENGINE_API_KEY secrets are required for autonomous sync',
        hint: 'Set them in Dashboard → Secrets. ENGINE_URL is the external GPT endpoint that accepts snapshots and returns pending commands.',
      }, { status: 500 });
    }

    const result: any = {
      action,
      timestamp: new Date().toISOString(),
      pushed: null,
      pulled: null,
      executed: [],
      acked: null,
      errors: [],
    };

    // ── PUSH PHASE ──────────────────────────────────────────────
    if (action === 'push' || action === 'cycle') {
      try {
        const snapshot = await buildSnapshot(base44);
        const pushRes = await fetch(engineUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${engineKey}`,
            'X-Source': 'x1-auto-builder',
          },
          body: JSON.stringify({
            type: 'snapshot',
            source: 'x1-auto-builder',
            timestamp: new Date().toISOString(),
            data: snapshot,
          }),
          signal: AbortSignal.timeout(20000),
        });

        result.pushed = {
          ok: pushRes.ok,
          status: pushRes.status,
          entity_count: Object.keys(snapshot.counts).length,
          record_count: Object.values(snapshot.recent).reduce((a: number, r: any) => a + (r?.length || 0), 0),
        };

        await logReceipt(base44, 'push', 'snapshot', result.pushed.ok ? 'success' : 'error',
          `Pushed ${result.pushed.record_count} records across ${result.pushed.entity_count} entities (HTTP ${pushRes.status})`);

        if (!result.pushed.ok) {
          const errText = await pushRes.text().catch(() => 'unknown');
          result.errors.push(`Push HTTP ${pushRes.status}: ${errText.slice(0, 200)}`);
        }
      } catch (err: any) {
        result.pushed = { ok: false, error: err.message };
        result.errors.push(`Push failed: ${err.message}`);
        await logReceipt(base44, 'push', 'snapshot', 'error', err.message);
      }
    }

    // ── PULL PHASE ───────────────────────────────────────────────
    if (action === 'pull' || action === 'cycle') {
      try {
        const pullUrl = engineUrl.includes('?')
          ? `${engineUrl}&action=pending`
          : `${engineUrl}?action=pending`;

        const pullRes = await fetch(pullUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${engineKey}`,
            'X-Source': 'x1-auto-builder',
          },
          signal: AbortSignal.timeout(20000),
        });

        const pullData = await pullRes.json().catch(() => ({}));
        const commands = pullData.commands || pullData.pending || pullData.tasks || [];

        result.pulled = {
          ok: pullRes.ok,
          status: pullRes.status,
          command_count: commands.length,
        };

        // ── EXECUTE PHASE: process each command through gptSyncEngine ──
        if (commands.length > 0) {
          if (!syncKey || !appUrl) {
            result.errors.push('Cannot execute commands: GPT_SYNC_API_KEY or app URL missing');
          } else {
            const syncEngineUrl = `${appUrl}/functions/gptSyncEngine`;
            let succeeded = 0;
            let failed = 0;

            for (const cmd of commands) {
              const execResult = await executeWithRetry(syncEngineUrl, syncKey, cmd);
              result.executed.push({
                command_id: cmd.id || cmd.idempotency_key || '',
                action: cmd.action || '',
                entity: cmd.entity || cmd.function || '',
                ok: execResult.ok,
                status: execResult.status,
                result: execResult.data?.status || execResult.data?.error || execResult.error || '',
                retries: execResult.attempts - 1,
              });
              if (execResult.ok) succeeded++; else failed++;
            }

            // ── ACK PHASE: confirm completed commands ─────────────
            const commandIds = commands.map((c: any) => c.id).filter(Boolean);
            if (commandIds.length > 0) {
              try {
                const ackRes = await fetch(engineUrl, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${engineKey}`,
                  },
                  body: JSON.stringify({
                    type: 'ack',
                    command_ids: commandIds,
                    results: result.executed.map((e: any) => ({
                      id: e.command_id,
                      ok: e.ok,
                      result: e.result || e.error || '',
                    })),
                  }),
                  signal: AbortSignal.timeout(10000),
                });
                result.acked = { ok: ackRes.ok, status: ackRes.status, count: commandIds.length };
              } catch (ackErr: any) {
                result.acked = { ok: false, error: ackErr.message };
                result.errors.push(`Ack failed: ${ackErr.message}`);
              }
            }

            await logReceipt(base44, 'pull', 'commands',
              failed === 0 ? 'success' : 'error',
              `Pulled ${commands.length} commands — ${succeeded} succeeded, ${failed} failed`);
          }
        } else {
          await logReceipt(base44, 'pull', 'commands', 'success', 'No pending commands');
        }
      } catch (err: any) {
        result.pulled = { ok: false, error: err.message };
        result.errors.push(`Pull failed: ${err.message}`);
        await logReceipt(base44, 'pull', 'commands', 'error', err.message);
      }
    }

    // ── STATUS PHASE ─────────────────────────────────────────────
    if (action === 'status') {
      const { items } = await base44.asServiceRole.entities.SyncReceipt.filter(
        { $or: [{ action: 'push' }, { action: 'pull' }] },
        { sort: '-created_date', limit: 20 }
      );
      const lastPush = items.find((r: any) => r.action === 'push');
      const lastPull = items.find((r: any) => r.action === 'pull');
      return Response.json({
        last_push: lastPush || null,
        last_pull: lastPull || null,
        recent: items,
        engine_configured: !!(engineUrl && engineKey),
        sync_key_configured: !!syncKey,
      });
    }

    result.success = result.errors.length === 0;
    return Response.json(result);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

async function buildSnapshot(base44: any) {
  const counts: Record<string, number> = {};
  const recent: Record<string, any[]> = {};

  // Count all snapshot entities in parallel batches
  const countBatch = [...SNAPSHOT_ENTITIES];
  for (let i = 0; i < countBatch.length; i += 6) {
    const batch = countBatch.slice(i, i + 6);
    const results = await Promise.allSettled(
      batch.map(async (entity) => {
        const count = await base44.asServiceRole.entities[entity].count();
        return [entity, count] as [string, number];
      })
    );
    for (const r of results) {
      if (r.status === 'fulfilled') counts[r.value[0]] = r.value[1];
    }
  }

  // Get recent records from key entities
  for (const entity of RECENT_ENTITIES) {
    try {
      const { items } = await base44.asServiceRole.entities[entity].filter(
        {},
        { sort: '-created_date', limit: 5, fields: FIELD_MAP[entity] || ['id', 'created_date'] }
      );
      recent[entity] = items;
    } catch {
      recent[entity] = [];
    }
  }

  return {
    counts,
    recent,
    generated_at: new Date().toISOString(),
  };
}

async function logReceipt(base44: any, action: string, entity: string, status: string, summary: string) {
  try {
    await base44.asServiceRole.entities.SyncReceipt.create({
      receipt_id: crypto.randomUUID(),
      idempotency_key: `auto-${action}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      action,
      entity,
      status,
      summary: String(summary).slice(0, 400),
    });
  } catch { /* receipt logging is best-effort */ }
}

// Executes a single command through gptSyncEngine with one automatic retry on failure.
async function executeWithRetry(
  syncEngineUrl: string,
  syncKey: string,
  cmd: any
): Promise<{ ok: boolean; status: number; data: any; error?: string; attempts: number }> {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const execRes = await fetch(syncEngineUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${syncKey}`,
        },
        body: JSON.stringify(cmd),
        signal: AbortSignal.timeout(45000),
      });
      const execData = await execRes.json().catch(() => ({}));
      const ok = execRes.ok && !execData.error;
      if (ok || attempt === 2) {
        return { ok, status: execRes.status, data: execData, attempts: attempt };
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (err: any) {
      if (attempt === 2) {
        return { ok: false, status: 0, data: {}, error: err.message, attempts: attempt };
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  return { ok: false, status: 0, data: {}, error: 'Max retries exceeded', attempts: 2 };
}