import { base44 } from "@/api/base44Client";

// ─── Frontend AI Gateway ─────────────────────────────────────────────
// Every AI call in the UI goes through invokeAI(). It talks to the
// aiGateway backend function, which owns model selection, fallback and
// the real InvokeLLM call — so no API key ever exists in browser code
// and no page has to know which model served a request.
//
// The response always carries:
//   requested_model / actual_model / status / attempts / degraded
// so the UI can show exactly what happened instead of assuming success.

export const AI_STATUS = {
  IDLE: "IDLE",
  RUNNING: "RUNNING",
  COMPLETE: "COMPLETE",
  FAILED: "FAILED",
  BLOCKED: "BLOCKED",
};

export const AI_SOL_MODEL = "gpt_5_6_sol";

export async function invokeAI({
  prompt,
  model = AI_SOL_MODEL,
  responseJsonSchema = null,
  addInternetContext = false,
  fileUrls = null,
  stage = "frontend",
  allowDefault = false,
  requireModel = false,
} = {}) {
  if (!prompt || !String(prompt).trim()) {
    const err = new Error("An AI prompt is required");
    err.code = "MISSING_PROMPT";
    throw err;
  }

  let response;
  try {
    response = await base44.functions.invoke("aiGateway", {
      prompt,
      model,
      responseJsonSchema,
      addInternetContext,
      fileUrls,
      stage,
      allowDefault,
      requireModel,
    });
  } catch (requestError) {
    const payload = requestError?.response?.data;
    const err = new Error(payload?.error || requestError.message || "AI request failed");
    err.code = "AI_REQUEST_FAILED";
    err.requested_model = payload?.requested_model || model;
    err.attempts = payload?.attempts || 0;
    err.errors = payload?.errors || [];
    throw err;
  }

  const data = response?.data || {};
  if (!data.ok) {
    const err = new Error(data.error || "AI request failed");
    err.code = "AI_REQUEST_FAILED";
    err.requested_model = data.requested_model || model;
    err.attempts = data.attempts || 0;
    err.errors = data.errors || [];
    throw err;
  }

  return data;
}

/**
 * Small labelled probe used by the diagnostics surface.
 * Asks for a tiny structured answer so a real round-trip is provable.
 */
export async function probeAIModel({ model = AI_SOL_MODEL, requireModel = false } = {}) {
  return invokeAI({
    prompt:
      "Return a JSON object confirming this request was served. " +
      'Set "answer" to the single word "online" and "capabilities" to a short array of two words describing what you can do.',
    model,
    requireModel,
    stage: "gateway_probe",
    responseJsonSchema: {
      type: "object",
      properties: {
        answer: { type: "string" },
        capabilities: { type: "array", items: { type: "string" } },
      },
      required: ["answer", "capabilities"],
    },
  });
}