import { useState } from "react";
import { base44 } from "@/api/base44Client";
import AutoStepShell from "@/components/autobuilder/AutoStepShell";
import { Loader2, ShieldCheck, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export default function ComplianceStep({ accent, websiteData, onApprove }) {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [fixing, setFixing] = useState(false);

  const runCheck = async () => {
    setLoading(true);
    setReport(null);
    try {
      // Create a temp project to run compliance against
      const project = await base44.entities.WebsiteProject.create({
        business_name: "Auto Builder Project",
        business_website: "",
        industry: "General",
        status: "generated",
        content: websiteData?.website?.content || {},
      });
      const res = await base44.functions.invoke("runComplianceCheck", { projectId: project.id });
      setReport(res.data);
    } catch (err) {
      setReport({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const autoFix = async () => {
    setFixing(true);
    try {
      const res = await base44.functions.invoke("autoFixCompliance", { reportId: report.id });
      setReport(res.data);
    } catch {}
    finally { setFixing(false); }
  };

  const handleApprove = () => {
    onApprove({ compliance: report });
  };

  return (
    <AutoStepShell
      step={9}
      accent={accent}
      title="Compliance Check"
      subtitle="Run Google SEO/AEO/GEO compliance scoring and auto-fix issues."
      onApprove={report ? handleApprove : undefined}
      approveLabel="Approve & Continue"
      canApprove={!!report}
    >
      {!report && !loading && (
        <div className="text-center py-8">
          <ShieldCheck className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <p className="text-slate-500 text-sm mb-5 max-w-md mx-auto">
            We'll score your website against Google's SEO, AEO, GEO, Technical, and Content standards, then auto-fix any failures.
          </p>
          <button
            onClick={runCheck}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
          >
            <ShieldCheck className="w-4 h-4" /> Run Compliance Check
          </button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400 mb-3" />
          <p className="text-sm text-slate-500">Scoring against Google standards…</p>
        </div>
      )}

      {report && !report.error && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-4xl font-black text-slate-900">{report.overall_score || 0}</div>
              <div className="text-xs text-slate-400">Overall Score</div>
            </div>
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {report.category_scores && Object.entries(report.category_scores).map(([cat, score]) => (
                <div key={cat} className="rounded-lg bg-slate-50 border border-slate-200 p-2 text-center">
                  <div className="text-lg font-bold text-slate-800">{score}</div>
                  <div className="text-[10px] uppercase text-slate-400">{cat}</div>
                </div>
              ))}
            </div>
          </div>

          {report.checks?.length > 0 && (
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {report.checks.slice(0, 8).map((c, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  {c.status === "pass" ? <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" /> :
                   c.status === "fail" ? <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" /> :
                   <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />}
                  <span className="text-slate-600">{c.requirement}</span>
                </div>
              ))}
            </div>
          )}

          {(report.overall_score || 0) < 90 && (
            <button
              onClick={autoFix}
              disabled={fixing}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
            >
              {fixing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />} Auto-Fix Issues
            </button>
          )}
        </div>
      )}
    </AutoStepShell>
  );
}