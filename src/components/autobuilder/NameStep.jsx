import { useState } from "react";
import { base44 } from "@/api/base44Client";
import AutoStepShell from "@/components/autobuilder/AutoStepShell";
import { Loader2, Sparkles, Check } from "lucide-react";

export default function NameStep({ accent, vision, strategy, onApprove }) {
  const [seed, setSeed] = useState(vision?.statement || strategy?.name || "");
  const [industry, setIndustry] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [selected, setSelected] = useState(null);
  const [domain, setDomain] = useState("");

  const generate = async () => {
    if (!seed) return;
    setLoading(true);
    setSuggestions(null);
    try {
      const res = await base44.functions.invoke("generateVision", {
        seed: `${seed} — business name for ${industry || "this industry"}`,
        accentColor: accent,
      });
      // Reuse the vision generator for name suggestions
      const raw = res.data?.statement || res.data?.alternatives || [];
      const names = Array.isArray(raw) ? raw : [raw];
      setSuggestions(names.slice(0, 5));
    } catch {
      setSuggestions([seed + " Co.", seed + " Group", "The " + seed + " Company", seed + " Pro", seed + " Works"]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = () => {
    onApprove({ name: selected || seed, domain });
  };

  return (
    <AutoStepShell
      step={4}
      accent={accent}
      title="Name & Domain"
      subtitle="Generate business name ideas and lock in your domain."
      onApprove={handleApprove}
      approveLabel="Lock In Name"
      canApprove={!!(selected || seed)}
    >
      <div className="space-y-4">
        <label className="block">
          <span className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Seed Idea / Keyword</span>
          <input
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:border-slate-400 transition"
            placeholder="e.g. Storm Shield Roofing"
          />
        </label>
        <label className="block">
          <span className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Industry (optional)</span>
          <input
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:border-slate-400 transition"
            placeholder="e.g. Roofing"
          />
        </label>
        <button
          onClick={generate}
          disabled={loading || !seed}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Generate Name Ideas
        </button>

        {suggestions && (
          <div className="space-y-2 pt-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Suggestions</span>
            {suggestions.map((name, i) => (
              <button
                key={i}
                onClick={() => setSelected(name)}
                className={`w-full flex items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                  selected === name ? "border-slate-900 bg-slate-50" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <span className="text-sm font-semibold text-slate-800">{name}</span>
                {selected === name && <Check className="w-4 h-4 text-slate-900" />}
              </button>
            ))}
          </div>
        )}

        <label className="block pt-2">
          <span className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Preferred Domain</span>
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:border-slate-400 transition"
            placeholder="example.com"
          />
        </label>
      </div>
    </AutoStepShell>
  );
}