import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Loader2, Search, ArrowRight, Sparkles } from "lucide-react";
import TemplatePreviewModal from "@/components/dd/TemplatePreviewModal";
import TemplateMiniPreview from "@/components/dd/TemplateMiniPreview";
import { HOME_TEMPLATES, INDUSTRY_LIST } from "@/data/homeTemplates";

export default function Templates({ selectedIndustry, onClearIndustry }) {
  const [dbTemplates, setDbTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => { load(); }, []);

  // When an industry is selected from the Industries section, set the active tab
  useEffect(() => {
    if (selectedIndustry) {
      setActiveTab(selectedIndustry);
      const el = document.getElementById("templates");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedIndustry]);

  const load = async () => {
    setLoading(true);
    try {
      const { items } = await base44.entities.DesignTemplate.filter(
        { category: "website" },
        { sort: "industry", limit: 60, fields: ["template_id", "name", "category", "industry", "family", "layout", "tone", "ink", "accent", "head", "sub", "eyebrow", "cta", "feature", "feature_copy", "photo"] }
      );
      setDbTemplates(items || []);
    } catch {
      setDbTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  // Merge DB templates with home templates, dedup by template_id
  const allTemplates = useMemo(() => {
    const ids = new Set();
    const merged = [];
    // Home templates first (guaranteed working images + all industries)
    for (const t of HOME_TEMPLATES) {
      if (!ids.has(t.template_id)) { ids.add(t.template_id); merged.push(t); }
    }
    // Then DB templates that have working photos (filter out all known broken patterns)
    const brokenPats = ["1f1f1f1f1f1f", "c8a1f1f1f1f1", "9b8a1f1f1f1f", "d2e9e1c1f1f", "4d2e9e1c1f1f", "1c1f1f1f1f1f", "c1f1f1f1f1f1f"];
    for (const t of dbTemplates) {
      const p = t.photo || "";
      if (!ids.has(t.template_id) && p && !brokenPats.some(pat => p.includes(pat))) {
        ids.add(t.template_id);
        merged.push(t);
      }
    }
    return merged;
  }, [dbTemplates]);

  const filtered = useMemo(() => {
    return allTemplates.filter((t) => {
      const matchesTab = activeTab === "All" || (t.industry || "").toLowerCase().includes(activeTab.toLowerCase());
      const q = query.toLowerCase();
      const matchesQuery = !q || (t.name || "").toLowerCase().includes(q) || (t.industry || "").toLowerCase().includes(q) || (t.family || "").toLowerCase().includes(q);
      return matchesTab && matchesQuery;
    });
  }, [allTemplates, activeTab, query]);

  const tabs = ["All", ...INDUSTRY_LIST];

  return (
    <section id="templates" className="py-20 lg:py-28 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-primary font-semibold tracking-[0.2em] text-xs uppercase mb-3">Website Templates</p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl">Explore Real Templates</h2>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Preview full-page website concepts, then choose the exact design you want to customize. Click any template for a full interactive preview.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
          <input
            className="w-full rounded-xl bg-card border border-border pl-11 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition"
            placeholder="Search templates by industry or style…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-10">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); if (tab === "All" && onClearIndustry) onClearIndustry(); }}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Template grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-sm">No templates match your search. Try a different industry or keyword.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((t, i) => (
              <motion.button
                key={t.id || t.template_id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
                onClick={() => setSelected(t)}
                className="group text-left rounded-2xl overflow-hidden border border-border bg-card hover:border-primary/40 transition-all duration-200 hover:shadow-[0_0_30px_rgba(0,212,255,0.08)]"
              >
                <div className="relative overflow-hidden border-b border-border">
                  <TemplateMiniPreview template={t} className="w-full" />
                  <div className="absolute top-3 left-3 rounded-full bg-background/80 backdrop-blur px-3 py-1 text-[10px] font-semibold text-primary tracking-wide z-10">
                    {t.industry}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-background/50 z-20">
                    <span className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground inline-flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> Full Preview
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-foreground">{t.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {t.head || t.family || "Premium website template"}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      {["tone", "ink", "accent"].map((k) => t[k] && (
                        <div key={k} className="w-5 h-5 rounded border border-border" style={{ background: t[k] }} />
                      ))}
                    </div>
                    {t.layout && (
                      <span className="text-[10px] text-muted-foreground/60 font-mono ml-1">{t.layout}</span>
                    )}
                    <span className="ml-auto text-xs font-semibold text-primary inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                      View <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && <TemplatePreviewModal template={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </section>
  );
}