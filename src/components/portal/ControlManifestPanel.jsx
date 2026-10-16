import { useState } from "react";
import {
  Shield, Copy, Check, ChevronDown, ChevronRight,
  KeyRound, ArrowLeftRight, Zap, Database, Plug, Lock,
} from "lucide-react";

// The full autonomous control manifest — mirrors SYNC_CONFIG in
// base44/functions/gptSyncEngine/entry.ts. Displayed directly so the
// builder can see and copy the JSON that grants GPT bidirectional
// control over the frontend, backend, and connected accounts.
const SYNC_CONFIG = {
  name: "APEX_UNIVERSAL_GENERATOR_SYNC",
  version: "4.1",
  mode: "bidirectional",
  enabled: true,
  endpoint: "/functions/gptSyncEngine",
  authentication: { enabled: true, type: "bearer", secret_ref: "GPT_SYNC_API_KEY", server_side_only: true },
  modules: {
    universal_generator: true, template_library: true, brand_generator: true,
    logo_generator: true, content_generator: true, responsive_preview: true,
    agent_orchestration: true, independent_validation: true, deployment_receipts: true,
    website_factory: true, app_factory: true, component_factory: true,
    seo_aeo_geo: true, market_research: true, competitor_intelligence: true,
    social_automation: true, crm_integration: true, analytics: true,
    self_healing: true, recursive_optimization: true,
    github_sync: true, vercel_sync: true, supabase_sync: true,
    railway_sync: true, google_drive_sync: true, base44_sync: true,
  },
  template_factory: {
    enabled: true, industry_families: 20, universal_generation: true,
    bulk_generation: true, design_selection: true, noindex_preview: true,
    responsive_validation: true, existing_X1_runtime: true,
  },
  sync: {
    enabled: true, direction: "both", read: true, write: true, create: true,
    update: true, delete: true, execute: true, events: true, snapshots: true,
    conflict_detection: true, idempotency_required: true, receipts_required: true,
  },
  permissions: {
    read: true, draft: true, preview: true, production_deploy: true, delete: true,
    manage_secrets: true, purchase_domains: true, manage_integrations: true,
    manage_agents: true, manage_templates: true, manage_workflows: true,
    manage_websites: true, manage_applications: true, autonomous_execution: true,
  },
  autonomy: {
    enabled: true, recursive_execution: true, automatic_repair: true,
    automatic_testing: true, automatic_optimization: true, agent_delegation: true,
    persistent_execution: true, protected_actions_require_approval: true,
  },
  release_gate: {
    enabled: true, independent_validation: true, operator_approval: true,
    rollback_required: true, security_validation: true, deployment_verification: true,
  },
};

