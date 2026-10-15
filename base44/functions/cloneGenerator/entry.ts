import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";

function extractTitle(html: string): string {
  const m = html.match(/<title[^>]*>(.*?)<\/title>/i);
  return m ? m[1].trim() : "";
}

function extractMeta(html: string, name: string): string {
  const re = new RegExp(`<meta[^>]*(?:name|property)=["']${name}["'][^>]*content=["']([^"']*)["']`, "i");
  const m = html.match(re);
  return m ? m[1] : "";
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { action } = body;

    switch (action) {
      case "clone": {
        const { url } = body;
        if (!url) return Response.json({ error: "url is required" }, { status: 400 });

        const res = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          },
          signal: AbortSignal.timeout(20000),
        });
        if (!res.ok) return Response.json({ error: `Failed to fetch URL: ${res.status}` }, { status: 400 });

        const html = await res.text();
        const title = extractTitle(html);
        const description = extractMeta(html, "description");

        const project = await base44.entities.CloneProject.create({
          source_url: url,
          source_title: title,
          raw_html: html.substring(0, 15000),
          status: "cloned",
          industry: body.industry || "",
        });

        return Response.json({ success: true, project, html_length: html.length, title, description });
      }

      case "reverse_engineer": {
        const { project_id } = body;
        if (!project_id) return Response.json({ error: "project_id is required" }, { status: 400 });

        const project = await base44.entities.CloneProject.get(project_id);
        const html = project.raw_html || "";

        const prompt = `You are a senior web architect reverse-engineering a website from its HTML. Analyze this HTML and produce a complete structural blueprint.

HTML (truncated to first 15k chars):
${html.substring(0, 15000)}

Extract and return as JSON:
1. sections: Array of page sections found (header, hero, about, services, testimonials, pricing, contact, footer, etc.) with name, purpose, and key elements
2. design_system: Colors (hex), fonts (family names), spacing patterns, border radius patterns
3. layout: Layout type (grid/flex/single-column), number of columns, responsive indicators
4. components: List of UI components detected (navbar, buttons, forms, cards, accordion, carousel, etc.)
5. content_structure: Heading hierarchy and content patterns
6. technologies: Frameworks/libraries detected (React, Vue, jQuery, Tailwind, Bootstrap, etc.)
7. summary: 2-3 sentence summary of what this website is and does`;

        const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              sections: { type: "array", items: { type: "object", properties: { name: { type: "string" }, purpose: { type: "string" }, elements: { type: "array", items: { type: "string" } } } } },
              design_system: { type: "object", properties: { colors: { type: "array", items: { type: "string" } }, fonts: { type: "array", items: { type: "string" } }, spacing: { type: "string" }, border_radius: { type: "string" } } },
              layout: { type: "object", properties: { type: { type: "string" }, columns: { type: "number" }, responsive: { type: "boolean" } } },
              components: { type: "array", items: { type: "string" } },
              content_structure: { type: "array", items: { type: "string" } },
              technologies: { type: "array", items: { type: "string" } },
              summary: { type: "string" },
            },
          },
          model: "claude-sonnet-5",
        });

        const updated = await base44.entities.CloneProject.update(project_id, {
          analysis: result,
          status: "reverse_engineered",
        });

        return Response.json({ success: true, analysis: result, project: updated });
      }

      case "rebrand": {
        const { project_id, instructions } = body;
        if (!project_id) return Response.json({ error: "project_id is required" }, { status: 400 });

        const project = await base44.entities.CloneProject.get(project_id);

        const prompt = `You are a world-class brand transformation expert. Take this website analysis and generate a complete, differentiated rebrand.

Original site analysis:
${JSON.stringify(project.analysis || {}).substring(0, 3000)}

Rebrand instructions: ${instructions || "Generate a fresh, modern rebrand that differentiates from the original while maintaining the same industry positioning. Make it premium and memorable."}

Generate a complete rebrand package as JSON:
1. brand_name: A new, memorable brand name
2. tagline: A compelling tagline
3. color_palette: Array of {name, hex, usage} with 5-6 colors (primary, secondary, accent, neutral light, neutral dark, background)
4. fonts: {heading, body} with font family names and pairing rationale
5. logo_direction: Detailed logo concept description
6. tone_of_voice: Brand personality and communication style
7. differentiators: 3-5 key brand differentiators
8. brand_story: A compelling brand narrative (2-3 paragraphs)`;

        const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              brand_name: { type: "string" },
              tagline: { type: "string" },
              color_palette: { type: "array", items: { type: "object", properties: { name: { type: "string" }, hex: { type: "string" }, usage: { type: "string" } } } },
              fonts: { type: "object", properties: { heading: { type: "string" }, body: { type: "string" }, rationale: { type: "string" } } },
              logo_direction: { type: "string" },
              tone_of_voice: { type: "string" },
              differentiators: { type: "array", items: { type: "string" } },
              brand_story: { type: "string" },
            },
          },
          model: "claude-sonnet-5",
        });

        const updated = await base44.entities.CloneProject.update(project_id, {
          rebrand: result,
          status: "rebranded",
        });

        return Response.json({ success: true, rebrand: result, project: updated });
      }

      case "generate_content": {
        const { project_id, instructions } = body;
        if (!project_id) return Response.json({ error: "project_id is required" }, { status: 400 });

        const project = await base44.entities.CloneProject.get(project_id);

        const prompt = `You are an elite copywriter. Generate original, high-converting content for this rebranded website.

Site structure (sections to write content for):
${JSON.stringify(project.analysis?.sections || []).substring(0, 2000)}

Rebrand identity:
${JSON.stringify(project.rebrand || {}).substring(0, 1500)}

Content instructions: ${instructions || "Generate compelling, conversion-focused content for each section. Make it original, engaging, professional, and aligned with the rebrand tone of voice."}

Generate complete content in markdown format. Use H2 for each section name, then write the content. Include:
- Hero headline and subheadline
- About section
- Services/Products section
- Why choose us / differentiators
- Testimonials (create realistic ones)
- Call-to-action copy
- Contact section
- Footer content

Make the content specific, not generic. Use the brand name and tagline.`;

        const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt,
          model: "claude-sonnet-5",
        });

        const content = typeof result === "string" ? result : JSON.stringify(result, null, 2);

        const updated = await base44.entities.CloneProject.update(project_id, {
          generated_content: content,
          status: "content_generated",
        });

        return Response.json({ success: true, content, project: updated });
      }

      case "generate_funnel": {
        const { project_id, instructions } = body;
        if (!project_id) return Response.json({ error: "project_id is required" }, { status: 400 });

        const project = await base44.entities.CloneProject.get(project_id);

        const prompt = `You are a conversion funnel architect. Generate a complete, high-converting funnel system for this business.

Site analysis: ${JSON.stringify(project.analysis || {}).substring(0, 1500)}
Rebrand: ${JSON.stringify(project.rebrand || {}).substring(0, 1000)}

Funnel instructions: ${instructions || "Generate a complete lead generation and conversion funnel."}

Generate a complete funnel system in markdown. Include:

## 1. Funnel Strategy
- Target audience
- Funnel stages (Awareness, Interest, Decision, Action)
- Key conversion goals

## 2. Landing Page
- Headline and subheadline
- Hero copy
- Benefits list
- Social proof elements
- CTA copy and design
- Form fields

## 3. Lead Magnet
- 3 lead magnet ideas
- Best option with full description

## 4. Thank You Page
- Copy and next steps

## 5. Email Sequence (7 emails)
For each email: subject line, preview text, body content, CTA
1. Welcome + delivery
2. Story + connection
3. Value + education
4. Case study / proof
5. Objection handling
6. Offer
7. Urgency / final push

## 6. Conversion Optimization
- A/B test ideas
- Tracking setup
- Analytics KPIs

## 7. Follow-up Automation
- SMS sequence (if applicable)
- Retargeting strategy`;

        const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt,
          model: "claude-sonnet-5",
        });

        const content = typeof result === "string" ? result : JSON.stringify(result, null, 2);

        const updated = await base44.entities.CloneProject.update(project_id, {
          funnel_system: { content, generated_at: new Date().toISOString() },
          status: "funnel_generated",
        });

        return Response.json({ success: true, funnel: content, project: updated });
      }

      case "google_scan": {
        const { project_id } = body;
        if (!project_id) return Response.json({ error: "project_id is required" }, { status: 400 });

        const project = await base44.entities.CloneProject.get(project_id);

        const prompt = `You are a Google Search Central expert and SEO auditor. Analyze this website against Google's programmatic requirements and generate a compliance report + requirements checklist.

Site analysis: ${JSON.stringify(project.analysis || {}).substring(0, 2000)}
Raw HTML excerpt: ${(project.raw_html || "").substring(0, 8000)}

Perform a comprehensive Google compliance scan. Check:
1. Core Web Vitals readiness (LCP, INP, CLS)
2. Mobile-first indexing compliance
3. Structured data (Schema.org markup)
4. Meta tags (title, description, canonical, robots)
5. Heading hierarchy (H1-H6 structure)
6. Image optimization (alt tags, lazy loading, format)
7. Internal linking structure
8. Page speed factors (render-blocking, minification)
9. HTTPS and security headers
10. Accessibility (WCAG 2.1)
11. Content quality (E-E-A-T signals)
12. Mobile usability
13. Sitemap and robots.txt indicators
14. Open Graph and social sharing

Return as JSON:
- overall_score: 0-100
- categories: Array of {name, score, status (pass/warn/fail), issues, recommendations}
- critical_issues: Array of issues that must be fixed
- requirements: Array of Google requirements this site must meet (with priority and how-to)
- summary: Executive summary`;

        const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              overall_score: { type: "number" },
              categories: { type: "array", items: { type: "object", properties: {
                name: { type: "string" }, score: { type: "number" }, status: { type: "string" },
                issues: { type: "array", items: { type: "string" } },
                recommendations: { type: "array", items: { type: "string" } },
              } } },
              critical_issues: { type: "array", items: { type: "string" } },
              requirements: { type: "array", items: { type: "object", properties: {
                requirement: { type: "string" }, priority: { type: "string" }, how_to: { type: "string" },
              } } },
              summary: { type: "string" },
            },
          },
          model: "claude-sonnet-5",
        });

        const updated = await base44.entities.CloneProject.update(project_id, {
          google_scan: result,
          status: "google_scanned",
        });

        return Response.json({ success: true, scan: result, project: updated });
      }

      case "generate_website": {
        const { project_id, instructions } = body;
        if (!project_id) return Response.json({ error: "project_id is required" }, { status: 400 });

        const project = await base44.entities.CloneProject.get(project_id);

        const prompt = `You are an award-winning web designer and developer. Generate an ULTRA HIGH QUALITY website blueprint that surpasses the original site in every way.

Original site analysis: ${JSON.stringify(project.analysis || {}).substring(0, 2000)}
Rebrand identity: ${JSON.stringify(project.rebrand || {}).substring(0, 1500)}
Generated content: ${(project.generated_content || "").substring(0, 2000)}
Google scan results: ${JSON.stringify(project.google_scan || {}).substring(0, 1000)}

Website instructions: ${instructions || "Generate an ultra high quality, premium, award-winning website blueprint."}

Generate a comprehensive, production-ready website blueprint in markdown. This must be ULTRA HIGH QUALITY — think Awwwards / CSS Design Awards level.

Include:

## 1. Design Philosophy
- Visual direction and mood
- Design principles
- Inspiration and references

## 2. Design System
- Color palette (with hex codes, usage, and CSS variables)
- Typography scale (font sizes, weights, line heights)
- Spacing system (margin/padding scale)
- Border radius and shadow system
- Animation and transition guidelines

## 3. Page Structure
- Complete sitemap
- Each page with sections, purpose, and content summary

## 4. Homepage Blueprint
Detailed section-by-section breakdown:
- Navigation (sticky, transparent, mega-menu)
- Hero (full-screen, video/animation, headline, CTA)
- Trust bar (logos, stats)
- Services/Features (interactive cards, hover effects)
- About (story, team, values)
- Process (timeline, step-by-step)
- Testimonials (carousel, video testimonials)
- Case studies / Portfolio
- Pricing (comparison table)
- FAQ (accordion)
- CTA section (gradient, animation)
- Footer (multi-column, newsletter, social)

## 5. Component Library
- Buttons (primary, secondary, ghost, sizes, states)
- Cards (product, feature, testimonial, pricing)
- Forms (input, select, checkbox, radio, validation)
- Navigation (desktop, mobile, breadcrumb, pagination)
- Overlays (modal, tooltip, popover, toast)
- Data display (table, tabs, accordion, carousel)

## 6. Responsive Design
- Breakpoints (mobile, tablet, desktop, wide)
- Mobile-specific design decisions
- Touch interaction patterns

## 7. Micro-Interactions & Animations
- Scroll-triggered animations
- Hover effects
- Page transitions
- Loading states

## 8. SEO & Performance
- Meta tag strategy
- Schema.org markup
- Image optimization strategy
- Performance budget

## 9. Conversion Optimization
- CTA placement strategy
- Social proof integration
- Trust signals
- A/B test recommendations

## 10. Technical Implementation
- Recommended tech stack
- Key libraries
- Build and deployment strategy

Make every section detailed and specific. This is a premium blueprint that a development team can build directly from.`;

        const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt,
          model: "claude-sonnet-5",
        });

        const content = typeof result === "string" ? result : JSON.stringify(result, null, 2);

        const updated = await base44.entities.CloneProject.update(project_id, {
          website_blueprint: content,
          status: "website_generated",
        });

        return Response.json({ success: true, blueprint: content, project: updated });
      }

      default:
        return Response.json({ error: "Unknown action: " + action }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message || "Clone generator failed" }, { status: 500 });
  }
}