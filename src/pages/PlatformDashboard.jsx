import { useState } from "react";
import BackButton from "@/components/shared/BackButton";
import AnalyticsPanel from "@/components/dashboard/AnalyticsPanel";
import SecurityPanel from "@/components/dashboard/SecurityPanel";
import WorkflowsPanel from "@/components/dashboard/WorkflowsPanel";
import SecretsPanel from "@/components/dashboard/SecretsPanel";
import LogsPanel from "@/components/dashboard/LogsPanel";
import IntegrationsPanel from "@/components/dashboard/IntegrationsPanel";
import AgentsPanel from "@/components/dashboard/AgentsPanel";
import APIPanel from "@/components/dashboard/APIPanel";
import EmailsPanel from "@/components/dashboard/EmailsPanel";
import { MarketingPanel, DomainsPanel, CodePanel, SettingsPanel, MCPPanel } from "@/components/dashboard/InfoPanels";
import { BarChart3, Megaphone, Globe, Plug, Shield, Code, Bot, Workflow, Mail, ScrollText, Key, Settings, Server, Lock, LayoutDashboard } from "lucide-react";

const SECTIONS = [
  { id: "analytics", label: "Analytics", icon: BarChart3, desc: "Traffic and sales analytics" },
  { id: "marketing", label: "Marketing", icon: Megaphone, desc: "SEO, Google Ads, social posts" },
  { id: "domains", label: "Domains", icon: Globe, desc: "Custom domains and redirects" },
  { id: "integrations", label: "Integrations", icon: Plug, desc: "OAuth connectors and MCP" },
  { id: "security", label: "Security", icon: Shield, desc: "Security scan and headers" },
  { id: "code", label: "Code", icon: Code, desc: "Source code and build config" },
  { id: "agents", label: "Agents", icon: Bot, desc: "In-app AI agents" },
  { id: "workflows", label: "Workflows", icon: Workflow, desc: "Automated workflow processes" },
  { id: "emails", label: "Emails", icon: Mail, desc: "Email templates and previews" },
  { id: "logs", label: "Logs", icon: ScrollText, desc: "Runtime logs and errors" },
  { id: "api", label: "API", icon: Key, desc: "API keys, docs, and SDK" },
  { id: "settings", label: "Settings", icon: Settings, desc: "General app settings" },
  { id: "mcp", label: "MCP", icon: Server, desc: "MCP server for AI clients" },
  { id: "secrets", label: "Secrets", icon: Lock, desc: "Environment variables" },
];

const PANELS = {
  analytics: AnalyticsPanel,
  marketing: MarketingPanel,
  domains: DomainsPanel,
  integrations: IntegrationsPanel,
  security: SecurityPanel,
  code: CodePanel,
  agents: AgentsPanel,
  workflows: WorkflowsPanel,
  emails: EmailsPanel,
  logs: LogsPanel,
  api: APIPanel,
  settings: SettingsPanel,
  mcp: MCPPanel,
  secrets: SecretsPanel,
};

export default function PlatformDashboard() {
  const [active, setActive] = useState("analytics");
  const ActivePanel = PANELS[active];
  const activeSection = SECTIONS.find((s) => s.id === active);

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 flex flex-col bg-[#0a0e14] border-r border-black/10 sticky top-0 h-screen">
        <div className="h-16 flex items-center gap-2.5 px-4 border-b border-white/8 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center shrink-0">
            <LayoutDashboard className="w-4 h-4 text-white" />
          </div>
          <div className="leading-none min-w-0">
            <div className="font-black text-[13px] tracking-wide text-white truncate">PLATFORM</div>
            <div className="text-[9px] tracking-[0.2em] text-white/40">ADMIN DASHBOARD</div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const isActive = active === s.id;
            return (
              <button key={s.id} onClick={() => setActive(s.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 group ${isActive ? "bg-[#00d4ff]/10 text-[#00d4ff] shadow-[inset_2px_0_0_#00d4ff]" : "text-white/55 hover:text-[#00d4ff] hover:bg-[#00d4ff]/8"}`}>
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#00d4ff]" : "text-white/40 group-hover:text-[#00d4ff]"}`} />
                <span className="truncate">{s.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <BackButton fallback="/portal" label="Back to Portal" />
            <div className="h-4 w-px bg-slate-200" />
            <div>
              <div className="text-sm font-bold text-slate-800">{activeSection.label}</div>
              <div className="text-xs text-slate-500">{activeSection.desc}</div>
            </div>
          </div>
        </header>
        <main className="portal-light flex-1 overflow-y-auto bg-white">
          <ActivePanel />
        </main>
      </div>
    </div>
  );
}