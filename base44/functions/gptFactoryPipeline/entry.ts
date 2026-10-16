import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// End-to-end GPT Factory Pipeline — the full orchestration for the Digital Dominance system.
// Phases: GENERATE → VALIDATE → COMPLIANCE CHECK → AUTO-FIX → DEPLOY TO VERCEL
// Each phase is resilient — failures are recorded but don't block later phases.
// Can be called with either generateParams (new project) or projectId (existing project).

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin required' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const {
      projectId,
      generateParams,
      skipGenerate = false,
      skipCompliance = false,
      skipDeploy = false,
      autoFix = true,
    } = body;

    const pipeline: any = {
      started_at: new Date().toISOString(),
      phases: {},
      success: false,
      project_id: projectId || null,
    };

    let content: any = null;
    let industry = 'general';
    let businessName = 'this business';

    // ── PHASE 1: GENERATE ──────────────────────────────────────
    if (!skipGenerate) {
      try {
        if (projectId) {
          const project = await base44.entities.WebsiteProject.get(projectId);
          if (!project) {
            pipeline.error = 'Project not found';
            return Response.json(pipeline, { status: 404 });
          }
          content = project.content;
          industry = project.industry || 'general';
          businessName = project.business_name || 'this business';
          pipeline.phases.generate = { ok: !!content, source: 'existing_project', business_name: businessName };
        } else if (generateParams) {
          const genRes = await base44.functions.invoke('generateWebsite', generateParams);
          content = genRes.data?.content;
          industry = generateParams.industry || 'general';
          businessName = genRes.data?.businessResearch?.businessName || generateParams.businessName || 'this business';
          pipeline.phases.generate = { ok: !!content, source: 'fresh_generation', business_name: businessName };

          // Save the project so later phases can reference it
          if (content) {
            const rec = await base44.entities.WebsiteProject.create({
              business_name: businessName,
              business_website: generateParams.businessWebsiteUrl || '',
              industry,
              status: 'generated',
              business_research: genRes.data?.businessResearch,
              benchmark: genRes.data?.benchmark,
              content,
            });
            pipeline.project_id = rec.id;
          }
        } else {
          pipeline.error = 'Provide either projectId or generateParams';
          return Response.json(pipeline, { status: 400 });
        }
      } catch (err: any) {
        pipeline.phases.generate = { ok: false, error: err.message };
      }
    } else if (projectId) {
      const project = await base44.entities.WebsiteProject.get(projectId);
      content = project?.content;
      industry = project?.industry || 'general';
      businessName = project?.business_name || 'this business';
      pipeline.phases.generate = { ok: !!content, source: 'existing_project', skipped: true };
    }

    if (!content) {
      pipeline.error = 'No content to process';
      pipeline.completed_at = new Date().toISOString();
      return Response.json(pipeline, { status: 400 });
    }

    // ── PHASE 2: VALIDATE ───────────────────────────────────────
    try {
      const validationResult = await validateContent(base44, content, industry, businessName);
      pipeline.phases.validate = {
        ok: true,
        score: validationResult.score,
        issues: validationResult.issues,
        checks_passed: validationResult.checks_passed,
        checks_total: validationResult.checks_total,
      };
    } catch (err: any) {
      pipeline.phases.validate = { ok: false, error: err.message };
    }

    // ── PHASE 3: GOOGLE COMPLIANCE CHECK ────────────────────────
    if (!skipCompliance) {
      try {
        const complianceResult = await checkGoogleCompliance(base44, content, industry, businessName);
        pipeline.phases.compliance = {
          ok: true,
          score: complianceResult.score,
          issues: complianceResult.issues,
          issue_count: complianceResult.issues?.length || 0,
          recommendations: complianceResult.recommendations,
        };

        // ── PHASE 4: AUTO-FIX COMPLIANCE ISSUES ─────────────────
        if (autoFix && complianceResult.issues?.length > 0) {
          try {
            const fixResult = await autoFixIssues(base44, content, complianceResult.issues, industry, businessName);
            pipeline.phases.auto_fix = {
              ok: true,
              fixes_applied: fixResult.fixes?.length || 0,
              fixes: fixResult.fixes,
              content_updated: !!fixResult.content,
            };
            if (fixResult.content) {
              content = fixResult.content;
              // Update the project with fixed content
              if (pipeline.project_id) {
                await base44.entities.WebsiteProject.update(pipeline.project_id, { content });
              }
            }
          } catch (err: any) {
            pipeline.phases.auto_fix = { ok: false, error: err.message };
          }
        } else {
          pipeline.phases.auto_fix = { ok: true, skipped: true, reason: 'No issues to fix' };
        }
      } catch (err: any) {
        pipeline.phases.compliance = { ok: false, error: err.message };
      }
    } else {
      pipeline.phases.compliance = { ok: true, skipped: true };
      pipeline.phases.auto_fix = { ok: true, skipped: true };
    }

    // ── PHASE 5: DEPLOY TO VERCEL ───────────────────────────────
    if (!skipDeploy && pipeline.project_id) {
      try {
        const deployRes = await base44.functions.invoke('deploySite', { projectId: pipeline.project_id });
        pipeline.phases.deploy = {
          ok: !!deployRes.data?.url,
          url: deployRes.data?.url,
          deploy_id: deployRes.data?.deployId || deployRes.data?.id,
        };
        if (deployRes.data?.url) {
          await base44.entities.WebsiteProject.update(pipeline.project_id, {
            status: 'approved',
            deploy_url: deployRes.data.url,
            deploy_id: deployRes.data?.deployId || deployRes.data?.id || '',
          });
        }
      } catch (err: any) {
        pipeline.phases.deploy = { ok: false, error: err.message };
      }
    } else if (skipDeploy) {
      pipeline.phases.deploy = { ok: true, skipped: true };
    } else {
      pipeline.phases.deploy = { ok: false, error: 'No project_id to deploy' };
    }

    pipeline.success = Object.values(pipeline.phases).every((p: any) => p?.ok !== false);
    pipeline.completed_at = new Date().toISOString();
    pipeline.duration_ms = Date.parse(pipeline.completed_at) - Date.parse(pipeline.started_at);

    return Response.json(pipeline);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// ── VALIDATION ──────────────────────────────────────────────────
