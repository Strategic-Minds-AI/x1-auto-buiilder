import { useState } from "react";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";
import {
  Search, Loader2, Target, TrendingUp, DollarSign, ChevronRight,
  CheckCircle, AlertCircle, Award, Zap, Filter, Eye,
} from "lucide-react";

export default function IntelligencePanel({ data, onRefresh }) {
  const [discovering, setDiscovering] = useState(false);
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [generatingStrategies, setGeneratingStrategies] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [creatingCanary, setCreatingCanary] = useState(false);
  const [error, setError] = useState("");

  const opportunities = data?.opportunities || [];

  const handleDiscover = async () => {
    setDiscovering(true);
    setError("");
    try {
      await base44.functions.invoke("apexOrchestrator", { action: "discover_opportunities" });
      await onRefresh();
    } catch (err) {
      setError(err.message || "Discovery failed");
    } finally {
      setDiscovering(false);
    }
  };

  const handleStrategies = async (oppId) => {
    setGeneratingStrategies(true);
    setError("");
    try {
      await base44.functions.invoke("apexOrchestrator", { action: "generate_strategies", opportunity_id: oppId });
      await onRefresh();
      setSelectedOpp(opportunities.find(o => o.id === oppId));
    } catch (err) {
      setError(err.message || "Strategy generation failed");
    } finally {
      setGeneratingStrategies(false);
    }
  };

  const handleSimulate = async (oppId, strategyIndex) => {
    setSimulating(true);
    setError("");
    try {
      await base44.functions.invoke("apexOrchestrator", { action: "simulate_scenarios", opportunity_id: oppId, strategy_index: strategyIndex });
      await onRefresh();
    } catch (err) {
      setError(err.message || "Simulation failed");
    } finally {
      setSimulating(false);
    }
  };

  const handleCanary = async (oppId) => {
    setCreatingCanary(true);
    setError("");
    try {
      await base44.functions.invoke("apexOrchestrator", { action: "create_canary", opportunity_id: oppId });
      await onRefresh();
    } catch (err) {
      setError(err.message || "Canary creation failed");
    } finally {
      setCreatingCanary(false);
    }
  };

  const selected = opportunities.find(o => o.id === selectedOpp);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Search className="w-5 h-5 text-[#3b82f6]" />
            <h2 className="text-xl font-bold">National Demand Intelligence</h2>
          </div>
          <p className="text-sm text-slate-500">US commercial demand research, opportunity scoring, and strategy generation</p>
        </div>
        <button
          onClick={handleDiscover}
          disabled={discovering}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#6366f1] px-4 py-2.5 text-sm font-bold text-slate-800 disabled:opacity-40 hover:brightness-110 transition"
        >
          {discovering ? <><Loader2 className="w-4 h-4 animate-spin" /> Researching...</> : <><Search className="w-4 h-4" /> Discover Opportunities</>}
        </button>
      </div>

      {error && (
        <div className="mb-3 flex items-center gap-2 text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </div>
      )}

      {/* Opportunity Leaderboard */}
      {!selected && (
        <div>
          {opportunities.length === 0 ? (
            <div className="rounded-2xl bg-white border border-slate-200 p-12 text-center">
              <Target className="w-10 h-10 text-slate-800/20 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-600">No opportunities discovered yet</p>
              <p className="text-xs text-slate-400 mt-1">Click "Discover Opportunities" to research US commercial demand using live web search</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Opportunity Leaderboard — {opportunities.length} found</p>
              {opportunities.sort((a, b) => (b.overall_score || 0) - (a.overall_score || 0)).map((opp) => (
                <button
                  key={opp.id}
                  onClick={() => setSelectedOpp(opp.id)}
                  className="w-full text-left rounded-xl bg-white border border-slate-200 p-4 hover:bg-slate-50 hover:border-[#3b82f6]/30 transition group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {opp.canary && <span className="text-[9px] font-bold bg-[#00d4ff]/20 text-[#00d4ff] px-1.5 py-0.5 rounded">CANARY</span>}
                        <span className="text-sm font-bold text-slate-800">{opp.service_or_product}</span>
                      </div>
                      <p className="text-xs text-slate-500">{opp.industry} {opp.subindustry ? `· ${opp.subindustry}` : ""} · {opp.geography}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <ScoreBar label="Demand" score={opp.demand_score} color="#3b82f6" />
                        <ScoreBar label="Competition" score={opp.competition_score} color="#ef4444" />
                        <ScoreBar label="Profit" score={opp.profitability_score} color="#10b981" />
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-2xl font-black" style={{ color: opp.overall_score >= 70 ? "#10b981" : opp.overall_score >= 50 ? "#f59e0b" : "#ef4444" }}>
                        {opp.overall_score || 0}
                      </div>
                      <div className="text-[9px] text-slate-400 uppercase">Overall</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-800/20 group-hover:text-slate-600 shrink-0 mt-1" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Opportunity Detail */}
      {selected && (
        <div>
          <button onClick={() => setSelectedOpp(null)} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 mb-3">
            <ChevronRight className="w-3.5 h-5 rotate-180" /> Back to leaderboard
          </button>

          <div className="rounded-2xl bg-white border border-slate-200 p-5 mb-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{selected.service_or_product}</h3>
                <p className="text-sm text-slate-500">{selected.industry} {selected.subindustry ? `· ${selected.subindustry}` : ""} · {selected.geography}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black" style={{ color: selected.overall_score >= 70 ? "#10b981" : selected.overall_score >= 50 ? "#f59e0b" : "#ef4444" }}>
                  {selected.overall_score || 0}
                </div>
                <div className="text-[9px] text-slate-400 uppercase">Overall Score</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <ScoreBar label="Demand" score={selected.demand_score} color="#3b82f6" />
              <ScoreBar label="Competition" score={selected.competition_score} color="#ef4444" />
              <ScoreBar label="Profitability" score={selected.profitability_score} color="#10b981" />
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${selected.confidence === "verified" ? "bg-emerald-500/20 text-emerald-400" : selected.confidence === "inferred" ? "bg-amber-500/20 text-amber-400" : "bg-slate-100 text-slate-500"}`}>
                {selected.confidence?.toUpperCase()}
              </span>
              <span className="text-[10px] text-slate-400">Buyer Intent: {selected.buyer_intent}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => handleStrategies(selected.id)}
              disabled={generatingStrategies}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#6366f1] px-4 py-2 text-xs font-bold text-slate-800 disabled:opacity-40 hover:brightness-110 transition"
            >
              {generatingStrategies ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
              {selected.strategy_options?.length > 0 ? "Regenerate Strategies" : "Generate 10 Strategies"}
            </button>
            <button
              onClick={() => handleCanary(selected.id)}
              disabled={creatingCanary}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] px-4 py-2 text-xs font-bold text-[#0a0e14] disabled:opacity-40 hover:brightness-110 transition"
            >
              {creatingCanary ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Award className="w-3.5 h-3.5" />}
              Create National Canary
            </button>
          </div>

          {/* Buyer organizations */}
          {selected.buyer_organizations?.length > 0 && (
            <Section title="Plausible Buyer Organizations">
              <div className="flex flex-wrap gap-1.5">
                {selected.buyer_organizations.map((b, i) => (
                  <span key={i} className="text-xs bg-white border border-slate-200 text-slate-800/60 px-2.5 py-1 rounded-lg">{b}</span>
                ))}
              </div>
            </Section>
          )}

          {/* Competitors */}
          {selected.competitors?.length > 0 && (
            <Section title="Key Competitors">
              <div className="space-y-1.5">
                {selected.competitors.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg bg-white border border-slate-200 px-3 py-2">
                    <span className="text-sm font-semibold text-slate-700">{c.name}</span>
                    {c.url && <a href={c.url} target="_blank" rel="noopener" className="text-xs text-[#00d4ff] hover:underline">{c.url}</a>}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Pricing evidence */}
          {selected.pricing_evidence?.length > 0 && (
            <Section title="Pricing Evidence">
              <div className="space-y-1.5">
                {selected.pricing_evidence.map((p, i) => (
                  <div key={i} className="rounded-lg bg-white border border-slate-200 px-3 py-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">{p.item}</span>
                      <span className="text-sm font-bold text-emerald-400">{p.price}</span>
                    </div>
                    {p.source && <p className="text-[10px] text-slate-400 mt-0.5">Source: {p.source}</p>}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Strategies */}
          {selected.strategy_options?.length > 0 && (
            <Section title="Business Strategies (10)">
              <div className="space-y-2">
                {selected.strategy_options.map((s, i) => (
                  <div key={i} className="rounded-xl bg-white border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <p className="text-sm font-bold text-slate-800">{s.strategy_name}</p>
                        <p className="text-xs text-slate-500">{s.approach}</p>
                      </div>
                      <button
                        onClick={() => handleSimulate(selected.id, i)}
                        disabled={simulating}
                        className="flex items-center gap-1.5 rounded-lg bg-[#f59e0b]/10 border border-[#f59e0b]/30 px-2.5 py-1.5 text-[10px] font-bold text-[#f59e0b] hover:bg-[#f59e0b]/20 transition shrink-0"
                      >
                        {simulating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Eye className="w-3 h-3" />}
                        Simulate
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                      <Metric label="Lead Value" value={`$${s.estimated_lead_value || 0}`} />
                      <Metric label="Mo. Leads" value={s.estimated_monthly_leads || 0} />
                      <Metric label="Mo. Revenue" value={`$${s.estimated_monthly_revenue || 0}`} />
                      <Metric label="Mo. Cost" value={`$${s.estimated_monthly_cost || 0}`} />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">{s.value_proposition}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[9px] text-slate-400">Type: {s.digital_property_type}</span>
                      <span className="text-[9px] text-slate-400">·</span>
                      <span className="text-[9px] text-slate-400">Revenue: {s.revenue_model}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Simulations */}
          {selected.simulations?.length > 0 && (
            <Section title="Financial Simulations (SIMULATED)">
              <div className="space-y-2">
                {selected.simulations.map((sim, i) => (
                  <div key={i} className="rounded-xl bg-white border border-slate-200 p-4">
                    <p className="text-sm font-bold text-[#f59e0b] mb-3">{sim.strategy}</p>
                    <div className="grid grid-cols-3 gap-2">
                      <ScenarioCard label="Conservative" data={sim.conservative} color="#ef4444" />
                      <ScenarioCard label="Base Case" data={sim.base} color="#f59e0b" />
                      <ScenarioCard label="Optimistic" data={sim.optimistic} color="#10b981" />
                    </div>
                    {sim.recommendation && (
                      <p className="text-xs text-slate-600 mt-3">{sim.recommendation}</p>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Assumptions & Next Actions */}
          {(selected.assumptions?.length > 0 || selected.next_actions?.length > 0) && (
            <div className="grid sm:grid-cols-2 gap-3 mt-4">
              {selected.assumptions?.length > 0 && (
                <Section title="Assumptions">
                  <ul className="space-y-1">
                    {selected.assumptions.map((a, i) => (
                      <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                        <AlertCircle className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" /> {a}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}
              {selected.next_actions?.length > 0 && (
                <Section title="Next Research Actions">
                  <ul className="space-y-1">
                    {selected.next_actions.map((a, i) => (
                      <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                        <ChevronRight className="w-3 h-3 text-[#00d4ff] shrink-0 mt-0.5" /> {a}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ScoreBar({ label, score, color }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[9px] text-slate-400 w-16">{label}</span>
      <div className="w-16 h-1.5 rounded-full bg-slate-200 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="text-[9px] font-bold" style={{ color }}>{score}</span>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mt-4">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">{title}</p>
      {children}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg bg-white px-2.5 py-1.5">
      <p className="text-[9px] text-slate-400 uppercase">{label}</p>
      <p className="text-xs font-bold text-slate-700">{value}</p>
    </div>
  );
}

function ScenarioCard({ label, data, color }) {
  if (!data) return null;
  return (
    <div className="rounded-lg bg-white p-3">
      <p className="text-[10px] font-bold uppercase mb-1.5" style={{ color }}>{label}</p>
      <div className="space-y-0.5">
        <p className="text-[10px] text-slate-500">Revenue: <span className="font-bold text-slate-700">${data.monthly_revenue || 0}</span></p>
        <p className="text-[10px] text-slate-500">Cost: <span className="font-bold text-slate-700">${data.monthly_cost || 0}</span></p>
        <p className="text-[10px] text-slate-500">Profit: <span className="font-bold" style={{ color: (data.profit || 0) >= 0 ? "#10b981" : "#ef4444" }}>${data.profit || 0}</span></p>
        <p className="text-[10px] text-slate-500">Leads: <span className="font-bold text-slate-700">{data.monthly_leads || 0}</span></p>
      </div>
    </div>
  );
}