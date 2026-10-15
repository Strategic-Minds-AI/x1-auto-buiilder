import { useState } from "react";
import BackButton from "@/components/shared/BackButton";
import { FileSpreadsheet, Copy, Check, Database, Workflow, Zap, AlertCircle, CheckCircle, Clock } from "lucide-react";

// All Google Sheets the platform needs — one spreadsheet with multiple tabs
const SHEETS = [
  {
    id: "onboarding",
    tabName: "Onboarding",
    purpose: "Skip-traced business research data — auto-syncs when a new WebsiteProject is created",
    functionName: "syncOnboardingToSheet",
    workflow: "OnboardingSheetSync workflow (auto-fires on project creation)",
    status: "active",
    columns: [
      "Project ID", "Business Name", "Industry", "Business Website",
      "Business Research (JSON)", "Benchmark (JSON)", "Created Date", "Status"
    ],
  },
  {
    id: "leads",
    tabName: "Leads CRM",
    purpose: "All CRM contacts with follow-up status and pipeline stage",
    functionName: "processFollowUps (reads from CrmContact entity)",
    workflow: "LeadFollowUpSequence workflow (hourly email processing)",
    status: "planned",
    columns: [
      "Contact ID", "Name", "Email", "Phone", "Source", "Status",
      "Follow-Up Subject", "Follow-Up Date", "Follow-Up Status", "Notes", "Created Date"
    ],
  },
  {
    id: "pricing",
    tabName: "Pricing Intelligence",
    purpose: "Competitor pricing data discovered across industries and markets",
    functionName: "discoverPricing",
    workflow: "Manual trigger from Research Hub or Business Onboarding",
    status: "planned",
    columns: [
      "Record ID", "Industry", "Competitor Name", "Service/Product",
      "Price Range", "Price Min (cents)", "Price Max (cents)", "Currency",
      "Unit", "Pricing Tier", "Geography", "Confidence", "Source URL", "Retrieval Date"
    ],
  },
  {
    id: "masslaunch",
    tabName: "Mass Launch Tracker",
    purpose: "Tracks all mass-launch campaign sites, locations, and deployment status",
    functionName: "massLaunch / massLaunchFromMaster",
    workflow: "Manual trigger from Mass Launch Console",
    status: "planned",
    columns: [
      "Project ID", "Campaign ID", "Business Name", "Industry", "Location",
      "Status", "Deploy URL", "Deploy ID", "Compliance Score", "Created Date"
    ],
  },
  {
    id: "social",
    tabName: "Social Campaign Calendar",
    purpose: "30-day social media content calendar across all platforms",
    functionName: "generateSocialScheduleV2",
    workflow: "NewProjectSocialGeneration workflow (fires on project approval)",
    status: "planned",
    columns: [
      "Post ID", "Project ID", "Platform", "Post Date", "Caption",
      "Hashtags", "CTA", "UTM URL", "Status", "Content Pillar", "Created Date"
    ],
  },
  {
    id: "performance",
    tabName: "Performance & Analytics",
    purpose: "Search Console + GA4 metrics synced per project — clicks, impressions, CTR, position",
    functionName: "syncSearchConsole / syncGoogleAnalytics",
    workflow: "ScheduledAnalyticsSync workflow (daily)",
    status: "planned",
    columns: [
      "Project ID", "Business Name", "Clicks", "Impressions", "CTR",
      "Avg Position", "Top Query", "Top Query Clicks", "Synced Date"
    ],
  },
  {
    id: "agents",
    tabName: "Agent Task Tracker",
    purpose: "All super-agent tasks — status, progress, priority, and assignment",
    functionName: "AgentOrchestrator page (reads AgentTask entity)",
    workflow: "Manual dispatch from Agent Orchestrator",
    status: "planned",
    columns: [
      "Task ID", "Agent Name", "Task Description", "Priority",
      "Status", "Progress %", "Assigned To", "Created Date", "Completed Date"
    ],
  },
  {
    id: "templates",
    tabName: "Template Inventory",
    purpose: "All design templates across website, desktop, and mobile categories",
    functionName: "generateDesignTemplates / batchValidateTemplates",
    workflow: "Manual trigger from Design Library or Validation Engine",
    status: "planned",
    columns: [
      "Template ID", "Name", "Category", "Industry", "Layout",
      "Tone", "Validation Status", "Created Date"
    ],
  },
  {
    id: "compliance",
    tabName: "Compliance & Validation",
    purpose: "Google compliance check results and auto-fix history per site",
    functionName: "runComplianceCheck / autoFixCompliance / autoConvergeSite",
    workflow: "Manual trigger from Mass Launch Console or Compliance Dashboard",
    status: "planned",
    columns: [
      "Report ID", "Project ID", "Check Type", "Score", "Issues Found",
      "Auto-Fixed", "Status", "Checked Date"
    ],
  },
  {
    id: "revenue",
    tabName: "Revenue Attribution",
    purpose: "Lead-to-revenue pipeline — tracks leads through qualification, appointments, and sales",
    functionName: "processFollowUps + CRM (manual entry for revenue)",
    workflow: "Manual + LeadFollowUpSequence workflow",
    status: "planned",
    columns: [
      "Lead ID", "Project ID", "Business Name", "Lead Source", "Lead Date",
      "Qualified Date", "Appointment Date", "Sale Date", "Revenue (USD)",
      "Cost (USD)", "Gross Profit", "CAC", "Conversion Rate"
    ],
  },
];

