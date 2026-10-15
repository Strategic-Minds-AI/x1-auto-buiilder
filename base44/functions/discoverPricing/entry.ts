import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Discover real published pricing for an industry using web search.
// Stores results in PricingIntelligence entity.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { industry, market, serviceCategory, projectId } = body;
    if (!industry) return Response.json({ error: 'Industry is required' }, { status: 400 });

    const prompt = `Research publicly available pricing for the ${industry} industry${market ? ` in ${market}` : ''}${serviceCategory ? `, specifically for ${serviceCategory}` : ''}.

Find real published pricing from at least 3 competitors or providers. For each price point, identify:
- competitor_name: the company name
- competitor_url: the source URL where pricing was found
- service_or_product: the specific item or service
- price_range: the observed price or price range (as a string, e.g. "$500-$1500" or "$99/month")
- price_min: minimum price in USD (number, no symbols)
- price_max: maximum price in USD (number, no symbols)
- unit: pricing unit (e.g. "per square foot", "per hour", "per month", "flat fee", "per project")
- pricing_tier: "entry" | "standard" | "premium" | "enterprise" | "custom"
- inclusions: what is included (array of strings)
- exclusions: what is NOT included (array of strings)
- confidence: "verified" (saw actual price on page) | "inferred" (estimated from context) | "unavailable"

If exact prices are not publicly available, set confidence to "unavailable" and explain what quote information would be required.

Do NOT invent prices. Only report what you can find from public sources.

Return a JSON object: { "records": [{ competitor_name, competitor_url, service_or_product, price_range, price_min, price_max, unit, pricing_tier, inclusions, exclusions, confidence }], "summary": "brief pricing strategy summary", "strategy": { "entryLevel": "recommended entry pricing", "standard": "recommended standard pricing", "premium": "recommended premium positioning", "differentiation": "pricing differentiation opportunities" } }`;

    const llmResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          records: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                competitor_name: { type: 'string' },
                competitor_url: { type: 'string' },
                service_or_product: { type: 'string' },
                price_range: { type: 'string' },
                price_min: { type: 'number' },
                price_max: { type: 'number' },
                unit: { type: 'string' },
                pricing_tier: { type: 'string' },
                inclusions: { type: 'array', items: { type: 'string' } },
                exclusions: { type: 'array', items: { type: 'string' } },
                confidence: { type: 'string' }
              },
              required: ['competitor_name', 'service_or_product', 'price_range', 'confidence']
            }
          },
          summary: { type: 'string' },
          strategy: {
            type: 'object',
            properties: {
              entryLevel: { type: 'string' },
              standard: { type: 'string' },
              premium: { type: 'string' },
              differentiation: { type: 'string' }
            }
          }
        },
        required: ['records', 'summary']
      }
    });

    // Store records in PricingIntelligence entity
    const records = llmResponse.records || [];
    if (records.length > 0) {
      const entities = records.map(r => ({
        project_id: projectId || '',
        industry,
        geography: market || '',
        competitor_name: r.competitor_name || '',
        competitor_url: r.competitor_url || '',
        service_or_product: r.service_or_product || '',
        price_range: r.price_range || '',
        price_min: r.price_min || 0,
        price_max: r.price_max || 0,
        unit: r.unit || '',
        pricing_tier: r.pricing_tier || 'standard',
        inclusions: r.inclusions || [],
        exclusions: r.exclusions || [],
        confidence: r.confidence || 'inferred',
        source_url: r.competitor_url || '',
        retrieval_date: new Date().toISOString()
      }));
      await base44.entities.PricingIntelligence.bulkCreate(entities);
    }

    return Response.json({
      industry,
      market: market || '',
      records,
      summary: llmResponse.summary || '',
      strategy: llmResponse.strategy || null,
      recordCount: records.length,
      discoveredAt: new Date().toISOString()
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}