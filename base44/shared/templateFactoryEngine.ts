// Autonomous Template Factory Engine
// Discovers, benchmarks, reverse-engineers, architects, and engineers
// world-class universal templates from the best systems in any industry.

import {
  createSession,
  navigateTo,
  takeScreenshot,
  closeSession,
  healthCheck,
} from "./cloudBrowserEngine.ts";

// ─── Phase 1: DISCOVERY ──────────────────────────────────────────────
// Uses LLM with web search to find the top 10 highest-quality sites in an industry.

export async function discoverTopSites(base44, industry, subindustry) {
  const target = subindustry ? `${industry} — ${subindustry}` : industry;

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `You are a strategic web design researcher. Search the web and find the TOP 10 highest-quality, most successful websites and digital systems in the "${target}" industry.

For each site provide:
1. url — the full, real, working URL you found from web search
2. title — the site or business name
3. description — 1-2 sentences on why it is top-tier
4. rank — 1 (best) to 10

Prioritise:
- Award-winning designs (Awwwards, CSS Design Awards, Webby)
- Industry leaders with exceptional conversion and branding
- Sites with outstanding UX/UI, modern aesthetics, strong messaging
- Sites that represent the gold standard for this industry

Return structured JSON.`,
    add_context_from_internet: true,
    model: "gemini_3_8_flash",
    response_json_schema: {
      type: "object",
      properties: {
        sites: {
          type: "array",
          items: {
            type: "object",
            properties: {
              url: { type: "string" },
              title: { type: "string" },
              description: { type: "string" },
              rank: { type: "number" },
            },
          },
        },
      },
    },
  });

  return result.sites || [];
}

// ─── Phase 2: BENCHMARK ──────────────────────────────────────────────
// Uses LLM with web search to score each discovered site across 5 dimensions.

export async function benchmarkSites(base44, sites) {
  const sitesText = sites
    .map((s, i) => `${i + 1}. ${s.url} — ${s.title}: ${s.description}`)
    .join("\n");

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `You are an expert web design benchmark analyst. Search the web and analyse each of these top ${sites.length} websites. Score each across 5 dimensions (0-100):

${sitesText}

For each site provide:
- design_score — visual quality, modern aesthetics, branding (0-100)
- ux_score — navigation, usability, accessibility, mobile responsiveness (0-100)
- conversion_score — CTAs, forms, social proof, urgency, funnel design (0-100)
- content_score — clarity, copywriting, structure, messaging (0-100)
- overall_score — weighted average (design 25%, UX 25%, conversion 25%, content 25%)
- strengths — top 3 strengths (array of strings)
- weaknesses — top 3 weaknesses (array of strings)

Return structured JSON.`,
    add_context_from_internet: true,
    model: "gemini_3_8_flash",
    response_json_schema: {
      type: "object",
      properties: {
        benchmarks: {
          type: "array",
          items: {
            type: "object",
            properties: {
              url: { type: "string" },
              title: { type: "string" },
              overall_score: { type: "number" },
              design_score: { type: "number" },
              ux_score: { type: "number" },
              conversion_score: { type: "number" },
              content_score: { type: "number" },
              strengths: { type: "array", items: { type: "string" } },
              weaknesses: { type: "array", items: { type: "string" } },
            },
          },
        },
      },
    },
  });

  return result.benchmarks || [];
}

// ─── Phase 3: VISUAL CAPTURE ────────────────────────────────────────
// Uses the Cloud Browser Engine to visit each top site and capture screenshots.

export async function captureScreenshots(benchmarks, maxSites = 5) {
  // Sort by overall score descending, take top N
  const sorted = [...benchmarks]
    .sort((a, b) => (b.overall_score || 0) - (a.overall_score || 0))
    .slice(0, maxSites);

  const results = [];

  for (const site of sorted) {
    let sessionId = null;
    try {
      const session = await createSession();
      sessionId = session.sessionId;
      await navigateTo(sessionId, site.url, { waitUntil: "domcontentloaded" });
      const screenshot = await takeScreenshot(sessionId, { fullPage: false });
      results.push({
        url: site.url,
        title: site.title,
        screenshot_url: screenshot.url || null,
        success: true,
      });
    } catch (err) {
      results.push({
        url: site.url,
        title: site.title,
        screenshot_url: null,
        success: false,
        error: err.message,
      });
    } finally {
      if (sessionId) {
        try { await closeSession(sessionId); } catch { /* ignore */ }
      }
    }
  }

  return results;
}

