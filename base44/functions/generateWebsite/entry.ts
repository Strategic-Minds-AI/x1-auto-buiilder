import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { buildWebsiteBlueprint } from '../../shared/generation.js';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const { businessWebsiteUrl, industry, businessName } = await req.json();
    if (!businessWebsiteUrl || !industry) {
      return Response.json({ error: 'businessWebsiteUrl and industry are required' }, { status: 400 });
    }
    const result = await buildWebsiteBlueprint(base44, { businessWebsiteUrl, industry, businessName });
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}