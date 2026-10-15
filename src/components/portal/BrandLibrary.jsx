import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import BackButton from "@/components/shared/BackButton";
import { Loader2, Sparkles, Search, Wand2, CheckCircle2 } from "lucide-react";

export default function BrandLibrary({ onSelect, selectedId: extSelectedId }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [generating, setGenerating] = useState(false);
  const [genStatus, setGenStatus] = useState("");
  const [selectedId, setSelectedId] = useState(extSelectedId || null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { items } = await base44.entities.WebsiteProject.filter(
        { content: { $exists: true } },
        { sort: "-created_date", limit: 500, fields: ["business_name", "industry", "logo_url", "hero_image_url", "content"] }
      );
      setProjects(items || []);
    } catch { setProjects([]); }
    finally { setLoading(false); }
  };

  const generate = async () => {
    setGenerating(true);
    setGenStatus("Generating 300 brand profiles...");
    try {
      await base44.functions.invoke("populateLibraries", { count: 300 });
      setGenStatus("Generating brand images (batch 1)...");
      for (let i = 0; i < 15; i++) {
        setGenStatus(`Generating brand images (batch ${i + 1}/15)...`);
        await base44.functions.invoke("generateAssetBatch", { batchSize: 20 });
      }
      setGenStatus("Complete!");
      await load();
    } catch (e) {
      alert("Generation failed: " + (e.message || "unknown"));
    } finally {
      setGenerating(false);
      setGenStatus("");
    }
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
      <BackButton />
      <div className="mb-6">
        <div className="flex items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00d4ff]/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#00d4ff]" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">Brand Library</h1>
              <p className="text-sm text-slate-500">{projects.length} complete brand systems — logos, colors, imagery, and voice</p>
            </div>
          </div>
          <button
            onClick={generate}
            disabled={generating}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#00d4ff] to-[#0066ff] px-5 py-2.5 text-sm font-bold text-[#0a0e14] hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] transition disabled:opacity-50"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            {generating ? genStatus : "Generate 300 Brands"}
          </button>
        </div>
        <div className="relative max-w-md mt-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-11 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00d4ff]/50 transition"
            placeholder="Search brands…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-24">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <p className="text-slate-500 text-sm mb-2">No brand systems yet.</p>
          <p className="text-slate-400 text-xs">Click "Generate 300 Brands" to populate this library.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p) => {
            const tokens = p.content?.colorTokens || {};
            return (
              <div key={p.id} className={`rounded-2xl bg-[#0d1117] border-2 overflow-hidden group transition-all duration-200 ${selectedId === p.id ? "border-[#00d4ff] shadow-[0_0_20px_rgba(0,212,255,0.2)]" : "border-white/8 hover:border-[#00d4ff]/30"}`}>
                <div className="aspect-[16/9] overflow-hidden bg-white/5">
                  {p.hero_image_url ? (
                    <img src={p.hero_image_url} alt={p.business_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-white/20" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    {p.logo_url && <img src={p.logo_url} alt="" className="w-10 h-10 object-contain rounded-lg bg-white/5 p-1" />}
                    <div className="min-w-0">
                      <div className="text-[14px] font-bold text-white truncate">{p.business_name || "Untitled"}</div>
                      <div className="text-[11px] text-white/40 truncate">{p.industry}</div>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    {["primary", "secondary", "accent", "background", "text"].map((k) => tokens[k] && (
                      <div key={k} className="flex-1 group/swatch">
                        <div className="h-8 rounded-md border border-white/10" style={{ background: tokens[k] }} />
                        <div className="text-[8px] font-mono text-white/30 text-center mt-0.5 truncate">{tokens[k]}</div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedId(selectedId === p.id ? null : p.id);
                      if (onSelect) onSelect({ type: "brand", content: p.content, logoUrl: p.logo_url, heroUrl: p.hero_image_url, name: p.business_name, id: p.id });
                    }}
                    className={`mt-3 w-full rounded-lg px-3 py-2 text-xs font-bold transition ${
                      selectedId === p.id
                        ? "bg-[#00d4ff] text-[#0a0e14]"
                        : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {selectedId === p.id ? "✓ Selected" : "Select Brand"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}