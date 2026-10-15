import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { LayoutTemplate, Loader2, Sparkles, Search } from "lucide-react";
import MiniSitePreview from "@/components/shared/MiniSitePreview";
import TemplateInstantiator from "@/components/portal/TemplateInstantiator";

export default function SiteTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { items } = await base44.entities.SiteTemplate.filter({}, { sort: "-created_date", limit: 50 });
      setTemplates(items || []);
    } catch { setTemplates([]); }
    finally { setLoading(false); }
  };

  const filtered = templates.filter((t) => {
    const q = query.toLowerCase();
    return !q || (t.name || "").toLowerCase().includes(q) || (t.industry || "").toLowerCase().includes(q);
  });

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-[#00d4ff]" /></div>;
  }

  if (selected) {
    return <TemplateInstantiator template={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#00d4ff]/10 flex items-center justify-center">
            <LayoutTemplate className="w-5 h-5 text-[#00d4ff]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Site Templates</h1>
            <p className="text-sm text-white/40">Universalized, reusable templates — preview the style, then instantiate with your business details.</p>
          </div>
        </div>
        <div className="relative max-w-md mt-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            className="w-full rounded-xl bg-[#0d1117] border border-white/10 pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#00d4ff]/50 transition"
            placeholder="Search templates…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-24">
          <LayoutTemplate className="w-12 h-12 mx-auto mb-4 text-white/20" />
          <h3 className="font-black text-xl mb-2 text-white">No site templates yet</h3>
          <p className="text-white/40 text-sm max-w-md mx-auto">
            Universalize a website from your Website Library to create a reusable template here.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <div key={t.id} className="rounded-2xl bg-[#0d1117] border border-white/8 overflow-hidden flex flex-col group hover:border-[#00d4ff]/30 transition-all duration-200">
              <MiniSitePreview
                headline={t.template?.hero?.headline}
                subheadline={t.template?.hero?.subheadline}
                colorTokens={t.template?.colorTokens}
                ctaLabel={t.template?.hero?.primaryCta}
                className="rounded-none border-0 border-b border-white/8"
              />
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-white truncate">{t.name || "Untitled Template"}</h3>
                <p className="text-xs text-white/40 mb-2">
                  {t.industry} · {t.variables?.length || 0} variables
                </p>
                {t.template?.services?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {t.template.services.slice(0, 4).map((s, i) => (
                      <span key={i} className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/50 truncate max-w-[100px]">
                        {s.title}
                      </span>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => setSelected(t)}
                  className="mt-auto w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#00d4ff] px-5 py-2.5 text-sm font-bold text-[#0a0e14] hover:brightness-110 hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] transition"
                >
                  <Sparkles className="w-4 h-4" /> Use this template
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}