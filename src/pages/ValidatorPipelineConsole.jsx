import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Shield, CheckCircle2, XCircle, AlertTriangle, Loader2, ArrowRight, Play, Wrench } from "lucide-react";

const GATE_STYLES = {
  pass: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", label: "PASS" },
  conditional_pass: { icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", label: "CONDITIONAL" },
  fail: { icon: XCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-200", label: "FAIL" },
};

const STAGE_LABELS = [
  { stage: "research", label: "Research", gate: "research_quality", gateLabel: "Research Quality Gate" },
  { stage: "generate", label: "Generate Content", gate: "content_completeness", gateLabel: "Content Completeness Gate" },
  { stage: "compliance", label: "Compliance Check", gate: "google_compliance", gateLabel: "Google Compliance Gate" },
  { stage: "auto_fix", label: "Auto-Fix Issues", gate: "fix_verification", gateLabel: "Fix Verification Gate" },
  { stage: "qa", label: "QA Polish", gate: "human_quality", gateLabel: "Human Quality Gate" },
  { stage: "deploy", label: "Deploy to Vercel", gate: "final_release", gateLabel: "Final Release Gate" },
];

export default function ValidatorPipelineConsole() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [form, setForm] = useState({ businessWebsiteUrl: "", industry: "", businessName: "" });

  const runPipeline = async () => {
    setRunning(true);
    setResult(null);
    try {
      const payload = form.businessWebsiteUrl
        ? { generateParams: { businessWebsiteUrl: form.businessWebsiteUrl, industry: form.industry, businessName: form.businessName } }
        : {};
      const res = await base44.functions.invoke("validatorGatedPipeline", payload);
      setResult(res.data);
    } catch (err) {
      setResult({ error: err.message });
    } finally {
      setRunning(false);
    }
  };

  const stages = result?.stages || [];
  const gates = result?.gates || [];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-7 h-7 text-[#00d4ff]" />
            <h1 className="text-2xl font-black text-slate-900">Validator-Gated Pipeline</h1>
          </div>
          <p className="text-sm text-slate-500">
            Full build pipeline with 6 independent validators between stages. Each gate must pass before the next stage runs.
          </p>
        </div>

        {/* Input form */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase mb-1.5 block">Business Website URL</label>
              <input
                type="text"
                value={form.businessWebsiteUrl}
                onChange={(e) => setForm({ ...form, businessWebsiteUrl: e.target.value })}
                placeholder="https://example.com"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/40"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase mb-1.5 block">Industry</label>
              <input
                type="text"
                value={form.industry}
                onChange={(e) => setForm({ ...form, industry: e.target.value })}
                placeholder="Roofing"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/40"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase mb-1.5 block">Business Name</label>
              <input
                type="text"
                value={form.businessName}
                onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                placeholder="Optional"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/40"
              />
            </div>
          </div>
          <button
            onClick={runPipeline}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-full bg-[#00d4ff] px-6 py-2.5 text-sm font-bold text-[#0a0e14] hover:brightness-110 disabled:opacity-50 transition"
          >
            {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {running ? "Running Pipeline..." : "Run Pipeline"}
          </button>
        </div>

        {/* Gate status banner */}
        {result?.gated && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-600 shrink-0" />
            <div>
              <div className="font-bold text-red-900 text-sm">Pipeline Gated</div>
              <div className="text-red-700 text-sm">{result.gate_reason}</div>
            </div>
          </div>
        )}
        {result?.success && !result.gated && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <div className="font-bold text-emerald-900 text-sm">Pipeline Complete — {result.final_verdict?.toUpperCase()}</div>
              <div className="text-emerald-700 text-sm">
                {result.gates_passed}/{result.gates_total} gates passed · {result.total_fix_runs} fix runs · {result.stages_completed} stages · {(result.duration_ms / 1000).toFixed(1)}s
              </div>
            </div>
          </div>
        )}

        {/* Pipeline visualization */}
        {stages.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
            <h2 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wide">Pipeline Stages</h2>
            <div className="space-y-1">
              {STAGE_LABELS.map((s, i) => {
                const stageData = stages.find(st => st.stage === s.stage);
                const validatorData = gates.find(v => v.gate === s.gate);
                const stageStatus = stageData?.status;
                const gateVerdict = validatorData?.verdict;

                return (
                  <div key={s.stage}>
                    {/* Stage row */}
                    <div className="flex items-center gap-3 py-2.5">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        stageStatus === "complete" || stageStatus === "skipped" ? "bg-emerald-100 text-emerald-700" :
                        stageStatus === "failed" ? "bg-red-100 text-red-700" :
                        stageStatus ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-400"
                      }`}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-800">{s.label}</div>
                        <div className="text-xs text-slate-500">
                          {stageStatus === "complete" && "Completed"}
                          {stageStatus === "skipped" && "Skipped"}
                          {stageStatus === "failed" && `Failed: ${stageData?.error || ""}`}
                          {stageStatus === "loaded_from_project" && "Loaded from project"}
                          {stageStatus === "fresh_generation" && "Fresh generation"}
                          {!stageStatus && "Pending"}
                        </div>
                      </div>
                      {stageData?.url && (
                        <a href={stageData.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#00d4ff] hover:underline truncate max-w-[200px]">
                          {stageData.url}
                        </a>
                      )}
                    </div>

                    {/* Validator gate row */}
                    {validatorData && (
                      <div className="flex items-center gap-3 py-2 ml-10 pl-2 border-l-2 border-slate-100">
                        <ArrowRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-slate-600">{s.gateLabel}</div>
                          <div className="text-xs text-slate-500 truncate">{validatorData.summary}</div>
                        </div>
                        {gateVerdict && <GateBadge verdict={gateVerdict} score={validatorData.score || validatorData.overall_score} />}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Validator details */}
        {gates.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wide">Independent Validator Reports</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gates.map((v, i) => (
              <div key={i} className="border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-bold text-slate-600 uppercase">{v.gate?.replace(/_/g, " ")}</div>
                  <GateBadge verdict={v.verdict} score={v.score || v.overall_score} />
                </div>
                <div className="text-sm text-slate-700 mb-2">{v.summary}</div>
                {v.fix_runs > 0 && (
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-[#00d4ff]/10 text-[#0066ff] mb-2">
                    <Wrench className="w-3 h-3" />
                    {v.fix_runs} fix {v.fix_runs === 1 ? "run" : "runs"} {v.gated ? "(unresolved)" : "(resolved)"}
                  </div>
                )}
                {v.attempts?.length > 1 && (
                  <div className="mt-2 space-y-1">
                    {v.attempts.map((a, j) => (
                      <div key={j} className="text-xs text-slate-500 flex items-center gap-2">
                        <span className="font-mono text-slate-400">#{a.attempt}</span>
                        <span className={a.verdict === "pass" || a.verdict === "conditional_pass" ? "text-emerald-600" : "text-red-600"}>{a.verdict}</span>
                        {a.score != null && <span>· {Math.round(a.score)}</span>}
                        {a.fix_applied && <span className="text-[#0066ff] truncate">→ fixed</span>}
                      </div>
                    ))}
                  </div>
                )}
                  {v.critical_issues?.length > 0 && (
                    <div className="mt-2">
                      <div className="text-xs font-semibold text-red-600 mb-1">Critical Issues:</div>
                      <ul className="text-xs text-slate-600 space-y-0.5 list-disc list-inside">
                        {v.critical_issues.slice(0, 3).map((iss, j) => <li key={j}>{iss}</li>)}
                      </ul>
                    </div>
                  )}
                  {v.gaps?.length > 0 && (
                    <div className="mt-2">
                      <div className="text-xs font-semibold text-amber-600 mb-1">Gaps:</div>
                      <ul className="text-xs text-slate-600 space-y-0.5 list-disc list-inside">
                        {v.gaps.slice(0, 3).map((g, j) => <li key={j}>{g}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function GateBadge({ verdict, score }) {
  const style = GATE_STYLES[verdict] || { icon: AlertTriangle, color: "text-slate-500", bg: "bg-slate-50", border: "border-slate-200", label: "PENDING" };
  const Icon = style.icon;
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${style.bg} ${style.color} ${style.border} border shrink-0`}>
      <Icon className="w-3 h-3" />
      {style.label}{score != null ? ` · ${Math.round(score)}` : ""}
    </div>
  );
}