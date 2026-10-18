// Shared generation orchestration used by the user-facing functions AND gptSyncEngine.
// `scope` = 'user' (user-scoped entity writes) or 'service' (service-role writes for the sync engine).
import { skipTraceBusiness, benchmarkIndustry, contentSchema } from './websiteResearch.js';
import { ultraCoreSchema, ultraSupportSchema, buildUltraPrompt } from './ultraContentSchema.js';
import { getIndustryIntelligence } from './industryIntelligence.js';
import { GOOGLE_COMPLIANCE_PROMPT, GOOGLE_RULES, DIFFERENTIATION_LAYERS, TECHNICAL_SEO_QA } from './digitalDominationIntelligence.js';
import { buildRegistryContext, auditContentDraft, refineContentDraft, generateVisualPack } from './generationEnhancements.js';

const CONTENT_PROMPT = (industry, businessResearch, benchmark) =>
  'You are an elite website copywriter and content strategist. Generate ORIGINAL, high-converting website content for a "' + industry + '" business.\n\n' +
  'Business research (extracted from their existing site):\n' + JSON.stringify(businessResearch) + '\n\n' +
  'Design guidance from benchmarking top sites:\n' + JSON.stringify((benchmark && benchmark.designGuidance) || benchmark) + '\n\n' +
  'All copy must be 100% original — do not copy from any benchmark site. Write compelling, specific, people-first copy. Return JSON with a complete website content blueprint including a logoPrompt (detailed prompt for an AI image generator to create a clean modern professional logo mark, no text, describe style and colors) and a heroImagePrompt (detailed prompt for a cinematic photorealistic hero image representing this industry).';

const VARIANTS_SCHEMA = {
  type: 'object',
  properties: {
    variants: {
      type: 'array',
      items: {
        type: 'object',
        properties: { location: { type: 'string' }, content: contentSchema },
        required: ['location', 'content']
      }
    }
  },
  required: ['variants']
};

const RESEARCH_SCHEMA = {
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
              colorPalette: { type: 'string' }, typography: { type: 'string' },
              imagery: { type: 'string' }, tone: { type: 'string' }
            }
          },
          layout_analysis: {
            type: 'object',
            properties: {
              heroPattern: { type: 'string' }, sectionOrder: { type: 'array', items: { type: 'string' } },
              navigation: { type: 'string' }, conversionElements: { type: 'string' }, mobileApproach: { type: 'string' }
            }
          },
          seo_analysis: {
            type: 'object',
            properties: {
              titleMetaStrategy: { type: 'string' }, headingStructure: { type: 'string' },
              contentDepth: { type: 'string' }, internalLinking: { type: 'string' }, technicalSignals: { type: 'string' }
            }
          },
          aeo_analysis: {
            type: 'object',
            properties: {
              faqPresence: { type: 'string' }, schemaMarkup: { type: 'string' },
              directAnswerContent: { type: 'string' }, aiOverviewReadiness: { type: 'string' }, questionTargeting: { type: 'string' }
            }
          },
          geo_analysis: {
            type: 'object',
            properties: {
              localSeoSignals: { type: 'string' }, googleBusinessProfile: { type: 'string' },
              locationPages: { type: 'string' }, citations: { type: 'string' }, reviewStrategy: { type: 'string' }
            }
          },
          design_direction: {
            type: 'object',
            properties: { summary: { type: 'string' }, recommendedForCloning: { type: 'string' } }
          }
        },
        required: ['source_url', 'site_name', 'style_analysis', 'layout_analysis', 'seo_analysis', 'aeo_analysis', 'geo_analysis']
      }
    }
  },
  required: ['templates']
};

