import { createClientFromRequest } from "npm:@base44/sdk@0.8.57";
import { invokeAI, AI_ALLOWED_MODELS } from "../../shared/aiGateway.ts";

// ─── AI Gateway (HTTP surface) ───────────────────────────────────────
// The single endpoint the frontend uses for AI. Holds no credentials of
// its own: it uses the app's native Base44 InvokeLLM integration through
// the service role, with model policy, fallback and truthful reporting
// handled by shared/aiGateway.ts.
//
// Requires an authenticated app user. Input is bounded (prompt length,
// model allowlist, schema shape) so the endpoint cannot be used as an
// open-ended relay.

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const {
      prompt,
      model,
      responseJsonSchema,
      addInternetContext,
      fileUrls,
      stage,
      allowDefault,
      requireModel,
    } = body || {};

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return Response.json({ error: "prompt is required" }, { status: 400 });
    }
    if (responseJsonSchema && typeof responseJsonSchema !== "object") {
      return Response.json({ error: "responseJsonSchema must be an object" }, { status: 400 });
    }
    if (fileUrls && !Array.isArray(fileUrls)) {
      return Response.json({ error: "fileUrls must be an array" }, { status: 400 });
    }
    if (addInternetContext && fileUrls?.length) {
      return Response.json(
        { error: "file_urls and add_context_from_internet cannot be combined in one request" },
        { status: 400 }
      );
    }
    if (model && !AI_ALLOWED_MODELS.includes(model)) {
      return Response.json({ error: `Model "${model}" is not permitted by the AI gateway` }, { status: 400 });
    }

    try {
      const outcome = await invokeAI(base44, {
        prompt,
        model,
        responseJsonSchema: responseJsonSchema || null,
        addInternetContext: !!addInternetContext,
        fileUrls: fileUrls || null,
        stage: stage || "frontend",
        allowDefault: !!allowDefault,
        requireModel: !!requireModel,
      });

      return Response.json({
        ok: true,
        result: outcome.result,
        requested_model: outcome.requested_model,
        actual_model: outcome.actual_model,
        status: outcome.status,
        attempts: outcome.attempts,
        degraded: outcome.degraded,
        elapsed_ms: outcome.elapsed_ms,
        errors: outcome.errors,
      });
    } catch (aiError: any) {
      // Upstream AI failure — report the real error, never a false success.
      return Response.json(
        {
          error: aiError.message,
          requested_model: aiError.requested_model || model || "gpt_5_6_sol",
          attempts: aiError.attempts || 0,
          errors: aiError.errors || [],
        },
        { status: 502 }
      );
    }
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}