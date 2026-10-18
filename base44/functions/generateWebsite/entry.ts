import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { buildWebsiteBlueprint } from '../../shared/generation.js';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const { businessWebsiteUrl, industry, businessName, designContext } = await req.json();
    if (!industry) {
      return Response.json({ error: 'industry is required' }, { status: 400 });
    }
    const result = await buildWebsiteBlueprint(base44, { businessWebsiteUrl: businessWebsiteUrl || '', industry, businessName: businessName || '', designContext: designContext || {} });
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}