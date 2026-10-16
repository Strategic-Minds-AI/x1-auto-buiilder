import { CheckCircle2, XCircle, AlertTriangle, TrendingUp, Gavel } from "lucide-react";

const VERDICT_STYLES = {
  pass: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", label: "PASS", desc: "Ready to deploy" },
  conditional_pass: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", label: "CONDITIONAL PASS", desc: "Deploy but monitor" },
  fail: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", label: "FAIL", desc: "Do not deploy" },
};

function ScoreBar({ label, score }) {
  const color = score >= 80 ? "bg-emerald-500" : score >= 65 ? "bg-amber-500" : "bg-red-500";
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-slate-600">{label}</span>
        <span className="text-xs font-bold text-slate-800">{score}/100</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

export default function ValidatorVerdict({ data }) {
  if (!data || data.ok === false) return null;

  const verdict = data.verdict || "fail";
  const style = VERDICT_STYLES[verdict] || VERDICT_STYLES.fail;
  const ga = data.google_assessment || {};
  const ha = data.human_assessment || {};

  return (
    <div className={`mt-4 rounded-xl border-2 ${style.border} ${style.bg} p-4`}>
      {/* Verdict header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <Gavel className="w-5 h-5 text-slate-700" />
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-black ${style.text}`}>{style.label}</span>
              <span className="text-xs text-slate-500">· {style.desc}</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Validator Agent — Final Judgment</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-slate-900">{data.overall_score || 0}</div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Overall</div>
        </div>
      </div>

      {/* Two-column scores */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Google's Judgment */}
        <div className="rounded-lg bg-white border border-slate-200 p-3">
          <p className="text-xs font-bold text-slate-700 mb-2.5 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
            How Google Judges
          </p>
          <div className="space-y-2">
            <ScoreBar label="E-E-A-T" score={ga.eeat_score || 0} />
            <ScoreBar label="Helpful Content" score={ga.helpful_content_score || 0} />
            <ScoreBar label="SEO" score={ga.seo_score || 0} />
          </div>
          {ga.spam_risk && ga.spam_risk !== "none" && (
            <p className="mt-2 text-xs font-semibold text-amber-600">Spam risk: {ga.spam_risk}</p>
          )}
        </div>

        {/* Human Judgment */}
        <div className="rounded-lg bg-white border border-slate-200 p-3">
          <p className="text-xs font-bold text-slate-700 mb-2.5 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            How Humans Judge
          </p>
          <div className="space-y-2">
            <ScoreBar label="Trust" score={ha.trust_score || 0} />
            <ScoreBar label="Clarity" score={ha.clarity_score || 0} />
            <ScoreBar label="Persuasion" score={ha.persuasion_score || 0} />
            <ScoreBar label="Conversion" score={ha.conversion_score || 0} />
          </div>
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <p className="text-xs text-slate-600 italic mb-3">{data.summary}</p>
      )}

      {/* Critical issues */}
      {data.critical_issues?.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-bold text-red-600 mb-1.5 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            Critical Issues ({data.critical_issues.length})
          </p>
          <ul className="space-y-1">
            {data.critical_issues.map((issue, i) => (
              <li key={i} className="text-xs text-red-600 flex items-start gap-1.5">
                <XCircle className="w-3 h-3 mt-0.5 shrink-0" />
                <span>{issue}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {data.recommendations?.length > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-700 mb-1.5">Recommendations</p>
          <ul className="space-y-1">
            {data.recommendations.map((rec, i) => (
              <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0 text-emerald-500" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}