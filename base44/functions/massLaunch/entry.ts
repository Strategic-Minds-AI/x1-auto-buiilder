import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { skipTraceBusiness, benchmarkIndustry, contentSchema } from '../../shared/websiteResearch.js';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { businessWebsiteUrl, industry, businessName, locations, tone, goal, campaignName } = body;
    if (!businessWebsiteUrl || !industry || !locations || locations.length === 0) {
      return Response.json({ error: 'businessWebsiteUrl, industry and locations are required' }, { status: 400 });
    }

    // 1. Skip-trace the business once
    const businessResearch = await skipTraceBusiness(base44, businessWebsiteUrl, industry, businessName);

    // 2. Benchmark the industry once
    const benchmark = await benchmarkIndustry(base44, industry);

    // 3. Generate location-tailored original content for ALL locations in a single call
    const variantsRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
      model: 'claude-sonnet-5',
      prompt:
        `You are an elite website copywriter. Generate ORIGINAL, high-converting website content for a "${industry}" business, ` +
        `tailored for EACH of these target locations: ${locations.join(', ')}.\n\n` +
        `Business research:\n${JSON.stringify(businessResearch)}\n\n` +
        `Design guidance from benchmarking top sites:\n${JSON.stringify(benchmark.designGuidance || benchmark)}\n\n` +
        `For EACH location, produce a complete content blueprint with location-specific hero, services, about, FAQs, valueProps, process, testimonials, finalCta, logoPrompt, heroImagePrompt, metaDescription, and colorTokens. ` +
        `Each location's content must feel locally relevant — reference the city/region and local trust signals — while staying 100% original. Do NOT copy any benchmark content. ` +
        `Return JSON with a "variants" array containing exactly one entry per location, in the same order.`,
      response_json_schema: {
        type: 'object',
        properties: {
          variants: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                location: { type: 'string' },
                content: contentSchema
              },
              required: ['location', 'content']
            }
          }
        },
        required: ['variants']
      }
    });

    // 4. Create the campaign record
    const campaign = await base44.entities.LaunchCampaign.create({
      name: campaignName || `${industry} — ${locations.length} markets`,
      industry,
      business_name: (businessResearch && businessResearch.businessName) || businessName || '',
      business_website: businessWebsiteUrl,
      locations,
      tone: tone || '',
      goal: goal || '',
      status: 'running',
      sites_generated: 0,
      benchmark,
      business_research: businessResearch
    });

    // 5. Bulk-create a WebsiteProject per location
    const projectRecords = (variantsRes.variants || []).map((v) => ({
      business_name: (businessResearch && businessResearch.businessName) || businessName || '',
      business_website: businessWebsiteUrl,
      industry,
      status: 'generated',
      business_research: businessResearch,
      benchmark,
      content: v.content,
      location: v.location,
      campaign_id: campaign.id
    }));

    let created = [];
    if (projectRecords.length > 0) {
      const res = await base44.entities.WebsiteProject.bulkCreate(projectRecords);
      created = Array.isArray(res) ? res : (res.records || []);
    }

    // 6. Mark campaign complete
    await base44.entities.LaunchCampaign.update(campaign.id, {
      status: 'complete',
      sites_generated: created.length
    });

    return Response.json({
      campaign: { ...campaign, status: 'complete', sites_generated: created.length },
      projects: created
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}