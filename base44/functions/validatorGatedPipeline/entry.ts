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
import {
  createPipelineRun,
  createWorkPackets,
  startPacket,
  completePacket,
  failPacket,
  skipPacket,
  recordValidationReceipt,
  updatePipelineRunStage,
  finalizePipelineRun,
} from '../../shared/workPacketOrchestrator.ts';

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
      pipeline_run_id: null,
      work_packets: {},
    };

    let content: any = null;
    let research: any = null;
    let industry = generateParams?.industry || 'general';
    let businessName = generateParams?.businessName || 'this business';
    let businessWebsite = generateParams?.businessWebsiteUrl || '';

    // Helper: record a gate result as a ValidationReceipt linked to the stage's WorkPacket
    const recordGate = async (stageId: string, gate: any) => {
      const packetId = pipeline.work_packets[stageId];
      if (!pipeline.pipeline_run_id || !packetId) return;
      const verdict: any = gate.gated ? 'FAIL' : 'PASS';
      const evidence: string[] = [];
      if (gate.screenshot_url) evidence.push(gate.screenshot_url);
      if (gate.summary) evidence.push(gate.summary);
      await recordValidationReceipt(
        base44,
        pipeline.pipeline_run_id,
        packetId,
        gate.gate,
        verdict,
        gate.score || 0,
        gate.summary || '',
        evidence,
        gate.attempts || []
      ).catch(() => {});
    };

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

    // ═══ Create PipelineRun + WorkPackets for every stage ═════════
    try {
      const run = await createPipelineRun(base44, `${businessName} — ${industry}`, pipeline.project_id || undefined);
      pipeline.pipeline_run_id = run.id;
      pipeline.work_packets = await createWorkPackets(base44, run.id);
    } catch (err: any) {
      pipeline.stages.push({ stage: 'workpacket_setup', status: 'failed', error: err.message });
    }

    // Mark research packet complete/skip
    if (pipeline.work_packets.research) {
      if (research) {
        await completePacket(base44, pipeline.work_packets.research, { research_loaded: true }, ['research_quality']).catch(() => {});
        await updatePipelineRunStage(base44, pipeline.pipeline_run_id, 'research', 0, 'COMPLETED', 'processing').catch(() => {});
      } else {
        await failPacket(base44, pipeline.work_packets.research, 'No research data after research stage').catch(() => {});
      }
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
      await recordGate('research', gate1);
      if (gate1.gated) {
        if (pipeline.work_packets.research) await failPacket(base44, pipeline.work_packets.research, gate1.gate_reason).catch(() => {});
        pipeline.gated = true;
        pipeline.gate_reason = gate1.gate_reason;
        return finalizePipeline(pipeline, base44);
      }
      // Persist enriched research
      if (pipeline.project_id && research) {
        await base44.entities.WebsiteProject.update(pipeline.project_id, { business_research: research });
      }
    }

    if (!content) {
      pipeline.error = 'No content after research stage';
      return finalizePipeline(pipeline, base44);
    }

    // ═══ STAGE 2: GENERATE ════════════════════════════════════════
    if (pipeline.work_packets.generate) await startPacket(base44, pipeline.work_packets.generate).catch(() => {});
    pipeline.stages.push({ stage: 'generate', status: 'complete', ok: !!content });
    if (pipeline.work_packets.generate) {
      await completePacket(base44, pipeline.work_packets.generate, { content_generated: !!content }, ['content_completeness']).catch(() => {});
      await updatePipelineRunStage(base44, pipeline.pipeline_run_id, 'generate', 1, 'COMPLETED', 'processing').catch(() => {});
    }

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
    await recordGate('generate', gate2);
    if (gate2.gated) {
      if (pipeline.work_packets.generate) await failPacket(base44, pipeline.work_packets.generate, gate2.gate_reason).catch(() => {});
      pipeline.gated = true;
      pipeline.gate_reason = gate2.gate_reason;
      return finalizePipeline(pipeline, base44);
    }

    // ═══ STAGE 3: COMPLIANCE CHECK ═════════════════════════════════
    if (pipeline.work_packets.compliance) await startPacket(base44, pipeline.work_packets.compliance).catch(() => {});
    let complianceIssues: any[] = [];
    try {
      const complianceRes = await base44.functions.invoke('runComplianceCheck', { projectId: pipeline.project_id });
      complianceIssues = complianceRes.data?.issues || [];
      pipeline.stages.push({ stage: 'compliance', status: 'complete', issue_count: complianceIssues.length });
    } catch (err: any) {
      pipeline.stages.push({ stage: 'compliance', status: 'failed', error: err.message });
    }
    if (pipeline.work_packets.compliance) {
      await completePacket(base44, pipeline.work_packets.compliance, { issue_count: complianceIssues.length }, ['google_compliance']).catch(() => {});
      await updatePipelineRunStage(base44, pipeline.pipeline_run_id, 'compliance', 2, 'COMPLETED', 'processing').catch(() => {});
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
    await recordGate('compliance', gate3);
    if (gate3.gated) {
      if (pipeline.work_packets.compliance) await failPacket(base44, pipeline.work_packets.compliance, gate3.gate_reason).catch(() => {});
      pipeline.gated = true;
      pipeline.gate_reason = gate3.gate_reason;
      return finalizePipeline(pipeline, base44);
    }

    // ═══ STAGE 4: AUTO-FIX ═════════════════════════════════════════
    if (pipeline.work_packets.auto_fix) await startPacket(base44, pipeline.work_packets.auto_fix).catch(() => {});
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
    if (pipeline.work_packets.auto_fix) {
      await completePacket(base44, pipeline.work_packets.auto_fix, { issues_fixed: complianceIssues.length }, ['fix_verification']).catch(() => {});
      await updatePipelineRunStage(base44, pipeline.pipeline_run_id, 'auto_fix', 3, 'COMPLETED', 'processing').catch(() => {});
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
      await recordGate('auto_fix', gate4);
      if (gate4.gated) {
        if (pipeline.work_packets.auto_fix) await failPacket(base44, pipeline.work_packets.auto_fix, gate4.gate_reason).catch(() => {});
        pipeline.gated = true;
        pipeline.gate_reason = gate4.gate_reason;
        return finalizePipeline(pipeline, base44);
      }
    }

    // ═══ STAGE 5: QA ══════════════════════════════════════════════
    if (pipeline.work_packets.qa) await startPacket(base44, pipeline.work_packets.qa).catch(() => {});
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
    if (pipeline.work_packets.qa) {
      await completePacket(base44, pipeline.work_packets.qa, { qa_complete: true }, ['human_quality']).catch(() => {});
      await updatePipelineRunStage(base44, pipeline.pipeline_run_id, 'qa', 4, 'COMPLETED', 'processing').catch(() => {});
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
    await recordGate('qa', gate5);
    if (gate5.gated) {
      if (pipeline.work_packets.qa) await failPacket(base44, pipeline.work_packets.qa, gate5.gate_reason).catch(() => {});
      pipeline.gated = true;
      pipeline.gate_reason = gate5.gate_reason;
      return finalizePipeline(pipeline, base44);
    }

    // ── GATE 5.5: Cross-Model Jury Validation (Claude + Gemini, mandatory before deploy) ──
    if (pipeline.work_packets.cross_model_jury) await startPacket(base44, pipeline.work_packets.cross_model_jury).catch(() => {});
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
      const juryGate = {
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
      };
      pipeline.gates.push(juryGate);
      await recordGate('cross_model_jury', juryGate);
      if (pipeline.work_packets.cross_model_jury) {
        if (promptValidationPassed) {
          await completePacket(base44, pipeline.work_packets.cross_model_jury, { jury_score: jury.avg_score }, ['cross_model_jury']).catch(() => {});
          await updatePipelineRunStage(base44, pipeline.pipeline_run_id, 'cross_model_jury', 5, 'COMPLETED', 'processing').catch(() => {});
        } else {
          await failPacket(base44, pipeline.work_packets.cross_model_jury, juryGate.gate_reason).catch(() => {});
        }
      }
      if (!promptValidationPassed) {
        pipeline.gated = true;
        pipeline.gate_reason = needsReview
          ? `cross_model_jury DISAGREEMENT — needs human review (Claude ${jury.judges?.claude?.score || 0} vs Gemini ${jury.judges?.gemini?.score || 0})`
          : `cross_model_jury FAILED — both judges agree content is below bar (${jury.avg_score || 0}/100)`;
        return finalizePipeline(pipeline, base44);
      }
    } catch (err: any) {
      const errGate = {
        gate: 'cross_model_jury',
        verdict: 'fail',
        score: 0,
        summary: `Jury validation error: ${err.message}`,
        gated: true,
        gate_reason: `cross_model_jury error: ${err.message}`,
      };
      pipeline.gates.push(errGate);
      await recordGate('cross_model_jury', errGate);
      if (pipeline.work_packets.cross_model_jury) await failPacket(base44, pipeline.work_packets.cross_model_jury, err.message).catch(() => {});
      pipeline.gated = true;
      pipeline.gate_reason = `cross_model_jury error: ${err.message}`;
      return finalizePipeline(pipeline, base44);
    }

    // ═══ STAGE 6: DEPLOY ═══════════════════════════════════════════
    if (pipeline.work_packets.deploy) await startPacket(base44, pipeline.work_packets.deploy).catch(() => {});
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
    if (pipeline.work_packets.deploy) {
      if (deployUrl) {
        await completePacket(base44, pipeline.work_packets.deploy, { url: deployUrl }, [deployUrl]).catch(() => {});
        await updatePipelineRunStage(base44, pipeline.pipeline_run_id, 'deploy', 6, 'COMPLETED', 'provisioning').catch(() => {});
      } else if (!skipDeploy) {
        await failPacket(base44, pipeline.work_packets.deploy, 'Deploy failed — no URL returned').catch(() => {});
      } else {
        await skipPacket(base44, pipeline.work_packets.deploy, 'skipDeploy=true').catch(() => {});
      }
    }

    // ═══ STAGE 6.5: CLOUD BROWSER TEST ═════════════════════════════
    if (pipeline.work_packets.cloud_browser_test) await startPacket(base44, pipeline.work_packets.cloud_browser_test).catch(() => {});
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
    if (pipeline.work_packets.cloud_browser_test) {
      const ev = browserTestResult?.screenshot_url ? [browserTestResult.screenshot_url] : [];
      if (browserTestResult?.skipped) {
        await skipPacket(base44, pipeline.work_packets.cloud_browser_test, browserTestResult.skip_reason || 'skipped').catch(() => {});
      } else if (browserGatePassed) {
        await completePacket(base44, pipeline.work_packets.cloud_browser_test, { passed: true }, ev).catch(() => {});
        await updatePipelineRunStage(base44, pipeline.pipeline_run_id, 'cloud_browser_test', 7, 'COMPLETED', 'qa').catch(() => {});
      } else {
        await failPacket(base44, pipeline.work_packets.cloud_browser_test, 'Browser render test failed', ev).catch(() => {});
      }
    }

    // ── GATE 5.7: Cloud Browser Render ──
    if (deployUrl && !browserTestResult?.skipped) {
      const browserGate = {
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
      };
      pipeline.gates.push(browserGate);
      await recordGate('cloud_browser_test', browserGate);
      if (!browserGatePassed) {
        pipeline.gated = true;
        pipeline.gate_reason = `cloud_browser_render FAILED — site did not render correctly in live browser`;
        return finalizePipeline(pipeline, base44);
      }
    }

    // ── GATE 6: Final Release (with fixer) ──
    if (pipeline.work_packets.final_release) await startPacket(base44, pipeline.work_packets.final_release).catch(() => {});
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
    await recordGate('final_release', gate6);
    if (gate6.gated) {
      if (pipeline.work_packets.final_release) await failPacket(base44, pipeline.work_packets.final_release, gate6.gate_reason).catch(() => {});
      pipeline.gated = true;
      pipeline.gate_reason = gate6.gate_reason;
      return finalizePipeline(pipeline, base44);
    }
    if (pipeline.work_packets.final_release) {
      await completePacket(base44, pipeline.work_packets.final_release, { released: true, deploy_url: deployUrl }, [deployUrl].filter(Boolean)).catch(() => {});
      await updatePipelineRunStage(base44, pipeline.pipeline_run_id, 'final_release', 8, 'COMPLETED', 'live').catch(() => {});
    }

    pipeline.success = true;
    pipeline.final_verdict = gate6.verdict;
    return finalizePipeline(pipeline, base44);
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

function finalizePipeline(pipeline: any, base44?: any): Response {
  pipeline.completed_at = new Date().toISOString();
  pipeline.duration_ms = Date.parse(pipeline.completed_at) - Date.parse(pipeline.started_at);
  pipeline.stages_completed = pipeline.stages.filter((s: any) => s.status === 'complete' || s.status === 'skipped').length;
  pipeline.gates_passed = pipeline.gates.filter((g: any) => !g.gated).length;
  pipeline.gates_total = pipeline.gates.length;
  pipeline.total_fix_runs = pipeline.gates.reduce((sum: number, g: any) => sum + (g.fix_runs || 0), 0);
  // Finalize the PipelineRun record
  if (base44 && pipeline.pipeline_run_id) {
    finalizePipelineRun(base44, pipeline.pipeline_run_id, pipeline.success, pipeline.deploy_url || '').catch(() => {});
  }
  return Response.json(pipeline);
}