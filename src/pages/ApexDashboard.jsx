import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import IntelligencePanel from "@/components/apex/IntelligencePanel";
import SwarmCommandPanel from "@/components/apex/SwarmCommandPanel";
import BuildFactoryPanel from "@/components/apex/BuildFactoryPanel";
import GovernancePanel from "@/components/apex/GovernancePanel";
import {
  Crown, Search, Bot, Hammer, Shield, Radio, Share2, BarChart3,
  Zap, Loader2, AlertCircle, Activity, Database, CheckCircle,
  TrendingUp, Target, Layers, Home,
} from "lucide-react";
import { Link } from "react-router-dom";

const SECTIONS = [
  { key: "intelligence", label: "Intelligence", icon: Search, color: "#3b82f6" },
  { key: "build", label: "Build Factory", icon: Hammer, color: "#00d4ff" },
  { key: "swarm", label: "Swarm Command", icon: Bot, color: "#8b5cf6" },
  { key: "demand", label: "Demand Acquisition", icon: TrendingUp, color: "#14b8a6" },
  { key: "comms", label: "Communications", icon: Radio, color: "#ef4444" },
  { key: "social", label: "Social & Media", icon: Share2, color: "#ec4899" },
  { key: "measurement", label: "Measurement", icon: BarChart3, color: "#6366f1" },
  { key: "gpt", label: "GPT Control", icon: Zap, color: "#f59e0b" },
  { key: "governance", label: "Governance", icon: Shield, color: "#10b981" },
];

const PHASES = [
  { phase: "phase0", label: "Forensic Discovery" },
  { phase: "phase1", label: "Security Repair" },
  { phase: "phase2", label: "Queue Convergence" },
  { phase: "phase3", label: "Agent Control" },
  { phase: "phase4", label: "Demand Intelligence" },
  { phase: "phase5", label: "Strategy Factory" },
  { phase: "phase6", label: "Website Generator" },
  { phase: "phase7", label: "Lead Capture" },
  { phase: "phase8", label: "Communications" },
  { phase: "phase9", label: "Social & Video" },
  { phase: "phase10", label: "GPT Integration" },
  { phase: "phase11", label: "National Expansion" },
  { phase: "phase12", label: "Release & Operations" },
];

