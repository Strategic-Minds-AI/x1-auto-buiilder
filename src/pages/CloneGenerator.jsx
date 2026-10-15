import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";
import BackButton from "@/components/shared/BackButton";
import {
  Copy, Scan, Palette, FileText, Filter, Search, Globe,
  Loader2, Sparkles, ChevronRight, Trash2, CheckCircle,
  AlertCircle, Building2, Layers, Zap, Award, Download,
} from "lucide-react";

const PIPELINE = [
  { key: "reverse_engineer", label: "Reverse Engineer", icon: Scan, action: "reverse_engineer", color: "#3b82f6" },
  { key: "rebrand", label: "Rebrand", icon: Palette, action: "rebrand", color: "#8b5cf6" },
  { key: "content", label: "Content", icon: FileText, action: "generate_content", color: "#14b8a6" },
  { key: "funnel", label: "Funnel System", icon: Filter, action: "generate_funnel", color: "#f59e0b" },
  { key: "google_scan", label: "Google Scanner", icon: Search, action: "google_scan", color: "#ef4444" },
  { key: "website", label: "Ultra Website", icon: Award, action: "generate_website", color: "#00d4ff" },
];

export default function CloneGenerator() {
  const [url, setUrl] = useState("");
  const [cloning, setCloning] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [activeTab, setActiveTab] = useState("reverse_engineer");
  const [loadingAction, setLoadingAction] = useState(null);
  const [error, setError] = useState("");

  const loadProjects = async () => {
    try {
      const page = await base44.entities.CloneProject.filter({}, { sort: "-created_date", limit: 50 });
      setProjects(page.items || []);
      if (!selectedId && (page.items || []).length > 0) setSelectedId(page.items[0].id);
    } catch (err) { console.error("Load failed:", err); }
  };

  useEffect(() => { loadProjects(); }, []);

  const selected = projects.find((p) => p.id === selectedId);

  const handleClone = async () => {
    if (!url.trim()) return;
    setCloning(true);
    setError("");
    try {
      let cleanUrl = url.trim();
      if (!cleanUrl.startsWith("http")) cleanUrl = "https://" + cleanUrl;
      const res = await base44.functions.invoke("cloneGenerator", { action: "clone", url: cleanUrl });
      if (res.data?.success) {
        setUrl("");
        await loadProjects();
        setSelectedId(res.data.project.id);
      } else {
        setError(res.data?.error || "Failed to clone URL");
      }
    } catch (err) {
      setError(err.message || "Failed to clone URL");
    } finally {
      setCloning(false);
    }
  };

  const runAction = async (step) => {
    if (!selected) return;
    setLoadingAction(step.action);
    setError("");
    try {
      const res = await base44.functions.invoke("cloneGenerator", {
        action: step.action,
        project_id: selected.id,
      });
      if (res.data?.success) {
        await loadProjects();
      } else {
        setError(res.data?.error || "Action failed");
      }
    } catch (err) {
      setError(err.message || "Action failed");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this clone project?")) return;
    try {
      await base44.entities.CloneProject.delete(id);
      if (selectedId === id) setSelectedId(null);
      await loadProjects();
    } catch (err) { console.error("Delete failed:", err); }
  };

  const downloadContent = (content, filename) => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="portal-light min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <BackButton fallback="/portal" label="Back to Portal" />

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center">
              <Copy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800">Clone Generator Studio</h1>
              <p className="text-sm text-slate-500">Clone any URL, reverse-engineer it, rebrand, generate content, funnels, Google compliance & ultra high quality websites</p>
            </div>
          </div>
        </div>

        {/* URL Input */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 block">Clone Any Website</label>
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleClone(); }}
                placeholder="https://example.com"
                className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/30"
              />
            </div>
            <button
              onClick={handleClone}
              disabled={!url.trim() || cloning}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] px-6 py-3 text-sm font-bold text-white disabled:opacity-40 hover:brightness-110 transition"
            >
              {cloning ? <><Loader2 className="w-4 h-4 animate-spin" /> Cloning...</> : <><Copy className="w-4 h-4" /> Clone URL</>}
            </button>
          </div>
          {error && (
            <div className="mt-2 flex items-center gap-2 text-xs text-red-500">
              <AlertCircle className="w-3.5 h-3.5" /> {error}
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Project List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Clone Projects</label>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{projects.length}</span>
              </div>
              {projects.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No projects yet. Clone a URL to start.</p>
              ) : (
                <div className="space-y-1.5 max-h-[calc(100vh-280px)] overflow-y-auto">
                  {projects.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedId(p.id)}
                      className={`w-full text-left rounded-xl border p-3 transition ${
                        selectedId === p.id ? "border-[#00d4ff] bg-[#00d4ff]/5" : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-700 truncate">{p.source_title || "Untitled"}</p>
                          <p className="text-[10px] text-slate-400 truncate">{p.source_url}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              p.status === "website_generated" ? "bg-emerald-50 text-emerald-600" :
                              p.status === "cloned" ? "bg-blue-50 text-blue-600" :
                              "bg-slate-100 text-slate-500"
                            }`}>{p.status.replace(/_/g, " ")}</span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                          className="p-1 rounded text-slate-300 hover:text-red-500 transition"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pipeline + Output */}
          <div className="lg:col-span-3">
            {!selected ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <Copy className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-400">Select a project or clone a new URL</p>
                <p className="text-xs text-slate-400 mt-1">The pipeline will appear here once you select a project</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Pipeline tabs */}
                <div className="bg-white rounded-2xl border border-slate-200 p-3">
                  <div className="flex items-center gap-1.5 overflow-x-auto">
                    {PIPELINE.map((step) => {
                      const Icon = step.icon;
                      const isActive = activeTab === step.key;
                      const hasData = step.key === "reverse_engineer" ? !!selected.analysis :
                        step.key === "rebrand" ? !!selected.rebrand :
                        step.key === "content" ? !!selected.generated_content :
                        step.key === "funnel" ? !!selected.funnel_system :
                        step.key === "google_scan" ? !!selected.google_scan :
                        !!selected.website_blueprint;
                      return (
                        <button
                          key={step.key}
                          onClick={() => setActiveTab(step.key)}
                          className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold whitespace-nowrap transition ${
                            isActive ? "text-white shadow-sm" : "text-slate-500 hover:bg-slate-100"
                          }`}
                          style={isActive ? { background: `linear-gradient(135deg, ${step.color}, ${step.color}dd)` } : {}}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {step.label}
                          {hasData && <CheckCircle className="w-3 h-3 opacity-60" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Active tab content */}
                {activeTab === "reverse_engineer" && (
                  <PipelineTab
                    title="Reverse Engineer"
                    icon={Scan}
                    color="#3b82f6"
                    description="AI analysis of the cloned site's structure, design system, layout, and components"
                    hasData={!!selected.analysis}
                    loading={loadingAction === "reverse_engineer"}
                    onRun={() => runAction(PIPELINE[0])}
                    onDownload={() => downloadContent(JSON.stringify(selected.analysis, null, 2), "analysis.json")}
                  >
                    {selected.analysis && (
                      <div className="space-y-4">
                        {selected.analysis.summary && (
                          <div className="rounded-xl bg-blue-50 border border-blue-100 p-3">
                            <p className="text-xs font-bold text-blue-600 uppercase mb-1">Summary</p>
                            <p className="text-sm text-blue-700">{selected.analysis.summary}</p>
                          </div>
                        )}
                        {selected.analysis.sections?.length > 0 && (
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Page Sections</p>
                            <div className="space-y-1.5">
                              {selected.analysis.sections.map((s, i) => (
                                <div key={i} className="rounded-lg border border-slate-200 p-3">
                                  <p className="text-sm font-bold text-slate-700">{s.name}</p>
                                  <p className="text-xs text-slate-500">{s.purpose}</p>
                                  {s.elements?.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1.5">
                                      {s.elements.map((e, j) => (
                                        <span key={j} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{e}</span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {selected.analysis.design_system && (
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Design System</p>
                            <div className="rounded-lg border border-slate-200 p-3 space-y-2">
                              {selected.analysis.design_system.colors?.length > 0 && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-slate-500 w-16">Colors:</span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {selected.analysis.design_system.colors.map((c, i) => (
                                      <div key={i} className="flex items-center gap-1">
                                        <div className="w-5 h-5 rounded border border-slate-200" style={{ background: c }} />
                                        <span className="text-[10px] text-slate-500">{c}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {selected.analysis.design_system.fonts?.length > 0 && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-slate-500 w-16">Fonts:</span>
                                  <span className="text-xs text-slate-600">{selected.analysis.design_system.fonts.join(", ")}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        {selected.analysis.components?.length > 0 && (
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Components Detected</p>
                            <div className="flex flex-wrap gap-1.5">
                              {selected.analysis.components.map((c, i) => (
                                <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-medium">{c}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {selected.analysis.technologies?.length > 0 && (
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Technologies</p>
                            <div className="flex flex-wrap gap-1.5">
                              {selected.analysis.technologies.map((t, i) => (
                                <span key={i} className="text-xs bg-purple-50 text-purple-600 px-2.5 py-1 rounded-lg font-medium">{t}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </PipelineTab>
                )}

                {activeTab === "rebrand" && (
                  <PipelineTab
                    title="Rebrand Generator"
                    icon={Palette}
                    color="#8b5cf6"
                    description="Generate a complete rebrand with new name, colors, fonts, logo direction, and brand story"
                    hasData={!!selected.rebrand}
                    loading={loadingAction === "rebrand"}
                    onRun={() => runAction(PIPELINE[1])}
                    onDownload={() => downloadContent(JSON.stringify(selected.rebrand, null, 2), "rebrand.json")}
                  >
                    {selected.rebrand && (
                      <div className="space-y-4">
                        <div className="rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 p-4">
                          <p className="text-lg font-black text-slate-800">{selected.rebrand.brand_name}</p>
                          <p className="text-sm text-purple-600 font-semibold">{selected.rebrand.tagline}</p>
                        </div>
                        {selected.rebrand.color_palette?.length > 0 && (
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Color Palette</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {selected.rebrand.color_palette.map((c, i) => (
                                <div key={i} className="rounded-lg border border-slate-200 p-2 flex items-center gap-2">
                                  <div className="w-10 h-10 rounded-lg shrink-0" style={{ background: c.hex }} />
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-700 truncate">{c.name}</p>
                                    <p className="text-[10px] text-slate-400">{c.hex}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {selected.rebrand.fonts && (
                          <div className="rounded-lg border border-slate-200 p-3">
                            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Typography</p>
                            <p className="text-sm text-slate-700"><span className="font-bold">Heading:</span> {selected.rebrand.fonts.heading}</p>
                            <p className="text-sm text-slate-700"><span className="font-bold">Body:</span> {selected.rebrand.fonts.body}</p>
                          </div>
                        )}
                        {selected.rebrand.logo_direction && (
                          <div className="rounded-lg border border-slate-200 p-3">
                            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Logo Direction</p>
                            <p className="text-sm text-slate-600">{selected.rebrand.logo_direction}</p>
                          </div>
                        )}
                        {selected.rebrand.differentiators?.length > 0 && (
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Key Differentiators</p>
                            <ul className="space-y-1">
                              {selected.rebrand.differentiators.map((d, i) => (
                                <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                  <ChevronRight className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" /> {d}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {selected.rebrand.brand_story && (
                          <div className="rounded-lg border border-slate-200 p-3">
                            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Brand Story</p>
                            <p className="text-sm text-slate-600">{selected.rebrand.brand_story}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </PipelineTab>
                )}

                {activeTab === "content" && (
                  <PipelineTab
                    title="Content Generator"
                    icon={FileText}
                    color="#14b8a6"
                    description="Generate original, high-converting content for each section of the rebranded site"
                    hasData={!!selected.generated_content}
                    loading={loadingAction === "generate_content"}
                    onRun={() => runAction(PIPELINE[2])}
                    onDownload={() => downloadContent(selected.generated_content, "content.md")}
                  >
                    {selected.generated_content && (
                      <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 max-h-[60vh] overflow-y-auto">
                        <ReactMarkdown className="text-sm text-slate-700 prose prose-sm max-w-none prose-p:my-2 prose-headings:my-2 prose-h2:text-base prose-h2:font-bold prose-h2:text-slate-800">
                          {selected.generated_content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </PipelineTab>
                )}

                {activeTab === "funnel" && (
                  <PipelineTab
                    title="Funnel System Generator"
                    icon={Filter}
                    color="#f59e0b"
                    description="Generate a complete lead generation funnel with landing page, email sequence, and conversion optimization"
                    hasData={!!selected.funnel_system}
                    loading={loadingAction === "generate_funnel"}
                    onRun={() => runAction(PIPELINE[3])}
                    onDownload={() => downloadContent(selected.funnel_system?.content || "", "funnel.md")}
                  >
                    {selected.funnel_system?.content && (
                      <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 max-h-[60vh] overflow-y-auto">
                        <ReactMarkdown className="text-sm text-slate-700 prose prose-sm max-w-none prose-p:my-2 prose-headings:my-2 prose-h2:text-base prose-h2:font-bold prose-h2:text-slate-800">
                          {selected.funnel_system.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </PipelineTab>
                )}

                {activeTab === "google_scan" && (
                  <PipelineTab
                    title="Google Programmatic Scanner"
                    icon={Search}
                    color="#ef4444"
                    description="Scan against Google's requirements and generate a compliance report with requirements checklist"
                    hasData={!!selected.google_scan}
                    loading={loadingAction === "google_scan"}
                    onRun={() => runAction(PIPELINE[4])}
                    onDownload={() => downloadContent(JSON.stringify(selected.google_scan, null, 2), "google_scan.json")}
                  >
                    {selected.google_scan && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-20 rounded-full border-4 flex items-center justify-center shrink-0"
                            style={{ borderColor: selected.google_scan.overall_score >= 70 ? "#10b981" : selected.google_scan.overall_score >= 40 ? "#f59e0b" : "#ef4444" }}>
                            <span className="text-2xl font-black text-slate-700">{selected.google_scan.overall_score}</span>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-700">Overall Google Compliance Score</p>
                            <p className="text-xs text-slate-500">{selected.google_scan.summary}</p>
                          </div>
                        </div>
                        {selected.google_scan.categories?.length > 0 && (
                          <div className="space-y-2">
                            {selected.google_scan.categories.map((cat, i) => (
                              <div key={i} className="rounded-lg border border-slate-200 p-3">
                                <div className="flex items-center justify-between mb-1">
                                  <p className="text-sm font-bold text-slate-700">{cat.name}</p>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    cat.status === "pass" ? "bg-emerald-50 text-emerald-600" :
                                    cat.status === "warn" ? "bg-amber-50 text-amber-600" :
                                    "bg-red-50 text-red-600"
                                  }`}>{cat.status.toUpperCase()} · {cat.score}/100</span>
                                </div>
                                {cat.issues?.length > 0 && (
                                  <div className="mt-1.5 space-y-0.5">
                                    {cat.issues.map((iss, j) => (
                                      <p key={j} className="text-xs text-red-500 flex items-start gap-1">
                                        <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" /> {iss}
                                      </p>
                                    ))}
                                  </div>
                                )}
                                {cat.recommendations?.length > 0 && (
                                  <div className="mt-1.5 space-y-0.5">
                                    {cat.recommendations.map((rec, j) => (
                                      <p key={j} className="text-xs text-emerald-600 flex items-start gap-1">
                                        <CheckCircle className="w-3 h-3 shrink-0 mt-0.5" /> {rec}
                                      </p>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        {selected.google_scan.requirements?.length > 0 && (
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Requirements Checklist</p>
                            <div className="space-y-1.5">
                              {selected.google_scan.requirements.map((r, i) => (
                                <div key={i} className="rounded-lg border border-slate-200 p-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                      r.priority === "high" ? "bg-red-50 text-red-600" :
                                      r.priority === "medium" ? "bg-amber-50 text-amber-600" :
                                      "bg-slate-100 text-slate-500"
                                    }`}>{r.priority?.toUpperCase()}</span>
                                    <p className="text-sm font-semibold text-slate-700">{r.requirement}</p>
                                  </div>
                                  <p className="text-xs text-slate-500">{r.how_to}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </PipelineTab>
                )}

                {activeTab === "website" && (
                  <PipelineTab
                    title="Ultra High Quality Website Generator"
                    icon={Award}
                    color="#00d4ff"
                    description="Generate an award-winning, premium website blueprint that surpasses the original"
                    hasData={!!selected.website_blueprint}
                    loading={loadingAction === "generate_website"}
                    onRun={() => runAction(PIPELINE[5])}
                    onDownload={() => downloadContent(selected.website_blueprint, "website_blueprint.md")}
                  >
                    {selected.website_blueprint && (
                      <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 max-h-[60vh] overflow-y-auto">
                        <ReactMarkdown className="text-sm text-slate-700 prose prose-sm max-w-none prose-p:my-2 prose-headings:my-3 prose-h1:text-lg prose-h1:font-black prose-h1:text-slate-800 prose-h2:text-base prose-h2:font-bold prose-h2:text-slate-800 prose-h3:text-sm prose-h3:font-semibold prose-code:text-[#00d4ff] prose-code:bg-slate-100 prose-code:px-1 prose-code:rounded">
                          {selected.website_blueprint}
                        </ReactMarkdown>
                      </div>
                    )}
                  </PipelineTab>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PipelineTab({ title, icon: Icon, color, description, hasData, loading, onRun, onDownload, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
            <Icon className="w-4.5 h-4.5" style={{ color }} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">{title}</h3>
            <p className="text-xs text-slate-400">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasData && (
            <button onClick={onDownload} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition">
              <Download className="w-3.5 h-3.5" /> Download
            </button>
          )}
          <button
            onClick={onRun}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white disabled:opacity-40 hover:brightness-110 transition"
            style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)` }}
          >
            {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...</> : <><Sparkles className="w-3.5 h-3.5" /> {hasData ? "Regenerate" : "Generate"}</>}
          </button>
        </div>
      </div>
      <div className="p-5">
        {hasData ? children : (
          <div className="text-center py-10">
            <Icon className="w-8 h-8 text-slate-200 mx-auto mb-2" />
            <p className="text-sm text-slate-400">Not generated yet. Click Generate to create.</p>
          </div>
        )}
      </div>
    </div>
  );
}