import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { LayoutTemplate, Loader2, Sparkles } from "lucide-react";
import MiniSitePreview from "@/components/shared/MiniSitePreview";
import TemplateInstantiator from "@/components/portal/TemplateInstantiator";

export default function SiteTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { items } = await base44.entities.SiteTemplate.filter({}, { sort: "-created_date", limit: 50 });
      setTemplates(items || []);
    } catch (e) {
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin inline mr-2" /> Loading templates…
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <LayoutTemplate className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
        <h3 className="font-display font-bold text-xl mb-2">No site templates yet</h3>
        <p className="text-muted-foreground">
          Universalize a website from your Website Library to create a reusable template here.
        </p>
      </div>
    );
  }

  if (selected) {
    return <TemplateInstantiator template={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h2 className="font-display font-bold text-2xl mb-1">Site Templates</h2>
        <p className="text-muted-foreground text-sm">
          Universalized, reusable templates — preview the style at a glance, then instantiate with your business details.
        </p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((t) => (
          <div key={t.id} className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col group hover:border-primary/40 transition">
            <MiniSitePreview
              headline={t.template?.hero?.headline}
              subheadline={t.template?.hero?.subheadline}
              colorTokens={t.template?.colorTokens}
              ctaLabel={t.template?.hero?.primaryCta}
              className="rounded-none border-0 border-b border-border"
            />
            <div className="p-4 flex flex-col flex-1">
              <h3 className="font-semibold truncate">{t.name || "Untitled Template"}</h3>
              <p className="text-xs text-muted-foreground mb-2">
                {t.industry} · {t.variables?.length || 0} variables
              </p>
              {t.template?.services?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {t.template.services.slice(0, 4).map((s, i) => (
                    <span key={i} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground truncate max-w-[100px]">
                      {s.title}
                    </span>
                  ))}
                </div>
              )}
              <button
                onClick={() => setSelected(t)}
                className="mt-auto w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:brightness-110 transition"
              >
                <Sparkles className="w-4 h-4" /> Use this template
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}