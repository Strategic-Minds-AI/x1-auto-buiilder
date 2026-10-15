import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Generates templates for all new library types: SaaS, B2B, Platform, Funnel,
// AI Tools, Workflows, Fonts, Chat UI, Social Kits. Called per library type.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { libraryType, count } = body;

    const validTypes = ['saas', 'b2b', 'platform', 'funnel', 'ai_tool', 'workflow', 'font', 'chat_ui', 'social_kit'];
    if (!validTypes.includes(libraryType)) {
      return Response.json({ error: 'Invalid libraryType. Valid: ' + validTypes.join(', ') }, { status: 400 });
    }

    const batchCount = Math.min(count || 20, 50);
    const entityMap = {
      saas: 'SaaSTemplate', b2b: 'B2BTemplate', platform: 'PlatformTemplate',
      funnel: 'FunnelTemplate', ai_tool: 'AIToolTemplate', workflow: 'WorkflowTemplate',
      font: 'FontSystem', chat_ui: 'ChatUITemplate', social_kit: 'SocialCreativeKit'
    };
    const entityName = entityMap[libraryType];

    // Generate template definitions via LLM
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      model: 'claude-sonnet-5',
      prompt:
        'Generate ' + batchCount + ' distinct ' + libraryType + ' template definitions for a premium digital library. ' +
        'Each template must be genuinely different in structure, purpose, and target audience — not just recolored. ' +
        'Return an array of template objects. Each must include: name, type (the specific subtype), industry, ' +
        'and a brief description of what makes it unique.\n\n' +
        'For ' + libraryType + ' templates, vary the subtype across these options and distribute evenly:\n' +
        (libraryType === 'saas' ? 'subscription, vertical_saaS, ai_saas, analytics, automation, collaboration, crm, productivity, industry_specific, multi_tenant' : '') +
        (libraryType === 'b2b' ? 'procurement, quoting, enterprise_lead_capture, abm, sales_operations, product_catalog, vendor_portal, wholesale_commerce, professional_services' : '') +
        (libraryType === 'platform' ? 'marketplace, community, directory, membership, education, multi_vendor_commerce, scheduling, creator, agency, franchise, enterprise, aggregator' : '') +
        (libraryType === 'funnel' ? 'lead_gen, quote_request, consultation_booking, ecommerce_acquisition, saas_trial, webinar_registration, course_enrollment, b2b_demo, free_tool, diagnostic_assessment, membership_signup, onboarding, retention_upsell' : '') +
        (libraryType === 'ai_tool' ? 'industry_research, competitive_intel, business_strategy, branding, website_content, seo_audit, estimate_generation, lead_qualification, product_recommendation, customer_support, sales_enablement, analytics, data_extraction, document_generation, scheduling, crm_operations, social_media, workflow_automation, quality_assurance' : '') +
        (libraryType === 'workflow' ? 'automation, notification, data_sync, approval, scheduled_report, lead_routing, onboarding_sequence, retention_campaign, content_pipeline, deployment' : '') +
        (libraryType === 'font' ? 'Various Google Font pairings with different heading/body combinations' : '') +
        (libraryType === 'chat_ui' ? 'support_bot, sales_assistant, knowledge_base, agent_console, customer_service, lead_qualifier, onboarding_guide' : '') +
        (libraryType === 'social_kit' ? 'facebook, instagram, tiktok, youtube, linkedin, pinterest, twitter, threads, google_business' : '') +
        '\n\nReturn JSON array of ' + batchCount + ' objects.',
      response_json_schema: {
        type: 'object',
        properties: {
          templates: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                subtype: { type: 'string' },
                industry: { type: 'string' },
                description: { type: 'string' },
                tone: { type: 'string' },
                accent: { type: 'string' },
                ink: { type: 'string' },
                head: { type: 'string' },
                sub: { type: 'string' }
              }
            }
          }
        }
      }
    });

    const templates = result.templates || [];
    const records = templates.map((t, i) => {
      const base = {
        template_id: libraryType.toUpperCase().substring(0, 3) + String(i + 1).padStart(3, '0'),
        name: t.name,
        industry: t.industry || 'General',
        tone: t.tone || '#0f172a',
        accent: t.accent || '#00d4ff',
        ink: t.ink || '#f8fafc',
        head: t.head || t.name,
        sub: t.sub || t.description || ''
      };

      if (libraryType === 'saas') return { ...base, saas_type: t.subtype || 'subscription', architecture: { description: t.description }, subscription_tiers: [], onboarding_flow: [], roles: ['admin', 'user'] };
      if (libraryType === 'b2b') return { ...base, b2b_type: t.subtype || 'procurement', buyer_journey: [] };
      if (libraryType === 'platform') return { ...base, platform_type: t.subtype || 'marketplace', architecture: { description: t.description } };
      if (libraryType === 'funnel') return { ...base, funnel_type: t.subtype || 'lead_gen', steps: [], mobile_support: true };
      if (libraryType === 'ai_tool') return { ...base, tool_category: t.subtype || 'industry_research', inputs: {}, outputs: {}, provider: 'openai', test_cases: [] };
      if (libraryType === 'workflow') return { ...base, workflow_type: t.subtype || 'automation', trigger: 'manual', steps: [], integrations: [] };
      if (libraryType === 'font') return { ...base, heading_font: t.subtype?.split(' / ')[0] || 'Inter', body_font: t.subtype?.split(' / ')[1] || 'Inter', scale_ratio: '1.25', weights: ['400', '600', '700'], licensing: 'Google Fonts (Open Source)', google_fonts_url: 'https://fonts.google.com' };
      if (libraryType === 'chat_ui') return { ...base, chat_type: t.subtype || 'support_bot', demo_conversation: [{ role: 'user', content: 'Hello' }, { role: 'assistant', content: 'Hi! How can I help?' }], streaming: true, attachments: false };
      if (libraryType === 'social_kit') return { ...base, project_id: 'library', platform: t.subtype || 'facebook', status: 'draft' };
      return base;
    });

    const created = await base44.asServiceRole.entities[entityName].bulkCreate(records);

    return Response.json({
      libraryType,
      generated: templates.length,
      created: created.length || records.length,
      message: 'Generated ' + (created.length || records.length) + ' ' + libraryType + ' templates'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}