import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import {
  AlertTriangle, Activity, Wrench, Clock, RefreshCw, Loader2,
  CheckCircle2, XCircle, Zap, Gauge, Cpu, ArrowRight,
} from "lucide-react";

export default function FailedBuildsSection({ live }) {
  const [failedRuns, setFailedRuns] = useState([]);
  const [repairing, setRepairing] = useState(null);
  const [lastRepair, setLastRepair] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);

  const loadFailed = useCallback(async () => {
    try {
      const page = await base44.entities.PipelineRun.filter(
        { status: { $in: ["failed", "paused"] } },
        { sort: "-created_date", limit: 20 }
      );
      setFailedRuns(page.items || []);
    } catch { /* table may be empty */ }
    finally { setLoading(false); setLastRefresh(new Date()); }
  }, []);

  useEffect(() => { loadFailed(); }, [loadFailed]);

  useEffect(() => {
    if (!live) return;
    const unsub = base44.entities.PipelineRun.subscribe(() => loadFailed());
    return () => unsub?.();
  }, [live, loadFailed]);

  const triggerRepair = async (run) => {
    setRepairing(run.id);
    try {
      const businessName = run.project_name?.split(" — ")[0] || run.project_name;
      const projectPage = await base44.entities.WebsiteProject.filter(
        { business_name: { $regex: businessName, $options: "i" } },
        { sort: "-created_date", limit: 1 }
      );
      const projects = projectPage.items || [];
      if (projects.length === 0) {
        setLastRepair({ error: "No linked project found", run: run.id });
        return;
      }
      const res = await base44.functions.invoke("validatorGatedPipeline", {
        projectId: projects[0].id,
        skipDeploy: false,
      });
      setLastRepair({
        run: run.id,
        success: res.data?.success,
        gated: res.data?.gated,
        gate_reason: res.data?.gate_reason,
        deploy_url: res.data?.stages?.find((s) => s.stage === "deploy")?.url,
      });
      loadFailed();
    } catch (err) {
      setLastRepair({ error: err.message, run: run.id });
    } finally {
      setRepairing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-[#00d4ff]" />
      </div>
    );
  }

  return (
    <div>
      {/* Section header with watcher status */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Activity className="w-4 h-4 text-[#00d4ff]" />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h2 className="text-sm font-bold text-slate-700">Failed Builds &amp; Self-Healing</h2>
          <span className="text-xs text-slate-400">({failedRuns.length})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-bold text-emerald-600">
            <Cpu className="w-3 h-3" />
            Watcher Active · 10min
          </span>
        </div>
      </div>

      {/* Last repair result toast */}
      {lastRepair && (
        <div className={`mb-3 rounded-xl p-3 text-xs flex items-center gap-2 ${
          lastRepair.error ? "bg-red-50 border border-red-200 text-red-700" :
          lastRepair.success ? "bg-emerald-50 border border-emerald-200 text-emerald-700" :
          "bg-amber-50 border border-amber-200 text-amber-700"
        }`}>
          {lastRepair.error ? <XCircle className="w-4 h-4 shrink-0" /> :
           lastRepair.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> :
           <AlertTriangle className="w-4 h-4 shrink-0" />}
          <span className="flex-1">
            {lastRepair.error ? `Repair failed: ${lastRepair.error}` :
             lastRepair.success ? `Repair successful! Deployed: ${lastRepair.deploy_url || "pending"}` :
             `Repaired but still gated: ${lastRepair.gate_reason}`}
          </span>
          <button onClick={() => setLastRepair(null)} className="text-slate-400 hover:text-slate-600">×</button>
        </div>
      )}

      {failedRuns.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500 font-medium">All builds healthy. No failures detected.</p>
          <p className="text-xs text-slate-400 mt-1">The self-healing watcher is monitoring every 10 minutes.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {failedRuns.map((run) => (
            <FailedBuildCard
              key={run.id}
              run={run}
              repairing={repairing === run.id}
              onRepair={() => triggerRepair(run)}
            />
          ))}
        </div>
      )}

      {lastRefresh && (
        <div className="mt-3 text-center text-[11px] text-slate-400">
          Updated {lastRefresh.toLocaleTimeString()} {live && <span className="text-emerald-500">· Live</span>}
        </div>
      )}
    </div>
  );
}

function FailedBuildCard({ run, repairing, onRepair }) {
  const stages = run.stages || [];
  const failedStage = stages.find((s) => s.status === "failed") || stages.find((s) => s.status === "FAILED");
  const browserStage = stages.find((s) => s.stage === "cloud_browser_test");
  const metrics = browserStage?.performance_metrics || failedStage?.performance_metrics;
  const stageIndex = run.current_stage_index || 0;
  const totalStages = Math.max(stages.length, 1);
  const progress = Math.round((stageIndex / totalStages) * 100);

  return (
    <div className="bg-white rounded-2xl border border-red-200 p-4">
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
            <XCircle className="w-4 h-4 text-red-500" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-slate-800 truncate">{run.project_name}</div>
            <div className="text-xs text-red-500 truncate">
              {run.current_stage ? `Failed at: ${run.current_stage}` : "Build failed"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-500">
            <XCircle className="w-3 h-3" /> FAILED
          </span>
          <span className="text-xs font-bold text-slate-400">{progress}%</span>
        </div>
      </div>

      {/* Progress bar showing where it failed */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full bg-red-400 rounded-full" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-[10px] text-slate-400">Stage {stageIndex}/{totalStages}</span>
      </div>

      {/* Performance metrics if available */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
          <MetricChip label="LCP" value={metrics.lcp_ms != null ? `${Math.round(metrics.lcp_ms)}ms` : "n/a"} budget="2500ms" breach={metrics.lcp_ms > 2500} />
          <MetricChip label="INP" value={metrics.inp_ms != null ? `${Math.round(metrics.inp_ms)}ms` : "n/a"} budget="200ms" breach={metrics.inp_ms > 200} />
          <MetricChip label="CLS" value={metrics.cls ?? "n/a"} budget="0.1" breach={metrics.cls > 0.1} />
          <MetricChip label="DOM" value={metrics.dom_node_count ?? "n/a"} budget="nodes" />
        </div>
      )}

      {/* Stage error details */}
      {failedStage?.error && (
        <div className="mb-3 rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-xs text-red-600">
          <span className="font-bold">Error: </span>{failedStage.error}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onRepair}
          disabled={repairing}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#00d4ff] px-4 py-2 text-xs font-bold text-[#0a0e14] hover:brightness-110 disabled:opacity-50 transition"
        >
          {repairing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wrench className="w-3.5 h-3.5" />}
          {repairing ? "Repairing..." : "Trigger Repair Now"}
        </button>
        <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
          <Clock className="w-3 h-3" />
          {new Date(run.created_date).toLocaleString()}
        </span>
      </div>
    </div>
  );
}

function MetricChip({ label, value, budget, breach }) {
  return (
    <div className={`rounded-lg px-2.5 py-1.5 border ${breach ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200"}`}>
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{label}</div>
      <div className={`text-sm font-bold ${breach ? "text-red-600" : "text-slate-700"}`}>{value}</div>
      <div className="text-[9px] text-slate-400">budget: {budget}</div>
    </div>
  );
}