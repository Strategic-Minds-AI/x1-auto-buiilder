import { useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  Sparkles, Loader2, Check, Globe, Palette, Shield, ArrowRight,
  RefreshCw, AlertCircle, CheckCircle2, Building2, Lightbulb
} from "lucide-react";
import BackButton from "@/components/shared/BackButton";

export default function BusinessNameStudio() {
  const [form, setForm] = useState({ industry: "", market: "", positioning: "", tone: "", businessModel: "" });
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const generate = async () => {
    if (!form.industry) { setError("Industry is required"); return; }
    setLoading(true);
    setError(null);
    setOptions([]);
    setSelected(null);
    setSaved(false);
    try {
      const res = await base44.functions.invoke("generateBusinessNames", form);
      setOptions(res.data.options || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const approveName = async (option) => {
    setSelected(option);
    setSaving(true);
    setSaved(false);
    try {
      // Save the selected name as a WebsiteProject draft
      const project = await base44.entities.WebsiteProject.create({
        business_name: option.name,
        business_website: "",
        industry: form.industry,
        status: "draft",
        business_research: {
          positioning: option.positioning,
          rationale: option.rationale,
          logoDirection: option.logoDirection,
          palettePreview: option.palettePreview,
          domainOptions: option.domainOptions,
          confidence: option.confidence,
          legalNote: option.legalNote,
          market: form.market,
          tone: form.tone,
          businessModel: form.businessModel,
        },
      });
      setSaved(true);
      setOptions((prev) => prev.map((o) => ({ ...o, _projectId: o.name === option.name ? project.id : o._projectId })));
    } catch (err) {
      setError(err.message || "Failed to save name");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <BackButton />

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Business Name Studio</h1>
              <p className="text-sm text-slate-500">Generate 3 approval-ready brand names with positioning, domains, and visual direction</p>
            </div>
          </div>
        </div>

        {/* Input form */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Industry" required>
              <input
                className="dd-input"
                placeholder="e.g. HVAC, Dental, Landscaping"
                value={form.industry}
                onChange={(e) => setForm({ ...form, industry: e.target.value })}
              />
            </Field>
            <Field label="Market / Location">
              <input
                className="dd-input"
                placeholder="e.g. Dallas, TX"
                value={form.market}
                onChange={(e) => setForm({ ...form, market: e.target.value })}
              />
            </Field>
            <Field label="Positioning">
              <input
                className="dd-input"
                placeholder="e.g. Premium, Affordable, Eco-friendly"
                value={form.positioning}
                onChange={(e) => setForm({ ...form, positioning: e.target.value })}
              />
            </Field>
            <Field label="Tone">
              <input
                className="dd-input"
                placeholder="e.g. Trustworthy, Bold, Friendly"
                value={form.tone}
                onChange={(e) => setForm({ ...form, tone: e.target.value })}
              />
            </Field>
            <Field label="Business Model">
              <input
                className="dd-input"
                placeholder="e.g. B2B Services, Subscription, Retail"
                value={form.businessModel}
                onChange={(e) => setForm({ ...form, businessModel: e.target.value })}
              />
            </Field>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={generate}
              disabled={loading || !form.industry}
              className="inline-flex items-center gap-2 rounded-full bg-[#00d4ff] px-6 py-3 text-sm font-bold text-[#0a0e14] hover:brightness-110 hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] transition disabled:opacity-50"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating Names…</> : <><Sparkles className="w-4 h-4" /> Generate Brand Names</>}
            </button>
            {options.length > 0 && !loading && (
              <button
                onClick={generate}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:text-[#00d4ff] hover:border-[#00d4ff]/40 transition"
              >
                <RefreshCw className="w-4 h-4" /> Regenerate
              </button>
            )}
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}
        </div>

        {/* Results */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-[#00d4ff] mb-4" />
            <p className="text-sm text-slate-400">Generating 3 professional brand name options…</p>
          </div>
        )}

        {!loading && options.length > 0 && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              {options.length} approval-ready options — select one to save as a project
            </div>

            {options.map((opt, i) => {
              const isSelected = selected?.name === opt.name;
              const isSaved = isSelected && saved;
              return (
                <div
                  key={i}
                  className={`rounded-2xl border-2 bg-white p-6 transition-all ${
                    isSelected ? "border-[#00d4ff] shadow-[0_0_30px_rgba(0,212,255,0.1)]" : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      {/* Palette preview */}
                      <div className="flex gap-1.5">
                        {(opt.palettePreview || []).map((color, ci) => (
                          <div key={ci} className="w-8 h-8 rounded-lg border border-slate-200" style={{ background: color }} />
                        ))}
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-slate-900">{opt.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            opt.confidence === "high" ? "bg-emerald-100 text-emerald-700" :
                            opt.confidence === "medium" ? "bg-amber-100 text-amber-700" :
                            "bg-slate-100 text-slate-500"
                          }`}>
                            {opt.confidence} confidence
                          </span>
                        </div>
                      </div>
                    </div>
                    {isSaved ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-4 py-2 text-sm font-bold text-emerald-600">
                        <CheckCircle2 className="w-4 h-4" /> Saved as Project
                      </span>
                    ) : (
                      <button
                        onClick={() => approveName(opt)}
                        disabled={saving && isSelected}
                        className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800 transition disabled:opacity-50"
                      >
                        {saving && isSelected ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        {isSelected ? "Saving…" : "Select This Name"}
                      </button>
                    )}
                  </div>

                  <p className="text-sm font-medium text-slate-700 mb-3 italic">"{opt.positioning}"</p>
                  <p className="text-sm text-slate-600 mb-4">{opt.rationale}</p>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Palette className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[10px] font-bold tracking-wide uppercase text-slate-400">Logo Direction</span>
                      </div>
                      <p className="text-xs text-slate-600">{opt.logoDirection}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Globe className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[10px] font-bold tracking-wide uppercase text-slate-400">Domain Options</span>
                      </div>
                      <div className="space-y-0.5">
                        {(opt.domainOptions || []).map((d, di) => (
                          <p key={di} className="text-xs font-mono text-[#00d4ff]">{d}</p>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Shield className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[10px] font-bold tracking-wide uppercase text-slate-400">Legal Note</span>
                      </div>
                      <p className="text-xs text-slate-600">{opt.legalNote}</p>
                    </div>
                  </div>

                  {isSaved && opt._projectId && (
                    <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 flex items-center justify-between">
                      <p className="text-xs text-emerald-700 font-medium">Project created — ready for website generation</p>
                      <a
                        href={`/auto-builder?project=${opt._projectId}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700"
                      >
                        Continue to Auto Builder <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!loading && options.length === 0 && !error && (
          <div className="text-center py-20">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-slate-200" />
            <p className="text-slate-400 text-sm">Enter your industry and generate 3 professional brand name options</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-500 mb-1.5 block">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}