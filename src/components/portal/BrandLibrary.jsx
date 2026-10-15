import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Sparkles, Search } from "lucide-react";

export default function BrandLibrary() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { items } = await base44.entities.WebsiteProject.filter(
        { content: { $exists: true } },
        { sort: "-created_date", limit: 100, fields: ["business_name", "industry", "logo_url", "hero_image_url", "content"] }
      );
      setProjects(items || []);
    } catch { setProjects([]); }
    finally { setLoading(false); }
  };

  const filtered = projects.filter((p) => {
    const q = query.toLowerCase();
    return !q || (p.business_name || "").toLowerCase().includes(q) || (p.industry || "").toLowerCase().includes(q);
  });

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-[#00d4ff]" /></div>;
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#00d4ff]/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#00d4ff]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Brand Library</h1>
            <p className="text-sm text-white/40">Complete brand systems — logos, colors, imagery, and voice</p>
          </div>
        </div>
        <div className="relative max-w-md mt-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            className="w-full rounded-xl bg-[#0d1117] border border-white/10 pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#00d4ff]/50 transition"
            placeholder="Search brands…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-24">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-white/20" />
          <p className="text-white/40 text-sm">No brand systems yet. Generate a website to create a brand.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p) => {
            const tokens = p.content?.colorTokens || {};
            return (
              <div key={p.id} className="rounded-2xl bg-[#0d1117] border border-white/8 overflow-hidden group hover:border-[#00d4ff]/30 transition-all duration-200">
                {/* Hero image */}
                <div className="aspect-[16/9] overflow-hidden bg-white/5">
                  {p.hero_image_url ? (
                    <img src={p.hero_image_url} alt={p.business_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-white/20" />
                    </div>
                  )}
                </div>
                {/* Brand info */}
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    {p.logo_url && <img src={p.logo_url} alt="" className="w-10 h-10 object-contain rounded-lg bg-white/5 p-1" />}
                    <div className="min-w-0">
                      <div className="text-[14px] font-bold text-white truncate">{p.business_name || "Untitled"}</div>
                      <div className="text-[11px] text-white/40 truncate">{p.industry}</div>
                    </div>
                  </div>
                  {/* Color tokens */}
                  <div className="flex gap-1.5">
                    {["primary", "secondary", "accent", "background", "text"].map((k) => tokens[k] && (
                      <div key={k} className="flex-1 group/swatch">
                        <div className="h-8 rounded-md border border-white/10" style={{ background: tokens[k] }} />
                        <div className="text-[8px] font-mono text-white/30 text-center mt-0.5 truncate">{tokens[k]}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}