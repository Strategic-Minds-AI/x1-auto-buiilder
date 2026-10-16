// WorkPacket Orchestrator — manages the WorkPacket + PipelineRun + ValidationReceipt
// lifecycle for every factory pipeline. Ensures all project builds follow a
// consistent structure: each stage is a WorkPacket with risk_class, executor,
// acceptance_criteria, and validation_requirements; each gate produces a
// ValidationReceipt with evidence.

export interface StageDef {
  stage_id: string;
  title: string;
  description?: string;
  risk_class: 'READ' | 'DRAFT' | 'BRANCH_WRITE' | 'PROTECTED';
  executor: 'BASE44' | 'CODEX' | 'GITHUB_AGENT' | 'VERCEL' | 'SUPABASE' | 'RAILWAY' | 'CLOUD_BROWSER' | 'HUMAN';
  acceptance_criteria: string[];
  validation_requirements: string[];
  depends_on?: string[]; // stage_ids that must complete first
}

export const GATED_PIPELINE_STAGES: StageDef[] = [
  {
    stage_id: 'research',
    title: 'Business Research & Skip-Trace',
    description: 'Extract business details, services, service area, and competitive benchmarks.',
    risk_class: 'READ',
    executor: 'BASE44',
    acceptance_criteria: ['Business research populated', 'Industry benchmark captured'],
    validation_requirements: ['Research quality gate passes'],
  },
  {
    stage_id: 'generate',
    title: 'Content Generation',
    description: 'Generate 14-section ultra-premium content blueprint with industry intelligence.',
    risk_class: 'DRAFT',
    executor: 'BASE44',
    acceptance_criteria: ['All 14 content sections present', 'Content passes completeness gate'],
    validation_requirements: ['Content completeness gate passes'],
    depends_on: ['research'],
  },
  {
    stage_id: 'compliance',
    title: 'Google Compliance Check',
    description: 'Run programmatic SEO and Google compliance validation.',
    risk_class: 'READ',
    executor: 'BASE44',
    acceptance_criteria: ['Compliance issues enumerated', 'Critical issues resolved'],
    validation_requirements: ['Google compliance gate passes'],
    depends_on: ['generate'],
  },
  {
    stage_id: 'auto_fix',
    title: 'Autonomous Fix Cycle',
    description: 'Fixer agent resolves all compliance and content issues.',
    risk_class: 'DRAFT',
    executor: 'BASE44',
    acceptance_criteria: ['All compliance issues fixed', 'Fix verification gate passes'],
    validation_requirements: ['Fix verification gate passes'],
    depends_on: ['compliance'],
  },
  {
    stage_id: 'qa',
    title: 'Human-Quality QA',
    description: 'QA agent checks for specificity, originality, and conversion quality.',
    risk_class: 'DRAFT',
    executor: 'BASE44',
    acceptance_criteria: ['No generic filler content', 'Human quality gate passes'],
    validation_requirements: ['Human quality gate passes'],
    depends_on: ['auto_fix'],
  },
  {
    stage_id: 'cross_model_jury',
    title: 'Cross-Model Jury Validation',
    description: 'Claude + Gemini independently score content; both must agree above bar.',
    risk_class: 'READ',
    executor: 'BASE44',
    acceptance_criteria: ['Both judges score above quality bar', 'No judge disagreement'],
    validation_requirements: ['Cross-model jury gate passes'],
    depends_on: ['qa'],
  },
  {
    stage_id: 'deploy',
    title: 'Production Deployment',
    description: 'Deploy the generated site to Vercel.',
    risk_class: 'BRANCH_WRITE',
    executor: 'VERCEL',
    acceptance_criteria: ['Deploy URL returned', 'Site accessible at URL'],
    validation_requirements: ['Deploy succeeds with live URL'],
    depends_on: ['cross_model_jury'],
  },
  {
    stage_id: 'cloud_browser_test',
    title: 'Cloud Browser Render Test',
    description: 'Render the live deployed site in a real browser and run QA checks.',
    risk_class: 'READ',
    executor: 'CLOUD_BROWSER',
    acceptance_criteria: ['Hero heading visible', 'CTA present', 'Page not blank', 'Screenshot captured'],
    validation_requirements: ['Cloud browser render gate passes'],
    depends_on: ['deploy'],
  },
  {
    stage_id: 'final_release',
    title: 'Final Release Approval',
    description: 'Final release gate confirms all checks passed and site is production-ready.',
    risk_class: 'PROTECTED',
    executor: 'BASE44',
    acceptance_criteria: ['All prior gates passed', 'Deploy URL live', 'Browser test passed'],
    validation_requirements: ['Final release gate passes'],
    depends_on: ['cloud_browser_test'],
  },
];

