import { secrets } from "base44:runtime";

// ─── Ollama Adapter for FAANG QA Gate ───────────────────────────────
// Routes LLM calls to a local Ollama instance via an HTTPS tunnel.
// Kill switch: set USE_LOCAL_OLLAMA=false to route ALL calls to InvokeLLM (rollback).
// require_local mode: prohibits InvokeLLM fallback entirely (for verification).
//
// Security:
//   - HTTPS only; refuses credentials in URL, loopback/linklocal destinations, redirects.
//   - Authenticates tunnel with OLLAMA_TUNNEL_TOKEN (Bearer header).
//   - Bounded response sizes and request timeouts.
//   - Never logs URLs with secrets, bearer tokens, or full prompts/customer data.
//
// Audit:
//   - Every invocation logs provider, model, stage, elapsed, success/error, fallback_used, correlation_id.
//   - Fallback to InvokeLLM is tracked visibly (fallback_used=true) — never counted as local/zero-credit.

const DEFAULT_MODEL = "llama3.1:8b";
const REQUEST_TIMEOUT_MS = 120000; // 2 min for LLM inference
const MAX_RESPONSE_BYTES = 2 * 1024 * 1024; // 2MB bounded response

export interface OllamaInvokeOptions {
  prompt: string;
  response_json_schema?: Record<string, any> | null;
  model?: string; // fallback model for InvokeLLM (e.g. "claude-sonnet-5")
  file_urls?: string[] | null; // vision inputs — local Ollama cannot process; falls back to InvokeLLM
  stage?: string; // audit: which pass/heal stage
  runId?: string; // audit: correlation ID
  requireLocal?: boolean; // if true, NEVER fall back to InvokeLLM
}

export interface OllamaAuditEntry {
  provider: "ollama" | "base44";
  model: string;
  stage: string;
  elapsed_ms: number;
  success: boolean;
  error?: string;
  fallback_used: boolean;
  fallback_reason?: string;
  correlation_id: string;
  timestamp: string;
}

// ─── Transport injection for unit tests ──────────────────────────────
export type TransportFn = (url: string, init: RequestInit) => Promise<{
  ok: boolean;
  status: number;
  statusText: string;
  text: () => Promise<string>;
  headers: { get: (name: string) => string | null };
}>;

let _testTransport: TransportFn | null = null;

export function _setTransportForTesting(t: TransportFn | null): void {
  _testTransport = t;
}

// ─── Audit log (in-memory ring buffer for function lifetime) ────────
const auditLog: OllamaAuditEntry[] = [];
const MAX_AUDIT_ENTRIES = 200;

function logAudit(entry: OllamaAuditEntry): void {
  auditLog.push(entry);
  if (auditLog.length > MAX_AUDIT_ENTRIES) auditLog.shift();
}

export function getAuditLog(): OllamaAuditEntry[] {
  return [...auditLog];
}

export function clearAuditLog(): void {
  auditLog.length = 0;
}

// ─── URL validation ──────────────────────────────────────────────────
function isUnsafeDestination(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0" || host === "::1") return true;
  if (host.endsWith(".localhost") || host.endsWith(".local")) return true;
  // Linklocal
  if (host.startsWith("169.254.")) return true;
  // Private ranges — a tunnel URL should be a public host (ngrok/cloudflare)
  if (host.startsWith("10.") || host.startsWith("192.168.")) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(host)) return true;
  return false;
}

function validateTunnelUrl(rawUrl: string): URL {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error("OLLAMA_TUNNEL_URL is not a valid URL");
  }
  if (url.protocol !== "https:") throw new Error("OLLAMA_TUNNEL_URL must be HTTPS");
  if (url.username || url.password) throw new Error("OLLAMA_TUNNEL_URL must not contain credentials");
  if (isUnsafeDestination(url.hostname)) {
    throw new Error(`OLLAMA_TUNNEL_URL points at unsafe/loopback destination: ${url.hostname}`);
  }
  return url;
}

