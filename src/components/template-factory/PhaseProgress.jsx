import { CheckCircle2, Loader2, Circle, XCircle } from "lucide-react";

const PHASES = [
  { key: "discovering", label: "Discover", icon: "🔍", pct: 5 },
  { key: "benchmarking", label: "Benchmark", icon: "📊", pct: 20 },
  { key: "capturing", label: "Capture", icon: "📸", pct: 35 },
  { key: "reverse_engineering", label: "Reverse Engineer", icon: "🔬", pct: 50 },
  { key: "architecting", label: "Architect", icon: "🏗️", pct: 65 },
  { key: "engineering", label: "Engineer", icon: "⚙️", pct: 80 },
  { key: "completed", label: "Complete", icon: "✅", pct: 100 },
];

export default function PhaseProgress({ status, progressPct }) {
  const currentIdx = PHASES.findIndex((p) => p.key === status);
  const failed = status === "failed";

  return (
    <div className="flex items-center gap-1">
      {PHASES.map((phase, idx) => {
        const isDone = idx < currentIdx || status === "completed";
        const isActive = idx === currentIdx && status !== "completed" && !failed;
        const isFailed = failed && idx === currentIdx;

        return (
          <div key={phase.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition ${
                  isDone
                    ? "bg-emerald-500 text-white"
                    : isActive
                    ? "bg-[#00d4ff] text-[#0a0e14] ring-4 ring-[#00d4ff]/20"
                    : isFailed
                    ? "bg-red-500 text-white"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : isActive ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isFailed ? (
                  <XCircle className="w-4 h-4" />
                ) : (
                  <span className="text-xs">{idx + 1}</span>
                )}
              </div>
              <span
                className={`text-[10px] font-bold whitespace-nowrap ${
                  isDone
                    ? "text-emerald-600"
                    : isActive
                    ? "text-[#00d4ff]"
                    : isFailed
                    ? "text-red-500"
                    : "text-slate-400"
                }`}
              >
                {phase.label}
              </span>
            </div>
            {idx < PHASES.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-1 rounded-full transition ${
                  isDone ? "bg-emerald-500" : "bg-slate-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}