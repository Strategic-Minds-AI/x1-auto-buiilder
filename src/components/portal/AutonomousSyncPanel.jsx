import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import {
  RefreshCw, Radio, ArrowUpCircle, ArrowDownCircle, CheckCircle2,
  AlertCircle, Loader2, Clock, Zap, Activity,
} from "lucide-react";

export default function AutonomousSyncPanel() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("gptAutonomousSync", { action: "status" });
      setStatus(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const unsub = base44.entities.SyncReceipt.subscribe(() => load());
    return unsub;
  }, [load]);

  const runNow = async () => {
    setRunning(true);
    setError(null);
    try {
      await base44.functions.invoke("gptAutonomousSync", { action: "cycle" });
      await load();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setRunning(false);
    }
  };

  const lastPush = status?.last_push;
  const lastPull = status?.last_pull;
  const engineReady = status?.engine_configured && status?.sync_key_configured;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${engineReady ? "bg-[#00d4ff]/10" : "bg-amber-100"}`}>
            <Radio className={`w-4 h-4 ${engineReady ? "text-[#00d4ff]" : "text-amber-500"}`} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-800">Autonomous Bi-Directional Sync</h3>
            <p className="text-xs text-slate-400">Runs automatically every 5 minutes</p>
          </div>
        </div>
        <button
          onClick={runNow}
          disabled={running || !engineReady}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#00d4ff] px-4 py-2 text-xs font-bold text-[#0a0e14] hover:brightness-110 transition disabled:opacity-40"
        >
          {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
          {running ? "Syncing..." : "Run Now"}
        </button>
      </div>

      {/* Engine status */}
      {!engineReady && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 mb-3 text-xs text-amber-700">
          <strong>Setup needed:</strong> Set <code className="font-mono">ENGINE_URL</code> and <code className="font-mono">ENGINE_API_KEY</code> secrets in Dashboard → Secrets to enable autonomous sync.
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 mb-3 text-xs text-red-600">
          {error}
        </div>
      )}

      {/* Sync direction cards */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Push */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <ArrowUpCircle className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-bold text-slate-600">PUSH → GPT</span>
          </div>
          {loading ? (
            <div className="h-8 flex items-center"><Loader2 className="w-4 h-4 animate-spin text-slate-300" /></div>
          ) : lastPush ? (
            <div>
              <div className="flex items-center gap-1.5">
                {lastPush.status === "success" ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                )}
                <span className={`text-xs font-semibold ${lastPush.status === "success" ? "text-emerald-600" : "text-red-500"}`}>
                  {lastPush.status === "success" ? "Snapshot sent" : "Push failed"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 truncate">{lastPush.summary}</p>
              <p className="text-[10px] text-slate-300 mt-0.5 flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                {new Date(lastPush.created_date).toLocaleString()}
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400">No pushes yet</p>
          )}
        </div>

        {/* Pull */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <ArrowDownCircle className="w-4 h-4 text-cyan-500" />
            <span className="text-xs font-bold text-slate-600">GPT → PULL</span>
          </div>
          {loading ? (
            <div className="h-8 flex items-center"><Loader2 className="w-4 h-4 animate-spin text-slate-300" /></div>
          ) : lastPull ? (
            <div>
              <div className="flex items-center gap-1.5">
                {lastPull.status === "success" ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                )}
                <span className={`text-xs font-semibold ${lastPull.status === "success" ? "text-emerald-600" : "text-red-500"}`}>
                  {lastPull.status === "success" ? "Commands processed" : "Pull failed"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 truncate">{lastPull.summary}</p>
              <p className="text-[10px] text-slate-300 mt-0.5 flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                {new Date(lastPull.created_date).toLocaleString()}
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400">No pulls yet</p>
          )}
        </div>
      </div>

      {/* Recent autonomous activity */}
      {status?.recent && status.recent.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1.5">
            <Activity className="w-3 h-3" /> Recent Cycles
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {status.recent.slice(0, 8).map((r) => (
              <div key={r.id} className="flex items-center gap-2 text-xs">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${r.status === "success" ? "bg-emerald-400" : "bg-red-400"}`} />
                <span className="font-semibold text-slate-600 uppercase tracking-wide text-[10px]">{r.action}</span>
                <span className="text-slate-400 truncate flex-1">{r.summary}</span>
                <span className="text-[10px] text-slate-300 shrink-0">
                  {new Date(r.created_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={load}
        className="mt-3 inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600"
      >
        <RefreshCw className="w-3 h-3" /> Refresh status
      </button>
    </div>
  );
}