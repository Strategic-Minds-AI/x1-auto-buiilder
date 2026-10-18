import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Phase 12: Authorized Release — the final gate before a project goes to
// production. Verifies that ALL validation receipts pass, compliance is
// clean, and all required approvals are granted. If everything checks out,
// creates a release ApprovalRequest and marks the project as "approved".
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Operator administrator required' }, { status: 403 });

    const body = await req.json();
    const { projectId, pipelineRunId, sourceSha, releaseNotes } = body;
    if (!projectId) return Response.json({ error: 'projectId is required' }, { status: 400 });
    if (!pipelineRunId || !/^[0-9a-f]{40}$/i.test(sourceSha || '')) {
      return Response.json({ error: 'pipelineRunId and a 40-character sourceSha are required' }, { status: 428 });
    }

    // 1. Load the project
    const project = await base44.entities.WebsiteProject.get(projectId);
    if (!project) return Response.json({ error: 'Project not found' }, { status: 404 });
    const pipelineRun = await base44.entities.PipelineRun.get(pipelineRunId).catch(() => null);
    const expectedNames = [
      project.business_name,
      [project.business_name, project.industry].filter(Boolean).join(' — '),
    ];
    if (!pipelineRun || !expectedNames.includes(pipelineRun.project_name)) {
      return Response.json({ error: 'PipelineRun cannot be bound to this project' }, { status: 409 });
    }

    // 2. Check all validation receipts — every type must pass
    const { items: receipts } = await base44.entities.ValidationReceipt.filter(
      { pipeline_run_id: pipelineRunId },
      { sort: '-created_date', limit: 50 }
    );

    const requiredGates = ['static', 'functional', 'security', 'visual', 'operational'];
    const evidencedPasses = receipts.filter(r => r.verdict === 'PASS' && r.validator && Array.isArray(r.evidence_refs) && r.evidence_refs.length > 0);
    const covered = new Set(evidencedPasses.map(r => r.gate));
    const validationGate = {
      total: receipts.length,
      passed: evidencedPasses.length,
      failed: receipts.filter(r => r.verdict === 'FAIL').length,
      blocked: receipts.filter(r => r.verdict === 'BLOCKED').length,
      unknown: receipts.filter(r => !['PASS', 'FAIL', 'BLOCKED'].includes(r.verdict)).length,
      missingGates: requiredGates.filter(gate => !covered.has(gate)),
      details: receipts.map(r => ({ gate: r.gate, verdict: r.verdict, validator: r.validator, evidence_count: r.evidence_refs?.length || 0 })),
    };

    // 3. Check compliance reports
    const { items: complianceReports } = await base44.entities.ComplianceReport.filter(
      { project_id: projectId },
      { sort: '-created_date', limit: 10 }
    );

    const latestCompliance = complianceReports[0];
    const complianceGate = {
      hasReport: !!latestCompliance,
      overallScore: latestCompliance?.overall_score || 0,
      status: latestCompliance?.status || 'unknown',
      criticalIssues: latestCompliance?.critical_issues || 0,
    };

    // 5. Determine gate status
    const validationPassed = validationGate.failed === 0 && validationGate.blocked === 0 &&
      validationGate.unknown === 0 && validationGate.missingGates.length === 0;
    const compliancePassed = complianceGate.hasReport && complianceGate.overallScore >= 80;
    const hasValidDeploy = !!project.deploy_url;
    const allGatesPassed = validationPassed && compliancePassed && hasValidDeploy;

    const gates = [
      { name: 'Validation', passed: validationPassed, detail: `${validationGate.passed}/${validationGate.total} passed, ${validationGate.failed} failed, ${validationGate.blocked} blocked` },
      { name: 'Compliance', passed: compliancePassed, detail: complianceGate.hasReport ? `Score: ${complianceGate.overallScore}/100` : 'No compliance report found' },
      { name: 'Deployment', passed: hasValidDeploy, detail: project.deploy_url || 'No deploy URL' },
    ];

    if (!allGatesPassed) {
      return Response.json({
        projectId,
        authorized: false,
        gates,
        validation: validationGate,
        compliance: complianceGate,
        message: 'Release not authorized. All gates must pass before production release.',
        blockers: gates.filter(g => !g.passed).map(g => `${g.name}: ${g.detail}`),
      }, { status: 403 });
    }

    // Readiness may create a PENDING decision request but may not self-approve or publish.
    if (!body.rollback_ref) {
      return Response.json({
        projectId,
        authorized: false,
        blockers: ['A rollback_ref is required before requesting operator approval'],
      }, { status: 428 });
    }
    const approval = await base44.entities.ApprovalRequest.create({
      request_id: 'AR-' + crypto.randomUUID(),
      action_class: 'PRODUCTION_RELEASE',
      scope: 'release:website_project:' + projectId + ':sha:' + sourceSha,
      pipeline_run_id: pipelineRunId,
      description: releaseNotes || 'Request a separately authorized production release for source SHA ' + sourceSha,
      status: 'PENDING',
      requested_by: user.id,
      rollback_ref: body.rollback_ref,
      created_at: new Date().toISOString(),
    });
    return Response.json({
      projectId,
      authorized: false,
      status: 'PENDING',
      gates,
      validation: validationGate,
      compliance: complianceGate,
      approval_request_id: approval.id,
      message: 'Readiness evidence recorded. An independent operator decision is required.',
    }, { status: 202 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}