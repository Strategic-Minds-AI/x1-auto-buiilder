import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Generate a comprehensive pricing strategy from discovered PricingIntelligence
// records. Synthesizes competitor data into actionable tiered pricing recommendations.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { projectId, industry, market } = body;

    // Gather pricing intelligence records
    let query = {};
    if (projectId) query.project_id = projectId;
    if (industry) query.industry = industry;

    const { items: pricingRecords } = await base44.entities.PricingIntelligence.filter(query, {
      sort: '-created_date',
      limit: 50,
    });

    if (!pricingRecords || pricingRecords.length === 0) {
      return Response.json({
        error: 'No pricing intelligence records found. Run discoverPricing first.',
        suggestion: 'Invoke discoverPricing with the industry and market to gather competitor pricing data.',
      }, { status: 400 });
    }

    // Build a compact summary of discovered pricing for the LLM
    const pricingSummary = pricingRecords.map(r => ({
      competitor: r.competitor_name,
      service: r.service_or_product,
      range: r.price_range,
      min: r.price_min,
      max: r.price_max,
      unit: r.unit,
      tier: r.pricing_tier,
      inclusions: (r.inclusions || []).slice(0, 5),
      confidence: r.confidence,
    }));

    const prompt = `You are a pricing strategist for a ${industry || 'service'} business${market ? ` in ${market}` : ''}.

Here is real competitor pricing data discovered from public sources:
${JSON.stringify(pricingSummary, null, 2)}

Analyze this data and generate a comprehensive pricing strategy. Provide:

1. marketPosition — where this business should position on the price spectrum ("budget" | "mid-market" | "premium" | "luxury")
2. recommendedTiers — 3-4 pricing tiers, each with:
   - name (e.g. "Starter", "Professional", "Enterprise")
   - price_min (USD number)
   - price_max (USD number)
   - unit (pricing unit)
   - target_customer (who this tier is for)
   - inclusions (array of what's included)
   - differentiator (why someone picks this tier)
3. competitiveGap — the biggest pricing gap in the market that this business can exploit
4. anchorStrategy — how to anchor pricing against competitors (psychological pricing approach)
5. valuePropositions — 3 value propositions that justify the pricing
6. riskFactors — 2-3 pricing risks to watch for
7. launchRecommendation — the recommended entry pricing for the first 90 days

Return ONLY a JSON object with these fields.`;

    const strategy = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      model: 'claude-sonnet-5',
      response_json_schema: {
        type: 'object',
        properties: {
          marketPosition: { type: 'string' },
          recommendedTiers: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                price_min: { type: 'number' },
                price_max: { type: 'number' },
                unit: { type: 'string' },
                target_customer: { type: 'string' },
                inclusions: { type: 'array', items: { type: 'string' } },
                differentiator: { type: 'string' },
              },
              required: ['name', 'price_min', 'price_max', 'unit', 'target_customer', 'inclusions', 'differentiator'],
            },
          },
          competitiveGap: { type: 'string' },
          anchorStrategy: { type: 'string' },
          valuePropositions: { type: 'array', items: { type: 'string' } },
          riskFactors: { type: 'array', items: { type: 'string' } },
          launchRecommendation: { type: 'string' },
        },
        required: ['marketPosition', 'recommendedTiers', 'competitiveGap', 'anchorStrategy', 'valuePropositions', 'riskFactors', 'launchRecommendation'],
      },
    });

    return Response.json({
      projectId: projectId || null,
      industry: industry || '',
      market: market || '',
      sourceRecords: pricingRecords.length,
      strategy,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}