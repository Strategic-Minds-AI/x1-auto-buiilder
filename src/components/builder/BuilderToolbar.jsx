import { Wand2, FileCode, Layout, Palette, Rocket, Settings, Globe, Loader2, ChevronDown } from "lucide-react";
import { useState } from "react";

export default function BuilderToolbar({ project, onGenerate, onDeploy, onNewProject, deploying }) {
  const [showPages, setShowPages] = useState(false);

  return (
    <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 z-20">
      {/* Left: Builder buttons */}
      <div className="flex items-center gap-1">
        <button onClick={onNewProject} className="inline-flex items-center gap-2 rounded-lg bg-[#00d4ff] px-4 py-2 text-sm font-bold text-[#0a0e14] hover:brightness-110 transition">
          <Wand2 className="w-4 h-4" /> Generate
        </button>
        <div className="relative">
          <button onClick={() => setShowPages(!showPages)} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition">
            <FileCode className="w-4 h-4" /> Pages <ChevronDown className="w-3 h-3" />
          </button>
          {showPages && (
            <div className="absolute top-full mt-1 left-0 w-48 rounded-xl border border-slate-200 bg-white shadow-lg py-1 z-30">
              {["Home", "About", "Services", "Contact", "Blog"].map((p) => (
                <button key={p} onClick={() => setShowPages(false)} className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">{p}</button>
              ))}
            </div>
          )}
        </div>
        <button className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition">
          <Layout className="w-4 h-4" /> Components
        </button>
        <button className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition">
          <Palette className="w-4 h-4" /> Theme
        </button>
        <button className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition">
          <Settings className="w-4 h-4" /> Settings
        </button>
      </div>

      {/* Right: Deploy + Publish */}
      <div className="flex items-center gap-2">
        {project?.status && (
          <span className="text-xs font-semibold text-slate-400 capitalize">{project.status.replace("_", " ")}</span>
        )}
        <button onClick={onDeploy} disabled={!project || deploying}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-[#00d4ff]/40 hover:text-[#00d4ff] disabled:opacity-40 transition">
          {deploying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />} Deploy
        </button>
        <button onClick={onDeploy} disabled={!project || deploying}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#00d4ff] to-[#0066ff] px-5 py-2 text-sm font-bold text-white hover:brightness-110 disabled:opacity-40 transition">
          <Globe className="w-4 h-4" /> Publish
        </button>
      </div>
    </div>
  );
}