import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import BackButton from "@/components/shared/BackButton";
import { Loader2, Search, Wand2, Download, Code, Palette, Video, Workflow, Package, Sparkles, Zap, Box, FileText, Database, Plug, CheckCircle, ExternalLink, Copy, Check } from "lucide-react";

const TYPE_ICONS = {
  ai_tool: Zap, template: Palette, prompt_pack: FileText, video_asset: Video,
  workflow_template: Workflow, design_system: Sparkles, icon_pack: Box, font_pack: Box,
  starter_kit: Package, api_service: Plug, dataset: Database, component_library: Code, plugin: Plug,
};

const TYPE_COLORS = {
  ai_tool: "bg-purple-100 text-purple-700", template: "bg-blue-100 text-blue-700",
  prompt_pack: "bg-amber-100 text-amber-700", video_asset: "bg-rose-100 text-rose-700",
  workflow_template: "bg-cyan-100 text-cyan-700", design_system: "bg-pink-100 text-pink-700",
  icon_pack: "bg-indigo-100 text-indigo-700", font_pack: "bg-teal-100 text-teal-700",
  starter_kit: "bg-emerald-100 text-emerald-700", api_service: "bg-orange-100 text-orange-700",
  dataset: "bg-slate-100 text-slate-700", component_library: "bg-violet-100 text-violet-700",
};

const PRICING_LABELS = { free: "Free", freemium: "Freemium", open_source: "Open Source", free_tier: "Free Tier" };

