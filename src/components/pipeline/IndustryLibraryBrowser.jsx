import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Library, Loader2, Search, TrendingUp, DollarSign, AlertTriangle,
  Sparkles, ChevronDown, ChevronRight, Rocket,
} from "lucide-react";

const RISK_COLORS = {
  LOW: "bg-emerald-100 text-emerald-600",
  MEDIUM: "bg-amber-100 text-amber-600",
  HIGH: "bg-red-100 text-red-600",
};

export default function IndustryLibraryBrowser() {
  const [useCases, setUseCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [search, setSearch] = useState("");
  const [archetypeFilter, setArchetypeFilter] = useState("ALL");
  const [industryFilter, setIndustryFilter] = useState("ALL");
  const [expanded, setExpanded] = useState(null);
  const [seedMsg, setSeedMsg] = useState(null);

  const loadUseCases = async () => {
    try {
      const page = await base44.entities.IndustryUseCase.filter({}, { sort: "-opportunity_score", limit: 50 });
      setUseCases(page.items || []);
    } catch { }
    finally { setLoading(false); }
  };

  const seedLibrary = async () => {
    setSeeding(true);
    setSeedMsg(null);
    try {
      const res = await base44.functions.invoke("seedIndustryLibrary", {});
      setSeedMsg(res.data?.message || "Seeded successfully");
      loadUseCases();
    } catch (e) {
      setSeedMsg("Seed failed: " + (e.response?.data?.error || e.message));
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => { loadUseCases(); }, []);

  const archetypes = [...new Set(useCases.map(u => u.system_archetype))];
  const industries = [...new Set(useCases.map(u => u.industry))];

  const filtered = useCases.filter(u => {
    const matchesSearch = !search ||
      u.system_idea?.toLowerCase().includes(search.toLowerCase()) ||
      u.industry?.toLowerCase().includes(search.toLowerCase()) ||
      u.subindustry?.toLowerCase().includes(search.toLowerCase());
    const matchesArchetype = archetypeFilter === "ALL" || u.system_archetype === archetypeFilter;
    const matchesIndustry = industryFilter === "ALL" || u.industry === industryFilter;
    return matchesSearch && matchesArchetype && matchesIndustry;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Library className="w-4 h-4 text-[#00d4ff]" />
          <div>
            <h3 className="text-sm font-bold text-slate-700">X1 Industry Library</h3>
            <p className="text-[10px] text-slate-400">4,000 pre-scored system ideas across 20 industries</p>
          </div>
        </div>
        {useCases.length === 0 && !loading && (
          <button
            onClick={seedLibrary}
            disabled={seeding}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#00d4ff] px-4 py-2 text-xs font-bold text-[#0a0e14] hover:brightness-110 disabled:opacity-50 transition"
          >
            {seeding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            {seeding ? "Seeding 4,000 use cases..." : "Seed Library"}
          </button>
        )}
      </div>

      {seedMsg && (
        <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-600 mb-3">
          {seedMsg}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-[#00d4ff]" /></div>
      ) : useCases.length === 0 ? (
        <div className="text-center py-6">
          <Library className="w-8 h-8 text-slate-200 mx-auto mb-2" />
          <p className="text-xs text-slate-400">Library is empty. Click "Seed Library" to populate 4,000 use cases.</p>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search use cases..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/40"
              />
            </div>
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/40"
            >
              <option value="ALL">All Industries</option>
              {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
            </select>
            <select
              value={archetypeFilter}
              onChange={(e) => setArchetypeFilter(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/40"
            >
              <option value="ALL">All Archetypes</option>
              {archetypes.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <div className="text-[10px] text-slate-400 mb-2">Showing {filtered.length} of {useCases.length} loaded (top by opportunity score)</div>

          {/* Use case list */}
          <div className="space-y-1.5 max-h-96 overflow-y-auto">
            {filtered.slice(0, 50).map((uc) => {
              const isExpanded = expanded === uc.id;
              return (
                <div key={uc.id} className="rounded-lg border border-slate-100 hover:border-slate-200 transition">
                  <button
                    onClick={() => setExpanded(isExpanded ? null : uc.id)}
                    className="w-full flex items-center gap-2 p-2.5 text-left"
                  >
                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                    <code className="text-[10px] font-mono font-bold text-slate-400 shrink-0">{uc.use_case_id}</code>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-700 truncate">{uc.subindustry}</div>
                      <div className="text-[10px] text-slate-400 truncate">{uc.system_archetype}</div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600">
                        <TrendingUp className="w-3 h-3" />{uc.opportunity_score}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${RISK_COLORS[uc.risk_class] || RISK_COLORS.LOW}`}>
                        {uc.risk_class}
                      </span>
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="border-t border-slate-100 px-3 py-3 space-y-2">
                      <p className="text-xs text-slate-600">{uc.core_outcome}</p>
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div className="rounded bg-slate-50 p-1.5">
                          <div className="text-slate-400 font-bold">Frontend</div>
                          <div className="text-slate-600">{uc.frontend_surfaces}</div>
                        </div>
                        <div className="rounded bg-slate-50 p-1.5">
                          <div className="text-slate-400 font-bold">Backend</div>
                          <div className="text-slate-600">{uc.backend_components}</div>
                        </div>
                        <div className="rounded bg-slate-50 p-1.5">
                          <div className="text-slate-400 font-bold">Agents</div>
                          <div className="text-slate-600">{uc.agents_ai}</div>
                        </div>
                        <div className="rounded bg-slate-50 p-1.5">
                          <div className="text-slate-400 font-bold">Connectors</div>
                          <div className="text-slate-600">{uc.key_connectors}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] pt-1">
                        <span className="inline-flex items-center gap-1 text-slate-500">
                          <DollarSign className="w-3 h-3 text-emerald-500" />
                          ${uc.setup_price?.toLocaleString()} setup + ${uc.monthly_price}/mo
                        </span>
                        <span className="text-slate-400">{uc.monetization_model}</span>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[10px] font-bold text-slate-400">Scores:</span>
                        <span className="text-[10px] text-slate-500">Auto {uc.autonomy_score}</span>
                        <span className="text-[10px] text-slate-500">Mon {uc.monetization_score}</span>
                        <span className="text-[10px] text-slate-500">Cplx {uc.complexity_score}</span>
                        <span className="text-[10px] text-slate-500">Repeat {uc.repeatability_score}</span>
                      </div>
                      {uc.protected_gates && (
                        <div className="flex items-start gap-1.5 text-[10px] text-amber-600 pt-1">
                          <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                          <span>{uc.protected_gates}</span>
                        </div>
                      )}
                      <button
                        onClick={() => {
                          window.location.href = `/auto-builder?industry=${encodeURIComponent(uc.industry)}&subindustry=${encodeURIComponent(uc.subindustry)}&archetype=${encodeURIComponent(uc.system_archetype)}`;
                        }}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#00d4ff] px-3 py-1.5 text-[10px] font-bold text-[#0a0e14] hover:brightness-110 transition mt-1"
                      >
                        <Rocket className="w-3 h-3" /> Build This System
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}