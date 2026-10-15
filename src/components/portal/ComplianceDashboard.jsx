import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import {
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, Cell, LineChart, Line
} from "recharts";
import {
  Shield, ShieldCheck, ShieldAlert, Loader2, RefreshCw, ChevronDown,
  ChevronUp, Globe, TrendingUp, Wrench, CheckCircle2, XCircle, AlertTriangle,
  FileText, Download, Activity, PieChart as PieIcon
} from "lucide-react";
import { PieChart, Pie, AreaChart, Area, Cell as PieCell } from "recharts";
import BackButton from "@/components/shared/BackButton";

const CATEGORIES = ["SEO", "AEO", "GEO", "Technical", "Content"];
const CATEGORY_COLORS = {
  SEO: "#00d4ff", AEO: "#0066ff", GEO: "#8b5cf6", Technical: "#f59e0b", Content: "#10b981"
};

export default function ComplianceDashboard() {
  const [projects, setProjects] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [running, setRunning] = useState(null);
  const [fixing, setFixing] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [projRes, repRes] = await Promise.all([
        base44.entities.WebsiteProject.filter(
          { status: { $in: ["generated", "preview_ready", "approved"] } },
          { sort: "-created_date", limit: 100, fields: ["id", "business_name", "industry", "location", "status", "deploy_url", "created_date"] }
        ),
        base44.entities.ComplianceReport.filter(
          {},
          { sort: "-created_date", limit: 500, fields: ["id", "project_id", "overall_score", "category_scores", "checks", "recommendations", "status", "round", "previous_score", "created_date"] }
        ),
      ]);
      setProjects(projRes.items || []);
      setReports(repRes.items || []);
    } catch { setProjects([]); setReports([]); }
    finally { setLoading(false); }
  };

  // Match reports to projects (latest report per project)
  const siteReports = useMemo(() => {
    const byProject = {};
    (reports || []).forEach(r => {
      const pid = r.project_id;
      if (!pid) return;
      if (!byProject[pid] || new Date(r.created_date) > new Date(byProject[pid].created_date)) {
        byProject[pid] = r;
      }
    });
    return byProject;
  }, [reports]);

  const stats = useMemo(() => {
    const scored = Object.values(siteReports);
    const total = scored.length;
    const passing = scored.filter(r => (r.overall_score || 0) >= 80).length;
    const needsFix = scored.filter(r => (r.overall_score || 0) < 80 && (r.overall_score || 0) >= 50).length;
    const failing = scored.filter(r => (r.overall_score || 0) < 50).length;
    const avg = total > 0 ? Math.round(scored.reduce((s, r) => s + (r.overall_score || 0), 0) / total) : 0;
    const fixed = scored.filter(r => r.round && r.round > 1 && r.previous_score != null).length;
    const avgImprovement = fixed > 0
      ? Math.round(scored.filter(r => r.previous_score != null).reduce((s, r) => s + ((r.overall_score || 0) - (r.previous_score || 0)), 0) / fixed)
      : 0;
    return { total, passing, needsFix, failing, avg, fixed, avgImprovement };
  }, [siteReports]);

  // Bar chart data: overall score per site
  const scoreChartData = useMemo(() => {
    return projects.map(p => ({
      name: (p.business_name || "Untitled").slice(0, 18),
      score: siteReports[p.id]?.overall_score || 0,
      status: siteReports[p.id]?.status || "pending",
    }));
  }, [projects, siteReports]);

  // Radar chart data: average category scores
  const radarData = useMemo(() => {
    const scored = Object.values(siteReports).filter(r => r.category_scores);
    if (scored.length === 0) return CATEGORIES.map(c => ({ category: c, score: 0 }));
    return CATEGORIES.map(cat => ({
      category: cat,
      score: Math.round(scored.reduce((s, r) => s + (r.category_scores?.[cat] || 0), 0) / scored.length),
    }));
  }, [siteReports]);

  // Score trend over time (all reports chronologically)
  const trendData = useMemo(() => {
    const sorted = [...reports].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    return sorted.map((r, i) => ({
      date: new Date(r.created_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      score: r.overall_score || 0,
      round: r.round || 1,
      idx: i
    }));
  }, [reports]);

  // Status distribution for pie chart
  const statusDistribution = useMemo(() => {
    const scored = Object.values(siteReports);
    return [
      { name: "Passing (80+)", value: scored.filter(r => (r.overall_score || 0) >= 80).length, color: "#10b981" },
      { name: "Needs Fix (50-79)", value: scored.filter(r => (r.overall_score || 0) >= 50 && (r.overall_score || 0) < 80).length, color: "#f59e0b" },
      { name: "Failing (<50)", value: scored.filter(r => (r.overall_score || 0) < 50).length, color: "#ef4444" },
      { name: "Pending", value: projects.length - scored.length, color: "#94a3b8" },
    ].filter(d => d.value > 0);
  }, [siteReports, projects]);

  // Before/after comparison data
  const fixComparisonData = useMemo(() => {
    return Object.values(siteReports)
      .filter(r => r.previous_score != null && r.round && r.round > 1)
      .map(r => ({
        name: projects.find(p => p.id === r.project_id)?.business_name?.slice(0, 14) || "Site",
        before: r.previous_score || 0,
        after: r.overall_score || 0,
      }));
  }, [siteReports, projects]);

  const runCheck = async (projectId) => {
    setRunning(projectId);
    try {
      await base44.functions.invoke("runComplianceCheck", { projectId });
      await load();
    } catch (e) { alert("Compliance check failed: " + (e.message || "unknown")); }
    finally { setRunning(null); }
  };

  const runAutoFix = async (projectId) => {
    setFixing(projectId);
    try {
      await base44.functions.invoke("autoFixCompliance", { projectId });
      await load();
    } catch (e) { alert("Auto-fix failed: " + (e.message || "unknown")); }
    finally { setFixing(null); }
  };

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-[#00d4ff]" /></div>;
  }

  return (
    <div className="p-6 lg:p-8">
      <BackButton />
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00d4ff]/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#00d4ff]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Compliance Engine</h1>
            <p className="text-sm text-slate-500">Live Google compliance scoring and automated status reports</p>
          </div>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:text-[#00d4ff] hover:border-[#00d4ff]/40 transition"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard icon={Globe} label="Active Sites" value={stats.total} color="#00d4ff" />
        <StatCard icon={ShieldCheck} label="Passing (80+)" value={stats.passing} color="#10b981" />
        <StatCard icon={ShieldAlert} label="Needs Fix" value={stats.needsFix} color="#f59e0b" />
        <StatCard icon={XCircle} label="Failing (<50)" value={stats.failing} color="#ef4444" />
        <StatCard icon={TrendingUp} label="Avg Score" value={stats.avg} suffix="/100" color="#0066ff" />
      </div>

      {stats.fixed > 0 && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="rounded-2xl bg-white border border-slate-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#10b981]/10 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-[#10b981]" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">{stats.fixed}</div>
              <div className="text-xs text-slate-500">Sites auto-fixed</div>
            </div>
          </div>
          <div className="rounded-2xl bg-white border border-slate-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00d4ff]/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#00d4ff]" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">+{stats.avgImprovement}</div>
              <div className="text-xs text-slate-500">Avg improvement after auto-fix</div>
            </div>
          </div>
        </div>
      )}

      {/* Score trend over time */}
      {trendData.length > 0 && (
        <div className="rounded-2xl bg-white border border-slate-200 p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-[#00d4ff]" />
            <h3 className="text-sm font-bold text-slate-900">Compliance Score Trend Over Time</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} interval="preserveStartEnd" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#64748b" }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
              <Area type="monotone" dataKey="score" stroke="#00d4ff" strokeWidth={2} fill="url(#scoreGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Status distribution pie + charts */}
      {statusDistribution.length > 0 && (
        <div className="rounded-2xl bg-white border border-slate-200 p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <PieIcon className="w-4 h-4 text-[#00d4ff]" />
            <h3 className="text-sm font-bold text-slate-900">Site Status Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40} label>
                {statusDistribution.map((entry, i) => (
                  <PieCell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Score per site */}
        <div className="rounded-2xl bg-white border border-slate-200 p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Compliance Scores by Site</h3>
          {scoreChartData.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={scoreChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#64748b" }} interval={0} angle={-25} textAnchor="end" height={60} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#64748b" }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                  {scoreChartData.map((entry, i) => (
                    <Cell key={i} fill={entry.score >= 80 ? "#10b981" : entry.score >= 50 ? "#f59e0b" : "#ef4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category radar */}
        <div className="rounded-2xl bg-white border border-slate-200 p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Category Breakdown (Average)</h3>
          {radarData.every(d => d.score === 0) ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="category" tick={{ fontSize: 11, fill: "#64748b" }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9, fill: "#94a3b8" }} />
                <Radar name="Score" dataKey="score" stroke="#00d4ff" fill="#00d4ff" fillOpacity={0.3} strokeWidth={2} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Before/after comparison */}
      {fixComparisonData.length > 0 && (
        <div className="rounded-2xl bg-white border border-slate-200 p-5 mb-6">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Auto-Fix Impact: Before vs After</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={fixComparisonData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#64748b" }} interval={0} angle={-25} textAnchor="end" height={60} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#64748b" }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="before" name="Before Fix" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="after" name="After Fix" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Per-site detailed reports */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900">Site Status Reports</h3>
          <p className="text-xs text-slate-500 mt-0.5">Detailed compliance breakdown per active site</p>
        </div>
        <div className="divide-y divide-slate-100">
          {projects.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <Globe className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p className="text-sm text-slate-500">No active sites yet. Generate websites to see compliance reports.</p>
            </div>
          ) : (
            projects.map(p => {
              const report = siteReports[p.id];
              const isOpen = expanded === p.id;
              return (
                <SiteReportRow
                  key={p.id}
                  project={p}
                  report={report}
                  isOpen={isOpen}
                  onToggle={() => setExpanded(isOpen ? null : p.id)}
                  onRunCheck={() => runCheck(p.id)}
                  onAutoFix={() => runAutoFix(p.id)}
                  running={running === p.id}
                  fixing={fixing === p.id}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, suffix, color }) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <div className="text-2xl font-black text-slate-900">{value}{suffix}</div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex items-center justify-center h-[260px] text-slate-400 text-sm">
      No compliance data yet. Run a compliance check on a site.
    </div>
  );
}

function SiteReportRow({ project, report, isOpen, onToggle, onRunCheck, onAutoFix, running, fixing }) {
  const score = report?.overall_score || 0;
  const scoreColor = score >= 80 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  const statusBadge = report?.status || "pending";

  const checkStats = useMemo(() => {
    if (!report?.checks) return { pass: 0, fail: 0, warn: 0 };
    return {
      pass: report.checks.filter(c => c.status === "pass").length,
      fail: report.checks.filter(c => c.status === "fail").length,
      warn: report.checks.filter(c => c.status === "warning").length,
    };
  }, [report]);

  return (
    <div>
      <button onClick={onToggle} className="w-full px-5 py-4 flex items-center gap-4 hover:bg-slate-50 transition text-left">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${scoreColor}15` }}>
            <span className="text-lg font-black" style={{ color: scoreColor }}>{score || "—"}</span>
          </div>
          <div className="min-w-0">
            <div className="font-bold text-sm text-slate-900 truncate">{project.business_name || "Untitled"}</div>
            <div className="text-xs text-slate-500 truncate">{project.industry}{project.location ? ` · ${project.location}` : ""}</div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-4 shrink-0">
          {report && (
            <>
              <div className="flex items-center gap-2">
                <CheckBadge icon={CheckCircle2} count={checkStats.pass} color="#10b981" />
                <CheckBadge icon={AlertTriangle} count={checkStats.warn} color="#f59e0b" />
                <CheckBadge icon={XCircle} count={checkStats.fail} color="#ef4444" />
              </div>
              <StatusBadge status={statusBadge} />
            </>
          )}
          {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {isOpen && (
        <div className="px-5 pb-5 bg-slate-50/50 border-t border-slate-100">
          {report ? (
            <>
              {/* Category scores */}
              <div className="grid grid-cols-5 gap-3 mt-4">
                {CATEGORIES.map(cat => {
                  const val = report.category_scores?.[cat] || 0;
                  const c = val >= 80 ? "#10b981" : val >= 50 ? "#f59e0b" : "#ef4444";
                  return (
                    <div key={cat} className="rounded-xl bg-white border border-slate-200 p-3 text-center">
                      <div className="text-lg font-black" style={{ color: c }}>{val}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{cat}</div>
                      <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${val}%`, background: c }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Before/after mini bar */}
              {report.previous_score != null && (
                <div className="mt-3 flex items-center gap-3 text-xs">
                  <span className="text-slate-500">Auto-fix impact:</span>
                  <span className="font-bold text-red-500">{report.previous_score}</span>
                  <span className="text-slate-400">→</span>
                  <span className="font-bold text-green-600">{report.overall_score}</span>
                  <span className="text-green-600 font-bold">(+{report.overall_score - report.previous_score})</span>
                  <span className="rounded-full bg-[#00d4ff]/10 px-2 py-0.5 text-[10px] font-bold text-[#00d4ff]">Round {report.round}</span>
                </div>
              )}

              {/* Check results */}
              <div className="mt-4">
                <div className="text-xs font-bold text-slate-700 mb-2">Individual Checks</div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {(report.checks || []).map((c, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs bg-white rounded-lg border border-slate-100 px-3 py-2">
                      {c.status === "pass" ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                        : c.status === "warning" ? <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        : <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="rounded px-1.5 py-0.5 text-[9px] font-bold" style={{ background: `${CATEGORY_COLORS[c.category]}15`, color: CATEGORY_COLORS[c.category] }}>{c.category}</span>
                          {c.auto_fixed && <span className="rounded bg-[#00d4ff]/10 px-1 py-0.5 text-[9px] font-bold text-[#00d4ff]">AUTO-FIXED</span>}
                        </div>
                        <div className="text-slate-700 mt-1">{c.requirement}</div>
                        {c.status !== "pass" && c.recommendation && (
                          <div className="text-slate-500 mt-1 italic">→ {c.recommendation}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top recommendations */}
              {report.recommendations?.length > 0 && (
                <div className="mt-4">
                  <div className="text-xs font-bold text-slate-700 mb-2">Top Recommendations</div>
                  <ol className="space-y-1.5">
                    {report.recommendations.slice(0, 5).map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                        <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                        {r}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Actions */}
              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={onRunCheck}
                  disabled={running}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-[#00d4ff] hover:border-[#00d4ff]/40 transition disabled:opacity-50"
                >
                  {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  Re-check
                </button>
                {score < 90 && (
                  <button
                    onClick={onAutoFix}
                    disabled={fixing}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#00d4ff] px-3 py-1.5 text-xs font-bold text-[#0a0e14] hover:brightness-110 transition disabled:opacity-50"
                  >
                    {fixing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wrench className="w-3.5 h-3.5" />}
                    Auto-Fix
                  </button>
                )}
                {project.deploy_url && (
                  <a href={project.deploy_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-[#00d4ff] hover:border-[#00d4ff]/40 transition">
                    <Globe className="w-3.5 h-3.5" /> View Site
                  </a>
                )}
              </div>
            </>
          ) : (
            <div className="py-6 text-center">
              <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm text-slate-500 mb-3">No compliance report yet for this site.</p>
              <button
                onClick={onRunCheck}
                disabled={running}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#00d4ff] px-4 py-2 text-xs font-bold text-[#0a0e14] hover:brightness-110 transition disabled:opacity-50"
              >
                {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Shield className="w-3.5 h-3.5" />}
                Run Compliance Check
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CheckBadge({ icon: Icon, count, color }) {
  return (
    <div className="flex items-center gap-1">
      <Icon className="w-3.5 h-3.5" style={{ color }} />
      <span className="text-xs font-bold text-slate-600">{count}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending: { label: "Pending", color: "#94a3b8" },
    checking: { label: "Checking", color: "#00d4ff" },
    scored: { label: "Scored", color: "#0066ff" },
    fixing: { label: "Fixing", color: "#f59e0b" },
    fixed: { label: "Fixed", color: "#10b981" },
    deployed: { label: "Deployed", color: "#10b981" },
  };
  const s = map[status] || map.pending;
  return (
    <span className="rounded-full px-2.5 py-1 text-[10px] font-bold" style={{ background: `${s.color}15`, color: s.color }}>
      {s.label}
    </span>
  );
}