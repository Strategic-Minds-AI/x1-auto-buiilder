import { Globe, Star, TrendingUp, AlertCircle } from "lucide-react";

function ScoreBar({ label, score, color }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-slate-400 w-16 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-[10px] font-bold text-slate-600 w-8 text-right">{score}</span>
    </div>
  );
}

export default function BenchmarkResults({ benchmarks }) {
  if (!benchmarks?.length) return null;

  const sorted = [...benchmarks].sort(
    (a, b) => (b.overall_score || 0) - (a.overall_score || 0)
  );

  return (
    <div className="space-y-3">
      {sorted.map((b, i) => (
        <div
          key={i}
          className="rounded-xl border border-slate-200 p-3 hover:shadow-sm transition"
        >
          <div className="flex items-start gap-3">
            {b.screenshot_url ? (
              <img
                src={b.screenshot_url}
                alt={b.title}
                className="w-20 h-14 rounded-lg object-cover border border-slate-200 shrink-0"
              />
            ) : (
              <div className="w-20 h-14 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <Globe className="w-6 h-6 text-slate-300" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-slate-400">#{i + 1}</span>
                <span className="text-sm font-bold text-slate-700 truncate">
                  {b.title || b.url}
                </span>
                <span
                  className={`ml-auto text-xs font-black px-2 py-0.5 rounded-full ${
                    b.overall_score >= 85
                      ? "bg-emerald-100 text-emerald-700"
                      : b.overall_score >= 70
                      ? "bg-amber-100 text-amber-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {b.overall_score || 0}
                </span>
              </div>
              <a
                href={b.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-[#00d4ff] hover:underline truncate block mb-2"
              >
                {b.url}
              </a>
              <div className="space-y-1">
                <ScoreBar label="Design" score={b.design_score || 0} color="bg-[#00d4ff]" />
                <ScoreBar label="UX" score={b.ux_score || 0} color="bg-blue-400" />
                <ScoreBar label="Convert" score={b.conversion_score || 0} color="bg-purple-400" />
                <ScoreBar label="Content" score={b.content_score || 0} color="bg-emerald-400" />
              </div>
              {b.strengths?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {b.strengths.slice(0, 3).map((s, j) => (
                    <span
                      key={j}
                      className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100"
                    >
                      <TrendingUp className="w-2.5 h-2.5 inline mr-0.5" />
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}