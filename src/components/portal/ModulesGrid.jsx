import { Link } from "react-router-dom";
import { Bot, Palette, Cable, Rocket, BarChart3, Search, UserPlus, Sparkles, GitBranch, Package, Monitor, SlidersHorizontal } from "lucide-react";

const MODULES = [
  { to: "/agent-orchestrator", icon: Bot, title: "Agent Orchestrator", desc: "Monitor autonomous agents and assign tasks" },
  { to: "/brand-assets", icon: Palette, title: "Brand Assets", desc: "Logos, color palettes, and marketing imagery" },
  { to: "/gpt-sync-logs", icon: Cable, title: "GPT Sync Dashboard", desc: "Monitor AI validation and send generator commands" },
  { to: "/mass-launch-console", icon: Rocket, title: "Mass Launch Console", desc: "Batch deployments of website variants" },
  { to: "/analytics", icon: BarChart3, title: "Analytics Dashboard", desc: "Traffic, performance, and SEO health" },
  { to: "/research-hub", icon: Search, title: "Research Hub", desc: "Business research and competitor benchmarks" },
  { to: "/business-onboarding", icon: UserPlus, title: "Business Onboarding", desc: "Start the generation process" },
  { to: "/logo-workshop", icon: Sparkles, title: "Logo Workshop", desc: "Generate and select professional logos" },
  { to: "/project-timeline", icon: GitBranch, title: "Project Timeline", desc: "Track projects from research to deployment" },
  { to: "/asset-repository", icon: Package, title: "Asset Repository", desc: "Centralized library of all assets" },
  { to: "/campaign-monitor", icon: Monitor, title: "Campaign Monitor", desc: "Monitor bulk launch campaigns" },
  { to: "/style-guide-editor", icon: SlidersHorizontal, title: "Style Guide Editor", desc: "Define universal brand styles" },
];

export default function ModulesGrid() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MODULES.map((m) => {
          const Icon = m.icon;
          return (
            <Link key={m.to} to={m.to} className="group rounded-2xl border border-border bg-card p-5 hover:border-primary/50 hover:bg-secondary transition">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition shrink-0">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-sm font-bold text-foreground">{m.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{m.desc}</div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}