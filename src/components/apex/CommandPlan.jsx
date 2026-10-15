import { CheckCircle2, Globe, MapPin, Target, Palette, Layers, Loader2, ArrowRight } from "lucide-react";

// Displays the decomposed plan with capability breakdown and an execute button.
export default function CommandPlan({ plan, onExecute, executing }) {
  if (!plan) return null;
  const caps = plan.capabilities || [];
  const capLabels = {
    website: "Website Generation",
    logo: "Logo Design",
    hero_image: "Hero Image",
    compliance: "Google Compliance",
    social_30day: "30-Day Social Campaign",
    analytics: "Analytics Setup",
    provision: "Production Provisioning",
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center gap-2 mb-6">
        <CheckCircle2 className="w-5 h-5 text-[#00d4ff]" />
        <h2 className="text-xl font-bold text-slate-900">Execution Plan Ready</h2>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Summary</div>
          <p className="text-sm text-slate-700">{plan.summary}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <InfoRow icon={Globe} label="Business" value={plan.business_name} />
          <InfoRow icon={Layers} label="Industry" value={plan.industry} />
          <InfoRow icon={Target} label="Goal" value={plan.goal} />
          <InfoRow icon={Palette} label="Tone" value={plan.tone} />
        </div>

        {plan.locations?.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {plan.locations.map((loc) => (
              <span key={loc} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">{loc}</span>
            ))}
          </div>
        )}

        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Capabilities</div>
          <div className="flex flex-wrap gap-2">
            {caps.map((cap) => (
              <span key={cap} className="inline-flex items-center gap-1.5 rounded-lg bg-[#00d4ff]/10 border border-[#00d4ff]/20 px-3 py-1.5 text-xs font-semibold text-[#00d4ff]">
                <CheckCircle2 className="w-3 h-3" /> {capLabels[cap] || cap}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={onExecute}
          disabled={executing}
          className="inline-flex items-center gap-2 rounded-full bg-[#00d4ff] px-6 py-3 text-sm font-bold text-[#0a0e14] hover:brightness-110 hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] transition disabled:opacity-50"
        >
          {executing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
          {executing ? "Executing…" : "Execute Full Pipeline"}
        </button>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
        <Icon className="w-3 h-3" /> {label}
      </div>
      <div className="text-sm font-semibold text-slate-800 truncate">{value || "—"}</div>
    </div>
  );
}