async function validateContent(base44: any, content: any, industry: string, businessName: string) {
  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    model: 'claude-sonnet-5',
    prompt:
      `You are a website content validator. Analyze this website content for "${businessName}" (${industry}).\n\n` +
      `Check for: completeness (all sections present), quality (compelling copy, specific not generic), ` +
      `conversion optimization (clear CTAs, trust signals), SEO readiness (keywords, meta-worthy headlines), ` +
      `and consistency (tone, messaging alignment).\n\n` +
      `Content:\n${JSON.stringify(content).slice(0, 8000)}\n\n` +
      `Return a validation score (0-100), list of issues found, and count of checks passed vs total.`,
    response_json_schema: {
      type: 'object',
      properties: {
        score: { type: 'number', description: '0-100 overall quality score' },
        issues: { type: 'array', items: { type: 'object', properties: {
          section: { type: 'string' },
          severity: { type: 'string', enum: ['critical', 'warning', 'info'] },
          issue: { type: 'string' },
          recommendation: { type: 'string' },
        } } },
        checks_passed: { type: 'number' },
        checks_total: { type: 'number' },
      },
      required: ['score', 'issues', 'checks_passed', 'checks_total'],
    },
  });
  return result;
}

// ── GOOGLE COMPLIANCE CHECK ───────────────────────────────────────
async function checkGoogleCompliance(base44: any, content: any, industry: string, businessName: string) {
  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    model: 'claude-sonnet-5',
    prompt:
      `You are a Google compliance auditor. Check this website content for "${businessName}" (${industry}) against Google's standards.\n\n` +
      `Evaluate: E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness), ` +
      `Core Web Vitals readiness (clean structure, no bloated sections), ` +
      `Helpful Content criteria (people-first, not search-engine-first), ` +
      `spam policies (no keyword stuffing, no hidden text, no scraped content), ` +
      `mobile readiness, structured data opportunities, ` +
      `and page experience signals.\n\n` +
      `Content:\n${JSON.stringify(content).slice(0, 8000)}\n\n` +
      `Return a compliance score (0-100), specific issues that would hurt Google rankings, ` +
      `and actionable recommendations to fix each issue.`,
    response_json_schema: {
      type: 'object',
      properties: {
        score: { type: 'number', description: '0-100 Google compliance score' },
        issues: { type: 'array', items: { type: 'object', properties: {
          category: { type: 'string', enum: ['eeat', 'content_quality', 'spam_policy', 'mobile', 'structured_data', 'page_experience', 'seo'] },
          severity: { type: 'string', enum: ['critical', 'warning', 'info'] },
          issue: { type: 'string' },
          fix: { type: 'string', description: 'Specific fix to apply' },
          section: { type: 'string', description: 'Which content section to fix' },
        } } },
        recommendations: { type: 'array', items: { type: 'string' } },
      },
      required: ['score', 'issues', 'recommendations'],
    },
  });
  return result;
}

// ── AUTO-FIX COMPLIANCE ISSUES ─────────────────────────────────────
async function autoFixIssues(base44: any, content: any, issues: any[], industry: string, businessName: string) {
  const criticalIssues = issues.filter((i: any) => i.severity === 'critical' || i.severity === 'warning');

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    model: 'claude-sonnet-5',
    prompt:
      `You are a website content fixer. Apply these compliance fixes to the website content for "${businessName}" (${industry}).\n\n` +
      `Issues to fix:\n${JSON.stringify(criticalIssues).slice(0, 6000)}\n\n` +
      `Current content:\n${JSON.stringify(content).slice(0, 8000)}\n\n` +
      `Apply ALL the fixes to the content. Return the complete fixed content object AND a list of what you changed. ` +
      `Keep the same JSON structure. Only change what the issues require — don't rewrite sections unnecessarily.`,
    response_json_schema: {
      type: 'object',
      properties: {
        content: { type: 'object', description: 'The fixed content object' },
        fixes: { type: 'array', items: { type: 'object', properties: {
          section: { type: 'string' },
          change: { type: 'string' },
          issue_addressed: { type: 'string' },
        } } },
      },
      required: ['content', 'fixes'],
    },
  });
  return result;
}