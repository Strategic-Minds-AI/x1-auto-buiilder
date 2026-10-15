import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Suggest top-performing templates based on business research and industry
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { industry, businessResearch, benchmark, goal } = body;

    if (!industry) {
      return Response.json({ error: 'Industry is required' }, { status: 400 });
    }

    // Load website templates matching this industry
    const { items: industryTemplates } = await base44.entities.DesignTemplate.filter(
      { category: 'website', industry: { $regex: industry, $options: 'i' } },
      { sort: 'layout', limit: 50, fields: ['template_id', 'name', 'industry', 'layout', 'tone', 'ink', 'accent', 'head', 'sub', 'eyebrow', 'cta'] }
    );

    // If no industry-specific templates, load general ones
    let templates = industryTemplates;
    if (!templates || templates.length === 0) {
      const { items: general } = await base44.entities.DesignTemplate.filter(
        { category: 'website' },
        { sort: 'layout', limit: 50, fields: ['template_id', 'name', 'industry', 'layout', 'tone', 'ink', 'accent', 'head', 'sub', 'eyebrow', 'cta'] }
      );
      templates = general;
    }

    // Use LLM to rank templates based on research data
    const templateSummary = templates.slice(0, 20).map((t) => ({
      id: t.template_id,
      name: t.name,
      layout: t.layout,
      industry: t.industry,
      head: t.head,
      sub: t.sub,
      accent: t.accent,
    }));

    const researchContext = businessResearch
      ? `Business: ${businessResearch.businessName || 'Unknown'}, Services: ${JSON.stringify(businessResearch.services || [])}, Location: ${businessResearch.location || 'Unknown'}`
      : `Industry: ${industry}`;
    const benchmarkContext = benchmark
      ? `Top competitors: ${JSON.stringify((benchmark.sites || []).slice(0, 3).map(s => s.name || s.url))}`
      : '';

    const llmResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a web design expert. Based on the business research and available templates, rank the top 6 templates that would perform best for this business.

Business Research: ${researchContext}
${benchmarkContext}
Business Goal: ${goal || 'Lead generation and brand visibility'}

Available Templates:
${JSON.stringify(templateSummary, null, 2)}

Return a JSON object with this exact schema:
{
  "suggestions": [
    {
      "template_id": "the template id",
      "rank": 1,
      "reason": "2-3 sentence explanation of why this template is ideal",
      "score": 95
    }
  ]
}

Rank by: industry match, layout appropriateness for the business type, conversion potential, and visual appeal. Return exactly 6 suggestions, best first.`,
      response_json_schema: {
        type: 'object',
        properties: {
          suggestions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                template_id: { type: 'string' },
                rank: { type: 'number' },
                reason: { type: 'string' },
                score: { type: 'number' },
              },
            },
          },
        },
      },
    });

    const suggestions = (llmResponse.suggestions || []).map((s) => {
      const template = templates.find((t) => t.template_id === s.template_id);
      return {
        ...template,
        ...s,
        rank: s.rank,
        reason: s.reason,
        score: s.score,
      };
    }).filter((s) => s.template_id);

    return Response.json({
      industry,
      suggestions,
      totalAvailable: templates.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}