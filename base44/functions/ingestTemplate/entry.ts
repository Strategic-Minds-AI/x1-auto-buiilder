import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const TEMPLATE_TYPES = {
  website: { entity: 'SiteTemplate', label: 'Website Template' },
  design: { entity: 'DesignTemplate', label: 'Design Template' },
  platform: { entity: 'PlatformTemplate', label: 'Platform Template' },
  b2b: { entity: 'B2BTemplate', label: 'B2B Template' },
  saas: { entity: 'SaaSTemplate', label: 'SaaS Template' },
  funnel: { entity: 'FunnelTemplate', label: 'Funnel Template' },
  chat_ui: { entity: 'ChatUITemplate', label: 'Chat UI Template' },
  workflow: { entity: 'WorkflowTemplate', label: 'Workflow Template' },
};

const ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    template_type: {
      type: 'string',
      enum: ['website', 'design', 'platform', 'b2b', 'saas', 'funnel', 'chat_ui', 'workflow'],
    },
    sub_type: { type: 'string', description: 'Specific sub-type within the template type' },
    name: { type: 'string' },
    industry: { type: 'string' },
    description: { type: 'string' },
    layout: { type: 'string' },
    tone: { type: 'string', description: 'Background color hex' },
    ink: { type: 'string', description: 'Text/foreground color hex' },
    accent: { type: 'string', description: 'Accent color hex' },
    head: { type: 'string' },
    sub: { type: 'string' },
    eyebrow: { type: 'string' },
    cta: { type: 'string' },
    feature: { type: 'string' },
    feature_copy: { type: 'string' },
    interactive: { type: 'string' },
    template_data: { type: 'object', description: 'Universalized content blueprint' },
    variables: { type: 'array', items: { type: 'object' }, description: 'Placeholder variables [{key, description}]' },
    architecture: { type: 'object' },
    subscription_tiers: { type: 'array', items: { type: 'object' } },
    buyer_journey: { type: 'array', items: { type: 'object' } },
    steps: { type: 'array', items: { type: 'object' } },
    demo_conversation: { type: 'array', items: { type: 'object' } },
    trigger: { type: 'string' },
    integrations: { type: 'array', items: { type: 'string' } },
    confidence: { type: 'number' },
    reasoning: { type: 'string' },
  },
  required: ['template_type', 'name'],
};

function slugify(name) {
  return (name || 'template')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 40) + '-' + Date.now().toString(36).substring(-4);
}

