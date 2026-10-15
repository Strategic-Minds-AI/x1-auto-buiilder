import { DollarSign, TrendingUp, AlertTriangle, Target, Rocket, Check } from "lucide-react";

export default function PricingDisplay({ strategy, industry, market }) {
  if (!strategy) return null;

  const positionColors = {
    budget: "bg-emerald-100 text-emerald-700",
    "mid-market": "bg-blue-100 text-blue-700",
    premium: "bg-purple-100 text-purple-700",
    luxury: "bg-amber-100 text-amber-700",
  };

  return (
    <div className="space-y-5">
      {/* Market position + competitive gap */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-[#00d4ff]" />
            <span className="text-xs font-bold tracking-wide uppercase text-slate-400">Market Position</span>
          </div>
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold ${positionColors[strategy.marketPosition] || "bg-slate-100 text-slate-600"}`}>
            {strategy.marketPosition}
          </span>
          <p className="text-sm text-slate-600 mt-3">{strategy.competitiveGap}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-[#00d4ff]" />
            <span className="text-xs font-bold tracking-wide uppercase text-slate-400">Anchor Strategy</span>
          </div>
          <p className="text-sm text-slate-600">{strategy.anchorStrategy}</p>
        </div>
      </div>

      {/* Pricing tiers */}
      {strategy.recommendedTiers && strategy.recommendedTiers.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-[#00d4ff]" />
            <h3 className="text-sm font-bold text-slate-700">Recommended Pricing Tiers</h3>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {strategy.recommendedTiers.map((tier, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-900">{tier.name}</h4>
                  <span className="text-xs font-mono text-[#00d4ff]">
                    ${tier.price_min}{tier.price_max > tier.price_min ? `–$${tier.price_max}` : ""}
                    <span className="text-slate-400">/{tier.unit}</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-2">{tier.target_customer}</p>
                <div className="space-y-1 mb-2">
                  {(tier.inclusions || []).slice(0, 4).map((inc, ii) => (
                    <div key={ii} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                      <Check className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" /> {inc}
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 italic border-t border-slate-200 pt-2">{tier.differentiator}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Value propositions */}
      {strategy.valuePropositions && strategy.valuePropositions.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-bold text-slate-700 mb-3">Value Propositions</h3>
          <div className="grid md:grid-cols-3 gap-2">
            {strategy.valuePropositions.map((vp, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> {vp}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Launch recommendation */}
      {strategy.launchRecommendation && (
        <div className="rounded-2xl border border-[#00d4ff]/30 bg-[#00d4ff]/5 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Rocket className="w-4 h-4 text-[#00d4ff]" />
            <h3 className="text-sm font-bold text-slate-700">Launch Recommendation (First 90 Days)</h3>
          </div>
          <p className="text-sm text-slate-600">{strategy.launchRecommendation}</p>
        </div>
      )}

      {/* Risk factors */}
      {strategy.riskFactors && strategy.riskFactors.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-amber-700">Pricing Risk Factors</h3>
          </div>
          <ul className="space-y-1">
            {strategy.riskFactors.map((risk, i) => (
              <li key={i} className="text-sm text-amber-700">• {risk}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}