export async function buildWebsiteBlueprint(base44, params) {
  const { businessWebsiteUrl, industry, businessName, ultra, designContext = {} } = params;
  let businessResearch;
  if (businessWebsiteUrl && businessWebsiteUrl.trim()) {
    businessResearch = await skipTraceBusiness(base44, businessWebsiteUrl, industry, businessName);
  } else {
    businessResearch = {
      businessName: businessName || '',
      tagline: '',
      services: [],
      serviceArea: '',
      valueProps: [],
      phone: '', email: '', address: '', hours: '',
      tone: 'professional',
      differentiators: [],
      note: 'No website provided — generating from industry research'
    };
  }
  const benchmark = await benchmarkIndustry(base44, industry);
  const designDirective = [
    "BUILDER DESIGN + CONTENT REQUIREMENTS (treat as requirements, not optional inspiration):",
    JSON.stringify(designContext || {}),
    "Keep every claim grounded in provided business facts or label it as a placeholder requiring owner verification.",
    "Use industry-appropriate photography prompts and avoid generic stock-photo descriptions. The logoPrompt and heroImagePrompt must reflect the selected industry, audience, chosen palette, and selected template.",
    "Optimize page copy for SEO, AEO, and GEO: clear entity/service/location context where provided, concise answer-first FAQs, descriptive headings, natural internal-link opportunities, and useful local signals. Do not fabricate reviews, awards, licenses, statistics, addresses, or service areas."
  ].join("\\n");

  // Ultra-premium path: use industry intelligence + 14-section schema + enhanced prompt
  if (ultra !== false) {
    const intelligence = getIndustryIntelligence(industry);
    const registryContext = buildRegistryContext(industry);
    const ultraPrompt = buildUltraPrompt(industry, businessResearch, benchmark, intelligence) + registryContext + designDirective + GOOGLE_COMPLIANCE_PROMPT;
    // Pass 1: Generate core + support sections in parallel
    const [coreRes, supportRes] = await Promise.all([
      base44.asServiceRole.integrations.Core.InvokeLLM({
        model: 'claude-sonnet-5',
        prompt: ultraPrompt + '\n\nGenerate the CORE sections: hero, trustBadges, services, whyChooseUs, process, stats, testimonials, faqs, and ctaBand.',
        response_json_schema: ultraCoreSchema
      }),
      base44.asServiceRole.integrations.Core.InvokeLLM({
        model: 'claude-sonnet-5',
        prompt: ultraPrompt + '\n\nGenerate the SUPPORTING sections: pricing, serviceAreas, contactForm, footer, logoPrompt, heroImagePrompt, metaDescription, and colorTokens.',
        response_json_schema: ultraSupportSchema
      }),
    ]);
    const draftContent = { ...coreRes, ...supportRes };

    // Pass 2: Audit — check the draft for specific quality errors before refining
    let auditIssues = [];
    try {
      auditIssues = await auditContentDraft(base44, draftContent, industry, businessResearch);
    } catch { /* if audit fails, refinement still runs without targeted issues */ }

    // Pass 3: Refinement — fix the audited issues + polish specificity, enforce SEO compliance
    let content = draftContent;
    try {
      content = await refineContentDraft(base44, draftContent, industry, businessResearch, benchmark, auditIssues);
    } catch { /* fall back to draft if refinement fails */ }

    // Pass 4: Generate a machine-testable VisualPack design token contract
    let visualPack = null;
    try {
      visualPack = await generateVisualPack(base44, content, industry);
    } catch { /* visual pack is optional enhancement */ }

    return {
      businessResearch,
      benchmark,
      content,
      visualPack,
      ultra: true,
      passes: ['core+support', 'audit', 'refinement', 'visualpack'],
      auditIssues,
      auditIssueCount: auditIssues.length,
      intelligence: intelligence ? { hasIntelligence: true, industry: intelligence.designDirection?.tone || '' } : { hasIntelligence: false },
      registryMatched: !!registryContext,
    };
  }

  // Legacy path (basic content schema)
  const content = await base44.asServiceRole.integrations.Core.InvokeLLM({
    model: 'claude-sonnet-5',
    prompt: CONTENT_PROMPT(industry, businessResearch, benchmark) + '\\n\\n' + designDirective,
    response_json_schema: contentSchema
  });
  return { businessResearch, benchmark, content };
}