export async function createPipelineRun(base44: any, projectName: string, projectId?: string): Promise<any> {
  const stages = GATED_PIPELINE_STAGES.map((s) => ({
    id: s.stage_id,
    label: s.title,
    status: 'PENDING',
    agent: s.executor,
  }));
  return await base44.asServiceRole.entities.PipelineRun.create({
    project_name: projectName,
    status: 'processing',
    current_stage: GATED_PIPELINE_STAGES[0].stage_id,
    current_stage_index: 0,
    stages,
    auto_launch: true,
  });
}

export async function createWorkPackets(base44: any, pipelineRunId: string): Promise<Record<string, string>> {
  // Returns a map of stage_id → WorkPacket record id
  const stageToPacketId: Record<string, string> = {};
  let seq = 1;
  for (const stage of GATED_PIPELINE_STAGES) {
    const packetId = `WP-${String(seq).padStart(3, '0')}`;
    const deps = (stage.depends_on || []).map((dep) => stageToPacketId[dep]).filter(Boolean);
    const rec = await base44.asServiceRole.entities.WorkPacket.create({
      packet_id: packetId,
      pipeline_run_id: pipelineRunId,
      stage_id: stage.stage_id,
      title: stage.title,
      description: stage.description || '',
      risk_class: stage.risk_class,
      executor: stage.executor,
      dependencies: deps,
      acceptance_criteria: stage.acceptance_criteria,
      validation_requirements: stage.validation_requirements,
      status: 'PENDING',
      max_retries: 3,
      retry_count: 0,
    });
    stageToPacketId[stage.stage_id] = rec.id;
    seq++;
  }
  return stageToPacketId;
}

export async function startPacket(base44: any, packetRecordId: string): Promise<void> {
  await base44.asServiceRole.entities.WorkPacket.update(packetRecordId, {
    status: 'IN_PROGRESS',
    started_at: new Date().toISOString(),
  });
}

export async function completePacket(
  base44: any,
  packetRecordId: string,
  result: any,
  evidenceRefs: string[] = []
): Promise<void> {
  await base44.asServiceRole.entities.WorkPacket.update(packetRecordId, {
    status: 'COMPLETED',
    result,
    evidence_refs: evidenceRefs,
    completed_at: new Date().toISOString(),
  });
}

export async function failPacket(
  base44: any,
  packetRecordId: string,
  error: string,
  evidenceRefs: string[] = []
): Promise<void> {
  await base44.asServiceRole.entities.WorkPacket.update(packetRecordId, {
    status: 'FAILED',
    result: { error },
    evidence_refs: evidenceRefs,
    completed_at: new Date().toISOString(),
  });
}

export async function skipPacket(base44: any, packetRecordId: string, reason: string): Promise<void> {
  await base44.asServiceRole.entities.WorkPacket.update(packetRecordId, {
    status: 'COMPLETED',
    result: { skipped: true, reason },
    completed_at: new Date().toISOString(),
  });
}

export async function recordValidationReceipt(
  base44: any,
  pipelineRunId: string,
  packetRecordId: string,
  gate: string,
  verdict: 'PASS' | 'FAIL' | 'BLOCKED' | 'MISSING_EVIDENCE',
  score: number,
  detail: string,
  evidenceRefs: string[] = [],
  issues: any[] = []
): Promise<string> {
  const receipt = await base44.asServiceRole.entities.ValidationReceipt.create({
    receipt_id: `VR-${Date.now()}-${gate.slice(0, 8)}`,
    pipeline_run_id: pipelineRunId,
    work_packet_id: packetRecordId,
    gate,
    verdict,
    validator: 'validatorGatedPipeline',
    evidence_refs: evidenceRefs,
    score,
    detail,
    issues,
    created_at: new Date().toISOString(),
  });
  return receipt.id;
}

export async function updatePipelineRunStage(
  base44: any,
  pipelineRunId: string,
  stageId: string,
  stageIndex: number,
  stageStatus: string,
  runStatus: string
): Promise<void> {
  const run = await base44.asServiceRole.entities.PipelineRun.get(pipelineRunId);
  if (!run) return;
  const stages = (run.stages || []).map((s: any) =>
    s.id === stageId ? { ...s, status: stageStatus, completed_at: stageStatus === 'COMPLETED' ? new Date().toISOString() : s.completed_at } : s
  );
  await base44.asServiceRole.entities.PipelineRun.update(pipelineRunId, {
    stages,
    current_stage: stageId,
    current_stage_index: stageIndex,
    status: runStatus,
  });
}

export async function finalizePipelineRun(
  base44: any,
  pipelineRunId: string,
  success: boolean,
  deployUrl?: string
): Promise<void> {
  await base44.asServiceRole.entities.PipelineRun.update(pipelineRunId, {
    status: success ? 'live' : 'failed',
    deploy_url: deployUrl || '',
    current_stage_index: GATED_PIPELINE_STAGES.length - 1,
  });
}