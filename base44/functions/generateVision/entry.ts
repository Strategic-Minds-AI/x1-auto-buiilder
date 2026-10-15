import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { generateVisionStatement } from '../../shared/autoBuilder.js';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const { seed, accentColor } = await req.json();
    if (!seed) return Response.json({ error: 'seed is required' }, { status: 400 });
    const result = await generateVisionStatement(base44, { seed, accentColor });
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}