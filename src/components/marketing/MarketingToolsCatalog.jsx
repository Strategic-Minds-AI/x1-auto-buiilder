import { useState, useMemo } from "react";
import { MARKETING_TOOLS, MARKETING_TOOL_CATEGORIES } from "@/lib/marketingTools";
import { Search, Sparkles, Zap, Bot, CheckCircle, Loader2 } from "lucide-react";

const CAT_ICONS = {};
MARKETING_TOOL_CATEGORIES.forEach((c) => { CAT_ICONS[c.key] = c; });

export default function MarketingToolsCatalog() {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("all");
  const [seeding, setSeeding] = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return MARKETING_TOOLS.filter((t) => {
      const matchCat = activeCat === "all" || t.category === activeCat;
      const matchQuery = !q || t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q) || t.caps.some((c) => c.toLowerCase().includes(q));
      return matchCat && matchQuery;
    });
  }, [query, activeCat]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Marketing, SEO, GEO & AEO Tools</h3>
          <p className="text-xs text-slate-500">{MARKETING_TOOLS.length} tools across {MARKETING_TOOL_CATEGORIES.length} categories</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-11 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00d4ff]/50" placeholder="Search marketing tools..." value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setActiveCat("all")}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${activeCat === "all" ? "bg-[#00d4ff] text-[#0a0e14]" : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"}`}>
          All ({MARKETING_TOOLS.length})
        </button>
        {MARKETING_TOOL_CATEGORIES.map((cat) => {
          const count = MARKETING_TOOLS.filter((t) => t.category === cat.key).length;
          return (
            <button key={cat.key} onClick={() => setActiveCat(cat.key)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${activeCat === cat.key ? "bg-[#00d4ff] text-[#0a0e14]" : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"}`}>
              <span className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Category description */}
      {activeCat !== "all" && CAT_ICONS[activeCat] && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs text-slate-600">{CAT_ICONS[activeCat].desc}</p>
        </div>
      )}

      {/* Tools grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((tool, i) => {
          const cat = MARKETING_TOOL_CATEGORIES.find((c) => c.key === tool.category);
          return (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300 transition">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: (cat?.color || "#00d4ff") + "20" }}>
                    {tool.type === "ai_powered" ? <Sparkles className="w-4 h-4" style={{ color: cat?.color }} /> : <Zap className="w-4 h-4" style={{ color: cat?.color }} />}
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full" style={{ background: (cat?.color || "#00d4ff") + "20", color: cat?.color }}>{cat?.label}</span>
                </div>
                {tool.type === "ai_powered" && <span className="text-[9px] font-bold text-[#00d4ff] bg-[#00d4ff]/10 px-2 py-0.5 rounded-full">AI</span>}
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">{tool.name}</h4>
              <p className="text-xs text-slate-500 mb-2 line-clamp-2">{tool.desc}</p>
              <div className="flex flex-wrap gap-1 mb-2">
                {tool.caps.slice(0, 3).map((cap, j) => (
                  <span key={j} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">{cap}</span>
                ))}
                {tool.caps.length > 3 && <span className="text-[10px] text-slate-400">+{tool.caps.length - 3} more</span>}
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>Platform: <span className="font-semibold text-slate-600">{tool.platform}</span></span>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <p className="text-sm text-slate-400">No tools match your search.</p>
        </div>
      )}
    </div>
  );
}