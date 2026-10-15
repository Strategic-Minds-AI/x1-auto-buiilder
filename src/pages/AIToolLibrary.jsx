import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import BackButton from "@/components/shared/BackButton";
import { Loader2, Search, Wand2, Package, ExternalLink, Tag } from "lucide-react";

export default function AIToolLibrary() {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { items } = await base44.entities.AITool.filter({}, { sort: "category", limit: 500, fields: ["tool_id", "name", "category", "description", "provider", "capabilities", "integration_type", "pricing_model", "use_cases", "website_url", "popularity_score"] });
      setTools(items || []);
    } catch { setTools([]); }
    finally { setLoading(false); }
  };

  const seed = async () => {
    setSeeding(true);
    try { await base44.functions.invoke("seedLibraries", { library: "tools" }); await load(); }
    catch (e) { alert("Seed failed: " + (e.message || "unknown")); }
    finally { setSeeding(false); }
  };

  const categories = useMemo(() => ["All", ...Array.from(new Set(tools.map((t) => t.category))).sort()], [tools]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return tools.filter((t) => {
      const matchCat = category === "All" || t.category === category;
      const matchQ = !q || (t.name || "").toLowerCase().includes(q) || (t.description || "").toLowerCase().includes(q) || (t.provider || "").toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [tools, query, category]);

  return (
    <div className="portal-light min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton />
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">AI Tool Library</h1>
              <p className="text-sm text-slate-500">{tools.length} tools across {categories.length - 1} categories — integrable into any system</p>
            </div>
          </div>
          {tools.length === 0 && (
            <button onClick={seed} disabled={seeding} className="inline-flex items-center gap-2 rounded-full bg-[#00d4ff] px-5 py-2.5 text-sm font-bold text-[#0a0e14] hover:brightness-110 transition disabled:opacity-50">
              {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />} Seed 300 Tools
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-11 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00d4ff]/50 focus:ring-1 focus:ring-[#00d4ff]/30 transition" placeholder="Search tools..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/30">
            {categories.map((c) => <option key={c} value={c}>{c === "All" ? "All Categories" : c.replace(/_/g, " ")}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#00d4ff]" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12"><Package className="w-12 h-12 mx-auto mb-3 text-slate-300" /><p className="text-slate-400 text-sm">No tools found.</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.slice(0, 60).map((t) => (
              <div key={t.id} className="rounded-2xl border border-slate-200 bg-white p-4 hover:border-slate-300 transition">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-slate-900 text-sm">{t.name}</h3>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-slate-500 shrink-0">{t.tool_id}</span>
                </div>
                <p className="text-xs text-slate-500 mb-3 line-clamp-2">{t.description}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {(t.capabilities || []).slice(0, 3).map((cap, i) => (
                    <span key={i} className="rounded-full bg-[#00d4ff]/10 px-2 py-0.5 text-[10px] font-medium text-[#00d4ff]">{cap}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {t.integration_type} · {t.pricing_model}</span>
                  {t.website_url && <a href={t.website_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 text-[#00d4ff] hover:underline"><ExternalLink className="w-3 h-3" /> Visit</a>}
                </div>
              </div>
            ))}
          </div>
        )}
        {filtered.length > 60 && <p className="text-center text-sm text-slate-400 mt-4">Showing first 60 of {filtered.length} tools — refine your search to see more</p>}
      </div>
    </div>
  );
}