export async function runMassLaunch(base44, params, scope) {
  scope = scope || 'user';
  const { businessWebsiteUrl, industry, businessName, locations, tone, goal, campaignName } = params;
  const entities = scope === 'service' ? base44.asServiceRole.entities : base44.entities;
  const businessResearch = await skipTraceBusiness(base44, businessWebsiteUrl, industry, businessName);
  const benchmark = await benchmarkIndustry(base44, industry);
  const variantsRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
    model: 'claude-sonnet-5',
    prompt:
      'You are an elite website copywriter. Generate ORIGINAL, high-converting website content for a "' + industry + '" business, tailored for EACH of these target locations: ' + (locations || []).join(', ') + '.\n\n' +
      'Business research:\n' + JSON.stringify(businessResearch) + '\n\n' +
      'Design guidance from benchmarking top sites:\n' + JSON.stringify((benchmark && benchmark.designGuidance) || benchmark) + '\n\n' +
      'For EACH location, produce a complete content blueprint with location-specific hero, services, about, FAQs, valueProps, process, testimonials, finalCta, logoPrompt, heroImagePrompt, metaDescription, and colorTokens. ' +
      'Each location\'s content must feel locally relevant — reference the city/region and local trust signals — while staying 100% original. Do NOT copy any benchmark content. ' +
      GOOGLE_COMPLIANCE_PROMPT +
      'Return JSON with a "variants" array containing exactly one entry per location, in the same order.',
    response_json_schema: VARIANTS_SCHEMA
  });

  const campaign = await entities.LaunchCampaign.create({
    name: campaignName || (industry + ' — ' + (locations || []).length + ' markets'),
    industry: industry,
    business_name: (businessResearch && businessResearch.businessName) || businessName || '',
    business_website: businessWebsiteUrl,
    locations: locations || [],
    tone: tone || '',
    goal: goal || '',
    status: 'running',
    sites_generated: 0,
    benchmark: benchmark,
    business_research: businessResearch
  });

  const projectRecords = (variantsRes.variants || []).map(function (v) {
    return {
      business_name: (businessResearch && businessResearch.businessName) || businessName || '',
      business_website: businessWebsiteUrl,
      industry: industry,
      status: 'generated',
      business_research: businessResearch,
      benchmark: benchmark,
      content: v.content,
      location: v.location,
      campaign_id: campaign.id
    };
  });

  let created = [];
  if (projectRecords.length > 0) {
    const res = await entities.WebsiteProject.bulkCreate(projectRecords);
    created = Array.isArray(res) ? res : (res.records || []);
  }

  await entities.LaunchCampaign.update(campaign.id, {
    status: 'complete',
    sites_generated: created.length
  });

  return { campaign: Object.assign({}, campaign, { status: 'complete', sites_generated: created.length }), projects: created };
}

export async function generateBrandAssets(base44, params) {
  const { logoPrompt, heroImagePrompt } = params;
  const results = await Promise.allSettled([
    base44.asServiceRole.integrations.Core.GenerateImage({ prompt: logoPrompt }),
    base44.asServiceRole.integrations.Core.GenerateImage({ prompt: heroImagePrompt })
  ]);
  const logoRes = results[0];
  const heroRes = results[1];
  return {
    logoUrl: logoRes.status === 'fulfilled' ? logoRes.value.url : null,
    heroImageUrl: heroRes.status === 'fulfilled' ? heroRes.value.url : null,
    logoError: logoRes.status === 'rejected' ? String((logoRes.reason && logoRes.reason.message) || logoRes.reason) : null,
    heroError: heroRes.status === 'rejected' ? String((heroRes.reason && heroRes.reason.message) || heroRes.reason) : null
  };
}

