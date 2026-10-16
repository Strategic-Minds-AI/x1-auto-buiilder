import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import {
  Building2, Package, Search, Loader2, Database, ChevronDown, ChevronRight,
  Layers, Grid3x3, Zap, Shield, TrendingUp, Gauge, Filter, X,
} from "lucide-react";

const LEAD_VALUE_COLORS = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-blue-100 text-blue-600",
  high: "bg-amber-100 text-amber-600",
  premium: "bg-purple-100 text-purple-600",
};

export default function IndustryLibrary() {
  const [tab, setTab] = useState("industries");
  const [families, setFamilies] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);
  const [counts, setCounts] = useState({});

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [fam, plat] = await Promise.all([
        base44.entities.IndustryFamily.filter({}, { sort: "family_id", limit: 100 }),
        base44.entities.PlatformPack.filter({}, { sort: "platform_id", limit: 100 }),
      ]);
      setFamilies(fam.items || []);
      setPlatforms(plat.items || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  const loadCounts = useCallback(async () => {
    try {
      const res = await base44.functions.invoke("seedFullIndustryLibrary", { action: "status" });
      setCounts(res.data?.counts || {});
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { loadData(); loadCounts(); }, [loadData, loadCounts]);

  const seed = async () => {
    setSeeding(true);
    try {
      await base44.functions.invoke("seedFullIndustryLibrary", {});
      loadCounts();
      loadData();
    } catch { /* ignore */ }
    finally { setSeeding(false); }
  };

  const categories = ["all", ...new Set(platforms.map(p => p.category))];
  const filteredFamilies = families.filter(f =>
    !search ||
    f.name?.toLowerCase().includes(search.toLowerCase()) ||
    f.family_id?.toLowerCase().includes(search.toLowerCase()) ||
    f.sub_industries?.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );
  const filteredPlatforms = platforms.filter(p =>
    (categoryFilter === "all" || p.category === categoryFilter) &&
    (!search ||
     p.name?.toLowerCase().includes(search.toLowerCase()) ||
     p.platform_id?.toLowerCase().includes(search.toLowerCase()) ||
     p.description?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900">Industry Library</h1>
            <p className="text-xs text-slate-500">Canonical registry of every business sector and website type</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-lg font-black text-[#00d4ff]">{counts.families || families.length}</div>
            <div className="text-[10px] text-slate-400 uppercase">Families</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-black text-[#00d4ff]">{counts.platforms || platforms.length}</div>
            <div className="text-[10px] text-slate-400 uppercase">Platforms</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-black text-[#00d4ff]">{counts.sub_industries || 0}</div>
            <div className="text-[10px] text-slate-400 uppercase">Sub-Industries</div>
          </div>
          <button
            onClick={seed}
            disabled={seeding}
            className="inline-flex items-center gap-2 rounded-full bg-[#00d4ff] px-5 py-2.5 text-sm font-bold text-white hover:brightness-110 disabled:opacity-50 transition"
          >
            {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
            {seeding ? "Seeding..." : "Seed Library"}
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-5 border-b border-slate-200">
        <button
          onClick={() => setTab("industries")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
            tab === "industries" ? "border-[#00d4ff] text-[#00d4ff]" : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Building2 className="w-4 h-4" /> Industry Families ({families.length})
        </button>
        <button
          onClick={() => setTab("platforms")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
            tab === "platforms" ? "border-[#00d4ff] text-[#00d4ff]" : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Package className="w-4 h-4" /> Platform Packs ({platforms.length})
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tab === "industries" ? "Search industries or sub-industries..." : "Search platforms..."}
            className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-11 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00d4ff]/50 focus:ring-1 focus:ring-[#00d4ff]/30 transition"
          />
        </div>
        {tab === "platforms" && (
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#00d4ff]/50 transition"
          >
            {categories.map(c => <option key={c} value={c}>{c === "all" ? "All Categories" : c}</option>)}
          </select>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-[#00d4ff]" /></div>
      ) : tab === "industries" ? (
        <div className="space-y-2">
          {filteredFamilies.map((f) => {
            const isOpen = expanded === f.id;
            return (
              <div key={f.id} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpanded(isOpen ? null : f.id)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition text-left"
                >
                  {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />}
                  <span className="text-xs font-mono text-[#00d4ff] shrink-0">{f.family_id}</span>
                  <span className="text-sm font-semibold flex-1 truncate text-slate-800">{f.name}</span>
                  <span className="text-xs text-slate-400 shrink-0">{f.sub_industries?.length || 0} sub-industries</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${LEAD_VALUE_COLORS[f.lead_value] || ""}`}>{f.lead_value}</span>
                </button>
                {isOpen && (
                  <div className="border-t border-slate-100 p-4 space-y-4 bg-slate-50/50">
                    {/* Sub-industries */}
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase mb-2">Sub-Industries</div>
                      <div className="flex flex-wrap gap-1.5">
                        {f.sub_industries?.map((s, i) => (
                          <span key={i} className="rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-xs text-slate-600">{s}</span>
                        ))}
                      </div>
                    </div>
                    {/* Scores */}
                    <div className="grid grid-cols-3 gap-3">
                      <ScoreCard icon={Zap} label="Urgency" value={f.urgency_score} max={5} />
                      <ScoreCard icon={TrendingUp} label="Buyer Density" value={f.buyer_density} max={5} />
                      <ScoreCard icon={Gauge} label="Digital Maturity" value={f.digital_maturity} max={5} />
                    </div>
                    {/* Recommended platforms */}
                    {f.recommended_platforms?.length > 0 && (
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase mb-2">Recommended Platforms</div>
                        <div className="flex flex-wrap gap-1.5">
                          {f.recommended_platforms.map((p, i) => (
                            <span key={i} className="rounded-lg bg-[#00d4ff]/10 border border-[#00d4ff]/20 px-2.5 py-1 text-xs text-[#00d4ff] font-medium">{p}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Visual DNA hints */}
                    {f.visual_dna_hints && (
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase mb-2">Visual DNA Hints</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {Object.entries(f.visual_dna_hints).map(([k, v]) => (
                            <div key={k} className="flex items-start gap-1.5">
                              <span className="text-slate-400 shrink-0">{k.replace(/_/g, " ")}:</span>
                              <span className="text-slate-600">{String(v)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {filteredFamilies.length === 0 && <EmptyState icon={Building2} label="No industry families found" />}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredPlatforms.map((p) => {
            const isOpen = expanded === p.id;
            return (
              <div key={p.id} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpanded(isOpen ? null : p.id)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition text-left"
                >
                  {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />}
                  <span className="text-xs font-mono text-[#00d4ff] shrink-0">{p.platform_id}</span>
                  <span className="text-sm font-semibold flex-1 truncate text-slate-800">{p.name}</span>
                  <span className="text-xs text-slate-400 shrink-0">{p.category}</span>
                  <span className="text-xs text-slate-400 shrink-0">Complexity: {p.complexity}/5</span>
                  <span className="text-xs text-slate-400 shrink-0">Autonomy: {p.autonomy_potential}/5</span>
                </button>
                {isOpen && (
                  <div className="border-t border-slate-100 p-4 space-y-4 bg-slate-50/50">
                    <p className="text-sm text-slate-600">{p.description}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase mb-1">Surfaces</div>
                        <div className="flex flex-wrap gap-1.5">
                          {p.surfaces?.map((s, i) => (
                            <span key={i} className="rounded-lg bg-white border border-slate-200 px-2 py-0.5 text-xs text-slate-600">{s}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase mb-1">Backend Components</div>
                        <div className="flex flex-wrap gap-1.5">
                          {p.backend_components?.map((s, i) => (
                            <span key={i} className="rounded-lg bg-white border border-slate-200 px-2 py-0.5 text-xs text-slate-600">{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase mb-1">Agents</div>
                        <div className="flex flex-wrap gap-1.5">
                          {p.agents?.map((s, i) => (
                            <span key={i} className="rounded-lg bg-purple-50 border border-purple-200 px-2 py-0.5 text-xs text-purple-600">{s}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase mb-1">Integrations</div>
                        <div className="flex flex-wrap gap-1.5">
                          {p.integrations?.map((s, i) => (
                            <span key={i} className="rounded-lg bg-cyan-50 border border-cyan-200 px-2 py-0.5 text-xs text-cyan-600">{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase mb-1">Monetization Model</div>
                      <div className="text-xs text-slate-600">{p.monetization_model}</div>
                    </div>
                    {p.recommended_industries?.length > 0 && (
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase mb-1">Recommended Industries</div>
                        <div className="flex flex-wrap gap-1.5">
                          {p.recommended_industries.map((s, i) => (
                            <span key={i} className="rounded-lg bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs text-emerald-600">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {filteredPlatforms.length === 0 && <EmptyState icon={Package} label="No platform packs found" />}
        </div>
      )}
    </div>
  );
}

function ScoreCard({ icon: Icon, label, value, max }) {
  return (
    <div className="rounded-lg bg-white border border-slate-200 p-2.5">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="w-3.5 h-3.5 text-[#00d4ff]" />
        <span className="text-[10px] text-slate-400 uppercase">{label}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-sm font-bold text-slate-800">{value}</span>
        <span className="text-xs text-slate-400">/ {max}</span>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, label }) {
  return (
    <div className="text-center py-16">
      <Icon className="w-10 h-10 text-slate-200 mx-auto mb-3" />
      <p className="text-sm text-slate-400">{label}</p>
      <p className="text-xs text-slate-300 mt-1">Click "Seed Library" to populate from the canonical registries</p>
    </div>
  );
}