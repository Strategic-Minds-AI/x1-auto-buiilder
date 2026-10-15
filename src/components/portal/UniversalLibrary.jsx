import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Search, Sparkles, Wand2, Package, ChevronDown } from "lucide-react";
import BackButton from "@/components/shared/BackButton";

const LIBRARIES = [
  { key: "SaaSTemplate", label: "SaaS Templates", type: "saas", icon: "📊" },
  { key: "B2BTemplate", label: "B2B Templates", type: "b2b", icon: "🏢" },
  { key: "PlatformTemplate", label: "Platform Templates", type: "platform", icon: "🌐" },
  { key: "FunnelTemplate", label: "Funnel Templates", type: "funnel", icon: "🔻" },
  { key: "AIToolTemplate", label: "AI Tool Templates", type: "ai_tool", icon: "🤖" },
  { key: "WorkflowTemplate", label: "Workflow Templates", type: "workflow", icon: "⚙️" },
  { key: "FontSystem", label: "Font Systems", type: "font", icon: "🔤" },
  { key: "ChatUITemplate", label: "Chat UI Templates", type: "chat_ui", icon: "💬" },
  { key: "SocialCreativeKit", label: "Social Creative Kits", type: "social_kit", icon: "📱" },
];

export default function UniversalLibrary() {
  const [activeLib, setActiveLib] = useState("SaaSTemplate");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [generating, setGenerating] = useState(false);
  const [counts, setCounts] = useState({});

  useEffect(() => { loadCounts(); load(); }, [activeLib]);

  const loadCounts = async () => {
    const c = {};
    for (const lib of LIBRARIES) {
      try { c[lib.key] = await base44.entities[lib.key].count({}); }
      catch { c[lib.key] = 0; }
    }
    setCounts(c);
  };

  const load = async () => {
    setLoading(true);
    try {
      const { items: data } = await base44.entities[activeLib].filter({}, { sort: "-created_date", limit: 100 });
      setItems(data || []);
    } catch { setItems([]); }
    finally { setLoading(false); }
  };

  const generate = async () => {
    const lib = LIBRARIES.find(l => l.key === activeLib);
    if (!lib) return;
    setGenerating(true);
    try {
      await base44.functions.invoke("generateLibraryBatch", { libraryType: lib.type, count: 20 });
      await load();
      await loadCounts();
    } catch (e) { alert("Generation failed: " + (e.message || "unknown")); }
    finally { setGenerating(false); }
  };

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return items.filter(i => !q || (i.name || "").toLowerCase().includes(q) || (i.industry || "").toLowerCase().includes(q));
  }, [items, query]);

  const activeLibInfo = LIBRARIES.find(l => l.key === activeLib);

  return (
    <div className="p-6 lg:p-8">
      <BackButton />
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#00d4ff]/10 flex items-center justify-center">
          <Package className="w-5 h-5 text-[#00d4ff]" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Universal Library</h1>
          <p className="text-sm text-slate-500">SaaS, B2B, Platform, Funnel, AI Tools, Workflows, Fonts, Chat UI, Social Kits</p>
        </div>
      </div>

      {/* Library tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {LIBRARIES.map(lib => (
          <button
            key={lib.key}
            onClick={() => setActiveLib(lib.key)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-bold transition ${
              activeLib === lib.key
                ? "bg-[#00d4ff] text-[#0a0e14]"
                : "bg-slate-100 text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>{lib.icon}</span>
            {lib.label}
            <span className={`text-[10px] font-mono ${activeLib === lib.key ? "text-[#0a0e14]/60" : "text-slate-400"}`}>{counts[lib.key] || 0}</span>
          </button>
        ))}
      </div>

      {/* Search + Generate */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-11 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00d4ff]/50 transition"
            placeholder={`Search ${activeLibInfo?.label}…`}
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <button
          onClick={generate}
          disabled={generating}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#00d4ff] to-[#0066ff] px-5 py-2.5 text-sm font-bold text-[#0a0e14] hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] transition disabled:opacity-50"
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
          Generate 20 {activeLibInfo?.label}
        </button>
      </div>

      <div className="text-sm text-slate-500 mb-4">{filtered.length} templates</div>

      {loading ? (
        <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-[#00d4ff]" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24">
          <Package className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <p className="text-slate-500 text-sm mb-2">No {activeLibInfo?.label} yet.</p>
          <p className="text-slate-400 text-xs">Click Generate to create templates.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(item => (
            <div key={item.id} className="rounded-2xl bg-white border border-slate-200 p-4 hover:border-[#00d4ff]/30 hover:shadow-[0_0_20px_rgba(0,212,255,0.05)] transition-all duration-200">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-bold text-sm text-slate-900 truncate">{item.name}</h3>
                <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500 shrink-0 font-mono">{item.template_id}</span>
              </div>
              <div className="text-xs text-slate-500 mb-2">{item.industry || "General"}</div>
              <div className="flex items-center gap-2 mb-3">
                {["tone", "accent"].map(k => item[k] && (
                  <div key={k} className="w-5 h-5 rounded border border-slate-200" style={{ background: item[k] }} />
                ))}
                {item.head && <span className="text-[11px] text-slate-600 truncate flex-1">{item.head}</span>}
              </div>
              {item.sub && <p className="text-[11px] text-slate-400 line-clamp-2">{item.sub}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}