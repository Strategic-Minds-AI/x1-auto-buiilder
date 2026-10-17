import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { AGENT_ROSTER, PIPELINE_STAGES } from "@/data/superAgentRoster";
import {
  Activity, Bot, CheckCircle2, XCircle, Loader2, Clock, Zap,
  AlertTriangle, Pause, Radio, RefreshCw, Cpu, Layers, Gauge, CircleDot,
} from "lucide-react";

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "text-slate-500", bg: "bg-slate-100", icon: Clock },
  in_progress: { label: "Active", color: "text-cyan-600", bg: "bg-cyan-50", icon: Loader2, spin: true },
  complete: { label: "Complete", color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle2 },
  completed: { label: "Complete", color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle2 },
  failed: { label: "Failed", color: "text-red-500", bg: "bg-red-50", icon: XCircle },
  READY: { label: "Ready", color: "text-amber-600", bg: "bg-amber-50", icon: CircleDot },
  ASSIGNED: { label: "Assigned", color: "text-blue-600", bg: "bg-blue-50", icon: Zap },
  IN_PROGRESS: { label: "Executing", color: "text-cyan-600", bg: "bg-cyan-50", icon: Loader2, spin: true },
  COMPLETED: { label: "Done", color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle2 },
  BLOCKED: { label: "Blocked", color: "text-red-500", bg: "bg-red-50", icon: AlertTriangle },
  FAILED: { label: "Failed", color: "text-red-500", bg: "bg-red-50", icon: XCircle },
  PENDING: { label: "Queued", color: "text-slate-500", bg: "bg-slate-100", icon: Clock },
  SKIPPED: { label: "Skipped", color: "text-slate-400", bg: "bg-slate-50", icon: Pause },
};

const POD_COLORS = {
  Strategy: "from-violet-500 to-purple-600",
  Research: "from-blue-500 to-cyan-600",
  Design: "from-pink-500 to-rose-600",
  Build: "from-cyan-500 to-blue-600",
  Content: "from-amber-500 to-orange-600",
  QA: "from-emerald-500 to-teal-600",
  Governance: "from-red-500 to-rose-600",
  Operations: "from-slate-500 to-slate-700",
};

