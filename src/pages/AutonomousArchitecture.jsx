import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { ARCHITECTURE_CHECKLIST, PLATFORM_SUMMARY } from "@/data/autonomousArchitectureChecklist";
import { Database, Globe, GitBranch, Mail, Cloud, Server, Box, Cpu, Wrench, Brain, Shield, CheckCircle2, AlertTriangle } from "lucide-react";

const ICONS = {
  Supabase: Database,
  Vercel: Globe,
  GitHub: GitBranch,
  "Google Workspace": Mail,
  "Cloud (AWS/GCP)": Cloud,
  Railway: Server,
  Docker: Box,
  "Ollama (Local)": Cpu,
  Base44: Wrench,
  ChatGPT: Brain,
};

export default function AutonomousArchitecture() {
  const [activeSection, setActiveSection] = useState("overview");

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-[#0a0e14] to-[#0d1b2a] text-white">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center">
              <Brain className="w-7 h-7 text-[#0a0e14]" />
            </div>
            <div>
              <h1 className="text-2xl font-black">Autonomous AI Software Company</h1>
              <p className="text-sm text-white/60">Platform Dissection & Integration Checklist — Credit-Independent Architecture</p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveSection("overview")}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${activeSection === "overview" ? "bg-[#00d4ff] text-[#0a0e14]" : "bg-white/10 text-white/70 hover:bg-white/20"}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveSection("checklist")}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${activeSection === "checklist" ? "bg-[#00d4ff] text-[#0a0e14]" : "bg-white/10 text-white/70 hover:bg-white/20"}`}
            >
              Full Checklist
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {activeSection === "overview" && (
          <>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-[#00d4ff]" />
                <h2 className="text-lg font-black text-slate-900">The Core Principle</h2>
              </div>
              <div className="bg-slate-900 rounded-xl p-5 text-white">
                <p className="text-sm leading-relaxed">
                  <span className="text-[#00d4ff] font-bold">SEPARATE BUILD FROM RUNTIME.</span> Base44 builds the apps, but the apps run on Vercel + Supabase + Railway. If Base44 credits run out, production keeps running. ChatGPT orchestrates everything via MCP. Ollama is the free LLM fallback.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {PLATFORM_SUMMARY.map((p) => {
                const Icon = ICONS[p.name] || Box;
                return (
                  <div key={p.name} className={`rounded-2xl border p-5 ${p.creditIndependent ? "border-emerald-200 bg-emerald-50/50" : "border-amber-200 bg-amber-50/50"}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${p.creditIndependent ? "bg-emerald-100" : "bg-amber-100"}`}>
                        <Icon className={`w-5 h-5 ${p.creditIndependent ? "text-emerald-600" : "text-amber-600"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-slate-900 text-sm">{p.name}</h3>
                          {p.critical && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 font-bold">CRITICAL</span>}
                        </div>
                        <p className="text-xs text-slate-500 mb-2">{p.role}</p>
                        <div className="flex items-center gap-1.5">
                          {p.creditIndependent ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="text-xs font-semibold text-emerald-600">Credit-Independent</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                              <span className="text-xs font-semibold text-amber-600">Credit-Dependent (Build Only)</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-black text-slate-900">Credit Exhaustion Protocol</h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-200 flex items-center justify-center shrink-0 font-bold text-amber-700 text-sm">1</div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Credits LOW (under 20%)</p>
                    <p className="text-xs text-slate-500 mt-1">Switch all LLM calls to Ollama (free). Stop new Base44 generation. Runtime continues normally.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                  <div className="w-8 h-8 rounded-lg bg-red-200 flex items-center justify-center shrink-0 font-bold text-red-700 text-sm">2</div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Credits OUT (0 remaining)</p>
                    <p className="text-xs text-slate-500 mt-1">System continues on Vercel + Supabase + Railway. ChatGPT operates via MCP directly. Ollama handles all LLM. Production runs indefinitely.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center shrink-0 font-bold text-slate-700 text-sm">3</div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">ChatGPT credits OUT (unlikely)</p>
                    <p className="text-xs text-slate-500 mt-1">Ollama takes over ALL LLM tasks. Scheduled tasks pause. Runtime continues. Manual intervention for new work.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 p-6">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-black text-slate-900">Bottom Line</h2>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                If Base44 credits hit zero, the <span className="font-bold">only things that stop</span> are new app generation (ChatGPT can do this directly) and LLM calls through Base44 (Ollama covers this — free). <span className="font-bold text-emerald-700">Everything else keeps running. Production never goes down.</span>
              </p>
            </div>

            <button
              onClick={() => setActiveSection("checklist")}
              className="w-full mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-[#00d4ff] px-6 py-3 text-sm font-bold text-[#0a0e14] hover:brightness-110 transition"
            >
              View Full Checklist →
            </button>
          </>
        )}

        {activeSection === "checklist" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-10">
            <div className="prose prose-slate max-w-none prose-headings:font-black prose-headings:text-slate-900 prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-strong:text-slate-900 prose-code:bg-slate-100 prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[#0066ff] prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-blockquote:border-[#00d4ff]">
              <ReactMarkdown>{ARCHITECTURE_CHECKLIST}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}