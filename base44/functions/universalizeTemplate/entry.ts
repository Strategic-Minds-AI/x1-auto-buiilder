import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { contentSchema } from '../../shared/websiteResearch.js';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { projectId } = await req.json();
    if (!projectId) return Response.json({ error: 'projectId is required' }, { status: 400 });

    const project = await base44.entities.WebsiteProject.get(projectId);
    if (!project) return Response.json({ error: 'Project not found' }, { status: 404 });
    if (!project.content) return Response.json({ error: 'Project has no content to universalize' }, { status: 400 });

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt:
        `You are a website template architect. Convert this generated website content into a reusable, universal template for the "${project.industry}" industry. ` +
        `Replace all business-specific details (company name, phone, email, address, specific city/state, and unique claims tied to one company) with placeholder variables wrapped in double braces — e.g. {{business_name}}, {{location}}, {{phone}}, {{email}}, {{tagline}}. ` +
        `Keep the structure, section order, tone, and conversion quality intact. Make the copy generic enough to fit any business in this industry, yet still specific and compelling (never vague or filler). ` +
        `Preserve the colorTokens as the template's default palette. Keep logoPrompt and heroImagePrompt generalized for the industry. ` +
        `Return JSON with: a template "name", the universalized "content" (same structure as the input content), and a "variables" array listing every placeholder you introduced with a short description.\n\n` +
        `Source content JSON:\n${JSON.stringify(project.content)}\n\n` +
        `Source business research:\n${JSON.stringify(project.business_research || {})}\n\n` +
        `Source business / industry: ${project.business_name || ''} / ${project.industry || ''}`,
      response_json_schema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          content: contentSchema,
          variables: {
            type: 'array',
            items: {
              type: 'object',
              properties: { key: { type: 'string' }, description: { type: 'string' } },
              required: ['key', 'description']
            }
          }
        },
        required: ['name', 'content', 'variables']
      }
    });

    const rec = await base44.entities.SiteTemplate.create({
      name: result.name || ((project.industry || 'Industry') + ' Universal Template'),
      industry: project.industry || '',
      source_project_id: projectId,
      template: result.content,
      variables: result.variables || []
    });

    return Response.json({ template: rec });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}