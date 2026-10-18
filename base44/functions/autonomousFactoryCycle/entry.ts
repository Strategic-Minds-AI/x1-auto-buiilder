import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';
import { renderSiteHtml, slugify } from '../../shared/siteRenderer.js';

// ─────────────────────────────────────────────────────────────────────────
// AUTONOMOUS FACTORY CYCLE
// A single orchestrator that runs ALL autonomous operations in one cycle:
//   Phase 1: GPT bi-directional JSON sync (push snapshot, pull commands, execute, ack)
//   Phase 2: Auto-deploy approved/preview-ready projects to Vercel (production)
//   Phase 3: Sync Google Search Console + Analytics for all deployed sites
//   Phase 4: Provision Railway sandboxes for new client projects
// Called by the AutonomousFactoryCycle workflow every 10 minutes.
// ─────────────────────────────────────────────────────────────────────────

const VERCEL_API = 'https://api.vercel.com';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    // Scheduled work requires a separately verified service identity, never anonymous access.
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Verified administrator identity required' }, { status: 403 });
    }

    const appUrl = req.headers.get('X-Base44-App-Url') || '';
    const syncKey = secrets.get('GPT_SYNC_API_KEY');
    const vercelToken = secrets.get('VERCEL_TOKEN');
    const vercelTeamId = secrets.get('VERCEL_TEAM_ID');

    const result: any = {
      timestamp: new Date().toISOString(),
      phases: {
        gpt_sync: null,
        vercel_deploy: null,
        analytics_sync: null,
        sandbox_provision: null,
      },
      errors: [],
    };

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 1: GPT BI-DIRECTIONAL SYNC
    // ═══════════════════════════════════════════════════════════════════════
    try {
      if (appUrl && syncKey) {
        const syncRes = await fetch(`${appUrl}/functions/gptAutonomousSync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${syncKey}` },
          body: JSON.stringify({ action: 'cycle' }),
          signal: AbortSignal.timeout(90000),
        });
        const syncData = await syncRes.json().catch(() => ({}));
        result.phases.gpt_sync = {
          ok: syncRes.ok && syncData.success === true && syncData.pushed?.ok === true && syncData.pulled?.ok === true,
          pushed: syncData.pushed?.ok || false,
          pushed_records: syncData.pushed?.record_count || 0,
          pulled: syncData.pulled?.ok || false,
          commands_pulled: syncData.pulled?.command_count || 0,
          executed: syncData.executed?.length || 0,
          acked: syncData.acked?.ok || false,
          errors: syncData.errors || [],
        };
      } else {
        result.phases.gpt_sync = { ok: false, error: 'GPT_SYNC_API_KEY or app URL not configured' };
        result.errors.push('GPT sync: missing GPT_SYNC_API_KEY or app URL');
      }
    } catch (err: any) {
      result.phases.gpt_sync = { ok: false, error: err.message };
      result.errors.push(`GPT sync: ${err.message}`);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 2: AUTO-DEPLOY TO VERCEL
    // ═══════════════════════════════════════════════════════════════════════
    try {
      if (vercelToken) {
        const { items: pendingProjects } = await base44.asServiceRole.entities.WebsiteProject.filter(
          { status: 'preview_ready', deploy_url: { $exists: false } },
          { sort: '-created_date', limit: 10, fields: ['id', 'business_name', 'industry', 'content'] }
        );

        let deployed = 0;
        let failed = 0;
        const deployResults: any[] = [];

        for (const project of pendingProjects) {
          if (!project.content) {
            deployResults.push({ id: project.id, name: project.business_name, status: 'skipped', reason: 'no content' });
            continue;
          }
          try {
            const rendered = renderSiteHtml(project);
            const headTag = /<head(?:\s[^>]*)?>/i;
            if (!headTag.test(rendered)) {
              failed++;
              deployResults.push({ id: project.id, status: 'blocked', reason: 'Cannot enforce preview noindex without a head element' });
              continue;
            }
            const html = rendered.replace(headTag, (tag) => tag + '<meta name="robots" content="noindex,nofollow,noarchive">');
            const name = slugify(project.business_name || project.industry || 'site') + '-' + String(project.id).slice(0, 6);
            const endpoint = `${VERCEL_API}/v13/deployments${vercelTeamId ? '?teamId=' + encodeURIComponent(vercelTeamId) : ''}`;
            const vercelRes = await fetch(endpoint, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${vercelToken}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name,
                files: [{ file: 'index.html', data: html }],
                projectSettings: { framework: null },
              }),
              signal: AbortSignal.timeout(60000),
            });
            const data = await vercelRes.json();
            if (vercelRes.ok && data.url) {
              await base44.asServiceRole.entities.WebsiteProject.update(project.id, {
                deploy_url: 'https://' + data.url,
                deploy_id: data.id,
                status: 'preview_ready',
              });
              deployed++;
              deployResults.push({ id: project.id, name: project.business_name, status: 'deployed', url: 'https://' + data.url });
            } else {
              failed++;
              deployResults.push({ id: project.id, name: project.business_name, status: 'failed', error: data.error?.message || 'Unknown' });
            }
          } catch (err: any) {
            failed++;
            deployResults.push({ id: project.id, name: project.business_name, status: 'failed', error: err.message });
          }
        }

        result.phases.vercel_deploy = {
          ok: failed === 0,
          pending: pendingProjects.length,
          deployed,
          failed,
          results: deployResults,
        };
      } else {
        result.phases.vercel_deploy = { ok: false, error: 'VERCEL_TOKEN not configured' };
        result.errors.push('Vercel deploy: VERCEL_TOKEN not configured');
      }
    } catch (err: any) {
      result.phases.vercel_deploy = { ok: false, error: err.message };
      result.errors.push(`Vercel deploy: ${err.message}`);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 3: GOOGLE SEARCH CONSOLE + ANALYTICS SYNC
    // ═══════════════════════════════════════════════════════════════════════
    try {
      let connection: any = null;
      try {
        connection = await base44.asServiceRole.connectors.getConnection('google_search_console');
      } catch {}

      if (connection?.accessToken) {
        const { items: deployedProjects } = await base44.asServiceRole.entities.WebsiteProject.filter(
          { deploy_url: { $exists: true } },
          { limit: 20, fields: ['id', 'business_name', 'deploy_url'] }
        );

        let synced = 0;
        let skipped = 0;
        let failed = 0;
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 28 * 86400000).toISOString().split('T')[0];

        // Process in batches of 5
        for (let i = 0; i < deployedProjects.length; i += 5) {
          const batch = deployedProjects.slice(i, i + 5);
          const batchResults = await Promise.allSettled(
            batch.map(async (project: any) => {
              const url = project.deploy_url;
              if (!url) return { id: project.id, status: 'skipped' };
              const apiUrl = 'https://searchconsole.googleapis.com/webmasters/v3/sites/' + encodeURIComponent(url) + '/searchAnalytics/query';
              const scRes = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${connection.accessToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ startDate, endDate, dimensions: ['date'], rowLimit: 1000 }),
                signal: AbortSignal.timeout(15000),
              });
              if (scRes.ok) {
                const data = await scRes.json();
                const clicks = (data.rows || []).reduce((s: number, r: any) => s + (r.clicks || 0), 0);
                const impressions = (data.rows || []).reduce((s: number, r: any) => s + (r.impressions || 0), 0);
                return { id: project.id, name: project.business_name, status: 'synced', clicks, impressions };
              }
              return { id: project.id, status: 'failed' };
            })
          );
          for (const r of batchResults) {
            if (r.status === 'fulfilled') {
              if (r.value.status === 'synced') synced++;
              else if (r.value.status === 'skipped') skipped++;
              else failed++;
            } else {
              failed++;
            }
          }
        }

        result.phases.analytics_sync = {
          ok: failed === 0,
          projects: deployedProjects.length,
          synced,
          skipped,
          failed,
        };
      } else {
        result.phases.analytics_sync = { ok: false, error: 'Google Search Console connector not authorized' };
        result.errors.push('Analytics sync: connector not authorized');
      }
    } catch (err: any) {
      result.phases.analytics_sync = { ok: false, error: err.message };
      result.errors.push(`Analytics sync: ${err.message}`);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 4: RAILWAY SANDBOX PROVISIONING
    // ═══════════════════════════════════════════════════════════════════════
    // Reuse existing Railway workers. New project creation requires a separately verified approval.
    result.phases.sandbox_provision = {
      ok: true,
      blocked: true,
      provisioned: 0,
      reason: 'Railway project creation requires scoped approval and a cost ceiling',
    };

    // ═══════════════════════════════════════════════════════════════════════
    // LOG THE CYCLE
    // ═══════════════════════════════════════════════════════════════════════
    for (const [phase, state] of Object.entries(result.phases)) {
      if (state && (state as any).ok === false && !(state as any).blocked) {
        result.errors.push(phase + ': failed or unavailable');
      }
    }
    result.success = result.errors.length === 0;
    try {
      const summary = `Factory: GPT=${result.phases.gpt_sync?.ok ? 'OK' : 'FAIL'} | Vercel=${result.phases.vercel_deploy?.deployed || 0}d${result.phases.vercel_deploy?.failed || 0}f | Analytics=${result.phases.analytics_sync?.synced || 0}s | Sandbox=${result.phases.sandbox_provision?.provisioned || 0}p`;
      await base44.asServiceRole.entities.SyncReceipt.create({
        receipt_id: crypto.randomUUID(),
        idempotency_key: `factory-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        action: 'factory_cycle',
        entity: 'autonomous',
        status: result.success ? 'success' : 'error',
        summary: String(summary).slice(0, 400),
      });
    } catch { /* best effort */ }

    result.error_count = result.errors.length;
    return Response.json(result);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}