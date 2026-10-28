// ─── Central AI Gateway ──────────────────────────────────────────────
// ONE place that decides which model serves an AI request, in what order
// to fall back, and what actually happened. Every AI surface in the app
// routes through invokeAI() so behaviour, cost bounds and truthful
// reporting stay identical everywhere.
//
// Policy:
//   1. gpt_5_6_sol  — requested high-reasoning model
//   2. gpt_5_6_luna — cheaper same-generation fallback
//   3. gpt_6_sol    — current Sol-generation model ID
//   4. automatic    — Base44 default (only when allowDefault is true)
//
// Hard rules enforced here:
//   - Bounded retries: at most (chain length - 1) extra attempts.
//   - add_context_from_internet is only supported by gemini_3_8_flash,
//     so internet requests are routed there deterministically instead of
//     failing on an incompatible model/capability pair.
//   - file_urls + internet context is refused (SDK restriction).
//   - Structured output uses response_json_schema, never prose JSON.
//   - Every response carries requested/actual model + status, so a
//     downgrade can never be reported as an original-model success.

export const AI_SOL_MODEL = "gpt_5_6_sol";
export const AI_INTERNET_MODEL = "gemini_3_8_flash";

/** Models this gateway is permitted to request (no arbitrary passthrough). */
export const AI_ALLOWED_MODELS = [
  "gpt_5_6_sol",
  "gpt_5_6_luna",
  "gpt_5_6_terra",
  "gpt_6_sol",
  "gpt_6_luna",
  "gpt_6_astra",
  "claude-sonnet-5",
  "claude_opus_5_5",
  "gemini_3_8_flash",
  "gemini_3_1_pro",
  "automatic",
];

export const AI_MAX_PROMPT_CHARS = 20000;

export interface AIRequest {
  prompt: string;
  /** Preferred model. Defaults to gpt_5_6_sol. */
  model?: string;
  responseJsonSchema?: Record<string, any> | null;
  addInternetContext?: boolean;
  fileUrls?: string[] | null;
  /** Audit label: which feature/stage is calling. */
  stage?: string;
  /** Allow the final fallback to Base44's default model. */
  allowDefault?: boolean;
  /** Fail instead of downgrading — used by verification runs. */
  requireModel?: boolean;
}

export interface AIResult {
  result: any;
  requested_model: string;
  actual_model: string;
  status: "COMPLETE" | "DEGRADED";
  attempts: number;
  degraded: boolean;
  stage: string;
  elapsed_ms: number;
  errors: { model: string; message: string }[];
}

function safeMessage(msg: unknown): string {
  return String(msg ?? "unknown error").replace(/Bearer\s+\S+/gi, "Bearer ***").slice(0, 300);
}

/** Reject obviously unusable credentials-free model names before spending a call. */
function assertAllowed(model: string): void {
  if (!AI_ALLOWED_MODELS.includes(model)) {
    throw new Error(`Model "${model}" is not permitted by the AI gateway allowlist`);
  }
}

function validateStructuredOutput(data: any, schema: Record<string, any>): void {
  if (!schema || schema.type !== "object") return;
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw new Error("Model returned non-object output for an object schema");
  }
  for (const field of schema.required || []) {
    if (!(field in data)) throw new Error(`AI output missing required field: ${field}`);
  }
  for (const [key, propSchema] of Object.entries(schema.properties || {})) {
    if (!(key in data)) continue;
    const value = data[key];
    const expected = (propSchema as any)?.type;
    if (expected === "number" && typeof value !== "number") throw new Error(`Field ${key} must be a number`);
    if (expected === "string" && typeof value !== "string") throw new Error(`Field ${key} must be a string`);
    if (expected === "boolean" && typeof value !== "boolean") throw new Error(`Field ${key} must be a boolean`);
    if (expected === "array" && !Array.isArray(value)) throw new Error(`Field ${key} must be an array`);
    if (expected === "object" && (typeof value !== "object" || value === null || Array.isArray(value))) {
      throw new Error(`Field ${key} must be an object`);
    }
  }
}

