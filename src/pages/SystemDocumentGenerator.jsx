import { useState, useEffect } from "react";
import PortalShell from "@/components/portal/PortalShell";
import ReactMarkdown from "react-markdown";
import { base44 } from "@/api/base44Client";
import {
  FileText, Loader2, Sparkles, Copy, Check, Download, Package,
  BookOpen, Code, Database, Shield, Rocket, Wrench, Globe,
} from "lucide-react";

const SECTION_ICONS = {
  SYSTEM_OVERVIEW: BookOpen,
  ARCHITECTURE: Package,
  FEATURES: Sparkles,
  TECHNICAL_SPECS: Code,
  COMPONENT_INVENTORY: Code,
  DEPLOYMENT_GUIDE: Rocket,
  API_REFERENCE: Database,
  SECURITY: Shield,
  TESTING: Check,
  MAINTENANCE: Wrench,
  APPENDIX: FileText,
};

export default function SystemDocumentGenerator() {
  const [projectName, setProjectName] = useState("");
  const [pipelineRuns, setPipelineRuns] = useState([]);
  const [selectedRunId, setSelectedRunId] = useState("");
  const [generating, setGenerating] = useState(false);
  const [doc, setDoc] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [savedDocs, setSavedDocs] = useState([]);

  const loadRuns = async () => {
    try {
      const page = await base44.entities.PipelineRun.filter({}, { sort: "-created_date", limit: 20 });
      setPipelineRuns(page.items || []);
    } catch { }
  };

  const loadDocs = async () => {
    try {
      const page = await base44.entities.SystemDocument.filter({}, { sort: "-created_date", limit: 10 });
      setSavedDocs(page.items || []);
    } catch { }
  };

  useEffect(() => { loadRuns(); loadDocs(); }, []);

  const generate = async () => {
    if (!projectName.trim()) return;
    setGenerating(true);
    setError(null);
    setDoc(null);
    try {
      const res = await base44.functions.invoke("generateSystemDocument", {
        projectName: projectName.trim(),
        pipelineRunId: selectedRunId || undefined,
        docType: "full_package",
      });
      setDoc(res.data);
      loadDocs();
    } catch (e) { setError(e.response?.data?.error || e.message); }
    finally { setGenerating(false); }
  };

  const copyMarkdown = () => {
    if (!doc?.contentMarkdown) return;
    navigator.clipboard.writeText(doc.contentMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadMarkdown = () => {
    if (!doc?.contentMarkdown) return;
    const blob = new Blob([doc.contentMarkdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, "-").toLowerCase()}-system-docs.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PortalShell title="System Document Generator" activeTab="" onTabChange={() => {}} onNew={() => {}}>
      <div className="px-6 py-8 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
            <FileText className="w-5 h-5 text-[#00d4ff]" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">Production-Grade Document Generator</h1>
            <p className="text-sm text-slate-500">OpenAI-standard system documentation package: specs, architecture, API, deployment, security.</p>
          </div>
        </div>

        {/* Generate form */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-4 h-4 text-[#00d4ff]" />
            <h3 className="text-sm font-bold text-slate-700">Generate Documentation Package</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <input
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/40"
              placeholder="System / project name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
            <select
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/40"
              value={selectedRunId}
              onChange={(e) => setSelectedRunId(e.target.value)}
            >
              <option value="">— Link to Pipeline Run (optional) —</option>
              {pipelineRuns.map((run) => (
                <option key={run.id} value={run.id}>{run.project_name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={generate}
            disabled={generating || !projectName.trim()}
            className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50 hover:bg-slate-700 transition"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {generating ? "Generating Production-Grade Docs..." : "Generate Full Package"}
          </button>
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>

        {/* Generated document */}
        {doc && (
          <div className="space-y-4">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black">{doc.systemName}</h2>
                  <p className="text-sm text-white/60 mt-1">{doc.description}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={copyMarkdown} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-2 text-xs font-bold hover:bg-white/20 transition">
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied" : "Copy MD"}
                  </button>
                  <button onClick={downloadMarkdown} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-2 text-xs font-bold hover:bg-white/20 transition">
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                </div>
              </div>
            </div>

            {/* Section navigation + content */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Section nav */}
              <div className="md:col-span-1">
                <div className="bg-white rounded-2xl border border-slate-200 p-3 sticky top-4">
                  <div className="text-xs font-bold text-slate-400 uppercase mb-2 px-2">Sections</div>
                  <div className="space-y-0.5">
                    {doc.sections?.map((section, i) => {
                      const Icon = SECTION_ICONS[section.title?.replace(/\s+/g, "_").toUpperCase()] || FileText;
                      return (
                        <button
                          key={i}
                          onClick={() => setActiveSection(i)}
                          className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold transition text-left ${
                            activeSection === i ? "bg-[#00d4ff]/10 text-[#00d4ff]" : "text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{section.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Section content */}
              <div className="md:col-span-3">
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  {doc.sections?.[activeSection] && (
                    <>
                      <h3 className="text-lg font-black text-slate-900 mb-3">{doc.sections[activeSection].title}</h3>
                      <div className="prose prose-slate max-w-none prose-headings:font-bold prose-code:bg-slate-100 prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[#0066ff] prose-pre:bg-slate-900 prose-pre:text-slate-100">
                        <ReactMarkdown>{doc.sections[activeSection].content || ""}</ReactMarkdown>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Saved documents */}
        {savedDocs.length > 0 && !doc && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="text-sm font-bold text-slate-700 mb-3">Previously Generated Documents</h3>
            <div className="space-y-2">
              {savedDocs.map((d) => (
                <div key={d.id} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3">
                  <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-slate-700">{d.system_name || d.project_name}</div>
                    <div className="text-xs text-slate-400">{d.doc_type} — v{d.version}</div>
                  </div>
                  <button
                    onClick={() => setDoc({
                      systemName: d.system_name,
                      description: d.description,
                      sections: d.sections,
                      contentMarkdown: d.content_markdown,
                    })}
                    className="text-xs font-bold text-[#00d4ff] hover:underline"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PortalShell>
  );
}