// ─── JSON extraction + schema validation ────────────────────────────
function extractJsonFromText(text: string): any {
  // Try direct parse
  try { return JSON.parse(text); } catch {}
  // Try markdown code block
  const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlock) {
    try { return JSON.parse(codeBlock[1].trim()); } catch {}
  }
  // Try first { ... } block
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try { return JSON.parse(jsonMatch[0]); } catch {}
  }
  throw new Error("Local Ollama returned non-JSON output that could not be parsed");
}

function validateAgainstSchema(data: any, schema: Record<string, any>): void {
  if (!schema || schema.type !== "object") return;
  const required: string[] = schema.required || [];
  for (const field of required) {
    if (!(field in data)) throw new Error(`Local output missing required field: ${field}`);
  }
  const props = schema.properties || {};
  for (const [key, propSchema] of Object.entries(props)) {
    if (!(key in data)) continue;
    const val = data[key];
    const expectedType = (propSchema as any).type;
    if (expectedType === "number" && typeof val !== "number") throw new Error(`Field ${key} must be number, got ${typeof val}`);
    if (expectedType === "string" && typeof val !== "string") throw new Error(`Field ${key} must be string, got ${typeof val}`);
    if (expectedType === "boolean" && typeof val !== "boolean") throw new Error(`Field ${key} must be boolean, got ${typeof val}`);
    if (expectedType === "array" && !Array.isArray(val)) throw new Error(`Field ${key} must be array, got ${typeof val}`);
    if (expectedType === "object" && (typeof val !== "object" || Array.isArray(val) || val === null)) throw new Error(`Field ${key} must be object, got ${typeof val}`);
  }
}

// ─── Safe error message (no secrets/tokens) ──────────────────────────
function safeError(msg: string): string {
  // Strip any bearer tokens or long hex strings that might leak into error text
  return msg.replace(/Bearer\s+[^\s]+/gi, "Bearer ***").substring(0, 300);
}