function buildPrompt(filename, content, overrideType) {
  return `You are a template ingestion system for a digital asset platform. Analyze the following template file and perform three steps: CLASSIFY, UNIVERSALIZE, and ORGANIZE.

STEP 1 — CLASSIFY: Determine what type of template this is.
${overrideType ? `The user has specified this is a "${overrideType}" template — use that type.` : 'Determine the type automatically.'}

Template types:
- "website": Business website template (HTML page, React component, or design blueprint for a business site)
- "design": Visual design template (business website layout, desktop app layout, or mobile app layout)
- "platform": Platform/marketplace template (multi-vendor commerce, community, directory, membership, scheduling, creator, agency, franchise, enterprise, aggregator)
- "b2b": B2B template (procurement, quoting, enterprise lead capture, ABM, sales operations, product catalog, vendor portal, wholesale commerce, professional services)
- "saas": SaaS template (subscription, vertical SaaS, AI SaaS, analytics, automation, collaboration, CRM, productivity, industry specific, multi-tenant)
- "funnel": Funnel template (lead gen, quote request, consultation booking, ecommerce acquisition, SaaS trial, webinar, course enrollment, B2B demo, free tool, diagnostic, membership signup, onboarding, retention upsell)
- "chat_ui": Chat UI template (support bot, sales assistant, knowledge base, agent console, customer service, lead qualifier, onboarding guide)
- "workflow": Workflow/automation template (automation, notification, data sync, approval, scheduled report, lead routing, onboarding sequence, retention campaign, content pipeline, deployment)

STEP 2 — UNIVERSALIZE: Extract the template's structure, design system, and content into a universal format.
- Extract colors: tone (background hex), ink (text hex), accent (accent hex)
- Extract headline (head), subheadline (sub), CTA label
- Extract layout type (e.g., "hero-centered", "split-screen", "dashboard", "feed", "stepper")
- Extract industry if determinable from the content
- For websites: extract full content blueprint into template_data (hero, services, about, faqs, testimonials, valueProps, process, finalCta, colorTokens, logoPrompt, heroImagePrompt)
- For funnels: extract steps array with step_name, fields, cta per step
- For workflows: extract trigger type and steps array
- For SaaS: extract subscription_tiers and architecture overview
- For platforms: extract architecture overview
- For B2B: extract buyer_journey array
- For chat UI: extract demo_conversation array with role/content pairs
- For design: extract eyebrow, feature, feature_copy, interactive element type

STEP 3 — ORGANIZE: Determine the specific sub-type within the template type.
- design → sub_type must be one of: "website", "desktop_app", "mobile_app"
- platform → sub_type must be one of: "marketplace", "community", "directory", "membership", "education", "multi_vendor_commerce", "scheduling", "creator", "agency", "franchise", "enterprise", "aggregator"
- b2b → sub_type must be one of: "procurement", "quoting", "enterprise_lead_capture", "abm", "sales_operations", "product_catalog", "vendor_portal", "wholesale_commerce", "professional_services"
- saas → sub_type must be one of: "subscription", "vertical_saaS", "ai_saas", "analytics", "automation", "collaboration", "crm", "productivity", "industry_specific", "multi_tenant"
- funnel → sub_type must be one of: "lead_gen", "quote_request", "consultation_booking", "ecommerce_acquisition", "saas_trial", "webinar_registration", "course_enrollment", "b2b_demo", "free_tool", "diagnostic_assessment", "membership_signup", "onboarding", "retention_upsell"
- chat_ui → sub_type must be one of: "support_bot", "sales_assistant", "knowledge_base", "agent_console", "customer_service", "lead_qualifier", "onboarding_guide"
- workflow → sub_type must be one of: "automation", "notification", "data_sync", "approval", "scheduled_report", "lead_routing", "onboarding_sequence", "retention_campaign", "content_pipeline", "deployment"
- website → sub_type can be a layout descriptor

Also extract any placeholder variables (e.g. {{business_name}}, {{industry}}) into the variables array as [{key, description}].

File: ${filename}

Content:
${content}`;
}

