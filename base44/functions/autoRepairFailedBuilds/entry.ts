import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Auto-Repair Watcher: scans for failed/gated pipeline builds and re-triggers
// the validator pipeline to attempt a fresh pass through all quality gates.
// Triggered on a schedule by the AutoRepairWatcher workflow (every 10 min).
//
// Caps retries at MAX_REPAIRS per project to prevent infinite loops.
// Only repairs the single most recent qualifying failure per run (the
// validator pipeline is expensive — one repair per watcher cycle keeps us
// within the 5-minute function timeout).

const MAX_REPAIRS = 3;
const LOOKBACK_HOURS = 3;

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin required' }, { status: 403 });

    const since = new Date(Date.now() - LOOKBACK_HOURS * 60 * 60 * 1000).toISOString();

    // Find failed/gated pipeline runs from the lookback window
    const failedPage = await base44.asServiceRole.entities.PipelineRun.filter(
      { status: { $in: ['failed', 'paused'] }, created_date: { $gte: since } },
      { sort: '-created_date', limit: 20 }
    );
    const failedRuns = failedPage.items || [];

    // Find the most recent failed build that hasn't hit the retry cap
    let repairTarget: any = null;
    let repairAttempt = 0;
    const skippedReasons: any[] = [];

    for (const run of failedRuns) {
      const projectName = run.project_name;
      if (!projectName) { skippedReasons.push({ run: run.id, reason: 'no project name' }); continue; }

      // Count existing runs for this project (each repair creates a new PipelineRun)
      const countPage = await base44.asServiceRole.entities.PipelineRun.filter(
        { project_name: projectName },
        { limit: 100 }
      );
      const allRuns = countPage.items || [];
      repairAttempt = allRuns.length;

      if (repairAttempt >= MAX_REPAIRS) {
        skippedReasons.push({ run: run.id, project: projectName, reason: `max repairs (${MAX_REPAIRS}) reached` });
        continue;
      }

      repairTarget = run;
      break;
    }

    if (!repairTarget) {
      return Response.json({
        watcher: 'auto_repair',
        checked_at: new Date().toISOString(),
        failed_builds_found: failedRuns.length,
        repair_triggered: false,
        reason: failedRuns.length === 0 ? 'no failed builds found' : 'all failed builds at max retries',
        skipped: skippedReasons,
      });
    }

    // Extract business name from project_name (format: "BusinessName — Industry")
    const projectName = repairTarget.project_name;
    const businessName = projectName.split(' — ')[0] || projectName;

    // Find the linked WebsiteProject
    let projectId: string | null = null;
    try {
      const projectPage = await base44.asServiceRole.entities.WebsiteProject.filter(
        { business_name: { $regex: businessName, $options: 'i' } },
        { sort: '-created_date', limit: 1 }
      );
      const projects = projectPage.items || [];
      if (projects.length > 0) projectId = projects[0].id;
    } catch { /* best-effort */ }

    if (!projectId) {
      return Response.json({
        watcher: 'auto_repair',
        checked_at: new Date().toISOString(),
        failed_builds_found: failedRuns.length,
        repair_triggered: false,
        reason: `no WebsiteProject found for "${businessName}"`,
        target: projectName,
      });
    }

    // Re-trigger the validator pipeline with the project ID
    // The fixers use LLM calls that may produce different results, giving a fresh chance
    const thisAttempt = repairAttempt + 1;
    let repairResult: any = null;
    let repairError: string | null = null;
    try {
      const res = await base44.functions.invoke('validatorGatedPipeline', {
        projectId,
        skipDeploy: false,
      });
      repairResult = res.data;
    } catch (err: any) {
      repairError = err.message;
    }

    // ── If the 2nd attempt still fails, notify immediately with full error report ──
    const repairFailed = repairError || (repairResult && (repairResult.gated || !repairResult.success));
    if (thisAttempt >= 2 && repairFailed) {
      try {
        await sendSecondAttemptFailureAlert(base44, user.email, {
          projectName,
          projectId,
          repairAttempt: thisAttempt,
          repairError,
          repairResult,
          originalRun: repairTarget,
        });
      } catch { /* best-effort */ }
    }

    return Response.json({
      watcher: 'auto_repair',
      checked_at: new Date().toISOString(),
      failed_builds_found: failedRuns.length,
      repair_triggered: true,
      target: projectName,
      project_id: projectId,
      repair_attempt: thisAttempt,
      max_repairs: MAX_REPAIRS,
      result: repairResult ? {
        success: repairResult.success,
        gated: repairResult.gated,
        gate_reason: repairResult.gate_reason,
        gates_passed: repairResult.gates_passed,
        gates_total: repairResult.gates_total,
        deploy_url: repairResult.deploy_url || repairResult.stages?.find((s: any) => s.stage === 'deploy')?.url || null,
      } : null,
      error: repairError,
    });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// ── Send a detailed error report when the 2nd repair attempt still fails ──
