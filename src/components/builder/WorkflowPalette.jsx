import { useState } from "react";
import { Zap, Bot, GitBranch, Clock, Radio, Database, Mail, Send, Globe, Rocket, Shield, Search, Image, FileText, Users, CreditCard, Calendar, BarChart3, Server, Code, Workflow, Plus } from "lucide-react";

const PALETTE_SECTIONS = [
  {
    label: "Triggers",
    icon: Zap,
    color: "#f59e0b",
    items: [
      { type: "trigger", subtype: "entity_create", label: "Entity Created", icon: Database, desc: "When a new record is created" },
      { type: "trigger", subtype: "entity_update", label: "Entity Updated", icon: Database, desc: "When a record is updated" },
      { type: "trigger", subtype: "scheduled", label: "Scheduled", icon: Clock, desc: "Run on a schedule" },
      { type: "trigger", subtype: "manual", label: "Manual", icon: Plus, desc: "Triggered manually" },
    ],
  },
  {
    label: "Actions",
    icon: Zap,
    color: "#00d4ff",
    items: [
      { type: "action", subtype: "generateWebsite", label: "Generate Website", icon: Globe, desc: "Generate a website from research", config: { function_name: "generateWebsite" } },
      { type: "action", subtype: "deploySite", label: "Deploy Site", icon: Rocket, desc: "Deploy to Vercel", config: { function_name: "deploySite" } },
      { type: "action", subtype: "researchBusiness", label: "Research Business", icon: Search, desc: "Skip-trace business data", config: { function_name: "researchBusiness" } },
      { type: "action", subtype: "generateAssets", label: "Generate Assets", icon: Image, desc: "Generate logo and images", config: { function_name: "generateAssets" } },
      { type: "action", subtype: "generateContent", label: "Generate Content", icon: FileText, desc: "Generate website content", config: { function_name: "generateContent" } },
      { type: "action", subtype: "runComplianceCheck", label: "Compliance Check", icon: Shield, desc: "Run Google compliance check", config: { function_name: "runComplianceCheck" } },
      { type: "action", subtype: "runMarketingCompliance", label: "Marketing Compliance", icon: Shield, desc: "Run marketing compliance test", config: { function_name: "runMarketingCompliance" } },
      { type: "action", subtype: "generateSocialScheduleV2", label: "Social Calendar", icon: Calendar, desc: "Generate 30-day social calendar", config: { function_name: "generateSocialScheduleV2" } },
      { type: "action", subtype: "syncAllAnalytics", label: "Sync Analytics", icon: BarChart3, desc: "Sync Google Analytics + Search Console", config: { function_name: "syncAllAnalytics" } },
      { type: "action", subtype: "massLaunch", label: "Mass Launch", icon: Rocket, desc: "Launch mass campaign", config: { function_name: "massLaunch" } },
      { type: "action", subtype: "provisionSandbox", label: "Provision Sandbox", icon: Server, desc: "Provision Railway/Vercel sandbox", config: { function_name: "provisionSandbox" } },
      { type: "action", subtype: "batchDeploy", label: "Batch Deploy", icon: Rocket, desc: "Deploy multiple sites", config: { function_name: "batchDeploy" } },
    ],
  },
  {
    label: "Agents",
    icon: Bot,
    color: "#8b5cf6",
    items: [
      { type: "agent", subtype: "super_agent", label: "Super Agent", icon: Bot, desc: "Full platform access agent" },
      { type: "agent", subtype: "master_orchestrator", label: "Master Orchestrator", icon: Workflow, desc: "Coordinates all agents" },
      { type: "agent", subtype: "seo_sentinel", label: "SEO Sentinel", icon: Shield, desc: "SEO monitoring and compliance" },
      { type: "agent", subtype: "social_media_manager", label: "Social Media Manager", icon: Calendar, desc: "Social content generation" },
      { type: "agent", subtype: "analytics_watcher", label: "Analytics Watcher", icon: BarChart3, desc: "Performance monitoring" },
      { type: "agent", subtype: "communications_director", label: "Comms Director", icon: Mail, desc: "Email and messaging" },
      { type: "agent", subtype: "monetization_agent", label: "Monetization Agent", icon: CreditCard, desc: "Revenue optimization" },
    ],
  },
  {
    label: "Communications",
    icon: Send,
    color: "#ec4899",
    items: [
      { type: "action", subtype: "sendEmail", label: "Send Email", icon: Mail, desc: "Send an email to a user", config: { function_name: "sendGmailEmail" } },
      { type: "action", subtype: "sendSMS", label: "Send SMS", icon: Send, desc: "Send Twilio SMS", config: { function_name: "sendTwilioSMS" } },
      { type: "action", subtype: "createCalendarEvent", label: "Calendar Event", icon: Calendar, desc: "Create Google Calendar event", config: { function_name: "createCalendarEvent" } },
    ],
  },
  {
    label: "Logic",
    icon: GitBranch,
    color: "#64748b",
    items: [
      { type: "condition", subtype: "if", label: "If / Condition", icon: GitBranch, desc: "Branch based on a condition" },
      { type: "delay", subtype: "wait", label: "Wait / Delay", icon: Clock, desc: "Pause for a duration" },
    ],
  },
  {
    label: "Integrations",
    icon: Radio,
    color: "#3b82f6",
    items: [
      { type: "action", subtype: "syncGoogleSheet", label: "Google Sheets Sync", icon: Database, desc: "Sync to Google Sheets", config: { function_name: "syncGoogleSheet" } },
      { type: "action", subtype: "gptSyncEngine", label: "GPT Sync", icon: Radio, desc: "Sync with ChatGPT", config: { function_name: "gptSyncEngine" } },
      { type: "action", subtype: "customApiGateway", label: "API Gateway", icon: Code, desc: "External API access", config: { function_name: "customApiGateway" } },
    ],
  },
];

export default function WorkflowPalette() {
  const [expanded, setExpanded] = useState({ Triggers: true, Actions: true, Agents: true });
  const [draggedItem, setDraggedItem] = useState(null);

  const toggle = (label) => setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));

  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("application/json", JSON.stringify(item));
  };

  return (
    <div className="w-64 shrink-0 bg-white border-r border-slate-200 overflow-y-auto">
      <div className="px-4 py-3 border-b border-slate-200 sticky top-0 bg-white z-10">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Workflow Blocks</h3>
        <p className="text-[10px] text-slate-400 mt-0.5">Drag blocks to the canvas</p>
      </div>
      <div className="p-2 space-y-1">
        {PALETTE_SECTIONS.map((section) => {
          const SectionIcon = section.icon;
          const isOpen = expanded[section.label] ?? true;
          return (
            <div key={section.label}>
              <button onClick={() => toggle(section.label)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition">
                <SectionIcon className="w-3.5 h-3.5" style={{ color: section.color }} />
                <span className="text-xs font-bold text-slate-700 flex-1 text-left">{section.label}</span>
                <span className="text-[10px] text-slate-400">{section.items.length}</span>
              </button>
              {isOpen && (
                <div className="ml-2 mt-0.5 space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.subtype}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item)}
                        className="flex items-start gap-2 rounded-lg border border-slate-200 bg-white p-2 cursor-grab hover:border-[#00d4ff]/40 hover:shadow-sm transition active:cursor-grabbing">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: section.color + "20" }}>
                          <Icon className="w-3.5 h-3.5" style={{ color: section.color }} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-slate-700 truncate">{item.label}</div>
                          <div className="text-[10px] text-slate-400 line-clamp-1">{item.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}