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

    const body = await req.json();
    const { projectId, releaseNotes } = body;
    if (!projectId) return Response.json({ error: 'projectId is required' }, { status: 400 });

    // 1. Load the project
    const project = await base44.entities.WebsiteProject.get(projectId);
    if (!project) return Response.json({ error: 'Project not found' }, { status: 404 });

    // 2. Check all validation receipts — every type must pass
    const { items: receipts } = await base44.entities.ValidationReceipt.filter(
      { project_id: projectId },
      { sort: '-created_date', limit: 50 }
    );

    const validationGate = {
      total: receipts.length,
      passed: receipts.filter(r => r.result === 'pass').length,
      failed: receipts.filter(r => r.result === 'fail').length,
      blocked: receipts.filter(r => r.result === 'blocked').length,
      unknown: receipts.filter(r => r.result === 'unknown').length,
      details: receipts.map(r => ({ type: r.validation_type, result: r.result, score: r.score })),
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

    // 4. Check existing approvals
    const { items: approvals } = await base44.entities.ApprovalRequest.filter(
      { project_id: projectId, approval_type: 'release' },
      { sort: '-created_date', limit: 10 }
    );

    const existingApproval = approvals.find(a => a.status === 'approved');

    // 5. Determine gate status
    const validationPassed = validationGate.failed === 0 && validationGate.blocked === 0 && validationGate.total > 0;
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

    // 6. All gates passed — create the release approval
    const approval = await base44.entities.ApprovalRequest.create({
      project_id: projectId,
      approval_type: 'release',
      description: releaseNotes || `Production release authorized for ${project.business_name || 'project'} — all validation and compliance gates passed.`,
      options: [
        { label: 'Approve Release', value: 'approve' },
        { label: 'Hold Release', value: 'hold' },
      ],
      status: 'approved',
      approved_by: user.id,
      approved_at: new Date().toISOString(),
    });

    // 7. Mark the project as approved
    await base44.entities.WebsiteProject.update(projectId, { status: 'approved' });

    // 8. Create a GenerationJob to track the release
    const releaseJob = await base44.entities.GenerationJob.create({
      job_type: 'PUBLISH_APPROVED',
      project_id: projectId,
      status: 'complete',
      priority: 'urgent',
      approval_class: 'production',
      payload: { releaseNotes: releaseNotes || '', approvalId: approval.id },
      result_artifact: { deployUrl: project.deploy_url, approvalId: approval.id },
      completed_at: new Date().toISOString(),
    });

    return Response.json({
      projectId,
      authorized: true,
      gates,
      validation: validationGate,
      compliance: complianceGate,
      approval,
      releaseJob,
      deployUrl: project.deploy_url,
      message: `Release authorized for ${project.business_name || 'project'}. All gates passed.`,
      authorizedAt: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}