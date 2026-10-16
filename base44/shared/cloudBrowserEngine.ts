import { secrets } from "base44:runtime";

// Cloud Browser Engine — multi-engine failover client for real browser execution.
// Uses ENGINE_URL + ENGINE_API_KEY secrets (already set in the app).
// Based on the Cloud-Browser system's engineClient.ts architecture.

const ENGINE_TIMEOUT_MS = 30000;

function getEngineUrls(): string[] {
  const urls: string[] = [];
  const primary = secrets.get("ENGINE_URL");
  if (primary) urls.push(primary.replace(/\/$/, ""));
  const backup2 = secrets.get("ENGINE_URL_2");
  if (backup2) urls.push(backup2.replace(/\/$/, ""));
  const backup3 = secrets.get("ENGINE_URL_3");
  if (backup3) urls.push(backup3.replace(/\/$/, ""));
  return urls;
}

function getApiKey(): string | null {
  return secrets.get("ENGINE_API_KEY") || null;
}

async function engineFetch(path: string, options: RequestInit = {}, timeoutMs = ENGINE_TIMEOUT_MS): Promise<any> {
  const urls = getEngineUrls();
  if (urls.length === 0) throw new Error("No ENGINE_URL configured");
  const apiKey = getApiKey();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (apiKey) headers["x-api-key"] = apiKey;

  let lastError: Error | null = null;

  for (const baseUrl of urls) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      const res = await fetch(`${baseUrl}${path}`, {
        ...options,
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.status >= 500) {
        lastError = new Error(`Engine ${baseUrl} returned ${res.status}`);
        continue;
      }

      // Detect misconfigured engine serving HTML
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("text/html")) {
        lastError = new Error(`Engine ${baseUrl} returned HTML, not API response — misconfigured`);
        continue;
      }

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Engine error ${res.status}: ${body.substring(0, 500)}`);
      }

      return await res.json();
    } catch (err) {
      lastError = err as Error;
      // Try next engine
      continue;
    }
  }

  throw lastError || new Error("All engines failed");
}

// --- Public API ---

export async function createSession(opts: {
  proxy?: string;
  userAgent?: string;
  persistState?: boolean;
} = {}): Promise<{ sessionId: string; engine: string }> {
  const result = await engineFetch("/sessions", {
    method: "POST",
    body: JSON.stringify({
      proxy: opts.proxy,
      userAgent: opts.userAgent,
      persistState: opts.persistState !== false,
    }),
  });
  return { sessionId: result.sessionId || result.session_id, engine: result.engine || "primary" };
}

export async function navigateTo(sessionId: string, url: string, opts: { waitUntil?: string } = {}): Promise<any> {
  return engineFetch(`/sessions/${sessionId}/navigate`, {
    method: "POST",
    body: JSON.stringify({ url, waitUntil: opts.waitUntil || "networkidle" }),
  }, 60000);
}

export async function takeScreenshot(sessionId: string, opts: { fullPage?: boolean } = {}): Promise<{ url: string }> {
  return engineFetch(`/sessions/${sessionId}/screenshot`, {
    method: "POST",
    body: JSON.stringify({ fullPage: opts.fullPage !== false }),
  }, 30000);
}

export async function clickElement(sessionId: string, selector: string): Promise<any> {
  return engineFetch(`/sessions/${sessionId}/click`, {
    method: "POST",
    body: JSON.stringify({ selector }),
  });
}

export async function typeText(sessionId: string, selector: string, text: string): Promise<any> {
  return engineFetch(`/sessions/${sessionId}/type`, {
    method: "POST",
    body: JSON.stringify({ selector, text }),
  });
}

export async function extractContent(sessionId: string, opts: {
  selectors?: Record<string, string>;
  waitFor?: string;
} = {}): Promise<Record<string, any>> {
  return engineFetch(`/sessions/${sessionId}/extract`, {
    method: "POST",
    body: JSON.stringify(opts),
  });
}

export async function runQaScript(sessionId: string, script: {
  steps: Array<{ action: string; selector?: string; text?: string; url?: string; expect?: string }>;
}): Promise<{ passed: boolean; results: any[]; screenshots: string[]; errors: string[] }> {
  return engineFetch(`/sessions/${sessionId}/qa`, {
    method: "POST",
    body: JSON.stringify({ steps: script.steps }),
  }, 120000);
}

export async function closeSession(sessionId: string): Promise<any> {
  return engineFetch(`/sessions/${sessionId}`, { method: "DELETE" });
}

export async function healthCheck(): Promise<{ status: string; engines: any[] }> {
  const urls = getEngineUrls();
  const engines: any[] = [];
  for (const url of urls) {
    try {
      const res = await engineFetch("/health", {}, 5000);
      const isHealthy = res.status === "ok" || res.status === "healthy" || res.healthy === true;
      engines.push({ ...res, url, status: isHealthy ? "healthy" : "unhealthy" });
    } catch {
      engines.push({ url, status: "unhealthy" });
    }
  }
  const anyHealthy = engines.some((e) => e.status === "healthy");
  return { status: anyHealthy ? "healthy" : "unhealthy", engines };
}

export function isConfigured(): boolean {
  return getEngineUrls().length > 0 && getApiKey() !== null;
}