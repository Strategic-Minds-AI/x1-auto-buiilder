import { X } from "lucide-react";
import { useState } from "react";
import { base44 } from "@/api/base44Client";

const COLORS = ["#00d4ff", "#0066ff", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#0a0e14", "#6366f1", "#f97316"];
const FONTS = [
  { id: "system", label: "System Sans" },
  { id: "serif", label: "Serif" },
  { id: "mono", label: "Monospace" },
];

export default function ThemePanel({ project, onClose, onApply }) {
  const [color, setColor] = useState(project?.brand_color || "#00d4ff");
  const [font, setFont] = useState("system");
  const [saving, setSaving] = useState(false);

  const apply = async () => {
    setSaving(true);
    try {
      if (project?.id) {
        await base44.entities.WebsiteProject.update(project.id, { brand_color: color });
      }
      onApply(color);
    } catch {} finally { setSaving(false); }
  };

  return (
    <div className="absolute top-0 right-0 bottom-0 w-80 bg-white border-l border-slate-200 z-40 flex flex-col shadow-xl">
      <div className="h-12 px-4 flex items-center justify-between border-b border-slate-200 bg-slate-50 shrink-0">
        <h3 className="text-sm font-bold text-slate-800">Theme Editor</h3>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-200 transition"><X className="w-4 h-4" /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        <div>
          <label className="text-sm font-semibold text-slate-700 mb-2 block">Brand Color</label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button key={c} onClick={() => setColor(c)}
                className={`w-10 h-10 rounded-lg border-2 transition ${color === c ? "border-slate-800 scale-110" : "border-transparent"}`}
                style={{ backgroundColor: c }} />
            ))}
          </div>
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
            className="mt-3 w-full h-10 rounded-lg border border-slate-200 cursor-pointer" />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700 mb-2 block">Typography</label>
          <select value={font} onChange={(e) => setFont(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/30">
            {FONTS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
          </select>
        </div>
        <div className="rounded-xl bg-slate-50 p-4">
          <div className="text-xs text-slate-400 mb-2">Preview</div>
          <div className="rounded-lg p-4 text-center" style={{ backgroundColor: color }}>
            <div className="text-white font-bold text-lg">Your Business</div>
            <div className="text-white/70 text-xs">Premium quality services</div>
          </div>
        </div>
        <button onClick={apply} disabled={saving}
          className="w-full rounded-xl bg-[#00d4ff] py-2.5 text-sm font-bold text-[#0a0e14] disabled:opacity-40 hover:brightness-110 transition">
          {saving ? "Applying..." : "Apply Theme"}
        </button>
      </div>
    </div>
  );
}