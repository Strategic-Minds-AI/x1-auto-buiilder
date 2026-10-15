import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import {
  Activity, Database, Send, RefreshCw, Server, Zap, Loader2,
  CheckCircle2, AlertCircle, Clock, ArrowRight, Cpu, GitBranch
} from "lucide-react";

const ACTION_CLASSES = [
  { value: "READ_ONLY", label: "Read Only", desc: "Safe read operations" },
  { value: "NON_PRODUCTION_MUTATION", label: "Non-Prod Mutation", desc: "Staging/sandbox changes" },
  { value: "PROTECTED_MUTATION", label: "Protected Mutation", desc: "Requires approval" },
  { value: "PRODUCTION_RELEASE", label: "Production Release", desc: "Live deployment" },
];

const PROJECTS = [
  { ref: "vgsmyhqqtkkluhypxyua", name: "X1 AI Hub" },
  { ref: "uvdkzsbjackpjvpoxtyk", name: "X1 AI Hub Staging" },
  { ref: "fwtchbsebygwifmmqhur", name: "Universal Property Intelligence" },
  { ref: "jadlpbokfdkonvnfxjzs", name: "Strategic Intelligence" },
];

const STATUS_COLORS = {
  PENDING: "bg-amber-100 text-amber-700 border-amber-200",
  LEASED: "bg-blue-100 text-blue-700 border-blue-200",
  COMPLETED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  FAILED: "bg-red-100 text-red-700 border-red-200",
  BLOCKED: "bg-orange-100 text-orange-700 border-orange-200",
  DEAD_LETTER: "bg-red-100 text-red-700 border-red-200",
  running: "bg-blue-100 text-blue-700 border-blue-200",
  DISCOVER: "bg-purple-100 text-purple-700 border-purple-200",
};

