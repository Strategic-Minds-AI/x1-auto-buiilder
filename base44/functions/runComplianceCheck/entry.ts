import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { evaluateCompliance, seedStandards } from '../../shared/compliance.js';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { projectId } = await req.json();
    if (!projectId) return Response.json({ error: 'projectId is required' }, { status: 400 });

    const project = await base44.entities.WebsiteProject.get(projectId);
    if (!project) return Response.json({ error: 'Project not found' }, { status: 404 });
    if (!project.content) return Response.json({ error: 'Project has no content to evaluate' }, { status: 400 });

    await seedStandards(base44);

    const result = await evaluateCompliance(base44, project);

    const report = await base44.entities.ComplianceReport.create({
      project_id: projectId,
      overall_score: result.overall_score,
      category_scores: result.category_scores,
      checks: result.checks,
      recommendations: result.recommendations,
      status: 'scored',
      round: 1
    });

    return Response.json({ report });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}