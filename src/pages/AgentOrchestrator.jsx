import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/shared/PageHeader";
import { Loader2, Plus, Bot, CheckCircle, AlertCircle, Clock, Zap, PlayCircle, Shield, Radio, BarChart3, DollarSign, Sparkles } from "lucide-react";

const SUPER_AGENTS = [
  { id: "seo_sentinel", name: "SEO Sentinel", icon: Shield, task: "Run compliance checks on all launched sites and auto-fix failing Google standards to 90%+ score", priority: "high" },
  { id: "social_media_manager", name: "Social Media Manager", icon: Sparkles, task: "Generate 30-day social media content calendars for all active projects across all platforms", priority: "medium" },
  { id: "communications_director", name: "Communications Director", icon: Radio, task: "Draft email campaigns and client outreach sequences for active projects", priority: "medium" },
  { id: "analytics_watcher", name: "Analytics Watcher", icon: BarChart3, task: "Sync Google Analytics 4 and Search Console data for all connected properties and generate performance reports", priority: "high" },
  { id: "monetization_agent", name: "Monetization Agent", icon: DollarSign, task: "Analyze pricing intelligence data and generate competitive pricing strategies for all active industries", priority: "medium" },
];

const STATUS_META = {
  pending: { icon: Clock, color: "text-muted-foreground", bg: "bg-muted" },
  in_progress: { icon: Loader2, color: "text-primary", bg: "bg-primary/10" },
  complete: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  failed: { icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10" },
};

export default function AgentOrchestrator() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ agent_name: "", task: "", priority: "medium", assigned_to: "" });
  const [initializing, setInitializing] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [initMessage, setInitMessage] = useState(null);
  const [execMessage, setExecMessage] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [taskPage, projectPage] = await Promise.all([
        base44.entities.AgentTask.filter({}, { sort: "-created_date", limit: 50 }),
        base44.entities.BuildProject.filter({ status: { $in: ["vision", "strategy", "building"] } }, { limit: 20 }),
      ]);
      setTasks(taskPage.items || []);
      setProjects(projectPage.items || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { const unsub = base44.entities.AgentTask.subscribe(() => load()); return unsub; }, []);

  const createTask = async () => {
    if (!form.agent_name || !form.task) return;
    await base44.entities.AgentTask.create({ ...form, status: "pending", progress: 0 });
    setForm({ agent_name: "", task: "", priority: "medium", assigned_to: "" });
    setShowForm(false);
    load();
  };

  const updateStatus = async (id, status) => {
    const progress = status === "complete" ? 100 : status === "in_progress" ? 50 : 0;
    await base44.entities.AgentTask.update(id, { status, progress });
    load();
  };

  const initializeAgents = async () => {
    setInitializing(true);
    try {
      // Check for existing tasks per agent to avoid duplicates
      const existing = await base44.entities.AgentTask.filter(
        { agent_name: { $in: SUPER_AGENTS.map((a) => a.name) }, status: { $in: ["pending", "in_progress"] } },
        { limit: 50 }
      );
      const existingNames = new Set((existing.items || []).map((t) => t.agent_name));
      const toCreate = SUPER_AGENTS.filter((a) => !existingNames.has(a.name));
      if (toCreate.length === 0) {
        setInitMessage("All agents already have active tasks.");
      } else {
        await base44.entities.AgentTask.bulkCreate(
          toCreate.map((a) => ({
            agent_name: a.name,
            task: a.task,
            priority: a.priority,
            assigned_to: a.id,
            status: "pending",
            progress: 0,
          }))
        );
        setInitMessage(`Initialized ${toCreate.length} super agents with deterministic tasks.`);
      }
      load();
    } catch (err) {
      setInitMessage("Initialization failed: " + (err.message || "unknown error"));
    } finally {
      setInitializing(false);
    }
  };

  const executeAllPending = async () => {
    setExecuting(true);
    try {
      const pending = tasks.filter((t) => t.status === "pending");
      if (pending.length === 0) {
        setExecMessage("No pending tasks to execute.");
      } else {
        await base44.entities.AgentTask.bulkUpdate(
          pending.map((t) => ({ id: t.id, status: "in_progress", progress: 50 }))
        );
        setExecMessage(`Dispatched ${pending.length} tasks for autonomous execution.`);
        load();
      }
    } catch (err) {
      setExecMessage("Execution failed: " + (err.message || "unknown error"));
    } finally {
      setExecuting(false);
    }
  };

  const activeCount = tasks.filter((t) => t.status === "in_progress").length;
  const pendingCount = tasks.filter((t) => t.status === "pending").length;
  const doneCount = tasks.filter((t) => t.status === "complete").length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageHeader title="Agent Orchestrator" subtitle="Monitor autonomous agents, assign tasks, and track progress in real-time" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Super Agents initialization panel */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-bold">Super Agent Fleet</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={initializeAgents}
                disabled={initializing}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50"
              >
                {initializing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                Initialize Agents
              </button>
              <button
                onClick={executeAllPending}
                disabled={executing || tasks.filter((t) => t.status === "pending").length === 0}
                className="inline-flex items-center gap-2 rounded-full border border-primary/40 text-primary px-4 py-2 text-sm font-bold hover:bg-primary/10 disabled:opacity-50"
              >
                {executing ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
                Execute All Pending
              </button>
            </div>
          </div>
          {(initMessage || execMessage) && (
            <div className="mb-3 rounded-lg bg-primary/10 px-3 py-2 text-xs text-primary">
              {initMessage || execMessage}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            {SUPER_AGENTS.map((agent) => {
              const Icon = agent.icon;
              const agentTasks = tasks.filter((t) => t.agent_name === agent.name);
              const activeTask = agentTasks.find((t) => t.status === "in_progress");
              const pendingTask = agentTasks.find((t) => t.status === "pending");
              const status = activeTask ? "in_progress" : pendingTask ? "pending" : "idle";
              return (
                <div key={agent.id} className="rounded-xl border border-border bg-background/60 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${status === "in_progress" ? "bg-primary/20" : "bg-muted"} shrink-0`}>
                      <Icon className={`w-4 h-4 ${status === "in_progress" ? "text-primary" : "text-muted-foreground"}`} />
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">{agent.name}</div>
                      <div className="text-[10px] text-muted-foreground capitalize">{status.replace("_", " ")}</div>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground line-clamp-2">{agent.task}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Active" value={activeCount} icon={Loader2} color="text-primary" spin />
          <StatCard label="Pending" value={pendingCount} icon={Clock} color="text-muted-foreground" />
          <StatCard label="Complete" value={doneCount} icon={CheckCircle} color="text-emerald-400" />
          <StatCard label="Projects" value={projects.length} icon={Bot} color="text-accent" />
        </div>

        {projects.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-bold mb-3">Active Build Projects</h3>
            <div className="space-y-2">
              {projects.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg bg-background/60 px-3 py-2">
                  <div>
                    <div className="text-sm font-semibold">{p.name}</div>
                    <div className="text-xs text-muted-foreground">Step: {p.current_step} · Status: {p.status}</div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-semibold">{p.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {showForm ? (
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <input className="dd-input" placeholder="Agent name (e.g. Research Agent)" value={form.agent_name} onChange={(e) => setForm({ ...form, agent_name: e.target.value })} />
            <textarea className="dd-input" rows={2} placeholder="Task description" value={form.task} onChange={(e) => setForm({ ...form, task: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <select className="dd-input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
              </select>
              <input className="dd-input" placeholder="Assigned to" value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <button onClick={createTask} className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground">Assign Task</button>
              <button onClick={() => setShowForm(false)} className="rounded-full border border-border px-5 py-2 text-sm font-semibold">Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground">
            <Plus className="h-4 w-4" /> Assign New Task
          </button>
        )}

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">No tasks assigned yet.</div>
        ) : (
          <div className="space-y-2">
            {tasks.map((t) => {
              const meta = STATUS_META[t.status] || STATUS_META.pending;
              const Icon = meta.icon;
              return (
                <div key={t.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${meta.bg} shrink-0`}>
                        <Icon className={`h-4 w-4 ${meta.color} ${t.status === "in_progress" ? "animate-spin" : ""}`} />
                      </span>
                      <div>
                        <div className="text-sm font-bold">{t.agent_name}</div>
                        <div className="text-sm text-muted-foreground">{t.task}</div>
                        {t.assigned_to && <div className="text-xs text-muted-foreground mt-1">Assigned to: {t.assigned_to}</div>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {t.priority && <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">{t.priority}</span>}
                      <select value={t.status} onChange={(e) => updateStatus(t.id, e.target.value)} className="text-xs rounded-lg border border-border bg-background px-2 py-1">
                        <option value="pending">Pending</option><option value="in_progress">In Progress</option><option value="complete">Complete</option><option value="failed">Failed</option>
                      </select>
                    </div>
                  </div>
                  {typeof t.progress === "number" && t.progress > 0 && (
                    <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary transition-all" style={{ width: `${t.progress}%` }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, spin }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
        <Icon className={`h-3.5 w-3.5 ${color} ${spin ? "animate-spin" : ""}`} /> {label}
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}