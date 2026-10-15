import { Loader2, ArrowRight, Sparkles } from "lucide-react";

// Shared shell for every Auto Builder step — keeps the journey visually consistent.
// White card on white page, dark text, accent-colored action button.
export default function AutoStepShell({ step, accent, title, subtitle, children, onApprove, approveLabel = "Approve & Continue", loading, canApprove = true }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-6">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
          Step {step} of 12
        </div>
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
        {subtitle && <p className="text-slate-500 mt-1.5 max-w-xl">{subtitle}</p>}
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        {children}
      </div>
      {onApprove && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={onApprove}
            disabled={loading || !canApprove}
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white transition disabled:opacity-50 hover:brightness-110"
            style={{ background: accent }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? "Working…" : approveLabel}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      )}
    </div>
  );
}