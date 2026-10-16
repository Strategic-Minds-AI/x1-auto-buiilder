/**
 * VISUAL PACK & TEMPLATE GENOME CONTRACTS
 *
 * The core insight: "there is no collection of glamorous adjectives that can force
 * a generator to produce elite websites. The reliable way to get that result is to
 * turn quality into machine-testable architecture."
 *
 * A VisualPack is the complete design system specification — deterministic tokens,
 * not adjectives. A TemplateGenome is the structural DNA — composition patterns,
 * section grammar, and component architecture.
 *
 * Both are versioned, validated, and independently verifiable.
 */

// ─── VISUAL PACK CONTRACT ───────────────────────────────────────────
// Every generated system MUST have an explicit VisualPack. No exceptions.

export const VISUAL_PACK_SCHEMA = {
  stable_id: "string — never changes",
  version: "semver — e.g. 1.0.0",
  name: "string — display label",
  source: "string — origin (reference-analysis | brand-generation | client-approved | ai-generated)",

  // Typography
  typography: {
    font_family_heading: "string — CSS font-family stack",
    font_family_body: "string — CSS font-family stack",
    font_family_mono: "string — CSS font-family stack",
    font_weights: "number[] — e.g. [400, 500, 600, 700]",
    fluid_font_scale: {
      min_size: "number — px at min viewport",
      max_size: "number — px at max viewport",
      min_viewport: "number — px",
      max_viewport: "number — px",
      ratio: "number — modular scale ratio (1.125, 1.25, 1.333, 1.5)",
    },
    line_heights: {
      tight: "number — e.g. 1.1",
      normal: "number — e.g. 1.5",
      relaxed: "number — e.g. 1.7",
    },
    letter_spacing: {
      tight: "string — e.g. -0.02em",
      normal: "string — e.g. 0em",
      wide: "string — e.g. 0.05em",
    },
  },

  // Color System
  colors: {
    primary: "hex — brand primary",
    secondary: "hex — brand secondary",
    accent: "hex — conversion accent",
    background: "hex — page background",
    surface: "hex — card/surface background",
    surface_elevated: "hex — elevated surface",
    text: "hex — primary text",
    text_muted: "hex — secondary text",
    border: "hex — border color",
    success: "hex",
    warning: "hex",
    error: "hex",
    semantic_overrides: "object — industry-specific semantic colors",
  },

  // Spacing & Layout
  spacing: {
    scale: "number[] — e.g. [0, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128]",
    container_widths: {
      sm: "number — px",
      md: "number — px",
      lg: "number — px",
      xl: "number — px",
      full: "string — '100%' or max-width",
    },
    grid: {
      columns: "number — e.g. 12",
      gutter: "number — px",
      max_width: "number — px",
    },
    breakpoints: {
      sm: "number — px",
      md: "number — px",
      lg: "number — px",
      xl: "number — px",
      "2xl": "number — px",
    },
  },

  // Shape & Elevation
  radii: {
    none: "0",
    sm: "string — e.g. 4px",
    md: "string — e.g. 8px",
    lg: "string — e.g. 16px",
    xl: "string — e.g. 24px",
    full: "string — e.g. 9999px",
  },
  shadows: {
    none: "string",
    sm: "string — CSS box-shadow",
    md: "string",
    lg: "string",
    xl: "string",
    inner: "string",
  },
  borders: {
    default_width: "string — e.g. 1px",
    default_style: "string — e.g. solid",
    focus_width: "string — e.g. 2px",
  },

  // Interaction States
  states: {
    focus: "object — { outline, outline_offset, ring }",
    hover: "object — { opacity, transform, transition }",
    active: "object — { transform, opacity }",
    disabled: "object — { opacity, cursor }",
    error: "object — { border_color, text_color, background }",
    success: "object — { border_color, text_color, background }",
    loading: "object — { skeleton_color, opacity, animation }",
  },

  // Motion
  motion: {
    duration: {
      instant: "string — e.g. 100ms",
      fast: "string — e.g. 150ms",
      normal: "string — e.g. 250ms",
      slow: "string — e.g. 400ms",
      deliberate: "string — e.g. 600ms",
    },
    easing: {
      standard: "string — cubic-bezier",
      emphasized: "string — cubic-bezier",
      decelerated: "string — cubic-bezier",
      accelerated: "string — cubic-bezier",
      spring: "string — cubic-bezier",
    },
    reduced_motion_variant: "object — overrides for prefers-reduced-motion",
  },

  // Validation
  accessibility: {
    contrast_ratios: {
      text_normal: "number — minimum 4.5:1 for WCAG AA",
      text_large: "number — minimum 3:1 for WCAG AA",
      ui_components: "number — minimum 3:1 for WCAG AA",
    },
    focus_visible: "boolean — focus indicator must be visible",
    touch_targets: "number — minimum 44x44px",
  },

  // Provenance
  validation_status: "string — pending | validated | rejected",
  validator_receipt_id: "string — linked ValidationReceipt",
  quality_score: "number — 0-100 multidimensional score",
  checksum: "string — content hash for integrity verification",
};

