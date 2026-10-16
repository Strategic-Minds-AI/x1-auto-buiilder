import { useState, useEffect } from "react";
import PortalShell from "@/components/portal/PortalShell";
import { base44 } from "@/api/base44Client";
import {
  Scan, Upload, Loader2, CheckCircle2, AlertTriangle, XCircle, Image,
  Globe, Rocket, History, ArrowRight, Eye, RefreshCw,
} from "lucide-react";

const VERDICT_STYLES = {
  MATCH: { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", icon: CheckCircle2 },
  PARTIAL_MATCH: { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", icon: AlertTriangle },
  MISMATCH: { color: "text-red-600", bg: "bg-red-50", border: "border-red-200", icon: XCircle },
  BLOCKED: { color: "text-slate-400", bg: "bg-slate-50", border: "border-slate-200", icon: AlertTriangle },
};

const SEVERITY_COLORS = {
  high: "bg-red-100 text-red-600",
  medium: "bg-amber-100 text-amber-600",
  low: "bg-slate-100 text-slate-500",
};

export default function VisualParityEngine() {
  const [mockupUrl, setMockupUrl] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [projectName, setProjectName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [checks, setChecks] = useState([]);
  const [selectedCheck, setSelectedCheck] = useState(null);

  const loadChecks = async () => {
    try {
      const page = await base44.entities.VisualParityCheck.filter({}, { sort: "-created_date", limit: 20 });
      setChecks(page.items || []);
    } catch { }
  };

  useEffect(() => { loadChecks(); }, []);

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      setMockupUrl(file_url);
    } catch (err) {
      setError("Upload failed: " + (err.message || "unknown error"));
    } finally { setUploading(false); }
  };

  const runCheck = async () => {
    if (!mockupUrl || !siteUrl) return;
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const res = await base44.functions.invoke("visualParityCheck", {
        mockupImageUrl: mockupUrl,
        siteUrl,
        projectName,
      });
      setResult(res.data);
      loadChecks();
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Parity check failed");
    } finally { setRunning(false); }
  };

  const loadCheckDetail = async (id) => {
    try {
      const check = await base44.entities.VisualParityCheck.get(id);
      setSelectedCheck(check);
    } catch { }
  };

  return (
    <PortalShell title="Visual Parity Engine" activeTab="" onTabChange={() => {}} onNew={() => {}}>
      <div className="px-6 py-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <Scan className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">Visual Parity Engine</h1>
            <p className="text-sm text-slate-500">Automatic pixel-for-pixel comparison of generated sites against approved design mockups.</p>
          </div>
        </div>

        {/* Input form */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Run New Parity Check</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Mockup upload */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Approved Design Mockup</label>
              {mockupUrl ? (
                <div className="relative rounded-xl border border-slate-200 overflow-hidden">
                  <img src={mockupUrl} alt="Mockup" className="w-full max-h-48 object-contain bg-slate-50" />
                  <button
                    onClick={() => setMockupUrl("")}
                    className="absolute top-2 right-2 rounded-lg bg-white/90 px-2 py-1 text-xs font-bold text-red-500 hover:bg-white"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 cursor-pointer transition ${uploading ? "border-[#00d4ff] bg-[#00d4ff]/5" : "border-slate-200 hover:border-[#00d4ff]/40"}`}>
                  {uploading ? <Loader2 className="w-6 h-6 animate-spin text-[#00d4ff]" /> : <Upload className="w-6 h-6 text-slate-300" />}
                  <span className="text-xs text-slate-500">{uploading ? "Uploading..." : "Upload mockup image (stored publicly)"}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e.target.files[0])} />
                </label>
              )}
              <input
                className="w-full mt-2 rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/40"
                placeholder="...or paste mockup image URL"
                value={mockupUrl.startsWith("http") && !mockupUrl.includes("media.base44") ? mockupUrl : ""}
                onChange={(e) => setMockupUrl(e.target.value)}
              />
            </div>

            {/* Site URL */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Generated Site URL</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/40"
                  placeholder="https://your-generated-site.vercel.app"
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                />
              </div>
              <input
                className="w-full mt-2 rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/40"
                placeholder="Project name (optional)"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={runCheck}
            disabled={running || !mockupUrl || !siteUrl}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-3 text-sm font-bold text-white disabled:opacity-50 hover:brightness-110 transition"
          >
            {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scan className="w-4 h-4" />}
            {running ? "Comparing pixel-for-pixel..." : "Run Parity Check"}
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 mb-6">
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertTriangle className="w-4 h-4" /> {error}
            </div>
          </div>
        )}

        {/* Result */}
        {result?.report && (
          <div className="space-y-4 mb-6">
            {/* Score + verdict */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-slate-900">Parity Report</h3>
                {(() => {
                  const v = VERDICT_STYLES[result.report.verdict] || VERDICT_STYLES.BLOCKED;
                  const VIcon = v.icon;
                  return (
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm border ${v.bg} ${v.border} ${v.color}`}>
                      <VIcon className="w-4 h-4" />
                      {result.report.verdict}
                    </div>
                  );
                })()}
              </div>
              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24 shrink-0">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="42" fill="none"
                      stroke={result.report.parity_score >= 90 ? "#10b981" : result.report.parity_score >= 60 ? "#f59e0b" : "#ef4444"}
                      strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={`${(result.report.parity_score / 100) * 264} 264`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-black text-slate-900">{result.report.parity_score}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-600">{result.report.summary}</p>
                </div>
              </div>
            </div>

            {/* Side-by-side images */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Image className="w-4 h-4 text-purple-500" />
                  <span className="text-xs font-bold text-slate-500">Approved Mockup</span>
                </div>
                <img src={mockupUrl} alt="Mockup" className="w-full rounded-lg border border-slate-200" />
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-[#00d4ff]" />
                  <span className="text-xs font-bold text-slate-500">Generated Site Screenshot</span>
                </div>
                {result.screenshotUrl && (
                  <img src={result.screenshotUrl} alt="Site screenshot" className="w-full rounded-lg border border-slate-200" />
                )}
              </div>
            </div>

            {/* Differences */}
            {result.report.differences?.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="text-sm font-bold text-slate-700 mb-3">Visual Differences ({result.report.differences.length})</h3>
                <div className="space-y-2">
                  {result.report.differences.map((diff, i) => (
                    <div key={i} className="rounded-lg border border-slate-100 p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${SEVERITY_COLORS[diff.severity] || SEVERITY_COLORS.low}`}>
                          {diff.severity}
                        </span>
                        <span className="text-sm font-bold text-slate-700">{diff.section}</span>
                      </div>
                      <p className="text-xs text-slate-600 mb-1">{diff.issue}</p>
                      <p className="text-xs text-[#0066ff]">→ {diff.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {result.report.recommendations?.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="text-sm font-bold text-slate-700 mb-3">Actionable Fixes</h3>
                <div className="space-y-1.5">
                  {result.report.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <ArrowRight className="w-3.5 h-3.5 text-[#00d4ff] shrink-0 mt-0.5" />
                      {rec}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* History */}
        {checks.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <History className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-bold text-slate-700">Past Parity Checks</h3>
            </div>
            <div className="space-y-2">
              {checks.map((check) => {
                const v = VERDICT_STYLES[check.verdict] || VERDICT_STYLES.BLOCKED;
                const VIcon = v.icon;
                return (
                  <button
                    key={check.id}
                    onClick={() => loadCheckDetail(check.id)}
                    className="w-full flex items-center gap-3 rounded-xl border border-slate-100 p-3 hover:border-[#00d4ff]/40 transition text-left"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${v.bg} ${v.border} border`}>
                      <VIcon className={`w-5 h-5 ${v.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-slate-700 truncate">
                        {check.project_name || check.site_url}
                      </div>
                      <div className="text-xs text-slate-400 truncate">{check.site_url}</div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className={`text-lg font-black ${v.color}`}>{check.parity_score}</div>
                      <div className="text-[10px] text-slate-400">{check.verdict}</div>
                    </div>
                    {check.auto_triggered && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00d4ff]/10 text-[#0066ff] font-bold shrink-0">AUTO</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected check detail */}
        {selectedCheck && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedCheck(null)}>
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-slate-900">Parity Check Detail</h3>
                <button onClick={() => setSelectedCheck(null)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-xs font-bold text-slate-400 mb-1">Mockup</div>
                  <img src={selectedCheck.mockup_image_url} alt="Mockup" className="w-full rounded-lg border border-slate-200" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 mb-1">Site Screenshot</div>
                  {selectedCheck.screenshot_url && (
                    <img src={selectedCheck.screenshot_url} alt="Screenshot" className="w-full rounded-lg border border-slate-200" />
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-3xl font-black text-slate-900">{selectedCheck.parity_score}</span>
                <span className="text-sm font-bold text-slate-500">{selectedCheck.verdict}</span>
              </div>
              {selectedCheck.differences?.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-slate-700 mb-2">Differences</h4>
                  <div className="space-y-2">
                    {selectedCheck.differences.map((diff, i) => (
                      <div key={i} className="rounded-lg border border-slate-100 p-3 text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${SEVERITY_COLORS[diff.severity] || SEVERITY_COLORS.low}`}>{diff.severity}</span>
                          <span className="font-bold text-slate-700">{diff.section}</span>
                        </div>
                        <p className="text-xs text-slate-600">{diff.issue}</p>
                        <p className="text-xs text-[#0066ff] mt-1">→ {diff.recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </PortalShell>
  );
}