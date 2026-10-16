import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";
import { secrets } from "base44:runtime";
import {
  invokeOllama, getAuditLog, clearAuditLog, _setTransportForTesting,
  type OllamaAuditEntry, type TransportFn,
} from "../../shared/ollamaClient.ts";

// ─── Ollama Diagnostic + Unit Test Runner ────────────────────────────
// Admin-only. Three actions:
//   - "run_tests": runs unit tests with mocked transport (no real LLM calls, no network)
//   - "diagnose": read-only tunnel connectivity check in require_local mode (no auto-heal, no production data)
//   - "audit_log": returns recent audit entries from the in-memory ring buffer

interface TestResult {
  name: string;
  passed: boolean;
  detail: string;
}

// ─── Mock transport factory ──────────────────────────────────────────
function mockTransport(opts: {
  status?: number;
  body?: string;
  shouldThrow?: string;
  shouldTimeout?: boolean;
}): TransportFn {
  return async (_url: string, _init: RequestInit) => {
    if (opts.shouldThrow) throw new Error(opts.shouldThrow);
    if (opts.shouldTimeout) throw new Error("The operation was aborted");
    const status = opts.status ?? 200;
    const body = opts.body ?? JSON.stringify({ message: { content: '{"score":20,"issues":[],"details":"ok"}' } });
    return {
      ok: status >= 200 && status < 300,
      status,
      statusText: status === 200 ? "OK" : "Error",
      text: async () => body,
      headers: { get: () => null },
    };
  };
}

// ─── Mock base44 client ───────────────────────────────────────────────
function mockBase44(opts: {
  invokeResult?: any;
  invokeShouldThrow?: string;
  invoked?: boolean;
}): any {
  return {
    asServiceRole: {
      integrations: {
        Core: {
          InvokeLLM: async (invokeOpts: any) => {
            opts.invoked = true;
            if (opts.invokeShouldThrow) throw new Error(opts.invokeShouldThrow);
            if (opts.invokeResult !== undefined) return opts.invokeResult;
            // Default: return a valid scored result
            return { score: 20, issues: [], details: "mock InvokeLLM" };
          },
        },
      },
    },
  };
}

