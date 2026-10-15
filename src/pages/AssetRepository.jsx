import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/shared/PageHeader";
import { Image } from "@/components/ui/image";
import { Loader2 } from "lucide-react";

export default function AssetRepository() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("all");

  useEffect(() => {
    (async () => {
      try {
        const page = await base44.entities.WebsiteProject.filter({}, { sort: "-created_date", limit: 100, fields: ["business_name", "industry", "logo_url", "hero_image_url"] });
        setProjects(page.items || []);
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  const assets = [];
  projects.forEach((p) => {
    if (type !== "heroes" && p.logo_url) assets.push({ url: p.logo_url, label: `${p.business_name || "Untitled"} — Logo`, industry: p.industry, kind: "Logo" });
    if (type !== "logos" && p.hero_image_url) assets.push({ url: p.hero_image_url, label: `${p.business_name || "Untitled"} — Hero`, industry: p.industry, kind: "Hero" });
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageHeader title="Asset Repository" subtitle="Centralized library of all generated brand assets and marketing graphics" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex gap-2">
          {[{ k: "all", l: "All" }, { k: "logos", l: "Logos" }, { k: "heroes", l: "Hero Images" }].map((t) => (
            <button key={t.k} onClick={() => setType(t.k)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${type === t.k ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:text-foreground"}`}>{t.l}</button>
          ))}
        </div>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : assets.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">No assets in the repository yet.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {assets.map((a, i) => (
              <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="aspect-square bg-background/60"><Image src={a.url} fittingType="fit" className="w-full h-full" /></div>
                <div className="p-2.5">
                  <div className="text-xs font-semibold truncate">{a.label}</div>
                  <div className="text-[10px] text-muted-foreground">{a.industry} · {a.kind}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}