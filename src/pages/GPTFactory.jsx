import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import {
  Factory, Play, Loader2, CheckCircle2, XCircle, Globe, Brain,
  Shield, Rocket, RefreshCw, LogIn, LogOut, Clock, Activity, Zap,
} from "lucide-react";
import CloudBrowser from "@/components/portal/CloudBrowser";
import BackButton from "@/components/shared/BackButton";

const PIPELINE_PHASES = [
  { key: "generate", label: "Generate", icon: Factory, color: "blue" },
  { key: "validate", label: "Validate", icon: CheckCircle2, color: "green" },
  { key: "compliance", label: "Google Compliance", icon: Shield, color: "amber" },
  { key: "auto_fix", label: "Auto-Fix", icon: RefreshCw, color: "purple" },
  { key: "deploy", label: "Deploy to Vercel", icon: Rocket, color: "cyan" },
];

export default function GPTFactory() {
  const [pipeline, setPipeline] = useState(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);

  // Pipeline input
  const [mode, setMode] = useState("existing");
  const [projectId, setProjectId] = useState("");
  const [projects, setProjects] = useState([]);
  const [genParams, setGenParams] = useState({ businessWebsiteUrl: "", industry: "", businessName: "" });
  const [options, setOptions] = useState({ skipCompliance: false, skipDeploy: false, autoFix: true });

  // Memory sessions
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(false);

  // Cloud browser
  const [browserUrl, setBrowserUrl] = useState("");

  const loadProjects = useCallback(async () => {
    try {
      const { items } = await base44.entities.WebsiteProject.filter(
        { status: { $in: ["generated", "preview_ready", "approved"] } },
        { sort: "-created_date", limit: 50, fields: ["id", "business_name", "industry", "status", "deploy_url"] }
      );
      setProjects(items);
    } catch { /* ignore */ }
  }, []);

  const loadSessions = useCallback(async () => {
    try {
      const { items } = await base44.entities.GPTMemory.filter(
        { status: { $in: ["logged_in", "active"] } },
        { sort: "-created_date", limit: 20 }
      );
      setSessions(items);
      if (items.length > 0 && !activeSession) setActiveSession(items[0]);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { loadProjects(); loadSessions(); }, [loadProjects, loadSessions]);

  const runPipeline = async () => {
    setRunning(true);
    setError(null);
    setPipeline(null);
    try {
      const payload = { ...options };
      if (mode === "existing") {
        if (!projectId) { setError("Select a project"); setRunning(false); return; }
        payload.projectId = projectId;
        payload.skipGenerate = false;
      } else {
        if (!genParams.businessWebsiteUrl || !genParams.industry) {
          setError("Business URL and industry are required");
          setRunning(false);
          return;
        }
        payload.generateParams = genParams;
      }
      const res = await base44.functions.invoke("gptFactoryPipeline", payload);
      setPipeline(res.data);
      if (res.data?.phases?.deploy?.url) setBrowserUrl(res.data.phases.deploy.url);
      loadProjects();
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Pipeline failed");
    } finally {
      setRunning(false);
    }
  };

  const loginAgent = async () => {
    setSessionLoading(true);
    try {
      const sessionId = `s-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const rec = await base44.entities.GPTMemory.create({
        session_id: sessionId,
        agent_id: "apex-commander",
        agent_name: "APEX / Agent Zero",
        memory_type: "session",
        status: "logged_in",
        login_time: new Date().toISOString(),
        last_activity: new Date().toISOString(),
        context: { mode: "factory", current_phase: "idle" },
        skills_loaded: ["capability-bootstrap", "website-factory", "compliance-engine", "deployment-ops"],
        tools_available: ["generateWebsite", "enhanceWebsite", "runValidation", "runComplianceCheck", "autoFixCompliance", "deploySite", "gptFactoryPipeline"],
        messages: [{ role: "system", content: "APEX Commander session initialized", timestamp: new Date().toISOString() }],
      });
      setActiveSession(rec);
      loadSessions();
    } catch (err) {
      setError(err.message);
    } finally {
      setSessionLoading(false);
    }
  };

  const logoutAgent = async () => {
    if (!activeSession) return;
    setSessionLoading(true);
    try {
      await base44.entities.GPTMemory.update(activeSession.id, {
        status: "logged_out",
        logout_time: new Date().toISOString(),
      });
      setActiveSession(null);
      loadSessions();
    } catch (err) {
      setError(err.message);
    } finally {
      setSessionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <BackButton fallback="/portal" label="Back to Portal" />
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center">
            <Factory className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-black text-2xl text-slate-900">GPT Website Factory</h1>
            <p className="text-sm text-slate-500">End-to-end pipeline: Generate → Validate → Google Compliance → Auto-Fix → Deploy</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Pipeline controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Agent Memory Session */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-[#00d4ff]" />
                  <h3 className="font-bold text-slate-900">Agent Memory Session</h3>
                </div>
                {activeSession ? (
                  <button
                    onClick={logoutAgent}
                    disabled={sessionLoading}
                    className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Log Out
                  </button>
                ) : (
                  <button
                    onClick={loginAgent}
                    disabled={sessionLoading}
                    className="inline-flex items-center gap-2 rounded-full bg-[#00d4ff] px-4 py-2 text-xs font-bold text-[#0a0e14] hover:brightness-110 transition"
                  >
                    {sessionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogIn className="w-3.5 h-3.5" />}
                    Log In Agent
                  </button>
                )}
              </div>
              {activeSession ? (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-semibold">{activeSession.agent_name}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-400 font-mono text-xs">{activeSession.session_id?.slice(0, 12)}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeSession.skills_loaded?.map((s) => (
                      <span key={s} className="text-[10px] font-semibold bg-[#00d4ff]/10 text-[#00d4ff] px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock className="w-3 h-3" />
                    Logged in: {new Date(activeSession.login_time).toLocaleTimeString()}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400">No active agent session. Log in to start tracking memory and context.</p>
              )}
              {sessions.length > 1 && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-500 mb-1.5">Recent Sessions</p>
                  <div className="space-y-1">
                    {sessions.filter(s => s.id !== activeSession?.id).slice(0, 3).map(s => (
                      <div key={s.id} className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">{s.agent_name}</span>
                        <span className="text-slate-400">{new Date(s.login_time).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Pipeline Runner */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-[#00d4ff]" />
                <h3 className="font-bold text-slate-900">Pipeline Runner</h3>
              </div>

              {/* Mode toggle */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setMode("existing")}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition ${mode === "existing" ? "bg-[#00d4ff] text-[#0a0e14]" : "bg-slate-100 text-slate-500"}`}
                >
                  Existing Project
                </button>
                <button
                  onClick={() => setMode("new")}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition ${mode === "new" ? "bg-[#00d4ff] text-[#0a0e14]" : "bg-slate-100 text-slate-500"}`}
                >
                  New Generation
                </button>
              </div>

              {mode === "existing" ? (
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">Select Project</label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#00d4ff]/50"
                  >
                    <option value="">Choose a project...</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.business_name || "Untitled"} · {p.industry} · {p.status}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Business Website URL</label>
                    <input
                      value={genParams.businessWebsiteUrl}
                      onChange={(e) => setGenParams({ ...genParams, businessWebsiteUrl: e.target.value })}
                      placeholder="https://example.com"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#00d4ff]/50"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Industry</label>
                      <input
                        value={genParams.industry}
                        onChange={(e) => setGenParams({ ...genParams, industry: e.target.value })}
                        placeholder="Roofing"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#00d4ff]/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Business Name</label>
                      <input
                        value={genParams.businessName}
                        onChange={(e) => setGenParams({ ...genParams, businessName: e.target.value })}
                        placeholder="Optional"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#00d4ff]/50"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Options */}
              <div className="mt-4 flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                  <input type="checkbox" checked={options.autoFix} onChange={(e) => setOptions({ ...options, autoFix: e.target.checked })} className="rounded" />
                  Auto-Fix Issues
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                  <input type="checkbox" checked={options.skipCompliance} onChange={(e) => setOptions({ ...options, skipCompliance: e.target.checked })} className="rounded" />
                  Skip Compliance
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                  <input type="checkbox" checked={options.skipDeploy} onChange={(e) => setOptions({ ...options, skipDeploy: e.target.checked })} className="rounded" />
                  Skip Deploy
                </label>
              </div>

              {/* Run button */}
              <button
                onClick={runPipeline}
                disabled={running}
                className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#00d4ff] px-6 py-3 text-sm font-bold text-[#0a0e14] hover:brightness-110 hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] transition disabled:opacity-60"
              >
                {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                {running ? "Running Pipeline..." : "Run End-to-End Pipeline"}
              </button>
              {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
            </div>

            {/* Pipeline Results */}
            {pipeline && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#00d4ff]" />
                    <h3 className="font-bold text-slate-900">Pipeline Results</h3>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${pipeline.success ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {pipeline.success ? "All Phases Passed" : "Issues Found"}
                  </span>
                </div>

                {/* Phase cards */}
                <div className="space-y-3">
                  {PIPELINE_PHASES.map((phase) => {
                    const result = pipeline.phases[phase.key];
                    if (!result) return null;
                    const Icon = phase.icon;
                    const ok = result.ok;
                    return (
                      <div key={phase.key} className={`rounded-xl border p-3 ${ok ? "border-emerald-200 bg-emerald-50/50" : "border-red-200 bg-red-50/50"}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            {ok ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                            <Icon className="w-4 h-4 text-slate-600" />
                            <span className="text-sm font-bold text-slate-800">{phase.label}</span>
                            {result.skipped && <span className="text-[10px] text-slate-400 font-semibold">(skipped)</span>}
                          </div>
                          {result.score !== undefined && (
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${result.score >= 80 ? "bg-emerald-100 text-emerald-700" : result.score >= 60 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                              Score: {result.score}
                            </span>
                          )}
                        </div>
                        {result.url && (
                          <a href={result.url} target="_blank" rel="noopener noreferrer" className="mt-2 block text-xs text-[#00d4ff] font-semibold hover:underline break-all">
                            {result.url}
                          </a>
                        )}
                        {result.issue_count !== undefined && result.issue_count > 0 && (
                          <p className="mt-1 text-xs text-amber-600">{result.issue_count} compliance issues found</p>
                        )}
                        {result.fixes_applied !== undefined && result.fixes_applied > 0 && (
                          <p className="mt-1 text-xs text-emerald-600">{result.fixes_applied} fixes applied</p>
                        )}
                        {result.error && <p className="mt-1 text-xs text-red-500">{result.error}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right: Cloud Browser */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden sticky top-4">
              <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#00d4ff]" />
                <h3 className="font-bold text-sm text-slate-900">Cloud Browser</h3>
              </div>
              <div className="h-[600px]">
                <CloudBrowser url={browserUrl} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}