// ─── Unit tests ──────────────────────────────────────────────────────
async function runAllTests(): Promise<{ total: number; passed: number; failed: number; results: TestResult[] }> {
  const results: TestResult[] = [];
  const test = async (name: string, fn: () => Promise<void>) => {
    try { await fn(); results.push({ name, passed: true, detail: "" }); }
    catch (e: any) { results.push({ name, passed: false, detail: e.message || String(e) }); }
  };

  const SCHEMA = {
    type: "object",
    properties: {
      score: { type: "number" },
      issues: { type: "array", items: { type: "object" } },
      details: { type: "string" },
    },
  };

  // Test 1: pass1 — valid JSON from local Ollama (success)
  await test("pass1_code_quality: local Ollama returns valid JSON", async () => {
    clearAuditLog();
    _setTransportForTesting(mockTransport({ body: JSON.stringify({ message: { content: '{"score":22,"issues":[],"details":"clean code"}' } }) }));
    const b44 = mockBase44({ invoked: false });
    const result = await invokeOllama(b44, { prompt: "Score this code", response_json_schema: SCHEMA, stage: "pass1_code_quality", runId: "test-1" });
    if (result.score !== 22) throw new Error("Expected score 22");
    const audit = getAuditLog();
    if (!audit.some(a => a.provider === "ollama" && a.stage === "pass1_code_quality" && a.success && !a.fallback_used)) {
      throw new Error("Expected ollama audit entry with success=true, fallback_used=false");
    }
    _setTransportForTesting(null);
  });

  // Test 2: pass2 — valid JSON from local Ollama
  await test("pass2_visual_parity: local Ollama returns valid JSON", async () => {
    clearAuditLog();
    _setTransportForTesting(mockTransport({ body: JSON.stringify({ message: { content: '{"score":18,"issues":[],"details":"good design"}' } }) }));
    const b44 = mockBase44({ invoked: false });
    const result = await invokeOllama(b44, { prompt: "Score visual parity", response_json_schema: SCHEMA, stage: "pass2_visual_parity", runId: "test-2" });
    if (result.score !== 18) throw new Error("Expected score 18");
    const audit = getAuditLog();
    if (!audit.some(a => a.provider === "ollama" && a.success && !a.fallback_used)) throw new Error("Expected ollama success audit");
    _setTransportForTesting(null);
  });

  // Test 3: pass3 — valid JSON from local Ollama
  await test("pass3_functional: local Ollama returns valid JSON", async () => {
    clearAuditLog();
    _setTransportForTesting(mockTransport({ body: JSON.stringify({ message: { content: '{"score":20,"issues":[],"details":"all sections present"}' } }) }));
    const b44 = mockBase44({ invoked: false });
    const result = await invokeOllama(b44, { prompt: "Score functional", response_json_schema: SCHEMA, stage: "pass3_functional", runId: "test-3" });
    if (result.score !== 20) throw new Error("Expected score 20");
    _setTransportForTesting(null);
  });

  // Test 4: pass4 — valid JSON from local Ollama
  await test("pass4_performance: local Ollama returns valid JSON", async () => {
    clearAuditLog();
    _setTransportForTesting(mockTransport({ body: JSON.stringify({ message: { content: '{"score":19,"issues":[],"details":"good perf"}' } }) }));
    const b44 = mockBase44({ invoked: false });
    const result = await invokeOllama(b44, { prompt: "Score performance", response_json_schema: SCHEMA, stage: "pass4_performance", runId: "test-4" });
    if (result.score !== 19) throw new Error("Expected score 19");
    _setTransportForTesting(null);
  });

  // Test 5: autoHeal — valid JSON with complex schema
  await test("auto_heal: local Ollama returns valid complex JSON", async () => {
    clearAuditLog();
    const healSchema = {
      type: "object",
      properties: {
        fixes: { type: "array", items: { type: "object" } },
        updated_component_code: { type: "object" },
        updated_files: { type: "array", items: { type: "object" } },
        summary: { type: "string" },
      },
    };
    _setTransportForTesting(mockTransport({ body: JSON.stringify({ message: { content: '{"fixes":[],"updated_component_code":{},"updated_files":[],"summary":"healed"}' } }) }));
    const b44 = mockBase44({ invoked: false });
    const result = await invokeOllama(b44, { prompt: "Heal this template", response_json_schema: healSchema, stage: "auto_heal", runId: "test-5" });
    if (result.summary !== "healed") throw new Error("Expected summary 'healed'");
    _setTransportForTesting(null);
  });

  // Test 6: USE_LOCAL_OLLAMA=false → routes to InvokeLLM (no fallback flag)
  await test("feature_flag_false: routes to InvokeLLM, fallback_used=false", async () => {
    clearAuditLog();
    _setTransportForTesting(mockTransport({ shouldThrow: "should not be called" }));
    // Temporarily set USE_LOCAL_OLLAMA=false by injecting a mock secrets getter
    const originalGet = secrets.get;
    (secrets as any).get = (name: string) => {
      if (name === "USE_LOCAL_OLLAMA") return "false";
      if (name === "OLLAMA_TUNNEL_URL") return "https://tunnel.example.com";
      if (name === "OLLAMA_TUNNEL_TOKEN") return "test-token";
      if (name === "OLLAMA_MODEL") return "llama3.1:8b";
      return null;
    };
    try {
      const b44 = mockBase44({ invoked: false, invokeResult: { score: 20, issues: [], details: "from InvokeLLM" } });
      const result = await invokeOllama(b44, { prompt: "test", response_json_schema: SCHEMA, stage: "test", runId: "test-6" });
      if (result.score !== 20) throw new Error("Expected InvokeLLM result");
      const audit = getAuditLog();
      if (!audit.some(a => a.provider === "base44" && !a.fallback_used)) throw new Error("Expected base44 audit with fallback_used=false");
    } finally {
      (secrets as any).get = originalGet;
      _setTransportForTesting(null);
    }
  });

  // Test 7: tunnel unreachable → fallback to InvokeLLM (tracked)
  await test("tunnel_unreachable: falls back to InvokeLLM, fallback_used=true", async () => {
    clearAuditLog();
    _setTransportForTesting(mockTransport({ shouldThrow: "connection refused" }));
    const originalGet = secrets.get;
    (secrets as any).get = (name: string) => {
      if (name === "USE_LOCAL_OLLAMA") return "true";
      if (name === "OLLAMA_TUNNEL_URL") return "https://tunnel.example.com";
      if (name === "OLLAMA_TUNNEL_TOKEN") return "test-token";
      if (name === "OLLAMA_MODEL") return "llama3.1:8b";
      return null;
    };
    try {
      const b44 = mockBase44({ invoked: false, invokeResult: { score: 15, issues: [], details: "fallback" } });
      const result = await invokeOllama(b44, { prompt: "test", response_json_schema: SCHEMA, stage: "test", runId: "test-7" });
      if (result.score !== 15) throw new Error("Expected fallback InvokeLLM result");
      const audit = getAuditLog();
      const fb = audit.find(a => a.provider === "base44" && a.fallback_used === true);
      if (!fb) throw new Error("Expected base44 audit with fallback_used=true");
      if (!fb.fallback_reason) throw new Error("Expected fallback_reason in audit");
    } finally {
      (secrets as any).get = originalGet;
      _setTransportForTesting(null);
    }
  });

  // Test 8: require_local + unreachable → throws (no fallback)
  await test("require_local_unreachable: throws, no InvokeLLM fallback", async () => {
    clearAuditLog();
    _setTransportForTesting(mockTransport({ shouldThrow: "connection refused" }));
    const originalGet = secrets.get;
    (secrets as any).get = (name: string) => {
      if (name === "USE_LOCAL_OLLAMA") return "true";
      if (name === "OLLAMA_TUNNEL_URL") return "https://tunnel.example.com";
      if (name === "OLLAMA_TUNNEL_TOKEN") return "test-token";
      if (name === "OLLAMA_MODEL") return "llama3.1:8b";
      return null;
    };
    try {
      const b44 = mockBase44({ invoked: false });
      let threw = false;
      try {
        await invokeOllama(b44, { prompt: "test", response_json_schema: SCHEMA, stage: "test", runId: "test-8", requireLocal: true });
      } catch (e: any) {
        threw = true;
        if (!e.message.includes("require_local")) throw new Error("Expected require_local error, got: " + e.message);
      }
      if (!threw) throw new Error("Expected throw in require_local mode");
      const audit = getAuditLog();
      if (audit.some(a => a.provider === "base44")) throw new Error("InvokeLLM must NOT be called in require_local mode");
      if (!audit.some(a => a.provider === "ollama" && a.success === false && a.fallback_used === false)) {
        throw new Error("Expected ollama audit with success=false, fallback_used=false");
      }
    } finally {
      (secrets as any).get = originalGet;
      _setTransportForTesting(null);
    }
  });

  // Test 9: invalid JSON from Ollama → fallback (normal) / throw (require_local)
  await test("invalid_json_normal: falls back to InvokeLLM", async () => {
    clearAuditLog();
    _setTransportForTesting(mockTransport({ body: JSON.stringify({ message: { content: "this is not json at all" } }) }));
    const originalGet = secrets.get;
    (secrets as any).get = (name: string) => {
      if (name === "USE_LOCAL_OLLAMA") return "true";
      if (name === "OLLAMA_TUNNEL_URL") return "https://tunnel.example.com";
      if (name === "OLLAMA_TUNNEL_TOKEN") return "test-token";
      if (name === "OLLAMA_MODEL") return "llama3.1:8b";
      return null;
    };
    try {
      const b44 = mockBase44({ invoked: false, invokeResult: { score: 10, issues: [], details: "fallback for bad json" } });
      const result = await invokeOllama(b44, { prompt: "test", response_json_schema: SCHEMA, stage: "test", runId: "test-9" });
      if (result.score !== 10) throw new Error("Expected fallback result");
      const audit = getAuditLog();
      if (!audit.some(a => a.fallback_used === true)) throw new Error("Expected fallback_used=true");
    } finally {
      (secrets as any).get = originalGet;
      _setTransportForTesting(null);
    }
  });

  await test("invalid_json_require_local: throws, no fallback", async () => {
    clearAuditLog();
    _setTransportForTesting(mockTransport({ body: JSON.stringify({ message: { content: "not json" } }) }));
    const originalGet = secrets.get;
    (secrets as any).get = (name: string) => {
      if (name === "USE_LOCAL_OLLAMA") return "true";
      if (name === "OLLAMA_TUNNEL_URL") return "https://tunnel.example.com";
      if (name === "OLLAMA_TUNNEL_TOKEN") return "test-token";
      if (name === "OLLAMA_MODEL") return "llama3.1:8b";
      return null;
    };
    try {
      const b44 = mockBase44({ invoked: false });
      let threw = false;
      try {
        await invokeOllama(b44, { prompt: "test", response_json_schema: SCHEMA, stage: "test", runId: "test-10", requireLocal: true });
      } catch { threw = true; }
      if (!threw) throw new Error("Expected throw on invalid JSON in require_local mode");
      if (getAuditLog().some(a => a.provider === "base44")) throw new Error("InvokeLLM must NOT be called");
    } finally {
      (secrets as any).get = originalGet;
      _setTransportForTesting(null);
    }
  });

  // Test 10: schema validation failure → error
  await test("schema_validation_fail: wrong type in output", async () => {
    clearAuditLog();
    _setTransportForTesting(mockTransport({ body: JSON.stringify({ message: { content: '{"score":"not a number","issues":[],"details":"x"}' } }) }));
    const originalGet = secrets.get;
    (secrets as any).get = (name: string) => {
      if (name === "USE_LOCAL_OLLAMA") return "true";
      if (name === "OLLAMA_TUNNEL_URL") return "https://tunnel.example.com";
      if (name === "OLLAMA_TUNNEL_TOKEN") return "test-token";
      if (name === "OLLAMA_MODEL") return "llama3.1:8b";
      return null;
    };
    try {
      const b44 = mockBase44({ invoked: false, invokeResult: { score: 5, issues: [], details: "fallback" } });
      // Normal mode: schema fail → fallback
      const result = await invokeOllama(b44, { prompt: "test", response_json_schema: SCHEMA, stage: "test", runId: "test-11" });
      if (result.score !== 5) throw new Error("Expected fallback result after schema validation failure");
      if (!getAuditLog().some(a => a.fallback_used === true)) throw new Error("Expected fallback");
    } finally {
      (secrets as any).get = originalGet;
      _setTransportForTesting(null);
    }
  });

  // Test 11: auth error (401) → fallback
  await test("auth_error_401: falls back to InvokeLLM", async () => {
    clearAuditLog();
    _setTransportForTesting(mockTransport({ status: 401, body: "Unauthorized" }));
    const originalGet = secrets.get;
    (secrets as any).get = (name: string) => {
      if (name === "USE_LOCAL_OLLAMA") return "true";
      if (name === "OLLAMA_TUNNEL_URL") return "https://tunnel.example.com";
      if (name === "OLLAMA_TUNNEL_TOKEN") return "test-token";
      if (name === "OLLAMA_MODEL") return "llama3.1:8b";
      return null;
    };
    try {
      const b44 = mockBase44({ invoked: false, invokeResult: { score: 12, issues: [], details: "fallback" } });
      const result = await invokeOllama(b44, { prompt: "test", response_json_schema: SCHEMA, stage: "test", runId: "test-12" });
      if (result.score !== 12) throw new Error("Expected fallback result");
      const audit = getAuditLog();
      if (!audit.some(a => a.fallback_used === true && a.fallback_reason?.includes("401"))) throw new Error("Expected 401 in fallback_reason");
    } finally {
      (secrets as any).get = originalGet;
      _setTransportForTesting(null);
    }
  });

  // Test 12: file_urls present → fallback to InvokeLLM (vision not supported locally)
  await test("file_urls_present: falls back to InvokeLLM for vision", async () => {
    clearAuditLog();
    _setTransportForTesting(mockTransport({ shouldThrow: "should not call local for file_urls" }));
    const originalGet = secrets.get;
    (secrets as any).get = (name: string) => {
      if (name === "USE_LOCAL_OLLAMA") return "true";
      if (name === "OLLAMA_TUNNEL_URL") return "https://tunnel.example.com";
      if (name === "OLLAMA_TUNNEL_TOKEN") return "test-token";
      if (name === "OLLAMA_MODEL") return "llama3.1:8b";
      return null;
    };
    try {
      const b44 = mockBase44({ invoked: false, invokeResult: { score: 18, issues: [], details: "vision fallback" } });
      const result = await invokeOllama(b44, { prompt: "test", file_urls: ["https://example.com/img.png"], response_json_schema: SCHEMA, stage: "pass2_visual_parity", runId: "test-13" });
      if (result.score !== 18) throw new Error("Expected InvokeLLM vision result");
      const audit = getAuditLog();
      if (!audit.some(a => a.fallback_used === true && a.fallback_reason?.includes("file_urls"))) {
        throw new Error("Expected file_urls fallback reason");
      }
    } finally {
      (secrets as any).get = originalGet;
      _setTransportForTesting(null);
    }
  });

  // Test 13: secret-safe logs — no tokens/URLs in audit entries
  await test("secret_safe_logs: no tokens or URLs in audit entries", async () => {
    clearAuditLog();
    _setTransportForTesting(mockTransport({ body: JSON.stringify({ message: { content: '{"score":20,"issues":[],"details":"ok"}' } }) }));
    const originalGet = secrets.get;
    (secrets as any).get = (name: string) => {
      if (name === "USE_LOCAL_OLLAMA") return "true";
      if (name === "OLLAMA_TUNNEL_URL") return "https://secret-tunnel.ngrok.app";
      if (name === "OLLAMA_TUNNEL_TOKEN") return "super-secret-token-12345";
      if (name === "OLLAMA_MODEL") return "llama3.1:8b";
      return null;
    };
    try {
      const b44 = mockBase44({ invoked: false });
      await invokeOllama(b44, { prompt: "test prompt with customer data", response_json_schema: SCHEMA, stage: "test", runId: "test-14" });
      const audit = getAuditLog();
      const auditStr = JSON.stringify(audit);
      if (auditStr.includes("super-secret-token")) throw new Error("Token leaked in audit log");
      if (auditStr.includes("secret-tunnel.ngrok.app")) throw new Error("Tunnel URL leaked in audit log");
      if (auditStr.includes("customer data")) throw new Error("Prompt content leaked in audit log");
    } finally {
      (secrets as any).get = originalGet;
      _setTransportForTesting(null);
    }
  });

  // Test 14: URL validation — refuse loopback
  await test("url_validation_loopback: refused", async () => {
    clearAuditLog();
    _setTransportForTesting(null);
    const originalGet = secrets.get;
    (secrets as any).get = (name: string) => {
      if (name === "USE_LOCAL_OLLAMA") return "true";
      if (name === "OLLAMA_TUNNEL_URL") return "https://127.0.0.1:11434";
      if (name === "OLLAMA_TUNNEL_TOKEN") return "test-token";
      if (name === "OLLAMA_MODEL") return "llama3.1:8b";
      return null;
    };
    try {
      const b44 = mockBase44({ invoked: false, invokeResult: { score: 10, issues: [], details: "fallback" } });
      // Normal mode: invalid URL → fallback
      const result = await invokeOllama(b44, { prompt: "test", response_json_schema: SCHEMA, stage: "test", runId: "test-15" });
      if (result.score !== 10) throw new Error("Expected fallback result");
      const audit = getAuditLog();
      if (!audit.some(a => a.fallback_reason?.includes("unsafe/loopback"))) throw new Error("Expected loopback rejection in fallback_reason");
    } finally {
      (secrets as any).get = originalGet;
    }
  });

  // Test 15: URL validation — refuse non-HTTPS
  await test("url_validation_non_https: refused", async () => {
    clearAuditLog();
    _setTransportForTesting(null);
    const originalGet = secrets.get;
    (secrets as any).get = (name: string) => {
      if (name === "USE_LOCAL_OLLAMA") return "true";
      if (name === "OLLAMA_TUNNEL_URL") return "http://tunnel.example.com";
      if (name === "OLLAMA_TUNNEL_TOKEN") return "test-token";
      if (name === "OLLAMA_MODEL") return "llama3.1:8b";
      return null;
    };
    try {
      const b44 = mockBase44({ invoked: false, invokeResult: { score: 10, issues: [], details: "fallback" } });
      const result = await invokeOllama(b44, { prompt: "test", response_json_schema: SCHEMA, stage: "test", runId: "test-16" });
      if (result.score !== 10) throw new Error("Expected fallback result");
      if (!getAuditLog().some(a => a.fallback_reason?.includes("HTTPS"))) throw new Error("Expected HTTPS rejection");
    } finally {
      (secrets as any).get = originalGet;
    }
  });

  // Test 16: URL validation — refuse credentials in URL
  await test("url_validation_credentials: refused", async () => {
    clearAuditLog();
    _setTransportForTesting(null);
    const originalGet = secrets.get;
    (secrets as any).get = (name: string) => {
      if (name === "USE_LOCAL_OLLAMA") return "true";
      if (name === "OLLAMA_TUNNEL_URL") return "https://user:pass@tunnel.example.com";
      if (name === "OLLAMA_TUNNEL_TOKEN") return "test-token";
      if (name === "OLLAMA_MODEL") return "llama3.1:8b";
      return null;
    };
    try {
      const b44 = mockBase44({ invoked: false, invokeResult: { score: 10, issues: [], details: "fallback" } });
      const result = await invokeOllama(b44, { prompt: "test", response_json_schema: SCHEMA, stage: "test", runId: "test-17" });
      if (result.score !== 10) throw new Error("Expected fallback result");
      if (!getAuditLog().some(a => a.fallback_reason?.includes("credentials"))) throw new Error("Expected credentials rejection");
    } finally {
      (secrets as any).get = originalGet;
    }
  });

  // Test 17: no tunnel configured → fallback (normal) / throw (require_local)
  await test("no_tunnel_normal: falls back to InvokeLLM", async () => {
    clearAuditLog();
    _setTransportForTesting(null);
    const originalGet = secrets.get;
    (secrets as any).get = (name: string) => {
      if (name === "USE_LOCAL_OLLAMA") return "true";
      if (name === "OLLAMA_TUNNEL_URL") return null;
      return null;
    };
    try {
      const b44 = mockBase44({ invoked: false, invokeResult: { score: 10, issues: [], details: "fallback" } });
      const result = await invokeOllama(b44, { prompt: "test", response_json_schema: SCHEMA, stage: "test", runId: "test-18" });
      if (result.score !== 10) throw new Error("Expected fallback result");
      if (!getAuditLog().some(a => a.fallback_reason?.includes("OLLAMA_TUNNEL_URL not configured"))) throw new Error("Expected not-configured reason");
    } finally {
      (secrets as any).get = originalGet;
    }
  });

  await test("no_tunnel_require_local: throws", async () => {
    clearAuditLog();
    _setTransportForTesting(null);
    const originalGet = secrets.get;
    (secrets as any).get = (name: string) => {
      if (name === "USE_LOCAL_OLLAMA") return "true";
      if (name === "OLLAMA_TUNNEL_URL") return null;
      return null;
    };
    try {
      const b44 = mockBase44({ invoked: false });
      let threw = false;
      try {
        await invokeOllama(b44, { prompt: "test", response_json_schema: SCHEMA, stage: "test", runId: "test-19", requireLocal: true });
      } catch (e: any) {
        threw = true;
        if (!e.message.includes("OLLAMA_TUNNEL_URL not configured")) throw new Error("Expected not-configified error");
      }
      if (!threw) throw new Error("Expected throw in require_local with no tunnel");
      if (getAuditLog().some(a => a.provider === "base44")) throw new Error("InvokeLLM must NOT be called");
    } finally {
      (secrets as any).get = originalGet;
    }
  });

  const passed = results.filter(r => r.passed).length;
  const failed = results.length - passed;
  return { total: results.length, passed, failed, results };
}

