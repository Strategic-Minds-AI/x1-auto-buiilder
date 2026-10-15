import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import BackButton from "@/components/shared/BackButton";
import {
  SYSTEM_VISION, SYSTEM_STRATEGY, CONNECTED_REPOS, IMPLEMENTATION_PHASES,
  INTEGRATIONS, AGENT_ROSTER, NON_NEGOTIABLE_CONTROLS, WORKBOOK_CATALOG
} from "@/data/intelligenceData";
import {
  Brain, GitBranch, CheckCircle, Clock, AlertCircle, Loader2, Plus, Trash2,
  Zap, Shield, Activity, Radio, Database, Plug, ChevronDown, ChevronRight,
  ExternalLink, Bot, FileText, Target, Cpu, Lock
} from "lucide-react";

export default function IntelligenceHub() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", category: "discovery", priority: "p1", description: "", phase: "phase0" });
  const [expandedSections, setExpandedSections] = useState({ vision: true, strategy: true, repos: true, phases: true, checklist: true, integrations: true, agents: true, gpt: true, controls: true });
  const [gptCommand, setGptCommand] = useState("");
  const [gptResponse, setGptResponse] = useState(null);
  const [gptLoading, setGptLoading] = useState(false);

  const loadTasks = async () => {
    try {
      const page = await base44.entities.IntelligenceTask.filter({}, { sort: "order", limit: 100 });
      setTasks(page.items || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { loadTasks(); }, []);

  const toggleSection = (key) => setExpandedSections({ ...expandedSections, [key]: !expandedSections[key] });

  const createTask = async () => {
    if (!newTask.title) return;
    await base44.entities.IntelligenceTask.create({ ...newTask, status: "not_started", order: tasks.length });
    setNewTask({ title: "", category: "discovery", priority: "p1", description: "", phase: "phase0" });
    setShowTaskForm(false);
    loadTasks();
  };

  const updateTaskStatus = async (id, status) => {
    await base44.entities.IntelligenceTask.update(id, { status });
    loadTasks();
  };

  const deleteTask = async (id) => {
    await base44.entities.IntelligenceTask.delete(id);
    loadTasks();
  };

  const sendGptCommand = async () => {
    if (!gptCommand) return;
    setGptLoading(true);
    setGptResponse(null);
    try {
      const res = await base44.functions.invoke("gptControlBridge", { command: gptCommand, mode: "read" });
      setGptResponse(res.data);
    } catch (err) {
      setGptResponse({ error: err.message || "Command failed" });
    } finally { setGptLoading(false); }
  };

  const statusIcon = (status) => {
    if (status === "complete") return <CheckCircle className="w-4 h-4 text-emerald-500" />;
    if (status === "in_progress") return <Loader2 className="w-4 h-4 text-[#00d4ff] animate-spin" />;
    if (status === "blocked") return <AlertCircle className="w-4 h-4 text-red-500" />;
    return <Clock className="w-4 h-4 text-slate-400" />;
  };

  const Section = ({ id, icon: Icon, title, count, children }) => (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <button onClick={() => toggleSection(id)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition">
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-[#00d4ff]" />
          <span className="font-bold text-slate-800">{title}</span>
          {count !== undefined && <span className="text-xs rounded-full bg-slate-100 px-2 py-0.5 text-slate-500 font-semibold">{count}</span>}
        </div>
        {expandedSections[id] ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
      </button>
      {expandedSections[id] && <div className="px-5 pb-5 border-t border-slate-100 pt-4">{children}</div>}
    </div>
  );

  return (
    <div className="portal-light min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton />
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Intelligence Hub</h1>
            <p className="text-sm text-slate-500">System vision, strategy, connected repos, checklist, integrations, health, and GPT command</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Vision */}
          <Section id="vision" icon={Target} title="System Vision">
            <p className="text-sm text-slate-600 leading-relaxed">{SYSTEM_VISION}</p>
          </Section>

          {/* Strategy */}
          <Section id="strategy" icon={Cpu} title="System Strategy — 13 Phases">
            <div className="space-y-2">
              {IMPLEMENTATION_PHASES.map((p, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg border border-slate-100 p-3">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                    p.status === "in_progress" ? "bg-[#00d4ff]/10 text-[#00d4ff]" :
                    p.status === "complete" ? "bg-emerald-100 text-emerald-600" :
                    "bg-slate-100 text-slate-400"
                  }`}>{i}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-700">{p.phase}: {p.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        p.status === "in_progress" ? "bg-[#00d4ff]/10 text-[#00d4ff]" :
                        p.status === "complete" ? "bg-emerald-100 text-emerald-600" :
                        "bg-slate-100 text-slate-400"
                      }`}>{p.status.replace("_", " ")}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{p.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Connected Repos */}
          <Section id="repos" icon={GitBranch} title="Connected Repositories" count={CONNECTED_REPOS.length}>
            <div className="grid gap-3">
              {CONNECTED_REPOS.map((repo, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 hover:border-[#00d4ff]/40 transition">
                  <GitBranch className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-sm">{repo.name}</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {repo.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{repo.description}</p>
                    <p className="text-[10px] text-slate-400 mt-1"><span className="font-semibold">Authority:</span> {repo.authority}</p>
                    <a href={repo.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-[#00d4ff] hover:underline mt-1.5">
                      <ExternalLink className="w-3 h-3" /> {repo.url}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Interactive Checklist */}
          <Section id="checklist" icon={CheckCircle} title="Implementation Checklist" count={tasks.length}>
            <div className="space-y-3">
              {showTaskForm ? (
                <div className="rounded-xl border border-slate-200 p-4 space-y-2 bg-slate-50">
                  <input className="dd-input" placeholder="Task title" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} />
                  <textarea className="dd-input" rows={2} placeholder="Description" value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} />
                  <div className="grid grid-cols-3 gap-2">
                    <select className="dd-input" value={newTask.category} onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}>
                      <option value="discovery">Discovery</option><option value="research">Research</option><option value="strategy">Strategy</option>
                      <option value="build">Build</option><option value="test">Test</option><option value="deploy">Deploy</option>
                      <option value="outreach">Outreach</option><option value="measurement">Measurement</option><option value="governance">Governance</option>
                      <option value="integration">Integration</option>
                    </select>
                    <select className="dd-input" value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}>
                      <option value="p0">P0</option><option value="p1">P1</option><option value="p2">P2</option><option value="p3">P3</option>
                    </select>
                    <select className="dd-input" value={newTask.phase} onChange={(e) => setNewTask({ ...newTask, phase: e.target.value })}>
                      {IMPLEMENTATION_PHASES.map((p, i) => <option key={i} value={`phase${i}`}>{p.phase}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={createTask} className="rounded-full bg-[#00d4ff] px-4 py-2 text-xs font-bold text-[#0a0e14]">Add Task</button>
                    <button onClick={() => setShowTaskForm(false)} className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500">Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowTaskForm(true)} className="inline-flex items-center gap-2 rounded-full bg-[#00d4ff] px-4 py-2 text-xs font-bold text-[#0a0e14]">
                  <Plus className="w-3.5 h-3.5" /> Add Task
                </button>
              )}
              {loading ? (
                <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-[#00d4ff]" /></div>
              ) : tasks.length === 0 ? (
                <p className="text-center text-sm text-slate-400 py-6">No tasks yet. Add one to start tracking.</p>
              ) : (
                <div className="space-y-1.5">
                  {tasks.map((t) => (
                    <div key={t.id} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50 transition">
                      <button onClick={() => updateTaskStatus(t.id, t.status === "complete" ? "not_started" : "complete")}>
                        {statusIcon(t.status)}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-semibold ${t.status === "complete" ? "line-through text-slate-400" : "text-slate-700"}`}>{t.title}</div>
                        {t.description && <div className="text-xs text-slate-400 mt-0.5">{t.description}</div>}
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-bold uppercase">{t.priority}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{t.category}</span>
                      <select value={t.status} onChange={(e) => updateTaskStatus(t.id, e.target.value)} className="text-[10px] rounded-lg border border-slate-200 bg-white px-1.5 py-1">
                        <option value="not_started">Not Started</option><option value="in_progress">In Progress</option>
                        <option value="blocked">Blocked</option><option value="complete">Complete</option><option value="skipped">Skipped</option>
                      </select>
                      <button onClick={() => deleteTask(t.id)} className="text-slate-300 hover:text-red-500 transition"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Section>

          {/* Integrations & Health */}
          <Section id="integrations" icon={Plug} title="Integrations & Health" count={INTEGRATIONS.length}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {INTEGRATIONS.map((int, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${int.status === "authorized" || int.status === "configured" ? "bg-emerald-500" : "bg-slate-300"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-700">{int.name}</div>
                    <div className="text-[10px] text-slate-400">{int.purpose}</div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    int.status === "authorized" ? "bg-emerald-100 text-emerald-600" :
                    int.status === "configured" ? "bg-[#00d4ff]/10 text-[#00d4ff]" :
                    "bg-slate-100 text-slate-400"
                  }`}>{int.status}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* Agent Roster */}
          <Section id="agents" icon={Bot} title="Agent Swarm Roster" count={AGENT_ROSTER.length}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {AGENT_ROSTER.map((agent) => (
                <div key={agent.id} className="rounded-xl border border-slate-100 p-3 hover:border-[#00d4ff]/40 transition">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono text-slate-400">{agent.id}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-semibold">{agent.pod}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-700">{agent.name}</div>
                  <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{agent.description}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* GPT Command Interface */}
          <Section id="gpt" icon={Radio} title="GPT Bi-Directional Command Bridge">
            <div className="space-y-3">
              <p className="text-xs text-slate-500">Issue commands to the system through the GPT control bridge. Commands are processed as read-only by default.</p>
              <div className="flex gap-2">
                <input className="dd-input flex-1" placeholder="e.g. 'Check X1 queue status' or 'List all active projects'" value={gptCommand} onChange={(e) => setGptCommand(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendGptCommand()} />
                <button onClick={sendGptCommand} disabled={gptLoading || !gptCommand} className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50 hover:bg-slate-800 transition">
                  {gptLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  Execute
                </button>
              </div>
              {gptResponse && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <pre className="text-xs text-slate-600 whitespace-pre-wrap overflow-x-auto">{typeof gptResponse === "string" ? gptResponse : JSON.stringify(gptResponse, null, 2)}</pre>
                </div>
              )}
            </div>
          </Section>

          {/* Non-Negotiable Controls */}
          <Section id="controls" icon={Lock} title="Non-Negotiable Controls" count={NON_NEGOTIABLE_CONTROLS.length}>
            <div className="space-y-2">
              {NON_NEGOTIABLE_CONTROLS.map((c, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg border border-slate-100 p-3">
                  <Shield className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-bold text-slate-700">{c.control}</div>
                    <p className="text-xs text-slate-500 mt-0.5">{c.rule}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-bold ml-auto shrink-0">{c.priority}</span>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}