import { useState } from "react";
import { base44 } from "@/api/base44Client";
import AutoStepShell from "@/components/autobuilder/AutoStepShell";
import { Loader2, Globe } from "lucide-react";

export default function WebsiteStep({ accent, vision, strategy, nameData, brandData, templateData, onApprove }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("generateWebsite", {
        businessName: nameData?.name || "",
        businessWebsiteUrl: "",
        industry: strategy?.name || vision?.type || "General",
        goal: vision?.statement || "",
        tone: "professional",
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = () => {
    onApprove({ website: result });
  };

  return (
    <AutoStepShell
      step={7}
      accent={accent}
      title="Website Generation"
      subtitle="Generate your full website blueprint with AI."
      onApprove={result ? handleApprove : undefined}
      approveLabel="Approve Website"
      canApprove={!!result}
    >
      {!result && !loading && (
        <div className="text-center py-8">
          <Globe className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <p className="text-slate-500 text-sm mb-5 max-w-md mx-auto">
            We'll generate a complete website blueprint — hero, services, about, FAQs, testimonials, and SEO content — based on your vision, strategy, and brand.
          </p>
          <button
            onClick={generate}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
          >
            <Globe className="w-4 h-4" /> Generate Website
          </button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400 mb-3" />
          <p className="text-sm text-slate-500">Generating your website blueprint…</p>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      {result && (
        <div className="space-y-4">
          {result.content?.hero && (
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
              <div className="text-xs font-bold uppercase text-slate-400 mb-1">Hero</div>
              <h3 className="text-lg font-bold text-slate-900">{result.content.hero.headline}</h3>
              <p className="text-sm text-slate-600">{result.content.hero.subheadline}</p>
            </div>
          )}
          {result.content?.services?.length > 0 && (
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
              <div className="text-xs font-bold uppercase text-slate-400 mb-2">Services ({result.content.services.length})</div>
              {result.content.services.slice(0, 4).map((s, i) => (
                <div key={i} className="text-sm text-slate-700 mb-1">• {s.title}</div>
              ))}
            </div>
          )}
          <p className="text-xs text-slate-400">Full blueprint generated. Continue to refine content in the next step.</p>
        </div>
      )}
    </AutoStepShell>
  );
}