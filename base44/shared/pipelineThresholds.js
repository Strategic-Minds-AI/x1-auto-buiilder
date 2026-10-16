// Centralized minimum performance and quality thresholds for the gated pipeline.
// A build only advances to the next stage if its gate score meets or exceeds the
// configured minimum. Override per-run by passing `thresholds` in the pipeline input.

export const DEFAULT_THRESHOLDS = {
  research_quality: { min_score: 70 },
  content_completeness: { min_score: 75 },
  google_compliance: { min_score: 75 },
  fix_verification: { min_score: 80 },
  human_quality: { min_score: 75 },
  cloud_browser_render: { max_lcp_ms: 2500, max_inp_ms: 200, max_cls: 0.1 },
  final_release: { min_google_score: 80, min_human_score: 80, min_overall_score: 80 },
};

export function getThresholds(overrides) {
  if (!overrides || typeof overrides !== 'object') return DEFAULT_THRESHOLDS;
  const merged = JSON.parse(JSON.stringify(DEFAULT_THRESHOLDS));
  for (const key of Object.keys(overrides)) {
    if (merged[key] && typeof merged[key] === 'object' && typeof overrides[key] === 'object') {
      merged[key] = { ...merged[key], ...overrides[key] };
    } else {
      merged[key] = overrides[key];
    }
  }
  return merged;
}

// Check a single-score gate verdict against its threshold.
export function scoreMeetsGate(verdict, threshold) {
  if (!threshold) return { passed: true, reason: null };
  const score = verdict.score ?? verdict.overall_score ?? null;
  if (score == null) return { passed: true, reason: null };
  if (score < threshold.min_score) {
    return { passed: false, reason: `score ${score} below minimum ${threshold.min_score}` };
  }
  return { passed: true, reason: null };
}

// Check the final release verdict against its multi-score threshold.
export function releaseMeetsGate(verdict, threshold) {
  if (!threshold) return { passed: true, reason: null };
  const reasons = [];
  if (verdict.google_score != null && verdict.google_score < threshold.min_google_score) {
    reasons.push(`google_score ${verdict.google_score} below ${threshold.min_google_score}`);
  }
  if (verdict.human_score != null && verdict.human_score < threshold.min_human_score) {
    reasons.push(`human_score ${verdict.human_score} below ${threshold.min_human_score}`);
  }
  if (verdict.overall_score != null && verdict.overall_score < threshold.min_overall_score) {
    reasons.push(`overall_score ${verdict.overall_score} below ${threshold.min_overall_score}`);
  }
  return { passed: reasons.length === 0, reason: reasons.join('; ') || null };
}

// Check Core Web Vitals against the performance budget.
export function cwvMeetsBudget(metrics, budget) {
  if (!metrics || !budget) return { passed: true, breaches: [] };
  const breaches = [];
  if (metrics.lcp_ms != null && metrics.lcp_ms > budget.max_lcp_ms) {
    breaches.push(`LCP ${Math.round(metrics.lcp_ms)}ms exceeds ${budget.max_lcp_ms}ms`);
  }
  if (metrics.inp_ms != null && metrics.inp_ms > budget.max_inp_ms) {
    breaches.push(`INP ${Math.round(metrics.inp_ms)}ms exceeds ${budget.max_inp_ms}ms`);
  }
  if (metrics.cls != null && metrics.cls > budget.max_cls) {
    breaches.push(`CLS ${metrics.cls} exceeds ${budget.max_cls}`);
  }
  return { passed: breaches.length === 0, breaches };
}