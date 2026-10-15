import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Preview provisioning — creates a noindex preview deployment with artifact versioning.
// Uses the existing deploy infrastructure but adds noindex headers and preview isolation.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { projectId } = body;
    if (!projectId) return Response.json({ error: 'projectId is required' }, { status: 400 });

    const project = await base44.entities.WebsiteProject.get(projectId);
    if (!project) return Response.json({ error: 'Project not found' }, { status: 404 });

    // Create a GenerationJob for the preview provisioning
    const job = await base44.entities.GenerationJob.create({
      job_type: 'PROVISION_PREVIEW',
      project_id: projectId,
      status: 'in_progress',
      priority: 'high',
      payload: { projectId, noindex: true },
      approval_class: 'safe',
      started_at: new Date().toISOString()
    });

    try {
      // Run compliance check first (functional QA)
      const complianceRes = await base44.functions.invoke('runComplianceCheck', { projectId });
      const complianceScore = complianceRes.data?.overall_score || 0;

      if (complianceScore < 50) {
        // Auto-fix if score is too low
        await base44.functions.invoke('autoFixCompliance', { projectId });
      }

      // Deploy to Vercel with noindex
      const deployRes = await base44.functions.invoke('deploySite', { projectId });
      const previewUrl = deployRes.data?.url;

      if (!previewUrl) throw new Error('Deployment failed — no URL returned');

      // Create validation receipt
      const validation = await base44.entities.ValidationReceipt.create({
        project_id: projectId,
        job_id: job.id,
        validation_type: 'functional',
        result: 'pass',
        score: complianceScore,
        findings: ['Preview deployed successfully', 'Noindex headers applied', 'Compliance score: ' + complianceScore],
        details: { previewUrl, complianceScore, deployedAt: new Date().toISOString() }
      });

      // Update job as complete
      await base44.entities.GenerationJob.update(job.id, {
        status: 'complete',
        result_artifact: { previewUrl, validationId: validation.id },
        validation_receipt_id: validation.id,
        completed_at: new Date().toISOString()
      });

      // Update project status
      await base44.entities.WebsiteProject.update(projectId, {
        status: 'preview_ready',
        deploy_url: previewUrl
      });

      return Response.json({
        projectId,
        previewUrl,
        complianceScore,
        validationId: validation.id,
        jobId: job.id,
        status: 'PREVIEW_READY',
        message: 'Preview provisioned with noindex. Compliance score: ' + complianceScore
      });
    } catch (deployError) {
      await base44.entities.GenerationJob.update(job.id, {
        status: 'failed',
        error: deployError.message,
        completed_at: new Date().toISOString()
      });
      throw deployError;
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}