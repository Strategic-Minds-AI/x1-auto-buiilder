import { useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell,
} from "recharts";
import { ShieldCheck, Wand2, Loader2, Rocket, AlertCircle, CheckCircle2, XCircle, Gauge } from "lucide-react";

const TARGET_SCORE = 90;
const CATEGORIES = ["SEO", "AEO", "GEO", "Technical", "Content"];

export default function CompliancePanel({ projectIds, onDeployed }) {
  const [reports, setReports] = useState({});
  const [checking, setChecking] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [deployResults, setDeployResults] = useState(null);
  const [error, setError] = useState("");

  const runChecks = async () => {
    setChecking(true); setError("");
    const newReports = {};
    await Promise.allSettled(
      projectIds.map(async (id) => {
        try {
          const res = await base44.functions.invoke("runComplianceCheck", { projectId: id });
          newReports[id] = res.data.report;
        } catch (err) {
          newReports[id] = { error: err.response?.data?.error || err.message };
        }
      })
    );
    setReports(newReports);
    setChecking(false);
  };

  const autoFixAll = async () => {
    setFixing(true); setError("");
    const newReports = { ...reports };
    await Promise.allSettled(
      projectIds.map(async (id) => {
        try {
          const res = await base44.functions.invoke("autoFixCompliance", { projectId: id });
          newReports[id] = res.data.report;
        } catch (err) {
          newReports[id] = { error: err.response?.data?.error || err.message };
        }
      })
    );
    setReports(newReports);
    setFixing(false);
  };

  const batchDeploy = async () => {
    setDeploying(true); setError(""); setDeployResults(null);
    try {
      const res = await base44.functions.invoke("batchDeploy", { projectIds });
      setDeployResults(res.data);
      if (onDeployed) onDeployed(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Deploy failed");
    } finally {
      setDeploying(false);
    }
  };

  const chartData = projectIds.map((id) => {
    const r = reports[id];
    return {
      name: (r?.checks?.length ? id.slice(0, 6) : id.slice(0, 6)),
      before: r?.previous_score || 0,
      after: r?.overall_score || 0,
    };
  });

  const allCompliant = projectIds.every((id) => (reports[id]?.overall_score || 0) >= TARGET_SCORE);

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={runChecks}
          disabled={checking || fixing || deploying || projectIds.length === 0}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-accent-foreground disabled:opacity-50"
        >
          {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
          Run Compliance Check
        </button>
        <button
          onClick={autoFixAll}
          disabled={fixing || checking || deploying || projectIds.length === 0}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50"
        >
          {fixing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
          Auto-Fix & Harden All
        </button>
        <button
          onClick={batchDeploy}
          disabled={deploying || checking || fixing || projectIds.length === 0}
          className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
        >
          {deploying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
          Batch Deploy to Vercel
        </button>
        {allCompliant && projectIds.length > 0 && Object.keys(reports).length > 0 && (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-400">
            <CheckCircle2 className="w-4 h-4" /> All sites meet {TARGET_SCORE}% compliance
          </span>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 text-destructive text-sm p-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Score Grid */}
      {Object.keys(reports).length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {projectIds.map((id) => {
            const r = reports[id];
            if (!r) return null;
            const score = r.overall_score || 0;
            const scoreColor = score >= TARGET_SCORE ? "text-emerald-400" : score >= 70 ? "text-amber-400" : "text-destructive";
            return (
              <div key={id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-muted-foreground">{id.slice(0, 8)}</span>
                  {r.previous_score != null && (
                    <span className="text-xs text-muted-foreground">
                      {r.previous_score} → <span className={scoreColor}>{score}</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`text-3xl font-bold ${scoreColor}`}>{score}</div>
                  <div className="text-xs text-muted-foreground">/ 100</div>
                  {r.status === "fixed" && <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-auto" />}
                </div>
                {/* Category bars */}
                <div className="space-y-1.5">
                  {CATEGORIES.map((cat) => {
                    const val = Math.round(r.category_scores?.[cat] || 0);
                    return (
                      <div key={cat} className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground w-16 shrink-0">{cat}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-background/60 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${val >= TARGET_SCORE ? "bg-emerald-500" : val >= 70 ? "bg-amber-500" : "bg-destructive"}`}
                            style={{ width: `${val}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono w-6 text-right">{val}</span>
                      </div>
                    );
                  })}
                </div>
                {/* Auto-fixed count */}
                {r.checks?.some((c) => c.auto_fixed) && (
                  <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
                    <Wand2 className="w-3 h-3" /> {r.checks.filter((c) => c.auto_fixed).length} checks auto-fixed
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Visual Proof Chart */}
      {chartData.some((d) => d.after > 0) && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5" /> Compliance Score: Before vs After Auto-Fix
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
              />
              <ReferenceLine y={TARGET_SCORE} stroke="hsl(var(--primary))" strokeDasharray="5 5" label={{ value: "Target 90%", fill: "hsl(var(--primary))", fontSize: 10, position: "top" }} />
              <Bar dataKey="before" name="Before" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="after" name="After" radius={[4, 4, 0, 0]}>
                {chartData.map((d, i) => (
                  <Cell key={i} fill={d.after >= TARGET_SCORE ? "#10b981" : "#f59e0b"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Deploy Results */}
      {deployResults && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Batch Deploy Results — {deployResults.succeeded} succeeded, {deployResults.failed} failed
          </div>
          <div className="space-y-2">
            {deployResults.results.map((r) => (
              <div key={r.projectId} className="flex items-center gap-3 rounded-lg border border-border p-3">
                {r.status === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-destructive shrink-0" />
                )}
                <span className="text-xs font-mono text-muted-foreground">{r.projectId.slice(0, 8)}</span>
                {r.url ? (
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline break-all">
                    {r.url}
                  </a>
                ) : (
                  <span className="text-sm text-destructive">{r.error}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}