import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Shield, Loader2, Play, CheckCircle, AlertCircle, Activity } from "lucide-react";

export default function SecurityPanel() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);

  const loadReports = async () => {
    setLoading(true);
    try {
      const page = await base44.entities.SystemTestReport.filter({}, { sort: "-created_date", limit: 10 });
      setReports(page.items || []);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  useEffect(() => { loadReports(); }, []);

  const runScan = async () => {
    setScanning(true);
    setError(null);
    setScanResult(null);
    try {
      const result = await base44.functions.invoke("runSystemTests", { attemptFixes: true });
      setScanResult(result);
      loadReports();
    } catch (err) { setError(err.message || "Scan failed"); } finally { setScanning(false); }
  };

  const latest = reports[0];

  return (
    <div className="p-6 max-w-5xl">
      {/* Action bar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-1">Security & System Validation</h2>
          <p className="text-sm text-slate-500">Run a full system scan to validate entity access, deployed sites, authentication, and sandbox health.</p>
        </div>
        <button onClick={runScan} disabled={scanning}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#0066ff] px-5 py-2.5 text-sm font-bold text-white hover:brightness-110 disabled:opacity-50 transition shrink-0">
          {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {scanning ? "Scanning..." : "Run Security Scan"}
        </button>
      </div>

      {/* Latest score */}
      {latest && !scanning && (
        <div className="grid grid-cols-4 gap-3 mb-6">
          <StatCard icon={Shield} label="Score" value={`${latest.score || 0}%`} color={latest.score >= 80 ? "text-emerald-500" : latest.score >= 50 ? "text-amber-500" : "text-red-500"} />
          <StatCard icon={CheckCircle} label="Passed" value={latest.passed_tests || 0} color="text-emerald-500" />
          <StatCard icon={AlertCircle} label="Failed" value={latest.failed_tests || 0} color="text-red-500" />
          <StatCard icon={Activity} label="Total" value={latest.total_tests || 0} color="text-blue-500" />
        </div>
      )}

      {/* Scan result */}
      {scanResult && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-bold text-emerald-700">Scan Complete</span>
          </div>
          <p className="text-xs text-emerald-600">{scanResult.summary || `Score: ${scanResult.score || 0}% — ${scanResult.passed || 0} passed, ${scanResult.failed || 0} failed`}</p>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 mb-6 text-xs text-red-600">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Recent reports */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 text-sm font-bold text-slate-700">Recent Scan Reports</div>
        {loading ? (
          <div className="flex items-center justify-center py-10"><Loader2 className="w-5 h-5 text-slate-300 animate-spin" /></div>
        ) : reports.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-400">No scan reports yet. Run a scan to get started.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {reports.map((r) => (
              <div key={r.id} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${r.status === "passed" ? "bg-emerald-100 text-emerald-600" : r.status === "failed" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"}`}>
                    {r.score || 0}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-700">{r.test_suite || "System Scan"}</div>
                    <div className="text-xs text-slate-400">{r.passed_tests || 0} passed / {r.total_tests || 0} total</div>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${r.status === "passed" ? "bg-emerald-100 text-emerald-600" : r.status === "failed" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"}`}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-1"><Icon className={`w-3.5 h-3.5 ${color}`} /> {label}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );
}