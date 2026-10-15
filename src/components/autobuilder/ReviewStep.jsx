import AutoStepShell from "@/components/autobuilder/AutoStepShell";
import { CheckCircle2, Globe, Shirt, LayoutTemplate, FileText, ShieldCheck, Share2 } from "lucide-react";

export default function ReviewStep({ accent, vision, strategy, nameData, brandData, templateData, websiteData, contentData, complianceData, socialData, onApprove }) {
  const summary = [
    { icon: Globe, label: "Vision", value: vision?.type || vision?.statement || "—" },
    { icon: Shirt, label: "Brand", value: brandData?.palette?.name || "Custom" },
    { icon: LayoutTemplate, label: "Template", value: templateData?.template?.name || "—" },
    { icon: FileText, label: "Content", value: contentData?.content?.hero?.headline || websiteData?.website?.content?.hero?.headline || "—" },
    { icon: ShieldCheck, label: "Compliance", value: complianceData?.compliance?.overall_score ? `${complianceData.compliance.overall_score}/100` : "Not run" },
    { icon: Share2, label: "Social Assets", value: `${socialData?.socialAssets?.length || 0} generated` },
  ];

  return (
    <AutoStepShell
      step={11}
      accent={accent}
      title="Review & Confirm"
      subtitle="Everything looks good? Proceed to launch."
      onApprove={() => onApprove({ ready: true })}
      approveLabel="Proceed to Launch"
    >
      <div className="space-y-3">
        {summary.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 shrink-0">
                <Icon className="h-4 w-4 text-slate-600" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] uppercase tracking-wide text-slate-400">{s.label}</div>
                <div className="text-sm font-semibold text-slate-800 truncate">{s.value}</div>
              </div>
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
            </div>
          );
        })}
      </div>
    </AutoStepShell>
  );
}