import { useRef, useEffect } from "react";
import { AUTO_STEPS } from "@/lib/autoBuilderSteps";

// Horizontal step-by-step timeline pinned to the top of the Auto Builder.
// White strip with dark step nodes; the current step glows in the accent color.
// Steps not yet ready render dimmed with a "soon" dot so the full path is visible.
export default function AutoBuilderTimeline({ currentKey, accent }) {
  const scrollRef = useRef(null);
  const currentIdx = AUTO_STEPS.findIndex((s) => s.key === currentKey);

  useEffect(() => {
    const el = scrollRef.current?.querySelector(`[data-idx="${currentIdx}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [currentIdx]);

  return (
    <div className="sticky top-0 z-20 bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4">
        <div
          ref={scrollRef}
          className="flex items-center gap-1 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {AUTO_STEPS.map((step, i) => {
            const Icon = step.icon;
            const isCurrent = i === currentIdx;
            const isDone = i < currentIdx;
            const soon = !step.ready;
            return (
              <div key={step.key} className="flex items-center shrink-0" data-idx={i}>
                <button
                  type="button"
                  disabled={soon}
                  className="group flex cursor-pointer flex-col items-center gap-1.5"
                >
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full border-2 transition"
                    style={{
                      borderColor: isCurrent ? accent : soon ? "#cbd5e1" : isDone ? accent : "#e2e8f0",
                      background: isCurrent ? accent : soon ? "#f1f5f9" : isDone ? accent : "#fff",
                      color: isCurrent || isDone ? "#fff" : soon ? "#94a3b8" : "#475569",
                      boxShadow: isCurrent ? `0 0 0 4px ${accent}33` : "none",
                    }}
                  >
                    {soon ? <span className="h-1.5 w-1.5 rounded-full bg-slate-400" /> : <Icon className="h-4 w-4" />}
                  </span>
                  <span
                    className="text-[11px] font-semibold whitespace-nowrap"
                    style={{ color: isCurrent ? "#0f172a" : soon ? "#94a3b8" : isDone ? "#334155" : "#64748b" }}
                  >
                    {step.label}
                  </span>
                </button>
                {i < AUTO_STEPS.length - 1 && (
                  <span
                    className="mx-1 h-0.5 w-6 rounded-full"
                    style={{ background: i < currentIdx ? accent : "#e2e8f0" }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}