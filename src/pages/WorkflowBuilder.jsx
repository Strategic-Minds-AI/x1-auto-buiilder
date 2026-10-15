import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import BackButton from "@/components/shared/BackButton";
import WorkflowPalette from "@/components/builder/WorkflowPalette";
import WorkflowCanvas from "@/components/builder/WorkflowCanvas";
import { Workflow, Save, Play, Loader2, Plus, FolderOpen, Trash2, Pause, CheckCircle } from "lucide-react";

export default function WorkflowBuilder() {
  const [workflows, setWorkflows] = useState([]);
  const [activeWorkflow, setActiveWorkflow] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [triggerType, setTriggerType] = useState("manual");
  const [triggerEntity, setTriggerEntity] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showList, setShowList] = useState(false);

  useEffect(() => { loadWorkflows(); }, []);

  const loadWorkflows = async () => {
    setLoading(true);
    try {
      const page = await base44.entities.CustomWorkflow.filter({}, { sort: "-created_date", limit: 50 });
      setWorkflows(page.items || []);
    } catch { setWorkflows([]); }
    finally { setLoading(false); }
  };

  const newWorkflow = () => {
    setActiveWorkflow(null);
    setNodes([]);
    setEdges([]);
    setName("New Workflow");
    setDescription("");
    setTriggerType("manual");
    setTriggerEntity("");
    setShowList(false);
  };

  const openWorkflow = (wf) => {
    setActiveWorkflow(wf);
    setNodes(wf.nodes || []);
    setEdges(wf.edges || []);
    setName(wf.name || "Untitled");
    setDescription(wf.description || "");
    setTriggerType(wf.trigger_type || "manual");
    setTriggerEntity(wf.trigger_entity || "");
    setShowList(false);
  };

  const save = async () => {
    if (!name.trim()) { alert("Enter a workflow name"); return; }
    if (nodes.length === 0) { alert("Add at least one node to the canvas"); return; }
    setSaving(true);
    try {
      const data = {
        name: name.trim(),
        description: description.trim(),
        trigger_type: triggerType,
        trigger_entity: triggerEntity || null,
        nodes,
        edges,
        status: activeWorkflow?.status || "draft",
      };
      if (activeWorkflow) {
        await base44.entities.CustomWorkflow.update(activeWorkflow.id, data);
      } else {
        const created = await base44.entities.CustomWorkflow.create(data);
        setActiveWorkflow(created);
      }
      await loadWorkflows();
    } catch (e) { alert("Save failed: " + (e.message || "unknown")); }
    finally { setSaving(false); }
  };

  const run = async () => {
    if (!activeWorkflow) { alert("Save the workflow first"); return; }
    try {
      // Execute the workflow by invoking each action node in sequence
      for (const node of nodes.filter((n) => n.type === "action" && n.config?.function_name)) {
        await base44.functions.invoke(node.config.function_name, node.config.args || {});
      }
      await base44.entities.CustomWorkflow.update(activeWorkflow.id, {
        last_run_at: new Date().toISOString(),
        run_count: (activeWorkflow.run_count || 0) + 1
      });
      alert("Workflow executed successfully");
    } catch (e) { alert("Run failed: " + (e.message || "unknown")); }
  };

  const toggleStatus = async () => {
    if (!activeWorkflow) return;
    const newStatus = activeWorkflow.status === "active" ? "paused" : "active";
    try {
      await base44.entities.CustomWorkflow.update(activeWorkflow.id, { status: newStatus });
      setActiveWorkflow({ ...activeWorkflow, status: newStatus });
      await loadWorkflows();
    } catch (e) { alert("Failed: " + (e.message || "unknown")); }
  };

  const del = async (wf) => {
    if (!confirm(`Delete "${wf.name}"?`)) return;
    try {
      await base44.entities.CustomWorkflow.delete(wf.id);
      if (activeWorkflow?.id === wf.id) newWorkflow();
      await loadWorkflows();
    } catch (e) { alert("Delete failed: " + (e.message || "unknown")); }
  };

  return (
    <div className="portal-light h-screen flex flex-col bg-slate-50">
      {/* Top bar */}
      <div className="h-14 bg-[#0a0e14] border-b border-black/20 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <BackButton fallback="/portal" label="Back" />
          <div className="h-4 w-px bg-white/20" />
          <div className="flex items-center gap-2">
            <Workflow className="w-4 h-4 text-[#00d4ff]" />
            <input value={name} onChange={(e) => setName(e.target.value)}
              className="bg-transparent text-sm font-bold text-white border-none outline-none focus:bg-white/10 rounded px-2 py-1 min-w-[200px]" />
          </div>
          {activeWorkflow && (
            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${activeWorkflow.status === "active" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
              {activeWorkflow.status === "active" ? <CheckCircle className="w-2.5 h-2.5" /> : <Pause className="w-2.5 h-2.5" />}
              {activeWorkflow.status}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowList(!showList)} className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition">
            <FolderOpen className="w-3.5 h-3.5" /> My Workflows ({workflows.length})
          </button>
          <button onClick={newWorkflow} className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition">
            <Plus className="w-3.5 h-3.5" /> New
          </button>
          {activeWorkflow && (
            <button onClick={toggleStatus} className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition">
              {activeWorkflow.status === "active" ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {activeWorkflow.status === "active" ? "Pause" : "Activate"}
            </button>
          )}
          <button onClick={save} disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20 transition disabled:opacity-40">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
          </button>
          <button onClick={run} disabled={!activeWorkflow}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#00d4ff] to-[#0066ff] px-3 py-1.5 text-xs font-bold text-white hover:brightness-110 disabled:opacity-40 transition">
            <Play className="w-3.5 h-3.5" /> Run
          </button>
        </div>
      </div>

      {/* Workflow list dropdown */}
      {showList && (
        <div className="absolute top-14 left-16 w-80 max-h-96 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl z-50 py-2">
          {loading && <div className="px-3 py-2 text-xs text-slate-400">Loading...</div>}
          {workflows.length === 0 && !loading && <div className="px-3 py-2 text-xs text-slate-400">No saved workflows yet.</div>}
          {workflows.map((wf) => (
            <div key={wf.id} className="flex items-center justify-between px-3 py-2 hover:bg-slate-50 group">
              <button onClick={() => openWorkflow(wf)} className="flex-1 text-left">
                <div className="text-sm font-semibold text-slate-700">{wf.name}</div>
                <div className="text-[10px] text-slate-400">{wf.nodes?.length || 0} nodes · {wf.trigger_type}</div>
              </button>
              <button onClick={() => del(wf)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main layout */}
      <div className="flex-1 flex min-h-0">
        {/* Palette */}
        <WorkflowPalette />

        {/* Canvas */}
        <WorkflowCanvas
          nodes={nodes} setNodes={setNodes}
          edges={edges} setEdges={setEdges}
          triggerType={triggerType} setTriggerType={setTriggerType}
          triggerEntity={triggerEntity} setTriggerEntity={setTriggerEntity}
          description={description} setDescription={setDescription}
        />
      </div>
    </div>
  );
}