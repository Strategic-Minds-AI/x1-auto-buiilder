import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/shared/PageHeader";
import { Loader2, Search, Globe, Palette, CheckCircle, Rocket, Clock } from "lucide-react";

const STEPS = [
  { key: "draft", label: "Research", icon: Search },
  { key: "researching", label: "Analyzing", icon: Globe },
  { key: "generated", label: "Generated", icon: Palette },
  { key: "preview_ready", label: "Preview", icon: Clock },
  { key: "approved", label: "Approved", icon: CheckCircle },
];

export default function ProjectTimeline() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const page = await base44.entities.WebsiteProject.filter({}, { sort: "-created_date", limit: 50, fields: ["business_name", "industry", "status", "deploy_url"] });
        setProjects(page.items || []);
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  const stepIndex = (status) => {
    const i = STEPS.findIndex((s) => s.key === status);
    return i === -1 ? 0 : i;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageHeader title="Project Timeline" subtitle="Track every project from research to deployment" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">No projects yet.</div>
        ) : (
          projects.map((p) => {
            const current = stepIndex(p.status);
            const deployed = !!p.deploy_url;
            return (
              <div key={p.id} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm font-bold">{p.business_name || "Untitled"}</div>
                    <div className="text-xs text-muted-foreground">{p.industry}</div>
                  </div>
                  {deployed && <a href={p.deploy_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"><Rocket className="h-3.5 w-3.5" /> Live</a>}
                </div>
                <div className="flex items-center">
                  {STEPS.map((s, i) => {
                    const done = i <= current;
                    const Icon = s.icon;
                    return (
                      <div key={s.key} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center gap-1.5">
                          <div className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition ${done ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground"}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className={`text-[10px] ${done ? "text-foreground font-semibold" : "text-muted-foreground"}`}>{s.label}</span>
                        </div>
                        {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-1 ${i < current ? "bg-primary" : "bg-border"}`} />}
                      </div>
                    );
                  })}
                  {deployed && (
                    <>
                      <div className="flex-1 h-0.5 mx-1 bg-primary" />
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-primary bg-primary text-primary-foreground"><Rocket className="h-4 w-4" /></div>
                        <span className="text-[10px] text-foreground font-semibold">Deployed</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}