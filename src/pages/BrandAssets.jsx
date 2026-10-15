import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/shared/PageHeader";
import { Image } from "@/components/ui/image";
import { Loader2 } from "lucide-react";

export default function BrandAssets() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const page = await base44.entities.WebsiteProject.filter({}, { sort: "-created_date", limit: 50, fields: ["business_name", "industry", "logo_url", "hero_image_url", "content"] });
        setProjects(page.items || []);
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  const filtered = filter ? projects.filter((p) => (p.industry || "").toLowerCase().includes(filter.toLowerCase())) : projects;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageHeader title="Brand Assets" subtitle="Logos, color palettes, and marketing imagery from your campaigns" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <input className="dd-input max-w-sm" placeholder="Filter by industry…" value={filter} onChange={(e) => setFilter(e.target.value)} />
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">No brand assets yet. Generate a website to create assets.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p) => {
              const tokens = p.content?.colorTokens || {};
              return (
                <div key={p.id} className="rounded-xl border border-border bg-card overflow-hidden">
                  <div className="aspect-video bg-background/60 relative">
                    {p.hero_image_url ? <Image src={p.hero_image_url} fittingType="fill" className="w-full h-full" /> : <div className="flex items-center justify-center h-full text-xs text-muted-foreground">No hero image</div>}
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      {p.logo_url ? <Image src={p.logo_url} fittingType="fill" className="h-12 w-12 rounded-lg" /> : <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground">No logo</div>}
                      <div className="min-w-0">
                        <div className="text-sm font-bold truncate">{p.business_name || "Untitled"}</div>
                        <div className="text-xs text-muted-foreground">{p.industry}</div>
                      </div>
                    </div>
                    {(tokens.primary || tokens.accent || tokens.background) && (
                      <div className="flex gap-1.5">
                        {["primary", "accent", "background"].map((k) => tokens[k] && (
                          <div key={k} className="flex-1">
                            <div className="h-8 rounded-md border border-border" style={{ background: tokens[k] }} />
                            <div className="text-[10px] text-muted-foreground mt-1 text-center truncate">{tokens[k]}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}