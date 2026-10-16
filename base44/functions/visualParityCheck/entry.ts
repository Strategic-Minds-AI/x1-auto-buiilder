import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json();
    const { mockupImageUrl, siteUrl, projectId, projectName, autoTriggered } = body;

    if (!mockupImageUrl || !siteUrl) {
      return Response.json({ error: 'mockupImageUrl and siteUrl are required' }, { status: 400 });
    }

    // Create a pending check record
    const check = await base44.entities.VisualParityCheck.create({
      project_id: projectId || '',
      project_name: projectName || '',
      mockup_image_url: mockupImageUrl,
      site_url: siteUrl,
      status: 'running',
      verdict: 'BLOCKED',
      parity_score: 0,
      auto_triggered: autoTriggered || false,
    });

    try {
      // Step 1: Capture screenshot of the generated site using microlink free API
      const screenshotRes = await fetch(
        `https://api.microlink.io/?url=${encodeURIComponent(siteUrl)}&screenshot=true&meta=false&embed=screenshot.url`,
        { signal: AbortSignal.timeout(30000) }
      );
      const screenshotData = await screenshotRes.json();
      const screenshotUrl = screenshotData?.data?.screenshot?.url;

      if (!screenshotUrl) {
        throw new Error('Failed to capture site screenshot from ' + siteUrl);
      }

      // Step 2: Compare both images using InvokeLLM with vision
      const report = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are a Visual Parity Engine. You are given two images:
IMAGE 1: The approved design mockup (the source of truth).
IMAGE 2: The generated live website screenshot.

Compare them PIXEL-FOR-PIXEL and identify every visual difference. Analyze:
- Layout structure and spacing (padding, margins, grid alignment)
- Color accuracy (background, text, accent, button colors)
- Typography (font family, size, weight, line height)
- Image placement and sizing
- Component positioning and sizing
- Section order and hierarchy
- Responsive behavior visible in the screenshot
- Overall visual fidelity to the mockup

Return a structured JSON report:
- parity_score: 0-100 (100 = perfect pixel match, 90+ = MATCH, 60-89 = PARTIAL_MATCH, below 60 = MISMATCH)
- verdict: "MATCH" (90+), "PARTIAL_MATCH" (60-89), "MISMATCH" (below 60)
- differences: array of {section, issue, severity (high/medium/low), recommendation}
- summary: one paragraph overall assessment
- recommendations: array of actionable fixes to achieve pixel parity`,
        file_urls: [mockupImageUrl, screenshotUrl],
        model: "gemini_3_8_flash",
        response_json_schema: {
          type: "object",
          properties: {
            parity_score: { type: "number" },
            verdict: { type: "string", enum: ["MATCH", "PARTIAL_MATCH", "MISMATCH"] },
            differences: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  section: { type: "string" },
                  issue: { type: "string" },
                  severity: { type: "string", enum: ["high", "medium", "low"] },
                  recommendation: { type: "string" }
                }
              }
            },
            summary: { type: "string" },
            recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });

      // Update the check record with results
      await base44.entities.VisualParityCheck.update(check.id, {
        screenshot_url: screenshotUrl,
        parity_score: report.parity_score || 0,
        verdict: report.verdict || 'MISMATCH',
        differences: report.differences || [],
        recommendations: report.recommendations || [],
        summary: report.summary || '',
        status: 'completed',
      });

      return Response.json({
        ok: true,
        checkId: check.id,
        screenshotUrl,
        report,
      });
    } catch (innerErr) {
      await base44.entities.VisualParityCheck.update(check.id, {
        status: 'failed',
        error: innerErr.message,
      });
      return Response.json({ error: innerErr.message, checkId: check.id }, { status: 500 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}