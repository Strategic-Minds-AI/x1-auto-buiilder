import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import MiniSitePreview from "@/components/shared/MiniSitePreview";
import { Globe, ExternalLink, Loader2, Sparkles, CheckCircle2 } from "lucide-react";

export default function WebsiteLibrary() {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState({});
  const [done, setDone] = useState({});
  const [error, setError] = useState({});

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { items } = await base44.entities.WebsiteProject.filter(
        {},
        { sort: "-created_date", limit: 50, fields: ["business_name", "industry", "location", "status", "deploy_url", "logo_url", "hero_image_url", "content"] }
      );
      setSites(items || []);
    } catch (e) {
      setSites([]);
    } finally {
      setLoading(false);
    }
  };

  const universalize = async (id) => {
    setBusy((b) => ({ ...b, [id]: true }));
    setError((e) => ({ ...e, [id]: null }));
    setDone((d) => ({ ...d, [id]: false }));
    try {
      const res = await base44.functions.invoke("universalizeTemplate", { projectId: id });
      setDone((d) => ({ ...d, [id]: res.data?.template?.id || "ok" }));
    } catch (err) {
      setError((e) => ({ ...e, [id]: err.response?.data?.error || err.message || "Failed" }));
    } finally {
      setBusy((b) => ({ ...b, [id]: false }));
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin inline mr-2" /> Loading your websites…
      </div>
    );
  }

  if (sites.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Globe className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
        <h3 className="font-display font-bold text-xl mb-2">No websites yet</h3>
        <p className="text-muted-foreground">
          Generate a site in the Website Generator and it will appear here, ready to be universalized into a reusable template.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h2 className="font-display font-bold text-2xl mb-1">Website Library</h2>
        <p className="text-muted-foreground text-sm">
          Every generated site, with a live style preview. Universalize any site into a reusable industry template.
        </p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {sites.map((s) => (
          <div key={s.id} className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col group hover:border-primary/40 transition">
            <MiniSitePreview
              heroImage={s.hero_image_url}
              logoUrl={s.logo_url}
              headline={s.content?.hero?.headline}
              subheadline={s.content?.hero?.subheadline}
              colorTokens={s.content?.colorTokens}
              ctaLabel={s.content?.hero?.primaryCta}
              className="rounded-none border-0 border-b border-border"
            />
            <div className="p-4 flex flex-col flex-1">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <h3 className="font-semibold truncate">{s.business_name || "Untitled"}</h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {s.industry}{s.location ? " · " + s.location : ""}
                  </p>
                </div>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] capitalize shrink-0">{s.status}</span>
              </div>
              {s.deploy_url && (
                <a href={s.deploy_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline mb-3">
                  <ExternalLink className="w-3 h-3" /> View live site
                </a>
              )}
              <div className="mt-auto">
                <button
                  onClick={() => universalize(s.id)}
                  disabled={!!busy[s.id]}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:brightness-110 transition disabled:opacity-60"
                >
                  {busy[s.id] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Universalize → Template
                </button>
                {done[s.id] && !error[s.id] && (
                  <p className="mt-2 text-xs text-primary inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Saved to Site Templates
                  </p>
                )}
                {error[s.id] && <p className="mt-2 text-xs text-destructive">{error[s.id]}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}