import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";
import {
  discoverTopSites,
  benchmarkSites,
  captureScreenshots,
  reverseEngineerSites,
  architectTemplate,
  engineerTemplate,
  isCloudBrowserAvailable,
} from "../../shared/templateFactoryEngine.ts";

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin")
      return Response.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { action, industry, subindustry, scope, jobId, forSale, price, maxCaptureSites } = body;

    // ─── START: Create job + discovery + benchmark ─────────────────
    if (action === "start") {
      if (!industry)
        return Response.json({ error: "industry is required" }, { status: 400 });

      const jobCount = await base44.asServiceRole.entities.TemplateFactoryJob.count({});
      const newJobId = `TF-${String(jobCount + 1).padStart(4, "0")}`;

      const job = await base44.entities.TemplateFactoryJob.create({
        job_id: newJobId,
        industry,
        subindustry: subindustry || "",
        scope: scope || "single_industry",
        status: "discovering",
        current_phase: "Discovering top sites via web search",
        progress_pct: 5,
        started_at: new Date().toISOString(),
        for_sale: forSale || false,
        price: price || 0,
      });

      // Phase 1: Discovery
      const sites = await discoverTopSites(base44, industry, subindustry);
      await base44.entities.TemplateFactoryJob.update(job.id, {
        discovered_sites: sites,
        status: "benchmarking",
        current_phase: `Benchmarking ${sites.length} discovered sites`,
        progress_pct: 20,
      });

      // Phase 2: Benchmark
      const benchmarks = await benchmarkSites(base44, sites);
      await base44.entities.TemplateFactoryJob.update(job.id, {
        benchmark_results: benchmarks,
        status: "capturing",
        current_phase: "Ready for visual capture",
        progress_pct: 35,
      });

      return Response.json({
        ok: true,
        jobId: job.id,
        status: "benchmarking",
        discoveredSites: sites.length,
        benchmarks: benchmarks.length,
      });
    }

    // ─── CAPTURE: Cloud browser screenshots ──────────────────────
    if (action === "capture") {
      if (!jobId)
        return Response.json({ error: "jobId is required" }, { status: 400 });
      const job = await base44.entities.TemplateFactoryJob.get(jobId);

      await base44.entities.TemplateFactoryJob.update(jobId, {
        status: "capturing",
        current_phase: "Capturing visual screenshots via Cloud Browser",
      });

      const screenshots = await captureScreenshots(
        job.benchmark_results || [],
        maxCaptureSites || 5
      );

      // Merge screenshot URLs into benchmark results
      const updatedBenchmarks = (job.benchmark_results || []).map((b) => {
        const shot = screenshots.find((s) => s.url === b.url);
        return shot ? { ...b, screenshot_url: shot.screenshot_url } : b;
      });

      await base44.entities.TemplateFactoryJob.update(jobId, {
        benchmark_results: updatedBenchmarks,
        status: "reverse_engineering",
        current_phase: "Ready for reverse engineering",
        progress_pct: 50,
      });

      return Response.json({
        ok: true,
        jobId,
        captured: screenshots.filter((s) => s.success).length,
        failed: screenshots.filter((s) => !s.success).length,
      });
    }

    // ─── REVERSE_ENGINEER: Extract design patterns ────────────────
    if (action === "reverse_engineer") {
      if (!jobId)
        return Response.json({ error: "jobId is required" }, { status: 400 });
      const job = await base44.entities.TemplateFactoryJob.get(jobId);

      const reverseEngineered = await reverseEngineerSites(
        base44,
        job.benchmark_results || [],
        job.benchmark_results || []
      );

      await base44.entities.TemplateFactoryJob.update(jobId, {
        reverse_engineered: reverseEngineered,
        status: "architecting",
        current_phase: "Ready for architecture synthesis",
        progress_pct: 65,
      });

      return Response.json({
        ok: true,
        jobId,
        patternsExtracted: reverseEngineered.length,
      });
    }

    // ─── ARCHITECT: Synthesize universal template ─────────────────
    if (action === "architect") {
      if (!jobId)
        return Response.json({ error: "jobId is required" }, { status: 400 });
      const job = await base44.entities.TemplateFactoryJob.get(jobId);

      const architecture = await architectTemplate(
        base44,
        job.reverse_engineered || [],
        job.industry,
        job.subindustry
      );

      await base44.entities.TemplateFactoryJob.update(jobId, {
        architecture,
        status: "engineering",
        current_phase: "Ready for template engineering",
        progress_pct: 80,
      });

      return Response.json({ ok: true, jobId, templateName: architecture.template_name });
    }

    // ─── ENGINEER: Generate code + store template ─────────────────
    if (action === "engineer") {
      if (!jobId)
        return Response.json({ error: "jobId is required" }, { status: 400 });
      const job = await base44.entities.TemplateFactoryJob.get(jobId);

      const output = await engineerTemplate(base44, job.architecture, job.industry);

      // Store as SiteTemplate
      const template = await base44.entities.SiteTemplate.create({
        name: job.architecture?.template_name || `${job.industry} Premium Template`,
        industry: job.industry,
        template: {
          architecture: job.architecture,
          blueprint: output.blueprint,
          component_code: output.component_code,
          preview_data: output.preview_data,
          files: output.files,
          documentation: output.documentation,
        },
        variables: output.variables || [],
      });

      const qualityScore =
        job.benchmark_results?.length > 0
          ? Math.round(
              job.benchmark_results.reduce(
                (sum, b) => sum + (b.overall_score || 0),
                0
              ) / job.benchmark_results.length
            )
          : 85;

      await base44.entities.TemplateFactoryJob.update(jobId, {
        template_output: output,
        template_id: template.id,
        quality_score: qualityScore,
        status: "completed",
        current_phase: "Template complete and stored",
        progress_pct: 100,
        completed_at: new Date().toISOString(),
      });

      return Response.json({
        ok: true,
        jobId,
        templateId: template.id,
        templateName: template.name,
        qualityScore,
      });
    }

    // ─── AUTO_RUN: Run all remaining phases ────────────────────────
    if (action === "auto_run") {
      let job;

      if (jobId) {
        job = await base44.entities.TemplateFactoryJob.get(jobId);
      } else {
        if (!industry)
          return Response.json({ error: "industry is required" }, { status: 400 });

        const jobCount = await base44.asServiceRole.entities.TemplateFactoryJob.count({});
        const newJobId = `TF-${String(jobCount + 1).padStart(4, "0")}`;
        job = await base44.entities.TemplateFactoryJob.create({
          job_id: newJobId,
          industry,
          subindustry: subindustry || "",
          scope: scope || "single_industry",
          status: "discovering",
          current_phase: "Discovering top sites",
          progress_pct: 5,
          started_at: new Date().toISOString(),
          for_sale: forSale || false,
          price: price || 0,
        });
      }

      // Phase 1: Discovery (if not done)
      if (!job.discovered_sites?.length) {
        const sites = await discoverTopSites(base44, job.industry, job.subindustry);
        await base44.entities.TemplateFactoryJob.update(job.id, {
          discovered_sites: sites,
          status: "benchmarking",
          current_phase: "Benchmarking sites",
          progress_pct: 20,
        });
        job = { ...job, discovered_sites: sites };
      }

      // Phase 2: Benchmark (if not done)
      if (!job.benchmark_results?.length) {
        const benchmarks = await benchmarkSites(base44, job.discovered_sites);
        await base44.entities.TemplateFactoryJob.update(job.id, {
          benchmark_results: benchmarks,
          progress_pct: 35,
        });
        job = { ...job, benchmark_results: benchmarks };
      }

      // Phase 3: Capture (if not done and cloud browser available)
      const hasScreenshots = (job.benchmark_results || []).some((b) => b.screenshot_url);
      if (!hasScreenshots) {
        try {
          const browserOk = await isCloudBrowserAvailable();
          if (browserOk) {
            await base44.entities.TemplateFactoryJob.update(job.id, {
              status: "capturing",
              current_phase: "Capturing screenshots",
            });
            const screenshots = await captureScreenshots(job.benchmark_results, 5);
            const updatedBenchmarks = (job.benchmark_results || []).map((b) => {
              const shot = screenshots.find((s) => s.url === b.url);
              return shot ? { ...b, screenshot_url: shot.screenshot_url } : b;
            });
            await base44.entities.TemplateFactoryJob.update(job.id, {
              benchmark_results: updatedBenchmarks,
            });
            job = { ...job, benchmark_results: updatedBenchmarks };
          }
        } catch (err) {
          // Non-critical: continue without screenshots
        }
      }

      // Phase 4: Reverse Engineer (if not done)
      if (!job.reverse_engineered?.length) {
        await base44.entities.TemplateFactoryJob.update(job.id, {
          status: "reverse_engineering",
          current_phase: "Reverse engineering patterns",
          progress_pct: 50,
        });
        const reverseEngineered = await reverseEngineerSites(
          base44,
          job.benchmark_results,
          job.benchmark_results
        );
        await base44.entities.TemplateFactoryJob.update(job.id, {
          reverse_engineered: reverseEngineered,
          progress_pct: 65,
        });
        job = { ...job, reverse_engineered: reverseEngineered };
      }

      // Phase 5: Architect (if not done)
      if (!job.architecture?.template_name) {
        await base44.entities.TemplateFactoryJob.update(job.id, {
          status: "architecting",
          current_phase: "Architecting universal template",
          progress_pct: 80,
        });
        const architecture = await architectTemplate(
          base44,
          job.reverse_engineered,
          job.industry,
          job.subindustry
        );
        await base44.entities.TemplateFactoryJob.update(job.id, {
          architecture,
        });
        job = { ...job, architecture };
      }

      // Phase 6: Engineer + Store (if not done)
      if (!job.template_output?.blueprint) {
        await base44.entities.TemplateFactoryJob.update(job.id, {
          status: "engineering",
          current_phase: "Engineering template code",
          progress_pct: 90,
        });
        const output = await engineerTemplate(base44, job.architecture, job.industry);

        const template = await base44.entities.SiteTemplate.create({
          name: job.architecture?.template_name || `${job.industry} Premium Template`,
          industry: job.industry,
          template: {
            architecture: job.architecture,
            blueprint: output.blueprint,
            component_code: output.component_code,
            preview_data: output.preview_data,
            files: output.files,
            documentation: output.documentation,
          },
          variables: output.variables || [],
        });

        const qualityScore =
          job.benchmark_results?.length > 0
            ? Math.round(
                job.benchmark_results.reduce(
                  (sum, b) => sum + (b.overall_score || 0),
                  0
                ) / job.benchmark_results.length
              )
            : 85;

        await base44.entities.TemplateFactoryJob.update(job.id, {
          template_output: output,
          template_id: template.id,
          quality_score: qualityScore,
          status: "completed",
          current_phase: "Template complete and stored",
          progress_pct: 100,
          completed_at: new Date().toISOString(),
        });

        return Response.json({
          ok: true,
          jobId: job.id,
          templateId: template.id,
          templateName: template.name,
          qualityScore,
          status: "completed",
        });
      }

      return Response.json({
        ok: true,
        jobId: job.id,
        status: job.status,
        message: "Job already completed",
      });
    }

    return Response.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    // Save error to job if jobId provided
    if (body?.jobId) {
      try {
        const base44 = createClientFromRequest(req);
        await base44.entities.TemplateFactoryJob.update(body.jobId, {
          status: "failed",
          error: error.message,
        });
      } catch { /* ignore */ }
    }
    return Response.json({ error: error.message }, { status: 500 });
  }
}