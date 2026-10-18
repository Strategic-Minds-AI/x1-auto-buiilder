import { useState } from "react";
import { base44 } from "@/api/base44Client";
import AutoStepShell from "@/components/autobuilder/AutoStepShell";
import { BRAND_PALETTES, DEFAULT_BRAND_PALETTE } from "@/lib/brandPalettes";
import { Loader2, Sparkles, Check, Palette } from "lucide-react";

export default function BrandStep({ accent, setAccent, nameData, onApprove }) {
  const [palette, setPalette] = useState(DEFAULT_BRAND_PALETTE);
  const [customAccent, setCustomAccent] = useState(accent || DEFAULT_BRAND_PALETTE.accent);
  const [loading, setLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState(null);
  const [logoError, setLogoError] = useState("");

  const activeAccent = customAccent || palette.accent;

  const choosePalette = (next) => {
    setPalette(next);
    setCustomAccent(next.accent);
    setAccent(next.accent);
  };

  const generateLogo = async () => {
    setLoading(true);
    setLogoError("");
    try {
      const res = await base44.integrations.Core.GenerateImage({
        prompt: [
          `Create a professional, original logo for "${nameData?.name || "a business"}".`,
          "Produce a clean vector-inspired mark with strong silhouette, balanced geometry, and excellent legibility at favicon size.",
          `Brand palette: background ${palette.primary}, primary accent ${activeAccent}, secondary accent ${palette.accent2}, text ${palette.ink}.`,
          `Art direction: ${palette.mood}. Use transparent or solid dark background where supported.`,
          "Do not include mockups, watermarks, extra slogans, random lettering, or decorative clutter. If a wordmark is generated, spell the business name exactly.",
        ].join(" "),
      });
      if (!res?.url) throw new Error("The image service did not return a logo URL.");
      setLogoUrl(res.url);
    } catch (error) {
      setLogoError(error?.message || "Logo generation failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = () => {
    setAccent(activeAccent);
    onApprove({
      palette: { ...palette, accent: activeAccent },
      logoUrl,
    });
  };

  return (
    <AutoStepShell
      step={5}
      accent={activeAccent}
      title="Brand Identity"
      subtitle="Choose from 20 coordinated premium palettes, fine-tune your accent, and generate a logo that matches the brand system."
      onApprove={handleApprove}
      approveLabel="Approve Brand"
    >
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Premium color systems</h3>
            <p className="mt-1 text-xs text-slate-400">Each system includes page background, surface, text, muted text, accent, secondary accent, and gradient.</p>
          </div>
          <span className="shrink-0 rounded-full border border-blue-400/30 bg-blue-400/10 px-2.5 py-1 text-xs font-semibold text-blue-200">20 palettes</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {BRAND_PALETTES.map((item) => {
            const selected = palette.id === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={selected}
                onClick={() => choosePalette(item)}
                className={`group rounded-xl border p-3 text-left transition hover:-translate-y-0.5 ${selected ? "border-blue-400 ring-2 ring-blue-400/30 bg-slate-800" : "border-slate-700 bg-slate-900/70 hover:border-slate-500"}`}
              >
                <div className="flex h-12 overflow-hidden rounded-lg border border-white/10">
                  <span className="flex-1" style={{ background: item.primary }} />
                  <span className="w-1/4" style={{ background: item.surface }} />
                  <span className="w-1/4" style={{ background: item.accent }} />
                  <span className="w-1/4" style={{ background: item.accent2 }} />
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-white">{item.name}</span>
                  {selected && <Check className="h-4 w-4 text-blue-300" />}
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{item.mood}</p>
                <div className="mt-2 h-1.5 rounded-full" style={{ background: item.gradient }} />
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
            <label htmlFor="custom-brand-accent" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-100">
              <Palette className="h-4 w-4 text-blue-300" /> Custom accent color
            </label>
            <div className="flex items-center gap-3">
              <input id="custom-brand-accent" type="color" value={activeAccent} onChange={(event) => { setCustomAccent(event.target.value); setAccent(event.target.value); }} className="h-11 w-14 cursor-pointer rounded-lg border border-slate-600 bg-slate-800 p-1" />
              <input value={activeAccent} onChange={(event) => { setCustomAccent(event.target.value); setAccent(event.target.value); }} aria-label="Accent color hex value" className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-mono text-white" />
            </div>
            <p className="mt-2 text-xs text-slate-400">The selected accent updates the primary action color; the rest of the palette remains coordinated.</p>
          </div>

          <div className="rounded-xl border border-slate-700 p-4" style={{ background: palette.primary, color: palette.ink }}>
            <div className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: palette.muted }}>Live palette preview</div>
            <div className="mt-2 text-xl font-bold">{nameData?.name || "Your Business"}</div>
            <p className="mt-1 text-xs" style={{ color: palette.muted }}>A visual identity designed to feel {palette.mood}.</p>
            <div className="mt-4 flex gap-2">
              <span className="rounded-lg px-3 py-2 text-xs font-bold" style={{ background: palette.gradient, color: "#FFFFFF" }}>Primary action</span>
              <span className="rounded-lg border px-3 py-2 text-xs font-semibold" style={{ borderColor: palette.accent2, color: palette.accent2 }}>Secondary action</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button type="button" onClick={generateLogo} disabled={loading} className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50" style={{ background: palette.gradient }}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "Generating logo…" : "Generate matching logo"}
          </button>
          {logoError && <p role="alert" className="text-sm text-rose-300">{logoError}</p>}
          {logoUrl && (
            <div className="flex min-h-32 items-center justify-center rounded-xl border border-slate-700 p-6" style={{ background: palette.primary }}>
              <img src={logoUrl} alt={`Generated logo for ${nameData?.name || "your business"}`} className="max-h-28 max-w-full object-contain" />
            </div>
          )}
        </div>
      </div>
    </AutoStepShell>
  );
}
