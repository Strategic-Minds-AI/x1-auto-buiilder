import { Megaphone, Globe, Code, Settings, Server, ExternalLink } from "lucide-react";

export function MarketingPanel() {
  return (
    <InfoShell icon={Megaphone} title="Marketing" color="#ec4899"
      desc="Get your app found and promoted: SEO and AI-search score, Google Ads campaigns, and social posts."
      dashboardPage="Marketing"
      features={["SEO & AI-search optimization checklist", "Google Ads campaign creation and management", "Social post scheduling and publishing", "Business DNA and brand identity"]}
    />
  );
}

export function DomainsPanel() {
  return (
    <InfoShell icon={Globe} title="Domains" color="#3b82f6"
      desc="Connect custom domains, manage the built-in base44.app domain, and set up page redirects."
      dashboardPage="Domains"
      features={["Connect a custom domain you own", "Manage the built-in base44.app domain", "Set up URL redirects between pages", "SSL certificates are auto-provisioned"]}
    />
  );
}

export function CodePanel() {
  return (
    <InfoShell icon={Code} title="Code" color="#8b5cf6"
      desc="Your app runs on React + Tailwind CSS + Vite, deployed to the Base44 platform with serverless backend functions."
      dashboardPage="App Settings"
      features={["Frontend: React 18 + Tailwind CSS + Vite", "Backend: Base44 serverless functions (TypeScript)", "Database: Base44 entities (MongoDB)", "Hosting: Base44 platform with CDN"]}
    />
  );
}

export function SettingsPanel() {
  return (
    <InfoShell icon={Settings} title="Settings" color="#64748b"
      desc="General app settings, app visibility, badge, test data, cloning, and the danger zone (unpublish, transfer, delete)."
      dashboardPage="App Settings"
      features={["App name, description, and visibility settings", "App badge and branding", "Test data seeding and cloning", "Danger zone: unpublish, transfer, or delete"]}
    />
  );
}

export function MCPPanel() {
  return (
    <InfoShell icon={Server} title="MCP Server" color="#f59e0b"
      desc="Expose your published app's data and backend functions to AI clients like ChatGPT and Claude via an MCP server."
      dashboardPage="Integrations"
      features={["Let AI clients read your app's entity data", "Expose backend functions as MCP tools", "Secure authentication via API keys", "Full setup from the Integrations page in your dashboard"]}
    />
  );
}

function InfoShell({ icon: Icon, title, color, desc, dashboardPage, features }) {
  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          <p className="text-sm text-slate-500">{desc}</p>
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-5 mb-4">
        <div className="text-xs font-bold uppercase text-slate-400 mb-3">What you can do</div>
        <div className="space-y-2">
          {features.map((f, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${color}15` }}>
                <span className="text-[10px] font-bold" style={{ color }}>{i + 1}</span>
              </div>
              <span className="text-sm text-slate-600">{f}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 flex items-start gap-3">
        <ExternalLink className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-blue-700 mb-0.5">Managed in your app dashboard</p>
          <p className="text-xs text-blue-600">{title} is configured from the {dashboardPage} page in your Base44 app dashboard. This panel gives you an overview of what's available there.</p>
        </div>
      </div>
    </div>
  );
}