// ─── TEMPLATE GENOME CONTRACT ──────────────────────────────────────
// A TemplateGenome defines the structural DNA — not a finished template,
// but the architectural patterns that produce distinct, premium layouts.

export const TEMPLATE_GENOME_SCHEMA = {
  stable_id: "string — never changes",
  version: "semver",
  name: "string — display label",
  industry_family: "string — industryRegistry stable_id",
  platform: "string — platformRegistry stable_id",

  // Art Direction
  art_direction: {
    energy: "string — e.g. confident-reliable, aspirational-editorial",
    density: "string — airy | balanced | purposeful-dense",
    restraint: "string — minimal | controlled | expressive",
    composition_style: "string — editorial | modular | asymmetric | grid-strict",
  },

  // Hero Archetype — genuinely different compositions, not recolored variants
  hero_archetype: {
    type: "enum — split | immersive-image | editorial | product-ui | cinematic | lead-form | calculator | comparison | social-proof | interactive-demo",
    composition: "string — detailed composition description",
    focal_hierarchy: "string — what the eye sees first, second, third",
    negative_space: "string — how space is used",
    content_choreography: "string — how content reveals on scroll/load",
  },

  // Section Grammar — the ordered vocabulary of page sections
  section_grammar: {
    home: "string[] — ordered section types for home page",
    about: "string[] — ordered section types for about page",
    services: "string[] — ordered section types for services page",
    contact: "string[] — ordered section types for contact page",
    landing: "string[] — ordered section types for landing pages",
  },

  // Component Architecture
  component_architecture: {
    navigation_model: "enum — sticky-bar | overlay | sidebar | split-nav | mega-menu | minimal-pill",
    cta_hierarchy: "string[] — primary, secondary, tertiary CTA patterns",
    form_style: "enum — floating-label | inline | card | multi-step | split",
    card_style: "enum — bordered | shadow | elevated | flat | gradient",
    testimonial_system: "enum — carousel | grid | wall | inline | video",
    pricing_layout: "enum — three-tier | comparison-table | slider | toggle | feature-matrix",
    footer_pattern: "enum — minimal | multi-column | cta-focused | link-directory",
  },

  // Type System
  type_system: {
    scale_ratio: "number — modular scale (1.125, 1.25, 1.333, 1.5)",
    heading_style: "string — display | editorial | technical | humanist",
    body_style: "string — readable | scannable | immersive",
    optical_alignment: "string — baseline | cap-height | center",
  },

  // Color Logic
  color_logic: {
    palette_strategy: "string — monochromatic | complementary | analogous | triadic | custom",
    semantic_mapping: "string — how colors map to meaning",
    contrast_strategy: "string — high-contrast | nuanced | accessibility-first",
    dark_mode_support: "boolean",
  },

  // Image Logic
  image_logic: {
    photography_style: "string — cinematic | documentary | product | lifestyle | abstract",
    art_direction_mobile: "string — how images adapt on mobile (crop, stack, hide)",
    lazy_loading: "boolean",
    priority_loading: "string[] — which images get fetchpriority=high",
    responsive_variants: "boolean — srcset/sizes enabled",
    aspect_ratios: "object — per-section aspect ratio guidance",
  },

  // Motion Language
  motion: {
    entrance: "string — how sections enter viewport",
    micro_interactions: "string — hover, focus, active feedback patterns",
    state_transitions: "string — loading, success, error transitions",
    scroll_behavior: "string — parallax | reveal | sticky | none",
    reduced_motion: "object — what changes for prefers-reduced-motion",
  },

  // Conversion Architecture
  conversion_architecture: {
    primary_cta: "string — main conversion action",
    secondary_cta: "string — supporting action",
    trust_elements: "string[] — trust signals used",
    risk_reversal: "string — guarantee/warranty/trial pattern",
    social_proof: "string[] — review/testimonial/credential patterns",
    form_strategy: "string — progressive | single-step | multi-step | conditional",
  },

  // Content Architecture
  content_architecture: {
    section_purpose: "object — what each section accomplishes",
    information_hierarchy: "string — how information is prioritized",
    reading_pattern: "string — F-pattern | Z-pattern | layer-cake | broken-glass",
    content_density: "string — sparse | balanced | rich",
  },

  // Validation Requirements
  validation_requirements: {
    responsive_breakpoints: "string[] — which breakpoints must be tested",
    browser_targets: "string[] — which browsers must pass",
    accessibility_target: "string — WCAG 2.2 AA",
    performance_budget: {
      lcp_max: "number — 2.5 seconds",
      inp_max: "number — 200 milliseconds",
      cls_max: "number — 0.1",
      js_budget: "number — KB",
      css_budget: "number — KB",
      image_budget: "number — KB per page",
    },
  },

  // Provenance
  source_sha: "string — git SHA of source",
  validation_status: "string — pending | validated | rejected",
  quality_score: "number — 0-100",
  validator_receipt_id: "string",
  checksum: "string",
};

