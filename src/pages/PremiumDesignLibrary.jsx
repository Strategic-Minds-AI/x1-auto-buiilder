import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/shared/PageHeader";
import VisualTemplateRender from "@/components/shared/VisualTemplateRender";
import { Loader2, Search, Globe, Monitor, Smartphone, Sparkles } from "lucide-react";

const CATEGORIES = [
  { key: "website", label: "Business Websites", icon: Globe, desc: "Art-directed premium designs across every industry" },
  { key: "desktop_app", label: "Desktop App Layouts", icon: Monitor, desc: "32 application layout patterns for SaaS and tools" },
  { key: "mobile_app", label: "Mobile App Layouts", icon: Smartphone, desc: "25 mobile-first layout patterns for native apps" },
];

export default function PremiumDesignLibrary() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("website");
  const [industryFilter, setIndustryFilter] = useState("All");
  const [query, setQuery] = useState("");

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { items } = await base44.entities.DesignTemplate.filter({}, { sort: "category", limit: 200 });
      setTemplates(items || []);
    } catch { setTemplates([]); }
    finally { setLoading(false); }
  };

  const inCategory = templates.filter((t) => t.category === category);
  const industries = ["All", ...Array.from(new Set(inCategory.map((t) => t.industry))).sort()];
  const filtered = inCategory.filter((t) => {
    const matchesIndustry = industryFilter === "All" || t.industry === industryFilter;
    const q = query.toLowerCase();
    const matchesQuery = !q || (t.name || "").toLowerCase().includes(q) || (t.industry || "").toLowerCase().includes(q) || (t.family || "").toLowerCase().includes(q);
    return matchesIndustry && matchesQuery;
  });

  const previewW = category === "mobile_app" ? 180 : 260;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageHeader title="Design Template Library" subtitle="Every template rendered as a live visual preview of exactly what it looks like" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Category selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            const count = templates.filter((t) => t.category === c.key).length;
            return (
              <button
                key={c.key}
                onClick={() => { setCategory(c.key); setIndustryFilter("All"); }}
                className={`rounded-2xl border p-4 text-left transition ${category === c.key ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/40"}`}
              >
                <div className="flex items-center gap-3 mb-1">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${category === c.key ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-lg font-bold">{count}</span>
                </div>
                <div className="text-sm font-bold">{c.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{c.desc}</div>
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input className="dd-input pl-10" placeholder="Search by name, industry, or design family…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          {industries.length > 1 && (
            <div className="flex flex-wrap gap-1.5">
              {industries.map((ind) => (
                <button
                  key={ind}
                  onClick={() => setIndustryFilter(ind)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${industryFilter === ind ? "border border-primary bg-primary/10 text-foreground" : "border border-border text-muted-foreground hover:text-foreground"}`}
                >
                  {ind}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Template grid — every card gets a real visual rendering */}
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">No templates found.</div>
        ) : (
          <div className={category === "mobile_app"
            ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
            : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
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
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden group hover:border-primary/40 transition flex flex-col">
      {/* Live visual rendering — shows exactly what this template looks like */}
      <div className="p-3 flex items-center justify-center bg-secondary/30" style={{ minHeight: categoryMinHeight(t) }}>
        <VisualTemplateRender template={t} displayW={previewW} />
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-sm truncate">{t.name}</h3>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground shrink-0 font-mono">{t.template_id}</span>
        </div>
        <p className="text-xs text-muted-foreground mb-1">{t.industry}</p>
        <p className="text-[11px] text-muted-foreground/70 mb-3 line-clamp-1">{t.family}</p>

        {/* Color tokens */}
        <div className="flex gap-1.5 mb-3">
          {["tone", "ink", "accent"].map((k) => t[k] && (
            <div key={k} className="flex items-center gap-1">
              <div className="w-5 h-5 rounded border border-border" style={{ background: t[k] }} />
            </div>
          ))}
          <span className="text-[9px] font-mono text-muted-foreground ml-1">{t.accent}</span>
        </div>

        <button className="mt-auto w-full inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary transition">
          <Sparkles className="w-3.5 h-3.5" /> Select template
        </button>
      </div>
    </div>
  );
}

function categoryMinHeight(t) {
  if (t.category === "mobile_app") return "320px";
  if (t.category === "website") return "200px";
  return "200px";
}