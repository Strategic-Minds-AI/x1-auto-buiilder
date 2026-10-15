import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";

const GENERATION_PROMPTS = {
  website: "Generate a complete website blueprint with all sections, content, design direction, and technical specifications. Include: hero section, about, services, pricing, testimonials, contact, footer. Provide specific copy for each section.",
  landing: "Generate a high-converting landing page with hero, benefits, social proof, CTA, and FAQ. Include specific copy and design direction.",
  ecommerce: "Generate an e-commerce store design with product pages, cart, checkout, and category navigation. Include product descriptions and UX flow.",
  app: "Generate a mobile app UI blueprint with screens, navigation, components, and user flows. Include design specifications, color scheme, and typography.",
  funnel: "Generate a lead generation funnel with landing page, opt-in form, thank you page, email sequence, and conversion optimization tips.",
  content: "Generate SEO-optimized content with proper headings, keywords, meta description, and call-to-action. Make it comprehensive and engaging.",
  brand: "Generate a complete brand identity including: brand name, tagline, positioning statement, color palette (with hex codes), typography, logo direction, and tone of voice.",
  social: "Generate a social media content kit with post ideas, captions, hashtags, and visual direction for Facebook, Instagram, LinkedIn, and TikTok.",
  video: "Generate a video script with scenes, voiceover, visual descriptions, timing, and production notes.",
  email: "Generate an email sequence with subject lines, preview text, body content, and CTAs for each email in the sequence.",
  crm: "Generate a CRM workflow with stages, triggers, actions, automation rules, and pipeline configuration.",
  chatbot: "Generate a chatbot script with conversation flows, intents, responses, escalation rules, and fallback messages.",
  booking: "Generate a booking system design with calendar UI, appointment types, notifications, and integration points.",
  dashboard: "Generate an analytics dashboard design with metrics, charts, filters, data sources, and layout specifications.",
  compliance: "Generate a compliance checklist with requirements, verification steps, risk assessments, and remediation actions.",
  competitor: "Generate a competitor analysis with comparison matrix, strengths, weaknesses, opportunities, threats, and strategic recommendations.",
  pricing: "Generate a pricing strategy with tiers, features, positioning, competitive analysis, and revenue projections.",
  onboarding: "Generate a customer onboarding flow with steps, milestones, communications, success metrics, and engagement triggers.",
  referral: "Generate a referral program with incentives, tracking, communications, growth mechanics, and reward structure.",
  code: "Generate custom code based on the specification. Include proper structure, comments, error handling, and usage examples.",
  api: "Generate an API integration plan with endpoints, authentication, data mapping, error handling, and testing strategy.",
  database: "Generate a database schema with tables, relationships, indexes, constraints, and sample queries.",
  workflow: "Generate a workflow automation with triggers, conditions, actions, integrations, and monitoring.",
  card: "Generate a digital business card design with contact info, branding, interactive elements, and QR code direction.",
  flyer: "Generate a promotional flyer design with headline, offer, visuals, CTA, and distribution strategy.",
  assist: "You are an AI assistant integrated into the Universal Generator. You help users understand how to use the generator, choose the right generation type, integrate generated content into their projects, and troubleshoot issues. Be specific, actionable, and concise. Reference the available generation types and integration capabilities.",
};

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { action, generation_type, prompt, project_id, generated_content, options } = body;

    if (!action) return Response.json({ error: "action is required (generate, assist, install)" }, { status: 400 });

    switch (action) {
      case "generate": {
        if (!generation_type || !prompt)
          return Response.json({ error: "generation_type and prompt are required" }, { status: 400 });

        const systemPrompt = GENERATION_PROMPTS[generation_type] || GENERATION_PROMPTS.code;
        const fullPrompt = `${systemPrompt}\n\nUser request: ${prompt}\n\nProvide a comprehensive, production-ready output with specific, actionable details.`;

        const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: fullPrompt,
          model: options?.model || "automatic",
          response_json_schema: {
            type: "object",
            properties: {
              title: { type: "string", description: "Title for this generation" },
              summary: { type: "string", description: "Brief summary" },
              content: { type: "string", description: "Full generated content in markdown" },
              sections: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    heading: { type: "string" },
                    body: { type: "string" },
                  },
                },
              },
              metadata: { type: "object", description: "Additional structured data" },
              install_instructions: { type: "string", description: "How to install/integrate this" },
            },
          },
        });

        return Response.json({ success: true, generation_type, prompt, result });
      }

      case "assist": {
        if (!prompt) return Response.json({ error: "prompt is required" }, { status: 400 });
        const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `${GENERATION_PROMPTS.assist}\n\nUser question: ${prompt}`,
          model: "automatic",
        });
        return Response.json({ success: true, response: result });
      }

      case "install": {
        if (!generation_type || !generated_content)
          return Response.json({ error: "generation_type and generated_content are required" }, { status: 400 });

        const content = typeof generated_content === "string"
          ? { title: "Generated Content", content: generated_content }
          : generated_content;
        let installed;

        switch (generation_type) {
          case "website":
          case "landing":
          case "ecommerce":
            installed = await base44.entities.WebsiteProject.create({
              business_name: content.title || "Generated Project",
              business_website: "https://generated.universal.dev",
              industry: "Universal Generated",
              status: "generated",
              content,
            });
            break;
          case "brand":
            installed = await base44.entities.ApprovedBrandManifest.create({
              project_id: project_id || "universal",
              business_name: content.title || "Generated Brand",
              positioning: content.summary || content.content || "",
              status: "draft",
            });
            break;
          case "social":
            installed = await base44.entities.SocialCreativeKit.create({
              project_id: project_id || "universal",
              platform: "facebook",
              status: "generated",
            });
            break;
          case "video":
            installed = await base44.entities.VideoAsset.create({
              project_id: project_id || "universal",
              video_type: "promotional_offer",
              script: content.content || "",
              status: "SCRIPT_READY",
            });
            break;
          case "card":
            installed = await base44.entities.DigitalCardFlyer.create({
              name: content.title || "Generated Card",
              type: "business_card",
              content,
              status: "generated",
            });
            break;
          case "flyer":
            installed = await base44.entities.DigitalCardFlyer.create({
              name: content.title || "Generated Flyer",
              type: "flyer",
              content,
              status: "generated",
            });
            break;
          case "pricing":
            installed = await base44.entities.PricingIntelligence.create({
              industry: "Universal Generated",
              competitor_name: content.title || "Universal Generator",
              service_or_product: content.summary || "Generated pricing strategy",
            });
            break;
          case "competitor":
          case "compliance":
          case "onboarding":
          case "referral":
          case "workflow":
            installed = await base44.entities.IntelligenceTask.create({
              title: content.title || "Generated Intelligence",
              category: generation_type === "compliance" ? "governance" : "research",
              description: content.content || content.summary || "",
              status: "in_progress",
            });
            break;
          default:
            installed = await base44.entities.GenerationJob.create({
              job_type: "GENERATE_CONTENT",
              status: "complete",
              payload: { generation_type, prompt: content.title },
              result_artifact: content,
            });
        }

        return Response.json({ success: true, installed, generation_type });
      }

      default:
        return Response.json({ error: "Unknown action: " + action }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message || "Universal generator failed" }, { status: 500 });
  }
}