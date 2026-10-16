import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Shield, ShieldCheck, Loader2, Zap, AlertTriangle, CheckCircle2,
  XCircle, Wrench, Star, Code2, Eye, Activity, Gauge,
} from "lucide-react";

const PASS_CONFIG = [
  { key: "pass1_code_quality", label: "Code Quality", icon: Code2, max: 25, color: "bg-blue-400", desc: "TypeScript, ESLint, React, Security" },
  { key: "pass2_visual_parity", label: "Visual Parity", icon: Eye, max: 25, color: "bg-purple-400", desc: "Design system vs top sites" },
  { key: "pass3_functional", label: "Functional", icon: Activity, max: 25, color: "bg-emerald-400", desc: "Sections, forms, CTAs, nav" },
  { key: "pass4_performance", label: "Performance", icon: Gauge, max: 25, color: "bg-amber-400", desc: "Perf, A11y, SEO" },
];

export default function FaangQaPanel({ job, onRefresh }) {
  const [qaResult, setQaResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);

  const loadQa = async () => {
    try {
      const page = await base44.entities.FaangQaResult.filter(
        { template_factory_job_id: job.id },
        { sort: "-created_date", limit: 1 }
      );
      setQaResult(page.items?.[0] || null);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { if (job?.id) loadQa(); }, [job?.id]);

  const runQa = async () => {
    setRunning(true);
    setError(null);
    try {
      await base44.functions.invoke("faangQaGate", { action: "run_qa", jobId: job.id });
      loadQa();
      onRefresh?.();
    } catch (e) { setError(e.response?.data?.error || e.message); }
    finally { setRunning(false); }
  };

  const autoHeal = async () => {
    setRunning(true);
    setError(null);
    try {
      await base44.functions.invoke("faangQaGate", { action: "auto_heal", jobId: job.id });
      loadQa();
      onRefresh?.();
    } catch (e) { setError(e.response?.data?.error || e.message); }
    finally { setRunning(false); }
  };

  const autoRun = async () => {
    setRunning(true);
    setError(null);
    try {
      // Chain iterations until SHIP or max reached
      for (let i = 0; i < 3; i++) {
        const res = await base44.functions.invoke("faangQaGate", { action: "auto_run", jobId: job.id, maxIterations: 3 });
        const data = res.data;
        if (data?.verdict === "SHIP" || data?.status === "shipped") break;
        if (data?.status === "failed" && data?.verdict !== "AUTO_HEAL") break;
        loadQa();
      }
      loadQa();
      onRefresh?.();
    } catch (e) { setError(e.response?.data?.error || e.message); }
    finally { setRunning(false); }
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-[#00d4ff]" /></div>;

  if (!job?.template_output?.blueprint) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
        <Shield className="w-8 h-8 text-slate-200 mx-auto mb-2" />
        <p className="text-sm text-slate-400">Engineer the template first before running QA.</p>
      </div>
    );
  }

  const totalScore = qaResult?.total_score || 0;
  const verdict = qaResult?.verdict || "PENDING";
  const verdictColor = verdict === "SHIP" ? "text-emerald-600 bg-emerald-50 border-emerald-200" :
    verdict === "AUTO_HEAL" ? "text-amber-600 bg-amber-50 border-amber-200" :
    verdict === "REBUILD" ? "text-red-600 bg-red-50 border-red-200" :
    "text-slate-500 bg-slate-50 border-slate-200";

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#00d4ff]" />
            <h3 className="text-sm font-bold text-slate-700">FAANG Quality Gate</h3>
            {qaResult && (
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${verdictColor}`}>
                {verdict === "SHIP" && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                {verdict === "AUTO_HEAL" && <Wrench className="w-3 h-3 inline mr-1" />}
                {verdict === "REBUILD" && <XCircle className="w-3 h-3 inline mr-1" />}
                {verdict} — {totalScore}/100
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!qaResult && (
              <button onClick={runQa} disabled={running}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#00d4ff] px-4 py-2 text-xs font-bold text-[#0a0e14] hover:brightness-110 disabled:opacity-50 transition">
                {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Shield className="w-3.5 h-3.5" />}
                Run QA Gate
              </button>
            )}
            {qaResult && verdict === "AUTO_HEAL" && qaResult.iteration < qaResult.max_iterations && (
              <button onClick={autoHeal} disabled={running}
                className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-4 py-2 text-xs font-bold text-white hover:brightness-110 disabled:opacity-50 transition">
                {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wrench className="w-3.5 h-3.5" />}
                Auto-Heal (Iter {qaResult.iteration}/{qaResult.max_iterations})
              </button>
            )}
            <button onClick={autoRun} disabled={running}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:text-[#00d4ff] disabled:opacity-50 transition">
              {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
              Auto-Run Full Loop
            </button>
          </div>
        </div>

        {qaResult ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {PASS_CONFIG.map((pass) => {
                const score = qaResult[pass.key] || 0;
                const pct = (score / pass.max) * 100;
                const Icon = pass.icon;
                return (
                  <div key={pass.key} className="rounded-xl border border-slate-200 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-bold text-slate-600">{pass.label}</span>
                    </div>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-2xl font-black text-slate-700">{score}</span>
                      <span className="text-xs text-slate-400">/{pass.max}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className={`h-full rounded-full ${pass.color}`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-[9px] text-slate-400 mt-1">{pass.desc}</div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-500">TOTAL FAANG SCORE</span>
                  <span className="text-lg font-black text-slate-700">{totalScore}<span className="text-sm text-slate-400">/100</span></span>
                </div>
                <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${totalScore >= 90 ? "bg-emerald-500" : totalScore >= 70 ? "bg-amber-500" : "bg-red-500"}`}
                    style={{ width: `${totalScore}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-[9px] text-slate-400">
                  <span>REBUILD below 70</span>
                  <span>AUTO-HEAL 70-89</span>
                  <span>SHIP 90+</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400">Iteration</div>
                <div className="text-lg font-black text-slate-700">{qaResult.iteration}/{qaResult.max_iterations}</div>
              </div>
            </div>

            {qaResult.auto_fixes?.length > 0 && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Wrench className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-amber-700">Auto-Fixes Applied ({qaResult.auto_fixes.length})</span>
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {qaResult.auto_fixes.map((fix, i) => (
                    <div key={i} className="text-xs text-amber-600 flex items-start gap-2">
                      <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0" />
                      <span>{fix.fix_description || fix.issue}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {qaResult.issues?.length > 0 && (
              <div>
                <div className="text-xs font-bold text-slate-500 mb-2">Issues Found ({qaResult.issues.length})</div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {qaResult.issues.map((issue, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs rounded-lg border border-slate-100 px-3 py-2">
                      {issue.severity === "critical" ? <XCircle className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" /> :
                        issue.severity === "warning" ? <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" /> :
                        <Star className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />}
                      <div className="flex-1">
                        <span className="font-bold text-slate-400 text-[10px]">{issue.pass}</span>
                        <p className="text-slate-600">{issue.message}</p>
                        {issue.recommendation && <p className="text-slate-400 text-[10px] mt-0.5">→ {issue.recommendation}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-6">
            <Shield className="w-10 h-10 text-slate-200 mx-auto mb-2" />
            <p className="text-sm text-slate-400 mb-1">No QA run yet. Click "Run QA Gate" to test the template.</p>
            <p className="text-xs text-slate-400">4-pass scoring: Code Quality + Visual Parity + Functional + Performance = 100pts</p>
          </div>
        )}

        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
}