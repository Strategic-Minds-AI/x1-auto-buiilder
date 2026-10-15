import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const masterProjectId = body.masterProjectId;
    const locations = body.locations;
    const campaignName = body.campaignName;

    if (!masterProjectId) return Response.json({ error: 'masterProjectId is required' }, { status: 400 });
    if (!locations || !Array.isArray(locations) || locations.length === 0) {
      return Response.json({ error: 'locations array is required' }, { status: 400 });
    }

    const master = await base44.entities.WebsiteProject.get(masterProjectId);
    if (!master) return Response.json({ error: 'Master project not found' }, { status: 404 });
    if (!master.content) return Response.json({ error: 'Master project has no content' }, { status: 400 });

    // Generate location-tailored variants from the master content
    const variantsRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
      model: 'claude-sonnet-5',
      prompt:
        'You are an elite website copywriter. A master website content blueprint has been created and approved through the Auto Builder. ' +
        'Generate location-tailored variants for EACH of these target locations: ' + locations.join(', ') + '.\n\n' +
        'MASTER CONTENT:\n' + JSON.stringify(master.content) + '\n\n' +
        'BUSINESS: ' + (master.business_name || '') + '\n' +
        'INDUSTRY: ' + (master.industry || '') + '\n' +
        'BUSINESS RESEARCH:\n' + JSON.stringify(master.business_research || {}) + '\n\n' +
        'For EACH location, adapt the master content to be locally relevant. ' +
        'Reference the city/region in the hero headline, subheadline, about section, FAQs, and final CTA. ' +
        'Add location-specific trust signals, local landmarks, and community references where natural. ' +
        'Keep the same structure, tone, services, and design direction as the master. ' +
        'Make each variant feel bespoke to its location while staying 100% original. ' +
        'Return JSON with a "variants" array containing exactly one entry per location, in the same order as the locations list.',
      response_json_schema: {
        type: 'object',
        properties: {
          variants: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                location: { type: 'string' },
                content: {
                  type: 'object',
                  properties: {
                    hero: { type: 'object' },
                    services: { type: 'array' },
                    valueProps: { type: 'array' },
                    about: { type: 'object' },
                    process: { type: 'array' },
                    testimonials: { type: 'array' },
                    faqs: { type: 'array' },
                    finalCta: { type: 'object' },
                    logoPrompt: { type: 'string' },
                    heroImagePrompt: { type: 'string' },
                    metaDescription: { type: 'string' },
                    colorTokens: { type: 'object' }
                  }
                }
              },
              required: ['location', 'content']
            }
          }
        },
        required: ['variants']
      }
    });

    // Create campaign
    const campaign = await base44.entities.LaunchCampaign.create({
      name: campaignName || ((master.business_name || master.industry || 'Site') + ' — ' + locations.length + ' markets'),
      industry: master.industry || '',
      business_name: master.business_name || '',
      business_website: master.business_website || '',
      locations: locations,
      status: 'running',
      sites_generated: 0,
      benchmark: master.benchmark,
      business_research: master.business_research
    });

    // Create project records for each location variant
    const projectRecords = (variantsRes.variants || []).map(function(v) {
      return {
        business_name: master.business_name || '',
        business_website: master.business_website || '',
        industry: master.industry || '',
        status: 'generated',
        business_research: master.business_research,
        benchmark: master.benchmark,
        content: v.content,
        location: v.location,
        campaign_id: campaign.id,
        logo_url: master.logo_url || '',
        hero_image_url: master.hero_image_url || ''
      };
    });

    let created = [];
    if (projectRecords.length > 0) {
      const res = await base44.entities.WebsiteProject.bulkCreate(projectRecords);
      created = Array.isArray(res) ? res : (res.records || []);
    }

    await base44.entities.LaunchCampaign.update(campaign.id, {
      status: 'complete',
      sites_generated: created.length
    });

    return Response.json({
      campaign: Object.assign({}, campaign, { status: 'complete', sites_generated: created.length }),
      projects: created
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}