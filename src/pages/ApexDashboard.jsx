import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import BackButton from "@/components/shared/BackButton";
import IntelligencePanel from "@/components/apex/IntelligencePanel";
import SwarmCommandPanel from "@/components/apex/SwarmCommandPanel";
import BuildFactoryPanel from "@/components/apex/BuildFactoryPanel";
import GovernancePanel from "@/components/apex/GovernancePanel";
import {
  Crown, Search, Bot, Hammer, Shield, Radio, Share2, BarChart3,
  Zap, Loader2, AlertCircle, Activity, Database, CheckCircle,
  TrendingUp, Target, Layers,
} from "lucide-react";

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
    <div className="min-h-screen bg-[#0a0e14] text-white">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-[#0a0e14]/95 backdrop-blur border-b border-white/10">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center">
              <Crown className="w-5 h-5 text-[#0a0e14]" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight">APEX GOD MODE <span className="text-[#00d4ff]">V6</span></h1>
              <p className="text-[10px] text-white/40 tracking-wide">National Autonomous Website, App, Lead Gen & AI Swarm Factory</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs">
              <span className="text-white/40">Phase:</span>
              <span className="font-bold text-[#00d4ff]">{PHASES.find(p => p.phase === currentPhase)?.label}</span>
            </div>
            <button
              onClick={handleSeedAgents}
              disabled={seeding}
              className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs font-semibold text-white/70 hover:bg-white/10 transition"
            >
              {seeding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5" />}
              {seeding ? "Seeding..." : `Seed Agents (${counts.agents || 0})`}
            </button>
            <button
              onClick={loadDashboard}
              className="flex items-center gap-2 rounded-lg bg-[#00d4ff]/10 border border-[#00d4ff]/30 px-3 py-2 text-xs font-semibold text-[#00d4ff] hover:bg-[#00d4ff]/20 transition"
            >
              <Activity className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
        </div>

        {/* Status bar */}
        <div className="px-4 py-2 flex items-center gap-4 border-t border-white/5 overflow-x-auto">
          <StatusChip icon={Target} label="Opportunities" value={counts.opportunities || 0} color="#3b82f6" />
          <StatusChip icon={Activity} label="Active Missions" value={counts.activeMissions || 0} color="#f59e0b" />
          <StatusChip icon={Bot} label="Agents" value={counts.agents || 0} color="#8b5cf6" />
          <StatusChip icon={Hammer} label="Active Jobs" value={counts.activeJobs || 0} color="#00d4ff" />
          <StatusChip icon={Shield} label="Pending Approvals" value={counts.pendingApprovals || 0} color="#10b981" />
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-48 shrink-0 border-r border-white/10 min-h-[calc(100vh-97px)] sticky top-[97px]">
          <nav className="p-2 space-y-0.5">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              const active = activeSection === s.key;
              return (
                <button
                  key={s.key}
                  onClick={() => setActiveSection(s.key)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
                    active ? "bg-white/10 text-white" : "text-white/50 hover:text-white hover:bg-white/5"
                  }`}
                  style={active ? { boxShadow: `inset 2px 0 0 ${s.color}` } : {}}
                >
                  <Icon className="w-4 h-4 shrink-0" style={{ color: active ? s.color : undefined }} />
                  {s.label}
                </button>
              );
            })}
          </nav>
          <div className="p-3 mt-2">
            <div className="rounded-xl bg-white/5 p-3">
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-wide mb-2">Mission Loop</p>
              <div className="text-[9px] text-white/40 leading-relaxed">
                DISCOVER → RESEARCH → STRATEGIZE → DESIGN → BUILD → TEST → DIAGNOSE → REPAIR → RETEST → HARDEN → VALIDATE → PREVIEW → APPROVAL → OPERATE → LEARN
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 p-4 overflow-y-auto">
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
        </main>
      </div>
    </div>
  );
}

function StatusChip({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <Icon className="w-3.5 h-3.5" style={{ color }} />
      <span className="text-[10px] text-white/40">{label}:</span>
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
          <h2 className="text-xl font-bold">{title}</h2>
        </div>
        <p className="text-sm text-white/40">{description}</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {links.map((l) => (
          <a key={l.to} href={l.to} className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 p-4 hover:bg-white/10 hover:border-[#00d4ff]/30 transition group">
            <Layers className="w-5 h-5 text-white/30 group-hover:text-[#00d4ff] transition" />
            <span className="text-sm font-semibold text-white/70 group-hover:text-white">{l.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}