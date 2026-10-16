import {
  isConfigured as cloudBrowserConfigured,
  createSession,
  navigateTo,
  takeScreenshot,
  runQaScript,
  closeSession,
} from './cloudBrowserEngine.ts';

// Shared cloud browser test runner — used by every factory pipeline to
// render a deployed site in a real browser and run QA checks before final
// approval. Returns a structured result any pipeline can gate on.

export interface BrowserTestResult {
  ran: boolean;
  skipped: boolean;
  skip_reason?: string;
  passed: boolean;
  screenshot_url: string | null;
  qa_results: any[];
  qa_errors: string[];
  error?: string;
}

export function isCloudBrowserAvailable(): boolean {
  return cloudBrowserConfigured();
}

export async function runBrowserTestOnUrl(url: string, opts: {
  fullPage?: boolean;
} = {}): Promise<BrowserTestResult> {
  if (!url) {
    return { ran: false, skipped: true, skip_reason: 'no URL provided', passed: false, screenshot_url: null, qa_results: [], qa_errors: [] };
  }
  if (!cloudBrowserConfigured()) {
    return { ran: false, skipped: true, skip_reason: 'cloud browser engine not configured', passed: false, screenshot_url: null, qa_results: [], qa_errors: [] };
  }

  let sessionId: string | null = null;
  try {
    const session = await createSession({ persistState: false });
    sessionId = session.sessionId;

    await navigateTo(sessionId, url, { waitUntil: 'networkidle' });
    const screenshot = await takeScreenshot(sessionId, { fullPage: opts.fullPage !== false });

    const qaResult = await runQaScript(sessionId, {
      steps: [
        { action: 'navigate', url, expect: 'page loads without error' },
        { action: 'check', selector: 'h1', expect: 'hero heading is visible' },
        { action: 'check', selector: 'a[href*="contact"], a[href*="tel:"], button', expect: 'at least one CTA is present' },
        { action: 'check', selector: 'body', expect: 'page body is not blank' },
        { action: 'screenshot', expect: 'full page screenshot captured' },
      ],
    });

    const criticalErrors = (qaResult.errors || []).filter((e: string) =>
      e.toLowerCase().includes('not found') ||
      e.toLowerCase().includes('failed') ||
      e.toLowerCase().includes('error')
    );

    return {
      ran: true,
      skipped: false,
      passed: qaResult.passed && criticalErrors.length === 0,
      screenshot_url: screenshot?.url || null,
      qa_results: qaResult.results || [],
      qa_errors: qaResult.errors || [],
    };
  } catch (err: any) {
    return {
      ran: true,
      skipped: false,
      passed: false,
      screenshot_url: null,
      qa_results: [],
      qa_errors: [err.message || 'Browser test failed'],
      error: err.message,
    };
  } finally {
    if (sessionId) {
      await closeSession(sessionId).catch(() => {});
    }
  }
}