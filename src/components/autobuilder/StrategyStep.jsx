import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ADDON_CATALOG } from "@/lib/autoBuilderSteps";
import { Loader2, RefreshCw, Check, ArrowRight, Eye } from "lucide-react";

// Step 3 — Strategy. Takes the approved vision and, in the background,
// generates the 10 best strategies for it. The user selects the capability
// addons they want (the checklist); those feed the generator. Each strategy
// card shows which addons it leverages. Approving carries the chosen strategy
// + addons into the next step.
export default function StrategyStep({ vision, accent, onApprove }) {
  const [addons, setAddons] = useState(() => ADDON_CATALOG.map((a) => a.key)); // default all on
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);

  const toggle = (key) =>
    setAddons((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  const run = async () => {
    setLoading(true); setError(""); setStrategies([]); setSelected(null);
    try {
      const res = await base44.functions.invoke("generateStrategies", {
        vision,
        addons: ADDON_CATALOG.filter((a) => addons.includes(a.key)).map((a) => a.label),
      });
      setStrategies(res.data.strategies || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Strategy generation failed");
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate on mount using the carried vision.
  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const approve = () => {
    if (!selected) return;
    onApprove({
      strategy: selected,
      addons: ADDON_CATALOG.filter((a) => addons.includes(a.key)).map((a) => a.label),
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <header>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Your Strategy</h2>
        <p className="text-slate-500 mt-1.5">We generated the 10 best strategies for your vision. Pick what to include, then choose your path.</p>
      </header>

      {/* Carried vision */}
      <div className="rounded-2xl bg-slate-900 p-5 text-white">
        <div className="flex items-center gap-2 mb-1.5">
          <Eye className="h-4 w-4" style={{ color: accent }} />
          <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: accent }}>
            {vision.type} {vision.tagline ? `· ${vision.tagline}` : ""}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-slate-200">{vision.statement}</p>
      </div>

      {/* Addon checklist */}
      <div className="rounded-2xl bg-white border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Include in your build</div>
          <button
            onClick={run}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition disabled:opacity-50"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Regenerate strategies
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {ADDON_CATALOG.map((a) => {
            const on = addons.includes(a.key);
            return (
              <button
                key={a.key}
                type="button"
                onClick={() => toggle(a.key)}
                className="flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left text-sm transition"
                style={{
                  borderColor: on ? accent : "#e2e8f0",
                  background: on ? `${accent}11` : "#fff",
                }}
              >
                <span
                  className="flex h-5 w-5 items-center justify-center rounded-md border-2 shrink-0"
                  style={{ borderColor: on ? accent : "#cbd5e1", background: on ? accent : "transparent" }}
                >
                  {on && <Check className="h-3 w-3 text-white" />}
                </span>
                <span className={on ? "text-slate-900 font-medium" : "text-slate-500"}>{a.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Strategies */}
      {loading && (
        <div className="flex flex-col items-center gap-3 py-12">
          <Loader2 className="h-7 w-7 animate-spin" style={{ color: accent }} />
          <p className="text-sm text-slate-500">Generating the 10 best strategies for your vision…</p>
        </div>
      )}
      {error && <p className="text-sm text-rose-600">{error}</p>}

      {!loading && strategies.length > 0 && (
        <div className="space-y-3">
          {strategies.map((s, i) => {
            const active = selected === i;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelected(i)}
                className="block w-full text-left rounded-2xl bg-white border p-5 transition hover:-translate-y-0.5"
                style={{ borderColor: active ? accent : "#e2e8f0", boxShadow: active ? `0 0 0 2px ${accent}` : "none" }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-slate-900"
                      style={{ background: accent }}
                    >
                      {i + 1}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">{s.name}</h3>
                  </div>
                  {typeof s.score === "number" && (
                    <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: `${accent}1a`, color: "#0f172a" }}>
                      {s.score}/10
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-600 mt-2">{s.summary}</p>
                {s.why && <p className="text-xs text-slate-400 mt-1.5 italic">Why it wins: {s.why}</p>}
                {s.tactics?.length > 0 && (
                  <ul className="mt-3 space-y-1">
                    {s.tactics.map((t, ti) => (
                      <li key={ti} className="flex items-start gap-2 text-xs text-slate-500">
                        <span className="mt-1 h-1 w-1 rounded-full shrink-0" style={{ background: accent }} />
                        {t}
                      </li>
                    ))}
                  </ul>
                )}
                {s.addons?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {s.addons.map((ad, ai) => (
                      <span key={ai} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {ad}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            );
          })}

          <button
            onClick={approve}
            disabled={selected === null}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold text-slate-900 transition disabled:opacity-50"
            style={{ background: accent }}
          >
            <Check className="h-4 w-4" /> Approve Strategy <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}