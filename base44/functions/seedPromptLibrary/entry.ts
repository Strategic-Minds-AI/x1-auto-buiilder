import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Seeds the builtin prompts from the prompt library data file into the PromptPack entity.
// Called once on first load of the Prompt Library page. Idempotent — skips prompts that already exist by name.

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin required' }, { status: 403 });

    // The builtin prompts are passed in the request body from the frontend data file
    const body = await req.json().catch(() => ({}));
    const prompts = body.prompts || [];

    if (prompts.length === 0) {
      return Response.json({ error: 'No prompts provided to seed' }, { status: 400 });
    }

    // Get existing builtin prompt names to avoid duplicates
    const { items: existing } = await base44.asServiceRole.entities.PromptPack.filter(
      { is_builtin: true },
      { limit: 200, fields: ['name'] }
    );
    const existingNames = new Set(existing.map((p: any) => p.name));

    const toCreate = prompts
      .filter((p: any) => !existingNames.has(p.name))
      .map((p: any) => ({
        name: p.name,
        description: p.description || '',
        category: p.category,
        prompt_type: p.prompt_type,
        system_prompt: p.system_prompt || '',
        user_prompt_template: p.user_prompt_template || '',
        variables: p.variables || [],
        tags: p.tags || [],
        model: p.model || 'automatic',
        response_schema: p.response_schema || null,
        is_builtin: true,
        usage_count: 0,
      }));

    let created = 0;
    if (toCreate.length > 0) {
      const res = await base44.asServiceRole.entities.PromptPack.bulkCreate(toCreate);
      created = Array.isArray(res) ? res.length : (res.records || []).length;
    }

    return Response.json({
      success: true,
      seeded: created,
      skipped: prompts.length - toCreate.length,
      total: prompts.length,
    });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}