export default function ApexDashboard() {
  const [activeSection, setActiveSection] = useState("intelligence");
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("apexOrchestrator", { action: "get_dashboard_data" });
      setDashboardData(res.data?.data || null);
    } catch (err) {
      console.error("Dashboard load failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const handleSeedAgents = async () => {
    setSeeding(true);
    try {
      await base44.functions.invoke("apexOrchestrator", { action: "seed_agents" });
      await loadDashboard();
    } catch (err) {
      console.error("Seed failed:", err);
    } finally {
      setSeeding(false);
    }
  };

  const counts = dashboardData?.counts || {};
  const currentPhase = "phase0";

  return (
    <div className="p-6">
      {/* Action bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-3">
          <Crown className="w-5 h-5 text-[#00d4ff]" />
          <div>
            <h1 className="text-base font-black text-slate-800">APEX God Mode V6</h1>
            <p className="text-[10px] text-slate-400">National Autonomous Website, App, Lead Gen & AI Swarm Factory</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-xs">
            <span className="text-slate-400">Phase:</span>
            <span className="font-bold text-[#00d4ff]">{PHASES.find(p => p.phase === currentPhase)?.label}</span>
          </div>
          <button
            onClick={handleSeedAgents}
            disabled={seeding}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-[#00d4ff] hover:border-[#00d4ff]/40 transition"
          >
            {seeding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5" />}
            {seeding ? "Seeding..." : `Seed Agents (${counts.agents || 0})`}
          </button>
          <button
            onClick={loadDashboard}
            className="flex items-center gap-2 rounded-lg bg-[#00d4ff] px-3 py-2 text-xs font-bold text-[#0a0e14] hover:brightness-110 transition"
          >
            <Activity className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-5 overflow-x-auto bg-slate-50/50 rounded-xl px-4 py-2.5 mb-4 border border-slate-100">
        <StatusChip icon={Target} label="Opportunities" value={counts.opportunities || 0} color="#3b82f6" />
        <StatusChip icon={Activity} label="Active Missions" value={counts.activeMissions || 0} color="#f59e0b" />
        <StatusChip icon={Bot} label="Agents" value={counts.agents || 0} color="#8b5cf6" />
        <StatusChip icon={Hammer} label="Active Jobs" value={counts.activeJobs || 0} color="#00d4ff" />
        <StatusChip icon={Shield} label="Pending Approvals" value={counts.pendingApprovals || 0} color="#10b981" />
      </div>

      {/* Section tabs */}
      <div className="flex items-center gap-1.5 mb-5 flex-wrap">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          const active = activeSection === s.key;
          return (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[13px] font-semibold transition ${
                active ? "bg-[#00d4ff] text-[#0a0e14]" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: active ? "#0a0e14" : s.color }} />
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-[#00d4ff]" />
          </div>
        ) : (
          <>
            {activeSection === "intelligence" && <IntelligencePanel data={dashboardData} onRefresh={loadDashboard} />}
            {activeSection === "build" && <BuildFactoryPanel data={dashboardData} />}
            {activeSection === "swarm" && <SwarmCommandPanel data={dashboardData} onRefresh={loadDashboard} />}
            {activeSection === "demand" && <SimplePanel title="Demand Acquisition" icon={TrendingUp} description="SEO, content authority, lead funnel experiments" links={[{ to: "/marketing-library", label: "Marketing Library" }, { to: "/fault-line", label: "Fault Line Scanner" }, { to: "/research-hub", label: "Research Hub" }]} />}
            {activeSection === "comms" && <SimplePanel title="Communications" icon={Radio} description="Inbound voice, SMS, CRM routing, consent, qualification" links={[{ to: "/comm-library", label: "Comms Library" }, { to: "/crm", label: "AI CRM" }]} />}
            {activeSection === "social" && <SimplePanel title="Social & Media" icon={Share2} description="Brand assets, generated videos, 30-day calendars, approved posting" links={[{ to: "/brand-assets", label: "Brand Assets" }, { to: "/card-flyer-studio", label: "Card & Flyer Studio" }]} />}
            {activeSection === "measurement" && <SimplePanel title="Measurement" icon={BarChart3} description="GA4, Search Console, leads, appointments, revenue and profit" links={[{ to: "/analytics", label: "Analytics" }, { to: "/performance-dashboard", label: "Performance Dashboard" }, { to: "/performance-report", label: "Performance Report" }]} />}
            {activeSection === "gpt" && <SimplePanel title="GPT Control Bridge" icon={Zap} description="Authenticated tool status, commands, draft jobs, approvals and mission results" links={[{ to: "/gpt-sync-logs", label: "GPT Sync Logs" }, { to: "/api-docs", label: "API Documentation" }, { to: "/api-keys", label: "API Key Manager" }]} />}
            {activeSection === "governance" && <GovernancePanel data={dashboardData} />}
          </>
        )}
      </div>
    </div>
  );
}

function StatusChip({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <Icon className="w-3.5 h-3.5" style={{ color }} />
      <span className="text-[10px] text-slate-400">{label}:</span>
      <span className="text-xs font-bold" style={{ color }}>{value}</span>
    </div>
  );
}

function SimplePanel({ title, icon: Icon, description, links }) {
  return (
    <div>
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-1">
          <Icon className="w-5 h-5 text-[#00d4ff]" />
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
        </div>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {links.map((l) => (
          <Link key={l.to} to={l.to} className="flex items-center gap-3 rounded-xl bg-white border border-slate-200 p-4 hover:border-[#00d4ff]/40 hover:shadow-sm transition group">
            <Layers className="w-5 h-5 text-slate-300 group-hover:text-[#00d4ff] transition" />
            <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-800">{l.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}