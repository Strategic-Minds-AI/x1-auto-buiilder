import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";

// ─── FAANG QA Gate — 4-Pass Scoring with Auto-Heal ──────────────────
// Adapted from UACS (Universal Autonomous Coding System) governance.
// Pass 1: Code Quality (0-25) — TypeScript, ESLint, React best practices, security
// Pass 2: Visual Parity (0-25) — Design system vs benchmarked top sites
// Pass 3: Functional (0-25) — All sections, forms, CTAs, navigation, error states
// Pass 4: Performance (0-25) — Performance, accessibility, SEO
// Total >= 90 → SHIP | 70-89 → AUTO_HEAL (max 3 iterations) | <70 → REBUILD

const SHIP_THRESHOLD = 90;
const HEAL_THRESHOLD = 70;

// ─── Pass 1: Code Quality ───────────────────────────────────────────
async function pass1CodeQuality(base44, templateOutput) {
  const componentCode = JSON.stringify(templateOutput?.component_code || {}).substring(0, 8000);
  const files = JSON.stringify(templateOutput?.files || []).substring(0, 4000);

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `You are a FAANG-level code quality auditor. Analyze this generated template code and score it 0-25.

Check each criterion (deduct points for failures):
- TypeScript best practices: proper types, interfaces, no "any" (0-5)
- ESLint compliance: no unused vars, no console.logs, no TODOs, no debugger (0-5)
- React best practices: proper hooks usage, component structure, prop validation, key props (0-5)
- Security: no XSS vectors, no dangerous HTML injection, proper sanitization, no hardcoded secrets (0-5)
- Code organization: logical file structure, consistent naming, proper imports (0-5)

Component Code:
${componentCode}

Files:
${files}

Return the score and a detailed list of issues found. For each issue provide severity (critical/warning/info), message, and recommendation.`,
    model: "claude-sonnet-5",
    response_json_schema: {
      type: "object",
      properties: {
        score: { type: "number" },
        issues: {
          type: "array",
          items: {
            type: "object",
            properties: {
              severity: { type: "string" },
              message: { type: "string" },
              recommendation: { type: "string" },
            },
          },
        },
        details: { type: "string" },
      },
    },
  });
  return { score: Math.min(25, Math.max(0, result.score || 0)), issues: result.issues || [], details: result.details || "" };
}

// ─── Pass 2: Visual Parity ──────────────────────────────────────────
async function pass2VisualParity(base44, architecture, benchmarkResults, screenshots) {
  const archJson = JSON.stringify(architecture || {}).substring(0, 6000);
  const topBenchmarks = (benchmarkResults || []).slice(0, 5);
  const benchmarksJson = JSON.stringify(topBenchmarks).substring(0, 3000);
  const screenshotUrls = (screenshots || []).filter(s => s.screenshot_url).map(s => s.screenshot_url);

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `You are a FAANG-level visual design auditor. Compare this template architecture against the top benchmarked sites in the industry and score visual parity 0-25.

Check each criterion:
- Design system quality: color palette, typography, spacing match or exceed industry standard (0-5)
- Component patterns: hero, features, testimonials, pricing, CTA match best-in-class sites (0-5)
- Layout structure: section order, grid system, responsive breakpoints follow industry best practices (0-5)
- Visual polish: shadows, borders, transitions, hover states, micro-interactions (0-5)
- Brand consistency: cohesive visual language, consistent spacing, aligned elements (0-5)

Template Architecture:
${archJson}

Top Benchmarked Sites:
${benchmarksJson}

Return the score and issues. For each issue provide severity, message, and recommendation.`,
    file_urls: screenshotUrls.length > 0 ? screenshotUrls : undefined,
    model: "gemini_3_8_flash",
    response_json_schema: {
      type: "object",
      properties: {
        score: { type: "number" },
        issues: {
          type: "array",
          items: {
            type: "object",
            properties: {
              severity: { type: "string" },
              message: { type: "string" },
              recommendation: { type: "string" },
            },
          },
        },
        details: { type: "string" },
      },
    },
  });
  return { score: Math.min(25, Math.max(0, result.score || 0)), issues: result.issues || [], details: result.details || "" };
}

