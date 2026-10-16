import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import {
  Activity, RefreshCw, CheckCircle2, XCircle, AlertTriangle, Loader2,
  Radio, Rocket, BarChart3, Server, Zap, Clock, ChevronDown, ChevronUp,
  ExternalLink, Copy, Database, Cloud
} from "lucide-react";
import BackButton from "@/components/shared/BackButton";

export default function FactoryConsole() {
  const [cycleResult, setCycleResult] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);
  const [expandedPhase, setExpandedPhase] = useState(null);
  const [stats, setStats] = useState({
    totalProjects: 0,
    deployedProjects: 0,
    pendingDeploy: 0,
    activeSandboxes: 0,
  });

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      // Load recent factory cycle receipts
      const { items: receiptData } = await base44.entities.SyncReceipt.filter(
        { action: 'factory_cycle' },
        { sort: '-created_date', limit: 10 }
      );
      setReceipts(receiptData);

      // Load stats
      const [total, deployed, pending, sandboxes] = await Promise.all([
        base44.entities.WebsiteProject.count(),
        base44.entities.WebsiteProject.count({ deploy_url: { $exists: true } }),
        base44.entities.WebsiteProject.count({ status: { $in: ['approved', 'preview_ready'] }, deploy_url: { $exists: false } }),
        base44.entities.Sandbox.count({ status: 'active' }),
      ]);
      setStats({ totalProjects: total, deployedProjects: deployed, pendingDeploy: pending, activeSandboxes: sandboxes });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadStatus(); }, [loadStatus]);

  const runCycle = async () => {
    setRunning(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("autonomousFactoryCycle", {});
      setCycleResult(res.data);
      await loadStatus(); // refresh stats
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to run cycle");
    } finally {
      setRunning(false);
    }
  };

  const phases = cycleResult?.phases || {};
  const lastReceipt = receipts[0];

  const PHASE_CONFIG = [
    { key: 'gpt_sync', label: 'GPT Bi-Directional Sync', icon: Radio, color: '#00d4ff' },
    { key: 'vercel_deploy', label: 'Vercel Auto-Deploy', icon: Rocket, color: '#0066ff' },
    { key: 'analytics_sync', label: 'Google Analytics Sync', icon: BarChart3, color: '#8b5cf6' },
    { key: 'sandbox_provision', label: 'Railway Sandbox Provision', icon: Server, color: '#10b981' },
  ];

  return (
    <div className="portal-light min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <BackButton fallback="/portal" label="Back to Portal" />

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">Autonomous Factory Console</h1>
              <p className="text-sm text-slate-500">Unified orchestration: GPT sync, Vercel deploy, Analytics sync, Railway sandbox — runs every 10 minutes</p>
            </div>
          </div>
          <button
            onClick={runCycle}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-xl bg-[#00d4ff] px-5 py-2.5 text-sm font-bold text-[#0a0e14] hover:brightness-110 hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] transition disabled:opacity-60"
          >
            {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {running ? "Running Cycle..." : "Run Cycle Now"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Database} label="Total Projects" value={stats.totalProjects} color="#00d4ff" />
          <StatCard icon={Rocket} label="Deployed to Vercel" value={stats.deployedProjects} color="#0066ff" />
          <StatCard icon={Clock} label="Pending Deploy" value={stats.pendingDeploy} color="#f59e0b" />
          <StatCard icon={Server} label="Active Sandboxes" value={stats.activeSandboxes} color="#10b981" />
        </div>

        {/* Last cycle summary */}
        {lastReceipt && (
          <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-center gap-3">
            <Activity className={`w-5 h-5 ${lastReceipt.status === 'success' ? 'text-green-500' : 'text-amber-500'}`} />
            <div className="flex-1">
              <div className="text-sm font-semibold text-slate-700">Last automated cycle</div>
              <div className="text-xs text-slate-400">{lastReceipt.summary}</div>
            </div>
            <div className="text-xs text-slate-400">
              {new Date(lastReceipt.created_date).toLocaleString('en-US', { timeZone: 'America/New_York' })}
            </div>
          </div>
        )}

        {/* Phase cards */}
        {loading && !cycleResult ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {PHASE_CONFIG.map(phase => {
              const data = phases[phase.key];
              const ok = data?.ok;
              const Icon = phase.icon;
              const isExpanded = expandedPhase === phase.key;
              return (
                <div
                  key={phase.key}
                  className={`rounded-2xl border p-5 transition-all ${ok === true ? 'border-green-200 bg-green-50/30' : ok === false ? 'border-red-200 bg-red-50/30' : 'border-slate-200 bg-white'}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: phase.color + '15' }}>
                        <Icon className="w-5 h-5" style={{ color: phase.color }} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{phase.label}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {ok === true && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                          {ok === false && <XCircle className="w-3.5 h-3.5 text-red-500" />}
                          {ok === undefined && <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300" />}
                          <span className={`text-xs font-medium ${ok === true ? 'text-green-600' : ok === false ? 'text-red-600' : 'text-slate-400'}`}>
                            {ok === true ? 'Operational' : ok === false ? 'Failed' : 'Idle'}
                          </span>
                        </div>
                      </div>
                    </div>
                    {data && Object.keys(data).length > 2 && (
                      <button onClick={() => setExpandedPhase(isExpanded ? null : phase.key)} className="text-slate-400 hover:text-slate-600">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    )}
                  </div>

                  {/* Phase summary */}
                  {data && (
                    <div className="space-y-1">
                      {phase.key === 'gpt_sync' && (
                        <>
                          <PhaseStat label="Pushed" value={`${data.pushed_records || 0} records`} ok={data.pushed} />
                          <PhaseStat label="Commands pulled" value={data.commands_pulled || 0} ok={data.pulled} />
                          <PhaseStat label="Executed" value={data.executed || 0} ok={data.executed > 0} />
                          <PhaseStat label="Acknowledged" value={data.acked ? 'Yes' : 'No'} ok={data.acked} />
                        </>
                      )}
                      {phase.key === 'vercel_deploy' && (
                        <>
                          <PhaseStat label="Pending projects" value={data.pending || 0} />
                          <PhaseStat label="Deployed" value={data.deployed || 0} ok={data.deployed > 0} />
                          <PhaseStat label="Failed" value={data.failed || 0} ok={data.failed === 0} warn={data.failed > 0} />
                        </>
                      )}
                      {phase.key === 'analytics_sync' && (
                        <>
                          <PhaseStat label="Projects checked" value={data.projects || 0} />
                          <PhaseStat label="Synced" value={data.synced || 0} ok={data.synced > 0} />
                          <PhaseStat label="Skipped" value={data.skipped || 0} />
                          <PhaseStat label="Failed" value={data.failed || 0} ok={data.failed === 0} warn={data.failed > 0} />
                        </>
                      )}
                      {phase.key === 'sandbox_provision' && (
                        <>
                          <PhaseStat label="New projects" value={data.new_projects || 0} />
                          <PhaseStat label="Provisioned" value={data.provisioned || 0} ok={data.provisioned > 0} />
                          <PhaseStat label="Already had sandbox" value={data.skipped || 0} />
                        </>
                      )}
                    </div>
                  )}

                  {/* Expanded details */}
                  {isExpanded && data && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <pre className="text-xs text-slate-600 font-mono bg-slate-50 rounded-lg p-3 max-h-48 overflow-y-auto">
                        {JSON.stringify(data, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Error message */}
                  {ok === false && data?.error && (
                    <div className="mt-3 text-xs text-red-500 font-medium bg-red-50 rounded-lg p-2">
                      {data.error}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Recent cycles */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-700">Recent Cycle History</h3>
          </div>
          {receipts.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-slate-400">
              No cycles run yet. The autonomous workflow runs every 10 minutes, or click "Run Cycle Now" above.
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {receipts.map((r, i) => (
                <div key={i} className="px-5 py-3 flex items-center gap-3 hover:bg-slate-50/50 transition">
                  <div className={`w-2 h-2 rounded-full ${r.status === 'success' ? 'bg-green-500' : 'bg-amber-500'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-slate-700 font-medium truncate">{r.summary}</div>
                    <div className="text-xs text-slate-400">{new Date(r.created_date).toLocaleString('en-US', { timeZone: 'America/New_York' })}</div>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-md ${r.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Infrastructure info */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoCard icon={Cloud} title="Vercel" desc="Production deployments via VERCEL_TOKEN + VERCEL_TEAM_ID" status="configured" />
          <InfoCard icon={Server} title="Railway" desc="Sandbox provisioning via RAILWAY_API_TOKEN" status="configured" />
          <InfoCard icon={BarChart3} title="Google Search Console" desc="Analytics sync via authorized connector" status="configured" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" style={{ color }} />
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-black text-slate-900">{value}</div>
    </div>
  );
}

function PhaseStat({ label, value, ok, warn }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-slate-500">{label}</span>
      <span className={`font-semibold ${warn ? 'text-amber-600' : ok === true ? 'text-green-600' : ok === false ? 'text-red-500' : 'text-slate-700'}`}>
        {value}
      </span>
    </div>
  );
}

function InfoCard({ icon: Icon, title, desc, status }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 text-slate-400" />
        <span className="text-sm font-bold text-slate-700">{title}</span>
        <span className="ml-auto">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
        </span>
      </div>
      <p className="text-xs text-slate-400">{desc}</p>
    </div>
  );
}