// Includes every gate verdict, every stage status, performance metrics, and
// the full gate_reason so the admin has the complete picture in one email.
async function sendSecondAttemptFailureAlert(base44: any, adminEmail: string, ctx: any) {
  const { projectName, projectId, repairAttempt, repairError, repairResult, originalRun } = ctx;

  // Build gate detail rows
  const gates = repairResult?.gates || [];
  const gateRows = gates.length > 0
    ? gates.map((g: any) => `
      <tr>
        <td style="padding:8px 12px; border-bottom:1px solid #1e2a3f; color:#00d4ff; font-weight:700; font-size:13px;">${g.gate || '—'}</td>
        <td style="padding:8px 12px; border-bottom:1px solid #1e2a3f; font-size:13px; color:${g.gated ? '#ff6b6b' : '#51cf66'}; font-weight:700;">${g.gated ? 'FAIL' : 'PASS'}</td>
        <td style="padding:8px 12px; border-bottom:1px solid #1e2a3f; font-size:13px; color:#ffffff;">${g.score != null ? g.score + '/100' : '—'}</td>
        <td style="padding:8px 12px; border-bottom:1px solid #1e2a3f; font-size:12px; color:#8fa2bc;">${(g.summary || g.gate_reason || '').slice(0, 200)}</td>
      </tr>`).join('')
    : '<tr><td colspan="4" style="padding:12px; color:#8fa2bc; font-size:13px;">No gate data available</td></tr>';

  // Build stage detail rows
  const stages = repairResult?.stages || originalRun?.stages || [];
  const stageRows = stages.length > 0
    ? stages.map((s: any) => {
      const statusColor = s.status === 'complete' || s.status === 'skipped' ? '#51cf66' : s.status === 'failed' ? '#ff6b6b' : '#fcc419';
      return `
      <tr>
        <td style="padding:6px 12px; border-bottom:1px solid #1e2a3f; color:#ffffff; font-size:12px; font-weight:600;">${s.stage || '—'}</td>
        <td style="padding:6px 12px; border-bottom:1px solid #1e2a3f; font-size:12px; color:${statusColor}; font-weight:700;">${s.status || '—'}</td>
        <td style="padding:6px 12px; border-bottom:1px solid #1e2a3f; font-size:11px; color:#8fa2bc;">${(s.error || '').slice(0, 150)}</td>
      </tr>`;
    }).join('')
    : '<tr><td colspan="3" style="padding:12px; color:#8fa2bc; font-size:13px;">No stage data available</td></tr>';

  // Performance metrics from browser test
  const browserStage = stages.find((s: any) => s.stage === 'cloud_browser_test');
  const metrics = browserStage?.performance_metrics;
  const metricsHtml = metrics ? `
    <div style="margin:16px 0; padding:14px; background:#1a2536; border-radius:10px;">
      <div style="color:#00d4ff; font-weight:700; font-size:13px; margin-bottom:8px;">Core Web Vitals</div>
      <div style="display:flex; gap:16px; flex-wrap:wrap; font-size:12px; color:#8fa2bc;">
        <span>LCP: <strong style="color:#ffffff;">${metrics.lcp_ms != null ? Math.round(metrics.lcp_ms) + 'ms' : 'n/a'}</strong> (budget: 2500ms)</span>
        <span>INP: <strong style="color:#ffffff;">${metrics.inp_ms != null ? Math.round(metrics.inp_ms) + 'ms' : 'n/a'}</strong> (budget: 200ms)</span>
        <span>CLS: <strong style="color:#ffffff;">${metrics.cls ?? 'n/a'}</strong> (budget: 0.1)</span>
        <span>DOM: <strong style="color:#ffffff;">${metrics.dom_node_count ?? 'n/a'}</strong></span>
      </div>
    </div>` : '';

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0; padding:0; background:#0b1523; font-family:Arial, sans-serif;">
  <div style="max-width:640px; margin:0 auto; padding:24px;">
    <div style="background:#ff3b3b; padding:18px 24px; border-radius:16px 16px 0 0; display:flex; align-items:center; gap:12px;">
      <img src="https://media.base44.com/images/public/6acfedce320afe2f706c6bfd/22fdb73df_logo.png" alt="Logo" style="height:28px;"/>
      <span style="color:#ffffff; font-weight:900; font-size:16px;">CRITICAL: 2nd Repair Attempt Failed</span>
    </div>
    <div style="background:#0b1523; border:1px solid #1e2a3f; border-top:none; border-radius:0 0 16px 16px; padding:28px 24px;">
      <h1 style="color:#ffffff; font-size:18px; margin:0 0 6px;">Auto-Repair Failed — Manual Review Required</h1>
      <p style="color:#ff6b6b; font-size:14px; font-weight:700; margin:0 0 16px;">Project: ${projectName} · Attempt ${repairAttempt} of ${MAX_REPAIRS}</p>

      <div style="background:#1a2536; border-radius:10px; padding:14px; margin-bottom:16px;">
        <div style="color:#8fa2bc; font-size:11px; text-transform:uppercase; letter-spacing:1px; margin-bottom:6px;">Gate Reason</div>
        <div style="color:#ffffff; font-size:14px; line-height:1.5;">${repairError || repairResult?.gate_reason || 'Unknown failure'}</div>
      </div>

      ${metricsHtml}

      <div style="color:#8fa2bc; font-size:11px; text-transform:uppercase; letter-spacing:1px; margin:20px 0 8px;">Quality Gate Results</div>
      <table style="width:100%; border-collapse:collapse; background:#0f1a2e; border-radius:8px; overflow:hidden;">
        <thead>
          <tr style="background:#1a2536;">
            <th style="padding:8px 12px; text-align:left; color:#8fa2bc; font-size:11px; text-transform:uppercase;">Gate</th>
            <th style="padding:8px 12px; text-align:left; color:#8fa2bc; font-size:11px; text-transform:uppercase;">Verdict</th>
            <th style="padding:8px 12px; text-align:left; color:#8fa2bc; font-size:11px; text-transform:uppercase;">Score</th>
            <th style="padding:8px 12px; text-align:left; color:#8fa2bc; font-size:11px; text-transform:uppercase;">Detail</th>
          </tr>
        </thead>
        <tbody>${gateRows}</tbody>
      </table>

      <div style="color:#8fa2bc; font-size:11px; text-transform:uppercase; letter-spacing:1px; margin:20px 0 8px;">Pipeline Stage Status</div>
      <table style="width:100%; border-collapse:collapse; background:#0f1a2e; border-radius:8px; overflow:hidden;">
        <thead>
          <tr style="background:#1a2536;">
            <th style="padding:6px 12px; text-align:left; color:#8fa2bc; font-size:11px; text-transform:uppercase;">Stage</th>
            <th style="padding:6px 12px; text-align:left; color:#8fa2bc; font-size:11px; text-transform:uppercase;">Status</th>
            <th style="padding:6px 12px; text-align:left; color:#8fa2bc; font-size:11px; text-transform:uppercase;">Error</th>
          </tr>
        </thead>
        <tbody>${stageRows}</tbody>
      </table>

      <div style="margin-top:24px;">
        <a href="https://x1-auto-builder.base44.app/super-agent-monitor" style="display:inline-block; background:#00d4ff; color:#0b1523; font-weight:700; font-size:14px; padding:14px 28px; border-radius:16px; text-decoration:none;">Review in Super Agent Monitor</a>
      </div>
    </div>
  </div>
</body>
</html>`;

  if (adminEmail) {
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: adminEmail,
      subject: `CRITICAL: 2nd repair failed for ${projectName} — manual review required`,
      html,
    });
  }
}