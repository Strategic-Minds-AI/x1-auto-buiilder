import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { PROVEN_VISIONS, ACCENT_COLORS } from "@/lib/autoBuilderSteps";
import { Sparkles, Loader2, RefreshCw, ArrowRight, Check } from "lucide-react";

// Step 2 — Vision. Pick one of 10 proven visions, or describe your own and let
// AI Assist refine it. Every step has a generator, a regenerate option, and an
// accent color option. Approving carries the vision into the Strategy step.
export default function VisionStep({ accent, setAccent, onApprove }) {
  const [seed, setSeed] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [vision, setVision] = useState(null);
  const [pickedType, setPickedType] = useState(null);

  const runAssist = async (overrideSeed) => {
    const s = (overrideSeed !== undefined ? overrideSeed : seed).trim();
    if (!s) { setError("Describe your vision or pick one of the proven visions first."); return; }
    setLoading(true); setError(""); setVision(null);
    try {
      const res = await base44.functions.invoke("generateVision", { seed: s, accentColor: accent });
      setVision(res.data.vision);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Vision generation failed");
    } finally {
      setLoading(false);
    }
  };

  const pickProven = (v) => {
    setPickedType(v.type);
    setSeed(v.type + " — " + v.blurb);
    runAssist(v.type + ". " + v.blurb);
  };

  const approve = () => {
    if (!vision) return;
    onApprove({ ...vision, type: vision.type || pickedType || "Build a Website" });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <header className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Define Your Vision</h2>
        <p className="text-slate-500 mt-1.5">Pick a proven starting point, or describe your own and let AI refine it.</p>
      </header>

      {/* 10 proven visions */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">10 Proven Visions</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {PROVEN_VISIONS.map((v) => {
            const Icon = v.icon;
            const active = pickedType === v.type;
            return (
              <button
                key={v.type}
                type="button"
                onClick={() => pickProven(v)}
                className="group rounded-2xl bg-slate-900 p-4 text-left text-white transition hover:-translate-y-0.5"
                style={{ boxShadow: active ? `0 0 0 2px ${accent}` : "none" }}
              >
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-xl mb-3"
                  style={{ background: accent }}
                >
                  <Icon className="h-4 w-4 text-slate-900" />
                </span>
                <div className="text-sm font-bold leading-tight">{v.type}</div>
                <div className="text-[11px] text-slate-400 mt-1 leading-snug">{v.blurb}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* AI assist */}
      <div className="rounded-2xl bg-white border border-slate-200 p-5">
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
          Or describe your own vision
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runAssist()}
            placeholder="One sentence — what do you want to build?"
            className="flex-1 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2"
            style={{ "--tw-ring-color": accent }}
          />
          <button
            onClick={() => runAssist()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-slate-900 transition disabled:opacity-50"
            style={{ background: accent }}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            AI Assist
          </button>
        </div>

        {/* accent color option on this step too */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Accent</span>
          {ACCENT_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setAccent(c.value)}
              className="h-6 w-6 rounded-full border-2 transition"
              style={{ background: c.value, borderColor: accent === c.value ? "#0f172a" : "transparent" }}
              title={c.name}
            />
          ))}
        </div>

        {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
      </div>

      {/* Result */}
      {vision && (
        <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: accent }}>
              {vision.type} {vision.tagline ? `· ${vision.tagline}` : ""}
            </span>
            <button
              onClick={() => runAssist()}
              disabled={loading}
              className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Regenerate
            </button>
          </div>
          <p className="text-base leading-relaxed">{vision.statement}</p>

          {vision.alternatives?.length > 0 && (
            <div className="mt-5">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">Alternative framings</div>
              <div className="space-y-2">
                {vision.alternatives.map((a, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => runAssist(a)}
                    className="block w-full text-left rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-sm text-slate-200 hover:border-slate-500 transition"
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={approve}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold text-slate-900 transition"
            style={{ background: accent }}
          >
            <Check className="h-4 w-4" /> Approve Vision <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}