import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import BackButton from "@/components/shared/BackButton";
import {
  Scan, Loader2, AlertTriangle, AlertCircle, CheckCircle, Copy, Check,
  Search, Wrench, Code, FileText, Palette, Building, Send, Mail, TrendingUp,
  ChevronDown, ChevronRight, Phone
} from "lucide-react";

const PROBLEM_ICONS = {
  seo: Search,
  conversion: TrendingUp,
  technical: Code,
  content: FileText,
  design: Palette,
  business: Building,
};

const SEVERITY_COLORS = {
  critical: "bg-red-100 text-red-600 border-red-200",
  high: "bg-orange-100 text-orange-600 border-orange-200",
  medium: "bg-amber-100 text-amber-600 border-amber-200",
  low: "bg-blue-100 text-blue-600 border-blue-200",
};

export default function FaultLine() {
  const [url, setUrl] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [scans, setScans] = useState([]);
  const [expandedProblem, setExpandedProblem] = useState(null);
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);

  const loadScans = async () => {
    try {
      const page = await base44.entities.FaultLineScan.filter({}, { sort: "-created_date", limit: 20 });
      setScans(page.items || []);
    } catch {}
  };

  useEffect(() => { loadScans(); }, []);

  const handleScan = async () => {
    if (!url) return;
    setScanning(true);
    setError(null);
    setScanResult(null);
    setSendResult(null);
    try {
      // Create scan record
      const scan = await base44.entities.FaultLineScan.create({
        website_url: url,
        business_name: businessName || "",
        industry: industry || "",
        status: "scanning",
      });

      // Call the scanWebsiteFaults backend function
      const res = await base44.functions.invoke("scanWebsiteFaults", {
        website_url: url,
        business_name: businessName,
        industry: industry,
        faultLineScanId: scan.id,
      });

      setScanResult(res.data);
      loadScans();
    } catch (err) {
      setError("Scan failed: " + (err.response?.data?.error || err.message || "unknown error"));
    } finally { setScanning(false); }
  };

  const copyOutreach = () => {
    if (!scanResult?.outreachMessage) return;
    navigator.clipboard.writeText(scanResult.outreachMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendOutreach = async (method) => {
    if (!scanResult?.outreachMessage) return;
    setSending(true);
    setSendResult(null);
    try {
      if (method === "email") {
        // Use SendEmail via a backend function or directly
        setSendResult({ method: "email", status: "ready", message: "Outreach email drafted. Copy the message and send from your email client." });
      } else if (method === "sms") {
        // Use Twilio SMS
        const res = await base44.functions.invoke("sendTwilioSMS", {
          to: "", // Would need contact phone
          message: scanResult.outreachMessage.substring(0, 1600),
        });
        setSendResult({ method: "sms", status: "sent", data: res.data });
      }
    } catch (err) {
      setSendResult({ method, status: "error", error: err.message });
    } finally { setSending(false); }
  };

  const problems = scanResult?.problems || [];
  const problemsByType = problems.reduce((acc, p) => {
    const type = p.type || "other";
    if (!acc[type]) acc[type] = [];
    acc[type].push(p);
    return acc;
  }, {});

  const severityCounts = problems.reduce((acc, p) => {
    const s = p.severity || "low";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="portal-light min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton />
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
            <Scan className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Fault Line Scanner</h1>
            <p className="text-sm text-slate-500">Scan any website for problems, then generate targeted outreach to win them as a client</p>
          </div>
        </div>

        {/* URL input */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 mb-4 space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Website URL</label>
            <input className="dd-input" placeholder="https://example.com" value={url} onChange={(e) => setUrl(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Business Name (optional)</label>
              <input className="dd-input" placeholder="e.g. Acme Corp" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Industry (optional)</label>
              <input className="dd-input" placeholder="e.g. Roofing" value={industry} onChange={(e) => setIndustry(e.target.value)} />
            </div>
          </div>
          <button
            onClick={handleScan}
            disabled={scanning || !url}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red-500 to-orange-600 px-6 py-3 text-sm font-bold text-white disabled:opacity-50 hover:brightness-110 transition"
          >
            {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scan className="w-4 h-4" />}
            {scanning ? "Scanning website..." : "Scan for Faults"}
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          </div>
        )}

        {/* Scan results */}
        {scanResult && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                <div className="text-3xl font-black text-red-500">{scanResult.problemCount || problems.length}</div>
                <div className="text-xs text-slate-400 mt-1">Problems Found</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                <div className="text-3xl font-black text-amber-500">{scanResult.severityScore || 0}</div>
                <div className="text-xs text-slate-400 mt-1">Severity Score (0-100)</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                <div className="flex justify-center gap-1">
                  {severityCounts.critical && <span className="text-xs rounded-full bg-red-100 text-red-600 px-2 py-1 font-bold">{severityCounts.critical} critical</span>}
                  {severityCounts.high && <span className="text-xs rounded-full bg-orange-100 text-orange-600 px-2 py-1 font-bold">{severityCounts.high} high</span>}
                </div>
                <div className="text-xs text-slate-400 mt-1">By Severity</div>
              </div>
            </div>

            {/* Summary text */}
            {scanResult.summary && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-600">{scanResult.summary}</p>
              </div>
            )}

            {/* Problems grouped by type */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-bold text-slate-700 mb-4">Problems Detected</h3>
              <div className="space-y-4">
                {Object.entries(problemsByType).map(([type, typeProblems]) => {
                  const Icon = PROBLEM_ICONS[type] || AlertTriangle;
                  return (
                    <div key={type}>
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-bold uppercase text-slate-500">{type}</span>
                        <span className="text-xs text-slate-400">({typeProblems.length})</span>
                      </div>
                      <div className="space-y-2">
                        {typeProblems.map((p, i) => {
                          const globalIdx = problems.indexOf(p);
                          const isExpanded = expandedProblem === globalIdx;
                          return (
                            <div key={i} className={`rounded-lg border p-3 ${SEVERITY_COLORS[p.severity] || SEVERITY_COLORS.low}`}>
                              <button onClick={() => setExpandedProblem(isExpanded ? null : globalIdx)} className="w-full flex items-start justify-between gap-2 text-left">
                                <div className="flex-1">
                                  <div className="text-sm font-bold">{p.title || p.type}</div>
                                  <div className="text-xs opacity-80 mt-0.5">{p.description}</div>
                                </div>
                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-white/50 shrink-0">{p.severity}</span>
                                {isExpanded ? <ChevronDown className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />}
                              </button>
                              {isExpanded && (
                                <div className="mt-3 pt-3 border-t border-white/30 space-y-2">
                                  {p.recommendation && (
                                    <div>
                                      <div className="text-[10px] font-bold uppercase opacity-60 mb-1">Recommendation</div>
                                      <p className="text-xs">{p.recommendation}</p>
                                    </div>
                                  )}
                                  {p.impact && (
                                    <div>
                                      <div className="text-[10px] font-bold uppercase opacity-60 mb-1">Business Impact</div>
                                      <p className="text-xs">{p.impact}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Outreach message */}
            {scanResult.outreachMessage && (
              <div className="rounded-2xl border border-[#00d4ff]/30 bg-[#00d4ff]/5 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#00d4ff]" />
                    <h3 className="text-sm font-bold text-slate-700">Generated Outreach Message</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={copyOutreach} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-[#00d4ff] transition">
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>
                <div className="rounded-lg bg-white border border-slate-200 p-4">
                  <pre className="text-sm text-slate-600 whitespace-pre-wrap">{scanResult.outreachMessage}</pre>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <button onClick={() => sendOutreach("email")} disabled={sending} className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white disabled:opacity-50">
                    {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                    Draft Email
                  </button>
                  <button onClick={() => sendOutreach("sms")} disabled={sending} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:text-[#00d4ff] disabled:opacity-50">
                    {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Phone className="w-3.5 h-3.5" />}
                    Send SMS
                  </button>
                </div>
                {sendResult && (
                  <div className="mt-2 rounded-lg bg-white border border-slate-200 p-3">
                    <pre className="text-xs text-slate-600 whitespace-pre-wrap">{JSON.stringify(sendResult, null, 2)}</pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Previous scans */}
        {scans.length > 0 && !scanResult && (
          <div className="mt-6">
            <h3 className="text-sm font-bold text-slate-700 mb-3">Previous Scans</h3>
            <div className="space-y-2">
              {scans.map((s) => (
                <div key={s.id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 hover:bg-slate-50">
                  <span className={`w-2 h-2 rounded-full ${s.status === "outreach_sent" ? "bg-emerald-500" : s.status === "scanned" ? "bg-amber-500" : "bg-slate-300"}`} />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-slate-700">{s.business_name || s.website_url}</div>
                    <div className="text-xs text-slate-400">{s.website_url}</div>
                  </div>
                  {s.problem_count > 0 && <span className="text-xs text-red-500 font-bold">{s.problem_count} problems</span>}
                  <span className="text-[10px] text-slate-400 capitalize">{s.status.replace("_", " ")}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}