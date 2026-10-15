import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ScrollText, Loader2, CheckCircle, AlertCircle, Activity } from "lucide-react";

export default function LogsPanel() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const page = await base44.entities.SystemTestReport.filter({}, { sort: "-created_date", limit: 25 });
        setReports(page.items || []);
      } catch {} finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-800 mb-1">Runtime Logs</h2>
        <p className="text-sm text-slate-500">Recent system test reports and validation runs. For full runtime error logs, use the Logs page in your app dashboard.</p>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-5 h-5 text-slate-300 animate-spin" /></div>
      ) : reports.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white py-16 text-center">
          <ScrollText className="w-10 h-10 text-slate-200 mx-auto mb-2" />
          <p className="text-sm text-slate-400">No log entries yet</p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="divide-y divide-slate-100">
            {reports.map((r) => (
              <div key={r.id} className="px-4 py-3 flex items-start gap-3 hover:bg-slate-50">
                <div className="shrink-0 mt-0.5">
                  {r.status === "passed" ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : r.status === "failed" ? <AlertCircle className="w-4 h-4 text-red-500" /> : <Activity className="w-4 h-4 text-amber-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-slate-700">{r.test_suite || "System Scan"}</span>
                    <span className="text-xs text-slate-400">{r.score != null && `${r.score}%`}</span>
                  </div>
                  {r.summary && <p className="text-xs text-slate-500 line-clamp-2">{r.summary}</p>}
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {r.passed_tests || 0} passed / {r.failed_tests || 0} failed / {r.total_tests || 0} total
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}