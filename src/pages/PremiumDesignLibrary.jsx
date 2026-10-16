import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import VisualTemplateRender from "@/components/shared/VisualTemplateRender";
import TemplateViewer from "@/components/shared/TemplateViewer";
import {
  Loader2, Search, Globe, Monitor, Smartphone, Sparkles, Layout,
  Wand2, ChevronDown, Filter, X, Check, Maximize2
} from "lucide-react";
import BackButton from "@/components/shared/BackButton";

const CATEGORIES = [
  { key: "website", label: "Business Websites", icon: Globe, desc: "435 industry-specific designs" },
  { key: "desktop_app", label: "Desktop App Layouts", icon: Monitor, desc: "300 application patterns" },
  { key: "mobile_app", label: "Mobile App Layouts", icon: Smartphone, desc: "300 mobile patterns" },
];

export default function PremiumDesignLibrary() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("website");
  const [industryFilter, setIndustryFilter] = useState("All");
  const [layoutFilter, setLayoutFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [generating, setGenerating] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewerTemplate, setViewerTemplate] = useState(null);

  useEffect(() => { load(); }, []);

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

  const load = async () => {
    setLoading(true);
    try {
      const { items } = await base44.entities.DesignTemplate.filter({}, { sort: "category", limit: 500 });
      setTemplates(items || []);
    } catch { setTemplates([]); }
    finally { setLoading(false); }
  };

  const inCategory = useMemo(
    () => templates.filter((t) => t.category === category),
    [templates, category]
  );

  const industries = useMemo(
    () => ["All", ...Array.from(new Set(inCategory.map((t) => t.industry))).sort()],
    [inCategory]
  );
  const layouts = useMemo(
    () => ["All", ...Array.from(new Set(inCategory.map((t) => t.layout).filter(Boolean))).sort()],
    [inCategory]
  );

  const filtered = useMemo(() => {
    return inCategory.filter((t) => {
      const matchesIndustry = industryFilter === "All" || t.industry === industryFilter;
      const matchesLayout = layoutFilter === "All" || t.layout === layoutFilter;
      const q = query.toLowerCase();
      const matchesQuery = !q ||
        (t.name || "").toLowerCase().includes(q) ||
        (t.industry || "").toLowerCase().includes(q) ||
        (t.family || "").toLowerCase().includes(q);
      return matchesIndustry && matchesLayout && matchesQuery;
    });
  }, [inCategory, industryFilter, layoutFilter, query]);

  const counts = useMemo(() => {
    const c = { website: 0, desktop_app: 0, mobile_app: 0 };
    templates.forEach((t) => { if (c[t.category] !== undefined) c[t.category]++; });
    return c;
  }, [templates]);

  const activeCat = CATEGORIES.find((c) => c.key === category);
  const previewW = category === "mobile_app" ? 260 : 440;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{activeCat?.label}</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {filtered.length} of {inCategory.length} templates
              {industryFilter !== "All" && ` · ${industryFilter}`}
              {layoutFilter !== "All" && ` · ${layoutFilter} layout`}
            </p>
          </div>
          <button
            onClick={() => generate(category)}
            disabled={generating !== null}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#0066ff] px-4 py-2.5 text-[13px] font-bold text-[#0a0e14] hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] transition disabled:opacity-50"
          >
            {generating === category ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
            ) : (
              <><Wand2 className="w-4 h-4" /> {counts[category] > 0 ? "Regenerate" : "Generate"} {activeCat?.label}</>
            )}
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            const active = category === c.key;
            return (
              <button
                key={c.key}
                onClick={() => { setCategory(c.key); setIndustryFilter("All"); setLayoutFilter("All"); }}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active ? "bg-[#00d4ff] text-[#0a0e14]" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                {c.label}
                <span className={`text-xs font-mono ${active ? "text-[#0a0e14]/60" : "text-slate-400"}`}>{counts[c.key]}</span>
              </button>
            );
          })}
        </div>

        {/* Search + filters row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-11 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00d4ff]/50 focus:ring-1 focus:ring-[#00d4ff]/30 transition"
              placeholder="Search templates, industries, design families…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-[#00d4ff]/50 transition"
          >
            {industries.map((ind) => (
              <option key={ind} value={ind}>{ind === "All" ? "All Industries" : ind}</option>
            ))}
          </select>
          {category === "website" && layouts.length > 1 && (
            <select
              value={layoutFilter}
              onChange={(e) => setLayoutFilter(e.target.value)}
              className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-[#00d4ff]/50 transition"
            >
              {layouts.map((lay) => (
                <option key={lay} value={lay}>{lay === "All" ? "All Layouts" : lay}</option>
              ))}
            </select>
          )}
        </div>
      </div>

        {/* Template grid */}
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-[#00d4ff]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <Globe className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-500 text-sm">No templates match your filters.</p>
          </div>
        ) : (
          <div className={category === "mobile_app"
            ? "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5"
            : "grid grid-cols-1 xl:grid-cols-2 gap-6"
          }>
            {filtered.map((t) => (
              <TemplateCard key={t.id} template={t} previewW={previewW} onOpen={() => setViewerTemplate(t)} />
            ))}
          </div>
        )}
      {viewerTemplate && (
        <TemplateViewer template={viewerTemplate} onClose={() => setViewerTemplate(null)} onSelect={() => setViewerTemplate(null)} />
      )}
    </div>
  );
}

function TemplateCard({ template: t, previewW, onOpen }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="rounded-2xl bg-[#0d1117] border border-white/8 overflow-hidden flex flex-col transition-all duration-200 cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onOpen}
      style={hovered ? { borderColor: "rgba(0,212,255,0.4)", boxShadow: "0 0 30px rgba(0,212,255,0.08)" } : {}}
    >
      {/* Live visual rendering */}
      <div className="relative p-5 flex items-center justify-center bg-black/20" style={{ minHeight: t.category === "mobile_app" ? "380px" : "320px" }}>
        <VisualTemplateRender template={t} displayW={previewW} />
        {hovered && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-t-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#00d4ff] px-4 py-2 text-xs font-bold text-[#0a0e14]">
              <Maximize2 className="w-3.5 h-3.5" /> Open Fullscreen
            </span>
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="p-4 flex flex-col flex-1 border-t border-white/8">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-[14px] text-white truncate">{t.name}</h3>
          <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] text-white/40 shrink-0 font-mono">{t.template_id}</span>
        </div>
        <div className="flex items-center gap-2 mb-2.5">
          <span className="text-[11px] text-white/50">{t.industry}</span>
          {t.layout && (
            <span className="rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/20 px-2 py-0.5 text-[10px] font-semibold text-[#00d4ff]">
              {t.layout}
            </span>
          )}
        </div>
        <p className="text-[11px] text-white/35 mb-3 line-clamp-1">{t.head}</p>

        {/* Color tokens */}
        <div className="flex items-center gap-2 mb-3">
          {["tone", "ink", "accent"].map((k) => t[k] && (
            <div key={k} className="w-6 h-6 rounded-lg border border-white/10" style={{ background: t[k] }} />
          ))}
          <span className="text-[9px] font-mono text-white/30 ml-1">{t.accent}</span>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onOpen(); }}
          className="mt-auto w-full inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-[12px] font-bold text-white/70 hover:bg-[#00d4ff] hover:text-[#0a0e14] hover:border-[#00d4ff] transition-all duration-150"
        >
          <Sparkles className="w-3.5 h-3.5" /> Select Template
        </button>
      </div>
    </div>
  );
}