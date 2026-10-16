import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { projectName, pipelineRunId, docType, systemData } = body;

    if (!projectName) return Response.json({ error: 'projectName is required' }, { status: 400 });

    // Load pipeline run data if available
    let pipelineData = null;
    if (pipelineRunId) {
      try {
        pipelineData = await base44.entities.PipelineRun.get(pipelineRunId);
      } catch { }
    }

    // Generate production-grade system document using LLM
    const doc = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a Production-Grade System Document Generator, operating at the standard of companies like OpenAI.
Generate a comprehensive system documentation package for: ${projectName}

${pipelineData ? `Pipeline data from the autonomous build:
- Mockup: ${pipelineData.mockup_url}
- Stages completed: ${pipelineData.stages?.filter(s => s.status === 'COMPLETED').length || 0}
- Backend needed: ${pipelineData.backend_needed}
- Deploy URL: ${pipelineData.deploy_url || 'pending'}
- Builder docs: ${JSON.stringify(pipelineData.builder_docs, null, 2)?.substring(0, 2000)}
- Generated frontend: ${JSON.stringify(pipelineData.generated_frontend?.component_tree, null, 2)?.substring(0, 2000)}` : ''}

${systemData ? `Additional system data: ${JSON.stringify(systemData, null, 2)}` : ''}

Generate a FULL documentation package with these sections:
1. SYSTEM_OVERVIEW: System name, description, purpose, target users
2. ARCHITECTURE: Tech stack, system architecture, data flow, component diagram (text)
3. FEATURES: Complete feature list with descriptions
4. TECHNICAL_SPECS: Frontend specs, backend specs (if applicable), database schema, API endpoints
5. COMPONENT_INVENTORY: Every component with props, states, interactions
6. DEPLOYMENT_GUIDE: Step-by-step deployment for GitHub, Vercel, Supabase, Railway
7. API_REFERENCE: Every API endpoint with method, params, response format
8. SECURITY: Security measures, auth flow, data protection
9. TESTING: Test strategy, coverage, QA checklist
10. MAINTENANCE: Update procedures, monitoring, backup strategy
11. APPENDIX: Glossary, references, changelog

Format each section in clean markdown. Be thorough and production-grade.
Return as structured JSON with sections array and full markdown content.`,
      model: "gemini_3_8_flash",
      response_json_schema: {
        type: "object",
        properties: {
          system_name: { type: "string" },
          description: { type: "string" },
          sections: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                content: { type: "string" },
              },
            },
          },
          content_markdown: { type: "string" },
          specs: { type: "object" },
        },
      },
    });

    // Store the document
    const record = await base44.entities.SystemDocument.create({
      project_name: projectName,
      pipeline_run_id: pipelineRunId || '',
      doc_type: docType || 'full_package',
      system_name: doc.system_name || projectName,
      description: doc.description || '',
      sections: doc.sections || [],
      content_markdown: doc.content_markdown || '',
      specs: doc.specs || {},
      version: '1.0.0',
      generated_at: new Date().toISOString(),
    });

    return Response.json({
      ok: true,
      documentId: record.id,
      systemName: doc.system_name,
      description: doc.description,
      sections: doc.sections,
      contentMarkdown: doc.content_markdown,
      specs: doc.specs,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}