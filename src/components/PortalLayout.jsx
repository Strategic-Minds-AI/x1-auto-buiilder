import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  ChevronDown, Home, Zap, Hammer, LayoutGrid,
} from "lucide-react";
import { EXTERNAL_MODULES } from "@/components/portal/PortalShell";

// Shared layout for every standalone route — mirrors the Portal page's
// visual shell: black sidebar + white topbar + portal-light content area.
// Wraps all non-home, non-portal pages so the whole site matches.
export default function PortalLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const current = location.pathname;

  const activeModule = EXTERNAL_MODULES.find((m) => m.to === current);
  const title = activeModule?.label || "Module";

  return (
    <div className="min-h-screen flex bg-white">
      {/* Sidebar — black */}
      <aside
        className={`${collapsed ? "w-16" : "w-64"} shrink-0 flex flex-col bg-[#0a0e14] border-r border-black/10 sticky top-0 h-screen transition-all duration-200`}
      >
        {/* Brand */}
        <Link to="/portal" className="h-16 flex items-center gap-2.5 px-4 border-b border-white/8 shrink-0 hover:bg-white/5 transition">
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

        {/* Quick links */}
        <div className="px-2 pt-3 pb-1 space-y-0.5">
          <QuickLink to="/portal" icon={LayoutGrid} label="Portal" collapsed={collapsed} active={current === "/portal"} />
        </div>

        {/* Module links */}
        <nav className="flex-1 overflow-y-auto px-2 pb-3 pt-2">
          {!collapsed && (
            <div className="px-3 mb-1.5 text-[10px] font-bold tracking-[0.15em] text-white/30 uppercase">Modules</div>
          )}
          <div className="space-y-0.5">
            {EXTERNAL_MODULES.map((m) => {
              const Icon = m.icon;
              const active = current === m.to;
              return (
                <Link
                  key={m.to}
                  to={m.to}
                  title={collapsed ? m.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 group ${
                    active
                      ? "bg-[#00d4ff]/10 text-[#00d4ff] shadow-[inset_2px_0_0_#00d4ff]"
                      : "text-white/55 hover:text-[#00d4ff] hover:bg-[#00d4ff]/8"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${active ? "text-[#00d4ff]" : "text-white/40 group-hover:text-[#00d4ff]"}`} />
                  {!collapsed && <span className="truncate">{m.label}</span>}
                </Link>
              );
            })}
          </div>
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
            <span className="text-sm font-semibold text-slate-800">{title}</span>
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
          </div>
        </header>

        {/* Content area — white with light token override */}
        <main className="portal-light flex-1 overflow-y-auto bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function QuickLink({ to, icon: Icon, label, collapsed, active }) {
  return (
    <Link
      to={to}
      title={collapsed ? label : undefined}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
        active
          ? "bg-[#00d4ff]/10 text-[#00d4ff] shadow-[inset_2px_0_0_#00d4ff]"
          : "text-white/55 hover:text-[#00d4ff] hover:bg-[#00d4ff]/8"
      }`}
    >
      <Icon className={`w-4 h-4 shrink-0 ${active ? "text-[#00d4ff]" : "text-white/40"}`} />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}