// ─── QUALITY RUBRIC ─────────────────────────────────────────────────
// Multi-dimensional quality scoring — never a single vague AI score.
// Each dimension must point to evidence.

export const QUALITY_RUBRIC = [
  {
    dimension: "visual_craftsmanship",
    weight: 12,
    description: "Typography, spacing, color, composition quality",
    evidence_required: "screenshot comparison + design token audit",
    measurement: "automated token validation + visual review",
  },
  {
    dimension: "brand_coherence",
    weight: 10,
    description: "Consistency with approved brand system",
    evidence_required: "VisualPack token match report",
    measurement: "token diff against approved VisualPack",
  },
  {
    dimension: "content_usefulness",
    weight: 12,
    description: "Content serves user intent, not keyword stuffing",
    evidence_required: "content audit + intent mapping",
    measurement: "section-purpose alignment + readability score",
  },
  {
    dimension: "conversion_clarity",
    weight: 10,
    description: "Clear primary action, trust architecture, risk reversal",
    evidence_required: "conversion flow analysis",
    measurement: "CTA visibility + trust element count + form friction",
  },
  {
    dimension: "interaction_quality",
    weight: 8,
    description: "Micro-interactions, state feedback, motion purpose",
    evidence_required: "interaction audit",
    measurement: "state coverage + motion purposefulness",
  },
  {
    dimension: "responsive_quality",
    weight: 10,
    description: "Works across mobile, tablet, desktop",
    evidence_required: "browser screenshots at all breakpoints",
    measurement: "automated responsive test pass rate",
  },
  {
    dimension: "accessibility",
    weight: 10,
    description: "WCAG 2.2 AA compliance",
    evidence_required: "axe-core scan + manual keyboard test",
    measurement: "WCAG violation count + contrast ratio audit",
  },
  {
    dimension: "performance",
    weight: 10,
    description: "Core Web Vitals targets met",
    evidence_required: "Lighthouse report + field data",
    measurement: "LCP <= 2.5s, INP <= 200ms, CLS <= 0.1 at 75th percentile",
  },
  {
    dimension: "technical_correctness",
    weight: 8,
    description: "Valid HTML, no console errors, clean code",
    evidence_required: "HTML validation + console log audit",
    measurement: "validation errors + console warnings count",
  },
  {
    dimension: "seo_quality",
    weight: 8,
    description: "Search intent, structured data, meta tags",
    evidence_required: "SEO audit + structured data validation",
    measurement: "Google Rich Results test + meta coverage",
  },
  {
    dimension: "originality",
    weight: 6,
    description: "Not a copy of existing template, genuinely distinct",
    evidence_required: "similarity check against existing templates",
    measurement: "structural diff against library",
  },
  {
    dimension: "trust",
    weight: 4,
    description: "Trust signals are real, not fabricated",
    evidence_required: "trust element verification",
    measurement: "fabricated content detection (reviews, stats, credentials)",
  },
  {
    dimension: "maintainability",
    weight: 4,
    description: "Code is clean, documented, extensible",
    evidence_required: "code quality scan",
    measurement: "complexity + duplication + documentation coverage",
  },
];

