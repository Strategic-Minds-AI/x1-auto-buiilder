import { Link } from "react-router-dom";
import { Bot, Palette, Cable, Rocket, BarChart3, Search, UserPlus, Sparkles, GitBranch, Package, Monitor, SlidersHorizontal, LayoutTemplate, Hammer, Video } from "lucide-react";

const MODULES = [
  { to: "/auto-builder", icon: Hammer, title: "Auto Builder", desc: "Guided step-by-step website creation journey" },
  { to: "/app-factory", icon: Package, title: "App Factory", desc: "Desktop & mobile application layout templates" },
  { to: "/video-studio", icon: Video, title: "Video Studio", desc: "AI-powered hero video and background loop generator" },
  { to: "/design-library", icon: LayoutTemplate, title: "Design Template Library", desc: "594 premium designs + app layout patterns" },
  { to: "/agent-orchestrator", icon: Bot, title: "Agent Orchestrator", desc: "Monitor autonomous agents and assign tasks" },
  { to: "/brand-assets", icon: Palette, title: "Brand Assets", desc: "Logos, color palettes, and marketing imagery" },
  { to: "/logo-workshop", icon: Sparkles, title: "Logo Workshop", desc: "Generate and select professional logos" },
  { to: "/gpt-sync-logs", icon: Cable, title: "GPT Sync Dashboard", desc: "Monitor AI validation and send generator commands" },
  { to: "/mass-launch-console", icon: Rocket, title: "Mass Launch Console", desc: "Batch deployments of website variants" },
  { to: "/analytics", icon: BarChart3, title: "Analytics Dashboard", desc: "Traffic, performance, and SEO health" },
  { to: "/research-hub", icon: Search, title: "Research Hub", desc: "Business research and competitor benchmarks" },
  { to: "/business-onboarding", icon: UserPlus, title: "Business Onboarding", desc: "Start the generation process" },
  { to: "/project-timeline", icon: GitBranch, title: "Project Timeline", desc: "Track projects from research to deployment" },
  { to: "/asset-repository", icon: Package, title: "Asset Repository", desc: "Centralized library of all assets" },
  { to: "/campaign-monitor", icon: Monitor, title: "Campaign Monitor", desc: "Monitor bulk launch campaigns" },
  { to: "/style-guide-editor", icon: SlidersHorizontal, title: "Style Guide Editor", desc: "Define universal brand styles" },
];

export default function ModulesGrid() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900">Modules</h1>
        <p className="text-sm text-slate-500 mt-0.5">All tools and workspaces in the Digital Dominance Factory</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MODULES.map((m) => {
          const Icon = m.icon;
          return (
            <Link key={m.to} to={m.to} className="group rounded-2xl bg-white border border-slate-200 p-5 hover:border-[#00d4ff]/30 hover:shadow-[0_0_20px_rgba(0,212,255,0.05)] transition-all duration-200">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500 group-hover:bg-[#00d4ff] group-hover:text-[#0a0e14] transition-all duration-200 shrink-0">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-900 group-hover:text-[#00d4ff] transition">{m.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{m.desc}</div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}