export default function SuperAgentMonitor() {
  const [tasks, setTasks] = useState([]);
  const [runs, setRuns] = useState([]);
  const [packets, setPackets] = useState([]);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [filter, setFilter] = useState("all"); // all | active | builds

  const loadAll = async () => {
    try {
      const [taskPage, runPage, packetPage, queuePage] = await Promise.all([
        base44.entities.AgentTask.filter({ status: { $ne: "complete" } }, { sort: "-created_date", limit: 100 }),
        base44.entities.PipelineRun.filter(
          { status: { $in: ["intake", "processing", "validated", "fixing", "qa", "provisioning", "launching", "paused"] } },
          { sort: "-created_date", limit: 50 }
        ),
        base44.entities.WorkPacket.filter(
          { status: { $in: ["READY", "ASSIGNED", "IN_PROGRESS", "BLOCKED"] } },
          { sort: "-created_date", limit: 100 }
        ),
        base44.entities.BuildQueue.filter(
          { status: { $in: ["pending", "assigned", "processing"] } },
          { sort: "-created_date", limit: 50 }
        ),
      ]);
      setTasks(taskPage.items || []);
      setRuns(runPage.items || []);
      setPackets(packetPage.items || []);
      setQueue(queuePage.items || []);
    } catch { /* table may be empty */ }
    finally { setLoading(false); setLastRefresh(new Date()); }
  };

  useEffect(() => { loadAll(); }, []);

  // Real-time subscriptions
  useEffect(() => {
    if (!live) return;
    const unsubTasks = base44.entities.AgentTask.subscribe(() => loadAll());
    const unsubRuns = base44.entities.PipelineRun.subscribe(() => loadAll());
    const unsubPackets = base44.entities.WorkPacket.subscribe(() => loadAll());
    return () => { unsubTasks?.(); unsubRuns?.(); unsubPackets?.(); };
  }, [live]);

  // Build agent activity map: agent_id → { task, status, progress, project, packet }
  const agentActivity = useMemo(() => {
    const map = {};
    // From AgentTask
    tasks.forEach((t) => {
      const aid = t.agent_name || t.assigned_to || "unknown";
      if (!map[aid] || (t.status === "in_progress")) {
        map[aid] = { task: t.task, status: t.status, progress: t.progress || 0, projectId: t.project_id, priority: t.priority, source: "task" };
      }
    });
    // From WorkPacket (richer data)
    packets.forEach((p) => {
      const aid = p.assigned_agent || p.stage_id;
      if (!map[aid] || p.status === "IN_PROGRESS") {
        const stage = PIPELINE_STAGES.find((s) => s.stage_id === p.stage_id || s.agent === p.assigned_agent);
        map[aid] = {
          task: p.title || stage?.label || p.description,
          status: p.status,
          progress: p.status === "COMPLETED" ? 100 : p.status === "IN_PROGRESS" ? 50 : p.status === "READY" ? 0 : 25,
          projectId: p.pipeline_run_id,
          priority: "medium",
          source: "packet",
        };
      }
    });
    return map;
  }, [tasks, packets]);

  // Merge roster with live activity
  const agents = useMemo(() => {
    return AGENT_ROSTER.map((agent) => {
      const activity = agentActivity[agent.agent_id];
      return {
        ...agent,
        activity: activity || null,
        liveStatus: activity?.status || "idle",
      };
    });
  }, [agentActivity]);

  // Stats
  const stats = useMemo(() => {
    const activeAgents = agents.filter((a) => a.activity).length;
    const inProgressBuilds = runs.length;
    const queuedBuilds = queue.length;
    const activePackets = packets.filter((p) => p.status === "IN_PROGRESS").length;
    const blocked = packets.filter((p) => p.status === "BLOCKED").length;
    return { activeAgents, inProgressBuilds, queuedBuilds, activePackets, blocked, totalAgents: agents.length };
  }, [agents, runs, queue, packets]);

  const filteredAgents = useMemo(() => {
    if (filter === "active") return agents.filter((a) => a.activity);
    return agents;
  }, [agents, filter]);

  return (
    <div className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center shrink-0">
            <Cpu className="w-5 h-5 text-[#0a0e14]" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900">Super Agent Monitor</h1>
            <p className="text-xs sm:text-sm text-slate-500">Real-time task, status, and build progress across all agents</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLive(!live)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold transition ${
              live ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-slate-100 text-slate-500 border border-slate-200"
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${live ? "animate-pulse" : ""}`} />
            {live ? "Live" : "Paused"}
          </button>
          <button
            onClick={loadAll}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:text-[#00d4ff] hover:border-[#00d4ff]/40 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-6">
        <StatCard icon={Bot} label="Total Agents" value={stats.totalAgents} color="text-slate-700" bg="bg-slate-50" />
        <StatCard icon={Activity} label="Active Now" value={stats.activeAgents} color="text-cyan-600" bg="bg-cyan-50" pulse={stats.activeAgents > 0} />
        <StatCard icon={Layers} label="In-Progress Builds" value={stats.inProgressBuilds} color="text-blue-600" bg="bg-blue-50" />
        <StatCard icon={Gauge} label="Executing Packets" value={stats.activePackets} color="text-violet-600" bg="bg-violet-50" />
        <StatCard icon={Clock} label="Queued Builds" value={stats.queuedBuilds} color="text-amber-600" bg="bg-amber-50" />
        <StatCard icon={AlertTriangle} label="Blocked" value={stats.blocked} color="text-red-500" bg="bg-red-50" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-[#00d4ff]" />
        </div>
      ) : (
        <>
          {/* Filter tabs */}
          <div className="flex gap-1.5 mb-4">
            <FilterTab active={filter === "all"} onClick={() => setFilter("all")}>All Agents</FilterTab>
            <FilterTab active={filter === "active"} onClick={() => setFilter("active")}>Active Only</FilterTab>
          </div>

          {/* Agent table — responsive card layout on mobile */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-6">
            <div className="hidden lg:grid grid-cols-12 gap-3 px-5 py-3 bg-slate-50 border-b border-slate-200 text-[11px] font-bold tracking-wide text-slate-500 uppercase">
              <div className="col-span-3">Agent</div>
              <div className="col-span-3">Current Task</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Progress</div>
              <div className="col-span-2">Project / Build</div>
            </div>
            <div className="divide-y divide-slate-100">
              {filteredAgents.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <Bot className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No agents match this filter.</p>
                </div>
              ) : (
                filteredAgents.map((agent) => (
                  <AgentRow key={agent.agent_id} agent={agent} runs={runs} />
                ))
              )}
            </div>
          </div>

          {/* Ongoing project builds */}
          <div className="mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#00d4ff]" />
            <h2 className="text-sm font-bold text-slate-700">Ongoing Project Builds</h2>
            <span className="text-xs text-slate-400">({runs.length})</span>
          </div>
          {runs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
              <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No builds in progress. All pipelines are idle or complete.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {runs.map((run) => (
                <BuildRow key={run.id} run={run} packets={packets} />
              ))}
            </div>
          )}

          {/* Build queue */}
          {queue.length > 0 && (
            <>
              <div className="mt-6 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-bold text-slate-700">Build Queue</h2>
                <span className="text-xs text-slate-400">({queue.length})</span>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
                {queue.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-700 truncate">{item.title}</div>
                      <div className="text-xs text-slate-400 truncate">
                        {item.industry} {item.location ? `· ${item.location}` : ""} · {item.build_type}
                      </div>
                    </div>
                    <StatusBadge status={item.status} />
                    <span className="text-xs font-bold text-slate-400 uppercase shrink-0">{item.priority}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Last refresh */}
          {lastRefresh && (
            <div className="mt-4 text-center text-[11px] text-slate-400">
              Last updated {lastRefresh.toLocaleTimeString()} {live && <span className="text-emerald-500">· Live</span>}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bg, pulse }) {
  return (
    <div className={`${bg} rounded-xl border border-slate-200/50 p-3`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-3.5 h-3.5 ${color}`} />
        <span className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase">{label}</span>
      </div>
      <div className={`text-xl font-black ${color}`}>{value}</div>
      {pulse && <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse mt-0.5" />}
    </div>
  );
}

function FilterTab({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-xs font-bold transition ${
        active ? "bg-[#00d4ff] text-[#0a0e14]" : "bg-white border border-slate-200 text-slate-600 hover:border-[#00d4ff]/40"
      }`}
    >
      {children}
    </button>
  );
}

function AgentRow({ agent, runs }) {
  const activity = agent.activity;
  const statusKey = activity?.status || "idle";
  const cfg = STATUS_CONFIG[statusKey] || { label: "Idle", color: "text-slate-400", bg: "bg-slate-50", icon: Clock };
  const podColor = POD_COLORS[agent.pod] || "from-slate-500 to-slate-700";
  const progress = activity?.progress || 0;
  const run = activity?.projectId ? runs.find((r) => r.id === activity.projectId || r.id === activity.projectId) : null;

  return (
    <div className="px-4 sm:px-5 py-3.5 hover:bg-slate-50/50 transition">
      {/* Desktop grid */}
      <div className="hidden lg:grid grid-cols-12 gap-3 items-center">
        <div className="col-span-3 flex items-center gap-2.5 min-w-0">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${podColor} flex items-center justify-center shrink-0`}>
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-slate-800 truncate">{agent.name}</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wide">{agent.pod} · {agent.authority}</div>
          </div>
        </div>
        <div className="col-span-3 min-w-0">
          <div className="text-xs font-medium text-slate-600 truncate">{activity?.task || "Idle — awaiting assignment"}</div>
        </div>
        <div className="col-span-2">
          <StatusBadge status={statusKey} />
        </div>
        <div className="col-span-2">
          <ProgressBar value={progress} />
        </div>
        <div className="col-span-2 min-w-0">
          {run ? (
            <div className="text-xs font-medium text-[#00d4ff] truncate">{run.project_name}</div>
          ) : activity?.projectId ? (
            <div className="text-xs text-slate-400 truncate font-mono">{activity.projectId.slice(0, 16)}…</div>
          ) : (
            <div className="text-xs text-slate-300">—</div>
          )}
        </div>
      </div>

      {/* Mobile stacked */}
      <div className="lg:hidden">
        <div className="flex items-center gap-2.5 mb-2">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${podColor} flex items-center justify-center shrink-0`}>
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-slate-800 truncate">{agent.name}</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wide">{agent.pod}</div>
          </div>
          <StatusBadge status={statusKey} />
        </div>
        <div className="text-xs text-slate-600 mb-2 pl-10">{activity?.task || "Idle — awaiting assignment"}</div>
        {activity && <div className="pl-10"><ProgressBar value={progress} /></div>}
        {run && <div className="text-xs text-[#00d4ff] pl-10 mt-1 truncate">{run.project_name}</div>}
      </div>
    </div>
  );
}

function BuildRow({ run, packets }) {
  const stageIndex = run.current_stage_index || 0;
  const stages = run.stages || [];
  const totalStages = Math.max(stages.length, 15);
  const progress = Math.round((stageIndex / totalStages) * 100);
  const currentStage = stages[stageIndex];
  const activePacket = packets.find((p) => p.pipeline_run_id === run.id && p.status === "IN_PROGRESS");
  const stageLabel = currentStage?.label || run.current_stage || "Processing";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center shrink-0">
            <Loader2 className="w-4 h-4 text-cyan-500 animate-spin" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-slate-800 truncate">{run.project_name}</div>
            <div className="text-xs text-slate-400 truncate">
              Stage {stageIndex + 1}/{totalStages} · {stageLabel}
              {currentStage?.agent && <span className="text-slate-300"> · </span>}
              {currentStage?.agent && <span className="text-[#00d4ff] font-medium">{currentStage.agent}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={run.status} />
          <span className="text-xs font-bold text-slate-500">{progress}%</span>
        </div>
      </div>
      <ProgressBar value={progress} />
      {activePacket && (
        <div className="mt-2.5 flex items-center gap-2 text-xs text-slate-500">
          <Zap className="w-3 h-3 text-[#00d4ff]" />
          <span className="truncate">Executing: {activePacket.title || activePacket.stage_id}</span>
        </div>
      )}
      {run.deploy_url && (
        <div className="mt-2 flex items-center gap-1.5 text-xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <a href={run.deploy_url} target="_blank" rel="noopener noreferrer" className="text-[#00d4ff] font-medium hover:underline truncate">
            {run.deploy_url}
          </a>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status || "Idle", color: "text-slate-400", bg: "bg-slate-50", icon: Clock };
  const Icon = cfg.icon || Clock;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full ${cfg.bg} px-2.5 py-1 text-[11px] font-bold ${cfg.color} whitespace-nowrap`}>
      <Icon className={`w-3 h-3 ${cfg.spin ? "animate-spin" : ""}`} />
      {cfg.label}
    </span>
  );
}

function ProgressBar({ value }) {
  const v = Math.max(0, Math.min(100, value));
  const color = v === 100 ? "bg-emerald-500" : v > 0 ? "bg-[#00d4ff]" : "bg-slate-200";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${v}%` }} />
      </div>
      <span className="text-[11px] font-bold text-slate-400 w-8 text-right tabular-nums">{v}%</span>
    </div>
  );
}