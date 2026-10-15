import { useState } from "react";
import BackButton from "@/components/shared/BackButton";
import { Loader2, Plug, CheckCircle, Copy, Check, FileText, ExternalLink, Settings, Zap, Search } from "lucide-react";

// All supported connectors grouped by category, with known connection status
const CONNECTOR_GROUPS = [
  {
    name: "Google Suite",
    icon: "🔴",
    connectors: [
      { id: "google_search_console", name: "Search Console", status: "connected", note: "Performance data" },
      { id: "google_analytics", name: "Google Analytics 4", status: "connected", note: "Traffic metrics" },
      { id: "googlesheets", name: "Google Sheets", status: "connected", note: "Onboarding sync" },
      { id: "googledrive", name: "Google Drive", status: "connected", note: "File storage" },
      { id: "googledocs", name: "Google Docs", status: "connected", note: "Document gen" },
      { id: "googlecalendar", name: "Google Calendar", status: "connected", note: "Scheduling" },
      { id: "googletasks", name: "Google Tasks", status: "connected", note: "Task tracking" },
      { id: "gmail", name: "Gmail", status: "connected", note: "Email automation" },
      { id: "googleslides", name: "Google Slides", status: "available" },
      { id: "googlebigquery", name: "BigQuery", status: "available" },
      { id: "googlemeet", name: "Google Meet", status: "available" },
      { id: "google_contacts", name: "Google Contacts", status: "available" },
      { id: "googleforms", name: "Google Forms", status: "available" },
      { id: "googleworkspace", name: "Google Workspace", status: "available" },
    ],
  },
  {
    name: "Communications",
    icon: "💬",
    connectors: [
      { id: "slack", name: "Slack User", status: "available" },
      { id: "slackbot", name: "Slack Bot", status: "available" },
      { id: "discord", name: "Discord", status: "available" },
      { id: "outlook", name: "Outlook", status: "available" },
      { id: "microsoft_teams", name: "Microsoft Teams", status: "available" },
      { id: "share_point", name: "SharePoint", status: "available" },
      { id: "one_drive", name: "OneDrive", status: "available" },
    ],
  },
  {
    name: "Development & DevOps",
    icon: "⚙️",
    connectors: [
      { id: "github", name: "GitHub", status: "connected", note: "Repo sync" },
      { id: "gitlab", name: "GitLab", status: "available" },
      { id: "linear", name: "Linear", status: "available" },
      { id: "jira", name: "Jira", status: "available" },
      { id: "bitbucket", name: "Bitbucket", status: "available" },
      { id: "confluence", name: "Confluence", status: "available" },
      { id: "sentry", name: "Sentry", status: "available" },
      { id: "datadog", name: "Datadog", status: "available" },
      { id: "pagerduty", name: "PagerDuty", status: "available" },
    ],
  },
  {
    name: "CRM & Sales",
    icon: "🎯",
    connectors: [
      { id: "hubspot", name: "HubSpot", status: "connected", note: "CRM sync" },
      { id: "salesforce", name: "Salesforce", status: "available" },
      { id: "attio", name: "Attio", status: "available" },
      { id: "zohocrm", name: "Zoho CRM", status: "available" },
      { id: "pipedrive", name: "Pipedrive", status: "available" },
    ],
  },
  {
    name: "Project & Productivity",
    icon: "📋",
    connectors: [
      { id: "asana", name: "Asana", status: "available" },
      { id: "clickup", name: "ClickUp", status: "available" },
      { id: "wrike", name: "Wrike", status: "available" },
      { id: "basecamp", name: "Basecamp", status: "available" },
      { id: "todoist", name: "Todoist", status: "available" },
      { id: "trello", name: "Trello", status: "available" },
    ],
  },
  {
    name: "Content & Docs",
    icon: "📄",
    connectors: [
      { id: "notion", name: "Notion", status: "available" },
      { id: "airtable", name: "Airtable", status: "available" },
      { id: "box", name: "Box", status: "available" },
      { id: "dropbox", name: "Dropbox", status: "available" },
      { id: "contentful", name: "Contentful", status: "available" },
      { id: "wordpress_com", name: "WordPress", status: "available" },
      { id: "typeform", name: "Typeform", status: "available" },
    ],
  },
  {
    name: "Data & Backend",
    icon: "🗄️",
    connectors: [
      { id: "supabase", name: "Supabase", status: "connected", note: "X1 AI Hub bridge" },
      { id: "snowflake", name: "Snowflake", status: "available" },
      { id: "databricks", name: "Databricks", status: "available" },
    ],
  },
  {
    name: "Social & Marketing",
    icon: "📱",
    connectors: [
      { id: "linkedin", name: "LinkedIn", status: "available" },
      { id: "tiktok", name: "TikTok", status: "available" },
      { id: "instagram", name: "Instagram Business", status: "available" },
      { id: "facebook_pages", name: "Facebook Pages", status: "available" },
      { id: "meta_ads", name: "Meta Ads", status: "available" },
      { id: "mailchimp", name: "Mailchimp", status: "available" },
      { id: "klaviyo", name: "Klaviyo", status: "available" },
      { id: "intercom", name: "Intercom", status: "available" },
      { id: "gorgias", name: "Gorgias", status: "available" },
    ],
  },
  {
    name: "Finance & Payments",
    icon: "💰",
    connectors: [
      { id: "quickbooks", name: "QuickBooks", status: "available" },
      { id: "square", name: "Square", status: "available" },
      { id: "freshbooks", name: "FreshBooks", status: "available" },
      { id: "wave", name: "Wave", status: "available" },
      { id: "polar", name: "Polar", status: "available" },
      { id: "gumroad", name: "Gumroad", status: "available" },
    ],
  },
  {
    name: "Other",
    icon: "🔌",
    connectors: [
      { id: "docusign", name: "DocuSign", status: "available" },
      { id: "eventbrite", name: "Eventbrite", status: "available" },
      { id: "shippo", name: "Shippo", status: "available" },
      { id: "miro", name: "Miro", status: "available" },
      { id: "posthog", name: "PostHog", status: "available" },
      { id: "calendly", name: "Calendly", status: "available" },
      { id: "harvest", name: "Harvest", status: "available" },
      { id: "bamboohr", name: "BambooHR", status: "available" },
    ],
  },
];

