import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const batchSize = Math.min(body.batchSize || 10, 20);

    // Find projects that have content but no logo yet
    const { items } = await base44.entities.WebsiteProject.filter(
      { content: { $exists: true } },
      { sort: "-created_date", limit: batchSize * 3, fields: ["id", "business_name", "industry", "content", "logo_url", "hero_image_url"] }
    );

    // Filter in code for projects missing images
    const needsImages = (items || []).filter(p => !p.logo_url || !p.hero_image_url).slice(0, batchSize);

    if (needsImages.length === 0) {
      return Response.json({
        processed: 0,
        message: "All projects already have images. Use populateLibraries to generate more profiles first."
      });
    }

    // Generate images in parallel (logos + heroes)
    const imagePromises = needsImages.map(async function(p) {
      const content = p.content || {};
      const logoPrompt = content.logoPrompt || ('Professional modern logo for ' + (p.business_name || '') + ', ' + (p.industry || '') + ' industry, clean vector style, no text');
      const heroPrompt = content.heroImagePrompt || ('Cinematic photorealistic hero image for ' + (p.industry || '') + ' business, professional, high quality');

      try {
        const [logoRes, heroRes] = await Promise.allSettled([
          base44.asServiceRole.integrations.Core.GenerateImage({ prompt: logoPrompt }),
          base44.asServiceRole.integrations.Core.GenerateImage({ prompt: heroPrompt })
        ]);

        const update = {};
        if (logoRes.status === 'fulfilled') update.logo_url = logoRes.value.url;
        if (heroRes.status === 'fulfilled') update.hero_image_url = heroRes.value.url;

        if (Object.keys(update).length > 0) {
          await base44.entities.WebsiteProject.update(p.id, update);
        }

        return {
          id: p.id,
          business_name: p.business_name,
          logo_url: update.logo_url || null,
          hero_image_url: update.hero_image_url || null
        };
      } catch (e) {
        return { id: p.id, business_name: p.business_name, error: String(e.message || e) };
      }
    });

    const results = await Promise.all(imagePromises);
    const succeeded = results.filter(r => r.logo_url || r.hero_image_url);

    return Response.json({
      processed: results.length,
      succeeded: succeeded.length,
      results: results
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}