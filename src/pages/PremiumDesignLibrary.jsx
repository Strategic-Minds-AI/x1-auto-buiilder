import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import VisualTemplateRender from "@/components/shared/VisualTemplateRender";
import {
  Loader2, Search, Globe, Monitor, Smartphone, Sparkles, Layout,
  Wand2, ChevronDown, Filter, X, Check
} from "lucide-react";

const CATEGORIES = [
  { key: "website", label: "Business Websites", icon: Globe, desc: "418 industry-specific designs" },
  { key: "desktop_app", label: "Desktop App Layouts", icon: Monitor, desc: "96 application patterns" },
  { key: "mobile_app", label: "Mobile App Layouts", icon: Smartphone, desc: "80 mobile patterns" },
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
    <div className="flex min-h-full">
      {/* Sidebar — categories + industry dropdown */}
      <aside className={`${sidebarOpen ? "fixed inset-0 z-50 bg-black/60" : "hidden"} lg:relative lg:block lg:bg-transparent lg:z-auto`} onClick={() => setSidebarOpen(false)}>
        <div
          className={`${sidebarOpen ? "absolute left-0 top-0 bottom-0 w-80" : ""} lg:relative lg:w-72 lg:shrink-0 bg-[#0d1117] lg:bg-[#0d1117]/60 border-r border-white/8 lg:min-h-full overflow-y-auto`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-5 sticky top-0 bg-[#0d1117] z-10 border-b border-white/8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-black text-white tracking-wide">CATEGORIES</h2>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/50 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-1.5">
              {CATEGORIES.map((c) => {
                const Icon = c.icon;
                const active = category === c.key;
                return (
                  <button
                    key={c.key}
                    onClick={() => { setCategory(c.key); setIndustryFilter("All"); setLayoutFilter("All"); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 group ${
                      active
                        ? "bg-[#00d4ff]/10 shadow-[inset_2px_0_0_#00d4ff]"
                        : "hover:bg-white/5"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition ${
                      active ? "bg-[#00d4ff] text-[#0a0e14]" : "bg-white/5 text-white/50 group-hover:text-[#00d4ff]"
                    }`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={`text-[13px] font-bold truncate ${active ? "text-[#00d4ff]" : "text-white/80"}`}>{c.label}</div>
                      <div className="text-[10px] text-white/40 truncate">{c.desc}</div>
                    </div>
                    <span className={`text-xs font-mono shrink-0 ${active ? "text-[#00d4ff]" : "text-white/30"}`}>{counts[c.key]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Industry dropdown */}
          <div className="p-5 border-b border-white/8">
            <div className="flex items-center gap-2 mb-2.5">
              <Filter className="w-3.5 h-3.5 text-white/40" />
              <span className="text-[10px] font-bold tracking-[0.15em] text-white/40 uppercase">Industry</span>
            </div>
            <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
              {industries.map((ind) => (
                <button
                  key={ind}
                  onClick={() => setIndustryFilter(ind)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[12px] font-medium transition ${
                    industryFilter === ind
                      ? "bg-[#00d4ff]/10 text-[#00d4ff]"
                      : "text-white/55 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span className="truncate text-left">{ind === "All" ? "All Industries" : ind}</span>
                  {industryFilter === ind && <Check className="w-3.5 h-3.5 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Layout filter (website only) */}
          {category === "website" && layouts.length > 1 && (
            <div className="p-5">
              <div className="flex items-center gap-2 mb-2.5">
                <Layout className="w-3.5 h-3.5 text-white/40" />
                <span className="text-[10px] font-bold tracking-[0.15em] text-white/40 uppercase">Layout</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {layouts.map((lay) => (
                  <button
                    key={lay}
                    onClick={() => setLayoutFilter(lay)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                      layoutFilter === lay
                        ? "bg-[#00d4ff] text-[#0a0e14]"
                        : "bg-white/5 text-white/50 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {lay === "All" ? "All" : lay}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Generate button */}
          <div className="p-5 sticky bottom-0 bg-[#0d1117] border-t border-white/8">
            <button
              onClick={() => generate(category)}
              disabled={generating !== null}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#0066ff] px-4 py-2.5 text-[13px] font-bold text-[#0a0e14] hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] transition disabled:opacity-50"
            >
              {generating === category ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
              ) : (
                <><Wand2 className="w-4 h-4" /> {counts[category] > 0 ? "Regenerate" : "Generate"} {activeCat?.label}</>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Main content — templates beside the sidebar */}
      <div className="flex-1 min-w-0 p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">{activeCat?.label}</h1>
              <p className="text-sm text-white/40 mt-0.5">
                {filtered.length} of {inCategory.length} templates
                {industryFilter !== "All" && ` · ${industryFilter}`}
                {layoutFilter !== "All" && ` · ${layoutFilter} layout`}
              </p>
            </div>
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm text-white/70"
            >
              <Filter className="w-4 h-4" /> Filters
            </button>
          </div>

          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              className="w-full rounded-xl bg-[#0d1117] border border-white/10 pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#00d4ff]/50 focus:ring-1 focus:ring-[#00d4ff]/30 transition"
              placeholder="Search templates, industries, design families…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Template grid */}
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-[#00d4ff]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <Globe className="w-12 h-12 mx-auto mb-4 text-white/20" />
            <p className="text-white/40 text-sm">No templates match your filters.</p>
          </div>
        ) : (
          <div className={category === "mobile_app"
            ? "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5"
            : "grid grid-cols-1 xl:grid-cols-2 gap-6"
          }>
            {filtered.map((t) => (
              <TemplateCard key={t.id} template={t} previewW={previewW} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TemplateCard({ template: t, previewW }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="rounded-2xl bg-[#0d1117] border border-white/8 overflow-hidden flex flex-col transition-all duration-200"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={hovered ? { borderColor: "rgba(0,212,255,0.4)", boxShadow: "0 0 30px rgba(0,212,255,0.08)" } : {}}
    >
      {/* Live visual rendering */}
      <div className="p-5 flex items-center justify-center bg-black/20" style={{ minHeight: t.category === "mobile_app" ? "380px" : "320px" }}>
        <VisualTemplateRender template={t} displayW={previewW} />
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
          className="mt-auto w-full inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-[12px] font-bold text-white/70 hover:bg-[#00d4ff] hover:text-[#0a0e14] hover:border-[#00d4ff] transition-all duration-150"
        >
          <Sparkles className="w-3.5 h-3.5" /> Select Template
        </button>
      </div>
    </div>
  );
}