// Google Sheets setup instructions for GPT handoff
const SHEETS_SETUP_INSTRUCTIONS = `GOOGLE SHEETS SETUP — DIGITAL DOMINANCE FACTORY

Step 1: Create the Spreadsheet
- Go to sheets.google.com and create a new spreadsheet
- Name it: "Digital Dominance — Onboarding Data"

Step 2: Set Up Column Headers (Row 1)
A1: Project ID
B1: Business Name
C1: Industry
D1: Business Website
E1: Business Research (JSON)
F1: Benchmark (JSON)
G1: Created Date
H1: Status

Step 3: Get the Spreadsheet ID
- Look at the URL: docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
- Copy the SPREADSHEET_ID (the long string between /d/ and /edit)

Step 4: Update the Secret
- Go to Base44 Dashboard > Secrets
- Find GOOGLE_SHEET_ID and update it with the spreadsheet ID from Step 3
- Save

Step 5: Share the Sheet (if needed)
- Click Share in the spreadsheet
- Make sure the Google service account has edit access
- The service account email is available in the Google Sheets connector settings

Step 6: Verify
- Create a new WebsiteProject via Business Onboarding
- Check the spreadsheet — a new row should appear automatically within 1 minute
- The OnboardingSheetSync workflow handles this automatically

HANDOFF TO GPT:
Copy this entire instruction set and paste it to your GPT assistant.
Tell GPT: "Set up a Google Sheet for the Digital Dominance Factory using these instructions, then confirm the spreadsheet ID."`;

