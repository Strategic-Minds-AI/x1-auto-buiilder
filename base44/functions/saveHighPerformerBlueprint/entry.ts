import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { contentSchema } from '../../shared/websiteResearch.js';

// Save a high-performing website project as a reusable blueprint template.
// Captures quality scores, Core Web Vitals, and gate verdicts from the source
// project + its linked PipelineRun so factory builds can select proven structures.

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const {
      projectId,
      templateName,
      subIndustry,
      websiteType,
      qualityScoreOverride,
      performanceMetricsOverride,
    } = body;

    if (!projectId) return Response.json({ error: 'projectId is required' }, { status: 400 });

    // ── Load the source project ──
    const project = await base44.entities.WebsiteProject.get(projectId);
    if (!project) return Response.json({ error: 'Project not found' }, { status: 404 });
    if (!project.content) return Response.json({ error: 'Project has no content to universalize' }, { status: 400 });

    // ── Pull quality + performance data from the linked PipelineRun ──
    let pipelineRun: any = null;
    let qualityScore = qualityScoreOverride ?? null;
    let parityScore: number | null = null;
    let performanceMetrics: any = performanceMetricsOverride ?? null;
    let gateResults: any = null;
    let pipelineRunId: string | null = null;

    try {
      const runs = await base44.asServiceRole.entities.PipelineRun.filter(
        { project_name: { $regex: project.business_name || project.industry || '' } },
        { sort: '-created_date', limit: 5 }
      );
      const items = Array.isArray(runs) ? runs : (runs.items || []);
      const matching = items.find((r: any) =>
        r.stages?.some((s: any) => s.stage === 'deploy' && s.url === project.deploy_url)
      ) || items[0];
      if (matching) {
        pipelineRun = matching;
        pipelineRunId = matching.id;
        parityScore = matching.parity_score ?? null;
        const stages = matching.stages || [];
        const browserStage = stages.find((s: any) => s.stage === 'cloud_browser_test');
        if (browserStage?.performance_metrics && !performanceMetrics) {
          performanceMetrics = browserStage.performance_metrics;
        }
        const gates = (matching as any).gates || [];
        if (gates.length > 0) {
          gateResults = gates.reduce((acc: any, g: any) => {
            acc[g.gate] = { verdict: g.verdict, score: g.score, gated: g.gated };
            return acc;
          }, {});
          const scoredGates = gates.filter((g: any) => typeof g.score === 'number');
          if (scoredGates.length > 0 && qualityScore === null) {
            qualityScore = Math.round(scoredGates.reduce((s: number, g: any) => s + g.score, 0) / scoredGates.length);
          }
        }
      }
    } catch {
      // PipelineRun lookup is best-effort — blueprint can still be saved without it
    }

    // ── Universalize the content into a reusable template ──
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt:
        `You are a website template architect. Convert this generated website content into a reusable, universal template for the "${project.industry}" industry. ` +
        `Replace all business-specific details (company name, phone, email, address, specific city/state, and unique claims tied to one company) with placeholder variables wrapped in double braces — e.g. {{business_name}}, {{location}}, {{phone}}, {{email}}, {{tagline}}. ` +
        `Keep the structure, section order, tone, and conversion quality intact. This is a HIGH-PERFORMING structure that passed quality gates and Core Web Vitals budgets — preserve every structural decision that made it perform well. ` +
        `Make the copy generic enough to fit any business in this industry, yet still specific and compelling (never vague or filler). ` +
        `Preserve the colorTokens as the template's default palette. Keep logoPrompt and heroImagePrompt generalized for the industry. ` +
        `Return JSON with: a template "name", the universalized "content" (same structure as the input content), and a "variables" array listing every placeholder you introduced with a short description.\n\n` +
        `Source content JSON:\n${JSON.stringify(project.content)}\n\n` +
        `Source business research:\n${JSON.stringify(project.business_research || {})}\n\n` +
        `Source business / industry: ${project.business_name || ''} / ${project.industry || ''}`,
      response_json_schema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          content: contentSchema,
          variables: {
            type: 'array',
            items: {
              type: 'object',
              properties: { key: { type: 'string' }, description: { type: 'string' } },
              required: ['key', 'description']
            }
          }
        },
        required: ['name', 'content', 'variables']
      }
    });

    // ── Save as a high-performer blueprint ──
    const rec = await base44.entities.SiteTemplate.create({
      name: templateName || result.name || `${project.industry || 'Industry'} High-Performer Blueprint`,
      industry: project.industry || '',
      sub_industry: subIndustry || '',
      website_type: websiteType || '',
      source_project_id: projectId,
      source_deploy_url: project.deploy_url || '',
      template: result.content,
      variables: result.variables || [],
      visual_pack: (project as any).visual_pack || null,
      blueprint_status: 'high_performer',
      quality_score: qualityScore,
      parity_score: parityScore,
      performance_metrics: performanceMetrics,
      gate_results: gateResults,
      pipeline_run_id: pipelineRunId || '',
      usage_count: 0,
    });

    return Response.json({
      template: rec,
      source_metrics: {
        quality_score: qualityScore,
        parity_score: parityScore,
        performance_metrics: performanceMetrics,
        gate_results: gateResults,
        pipeline_run_id: pipelineRunId,
      },
    });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}