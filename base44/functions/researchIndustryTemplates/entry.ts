import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { industry } = body;
    if (!industry) return Response.json({ error: 'industry is required' }, { status: 400 });

    // Deep analysis of the top 5 rated sites in the industry across style/layout/SEO/AEO/GEO
    const analysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt:
        `You are an expert web analyst specializing in the "${industry}" industry. ` +
        `Find the top 5 highest-rated, best-performing websites for this industry in the United States. ` +
        `For EACH site perform a deep, specific analysis:\n\n` +
        `STYLE: color palette direction (with 2-3 estimated hex values), typography style, imagery direction, visual tone.\n` +
        `LAYOUT: hero pattern (split/centered/video/etc), section order (array), navigation structure, key conversion elements, mobile approach.\n` +
        `SEO: title/meta strategy, heading structure, content depth approach, internal linking, technical signals.\n` +
        `AEO (Answer Engine Optimization): FAQ presence, schema/structured data, direct-answer content, AI overview readiness, question targeting.\n` +
        `GEO (local/generative): local SEO signals, Google Business profile signals, location pages, citations, review strategy.\n\n` +
        `Give each site an overall_score from 0-100 reflecting design + SEO + AEO + GEO strength. ` +
        `Provide design_direction.summary (how to use this site as design inspiration) and design_direction.recommendedForCloning (which structural patterns to adopt). ` +
        `Do NOT copy any content — analyze patterns and structure only. Return JSON with a "templates" array of 5 site analyses.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          templates: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                source_url: { type: 'string' },
                site_name: { type: 'string' },
                rank: { type: 'number' },
                overall_score: { type: 'number' },
                style_analysis: {
                  type: 'object',
                  properties: {
                    colorPalette: { type: 'string' },
                    typography: { type: 'string' },
                    imagery: { type: 'string' },
                    tone: { type: 'string' }
                  }
                },
                layout_analysis: {
                  type: 'object',
                  properties: {
                    heroPattern: { type: 'string' },
                    sectionOrder: { type: 'array', items: { type: 'string' } },
                    navigation: { type: 'string' },
                    conversionElements: { type: 'string' },
                    mobileApproach: { type: 'string' }
                  }
                },
                seo_analysis: {
                  type: 'object',
                  properties: {
                    titleMetaStrategy: { type: 'string' },
                    headingStructure: { type: 'string' },
                    contentDepth: { type: 'string' },
                    internalLinking: { type: 'string' },
                    technicalSignals: { type: 'string' }
                  }
                },
                aeo_analysis: {
                  type: 'object',
                  properties: {
                    faqPresence: { type: 'string' },
                    schemaMarkup: { type: 'string' },
                    directAnswerContent: { type: 'string' },
                    aiOverviewReadiness: { type: 'string' },
                    questionTargeting: { type: 'string' }
                  }
                },
                geo_analysis: {
                  type: 'object',
                  properties: {
                    localSeoSignals: { type: 'string' },
                    googleBusinessProfile: { type: 'string' },
                    locationPages: { type: 'string' },
                    citations: { type: 'string' },
                    reviewStrategy: { type: 'string' }
                  }
                },
                design_direction: {
                  type: 'object',
                  properties: {
                    summary: { type: 'string' },
                    recommendedForCloning: { type: 'string' }
                  }
                }
              },
              required: ['source_url', 'site_name', 'style_analysis', 'layout_analysis', 'seo_analysis', 'aeo_analysis', 'geo_analysis']
            }
          }
        },
        required: ['templates']
      }
    });

    const records = (analysis.templates || []).map((t, i) => ({
      industry,
      source_url: t.source_url,
      site_name: t.site_name,
      rank: t.rank || i + 1,
      overall_score: t.overall_score || 0,
      style_analysis: t.style_analysis || {},
      layout_analysis: t.layout_analysis || {},
      seo_analysis: t.seo_analysis || {},
      aeo_analysis: t.aeo_analysis || {},
      geo_analysis: t.geo_analysis || {},
      design_direction: t.design_direction || { summary: '', recommendedForCloning: '' }
    }));

    let saved = [];
    if (records.length > 0) {
      const res = await base44.entities.Template.upsert(records, { key: 'source_url' });
      saved = res.records || records;
    }

    return Response.json({ industry, templates: saved });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}