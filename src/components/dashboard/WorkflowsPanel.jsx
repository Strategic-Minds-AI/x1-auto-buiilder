import { Workflow, Clock, Zap, Calendar, Mail, Activity } from "lucide-react";

const WORKFLOWS = [
  { name: "AutoProjectSandbox", trigger: "entity", desc: "Auto-provisions a Railway sandbox when a new project is created", icon: Zap },
  { name: "AutoSandboxProvision", trigger: "scheduled", desc: "Periodically provisions pending sandboxes for active projects", icon: Clock },
  { name: "ProactiveSystemAudit", trigger: "scheduled", desc: "Runs proactive system-wide audits on a recurring schedule", icon: Activity },
  { name: "LeadFollowUpSequence", trigger: "entity", desc: "Triggers automated follow-up email sequence when a new lead is captured", icon: Mail },
  { name: "ScheduledAnalyticsSync", trigger: "scheduled", desc: "Syncs Google Analytics and Search Console data on a schedule", icon: Calendar },
  { name: "NewProjectSocialGeneration", trigger: "entity", desc: "Generates social media content when a new project is created", icon: Zap },
  { name: "OnboardingSheetSync", trigger: "entity", desc: "Syncs onboarding data to Google Sheets when onboarding completes", icon: Mail },
];

export default function WorkflowsPanel() {
  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-800 mb-1">Workflow Automation</h2>
        <p className="text-sm text-slate-500">{WORKFLOWS.length} automated workflows powering trigger-driven processes across the platform.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {WORKFLOWS.map((wf) => {
          const Icon = wf.icon;
          return (
            <div key={wf.name} className="rounded-xl border border-slate-200 bg-white p-4 hover:border-[#00d4ff]/40 transition">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#00d4ff]/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-[#00d4ff]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-800 mb-0.5">{wf.name}</h3>
                  <p className="text-xs text-slate-500 mb-2">{wf.desc}</p>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      <Workflow className="w-2.5 h-2.5" /> {wf.trigger}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}