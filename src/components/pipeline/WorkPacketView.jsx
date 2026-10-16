import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Package, Loader2, Shield, Code, GitBranch, Eye, FileText,
  CheckCircle2, XCircle, Clock, Ban, Bot, Globe, Server,
} from "lucide-react";

const RISK_STYLES = {
  READ: { icon: Eye, color: "text-slate-500", bg: "bg-slate-100", border: "border-slate-200", label: "READ" },
  DRAFT: { icon: FileText, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-200", label: "DRAFT" },
  BRANCH_WRITE: { icon: GitBranch, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-200", label: "BRANCH" },
  PROTECTED: { icon: Shield, color: "text-red-500", bg: "bg-red-50", border: "border-red-200", label: "PROTECTED" },
};

const STATUS_STYLES = {
  PENDING: { icon: Clock, color: "text-slate-400" },
  READY: { icon: CheckCircle2, color: "text-blue-500" },
  ASSIGNED: { icon: Bot, color: "text-purple-500" },
  IN_PROGRESS: { icon: Loader2, color: "text-[#00d4ff]" },
  COMPLETED: { icon: CheckCircle2, color: "text-emerald-500" },
  FAILED: { icon: XCircle, color: "text-red-500" },
  BLOCKED: { icon: Ban, color: "text-amber-500" },
};

const EXECUTOR_ICONS = {
  BASE44: Server, CODEX: Code, GITHUB_AGENT: GitBranch,
  VERCEL: Globe, SUPABASE: Server, RAILWAY: Server,
  CLOUD_BROWSER: Globe, HUMAN: Bot,
};

export default function WorkPacketView({ pipelineRunId }) {
  const [packets, setPackets] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPackets = async () => {
    if (!pipelineRunId) { setLoading(false); return; }
    try {
      const page = await base44.entities.WorkPacket.filter(
        { pipeline_run_id: pipelineRunId },
        { sort: "created_date", limit: 100 }
      );
      setPackets(page.items || []);
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { loadPackets(); }, [pipelineRunId]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-[#00d4ff]" /></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Package className="w-4 h-4 text-[#00d4ff]" />
        <h3 className="text-sm font-bold text-slate-700">Work Packets</h3>
        <span className="text-xs text-slate-400 ml-auto">{packets.length} packets</span>
      </div>

      {packets.length === 0 ? (
        <div className="text-center py-6">
          <Package className="w-8 h-8 text-slate-200 mx-auto mb-2" />
          <p className="text-xs text-slate-400">No work packets yet for this pipeline. Packets are created during pipeline execution.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {packets.map((packet) => {
            const risk = RISK_STYLES[packet.risk_class] || RISK_STYLES.DRAFT;
            const status = STATUS_STYLES[packet.status] || STATUS_STYLES.PENDING;
            const ExecutorIcon = EXECUTOR_ICONS[packet.executor] || Server;
            const StatusIcon = status.icon;
            return (
              <div key={packet.id} className={`rounded-lg border p-3 ${risk.border} ${risk.bg}`}>
                <div className="flex items-start gap-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${risk.bg} ${risk.border} border`}>
                    <risk.icon className={`w-3.5 h-3.5 ${risk.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="text-[10px] font-mono font-bold text-slate-500">{packet.packet_id}</code>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${risk.bg} ${risk.color} border ${risk.border}`}>
                        {risk.label}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-slate-100 ${status.color}`}>
                        {packet.status}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-700 mt-1">{packet.title}</p>
                    {packet.description && <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{packet.description}</p>}
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
                      <span className="inline-flex items-center gap-1"><ExecutorIcon className="w-3 h-3" />{packet.executor}</span>
                      {packet.assigned_agent && <span className="inline-flex items-center gap-1"><Bot className="w-3 h-3" />{packet.assigned_agent}</span>}
                      {packet.evidence_refs?.length > 0 && <span className="text-emerald-500 font-bold">{packet.evidence_refs.length} evidence</span>}
                      {packet.approval_id && <span className="text-red-500 font-bold">needs approval</span>}
                    </div>
                  </div>
                  <StatusIcon className={`w-4 h-4 ${status.color} ${packet.status === "IN_PROGRESS" ? "animate-spin" : ""} shrink-0`} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}