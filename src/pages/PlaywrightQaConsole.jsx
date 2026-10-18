import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Monitor, Loader2, Play, CheckCircle2, XCircle, AlertTriangle,
  Globe, Bot, Code, Shield,
} from "lucide-react";

export default function PlaywrightQaConsole() {
  const [siteUrl, setSiteUrl] = useState("");
  const [projectName, setProjectName] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [sessions, setSessions] = useState([]);

  const loadSessions = async () => {
    try {
      const page = await base44.entities.LocalSandboxSession.filter({}, { limit: 10 });
      setSessions(page.items || []);
    } catch { }
  };

  useEffect(() => { loadSessions(); }, []);

  const runQa = async () => {
    if (!siteUrl) return;
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const res = await base44.functions.invoke("playwrightQaAgent", { siteUrl, projectName });
      setResult(res.data);
    } catch (e) { setError(e.response?.data?.error || e.message); }
    finally { setRunning(false); }
  };

  const onlineSessions = sessions.filter(s => s.status === "online");
  const hasSandbox = onlineSessions.length > 0;

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <Monitor className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-900">Playwright Browser QA</h1>
          <p className="text-sm text-slate-500">Physically validates every button and interaction like a real user.</p>
        </div>
      </div>

      {/* Sandbox status */}
      <div className={`rounded-xl p-4 mb-4 flex items-center gap-3 ${hasSandbox ? "bg-emerald-50 border border-emerald-200" : "bg-amber-50 border border-amber-200"}`}>
        {hasSandbox ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <AlertTriangle className="w-5 h-5 text-amber-500" />}
        <div>
          <div className="text-sm font-bold text-slate-700">
            {hasSandbox ? `${onlineSessions.length} Local Sandbox Connected` : "No Local Sandbox Connected"}
          </div>
          <div className="text-xs text-slate-500">
            {hasSandbox
              ? `Playwright tests will execute on: ${onlineSessions.map(s => s.machine_name).join(", ")}`
              : "Will fall back to LLM-based static analysis. Connect a local sandbox for full browser testing."}
          </div>
        </div>
      </div>

      {/* Input form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Site URL to Test</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/40"
                placeholder="https://your-site.vercel.app"
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Project Name</label>
            <input
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/40"
              placeholder="Project name (optional)"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>
        </div>
        <button
          onClick={runQa}
          disabled={running || !siteUrl}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50 hover:brightness-110 transition"
        >
          {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {running ? "Running Playwright Tests..." : "Run Browser QA"}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 mb-4 text-sm text-red-600 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Coverage */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-700">Test Coverage</h3>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-[#00d4ff]">{result.coverage || 0}%</span>
                <span className="text-xs text-slate-400">{result.totalTests || 0} tests</span>
              </div>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600" style={{ width: `${result.coverage || 0}%` }} />
            </div>
          </div>

          {/* Test plan */}
          {result.testPlan?.tests?.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h3 className="text-sm font-bold text-slate-700 mb-3">Test Plan ({result.testPlan.tests.length} tests)</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {result.testPlan.tests.map((test, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg border border-slate-100 p-2.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                      test.severity === "critical" ? "bg-red-100 text-red-600" :
                      test.severity === "high" ? "bg-orange-100 text-orange-600" :
                      test.severity === "medium" ? "bg-amber-100 text-amber-600" :
                      "bg-slate-100 text-slate-500"
                    }`}>{test.severity}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-700">{test.name}</div>
                      <div className="text-[10px] text-slate-400">{test.action} → {test.expected}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sandbox execution */}
          {result.sandboxExecution && (
            <div className={`rounded-2xl border p-5 ${result.sandboxExecution.sent ? "border-[#00d4ff]/40 bg-[#00d4ff]/5" : "border-slate-200 bg-white"}`}>
              <div className="flex items-center gap-2 mb-2">
                <Bot className="w-4 h-4 text-[#00d4ff]" />
                <h3 className="text-sm font-bold text-slate-700">Local Sandbox Execution</h3>
              </div>
              {result.sandboxExecution.sent ? (
                <div className="text-xs text-slate-600">
                  <p>Test sent to: <span className="font-bold">{result.sandboxExecution.machine}</span></p>
                  <p className="mt-1">Status: <span className="font-bold text-[#00d4ff]">{result.sandboxExecution.status}</span></p>
                  <p className="mt-1 text-slate-400">{result.sandboxExecution.message}</p>
                </div>
              ) : (
                <p className="text-xs text-slate-500">{result.sandboxExecution.error || "No sandbox available"}</p>
              )}
            </div>
          )}

          {/* Static analysis fallback */}
          {result.staticAnalysis && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-700">Static Analysis (Fallback)</h3>
              </div>
              <div className="space-y-1.5">
                {result.staticAnalysis.checks?.map((check, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    {check.passed ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                    <span className="text-slate-600 font-medium">{check.name}</span>
                    <span className="text-slate-400 truncate">{check.detail}</span>
                  </div>
                ))}
              </div>
              {result.staticAnalysis.recommendation && (
                <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-2.5 text-xs text-amber-700">
                  {result.staticAnalysis.recommendation}
                </div>
              )}
            </div>
          )}

          {/* Playwright script */}
          {result.testPlan?.playwright_script && (
            <div className="bg-slate-900 rounded-2xl border border-slate-700 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Code className="w-4 h-4 text-[#00d4ff]" />
                <h3 className="text-sm font-bold text-white">Generated Playwright Script</h3>
              </div>
              <pre className="text-xs text-slate-300 overflow-x-auto max-h-64 font-mono">{result.testPlan.playwright_script}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}