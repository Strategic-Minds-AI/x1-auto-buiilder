import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Sparkles, Loader2, Check, Globe, Palette, Shield, AlertCircle,
  RefreshCw, Building2, ArrowRight, SkipForward
} from "lucide-react";

export default function NamingStep({ form, onSelected, onSkip }) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    setOptions([]);
    setSelected(null);
    try {
      const res = await base44.functions.invoke("generateBusinessNames", {
        industry: form.industry,
        market: form.location || "",
        positioning: form.positioning || "",
        tone: form.tone || "",
      });
      setOptions(res.data.options || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { generate(); }, []);

  const selectName = (opt) => {
    setSelected(opt);
    onSelected(opt);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Brand Identity</h2>
            <p className="text-sm text-slate-500">Select a name for your business — or skip to proceed without one</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {options.length > 0 && !loading && (
            <button
              onClick={generate}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:text-[#00d4ff] hover:border-[#00d4ff]/40 transition"
            >
              <RefreshCw className="w-4 h-4" /> Regenerate
            </button>
          )}
          <button
            onClick={onSkip}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 transition"
          >
            <SkipForward className="w-4 h-4" /> Skip
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-[#00d4ff] mb-4" />
          <p className="text-sm text-slate-400">Generating 3 professional brand name options…</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center gap-2 text-sm text-red-600 mb-4">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {!loading && options.length > 0 && (
        <div className="space-y-4">
          {options.map((opt, i) => {
            const isSelected = selected?.name === opt.name;
            return (
              <div
                key={i}
                className={`rounded-2xl border-2 bg-white p-5 transition-all cursor-pointer ${
                  isSelected ? "border-[#00d4ff] shadow-[0_0_30px_rgba(0,212,255,0.1)]" : "border-slate-200 hover:border-slate-300"
                }`}
                onClick={() => selectName(opt)}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      {(opt.palettePreview || []).map((color, ci) => (
                        <div key={ci} className="w-7 h-7 rounded-lg border border-slate-200" style={{ background: color }} />
                      ))}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900">{opt.name}</h3>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        opt.confidence === "high" ? "bg-emerald-100 text-emerald-700" :
                        opt.confidence === "medium" ? "bg-amber-100 text-amber-700" :
                        "bg-slate-100 text-slate-500"
                      }`}>
                        {opt.confidence} confidence
                      </span>
                    </div>
                  </div>
                  {isSelected ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00d4ff] px-4 py-2 text-sm font-bold text-[#0a0e14]">
                      <Check className="w-4 h-4" /> Selected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-500">
                      <ArrowRight className="w-4 h-4" /> Select
                    </span>
                  )}
                </div>

                <p className="text-sm font-medium text-slate-700 mb-2 italic">"{opt.positioning}"</p>
                <p className="text-xs text-slate-600 mb-3">{opt.rationale}</p>

                <div className="grid md:grid-cols-3 gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Palette className="w-3 h-3 text-slate-400" />
                      <span className="text-[9px] font-bold tracking-wide uppercase text-slate-400">Logo</span>
                    </div>
                    <p className="text-[11px] text-slate-600">{opt.logoDirection}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Globe className="w-3 h-3 text-slate-400" />
                      <span className="text-[9px] font-bold tracking-wide uppercase text-slate-400">Domains</span>
                    </div>
                    <div className="space-y-0.5">
                      {(opt.domainOptions || []).slice(0, 2).map((d, di) => (
                        <p key={di} className="text-[11px] font-mono text-[#00d4ff]">{d}</p>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Shield className="w-3 h-3 text-slate-400" />
                      <span className="text-[9px] font-bold tracking-wide uppercase text-slate-400">Legal</span>
                    </div>
                    <p className="text-[11px] text-slate-600">{opt.legalNote}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && options.length > 0 && selected && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => onSelected(selected)}
            className="inline-flex items-center gap-2 rounded-full bg-[#00d4ff] px-6 py-3 text-sm font-bold text-[#0a0e14] hover:brightness-110 hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] transition"
          >
            Continue with "{selected.name}" <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}