export const MAX_QUALITY_SCORE = 100;
export const SHIP_THRESHOLD = 90;
export const AUTO_HEAL_THRESHOLD = 70;
export const REBUILD_THRESHOLD = 70;

export function calculateQualityScore(dimensionScores) {
  const totalWeight = QUALITY_RUBRIC.reduce((sum, d) => sum + d.weight, 0);
  const weightedSum = QUALITY_RUBRIC.reduce((sum, dim) => {
    const score = dimensionScores[dim.dimension] || 0;
    return sum + (score * dim.weight) / 100;
  }, 0);
  return Math.round((weightedSum / totalWeight) * 100);
}

export function getVerdict(score) {
  if (score >= SHIP_THRESHOLD) return "SHIP";
  if (score >= AUTO_HEAL_THRESHOLD) return "AUTO_HEAL";
  return "REBUILD";
}

// ─── HERO ARCHETYPE CATALOG ─────────────────────────────────────────
// Genuinely different compositions — not recolored variants.

export const HERO_ARCHETYPES = [
  {
    id: "split",
    name: "Split Hero",
    composition: "Content left, visual right — 50/50 or 60/40 split",
    best_for: ["premium-marketing-site", "lead-gen-funnel", "b2b-corporate-site"],
    focal_hierarchy: "headline → subheadline → CTA → visual",
  },
  {
    id: "immersive-image",
    name: "Immersive Image Hero",
    composition: "Full-bleed background image with overlay text",
    best_for: ["hospitality-booking", "real-estate-search", "restaurants-food"],
    focal_hierarchy: "image atmosphere → headline → CTA",
  },
  {
    id: "editorial",
    name: "Editorial Hero",
    composition: "Magazine-style with large headline, minimal text, deliberate whitespace",
    best_for: ["premium-marketing-site", "portfolio", "agency-site"],
    focal_hierarchy: "headline → whitespace → supporting text",
  },
  {
    id: "product-ui",
    name: "Product UI Hero",
    composition: "Product screenshot or interactive demo with feature callouts",
    best_for: ["saas-application", "ai-chat-ui", "analytics-platform"],
    focal_hierarchy: "product visual → headline → feature highlights",
  },
  {
    id: "cinematic",
    name: "Cinematic Hero",
    composition: "Video or animated background with minimal text overlay",
    best_for: ["hospitality-booking", "events-entertainment", "fitness-sports"],
    focal_hierarchy: "motion → atmosphere → headline → CTA",
  },
  {
    id: "lead-form",
    name: "Lead Form Hero",
    composition: "Value proposition left, lead capture form right",
    best_for: ["lead-gen-funnel", "intake-form-funnel", "quote-estimator-funnel"],
    focal_hierarchy: "offer → form → trust signals",
  },
  {
    id: "calculator",
    name: "Calculator Hero",
    composition: "Interactive pricing/quote calculator as the primary element",
    best_for: ["quote-estimator-funnel", "b2b-lead-platform"],
    focal_hierarchy: "calculator → result → CTA",
  },
  {
    id: "comparison",
    name: "Comparison Hero",
    composition: "Side-by-side comparison (us vs them, before/after, plans)",
    best_for: ["saas-application", "affiliate-platform", "b2b-lead-platform"],
    focal_hierarchy: "comparison → differentiator → CTA",
  },
  {
    id: "social-proof",
    name: "Social Proof Hero",
    composition: "Reviews, ratings, client logos, testimonials as primary content",
    best_for: ["healthcare-medical", "dental-orthodontics", "professional-services"],
    focal_hierarchy: "proof → headline → CTA",
  },
  {
    id: "interactive-demo",
    name: "Interactive Demo Hero",
    composition: "Live interactive element (chat, configurator, preview)",
    best_for: ["ai-chat-ui", "saas-application", "ai-agent-interface"],
    focal_hierarchy: "interaction → value → CTA",
  },
];

// ─── EXPORT ─────────────────────────────────────────────────────────

export const VISUAL_PACK_VERSION = "1.0.0";
export const TEMPLATE_GENOME_VERSION = "1.0.0";
export const QUALITY_RUBRIC_VERSION = "1.0.0";