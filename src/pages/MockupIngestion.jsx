import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import BackButton from "@/components/shared/BackButton";
import {
  Upload, Loader2, Scan, Code2, Palette, Type, Layout, Layers,
  CheckCircle, AlertCircle, Eye, Sparkles, Copy, Check
} from "lucide-react";

export default function MockupIngestion() {
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [projectName, setProjectName] = useState("");
  const [industry, setIndustry] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [codeBlueprint, setCodeBlueprint] = useState(null);
  const [error, setError] = useState(null);
  const [projects, setProjects] = useState([]);
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const loadProjects = async () => {
    try {
      const page = await base44.entities.MockupProject.filter({}, { sort: "-created_date", limit: 20 });
      setProjects(page.items || []);
    } catch {}
  };

  useEffect(() => { loadProjects(); }, []);

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    setAnalysis(null);
    setCodeBlueprint(null);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      setImageUrl(file_url);
    } catch (err) {
      setError("Upload failed: " + (err.message || "unknown error"));
    } finally { setUploading(false); }
  };

  const handleAnalyze = async () => {
    if (!imageUrl) return;
    setAnalyzing(true);
    setError(null);
    try {
      // Create project record
      const project = await base44.entities.MockupProject.create({
        name: projectName || "Untitled Mockup",
        image_url: imageUrl,
        status: "scanning",
        industry: industry || "",
      });

      // Call the ingestMockup backend function
      const res = await base44.functions.invoke("ingestMockup", {
        image_url: imageUrl,
        mockupProjectId: project.id,
        industry: industry || "",
      });

      setAnalysis(res.data?.analysis || null);
      setCodeBlueprint(res.data?.codeBlueprint || null);
      loadProjects();
    } catch (err) {
      setError("Analysis failed: " + (err.response?.data?.error || err.message || "unknown error"));
    } finally { setAnalyzing(false); }
  };

  const copyCode = () => {
    if (!codeBlueprint) return;
    navigator.clipboard.writeText(JSON.stringify(codeBlueprint, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="portal-light min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton />
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <Scan className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Mock-up Ingestion System</h1>
            <p className="text-sm text-slate-500">Upload a design mock-up — AI scans it pixel by pixel and generates a code blueprint</p>
          </div>
        </div>

        {/* Upload area */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 mb-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            className={`rounded-xl border-2 border-dashed p-8 text-center transition ${dragOver ? "border-[#00d4ff] bg-[#00d4ff]/5" : "border-slate-200"}`}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#00d4ff]" />
                <p className="text-sm text-slate-500">Uploading image...</p>
              </div>
            ) : imageUrl ? (
              <div className="flex flex-col items-center gap-3">
                <img src={imageUrl} alt="Mock-up" className="max-h-48 rounded-lg border border-slate-200" />
                <p className="text-xs text-emerald-600 font-semibold">Image uploaded successfully</p>
                <button onClick={() => setImageUrl(null)} className="text-xs text-slate-400 hover:text-red-500">Remove</button>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center gap-3">
                <Upload className="w-8 h-8 text-slate-300" />
                <p className="text-sm text-slate-500">Drag & drop a mock-up image here, or click to browse</p>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
              </label>
            )}
          </div>
        </div>

        {/* Project info + analyze button */}
        {imageUrl && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 mb-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Project Name</label>
                <input className="dd-input" placeholder="e.g. Epoxy Flooring Landing Page" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Industry</label>
                <input className="dd-input" placeholder="e.g. Home Improvement" value={industry} onChange={(e) => setIndustry(e.target.value)} />
              </div>
            </div>
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-3 text-sm font-bold text-white disabled:opacity-50 hover:brightness-110 transition"
            >
              {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {analyzing ? "Scanning pixel by pixel..." : "Analyze & Generate Code Blueprint"}
            </button>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          </div>
        )}

        {/* Analysis results */}
        {analysis && (
          <div className="space-y-4">
            {/* Summary */}
            {analysis.summary && (
              <div className="rounded-2xl border border-purple-200 bg-purple-50 p-5">
                <div className="flex items-start gap-3">
                  <Scan className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 mb-1">Analysis Summary</h3>
                    <p className="text-sm text-slate-600">{analysis.summary}</p>
                    {analysis.componentCount && (
                      <p className="text-xs text-purple-500 mt-1 font-semibold">{analysis.componentCount} components detected</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Colors */}
            {analysis.colors && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Palette className="w-4 h-4 text-[#00d4ff]" />
                  <h3 className="text-sm font-bold text-slate-700">Color Palette</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(analysis.colors).filter(([, v]) => v && typeof v === "string").map(([key, val]) => (
                    <div key={key} className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg border border-slate-200" style={{ background: val.startsWith("#") ? val : "#fff" }} />
                      <div>
                        <div className="text-xs font-semibold text-slate-600">{key}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{val}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Typography */}
            {analysis.typography && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Type className="w-4 h-4 text-[#00d4ff]" />
                  <h3 className="text-sm font-bold text-slate-700">Typography</h3>
                </div>
                <pre className="text-xs text-slate-600 bg-slate-50 rounded-lg p-3 overflow-x-auto">{JSON.stringify(analysis.typography, null, 2)}</pre>
              </div>
            )}

            {/* Sections */}
            {analysis.sections && analysis.sections.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Layout className="w-4 h-4 text-[#00d4ff]" />
                  <h3 className="text-sm font-bold text-slate-700">Sections ({analysis.sections.length})</h3>
                </div>
                <div className="space-y-2">
                  {analysis.sections.map((s, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-lg border border-slate-100 p-3">
                      <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                      <div>
                        <div className="text-sm font-semibold text-slate-700">{s.name || s.title || `Section ${i + 1}`}</div>
                        {s.purpose && <p className="text-xs text-slate-500 mt-0.5">{s.purpose}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Components */}
            {analysis.components && analysis.components.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="w-4 h-4 text-[#00d4ff]" />
                  <h3 className="text-sm font-bold text-slate-700">Components ({analysis.components.length})</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {analysis.components.map((c, i) => (
                    <div key={i} className="rounded-lg border border-slate-100 p-2">
                      <div className="text-xs font-semibold text-slate-600">{c.name || c.type || `Component ${i + 1}`}</div>
                      <div className="text-[10px] text-slate-400">{c.type || ""}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Code Blueprint */}
        {codeBlueprint && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 mt-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[#00d4ff]" />
                <h3 className="text-sm font-bold text-slate-700">Generated Code Blueprint</h3>
              </div>
              <button onClick={copyCode} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-[#00d4ff] transition">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy JSON"}
              </button>
            </div>
            {codeBlueprint.componentTree && (
              <div className="mb-3">
                <div className="text-xs font-bold text-slate-400 uppercase mb-2">Component Tree</div>
                <pre className="text-xs text-slate-600 bg-slate-50 rounded-lg p-3 overflow-x-auto max-h-48">{JSON.stringify(codeBlueprint.componentTree, null, 2)}</pre>
              </div>
            )}
            {codeBlueprint.colorTokens && (
              <div className="mb-3">
                <div className="text-xs font-bold text-slate-400 uppercase mb-2">Color Tokens</div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(codeBlueprint.colorTokens).map(([k, v]) => (
                    <span key={k} className="text-xs rounded-md bg-slate-100 px-2 py-1 font-mono text-slate-600">{k}: {v}</span>
                  ))}
                </div>
              </div>
            )}
            {codeBlueprint.estimatedLines && (
              <div className="text-xs text-slate-400">Estimated ~{codeBlueprint.estimatedLines} lines of code</div>
            )}
          </div>
        )}

        {/* Previous projects */}
        {projects.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-bold text-slate-700 mb-3">Previous Mock-up Projects</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {projects.map((p) => (
                <div key={p.id} className="rounded-xl border border-slate-200 overflow-hidden hover:border-[#00d4ff]/40 transition cursor-pointer">
                  <img src={p.image_url} alt={p.name} className="w-full h-32 object-cover" />
                  <div className="p-2">
                    <div className="text-xs font-semibold text-slate-700 truncate">{p.name}</div>
                    <div className="text-[10px] text-slate-400">{p.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}