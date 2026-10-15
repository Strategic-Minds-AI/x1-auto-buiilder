import { useState } from "react";
import BackButton from "@/components/shared/BackButton";
import MarketingOverview from "@/components/marketing/MarketingOverview";
import GoogleCompliancePanel from "@/components/marketing/GoogleCompliancePanel";
import MarketingToolsCatalog from "@/components/marketing/MarketingToolsCatalog";
import SocialContentPanel from "@/components/marketing/SocialContentPanel";
import MarketingAgentPanel from "@/components/marketing/MarketingAgentPanel";
import { Megaphone, Search, Shield, Zap, Share2, Bot, Target } from "lucide-react";

const TABS = [
  { key: "overview", label: "Overview", icon: Megaphone },
  { key: "compliance", label: "Google Compliance", icon: Shield },
  { key: "tools", label: "Marketing Tools", icon: Zap },
  { key: "social", label: "Social Content", icon: Share2 },
  { key: "agent", label: "Marketing Agent", icon: Bot },
  { key: "ads", label: "Google Ads", icon: Target },
];

export default function MarketingLibrary() {
  const [tab, setTab] = useState("overview");

  return (
    <div className="portal-light min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <BackButton fallback="/portal" label="Back to Portal" />
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Marketing Library</h1>
              <p className="text-sm text-slate-500">Marketing plans, content, and campaigns based on what your app actually does</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 sticky top-[73px] z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition whitespace-nowrap ${tab === t.key ? "border-[#00d4ff] text-[#00d4ff]" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
                  <Icon className="w-4 h-4" /> {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {tab === "overview" && <MarketingOverview onTabChange={setTab} />}
        {tab === "compliance" && <GoogleCompliancePanel />}
        {tab === "tools" && <MarketingToolsCatalog />}
        {tab === "social" && <SocialContentPanel />}
        {tab === "agent" && <MarketingAgentPanel />}
        {tab === "ads" && <GoogleAdsPanel />}
      </div>
    </div>
  );
}

function GoogleAdsPanel() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
          <Target className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Google Ads</h3>
          <p className="text-xs text-slate-500">Let people discover your business through Google Ads</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-0.5">
            {["G", "o", "o", "g", "l", "e"].map((l, i) => (
              <span key={i} className="text-2xl font-bold" style={{
                color: i === 0 ? "#4285f4" : i === 1 ? "#ea4335" : i === 2 ? "#fbbc05" : i === 3 ? "#4285f4" : i === 4 ? "#34a853" : "#ea4335"
              }}>{l}</span>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 mb-4">
          <div className="flex items-center gap-3">
            <Search className="w-4 h-4 text-slate-400" />
            <div className="flex-1">
              <div className="text-sm text-slate-700">create a website for my business</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center text-white font-bold text-xs">D</div>
            <span className="text-sm font-bold text-slate-900">Digital Dominance Factory</span>
          </div>
          <div className="text-xs text-emerald-600 mb-1">x1-auto-builder.base44.app</div>
          <p className="text-xs text-slate-600">AI Websites That Convert — Research your market and launch a lead-ready site, explore the platform today.</p>
        </div>

        <p className="text-sm text-slate-600 mb-4">
          Create campaigns that drive targeted traffic to your sites. The platform integrates with Google Ads to help you
          create, fund, and manage campaigns directly from the Marketing dashboard.
        </p>

        <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 mb-4">
          <h4 className="text-sm font-bold text-slate-900 mb-1">Campaign Types</h4>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {[
              { type: "Search Ads", desc: "Text ads on Google search results" },
              { type: "Display Ads", desc: "Visual ads across the Google Display Network" },
              { type: "Performance Max", desc: "AI-optimized campaigns across all Google channels" },
              { type: "Local Ads", desc: "Drive foot traffic with local search ads" },
            ].map((c) => (
              <div key={c.type} className="rounded-lg bg-white border border-slate-200 p-3">
                <div className="text-xs font-bold text-slate-900">{c.type}</div>
                <div className="text-[10px] text-slate-500">{c.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <button className="inline-flex items-center gap-2 rounded-full bg-[#00d4ff] px-5 py-2.5 text-sm font-bold text-[#0a0e14] hover:brightness-110 transition">
          <Target className="w-4 h-4" /> Create a Campaign
        </button>
        <p className="text-xs text-slate-400 mt-2">Connect your Google Ads account to launch live campaigns.</p>
      </div>
    </div>
  );
}