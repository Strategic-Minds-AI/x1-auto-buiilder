import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Runs a prompt from the Prompt Library with filled-in variables via InvokeLLM.
// Accepts either an inline prompt (system_prompt + user_prompt) or a prompt pack ID.
// Returns the LLM response (string or structured JSON if response_schema is provided).

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { system_prompt, user_prompt, model, response_schema, prompt_pack_id, variables } = body;

    let finalSystemPrompt = system_prompt || '';
    let finalUserPrompt = user_prompt || '';
    let finalModel = model || 'automatic';
    let finalSchema = response_schema || null;

    // If a prompt pack ID is provided, load it and fill in variables
    if (prompt_pack_id) {
      const pack = await base44.entities.PromptPack.get(prompt_pack_id);
      finalSystemPrompt = pack.system_prompt || '';
      finalModel = pack.model || 'automatic';
      finalSchema = pack.response_schema || null;

      // Fill in the template with variables
      let template = pack.user_prompt_template || '';
      if (variables && typeof variables === 'object') {
        for (const [key, val] of Object.entries(variables)) {
          template = template.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(val));
        }
      }
      finalUserPrompt = template;

      // Increment usage count
      try {
        await base44.entities.PromptPack.update(prompt_pack_id, {
          usage_count: (pack.usage_count || 0) + 1,
        });
      } catch { /* best effort */ }
    }

    if (!finalUserPrompt) {
      return Response.json({ error: 'user_prompt or prompt_pack_id with variables is required' }, { status: 400 });
    }

    // Build the full prompt (system + user combined for InvokeLLM)
    const fullPrompt = finalSystemPrompt
      ? `${finalSystemPrompt}\n\n---\n\n${finalUserPrompt}`
      : finalUserPrompt;

    const llmParams: any = {
      prompt: fullPrompt,
    };

    if (finalModel && finalModel !== 'automatic') {
      llmParams.model = finalModel;
    }

    if (finalSchema && typeof finalSchema === 'object' && Object.keys(finalSchema).length > 0) {
      llmParams.response_json_schema = finalSchema;
    }

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM(llmParams);

    return Response.json(result);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}