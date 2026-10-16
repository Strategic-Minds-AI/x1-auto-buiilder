// ═══════════════════════════════════════════════════════════════
// ULTRA PREMIUM CONTENT SCHEMA (Simplified for LLM grammar limits)
// Split into two schemas to stay within compiler limits while
// still defining all 14 sections with deep content.
// ═══════════════════════════════════════════════════════════════

// Schema 1: Core content sections (hero, services, value props, process, stats, testimonials, FAQs, CTA)
export const ultraCoreSchema = {
  type: 'object',
  properties: {
    hero: {
      type: 'object',
      properties: {
        eyebrow: { type: 'string' },
        headline: { type: 'string' },
        subheadline: { type: 'string' },
        primaryCta: { type: 'string' },
        secondaryCta: { type: 'string' },
        trustBadge: { type: 'string' },
      },
      required: ['eyebrow', 'headline', 'subheadline', 'primaryCta', 'secondaryCta', 'trustBadge'],
    },
    trustBadges: { type: 'array', items: { type: 'string' } },
    services: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          icon: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          benefit: { type: 'string' },
        },
        required: ['icon', 'title', 'description', 'benefit'],
      },
    },
    whyChooseUs: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          icon: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
        },
        required: ['icon', 'title', 'description'],
      },
    },
    process: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          step: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
        },
        required: ['step', 'title', 'description'],
      },
    },
    stats: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          number: { type: 'string' },
          label: { type: 'string' },
        },
        required: ['number', 'label'],
      },
    },
    testimonials: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          quote: { type: 'string' },
          author: { type: 'string' },
          role: { type: 'string' },
          rating: { type: 'number' },
        },
        required: ['quote', 'author', 'role', 'rating'],
      },
    },
    faqs: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          question: { type: 'string' },
          answer: { type: 'string' },
        },
        required: ['question', 'answer'],
      },
    },
    ctaBand: {
      type: 'object',
      properties: {
        headline: { type: 'string' },
        subheadline: { type: 'string' },
        button: { type: 'string' },
      },
      required: ['headline', 'subheadline', 'button'],
    },
  },
  required: ['hero', 'trustBadges', 'services', 'whyChooseUs', 'process', 'stats', 'testimonials', 'faqs', 'ctaBand'],
};

// Schema 2: Supporting sections (pricing, service areas, contact, footer, brand assets)
export const ultraSupportSchema = {
  type: 'object',
  properties: {
    pricing: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          price: { type: 'string' },
          description: { type: 'string' },
          features: { type: 'array', items: { type: 'string' } },
          popular: { type: 'boolean' },
        },
        required: ['name', 'price', 'description', 'features', 'popular'],
      },
    },
    serviceAreas: {
      type: 'object',
      properties: {
        headline: { type: 'string' },
        areas: { type: 'array', items: { type: 'string' } },
      },
      required: ['headline', 'areas'],
    },
    contactForm: {
      type: 'object',
      properties: {
        headline: { type: 'string' },
        subheadline: { type: 'string' },
        submitButton: { type: 'string' },
        successMessage: { type: 'string' },
      },
      required: ['headline', 'submitButton'],
    },
    footer: {
      type: 'object',
      properties: {
        about: { type: 'string' },
        columns: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              links: { type: 'array', items: { type: 'string' } },
            },
            required: ['title', 'links'],
          },
        },
      },
      required: ['about', 'columns'],
    },
    logoPrompt: { type: 'string' },
    heroImagePrompt: { type: 'string' },
    metaDescription: { type: 'string' },
    colorTokens: {
      type: 'object',
      properties: {
        primary: { type: 'string' },
        accent: { type: 'string' },
        background: { type: 'string' },
      },
      required: ['primary', 'accent', 'background'],
    },
  },
  required: ['pricing', 'serviceAreas', 'contactForm', 'footer', 'logoPrompt', 'heroImagePrompt', 'colorTokens'],
};

// The ultra-premium generation prompt builder
export function buildUltraPrompt(industry, businessResearch, benchmark, intelligence) {
  const intel = intelligence || {};
  const services = (intel.coreServices || []).map(s => s.title).join(', ');
  const painPoints = (intel.painPoints || []).join('; ');
  const trustSignals = (intel.trustSignals || []).join(', ');
  const differentiators = (intel.differentiators || []).join('; ');
  const faqPatterns = (intel.faqPatterns || []).join('; ');
  const testimonialAngles = (intel.testimonialAngles || []).join('; ');
  const valueProps = (intel.valueProps || []).map(v => `${v.title}: ${v.description}`).join('; ');
  const processSteps = (intel.processSteps || []).map(p => `${p.step}. ${p.title}: ${p.description}`).join('; ');
  const stats = (intel.stats || []).map(s => `${s.number} ${s.label}`).join(', ');
  const keywords = (intel.keywords || []).join(', ');
  const designDirection = intel.designDirection || {};
  const conversionElements = (intel.conversionElements || []).join(', ');
  const trustBadges = (intel.trustBadges || []).join(', ');

  return `You are an elite website copywriter and content strategist working for a multi-million-dollar AI software agency. Your task is to generate ULTRA-PREMIUM, production-ready website content for a "${industry}" business.

QUALITY BAR: This content must look like it was created by a top-tier digital agency charging $10,000+ per website. Every section must be deep, specific, benefit-driven, and industry-specific. Generic copy is REJECTED.

INDUSTRY INTELLIGENCE (use this to make content specific, not generic):
- Core Services: ${services}
- Customer Pain Points: ${painPoints}
- Trust Signals: ${trustSignals}
- Key Differentiators: ${differentiators}
- FAQ Patterns: ${faqPatterns}
- Testimonial Angles: ${testimonialAngles}
- Value Propositions: ${valueProps}
- Process Steps: ${processSteps}
- Impressive Stats: ${stats}
- High-Intent Keywords: ${keywords}
- Design Direction: ${JSON.stringify(designDirection)}
- Conversion Elements: ${conversionElements}
- Trust Badges: ${trustBadges}

BUSINESS RESEARCH (from skip-tracing their existing site):
${JSON.stringify(businessResearch)}

DESIGN GUIDANCE (from benchmarking top sites):
${JSON.stringify((benchmark && benchmark.designGuidance) || benchmark)}

CONTENT GENERATION RULES:
1. EVERY section must use industry-specific terminology and address industry-specific pain points
2. Services must have benefit statements (what the customer gets), not just descriptions (what you do)
3. Testimonials must address specific pain points and outcomes, with real-sounding names and roles
4. FAQs must be questions customers actually ask in this industry, with thorough 2-3 sentence answers
5. Stats must use specific numbers (e.g. "15+" not "many"), believable and impressive
6. Value props must be specific and provable, not generic ("Upfront flat-rate pricing" not "Great service")
7. Process steps must reduce customer anxiety and build confidence
8. The hero must be benefit-driven and emotionally compelling
9. The CTA band must create urgency without being pushy
10. All copy must be 100% original — do not copy from benchmark sites

Generate a COMPLETE content blueprint following the JSON schema exactly. Every required field must be filled with premium-quality, industry-specific content.`;
}