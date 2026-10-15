import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import VisualTemplateRender from "@/components/shared/VisualTemplateRender";
import { Loader2, Monitor, Search, CheckCircle2 } from "lucide-react";
import BackButton from "@/components/shared/BackButton";

export default function AppPackLibrary({ onSelect, selectedId: extSelectedId }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("desktop_app");
  const [selectedId, setSelectedId] = useState(extSelectedId || null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { items } = await base44.entities.DesignTemplate.filter(
        { category: { $in: ["desktop_app", "mobile_app"] } },
        { sort: "category", limit: 500, fields: ["template_id", "name", "category", "industry", "family", "layout", "tone", "ink", "accent", "head", "sub", "eyebrow", "cta"] }
      );
      setTemplates(items || []);
    } catch { setTemplates([]); }
    finally { setLoading(false); }
  };

  const filtered = templates.filter((t) => {
    const matchesCat = t.category === category;
    const q = query.toLowerCase();
    const matchesQuery = !q || (t.name || "").toLowerCase().includes(q) || (t.industry || "").toLowerCase().includes(q) || (t.family || "").toLowerCase().includes(q);
    return matchesCat && matchesQuery;
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
            <Monitor className="w-5 h-5 text-[#00d4ff]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">App Pack Library</h1>
            <p className="text-sm text-slate-500">Desktop and mobile application layout patterns</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-4">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-11 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00d4ff]/50 transition"
              placeholder="Search app packs…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => setCategory("desktop_app")}
              className={`rounded-full px-4 py-2 text-[13px] font-bold transition ${category === "desktop_app" ? "bg-[#00d4ff] text-[#0a0e14]" : "bg-slate-100 text-slate-500 hover:text-slate-900"}`}
            >
              Desktop
            </button>
            <button
              onClick={() => setCategory("mobile_app")}
              className={`rounded-full px-4 py-2 text-[13px] font-bold transition ${category === "mobile_app" ? "bg-[#00d4ff] text-[#0a0e14]" : "bg-slate-100 text-slate-500 hover:text-slate-900"}`}
            >
              Mobile
            </button>
          </div>
        </div>
      </div>

      <div className="text-sm text-slate-500 mb-4">{filtered.length} {category === "desktop_app" ? "desktop" : "mobile"} app packs</div>

      {filtered.length === 0 ? (
        <div className="text-center py-24">
          <Monitor className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <p className="text-slate-500 text-sm">No app packs found. Generate templates to populate this library.</p>
        </div>
      ) : (
        <div className={category === "mobile_app" ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"}>
          {filtered.map((t) => (
            <div key={t.id} className={`rounded-2xl bg-[#0d1117] border-2 overflow-hidden group transition-all duration-200 ${selectedId === t.id ? "border-[#00d4ff] shadow-[0_0_20px_rgba(0,212,255,0.2)]" : "border-white/8 hover:border-[#00d4ff]/30"}`}>
              <div className="p-4 flex items-center justify-center bg-black/20" style={{ minHeight: category === "mobile_app" ? "360px" : "280px" }}>
                <VisualTemplateRender template={t} displayW={category === "mobile_app" ? 240 : 380} />
              </div>
              <div className="p-3 border-t border-white/8">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-bold text-[13px] text-white truncate">{t.name}</h3>
                  <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] text-white/40 shrink-0 font-mono">{t.template_id}</span>
                </div>
                <div className="text-[11px] text-white/40 truncate">{t.family || t.industry}</div>
                <div className="flex gap-1.5 mt-2 mb-2">
                  {["tone", "ink", "accent"].map((k) => t[k] && <div key={k} className="w-5 h-5 rounded border border-white/10" style={{ background: t[k] }} />)}
                </div>
                <button
                  onClick={() => {
                    setSelectedId(selectedId === t.id ? null : t.id);
                    if (onSelect) onSelect({ type: "apppack", template: t, id: t.id });
                  }}
                  className={`w-full rounded-lg px-3 py-2 text-xs font-bold transition ${
                    selectedId === t.id
                      ? "bg-[#00d4ff] text-[#0a0e14]"
                      : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {selectedId === t.id ? "✓ Selected" : "Select Pack"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}