export async function researchTemplates(base44, industry, scope) {
  scope = scope || 'user';
  const entities = scope === 'service' ? base44.asServiceRole.entities : base44.entities;
  const analysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt:
      'You are an expert web analyst specializing in the "' + industry + '" industry. Find the top 5 highest-rated, best-performing websites for this industry in the United States. For EACH site perform a deep, specific analysis:\n\n' +
      'STYLE: color palette direction (with 2-3 estimated hex values), typography style, imagery direction, visual tone.\n' +
      'LAYOUT: hero pattern (split/centered/video/etc), section order (array), navigation structure, key conversion elements, mobile approach.\n' +
      'SEO: title/meta strategy, heading structure, content depth approach, internal linking, technical signals.\n' +
      'AEO (Answer Engine Optimization): FAQ presence, schema/structured data, direct-answer content, AI overview readiness, question targeting.\n' +
      'GEO (local/generative): local SEO signals, Google Business profile signals, location pages, citations, review strategy.\n\n' +
      'Give each site an overall_score from 0-100 reflecting design + SEO + AEO + GEO strength. Provide design_direction.summary (how to use this site as design inspiration) and design_direction.recommendedForCloning (which structural patterns to adopt). Do NOT copy any content — analyze patterns and structure only. Return JSON with a "templates" array of 5 site analyses.',
    add_context_from_internet: true,
    response_json_schema: RESEARCH_SCHEMA
  });

  const records = (analysis.templates || []).map(function (t, i) {
    return {
      industry: industry,
      source_url: t.source_url,
      site_name: t.site_name,
      rank: t.rank || (i + 1),
      overall_score: t.overall_score || 0,
      style_analysis: t.style_analysis || {},
      layout_analysis: t.layout_analysis || {},
      seo_analysis: t.seo_analysis || {},
      aeo_analysis: t.aeo_analysis || {},
      geo_analysis: t.geo_analysis || {},
      design_direction: t.design_direction || { summary: '', recommendedForCloning: '' }
    };
  });

  let saved = [];
  if (records.length > 0) {
    const res = await entities.Template.upsert(records, { key: 'source_url' });
    saved = res.records || records;
  }
  return { industry: industry, templates: saved };
}

export async function instantiateFromTemplate(base44, params) {
  const { template, variables } = params;
  const content = await base44.asServiceRole.integrations.Core.InvokeLLM({
    model: 'claude-sonnet-5',
    prompt:
      'You are an elite website copywriter. A reusable industry template for "' + (template.industry || '') + '" contains placeholder variables. ' +
      'Fill every placeholder with the provided business details and adapt ALL copy to be specific, compelling, and locally relevant to this exact business and location. ' +
      'Do NOT leave any placeholder unresolved. Keep the template structure, tone, and section order intact, but make the copy feel bespoke — never generic or filler. ' +
      'Generate a fresh logoPrompt tailored to this specific business (clean modern professional logo mark, no text, describe style and colors fitting the brand), ' +
      'a fresh heroImagePrompt (cinematic photorealistic image representing this business in its location), ' +
      'and choose accent colorTokens (primary, accent, background as hex values) appropriate to this brand. ' +
      'Return a complete content blueprint matching the template structure.\n\n' +
      'Template content:\n' + JSON.stringify(template.template) + '\n\n' +
      'Business details to fill in (keys are the placeholders):\n' + JSON.stringify(variables) + '\n\n' +
      'Industry: ' + (template.industry || ''),
    response_json_schema: contentSchema
  });

  const norm = {};
  Object.keys(variables || {}).forEach(function (k) { norm[k.replace(/[{}]/g, '')] = variables[k]; });
  const businessResearch = {
    businessName: norm.business_name || norm.businessName || '',
    tagline: norm.tagline || '',
    phone: norm.phone || '',
    email: norm.email || '',
    address: norm.address || '',
    serviceArea: norm.location || norm.service_area || norm.serviceArea || '',
    services: (content.services || []).map(function (s) { return s.title; }),
    tone: 'professional'
  };

  const assets = await generateBrandAssets(base44, { logoPrompt: content.logoPrompt, heroImagePrompt: content.heroImagePrompt });

  return {
    businessResearch: businessResearch,
    content: content,
    logoUrl: assets.logoUrl,
    heroImageUrl: assets.heroImageUrl,
    logoError: assets.logoError,
    heroError: assets.heroError
  };
}