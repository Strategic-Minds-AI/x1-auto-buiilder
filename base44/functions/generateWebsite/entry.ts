import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { skipTraceBusiness, benchmarkIndustry, contentSchema } from '../../shared/websiteResearch.js';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { businessWebsiteUrl, industry, businessName } = body;
    if (!businessWebsiteUrl || !industry) {
      return Response.json({ error: 'businessWebsiteUrl and industry are required' }, { status: 400 });
    }

    const businessResearch = await skipTraceBusiness(base44, businessWebsiteUrl, industry, businessName);
    const benchmark = await benchmarkIndustry(base44, industry);

    const content = await base44.asServiceRole.integrations.Core.InvokeLLM({
      model: 'claude-sonnet-5',
      prompt:
        `You are an elite website copywriter and content strategist. Generate ORIGINAL, high-converting website content for a "${industry}" business.\n\n` +
        `Business research (extracted from their existing site):\n${JSON.stringify(businessResearch)}\n\n` +
        `Design guidance from benchmarking top sites:\n${JSON.stringify(benchmark.designGuidance || benchmark)}\n\n` +
        `All copy must be 100% original — do not copy from any benchmark site. Write compelling, specific, people-first copy. Return JSON with a complete website content blueprint including a logoPrompt (detailed prompt for an AI image generator to create a clean modern professional logo mark, no text, describe style and colors) and a heroImagePrompt (detailed prompt for a cinematic photorealistic hero image representing this industry).`,
      response_json_schema: contentSchema
    });

    return Response.json({ businessResearch, benchmark, content });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}