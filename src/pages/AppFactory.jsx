import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import VisualTemplateRender from "@/components/shared/VisualTemplateRender";
import TemplateViewer from "@/components/shared/TemplateViewer";
import { Loader2, Monitor, Smartphone, Wand2, Search, Sparkles, Maximize2, Package } from "lucide-react";

const APP_CATEGORIES = [
  { key: "desktop_app", label: "Desktop Apps", icon: Monitor, desc: "96 application layouts" },
  { key: "mobile_app", label: "Mobile Apps", icon: Smartphone, desc: "80 mobile patterns" },
];

export default function AppFactory() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("desktop_app");
  const [query, setQuery] = useState("");
  const [generating, setGenerating] = useState(null);
  const [viewerTemplate, setViewerTemplate] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { items } = await base44.entities.DesignTemplate.filter(
        { category: { $in: ["desktop_app", "mobile_app"] } },
        { sort: "category", limit: 500 }
      );
      setTemplates(items || []);
    } catch { setTemplates([]); }
    finally { setLoading(false); }
  };

  const generate = async (cat) => {
    setGenerating(cat);
    try {
      await base44.functions.invoke("generateDesignTemplates", { category: cat });
      await load();
    } catch (e) {
      alert("Generation failed: " + (e.message || "unknown error"));
    } finally {
      setGenerating(null);
    }
  };

  const inCategory = useMemo(
    () => templates.filter((t) => t.category === category),
    [templates, category]
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return inCategory.filter((t) =>
      !q || (t.name || "").toLowerCase().includes(q) || (t.industry || "").toLowerCase().includes(q) || (t.family || "").toLowerCase().includes(q)
    );
  }, [inCategory, query]);

  const counts = useMemo(() => {
    const c = { desktop_app: 0, mobile_app: 0 };
    templates.forEach((t) => { if (c[t.category] !== undefined) c[t.category]++; });
    return c;
  }, [templates]);

  const activeCat = APP_CATEGORIES.find((c) => c.key === category);
  const previewW = category === "mobile_app" ? 260 : 440;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center">
            <Package className="w-5 h-5 text-[#0a0e14]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">App Factory</h1>
            <p className="text-sm text-slate-500">Desktop & mobile application layout templates — {counts.desktop_app + counts.mobile_app} patterns</p>
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex items-center gap-3 mb-6">
        {APP_CATEGORIES.map((c) => {
          const Icon = c.icon;
          const active = category === c.key;
          return (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={`inline-flex items-center gap-2.5 rounded-xl px-5 py-3 text-sm font-bold transition-all ${
                active
                  ? "bg-[#00d4ff] text-[#0a0e14] shadow-[0_0_20px_rgba(0,212,255,0.2)]"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              {c.label}
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-mono ${active ? "bg-[#0a0e14]/15" : "bg-slate-200"}`}>{counts[c.key]}</span>
            </button>
          );
        })}
        <div className="flex-1" />
        <button
          onClick={() => generate(category)}
          disabled={generating !== null}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800 transition disabled:opacity-50"
        >
          {generating === category ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
          {counts[category] > 0 ? "Regenerate" : "Generate"} {activeCat?.label}
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-11 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00d4ff]/50 focus:ring-1 focus:ring-[#00d4ff]/30 transition"
          placeholder="Search app templates, industries, design families…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-[#00d4ff]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24">
          <Package className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <p className="text-slate-500 text-sm mb-4">No {activeCat?.label.toLowerCase()} templates yet.</p>
          <button
            onClick={() => generate(category)}
            disabled={generating !== null}
            className="inline-flex items-center gap-2 rounded-full bg-[#00d4ff] px-5 py-2.5 text-sm font-bold text-[#0a0e14] hover:brightness-110 transition"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />} Generate Now
          </button>
        </div>
      ) : (
        <div className={category === "mobile_app"
          ? "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5"
          : "grid grid-cols-1 xl:grid-cols-2 gap-6"
        }>
          {filtered.map((t) => (
            <AppTemplateCard key={t.id} template={t} previewW={previewW} onOpen={() => setViewerTemplate(t)} />
          ))}
        </div>
      )}

      {viewerTemplate && (
        <TemplateViewer template={viewerTemplate} onClose={() => setViewerTemplate(null)} onSelect={() => setViewerTemplate(null)} />
      )}
    </div>
  );
}

function AppTemplateCard({ template: t, previewW, onOpen }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="rounded-2xl bg-white border border-slate-200 overflow-hidden flex flex-col transition-all duration-200 cursor-pointer hover:border-[#00d4ff]/30 hover:shadow-[0_0_20px_rgba(0,212,255,0.05)]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onOpen}
    >
      <div className="relative p-5 flex items-center justify-center bg-slate-50" style={{ minHeight: t.category === "mobile_app" ? "380px" : "320px" }}>
        <VisualTemplateRender template={t} displayW={previewW} />
        {hovered && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#00d4ff] px-4 py-2 text-xs font-bold text-[#0a0e14]">
              <Maximize2 className="w-3.5 h-3.5" /> Open Fullscreen
            </span>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1 border-t border-slate-100">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-[14px] text-slate-900 truncate">{t.name}</h3>
          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-400 shrink-0 font-mono">{t.template_id}</span>
        </div>
        <div className="flex items-center gap-2 mb-2.5">
          <span className="text-[11px] text-slate-500">{t.industry}</span>
          {t.layout && (
            <span className="rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/20 px-2 py-0.5 text-[10px] font-semibold text-[#00d4ff]">{t.layout}</span>
          )}
        </div>
        <p className="text-[11px] text-slate-400 mb-3 line-clamp-1">{t.head}</p>
        <div className="flex items-center gap-2 mb-3">
          {["tone", "ink", "accent"].map((k) => t[k] && (
            <div key={k} className="w-6 h-6 rounded-lg border border-slate-200" style={{ background: t[k] }} />
          ))}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onOpen(); }}
          className="mt-auto w-full inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-[12px] font-bold text-slate-600 hover:bg-[#00d4ff] hover:text-[#0a0e14] hover:border-[#00d4ff] transition-all duration-150"
        >
          <Sparkles className="w-3.5 h-3.5" /> Select Template
        </button>
      </div>
    </div>
  );
}