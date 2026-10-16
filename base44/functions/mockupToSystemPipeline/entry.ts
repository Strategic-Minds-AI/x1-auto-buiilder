import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Stage executors — each returns { output, validatorResult, fixerActions }
async function executeStage(stageId, base44, context) {
  const { mockupUrl, builderDocs, generatedFrontend, backendSchema, siteUrl, projectName } = context;

  switch (stageId) {
    case "MOCKUP_INTAKE":
      return { output: { mockupUrl, registered: true } };

    case "NORMALIZATION": {
      const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are a Design Normalizer. Analyze this mockup image and extract a complete design system:
- Color palette (primary, secondary, accent, background, text — all as hex codes)
- Typography (heading font, body font, sizes, weights)
- Layout structure (grid, sections, spacing)
- Component inventory (every visible component: buttons, cards, nav, hero, forms, etc.)
- Responsive notes

Return as structured JSON.`,
        file_urls: [mockupUrl],
        model: "gemini_3_8_flash",
        response_json_schema: {
          type: "object",
          properties: {
            colors: { type: "object" },
            typography: { type: "object" },
            layout: { type: "object" },
            components: { type: "array", items: { type: "object" } },
            sections: { type: "array", items: { type: "object" } },
            summary: { type: "string" },
          },
        },
      });
      return { output: res };
    }

    case "TRANSCRIPTION": {
      const normalization = context.stages.find(s => s.id === "NORMALIZATION")?.output;
      const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are a Builder Document Transcriber. Convert this design analysis into structured builder documents:
${JSON.stringify(normalization, null, 2)}

Generate:
1. component_specs: every component with props, states, and responsive behavior
2. layout_system: grid system, breakpoints, spacing scale
3. content_structure: text content for each section
4. interaction_map: every clickable element and its behavior
5. page_structure: section order and hierarchy

Return as structured JSON.`,
        response_json_schema: {
          type: "object",
          properties: {
            component_specs: { type: "array", items: { type: "object" } },
            layout_system: { type: "object" },
            content_structure: { type: "object" },
            interaction_map: { type: "array", items: { type: "object" } },
            page_structure: { type: "array", items: { type: "object" } },
          },
        },
      });
      return { output: res, builderDocs: res };
    }

    case "FRONTEND_GENERATION": {
      const docs = context.stages.find(s => s.id === "TRANSCRIPTION")?.output;
      const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are a Frontend Builder. Generate production React + Tailwind code from these builder documents:
${JSON.stringify(docs, null, 2)}

Generate:
1. component_tree: hierarchical component structure
2. code_files: array of {filename, content} for each React component
3. styles: Tailwind config and custom CSS
4. responsive_notes: breakpoint handling

Return as structured JSON.`,
        response_json_schema: {
          type: "object",
          properties: {
            component_tree: { type: "object" },
            code_files: { type: "array", items: { type: "object", properties: { filename: { type: "string" }, content: { type: "string" } } } },
            styles: { type: "object" },
            responsive_notes: { type: "string" },
          },
        },
      });
      return { output: res, generatedFrontend: res };
    }

    case "BACKEND_COORDINATION": {
      const docs = context.stages.find(s => s.id === "TRANSCRIPTION")?.output;
      const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are a Backend Coordinator. Analyze these builder documents and determine if a backend is needed:
${JSON.stringify(docs, null, 2)}

Determine:
1. backend_needed: true if any feature requires data persistence, auth, or API
2. If needed: supabase_schema (tables, columns, relationships), api_routes, auth_requirements
3. If not needed: explain why (static site)

Return as structured JSON.`,
        response_json_schema: {
          type: "object",
          properties: {
            backend_needed: { type: "boolean" },
            reason: { type: "string" },
            supabase_schema: { type: "object" },
            api_routes: { type: "array", items: { type: "object" } },
            auth_requirements: { type: "object" },
          },
        },
      });
      return { output: res, backendNeeded: res.backend_needed, backendSchema: res.backend_needed ? res.supabase_schema : null };
    }

    case "VALIDATION_GATE_1":
    case "VALIDATION_GATE_2": {
      const target = stageId === "VALIDATION_GATE_1"
        ? { frontend: context.stages.find(s => s.id === "FRONTEND_GENERATION")?.output, backend: context.stages.find(s => s.id === "BACKEND_COORDINATION")?.output }
        : { fullSystem: context.stages.map(s => ({ stage: s.id, output: s.output })) };
      const checklist = stageId === "VALIDATION_GATE_1"
        ? "gaps, missing features, spec compliance, code quality"
        : "accessibility (WCAG 2.1), performance (Lighthouse 90+), SEO, security headers, OpenAI quality standards";
      const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are an INDEPENDENT VALIDATOR. You have NO context from the builder. Cold-start review.
Analyze this system output for: ${checklist}.

System output:
${JSON.stringify(target, null, 2)}

Return:
- passed: boolean (true if all checks pass)
- score: 0-100
- issues: array of {severity, area, description, fix_required}
- summary: brief assessment`,
        response_json_schema: {
          type: "object",
          properties: {
            passed: { type: "boolean" },
            score: { type: "number" },
            issues: { type: "array", items: { type: "object", properties: { severity: { type: "string" }, area: { type: "string" }, description: { type: "string" }, fix_required: { type: "string" } } } },
            summary: { type: "string" },
          },
        },
      });
      return { output: res, validatorResult: res };
    }

    case "AUTO_FIX_1":
    case "AUTO_FIX_2": {
      const gateStage = stageId === "AUTO_FIX_1" ? "VALIDATION_GATE_1" : "VALIDATION_GATE_2";
      const validation = context.stages.find(s => s.id === gateStage)?.validatorResult;
      if (!validation || validation.passed) return { output: { skipped: true, reason: "No issues to fix" } };
      const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are an AUTONOMOUS FIXER. Fix every issue identified by the validator:
${JSON.stringify(validation.issues, null, 2)}

For each issue, provide:
- issue: the issue description
- fix: the specific code/config change to make
- file: which file to modify
- verification: how to verify the fix worked

Return as structured JSON.`,
        response_json_schema: {
          type: "object",
          properties: {
            fixes: { type: "array", items: { type: "object", properties: { issue: { type: "string" }, fix: { type: "string" }, file: { type: "string" }, verification: { type: "string" } } } },
            allAddressed: { type: "boolean" },
          },
        },
      });
      return { output: res, fixerActions: res.fixes || [] };
    }

    case "QA_PLAYWRIGHT": {
      // Call the playwrightQaAgent function
      const targetUrl = siteUrl || context.stages.find(s => s.id === "PROVISIONING")?.output?.previewUrl;
      if (!targetUrl) return { output: { skipped: true, reason: "No URL to test yet" } };
      const qaRes = await base44.functions.invoke("playwrightQaAgent", { siteUrl: targetUrl, projectName });
      return { output: qaRes.data, validatorResult: qaRes.data };
    }

    case "SEO_SYNC": {
      const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are an SEO Agent. Generate complete SEO setup for this project: ${projectName}
Based on the builder docs:
${JSON.stringify(context.stages.find(s => s.id === "TRANSCRIPTION")?.output, null, 2)}

Generate:
- sitemap_xml: complete sitemap.xml content
- robots_txt: robots.txt content
- meta_tags: title, description, og tags for each page
- structured_data: JSON-LD schema
- google_analytics_setup: GA4 measurement ID placeholder and injection code
- search_console_verification: HTML meta tag method

Return as structured JSON.`,
        response_json_schema: {
          type: "object",
          properties: {
            sitemap_xml: { type: "string" },
            robots_txt: { type: "string" },
            meta_tags: { type: "object" },
            structured_data: { type: "object" },
            google_analytics_setup: { type: "object" },
            search_console_verification: { type: "string" },
          },
        },
      });
      return { output: res };
    }

    case "PROVISIONING": {
      // Generate provisioning plan (actual deployment happens via deploySite)
      const frontend = context.stages.find(s => s.id === "FRONTEND_GENERATION")?.output;
      const backend = context.stages.find(s => s.id === "BACKEND_COORDINATION")?.output;
      const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are a DevOps Provisioner. Create a provisioning plan for this system:
Frontend: ${JSON.stringify(frontend?.component_tree, null, 2)}
Backend needed: ${backend?.backend_needed}

Generate:
- github_repo: repo name and structure
- vercel_config: build settings, env vars
- supabase_config: project settings if backend needed
- railway_config: service config if custom backend needed
- deployment_order: step-by-step deployment sequence

Return as structured JSON.`,
        response_json_schema: {
          type: "object",
          properties: {
            github_repo: { type: "object" },
            vercel_config: { type: "object" },
            supabase_config: { type: "object" },
            railway_config: { type: "object" },
            deployment_order: { type: "array", items: { type: "string" } },
          },
        },
      });
      return { output: res };
    }

    case "PRE_LAUNCH_CHECK": {
      const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are a Pre-Launch Validator. Run the FINAL checklist for project: ${projectName}
Review all pipeline stages:
${JSON.stringify(context.stages.map(s => ({ stage: s.id, status: s.status, validatorPassed: s.validatorResult?.passed })), null, 2)}

Generate a final checklist with every item and PASS/FAIL/PENDING status:
- SSL certificate configured
- DNS configured
- Google Analytics injected
- Sitemap submitted to Search Console
- robots.txt present
- Performance score 90+
- Accessibility WCAG 2.1 compliant
- Security headers present
- All buttons functional (Playwright passed)
- Visual parity 90+ vs mockup
- Mobile responsive verified
- Error boundaries in place
- 404 page configured
- Favicon configured
- Open Graph tags present

Return as structured JSON.`,
        response_json_schema: {
          type: "object",
          properties: {
            items: { type: "array", items: { type: "object", properties: { item: { type: "string" }, status: { type: "string" }, detail: { type: "string" } } } },
            allPassed: { type: "boolean" },
            readyForLaunch: { type: "boolean" },
          },
        },
      });
      return { output: res };
    }

    case "LAUNCH": {
      const preCheck = context.stages.find(s => s.id === "PRE_LAUNCH_CHECK")?.output;
      if (!preCheck?.readyForLaunch) {
        return { output: { skipped: true, reason: "Pre-launch check not passed" }, error: "Not ready for launch" };
      }
      // Actual deployment would call deploySite
      return { output: { launched: true, deployUrl: siteUrl || "pending-deployment" } };
    }

    case "POST_LAUNCH_VERIFY": {
      const mockupUrl = context.mockupUrl;
      const liveUrl = context.stages.find(s => s.id === "LAUNCH")?.output?.deployUrl;
      if (!liveUrl || !mockupUrl) return { output: { skipped: true } };
      // Call visualParityCheck
      try {
        const parityRes = await base44.functions.invoke("visualParityCheck", {
          mockupImageUrl: mockupUrl,
          siteUrl: liveUrl,
          projectName,
          autoTriggered: true,
        });
        return { output: parityRes.data, validatorResult: parityRes.data?.report };
      } catch (e) {
        return { output: { error: e.message } };
      }
    }

    default:
      return { output: { skipped: true, reason: "Unknown stage" } };
  }
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { pipelineRunId, action, mockupUrl, projectName, clientName, autoLaunch, siteUrl } = body;

    // Create or load pipeline run
    let run;
    if (pipelineRunId) {
      run = await base44.entities.PipelineRun.get(pipelineRunId);
    } else {
      if (!mockupUrl || !projectName) {
        return Response.json({ error: 'mockupUrl and projectName required for new pipeline' }, { status: 400 });
      }
      const stages = STAGE_DEFINITIONS.map(s => ({
        id: s.id,
        label: s.label,
        status: "PENDING",
        agent: s.agent,
        started_at: null,
        completed_at: null,
        validator_result: null,
        fixer_actions: [],
        output: null,
        error: null,
        retry_count: 0,
      }));
      run = await base44.entities.PipelineRun.create({
        project_name: projectName,
        client_name: clientName || '',
        mockup_url: mockupUrl,
        status: 'intake',
        current_stage: 'MOCKUP_INTAKE',
        current_stage_index: 0,
        stages,
        auto_launch: autoLaunch !== false,
      });
    }

    const act = action || 'advance';
    const maxStagesPerCall = act === 'auto_run' ? 5 : 1;
    let stagesProcessed = 0;

    while (stagesProcessed < maxStagesPerCall) {
      const currentIdx = run.current_stage_index;
      if (currentIdx >= run.stages.length) break;

      const stage = run.stages[currentIdx];
      if (stage.status === "COMPLETED" || stage.status === "SKIPPED") {
        run.current_stage_index = currentIdx + 1;
        continue;
      }

      // Execute the stage
      stage.status = "IN_PROGRESS";
      stage.started_at = new Date().toISOString();
      run = await base44.entities.PipelineRun.update(run.id, {
        stages: run.stages,
        current_stage: stage.id,
        current_stage_index: currentIdx,
        status: 'processing',
      });

      try {
        const context = {
          mockupUrl: run.mockup_url,
          projectName: run.project_name,
          siteUrl: siteUrl || run.deploy_url,
          stages: run.stages,
        };

        const result = await executeStage(stage.id, base44, context);

        stage.status = "COMPLETED";
        stage.completed_at = new Date().toISOString();
        stage.output = result.output || null;
        stage.validator_result = result.validatorResult || null;
        stage.fixer_actions = result.fixerActions || [];

        // Update builder docs / frontend / backend if returned
        const updateFields = { stages: run.stages };
        if (result.builderDocs) updateFields.builder_docs = result.builderDocs;
        if (result.generatedFrontend) updateFields.generated_frontend = result.generatedFrontend;
        if (result.backendNeeded !== undefined) updateFields.backend_needed = result.backendNeeded;
        if (result.backendSchema) updateFields.backend_schema = result.backendSchema;
        if (stage.id === "LAUNCH" && result.output?.deployUrl) updateFields.deploy_url = result.output.deployUrl;
        if (stage.id === "PRE_LAUNCH_CHECK") updateFields.final_checklist = result.output?.items || [];
        if (stage.id === "POST_LAUNCH_VERIFY" && result.output?.report?.parity_score) {
          updateFields.parity_score = result.output.report.parity_score;
        }

        run = await base44.entities.PipelineRun.update(run.id, updateFields);
        run.current_stage_index = currentIdx + 1;
      } catch (stageErr) {
        stage.status = "FAILED";
        stage.error = stageErr.message;
        stage.retry_count = (stage.retry_count || 0) + 1;
        await base44.entities.PipelineRun.update(run.id, { stages: run.stages, status: 'failed' });
        return Response.json({ error: `Stage ${stage.id} failed: ${stageErr.message}`, pipelineRun: run }, { status: 500 });
      }

      stagesProcessed++;
    }

    // Update final status
    if (run.current_stage_index >= run.stages.length) {
      run = await base44.entities.PipelineRun.update(run.id, { status: 'live' });
    }

    return Response.json({ ok: true, pipelineRun: run });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// Minimal stage definitions (mirrors src/data/pipelineStages.js)
const STAGE_DEFINITIONS = [
  { id: "MOCKUP_INTAKE", label: "Mockup Intake", agent: "mockup_ingestor" },
  { id: "NORMALIZATION", label: "Design Normalization", agent: "design_normalizer" },
  { id: "TRANSCRIPTION", label: "Builder Document Transcription", agent: "doc_transcriber" },
  { id: "FRONTEND_GENERATION", label: "Frontend Replication", agent: "frontend_builder" },
  { id: "BACKEND_COORDINATION", label: "Backend Coordination", agent: "backend_coordinator" },
  { id: "VALIDATION_GATE_1", label: "Independent Validation Gate 1", agent: "validator_agent" },
  { id: "AUTO_FIX_1", label: "Autonomous Fix Cycle 1", agent: "fixer_agent" },
  { id: "QA_PLAYWRIGHT", label: "Playwright Browser QA", agent: "qa_agent" },
  { id: "VALIDATION_GATE_2", label: "OpenAI Quality Checklist Gate", agent: "validator_agent" },
  { id: "AUTO_FIX_2", label: "Autonomous Fix Cycle 2", agent: "fixer_agent" },
  { id: "SEO_SYNC", label: "Google Systems Sync", agent: "seo_agent" },
  { id: "PROVISIONING", label: "Infrastructure Provisioning", agent: "devops_agent" },
  { id: "PRE_LAUNCH_CHECK", label: "Final Pre-Launch Checklist", agent: "validator_agent" },
  { id: "LAUNCH", label: "Autonomous Launch", agent: "launch_agent" },
  { id: "POST_LAUNCH_VERIFY", label: "Post-Launch Visual Parity", agent: "design_normalizer" },
];