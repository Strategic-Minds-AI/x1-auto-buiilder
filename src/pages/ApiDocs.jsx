import { useState } from "react";
import { Link } from "react-router-dom";
import BackButton from "@/components/shared/BackButton";
import { ENTITY_CATALOG } from "@/lib/entityCatalog";
import { Code2, Key, Terminal, Box, Zap, Database, Copy, Check, Shield, ArrowRight, BookOpen, Server } from "lucide-react";

const APP_ID = "6acfedce320afe2f706c6bfd";
const GATEWAY_URL = "https://x1-auto-builder.base44.app/functions/customApiGateway";

const SDK_INSTALL = `npm install @base44/sdk`;

const SDK_INIT = `import { createClient } from '@base44/sdk';

const base44 = createClient({
  appId: "${APP_ID}",
  headers: {
    "Authorization": "Bearer YOUR_API_KEY"
  }
});`;

const RAW_EXAMPLE = `// List WebsiteProject records
const res = await fetch("${GATEWAY_URL}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_API_KEY"
  },
  body: JSON.stringify({
    action: "list",
    entity: "WebsiteProject",
    query: { status: "approved" },
    sort: "-created_date",
    limit: 10
  })
});
const { items, has_more, next_cursor } = await res.json();`;

const INVOKE_EXAMPLE = `// Invoke a backend function
const res = await fetch("${GATEWAY_URL}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_API_KEY"
  },
  body: JSON.stringify({
    action: "invoke",
    function: "generateWebsite",
    args: { industry: "concrete polishing", businessName: "XPS" }
  })
});
const { result } = await res.json();`;

const CREATE_EXAMPLE = `// Create a new Lead
const res = await fetch("${GATEWAY_URL}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_API_KEY"
  },
  body: JSON.stringify({
    action: "create",
    entity: "Lead",
    data: { name: "John Doe", email: "john@example.com", form_type: "contact" }
  })
});
const { record } = await res.json();`;

const ACTIONS = [
  { name: "list", scope: "read", desc: "Filter and paginate entity records", args: "entity, query, sort, limit, fields, cursor" },
  { name: "get", scope: "read", desc: "Get a single record by ID", args: "entity, id" },
  { name: "count", scope: "read", desc: "Count records matching a query", args: "entity, query" },
  { name: "distinct", scope: "read", desc: "Get distinct field values", args: "entity, field, query, limit" },
  { name: "aggregate", scope: "read", desc: "Aggregate data with groupBy/sum/avg", args: "entity, params" },
  { name: "create", scope: "write", desc: "Create a new record", args: "entity, data" },
  { name: "update", scope: "write", desc: "Update a record by ID", args: "entity, id, data" },
  { name: "delete", scope: "write", desc: "Delete a record by ID", args: "entity, id" },
  { name: "bulkCreate", scope: "write", desc: "Create multiple records at once", args: "entity, records" },
  { name: "bulkUpdate", scope: "write", desc: "Update multiple records by ID", args: "entity, records" },
  { name: "updateMany", scope: "write", desc: "Update all records matching a query", args: "entity, query, update" },
  { name: "deleteMany", scope: "write", desc: "Delete all records matching a query", args: "entity, query" },
  { name: "upsert", scope: "write", desc: "Create or update by key", args: "entity, records, key" },
  { name: "invoke", scope: "invoke", desc: "Invoke a backend function", args: "function, args" },
  { name: "snapshot", scope: "read", desc: "Get record counts for all entities", args: "entities?" },
  { name: "events", scope: "read", desc: "List recent sync events", args: "limit?" },
  { name: "discover", scope: "read", desc: "List all exposed entities, actions, and scopes", args: "none" },
];

const SCOPES = [
  { name: "read", desc: "List, get, count, aggregate, and snapshot entities" },
  { name: "invoke", desc: "Invoke backend functions" },
  { name: "write", desc: "Create, update, delete, and bulk operations" },
  { name: "admin", desc: "Full access to all operations" },
];

