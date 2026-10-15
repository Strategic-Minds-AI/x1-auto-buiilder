import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { getIndustryPrompt } from '../../shared/industryPrompts.js';

// Social creative engine — generates brand-matched social media creative assets
// for all supported platforms using the approved brand manifest.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { projectId, platforms } = body;
    if (!projectId) return Response.json({ error: 'projectId is required' }, { status: 400 });

    const project = await base44.entities.WebsiteProject.get(projectId);
    if (!project) return Response.json({ error: 'Project not found' }, { status: 404 });

    // Find or create brand manifest
    let manifest;
    const { items } = await base44.entities.ApprovedBrandManifest.filter({ project_id: projectId }, { limit: 1 });
    if (items && items.length > 0) {
      manifest = items[0];
    } else {
      // Create from project
      const content = project.content || {};
      const tokens = content.colorTokens || {};
      manifest = await base44.entities.ApprovedBrandManifest.create({
        project_id: projectId,
        business_name: project.business_name || '',
        color_tokens: { primary: tokens.primary || '#00d4ff', accent: tokens.accent || '#0066ff', background: tokens.background || '#0b1523', text: tokens.text || '#ffffff' },
        logo_url: project.logo_url || '',
        status: 'approved'
      });
    }

    const targetPlatforms = platforms || ['facebook', 'instagram', 'tiktok', 'youtube', 'linkedin', 'twitter'];
    const socialPrompt = getIndustryPrompt(project.industry, 'social_content');
    const tokens = manifest.color_tokens || {};

    // Generate creative asset prompts via LLM
    const creativeResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      model: 'claude-sonnet-5',
      prompt:
        'Generate social media creative asset prompts for ' + project.business_name + ' (' + project.industry + ' industry).\n' +
        'Brand colors: primary=' + (tokens.primary || '#00d4ff') + ', accent=' + (tokens.accent || '#0066ff') + '\n' +
        'Logo: ' + (manifest.logo_url || 'AI generated') + '\n' +
        'Platforms: ' + targetPlatforms.join(', ') + '\n\n' +
        socialPrompt + '\n\n' +
        'For each platform, generate image generation prompts for: profile_picture, cover_banner, square_promo, vertical_story, educational_graphic, and offer_graphic. ' +
        'Each prompt should produce a brand-consistent image that matches the brand colors and industry tone.\n' +
        'Return an array of { platform, asset_type, prompt } objects.',
      response_json_schema: {
        type: 'object',
        properties: {
          creatives: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                platform: { type: 'string' },
                asset_type: { type: 'string' },
                prompt: { type: 'string' }
              }
            }
          }
        }
      }
    });

    // Generate key images (profile + cover per platform)
    const creatives = creativeResult.creatives || [];
    const kits = [];

    for (const platform of targetPlatforms) {
      const platformCreatives = creatives.filter(c => c.platform === platform);
      const profilePrompt = platformCreatives.find(c => c.asset_type === 'profile_picture')?.prompt ||
        'Professional profile picture for ' + project.business_name + ', ' + project.industry + ' industry, brand colors ' + (tokens.primary || '#00d4ff') + ' and ' + (tokens.accent || '#0066ff') + ', clean modern design, centered logo mark';
      const coverPrompt = platformCreatives.find(c => c.asset_type === 'cover_banner')?.prompt ||
        'Professional cover banner for ' + project.business_name + ', ' + project.industry + ' industry, wide format, brand colors, modern gradient background with subtle pattern';

      // Generate profile picture
      let profileUrl = '';
      try {
        const profileRes = await base44.asServiceRole.integrations.Core.GenerateImage({ prompt: profilePrompt });
        profileUrl = profileRes.url || '';
      } catch (e) { /* continue without image */ }

      // Generate cover
      let coverUrl = '';
      try {
        const coverRes = await base44.asServiceRole.integrations.Core.GenerateImage({ prompt: coverPrompt });
        coverUrl = coverRes.url || '';
      } catch (e) { /* continue without image */ }

      const kit = await base44.entities.SocialCreativeKit.create({
        project_id: projectId,
        brand_manifest_id: manifest.id,
        platform,
        profile_picture_url: profileUrl,
        cover_banner_url: coverUrl,
        status: 'generated'
      });
      kits.push(kit);
    }

    return Response.json({
      projectId,
      manifestId: manifest.id,
      platforms: targetPlatforms,
      kitsCreated: kits.length,
      kits,
      message: 'Generated ' + kits.length + ' social creative kits'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}