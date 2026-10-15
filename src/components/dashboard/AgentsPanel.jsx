import { Bot, Brain, Shield, Radio, BarChart3, Mail, DollarSign, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const AGENTS = [
  { name: "super_agent", label: "Super Agent", desc: "Full platform access — generate websites, deploy, sync analytics, manage CRM, run compliance", icon: Sparkles, color: "#00d4ff" },
  { name: "master_orchestrator", label: "Master Orchestrator", desc: "Coordinates all agents and dispatches tasks across the platform", icon: Brain, color: "#7c3aed" },
  { name: "testing_agent", label: "Testing Agent", desc: "Autonomous system-wide validation and repair agent", icon: Shield, color: "#0891b2" },
  { name: "social_media_manager", label: "Social Media Manager", desc: "Manages social campaigns and content scheduling", icon: Radio, color: "#ec4899" },
  { name: "seo_sentinel", label: "SEO Sentinel", desc: "Monitors SEO compliance and search ranking health", icon: Bot, color: "#f59e0b" },
  { name: "analytics_watcher", label: "Analytics Watcher", desc: "Tracks performance metrics and alerts on anomalies", icon: BarChart3, color: "#3b82f6" },
  { name: "communications_director", label: "Communications Director", desc: "Manages email, SMS, and multi-channel communications", icon: Mail, color: "#10b981" },
  { name: "monetization_agent", label: "Monetization Agent", desc: "Optimizes pricing and revenue generation strategies", icon: DollarSign, color: "#8b5cf6" },
];

export default function AgentsPanel() {
  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-1">In-App AI Agents</h2>
          <p className="text-sm text-slate-500">{AGENTS.length} agents configured with entity access, backend function tools, and workflow automation.</p>
        </div>
        <Link to="/agent-instructions" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:text-[#00d4ff] hover:border-[#00d4ff]/40 transition">
          Agent Instructions
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {AGENTS.map((a) => {
          const Icon = a.icon;
          return (
            <div key={a.name} className="rounded-xl border border-slate-200 bg-white p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${a.color}15` }}>
                <Icon className="w-5 h-5" style={{ color: a.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-slate-800">{a.label}</h3>
                <div className="text-[10px] font-mono text-slate-400 mb-1">{a.name}</div>
                <p className="text-xs text-slate-500">{a.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}