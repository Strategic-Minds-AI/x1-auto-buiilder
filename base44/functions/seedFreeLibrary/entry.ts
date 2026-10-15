import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { generateFreeAssets } from '../../shared/freeLibrary.js';

// Seed the Free Library with all curated free assets
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const assets = generateFreeAssets();

    // Clear and reseed
    await base44.asServiceRole.entities.FreeAsset.deleteMany({});
    for (let i = 0; i < assets.length; i += 100) {
      await base44.asServiceRole.entities.FreeAsset.bulkCreate(assets.slice(i, i + 100));
    }

    return Response.json({
      success: true,
      seeded: assets.length,
      categories: Array.from(new Set(assets.map(a => a.type))),
      seededAt: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}