import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import BackButton from "@/components/shared/BackButton";
import { Loader2, Search, Wand2, Zap, Code, Workflow, Brain, Cpu } from "lucide-react";

const COMPLEXITY_COLORS = { simple: "bg-emerald-100 text-emerald-700", moderate: "bg-blue-100 text-blue-700", advanced: "bg-amber-100 text-amber-700", expert: "bg-purple-100 text-purple-700" };
const IMPL_ICONS = { prompt: Brain, api: Code, function: Zap, workflow: Workflow, model: Cpu, pipeline: Workflow };

export default function AISkillsLibrary() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { items } = await base44.entities.AISkill.filter({}, { sort: "category", limit: 500, fields: ["skill_id", "name", "category", "description", "implementation_type", "complexity", "integration_points", "example_use_cases"] });
      setSkills(items || []);
    } catch { setSkills([]); }
    finally { setLoading(false); }
  };

  const seed = async () => {
    setSeeding(true);
    try { await base44.functions.invoke("seedLibraries", { library: "skills" }); await load(); }
    catch (e) { alert("Seed failed: " + (e.message || "unknown")); }
    finally { setSeeding(false); }
  };

  const categories = useMemo(() => ["All", ...Array.from(new Set(skills.map((s) => s.category))).sort()], [skills]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return skills.filter((s) => {
      const matchCat = category === "All" || s.category === category;
      const matchQ = !q || (s.name || "").toLowerCase().includes(q) || (s.description || "").toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [skills, query, category]);

  return (
    <div className="portal-light min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton />
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">AI Skills Library</h1>
              <p className="text-sm text-slate-500">{skills.length} skills across {categories.length - 1} categories — integrable into any AI system</p>
            </div>
          </div>
          {skills.length === 0 && (
            <button onClick={seed} disabled={seeding} className="inline-flex items-center gap-2 rounded-full bg-[#00d4ff] px-5 py-2.5 text-sm font-bold text-[#0a0e14] hover:brightness-110 transition disabled:opacity-50">
              {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />} Seed 300 Skills
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-11 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00d4ff]/50 focus:ring-1 focus:ring-[#00d4ff]/30" placeholder="Search skills..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/30">
            {categories.map((c) => <option key={c} value={c}>{c === "All" ? "All Categories" : c.replace(/_/g, " ")}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#00d4ff]" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12"><Zap className="w-12 h-12 mx-auto mb-3 text-slate-300" /><p className="text-slate-400 text-sm">No skills found.</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.slice(0, 60).map((s) => {
              const Icon = IMPL_ICONS[s.implementation_type] || Zap;
              return (
                <div key={s.id} className="rounded-2xl border border-slate-200 bg-white p-4 hover:border-slate-300 transition">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center"><Icon className="w-4 h-4 text-slate-600" /></div>
                      <h3 className="font-bold text-slate-900 text-sm">{s.name}</h3>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${COMPLEXITY_COLORS[s.complexity] || "bg-slate-100 text-slate-600"}`}>{s.complexity}</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-3 line-clamp-2">{s.description}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-mono">{s.skill_id}</span>
                    <span>{s.implementation_type}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {filtered.length > 60 && <p className="text-center text-sm text-slate-400 mt-4">Showing first 60 of {filtered.length} skills — refine your search to see more</p>}
      </div>
    </div>
  );
}