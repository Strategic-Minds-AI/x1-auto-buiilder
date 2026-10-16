import { PIPELINE_STAGES } from "@/data/pipelineStages";
import { AGENT_MAP } from "@/data/agentAssignments";
import {
  Upload, Scan, FileText, Code, Database, Shield, Wrench, Monitor,
  Globe, Cloud, ClipboardCheck, Rocket, CheckCircle, Loader2, XCircle, Clock,
} from "lucide-react";

const ICON_MAP = {
  Upload, Scan, FileText, Code, Database, Shield, Wrench, Monitor,
  Globe, Cloud, ClipboardCheck, Rocket, CheckCircle,
};

const STATUS_STYLES = {
  PENDING: { color: "#94a3b8", bg: "bg-slate-100", text: "text-slate-400", border: "border-slate-200", glow: "" },
  IN_PROGRESS: { color: "#00d4ff", bg: "bg-[#00d4ff]/10", text: "text-[#00d4ff]", border: "border-[#00d4ff]", glow: "shadow-[0_0_20px_rgba(0,212,255,0.4)] animate-pulse" },
  COMPLETED: { color: "#10b981", bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-300", glow: "shadow-[0_0_10px_rgba(16,185,129,0.2)]" },
  FAILED: { color: "#ef4444", bg: "bg-red-50", text: "text-red-500", border: "border-red-300", glow: "shadow-[0_0_10px_rgba(239,68,68,0.2)]" },
  SKIPPED: { color: "#94a3b8", bg: "bg-slate-50", text: "text-slate-400", border: "border-slate-200", glow: "" },
  BLOCKED: { color: "#f59e0b", bg: "bg-amber-50", text: "text-amber-500", border: "border-amber-300", glow: "shadow-[0_0_10px_rgba(245,158,11,0.2)]" },
};

const STATUS_ICONS = {
  PENDING: Clock,
  IN_PROGRESS: Loader2,
  COMPLETED: CheckCircle,
  FAILED: XCircle,
  SKIPPED: Clock,
  BLOCKED: Shield,
};

export default function VisualPipelineTimeline({ stages = [], currentStageIndex = 0, onStageClick }) {
  const stageData = PIPELINE_STAGES.map((def, i) => {
    const runtime = stages[i] || { status: "PENDING" };
    return { ...def, ...runtime, index: i };
  });

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="min-w-[1200px] px-2">
        {/* Connection line */}
        <div className="relative">
          <div className="absolute top-7 left-0 right-0 h-0.5 bg-slate-200" />
          <div
            className="absolute top-7 left-0 h-0.5 bg-gradient-to-r from-emerald-400 to-[#00d4ff] transition-all duration-500"
            style={{ width: `${(currentStageIndex / (PIPELINE_STAGES.length - 1)) * 100}%` }}
          />
        </div>

        {/* Stage nodes */}
        <div className="relative flex justify-between items-start">
          {stageData.map((stage) => {
            const Icon = ICON_MAP[stage.icon] || Code;
            const style = STATUS_STYLES[stage.status] || STATUS_STYLES.PENDING;
            const StatusIcon = STATUS_ICONS[stage.status] || Clock;
            const agent = AGENT_MAP[stage.agent];
            const isCurrent = stage.index === currentStageIndex && stage.status === "IN_PROGRESS";

            return (
              <div
                key={stage.id}
                onClick={() => onStageClick?.(stage)}
                className={`flex flex-col items-center w-20 shrink-0 cursor-pointer group ${isCurrent ? "z-10" : ""}`}
              >
                {/* Node circle */}
                <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 ${style.bg} ${style.border} ${style.glow} group-hover:scale-110`}>
                  <Icon className={`w-6 h-6 ${style.text}`} />
                  {stage.status === "IN_PROGRESS" && (
                    <div className="absolute -top-1 -right-1">
                      <Loader2 className="w-4 h-4 text-[#00d4ff] animate-spin" />
                    </div>
                  )}
                  {stage.status === "COMPLETED" && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-white">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                  )}
                  {stage.status === "FAILED" && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center border-2 border-white">
                      <XCircle className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>

                {/* Stage number */}
                <div className="text-[9px] font-bold text-slate-300 mt-1.5">STEP {stage.index + 1}</div>

                {/* Label */}
                <div className={`text-[10px] font-bold text-center leading-tight mt-0.5 ${style.text}`}>
                  {stage.label}
                </div>

                {/* Agent */}
                {agent && (
                  <div className="text-[8px] text-slate-400 text-center mt-1 hidden md:block">
                    {agent.position}
                  </div>
                )}

                {/* Validator/Fixer badges */}
                <div className="flex gap-0.5 mt-1">
                  {stage.validator && (
                    <span className={`text-[7px] px-1 py-0.5 rounded font-bold ${
                      stage.validator_result?.passed ? "bg-emerald-100 text-emerald-600" : stage.validator_result ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-400"
                    }`}>
                      V
                    </span>
                  )}
                  {stage.fixer && (
                    <span className={`text-[7px] px-1 py-0.5 rounded font-bold ${
                      stage.fixer_actions?.length > 0 ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-400"
                    }`}>
                      F
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}