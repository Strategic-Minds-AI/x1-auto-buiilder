import { useState } from "react";
import {
  ARCHITECTURE_LAYERS, REPO_RANKINGS, EMPTY_REPO_DISCOVERY,
  FACTORY_PIPELINE, EXPANSION_FOLDERS, EXPANSION_SCHEMAS,
} from "@/data/builderFactoryArchitecture";
import { Layers, GitBranch, AlertTriangle, ArrowDown, CheckCircle2, XCircle, FolderTree, Database, Rocket, Lightbulb } from "lucide-react";

export default function BuilderFactoryArchitecture() {
  const [activeTab, setActiveTab] = useState("architecture");

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0a0e14] to-[#0d1b2a] text-white">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center">
              <Layers className="w-7 h-7 text-[#0a0e14]" />
            </div>
            <div>
              <h1 className="text-2xl font-black">GPT Builder Factory — Repository Architecture</h1>
              <p className="text-sm text-white/60">Separation of concerns, not spaghetti wearing a hard hat.</p>
            </div>
          </div>
          <div className="flex gap-2 mt-4 flex-wrap">
            <TabButton active={activeTab === "architecture"} onClick={() => setActiveTab("architecture")}>Architecture</TabButton>
            <TabButton active={activeTab === "ranking"} onClick={() => setActiveTab("ranking")}>Repo Ranking</TabButton>
            <TabButton active={activeTab === "discovery"} onClick={() => setActiveTab("discovery")}>Empty Shell Discovery</TabButton>
            <TabButton active={activeTab === "expansion"} onClick={() => setActiveTab("expansion")}>Expansion Plan</TabButton>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {activeTab === "architecture" && <ArchitectureView />}
        {activeTab === "ranking" && <RankingView />}
        {activeTab === "discovery" && <DiscoveryView />}
        {activeTab === "expansion" && <ExpansionView />}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-semibold transition ${active ? "bg-[#00d4ff] text-[#0a0e14]" : "bg-white/10 text-white/70 hover:bg-white/20"}`}
    >
      {children}
    </button>
  );
}

function ArchitectureView() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Layers className="w-5 h-5 text-[#00d4ff]" />
          <h2 className="text-lg font-black text-slate-900">Layered Architecture</h2>
        </div>
        <div className="space-y-3">
          {ARCHITECTURE_LAYERS.map((layer, i) => (
            <div key={layer.name}>
              <div className={`rounded-2xl border border-slate-200 overflow-hidden`}>
                <div className={`bg-gradient-to-r ${layer.color} p-5`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                      <span className="text-white font-black text-sm">{i + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-white text-sm md:text-base">{layer.name}</h3>
                      <p className="text-xs text-white/80 mt-0.5">{layer.role}</p>
                    </div>
                  </div>
                  {layer.items.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {layer.items.map((item) => (
                        <span key={item} className="text-[11px] px-2.5 py-1 rounded-full bg-white/20 text-white font-medium">
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {i < ARCHITECTURE_LAYERS.length - 1 && (
                <div className="flex justify-center py-1">
                  <ArrowDown className="w-5 h-5 text-slate-300" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 p-6">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-black text-slate-900">Design Principle</h2>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">
          <span className="font-bold">Do not merge all repositories into one monster.</span> The meta-template
          (<code className="text-xs bg-white px-1.5 py-0.5 rounded">universal-product-factory-template</code>)
          <span className="font-bold"> selects and binds</span> the right donor repo for each project — it does not
          clone them all into itself. This gives you separation of concerns instead of spaghetti wearing a hard hat.
        </p>
      </div>
    </div>
  );
}

function RankingView() {
  const statusColors = {
    emerald: "bg-emerald-100 text-emerald-600 border-emerald-200",
    amber: "bg-amber-100 text-amber-600 border-amber-200",
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="flex items-center gap-2 p-6 border-b border-slate-100">
        <GitBranch className="w-5 h-5 text-[#00d4ff]" />
        <h2 className="text-lg font-black text-slate-900">Repository Ranking for This Mission</h2>
      </div>
      <div className="divide-y divide-slate-100">
        {REPO_RANKINGS.map((repo) => (
          <div key={repo.rank} className="flex items-center gap-4 p-4 md:p-5 hover:bg-slate-50 transition">
            <div className="text-2xl shrink-0 w-10 text-center">{repo.medal}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <code className="text-sm font-bold text-slate-900">{repo.name}</code>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${statusColors[repo.statusColor]}`}>
                  {repo.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{repo.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DiscoveryView() {
  const d = EMPTY_REPO_DISCOVERY;
  return (
    <div className="space-y-6">
      <div className="bg-amber-50 rounded-2xl border border-amber-300 p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-black text-slate-900">{d.title}</h2>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-slate-700 mb-2">
              <span className="font-bold">Repository:</span>{" "}
              <code className="text-xs bg-amber-100 px-2 py-1 rounded">{d.repo}</code>
            </p>
            <p className="text-sm text-slate-600">{d.finding}</p>
          </div>
          <div className="rounded-xl bg-[#0a0e14] p-4">
            <div className="text-[10px] text-white/40 font-mono mb-2">README.md</div>
            <p className="text-sm text-white/80 font-mono">{d.readmeContent}</p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-white p-4">
            <p className="text-sm text-slate-700 leading-relaxed">{d.conclusion}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-[#00d4ff]" />
          <h2 className="text-lg font-black text-slate-900">The Better Path</h2>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded font-bold">universal-product-factory-template</code>{" "}
          is already halfway to GPT Builder Factory. Its existing architecture already follows the right pipeline.
          We need to <span className="font-bold text-[#0066ff]">expand it upward, not replace it.</span>
        </p>
      </div>
    </div>
  );
}

function ExpansionView() {
  return (
    <div className="space-y-6">
      {/* Current pipeline */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Rocket className="w-5 h-5 text-[#00d4ff]" />
          <h2 className="text-lg font-black text-slate-900">Existing Pipeline (Already in Place)</h2>
        </div>
        <p className="text-sm text-slate-500 mb-4">The current Product Factory already follows this flow — expand it, don't replace it.</p>
        <div className="flex flex-wrap items-center gap-2">
          {FACTORY_PIPELINE.map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <span className="text-xs px-3 py-1.5 rounded-full bg-[#00d4ff]/10 text-[#0066ff] font-semibold border border-[#00d4ff]/20">
                {step}
              </span>
              {i < FACTORY_PIPELINE.length - 1 && <ArrowDown className="w-3 h-3 text-slate-300 rotate-[-90deg]" />}
            </div>
          ))}
        </div>
      </div>

      {/* Folders to add */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <FolderTree className="w-5 h-5 text-[#00d4ff]" />
          <h2 className="text-lg font-black text-slate-900">Folders to Add</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {EXPANSION_FOLDERS.map((folder) => (
            <div key={folder} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <code className="text-xs text-slate-700 font-mono">{folder}</code>
            </div>
          ))}
        </div>
      </div>

      {/* Schemas to add */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-5 h-5 text-[#00d4ff]" />
          <h2 className="text-lg font-black text-slate-900">Schemas to Add</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {EXPANSION_SCHEMAS.map((schema) => (
            <span key={schema} className="text-xs px-3 py-1.5 rounded-full bg-purple-50 text-purple-600 font-medium border border-purple-200">
              {schema}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#00d4ff]/10 to-[#0066ff]/10 rounded-2xl border border-[#00d4ff]/30 p-6">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="w-5 h-5 text-[#00d4ff]" />
          <h2 className="text-lg font-black text-slate-900">Summary</h2>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">
          Take <code className="text-xs bg-white px-1.5 py-0.5 rounded font-bold">universal-product-factory-template</code> as the canonical
          foundation. Add the 18 control-plane folders and 20 schemas. Let the meta-template select from the donor repos
          (ranked 2–7) based on project type. Do <span className="font-bold">not</span> use the empty shell (rank 8) as the
          foundation — its name is perfect but its codebase is not there yet.
        </p>
      </div>
    </div>
  );
}