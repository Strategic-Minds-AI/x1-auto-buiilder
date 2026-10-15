// Shared Auto Builder generation logic — vision + strategy.
// Reused by the user-facing functions and (later) the GPT sync engine.

const VISION_SCHEMA = {
  type: 'object',
  properties: {
    statement: { type: 'string', description: 'A crisp, inspiring one-paragraph vision statement' },
    type: { type: 'string', description: 'Vision type label, e.g. Website, Business, SaaS' },
    tagline: { type: 'string', description: 'Short tagline, max 8 words' },
    alternatives: {
      type: 'array',
      items: { type: 'string' },
      description: '3 alternative framings the user could pick instead'
    }
  },
  required: ['statement', 'type', 'tagline']
};

const STRATEGY_SCHEMA = {
  type: 'object',
  properties: {
    strategies: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          summary: { type: 'string' },
          why: { type: 'string' },
          tactics: { type: 'array', items: { type: 'string' } },
          addons: { type: 'array', items: { type: 'string' } },
          score: { type: 'number' }
        },
        required: ['name', 'summary', 'why', 'tactics']
      }
    }
  },
  required: ['strategies']
};

// AI-assist: refine a rough one-sentence idea into a polished vision.
export async function generateVisionStatement(base44, params) {
  const { seed, accentColor } = params;
  const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
    model: 'claude-sonnet-5',
    prompt:
      'You are a world-class business strategist helping someone start a new venture. ' +
      'They described their vision in one rough sentence: "' + (seed || '') + '".\n\n' +
      'Refine it into a crisp, inspiring one-paragraph vision statement that names WHAT they are building, WHO it serves, and the OUTCOME they want. ' +
      'Make it concrete and motivating, not generic. ' +
      'Classify the vision type in 1-3 words (e.g. Website, Business, Social Media System, SaaS, Ecommerce, Agency, App, Podcast, Local Service, Personal Brand). ' +
      'Write a short tagline (max 8 words). Provide exactly 3 alternative framings the user could pick instead (each one sentence). ' +
      'Return JSON only.',
    response_json_schema: VISION_SCHEMA
  });
  return { vision: res, accentColor: accentColor || '#00d4ff' };
}

// Generate the 10 best strategies for a vision, incorporating selected addons.
export async function generateStrategies(base44, params) {
  const { vision, addons } = params;
  const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
    model: 'claude-sonnet-5',
    prompt:
      'You are an elite growth strategist. Given this approved vision, generate the 10 BEST strategies that can be executed to realize it.\n\n' +
      'The user has expressed interest in these optional capabilities — incorporate the relevant ones into each strategy where they genuinely add value (do not force-fit): ' +
      JSON.stringify(addons || []) + '.\n\n' +
      'For EACH strategy return: a memorable name (max 5 words), a 2-3 sentence summary, why it wins for this specific vision, 4-6 concrete tactics, ' +
      'which of the optional capabilities it leverages (use the exact labels), and a 0-10 confidence score. ' +
      'Rank the 10 from strongest (score 10) to weakest. Return JSON with a "strategies" array of exactly 10.\n\n' +
      'Vision:\n' + JSON.stringify(vision),
    response_json_schema: STRATEGY_SCHEMA
  });
  return { strategies: (res && res.strategies) || [] };
}