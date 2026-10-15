import { useState, useEffect } from "react";
import { X, Monitor, Tablet, Smartphone, ExternalLink, Save, Check, Info, Maximize2 } from "lucide-react";
import VisualTemplateRender from "@/components/shared/VisualTemplateRender";

// Universal fullscreen library viewer — opens any DesignTemplate in a modal
// with device toggles, metadata panel, and action buttons.
export default function TemplateViewer({ template, onClose, onSelect }) {
  const [device, setDevice] = useState("desktop");
  const [showDetails, setShowDetails] = useState(true);

  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  if (!template) return null;

  const isMobile = template.category === "mobile_app";
  const displayW = device === "mobile" ? 280 : device === "tablet" ? 520 : 900;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-6xl h-[90vh] bg-[#0d1117] rounded-2xl border border-white/10 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/8 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-mono text-white/40">{template.template_id}</span>
            </div>
            <h3 className="text-sm font-bold text-white truncate">{template.name}</h3>
            <span className="hidden sm:inline text-[11px] text-white/40">{template.industry}</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Device toggle */}
            {!isMobile && (
              <div className="flex items-center gap-1 rounded-lg bg-white/5 p-0.5">
                <DeviceBtn active={device === "desktop"} onClick={() => setDevice("desktop")} icon={Monitor} />
                <DeviceBtn active={device === "tablet"} onClick={() => setDevice("tablet")} icon={Tablet} />
                <DeviceBtn active={device === "mobile"} onClick={() => setDevice("mobile")} icon={Smartphone} />
              </div>
            )}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className={`rounded-lg p-2 text-xs font-semibold transition ${showDetails ? "bg-[#00d4ff]/10 text-[#00d4ff]" : "text-white/50 hover:text-white hover:bg-white/5"}`}
              title="Toggle details"
            >
              <Info className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="rounded-lg p-2 text-white/50 hover:text-white hover:bg-white/5 transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 flex min-h-0">
          {/* Preview area */}
          <div className="flex-1 flex items-center justify-center overflow-auto bg-black/30 p-6">
            <div className="flex items-center justify-center" style={{ minWidth: displayW + 40 }}>
              <VisualTemplateRender template={template} displayW={displayW} />
            </div>
          </div>

          {/* Details panel */}
          {showDetails && (
            <aside className="w-72 shrink-0 border-l border-white/8 bg-[#0d1117] overflow-y-auto p-5 space-y-4">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-1.5">Design Family</div>
                <p className="text-xs text-white/70">{template.family || "—"}</p>
              </div>
              {template.head && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-1.5">Headline</div>
                  <p className="text-xs text-white/70">{template.head}</p>
                </div>
              )}
              {template.sub && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-1.5">Subheadline</div>
                  <p className="text-xs text-white/70">{template.sub}</p>
                </div>
              )}
              {template.cta && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-1.5">CTA</div>
                  <p className="text-xs text-white/70">{template.cta}</p>
                </div>
              )}
              {template.layout && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-1.5">Layout</div>
                  <span className="rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/20 px-2.5 py-1 text-[10px] font-semibold text-[#00d4ff]">{template.layout}</span>
                </div>
              )}
              {template.interactive && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-1.5">Interactive</div>
                  <span className="text-xs text-white/70">{template.interactive}</span>
                </div>
              )}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-2">Color Tokens</div>
                <div className="flex items-center gap-2">
                  {["tone", "ink", "accent"].map((k) => template[k] && (
                    <div key={k} className="text-center">
                      <div className="w-10 h-10 rounded-lg border border-white/10 mb-1" style={{ background: template[k] }} />
                      <div className="text-[8px] font-mono text-white/30">{k}</div>
                    </div>
                  ))}
                </div>
              </div>
              {template.source_package && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-1.5">Source</div>
                  <p className="text-xs text-white/50">{template.source_package}</p>
                </div>
              )}
            </aside>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-white/8 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelect?.(template)}
              className="inline-flex items-center gap-2 rounded-full bg-[#00d4ff] px-5 py-2 text-xs font-bold text-[#0a0e14] hover:brightness-110 transition"
            >
              <Check className="w-3.5 h-3.5" /> Select Template
            </button>
            <button className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-white/70 hover:bg-white/5 hover:text-white transition">
              <Save className="w-3.5 h-3.5" /> Save
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 text-[10px] text-white/30">
              <Maximize2 className="w-3 h-3" /> {displayW}px preview
            </span>
            <button className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-white/70 hover:bg-white/5 hover:text-white transition">
              <ExternalLink className="w-3.5 h-3.5" /> Open in Browser
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeviceBtn({ active, onClick, icon: Icon }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md p-1.5 transition ${active ? "bg-[#00d4ff] text-[#0a0e14]" : "text-white/40 hover:text-white"}`}
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  );
}