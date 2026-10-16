// Generation quality enhancements:
// 1. Industry registry injection — pulls visual DNA + platform context from the canonical registry
// 2. Multi-pass refinement — a third LLM pass that polishes the combined draft
// 3. VisualPack contract generation — produces a machine-testable design token contract
import { INDUSTRY_FAMILIES, getFamilyById } from './industryRegistry.js';
import { HERO_ARCHETYPES } from './visualPackContract.js';

// ── 1. INDUSTRY REGISTRY MATCHING ───────────────────────────────────
// Matches a free-text industry string to the canonical registry family
// and returns visual DNA + platform context to inject into the generation prompt.
export function matchIndustryFamily(industry) {
  if (!industry) return null;
  const lower = industry.toLowerCase().trim();

  // Direct sub-industry match
  for (const fam of INDUSTRY_FAMILIES) {
    for (const sub of (fam.sub_industries || [])) {
      if (sub === lower || sub.replace(/-/g, ' ') === lower || sub.replace(/-/g, '') === lower.replace(/ /g, '')) {
        return fam;
      }
    }
  }

  // Family name match
  for (const fam of INDUSTRY_FAMILIES) {
    const famName = fam.name.toLowerCase();
    if (famName.includes(lower) || lower.includes(famName.split(' ')[0])) {
      return fam;
    }
  }

  // Keyword match against sub-industries
  for (const fam of INDUSTRY_FAMILIES) {
    for (const sub of (fam.sub_industries || [])) {
      if (lower.includes(sub.replace(/-/g, ' ')) || sub.replace(/-/g, ' ').includes(lower)) {
        return fam;
      }
    }
  }

  return null;
}

// Builds the registry context block to append to the ultra prompt
export function buildRegistryContext(industry) {
  const fam = matchIndustryFamily(industry);
  if (!fam) return '';

  const hints = fam.visual_dna_hints || {};
  const heroArchetype = HERO_ARCHETYPES.find(h => h.id === hints.hero_archetype);

  return `

INDUSTRY REGISTRY CONTEXT (canonical classification):
- Family: ${fam.name} (${fam.stable_id})
- Lead Value: ${fam.lead_value} | Urgency: ${fam.urgency_score}/5 | Buyer Density: ${fam.buyer_density}/5 | Digital Maturity: ${fam.digital_maturity}/5
- Recommended Platforms: ${(fam.recommended_platforms || []).join(', ')}
- Visual DNA: energy=${hints.energy || 'confident'}, palette=${hints.palette_tendency || 'balanced'}, trust=${hints.trust_architecture || 'standard'}, conversion=${hints.conversion_pattern || 'cta-primary'}
${heroArchetype ? `- Hero Archetype: ${heroArchetype.name} — ${heroArchetype.composition} (focal hierarchy: ${heroArchetype.focal_hierarchy})` : ''}

Use this registry context to choose the right hero composition, trust architecture, and conversion pattern. Match the visual energy and palette tendency to the industry family.`;
}

// ── 2. MULTI-PASS REFINEMENT ───────────────────────────────────────
// Takes the combined core + support content and runs a refinement pass
// that polishes specificity, removes generic copy, and enforces SEO compliance.
export async function refineContentDraft(base44, content, industry, businessResearch, benchmark) {
  const refinementPrompt = `You are an elite content editor at a top-tier digital agency. You are reviewing a DRAFT website content blueprint for a "${industry}" business. Your job is to REFINE and ELEVATE it to ultra-premium quality.

DRAFT CONTENT:
${JSON.stringify(content, null, 2)}

BUSINESS RESEARCH:
${JSON.stringify(businessResearch)}

REFINEMENT RULES:
1. Replace any generic copy with industry-specific, specific copy. "Great service" → "Same-day AC repair with upfront flat-rate pricing."
2. Ensure every service has a benefit statement (what the customer gets), not just a description (what you do).
3. Make testimonials address specific pain points and outcomes with real-sounding names.
4. Ensure FAQs are questions customers actually ask in this industry, with thorough 2-3 sentence answers.
5. Stats must use specific numbers (e.g. "15+" not "many").
6. The hero headline must be benefit-driven and emotionally compelling, not generic.
7. The CTA band must create urgency without being pushy.
8. Ensure the metaDescription is 150-160 characters and includes the primary keyword.
9. Remove any duplicate or redundant content.
10. Ensure all copy is 100% original and people-first (Google E-E-A-T compliant).

Return the REFINED content as the same JSON structure. Every field must be improved or kept at its current high quality. Do not remove any sections.`;

  const refined = await base44.asServiceRole.integrations.Core.InvokeLLM({
    model: 'claude-sonnet-5',
    prompt: refinementPrompt,
    response_json_schema: {
      type: 'object',
      properties: {
        hero: { type: 'object' },
        trustBadges: { type: 'array', items: { type: 'string' } },
        services: { type: 'array', items: { type: 'object' } },
        whyChooseUs: { type: 'array', items: { type: 'object' } },
        process: { type: 'array', items: { type: 'object' } },
        stats: { type: 'array', items: { type: 'object' } },
        testimonials: { type: 'array', items: { type: 'object' } },
        faqs: { type: 'array', items: { type: 'object' } },
        ctaBand: { type: 'object' },
        pricing: { type: 'array', items: { type: 'object' } },
        serviceAreas: { type: 'object' },
        contactForm: { type: 'object' },
        footer: { type: 'object' },
        logoPrompt: { type: 'string' },
        heroImagePrompt: { type: 'string' },
        metaDescription: { type: 'string' },
        colorTokens: { type: 'object' },
      },
    },
  });

  // Merge: prefer refined values, fall back to original for any missing fields
  return { ...content, ...refined };
}

