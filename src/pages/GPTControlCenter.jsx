import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import {
  Zap, Loader2, CheckCircle2, XCircle, Play, Square, RefreshCw,
  Power, Terminal, Wrench, Shield, Activity, Clock, ArrowUpDown,
} from "lucide-react";

export default function GPTControlCenter() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("gptLibraryControl", { action: "status" });
      setStatus(res.data);
      setLogs(res.data?.recent_logs || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to load status");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const unsub = base44.entities.SyncReceipt.subscribe(() => load());
    return unsub;
  }, [load]);

  const run = async (action, label) => {
    setBusy(action);
    setError(null);
    try {
      await base44.functions.invoke("gptLibraryControl", { action });
      await load();
    } catch (err) {
      setError(err.response?.data?.error || err.message || `${label} failed`);
    } finally {
      setBusy(null);
    }
  };

  const enabled = status?.enabled;
  const engineReady = status?.engine_ready;
  const autonomous = status?.autonomous;
  const tools = status?.tools || [];

  return (
    <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
      {/* Status bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <StatusPill label="Library" active={enabled} />
          <StatusPill label="Engine" active={engineReady} />
          <StatusPill label="Autonomous" active={autonomous?.engine_configured} />
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:text-[#00d4ff] hover:border-[#00d4ff]/40 transition"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Control cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Enable / Disable */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Power className="w-5 h-5 text-[#00d4ff]" />
            <h3 className="text-sm font-bold text-slate-800">GPT Library</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            {enabled ? "Library is enabled — authorized AI clients can invoke tools." : "Library is disabled — external AI clients are rejected."}
          </p>
          <button
            onClick={() => run(enabled ? "disable" : "enable", enabled ? "Disable" : "Enable")}
            disabled={busy !== null}
            className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition disabled:opacity-50 ${
              enabled ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100" : "bg-[#00d4ff] text-white hover:brightness-110"
            }`}
          >
            {busy === "enable" || busy === "disable" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Power className="w-4 h-4" />}
            {enabled ? "Disable Library" : "Enable Library"}
          </button>
        </div>

        {/* Autonomous coding */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Terminal className="w-5 h-5 text-[#00d4ff]" />
            <h3 className="text-sm font-bold text-slate-800">Autonomous Coding</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            {autonomous?.engine_configured ? "Engine is configured — autonomous sync is ready." : "Set ENGINE_URL + ENGINE_API_KEY secrets to enable."}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => run("autonomous_start", "Start autonomous")}
              disabled={busy !== null || !engineReady}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#00d4ff] px-4 py-2.5 text-sm font-bold text-white hover:brightness-110 transition disabled:opacity-50"
            >
              {busy === "autonomous_start" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Start
            </button>
            <button
              onClick={() => run("autonomous_stop", "Stop autonomous")}
              disabled={busy !== null}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 text-slate-600 border border-slate-200 px-4 py-2.5 text-sm font-bold hover:bg-slate-200 transition disabled:opacity-50"
            >
              {busy === "autonomous_stop" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Square className="w-4 h-4" />}
              Stop
            </button>
          </div>
        </div>

        {/* Sync now */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <ArrowUpDown className="w-5 h-5 text-[#00d4ff]" />
            <h3 className="text-sm font-bold text-slate-800">Sync with GPT</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Trigger a bidirectional sync cycle — push state to GPT, pull and execute pending commands.
          </p>
          <button
            onClick={() => run("sync_now", "Sync")}
            disabled={busy !== null || !engineReady}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#0066ff] px-4 py-2.5 text-sm font-bold text-white hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] transition disabled:opacity-50"
          >
            {busy === "sync_now" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            Sync Now
          </button>
        </div>
      </div>

      {/* Sync status detail */}
      {autonomous && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#00d4ff]" /> Sync Status
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <SyncMetric label="Engine Configured" value={autonomous.engine_configured ? "Yes" : "No"} ok={autonomous.engine_configured} />
            <SyncMetric label="Sync Key" value={autonomous.sync_key_configured ? "Set" : "Missing"} ok={autonomous.sync_key_configured} />
            <SyncMetric label="Last Push" value={autonomous.last_push ? new Date(autonomous.last_push.created_date).toLocaleTimeString() : "—"} ok={autonomous.last_push?.status === "success"} />
            <SyncMetric label="Last Pull" value={autonomous.last_pull ? new Date(autonomous.last_pull.created_date).toLocaleTimeString() : "—"} ok={autonomous.last_pull?.status === "success"} />
          </div>
        </div>
      )}

      {/* Tool library */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <Wrench className="w-4 h-4 text-[#00d4ff]" /> GPT Tool Library ({tools.length})
        </h3>
        {loading ? (
          <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-[#00d4ff]" /></div>
        ) : tools.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No tools loaded. Enable the library to expose tools to GPT.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {tools.map((t) => (
              <div key={t.name} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <code className="text-xs font-mono font-semibold text-slate-700 truncate">{t.name}</code>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${t.type === "read" ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"}`}>{t.type}</span>
                    {t.protected && <Shield className="w-3 h-3 text-red-400" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Activity log */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#00d4ff]" /> Control Activity Log
        </h3>
        {logs.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No control actions logged yet.</p>
        ) : (
          <div className="space-y-1.5 max-h-80 overflow-y-auto">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center gap-3 rounded-lg border border-slate-100 px-3 py-2">
                {log.status === "success" ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                )}
                <span className="text-xs font-mono font-semibold text-slate-600 shrink-0">{log.operation}</span>
                <span className="text-xs text-slate-400 truncate flex-1">{log.summary}</span>
                <span className="text-[10px] text-slate-300 shrink-0">
                  {new Date(log.created_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusPill({ label, active }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full ${active ? "bg-emerald-400" : "bg-slate-300"}`} />
      <span className="text-xs font-semibold text-slate-500">{label}</span>
    </div>
  );
}

function SyncMetric({ label, value, ok }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{label}</div>
      <div className={`text-sm font-bold ${ok ? "text-emerald-600" : "text-slate-600"}`}>{value}</div>
    </div>
  );
}