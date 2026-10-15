import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import BackButton from "@/components/shared/BackButton";
import RecordBrowser from "@/components/entity/RecordBrowser";
import { ENTITY_CATALOG, ENTITY_CATEGORIES } from "@/lib/entityCatalog";
import { Database, Search, Loader2, Boxes } from "lucide-react";

const ICON_MAP = {
  Building2: "Building2", Globe: "Globe", Rocket: "Rocket", Hammer: "Hammer",
  Bot: "Bot", ListTodo: "ListTodo", SlidersHorizontal: "SlidersHorizontal", Wrench: "Wrench",
  Zap: "Zap", FileCode: "FileCode", Radio: "Radio", Package: "Package",
  LayoutTemplate: "LayoutTemplate", LayoutGrid: "LayoutGrid", Briefcase: "Briefcase",
  Boxes: "Boxes", MessageSquare: "MessageSquare", Filter: "Filter", Workflow: "Workflow",
  Palette: "Palette", Type: "Type", Image: "Image", Video: "Video",
  Sparkles: "Sparkles", Share2: "Share2", Megaphone: "Megaphone", CreditCard: "CreditCard",
  Loader: "Loader", CheckCircle: "CheckCircle", ShieldCheck: "ShieldCheck", RefreshCw: "RefreshCw",
  Shield: "Shield", Activity: "Activity", Server: "Server", BarChart3: "BarChart3",
  Brain: "Brain", AlertTriangle: "AlertTriangle", Scan: "Scan", DollarSign: "DollarSign",
  Search: "Search", Plug: "Plug", Key: "Key", Users: "Users",
};

export default function EntityLibrary() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [counts, setCounts] = useState({});
  const [loadingCounts, setLoadingCounts] = useState(true);
  const [selected, setSelected] = useState(null);

  const filtered = ENTITY_CATALOG.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "All" || e.category === category;
    return matchSearch && matchCategory;
  });

  useEffect(() => {
    const fetchCounts = async () => {
      setLoadingCounts(true);
      const results = await Promise.allSettled(
        ENTITY_CATALOG.map((e) => base44.entities[e.name].count({}))
      );
      const newCounts = {};
      ENTITY_CATALOG.forEach((e, i) => {
        newCounts[e.name] = results[i].status === "fulfilled" ? results[i].value : null;
      });
      setCounts(newCounts);
      setLoadingCounts(false);
    };
    fetchCounts();
  }, []);

  const totalRecords = Object.values(counts).reduce((sum, c) => sum + (c || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <BackButton fallback="/portal" label="Back to Portal" />
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Entity Library</h1>
              <p className="text-sm text-slate-500">Browse and manage all {ENTITY_CATALOG.length} data entities across the platform</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1"><Boxes className="w-3.5 h-3.5 text-blue-500" /> Total Entities</div>
            <div className="text-2xl font-bold text-slate-800">{ENTITY_CATALOG.length}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1"><Database className="w-3.5 h-3.5 text-cyan-500" /> Total Records</div>
            <div className="text-2xl font-bold text-slate-800">{loadingCounts ? "..." : totalRecords.toLocaleString()}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1"><Boxes className="w-3.5 h-3.5 text-purple-500" /> Categories</div>
            <div className="text-2xl font-bold text-slate-800">{ENTITY_CATEGORIES.length - 1}</div>
          </div>
        </div>

        {/* Search + Categories */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search entities..."
              className="w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/30" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {ENTITY_CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${category === cat ? "bg-[#00d4ff] text-[#0a0e14]" : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Entity grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((entity) => {
            const count = counts[entity.name];
            return (
              <button key={entity.name} onClick={() => setSelected(entity)}
                className="text-left rounded-xl border border-slate-200 bg-white p-4 hover:border-[#00d4ff]/40 hover:shadow-sm transition group">
                <div className="flex items-start justify-between mb-2">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 group-hover:bg-[#00d4ff]/10 flex items-center justify-center shrink-0 transition">
                    <span className="text-sm font-bold text-slate-500 group-hover:text-[#00d4ff] transition">{entity.name.charAt(0)}</span>
                  </div>
                  <div className="text-right">
                    {loadingCounts ? (
                      <Loader2 className="w-3.5 h-3.5 text-slate-300 animate-spin" />
                    ) : count !== null && count !== undefined ? (
                      <div className="text-lg font-bold text-slate-700">{count.toLocaleString()}</div>
                    ) : (
                      <div className="text-xs text-slate-300">N/A</div>
                    )}
                    <div className="text-[10px] text-slate-400">records</div>
                  </div>
                </div>
                <h3 className="text-sm font-bold text-slate-800 mb-0.5 group-hover:text-[#00d4ff] transition">{entity.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-2">{entity.description}</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{entity.category}</span>
                </div>
              </button>
            );
          })}
        </div>
        {filtered.length === 0 && <p className="text-center text-sm text-slate-400 py-12">No entities match your search.</p>}
      </div>

      {/* Record browser modal */}
      {selected && <RecordBrowser entity={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}