// Build the full copyable GPT handoff text
function buildGPTHandoff() {
  let text = `GOOGLE SHEETS SETUP — DIGITAL DOMINANCE FACTORY
==============================================

Create ONE Google Spreadsheet with multiple tabs (one per data type below).

STEP 1: Create the Spreadsheet
- Go to sheets.google.com
- Create a new spreadsheet
- Name it: "Digital Dominance Factory — Data Hub"

STEP 2: Create Tabs and Column Headers
For each tab below, create a new sheet tab, name it, and add the column headers in row 1:

`;
  SHEETS.forEach((sheet, i) => {
    text += `\n--- TAB ${i + 1}: ${sheet.tabName} ---\n`;
    text += `Purpose: ${sheet.purpose}\n`;
    text += `Written by: ${sheet.functionName}\n`;
    text += `Trigger: ${sheet.workflow}\n`;
    text += `Status: ${sheet.status === "active" ? "ACTIVE (sync function exists)" : "PLANNED (set up sheet now, sync function to be wired)"}\n\n`;
    text += `Column Headers (Row 1):\n`;
    sheet.columns.forEach((col, ci) => {
      const letter = String.fromCharCode(65 + ci);
      text += `${letter}1: ${col}\n`;
    });
  });

  text += `\n\nSTEP 3: Get the Spreadsheet ID
- Look at the URL: docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
- Copy the SPREADSHEET_ID (the long string between /d/ and /edit)

STEP 4: Update the Secret
- Go to Base44 Dashboard > Secrets
- Find GOOGLE_SHEET_ID and paste the spreadsheet ID
- Save

STEP 5: Share the Sheet
- Click "Share" in the spreadsheet
- Set to "Anyone with the link can edit" (or share with the service account email)
- The Google Sheets connector (already connected) handles authentication

STEP 6: Verify
- Create a new WebsiteProject via Business Onboarding
- Check the "Onboarding" tab — a new row should appear within 1 minute
- The OnboardingSheetSync workflow handles this automatically

HANDOFF INSTRUCTIONS FOR GPT:
"Set up a Google Spreadsheet called 'Digital Dominance Factory — Data Hub' with the tabs and column headers listed above. Share it with edit access. Then give me the spreadsheet ID so I can update the GOOGLE_SHEET_ID secret."`;

  return text;
}

