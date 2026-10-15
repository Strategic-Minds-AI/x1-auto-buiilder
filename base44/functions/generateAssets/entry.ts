import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { generateBrandAssets } from '../../shared/generation.js';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const { logoPrompt, heroImagePrompt } = await req.json();
    if (!logoPrompt || !heroImagePrompt) {
      return Response.json({ error: 'logoPrompt and heroImagePrompt are required' }, { status: 400 });
    }
    const result = await generateBrandAssets(base44, { logoPrompt, heroImagePrompt });
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}