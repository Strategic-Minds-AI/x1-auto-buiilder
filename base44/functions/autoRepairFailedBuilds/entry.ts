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

    return Response.json({
      watcher: 'auto_repair',
      checked_at: new Date().toISOString(),
      failed_builds_found: failedRuns.length,
      repair_triggered: true,
      target: projectName,
      project_id: projectId,
      repair_attempt: repairAttempt + 1,
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