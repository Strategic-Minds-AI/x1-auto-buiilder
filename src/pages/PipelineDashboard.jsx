import { useState, useEffect } from "react";
import PortalShell from "@/components/portal/PortalShell";
import VisualPipelineTimeline from "@/components/pipeline/VisualPipelineTimeline";
import ReconcilerPanel from "@/components/pipeline/ReconcilerPanel";
import WorkPacketView from "@/components/pipeline/WorkPacketView";
import ApprovalQueue from "@/components/pipeline/ApprovalQueue";
import IndustryLibraryBrowser from "@/components/pipeline/IndustryLibraryBrowser";
import { base44 } from "@/api/base44Client";
import { AGENT_ASSIGNMENTS, AGENT_MAP } from "@/data/agentAssignments";
import { PIPELINE_STAGES } from "@/data/pipelineStages";
import {
  Rocket, Loader2, Upload, Plus, ChevronRight, Bot, Shield, Wrench,
  CheckCircle2, XCircle, AlertTriangle, FileText, Table, Globe, Activity,
  Layers, Library, Package, ShieldCheck,
} from "lucide-react";

export default function PipelineDashboard() {
  const [runs, setRuns] = useState([]);
  const [selectedRun, setSelectedRun] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [newName, setNewName] = useState("");
  const [newClient, setNewClient] = useState("");
  const [mockupUrl, setMockupUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState("pipeline");

  const loadRuns = async () => {
    try {
      const page = await base44.entities.PipelineRun.filter({}, { sort: "-created_date", limit: 50 });
      setRuns(page.items || []);
    } catch { }
    finally { setLoading(false); }
  };

  const loadRun = async (id) => {
    try {
      const run = await base44.entities.PipelineRun.get(id);
      setSelectedRun(run);
    } catch { }
  };

  useEffect(() => { loadRuns(); }, []);
  useEffect(() => { if (selectedRun?.id) loadRun(selectedRun.id); }, [selectedRun?.id]);

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      setMockupUrl(file_url);
    } catch (e) { setError("Upload failed: " + e.message); }
    finally { setUploading(false); }
  };

  const createPipeline = async () => {
    if (!newName.trim() || !mockupUrl) return;
    setCreating(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("mockupToSystemPipeline", {
        mockupUrl,
        projectName: newName.trim(),
        clientName: newClient.trim(),
        autoLaunch: true,
      });
      if (res.data?.pipelineRun) {
        setNewName("");
        setNewClient("");
        setMockupUrl("");
        loadRuns();
        loadRun(res.data.pipelineRun.id);
      }
    } catch (e) { setError(e.response?.data?.error || e.message); }
    finally { setCreating(false); }
  };

  const advancePipeline = async () => {
    if (!selectedRun) return;
    setAdvancing(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("mockupToSystemPipeline", {
        pipelineRunId: selectedRun.id,
        action: "auto_run",
      });
      if (res.data?.pipelineRun) {
        setSelectedRun(res.data.pipelineRun);
        loadRuns();
      }
    } catch (e) { setError(e.response?.data?.error || e.message); }
    finally { setAdvancing(false); }
  };

  const syncToSheets = async () => {
    if (!selectedRun) return;
    try {
      await base44.functions.invoke("syncGoogleSheet", {
        sheetId: "pipeline-tracking",
        data: {
          project_name: selectedRun.project_name,
          status: selectedRun.status,
          current_stage: selectedRun.current_stage,
          deploy_url: selectedRun.deploy_url || "",
          parity_score: selectedRun.parity_score || 0,
        },
      });
    } catch (e) { setError("Sheets sync failed: " + (e.response?.data?.error || e.message)); }
  };

  const generateDoc = async () => {
    if (!selectedRun) return;
    try {
      const res = await base44.functions.invoke("generateSystemDocument", {
        projectName: selectedRun.project_name,
        pipelineRunId: selectedRun.id,
        docType: "full_package",
      });
      if (res.data?.documentId) {
        window.open(`/system-docs?doc=${res.data.documentId}`, "_blank");
      }
    } catch (e) { setError("Doc generation failed: " + (e.response?.data?.error || e.message)); }
  };

  return (
    <PortalShell title="Autonomous Pipeline Dashboard" activeTab="" onTabChange={() => {}} onNew={() => {}}>
      <div className="px-6 py-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center">
            <Rocket className="w-5 h-5 text-[#0a0e14]" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-black text-slate-900">Autonomous Pipeline Dashboard</h1>
            <p className="text-sm text-slate-500">X1 Control Plane — risk-gated packets, evidence-based validation, approval gates, and 4,000 pre-scored build targets.</p>
          </div>
          {/* View tabs */}
          <div className="flex gap-1.5">
            <ViewTab active={activeView === "pipeline"} onClick={() => setActiveView("pipeline")} icon={Rocket}>Pipeline</ViewTab>
            <ViewTab active={activeView === "x1"} onClick={() => setActiveView("x1")} icon={Layers}>X1 Control Plane</ViewTab>
            <ViewTab active={activeView === "library"} onClick={() => setActiveView("library")} icon={Library}>Industry Library</ViewTab>
          </div>
        </div>

        {activeView === "pipeline" && (
        <>
        {/* Create new pipeline */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Plus className="w-4 h-4 text-[#00d4ff]" />
            <h3 className="text-sm font-bold text-slate-700">Start New Pipeline from Mockup</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <input
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/40"
              placeholder="Project name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <input
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/40"
              placeholder="Client name (optional)"
              value={newClient}
              onChange={(e) => setNewClient(e.target.value)}
            />
            <div className="flex gap-2">
              {mockupUrl ? (
                <div className="flex items-center gap-2 flex-1">
                  <img src={mockupUrl} alt="Mockup" className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                  <button onClick={() => setMockupUrl("")} className="text-xs text-red-500 font-bold">Remove</button>
                </div>
              ) : (
                <label className={`flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-2.5 cursor-pointer transition ${uploading ? "border-[#00d4ff] bg-[#00d4ff]/5" : "border-slate-200 hover:border-[#00d4ff]/40"}`}>
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin text-[#00d4ff]" /> : <Upload className="w-4 h-4 text-slate-400" />}
                  <span className="text-xs text-slate-500">{uploading ? "Uploading..." : "Upload mockup"}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e.target.files[0])} />
                </label>
              )}
            </div>
          </div>
          <button
            onClick={createPipeline}
            disabled={creating || !newName.trim() || !mockupUrl}
            className="inline-flex items-center gap-2 rounded-full bg-[#00d4ff] px-5 py-2.5 text-sm font-bold text-[#0a0e14] disabled:opacity-50 hover:brightness-110 transition"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
            Launch Pipeline
          </button>
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>

        {/* Pipeline runs list */}
        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#00d4ff]" /></div>
        ) : runs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <Rocket className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No pipelines yet. Upload a mockup above to start.</p>
          </div>
        ) : (
          <>
            {/* Run selector */}
            <div className="flex flex-wrap gap-2 mb-6">
              {runs.map((run) => (
                <button
                  key={run.id}
                  onClick={() => loadRun(run.id)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    selectedRun?.id === run.id
                      ? "bg-[#00d4ff] text-[#0a0e14]"
                      : "bg-white border border-slate-200 text-slate-600 hover:border-[#00d4ff]/40"
                  }`}
                >
                  {run.status === "live" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                  {run.status === "failed" && <XCircle className="w-3.5 h-3.5 text-red-500" />}
                  {run.status === "processing" && <Loader2 className="w-3.5 h-3.5 text-[#00d4ff] animate-spin" />}
                  {run.project_name}
                  <span className="text-xs opacity-60">{run.current_stage_index + 1}/15</span>
                </button>
              ))}
            </div>

            {/* Selected run detail */}
            {selectedRun && (
              <>
                {/* Visual Timeline */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-700">Pipeline Timeline — {selectedRun.project_name}</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={advancePipeline}
                        disabled={advancing || selectedRun.status === "live"}
                        className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700 disabled:opacity-50 transition"
                      >
                        {advancing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        Advance Pipeline
                      </button>
                      <button onClick={syncToSheets} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:text-[#00d4ff] transition">
                        <Table className="w-3.5 h-3.5" /> Sync to Sheets
                      </button>
                      <button onClick={generateDoc} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:text-[#00d4ff] transition">
                        <FileText className="w-3.5 h-3.5" /> Generate Docs
                      </button>
                    </div>
                  </div>
                  <VisualPipelineTimeline
                    stages={selectedRun.stages || []}
                    currentStageIndex={selectedRun.current_stage_index || 0}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Agent assignments */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Bot className="w-4 h-4 text-[#00d4ff]" />
                      <h3 className="text-sm font-bold text-slate-700">Agent Assignments</h3>
                    </div>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {AGENT_ASSIGNMENTS.filter(a => a.pipelineStage).map((agent) => {
                        const stage = selectedRun.stages?.find(s => s.agent === agent.id);
                        const isActive = stage?.status === "IN_PROGRESS";
                        const isDone = stage?.status === "COMPLETED";
                        return (
                          <div key={agent.id} className={`rounded-lg border p-2.5 flex items-center gap-2.5 ${isActive ? "border-[#00d4ff] bg-[#00d4ff]/5" : isDone ? "border-emerald-200 bg-emerald-50/50" : "border-slate-100"}`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isActive ? "bg-[#00d4ff]/20" : isDone ? "bg-emerald-100" : "bg-slate-100"}`}>
                              <Bot className={`w-4 h-4 ${isActive ? "text-[#00d4ff]" : isDone ? "text-emerald-600" : "text-slate-400"}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-slate-700">{agent.position}</div>
                              <div className="text-[10px] text-slate-400 truncate">{agent.name}</div>
                            </div>
                            {isActive && <Loader2 className="w-3.5 h-3.5 text-[#00d4ff] animate-spin shrink-0" />}
                            {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Final checklist + deploy info */}
                  <div className="space-y-4">
                    {/* Deploy info */}
                    {selectedRun.deploy_url && (
                      <div className="bg-white rounded-2xl border border-slate-200 p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <Globe className="w-4 h-4 text-emerald-500" />
                          <h3 className="text-sm font-bold text-slate-700">Live Deployment</h3>
                        </div>
                        <a href={selectedRun.deploy_url} target="_blank" rel="noopener noreferrer" className="text-sm text-[#00d4ff] font-semibold hover:underline break-all">
                          {selectedRun.deploy_url}
                        </a>
                        {selectedRun.parity_score > 0 && (
                          <div className="mt-2 text-xs text-slate-500">Visual Parity Score: <span className="font-bold text-slate-700">{selectedRun.parity_score}/100</span></div>
                        )}
                      </div>
                    )}

                    {/* Final checklist */}
                    {selectedRun.final_checklist?.length > 0 && (
                      <div className="bg-white rounded-2xl border border-slate-200 p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <Shield className="w-4 h-4 text-amber-500" />
                          <h3 className="text-sm font-bold text-slate-700">Final Pre-Launch Checklist</h3>
                        </div>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto">
                          {selectedRun.final_checklist.map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs">
                              {item.status === "PASS" ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> :
                               item.status === "FAIL" ? <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" /> :
                               <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                              <span className="text-slate-600">{item.item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Backend status */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-4 h-4 text-slate-400" />
                        <h3 className="text-sm font-bold text-slate-700">System Status</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-lg bg-slate-50 p-2">
                          <div className="text-slate-400">Backend</div>
                          <div className="font-bold text-slate-700">{selectedRun.backend_needed ? "Required" : "Static"}</div>
                        </div>
                        <div className="rounded-lg bg-slate-50 p-2">
                          <div className="text-slate-400">Stages Done</div>
                          <div className="font-bold text-slate-700">{selectedRun.current_stage_index || 0}/15</div>
                        </div>
                        {selectedRun.github_repo && <div className="rounded-lg bg-slate-50 p-2"><div className="text-slate-400">GitHub</div><div className="font-bold text-emerald-600">Connected</div></div>}
                        {selectedRun.supabase_ref && <div className="rounded-lg bg-slate-50 p-2"><div className="text-slate-400">Supabase</div><div className="font-bold text-emerald-600">Provisioned</div></div>}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
          )}
          </>
          )}

          {/* X1 Control Plane View */}
          {activeView === "x1" && (
          <div className="space-y-6">
           {/* X1 Architecture banner */}
           <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-5 text-white">
             <div className="flex items-center gap-3 mb-2">
               <ShieldCheck className="w-5 h-5 text-[#00d4ff]" />
               <h2 className="text-sm font-bold">X1 Control Plane — 10 Required Invariants</h2>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-3">
               {["No secrets in prompts", "No unverified assets to builders", "No ambiguous build requests", "No builder self-approval", "No concurrent writers", "No UNKNOWN as PASS", "No production without approval", "No success without evidence", "No unprotected destructive ops", "No silent failures"].map((inv, i) => (
                 <div key={i} className="rounded-lg bg-white/5 border border-white/10 px-2.5 py-1.5 text-[10px] font-semibold text-white/70">
                   {inv}
                 </div>
               ))}
             </div>
           </div>

           {/* Reconciler + Approval Queue */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <ReconcilerPanel />
             <ApprovalQueue />
           </div>

           {/* Work Packets for selected run */}
           {selectedRun ? (
             <WorkPacketView pipelineRunId={selectedRun.id} />
           ) : (
             <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center">
               <Package className="w-8 h-8 text-slate-200 mx-auto mb-2" />
               <p className="text-xs text-slate-400">Select a pipeline run from the Pipeline tab to view its work packets.</p>
             </div>
           )}
          </div>
          )}

          {/* Industry Library View */}
          {activeView === "library" && (
          <IndustryLibraryBrowser />
          )}
          </div>
          </PortalShell>
          );
          }

          function ViewTab({ active, onClick, icon: Icon, children }) {
          return (
          <button
          onClick={onClick}
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
          active ? "bg-[#00d4ff] text-[#0a0e14]" : "bg-white border border-slate-200 text-slate-600 hover:border-[#00d4ff]/40"
          }`}
          >
          <Icon className="w-4 h-4" />
          {children}
          </button>
          );
          }