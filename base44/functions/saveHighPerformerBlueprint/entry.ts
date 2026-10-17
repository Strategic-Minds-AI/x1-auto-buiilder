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

    // ── Push the blueprint to the connected GitHub repo's templates folder ──
    let githubResult: any = null;
    try {
      githubResult = await pushTemplateToGitHub(base44, rec);
    } catch (err: any) {
      githubResult = { error: err.message };
    }

    return Response.json({
      template: rec,
      source_metrics: {
        quality_score: qualityScore,
        parity_score: parityScore,
        performance_metrics: performanceMetrics,
        gate_results: gateResults,
        pipeline_run_id: pipelineRunId,
      },
      github_sync: githubResult,
    });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// ── Push a blueprint template JSON file to the connected GitHub repo ──
async function pushTemplateToGitHub(base44: any, template: any): Promise<any> {
  const repo = process.env.GITHUB_TEMPLATE_REPO || 'xps-admin/cloudbrowser-sync-engine';
  const folder = process.env.GITHUB_TEMPLATES_FOLDER || 'templates';

  const { accessToken } = await base44.asServiceRole.connectors.getConnection('github');

  // Slugify filename: {industry}-{template-name}.json
  const slug = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'blueprint';
  const filename = `${slug(template.industry)}-${slug(template.name)}.json`;
  const path = `${folder}/${filename}`;

  // Build the file content
  const fileContent = JSON.stringify({
    name: template.name,
    industry: template.industry,
    sub_industry: template.sub_industry,
    website_type: template.website_type,
    template: template.template,
    variables: template.variables,
    visual_pack: template.visual_pack,
    quality_score: template.quality_score,
    parity_score: template.parity_score,
    performance_metrics: template.performance_metrics,
    gate_results: template.gate_results,
    blueprint_status: template.blueprint_status,
    source_project_id: template.source_project_id,
    source_deploy_url: template.source_deploy_url,
    synced_at: new Date().toISOString(),
  }, null, 2);

  // UTF-8 safe base64
  const bytes = new TextEncoder().encode(fileContent);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  const encodedContent = btoa(binary);

  // Check if file already exists (to get SHA for update vs create)
  let sha: string | null = null;
  try {
    const checkRes = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/vnd.github+json' },
    });
    if (checkRes.ok) {
      const existing = await checkRes.json();
      sha = existing.sha;
    }
  } catch { /* file doesn't exist yet — that's fine */ }

  // Create or update the file
  const commitMessage = sha
    ? `Update blueprint: ${template.name} (${template.industry})`
    : `Add blueprint: ${template.name} (${template.industry})`;

  const createRes = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: commitMessage,
      content: encodedContent,
      ...(sha ? { sha } : {}),
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(`GitHub API error: ${err.message || createRes.statusText}`);
  }

  const result = await createRes.json();
  return {
    repo,
    path,
    url: result.content?.html_url || '',
    commit_sha: result.commit?.sha || '',
    commit_url: result.commit?.html_url || '',
    updated: !!sha,
  };
}