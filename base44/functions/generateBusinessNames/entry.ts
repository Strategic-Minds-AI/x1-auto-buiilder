import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Generate 10 naming directions internally, present 3 approval-ready brand name options.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { industry, market, positioning, tone, businessModel } = body;
    if (!industry) return Response.json({ error: 'Industry is required' }, { status: 400 });

    const prompt = `You are an elite brand naming strategist. Generate exactly 3 professionally developed brand name options for a business with these parameters:

Industry: ${industry}
Market: ${market || 'General'}
Positioning: ${positioning || 'Professional'}
Tone: ${tone || 'Trustworthy and approachable'}
Business Model: ${businessModel || 'Service-based'}

For EACH of the 3 names, provide:
1. name — the brand name (memorable, pronounceable, brandable)
2. positioning — one-sentence brand positioning statement
3. rationale — why this name works for this industry (2-3 sentences)
4. logoDirection — brief visual direction for the logo
5. palettePreview — 3 hex colors that represent the brand
6. domainOptions — 3 suggested domain variations (.com, .io, .ai etc)
7. confidence — "high" | "medium" | "low"
8. legalNote — brief trademark/conflict review note

Consider memorability, pronunciation, brand differentiation, naming conflicts, social identity potential, and domain suitability.

Return ONLY a JSON object: { "options": [{ "name", "positioning", "rationale", "logoDirection", "palettePreview": ["#hex", "#hex", "#hex"], "domainOptions": ["domain1.com", "domain2.io", "domain3.ai"], "confidence", "legalNote" }] }`;

    const llmResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          options: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                positioning: { type: 'string' },
                rationale: { type: 'string' },
                logoDirection: { type: 'string' },
                palettePreview: { type: 'array', items: { type: 'string' } },
                domainOptions: { type: 'array', items: { type: 'string' } },
                confidence: { type: 'string' },
                legalNote: { type: 'string' }
              },
              required: ['name', 'positioning', 'rationale', 'logoDirection', 'palettePreview', 'domainOptions', 'confidence', 'legalNote']
            }
          }
        },
        required: ['options']
      }
    });

    return Response.json({
      industry,
      options: llmResponse.options || [],
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}