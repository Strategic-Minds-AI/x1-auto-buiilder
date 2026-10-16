import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { researchTemplates, instantiateFromTemplate } from '../../shared/generation.js';
import { runBrowserTestOnUrl } from '../../shared/cloudBrowserTestRunner.ts';

// Full pipeline: research → template selection → content generation → deploy → notify
// Triggered automatically when a new WebsiteProject is created
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { projectId } = await req.json();
    if (!projectId) return Response.json({ error: 'projectId is required' }, { status: 400 });

    const project = await base44.asServiceRole.entities.WebsiteProject.get(projectId);
    if (!project) return Response.json({ error: 'WebsiteProject not found' }, { status: 404 });

    const industry = project.industry || 'general';
    const businessName = project.business_name || 'New Business';
    const businessWebsite = project.business_website || '';
    const location = project.location || '';
    const clientId = project.client_id || null;

    const pipeline = { projectId, industry, steps: [] };

    // Step 1: Research business (if source website provided)
    if (businessWebsite) {
      try {
        const researchRes = await base44.functions.invoke('researchBusiness', { url: businessWebsite, industry });
        const research = researchRes.data || researchRes;
        await base44.asServiceRole.entities.WebsiteProject.update(projectId, {
          business_research: research.business_research || research,
          status: 'researching'
        });
        pipeline.steps.push({ step: 'research', status: 'complete', data: { found: !!(research.business_research) } });
      } catch (err) {
        pipeline.steps.push({ step: 'research', status: 'skipped', error: err.message });
      }
    } else {
      pipeline.steps.push({ step: 'research', status: 'skipped', reason: 'no source website' });
    }

    // Step 2: Research industry templates
    let templatesFound = 0;
    try {
      const research = await researchTemplates(base44.asServiceRole, industry, 'service');
      templatesFound = (research.templates || []).length;
      await base44.asServiceRole.entities.WebsiteProject.update(projectId, {
        benchmark: research.benchmark || { templates: templatesFound, industry }
      });
      pipeline.steps.push({ step: 'template_research', status: 'complete', templatesFound });
    } catch (err) {
      pipeline.steps.push({ step: 'template_research', status: 'failed', error: err.message });
    }

    // Step 3: Find matching SiteTemplate and instantiate
    try {
      const siteTemplatePage = await base44.asServiceRole.entities.SiteTemplate.filter({ industry }, { limit: 1 });
      if (siteTemplatePage.items && siteTemplatePage.items.length > 0) {
        const template = siteTemplatePage.items[0];
        await instantiateFromTemplate(base44.asServiceRole, {
          template,
          variables: { business_name: businessName, industry, location }
        });
        pipeline.steps.push({ step: 'template_instantiate', status: 'complete' });
      } else {
        pipeline.steps.push({ step: 'template_instantiate', status: 'skipped', reason: 'no matching template' });
      }
    } catch (err) {
      pipeline.steps.push({ step: 'template_instantiate', status: 'failed', error: err.message });
    }

    // Step 4: Generate website content
    try {
      const contentRes = await base44.functions.invoke('generateWebsite', {
        projectId,
        industry,
        businessName,
        location,
        businessWebsite
      });
      pipeline.steps.push({ step: 'generate_content', status: 'complete' });
    } catch (err) {
      pipeline.steps.push({ step: 'generate_content', status: 'failed', error: err.message });
    }

    // Step 5: Generate brand assets (logo + hero)
    try {
      await base44.functions.invoke('generateAssets', { projectId, assetTypes: ['logo', 'hero_image'] });
      pipeline.steps.push({ step: 'generate_assets', status: 'complete' });
    } catch (err) {
      pipeline.steps.push({ step: 'generate_assets', status: 'failed', error: err.message });
    }

    // Step 6: Deploy the site
    let deployment = { url: '', error: 'Deployment skipped' };
    try {
      const deployRes = await base44.functions.invoke('deploySite', { projectId });
      deployment = deployRes.data || deployRes || deployment;
      if (deployment.url) {
        await base44.asServiceRole.entities.WebsiteProject.update(projectId, {
          deploy_url: deployment.url,
          deploy_id: deployment.id || deployment.deploymentId || '',
          status: 'preview_ready'
        });
      }
      pipeline.steps.push({ step: 'deploy', status: deployment.url ? 'complete' : 'partial', url: deployment.url });
    } catch (err) {
      pipeline.steps.push({ step: 'deploy', status: 'failed', error: err.message });
    }

    // Step 6.5: Cloud browser render test — block approval if the live site doesn't render
    let browserPassed = false;
    if (deployment.url) {
      try {
        const browserResult = await runBrowserTestOnUrl(deployment.url);
        browserPassed = browserResult.passed;
        pipeline.steps.push({
          step: 'cloud_browser_test',
          status: browserResult.skipped ? 'skipped' : (browserResult.passed ? 'complete' : 'failed'),
          reason: browserResult.skip_reason || undefined,
          screenshot_url: browserResult.screenshot_url,
          error_count: browserResult.qa_errors?.length || 0,
        });
        if (!browserResult.skipped && !browserResult.passed) {
          await base44.asServiceRole.entities.WebsiteProject.update(projectId, {
            status: 'needs_fixes',
          }).catch(() => {});
        }
      } catch (err) {
        pipeline.steps.push({ step: 'cloud_browser_test', status: 'failed', error: err.message });
      }
    } else {
      pipeline.steps.push({ step: 'cloud_browser_test', status: 'skipped', reason: 'no deploy URL' });
    }

    // Step 7: Generate social calendar
    try {
      await base44.functions.invoke('generateSocialScheduleV2', { projectId, industry, businessName });
      pipeline.steps.push({ step: 'social_calendar', status: 'complete' });
    } catch (err) {
      pipeline.steps.push({ step: 'social_calendar', status: 'failed', error: err.message });
    }

    // Step 8: Run compliance check
    try {
      await base44.functions.invoke('runComplianceCheck', { projectId });
      pipeline.steps.push({ step: 'compliance', status: 'complete' });
    } catch (err) {
      pipeline.steps.push({ step: 'compliance', status: 'failed', error: err.message });
    }

    // Step 9: Notify master_orchestrator
    try {
      await base44.asServiceRole.entities.AgentTask.create({
        agent_name: 'master_orchestrator',
        task: `WebsiteProject "${businessName}" pipeline complete. ${pipeline.steps.filter(s => s.status === 'complete').length}/${pipeline.steps.length} steps succeeded. Deployment ${deployment.url ? 'live at ' + deployment.url : 'pending'}. Review and coordinate next steps.`,
        status: 'pending',
        priority: 'medium',
        project_id: projectId,
        assigned_to: 'master_orchestrator'
      });
      pipeline.steps.push({ step: 'notify', status: 'complete' });
    } catch (err) {
      pipeline.steps.push({ step: 'notify', status: 'failed', error: err.message });
    }

    return Response.json({ success: true, pipeline });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}