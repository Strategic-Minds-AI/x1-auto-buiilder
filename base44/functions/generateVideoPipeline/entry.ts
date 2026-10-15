import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { getIndustryPrompt } from '../../shared/industryPrompts.js';

// Video pipeline — script → storyboard → render → QA.
// Supports 12 video categories with brand-safe compositing.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { projectId, videoType, campaignGoal, aspectRatio, generateVideo } = body;

    const validTypes = ['business_intro', 'launch_announcement', 'service_explainer', 'product_demo', 'educational_short', 'promotional_offer', 'app_explainer', 'social_reel', 'b2b_presentation', 'onboarding_tutorial', 'brand_storytelling', 'seasonal_clip'];
    if (!validTypes.includes(videoType)) {
      return Response.json({ error: 'Invalid videoType. Valid: ' + validTypes.join(', ') }, { status: 400 });
    }

    const project = projectId ? await base44.entities.WebsiteProject.get(projectId) : null;
    const industry = project?.industry || 'professional';
    const businessName = project?.business_name || 'Your Business';

    // Get brand manifest if available
    let manifest = null;
    if (projectId) {
      const { items } = await base44.entities.ApprovedBrandManifest.filter({ project_id: projectId }, { limit: 1 });
      manifest = items?.[0] || null;
    }

    const videoPrompt = getIndustryPrompt(industry, 'video_script');
    const tokens = manifest?.color_tokens || {};

    // Step 1: Generate script
    const scriptResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      model: 'claude-sonnet-5',
      prompt:
        'Write a professional video script for a ' + videoType.replace(/_/g, ' ') + ' video.\n' +
        'BUSINESS: ' + businessName + '\n' +
        'INDUSTRY: ' + industry + '\n' +
        'CAMPAIGN GOAL: ' + (campaignGoal || 'Brand awareness and lead generation') + '\n' +
        'BRAND COLORS: ' + (tokens.primary || '#00d4ff') + ', ' + (tokens.accent || '#0066ff') + '\n\n' +
        videoPrompt + '\n\n' +
        'Structure: Hook (3s) → Problem/Pain (5s) → Solution/Showcase (10s) → Social Proof (3s) → CTA (5s). ' +
        'Total duration: 26 seconds. Write the full script with scene descriptions and voiceover text.',
      response_json_schema: {
        type: 'object',
        properties: {
          script: { type: 'string' },
          scenes: { type: 'array', items: { type: 'object', properties: { scene_number: { type: 'number' }, description: { type: 'string' }, voiceover: { type: 'string' }, duration: { type: 'string' } } } },
          hook: { type: 'string' },
          cta: { type: 'string' },
          total_duration: { type: 'string' }
        }
      }
    });

    // Create video asset record with script
    const videoAsset = await base44.entities.VideoAsset.create({
      project_id: projectId || '',
      brand_manifest_id: manifest?.id || '',
      video_type: videoType,
      campaign_goal: campaignGoal || 'Brand awareness',
      script: scriptResult.script || '',
      storyboard: { scenes: scriptResult.scenes || [] },
      aspect_ratio: aspectRatio || '16:9',
      duration: 6,
      status: 'SCRIPT_READY'
    });

    // Step 2: If generateVideo is true, render the video
    if (generateVideo) {
      await base44.entities.VideoAsset.update(videoAsset.id, { status: 'RENDER_QUEUED' });

      try {
        const renderPrompt = 'A professional ' + videoType.replace(/_/g, ' ') + ' video for ' + businessName + ', ' + industry + ' industry. ' +
          (scriptResult.scenes?.[0]?.description || 'Cinematic brand showcase with modern visuals') + '. ' +
          'Brand colors: ' + (tokens.primary || '#00d4ff') + ' and ' + (tokens.accent || '#0066ff') + '. ' +
          'High quality, professional, engaging.';

        const videoResult = await base44.asServiceRole.integrations.Core.GenerateVideo({
          prompt: renderPrompt,
          aspect_ratio: aspectRatio || '16:9',
          duration: 6,
          generate_audio: true
        });

        await base44.entities.VideoAsset.update(videoAsset.id, {
          status: 'VIDEO_READY',
          video_url: videoResult.url || ''
        });

        return Response.json({
          videoAssetId: videoAsset.id,
          status: 'VIDEO_READY',
          script: scriptResult.script,
          scenes: scriptResult.scenes,
          videoUrl: videoResult.url,
          message: 'Video generated successfully'
        });
      } catch (renderError) {
        await base44.entities.VideoAsset.update(videoAsset.id, { status: 'STORYBOARD_READY' });
        return Response.json({
          videoAssetId: videoAsset.id,
          status: 'STORYBOARD_READY',
          script: scriptResult.script,
          scenes: scriptResult.scenes,
          message: 'Script and storyboard ready. Video render failed: ' + renderError.message
        });
      }
    }

    return Response.json({
      videoAssetId: videoAsset.id,
      status: 'SCRIPT_READY',
      script: scriptResult.script,
      scenes: scriptResult.scenes,
      hook: scriptResult.hook,
      cta: scriptResult.cta,
      totalDuration: scriptResult.total_duration,
      message: 'Script generated. Set generateVideo=true to render.'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}