export default function ApiConnectorSettings() {
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const allConnectors = CONNECTOR_GROUPS.flatMap((g) => g.connectors);
  const connectedCount = allConnectors.filter((c) => c.status === "connected").length;
  const availableCount = allConnectors.length - connectedCount;

  const filteredGroups = CONNECTOR_GROUPS.map((g) => ({
    ...g,
    connectors: g.connectors.filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase())),
  })).filter((g) => g.connectors.length > 0);

  const copyInstructions = () => {
    navigator.clipboard.writeText(SHEETS_SETUP_INSTRUCTIONS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="portal-light min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton />
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center">
            <Plug className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">API Connector Settings</h1>
            <p className="text-sm text-slate-500">Connect external systems to this platform — {connectedCount} connected, {availableCount} available</p>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Connected</span>
            </div>
            <div className="text-2xl font-bold text-emerald-700">{connectedCount}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Plug className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Available</span>
            </div>
            <div className="text-2xl font-bold text-slate-600">{availableCount}</div>
          </div>
          <div className="rounded-xl border border-[#00d4ff]/30 bg-[#00d4ff]/5 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-[#00d4ff]" />
              <span className="text-xs font-bold text-[#00d4ff] uppercase tracking-wide">Total</span>
            </div>
            <div className="text-2xl font-bold text-[#00d4ff]">{allConnectors.length}</div>
          </div>
        </div>

        {/* Google Sheets setup guide */}
        <div className="rounded-2xl border border-[#00d4ff]/30 bg-[#00d4ff]/5 p-5 mb-6">
          <button onClick={() => setShowGuide(!showGuide)} className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#00d4ff]" />
              <div className="text-left">
                <h3 className="text-sm font-bold text-slate-800">Google Sheets Setup Guide — Hand Off to GPT</h3>
                <p className="text-xs text-slate-500">Step-by-step instructions for setting up the onboarding sync sheet. Copy and paste to your GPT assistant.</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-[#00d4ff]">{showGuide ? "Hide" : "Show"}</span>
          </button>
          {showGuide && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Instructions (copyable)</span>
                <button onClick={copyInstructions} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition">
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied!" : "Copy for GPT"}
                </button>
              </div>
              <pre className="rounded-xl bg-slate-900 text-slate-200 p-4 text-xs leading-relaxed overflow-x-auto max-h-80 overflow-y-auto whitespace-pre-wrap font-mono">{SHEETS_SETUP_INSTRUCTIONS}</pre>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-11 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00d4ff]/50 focus:ring-1 focus:ring-[#00d4ff]/30" placeholder="Search connectors..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {/* Connector groups */}
        <div className="space-y-6">
          {filteredGroups.map((group) => (
            <div key={group.name}>
              <h3 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <span>{group.icon}</span> {group.name}
                <span className="text-xs font-normal text-slate-400">({group.connectors.filter((c) => c.status === "connected").length}/{group.connectors.length})</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {group.connectors.map((c) => (
                  <div key={c.id} className={`rounded-xl border p-3 transition ${c.status === "connected" ? "border-emerald-200 bg-emerald-50/50" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-800 truncate">{c.name}</div>
                        {c.note && <div className="text-[10px] text-slate-400 truncate">{c.note}</div>}
                      </div>
                      {c.status === "connected" ? (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 shrink-0">
                          <CheckCircle className="w-2.5 h-2.5" /> On
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-400 shrink-0">Off</span>
                      )}
                    </div>
                    {c.status === "available" && (
                      <button className="mt-2 text-[10px] font-semibold text-[#00d4ff] hover:underline">
                        Connect →
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Info card */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-start gap-2">
            <Settings className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-500 leading-relaxed">
              <p className="font-semibold text-slate-600 mb-1">How connectors work</p>
              <p>Connectors use OAuth to securely connect external accounts. Connected systems can be used by backend functions and workflows to read data, send messages, create records, and automate tasks. To connect a new system, click "Connect" and authorize access through the provider's OAuth flow. All connector tokens are managed securely by the platform — no credentials are stored in app code.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}