export default function ApiDocs() {
  const [copied, setCopied] = useState(null);
  const [tab, setTab] = useState("quickstart");

  const copy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const CodeBlock = ({ code, id }) => (
    <div className="relative rounded-xl bg-[#0a0e14] border border-slate-700 overflow-hidden">
      <button onClick={() => copy(code, id)} className="absolute top-2 right-2 rounded-lg bg-white/10 p-1.5 text-white/60 hover:text-white hover:bg-white/20 transition z-10">
        {copied === id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
      <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">{code}</pre>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <BackButton fallback="/portal" label="Back to Portal" />
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center">
              <Server className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Custom API System</h1>
              <p className="text-sm text-slate-500">Full programmatic access to entities, functions, and agent conversations via API keys</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-slate-200">
          {[
            { key: "quickstart", label: "Quick Start", icon: Terminal },
            { key: "auth", label: "Authentication", icon: Key },
            { key: "entities", label: "Entities", icon: Database },
            { key: "actions", label: "Actions & Scopes", icon: Zap },
            { key: "functions", label: "Functions", icon: Code2 },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition ${tab === t.key ? "border-[#00d4ff] text-[#00d4ff]" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
                <Icon className="w-4 h-4" /> {t.label}
              </button>
            );
          })}
        </div>

        {/* Quick Start */}
        {tab === "quickstart" && (
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-[#00d4ff]/10 flex items-center justify-center text-[#00d4ff] font-bold text-sm">1</div>
                <h3 className="text-sm font-bold text-slate-800">Generate an API Key</h3>
              </div>
              <p className="text-xs text-slate-500 mb-3">Create a key in the API Key Manager. Choose scopes based on what the external system needs. The full key is shown only once.</p>
              <Link to="/api-keys" className="inline-flex items-center gap-2 rounded-lg bg-[#00d4ff] px-4 py-2 text-xs font-bold text-[#0a0e14] hover:brightness-110 transition">
                <Key className="w-3.5 h-3.5" /> Open API Key Manager
              </Link>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-[#00d4ff]/10 flex items-center justify-center text-[#00d4ff] font-bold text-sm">2</div>
                <h3 className="text-sm font-bold text-slate-800">Install the SDK (optional)</h3>
              </div>
              <p className="text-xs text-slate-500 mb-3">Use the Base44 SDK for typed access, or call the gateway directly with fetch. Both work with the same API key.</p>
              <CodeBlock code={SDK_INSTALL} id="install" />
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-[#00d4ff]/10 flex items-center justify-center text-[#00d4ff] font-bold text-sm">3</div>
                <h3 className="text-sm font-bold text-slate-800">Initialize the Client</h3>
              </div>
              <CodeBlock code={SDK_INIT} id="init" />
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-[#00d4ff]/10 flex items-center justify-center text-[#00d4ff] font-bold text-sm">4</div>
                <h3 className="text-sm font-bold text-slate-800">Make Your First Request</h3>
              </div>
              <p className="text-xs text-slate-500 mb-3">List website projects using the custom API gateway:</p>
              <CodeBlock code={RAW_EXAMPLE} id="first" />
            </div>

            <div className="rounded-xl border border-[#00d4ff]/30 bg-gradient-to-r from-[#00d4ff]/5 to-[#0066ff]/5 p-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#00d4ff]" />
                <p className="text-xs text-slate-600">
                  The gateway endpoint is <code className="font-mono text-slate-800">{GATEWAY_URL}</code>. All requests are POST with JSON body and a Bearer token.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Authentication */}
        {tab === "auth" && (
          <div className="space-y-5">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2"><Shield className="w-4 h-4 text-[#00d4ff]" /> How API Keys Work</h3>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex gap-2"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" /> Keys are 64-character hex tokens generated securely</li>
                <li className="flex gap-2"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" /> Only the SHA-256 hash is stored — the full key is shown once at creation</li>
                <li className="flex gap-2"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" /> Pass the key in the <code className="font-mono text-slate-800">Authorization: Bearer</code> header</li>
                <li className="flex gap-2"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" /> Keys have scopes (read, invoke, write, admin) that control access</li>
                <li className="flex gap-2"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" /> Keys can be revoked or set to expire</li>
                <li className="flex gap-2"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" /> All requests are logged with timestamp and last-used tracking</li>
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-bold text-slate-800 mb-3">Scopes</h3>
              <div className="space-y-2">
                {SCOPES.map((s) => (
                  <div key={s.name} className="flex items-start gap-3 rounded-lg border border-slate-100 p-3">
                    <span className="rounded-full bg-[#00d4ff]/10 px-2.5 py-0.5 text-xs font-bold text-[#00d4ff] shrink-0">{s.name}</span>
                    <span className="text-xs text-slate-600">{s.desc}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-bold text-slate-800 mb-3">Auth Header Format</h3>
              <CodeBlock code={`Authorization: Bearer smk_a1b2c3d4e5f6...`} id="auth-header" />
            </div>
          </div>
        )}

        {/* Entities */}
        {tab === "entities" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">{ENTITY_CATALOG.filter((e) => !["AppApiKey"].includes(e.name)).length} entities are exposed via the API. Use the <code className="font-mono text-slate-800">entity</code> field in your request body to specify which entity to operate on.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {ENTITY_CATALOG.filter((e) => !["AppApiKey"].includes(e.name)).map((e) => (
                <div key={e.name} className="rounded-lg border border-slate-200 bg-white p-3 hover:border-[#00d4ff]/40 transition">
                  <div className="flex items-center justify-between mb-1">
                    <code className="text-xs font-bold text-slate-800">{e.name}</code>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">{e.category}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-1.5">{e.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {e.keyFields.map((f) => (
                      <span key={f} className="text-[10px] font-mono text-slate-400">{f}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions & Scopes */}
        {tab === "actions" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-slate-50">
                  <tr className="text-left text-slate-500">
                    <th className="px-4 py-2.5 font-semibold">Action</th>
                    <th className="px-4 py-2.5 font-semibold">Scope</th>
                    <th className="px-4 py-2.5 font-semibold">Description</th>
                    <th className="px-4 py-2.5 font-semibold">Parameters</th>
                  </tr>
                </thead>
                <tbody>
                  {ACTIONS.map((a) => (
                    <tr key={a.name} className="border-t border-slate-100">
                      <td className="px-4 py-2.5"><code className="font-mono font-bold text-[#00d4ff]">{a.name}</code></td>
                      <td className="px-4 py-2.5"><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${a.scope === "write" ? "bg-amber-100 text-amber-600" : a.scope === "invoke" ? "bg-purple-100 text-purple-600" : "bg-emerald-100 text-emerald-600"}`}>{a.scope}</span></td>
                      <td className="px-4 py-2.5 text-slate-600">{a.desc}</td>
                      <td className="px-4 py-2.5 font-mono text-[10px] text-slate-400">{a.args}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <h3 className="text-xs font-bold text-slate-700 mb-2">Create Example</h3>
                <CodeBlock code={CREATE_EXAMPLE} id="create-ex" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-700 mb-2">Invoke Example</h3>
                <CodeBlock code={INVOKE_EXAMPLE} id="invoke-ex" />
              </div>
            </div>
          </div>
        )}

        {/* Functions */}
        {tab === "functions" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Invoke any backend function via the <code className="font-mono text-slate-800">invoke</code> action. The function receives your args as the request body. Requires the <code className="font-mono text-[#00d4ff]">invoke</code> scope.</p>
            </div>
            <CodeBlock code={INVOKE_EXAMPLE} id="func-ex" />
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="text-xs font-bold text-slate-700 mb-2">Common Functions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {["generateWebsite", "deploySite", "researchIndustryTemplates", "massLaunch", "runComplianceCheck", "generateStrategies", "generateVision", "generateAssets", "instantiateTemplate", "syncAllAnalytics", "scanWebsiteFaults", "discoverPricing"].map((fn) => (
                  <code key={fn} className="rounded-lg bg-slate-50 border border-slate-200 px-2 py-1.5 text-[10px] font-mono text-slate-600">{fn}</code>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-[#00d4ff]/30 bg-gradient-to-r from-[#00d4ff]/5 to-[#0066ff]/5 p-4">
              <div className="flex items-start gap-2">
                <Box className="w-4 h-4 text-[#00d4ff] shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600">
                  The gateway also supports a <code className="font-mono text-slate-800">discover</code> action that returns all exposed entities, available actions, and your key's scopes. Use it to verify your integration.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}