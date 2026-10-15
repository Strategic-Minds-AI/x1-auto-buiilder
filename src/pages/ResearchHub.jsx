import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/shared/PageHeader";
import { Loader2, ChevronDown, Building2, TrendingUp } from "lucide-react";

export default function ResearchHub() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const page = await base44.entities.WebsiteProject.filter({}, { sort: "-created_date", limit: 50, fields: ["business_name", "industry", "business_website", "business_research", "benchmark", "status"] });
        setProjects(page.items || []);
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageHeader title="Research Hub" subtitle="Skip-traced business research and competitor benchmarking" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-3">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">No research data yet. Start a project to see skip-traced business info and benchmarks.</div>
        ) : (
          projects.map((p) => (
            <div key={p.id} className="rounded-xl border border-border bg-card overflow-hidden">
              <button onClick={() => setExpanded(expanded === p.id ? null : p.id)} className="w-full flex items-center justify-between p-4 text-left">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0"><Building2 className="h-4 w-4 text-primary" /></span>
                  <div>
                    <div className="text-sm font-bold">{p.business_name || "Untitled"}</div>
                    <div className="text-xs text-muted-foreground">{p.industry} · {p.business_website}</div>
                  </div>
                </div>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition ${expanded === p.id ? "rotate-180" : ""}`} />
              </button>
              {expanded === p.id && (
                <div className="border-t border-border p-4 space-y-4">
                  {p.business_research && (
                    <div>
                      <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">Business Research</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        {Object.entries(p.business_research).map(([k, v]) => v && typeof v !== "object" && (
                          <div key={k}><span className="text-muted-foreground">{k}:</span> <span className="font-medium">{String(v)}</span></div>
                        ))}
                        {p.business_research.services && Array.isArray(p.business_research.services) && (
                          <div className="sm:col-span-2"><span className="text-muted-foreground">Services:</span> <span className="font-medium">{p.business_research.services.join(", ")}</span></div>
                        )}
                      </div>
                    </div>
                  )}
                  {p.benchmark && (
                    <div>
                      <div className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1.5"><TrendingUp className="h-3 w-3" /> Industry Benchmark</div>
                      {p.benchmark.designGuidance && <p className="text-sm text-muted-foreground">{p.benchmark.designGuidance}</p>}
                      {p.benchmark.topSites && Array.isArray(p.benchmark.topSites) && (
                        <div className="mt-2 space-y-1">{p.benchmark.topSites.map((s, i) => <div key={i} className="text-xs text-muted-foreground">• {s}</div>)}</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}