import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import VisualTemplateRender from "@/components/shared/VisualTemplateRender";
import { Loader2, Package, Search, Globe } from "lucide-react";
import BackButton from "@/components/shared/BackButton";

export default function WebPackLibrary() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState("All");

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { items } = await base44.entities.DesignTemplate.filter(
        { category: "website" },
        { sort: "industry", limit: 500, fields: ["template_id", "name", "industry", "family", "layout", "tone", "ink", "accent", "head", "sub", "eyebrow", "cta", "photo"] }
      );
      setTemplates(items || []);
    } catch { setTemplates([]); }
    finally { setLoading(false); }
  };

  const industries = ["All", ...Array.from(new Set(templates.map((t) => t.industry))).sort()];
  const filtered = templates.filter((t) => {
    const matchesIndustry = industry === "All" || t.industry === industry;
    const q = query.toLowerCase();
    const matchesQuery = !q || (t.name || "").toLowerCase().includes(q) || (t.industry || "").toLowerCase().includes(q);
    return matchesIndustry && matchesQuery;
  });

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-[#00d4ff]" /></div>;
  }

  return (
    <div className="p-6 lg:p-8">
      <BackButton />
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#00d4ff]/10 flex items-center justify-center">
            <Package className="w-5 h-5 text-[#00d4ff]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Web Pack Library</h1>
            <p className="text-sm text-slate-500">{templates.length} complete website design packs — layout, copy, colors, and imagery</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-4">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-11 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00d4ff]/50 transition"
              placeholder="Search packs…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#00d4ff]/50 transition"
          >
            {industries.map((ind) => <option key={ind} value={ind} className="bg-white">{ind === "All" ? "All Industries" : ind}</option>)}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-24">
          <Globe className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <p className="text-slate-500 text-sm">No web packs found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((t) => (
            <div key={t.id} className="rounded-2xl bg-[#0d1117] border border-white/8 overflow-hidden group hover:border-[#00d4ff]/30 transition-all duration-200">
              <div className="p-4 flex items-center justify-center bg-black/20" style={{ minHeight: "280px" }}>
                <VisualTemplateRender template={t} displayW={400} />
              </div>
              <div className="p-4 border-t border-white/8">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-bold text-[14px] text-white truncate">{t.name}</h3>
                  <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] text-white/40 shrink-0 font-mono">{t.template_id}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] text-white/50">{t.industry}</span>
                  {t.layout && <span className="rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/20 px-2 py-0.5 text-[10px] font-semibold text-[#00d4ff]">{t.layout}</span>}
                </div>
                <div className="flex gap-1.5">
                  {["tone", "ink", "accent"].map((k) => t[k] && <div key={k} className="w-5 h-5 rounded border border-white/10" style={{ background: t[k] }} />)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}