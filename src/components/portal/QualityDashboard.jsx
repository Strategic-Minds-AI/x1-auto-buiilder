import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Shield, CheckCircle2, XCircle, AlertTriangle, Eye, Download } from "lucide-react";

export default function QualityDashboard() {
  const [receipts, setReceipts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [repRes, projRes] = await Promise.all([
        base44.entities.ValidationReceipt.filter({}, { sort: "-created_date", limit: 200 }),
        base44.entities.WebsiteProject.filter({ status: { $in: ["generated", "preview_ready", "approved"] } }, { sort: "-created_date", limit: 50, fields: ["id", "business_name", "industry"] }),
      ]);
      setReceipts(repRes.items || []);
      setProjects(projRes.items || []);
    } catch { setReceipts([]); setProjects([]); }
    finally { setLoading(false); }
  };

  const runValidation = async (projectId) => {
    setRunning(projectId);
    try {
      await base44.functions.invoke("runValidation", { projectId });
      await load();
    } catch (e) { alert("Validation failed: " + (e.message || "unknown")); }
    finally { setRunning(null); }
  };

  // Group receipts by project
  const projectValidations = useMemo(() => {
    const map = {};
    receipts.forEach(r => {
      if (!r.project_id) return;
      if (!map[r.project_id]) map[r.project_id] = [];
      map[r.project_id].push(r);
    });
    return map;
  }, [receipts]);

  const stats = useMemo(() => {
    const total = receipts.length;
    const passed = receipts.filter(r => r.result === "pass").length;
    const failed = receipts.filter(r => r.result === "fail").length;
    const unknown = receipts.filter(r => r.result === "unknown" || r.result === "blocked").length;
    const avgScore = total > 0 ? Math.round(receipts.reduce((s, r) => s + (r.score || 0), 0) / total) : 0;
    return { total, passed, failed, unknown, avgScore };
  }, [receipts]);

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-[#00d4ff]" /></div>;
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#00d4ff]/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-[#00d4ff]" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Quality Dashboard</h1>
          <p className="text-sm text-slate-500">Independent validation and quality scoring</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        <StatCard label="Total Checks" value={stats.total} color="#00d4ff" />
        <StatCard label="Passed" value={stats.passed} color="#10b981" icon={CheckCircle2} />
        <StatCard label="Failed" value={stats.failed} color="#ef4444" icon={XCircle} />
        <StatCard label="Unknown" value={stats.unknown} color="#f59e0b" icon={AlertTriangle} />
        <StatCard label="Avg Score" value={stats.avgScore} suffix="/100" color="#0066ff" />
      </div>

      {/* Per-project validation */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900">Project Validations</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {projects.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <Shield className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p className="text-sm text-slate-500">No projects to validate yet.</p>
            </div>
          ) : (
            projects.map(p => {
              const pReceipts = projectValidations[p.id] || [];
              const avgScore = pReceipts.length > 0 ? Math.round(pReceipts.reduce((s, r) => s + (r.score || 0), 0) / pReceipts.length) : 0;
              const allPassed = pReceipts.length > 0 && pReceipts.every(r => r.result === "pass");
              return (
                <div key={p.id} className="px-5 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-bold text-sm text-slate-900">{p.business_name || "Untitled"}</div>
                      <div className="text-xs text-slate-500">{p.industry}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      {pReceipts.length > 0 ? (
                        <>
                          <span className="text-2xl font-black" style={{ color: avgScore >= 80 ? "#10b981" : avgScore >= 60 ? "#f59e0b" : "#ef4444" }}>{avgScore}</span>
                          {allPassed ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <AlertTriangle className="w-5 h-5 text-amber-500" />}
                        </>
                      ) : (
                        <span className="text-xs text-slate-400">Not validated</span>
                      )}
                      <button
                        onClick={() => runValidation(p.id)}
                        disabled={running === p.id}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#00d4ff] px-3 py-1.5 text-xs font-bold text-[#0a0e14] hover:brightness-110 transition disabled:opacity-50"
                      >
                        {running === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Shield className="w-3.5 h-3.5" />}
                        Run Validation
                      </button>
                    </div>
                  </div>
                  {pReceipts.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {pReceipts.map(r => (
                        <div key={r.id} className="rounded-lg border border-slate-100 p-2">
                          <div className="flex items-center gap-1.5 mb-1">
                            {r.result === "pass" ? <CheckCircle2 className="w-3 h-3 text-green-500" />
                              : r.result === "fail" ? <XCircle className="w-3 h-3 text-red-500" />
                              : <AlertTriangle className="w-3 h-3 text-amber-500" />}
                            <span className="text-[10px] font-bold text-slate-700">{r.validation_type}</span>
                          </div>
                          <div className="text-lg font-black" style={{ color: r.score >= 80 ? "#10b981" : r.score >= 60 ? "#f59e0b" : "#ef4444" }}>{r.score || 0}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, suffix, color, icon: Icon }) {
  return (
    <div className="rounded-xl bg-white border border-slate-200 p-3">
      {Icon && <Icon className="w-4 h-4 mb-1" style={{ color }} />}
      <div className="text-xl font-black" style={{ color }}>{value}{suffix}</div>
      <div className="text-[10px] text-slate-500 mt-0.5">{label}</div>
    </div>
  );
}