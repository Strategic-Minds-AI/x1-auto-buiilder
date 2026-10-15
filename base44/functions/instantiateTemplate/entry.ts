import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { instantiateFromTemplate } from '../../shared/generation.js';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { templateId, variables } = await req.json();
    if (!templateId) return Response.json({ error: 'templateId is required' }, { status: 400 });
    if (!variables || typeof variables !== 'object') return Response.json({ error: 'variables object is required' }, { status: 400 });

    const template = await base44.entities.SiteTemplate.get(templateId);
    if (!template) return Response.json({ error: 'Template not found' }, { status: 404 });

    const result = await instantiateFromTemplate(base44, { template, variables });
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}