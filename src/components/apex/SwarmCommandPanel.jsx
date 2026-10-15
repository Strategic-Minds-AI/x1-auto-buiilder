import { useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  Bot, Loader2, Crown, Plus, ChevronRight, AlertCircle,
  CheckCircle, Clock, Zap, Activity, Target,
} from "lucide-react";

const MISSION_TYPES = [
  "discovery", "research", "strategy", "design", "build", "test",
  "diagnose", "repair", "harden", "validate", "preview", "approval",
  "operate", "learn", "deploy", "outreach", "measurement", "governance",
];

const PHASES = [
  "phase0", "phase1", "phase2", "phase3", "phase4", "phase5",
  "phase6", "phase7", "phase8", "phase9", "phase10", "phase11", "phase12",
];

const AGENT_IDS = [
  "apex_supervisor", "chief_strategy", "market_intel", "lead_foresight",
  "industry_research", "buyer_discovery", "competitor_intel", "pricing_economics",
  "seo_aeo_geo", "creative_director", "brand_logo", "website_architect",
  "app_architect", "frontend_engineer", "backend_engineer", "content_editorial",
  "image_video", "social_marketing", "lead_funnel", "crm_qualification",
  "xtreme_comms", "analytics_attribution", "security_compliance", "browser_qa",
  "guardian_validator", "release_coordinator",
];