export default function FreeLibrary() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [installing, setInstalling] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { items } = await base44.entities.FreeAsset.filter({}, { sort: "-popularity_score", limit: 500, fields: ["asset_id", "name", "type", "category", "description", "provider", "source_url", "docs_url", "pricing_model", "capabilities", "tags", "integration_type", "install_steps", "code_snippet", "popularity_score", "installed_count", "status"] });
      setAssets(items || []);
    } catch { setAssets([]); }
    finally { setLoading(false); }
  };

  const seed = async () => {
    setSeeding(true);
    try { await base44.functions.invoke("seedFreeLibrary", {}); await load(); }
    catch (e) { alert("Seed failed: " + (e.message || "unknown")); }
    finally { setSeeding(false); }
  };

  const install = async (asset) => {
    setInstalling(asset.asset_id);
    try {
      await base44.functions.invoke("installFreeAsset", { asset_id: asset.asset_id });
      await load();
      setSelectedAsset(null);
    } catch (e) { alert("Install failed: " + (e.message || "unknown")); }
    finally { setInstalling(null); }
  };

  const types = useMemo(() => ["All", ...Array.from(new Set(assets.map((a) => a.type))).sort()], [assets]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return assets.filter((a) => {
      const matchType = typeFilter === "All" || a.type === typeFilter;
      const matchQ = !q || (a.name || "").toLowerCase().includes(q) || (a.description || "").toLowerCase().includes(q) || (a.tags || []).some(t => t.toLowerCase().includes(q));
      return matchType && matchQ;
    });
  }, [assets, query, typeFilter]);

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="portal-light min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton />
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">Free Assets Library</h1>
              <p className="text-sm text-slate-500">{assets.length} free assets — AI tools, templates, prompt packs, video assets, workflows & more</p>
            </div>
          </div>
          {assets.length === 0 && (
            <button onClick={seed} disabled={seeding} className="inline-flex items-center gap-2 rounded-full bg-[#00d4ff] px-5 py-2.5 text-sm font-bold text-[#0a0e14] hover:brightness-110 transition disabled:opacity-50">
              {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />} Seed Free Library
            </button>
          )}
        </div>

        {/* Stats */}
        {assets.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatCard label="Total Assets" value={assets.length} icon={Package} color="text-[#00d4ff]" />
            <StatCard label="Free / Open Source" value={assets.filter(a => a.pricing_model === 'free' || a.pricing_model === 'open_source').length} icon={CheckCircle} color="text-emerald-500" />
            <StatCard label="Installed" value={assets.filter(a => a.status === 'installed').length} icon={Download} color="text-blue-500" />
            <StatCard label="Categories" value={types.length - 1} icon={Box} color="text-purple-500" />
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-11 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00d4ff]/50 focus:ring-1 focus:ring-[#00d4ff]/30" placeholder="Search free assets..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/30">
            {types.map((t) => <option key={t} value={t}>{t === "All" ? "All Types" : t.replace(/_/g, " ")}</option>)}
          </select>
          {assets.length > 0 && (
            <button onClick={seed} disabled={seeding} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-[#00d4ff] hover:border-[#00d4ff]/40 transition disabled:opacity-50">
              {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />} Reseed
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#00d4ff]" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12"><Package className="w-12 h-12 mx-auto mb-3 text-slate-300" /><p className="text-slate-400 text-sm">No assets found. Click "Seed Free Library" to populate.</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((a) => {
              const Icon = TYPE_ICONS[a.type] || Package;
              return (
                <div key={a.id} className="rounded-2xl border border-slate-200 bg-white p-4 hover:border-slate-300 hover:shadow-md transition flex flex-col">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${TYPE_COLORS[a.type] || "bg-slate-100 text-slate-600"}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm truncate">{a.name}</h3>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0 ${a.pricing_model === 'free' ? 'bg-emerald-100 text-emerald-700' : a.pricing_model === 'open_source' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                      {PRICING_LABELS[a.pricing_model] || a.pricing_model}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-2 line-clamp-2 flex-1">{a.description}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {(a.tags || []).slice(0, 4).map((t) => <span key={t} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">{t}</span>)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">{a.asset_id} · {a.integration_type}</span>
                    <div className="flex items-center gap-1.5">
                      {a.source_url && (
                        <a href={a.source_url} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg text-slate-400 hover:text-[#00d4ff] hover:bg-slate-50 transition" title="Visit source">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button onClick={() => setSelectedAsset(a)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition" title="View details">
                        <Code className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => install(a)} disabled={installing === a.asset_id} className="inline-flex items-center gap-1.5 rounded-lg bg-[#00d4ff]/10 px-2.5 py-1.5 text-xs font-bold text-[#00d4ff] hover:bg-[#00d4ff]/20 transition disabled:opacity-50">
                        {installing === a.asset_id ? <Loader2 className="w-3 h-3 animate-spin" /> : a.status === 'installed' ? <CheckCircle className="w-3 h-3" /> : <Download className="w-3 h-3" />}
                        {a.status === 'installed' ? 'Installed' : 'Install'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Detail modal */}
        {selectedAsset && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedAsset(null)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${TYPE_COLORS[selectedAsset.type] || "bg-slate-100 text-slate-600"}`}>
                    {(() => { const Icon = TYPE_ICONS[selectedAsset.type] || Package; return <Icon className="w-5 h-5" />; })()}
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900">{selectedAsset.name}</h2>
                    <p className="text-xs text-slate-500">{selectedAsset.provider} · {selectedAsset.category}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedAsset(null)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>
              <p className="text-sm text-slate-600 mb-4">{selectedAsset.description}</p>
              {selectedAsset.capabilities && selectedAsset.capabilities.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Capabilities</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedAsset.capabilities.map((c) => <span key={c} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{c}</span>)}
                  </div>
                </div>
              )}
              {selectedAsset.install_steps && selectedAsset.install_steps.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Installation Steps</h4>
                  <ol className="space-y-1.5">
                    {selectedAsset.install_steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="w-5 h-5 rounded-full bg-[#00d4ff]/10 text-[#00d4ff] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              {selectedAsset.code_snippet && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase">Code Snippet</h4>
                    <button onClick={() => copyCode(selectedAsset.code_snippet)} className="inline-flex items-center gap-1 text-xs font-semibold text-[#00d4ff] hover:underline">
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <pre className="rounded-xl bg-slate-900 p-4 text-xs text-slate-300 overflow-x-auto max-h-48">{selectedAsset.code_snippet}</pre>
                </div>
              )}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <button onClick={() => install(selectedAsset)} disabled={installing === selectedAsset.asset_id} className="inline-flex items-center gap-2 rounded-full bg-[#00d4ff] px-5 py-2.5 text-sm font-bold text-[#0a0e14] hover:brightness-110 transition disabled:opacity-50">
                  {installing === selectedAsset.asset_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Install Asset
                </button>
                {selectedAsset.docs_url && (
                  <a href={selectedAsset.docs_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-[#00d4ff] hover:border-[#00d4ff]/40 transition">
                    <ExternalLink className="w-4 h-4" /> Docs
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-xs font-semibold text-slate-400">{label}</span>
      </div>
      <p className="text-2xl font-black text-slate-900">{value}</p>
    </div>
  );
}