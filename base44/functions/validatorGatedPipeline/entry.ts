import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import {
  validateResearch,
  validateContentCompleteness,
  validateGoogleCompliance,
  validateFixes,
  validateHumanQuality,
  validateRelease,
} from '../../shared/pipelineValidators.js';
import {
  fixResearch,
  fixContent,
  fixCompliance,
  fixUnresolved,
  fixHumanQuality,
  fixRelease,
} from '../../shared/pipelineFixers.js';
import { runBrowserTestOnUrl, isCloudBrowserAvailable } from '../../shared/cloudBrowserTestRunner.ts';

// Validator-Gated Pipeline with MANDATORY auto-fix.
// Every validator gate is wrapped in a fix-loop: if the gate fails, the corresponding
// fixer runs IMMEDIATELY, then the validator re-checks. The pipeline only stops if the
// fixer cannot resolve the block after maxRepairLoops attempts.
//
// Stages + Gates + Fixers:
//   1. RESEARCH    → Gate: Research Quality    → Fixer: Research Repair
//   2. GENERATE    → Gate: Content Completeness → Fixer: Content Repair
//   3. COMPLIANCE  → Gate: Google Compliance    → Fixer: Compliance Repair
//   4. AUTO_FIX    → Gate: Fix Verification     → Fixer: Unresolved Repair
//   5. QA          → Gate: Human Quality        → Fixer: Human Quality Repair
//   6. DEPLOY      → Gate: Final Release        → Fixer: Release Repair

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
      gates: [],
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

    // ── GATE 1: Research Quality (with fixer) ──
    if (research) {
      const gate1 = await runGateWithFix({
        base44,
        gateName: 'research_quality',
        validate: () => validateResearch(base44, research, industry, businessName),
        fix: (v) => {
          const fixed = fixResearch(base44, research, v.gaps, industry, businessName, businessWebsite);
          return fixed.then(r => ({ content: r.research, summary: r.summary }));
        },
        onContentUpdate: (newResearch) => { research = newResearch; },
        maxRepairLoops,
      });
      pipeline.gates.push(gate1);
      if (gate1.gated) {
        pipeline.gated = true;
        pipeline.gate_reason = gate1.gate_reason;
        return finalizePipeline(pipeline);
      }
      // Persist enriched research
      if (pipeline.project_id && research) {
        await base44.entities.WebsiteProject.update(pipeline.project_id, { business_research: research });
      }
    }

    if (!content) {
      pipeline.error = 'No content after research stage';
      return finalizePipeline(pipeline);
    }

    // ═══ STAGE 2: GENERATE ════════════════════════════════════════
    pipeline.stages.push({ stage: 'generate', status: 'complete', ok: !!content });

    // ── GATE 2: Content Completeness (with fixer) ──
    const gate2 = await runGateWithFix({
      base44,
      gateName: 'content_completeness',
      validate: () => validateContentCompleteness(base44, content, industry, businessName),
      fix: (v) => fixContent(base44, content, v.issues || v.missing_sections || [], industry, businessName)
        .then(r => ({ content: r.content, summary: r.summary })),
      onContentUpdate: (newContent) => {
        content = newContent;
        if (pipeline.project_id) {
          base44.entities.WebsiteProject.update(pipeline.project_id, { content }).catch(() => {});
        }
      },
      maxRepairLoops,
    });
    pipeline.gates.push(gate2);
    if (gate2.gated) {
      pipeline.gated = true;
      pipeline.gate_reason = gate2.gate_reason;
      return finalizePipeline(pipeline);
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

    // ── GATE 3: Google Compliance (with fixer) ──
    const gate3 = await runGateWithFix({
      base44,
      gateName: 'google_compliance',
      validate: () => validateGoogleCompliance(base44, content, industry, businessName),
      fix: (v) => fixCompliance(base44, content, v.critical_issues || [], industry, businessName)
        .then(r => ({ content: r.content, summary: r.summary })),
      onContentUpdate: (newContent) => {
        content = newContent;
        if (pipeline.project_id) {
          base44.entities.WebsiteProject.update(pipeline.project_id, { content }).catch(() => {});
        }
      },
      maxRepairLoops,
    });
    pipeline.gates.push(gate3);
    if (gate3.gated) {
      pipeline.gated = true;
      pipeline.gate_reason = gate3.gate_reason;
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

    // ── GATE 4: Fix Verification (with fixer) ──
    if (complianceIssues.length > 0) {
      const gate4 = await runGateWithFix({
        base44,
        gateName: 'fix_verification',
        validate: () => validateFixes(base44, content, complianceIssues, industry, businessName),
        fix: (v) => fixUnresolved(base44, content, v.unresolved_issues || [], industry, businessName)
          .then(r => ({ content: r.content, summary: r.summary })),
        onContentUpdate: (newContent) => {
          content = newContent;
          if (pipeline.project_id) {
            base44.entities.WebsiteProject.update(pipeline.project_id, { content }).catch(() => {});
          }
        },
        maxRepairLoops,
      });
      pipeline.gates.push(gate4);
      if (gate4.gated) {
        pipeline.gated = true;
        pipeline.gate_reason = gate4.gate_reason;
        return finalizePipeline(pipeline);
      }
    }

    // ═══ STAGE 5: QA ══════════════════════════════════════════════
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

    // ── GATE 5: Human Quality (with fixer) ──
    const gate5 = await runGateWithFix({
      base44,
      gateName: 'human_quality',
      validate: () => validateHumanQuality(base44, content, industry, businessName),
      fix: (v) => fixHumanQuality(base44, content, v.critical_issues || [], industry, businessName)
        .then(r => ({ content: r.content, summary: r.summary })),
      onContentUpdate: (newContent) => {
        content = newContent;
        if (pipeline.project_id) {
          base44.entities.WebsiteProject.update(pipeline.project_id, { content }).catch(() => {});
        }
      },
      maxRepairLoops,
    });
    pipeline.gates.push(gate5);
    if (gate5.gated) {
      pipeline.gated = true;
      pipeline.gate_reason = gate5.gate_reason;
      return finalizePipeline(pipeline);
    }

    // ── GATE 5.5: Cross-Model Jury Validation (Claude + Gemini, mandatory before deploy) ──
    let promptValidationPassed = false;
    try {
      const juryRes = await base44.functions.invoke('crossModelJuryValidator', {
        industry,
        generatedContent: content,
        qualityBar: 85,
      });
      const jury = juryRes.data || {};
      promptValidationPassed = jury.can_ship === true;
      const needsReview = jury.needs_review === true;
      pipeline.gates.push({
        gate: 'cross_model_jury',
        verdict: promptValidationPassed ? 'pass' : (needsReview ? 'disagreement' : 'fail'),
        score: jury.avg_score || 0,
        summary: jury.summary || `Jury score: ${jury.avg_score || 0}/100`,
        judges: jury.judges,
        score_delta: jury.score_delta,
        gated: !promptValidationPassed,
        gate_reason: !promptValidationPassed
          ? needsReview
            ? `cross_model_jury DISAGREEMENT — Claude ${jury.judges?.claude?.score || 0} vs Gemini ${jury.judges?.gemini?.score || 0} (Δ${jury.score_delta}) — needs human review before deploy`
            : `cross_model_jury FAILED — both judges agree content is below bar (${jury.avg_score || 0}/100 avg)`
          : null,
      });
      if (!promptValidationPassed) {
        pipeline.gated = true;
        pipeline.gate_reason = needsReview
          ? `cross_model_jury DISAGREEMENT — needs human review (Claude ${jury.judges?.claude?.score || 0} vs Gemini ${jury.judges?.gemini?.score || 0})`
          : `cross_model_jury FAILED — both judges agree content is below bar (${jury.avg_score || 0}/100)`;
        return finalizePipeline(pipeline);
      }
    } catch (err: any) {
      pipeline.gates.push({
        gate: 'cross_model_jury',
        verdict: 'fail',
        score: 0,
        summary: `Jury validation error: ${err.message}`,
        gated: true,
        gate_reason: `cross_model_jury error: ${err.message}`,
      });
      pipeline.gated = true;
      pipeline.gate_reason = `cross_model_jury error: ${err.message}`;
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

    // ═══ STAGE 6.5: CLOUD BROWSER TEST ═════════════════════════════
    // Renders the deployed site in a real browser, captures a screenshot,
    // and runs QA checks before the final release gate. Only runs when a
    // deploy URL exists and the cloud browser engine is configured.
    let browserGatePassed = true;
    let browserTestResult: any = null;
    if (deployUrl) {
      browserTestResult = await runBrowserTestOnUrl(deployUrl);
      if (browserTestResult.skipped) {
        pipeline.stages.push({ stage: 'cloud_browser_test', status: 'skipped', reason: browserTestResult.skip_reason });
      } else {
        browserGatePassed = browserTestResult.passed;
        pipeline.stages.push({
          stage: 'cloud_browser_test',
          status: browserTestResult.passed ? 'complete' : 'failed',
          screenshot_url: browserTestResult.screenshot_url,
          error_count: browserTestResult.qa_errors.length,
        });
      }
    } else {
      pipeline.stages.push({ stage: 'cloud_browser_test', status: 'skipped', reason: 'no deploy URL' });
    }

    // ── GATE 5.7: Cloud Browser Render ──
    if (deployUrl && !browserTestResult?.skipped) {
      pipeline.gates.push({
        gate: 'cloud_browser_render',
        verdict: browserGatePassed ? 'pass' : 'fail',
        score: browserGatePassed ? 100 : 0,
        summary: browserGatePassed
          ? 'Site rendered successfully in live browser — all QA checks passed'
          : `Browser render test failed: ${(browserTestResult?.qa_errors || [browserTestResult?.error || 'unknown']).join('; ')}`,
        screenshot_url: browserTestResult?.screenshot_url || null,
        gated: !browserGatePassed,
        gate_reason: !browserGatePassed
          ? `cloud_browser_render FAILED — site did not render correctly in live browser`
          : null,
      });
      if (!browserGatePassed) {
        pipeline.gated = true;
        pipeline.gate_reason = `cloud_browser_render FAILED — site did not render correctly in live browser`;
        return finalizePipeline(pipeline);
      }
    }

    // ── GATE 6: Final Release (with fixer) ──
    const gate6 = await runGateWithFix({
      base44,
      gateName: 'final_release',
      validate: () => validateRelease(base44, content, deployUrl, industry, businessName),
      fix: (v) => fixRelease(base44, content, v.critical_issues || [], industry, businessName)
        .then(r => ({ content: r.content, summary: r.summary })),
      onContentUpdate: (newContent) => {
        content = newContent;
        if (pipeline.project_id) {
          base44.entities.WebsiteProject.update(pipeline.project_id, { content }).catch(() => {});
        }
      },
      maxRepairLoops,
    });
    pipeline.gates.push(gate6);
    if (gate6.gated) {
      pipeline.gated = true;
      pipeline.gate_reason = gate6.gate_reason;
      return finalizePipeline(pipeline);
    }

    pipeline.success = true;
    pipeline.final_verdict = gate6.verdict;
    return finalizePipeline(pipeline);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// ── Gate + Fix loop helper ──────────────────────────────────────
// Runs the validator. If it fails, runs the fixer, then re-validates.
// Repeats up to maxRepairLoops times. Only gates if the fixer can't resolve it.
async function runGateWithFix({ base44, gateName, validate, fix, onContentUpdate, maxRepairLoops }: any): Promise<any> {
  const attempts: any[] = [];
  let currentContent: any = null;

  for (let attempt = 0; attempt <= maxRepairLoops; attempt++) {
    const verdict = await validate();
    attempts.push({ attempt, verdict: verdict.verdict, score: verdict.score || verdict.overall_score, summary: verdict.summary });

    if (verdict.verdict === 'pass' || verdict.verdict === 'conditional_pass') {
      return {
        gate: gateName,
        verdict: verdict.verdict,
        score: verdict.score || verdict.overall_score,
        summary: verdict.summary,
        attempts,
        fix_runs: attempt,
        gated: false,
      };
    }

    // Gate failed — run the fixer IMMEDIATELY (unless this was the last allowed attempt)
    if (attempt < maxRepairLoops) {
      try {
        const fixResult = await fix(verdict);
        if (fixResult?.content) {
          currentContent = fixResult.content;
          onContentUpdate(fixResult.content);
          attempts[attempt].fix_applied = fixResult.summary;
        } else {
          attempts[attempt].fix_failed = 'fixer returned no content';
          break;
        }
      } catch (err: any) {
        attempts[attempt].fix_failed = err.message;
        break;
      }
    }
  }

  // All repair loops exhausted — gate
  const lastAttempt = attempts[attempts.length - 1];
  return {
    gate: gateName,
    verdict: 'fail',
    score: lastAttempt?.score || 0,
    summary: lastAttempt?.summary || 'Gate failed after all repair attempts',
    attempts,
    fix_runs: maxRepairLoops,
    gated: true,
    gate_reason: `${gateName} FAILED after ${maxRepairLoops} fix attempts: ${lastAttempt?.summary || 'unresolved'}`,
  };
}

function finalizePipeline(pipeline: any): Response {
  pipeline.completed_at = new Date().toISOString();
  pipeline.duration_ms = Date.parse(pipeline.completed_at) - Date.parse(pipeline.started_at);
  pipeline.stages_completed = pipeline.stages.filter((s: any) => s.status === 'complete' || s.status === 'skipped').length;
  pipeline.gates_passed = pipeline.gates.filter((g: any) => !g.gated).length;
  pipeline.gates_total = pipeline.gates.length;
  pipeline.total_fix_runs = pipeline.gates.reduce((sum: number, g: any) => sum + (g.fix_runs || 0), 0);
  return Response.json(pipeline);
}