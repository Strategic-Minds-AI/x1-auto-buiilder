import { useState } from "react";
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
import { BarChart3, Megaphone, Globe, Plug, Shield, Code, Bot, Workflow, Mail, ScrollText, Key, Settings, Server, Lock } from "lucide-react";

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
    <div className="p-6">
      {/* Section header */}
      <div className="mb-5">
        <h1 className="text-xl font-black text-slate-900">{activeSection.label}</h1>
        <p className="text-sm text-slate-500">{activeSection.desc}</p>
      </div>

      {/* Section tabs */}
      <div className="flex items-center gap-1.5 mb-5 flex-wrap">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          const isActive = active === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[13px] font-semibold transition ${
                isActive ? "bg-[#00d4ff] text-[#0a0e14]" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Active panel */}
      <ActivePanel />
    </div>
  );
}