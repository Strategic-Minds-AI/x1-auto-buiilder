import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import {
  Image, LayoutTemplate, ShieldCheck, Gauge, Search, Copy, Play, Loader2,
  X, CheckCircle2, Sparkles, Tag, ChevronDown, ChevronUp, BookOpen, Plus
} from "lucide-react";
import { PROMPT_CATEGORIES, BUILTIN_PROMPTS } from "@/data/promptLibrary";
import BackButton from "@/components/shared/BackButton";

const ICONS = { Image, LayoutTemplate, ShieldCheck, Gauge };

export default function PromptLibrary() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [dbPrompts, setDbPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [runModal, setRunModal] = useState(null);
  const [runResult, setRunResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState(null);
  const [copied, setCopied] = useState(null);
  const [variables, setVariables] = useState({});
  const [showSystem, setShowSystem] = useState(false);

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    setLoading(true);
    // Seed builtin prompts first (idempotent — skips existing)
    try {
      await base44.functions.invoke("seedPromptLibrary", { prompts: BUILTIN_PROMPTS });
    } catch {
      // Seeding may fail if not admin — continue with data file prompts
    }
    // Then load any DB-saved prompts
    try {
      const { items } = await base44.entities.PromptPack.filter(
        { is_builtin: true },
        { sort: "-created_date", limit: 100 }
      );
      setDbPrompts(items);
    } catch {
      setDbPrompts([]);
    } finally {
      setLoading(false);
    }
  };

  // Merge builtin data file prompts with any DB-saved ones
  const allPrompts = useMemo(() => {
    const dbNames = new Set(dbPrompts.map(p => p.name));
    const merged = [...BUILTIN_PROMPTS];
    dbPrompts.forEach(p => {
      if (!BUILTIN_PROMPTS.find(b => b.name === p.name)) {
        merged.push({
          name: p.name,
          category: p.category,
          prompt_type: p.prompt_type,
          description: p.description,
          system_prompt: p.system_prompt,
          user_prompt_template: p.user_prompt_template,
          variables: p.variables || [],
          tags: p.tags || [],
          model: p.model || "automatic",
          response_schema: p.response_schema,
          is_builtin: true,
        });
      }
    });
    return merged;
  }, [dbPrompts]);

  const filtered = useMemo(() => {
    return allPrompts.filter(p => {
      if (activeCategory !== "all" && p.category !== activeCategory) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q) ||
          (p.tags || []).some(t => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [allPrompts, activeCategory, search]);

  const categoryCounts = useMemo(() => {
    const counts = { all: allPrompts.length };
    PROMPT_CATEGORIES.forEach(c => {
      counts[c.id] = allPrompts.filter(p => p.category === c.id).length;
    });
    return counts;
  }, [allPrompts]);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const openRunModal = (prompt) => {
    setRunModal(prompt);
    setRunResult(null);
    setRunError(null);
    const initialVars = {};
    (prompt.variables || []).forEach(v => { initialVars[v.key] = ""; });
    setVariables(initialVars);
  };

  const runPrompt = async () => {
    if (!runModal) return;
    setRunning(true);
    setRunError(null);
    setRunResult(null);
    try {
      // Fill in template
      let userPrompt = runModal.user_prompt_template || "";
      Object.entries(variables).forEach(([key, val]) => {
        userPrompt = userPrompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), val || `[${key}]`);
      });

      const res = await base44.functions.invoke("runPromptPack", {
        system_prompt: runModal.system_prompt,
        user_prompt: userPrompt,
        model: runModal.model || "automatic",
        response_schema: runModal.response_schema || null,
      });
      setRunResult(res.data);
    } catch (err) {
      setRunError(err.response?.data?.error || err.message || "Failed to run prompt");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="portal-light min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <BackButton fallback="/portal" label="Back to Portal" />

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">Prompt Library</h1>
              <p className="text-sm text-slate-500">Specialized AI prompts for image enhancement, template optimization, validation, and quality scoring</p>
            </div>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition ${
              activeCategory === "all"
                ? "bg-[#00d4ff] text-[#0a0e14]"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All ({categoryCounts.all})
          </button>
          {PROMPT_CATEGORIES.map(cat => {
            const Icon = ICONS[cat.icon] || Sparkles;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition flex items-center gap-2 ${
                  activeCategory === cat.id
                    ? "text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
                style={activeCategory === cat.id ? { backgroundColor: cat.color } : {}}
              >
                <Icon className="w-4 h-4" />
                {cat.label} ({categoryCounts[cat.id] || 0})
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search prompts by name, description, or tags..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/30 focus:border-[#00d4ff]/40 transition"
          />
        </div>

        {/* Prompt grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <p className="text-sm">No prompts found. Try a different search or category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((prompt, i) => {
              const cat = PROMPT_CATEGORIES.find(c => c.id === prompt.category);
              const Icon = cat ? ICONS[cat.icon] : Sparkles;
              return (
                <div
                  key={i}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 hover:border-[#00d4ff]/40 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: (cat?.color || "#00d4ff") + "15" }}
                    >
                      <Icon className="w-5 h-5" style={{ color: cat?.color || "#00d4ff" }} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {prompt.model === "automatic" ? "Auto" : prompt.model?.replace("_", " ") || "Auto"}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mb-1 leading-tight">{prompt.name}</h3>
                  <p className="text-xs text-slate-500 mb-3 line-clamp-2 leading-relaxed">{prompt.description}</p>

                  {/* Tags */}
                  {prompt.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {prompt.tags.slice(0, 4).map(tag => (
                        <span key={tag} className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-medium text-slate-500">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Variables count */}
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-4">
                    <Tag className="w-3 h-3" />
                    {prompt.variables?.length || 0} variable{(prompt.variables?.length || 0) !== 1 ? "s" : ""}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openRunModal(prompt)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#00d4ff] px-3 py-2 text-xs font-bold text-[#0a0e14] hover:brightness-110 transition"
                    >
                      <Play className="w-3.5 h-3.5" /> Run
                    </button>
                    <button
                      onClick={() => { setSelectedPrompt(selectedPrompt === prompt ? null : prompt); setShowSystem(false); }}
                      className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-slate-300 transition"
                    >
                      View
                    </button>
                    <button
                      onClick={() => copyToClipboard(`${prompt.system_prompt}\n\n---\n\n${prompt.user_prompt_template}`, `card-${i}`)}
                      className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-slate-300 transition"
                    >
                      {copied === `card-${i}` ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Expandable detail */}
                  {selectedPrompt === prompt && (
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">System Prompt</span>
                          <button onClick={() => setShowSystem(!showSystem)} className="text-slate-400 hover:text-slate-600">
                            {showSystem ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <p className={`text-xs text-slate-600 leading-relaxed font-mono bg-slate-50 rounded-lg p-3 ${showSystem ? "" : "line-clamp-3"}`}>
                          {prompt.system_prompt}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">User Prompt Template</span>
                        <p className="text-xs text-slate-600 leading-relaxed font-mono bg-slate-50 rounded-lg p-3 line-clamp-4">
                          {prompt.user_prompt_template}
                        </p>
                      </div>
                      {prompt.variables?.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Variables</span>
                          <div className="space-y-1">
                            {prompt.variables.map(v => (
                              <div key={v.key} className="text-xs text-slate-600">
                                <span className="font-mono font-semibold text-[#00d4ff]">{`{{${v.key}}}`}</span>
                                {v.required && <span className="text-red-400 ml-1">*</span>}
                                <span className="text-slate-400 ml-2">— {v.description}</span>
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
          </div>
        )}
      </div>

      {/* Run Modal */}
      {runModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => !running && setRunModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900">{runModal.name}</h3>
                <p className="text-xs text-slate-500">{runModal.description}</p>
              </div>
              <button onClick={() => !running && setRunModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {/* Variables */}
              {runModal.variables?.length > 0 && (
                <div className="mb-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Fill in Variables</h4>
                  <div className="space-y-3">
                    {runModal.variables.map(v => (
                      <div key={v.key}>
                        <label className="text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1">
                          <span className="font-mono text-[#00d4ff]">{`{{${v.key}}}`}</span>
                          {v.required && <span className="text-red-400 text-xs">*</span>}
                        </label>
                        <p className="text-xs text-slate-400 mb-1.5">{v.description}</p>
                        <input
                          value={variables[v.key] || ""}
                          onChange={e => setVariables({ ...variables, [v.key]: e.target.value })}
                          placeholder={`Enter ${v.key}...`}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/30 focus:border-[#00d4ff]/40 transition"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview filled prompt */}
              <div className="mb-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Prompt Preview</h4>
                <div className="rounded-lg bg-slate-900 p-4 max-h-40 overflow-y-auto">
                  <p className="text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">
                    {(() => {
                      let p = runModal.user_prompt_template || "";
                      Object.entries(variables).forEach(([k, val]) => {
                        p = p.replace(new RegExp(`\\{\\{${k}\\}\\}`, "g"), val || `[${k}]`);
                      });
                      return p;
                    })()}
                  </p>
                </div>
              </div>

              {/* Result */}
              {runError && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {runError}
                </div>
              )}
              {runResult && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Result</h4>
                  </div>
                  <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 max-h-60 overflow-y-auto">
                    <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono leading-relaxed">
                      {typeof runResult === "string" ? runResult : JSON.stringify(runResult, null, 2)}
                    </pre>
                  </div>
                  <button
                    onClick={() => copyToClipboard(typeof runResult === "string" ? runResult : JSON.stringify(runResult, null, 2), "result")}
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#00d4ff] transition"
                  >
                    {copied === "result" ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy result
                  </button>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
              <span className="text-xs text-slate-400">
                Model: <span className="font-semibold text-slate-600">{runModal.model || "automatic"}</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setRunModal(null); setRunResult(null); }}
                  disabled={running}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-200 transition disabled:opacity-50"
                >
                  Close
                </button>
                <button
                  onClick={runPrompt}
                  disabled={running}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#00d4ff] text-sm font-bold text-[#0a0e14] hover:brightness-110 transition disabled:opacity-60"
                >
                  {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  {running ? "Running..." : "Run Prompt"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}