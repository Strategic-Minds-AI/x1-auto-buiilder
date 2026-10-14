// Shared research logic used by generateWebsite and massLaunch.

export async function skipTraceBusiness(base44, businessWebsiteUrl, industry, businessName) {
  try {
    const fetchRes = await fetch(businessWebsiteUrl, {
      signal: AbortSignal.timeout(15000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DigitalDominanceBot/1.0)' },
      redirect: 'follow',
    });
    const html = await fetchRes.text();
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 12000);
    const businessResearch = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt:
        `Extract structured business information from this website text for a "${industry}" business. ` +
        `Source URL: ${businessWebsiteUrl}\n\nWebsite text:\n${text}\n\n` +
        `Return JSON. Use empty strings or empty arrays for anything not found. Do not invent facts.`,
      response_json_schema: {
        type: 'object',
        properties: {
          businessName: { type: 'string' },
          tagline: { type: 'string' },
          services: { type: 'array', items: { type: 'string' } },
          serviceArea: { type: 'string' },
          valueProps: { type: 'array', items: { type: 'string' } },
          phone: { type: 'string' },
          email: { type: 'string' },
          address: { type: 'string' },
          hours: { type: 'string' },
          tone: { type: 'string' },
          differentiators: { type: 'array', items: { type: 'string' } }
        },
        required: ['businessName', 'services', 'tone']
      }
    });
    if (businessName && !businessResearch.businessName) businessResearch.businessName = businessName;
    return businessResearch;
  } catch (e) {
    return {
      businessName: businessName || '',
      tagline: '', services: [], serviceArea: '', valueProps: [],
      phone: '', email: '', address: '', hours: '', tone: 'professional', differentiators: [],
      error: 'Could not fetch source website: ' + e.message
    };
  }
}

export async function benchmarkIndustry(base44, industry) {
  return await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt:
      `You are a website benchmark analyst. Identify the top 5 highest-rated, best-designed websites for the "${industry}" industry in the United States. ` +
      `For each site, describe what makes its design effective (layout patterns, color direction, typography style, hero approach, trust signals, CTA strategy) and one distinctive design element worth using as inspiration. ` +
      `Then synthesize a "designGuidance" object: recommended color palette direction, typography style, hero layout pattern, recommended section order, and trust elements that produce a high-converting site in this industry. ` +
      `Do NOT copy any site's content — describe design patterns and structural guidance only. Return JSON.`,
    add_context_from_internet: true,
    response_json_schema: {
      type: 'object',
      properties: {
        topSites: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              url: { type: 'string' },
              name: { type: 'string' },
              designNotes: { type: 'string' },
              distinctiveElement: { type: 'string' }
            },
            required: ['url', 'name', 'designNotes']
          }
        },
        designGuidance: {
          type: 'object',
          properties: {
            colorPalette: { type: 'string' },
            typography: { type: 'string' },
            heroPattern: { type: 'string' },
            sectionOrder: { type: 'array', items: { type: 'string' } },
            trustElements: { type: 'array', items: { type: 'string' } }
          },
          required: ['colorPalette', 'typography', 'heroPattern', 'sectionOrder']
        }
      },
      required: ['topSites', 'designGuidance']
    }
  });
}

export const contentSchema = {
  type: 'object',
  properties: {
    hero: {
      type: 'object',
      properties: {
        headline: { type: 'string' },
        subheadline: { type: 'string' },
        primaryCta: { type: 'string' },
        secondaryCta: { type: 'string' }
      },
      required: ['headline', 'subheadline', 'primaryCta']
    },
    services: {
      type: 'array',
      items: {
        type: 'object',
        properties: { title: { type: 'string' }, description: { type: 'string' } },
        required: ['title', 'description']
      }
    },
    about: {
      type: 'object',
      properties: { headline: { type: 'string' }, body: { type: 'string' } },
      required: ['headline', 'body']
    },
    valueProps: {
      type: 'array',
      items: {
        type: 'object',
        properties: { title: { type: 'string' }, description: { type: 'string' } },
        required: ['title', 'description']
      }
    },
    process: {
      type: 'array',
      items: {
        type: 'object',
        properties: { step: { type: 'string' }, title: { type: 'string' }, description: { type: 'string' } },
        required: ['step', 'title', 'description']
      }
    },
    faqs: {
      type: 'array',
      items: {
        type: 'object',
        properties: { question: { type: 'string' }, answer: { type: 'string' } },
        required: ['question', 'answer']
      }
    },
    testimonials: {
      type: 'array',
      items: {
        type: 'object',
        properties: { quote: { type: 'string' }, author: { type: 'string' }, role: { type: 'string' } },
        required: ['quote', 'author']
      }
    },
    finalCta: {
      type: 'object',
      properties: { headline: { type: 'string' }, button: { type: 'string' } },
      required: ['headline', 'button']
    },
    logoPrompt: { type: 'string' },
    heroImagePrompt: { type: 'string' },
    metaDescription: { type: 'string' },
    colorTokens: {
      type: 'object',
      properties: { primary: { type: 'string' }, accent: { type: 'string' }, background: { type: 'string' } },
      required: ['primary', 'accent', 'background']
    }
  },
  required: ['hero', 'services', 'about', 'logoPrompt', 'heroImagePrompt', 'colorTokens']
};