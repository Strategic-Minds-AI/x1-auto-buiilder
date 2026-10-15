import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { evaluateCompliance, autoFixContent } from '../../shared/compliance.js';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { projectId } = await req.json();
    if (!projectId) return Response.json({ error: 'projectId is required' }, { status: 400 });

    const project = await base44.entities.WebsiteProject.get(projectId);
    if (!project) return Response.json({ error: 'Project not found' }, { status: 404 });
    if (!project.content) return Response.json({ error: 'Project has no content to fix' }, { status: 400 });

    // Get the latest compliance report for this project
    const reports = await base44.entities.ComplianceReport.filter(
      { project_id: projectId },
      { sort: '-created_date', limit: 1 }
    );
    const latestReport = (reports.items && reports.items[0]) || null;
    const previousScore = latestReport ? latestReport.overall_score : 0;

    // If no report yet, run an initial check
    let report = latestReport;
    if (!report) {
      const initial = await evaluateCompliance(base44, project);
      report = await base44.entities.ComplianceReport.create({
        project_id: projectId,
        overall_score: initial.overall_score,
        category_scores: initial.category_scores,
        checks: initial.checks,
        recommendations: initial.recommendations,
        status: 'scored',
        round: 1
      });
    }

    // Mark as fixing
    await base44.entities.ComplianceReport.update(report.id, { status: 'fixing' });

    // Auto-fix: regenerate content to address all failing checks
    const fixedContent = await autoFixContent(base44, project, report);

    // Update the project with fixed content
    await base44.entities.WebsiteProject.update(projectId, { content: fixedContent });

    // Re-evaluate compliance with the fixed content
    const updatedProject = await base44.entities.WebsiteProject.get(projectId);
    const recheck = await evaluateCompliance(base44, updatedProject);

    // Mark all previously-failing checks as auto_fixed if they now pass
    const fixedChecks = recheck.checks.map(function (c) {
      const wasFailing = (report.checks || []).some(function (old) {
        return old.requirement === c.requirement && old.status !== 'pass';
      });
      return Object.assign({}, c, { auto_fixed: wasFailing && c.status === 'pass' });
    });

    // Create the post-fix report
    const newReport = await base44.entities.ComplianceReport.create({
      project_id: projectId,
      overall_score: recheck.overall_score,
      category_scores: recheck.category_scores,
      checks: fixedChecks,
      recommendations: recheck.recommendations,
      status: recheck.overall_score >= 90 ? 'fixed' : 'scored',
      round: (report.round || 1) + 1,
      previous_score: previousScore
    });

    return Response.json({
      before_score: previousScore,
      after_score: recheck.overall_score,
      report: newReport,
      improvement: recheck.overall_score - previousScore
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}