export default function SwarmCommandPanel({ data, onRefresh }) {
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [executing, setExecuting] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "", mission_type: "discovery", priority: "p1", phase: "phase0",
    assigned_agent: "market_intel", description: "", authorization_scope: "safe",
  });

  const missions = data?.missions || [];
  const agents = data?.agents || [];

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    setCreating(true);
    setError("");
    try {
      await base44.functions.invoke("apexOrchestrator", { action: "create_mission", ...form });
      setForm({ title: "", mission_type: "discovery", priority: "p1", phase: "phase0", assigned_agent: "market_intel", description: "", authorization_scope: "safe" });
      setShowCreate(false);
      await onRefresh();
    } catch (err) {
      setError(err.message || "Failed to create mission");
    } finally {
      setCreating(false);
    }
  };

  const handleExecute = async (missionId) => {
    setExecuting(missionId);
    setError("");
    try {
      await base44.functions.invoke("apexOrchestrator", { action: "execute_research", mission_id: missionId });
      await onRefresh();
    } catch (err) {
      setError(err.message || "Execution failed");
    } finally {
      setExecuting(null);
    }
  };

  const statusMeta = {
    pending: { icon: Clock, color: "#f59e0b", bg: "bg-amber-500/10" },
    in_progress: { icon: Activity, color: "#3b82f6", bg: "bg-blue-500/10" },
    complete: { icon: CheckCircle, color: "#10b981", bg: "bg-emerald-500/10" },
    failed: { icon: AlertCircle, color: "#ef4444", bg: "bg-red-500/10" },
    blocked: { icon: AlertCircle, color: "#ef4444", bg: "bg-red-500/10" },
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Bot className="w-5 h-5 text-[#8b5cf6]" />
            <h2 className="text-xl font-bold">Swarm Command</h2>
          </div>
          <p className="text-sm text-white/40">Agent hierarchy, mission dispatch, queue health, and execution receipts</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#6366f1] px-4 py-2.5 text-sm font-bold text-white hover:brightness-110 transition"
        >
          <Plus className="w-4 h-4" /> New Mission
        </button>
      </div>

      {error && (
        <div className="mb-3 flex items-center gap-2 text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </div>
      )}

      {/* Agent Swarm */}
      <div className="mb-6">
        <p className="text-xs font-bold text-white/30 uppercase tracking-wide mb-2">Agent Swarm ({agents.length})</p>
        {agents.length === 0 ? (
          <div className="rounded-xl bg-white/5 border border-white/10 p-6 text-center">
            <Bot className="w-8 h-8 text-white/20 mx-auto mb-2" />
            <p className="text-xs text-white/40">No agents seeded. Click "Seed Agents" in the header.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {agents.map((a) => (
              <div key={a.id} className="rounded-xl bg-white/5 border border-white/10 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${a.color}20` }}>
                    <Bot className="w-3.5 h-3.5" style={{ color: a.color }} />
                  </div>
                  <p className="text-xs font-bold text-white truncate">{a.name}</p>
                </div>
                <p className="text-[10px] text-white/30 truncate">{a.skill_category}</p>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded mt-1 inline-block ${
                  a.autonomy_level === "autonomous" ? "bg-emerald-500/10 text-emerald-400" :
                  a.autonomy_level === "assisted" ? "bg-amber-500/10 text-amber-400" :
                  "bg-white/10 text-white/40"
                }`}>{a.autonomy_level?.toUpperCase()}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Mission Form */}
      {showCreate && (
        <div className="rounded-2xl bg-white/5 border border-white/10 p-4 mb-4">
          <p className="text-sm font-bold text-white mb-3">Create New Mission</p>
          <div className="space-y-3">
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Mission title..."
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#8b5cf6]/50"
            />
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Mission description..."
              rows={2}
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#8b5cf6]/50 resize-none"
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Select label="Type" value={form.mission_type} options={MISSION_TYPES} onChange={(v) => setForm({ ...form, mission_type: v })} />
              <Select label="Priority" value={form.priority} options={["p0", "p1", "p2", "p3"]} onChange={(v) => setForm({ ...form, priority: v })} />
              <Select label="Phase" value={form.phase} options={PHASES} onChange={(v) => setForm({ ...form, phase: v })} />
              <Select label="Auth Scope" value={form.authorization_scope} options={["safe", "protected", "production"]} onChange={(v) => setForm({ ...form, authorization_scope: v })} />
            </div>
            <Select label="Assigned Agent" value={form.assigned_agent} options={AGENT_IDS} onChange={(v) => setForm({ ...form, assigned_agent: v })} />
            <button
              onClick={handleCreate}
              disabled={creating || !form.title.trim()}
              className="flex items-center gap-2 rounded-xl bg-[#8b5cf6] px-4 py-2 text-sm font-bold text-white disabled:opacity-40 hover:brightness-110 transition"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Create Mission
            </button>
          </div>
        </div>
      )}

      {/* Missions */}
      <div>
        <p className="text-xs font-bold text-white/30 uppercase tracking-wide mb-2">Active Missions ({missions.length})</p>
        {missions.length === 0 ? (
          <div className="rounded-xl bg-white/5 border border-white/10 p-6 text-center">
            <Target className="w-8 h-8 text-white/20 mx-auto mb-2" />
            <p className="text-xs text-white/40">No missions yet. Create one to start the autonomous loop.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {missions.map((m) => {
              const meta = statusMeta[m.status] || statusMeta.pending;
              const StatusIcon = meta.icon;
              return (
                <div key={m.id} className="rounded-xl bg-white/5 border border-white/10 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${meta.bg}`} style={{ color: meta.color }}>
                          {m.status.toUpperCase()}
                        </span>
                        <span className="text-[9px] text-white/30">{m.mission_type}</span>
                        <span className="text-[9px] text-white/30">· {m.priority}</span>
                        <span className="text-[9px] text-white/30">· {m.phase}</span>
                        {m.approval_required && (
                          <span className="text-[9px] font-bold bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded">
                            {m.approval_status.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-white">{m.title}</p>
                      {m.description && <p className="text-xs text-white/40 mt-0.5 line-clamp-2">{m.description}</p>}
                      {m.assigned_agent && <p className="text-[10px] text-white/30 mt-1">Agent: {m.assigned_agent}</p>}
                    </div>
                    {m.status === "pending" && (
                      <button
                        onClick={() => handleExecute(m.id)}
                        disabled={executing === m.id}
                        className="flex items-center gap-1.5 rounded-lg bg-[#00d4ff]/10 border border-[#00d4ff]/30 px-3 py-1.5 text-xs font-bold text-[#00d4ff] hover:bg-[#00d4ff]/20 transition shrink-0"
                      >
                        {executing === m.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                        Execute
                      </button>
                    )}
                  </div>
                  {m.outputs?.summary && (
                    <div className="mt-2 rounded-lg bg-white/5 p-2">
                      <p className="text-xs text-white/50">{m.outputs.summary}</p>
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

function Select({ label, value, options, onChange }) {
  return (
    <div>
      <label className="text-[10px] text-white/30 uppercase block mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg bg-white/5 border border-white/10 px-2 py-2 text-xs text-white focus:outline-none focus:border-[#8b5cf6]/50"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-[#0a0e14]">{o}</option>
        ))}
      </select>
    </div>
  );
}