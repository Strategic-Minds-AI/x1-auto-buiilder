import { useState } from "react";
import { base44 } from "@/api/base44Client";
import AutoStepShell from "@/components/autobuilder/AutoStepShell";
import { Loader2, Sparkles, Image as ImageIcon } from "lucide-react";

const PALETTE_PRESETS = [
  { name: "Storm Blue", primary: "#0f172a", accent: "#00d4ff" },
  { name: "Forest Green", primary: "#0c2d1a", accent: "#10b981" },
  { name: "Royal Gold", primary: "#1a1a2e", accent: "#d4a574" },
  { name: "Crimson Pro", primary: "#1a0a0a", accent: "#dc2626" },
  { name: "Ocean Teal", primary: "#0a1929", accent: "#06b6d4" },
  { name: "Violet Dream", primary: "#1e1b4b", accent: "#8b5cf6" },
];

export default function BrandStep({ accent, setAccent, nameData, onApprove }) {
  const [palette, setPalette] = useState(null);
  const [loading, setLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState(null);

  const generateLogo = async () => {
    setLoading(true);
    try {
      const res = await base44.integrations.Core.GenerateImage({
        prompt: `Professional minimalist logo for "${nameData?.name || "a business"}", modern clean design, on dark background, vector style, ${palette?.accent || accent} accent color`,
      });
      setLogoUrl(res.url);
    } catch {}
    finally { setLoading(false); }
  };

  const handleApprove = () => {
    if (palette) setAccent(palette.accent);
    onApprove({ palette: palette || { primary: "#0f172a", accent }, logoUrl });
  };

  return (
    <AutoStepShell
      step={5}
      accent={accent}
      title="Brand Identity"
      subtitle="Choose your color palette and generate a logo."
      onApprove={handleApprove}
      approveLabel="Approve Brand"
    >
      <div className="space-y-5">
        <div>
          <span className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Color Palette</span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {PALETTE_PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => setPalette(p)}
                className={`rounded-xl border-2 p-3 text-left transition ${
                  palette?.name === p.name ? "border-slate-900" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg" style={{ background: p.primary }} />
                  <div className="w-7 h-7 rounded-lg" style={{ background: p.accent }} />
                </div>
                <span className="text-xs font-semibold text-slate-700">{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <button
            onClick={generateLogo}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Generate Logo
          </button>
        </div>

        {logoUrl && (
          <div className="rounded-xl border border-slate-200 p-6 flex items-center justify-center" style={{ background: palette?.primary || "#0f172a" }}>
            <img src={logoUrl} alt="Generated logo" className="max-h-24 rounded-lg" />
          </div>
        )}
      </div>
    </AutoStepShell>
  );
}