import { useState } from "react";
import BackButton from "@/components/shared/BackButton";
import { WORKFLOW_CATALOG, WORKFLOW_CATEGORIES, GPT_SYNC_INFO } from "@/lib/workflowCatalog";
import { Link } from "react-router-dom";
import { Workflow, Search, Radio, Zap, Clock, Database, ArrowRight, CheckCircle, Pause, Code, Key } from "lucide-react";

export default function WorkflowLibrary() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = WORKFLOW_CATALOG.filter((w) => {
    const matchSearch = w.name.toLowerCase().includes(search.toLowerCase()) || w.desc.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "All" || w.category === category;
    return matchSearch && matchCategory;
  });

  const activeCount = WORKFLOW_CATALOG.filter((w) => w.status === "active").length;
  const inactiveCount = WORKFLOW_CATALOG.filter((w) => w.status === "inactive").length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <BackButton fallback="/portal" label="Back to Portal" />
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center">
              <Workflow className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Workflow Library</h1>
              <p className="text-sm text-slate-500">{WORKFLOW_CATALOG.length} automation workflows with ChatGPT bi-directional sync</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* ChatGPT Sync banner */}
        <div className="rounded-xl border border-[#00d4ff]/30 bg-gradient-to-r from-[#00d4ff]/5 to-[#0066ff]/5 p-5 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center shrink-0">
              <Radio className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-800 mb-1">ChatGPT Bi-Directional JSON Sync</h3>
              <p className="text-xs text-slate-500 mb-3">{GPT_SYNC_INFO.desc}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="rounded-lg bg-white border border-slate-200 p-2">
                  <div className="text-[10px] font-bold uppercase text-slate-400 mb-0.5">Endpoint</div>
                  <div className="text-xs font-mono text-slate-600 truncate">{GPT_SYNC_INFO.endpoint}</div>
                </div>
                <div className="rounded-lg bg-white border border-slate-200 p-2">
                  <div className="text-[10px] font-bold uppercase text-slate-400 mb-0.5">Auth</div>
                  <div className="text-xs font-mono text-slate-600 truncate">{GPT_SYNC_INFO.auth}</div>
                </div>
                <div className="rounded-lg bg-white border border-slate-200 p-2">
                  <div className="text-[10px] font-bold uppercase text-slate-400 mb-0.5">Entities</div>
                  <div className="text-xs text-slate-600">{GPT_SYNC_INFO.entities.length} synced</div>
                </div>
                <div className="rounded-lg bg-white border border-slate-200 p-2">
                  <div className="text-[10px] font-bold uppercase text-slate-400 mb-0.5">Actions</div>
                  <div className="text-xs text-slate-600">{GPT_SYNC_INFO.actions.length} types</div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Link to="/gpt-sync-logs" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-[#00d4ff] hover:border-[#00d4ff]/40 transition">
                  <Database className="w-3.5 h-3.5" /> Sync Logs
                </Link>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                  <CheckCircle className="w-3 h-3" /> Sync Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1"><Workflow className="w-3.5 h-3.5 text-blue-500" /> Total Workflows</div>
            <div className="text-2xl font-bold text-slate-800">{WORKFLOW_CATALOG.length}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Active</div>
            <div className="text-2xl font-bold text-slate-800">{activeCount}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1"><Pause className="w-3.5 h-3.5 text-amber-500" /> Inactive</div>
            <div className="text-2xl font-bold text-slate-800">{inactiveCount}</div>
          </div>
        </div>

        {/* Search + Categories */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search workflows..."
              className="w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/30" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {WORKFLOW_CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${category === cat ? "bg-[#00d4ff] text-[#0a0e14]" : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Workflow grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filtered.map((wf) => (
            <div key={wf.file} className="rounded-xl border border-slate-200 bg-white p-4 hover:border-[#00d4ff]/40 hover:shadow-sm transition">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${wf.trigger === "entity" ? "bg-[#00d4ff]/10" : "bg-purple-100"}`}>
                    {wf.trigger === "entity" ? <Zap className="w-4 h-4 text-[#00d4ff]" /> : <Clock className="w-4 h-4 text-purple-500" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{wf.name}</h3>
                    <div className="text-[10px] font-mono text-slate-400">{wf.file}.jsonc</div>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${wf.status === "active" ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}>
                  {wf.status === "active" ? <CheckCircle className="w-2.5 h-2.5" /> : <Pause className="w-2.5 h-2.5" />}
                  {wf.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-3">{wf.desc}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{wf.category}</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {wf.trigger === "entity" ? <Zap className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                  {wf.trigger}{wf.triggerEntity ? `: ${wf.triggerEntity}` : ''}
                </span>
              </div>
              {/* Steps */}
              <div className="mt-3 pt-3 border-t border-slate-100">
                <div className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">Steps</div>
                <div className="space-y-1">
                  {wf.steps.map((step, i) => (
                    <div key={step.name} className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-[#00d4ff]/10 text-[#00d4ff] text-[9px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                      <span className="text-xs text-slate-600">{step.title}</span>
                      <ArrowRight className="w-2.5 h-2.5 text-slate-300" />
                      <span className="text-[10px] font-mono text-slate-400 truncate">{step.function}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && <p className="text-center text-sm text-slate-400 py-12">No workflows match your search.</p>}
      </div>
    </div>
  );
}