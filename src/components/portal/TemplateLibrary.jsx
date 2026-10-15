import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Library, ExternalLink, ChevronDown, Search, RefreshCw } from "lucide-react";

const sections = [
  { key: "style_analysis", label: "Style", fields: ["colorPalette", "typography", "imagery", "tone"] },
  { key: "layout_analysis", label: "Layout", fields: ["heroPattern", "sectionOrder", "navigation", "conversionElements", "mobileApproach"] },
  { key: "seo_analysis", label: "SEO", fields: ["titleMetaStrategy", "headingStructure", "contentDepth", "internalLinking", "technicalSignals"] },
  { key: "aeo_analysis", label: "AEO", fields: ["faqPresence", "schemaMarkup", "directAnswerContent", "aiOverviewReadiness", "questionTargeting"] },
  { key: "geo_analysis", label: "GEO", fields: ["localSeoSignals", "googleBusinessProfile", "locationPages", "citations", "reviewStrategy"] },
];

// Extract hex colors from the colorPalette text to render a visual style strip.
function extractHexColors(text) {
  if (!text) return [];
  const matches = text.match(/#([0-9a-fA-F]{3,6})/g);
  if (matches && matches.length > 0) return matches.slice(0, 5);
  return [];
}

export default function TemplateLibrary() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);
  const [filter, setFilter] = useState("All");

  const load = async () => {
    setLoading(true);
    try {
      const res = await base44.entities.Template.filter({}, { sort: "-overall_score", limit: 100 });
      setTemplates(res.items || []);
    } catch (e) {
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const industries = ["All", ...Array.from(new Set(templates.map((t) => t.industry)))];
  const shown = filter === "All" ? templates : templates.filter((t) => t.industry === filter);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl flex items-center gap-2">
            <Library className="w-6 h-6 text-primary" /> Template Library Studio
          </h2>
          <p className="text-muted-foreground mt-1">
            Top-rated industry sites analyzed across style, layout, SEO, AEO & GEO — use as design guidance for new builds.
          </p>
        </div>
        <button onClick={load} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-secondary transition">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {industries.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {industries.map((ind) => (
            <button
              key={ind}
              onClick={() => setFilter(ind)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                filter === ind ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {ind}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : shown.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No templates yet. Run the onboarding wizard to analyze top industry sites and build your library.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((t) => {
            const colors = extractHexColors(t.style_analysis?.colorPalette);
            const isOpen = openId === t.id;
            return (
              <div key={t.id} className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col">
                {/* Visual style preview header */}
                <button onClick={() => setOpenId(isOpen ? null : t.id)} className="text-left">
                  <div className="relative h-28 overflow-hidden">
                    {colors.length > 0 ? (
                      <div className="flex h-full">
                        {colors.map((c, i) => (
                          <div key={i} className="flex-1" style={{ background: c }} />
                        ))}
                      </div>
                    ) : (
                      <div className="h-full bg-gradient-to-br from-primary/30 via-accent/20 to-secondary" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                    <div className="absolute top-3 left-3 w-7 h-7 rounded-lg bg-primary/20 text-primary flex items-center justify-center text-xs font-bold backdrop-blur-sm">
                      {t.rank || "#"}
                    </div>
                    <div className="absolute top-3 right-3 rounded-full bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-1 backdrop-blur-sm">
                      {Math.round(t.overall_score || 0)}/100
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="font-semibold text-foreground truncate">{t.site_name}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      {t.industry}
                      {t.source_url && (
                        <a href={t.source_url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-0.5 hover:text-primary">
                          <ExternalLink className="w-3 h-3" /> source
                        </a>
                      )}
                    </div>
                  </div>
                </button>

                {/* Color chips */}
                {colors.length > 0 && (
                  <div className="px-4 pb-3 flex gap-1.5">
                    {colors.map((c, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded border border-border" style={{ background: c }} />
                        <span className="text-[9px] font-mono text-muted-foreground">{c}</span>
                      </div>
                    ))}
                  </div>
                )}

                {isOpen && (
                  <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                    {t.design_direction?.summary && (
                      <div className="rounded-xl bg-secondary/40 p-3 text-sm">
                        <span className="text-primary font-semibold">Design direction: </span>
                        {t.design_direction.summary}
                      </div>
                    )}
                    {sections.map((sec) => {
                      const data = t[sec.key] || {};
                      const hasContent = sec.fields.some((f) => data[f]);
                      if (!hasContent) return null;
                      return (
                        <div key={sec.key}>
                          <div className="text-xs font-bold text-primary uppercase tracking-wide mb-1.5">{sec.label}</div>
                          <div className="space-y-1">
                            {sec.fields.map((f) =>
                              data[f] ? (
                                <div key={f} className="text-xs flex gap-2">
                                  <span className="text-muted-foreground min-w-[130px] capitalize">
                                    {f.replace(/([A-Z])/g, " $1").toLowerCase()}:
                                  </span>
                                  <span className="text-foreground">
                                    {Array.isArray(data[f]) ? data[f].join(" → ") : data[f]}
                                  </span>
                                </div>
                              ) : null
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {t.design_direction?.recommendedForCloning && (
                      <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 text-sm">
                        <span className="text-primary font-semibold">Patterns to adopt: </span>
                        {t.design_direction.recommendedForCloning}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}