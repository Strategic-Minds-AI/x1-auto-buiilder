import { useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  Activity, Loader2, CheckCircle2, AlertTriangle, XCircle,
  RefreshCw, Zap, Shield,
} from "lucide-react";

export default function ReconcilerPanel() {
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);

  const runReconciler = async () => {
    setRunning(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("reconciler", {});
      setResult(res.data);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-700">X1 Reconciler</h3>
            <p className="text-[10px] text-slate-400">State drift detection & evidence-based readiness</p>
          </div>
        </div>
        <button
          onClick={runReconciler}
          disabled={running}
          className="inline-flex items-center gap-1.5 rounded-full bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700 disabled:opacity-50 transition"
        >
          {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          {running ? "Reconciling..." : "Run Reconciler"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600 mb-3">
          {error}
        </div>
      )}

      {result?.summary && (
        <>
          {/* Summary banner */}
          <div className={`rounded-xl p-3 mb-3 flex items-center gap-2 ${
            result.summary.all_clear
              ? "bg-emerald-50 border border-emerald-200"
              : "bg-amber-50 border border-amber-200"
          }`}>
            {result.summary.all_clear
              ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              : <AlertTriangle className="w-5 h-5 text-amber-500" />}
            <div className="flex-1">
              <div className="text-xs font-bold text-slate-700">
                {result.summary.all_clear ? "ALL CLEAR — No critical issues" : `${result.summary.critical} critical, ${result.summary.warnings} warnings`}
              </div>
              <div className="text-[10px] text-slate-500">
                Checked {result.summary.runs_checked} runs, {result.summary.packets_checked} packets, {result.summary.receipts_checked} receipts
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                result.summary.engine_health === "healthy" ? "bg-emerald-100 text-emerald-600" :
                result.summary.engine_health === "unhealthy" ? "bg-red-100 text-red-600" :
                "bg-slate-100 text-slate-500"
              }`}>
                Engine: {result.summary.engine_health}
              </span>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            <MiniStat label="Issues" value={result.summary.issues_found} color="amber" />
            <MiniStat label="Critical" value={result.summary.critical} color="red" />
            <MiniStat label="Actions" value={result.summary.actions_taken} color="blue" />
            <MiniStat label="Approvals" value={result.summary.pending_approvals} color="purple" />
          </div>

          {/* Issues list */}
          {result.issues?.length > 0 && (
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {result.issues.slice(0, 20).map((issue, i) => (
                <div key={i} className={`rounded-lg border px-3 py-2 text-xs ${
                  issue.severity === "critical" ? "border-red-200 bg-red-50/50" :
                  issue.severity === "warning" ? "border-amber-200 bg-amber-50/50" :
                  "border-slate-200 bg-slate-50/50"
                }`}>
                  <div className="flex items-center gap-2">
                    {issue.severity === "critical" ? <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" /> :
                     issue.severity === "warning" ? <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" /> :
                     <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                    <span className="font-bold text-slate-600 uppercase text-[10px]">{issue.category}</span>
                    {issue.action && <span className="text-[10px] text-[#00d4ff] font-bold ml-auto">→ {issue.action}</span>}
                  </div>
                  <p className="text-slate-600 mt-1">{issue.message}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {!result && !running && (
        <div className="text-center py-6">
          <Zap className="w-8 h-8 text-slate-200 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Run the reconciler to check for state drift, missing evidence, and stale packets.</p>
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value, color }) {
  const colors = {
    amber: "text-amber-600", red: "text-red-600",
    blue: "text-blue-600", purple: "text-purple-600",
  };
  return (
    <div className="rounded-lg bg-slate-50 p-2 text-center">
      <div className={`text-lg font-black ${colors[color] || "text-slate-600"}`}>{value}</div>
      <div className="text-[10px] text-slate-400">{label}</div>
    </div>
  );
}