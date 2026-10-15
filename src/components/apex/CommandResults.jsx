import { CheckCircle2, ExternalLink, Rocket, Plus, ShieldCheck, Megaphone } from "lucide-react";

// Final results screen — shows all generated artifacts with links and a restart option.
export default function CommandResults({ results, onRestart }) {
  const { projectId, deployUrl, complianceScore, socialPosts, assets } = results;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      <div className="inline-flex w-16 h-16 rounded-2xl bg-emerald-100 items-center justify-center mb-6">
        <CheckCircle2 className="w-8 h-8 text-emerald-600" />
      </div>
      <h2 className="text-2xl font-black text-slate-900 mb-2">Mission Complete</h2>
      <p className="text-slate-500 mb-6">
        Your business system has been generated, validated, and saved. All artifacts are in your library.
      </p>

      <div className="grid grid-cols-2 gap-3 mb-6 text-left">
        {complianceScore !== undefined && (
          <ResultCard icon={ShieldCheck} label="Compliance Score" value={`${complianceScore}%`} color={complianceScore >= 90 ? "text-emerald-600" : "text-amber-600"} />
        )}
        {socialPosts > 0 && (
          <ResultCard icon={Megaphone} label="Social Posts" value={`${socialPosts} scheduled`} color="text-purple-600" />
        )}
        {assets?.logoUrl && (
          <ResultCard icon={Rocket} label="Brand Assets" value="Logo + Hero" color="text-[#00d4ff]" />
        )}
        {deployUrl && (
          <ResultCard icon={ExternalLink} label="Deployed" value="Live URL" color="text-emerald-600" />
        )}
      </div>

      {deployUrl && (
        <a href={deployUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#00d4ff] hover:underline mb-6 break-all">
          <ExternalLink className="w-4 h-4 shrink-0" /> {deployUrl}
        </a>
      )}

      <div className="flex items-center justify-center gap-3">
        <button
          onClick={onRestart}
          className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition"
        >
          <Plus className="w-4 h-4" /> New Command
        </button>
        {projectId && (
          <a
            href="/launch-monitor"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 hover:text-[#00d4ff] hover:border-[#00d4ff]/40 transition"
          >
            <Rocket className="w-4 h-4" /> View in Launch Monitor
          </a>
        )}
      </div>
    </div>
  );
}

function ResultCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
        <Icon className={`h-3.5 w-3.5 ${color}`} /> {label}
      </div>
      <div className="text-lg font-bold text-slate-900">{value}</div>
    </div>
  );
}