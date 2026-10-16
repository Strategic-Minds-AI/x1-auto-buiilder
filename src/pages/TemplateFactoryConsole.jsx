import { useState, useEffect } from "react";
import PortalShell from "@/components/portal/PortalShell";
import PhaseProgress from "@/components/template-factory/PhaseProgress";
import BenchmarkResults from "@/components/template-factory/BenchmarkResults";
import { base44 } from "@/api/base44Client";
import {
  Factory, Loader2, Plus, Rocket, ChevronRight, Globe, Search, Star,
  CheckCircle2, XCircle, AlertTriangle, Package, Palette, Code2,
  FileText, DollarSign, Zap, Layers, ArrowRight, Eye,
} from "lucide-react";

const INDUSTRY_SUGGESTIONS = [
  "Epoxy Flooring", "HVAC", "Roofing", "Landscaping", "Dental",
  "Plumbing", "Electrician", "Law Firm", "Real Estate", "Restaurant",
  "Med Spa", "Chiropractor", "Auto Repair", "Pest Control", "Solar",
  "Insurance", "Mortgage", "Fitness", "Veterinary", "Cleaning",
];

export default function TemplateFactoryConsole() {
  const [jobs, setJobs] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);
  const [newIndustry, setNewIndustry] = useState("");
  const [newSubindustry, setNewSubindustry] = useState("");
  const [forSale, setForSale] = useState(false);
  const [price, setPrice] = useState(299);
  const [activeSection, setActiveSection] = useState("overview");

  const loadJobs = async () => {
    try {
      const page = await base44.entities.TemplateFactoryJob.filter(
        {},
        { sort: "-created_date", limit: 50 }
      );
      setJobs(page.items || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const loadJob = async (id) => {
    try {
      const job = await base44.entities.TemplateFactoryJob.get(id);
      setSelectedJob(job);
    } catch { /* ignore */ }
  };

  useEffect(() => { loadJobs(); }, []);
  useEffect(() => { if (selectedId) loadJob(selectedId); }, [selectedId]);

  const startFactory = async () => {
    if (!newIndustry.trim()) return;
    setRunning(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("autonomousTemplateFactory", {
        action: "start",
        industry: newIndustry.trim(),
        subindustry: newSubindustry.trim(),
        forSale,
        price: forSale ? price : 0,
      });
      if (res.data?.jobId) {
        setNewIndustry("");
        setNewSubindustry("");
        loadJobs();
        setSelectedId(res.data.jobId);
      }
    } catch (e) { setError(e.response?.data?.error || e.message); }
    finally { setRunning(false); }
  };

  const autoRun = async (jobId) => {
    setRunning(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("autonomousTemplateFactory", {
        action: "auto_run",
        jobId,
      });
      loadJob(jobId);
      loadJobs();
    } catch (e) { setError(e.response?.data?.error || e.message); }
    finally { setRunning(false); }
  };

  const advancePhase = async (jobId, action) => {
    setRunning(true);
    setError(null);
    try {
      await base44.functions.invoke("autonomousTemplateFactory", {
        action,
        jobId,
      });
      loadJob(jobId);
      loadJobs();
    } catch (e) { setError(e.response?.data?.error || e.message); }
    finally { setRunning(false); }
  };

  const runAllIndustries = async () => {
    setRunning(true);
    setError(null);
    try {
      for (const ind of INDUSTRY_SUGGESTIONS) {
        await base44.functions.invoke("autonomousTemplateFactory", {
          action: "start",
          industry: ind,
          forSale: true,
          price: 299,
        });
      }
      loadJobs();
    } catch (e) { setError(e.response?.data?.error || e.message); }
    finally { setRunning(false); }
  };

  const statusColor = (status) => {
    if (status === "completed") return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (status === "failed") return "text-red-600 bg-red-50 border-red-200";
    return "text-[#00d4ff] bg-[#00d4ff]/5 border-[#00d4ff]/20";
  };

  return (
    <PortalShell title="Autonomous Template Factory" activeTab="" onTabChange={() => {}} onNew={() => {}}>
      <div className="px-6 py-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center">
            <Factory className="w-5 h-5 text-[#0a0e14]" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-black text-slate-900">Autonomous Template Factory</h1>
            <p className="text-sm text-slate-500">
              Cloud Browser discovers top systems → benchmarks → reverse engineers → architects → engineers universal templates.
            </p>
          </div>
          <button
            onClick={runAllIndustries}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:text-[#00d4ff] hover:border-[#00d4ff]/40 disabled:opacity-50 transition"
          >
            <Layers className="w-4 h-4" /> Run All Industries
          </button>
        </div>

        {/* Pipeline Flow Diagram */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between gap-2 text-white">
            {[
              { icon: Search, label: "Discover", desc: "Web search top sites" },
              { icon: Star, label: "Benchmark", desc: "Score 5 dimensions" },
              { icon: Globe, label: "Capture", desc: "Cloud Browser screenshots" },
              { icon: Palette, label: "Reverse Engineer", desc: "Extract design DNA" },
              { icon: Layers, label: "Architect", desc: "Synthesize template" },
              { icon: Code2, label: "Engineer", desc: "Generate code + store" },
            ].map((step, i) => (
              <div key={i} className="flex items-center">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                    <step.icon className="w-4 h-4 text-[#00d4ff]" />
                  </div>
                  <div className="text-[10px] font-bold text-white">{step.label}</div>
                  <div className="text-[8px] text-white/40">{step.desc}</div>
                </div>
                {i < 5 && <ArrowRight className="w-3 h-3 text-white/20 mx-1" />}
              </div>
            ))}
          </div>
        </div>

        {/* Create new job */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Plus className="w-4 h-4 text-[#00d4ff]" />
            <h3 className="text-sm font-bold text-slate-700">Start New Template Factory Job</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
            <div className="md:col-span-2">
              <input
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/40"
                placeholder="Industry (e.g. Epoxy Flooring, HVAC, Dental)"
                value={newIndustry}
                onChange={(e) => setNewIndustry(e.target.value)}
                list="industry-suggestions"
              />
              <datalist id="industry-suggestions">
                {INDUSTRY_SUGGESTIONS.map((ind) => (
                  <option key={ind} value={ind} />
                ))}
              </datalist>
            </div>
            <input
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/40"
              placeholder="Sub-industry (optional)"
              value={newSubindustry}
              onChange={(e) => setNewSubindustry(e.target.value)}
            />
            <button
              onClick={startFactory}
              disabled={running || !newIndustry.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00d4ff] px-5 py-2.5 text-sm font-bold text-[#0a0e14] disabled:opacity-50 hover:brightness-110 transition"
            >
              {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
              Start Factory
            </button>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={forSale}
                onChange={(e) => setForSale(e.target.checked)}
                className="rounded"
              />
              <DollarSign className="w-3.5 h-3.5 text-slate-400" />
              List for sale
            </label>
            {forSale && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500">Price:</span>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">$</span>
                  <input
                    type="number"
                    className="w-20 rounded-lg border border-slate-200 pl-6 pr-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/40"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                  />
                </div>
              </div>
            )}
          </div>
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>

        {/* Jobs list + detail */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-[#00d4ff]" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <Factory className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No factory jobs yet. Start one above to begin.</p>
          </div>
        ) : (
          <>
            {/* Job selector */}
            <div className="flex flex-wrap gap-2 mb-6">
              {jobs.map((job) => (
                <button
                  key={job.id}
                  onClick={() => setSelectedId(job.id)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    selectedId === job.id
                      ? "bg-[#00d4ff] text-[#0a0e14]"
                      : "bg-white border border-slate-200 text-slate-600 hover:border-[#00d4ff]/40"
                  }`}
                >
                  {job.status === "completed" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                  {job.status === "failed" && <XCircle className="w-3.5 h-3.5 text-red-500" />}
                  {job.status !== "completed" && job.status !== "failed" && job.status !== "pending" && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  {job.industry}
                  {job.for_sale && <DollarSign className="w-3 h-3 text-emerald-500" />}
                </button>
              ))}
            </div>

            {/* Selected job detail */}
            {selectedJob && (
              <div className="space-y-5">
                {/* Phase progress + actions */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-700">{selectedJob.industry} {selectedJob.subindustry && `— ${selectedJob.subindustry}`}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{selectedJob.current_phase || selectedJob.status}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedJob.status !== "completed" && selectedJob.status !== "failed" && (
                        <>
                          <button
                            onClick={() => autoRun(selectedJob.id)}
                            disabled={running}
                            className="inline-flex items-center gap-1.5 rounded-full bg-[#00d4ff] px-4 py-2 text-xs font-bold text-[#0a0e14] hover:brightness-110 disabled:opacity-50 transition"
                          >
                            {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                            Auto-Run All
                          </button>
                          {selectedJob.status === "capturing" && (
                            <button onClick={() => advancePhase(selectedJob.id, "capture")} disabled={running}
                              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:text-[#00d4ff] transition">
                              <ChevronRight className="w-3.5 h-3.5" /> Capture
                            </button>
                          )}
                          {selectedJob.status === "reverse_engineering" && (
                            <button onClick={() => advancePhase(selectedJob.id, "reverse_engineer")} disabled={running}
                              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:text-[#00d4ff] transition">
                              <ChevronRight className="w-3.5 h-3.5" /> Reverse Engineer
                            </button>
                          )}
                          {selectedJob.status === "architecting" && (
                            <button onClick={() => advancePhase(selectedJob.id, "architect")} disabled={running}
                              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:text-[#00d4ff] transition">
                              <ChevronRight className="w-3.5 h-3.5" /> Architect
                            </button>
                          )}
                          {selectedJob.status === "engineering" && (
                            <button onClick={() => advancePhase(selectedJob.id, "engineer")} disabled={running}
                              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:text-[#00d4ff] transition">
                              <ChevronRight className="w-3.5 h-3.5" /> Engineer
                            </button>
                          )}
                        </>
                      )}
                      {selectedJob.status === "completed" && selectedJob.template_id && (
                        <a href={`/design-library`} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:text-[#00d4ff] transition">
                          <Eye className="w-3.5 h-3.5" /> View Template
                        </a>
                      )}
                    </div>
                  </div>
                  <PhaseProgress status={selectedJob.status} progressPct={selectedJob.progress_pct || 0} />
                  {selectedJob.error && (
                    <div className="mt-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600">
                      <AlertTriangle className="w-3.5 h-3.5 inline mr-1.5" />
                      {selectedJob.error}
                    </div>
                  )}
                </div>

                {/* Section tabs */}
                <div className="flex gap-1.5 flex-wrap">
                  <SectionTab active={activeSection === "overview"} onClick={() => setActiveSection("overview")} icon={Package}>Overview</SectionTab>
                  <SectionTab active={activeSection === "discovered"} onClick={() => setActiveSection("discovered")} icon={Search}>Discovered ({selectedJob.discovered_sites?.length || 0})</SectionTab>
                  <SectionTab active={activeSection === "benchmarks"} onClick={() => setActiveSection("benchmarks")} icon={Star}>Benchmarks ({selectedJob.benchmark_results?.length || 0})</SectionTab>
                  <SectionTab active={activeSection === "patterns"} onClick={() => setActiveSection("patterns")} icon={Palette}>Patterns ({selectedJob.reverse_engineered?.length || 0})</SectionTab>
                  <SectionTab active={activeSection === "architecture"} onClick={() => setActiveSection("architecture")} icon={Layers}>Architecture</SectionTab>
                  <SectionTab active={activeSection === "output"} onClick={() => setActiveSection("output")} icon={Code2}>Template Output</SectionTab>
                </div>

                {/* Overview */}
                {activeSection === "overview" && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <StatCard icon={Search} label="Sites Discovered" value={selectedJob.discovered_sites?.length || 0} />
                    <StatCard icon={Star} label="Sites Benchmarked" value={selectedJob.benchmark_results?.length || 0} />
                    <StatCard icon={Palette} label="Patterns Extracted" value={selectedJob.reverse_engineered?.length || 0} />
                    <StatCard icon={CheckCircle2} label="Quality Score" value={selectedJob.quality_score ? `${selectedJob.quality_score}/100` : "—"} />
                    {selectedJob.for_sale && (
                      <StatCard icon={DollarSign} label="List Price" value={`$${selectedJob.price || 0}`} />
                    )}
                    {selectedJob.template_id && (
                      <StatCard icon={Package} label="Template Stored" value="Yes" />
                    )}
                  </div>
                )}

                {/* Discovered sites */}
                {activeSection === "discovered" && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-5">
                    <div className="space-y-2">
                      {(selectedJob.discovered_sites || []).map((site, i) => (
                        <div key={i} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3">
                          <span className="text-xs font-bold text-slate-400 w-6">#{site.rank || i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-slate-700">{site.title}</div>
                            <a href={site.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#00d4ff] hover:underline">{site.url}</a>
                            <p className="text-xs text-slate-400 mt-0.5">{site.description}</p>
                          </div>
                        </div>
                      ))}
                      {!selectedJob.discovered_sites?.length && <p className="text-sm text-slate-400 text-center py-4">No sites discovered yet.</p>}
                    </div>
                  </div>
                )}

                {/* Benchmarks */}
                {activeSection === "benchmarks" && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-5">
                    <BenchmarkResults benchmarks={selectedJob.benchmark_results} />
                    {!selectedJob.benchmark_results?.length && <p className="text-sm text-slate-400 text-center py-4">No benchmarks yet.</p>}
                  </div>
                )}

                {/* Reverse-engineered patterns */}
                {activeSection === "patterns" && (
                  <div className="space-y-3">
                    {(selectedJob.reverse_engineered || []).map((re, i) => (
                      <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Globe className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-bold text-slate-700 truncate">{re.url}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {re.color_palette?.length > 0 && (
                            <div>
                              <div className="text-xs font-bold text-slate-500 mb-1.5">Color Palette</div>
                              <div className="flex gap-1.5">
                                {re.color_palette.map((color, j) => (
                                  <div key={j} className="w-8 h-8 rounded-lg border border-slate-200" style={{ backgroundColor: color }} title={color} />
                                ))}
                              </div>
                            </div>
                          )}
                          {re.component_patterns?.length > 0 && (
                            <div>
                              <div className="text-xs font-bold text-slate-500 mb-1.5">Component Patterns</div>
                              <div className="flex flex-wrap gap-1.5">
                                {re.component_patterns.map((p, j) => (
                                  <span key={j} className="text-[10px] px-2 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">{p.name}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        {re.design_system && (
                          <div className="mt-3 text-xs text-slate-500">
                            <span className="font-bold">Design System:</span> {JSON.stringify(re.design_system).substring(0, 200)}...
                          </div>
                        )}
                      </div>
                    ))}
                    {!selectedJob.reverse_engineered?.length && <p className="text-sm text-slate-400 text-center py-4">No patterns extracted yet.</p>}
                  </div>
                )}

                {/* Architecture */}
                {activeSection === "architecture" && selectedJob.architecture && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                    <div>
                      <h3 className="text-lg font-black text-slate-900">{selectedJob.architecture.template_name}</h3>
                      <p className="text-sm text-slate-500 mt-1">{selectedJob.architecture.description}</p>
                    </div>
                    {selectedJob.architecture.design_tokens && (
                      <div>
                        <div className="text-xs font-bold text-slate-500 mb-2">Design Tokens</div>
                        <pre className="text-xs bg-slate-50 rounded-lg p-3 overflow-x-auto max-h-48">{JSON.stringify(selectedJob.architecture.design_tokens, null, 2)}</pre>
                      </div>
                    )}
                    {selectedJob.architecture.component_tree && (
                      <div>
                        <div className="text-xs font-bold text-slate-500 mb-2">Component Tree ({selectedJob.architecture.component_tree.length} components)</div>
                        <pre className="text-xs bg-slate-50 rounded-lg p-3 overflow-x-auto max-h-48">{JSON.stringify(selectedJob.architecture.component_tree, null, 2).substring(0, 2000)}</pre>
                      </div>
                    )}
                    {selectedJob.architecture.content_structure?.sections && (
                      <div>
                        <div className="text-xs font-bold text-slate-500 mb-2">Content Sections</div>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedJob.architecture.content_structure.sections.map((s, i) => (
                            <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-[#00d4ff]/10 text-[#00d4ff] font-medium">{s.name}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {activeSection === "architecture" && !selectedJob.architecture && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                    <Layers className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">Architecture not generated yet.</p>
                  </div>
                )}

                {/* Template output */}
                {activeSection === "output" && selectedJob.template_output && (
                  <div className="space-y-4">
                    {selectedJob.template_output.documentation && (
                      <div className="bg-white rounded-2xl border border-slate-200 p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4 text-[#00d4ff]" />
                          <h3 className="text-sm font-bold text-slate-700">Documentation</h3>
                        </div>
                        <pre className="text-xs bg-slate-50 rounded-lg p-3 overflow-x-auto max-h-64 whitespace-pre-wrap">{selectedJob.template_output.documentation.substring(0, 3000)}</pre>
                      </div>
                    )}
                    {selectedJob.template_output.variables?.length > 0 && (
                      <div className="bg-white rounded-2xl border border-slate-200 p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <Code2 className="w-4 h-4 text-[#00d4ff]" />
                          <h3 className="text-sm font-bold text-slate-700">Template Variables ({selectedJob.template_output.variables.length})</h3>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedJob.template_output.variables.map((v, i) => (
                            <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-mono font-bold">
                              {`{{${v.key}}}`}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedJob.template_output.files?.length > 0 && (
                      <div className="bg-white rounded-2xl border border-slate-200 p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <Package className="w-4 h-4 text-[#00d4ff]" />
                          <h3 className="text-sm font-bold text-slate-700">Generated Files ({selectedJob.template_output.files.length})</h3>
                        </div>
                        <div className="space-y-1">
                          {selectedJob.template_output.files.map((f, i) => (
                            <div key={i} className="text-xs font-mono text-slate-600 bg-slate-50 rounded-lg px-3 py-1.5">
                              {f.path}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {activeSection === "output" && !selectedJob.template_output && (
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                    <Code2 className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">Template not engineered yet.</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </PortalShell>
  );
}

function SectionTab({ active, onClick, icon: Icon, children }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
        active ? "bg-[#00d4ff] text-[#0a0e14]" : "bg-white border border-slate-200 text-slate-500 hover:border-[#00d4ff]/40"
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {children}
    </button>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <Icon className="w-5 h-5 text-slate-300 mb-2" />
      <div className="text-xl font-black text-slate-700">{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}