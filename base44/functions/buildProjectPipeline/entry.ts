import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { researchTemplates, instantiateFromTemplate } from '../../shared/generation.js';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { projectId } = await req.json();
    if (!projectId) return Response.json({ error: 'projectId is required' }, { status: 400 });

    const project = await base44.asServiceRole.entities.BuildProject.get(projectId);
    if (!project) return Response.json({ error: 'BuildProject not found' }, { status: 404 });

    const industry = (project.vision && project.vision.type) || project.vision_type || 'general';
    const businessName = project.name || 'New Business';

    // Step 1: Research industry templates
    const research = await researchTemplates(base44.asServiceRole, industry, 'service');
    const templatesFound = (research.templates || []).length;

    // Step 2: Find a matching SiteTemplate entity and instantiate
    let websiteProject = null;
    const siteTemplatePage = await base44.asServiceRole.entities.SiteTemplate.filter({ industry }, { limit: 1 });
    if (siteTemplatePage.items && siteTemplatePage.items.length > 0) {
      const template = siteTemplatePage.items[0];
      const result = await instantiateFromTemplate(base44.asServiceRole, {
        template,
        variables: { business_name: businessName, industry, location: '' }
      });
      websiteProject = result.project || result.websiteProject || result;
    }

    // Fallback: create a basic WebsiteProject
    if (!websiteProject) {
      websiteProject = await base44.asServiceRole.entities.WebsiteProject.create({
        business_name: businessName,
        business_website: '',
        industry,
        status: 'draft'
      });
    }

    const wpId = websiteProject.id || websiteProject._id;

    // Step 3: Deploy the site
    let deployment = { url: '', error: 'Deployment skipped — no content generated yet' };
    try {
      const deployRes = await base44.functions.invoke('deploySite', { projectId: wpId });
      deployment = deployRes.data || deployRes || deployment;
    } catch (deployErr) {
      deployment = { url: '', error: deployErr.message || 'Deploy failed' };
    }

    // Step 4: Notify master_orchestrator
    await base44.asServiceRole.entities.AgentTask.create({
      agent_name: 'master_orchestrator',
      task: `BuildProject "${project.name}" pipeline complete. ${templatesFound} templates researched. Website project ${wpId} created. Deployment ${deployment.url ? 'live at ' + deployment.url : 'pending: ' + (deployment.error || '')}. Review and coordinate next steps.`,
      status: 'pending',
      priority: 'medium',
      project_id: projectId,
      assigned_to: 'master_orchestrator'
    });

    return Response.json({
      research: { templatesFound, industry },
      websiteProject: { id: wpId, name: websiteProject.business_name || businessName },
      deployment,
      notified: 'master_orchestrator'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}