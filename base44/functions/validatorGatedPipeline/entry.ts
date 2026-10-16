import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import {
  validateResearch,
  validateContentCompleteness,
  validateGoogleCompliance,
  validateFixes,
  validateHumanQuality,
  validateRelease,
} from '../../shared/pipelineValidators.js';

// Validator-Gated Pipeline — the full build with INDEPENDENT validators between every stage.
// Each validator is a fresh LLM call that judges the content cold, without sharing state
// with the stage that produced it. If any validator fails, the pipeline GATES (stops) and
// reports the blocker — no stage runs on top of unvalidated work.
//
// Stages:
//   1. RESEARCH        → Validator 1: Research Quality Gate
//   2. GENERATE        → Validator 2: Content Completeness Gate
//   3. COMPLIANCE      → Validator 3: Google Compliance Gate
//   4. AUTO_FIX        → Validator 4: Fix Verification Gate
//   5. QA              → Validator 5: Human Quality Gate
//   6. DEPLOY          → Validator 6: Final Release Gate
//
// Can run with generateParams (new project) or projectId (existing project).

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
      skipDeploy = false,
      maxRepairLoops = 3,
    } = body;

    const pipeline: any = {
      started_at: new Date().toISOString(),
      stages: [],
      validators: [],
      gated: false,
      gate_reason: null,
      success: false,
      project_id: projectId || null,
    };

    let content: any = null;
    let research: any = null;
    let industry = generateParams?.industry || 'general';
    let businessName = generateParams?.businessName || 'this business';
    let businessWebsite = generateParams?.businessWebsiteUrl || '';

    // ═══ STAGE 1: RESEARCH ═══════════════════════════════════════
    try {
      if (projectId) {
        const project = await base44.entities.WebsiteProject.get(projectId);
        if (!project) {
          pipeline.error = 'Project not found';
          return Response.json(pipeline, { status: 404 });
        }
        content = project.content;
        research = project.business_research;
        industry = project.industry || industry;
        businessName = project.business_name || businessName;
        businessWebsite = project.business_website || businessWebsite;
        pipeline.stages.push({ stage: 'research', status: 'loaded_from_project', ok: !!research });
      } else if (generateParams) {
        const genRes = await base44.functions.invoke('generateWebsite', generateParams);
        content = genRes.data?.content;
        research = genRes.data?.businessResearch;
        industry = genRes.data?.businessResearch?.businessName || industry;
        pipeline.stages.push({ stage: 'research', status: 'fresh_generation', ok: !!research });

        if (content) {
          const rec = await base44.entities.WebsiteProject.create({
            business_name: businessName,
            business_website: businessWebsite,
            industry,
            status: 'generated',
            business_research: research,
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
      pipeline.stages.push({ stage: 'research', status: 'failed', error: err.message });
    }

    // ── VALIDATOR 1: Research Quality Gate ──
    if (research) {
      const v1 = await validateResearch(base44, research, industry, businessName);
      pipeline.validators.push({ gate: 'research_quality', ...v1 });
      if (v1.verdict === 'fail') {
        pipeline.gated = true;
        pipeline.gate_reason = `Research Quality Gate FAILED: ${v1.summary}`;
        return finalizePipeline(pipeline);
      }
    }

    if (!content) {
      pipeline.error = 'No content after research stage';
      return finalizePipeline(pipeline);
    }

    // ═══ STAGE 2: GENERATE (content already produced in stage 1) ═══
    pipeline.stages.push({ stage: 'generate', status: 'complete', ok: !!content });

    // ── VALIDATOR 2: Content Completeness Gate ──
    const v2 = await validateContentCompleteness(base44, content, industry, businessName);
    pipeline.validators.push({ gate: 'content_completeness', ...v2 });
    if (v2.verdict === 'fail') {
      // Try one repair loop: regenerate the missing sections
      let repairAttempts = 0;
      while (v2.verdict === 'fail' && repairAttempts < maxRepairLoops) {
        repairAttempts++;
        try {
          const fixRes = await base44.functions.invoke('qaAgent', { projectId: pipeline.project_id, content });
          if (pipeline.project_id) {
            const refreshed = await base44.entities.WebsiteProject.get(pipeline.project_id);
            if (refreshed?.content) content = refreshed.content;
          }
          const recheck = await validateContentCompleteness(base44, content, industry, businessName);
          pipeline.validators.push({ gate: `content_completeness_recheck_${repairAttempts}`, ...recheck });
          if (recheck.verdict === 'pass') break;
        } catch { break; }
      }
      if (v2.verdict === 'fail') {
        const lastCheck = pipeline.validators.filter(v => v.gate?.startsWith('content_completeness')).pop();
        if (lastCheck && lastCheck.verdict === 'fail') {
          pipeline.gated = true;
          pipeline.gate_reason = `Content Completeness Gate FAILED after ${maxRepairLoops} repair loops: ${lastCheck.summary}`;
          return finalizePipeline(pipeline);
        }
      }
    }

    // ═══ STAGE 3: COMPLIANCE CHECK ═════════════════════════════════
    let complianceIssues: any[] = [];
    try {
      const complianceRes = await base44.functions.invoke('runComplianceCheck', { projectId: pipeline.project_id });
      complianceIssues = complianceRes.data?.issues || [];
      pipeline.stages.push({ stage: 'compliance', status: 'complete', issue_count: complianceIssues.length });
    } catch (err: any) {
      pipeline.stages.push({ stage: 'compliance', status: 'failed', error: err.message });
    }

    // ── VALIDATOR 3: Google Compliance Gate ──
    const v3 = await validateGoogleCompliance(base44, content, industry, businessName);
    pipeline.validators.push({ gate: 'google_compliance', ...v3 });
    if (v3.verdict === 'fail') {
      pipeline.gated = true;
      pipeline.gate_reason = `Google Compliance Gate FAILED: ${v3.summary}`;
      return finalizePipeline(pipeline);
    }

    // ═══ STAGE 4: AUTO-FIX ═════════════════════════════════════════
    if (complianceIssues.length > 0) {
      try {
        const fixRes = await base44.functions.invoke('qaAgent', { projectId: pipeline.project_id, content });
        if (pipeline.project_id) {
          const refreshed = await base44.entities.WebsiteProject.get(pipeline.project_id);
          if (refreshed?.content) content = refreshed.content;
        }
        pipeline.stages.push({ stage: 'auto_fix', status: 'complete', issues_fixed: fixRes.data?.issues_fixed || 0 });
      } catch (err: any) {
        pipeline.stages.push({ stage: 'auto_fix', status: 'failed', error: err.message });
      }
    } else {
      pipeline.stages.push({ stage: 'auto_fix', status: 'skipped', reason: 'no compliance issues' });
    }

    // ── VALIDATOR 4: Fix Verification Gate ──
    if (complianceIssues.length > 0) {
      const v4 = await validateFixes(base44, content, complianceIssues, industry, businessName);
      pipeline.validators.push({ gate: 'fix_verification', ...v4 });
      if (v4.verdict === 'fail') {
        pipeline.gated = true;
        pipeline.gate_reason = `Fix Verification Gate FAILED: ${v4.summary}`;
        return finalizePipeline(pipeline);
      }
    }

    // ═══ STAGE 5: QA (final polish) ════════════════════════════════
    try {
      const qaRes = await base44.functions.invoke('qaAgent', { projectId: pipeline.project_id, content });
      if (pipeline.project_id) {
        const refreshed = await base44.entities.WebsiteProject.get(pipeline.project_id);
        if (refreshed?.content) content = refreshed.content;
      }
      pipeline.stages.push({ stage: 'qa', status: 'complete', issues_fixed: qaRes.data?.issues_fixed || 0 });
    } catch (err: any) {
      pipeline.stages.push({ stage: 'qa', status: 'failed', error: err.message });
    }

    // ── VALIDATOR 5: Human Quality Gate ──
    const v5 = await validateHumanQuality(base44, content, industry, businessName);
    pipeline.validators.push({ gate: 'human_quality', ...v5 });
    if (v5.verdict === 'fail') {
      pipeline.gated = true;
      pipeline.gate_reason = `Human Quality Gate FAILED: ${v5.summary}`;
      return finalizePipeline(pipeline);
    }

    // ═══ STAGE 6: DEPLOY ═══════════════════════════════════════════
    let deployUrl = '';
    if (!skipDeploy && pipeline.project_id) {
      try {
        const deployRes = await base44.functions.invoke('deploySite', { projectId: pipeline.project_id });
        deployUrl = deployRes.data?.url || '';
        pipeline.stages.push({ stage: 'deploy', status: deployUrl ? 'complete' : 'failed', url: deployUrl });
        if (deployUrl) {
          await base44.entities.WebsiteProject.update(pipeline.project_id, {
            status: 'approved',
            deploy_url: deployUrl,
            deploy_id: deployRes.data?.deployId || deployRes.data?.id || '',
          });
        }
      } catch (err: any) {
        pipeline.stages.push({ stage: 'deploy', status: 'failed', error: err.message });
      }
    } else {
      pipeline.stages.push({ stage: 'deploy', status: 'skipped' });
    }

    // ── VALIDATOR 6: Final Release Gate ──
    const v6 = await validateRelease(base44, content, deployUrl, industry, businessName);
    pipeline.validators.push({ gate: 'final_release', ...v6 });
    if (v6.verdict === 'fail') {
      pipeline.gated = true;
      pipeline.gate_reason = `Final Release Gate FAILED: ${v6.summary}`;
      return finalizePipeline(pipeline);
    }

    pipeline.success = true;
    pipeline.final_verdict = v6.verdict;
    return finalizePipeline(pipeline);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

function finalizePipeline(pipeline: any): Response {
  pipeline.completed_at = new Date().toISOString();
  pipeline.duration_ms = Date.parse(pipeline.completed_at) - Date.parse(pipeline.started_at);
  pipeline.stages_completed = pipeline.stages.filter((s: any) => s.status === 'complete' || s.status === 'skipped').length;
  pipeline.validators_passed = pipeline.validators.filter((v: any) => v.verdict === 'pass' || v.verdict === 'conditional_pass').length;
  pipeline.validators_total = pipeline.validators.length;
  return Response.json(pipeline);
}