// ─── Pass 3: Functional ─────────────────────────────────────────────
async function pass3Functional(base44, architecture, templateOutput) {
  const archJson = JSON.stringify(architecture || {}).substring(0, 5000);
  const componentCode = JSON.stringify(templateOutput?.component_code || {}).substring(0, 6000);
  const blueprint = JSON.stringify(templateOutput?.blueprint || {}).substring(0, 3000);

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `You are a FAANG-level functional QA auditor. Analyze this template for functional completeness and score 0-25.

Check each criterion:
- Required sections present: hero, features/services, about, testimonials, pricing, CTA, contact, footer (0-5)
- Form validation: all forms have input validation, submission handlers, success/error states (0-5)
- CTA functionality: all buttons have proper actions/links, no dead buttons (0-5)
- Navigation: all nav links work, mobile menu functional, smooth scroll (0-5)
- Error states: loading states, empty states, error boundaries, 404 handling (0-5)

Template Architecture:
${archJson}

Component Code:
${componentCode}

Blueprint:
${blueprint}

Return the score and issues. For each issue provide severity, message, and recommendation.`,
    model: "claude-sonnet-5",
    response_json_schema: {
      type: "object",
      properties: {
        score: { type: "number" },
        issues: {
          type: "array",
          items: {
            type: "object",
            properties: {
              severity: { type: "string" },
              message: { type: "string" },
              recommendation: { type: "string" },
            },
          },
        },
        details: { type: "string" },
      },
    },
  });
  return { score: Math.min(25, Math.max(0, result.score || 0)), issues: result.issues || [], details: result.details || "" };
}

// ─── Pass 4: Performance ─────────────────────────────────────────────
async function pass4Performance(base44, templateOutput) {
  const componentCode = JSON.stringify(templateOutput?.component_code || {}).substring(0, 8000);
  const files = JSON.stringify(templateOutput?.files || []).substring(0, 4000);

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `You are a FAANG-level performance and accessibility auditor. Analyze this template code and score 0-25.

Check each criterion:
- Image optimization: lazy loading, responsive images, proper alt texts, no oversized images (0-5)
- Code efficiency: minimal re-renders, proper memoization, efficient state management, code splitting (0-5)
- Accessibility: ARIA labels, semantic HTML, keyboard navigation, color contrast WCAG AA, focus management (0-5)
- SEO: meta tags, Open Graph, structured data, semantic headings, canonical URLs, sitemap (0-5)
- Bundle optimization: tree-shakeable imports, no heavy dependencies, CSS optimization (0-5)

Component Code:
${componentCode}

Files:
${files}

Return the score and issues. For each issue provide severity, message, and recommendation.`,
    model: "claude-sonnet-5",
    response_json_schema: {
      type: "object",
      properties: {
        score: { type: "number" },
        issues: {
          type: "array",
          items: {
            type: "object",
            properties: {
              severity: { type: "string" },
              message: { type: "string" },
              recommendation: { type: "string" },
            },
          },
        },
        details: { type: "string" },
      },
    },
  });
  return { score: Math.min(25, Math.max(0, result.score || 0)), issues: result.issues || [], details: result.details || "" };
}

// ─── Auto-Heal: Analyze issues and generate fixes ───────────────────
async function autoHeal(base44, allIssues, templateOutput, architecture, iteration) {
  const issuesJson = JSON.stringify(allIssues).substring(0, 6000);
  const componentCode = JSON.stringify(templateOutput?.component_code || {}).substring(0, 6000);
  const archJson = JSON.stringify(architecture || {}).substring(0, 3000);

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt: `You are a FAANG-level auto-heal agent (iteration ${iteration}/3). Analyze these QA issues and generate specific code fixes.

Issues found:
${issuesJson}

Current component code:
${componentCode}

Architecture:
${archJson}

For each issue, generate a specific fix:
1. issue — the issue message
2. fix_description — what to change
3. file — which file/component to update
4. fixed_code — the corrected code for that component

Also provide:
- updated_component_code — the full updated component_code object with all fixes applied
- updated_files — the full updated files array with all fixes applied
- summary — brief summary of what was fixed

Focus on critical and warning issues first. Apply all fixes that can be resolved through code changes.`,
    model: "claude-sonnet-5",
    response_json_schema: {
      type: "object",
      properties: {
        fixes: {
          type: "array",
          items: {
            type: "object",
            properties: {
              issue: { type: "string" },
              fix_description: { type: "string" },
              file: { type: "string" },
              applied: { type: "boolean" },
            },
          },
        },
        updated_component_code: { type: "object" },
        updated_files: { type: "array", items: { type: "object" } },
        summary: { type: "string" },
      },
    },
  });
  return result;
}

