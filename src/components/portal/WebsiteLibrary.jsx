import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import MiniSitePreview from "@/components/shared/MiniSitePreview";
import { Globe, ExternalLink, Loader2, Sparkles, CheckCircle2, Search } from "lucide-react";
import BackButton from "@/components/shared/BackButton";

export default function WebsiteLibrary() {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState({});
  const [done, setDone] = useState({});
  const [error, setError] = useState({});
  const [query, setQuery] = useState("");

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { items } = await base44.entities.WebsiteProject.filter(
        {},
        { sort: "-created_date", limit: 50, fields: ["business_name", "industry", "location", "status", "deploy_url", "logo_url", "hero_image_url", "content"] }
      );
      setSites(items || []);
    } catch { setSites([]); }
    finally { setLoading(false); }
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

  const filtered = sites.filter((s) => {
    const q = query.toLowerCase();
    return !q || (s.business_name || "").toLowerCase().includes(q) || (s.industry || "").toLowerCase().includes(q);
  });

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-[#00d4ff]" /></div>;
  }

  return (
    <div className="p-6 lg:p-8">
      <BackButton />
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#00d4ff]/10 flex items-center justify-center">
            <Globe className="w-5 h-5 text-[#00d4ff]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Website Library</h1>
            <p className="text-sm text-slate-500">Every generated site with a live style preview. Universalize any site into a reusable template.</p>
          </div>
        </div>
        <div className="relative max-w-md mt-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-11 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00d4ff]/50 transition"
            placeholder="Search websites…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-24">
          <Globe className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <h3 className="font-black text-xl mb-2 text-slate-900">No websites yet</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Generate a site in the Website Generator and it will appear here, ready to be universalized into a reusable template.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <div key={s.id} className="rounded-2xl bg-[#0d1117] border border-white/8 overflow-hidden flex flex-col group hover:border-[#00d4ff]/30 transition-all duration-200">
              <MiniSitePreview
                heroImage={s.hero_image_url}
                logoUrl={s.logo_url}
                headline={s.content?.hero?.headline}
                subheadline={s.content?.hero?.subheadline}
                colorTokens={s.content?.colorTokens}
                ctaLabel={s.content?.hero?.primaryCta}
                className="rounded-none border-0 border-b border-white/8"
              />
              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-white truncate">{s.business_name || "Untitled"}</h3>
                    <p className="text-xs text-white/40 truncate">
                      {s.industry}{s.location ? " · " + s.location : ""}
                    </p>
                  </div>
                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/50 capitalize shrink-0">{s.status}</span>
                </div>
                {s.deploy_url && (
                  <a href={s.deploy_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-[#00d4ff] hover:underline mb-3">
                    <ExternalLink className="w-3 h-3" /> View live site
                  </a>
                )}
                <div className="mt-auto">
                  <button
                    onClick={() => universalize(s.id)}
                    disabled={!!busy[s.id]}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#00d4ff] px-4 py-2.5 text-sm font-bold text-[#0a0e14] hover:brightness-110 hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] transition disabled:opacity-60"
                  >
                    {busy[s.id] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Universalize → Template
                  </button>
                  {done[s.id] && !error[s.id] && (
                    <p className="mt-2 text-xs text-[#00d4ff] inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Saved to Site Templates
                    </p>
                  )}
                  {error[s.id] && <p className="mt-2 text-xs text-red-400">{error[s.id]}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}