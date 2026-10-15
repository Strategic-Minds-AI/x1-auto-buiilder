import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { GOOGLE_COMPLIANCE_CHECKLIST } from "@/lib/marketingTools";
import { Shield, CheckCircle, AlertTriangle, AlertCircle, Loader2, RefreshCw, Search } from "lucide-react";

const CATEGORY_COLORS = {
  SEO: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" },
  AEO: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200" },
  GEO: { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-200" },
  Technical: { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200" },
  Content: { bg: "bg-pink-50", text: "text-pink-600", border: "border-pink-200" },
};

export default function GoogleCompliancePanel() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadProjects(); }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const page = await base44.entities.WebsiteProject.filter({}, { sort: "-created_date", limit: 50, fields: ["business_name", "industry", "status", "deploy_url"] });
      setProjects(page.items || []);
    } catch { setProjects([]); }
    finally { setLoading(false); }
  };

  const runCheck = async () => {
    if (!selectedProject) return;
    setRunning(true);
    setResults(null);
    try {
      const res = await base44.functions.invoke("runMarketingCompliance", { projectId: selectedProject });
      setResults(res.data || res);
    } catch (e) { alert("Check failed: " + (e.message || "unknown")); }
    finally { setRunning(false); }
  };

  const filteredResults = results?.results?.filter((r) => {
    if (filter === "all") return true;
    if (filter === "fail") return r.status === "fail";
    if (filter === "warn") return r.status === "warn";
    if (filter === "pass") return r.status === "pass";
    return true;
  }) || [];

  const categories = ["all", "SEO", "AEO", "GEO", "Technical", "Content"];
  const statusFilters = ["all", "fail", "warn", "pass"];

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#00d4ff]" /></div>;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Google Compliance Testing System</h3>
            <p className="text-xs text-slate-500">Full SEO, AEO, GEO, Technical, and Content compliance checks against Google standards</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select value={selectedProject || ""} onChange={(e) => setSelectedProject(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-[#00d4ff]/50">
            <option value="">Select a project to test...</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.business_name || "Untitled"} · {p.industry}</option>
            ))}
          </select>
          <button onClick={runCheck} disabled={running || !selectedProject}
            className="inline-flex items-center gap-2 rounded-full bg-[#00d4ff] px-5 py-2.5 text-sm font-bold text-[#0a0e14] hover:brightness-110 disabled:opacity-40 transition shrink-0">
            {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {running ? "Testing..." : "Run Full Test"}
          </button>
        </div>
      </div>

      {/* Score summary */}
      {results && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <div className={`text-3xl font-black ${results.score >= 90 ? "text-emerald-500" : results.score >= 70 ? "text-amber-500" : "text-red-500"}`}>{results.score}%</div>
            <div className="text-[10px] font-bold uppercase text-slate-400 mt-1">Overall Score</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <div className="text-3xl font-black text-emerald-500">{results.summary?.passed || 0}</div>
            <div className="text-[10px] font-bold uppercase text-slate-400 mt-1">Passed</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <div className="text-3xl font-black text-amber-500">{results.summary?.warnings || 0}</div>
            <div className="text-[10px] font-bold uppercase text-slate-400 mt-1">Warnings</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <div className="text-3xl font-black text-red-500">{results.summary?.failed || 0}</div>
            <div className="text-[10px] font-bold uppercase text-slate-400 mt-1">Failed</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <div className="text-3xl font-black text-slate-700">{results.summary?.total || 0}</div>
            <div className="text-[10px] font-bold uppercase text-slate-400 mt-1">Total Checks</div>
          </div>
        </div>
      )}

      {/* Category breakdown */}
      {results?.byCategory && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(results.byCategory).map(([cat, data]) => {
            const colors = CATEGORY_COLORS[cat] || CATEGORY_COLORS.Technical;
            const catScore = data.total > 0 ? Math.round((data.passed / data.total) * 100) : 0;
            return (
              <div key={cat} className={`rounded-xl border ${colors.border} ${colors.bg} p-3`}>
                <div className={`text-xs font-bold ${colors.text} mb-1`}>{cat}</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-800">{catScore}%</span>
                  <span className="text-[10px] text-slate-400">{data.passed}/{data.total}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Status filter */}
      {results && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase">Filter:</span>
          {statusFilters.map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${filter === s ? "bg-[#00d4ff] text-[#0a0e14]" : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"}`}>
              {s === "all" ? "All" : s === "fail" ? "Failed" : s === "warn" ? "Warnings" : "Passed"}
            </button>
          ))}
        </div>
      )}

      {/* Results list */}
      {results && (
        <div className="space-y-2">
          {filteredResults.map((r, i) => {
            const colors = CATEGORY_COLORS[r.category] || CATEGORY_COLORS.Technical;
            const StatusIcon = r.status === "pass" ? CheckCircle : r.status === "warn" ? AlertTriangle : AlertCircle;
            const statusColor = r.status === "pass" ? "text-emerald-500" : r.status === "warn" ? "text-amber-500" : "text-red-500";
            return (
              <div key={i} className="rounded-xl border border-slate-200 bg-white p-3.5">
                <div className="flex items-start gap-3">
                  <StatusIcon className={`w-4 h-4 ${statusColor} shrink-0 mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>{r.category}</span>
                      <span className="text-xs font-bold text-slate-700">{r.requirement}</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-1">{r.detail}</p>
                    {r.status !== "pass" && r.fix && (
                      <div className="mt-1.5 rounded-lg bg-slate-50 px-3 py-1.5 text-xs text-slate-600">
                        <span className="font-semibold text-slate-700">Fix: </span>{r.fix}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {filteredResults.length === 0 && (
            <div className="text-center py-8 text-sm text-slate-400">No items match this filter.</div>
          )}
        </div>
      )}

      {/* Default checklist (before running) */}
      {!results && !running && (
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase mb-2">Compliance Checklist ({GOOGLE_COMPLIANCE_CHECKLIST.length} checks)</div>
          {GOOGLE_COMPLIANCE_CHECKLIST.map((item) => {
            const colors = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.Technical;
            return (
              <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-3.5 flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full border-2 border-slate-300 shrink-0 mt-0.5`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>{item.category}</span>
                    <span className="text-xs font-bold text-slate-700">{item.requirement}</span>
                    <span className="text-[10px] text-slate-400">Weight: {item.weight}</span>
                  </div>
                  <p className="text-xs text-slate-500">{item.fix}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}