// ─── Main Handler ────────────────────────────────────────────────────
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { action, jobId, templateId, maxIterations } = body;

    // ─── RUN_QA: Execute all 4 passes and score ────────────────────
    if (action === "run_qa") {
      if (!jobId) return Response.json({ error: "jobId is required" }, { status: 400 });
      const job = await base44.entities.TemplateFactoryJob.get(jobId);

      if (!job.template_output?.blueprint)
        return Response.json({ error: "Template not yet engineered. Run the engineer phase first." }, { status: 400 });

      // Create QA result record
      const qaCount = await base44.asServiceRole.entities.FaangQaResult.count({});
      const resultId = `QA-${String(qaCount + 1).padStart(4, "0")}`;

      const qaResult = await base44.entities.FaangQaResult.create({
        result_id: resultId,
        template_factory_job_id: jobId,
        template_id: job.template_id || templateId || "",
        industry: job.industry,
        status: "running",
        iteration: 1,
        max_iterations: maxIterations || 3,
        started_at: new Date().toISOString(),
      });

      // Run all 4 passes in parallel
      const [p1, p2, p3, p4] = await Promise.all([
        pass1CodeQuality(base44, job.template_output),
        pass2VisualParity(base44, job.architecture, job.benchmark_results, job.benchmark_results),
        pass3Functional(base44, job.architecture, job.template_output),
        pass4Performance(base44, job.template_output),
      ]);

      const totalScore = p1.score + p2.score + p3.score + p4.score;
      const allIssues = [
        ...p1.issues.map(i => ({ ...i, pass: "Pass 1: Code Quality" })),
        ...p2.issues.map(i => ({ ...i, pass: "Pass 2: Visual Parity" })),
        ...p3.issues.map(i => ({ ...i, pass: "Pass 3: Functional" })),
        ...p4.issues.map(i => ({ ...i, pass: "Pass 4: Performance" })),
      ];

      const verdict = totalScore >= SHIP_THRESHOLD ? "SHIP" : totalScore >= HEAL_THRESHOLD ? "AUTO_HEAL" : "REBUILD";
      const status = verdict === "SHIP" ? "passed" : verdict === "AUTO_HEAL" ? "auto_healing" : "failed";

      await base44.entities.FaangQaResult.update(qaResult.id, {
        pass1_code_quality: p1.score,
        pass2_visual_parity: p2.score,
        pass3_functional: p3.score,
        pass4_performance: p4.score,
        total_score: totalScore,
        verdict,
        issues: allIssues,
        status,
        test_report: {
          pass1: { score: p1.score, details: p1.details, issues: p1.issues },
          pass2: { score: p2.score, details: p2.details, issues: p2.issues },
          pass3: { score: p3.score, details: p3.details, issues: p3.issues },
          pass4: { score: p4.score, details: p4.details, issues: p4.issues },
        },
        completed_at: new Date().toISOString(),
      });

      return Response.json({
        ok: true,
        qaResultId: qaResult.id,
        totalScore,
        verdict,
        pass1: p1.score,
        pass2: p2.score,
        pass3: p3.score,
        pass4: p4.score,
        issuesCount: allIssues.length,
        status,
      });
    }

    // ─── AUTO_HEAL: Fix issues and re-test ─────────────────────────
    if (action === "auto_heal") {
      if (!jobId) return Response.json({ error: "jobId is required" }, { status: 400 });

      const qaResults = await base44.entities.FaangQaResult.filter(
        { template_factory_job_id: jobId },
        { sort: "-created_date", limit: 1 }
      );
      const qa = qaResults.items?.[0];
      if (!qa) return Response.json({ error: "No QA result found. Run QA first." }, { status: 400 });
      if (qa.iteration >= qa.max_iterations) return Response.json({ error: "Max iterations reached." }, { status: 400 });

      const job = await base44.entities.TemplateFactoryJob.get(jobId);

      // Run auto-heal
      const healResult = await autoHeal(
        base44,
        qa.issues,
        job.template_output,
        job.architecture,
        qa.iteration
      );

      // Apply fixes to template
      const healedOutput = {
        ...job.template_output,
        component_code: healResult.updated_component_code || job.template_output.component_code,
        files: healResult.updated_files || job.template_output.files,
      };

      // Update the SiteTemplate
      if (job.template_id) {
        await base44.entities.SiteTemplate.update(job.template_id, {
          template: {
            architecture: job.architecture,
            blueprint: healedOutput.blueprint,
            component_code: healedOutput.component_code,
            preview_data: healedOutput.preview_data,
            files: healedOutput.files,
            documentation: healedOutput.documentation,
          },
        });
      }

      // Update job with healed output
      await base44.entities.TemplateFactoryJob.update(jobId, {
        template_output: healedOutput,
      });

      await base44.entities.FaangQaResult.update(qa.id, {
        auto_fixes: healResult.fixes || [],
        healed_template_output: healedOutput,
      });

      // Re-run QA with healed template
      const [p1, p2, p3, p4] = await Promise.all([
        pass1CodeQuality(base44, healedOutput),
        pass2VisualParity(base44, job.architecture, job.benchmark_results, job.benchmark_results),
        pass3Functional(base44, job.architecture, healedOutput),
        pass4Performance(base44, healedOutput),
      ]);

      const totalScore = p1.score + p2.score + p3.score + p4.score;
      const allIssues = [
        ...p1.issues.map(i => ({ ...i, pass: "Pass 1: Code Quality" })),
        ...p2.issues.map(i => ({ ...i, pass: "Pass 2: Visual Parity" })),
        ...p3.issues.map(i => ({ ...i, pass: "Pass 3: Functional" })),
        ...p4.issues.map(i => ({ ...i, pass: "Pass 4: Performance" })),
      ];

      const verdict = totalScore >= SHIP_THRESHOLD ? "SHIP" : totalScore >= HEAL_THRESHOLD ? "AUTO_HEAL" : "REBUILD";
      const newIteration = qa.iteration + 1;
      const status = verdict === "SHIP" ? "passed" : newIteration >= qa.max_iterations ? "failed" : "auto_healing";

      await base44.entities.FaangQaResult.update(qa.id, {
        pass1_code_quality: p1.score,
        pass2_visual_parity: p2.score,
        pass3_functional: p3.score,
        pass4_performance: p4.score,
        total_score: totalScore,
        verdict,
        iteration: newIteration,
        issues: allIssues,
        status,
        test_report: {
          pass1: { score: p1.score, details: p1.details, issues: p1.issues },
          pass2: { score: p2.score, details: p2.details, issues: p2.issues },
          pass3: { score: p3.score, details: p3.details, issues: p3.issues },
          pass4: { score: p4.score, details: p4.details, issues: p4.issues },
        },
        completed_at: new Date().toISOString(),
      });

      return Response.json({
        ok: true,
        qaResultId: qa.id,
        iteration: newIteration,
        totalScore,
        verdict,
        fixesApplied: healResult.fixes?.length || 0,
        pass1: p1.score, pass2: p2.score, pass3: p3.score, pass4: p4.score,
        status,
      });
    }

    // ─── AUTO_RUN: Run 1 iteration (4 passes + heal if needed) per call ─
    // UI calls this repeatedly until SHIP or max iterations reached.
    if (action === "auto_run") {
      if (!jobId) return Response.json({ error: "jobId is required" }, { status: 400 });
      const job = await base44.entities.TemplateFactoryJob.get(jobId);

      if (!job.template_output?.blueprint)
        return Response.json({ error: "Template not yet engineered." }, { status: 400 });

      const maxIter = maxIterations || 3;

      // Find or create QA result
      const existingQa = await base44.entities.FaangQaResult.filter(
        { template_factory_job_id: jobId },
        { sort: "-created_date", limit: 1 }
      );
      let qa = existingQa.items?.[0];
      let qaResultId;

      if (!qa) {
        const qaCount = await base44.asServiceRole.entities.FaangQaResult.count({});
        const resultId = `QA-${String(qaCount + 1).padStart(4, "0")}`;
        const qaRec = await base44.entities.FaangQaResult.create({
          result_id: resultId,
          template_factory_job_id: jobId,
          template_id: job.template_id || "",
          industry: job.industry,
          status: "running",
          iteration: 0,
          max_iterations: maxIter,
          started_at: new Date().toISOString(),
        });
        qa = qaRec;
        qaResultId = qaRec.id;
      } else {
        qaResultId = qa.id;
      }

      const currentIteration = (qa.iteration || 0) + 1;
      if (currentIteration > maxIter) {
        return Response.json({ ok: false, error: "Max iterations reached", totalScore: qa.total_score, verdict: qa.verdict });
      }

      // If previous iteration already SHIPPED, stop
      if (qa.verdict === "SHIP" && qa.status === "shipped") {
        return Response.json({ ok: true, qaResultId, totalScore: qa.total_score, verdict: "SHIP", status: "shipped", message: "Already shipped" });
      }

      // Run 4 passes in parallel
      const currentOutput = qa.healed_template_output || job.template_output;
      const [p1, p2, p3, p4] = await Promise.all([
        pass1CodeQuality(base44, currentOutput),
        pass2VisualParity(base44, job.architecture, job.benchmark_results, job.benchmark_results),
        pass3Functional(base44, job.architecture, currentOutput),
        pass4Performance(base44, currentOutput),
      ]);

      const totalScore = p1.score + p2.score + p3.score + p4.score;
      const allIssues = [
        ...p1.issues.map(i => ({ ...i, pass: "Pass 1: Code Quality" })),
        ...p2.issues.map(i => ({ ...i, pass: "Pass 2: Visual Parity" })),
        ...p3.issues.map(i => ({ ...i, pass: "Pass 3: Functional" })),
        ...p4.issues.map(i => ({ ...i, pass: "Pass 4: Performance" })),
      ];

      const verdict = totalScore >= SHIP_THRESHOLD ? "SHIP" : totalScore >= HEAL_THRESHOLD ? "AUTO_HEAL" : "REBUILD";
      const status = verdict === "SHIP" ? "shipped" : currentIteration >= maxIter ? "failed" : "auto_healing";

      // Update QA result with this iteration's scores
      await base44.entities.FaangQaResult.update(qaResultId, {
        pass1_code_quality: p1.score,
        pass2_visual_parity: p2.score,
        pass3_functional: p3.score,
        pass4_performance: p4.score,
        total_score: totalScore,
        verdict,
        iteration: currentIteration,
        issues: allIssues,
        status,
        test_report: {
          pass1: { score: p1.score, details: p1.details },
          pass2: { score: p2.score, details: p2.details },
          pass3: { score: p3.score, details: p3.details },
          pass4: { score: p4.score, details: p4.details },
        },
        completed_at: new Date().toISOString(),
      });

      // If not SHIP and iterations remain, run auto-heal for next call
      if (verdict !== "SHIP" && currentIteration < maxIter) {
        const healResult = await autoHeal(base44, allIssues, currentOutput, job.architecture, currentIteration);
        const healedOutput = {
          ...currentOutput,
          component_code: healResult.updated_component_code || currentOutput.component_code,
          files: healResult.updated_files || currentOutput.files,
        };

        await base44.entities.FaangQaResult.update(qaResultId, {
          auto_fixes: healResult.fixes || [],
          healed_template_output: healedOutput,
        });

        // Update the SiteTemplate with healed code
        if (job.template_id) {
          await base44.entities.SiteTemplate.update(job.template_id, {
            template: {
              architecture: job.architecture,
              blueprint: healedOutput.blueprint,
              component_code: healedOutput.component_code,
              preview_data: healedOutput.preview_data,
              files: healedOutput.files,
              documentation: healedOutput.documentation,
            },
          });
        }

        await base44.entities.TemplateFactoryJob.update(jobId, {
          template_output: healedOutput,
          quality_score: totalScore,
        });

        return Response.json({
          ok: true,
          qaResultId,
          iteration: currentIteration,
          totalScore,
          verdict,
          fixesApplied: healResult.fixes?.length || 0,
          status: "auto_healing",
          message: `Iteration ${currentIteration} complete. Score: ${totalScore}. Healed — call again for iteration ${currentIteration + 1}.`,
        });
      }

      // SHIP or max iterations reached
      await base44.entities.TemplateFactoryJob.update(jobId, { quality_score: totalScore });

      return Response.json({
        ok: true,
        qaResultId,
        iteration: currentIteration,
        totalScore,
        verdict,
        fixesApplied: 0,
        status,
        message: verdict === "SHIP" ? "Template passed FAANG gate — ready to ship!" : `Max iterations reached. Final score: ${totalScore}. Verdict: ${verdict}.`,
      });
    }

    return Response.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}