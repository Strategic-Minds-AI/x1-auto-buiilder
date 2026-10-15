import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { INDUSTRY_PROMPTS, DEFAULT_PROMPTS, INDUSTRY_LIST } from '../../shared/industryPrompts.js';

// Industry prompt library generator — creates PromptPack records for each
// industry and prompt type combination.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { industries, promptTypes } = body;

    const targetIndustries = industries || INDUSTRY_LIST;
    const targetTypes = promptTypes || ['website_content', 'social_content', 'video_script', 'seo_audit'];

    const records = [];
    for (const industry of targetIndustries) {
      for (const type of targetTypes) {
        const prompts = INDUSTRY_PROMPTS[industry] || DEFAULT_PROMPTS;
        const systemPrompt = prompts[type] || DEFAULT_PROMPTS[type] || '';
        records.push({
          name: industry.charAt(0).toUpperCase() + industry.slice(1) + ' — ' + type.replace(/_/g, ' '),
          industry,
          prompt_type: type,
          system_prompt: 'You are an expert content strategist for the ' + industry + ' industry.',
          user_prompt_template: systemPrompt,
          variables: [
            { key: 'businessName', description: 'The business name' },
            { key: 'location', description: 'Target location/city' },
            { key: 'tone', description: 'Brand tone of voice' }
          ],
          model: 'automatic',
          test_cases: []
        });
      }
    }

    const created = await base44.asServiceRole.entities.PromptPack.bulkCreate(records);

    return Response.json({
      generated: records.length,
      created: created.length || records.length,
      industries: targetIndustries,
      promptTypes: targetTypes,
      message: 'Generated ' + (created.length || records.length) + ' industry prompt packs'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}