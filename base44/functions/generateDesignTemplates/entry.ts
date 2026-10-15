import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { generateTemplatesForCategory } from '../../shared/websiteTaxonomy.js';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { category } = await req.json();
    const valid = ['website', 'desktop_app', 'mobile_app'];
    if (!valid.includes(category)) {
      return Response.json({ error: 'category must be one of: website, desktop_app, mobile_app' }, { status: 400 });
    }

    // Generate the template records for this category
    const templates = generateTemplatesForCategory(category);

    // Clear existing templates for this category (clean regenerate)
    await base44.entities.DesignTemplate.deleteMany({ category });

    // Bulk-create in batches of 200
    let created = 0;
    for (let i = 0; i < templates.length; i += 200) {
      const batch = templates.slice(i, i + 200);
      await base44.entities.DesignTemplate.bulkCreate(batch);
      created += batch.length;
    }

    return Response.json({
      category,
      generated: templates.length,
      created,
      message: `Generated ${created} templates for ${category}`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}