import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/shared/PageHeader";
import { Image } from "@/components/ui/image";
import { Loader2, Palette, Image as ImageIcon, Shapes, Search } from "lucide-react";

const TABS = [
  { key: "logos", label: "Logos", icon: Shapes },
  { key: "palettes", label: "Color Palettes", icon: Palette },
  { key: "imagery", label: "Marketing Imagery", icon: ImageIcon },
];

export default function BrandAssets() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("logos");
  const [filter, setFilter] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const page = await base44.entities.WebsiteProject.filter(
          {},
          { sort: "-created_date", limit: 100, fields: ["business_name", "industry", "logo_url", "hero_image_url", "content"] }
        );
        setProjects(page.items || []);
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  const filtered = filter
    ? projects.filter((p) => (p.industry || "").toLowerCase().includes(filter.toLowerCase()) || (p.business_name || "").toLowerCase().includes(filter.toLowerCase()))
    : projects;

  const logos = filtered.filter((p) => p.logo_url);
  const palettes = filtered.filter((p) => p.content?.colorTokens && (p.content.colorTokens.primary || p.content.colorTokens.accent || p.content.colorTokens.background));
  const imagery = filtered.filter((p) => p.hero_image_url);

  const counts = { logos: logos.length, palettes: palettes.length, imagery: imagery.length };
  const shown = tab === "logos" ? logos : tab === "palettes" ? palettes : imagery;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageHeader title="Brand Assets" subtitle="Logos, color palettes, and marketing imagery from your campaigns" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Category tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition ${
                  tab === t.key ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" /> {t.label}
                <span className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${tab === t.key ? "bg-primary-foreground/20" : "bg-secondary"}`}>
                  {counts[t.key]}
                </span>
              </button>
            );
          })}
          <div className="relative ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input className="dd-input pl-10 w-56" placeholder="Filter by name or industry…" value={filter} onChange={(e) => setFilter(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : shown.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            No {tab === "logos" ? "logos" : tab === "palettes" ? "color palettes" : "marketing imagery"} yet. Generate a website to create assets.
          </div>
        ) : tab === "logos" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {shown.map((p) => (
              <div key={p.id} className="rounded-2xl border border-border bg-card overflow-hidden group">
                <div className="aspect-square bg-white flex items-center justify-center p-6">
                  <Image src={p.logo_url} fittingType="fit" className="max-w-full max-h-full object-contain" />
                </div>
                <div className="p-3 border-t border-border">
                  <div className="text-sm font-bold truncate">{p.business_name || "Untitled"}</div>
                  <div className="text-xs text-muted-foreground truncate">{p.industry}</div>
                </div>
              </div>
            ))}
          </div>
        ) : tab === "palettes" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shown.map((p) => {
              const tokens = p.content.colorTokens || {};
              const swatches = ["primary", "accent", "background", "secondary"].filter((k) => tokens[k]);
              return (
                <div key={p.id} className="rounded-2xl border border-border bg-card overflow-hidden">
                  <div className="flex h-28">
                    {swatches.map((k) => (
                      <div key={k} className="flex-1 relative group/sw" style={{ background: tokens[k] }}>
                        <span className="absolute bottom-1 left-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-white opacity-0 group-hover/sw:opacity-100 transition">
                          {tokens[k]}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="p-4">
                    <div className="text-sm font-bold truncate">{p.business_name || "Untitled"}</div>
                    <div className="text-xs text-muted-foreground truncate mb-2">{p.industry}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {swatches.map((k) => (
                        <span key={k} className="text-[10px] font-mono text-muted-foreground bg-secondary rounded px-1.5 py-0.5">{tokens[k]}</span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shown.map((p) => (
              <div key={p.id} className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="aspect-video bg-background/60 relative">
                  <Image src={p.hero_image_url} fittingType="fill" className="w-full h-full" />
                </div>
                <div className="p-4 flex items-center gap-3">
                  {p.logo_url && <Image src={p.logo_url} fittingType="fit" className="h-8 w-8 rounded-lg shrink-0" />}
                  <div className="min-w-0">
                    <div className="text-sm font-bold truncate">{p.business_name || "Untitled"}</div>
                    <div className="text-xs text-muted-foreground truncate">{p.industry}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}