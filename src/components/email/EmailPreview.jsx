// Visual preview of an email template rendered with the brand theme
export default function EmailPreview({ template }) {
  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm" style={{ maxWidth: "100%" }}>
      {/* Header band */}
      <div className="px-8 py-4" style={{ background: "#00d4ff" }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-base" style={{ background: "#0b1523", color: "#00d4ff" }}>D</div>
          <span className="text-sm font-bold" style={{ color: "#0b1523" }}>Digital Dominance Factory</span>
        </div>
      </div>

      {/* Body */}
      <div className="px-8 py-8 bg-white">
        <h2 className="text-xl font-bold mb-2" style={{ color: "#0b1523" }}>{template.title}</h2>
        <p className="text-sm mb-4" style={{ color: "#475569" }}>{template.description}</p>

        {/* Variables */}
        <div className="mb-4">
          <div className="text-xs font-bold uppercase mb-1.5" style={{ color: "#94a3b8" }}>Template Variables</div>
          <div className="flex flex-wrap gap-1.5">
            {template.variables.map((v) => (
              <span key={v} className="rounded-md px-2 py-0.5 text-xs font-mono" style={{ background: "#f1f5f9", color: "#475569" }}>
                {`{{${v}}}`}
              </span>
            ))}
          </div>
        </div>

        {/* CTA preview */}
        <div className="inline-block rounded-2xl px-7 py-3.5 text-sm font-bold" style={{ background: "#00d4ff", color: "#0b1523" }}>
          View in Dashboard
        </div>
      </div>

      {/* Footer */}
      <div className="px-8 py-4 text-center" style={{ background: "#0b1523" }}>
        <p className="text-xs" style={{ color: "#94a3b8" }}>© 2026 Digital Dominance Factory. All rights reserved.</p>
      </div>
    </div>
  );
}