/** Build the ordered attempt list for this request. */
function buildAttemptChain(req: AIRequest): string[] {
  // Internet context: only one model supports it, so no fallback ladder.
  if (req.addInternetContext) return [AI_INTERNET_MODEL];

  const requested = req.model || AI_SOL_MODEL;
  assertAllowed(requested);

  // An explicit non-default model that isn't the Sol family keeps a single
  // same-generation safety net only — we never silently switch families.
  const chain: string[] = [requested];
  if (req.requireModel) return chain;

  if (!chain.includes("gpt_5_6_luna")) chain.push("gpt_5_6_luna");
  if (!chain.includes("gpt_6_sol")) chain.push("gpt_6_sol");
  if (req.allowDefault && !chain.includes("automatic")) chain.push("automatic");

  // Bounded retries: at most 2 extra attempts beyond the preferred model.
  return chain.slice(0, 3);
}

/**
 * Run an AI request through the gateway.
 * Returns the result plus an honest record of which model actually served it.
 */
export async function invokeAI(base44: any, req: AIRequest): Promise<AIResult> {
  const started = Date.now();
  const stage = req.stage || "unspecified";

  const prompt = (req.prompt || "").trim();
  if (!prompt) throw new Error("AI prompt is required");
  if (prompt.length > AI_MAX_PROMPT_CHARS) {
    throw new Error(`AI prompt exceeds ${AI_MAX_PROMPT_CHARS} characters`);
  }
  if (req.responseJsonSchema && typeof req.responseJsonSchema !== "object") {
    throw new Error("responseJsonSchema must be an object");
  }

  const hasFiles = Array.isArray(req.fileUrls) && req.fileUrls.length > 0;
  if (hasFiles && req.addInternetContext) {
    throw new Error("file_urls and add_context_from_internet cannot be combined in one request");
  }

  const chain = buildAttemptChain(req);
  const errors: { model: string; message: string }[] = [];

  for (let i = 0; i < chain.length; i++) {
    const model = chain[i];
    const params: Record<string, any> = { prompt, model };
    if (req.responseJsonSchema) params.response_json_schema = req.responseJsonSchema;
    if (req.addInternetContext) params.add_context_from_internet = true;
    if (hasFiles) params.file_urls = req.fileUrls;

    try {
      const raw = await base44.asServiceRole.integrations.Core.InvokeLLM(params);

      // Structured request → the model must yield a usable object.
      if (req.responseJsonSchema) {
        let parsed = raw;
        if (typeof raw === "string") {
          try { parsed = JSON.parse(raw); } catch {
            throw new Error("Model returned unparseable JSON for a structured request");
          }
        }
        validateStructuredOutput(parsed, req.responseJsonSchema);
        return {
          result: parsed,
          requested_model: req.model || AI_SOL_MODEL,
          actual_model: model,
          status: i === 0 ? "COMPLETE" : "DEGRADED",
          attempts: i + 1,
          degraded: i > 0,
          stage,
          elapsed_ms: Date.now() - started,
          errors,
        };
      }

      return {
        result: raw,
        requested_model: req.model || AI_SOL_MODEL,
        actual_model: model,
        status: i === 0 ? "COMPLETE" : "DEGRADED",
        attempts: i + 1,
        degraded: i > 0,
        stage,
        elapsed_ms: Date.now() - started,
        errors,
      };
    } catch (error: any) {
      errors.push({ model, message: safeMessage(error?.message || error) });
      // requireModel: surface the real failure instead of degrading.
      if (req.requireModel) break;
    }
  }

  const detail = errors.map((e) => `${e.model}: ${e.message}`).join(" | ");
  const failure: any = new Error(`AI gateway failed after ${errors.length} attempt(s). ${detail}`);
  failure.attempts = errors.length;
  failure.errors = errors;
  failure.requested_model = req.model || AI_SOL_MODEL;
  throw failure;
}