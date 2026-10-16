import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { INDUSTRY_FAMILIES } from "../../shared/industryRegistry.js";
import { PLATFORM_PACKS, PLATFORM_CATEGORIES } from "../../shared/platformRegistry.js";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const { action } = body;

    if (action === 'status') {
      const familyCount = await base44.entities.IndustryFamily.count();
      const platformCount = await base44.entities.PlatformPack.count();
      return Response.json({
        counts: {
          families: familyCount,
          platforms: platformCount,
          sub_industries: INDUSTRY_FAMILIES.reduce((sum, f) => sum + f.sub_industries.length, 0),
        },
        registry_totals: {
          families: INDUSTRY_FAMILIES.length,
          platforms: PLATFORM_PACKS.length,
          categories: PLATFORM_CATEGORIES.length,
        },
      });
    }

    // Seed all
    // Clear existing
    await base44.entities.IndustryFamily.deleteMany({});
    await base44.entities.PlatformPack.deleteMany({});

    // Seed industry families
    const families = await base44.entities.IndustryFamily.bulkCreate(
      INDUSTRY_FAMILIES.map((f) => ({
        family_id: f.stable_id,
        name: f.name,
        sub_industries: f.sub_industries,
        urgency_score: f.urgency_score,
        lead_value: f.lead_value,
        buyer_density: f.buyer_density,
        digital_maturity: f.digital_maturity,
        recommended_platforms: f.recommended_platforms,
        visual_dna_hints: f.visual_dna_hints,
        template_genome_count: 0,
        canary_status: 'none',
        status: 'active',
      }))
    );

    // Seed platform packs
    const platforms = await base44.entities.PlatformPack.bulkCreate(
      PLATFORM_PACKS.map((p) => ({
        platform_id: p.stable_id,
        name: p.name,
        category: p.category,
        description: p.description,
        surfaces: p.surfaces,
        backend_components: p.backend_components,
        agents: p.agents,
        integrations: p.integrations,
        complexity: p.complexity,
        autonomy_potential: p.autonomy_potential,
        monetization_model: p.monetization_model,
        recommended_industries: p.recommended_industries,
        template_count: 0,
        status: 'active',
      }))
    );

    return Response.json({
      status: 'SEEDED',
      families_created: families.length,
      platforms_created: platforms.length,
      total_sub_industries: INDUSTRY_FAMILIES.reduce((sum, f) => sum + f.sub_industries.length, 0),
      categories: PLATFORM_CATEGORIES.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}