// ─── Main entry: invokeOllama ────────────────────────────────────────
export async function invokeOllama(base44: any, options: OllamaInvokeOptions): Promise<any> {
  const correlationId = options.runId || `ollama-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const stage = options.stage || "unknown";
  const startTime = Date.now();

  // Kill switch: USE_LOCAL_OLLAMA=false routes everything to InvokeLLM
  const useLocalFlag = secrets.get("USE_LOCAL_OLLAMA");
  const useLocal = useLocalFlag === null ? true : useLocalFlag === "true";

  if (!useLocal && !options.requireLocal) {
    return await invokeBase44(base44, options, stage, correlationId, startTime, false);
  }

  // Vision inputs (file_urls) cannot be processed by local Ollama — fall back to InvokeLLM
  if (options.file_urls && options.file_urls.length > 0) {
    if (options.requireLocal) {
      throw new Error("require_local mode: file_urls not supported by local Ollama, and fallback prohibited");
    }
    return await invokeBase44(base44, options, stage, correlationId, startTime, true, "file_urls not supported by local Ollama");
  }

  const tunnelUrl = secrets.get("OLLAMA_TUNNEL_URL");
  const tunnelToken = secrets.get("OLLAMA_TUNNEL_TOKEN");
  const localModel = secrets.get("OLLAMA_MODEL") || DEFAULT_MODEL;

  // No tunnel configured
  if (!tunnelUrl) {
    if (options.requireLocal) {
      throw new Error("require_local mode: OLLAMA_TUNNEL_URL not configured. Cannot fall back to InvokeLLM.");
    }
    return await invokeBase44(base44, options, stage, correlationId, startTime, true, "OLLAMA_TUNNEL_URL not configured");
  }

  // Validate tunnel URL
  let validatedUrl: URL;
  try {
    validatedUrl = validateTunnelUrl(tunnelUrl);
  } catch (e: any) {
    if (options.requireLocal) {
      throw new Error(`require_local mode: invalid tunnel config: ${safeError(e.message)}`);
    }
    return await invokeBase44(base44, options, stage, correlationId, startTime, true, safeError(e.message));
  }

  // Build prompt — append JSON schema instruction if needed
  let fullPrompt = options.prompt;
  if (options.response_json_schema) {
    fullPrompt += `\n\nRespond ONLY with valid JSON matching this schema: ${JSON.stringify(options.response_json_schema)}`;
  }

  const body = {
    model: localModel,
    messages: [{ role: "user", content: fullPrompt }],
    stream: false,
    ...(options.response_json_schema ? { format: "json" as const } : {}),
  };

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (tunnelToken) headers["Authorization"] = `Bearer ${tunnelToken}`;

  try {
    const transport = _testTransport || (async (url: string, init: RequestInit) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      try {
        const res = await fetch(url, { ...init, signal: controller.signal, redirect: "error" });
        return {
          ok: res.ok,
          status: res.status,
          statusText: res.statusText,
          text: () => res.text(),
          headers: res.headers,
        };
      } finally {
        clearTimeout(timeout);
      }
    });

    const res = await transport(`${validatedUrl.origin}/api/chat`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      throw new Error(`Ollama tunnel returned ${res.status}: ${errBody.substring(0, 200)}`);
    }

    const text = await res.text();
    if (text.length > MAX_RESPONSE_BYTES) throw new Error("Ollama response exceeded max size");

    const data = JSON.parse(text);
    const content = data?.message?.content || "";

    if (options.response_json_schema) {
      const parsed = extractJsonFromText(content);
      validateAgainstSchema(parsed, options.response_json_schema);
      const elapsed = Date.now() - startTime;
      logAudit({ provider: "ollama", model: localModel, stage, elapsed_ms: elapsed, success: true, fallback_used: false, correlation_id: correlationId, timestamp: new Date().toISOString() });
      return parsed;
    }

    const elapsed = Date.now() - startTime;
    logAudit({ provider: "ollama", model: localModel, stage, elapsed_ms: elapsed, success: true, fallback_used: false, correlation_id: correlationId, timestamp: new Date().toISOString() });
    return content;
  } catch (e: any) {
    const elapsed = Date.now() - startTime;
    const errMsg = safeError(e.message || String(e));

    if (options.requireLocal) {
      logAudit({ provider: "ollama", model: localModel, stage, elapsed_ms: elapsed, success: false, error: errMsg, fallback_used: false, correlation_id: correlationId, timestamp: new Date().toISOString() });
      throw new Error(`require_local mode: Ollama call failed and fallback prohibited: ${errMsg}`);
    }

    // Fallback to InvokeLLM — tracked visibly
    return await invokeBase44(base44, options, stage, correlationId, startTime, true, errMsg);
  }
}

// ─── InvokeLLM fallback (preserves original parameters) ─────────────
async function invokeBase44(
  base44: any,
  options: OllamaInvokeOptions,
  stage: string,
  correlationId: string,
  startTime: number,
  fallbackUsed: boolean,
  fallbackReason?: string
): Promise<any> {
  const model = options.model || "automatic";
  const invokeOpts: any = { prompt: options.prompt, model };
  if (options.response_json_schema) invokeOpts.response_json_schema = options.response_json_schema;
  if (options.file_urls) invokeOpts.file_urls = options.file_urls;

  try {
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM(invokeOpts);
    const elapsed = Date.now() - startTime;
    logAudit({
      provider: "base44", model, stage, elapsed_ms: elapsed, success: true,
      fallback_used: fallbackUsed, fallback_reason: fallbackReason,
      correlation_id: correlationId, timestamp: new Date().toISOString(),
    });
    return result;
  } catch (e: any) {
    const elapsed = Date.now() - startTime;
    logAudit({
      provider: "base44", model, stage, elapsed_ms: elapsed, success: false, error: safeError(e.message),
      fallback_used: fallbackUsed, fallback_reason: fallbackReason,
      correlation_id: correlationId, timestamp: new Date().toISOString(),
    });
    throw e;
  }
}