async function installTemplate(base44, analysis) {
  const tid = slugify(analysis.name);
  const type = analysis.template_type;

  switch (type) {
    case 'website':
      return {
        entity: 'SiteTemplate',
        record: await base44.entities.SiteTemplate.create({
          name: analysis.name,
          industry: analysis.industry || 'general',
          template: analysis.template_data || {},
          variables: analysis.variables || [],
        }),
      };

    case 'design':
      return {
        entity: 'DesignTemplate',
        record: await base44.entities.DesignTemplate.create({
          template_id: tid,
          name: analysis.name,
          category: analysis.sub_type || 'website',
          industry: analysis.industry || 'general',
          family: analysis.description || '',
          layout: analysis.layout || '',
          tone: analysis.tone || '#0b1523',
          ink: analysis.ink || '#ffffff',
          accent: analysis.accent || '#00d4ff',
          head: analysis.head || '',
          sub: analysis.sub || '',
          eyebrow: analysis.eyebrow || '',
          cta: analysis.cta || '',
          feature: analysis.feature || '',
          feature_copy: analysis.feature_copy || '',
          interactive: analysis.interactive || '',
          source_package: 'bulk-ingestion',
        }),
      };

    case 'platform':
      return {
        entity: 'PlatformTemplate',
        record: await base44.entities.PlatformTemplate.create({
          template_id: tid,
          name: analysis.name,
          platform_type: analysis.sub_type || 'marketplace',
          industry: analysis.industry || 'general',
          architecture: analysis.architecture || {},
          layout: analysis.layout || '',
          tone: analysis.tone || '#0b1523',
          accent: analysis.accent || '#00d4ff',
          ink: analysis.ink || '#ffffff',
          head: analysis.head || '',
          sub: analysis.sub || '',
        }),
      };

    case 'b2b':
      return {
        entity: 'B2BTemplate',
        record: await base44.entities.B2BTemplate.create({
          template_id: tid,
          name: analysis.name,
          b2b_type: analysis.sub_type || 'professional_services',
          industry: analysis.industry || 'general',
          buyer_journey: analysis.buyer_journey || [],
          layout: analysis.layout || '',
          tone: analysis.tone || '#0b1523',
          accent: analysis.accent || '#00d4ff',
          ink: analysis.ink || '#ffffff',
          head: analysis.head || '',
          sub: analysis.sub || '',
        }),
      };

    case 'saas':
      return {
        entity: 'SaaSTemplate',
        record: await base44.entities.SaaSTemplate.create({
          template_id: tid,
          name: analysis.name,
          saas_type: analysis.sub_type || 'subscription',
          industry: analysis.industry || 'general',
          architecture: analysis.architecture || {},
          subscription_tiers: analysis.subscription_tiers || [],
          layout: analysis.layout || '',
          tone: analysis.tone || '#0b1523',
          accent: analysis.accent || '#00d4ff',
          ink: analysis.ink || '#ffffff',
          head: analysis.head || '',
          sub: analysis.sub || '',
        }),
      };

    case 'funnel':
      return {
        entity: 'FunnelTemplate',
        record: await base44.entities.FunnelTemplate.create({
          template_id: tid,
          name: analysis.name,
          funnel_type: analysis.sub_type || 'lead_gen',
          industry: analysis.industry || 'general',
          steps: analysis.steps || [],
          layout: analysis.layout || '',
          tone: analysis.tone || '#0b1523',
          accent: analysis.accent || '#00d4ff',
          ink: analysis.ink || '#ffffff',
          head: analysis.head || '',
          sub: analysis.sub || '',
        }),
      };

    case 'chat_ui':
      return {
        entity: 'ChatUITemplate',
        record: await base44.entities.ChatUITemplate.create({
          template_id: tid,
          name: analysis.name,
          chat_type: analysis.sub_type || 'support_bot',
          industry: analysis.industry || 'general',
          demo_conversation: analysis.demo_conversation || [],
          layout: analysis.layout || '',
          tone: analysis.tone || '#0b1523',
          accent: analysis.accent || '#00d4ff',
          ink: analysis.ink || '#ffffff',
        }),
      };

    case 'workflow':
      return {
        entity: 'WorkflowTemplate',
        record: await base44.entities.WorkflowTemplate.create({
          template_id: tid,
          name: analysis.name,
          workflow_type: analysis.sub_type || 'automation',
          industry: analysis.industry || 'general',
          trigger: analysis.trigger || '',
          steps: analysis.steps || [],
          integrations: analysis.integrations || [],
          description: analysis.description || '',
        }),
      };

    default:
      throw new Error(`Unknown template type: ${type}`);
  }
}

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { filename, content, overrideType, install = true } = body;

    if (!content || !content.trim()) return Response.json({ error: 'content is required' }, { status: 400 });
    if (!filename) return Response.json({ error: 'filename is required' }, { status: 400 });

    // Truncate very large content
    const truncated = content.length > 30000 ? content.substring(0, 30000) + '\n...[truncated]' : content;

    // Step 1+2+3: Classify + Universalize + Organize in one AI call
    const analysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
      model: 'claude-sonnet-5',
      prompt: buildPrompt(filename, truncated, overrideType),
      response_json_schema: ANALYSIS_SCHEMA,
    });

    const result = {
      filename,
      template_type: analysis.template_type,
      sub_type: analysis.sub_type,
      name: analysis.name,
      industry: analysis.industry,
      confidence: analysis.confidence,
      reasoning: analysis.reasoning,
      colors: { tone: analysis.tone, ink: analysis.ink, accent: analysis.accent },
      installed: false,
      entity: null,
      record_id: null,
    };

    // Step 4: Install into the appropriate entity
    if (install) {
      try {
        const { entity, record } = await installTemplate(base44, analysis);
        result.installed = true;
        result.entity = entity;
        result.record_id = record?.id || null;
      } catch (installErr) {
        result.install_error = installErr.message;
      }
    }

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}