export default function SupabaseBridgePanel() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projectRef, setProjectRef] = useState("vgsmyhqqtkkluhypxyua");
  const [pushOpen, setPushOpen] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [pushResult, setPushResult] = useState(null);
  const [pushForm, setPushForm] = useState({
    action_class: "NON_PRODUCTION_MUTATION",
    priority: 100,
    payload: '{"source": "digital_dominance_factory"}',
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("supabaseBridge", {
        operation: "status",
        project_ref: projectRef,
      });
      setStatus(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to load status");
    } finally {
      setLoading(false);
    }
  }, [projectRef]);

  useEffect(() => { load(); }, [load]);

  const pushWork = async () => {
    setPushing(true);
    setPushResult(null);
    try {
      let payload = {};
      try { payload = JSON.parse(pushForm.payload); }
      catch { payload = { raw: pushForm.payload }; }
      const res = await base44.functions.invoke("supabaseBridge", {
        operation: "push_work",
        project_ref: projectRef,
        action_class: pushForm.action_class,
        priority: parseInt(pushForm.priority, 10) || 100,
        payload,
      });
      setPushResult(res.data);
      setTimeout(() => load(), 500);
    } catch (err) {
      setPushResult({ error: err.response?.data?.error || err.message });
    } finally {
      setPushing(false);
    }
  };

  const projectName = PROJECTS.find((p) => p.ref === projectRef)?.name || projectRef;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Supabase Bridge</h1>
              <p className="text-sm text-slate-500">Connected to your autonomous X1 AI Hub build system</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={projectRef}
            onChange={(e) => setProjectRef(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:border-[#00d4ff]/50 focus:ring-1 focus:ring-[#00d4ff]/30"
          >
            {PROJECTS.map((p) => (
              <option key={p.ref} value={p.ref}>{p.name}</option>
            ))}
          </select>
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-[#00d4ff] hover:border-[#00d4ff]/40 transition disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Stats row */}
      {!loading && status && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
          <StatCard icon={Clock} label="Queue Items" value={status.workQueue?.length || 0} color="amber" />
          <StatCard icon={GitBranch} label="Pipelines" value={status.factoryPipelines?.length || 0} color="blue" />
          <StatCard icon={Activity} label="Convergence" value={status.convergenceCycles?.length || 0} color="purple" />
          <StatCard icon={Zap} label="APEX Events" value={status.apexEvents?.length || 0} color="cyan" />
          <StatCard icon={Cpu} label="Workers" value={status.workerFleet?.length || 0} color="emerald" />
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Work Queue */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" /> X1 Work Queue
            </h2>
            <button
              onClick={() => setPushOpen(!pushOpen)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#00d4ff] px-3 py-1.5 text-xs font-bold text-[#0a0e14] hover:brightness-110 transition"
            >
              <Send className="w-3 h-3" /> Push Work
            </button>
          </div>

          {pushOpen && (
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Action Class</label>
                <select
                  value={pushForm.action_class}
                  onChange={(e) => setPushForm({ ...pushForm, action_class: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-[#00d4ff]/50"
                >
                  {ACTION_CLASSES.map((a) => (
                    <option key={a.value} value={a.value}>{a.label} — {a.desc}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Priority</label>
                  <input
                    type="number"
                    value={pushForm.priority}
                    onChange={(e) => setPushForm({ ...pushForm, priority: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-[#00d4ff]/50"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Payload (JSON)</label>
                  <input
                    value={pushForm.payload}
                    onChange={(e) => setPushForm({ ...pushForm, payload: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono text-slate-700 focus:outline-none focus:border-[#00d4ff]/50"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={pushWork}
                  disabled={pushing}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-bold text-white hover:bg-slate-900 transition disabled:opacity-50"
                >
                  {pushing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Submit to Queue
                </button>
                {pushResult?.success && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                    <CheckCircle2 className="w-4 h-4" /> Work item queued
                  </span>
                )}
                {pushResult?.error && (
                  <span className="text-sm text-red-500 font-medium">{pushResult.error}</span>
                )}
              </div>
            </div>
          )}

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-slate-300" /></div>
            ) : (status?.workQueue?.length || 0) === 0 ? (
              <div className="text-center py-12 text-sm text-slate-400">No work items in queue</div>
            ) : (
              status?.workQueue?.map((item) => (
                <div key={item.work_id} className="px-5 py-3 border-b border-slate-50 hover:bg-slate-50/50">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${STATUS_COLORS[item.status] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
                          {item.status}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">{item.action_class}</span>
                      </div>
                      <p className="text-xs font-mono text-slate-600 truncate">{item.task_id}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(item.created_at).toLocaleString()} · {item.attempts} attempt(s) · P{item.priority}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* APEX Events */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-500" /> APEX Output Events
            </h2>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-slate-300" /></div>
            ) : (status?.apexEvents?.length || 0) === 0 ? (
              <div className="text-center py-12 text-sm text-slate-400">No APEX events</div>
            ) : (
              status?.apexEvents?.map((evt) => (
                <div key={evt.id} className="px-5 py-3 border-b border-slate-50 hover:bg-slate-50/50">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono text-cyan-600">{evt.event_type}</span>
                    <span className="text-[10px] text-slate-400">·</span>
                    <span className="text-[10px] font-medium text-slate-500">{evt.importance}</span>
                    <span className="text-[10px] text-slate-400">·</span>
                    <span className={`text-[10px] font-medium ${evt.trust_state === "verified" ? "text-emerald-600" : "text-amber-600"}`}>
                      {evt.trust_state}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 line-clamp-2">{evt.summary}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {evt.producer} · {new Date(evt.created_at).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Convergence Cycles */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-500" /> Convergence Cycles
            </h2>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-slate-300" /></div>
            ) : (status?.convergenceCycles?.length || 0) === 0 ? (
              <div className="text-center py-8 text-sm text-slate-400">No convergence cycles</div>
            ) : (
              status?.convergenceCycles?.map((c) => (
                <div key={c.id} className="px-5 py-3 border-b border-slate-50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-700">Cycle #{c.cycle_number}</span>
                    <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${STATUS_COLORS[c.status] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
                      {c.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-500">
                    <span>Phase: {c.phase}</span>
                    {c.score != null && <span>Score: {c.score}</span>}
                    <span>{c.categories_passed}/{c.categories_passed + c.categories_failed} passed</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Worker Fleet */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-500" /> Worker Fleet
            </h2>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-slate-300" /></div>
            ) : (status?.workerFleet?.length || 0) === 0 ? (
              <div className="text-center py-8 text-sm text-slate-400">No workers registered</div>
            ) : (
              status?.workerFleet?.map((w) => (
                <div key={w.id} className="px-5 py-3 border-b border-slate-50 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-700">{w.name}</p>
                    <p className="text-[10px] text-slate-400">{w.focus_area} · {w.deploy_target}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${w.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      {w.active ? "ACTIVE" : "IDLE"}
                    </span>
                    <span className="text-[10px] text-slate-400">{w.total_runs} runs</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Connection info */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-center gap-3">
        <Server className="w-5 h-5 text-slate-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-600">
            Connected to <span className="font-mono text-[#00d4ff]">{projectName}</span>
          </p>
          <p className="text-[11px] text-slate-400">
            66 tables · x1_work_queue, factory_pipelines, apex_output_events, convergence_cycles, worker_fleet, swarm_tasks
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-600">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> LIVE
        </span>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    cyan: "bg-cyan-50 text-cyan-600 border-cyan-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
  };
  return (
    <div className={`rounded-xl border p-3 ${colors[color] || colors.amber}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-3.5 h-3.5" />
        <span className="text-[10px] font-bold tracking-wide uppercase opacity-70">{label}</span>
      </div>
      <p className="text-2xl font-black">{value}</p>
    </div>
  );
}