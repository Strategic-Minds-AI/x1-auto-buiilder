import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AutoStepShell from "@/components/autobuilder/AutoStepShell";
import VisualTemplateRender from "@/components/shared/VisualTemplateRender";
import { Loader2, Check } from "lucide-react";

export default function TemplateStep({ accent, onApprove }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

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

  const handleApprove = () => {
    if (selected) onApprove({ template: selected });
  };

  return (
    <AutoStepShell
      step={6}
      accent={accent}
      title="Design Template"
      subtitle="Pick a layout structure for your website."
      onApprove={handleApprove}
      approveLabel="Select Template"
      canApprove={!!selected}
    >
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelected(t)}
              className={`rounded-xl border-2 overflow-hidden text-left transition ${
                selected?.id === t.id ? "border-slate-900" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="h-32 bg-slate-50 flex items-center justify-center overflow-hidden">
                <VisualTemplateRender template={t} displayW={140} />
              </div>
              <div className="p-2.5">
                <div className="text-xs font-bold text-slate-800 truncate">{t.name}</div>
                <div className="text-[10px] text-slate-400">{t.industry} · {t.layout}</div>
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