// ── 3. VISUALPACK CONTRACT GENERATION ─────────────────────────────
// Generates a full machine-testable VisualPack design token contract
// from the content's colorTokens + the industry's visual DNA.
export async function generateVisualPack(base44, content, industry) {
  const fam = matchIndustryFamily(industry);
  const hints = fam?.visual_dna_hints || {};
  const colors = content?.colorTokens || {};

  const vpPrompt = `You are an elite design systems architect. Generate a complete, machine-testable VisualPack design token contract for a "${industry}" website.

BRAND COLORS (from content generation):
${JSON.stringify(colors)}

INDUSTRY VISUAL DNA:
energy=${hints.energy || 'confident'}, palette=${hints.palette_tendency || 'balanced'}

Generate a full VisualPack with every token specified as concrete values (not adjectives):
- Typography: font families (heading, body, mono), font weights, fluid font scale (min/max size, viewport, ratio), line heights, letter spacing
- Colors: primary, secondary, accent, background, surface, surface_elevated, text, text_muted, border, success, warning, error (all as hex)
- Spacing: scale array, container widths, grid, breakpoints
- Radii: none, sm, md, lg, xl, full
- Shadows: none, sm, md, lg, xl, inner (CSS box-shadow values)
- Motion: durations (instant, fast, normal, slow, deliberate), easings (standard, emphasized, decelerated, accelerated)
- Accessibility: contrast ratios (text_normal >= 4.5, text_large >= 3, ui_components >= 3), focus_visible, touch_targets >= 44

Every value must be concrete and testable. No adjectives. Return JSON.`;

  const visualPack = await base44.asServiceRole.integrations.Core.InvokeLLM({
    model: 'claude-sonnet-5',
    prompt: vpPrompt,
    response_json_schema: {
      type: 'object',
      properties: {
        stable_id: { type: 'string' },
        version: { type: 'string' },
        name: { type: 'string' },
        typography: {
          type: 'object',
          properties: {
            font_family_heading: { type: 'string' },
            font_family_body: { type: 'string' },
            font_weights: { type: 'array', items: { type: 'number' } },
            fluid_font_scale: {
              type: 'object',
              properties: {
                min_size: { type: 'number' },
                max_size: { type: 'number' },
                min_viewport: { type: 'number' },
                max_viewport: { type: 'number' },
                ratio: { type: 'number' },
              },
            },
            line_heights: {
              type: 'object',
              properties: { tight: { type: 'number' }, normal: { type: 'number' }, relaxed: { type: 'number' } },
            },
          },
        },
        colors: {
          type: 'object',
          properties: {
            primary: { type: 'string' },
            secondary: { type: 'string' },
            accent: { type: 'string' },
            background: { type: 'string' },
            surface: { type: 'string' },
            text: { type: 'string' },
            text_muted: { type: 'string' },
            border: { type: 'string' },
            success: { type: 'string' },
            warning: { type: 'string' },
            error: { type: 'string' },
          },
        },
        spacing: {
          type: 'object',
          properties: {
            scale: { type: 'array', items: { type: 'number' } },
            container_max: { type: 'number' },
            breakpoints: {
              type: 'object',
              properties: { sm: { type: 'number' }, md: { type: 'number' }, lg: { type: 'number' }, xl: { type: 'number' } },
            },
          },
        },
        radii: {
          type: 'object',
          properties: { sm: { type: 'string' }, md: { type: 'string' }, lg: { type: 'string' }, xl: { type: 'string' }, full: { type: 'string' } },
        },
        shadows: {
          type: 'object',
          properties: { sm: { type: 'string' }, md: { type: 'string' }, lg: { type: 'string' }, xl: { type: 'string' } },
        },
        motion: {
          type: 'object',
          properties: {
            duration: {
              type: 'object',
              properties: { fast: { type: 'string' }, normal: { type: 'string' }, slow: { type: 'string' } },
            },
            easing: {
              type: 'object',
              properties: { standard: { type: 'string' }, emphasized: { type: 'string' } },
            },
          },
        },
        accessibility: {
          type: 'object',
          properties: {
            contrast_text_normal: { type: 'number' },
            contrast_text_large: { type: 'number' },
            focus_visible: { type: 'boolean' },
            touch_target_min: { type: 'number' },
          },
        },
      },
    },
  });

  return {
    ...visualPack,
    industry_family: fam?.stable_id || 'unclassified',
    validation_status: 'pending',
  };
}