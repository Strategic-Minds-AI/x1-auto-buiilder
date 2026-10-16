import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Wand2, Library, Globe, LayoutTemplate, Rocket, LayoutGrid, Cable,
  Palette, Image, Package, Monitor, Sparkles, ChevronDown, Mail, Workflow, Code,
  Hammer, Home, Search, Bot, BarChart3, GitBranch, SlidersHorizontal, Table, Activity, Zap, Video, Shield, Boxes, CalendarDays, Gauge, Radio, CreditCard, Database, Building2, Key, Plug, Brain, Scan, AlertTriangle, Megaphone, Download, Copy, Crown, UploadCloud, BookOpen, Factory, ListChecks, ClipboardList, Layers, FileText
} from "lucide-react";

const NAV_GROUPS = [
  {
    label: "Build",
    items: [
      { to: "/portal", icon: Wand2, label: "Website Generator" },
      { to: "/auto-builder", icon: Hammer, label: "Auto Builder" },
      { to: "/universal-generator", icon: Wand2, label: "Universal Generator" },
      { to: "/gpt-factory", icon: Factory, label: "GPT Factory" },
    ],
  },
  {
    label: "Factory",
    items: [
      { to: "/factory-console", icon: Factory, label: "Factory Console" },
      { to: "/template-factory", icon: Factory, label: "Template Factory" },
      { to: "/build-queue", icon: ListChecks, label: "Build Queue" },
      { to: "/pipeline-dashboard", icon: Rocket, label: "Autonomous Pipeline" },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { to: "/intelligence-console", icon: Brain, label: "Intelligence Console" },
      { to: "/intelligence-hub", icon: Brain, label: "Intelligence Hub" },
      { to: "/apex-god-mode", icon: Crown, label: "APEX God Mode" },
      { to: "/apex-command", icon: Zap, label: "APEX Command" },
      { to: "/research-hub", icon: Search, label: "Research Hub" },
    ],
  },
  {
    label: "Quality & Deploy",
    items: [
      { to: "/validator-pipeline", icon: Shield, label: "Validator Pipeline" },
      { to: "/visual-parity-engine", icon: Scan, label: "Visual Parity Engine" },
      { to: "/playwright-qa", icon: Monitor, label: "Playwright QA" },
      { to: "/system-docs", icon: FileText, label: "System Docs" },
    ],
  },
  {
    label: "System",
    items: [
      { to: "/agent-orchestrator", icon: Bot, label: "Agents" },
      { to: "/local-sandbox", icon: Monitor, label: "Local Sandbox" },
      { to: "/autonomous-architecture", icon: Brain, label: "Architecture" },
      { to: "/project-start-inventory", icon: ClipboardList, label: "Start Inventory" },
      { to: "/analytics", icon: BarChart3, label: "Analytics" },
      { to: "/crm", icon: Building2, label: "AI CRM" },
    ],
  },
];

export default function AdminSidebar({ title }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={`${collapsed ? "w-16" : "w-64"} shrink-0 flex flex-col bg-[#0a0e14] border-r border-black/10 sticky top-0 h-screen transition-all duration-200`}
    >
      {/* Brand */}
      <div className="h-16 flex items-center gap-2.5 px-4 border-b border-white/8 shrink-0">
        <Link to="/" className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center font-black text-[#0a0e14] text-lg shrink-0">
            D
          </div>
          {!collapsed && (
            <div className="leading-none min-w-0">
              <div className="font-black text-[13px] tracking-wide text-white truncate">DIGITAL DOMINANCE</div>
              <div className="text-[9px] tracking-[0.2em] text-white/40">PRODUCTION FACTORY</div>
            </div>
          )}
        </Link>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <div className="px-3 mb-1.5 text-[10px] font-bold tracking-[0.15em] text-white/30 uppercase">
                {group.label}
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 group ${
                      active
                        ? "bg-[#00d4ff]/10 text-[#00d4ff] shadow-[inset_2px_0_0_#00d4ff]"
                        : "text-white/55 hover:text-[#00d4ff] hover:bg-[#00d4ff]/8"
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${active ? "text-[#00d4ff]" : "text-white/40 group-hover:text-[#00d4ff]"}`} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-white/8 p-2 shrink-0">
        <Link
          to="/portal"
          className="w-full flex items-center justify-center gap-2 py-2 mb-1 rounded-lg text-[#00d4ff] hover:bg-[#00d4ff]/8 transition text-xs font-bold"
        >
          <Home className="w-4 h-4" />
          {!collapsed && "Back to Portal"}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-white/40 hover:text-[#00d4ff] hover:bg-[#00d4ff]/8 transition text-xs font-medium"
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${collapsed ? "rotate-90" : "-rotate-90"}`} />
          {!collapsed && "Collapse"}
        </button>
      </div>
    </aside>
  );
}