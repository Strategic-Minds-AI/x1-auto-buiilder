import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  Bookmark, Loader2, Search, ChevronDown, ChevronRight, Sparkles,
  ArrowRight, CheckCircle2, AlertTriangle, Gauge,
} from "lucide-react";

export default function BlueprintSelector() {
  const navigate = useNavigate();
  const [blueprints, setBlueprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [variables, setVariables] = useState({});
  const [loadingIntoPipeline, setLoadingIntoPipeline] = useState(false);
  const [loadedProject, setLoadedProject] = useState(null);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    loadBlueprints();
  }, []);

  const loadBlueprints = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("listBuildBlueprints", {});
      const data = res.data || {};
      setBlueprints(data.blueprints || []);
      if ((data.blueprints || []).length === 0) {
        setError("No high-performer blueprints saved yet. Run a validator pipeline that scores 80+ and click 'Save as Blueprint' to build your library.");
      }
    } catch (err) {
      setError(err.message || "Failed to load blueprints");
    } finally {
      setLoading(false);
    }
  };

  const filteredBlueprints = blueprints.filter((bp) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      bp.name?.toLowerCase().includes(q) ||
      bp.industry?.toLowerCase().includes(q) ||
      bp.sub_industry?.toLowerCase().includes(q) ||
      bp.website_type?.toLowerCase().includes(q)
    );
  });

  const selectBlueprint = (bp) => {
    setSelected(bp);
    setExpanded(false);
    setLoadedProject(null);
    setLoadError(null);
    // Pre-fill variables with empty strings
    const vars = {};
    (bp.variables || []).forEach((v) => { vars[v.key] = ""; });
    setVariables(vars);
  };

  const loadIntoPipeline = async () => {
    if (!selected) return;
    // Ensure required variables have values
    const missing = (selected.variables || []).filter((v) => !variables[v.key]?.trim());
    if (missing.length > 0) {
      setLoadError(`Please fill in: ${missing.map((v) => v.key).join(", ")}`);
      return;
    }
    setLoadingIntoPipeline(true);
    setLoadError(null);
    try {
      const res = await base44.functions.invoke("instantiateTemplate", {
        templateId: selected.id,
        variables,
      });
      if (res.data?.error) {
        setLoadError(res.data.error);
      } else {
        setLoadedProject(res.data);
        // Bump usage count on the blueprint (best-effort)
        base44.entities.SiteTemplate.update(selected.id, {
          usage_count: (selected.usage_count || 0) + 1,
          last_used_at: new Date().toISOString(),
        }).catch(() => {});
      }
    } catch (err) {
      setLoadError(err.message || "Failed to load blueprint into pipeline");
    } finally {
      setLoadingIntoPipeline(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#00d4ff]/5 to-[#0066ff]/5 rounded-2xl border border-[#00d4ff]/20 p-5 mb-6">
      {/* Header / toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 text-left"
      >
        <div className="w-9 h-9 rounded-xl bg-[#00d4ff]/15 flex items-center justify-center shrink-0">
          <Bookmark className="w-4.5 h-4.5 text-[#00d4ff]" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            Start from High-Performer Blueprint
            <Sparkles className="w-3.5 h-3.5 text-[#00d4ff]" />
          </h3>
          <p className="text-xs text-slate-500">
            Load a proven, quality-validated structure straight into the factory pipeline.
          </p>
        </div>
        {expanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
      </button>

      {/* Expanded selector */}
      {expanded && (
        <div className="mt-4 space-y-4">
          {loading && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-[#00d4ff]" />
            </div>
          )}

          {error && !loading && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by industry, niche, or type..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/40"
                />
              </div>

              {/* Blueprint grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                {filteredBlueprints.map((bp) => {
                  const active = selected?.id === bp.id;
                  return (
                    <button
                      key={bp.id}
                      onClick={() => selectBlueprint(bp)}
                      className={`text-left rounded-xl border p-3 transition ${
                        active
                          ? "border-[#00d4ff] bg-[#00d4ff]/8 ring-2 ring-[#00d4ff]/30"
                          : "border-slate-200 bg-white hover:border-[#00d4ff]/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-sm font-bold text-slate-900 truncate">{bp.name}</span>
                        {active && <CheckCircle2 className="w-4 h-4 text-[#00d4ff] shrink-0" />}
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {bp.industry && <Tag>{bp.industry}</Tag>}
                        {bp.sub_industry && <Tag>{bp.sub_industry}</Tag>}
                        {bp.website_type && <Tag>{bp.website_type}</Tag>}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        {bp.quality_score != null && (
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                            <Gauge className="w-3 h-3" /> {bp.quality_score}/100
                          </span>
                        )}
                        {bp.parity_score != null && <span>Parity {bp.parity_score}</span>}
                        {bp.usage_count > 0 && <span>Used {bp.usage_count}×</span>}
                      </div>
                    </button>
                  );
                })}
                {filteredBlueprints.length === 0 && (
                  <div className="col-span-2 text-center py-6 text-sm text-slate-400">
                    No blueprints match "{search}"
                  </div>
                )}
              </div>

              {/* Selected blueprint — variable form */}
              {selected && (
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Bookmark className="w-4 h-4 text-[#00d4ff]" />
                    <span className="text-sm font-bold text-slate-900">{selected.name}</span>
                  </div>

                  {(selected.variables || []).length > 0 ? (
                    <>
                      <p className="text-xs text-slate-500 mb-3">
                        Fill in the business details to adapt this blueprint. The proven structure stays intact.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        {selected.variables.map((v) => (
                          <div key={v.key}>
                            <label className="block text-xs font-bold text-slate-600 mb-1">
                              {v.key}
                              <span className="font-normal text-slate-400 ml-1">— {v.description}</span>
                            </label>
                            <input
                              type="text"
                              value={variables[v.key] || ""}
                              onChange={(e) => setVariables({ ...variables, [v.key]: e.target.value })}
                              placeholder={`{{${v.key}}}`}
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/40"
                            />
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-slate-500 mb-4">
                      This blueprint has no placeholder variables — it will load as-is.
                    </p>
                  )}

                  <button
                    onClick={loadIntoPipeline}
                    disabled={loadingIntoPipeline}
                    className="inline-flex items-center gap-2 rounded-full bg-[#00d4ff] px-5 py-2.5 text-sm font-bold text-[#0a0e14] hover:brightness-110 disabled:opacity-50 transition"
                  >
                    {loadingIntoPipeline ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                    {loadingIntoPipeline ? "Loading into Pipeline..." : "Load into Factory Pipeline"}
                  </button>

                  {loadError && (
                    <div className="mt-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600 flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{loadError}</span>
                    </div>
                  )}

                  {loadedProject && (
                    <div className="mt-3 rounded-lg bg-emerald-50 border border-emerald-200 p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-bold text-emerald-900">Blueprint loaded into factory pipeline</span>
                      </div>
                      <p className="text-xs text-emerald-700 mb-2">
                        Project "{loadedProject.project?.business_name || variables.business_name || selected.name}" created with the blueprint structure.
                      </p>
                      <button
                        onClick={() => navigate(`/validator-pipeline?projectId=${loadedProject.project?.id || ""}`)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
                      >
                        <ArrowRight className="w-3.5 h-3.5" /> Open Validator Pipeline
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Tag({ children }) {
  return (
    <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
      {children}
    </span>
  );
}