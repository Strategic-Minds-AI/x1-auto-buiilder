import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Key, Loader2, Plus, Trash2, Link as LinkIcon } from "lucide-react";
import { Link } from "react-router-dom";

export default function APIPanel() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const page = await base44.entities.AppApiKey.filter({ status: "active" }, { sort: "-created_date", limit: 25 });
        setKeys(page.items || []);
      } catch {} finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-1">API Keys & SDK</h2>
          <p className="text-sm text-slate-500">Manage API keys for external access to your app's data and backend functions.</p>
        </div>
        <Link to="/api-keys" className="inline-flex items-center gap-1.5 rounded-lg bg-[#00d4ff] px-4 py-2 text-sm font-bold text-[#0a0e14] hover:brightness-110 transition">
          <Plus className="w-4 h-4" /> Generate Key
        </Link>
      </div>
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Key className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-bold text-blue-700">App API Access</span>
        </div>
        <p className="text-xs text-blue-600">Your app's API keys, documentation, and SDK access are available from the API page in your app dashboard. Use these to let third parties call your app's endpoints.</p>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-5 h-5 text-slate-300 animate-spin" /></div>
      ) : keys.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white py-16 text-center">
          <Key className="w-10 h-10 text-slate-200 mx-auto mb-2" />
          <p className="text-sm text-slate-400 mb-3">No API keys generated yet</p>
          <Link to="/api-keys" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#00d4ff] hover:underline">
            <LinkIcon className="w-4 h-4" /> Go to API Key Manager
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="divide-y divide-slate-100">
            {keys.map((k) => (
              <div key={k.id} className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Key className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="text-sm font-semibold text-slate-700">{k.name}</div>
                    <div className="text-xs font-mono text-slate-400">{k.key_prefix}...</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {k.scopes?.map((s) => (
                    <span key={s} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{s}</span>
                  ))}
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600">{k.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}