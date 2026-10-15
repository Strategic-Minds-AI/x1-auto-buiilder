import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import BackButton from "@/components/shared/BackButton";
import { Loader2, Search, Wand2, Bot, Zap, Shield, Code, BarChart3, Mail, TrendingUp, Heart, Search as SearchIcon, Palette, CheckCircle, Server, ShieldCheck, DollarSign, Scale, Users, ClipboardList, Package, Rocket, Settings, PenTool, Sparkles } from "lucide-react";

const ICON_MAP = { PenTool, Shield, Sparkles, Mail, TrendingUp, Heart, BarChart3, Search: SearchIcon, Palette, Code, CheckCircle, Server, ShieldCheck, DollarSign, Scale, Users, ClipboardList, Package, Rocket, Settings, Bot, Zap };

export default function AgentLibrary() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { items } = await base44.entities.AgentProfile.filter({}, { sort: "skill_category", limit: 100 });
      setAgents(items || []);
    } catch { setAgents([]); }
    finally { setLoading(false); }
  };

  const seed = async () => {
    setSeeding(true);
    try { await base44.functions.invoke("seedLibraries", { library: "agents" }); await load(); }
    catch (e) { alert("Seed failed: " + (e.message || "unknown")); }
    finally { setSeeding(false); }
  };

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return agents.filter((a) => !q || (a.name || "").toLowerCase().includes(q) || (a.skill_category || "").toLowerCase().includes(q) || (a.description || "").toLowerCase().includes(q));
  }, [agents, query]);

  return (
    <div className="portal-light min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton />
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">Agent Library</h1>
              <p className="text-sm text-slate-500">{agents.length} specialized agents — one for every skill category</p>
            </div>
          </div>
          {agents.length === 0 && (
            <button onClick={seed} disabled={seeding} className="inline-flex items-center gap-2 rounded-full bg-[#00d4ff] px-5 py-2.5 text-sm font-bold text-[#0a0e14] hover:brightness-110 transition disabled:opacity-50">
              {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />} Seed Agents
            </button>
          )}
        </div>

        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-11 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00d4ff]/50 focus:ring-1 focus:ring-[#00d4ff]/30" placeholder="Search agents by name, skill, or capability..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#00d4ff]" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12"><Bot className="w-12 h-12 mx-auto mb-3 text-slate-300" /><p className="text-slate-400 text-sm">No agents found.</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((a) => {
              const Icon = ICON_MAP[a.icon] || Bot;
              return (
                <div key={a.id} className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-slate-300 transition cursor-pointer" onClick={() => setSelected(a)}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: (a.color || "#00d4ff") + "20", color: a.color || "#00d4ff" }}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 text-sm">{a.name}</h3>
                      <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{a.skill_category?.replace(/_/g, " ")}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mb-3 line-clamp-2">{a.description}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {(a.capabilities || []).slice(0, 3).map((cap, i) => (
                      <span key={i} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">{cap}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Autonomy: <span className="font-semibold text-slate-600">{a.autonomy_level}</span></span>
                    <span>Model: <span className="font-semibold text-slate-600">{a.model}</span></span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Agent detail modal */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setSelected(null)}>
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: (selected.color || "#00d4ff") + "20", color: selected.color || "#00d4ff" }}>
                  {(() => { const Icon = ICON_MAP[selected.icon] || Bot; return <Icon className="w-6 h-6" />; })()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{selected.name}</h2>
                  <span className="text-xs text-slate-400">{selected.skill_category?.replace(/_/g, " ")}</span>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-4">{selected.description}</p>
              <div className="mb-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Capabilities</h4>
                <div className="flex flex-wrap gap-1.5">
                  {(selected.capabilities || []).map((cap, i) => (
                    <span key={i} className="rounded-full bg-[#00d4ff]/10 px-2.5 py-1 text-xs font-medium text-[#00d4ff]">{cap}</span>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Available Tools</h4>
                <div className="flex flex-wrap gap-1.5">
                  {(selected.tools || []).map((tool, i) => (
                    <span key={i} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-mono text-slate-600">{tool}</span>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">System Prompt</h4>
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600 leading-relaxed">{selected.system_prompt}</div>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span>Autonomy: <strong className="text-slate-700">{selected.autonomy_level}</strong></span>
                <span>Model: <strong className="text-slate-700">{selected.model}</strong></span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}