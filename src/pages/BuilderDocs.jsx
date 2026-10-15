import BackButton from "@/components/shared/BackButton";
import PageHeader from "@/components/shared/PageHeader";
import { Wand2, MessageSquare, Rocket, Database, Bot, Smartphone, Globe, Boxes, Zap, Shield, GitBranch, Brain } from "lucide-react";

const SECTIONS = [
  {
    icon: Wand2,
    title: "Visual Builder",
    description: "Chat-guided visual editor with live preview. Chat with the Super Agent on the left to generate, edit, and refine websites. See changes rendered in real-time on the right with desktop, tablet, and mobile previews.",
    features: ["Split-pane layout (chat left, preview right)", "Device toggle (desktop / tablet / mobile)", "Builder toolbar (Generate, Pages, Components, Theme, Deploy, Publish)", "Real-time AI-guided editing", "Project selector with all saved websites"],
  },
  {
    icon: Bot,
    title: "Super Agent Integration",
    description: "The Visual Builder is powered by the Super Agent — an autonomous AI with full platform access. It can generate websites, deploy to Vercel, sync analytics, send emails, manage CRM, run compliance, and more — all from the chat panel.",
    features: ["31 entities + 49 backend functions", "WhatsApp channel for phone operations", "Custom instruction system for dynamic behavior", "Proactive system auditing", "Zero limitations — full read/write/execute"],
  },
  {
    icon: Database,
    title: "Sandbox Provisioning",
    description: "Create isolated sandboxes in Railway and Vercel for testing and development. The provisionSandbox function handles full lifecycle: create, configure, deploy, and destroy.",
    features: ["Railway sandbox creation via GraphQL API", "Vercel project creation via REST API", "Sandbox entity tracks all instances", "Auto-provisioning from the builder", "Destroy sandboxes when done"],
  },
  {
    icon: Smartphone,
    title: "WhatsApp / Phone Operations",
    description: "The Super Agent is connected via WhatsApp. Operate the entire platform from your phone — generate websites, deploy, sync analytics, send emails, and manage CRM from anywhere.",
    features: ["WhatsApp channel with greeting message", "Full platform access from mobile", "Custom instruction system", "Real-time conversation sync", "Phone-guided operations"],
  },
  {
    icon: Boxes,
    title: "What Else Can Be Wired In",
    description: "The builder ecosystem connects to every part of the Digital Dominance Factory. Here's what the Super Agent can wire into:",
    features: ["GitHub repos — auto-push generated code", "CRM — auto-create leads from generated sites", "Social media — auto-generate content for new sites", "Analytics — auto-track performance", "Email campaigns — auto-send to new leads", "Compliance — auto-check before deploy", "Fault Line Scanner — auto-scan competitors", "Mass Launch — auto-generate location variants", "Video Studio — auto-generate videos", "Card/Flyer Studio — auto-generate business cards", "Supabase Bridge — auto-sync data", "GPT Sync — auto-sync with ChatGPT"],
  },
  {
    icon: Brain,
    title: "Base44 Builder Benchmarking",
    description: "The Visual Builder is modeled on Base44's builder UI — the industry-leading AI website builder. Key capabilities benchmarked from Base44:",
    features: ["Chat-based generation (describe what you want, AI builds it)", "Visual editor (click components to edit text, colors, layout)", "Discussion mode (plan before building)", "Real-time preview with device toggle", "Component-level editing", "Prompt-based refinement", "One-click deploy/publish"],
  },
];

export default function BuilderDocs() {
  return (
    <div className="min-h-screen bg-white">
      <PageHeader title="Builder Documentation" subtitle="The complete guide to the Visual Builder system, sandbox provisioning, agent integration, and platform capabilities" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton fallback="/portal" label="Back to Portal" />

        {/* Quick start */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-[#00d4ff]" />
            <h2 className="text-lg font-black text-slate-900">Quick Start</h2>
          </div>
          <ol className="space-y-2 text-sm text-slate-600">
            <li><span className="font-bold text-slate-800">1.</span> Open the <span className="font-semibold text-[#00d4ff]">Visual Builder</span> from the Portal sidebar</li>
            <li><span className="font-bold text-slate-800">2.</span> Select an existing project or click <span className="font-semibold">Generate</span> to create a new one</li>
            <li><span className="font-bold text-slate-800">3.</span> Chat with the Super Agent on the left — ask it to generate, edit, or deploy</li>
            <li><span className="font-bold text-slate-800">4.</span> See changes rendered in real-time on the right with device toggle</li>
            <li><span className="font-bold text-slate-800">5.</span> Click <span className="font-semibold">Deploy</span> or <span className="font-semibold">Publish</span> to push to Vercel</li>
            <li><span className="font-bold text-slate-800">6.</span> Connect WhatsApp to operate the builder from your phone</li>
          </ol>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {SECTIONS.map((section, i) => {
            const Icon = section.icon;
            return (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#00d4ff]/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-[#00d4ff]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-black text-slate-900 mb-1">{section.title}</h3>
                    <p className="text-sm text-slate-600 mb-3">{section.description}</p>
                    <ul className="space-y-1.5">
                      {section.features.map((f, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-slate-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] mt-1.5 shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-8 rounded-2xl bg-gradient-to-r from-[#0a0e14] to-[#0d1525] p-6 text-center">
          <h3 className="text-lg font-black text-white mb-2">Ready to Build?</h3>
          <p className="text-sm text-white/60 mb-4">Open the Visual Builder and start creating with AI-guided editing.</p>
          <a href="/visual-builder" className="inline-flex items-center gap-2 rounded-full bg-[#00d4ff] px-6 py-3 text-sm font-bold text-[#0a0e14] hover:brightness-110 transition">
            <Wand2 className="w-4 h-4" /> Open Visual Builder
          </a>
        </div>
      </div>
    </div>
  );
}