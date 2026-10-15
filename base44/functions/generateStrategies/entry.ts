import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { generateStrategies } from '../../shared/autoBuilder.js';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const { vision, addons } = await req.json();
    if (!vision) return Response.json({ error: 'vision is required' }, { status: 400 });
    const result = await generateStrategies(base44, { vision, addons });
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}