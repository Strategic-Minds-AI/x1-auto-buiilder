// Specialized prompt library for image enhancement, template enhancement,
// validation, and quality control. These power the Prompt Library page
// and are seeded into the PromptPack entity on first load.

export const PROMPT_CATEGORIES = [
  { id: "image_enhancement", label: "Image Enhancement", icon: "Image", color: "#06b6d4" },
  { id: "template_enhancement", label: "Template Enhancement", icon: "LayoutTemplate", color: "#8b5cf6" },
  { id: "validation", label: "Validation", icon: "ShieldCheck", color: "#10b981" },
  { id: "quality_check", label: "Quality Scoring", icon: "Gauge", color: "#f59e0b" },
];

export const BUILTIN_PROMPTS = [
  // ── IMAGE ENHANCEMENT ──────────────────────────────────────────
  {
    name: "Hero Image Regenerator",
    category: "image_enhancement",
    prompt_type: "image_enhancement",
    description: "Generates a detailed prompt for AI image generation to create a cinematic, industry-specific hero image.",
    system_prompt: "You are an expert art director and AI image prompt engineer. Your job is to create detailed, vivid prompts for AI image generators (like DALL-E or Midjourney) that produce professional, high-quality hero images for business websites. Focus on lighting, composition, mood, color palette, and industry-specific details. Never include text in the image description.",
    user_prompt_template: "Create a detailed AI image generation prompt for a hero image for a {{industry}} business named {{business_name}}. The image should convey: {{mood}}. Style: {{style}}. The image will be used as a full-width website hero background. Include specific details about lighting, camera angle, depth of field, color grading, and atmosphere. The image should feel premium and trustworthy.",
    variables: [
      { key: "industry", description: "Target industry", required: true },
      { key: "business_name", description: "Business name", required: true },
      { key: "mood", description: "Desired mood (e.g., professional, energetic, calming)", required: true },
      { key: "style", description: "Visual style (e.g., cinematic, editorial, minimal)", required: false }
    ],
    tags: ["hero", "image", "ai-generation", "background"],
    model: "claude-sonnet-5",
    is_builtin: true,
  },
  {
    name: "Logo Concept Generator",
    category: "image_enhancement",
    prompt_type: "image_enhancement",
    description: "Creates 10 distinct logo concept prompts for AI image generation, each with a different design direction.",
    system_prompt: "You are a senior brand designer specializing in logo creation. Generate detailed prompts for AI image generators that produce clean, modern, professional logo marks. Each prompt must describe a distinct visual direction. Never include text or lettering in the image description — the logo should be a pure mark/icon.",
    user_prompt_template: "Generate 10 distinct logo concept prompts for a {{industry}} business named {{business_name}}. Brand personality: {{personality}}. Preferred colors: {{colors}}. For each concept, provide: (1) a unique design direction name, (2) a detailed AI image prompt describing the mark, style, and color palette, (3) why this direction fits the brand. Return as a JSON array.",
    variables: [
      { key: "industry", description: "Target industry", required: true },
      { key: "business_name", description: "Business name", required: true },
      { key: "personality", description: "Brand personality traits (e.g., bold, trustworthy, innovative)", required: true },
      { key: "colors", description: "Preferred color palette or hex values", required: false }
    ],
    tags: ["logo", "brand", "ai-generation", "concepts"],
    model: "claude-sonnet-5",
    response_schema: {
      type: "object",
      properties: {
        concepts: {
          type: "array",
          items: {
            type: "object",
            properties: {
              direction: { type: "string" },
              prompt: { type: "string" },
              rationale: { type: "string" }
            }
          }
        }
      }
    },
    is_builtin: true,
  },
  {
    name: "Image Quality Enhancer",
    category: "image_enhancement",
    prompt_type: "image_enhancement",
    description: "Analyzes an existing image URL and generates an enhanced version prompt with improved lighting, composition, and resolution.",
    system_prompt: "You are an expert photo editor and AI image specialist. Analyze the provided image and create a detailed enhancement prompt that improves its quality while maintaining the core subject and composition. Focus on lighting, color correction, sharpness, and professional finishing.",
    user_prompt_template: "Analyze this image and create an enhanced version prompt: {{image_url}}\n\nThe image is for a {{industry}} business. Improve: {{improvement_areas}}. Generate a detailed AI image prompt that produces a superior version of this image with professional-grade quality. Include specific details about lighting, color grading, sharpness, and mood.",
    variables: [
      { key: "image_url", description: "URL of the image to enhance", required: true },
      { key: "industry", description: "Industry context", required: true },
      { key: "improvement_areas", description: "What to improve (e.g., lighting, color, composition)", required: true }
    ],
    tags: ["enhancement", "image", "quality", "ai-generation"],
    model: "claude-sonnet-5",
    is_builtin: true,
  },
  {
    name: "Color Palette Generator",
    category: "image_enhancement",
    prompt_type: "image_enhancement",
    description: "Generates a harmonious 5-color palette with hex codes, usage guidance, and contrast ratios for accessibility.",
    system_prompt: "You are a color theory expert and UI designer. Generate harmonious color palettes that are both aesthetically pleasing and accessible. Always provide hex codes, WCAG contrast ratios for text/background pairs, and specific usage guidance for each color.",
    user_prompt_template: "Generate a 5-color palette for a {{industry}} business. Brand mood: {{mood}}. The palette should include: a primary brand color, a secondary/accent color, a dark background color, a light background color, and a text color. For each color provide: hex code, role, and WCAG contrast ratio against the background. Return as JSON.",
    variables: [
      { key: "industry", description: "Target industry", required: true },
      { key: "mood", description: "Desired mood (e.g., bold, calming, luxurious)", required: true }
    ],
    tags: ["color", "palette", "design", "accessibility"],
    model: "automatic",
    response_schema: {
      type: "object",
      properties: {
        palette: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              hex: { type: "string" },
              role: { type: "string" },
              contrast_on_bg: { type: "string" }
            }
          }
        }
      }
    },
    is_builtin: true,
  },

  // ── TEMPLATE ENHANCEMENT ────────────────────────────────────────
  {
    name: "Section Copy Optimizer",
    category: "template_enhancement",
    prompt_type: "template_enhancement",
    description: "Rewrites a website section's copy to be more compelling, specific, and conversion-optimized while maintaining brand voice.",
    system_prompt: "You are an elite conversion copywriter. Rewrite website copy to be specific, compelling, and action-oriented. Replace generic phrases with concrete details. Every headline should create curiosity or state a clear benefit. Every subheadline should provide proof or specificity. Never use clichés like 'quality service' or 'committed to excellence'.",
    user_prompt_template: "Rewrite this website section copy for a {{industry}} business.\n\nCurrent headline: {{headline}}\nCurrent subheadline: {{subheadline}}\nCurrent body: {{body}}\n\nBrand voice: {{voice}}\nTarget audience: {{audience}}\n\nProvide 3 alternative versions, each with a different angle: (1) benefit-focused, (2) urgency-focused, (3) story-focused. Return as JSON.",
    variables: [
      { key: "industry", description: "Industry", required: true },
      { key: "headline", description: "Current headline", required: true },
      { key: "subheadline", description: "Current subheadline", required: false },
      { key: "body", description: "Current body copy", required: false },
      { key: "voice", description: "Brand voice (e.g., professional, friendly, bold)", required: false },
      { key: "audience", description: "Target audience", required: false }
    ],
    tags: ["copy", "conversion", "sections", "optimization"],
    model: "claude-sonnet-5",
    response_schema: {
      type: "object",
      properties: {
        versions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              angle: { type: "string" },
              headline: { type: "string" },
              subheadline: { type: "string" },
              body: { type: "string" }
            }
          }
        }
      }
    },
    is_builtin: true,
  },
  {
    name: "CTA Conversion Booster",
    category: "template_enhancement",
    prompt_type: "template_enhancement",
    description: "Generates 10 high-converting CTA variations with psychological triggers and urgency cues.",
    system_prompt: "You are a conversion rate optimization expert. Create compelling calls-to-action that drive clicks. Use psychological triggers: urgency, scarcity, curiosity, value, and social proof. Keep CTAs under 6 words. Make them specific and action-oriented.",
    user_prompt_template: "Generate 10 CTA variations for a {{industry}} business.\n\nCurrent CTA: {{current_cta}}\nOffer: {{offer}}\nGoal: {{goal}}\n\nFor each CTA, provide: the text, the psychological trigger used, and why it works. Return as JSON.",
    variables: [
      { key: "industry", description: "Industry", required: true },
      { key: "current_cta", description: "Current CTA text", required: false },
      { key: "offer", description: "What's being offered", required: true },
      { key: "goal", description: "Conversion goal (e.g., call, quote, book)", required: true }
    ],
    tags: ["cta", "conversion", "copy", "psychology"],
    model: "claude-sonnet-5",
    response_schema: {
      type: "object",
      properties: {
        ctas: {
          type: "array",
          items: {
            type: "object",
            properties: {
              text: { type: "string" },
              trigger: { type: "string" },
              reasoning: { type: "string" }
            }
          }
        }
      }
    },
    is_builtin: true,
  },
  {
    name: "Layout Structure Optimizer",
    category: "template_enhancement",
    prompt_type: "template_enhancement",
    description: "Analyzes a template's section order and recommends an optimized layout for maximum conversion.",
    system_prompt: "You are a UX/UI strategist specializing in conversion-focused page layouts. Analyze section ordering and recommend optimal arrangements based on user psychology, attention flow, and conversion principles. Always explain why each section belongs where it does.",
    user_prompt_template: "Analyze and optimize the layout for a {{industry}} website template.\n\nCurrent section order: {{sections}}\nPage type: {{page_type}}\nPrimary goal: {{goal}}\n\nProvide: (1) an optimized section order, (2) why each section should be in that position, (3) any sections to add or remove. Return as JSON.",
    variables: [
      { key: "industry", description: "Industry", required: true },
      { key: "sections", description: "Current sections in order (comma-separated)", required: true },
      { key: "page_type", description: "Page type (e.g., homepage, landing, service)", required: true },
      { key: "goal", description: "Primary conversion goal", required: true }
    ],
    tags: ["layout", "ux", "structure", "conversion"],
    model: "claude-sonnet-5",
    response_schema: {
      type: "object",
      properties: {
        optimized_order: {
          type: "array",
          items: {
            type: "object",
            properties: {
              section: { type: "string" },
              position: { type: "number" },
              reason: { type: "string" }
            }
          }
        },
        add_sections: { type: "array", items: { type: "string" } },
        remove_sections: { type: "array", items: { type: "string" } }
      }
    },
    is_builtin: true,
  },
  {
    name: "SEO Content Enhancer",
    category: "template_enhancement",
    prompt_type: "template_enhancement",
    description: "Rewrites template content to be SEO-optimized with target keywords, proper heading structure, and meta descriptions.",
    system_prompt: "You are an SEO content strategist. Optimize website content for search engines while maintaining readability and user experience. Use target keywords naturally, create proper heading hierarchy (H1-H3), write compelling meta descriptions under 155 characters, and ensure content depth matches search intent.",
    user_prompt_template: "Optimize this content for SEO.\n\nIndustry: {{industry}}\nTarget keywords: {{keywords}}\nCurrent content: {{content}}\n\nProvide: (1) an SEO-optimized version of the content with proper H1-H3 structure, (2) a meta title (under 60 chars), (3) a meta description (under 155 chars), (4) suggested internal links, (5) FAQ schema questions. Return as JSON.",
    variables: [
      { key: "industry", description: "Industry", required: true },
      { key: "keywords", description: "Target keywords (comma-separated)", required: true },
      { key: "content", description: "Current content to optimize", required: true }
    ],
    tags: ["seo", "content", "keywords", "meta"],
    model: "claude-sonnet-5",
    response_schema: {
      type: "object",
      properties: {
        optimized_content: { type: "string" },
        meta_title: { type: "string" },
        meta_description: { type: "string" },
        internal_links: { type: "array", items: { type: "string" } },
        faq_questions: { type: "array", items: { type: "string" } }
      }
    },
    is_builtin: true,
  },

  // ── VALIDATION ──────────────────────────────────────────────────
  {
    name: "Content Originality Validator",
    category: "validation",
    prompt_type: "validation",
    description: "Checks generated content for originality, plagiarism patterns, and generic clichés.",
    system_prompt: "You are a content originality auditor. Analyze text for: (1) generic clichés and overused phrases, (2) patterns that suggest copied content, (3) lack of specificity, (4) filler language. Provide a originality score (0-100) and specific recommendations to make the content unique and specific.",
    user_prompt_template: "Validate the originality of this content for a {{industry}} business.\n\nContent to validate: {{content}}\n\nProvide: (1) an originality score (0-100), (2) a list of clichés or generic phrases found, (3) specific recommendations to make it more original, (4) a rewritten version of any problematic sections. Return as JSON.",
    variables: [
      { key: "industry", description: "Industry", required: true },
      { key: "content", description: "Content to validate", required: true }
    ],
    tags: ["originality", "plagiarism", "cliches", "validation"],
    model: "claude-sonnet-5",
    response_schema: {
      type: "object",
      properties: {
        originality_score: { type: "number" },
        cliches_found: { type: "array", items: { type: "string" } },
        recommendations: { type: "array", items: { type: "string" } },
        rewritten_sections: { type: "array", items: { type: "object" } }
      }
    },
    is_builtin: true,
  },
  {
    name: "Brand Consistency Validator",
    category: "validation",
    prompt_type: "validation",
    description: "Validates that content, colors, and tone are consistent with the brand's established guidelines.",
    system_prompt: "You are a brand consistency auditor. Check that all content, visual elements, and messaging align with the brand's established voice, colors, and personality. Flag any inconsistencies and provide specific corrections.",
    user_prompt_template: "Validate brand consistency for {{business_name}}.\n\nBrand guidelines: {{brand_guidelines}}\nContent to validate: {{content}}\nColors used: {{colors}}\n\nProvide: (1) a consistency score (0-100), (2) a list of inconsistencies found, (3) specific corrections needed, (4) an overall brand alignment assessment. Return as JSON.",
    variables: [
      { key: "business_name", description: "Business name", required: true },
      { key: "brand_guidelines", description: "Brand voice, colors, personality guidelines", required: true },
      { key: "content", description: "Content to validate", required: true },
      { key: "colors", description: "Colors used in the design", required: false }
    ],
    tags: ["brand", "consistency", "validation", "guidelines"],
    model: "claude-sonnet-5",
    response_schema: {
      type: "object",
      properties: {
        consistency_score: { type: "number" },
        inconsistencies: { type: "array", items: { type: "string" } },
        corrections: { type: "array", items: { type: "string" } },
        alignment_assessment: { type: "string" }
      }
    },
    is_builtin: true,
  },
  {
    name: "Google Compliance Validator",
    category: "validation",
    prompt_type: "validation",
    description: "Validates content against Google's helpful content guidelines, E-E-A-T signals, and spam policies.",
    system_prompt: "You are a Google Search quality rater and compliance expert. Validate content against Google's guidelines: Helpful Content Update, E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness), spam policies, and core web vitals considerations. Provide actionable recommendations.",
    user_prompt_template: "Validate this content for Google compliance.\n\nIndustry: {{industry}}\nContent: {{content}}\nPage type: {{page_type}}\n\nCheck against: (1) Helpful Content guidelines, (2) E-E-A-T signals, (3) Spam policies, (4) Mobile usability. Provide a compliance score (0-100), specific issues, and recommendations. Return as JSON.",
    variables: [
      { key: "industry", description: "Industry", required: true },
      { key: "content", description: "Content to validate", required: true },
      { key: "page_type", description: "Page type (e.g., homepage, service, blog)", required: true }
    ],
    tags: ["google", "compliance", "eeat", "seo", "validation"],
    model: "claude-sonnet-5",
    response_schema: {
      type: "object",
      properties: {
        compliance_score: { type: "number" },
        helpful_content: { type: "object" },
        eeat_signals: { type: "object" },
        spam_issues: { type: "array", items: { type: "string" } },
        recommendations: { type: "array", items: { type: "string" } }
      }
    },
    is_builtin: true,
  },
  {
    name: "Accessibility Validator",
    category: "validation",
    prompt_type: "validation",
    description: "Validates content and design for WCAG 2.1 AA accessibility compliance.",
    system_prompt: "You are a WCAG 2.1 accessibility auditor. Check content and design for compliance with WCAG 2.1 AA standards: color contrast, text alternatives, heading structure, link text, form labels, and readability. Provide specific, actionable fixes.",
    user_prompt_template: "Validate accessibility for this content/design.\n\nContent: {{content}}\nColor combinations: {{colors}}\nHeading structure: {{headings}}\n\nCheck: (1) color contrast ratios (minimum 4.5:1 for normal text), (2) heading hierarchy, (3) link text descriptiveness, (4) image alt text, (5) readability level. Provide a compliance score (0-100) and specific fixes. Return as JSON.",
    variables: [
      { key: "content", description: "Content to validate", required: true },
      { key: "colors", description: "Color combinations used (e.g., #000 on #fff)", required: true },
      { key: "headings", description: "Heading structure (e.g., H1 > H2 > H3)", required: false }
    ],
    tags: ["accessibility", "wcag", "validation", "compliance"],
    model: "claude-sonnet-5",
    response_schema: {
      type: "object",
      properties: {
        compliance_score: { type: "number" },
        contrast_issues: { type: "array", items: { type: "string" } },
        heading_issues: { type: "array", items: { type: "string" } },
        fixes: { type: "array", items: { type: "string" } }
      }
    },
    is_builtin: true,
  },

  // ── QUALITY SCORING ─────────────────────────────────────────────
  {
    name: "Overall Quality Scorer",
    category: "quality_check",
    prompt_type: "quality_check",
    description: "Scores a generated website on a 0-100 scale across design, content, conversion, SEO, and trust signals.",
    system_prompt: "You are a senior website quality auditor. Score websites on a 0-100 scale across 5 dimensions: Design Quality, Content Quality, Conversion Potential, SEO Readiness, and Trust Signals. For each dimension, provide specific strengths, weaknesses, and actionable recommendations. The overall score should be a weighted average.",
    user_prompt_template: "Score this website for overall quality.\n\nIndustry: {{industry}}\nBusiness name: {{business_name}}\nContent blueprint: {{content}}\nDesign details: {{design}}\n\nProvide: (1) a score for each dimension (0-100), (2) an overall weighted score, (3) top 3 strengths, (4) top 3 weaknesses, (5) top 5 priority improvements. Return as JSON.",
    variables: [
      { key: "industry", description: "Industry", required: true },
      { key: "business_name", description: "Business name", required: true },
      { key: "content", description: "Website content blueprint (JSON or text)", required: true },
      { key: "design", description: "Design details (colors, layout, fonts)", required: false }
    ],
    tags: ["quality", "scoring", "audit", "assessment"],
    model: "claude-sonnet-5",
    response_schema: {
      type: "object",
      properties: {
        dimensions: {
          type: "object",
          properties: {
            design: { type: "number" },
            content: { type: "number" },
            conversion: { type: "number" },
            seo: { type: "number" },
            trust: { type: "number" }
          }
        },
        overall_score: { type: "number" },
        strengths: { type: "array", items: { type: "string" } },
        weaknesses: { type: "array", items: { type: "string" } },
        priority_improvements: { type: "array", items: { type: "string" } }
      }
    },
    is_builtin: true,
  },
  {
    name: "Conversion Potential Scorer",
    category: "quality_check",
    prompt_type: "quality_check",
    description: "Scores a website's conversion potential and provides specific recommendations to increase lead generation.",
    system_prompt: "You are a conversion rate optimization expert. Score websites on their likelihood to convert visitors into leads/customers. Evaluate: CTA clarity, value proposition, trust signals, urgency, friction points, and form optimization. Provide specific, actionable recommendations.",
    user_prompt_template: "Score the conversion potential of this website.\n\nIndustry: {{industry}}\nContent: {{content}}\nCTAs: {{ctas}}\nTrust signals: {{trust_signals}}\n\nProvide: (1) a conversion score (0-100), (2) a conversion funnel analysis, (3) friction points identified, (4) top 5 conversion improvements ranked by impact, (5) estimated lift from implementing recommendations. Return as JSON.",
    variables: [
      { key: "industry", description: "Industry", required: true },
      { key: "content", description: "Website content", required: true },
      { key: "ctas", description: "CTAs used on the page", required: false },
      { key: "trust_signals", description: "Trust signals present (reviews, badges, warranties)", required: false }
    ],
    tags: ["conversion", "scoring", "leads", "optimization"],
    model: "claude-sonnet-5",
    response_schema: {
      type: "object",
      properties: {
        conversion_score: { type: "number" },
        funnel_analysis: { type: "string" },
        friction_points: { type: "array", items: { type: "string" } },
        improvements: { type: "array", items: { type: "object" } },
        estimated_lift: { type: "string" }
      }
    },
    is_builtin: true,
  },
  {
    name: "Design Quality Assessor",
    category: "quality_check",
    prompt_type: "quality_check",
    description: "Assesses visual design quality including color harmony, typography, spacing, and visual hierarchy.",
    system_prompt: "You are a senior UI/UX designer and design critic. Assess visual design quality across: color harmony, typography choices, visual hierarchy, spacing/rhythm, consistency, and modern aesthetics. Score each area and provide specific improvement recommendations.",
    user_prompt_template: "Assess the design quality of this website template.\n\nIndustry: {{industry}}\nColor palette: {{colors}}\nTypography: {{typography}}\nLayout: {{layout}}\nVisual elements: {{visuals}}\n\nProvide: (1) a design quality score (0-100), (2) sub-scores for color, typography, hierarchy, spacing, and consistency, (3) specific design improvements, (4) modern design trends to incorporate. Return as JSON.",
    variables: [
      { key: "industry", description: "Industry", required: true },
      { key: "colors", description: "Color palette (hex values)", required: true },
      { key: "typography", description: "Font choices and sizes", required: true },
      { key: "layout", description: "Layout structure description", required: false },
      { key: "visuals", description: "Visual elements (images, icons, graphics)", required: false }
    ],
    tags: ["design", "quality", "ui", "typography", "color"],
    model: "claude-sonnet-5",
    response_schema: {
      type: "object",
      properties: {
        design_score: { type: "number" },
        sub_scores: {
          type: "object",
          properties: {
            color: { type: "number" },
            typography: { type: "number" },
            hierarchy: { type: "number" },
            spacing: { type: "number" },
            consistency: { type: "number" }
          }
        },
        improvements: { type: "array", items: { type: "string" } },
        trends: { type: "array", items: { type: "string" } }
      }
    },
    is_builtin: true,
  },
  {
    name: "Performance Predictor",
    category: "quality_check",
    prompt_type: "quality_check",
    description: "Predicts how a website will perform in search rankings, user engagement, and lead generation.",
    system_prompt: "You are a digital marketing strategist and web performance analyst. Predict website performance based on content quality, SEO readiness, conversion design, and user experience factors. Provide realistic predictions with confidence levels and improvement recommendations.",
    user_prompt_template: "Predict the performance of this website.\n\nIndustry: {{industry}}\nLocal market: {{market}}\nContent quality summary: {{content_summary}}\nSEO elements: {{seo}}\nConversion elements: {{conversion}}\n\nPredict: (1) likely search ranking range for target keywords, (2) estimated organic traffic (3-6 months), (3) estimated conversion rate, (4) engagement quality score, (5) top 5 actions to improve performance. Return as JSON.",
    variables: [
      { key: "industry", description: "Industry", required: true },
      { key: "market", description: "Local market/geo", required: true },
      { key: "content_summary", description: "Summary of content quality", required: true },
      { key: "seo", description: "SEO elements present", required: false },
      { key: "conversion", description: "Conversion elements present", required: false }
    ],
    tags: ["performance", "prediction", "seo", "traffic", "conversion"],
    model: "claude-sonnet-5",
    response_schema: {
      type: "object",
      properties: {
        ranking_prediction: { type: "string" },
        traffic_estimate: { type: "string" },
        conversion_rate_estimate: { type: "string" },
        engagement_score: { type: "number" },
        actions: { type: "array", items: { type: "string" } }
      }
    },
    is_builtin: true,
  },
];