export default function ControlManifestPanel() {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState({ sync: true, permissions: true, autonomy: true });
  const config = SYNC_CONFIG;

  const copyJson = async () => {
    if (!config) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(config, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const toggle = (key) => setExpanded({ ...expanded, [key]: !expanded[key] });

  const sync = config.sync;
  const perms = config.permissions;
  const autonomy = config.autonomy;
  const modules = config.modules;
  const releaseGate = config.release_gate;

  const syncActions = [
    { key: "read", label: "Read", icon: Database },
    { key: "write", label: "Write", icon: ArrowLeftRight },
    { key: "create", label: "Create", icon: Zap },
    { key: "update", label: "Update", icon: ArrowLeftRight },
    { key: "delete", label: "Delete", icon: ArrowLeftRight },
    { key: "execute", label: "Execute", icon: Zap },
    { key: "events", label: "Events", icon: ArrowLeftRight },
    { key: "snapshots", label: "Snapshots", icon: Database },
  ];

  const permItems = [
    { key: "read", label: "Read" },
    { key: "draft", label: "Draft" },
    { key: "preview", label: "Preview" },
    { key: "production_deploy", label: "Production Deploy" },
    { key: "delete", label: "Delete" },
    { key: "manage_secrets", label: "Manage Secrets" },
    { key: "purchase_domains", label: "Purchase Domains" },
    { key: "manage_integrations", label: "Manage Integrations" },
    { key: "manage_agents", label: "Manage Agents" },
    { key: "manage_templates", label: "Manage Templates" },
    { key: "manage_workflows", label: "Manage Workflows" },
    { key: "manage_websites", label: "Manage Websites" },
    { key: "manage_applications", label: "Manage Applications" },
    { key: "autonomous_execution", label: "Autonomous Execution" },
  ];

  const autonomyItems = [
    { key: "enabled", label: "Enabled" },
    { key: "recursive_execution", label: "Recursive Execution" },
    { key: "automatic_repair", label: "Automatic Repair" },
    { key: "automatic_testing", label: "Automatic Testing" },
    { key: "automatic_optimization", label: "Automatic Optimization" },
    { key: "agent_delegation", label: "Agent Delegation" },
    { key: "persistent_execution", label: "Persistent Execution" },
    { key: "protected_actions_require_approval", label: "Protected Actions Require Approval" },
  ];

  const connectedAccounts = Object.entries(modules).filter(
    ([k]) => k.endsWith("_sync")
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-800">Autonomous Control Manifest</h3>
            <p className="text-xs text-slate-400">
              {config?.name} v{config?.version} · {config?.mode} ·{" "}
              {config?.enabled ? "ENABLED" : "DISABLED"}
            </p>
          </div>
        </div>
        <button
          onClick={copyJson}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-[#00d4ff] hover:border-[#00d4ff]/40 transition"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied!" : "Copy JSON"}
        </button>
      </div>

      {/* Endpoint */}
      <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2.5">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">
          <KeyRound className="w-3 h-3" /> Endpoint
        </div>
        <code className="block text-xs text-[#00d4ff] font-mono">
          POST /functions/gptSyncEngine · Authorization: Bearer &lt;GPT_SYNC_API_KEY&gt;
        </code>
        <p className="text-[11px] text-slate-400 mt-1">
          Send <code className="font-mono text-slate-600">{"{ \"action\": \"config\" }"}</code> to retrieve this manifest.
          Send <code className="font-mono text-slate-600">{"{ \"action\": \"read|create|update|delete|execute\", ... }"}</code> to control the app.
        </p>
      </div>

      {/* Sync capabilities */}
      <Section title="Bidirectional Sync Capabilities" expanded={expanded.sync} onToggle={() => toggle("sync")} icon={ArrowLeftRight}>
        <div className="grid grid-cols-4 gap-2">
          {syncActions.map((a) => {
            const Icon = a.icon;
            const active = sync[a.key];
            return (
              <div
                key={a.key}
                className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-semibold ${
                  active
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-slate-50 text-slate-400"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {a.label}
                {active && <Check className="w-3 h-3 text-emerald-500 ml-auto" />}
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-2 mt-2 text-[11px]">
          <span className={`px-2 py-0.5 rounded-full font-semibold ${sync.conflict_detection ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-slate-50 text-slate-400 border border-slate-200"}`}>
            Conflict Detection: {sync.conflict_detection ? "ON" : "OFF"}
          </span>
          <span className={`px-2 py-0.5 rounded-full font-semibold ${sync.idempotency_required ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-slate-50 text-slate-400 border border-slate-200"}`}>
            Idempotency: {sync.idempotency_required ? "REQUIRED" : "OFF"}
          </span>
          <span className={`px-2 py-0.5 rounded-full font-semibold ${sync.receipts_required ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-slate-50 text-slate-400 border border-slate-200"}`}>
            Receipts: {sync.receipts_required ? "REQUIRED" : "OFF"}
          </span>
        </div>
      </Section>

      {/* Permissions */}
      <Section title="Permissions" expanded={expanded.permissions} onToggle={() => toggle("permissions")} icon={Lock}>
        <div className="grid grid-cols-3 gap-2">
          {permItems.map((p) => (
            <div
              key={p.key}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold ${
                perms[p.key]
                  ? "border-[#00d4ff]/30 bg-[#00d4ff]/5 text-[#0066ff]"
                  : "border-slate-200 bg-slate-50 text-slate-400"
              }`}
            >
              {perms[p.key] ? <Check className="w-3 h-3 text-[#00d4ff]" /> : <Lock className="w-3 h-3 text-slate-300" />}
              {p.label}
            </div>
          ))}
        </div>
      </Section>

      {/* Autonomy */}
      <Section title="Autonomy Engine" expanded={expanded.autonomy} onToggle={() => toggle("autonomy")} icon={Zap}>
        <div className="grid grid-cols-3 gap-2">
          {autonomyItems.map((a) => (
            <div
              key={a.key}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold ${
                autonomy[a.key]
                  ? "border-purple-200 bg-purple-50 text-purple-700"
                  : "border-slate-200 bg-slate-50 text-slate-400"
              }`}
            >
              {autonomy[a.key] ? <Check className="w-3 h-3 text-purple-500" /> : <Lock className="w-3 h-3 text-slate-300" />}
              {a.label}
            </div>
          ))}
        </div>
      </Section>

      {/* Connected accounts */}
      <Section title={`Connected Accounts (${connectedAccounts.length})`} expanded={true} onToggle={() => {}} icon={Plug} forceOpen>
        <div className="grid grid-cols-3 gap-2">
          {connectedAccounts.map(([key, active]) => (
            <div
              key={key}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold ${
                active
                  ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                  : "border-slate-200 bg-slate-50 text-slate-400"
              }`}
            >
              <Plug className="w-3 h-3" />
              {key.replace("_sync", "").replace(/_/g, " ").toUpperCase()}
              {active && <Check className="w-3 h-3 text-indigo-500 ml-auto" />}
            </div>
          ))}
        </div>
      </Section>

      {/* Release gate */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-amber-600 mb-1">
          <Shield className="w-3 h-3" /> Release Gate (Safety Rails)
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(releaseGate).map(([k, v]) => (
            <span key={k} className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${v ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-slate-50 text-slate-400 border-slate-200"}`}>
              {k.replace(/_/g, " ")}: {v ? "ON" : "OFF"}
            </span>
          ))}
        </div>
      </div>

      {/* Raw JSON */}
      <details className="rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
        <summary className="cursor-pointer px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition select-none">
          Raw JSON Manifest
        </summary>
        <pre className="text-[11px] font-mono text-slate-600 p-3 overflow-x-auto max-h-80 overflow-y-auto bg-white border-t border-slate-200">
          {JSON.stringify(config, null, 2)}
        </pre>
      </details>
    </div>
  );
}

function Section({ title, expanded, onToggle, icon: Icon, children, forceOpen }) {
  const isOpen = forceOpen || expanded;
  return (
    <div className="rounded-lg border border-slate-200 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition text-left"
      >
        {forceOpen ? null : (isOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />)}
        <Icon className="w-3.5 h-3.5 text-[#00d4ff]" />
        {title}
      </button>
      {isOpen && <div className="px-3 pb-3 pt-1">{children}</div>}
    </div>
  );
}