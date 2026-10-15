import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Wand2, Library, Globe, LayoutTemplate, Rocket, LayoutGrid, Cable,
  Palette, Image, Package, Monitor, Smartphone, Sparkles, ChevronDown,
  Hammer, ExternalLink, Home, Search, Bot, BarChart3, GitBranch, SlidersHorizontal, Table, Activity, Zap, Video, Shield, Boxes, CalendarDays, Gauge, Radio
} from "lucide-react";

const NAV_GROUPS = [
  {
    label: "Build",
    items: [
      { tab: "generator", icon: Wand2, label: "Website Generator" },
      { tab: "library", icon: Library, label: "Template Library" },
      { tab: "sites", icon: Globe, label: "Website Library" },
      { tab: "templates", icon: LayoutTemplate, label: "Site Templates" },
    ],
  },
  {
    label: "Factory",
    items: [
      { tab: "app-factory", icon: Package, label: "App Factory" },
      { tab: "video-studio", icon: Video, label: "Video Studio" },
      { tab: "universal-library", icon: Boxes, label: "Universal Library" },
    ],
  },
  {
    label: "Launch",
    items: [
      { tab: "launch", icon: Rocket, label: "Mass Launch" },
      { tab: "monitor", icon: Activity, label: "Launch Monitor" },
      { tab: "compliance", icon: Shield, label: "Compliance Engine" },
      { tab: "social-calendar", icon: CalendarDays, label: "Social Calendar" },
      { tab: "campaigns", icon: Rocket, label: "Campaigns" },
      { tab: "sheets", icon: Table, label: "Sheets Sync" },
    ],
  },
  {
    label: "Asset Libraries",
    items: [
      { tab: "logos", icon: Palette, label: "Logo Library" },
      { tab: "brands", icon: Sparkles, label: "Brand Library" },
      { tab: "images", icon: Image, label: "Image Library" },
      { tab: "web-packs", icon: Package, label: "Web Pack Library" },
      { tab: "app-packs", icon: Monitor, label: "App Pack Library" },
    ],
  },
  {
    label: "System",
    items: [
      { tab: "modules", icon: LayoutGrid, label: "Modules" },
      { tab: "quality", icon: Gauge, label: "Quality Dashboard" },
      { tab: "gpt-bridge", icon: Radio, label: "GPT Bridge" },
      { tab: "sync", icon: Cable, label: "Sync Engine" },
    ],
  },
];

const EXTERNAL_MODULES = [
  { to: "/apex-command", icon: Zap, label: "APEX Command" },
  { to: "/auto-builder", icon: Hammer, label: "Auto Builder" },
  { to: "/agent-orchestrator", icon: Bot, label: "Agents" },
  { to: "/research-hub", icon: Search, label: "Research Hub" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/brand-assets", icon: Palette, label: "Brand Assets" },
  { to: "/logo-workshop", icon: Sparkles, label: "Logo Workshop" },
  { to: "/style-guide-editor", icon: SlidersHorizontal, label: "Style Guide" },
  { to: "/project-timeline", icon: GitBranch, label: "Timeline" },
];

export default function PortalShell({ activeTab, onTabChange, onNew, children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex bg-white">
      {/* Sidebar — dark/black */}
      <aside
        className={`${collapsed ? "w-16" : "w-64"} shrink-0 flex flex-col bg-[#0a0e14] border-r border-black/10 sticky top-0 h-screen transition-all duration-200`}
      >
        {/* Brand */}
        <div className="h-16 flex items-center gap-2.5 px-4 border-b border-white/8 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center font-black text-[#0a0e14] text-lg shrink-0">
            D
          </div>
          {!collapsed && (
            <div className="leading-none min-w-0">
              <div className="font-black text-[13px] tracking-wide text-white truncate">DIGITAL DOMINANCE</div>
              <div className="text-[9px] tracking-[0.2em] text-white/40">PRODUCTION FACTORY</div>
            </div>
          )}
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
                  const active = activeTab === item.tab;
                  return (
                    <button
                      key={item.tab}
                      onClick={() => onTabChange(item.tab)}
                      title={collapsed ? item.label : undefined}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 group ${
                        active
                          ? "bg-[#00d4ff]/10 text-[#00d4ff] shadow-[inset_2px_0_0_#00d4ff]"
                          : "text-white/55 hover:text-[#00d4ff] hover:bg-[#00d4ff]/8"
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${active ? "text-[#00d4ff]" : "text-white/40 group-hover:text-[#00d4ff]"}`} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* External module links */}
          {!collapsed && (
            <div>
              <div className="px-3 mb-1.5 text-[10px] font-bold tracking-[0.15em] text-white/30 uppercase">
                Modules
              </div>
              <div className="space-y-0.5">
                {EXTERNAL_MODULES.slice(0, 4).map((m) => {
                  const Icon = m.icon;
                  return (
                    <Link
                      key={m.to}
                      to={m.to}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-white/55 hover:text-[#00d4ff] hover:bg-[#00d4ff]/8 transition-all duration-150 group"
                    >
                      <Icon className="w-4 h-4 shrink-0 text-white/40 group-hover:text-[#00d4ff]" />
                      <span className="truncate">{m.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </nav>

        {/* Collapse toggle */}
        <div className="border-t border-white/8 p-2 shrink-0">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-white/40 hover:text-[#00d4ff] hover:bg-[#00d4ff]/8 transition text-xs font-medium"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${collapsed ? "rotate-90" : "-rotate-90"}`} />
            {!collapsed && "Collapse"}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar — white */}
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#00d4ff] transition">
              <Home className="w-4 h-4" /> Home
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <span className="text-sm font-semibold text-slate-800">
              {NAV_GROUPS.flatMap(g => g.items).find(i => i.tab === activeTab)?.label || "Portal"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/apex-command"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:text-[#00d4ff] hover:border-[#00d4ff]/40 transition"
            >
              <Zap className="w-4 h-4" /> APEX Command
            </Link>
            <Link
              to="/auto-builder"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:text-[#00d4ff] hover:border-[#00d4ff]/40 transition"
            >
              <Hammer className="w-4 h-4" /> Auto Builder
            </Link>
            <button
              onClick={onNew}
              className="inline-flex items-center gap-2 rounded-full bg-[#00d4ff] px-5 py-2 text-sm font-bold text-[#0a0e14] hover:brightness-110 hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] transition"
            >
              <Hammer className="w-4 h-4" /> New Project
            </button>
          </div>
        </header>

        {/* Content area — white with light token override */}
        <main className="portal-light flex-1 overflow-y-auto bg-white">
          {children}
        </main>
      </div>
    </div>
  );
}