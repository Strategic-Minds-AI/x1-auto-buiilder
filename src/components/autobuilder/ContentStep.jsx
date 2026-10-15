import { useState } from "react";
import AutoStepShell from "@/components/autobuilder/AutoStepShell";
import { Check, Edit3 } from "lucide-react";

export default function ContentStep({ accent, websiteData, onApprove }) {
  const [content, setContent] = useState(websiteData?.website?.content || {});
  const [editing, setEditing] = useState(null);

  const update = (path, value) => {
    setContent((c) => {
      const next = { ...c };
      if (path === "hero.headline") next.hero = { ...next.hero, headline: value };
      else if (path === "hero.subheadline") next.hero = { ...next.hero, subheadline: value };
      return next;
    });
  };

  const handleApprove = () => {
    onApprove({ content });
  };

  return (
    <AutoStepShell
      step={8}
      accent={accent}
      title="Content & Copy"
      subtitle="Review and refine your generated content before compliance check."
      onApprove={handleApprove}
      approveLabel="Approve Content"
    >
      <div className="space-y-4">
        {content.hero && (
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase text-slate-400">Hero Section</span>
              <button onClick={() => setEditing(editing === "hero" ? null : "hero")} className="text-xs text-slate-500 hover:text-slate-900 inline-flex items-center gap-1">
                <Edit3 className="w-3 h-3" /> {editing === "hero" ? "Done" : "Edit"}
              </button>
            </div>
            {editing === "hero" ? (
              <div className="space-y-2">
                <input
                  value={content.hero.headline || ""}
                  onChange={(e) => update("hero.headline", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-slate-400"
                />
                <textarea
                  value={content.hero.subheadline || ""}
                  onChange={(e) => update("hero.subheadline", e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-slate-400"
                />
              </div>
            ) : (
              <>
                <h3 className="text-lg font-bold text-slate-900">{content.hero.headline}</h3>
                <p className="text-sm text-slate-600">{content.hero.subheadline}</p>
              </>
            )}
          </div>
        )}

        {content.services?.length > 0 && (
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
            <span className="text-xs font-bold uppercase text-slate-400 mb-2 block">Services ({content.services.length})</span>
            <div className="space-y-2">
              {content.services.map((s, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{s.title}</div>
                    <div className="text-xs text-slate-500">{s.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {content.faqs?.length > 0 && (
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
            <span className="text-xs font-bold uppercase text-slate-400 mb-2 block">FAQs ({content.faqs.length})</span>
            <div className="space-y-2">
              {content.faqs.slice(0, 4).map((f, i) => (
                <div key={i}>
                  <div className="text-sm font-semibold text-slate-800">Q: {f.question}</div>
                  <div className="text-xs text-slate-500">A: {f.answer}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!content.hero && !content.services && (
          <p className="text-sm text-slate-400 text-center py-8">No content generated yet. Go back to the Website step to generate.</p>
        )}
      </div>
    </AutoStepShell>
  );
}