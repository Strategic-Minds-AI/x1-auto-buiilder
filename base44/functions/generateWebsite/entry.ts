import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { businessWebsiteUrl, industry, businessName } = body;
    if (!businessWebsiteUrl || !industry) {
      return Response.json({ error: 'businessWebsiteUrl and industry are required' }, { status: 400 });
    }

    // STEP 1 — Skip trace: fetch the business website and extract structured info
    let businessResearch = null;
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
      businessResearch = await base44.asServiceRole.integrations.Core.InvokeLLM({
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
      if (businessName && !businessResearch.businessName) {
        businessResearch.businessName = businessName;
      }
    } catch (e) {
      businessResearch = {
        businessName: businessName || '',
        tagline: '',
        services: [],
        serviceArea: '',
        valueProps: [],
        phone: '',
        email: '',
        address: '',
        hours: '',
        tone: 'professional',
        differentiators: [],
        error: 'Could not fetch source website: ' + e.message
      };
    }

    // STEP 2 — Benchmark: identify top 5 rated sites in the industry + design guidance
    const benchmark = await base44.asServiceRole.integrations.Core.InvokeLLM({
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

    // STEP 3 — Generate original website content inspired by the benchmark
    const content = await base44.asServiceRole.integrations.Core.InvokeLLM({
      model: 'claude-sonnet-5',
      prompt:
        `You are an elite website copywriter and content strategist. Generate ORIGINAL, high-converting website content for a "${industry}" business.\n\n` +
        `Business research (extracted from their existing site):\n${JSON.stringify(businessResearch)}\n\n` +
        `Design guidance from benchmarking top sites:\n${JSON.stringify(benchmark.designGuidance || benchmark)}\n\n` +
        `All copy must be 100% original — do not copy from any benchmark site. Write compelling, specific, people-first copy. Return JSON with a complete website content blueprint including a logoPrompt (detailed prompt for an AI image generator to create a clean modern professional logo mark, no text, describe style and colors) and a heroImagePrompt (detailed prompt for a cinematic photorealistic hero image representing this industry).`,
      response_json_schema: {
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
      }
    });

    return Response.json({ businessResearch, benchmark, content });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}