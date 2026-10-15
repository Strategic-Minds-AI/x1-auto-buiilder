import { Link } from "react-router-dom";
import {
  Hammer, Globe, Wand2, Copy, Smartphone, Palette, Video,
  CreditCard, Zap, Loader2, CheckCircle, AlertCircle, Clock,
} from "lucide-react";

const GENERATORS = [
  { to: "/portal", icon: Globe, label: "Website Generator", desc: "AI website generation pipeline", color: "#00d4ff" },
  { to: "/universal-studio", icon: Wand2, label: "Universal Generation Studio", desc: "Generate anything — reports, proposals, systems", color: "#8b5cf6" },
  { to: "/clone-generator", icon: Copy, label: "Clone Generator", desc: "Clone, reverse-engineer, rebrand any URL", color: "#3b82f6" },
  { to: "/auto-builder", icon: Hammer, label: "Auto Builder", desc: "12-step guided build & launch workflow", color: "#f59e0b" },
  { to: "/design-library", icon: Palette, label: "Premium Design Library", desc: "100+ structurally different templates", color: "#ec4899" },
  { to: "/card-flyer-studio", icon: CreditCard, label: "Card & Flyer Studio", desc: "Business cards and flyers", color: "#14b8a6" },
  { to: "/mass-launch-console", icon: Zap, label: "Mass Launch Console", desc: "Multi-location site campaigns", color: "#f97316" },
  { to: "/app-factory", icon: Smartphone, label: "App Factory", desc: "Mobile app template generation", color: "#6366f1" },
];

export default function BuildFactoryPanel({ data }) {
  const activeJobs = data?.activeJobs || [];

  const jobStatusMeta = {
    queued: { icon: Clock, color: "#f59e0b" },
    in_progress: { icon: Loader2, color: "#3b82f6", spin: true },
    complete: { icon: CheckCircle, color: "#10b981" },
    failed: { icon: AlertCircle, color: "#ef4444" },
  };

  return (
    <div>
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-1">
          <Hammer className="w-5 h-5 text-[#00d4ff]" />
          <h2 className="text-xl font-bold">Build Factory</h2>
        </div>
        <p className="text-sm text-slate-500">Website, app, SaaS, funnel, and platform generation pipeline</p>
      </div>

      {/* Active Jobs */}
      {activeJobs.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Active Generation Jobs ({activeJobs.length})</p>
          <div className="space-y-2">
            {activeJobs.map((job) => {
              const meta = jobStatusMeta[job.status] || jobStatusMeta.queued;
              const Icon = meta.icon;
              return (
                <div key={job.id} className="rounded-xl bg-white border border-slate-200 p-3 flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${meta.spin ? "animate-spin" : ""}`} style={{ color: meta.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700">{job.job_type?.replace(/_/g, " ")}</p>
                    {job.project_id && <p className="text-[10px] text-slate-400">Project: {job.project_id.substring(0, 8)}...</p>}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: `${meta.color}20`, color: meta.color }}>
                    {job.status.toUpperCase()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Generators */}
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Generation Tools</p>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {GENERATORS.map((g) => {
          const Icon = g.icon;
          return (
            <Link
              key={g.to}
              to={g.to}
              className="group rounded-2xl bg-white border border-slate-200 p-4 hover:bg-slate-50 hover:border-[#00d4ff]/40 transition"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${g.color}20` }}>
                <Icon className="w-5 h-5" style={{ color: g.color }} />
              </div>
              <p className="text-sm font-bold text-slate-800 mb-0.5">{g.label}</p>
              <p className="text-xs text-slate-500">{g.desc}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}