// ─── Phase 4: REVERSE ENGINEER ───────────────────────────────────────
// Uses LLM with screenshots (or text fallback) to extract design DNA.

export async function reverseEngineerSites(base44, benchmarks, screenshots) {
  const successfulShots = (screenshots || []).filter((s) => s.success && s.screenshot_url);

  if (successfulShots.length > 0) {
    // Vision-based reverse engineering with screenshots
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a master reverse engineer of world-class web design. Analyse these screenshots of top-performing websites and extract their design DNA.

For each site extract:
1. design_system — { color_palette (hex array), typography {heading_font, body_font, heading_sizes, body_sizes}, spacing_system, border_radius, shadow_style }
2. component_patterns — array of { name, description, key_features } — e.g. "hero_split", "feature_grid_3col", "testimonial_carousel", "pricing_table_3tier", "sticky_cta_bar"
3. layout_structure — { section_order (array), grid_system, responsive_breakpoints, max_width }
4. content_patterns — { headline_formula, cta_copy_style, social_proof_placement, value_proposition_structure }
5. color_palette — array of hex color codes extracted from the design
6. typography — { heading_font, body_font, heading_weight, body_weight }

Be extremely detailed and specific. Extract actual colors, font styles, and layout patterns from the screenshots.`,
      file_urls: successfulShots.map((s) => s.screenshot_url),
      model: "gemini_3_8_flash",
      response_json_schema: {
        type: "object",
        properties: {
          reverse_engineered: {
            type: "array",
            items: {
              type: "object",
              properties: {
                url: { type: "string" },
                design_system: { type: "object" },
                component_patterns: { type: "array", items: { type: "object" } },
                layout_structure: { type: "object" },
                content_patterns: { type: "object" },
                color_palette: { type: "array", items: { type: "string" } },
                typography: { type: "object" },
              },
            },
          },
        },
      },
    });
    return result.reverse_engineered || [];
  }

  // Fallback: text-based reverse engineering from benchmark data
  const topBenchmarks = [...benchmarks]
    .sort((a, b) => (b.overall_score || 0) - (a.overall_score || 0))
    .slice(0, 5);

  const benchmarksText = topBenchmarks
    .map(
      (b) =>
        `${b.url} (Score: ${b.overall_score}) — Strengths: ${(b.strengths || []).join(", ")}`
    )
    .join("\n");

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `Based on these benchmarked top websites and their strengths, reverse engineer the common design patterns that make them successful:

${benchmarksText}

For each site, infer and extract:
1. design_system — { color_palette, typography, spacing_system, border_radius, shadow_style }
2. component_patterns — array of { name, description, key_features }
3. layout_structure — { section_order, grid_system, responsive_breakpoints, max_width }
4. content_patterns — { headline_formula, cta_copy_style, social_proof_placement, value_proposition_structure }
5. color_palette — array of hex codes (inferred from industry best practices)
6. typography — { heading_font, body_font, heading_weight, body_weight }

Base your inferences on the industry, the strengths identified, and web design best practices.`,
    add_context_from_internet: true,
    model: "gemini_3_8_flash",
    response_json_schema: {
      type: "object",
      properties: {
        reverse_engineered: {
          type: "array",
          items: {
            type: "object",
            properties: {
              url: { type: "string" },
              design_system: { type: "object" },
              component_patterns: { type: "array", items: { type: "object" } },
              layout_structure: { type: "object" },
              content_patterns: { type: "object" },
              color_palette: { type: "array", items: { type: "string" } },
              typography: { type: "object" },
            },
          },
        },
      },
    },
  });
  return result.reverse_engineered || [];
}

// ─── Phase 5: ARCHITECT ──────────────────────────────────────────────
// Uses LLM to synthesize reverse-engineered patterns into a universal template.

export async function architectTemplate(base44, reverseEngineered, industry, subindustry) {
  const target = subindustry ? `${industry} — ${subindustry}` : industry;
  const patternsJson = JSON.stringify(reverseEngineered, null, 2).substring(0, 12000);

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `You are a master template architect. Synthesise the reverse-engineered patterns from top ${target} websites into a SINGLE universal template architecture that captures the BEST of all patterns.

Reverse-engineered patterns from top sites:
${patternsJson}

Design a universal template that includes:
1. template_name — a compelling, marketable name for this template
2. description — what makes this template exceptional (2-3 sentences)
3. component_tree — complete React component hierarchy: array of { name, type, children (array), props (object), purpose (string) }
4. layout_system — { grid (e.g. "12-col"), spacing (e.g. "8px base"), breakpoints, max_width (e.g. "1280px"), section_order (array of section names) }
5. design_tokens — { colors { primary, secondary, accent, background, surface, text, muted, border }, typography { heading_font, body_font, heading_sizes, body_sizes, weights }, spacing, radius, shadows }
6. content_structure — { sections (array of { name, purpose, placeholder_variables (array of strings) }), headline_formulas (array), cta_patterns (array) }
7. variants — { color_schemes (array of { name, colors }), layout_options (array), industry_adaptations (array) }
8. quality_targets — { design_score_target, conversion_score_target, performance_target }

This template must be production-ready, universally adaptable across businesses in this industry, and represent the gold standard.`,
    model: "claude-sonnet-5",
    response_json_schema: {
      type: "object",
      properties: {
        template_name: { type: "string" },
        description: { type: "string" },
        component_tree: { type: "array", items: { type: "object" } },
        layout_system: { type: "object" },
        design_tokens: { type: "object" },
        content_structure: { type: "object" },
        variants: { type: "object" },
        quality_targets: { type: "object" },
      },
    },
  });

  return result;
}

// ─── Phase 6: ENGINEER ──────────────────────────────────────────────
// Uses LLM to generate the actual template code, blueprint, and documentation.

export async function engineerTemplate(base44, architecture, industry) {
  const archJson = JSON.stringify(architecture, null, 2).substring(0, 12000);

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `You are a master template engineer. Generate the complete, production-ready template package from this architecture:

${archJson}

Generate:
1. blueprint — a complete content blueprint with placeholder variables ({{business_name}}, {{industry}}, {{location}}, {{phone}}, {{email}}, {{hero_headline}}, {{hero_subheadline}}, {{cta_primary}}, {{features}}, {{testimonials}}, {{pricing}}, etc.) for every section. Structure as { sections: [{ name, content_template, variables }] }
2. component_code — key React component code snippets (Hero, Features, Testimonials, Pricing, CTA, Footer) using Tailwind CSS classes. Structure as { componentName: codeString }
3. variables — array of all placeholder variables with { key, description, default_value }
4. documentation — markdown documentation including installation, customisation, usage, and variant instructions
5. preview_data — sample filled-in data for previewing the template (a complete example business in the ${industry} industry)
6. files — array of { path, content } for the template file structure (e.g. src/components/Hero.jsx, src/components/Features.jsx, tailwind.config.js, README.md)

Make this a production-ready, universal template that can be instantiated for any business in the ${industry} industry. The component code must use Tailwind CSS and follow modern React best practices.`,
    model: "claude-sonnet-5",
    response_json_schema: {
      type: "object",
      properties: {
        blueprint: { type: "object" },
        component_code: { type: "object" },
        variables: { type: "array", items: { type: "object" } },
        documentation: { type: "string" },
        preview_data: { type: "object" },
        files: { type: "array", items: { type: "object" } },
      },
    },
  });

  return result;
}

// ─── Helper: Check if cloud browser is available ────────────────────

export async function isCloudBrowserAvailable() {
  try {
    const health = await healthCheck();
    return health.status === "healthy";
  } catch {
    return false;
  }
}