import { X, Check, ExternalLink, ArrowRight } from "lucide-react";
import VisualTemplateRender from "@/components/shared/VisualTemplateRender";

export default function TemplatePreviewModal({ template, onClose }) {
  if (!template) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-[#0d1117] border border-white/10 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-white/8">
          <div className="flex items-center gap-2 mb-2">
            <span className="rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/20 px-2.5 py-0.5 text-[11px] font-semibold text-[#00d4ff]">
              {template.industry}
            </span>
            {template.layout && (
              <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] font-semibold text-white/50">
                {template.layout}
              </span>
            )}
            <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] font-mono text-white/30">
              {template.template_id}
            </span>
          </div>
          <h2 className="text-xl font-black text-white">{template.name}</h2>
          {template.family && <p className="text-sm text-white/40 mt-0.5">{template.family}</p>}
        </div>

        {/* Full preview */}
        <div className="p-6 flex items-center justify-center bg-black/30" style={{ minHeight: "420px" }}>
          <VisualTemplateRender template={template} displayW={template.category === "mobile_app" ? 300 : 720} />
        </div>

        {/* Description */}
        <div className="px-6 py-5 border-t border-white/8 space-y-4">
          {template.head && (
            <div>
              <div className="text-[10px] font-bold tracking-[0.15em] text-white/30 uppercase mb-1">Headline</div>
              <p className="text-sm text-white/80">{template.head}</p>
            </div>
          )}
          {template.sub && (
            <div>
              <div className="text-[10px] font-bold tracking-[0.15em] text-white/30 uppercase mb-1">Subheadline</div>
              <p className="text-sm text-white/60">{template.sub}</p>
            </div>
          )}
          {template.feature && (
            <div>
              <div className="text-[10px] font-bold tracking-[0.15em] text-white/30 uppercase mb-1">Feature</div>
              <p className="text-sm text-white/60">{template.feature}</p>
              {template.feature_copy && <p className="text-sm text-white/40 mt-1">{template.feature_copy}</p>}
            </div>
          )}

          {/* Color palette */}
          <div>
            <div className="text-[10px] font-bold tracking-[0.15em] text-white/30 uppercase mb-2">Color Palette</div>
            <div className="flex items-center gap-3">
              {["tone", "ink", "accent"].map((k) => template[k] && (
                <div key={k} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg border border-white/10" style={{ background: template[k] }} />
                  <span className="text-[11px] font-mono text-white/40">{template[k]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3 pt-2">
            <a
              href="/portal"
              className="inline-flex items-center gap-2 rounded-full bg-[#00d4ff] px-5 py-2.5 text-sm font-bold text-[#0a0e14] hover:brightness-110 transition"
            >
              Customize This Template <ArrowRight className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white/60 hover:text-white hover:border-white/30 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}