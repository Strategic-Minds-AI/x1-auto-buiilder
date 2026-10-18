import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AutoStepShell from "@/components/autobuilder/AutoStepShell";
import VisualTemplateRender from "@/components/shared/VisualTemplateRender";
import { Loader2, Check, Sparkles, Star } from "lucide-react";

export default function TemplateStep({ accent, vision, strategy, onApprove }) {
  const [templates, setTemplates] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suggesting, setSuggesting] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showAll, setShowAll] = useState(false);

  // Extract industry from vision/strategy for template suggestions
  const industry = vision?.industryLabel || vision?.industryProfile?.label || vision?.industry || strategy?.industry || vision?.type || "";

  useEffect(() => {
    (async () => {
      try {
        const { items } = await base44.entities.DesignTemplate.filter(
          { category: "website" },
          { sort: "industry", limit: 12, fields: ["template_id", "name", "category", "industry", "family", "layout", "tone", "ink", "accent", "head", "sub", "eyebrow", "cta"] }
        );
        setTemplates(items || []);
      } catch { setTemplates([]); }
      finally { setLoading(false); }
    })();
  }, []);

  // Fetch AI-powered template suggestions based on research
  useEffect(() => {
    if (!industry) return;
    (async () => {
      setSuggesting(true);
      try {
        const res = await base44.functions.invoke("suggestTemplates", {
          industry,
          businessResearch: vision?.businessResearch || strategy?.businessResearch,
          benchmark: vision?.benchmark || strategy?.benchmark,
          goal: strategy?.goal || vision?.goal,
        });
        setSuggestions(res.data?.suggestions || []);
      } catch { setSuggestions([]); }
      finally { setSuggesting(false); }
    })();
  }, [industry]);

  const handleApprove = () => {
    if (selected) onApprove({ template: selected });
  };

  const displayTemplates = showAll ? templates : (suggestions.length > 0 ? suggestions : templates);

  return (
    <AutoStepShell
      step={6}
      accent={accent}
      title="Design Template"
      subtitle={suggestions.length > 0 ? "AI-recommended layouts based on your business research — top picks first" : "Pick a layout structure for your website."}
      onApprove={handleApprove}
      approveLabel="Select Template"
      canApprove={!!selected}
    >
      {/* AI Suggestions badge */}
      {suggestions.length > 0 && !showAll && (
        <div className="flex items-center justify-between mb-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#00d4ff]/10 px-3 py-1 text-xs font-bold text-[#00d4ff]">
            <Sparkles className="w-3.5 h-3.5" /> AI-Ranked for {industry}
          </div>
          <button onClick={() => setShowAll(true)} className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition">
            Browse all templates →
          </button>
        </div>
      )}
      {showAll && (
        <button onClick={() => setShowAll(false)} className="text-xs font-semibold text-[#00d4ff] hover:underline mb-3">
          ← Back to AI recommendations
        </button>
      )}

      {(loading || suggesting) ? (
        <div className="flex flex-col items-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400 mb-2" />
          <p className="text-xs text-slate-400">{suggesting ? "AI ranking templates for your industry…" : "Loading templates…"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {displayTemplates.map((t, i) => (
            <button
              key={t.id || t.template_id}
              onClick={() => setSelected(t)}
              className={`rounded-xl border-2 overflow-hidden text-left transition relative ${
                selected?.id === t.id || selected?.template_id === t.template_id ? "border-slate-900" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              {/* AI rank badge */}
              {suggestions.length > 0 && !showAll && t.rank && (
                <div className="absolute top-2 right-2 z-10 inline-flex items-center gap-0.5 rounded-full bg-[#00d4ff] px-2 py-0.5 text-[10px] font-bold text-[#0a0e14]">
                  <Star className="w-2.5 h-2.5" /> #{t.rank}
                </div>
              )}
              <div className="h-32 bg-slate-50 flex items-center justify-center overflow-hidden">
                <VisualTemplateRender template={t} displayW={140} />
              </div>
              <div className="p-2.5">
                <div className="text-xs font-bold text-slate-800 truncate">{t.name}</div>
                <div className="text-[10px] text-slate-400">{t.industry} · {t.layout}</div>
                {t.reason && <div className="text-[10px] text-[#00d4ff] mt-1 line-clamp-2">{t.reason}</div>}
              </div>
              {selected?.id === t.id && (
                <div className="px-2.5 pb-2.5"><Check className="w-4 h-4 text-slate-900" /></div>
              )}
            </button>
          ))}
        </div>
      )}
    </AutoStepShell>
  );
}