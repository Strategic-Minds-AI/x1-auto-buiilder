import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import BackButton from "@/components/shared/BackButton";
import { Loader2, Plus, Key, Copy, Check, Trash2, Ban, AlertCircle, Shield, Clock, CheckCircle } from "lucide-react";

export default function ApiKeyManager() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", scopes: ["read", "invoke"], expiresInDays: 365 });
  const [generating, setGenerating] = useState(false);
  const [newKey, setNewKey] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { items } = await base44.entities.AppApiKey.filter({}, { sort: "-created_date", limit: 50 });
      setKeys(items || []);
    } catch { setKeys([]); }
    finally { setLoading(false); }
  };

  const generate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("generateApiKey", {
        name: form.name,
        scopes: form.scopes,
        expiresInDays: parseInt(form.expiresInDays) || 365,
      });
      setNewKey(res.data);
      setCopied(false);
      setShowForm(false);
      setForm({ name: "", scopes: ["read", "invoke"], expiresInDays: 365 });
      load();
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to generate key");
    } finally { setGenerating(false); }
  };

  const revoke = async (id) => {
    if (!confirm("Revoke this API key? External systems using it will lose access immediately.")) return;
    await base44.entities.AppApiKey.update(id, { status: "revoked" });
    load();
  };

  const deleteKey = async (id) => {
    if (!confirm("Permanently delete this key record? This cannot be undone.")) return;
    await base44.entities.AppApiKey.delete(id);
    load();
  };

  const copyKey = () => {
    navigator.clipboard.writeText(newKey.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleScope = (scope) => {
    setForm((prev) => ({
      ...prev,
      scopes: prev.scopes.includes(scope) ? prev.scopes.filter((s) => s !== scope) : [...prev.scopes, scope],
    }));
  };

  return (
    <div className="portal-light min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton />
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center">
              <Key className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">API Key Manager</h1>
              <p className="text-sm text-slate-500">Generate and manage API keys for external systems connecting to this platform</p>
            </div>
          </div>
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-full bg-[#00d4ff] px-5 py-2.5 text-sm font-bold text-[#0a0e14] hover:brightness-110 transition">
            <Plus className="w-4 h-4" /> Generate Key
          </button>
        </div>

        {/* New key display modal */}
        {newKey && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setNewKey(null)}>
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <h2 className="text-lg font-bold text-slate-900">API Key Generated</h2>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 mb-4 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">Save this key now — it cannot be retrieved again. The full key is only shown this once.</p>
              </div>
              <div className="mb-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Key Name</label>
                <p className="text-sm font-semibold text-slate-800">{newKey.name}</p>
              </div>
              <div className="mb-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Prefix</label>
                <p className="text-sm font-mono text-slate-600">{newKey.prefix}...</p>
              </div>
              <div className="mb-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Scopes</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {newKey.scopes.map((s) => (
                    <span key={s} className="rounded-full bg-[#00d4ff]/10 px-2 py-0.5 text-xs font-medium text-[#00d4ff]">{s}</span>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Full API Key</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 rounded-lg bg-slate-900 text-emerald-400 px-3 py-2 text-xs font-mono break-all">{newKey.key}</code>
                  <button onClick={copyKey} className="shrink-0 rounded-lg bg-slate-100 p-2 hover:bg-slate-200 transition">
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-600" />}
                  </button>
                </div>
              </div>
              <button onClick={() => setNewKey(null)} className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800 transition">
                Done
              </button>
            </div>
          </div>
        )}

        {/* Generate form modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowForm(false)}>
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-bold text-slate-900 mb-4">Generate New API Key</h2>
              {error && <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-600 mb-3">{error}</div>}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Key Name</label>
                  <input className="dd-input mt-1" placeholder="e.g. GPT Integration, Zapier, Custom CRM" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Scopes</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {["read", "invoke", "write", "admin"].map((scope) => (
                      <button key={scope} onClick={() => toggleScope(scope)} className={`rounded-full px-3 py-1 text-xs font-semibold transition ${form.scopes.includes(scope) ? "bg-[#00d4ff] text-[#0a0e14]" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                        {scope}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Expires in (days)</label>
                  <input type="number" className="dd-input mt-1" value={form.expiresInDays} onChange={(e) => setForm({ ...form, expiresInDays: e.target.value })} />
                </div>
                <button onClick={generate} disabled={generating || !form.name} className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#00d4ff] px-4 py-3 text-sm font-bold text-[#0a0e14] hover:brightness-110 transition disabled:opacity-50">
                  {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />} Generate Key
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Keys list */}
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#00d4ff]" /></div>
        ) : keys.length === 0 ? (
          <div className="text-center py-12">
            <Key className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-slate-400 text-sm">No API keys yet. Generate one to allow external systems to connect.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr className="text-left text-slate-500">
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">Prefix</th>
                    <th className="px-4 py-3 font-semibold">Scopes</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Expires</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {keys.map((k) => (
                    <tr key={k.id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">{k.name}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">{k.key_prefix}...</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {(k.scopes || []).map((s) => (
                            <span key={s} className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">{s}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${k.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                          {k.status === "active" ? <CheckCircle className="w-2.5 h-2.5" /> : <Ban className="w-2.5 h-2.5" />}
                          {k.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {k.expires_at ? new Date(k.expires_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex gap-1">
                          {k.status === "active" && (
                            <button onClick={() => revoke(k.id)} title="Revoke" className="rounded-lg p-1.5 text-amber-500 hover:bg-amber-50 transition">
                              <Ban className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => deleteKey(k.id)} title="Delete" className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 transition">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Info card */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-500 leading-relaxed">
              <p className="font-semibold text-slate-600 mb-1">How API keys work</p>
              <p>Keys are generated as secure random tokens. Only the SHA-256 hash is stored — the full key is shown once at generation time. External systems pass the key in the <code className="font-mono text-slate-700">Authorization: Bearer</code> header to authenticate with this platform's backend functions. Revoked keys lose access immediately.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}