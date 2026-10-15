import { useState, useRef } from "react";
import { Zap, Bot, GitBranch, Clock, Database, X, Settings, ArrowRight, Plus } from "lucide-react";

const NODE_STYLES = {
  trigger: { bg: "#f59e0b", icon: Zap, label: "Trigger" },
  action: { bg: "#00d4ff", icon: Zap, label: "Action" },
  agent: { bg: "#8b5cf6", icon: Bot, label: "Agent" },
  condition: { bg: "#64748b", icon: GitBranch, label: "Condition" },
  delay: { bg: "#64748b", icon: Clock, label: "Delay" },
};

export default function WorkflowCanvas({ nodes, setNodes, edges, setEdges, triggerType, setTriggerType, triggerEntity, setTriggerEntity, description, setDescription }) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const canvasRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    try {
      const item = JSON.parse(e.dataTransfer.getData("application/json"));
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - 80;
      const y = e.clientY - rect.top - 24;
      const newNode = {
        id: `node_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        type: item.type,
        label: item.label,
        icon: item.icon?.displayName || "Zap",
        config: item.config || { function_name: item.subtype },
        position: { x: Math.max(0, x), y: Math.max(0, y) },
      };
      setNodes([...nodes, newNode]);
    } catch {}
  };

  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);

  const deleteNode = (id) => {
    setNodes(nodes.filter((n) => n.id !== id));
    setEdges(edges.filter((e) => e.from !== id && e.to !== id));
    if (selectedNode?.id === id) setSelectedNode(null);
  };

  const updateNodeConfig = (id, key, value) => {
    setNodes(nodes.map((n) => n.id === id ? { ...n, config: { ...n.config, [key]: value } } : n));
    if (selectedNode?.id === id) setSelectedNode({ ...selectedNode, config: { ...selectedNode.config, [key]: value } });
  };

  const startConnect = (id) => { setEdges([...edges, { from: id, to: null, label: "" }]); };
  const completeConnect = (id) => {
    setEdges(edges.map((e, i) => i === edges.length - 1 && e.to === null ? { ...e, to: id } : e).filter((e) => e.to !== null));
  };

  return (
    <div className="flex-1 flex min-h-0">
      {/* Canvas */}
      <div
        ref={canvasRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => setSelectedNode(null)}
        className={`flex-1 relative overflow-auto bg-slate-100 ${dragOver ? "bg-[#00d4ff]/5" : ""}`}
        style={{
          backgroundImage: "radial-gradient(circle, #cbd5e1 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      >
        {/* Trigger config bar */}
        <div className="absolute top-0 left-0 right-0 bg-white/90 backdrop-blur border-b border-slate-200 px-4 py-2 z-10 flex items-center gap-3">
          <span className="text-xs font-bold text-slate-700">Trigger:</span>
          <select value={triggerType} onChange={(e) => setTriggerType(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700 focus:outline-none">
            <option value="manual">Manual</option>
            <option value="entity_create">Entity Created</option>
            <option value="entity_update">Entity Updated</option>
            <option value="scheduled">Scheduled</option>
            <option value="webhook">Webhook</option>
          </select>
          {(triggerType === "entity_create" || triggerType === "entity_update") && (
            <input value={triggerEntity} onChange={(e) => setTriggerEntity(e.target.value)} placeholder="Entity name (e.g. WebsiteProject)"
              className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700 focus:outline-none w-48" />
          )}
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Workflow description..."
            className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700 focus:outline-none" />
        </div>

        {/* Nodes */}
        <div className="relative pt-14 min-h-full" style={{ width: "100%", minHeight: "600px" }}>
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ top: 56 }}>
              <div className="text-center">
                <Plus className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-400">Drag blocks here to build your workflow</p>
                <p className="text-xs text-slate-400 mt-1">Actions, agents, conditions, and more</p>
              </div>
            </div>
          )}

          {nodes.map((node) => {
            const style = NODE_STYLES[node.type] || NODE_STYLES.action;
            const Icon = style.icon;
            const isSelected = selectedNode?.id === node.id;
            return (
              <div key={node.id}
                onClick={(e) => { e.stopPropagation(); setSelectedNode(node); }}
                style={{ position: "absolute", left: node.position.x, top: node.position.y }}
                className={`rounded-xl border-2 bg-white shadow-md cursor-pointer transition ${isSelected ? "border-[#00d4ff] shadow-lg" : "border-slate-200 hover:border-slate-300"}`}>
                <div className="flex items-center gap-2 px-3 py-2 min-w-[160px]">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: style.bg + "20" }}>
                    <Icon className="w-4 h-4" style={{ color: style.bg }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold uppercase" style={{ color: style.bg }}>{style.label}</div>
                    <div className="text-xs font-semibold text-slate-700 truncate">{node.label}</div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); deleteNode(node.id); }} className="text-slate-300 hover:text-red-500 transition shrink-0">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                {node.config?.function_name && (
                  <div className="px-3 pb-2 text-[10px] font-mono text-slate-400 truncate">{node.config.function_name}()</div>
                )}
                {/* Connection points */}
                <button onClick={(e) => { e.stopPropagation(); startConnect(node.id); }}
                  className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-300 hover:bg-[#00d4ff] transition border-2 border-white" title="Connect" />
                <button onClick={(e) => { e.stopPropagation(); completeConnect(node.id); }}
                  className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-300 hover:bg-[#00d4ff] transition border-2 border-white" title="Connect to" />
              </div>
            );
          })}

          {/* Edges (visual lines) */}
          <svg className="absolute inset-0 pointer-events-none" style={{ width: "100%", height: "100%", top: 56 }}>
            {edges.filter((e) => e.from && e.to).map((edge, i) => {
              const fromNode = nodes.find((n) => n.id === edge.from);
              const toNode = nodes.find((n) => n.id === edge.to);
              if (!fromNode || !toNode) return null;
              const x1 = fromNode.position.x + 160;
              const y1 = fromNode.position.y + 24;
              const x2 = toNode.position.x;
              const y2 = toNode.position.y + 24;
              const midX = (x1 + x2) / 2;
              return (
                <path key={i} d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                  stroke="#cbd5e1" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
              );
            })}
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#cbd5e1" />
              </marker>
            </defs>
          </svg>
        </div>
      </div>

      {/* Properties panel */}
      {selectedNode && (
        <div className="w-72 shrink-0 bg-white border-l border-slate-200 overflow-y-auto">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-slate-500" />
              <h3 className="text-xs font-bold text-slate-700 uppercase">Properties</h3>
            </div>
            <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Name</label>
              <div className="text-sm font-semibold text-slate-700 mt-0.5">{selectedNode.label}</div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Type</label>
              <div className="text-xs text-slate-600 mt-0.5 capitalize">{selectedNode.type}</div>
            </div>
            {selectedNode.config?.function_name && (
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Function</label>
                <div className="text-xs font-mono text-slate-600 mt-0.5 rounded-lg bg-slate-50 px-2 py-1">{selectedNode.config.function_name}</div>
              </div>
            )}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Arguments (JSON)</label>
              <textarea
                value={JSON.stringify(selectedNode.config?.args || {}, null, 2)}
                onChange={(e) => {
                  try { updateNodeConfig(selectedNode.id, "args", JSON.parse(e.target.value)); }
                  catch {}
                }}
                rows={6}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-700 focus:outline-none focus:border-[#00d4ff]/50"
              />
            </div>
            {selectedNode.type === "agent" && (
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Agent Task</label>
                <textarea
                  value={selectedNode.config?.task || ""}
                  onChange={(e) => updateNodeConfig(selectedNode.id, "task", e.target.value)}
                  rows={3}
                  placeholder="What should this agent do?"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-[#00d4ff]/50"
                />
              </div>
            )}
            {selectedNode.type === "delay" && (
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Duration</label>
                <input
                  value={selectedNode.config?.duration || ""}
                  onChange={(e) => updateNodeConfig(selectedNode.id, "duration", e.target.value)}
                  placeholder="e.g. 1 hour, 2 days"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-[#00d4ff]/50"
                />
              </div>
            )}
            {selectedNode.type === "condition" && (
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Condition (jq expression)</label>
                <input
                  value={selectedNode.config?.condition || ""}
                  onChange={(e) => updateNodeConfig(selectedNode.id, "condition", e.target.value)}
                  placeholder='${ .data.status == "approved" }'
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-700 focus:outline-none focus:border-[#00d4ff]/50"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}