export default function SheetsSetupGuide() {
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedSheet, setCopiedSheet] = useState(null);

  const copyAll = () => {
    navigator.clipboard.writeText(buildGPTHandoff());
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 3000);
  };

  const copySheet = (sheet) => {
    const text = `TAB: ${sheet.tabName}
Purpose: ${sheet.purpose}
Written by: ${sheet.functionName}
Trigger: ${sheet.workflow}

Column Headers (Row 1):
${sheet.columns.map((c, i) => `${String.fromCharCode(65 + i)}1: ${c}`).join("\n")}

Status: ${sheet.status === "active" ? "ACTIVE (sync function exists)" : "PLANNED (set up sheet now)"}`;

    navigator.clipboard.writeText(text);
    setCopiedSheet(sheet.id);
    setTimeout(() => setCopiedSheet(null), 2000);
  };

  const activeCount = SHEETS.filter((s) => s.status === "active").length;
  const plannedCount = SHEETS.filter((s) => s.status === "planned").length;

  return (
    <div className="portal-light min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton />
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">Google Sheets Setup Guide</h1>
              <p className="text-sm text-slate-500">{SHEETS.length} sheets to set up — {activeCount} active, {plannedCount} planned — with copyable GPT handoff</p>
            </div>
          </div>
          <button onClick={copyAll} className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800 transition">
            {copiedAll ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copiedAll ? "Copied All!" : "Copy All for GPT"}
          </button>
        </div>

        {/* Overview card */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 mb-6">
          <div className="flex items-start gap-3">
            <Database className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-sm text-slate-600 leading-relaxed">
              <p className="font-bold text-slate-800 mb-1">One Spreadsheet, Multiple Tabs</p>
              <p>Create <strong>one</strong> Google Spreadsheet called "Digital Dominance Factory — Data Hub" with <strong>{SHEETS.length} tabs</strong> (one per data type below). Each tab has specific column headers in row 1. The platform's workflows and backend functions write to these tabs automatically. Copy the full instructions above and hand them to GPT to set up the entire spreadsheet for you.</p>
            </div>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-600">Active</span>
            </div>
            <div className="text-xl font-bold text-emerald-700">{activeCount}</div>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[10px] font-bold uppercase tracking-wide text-amber-600">Planned</span>
            </div>
            <div className="text-xl font-bold text-amber-700">{plannedCount}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Total Tabs</span>
            </div>
            <div className="text-xl font-bold text-slate-600">{SHEETS.length}</div>
          </div>
        </div>

        {/* Sheet cards */}
        <div className="space-y-4">
          {SHEETS.map((sheet, idx) => (
            <div key={sheet.id} className={`rounded-2xl border p-5 ${sheet.status === "active" ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200 bg-white"}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${sheet.status === "active" ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"}`}>
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                      {sheet.tabName}
                      {sheet.status === "active" ? (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          <CheckCircle className="w-2.5 h-2.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                          <Clock className="w-2.5 h-2.5" /> Planned
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{sheet.purpose}</p>
                  </div>
                </div>
                <button onClick={() => copySheet(sheet)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-[#00d4ff] hover:border-[#00d4ff]/40 transition shrink-0">
                  {copiedSheet === sheet.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSheet === sheet.id ? "Copied!" : "Copy"}
                </button>
              </div>

              {/* Column headers */}
              <div className="mb-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Column Headers (Row 1)</div>
                <div className="flex flex-wrap gap-1">
                  {sheet.columns.map((col, ci) => (
                    <span key={ci} className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-mono text-slate-600">
                      <span className="text-slate-400 font-bold">{String.fromCharCode(65 + ci)}</span>
                      {col}
                    </span>
                  ))}
                </div>
              </div>

              {/* Function and workflow info */}
              <div className="flex flex-wrap gap-3 text-[11px]">
                <div className="flex items-center gap-1 text-slate-500">
                  <Zap className="w-3 h-3 text-[#00d4ff]" />
                  <span className="font-mono">{sheet.functionName}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-500">
                  <Workflow className="w-3 h-3 text-slate-400" />
                  <span>{sheet.workflow}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Handoff instructions */}
        <div className="mt-6 rounded-2xl border border-[#00d4ff]/30 bg-[#00d4ff]/5 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#00d4ff] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-1">How to Hand Off to GPT</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-3">
                Click "Copy All for GPT" at the top. Paste the full instruction block into ChatGPT and say: <em>"Set up this Google Spreadsheet with all the tabs and column headers listed. Share it with edit access and give me the spreadsheet ID."</em> GPT will create the spreadsheet, set up all {SHEETS.length} tabs with the correct headers, and return the spreadsheet ID for you to paste into the GOOGLE_SHEET_ID secret.
              </p>
              <div className="flex items-center gap-2">
                <button onClick={copyAll} className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition">
                  {copiedAll ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedAll ? "Copied!" : "Copy All Instructions"}
                </button>
                <span className="text-xs text-slate-400">Then paste into ChatGPT</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}