// ─── Main handler ────────────────────────────────────────────────────
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { action } = body;

    // ─── run_tests: unit tests with mock transport (no real LLM, no network) ──
    if (action === "run_tests") {
      const testResults = await runAllTests();
      return Response.json({ ok: true, ...testResults });
    }

    // ─── diagnose: read-only tunnel connectivity check ──────────────────
    if (action === "diagnose") {
      const tunnelUrl = secrets.get("OLLAMA_TUNNEL_URL");
      const tunnelToken = secrets.get("OLLAMA_TUNNEL_TOKEN");
      const model = secrets.get("OLLAMA_MODEL") || "llama3.1:8b";
      const useLocalFlag = secrets.get("USE_LOCAL_OLLAMA");
      const useLocal = useLocalFlag === null ? true : useLocalFlag === "true";

      if (!tunnelUrl) {
        return Response.json({
          ok: false,
          configured: false,
          useLocal,
          model,
          message: "OLLAMA_TUNNEL_URL not configured. Set it in Secrets. No real inference attempted.",
        });
      }

      // Validate URL without making a real call
      let urlValid = true;
      let urlError = "";
      try {
        const url = new URL(tunnelUrl);
        if (url.protocol !== "https:") { urlValid = false; urlError = "Must be HTTPS"; }
        if (url.username || url.password) { urlValid = false; urlError = "Must not contain credentials"; }
      } catch { urlValid = false; urlError = "Invalid URL"; }

      return Response.json({
        ok: urlValid,
        configured: true,
        useLocal,
        model,
        tunnelUrlPresent: true,
        tunnelTokenPresent: !!tunnelToken,
        urlValid,
        urlError,
        message: urlValid
          ? "Tunnel URL configured and valid. Live inference NOT attempted (read-only diagnostic). Set OLLAMA_TUNNEL_URL/OLLAMA_TUNNEL_TOKEN/OLLAMA_MODEL/USE_LOCAL_OLLAMA in Secrets to enable."
          : `Tunnel URL invalid: ${urlError}`,
      });
    }

    // ─── audit_log: return recent audit entries ─────────────────────────
    if (action === "audit_log") {
      return Response.json({ ok: true, entries: getAuditLog() });
    }

    return Response.json({ error: "Unknown action. Use: run_tests | diagnose | audit_log" }, { status: 400 });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}