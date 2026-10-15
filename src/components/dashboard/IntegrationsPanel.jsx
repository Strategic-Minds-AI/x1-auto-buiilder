import { Plug, CheckCircle, Link as LinkIcon } from "lucide-react";
import { Link } from "react-router-dom";

const CONNECTORS = [
  { name: "Google Calendar", type: "googlecalendar", scopes: ["calendar", "calendar.events", "email"], status: "connected", webhooks: true },
  { name: "Gmail", type: "gmail", scopes: ["gmail.send", "gmail.readonly", "email"], status: "connected", webhooks: true },
  { name: "Supabase", type: "supabase", scopes: ["database", "rest", "storage", "auth"], status: "connected", webhooks: false },
  { name: "Google Analytics", type: "google_analytics", scopes: ["analytics.readonly", "email"], status: "connected", webhooks: false },
  { name: "Google Search Console", type: "google_search_console", scopes: ["webmasters.readonly", "email"], status: "connected", webhooks: false },
];

export default function IntegrationsPanel() {
  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-1">Integrations & Connectors</h2>
          <p className="text-sm text-slate-500">{CONNECTORS.length} OAuth connectors authorized. Manage workspace connectors and app-user connections.</p>
        </div>
        <Link to="/api-connectors" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:text-[#00d4ff] hover:border-[#00d4ff]/40 transition">
          <LinkIcon className="w-4 h-4" /> Manage Connectors
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CONNECTORS.map((c) => (
          <div key={c.type} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#00d4ff]/10 flex items-center justify-center">
                  <Plug className="w-4 h-4 text-[#00d4ff]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">{c.name}</h3>
                  <div className="text-[10px] font-mono text-slate-400">{c.type}</div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle className="w-2.5 h-2.5" /> Connected
              </span>
            </div>
            <div className="flex flex-wrap gap-1 mb-2">
              {c.scopes.map((s) => (
                <span key={s} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">{s}</span>
              ))}
            </div>
            {c.webhooks && <span className="text-[10px] font-semibold text-blue-500">Supports webhooks</span>}
          </div>
        ))}
      </div>
    </div>
  );
}