import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Palette, Search, Sparkles, Download } from "lucide-react";

export default function LogoLibrary() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { items } = await base44.entities.WebsiteProject.filter(
        { logo_url: { $exists: true } },
        { sort: "-created_date", limit: 100, fields: ["business_name", "industry", "logo_url", "accent_color"] }
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
            <Palette className="w-5 h-5 text-[#00d4ff]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Logo Library</h1>
            <p className="text-sm text-slate-500">Every generated logo, organized by industry</p>
          </div>
        </div>
        <div className="relative max-w-md mt-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-11 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00d4ff]/50 transition"
            placeholder="Search by business name or industry…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-24">
          <Palette className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <p className="text-slate-500 text-sm">No logos yet. Generate a website with assets to populate this library.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((p) => (
            <div key={p.id} className="rounded-2xl bg-[#0d1117] border border-white/8 overflow-hidden group hover:border-[#00d4ff]/30 transition-all duration-200">
              <div className="aspect-square flex items-center justify-center p-8 bg-gradient-to-br from-white/5 to-transparent">
                {p.logo_url ? (
                  <img src={p.logo_url} alt={p.business_name} className="max-w-full max-h-full object-contain" />
                ) : (
                  <Palette className="w-8 h-8 text-white/20" />
                )}
              </div>
              <div className="p-3 border-t border-white/8">
                <div className="text-[13px] font-bold text-white truncate">{p.business_name || "Untitled"}</div>
                <div className="text-[10px] text-white/40 truncate">{p.industry}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}