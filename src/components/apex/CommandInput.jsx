import { Loader2, Sparkles, ArrowRight, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

// The command input phase — textarea with example prompts and a submit button.
export default function CommandInput({ objective, setObjective, onSubmit, loading }) {
  const examples = [
    "Research the best roofing software business opportunity, create a premium website with AI estimator, 30-day social campaign, and analytics",
    "Build a premium dental practice website for Austin TX with online booking, brand identity, and Google compliance",
    "Create a B2B procurement portal for industrial supplies with CRM, lead capture funnel, and 30-day LinkedIn campaign",
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="inline-flex w-16 h-16 rounded-2xl bg-[#00d4ff]/10 items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-[#00d4ff]" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">APEX Universal Build Command</h1>
        <p className="text-slate-500 max-w-xl mx-auto">
          Describe your business objective in one sentence. The system will decompose it into a verified execution plan and orchestrate research, website generation, branding, compliance, and marketing.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        <textarea
          value={objective}
          onChange={(e) => setObjective(e.target.value)}
          rows={4}
          placeholder="e.g., Build a premium industrial roofing SaaS business with a website, customer portal, AI estimator, CRM, 30-day social campaign, branded videos, analytics, and provisioning-ready launch"
          className="w-full resize-none rounded-xl bg-transparent px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />
        <div className="flex items-center justify-between px-3 pb-2">
          <span className="text-[11px] text-slate-400">{objective.length} chars</span>
          <button
            onClick={onSubmit}
            disabled={loading || objective.trim().length < 10}
            className="inline-flex items-center gap-2 rounded-full bg-[#00d4ff] px-6 py-2.5 text-sm font-bold text-[#0a0e14] hover:brightness-110 hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] transition disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? "Decomposing…" : "Decompose Command"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="mt-6">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Example Commands</div>
        <div className="space-y-2">
          {examples.map((ex, i) => (
            <button
              key={i}
              onClick={() => setObjective(ex)}
              className="w-full text-left rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-600 hover:border-[#00d4ff]/40 hover:text-slate-900 transition"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}