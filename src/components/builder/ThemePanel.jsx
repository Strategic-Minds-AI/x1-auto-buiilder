import { X, Check, Palette } from "lucide-react";
import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { BRAND_PALETTES, DEFAULT_BRAND_PALETTE } from "@/lib/brandPalettes";

const FONTS = [
  { id: "system", label: "System Sans" },
  { id: "serif", label: "Editorial Serif" },
  { id: "mono", label: "Technical Mono" },
];

export default function ThemePanel({ project, onClose, onApply }) {
  const initialColor = project?.brand_color || DEFAULT_BRAND_PALETTE.accent;
  const [palette, setPalette] = useState(
    BRAND_PALETTES.find((item) => item.accent.toLowerCase() === initialColor.toLowerCase()) || DEFAULT_BRAND_PALETTE
  );
  const [color, setColor] = useState(initialColor);
  const [font, setFont] = useState("system");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const choosePalette = (item) => {
    setPalette(item);
    setColor(item.accent);
    setError("");
  };

  const apply = async () => {
    setSaving(true);
    setError("");
    try {
      if (project?.id) {
        await base44.entities.WebsiteProject.update(project.id, {
          brand_color: color,
          brand_palette_id: palette.id,
          brand_palette: { ...palette, accent: color },
          brand_font: font,
        });
      }
      onApply(color, { ...palette, accent: color, font });
    } catch (err) {
      setError(err?.message || "Could not save this theme. Your selection is still available in this panel.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="absolute inset-y-0 right-0 z-40 flex w-[min(24rem,100vw)] flex-col border-l border-slate-800 bg-[#05070b] text-white shadow-2xl">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-800 bg-[#0b1220] px-4">
        <h3 className="flex items-center gap-2 text-sm font-bold text-white"><Palette className="h-4 w-4 text-blue-300" /> Theme Editor</h3>
        <button type="button" onClick={onClose} aria-label="Close theme editor" className="rounded-lg p-1.5 text-slate-300 transition hover:bg-slate-800 hover:text-white"><X className="h-4 w-4" /></button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-4">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-100">20 premium palettes</label>
            <span className="text-[10px] uppercase tracking-wider text-slate-500">Select to preview</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {BRAND_PALETTES.map((item) => {
              const selected = palette.id === item.id;
              return (
                <button key={item.id} type="button" aria-pressed={selected} onClick={() => choosePalette(item)}
                  className={`rounded-xl border p-2 text-left transition ${selected ? "border-blue-400 bg-blue-400/10" : "border-slate-800 bg-slate-900 hover:border-slate-600"}`}>
                  <span className="mb-2 flex h-7 overflow-hidden rounded-md">
                    <span className="flex-1" style={{ background: item.primary }} />
                    <span className="flex-1" style={{ background: item.surface }} />
                    <span className="flex-1" style={{ background: item.accent }} />
                    <span className="flex-1" style={{ background: item.accent2 }} />
                  </span>
                  <span className="flex items-center justify-between gap-1 text-xs font-semibold text-slate-100">
                    {item.name}{selected && <Check className="h-3.5 w-3.5 shrink-0 text-blue-300" />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label htmlFor="theme-accent-color" className="mb-2 block text-sm font-semibold text-slate-100">Custom accent</label>
          <div className="flex items-center gap-3">
            <input id="theme-accent-color" type="color" value={color} onChange={(event) => setColor(event.target.value)} className="h-10 w-12 cursor-pointer rounded-lg border border-slate-700 bg-slate-900 p-1" />
            <input value={color} onChange={(event) => setColor(event.target.value)} aria-label="Accent hex color" className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-sm text-white" />
          </div>
        </div>

        <div>
          <label htmlFor="theme-font" className="mb-2 block text-sm font-semibold text-slate-100">Typography</label>
          <select id="theme-font" value={font} onChange={(event) => setFont(event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40">
            {FONTS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </div>

        <div className="overflow-hidden rounded-xl border border-white/10 p-4" style={{ background: palette.primary, color: palette.ink }}>
          <div className="mb-2 text-[10px] uppercase tracking-[0.16em]" style={{ color: palette.muted }}>Live preview · {palette.name}</div>
          <div className="rounded-lg border p-4" style={{ background: palette.surface, borderColor: palette.accent + "55" }}>
            <div className="text-lg font-bold">Your Business</div>
            <div className="mt-1 text-xs" style={{ color: palette.muted }}>Premium quality services, designed around your customer.</div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-md px-3 py-2 text-xs font-bold text-white" style={{ background: `linear-gradient(110deg,${color},${palette.accent2})` }}>Primary action</span>
              <span className="rounded-md border px-3 py-2 text-xs font-semibold" style={{ borderColor: palette.accent2, color: palette.accent2 }}>Learn more</span>
            </div>
          </div>
        </div>

        {error && <p role="alert" className="text-xs text-rose-300">{error}</p>}
        <button type="button" onClick={apply} disabled={saving} className="w-full rounded-xl py-3 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-50" style={{ background: `linear-gradient(110deg,${color},${palette.accent2})` }}>
          {saving ? "Applying…" : "Apply Theme"}
        </button>
      </div>
    </div>
  );
}
