import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { evaluateCompliance, seedStandards } from '../../shared/compliance.js';

const PASS_THRESHOLD = 80;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { projectId } = await req.json();
    if (!projectId) return Response.json({ error: 'projectId is required' }, { status: 400 });

    const project = await base44.asServiceRole.entities.WebsiteProject.get(projectId);
    if (!project) return Response.json({ error: 'WebsiteProject not found' }, { status: 404 });
    if (!project.content) return Response.json({ error: 'Project has no content to evaluate' }, { status: 400 });

    // Step 1: Generate ComplianceReport
    await seedStandards(base44.asServiceRole);
    const result = await evaluateCompliance(base44.asServiceRole, project);

    const report = await base44.asServiceRole.entities.ComplianceReport.create({
      project_id: projectId,
      overall_score: result.overall_score,
      category_scores: result.category_scores,
      checks: result.checks,
      recommendations: result.recommendations,
      status: 'scored',
      round: 1
    });

    const passed = result.overall_score >= PASS_THRESHOLD;
    const failedChecks = (result.checks || []).filter((c) => c.status === 'fail');
    const issuesList = failedChecks.map((c) => `${c.category}: ${c.requirement} — ${c.recommendation || 'No recommendation'}`).join('; ');

    if (passed) {
      // Step 2a: Deploy the site
      let deployment = { url: '', error: 'Deploy failed' };
      try {
        const deployRes = await base44.functions.invoke('deploySite', { projectId });
        deployment = deployRes.data || deployRes || deployment;
        await base44.asServiceRole.entities.ComplianceReport.update(report.id, { status: 'deployed' });
        await base44.asServiceRole.entities.WebsiteProject.update(projectId, { status: 'approved' });
      } catch (deployErr) {
        deployment = { url: '', error: deployErr.message || 'Deploy failed' };
      }

      return Response.json({
        report: { id: report.id, score: result.overall_score, status: 'deployed' },
        action: 'deployed',
        deployment
      });
    } else {
      // Step 2b: Assign fix task to super_agent
      await base44.asServiceRole.entities.AgentTask.create({
        agent_name: 'super_agent',
        task: `Fix compliance issues for "${project.business_name || projectId}" (score: ${result.overall_score}%). ${failedChecks.length} issues found: ${issuesList || 'See compliance report ' + report.id}. Auto-fix and re-run compliance check.`,
        status: 'pending',
        priority: 'high',
        project_id: projectId,
        assigned_to: 'super_agent'
      });

      return Response.json({
        report: { id: report.id, score: result.overall_score, status: 'scored' },
        action: 'fix_assigned',
        issues: failedChecks.length,
        assigned_to: 'super_agent'
      });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}