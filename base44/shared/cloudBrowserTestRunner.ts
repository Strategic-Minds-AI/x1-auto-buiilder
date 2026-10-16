import {
  isConfigured as cloudBrowserConfigured,
  createSession,
  navigateTo,
  takeScreenshot,
  runQaScript,
  getPerformanceMetrics,
  closeSession,
} from './cloudBrowserEngine.ts';

// Shared cloud browser test runner — used by every factory pipeline to
// render a deployed site in a real browser, collect Core Web Vitals, run
// QA checks, and produce a step-by-step log before final approval.

export interface PerformanceMetrics {
  lcp_ms: number | null;
  cls: number | null;
  inp_ms: number | null;
  ttfb_ms: number | null;
  dom_load_ms: number | null;
  page_load_ms: number | null;
  dom_node_count: number | null;
  resource_count: number | null;
  transfer_size_kb: number | null;
  raw: any;
}

export interface BrowserTestResult {
  ran: boolean;
  skipped: boolean;
  skip_reason?: string;
  passed: boolean;
  screenshot_url: string | null;
  qa_results: any[];
  qa_errors: string[];
  performance_metrics: PerformanceMetrics | null;
  log: Array<{ step: string; status: string; detail?: string; duration_ms?: number }>;
  error?: string;
}

function now(): number { return Date.now(); }

export function isCloudBrowserAvailable(): boolean {
  return cloudBrowserConfigured();
}

// Google Core Web Vitals budgets — a site that breaches these is flagged.
export const CWV_BUDGETS = { lcp_ms: 2500, inp_ms: 200, cls: 0.1 };

export function evaluateCwvBudgets(m: PerformanceMetrics | null): { breaches: string[]; passes: string[] } {
  const breaches: string[] = [];
  const passes: string[] = [];
  if (!m) return { breaches, passes };
  if (m.lcp_ms != null) {
    if (m.lcp_ms > CWV_BUDGETS.lcp_ms) breaches.push(`LCP ${Math.round(m.lcp_ms)}ms > ${CWV_BUDGETS.lcp_ms}ms budget`);
    else passes.push(`LCP ${Math.round(m.lcp_ms)}ms`);
  }
  if (m.inp_ms != null) {
    if (m.inp_ms > CWV_BUDGETS.inp_ms) breaches.push(`INP ${Math.round(m.inp_ms)}ms > ${CWV_BUDGETS.inp_ms}ms budget`);
    else passes.push(`INP ${Math.round(m.inp_ms)}ms`);
  }
  if (m.cls != null) {
    if (m.cls > CWV_BUDGETS.cls) breaches.push(`CLS ${m.cls} > ${CWV_BUDGETS.cls} budget`);
    else passes.push(`CLS ${m.cls}`);
  }
  return { breaches, passes };
}

export async function runBrowserTestOnUrl(url: string, opts: {
  fullPage?: boolean;
} = {}): Promise<BrowserTestResult> {
  const log: BrowserTestResult['log'] = [];

  if (!url) {
    log.push({ step: 'init', status: 'skipped', detail: 'no URL provided' });
    return { ran: false, skipped: true, skip_reason: 'no URL provided', passed: false, screenshot_url: null, qa_results: [], qa_errors: [], performance_metrics: null, log };
  }
  if (!cloudBrowserConfigured()) {
    log.push({ step: 'init', status: 'skipped', detail: 'cloud browser engine not configured' });
    return { ran: false, skipped: true, skip_reason: 'cloud browser engine not configured', passed: false, screenshot_url: null, qa_results: [], qa_errors: [], performance_metrics: null, log };
  }

  log.push({ step: 'init', status: 'started', detail: `target=${url}` });

  let sessionId: string | null = null;
  try {
    const t0 = now();
    const session = await createSession({ persistState: false });
    sessionId = session.sessionId;
    log.push({ step: 'create_session', status: 'complete', detail: `engine=${session.engine}`, duration_ms: now() - t0 });

    const t1 = now();
    await navigateTo(sessionId, url, { waitUntil: 'networkidle' });
    log.push({ step: 'navigate', status: 'complete', detail: `waitUntil=networkidle`, duration_ms: now() - t1 });

    const t2 = now();
    const metrics = await getPerformanceMetrics(sessionId);
    log.push({
      step: 'performance_metrics',
      status: metrics.lcp_ms != null ? 'complete' : 'failed',
      detail: metrics.lcp_ms != null
        ? `LCP=${Math.round(metrics.lcp_ms || 0)}ms CLS=${metrics.cls} INP=${metrics.inp_ms != null ? Math.round(metrics.inp_ms) : 'n/a'}ms DOM=${metrics.dom_node_count} resources=${metrics.resource_count}`
        : (metrics.raw?.error || 'no metrics returned'),
      duration_ms: now() - t2,
    });

    const t3 = now();
    const screenshot = await takeScreenshot(sessionId, { fullPage: opts.fullPage !== false });
    log.push({ step: 'screenshot', status: screenshot?.url ? 'complete' : 'failed', detail: screenshot?.url ? 'captured' : 'no url returned', duration_ms: now() - t3 });

    const t4 = now();
    const qaResult = await runQaScript(sessionId, {
      steps: [
        { action: 'navigate', url, expect: 'page loads without error' },
        { action: 'check', selector: 'h1', expect: 'hero heading is visible' },
        { action: 'check', selector: 'a[href*="contact"], a[href*="tel:"], button', expect: 'at least one CTA is present' },
        { action: 'check', selector: 'body', expect: 'page body is not blank' },
        { action: 'screenshot', expect: 'full page screenshot captured' },
      ],
    });
    log.push({ step: 'qa_script', status: qaResult.passed ? 'complete' : 'failed', detail: `${(qaResult.results || []).length} checks, ${(qaResult.errors || []).length} errors`, duration_ms: now() - t4 });

    const criticalErrors = (qaResult.errors || []).filter((e: string) =>
      e.toLowerCase().includes('not found') ||
      e.toLowerCase().includes('failed') ||
      e.toLowerCase().includes('error')
    );

    const cwv = evaluateCwvBudgets(metrics);
    if (cwv.breaches.length > 0) {
      log.push({ step: 'cwv_budget', status: 'failed', detail: cwv.breaches.join('; ') });
    } else if (cwv.passes.length > 0) {
      log.push({ step: 'cwv_budget', status: 'complete', detail: cwv.passes.join(', ') });
    }

    // A site passes only if QA checks pass AND no critical errors AND Core Web Vitals budgets are met.
    const cwvPassed = cwv.breaches.length === 0;
    const passed = qaResult.passed && criticalErrors.length === 0 && cwvPassed;

    log.push({ step: 'final', status: passed ? 'complete' : 'failed', detail: passed ? 'all gates passed' : 'one or more gates failed' });

    return {
      ran: true,
      skipped: false,
      passed,
      screenshot_url: screenshot?.url || null,
      qa_results: qaResult.results || [],
      qa_errors: qaResult.errors || [],
      performance_metrics: metrics,
      log,
    };
  } catch (err: any) {
    log.push({ step: 'error', status: 'failed', detail: err.message || 'Browser test failed' });
    return {
      ran: true,
      skipped: false,
      passed: false,
      screenshot_url: null,
      qa_results: [],
      qa_errors: [err.message || 'Browser test failed'],
      performance_metrics: null,
      log,
      error: err.message,
    };
  } finally {
    if (sessionId) {
      await closeSession(sessionId).catch(() => {});
      log.push({ step: 'close_session', status: 'complete', detail: 'session closed' });
    }
  }
}