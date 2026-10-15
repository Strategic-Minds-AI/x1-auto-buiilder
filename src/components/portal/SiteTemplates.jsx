import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { LayoutTemplate, Loader2, ChevronDown, ChevronUp } from "lucide-react";

export default function SiteTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState({});

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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h2 className="font-display font-bold text-2xl mb-1">Site Templates</h2>
        <p className="text-muted-foreground text-sm">
          Universalized, reusable templates generated from your best websites.
        </p>
      </div>
      <div className="space-y-4">
        {templates.map((t) => (
          <div key={t.id} className="rounded-2xl border border-border bg-card/60 p-5">
            <button
              onClick={() => setOpen((o) => ({ ...o, [t.id]: !o[t.id] }))}
              className="w-full flex items-center justify-between gap-3 text-left"
            >
              <div className="min-w-0">
                <h3 className="font-semibold truncate">{t.name || "Untitled Template"}</h3>
                <p className="text-xs text-muted-foreground">
                  {t.industry} · {t.variables?.length || 0} variables
                </p>
              </div>
              {open[t.id] ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
              )}
            </button>
            {open[t.id] && (
              <div className="mt-4 pt-4 border-t border-border space-y-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Variables</p>
                  <div className="flex flex-wrap gap-2">
                    {(t.variables || []).map((v, i) => (
                      <span key={i} className="rounded-full bg-secondary px-2.5 py-1 text-xs font-mono">
                        {v.key}
                      </span>
                    ))}
                  </div>
                </div>
                {t.template?.hero && (
                  <div className="rounded-xl bg-background/60 p-4 border border-border">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Hero</p>
                    <p className="font-semibold">{t.template.hero.headline}</p>
                    <p className="text-sm text-muted-foreground mt-1">{t.template.hero.subheadline}</p>
                  </div>
                )}
                {t.template?.services?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Services ({t.template.services.length})
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {t.template.services.map((s, i) => (
                        <li key={i}>• {s.title}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}