import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import {
  Shield, Copy, Check, Loader2, ChevronDown, ChevronRight,
  KeyRound, ArrowLeftRight, Zap, Database, Plug, Lock,
} from "lucide-react";

// Fetches and displays the full SYNC_CONFIG manifest from gptSyncEngine
// so the builder can see and copy the JSON that grants GPT autonomous
// bidirectional control over the frontend, backend, and connected accounts.
export default function ControlManifestPanel() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState({ sync: true, permissions: true, autonomy: true });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("gptSyncEngine", { action: "config" });
      setConfig(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to load manifest");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const copyJson = async () => {
    if (!config) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(config, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const toggle = (key) => setExpanded({ ...expanded, [key]: !expanded[key] });

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading control manifest…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
        <div className="flex items-center gap-2 text-sm text-red-600">
          <Lock className="w-4 h-4" /> {error}
        </div>
        <p className="text-xs text-red-400 mt-2">
          The manifest is served by <code className="font-mono">POST /functions/gptSyncEngine</code> with
          <code className="font-mono"> action: "config"</code>. Make sure <code className="font-mono">GPT_SYNC_API_KEY</code> is set.
        </p>
      </div>
    );
  }

  const sync = config?.sync || {};
  const perms = config?.permissions || {};
  const autonomy = config?.autonomy || {};
  const modules = config?.modules || {};
  const releaseGate = config?.release_gate || {};

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