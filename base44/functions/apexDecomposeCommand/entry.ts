import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// APEX Universal Build Command — decomposition engine.
// Parses a natural-language business objective into a structured execution plan
// that the frontend orchestrates through existing generator functions.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { objective } = await req.json();
    if (!objective || objective.trim().length < 10) {
      return Response.json({ error: 'A detailed business objective is required' }, { status: 400 });
    }

    const plan = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are the APEX Universal Build Command decomposition engine for a digital business factory.
Parse the operator's business objective into a structured execution plan.

Objective: "${objective}"

Extract:
- business_name: a professional business name (infer from context if not stated)
- industry: the target industry (e.g., roofing, dental, legal, e-commerce, SaaS)
- website_url: source website URL to research if mentioned (empty string if none)
- locations: array of target cities/regions if location-specific (empty array if none)
- goal: the primary conversion goal (e.g., "More qualified leads", "Online bookings")
- tone: brand tone (e.g., "Professional", "Premium", "Friendly")
- capabilities: array from these options: "website", "logo", "hero_image", "compliance", "social_30day", "analytics", "provision"
  Include "website" always. Include "logo" and "hero_image" if branding is requested.
  Include "compliance" if Google compliance/SEO is mentioned. Include "social_30day" if social media or marketing is mentioned.
  Include "analytics" if analytics/tracking is mentioned. Include "provision" if deployment/launch is mentioned.
- summary: one sentence describing what will be built

Be conservative — only include capabilities explicitly or implicitly requested.`,
      response_json_schema: {
        type: 'object',
        properties: {
          business_name: { type: 'string' },
          industry: { type: 'string' },
          website_url: { type: 'string' },
          locations: { type: 'array', items: { type: 'string' } },
          goal: { type: 'string' },
          tone: { type: 'string' },
          capabilities: { type: 'array', items: { type: 'string' } },
          summary: { type: 'string' }
        }
      }
    });

    return Response.json(plan);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}