import { Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

// Shows real-time progress through the execution pipeline.
export default function CommandExecutor({ steps }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h2 className="text-xl font-bold text-slate-900 mb-6">Pipeline Execution</h2>
      <div className="space-y-2">
        {steps.map((step, i) => (
          <div
            key={step.key}
            className={`flex items-center gap-3 rounded-xl border p-3.5 transition ${
              step.status === "active" ? "border-[#00d4ff]/40 bg-[#00d4ff]/5" :
              step.status === "done" ? "border-emerald-200 bg-emerald-50/50" :
              step.status === "error" ? "border-red-200 bg-red-50/50" :
              step.status === "skipped" ? "border-slate-200 bg-slate-50 opacity-60" :
              "border-slate-200 bg-white"
            }`}
          >
            <div className="shrink-0">
              {step.status === "active" && <Loader2 className="w-5 h-5 text-[#00d4ff] animate-spin" />}
              {step.status === "done" && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
              {step.status === "error" && <XCircle className="w-5 h-5 text-red-500" />}
              {step.status === "skipped" && <AlertCircle className="w-5 h-5 text-slate-400" />}
              {step.status === "pending" && <div className="w-5 h-5 rounded-full border-2 border-slate-200" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-semibold ${step.status === "pending" ? "text-slate-400" : "text-slate-900"}`}>
                {step.label}
              </div>
              {step.detail && (
                <div className="text-xs text-slate-500 mt-0.5 truncate">{step.detail}</div>
              )}
            </div>
            {step.result && (
              <span className="text-[10px] font-bold text-emerald-600 shrink-0">{step.result}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}