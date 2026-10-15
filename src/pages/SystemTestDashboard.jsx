import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import BackButton from "@/components/shared/BackButton";
import PageHeader from "@/components/shared/PageHeader";
import { Loader2, PlayCircle, CheckCircle, AlertCircle, Shield, Activity, Gauge, FileText, Wrench } from "lucide-react";

export default function SystemTestDashboard() {
  const [reports, setReports] = useState([]);
  const [latest, setLatest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState(null);

  useEffect(() => { loadReports(); }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const page = await base44.entities.SystemTestReport.filter({}, { sort: "-created_date", limit: 20 });
      setReports(page.items || []);
      setLatest(page.items?.[0] || null);
    } catch {} finally { setLoading(false); }
  };

  const runTests = async () => {
    setRunning(true);
    setRunResult(null);
    try {
      const res = await base44.functions.invoke("runSystemTests", { fixIssues: true });
      setRunResult(res);
      await loadReports();
    } catch (err) {
      setRunResult({ error: err.message });
    } finally { setRunning(false); }
  };

  useEffect(() => {
    const unsub = base44.entities.SystemTestReport.subscribe(() => loadReports());
    return unsub;
  }, []);

  const score = latest?.score ?? 0;
  const scoreColor = score === 100 ? "text-emerald-500" : score >= 80 ? "text-amber-500" : "text-red-500";

  return (
    <div className="min-h-screen bg-white">
      <PageHeader title="System Test Dashboard" subtitle="Autonomous testing agent — validates the entire platform, fixes broken systems, and enforces 100% validation" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton fallback="/portal" label="Back to Portal" />

        {/* Score + Run */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#00d4ff]" />
                <h3 className="text-sm font-black text-slate-900">Validation Score</h3>
              </div>
              <button onClick={runTests} disabled={running}
                className="inline-flex items-center gap-2 rounded-full bg-[#00d4ff] px-5 py-2 text-sm font-bold text-[#0a0e14] hover:brightness-110 disabled:opacity-40 transition">
                {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
                {running ? "Testing..." : "Run Full System Test"}
              </button>
            </div>
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-slate-300" /></div>
            ) : latest ? (
              <>
                <div className="flex items-center gap-4">
                  <div className={`text-5xl font-black ${scoreColor}`}>{score}%</div>
                  <div className="flex-1">
                    <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                      <div className={`h-full transition-all ${score === 100 ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${score}%` }} />
                    </div>
                    <p className="text-sm text-slate-500 mt-2">{latest.summary}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="rounded-xl bg-emerald-50 p-3 text-center">
                    <div className="text-2xl font-black text-emerald-600">{latest.passed_tests}</div>
                    <div className="text-xs text-emerald-600 font-semibold">Passed</div>
                  </div>
                  <div className="rounded-xl bg-red-50 p-3 text-center">
                    <div className="text-2xl font-black text-red-600">{latest.failed_tests}</div>
                    <div className="text-xs text-red-600 font-semibold">Failed</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 text-center">
                    <div className="text-2xl font-black text-slate-600">{latest.total_tests}</div>
                    <div className="text-xs text-slate-600 font-semibold">Total</div>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-400 text-center py-8">No tests run yet. Click "Run Full System Test" to validate the platform.</p>
            )}
          </div>

          {/* Testing Agent info */}
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-[#0a0e14] to-[#0d1525] p-6 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-5 h-5 text-[#00d4ff]" />
              <h3 className="text-sm font-black">Testing Agent</h3>
            </div>
            <p className="text-xs text-white/60 mb-4">Autonomous QA system with cloud browser testing, auto-fix capabilities, and 100% validation enforcement.</p>
            <div className="space-y-2">
              {[
                { icon: Gauge, label: "100% validation enforced" },
                { icon: Wrench, label: "Auto-fix on failure" },
                { icon: FileText, label: "Detailed reports" },
              ].map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.label} className="flex items-center gap-2 text-xs text-white/70">
                    <Icon className="w-3.5 h-3.5 text-[#00d4ff]" /> {f.label}
                  </div>
                );
              })}
            </div>
            <a href={base44.agents.getWhatsAppConnectURL("testing_agent")} target="_blank"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#25D366]/20 px-3 py-1.5 text-xs font-semibold text-[#25D366] hover:bg-[#25D366]/30 transition">
              Connect via WhatsApp
            </a>
          </div>
        </div>

        {/* Run result */}
        {runResult?.error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 mb-6">
            <div className="flex items-center gap-2 text-red-600"><AlertCircle className="w-4 h-4" /><span className="text-sm font-semibold">{runResult.error}</span></div>
          </div>
        )}

        {/* Latest test results */}
        {latest?.results?.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 mb-6">
            <h3 className="text-sm font-black text-slate-900 mb-4">Latest Test Results</h3>
            <div className="space-y-1.5 max-h-96 overflow-y-auto">
              {latest.results.map((r, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-50">
                  {r.status === "passed" ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  )}
                  <span className="text-sm font-semibold text-slate-700 shrink-0">{r.test}</span>
                  <span className={`text-xs ${r.status === "passed" ? "text-emerald-500" : "text-red-500"}`}>{r.detail}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fixes applied */}
        {latest?.fixes_applied?.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Wrench className="w-4 h-4 text-[#00d4ff]" />
              <h3 className="text-sm font-black text-slate-900">Fixes Applied</h3>
            </div>
            <div className="space-y-2">
              {latest.fixes_applied.map((f, i) => (
                <div key={i} className="rounded-lg border border-slate-200 px-3 py-2">
                  <div className="text-sm font-semibold text-slate-700">{f.issue}</div>
                  <div className="text-xs text-slate-500">{f.fix}</div>
                  <span className={`text-xs font-semibold ${f.status === "applied" ? "text-emerald-500" : "text-amber-500"}`}>{f.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Test history */}
        {reports.length > 1 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="text-sm font-black text-slate-900 mb-4">Test History</h3>
            <div className="space-y-2">
              {reports.slice(0, 10).map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                  <div className="flex items-center gap-3">
                    <span className={`text-lg font-black ${r.score === 100 ? "text-emerald-500" : "text-amber-500"}`}>{r.score}%</span>
                    <span className="text-sm text-slate-600">{r.passed_tests}/{r.total_tests} passed</span>
                  </div>
                  <span className="text-xs text-slate-400">{new Date(r.created_date).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}