import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Creates an ApprovedBrandManifest from a WebsiteProject's approved assets.
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

    const content = project.content || {};
    const tokens = content.colorTokens || {};

    const manifest = await base44.entities.ApprovedBrandManifest.create({
      project_id: projectId,
      business_name: project.business_name || '',
      positioning: content.about?.body || '',
      logo_url: project.logo_url || '',
      logo_variants: { primary: project.logo_url || '' },
      color_tokens: {
        primary: tokens.primary || '#00d4ff',
        accent: tokens.accent || '#0066ff',
        background: tokens.background || '#0b1523',
        text: tokens.text || '#ffffff',
        secondary: tokens.secondary || '#1e293b'
      },
      typography: {
        heading_font: 'Inter',
        body_font: 'Inter',
        scale: '1.25'
      },
      image_direction: content.heroImagePrompt || '',
      tone_of_voice: 'professional',
      target_audience: project.industry || '',
      service_taxonomy: (content.services || []).map(s => s.title),
      offer_rules: content.finalCta?.headline || '',
      cta_rules: content.hero?.primaryCta || '',
      website_url: project.deploy_url || '',
      version: 1,
      status: 'approved'
    });

    return Response.json({ manifest, message: 'Brand manifest created and approved' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}