import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import {
  Brain, BookOpen, Users, HelpCircle, Shield, Gauge, Search,
  Loader2, CheckCircle2, AlertTriangle, XCircle, Zap, Database,
  ChevronDown, ChevronRight, BookText, Target, TrendingUp,
} from "lucide-react";

const TABS = [
  { key: "overview", label: "Overview", icon: Brain },
  { key: "workbooks", label: "Workbook Catalog", icon: BookOpen },
  { key: "agents", label: "Agent Playbooks", icon: Users },
  { key: "questions", label: "Intelligence Questions", icon: HelpCircle },
  { key: "keywords", label: "Keyword Arsenal", icon: Search },
  { key: "risks", label: "Risk Register", icon: Shield },
  { key: "metrics", label: "Metric Dictionary", icon: Gauge },
];

const PRIORITY_COLORS = {
  P0: "bg-red-50 text-red-600 border-red-200",
  P1: "bg-amber-50 text-amber-600 border-amber-200",
  P2: "bg-blue-50 text-blue-600 border-blue-200",
  P3: "bg-slate-50 text-slate-500 border-slate-200",
};

const STATUS_COLORS = {
  POPULATED_SPEC: "bg-blue-50 text-blue-600 border-blue-200",
  CANDIDATE_SPEC: "bg-amber-50 text-amber-600 border-amber-200",
  INSTALLED: "bg-emerald-50 text-emerald-600 border-emerald-200",
  ACTIVE: "bg-emerald-50 text-emerald-600 border-emerald-200",
  NOT_ANSWERED: "bg-slate-50 text-slate-500 border-slate-200",
  OPEN: "bg-red-50 text-red-600 border-red-200",
  RESEARCH_CANDIDATE: "bg-amber-50 text-amber-600 border-amber-200",
  UNCONFIGURED: "bg-slate-50 text-slate-500 border-slate-200",
};

function Badge({ children, className = "" }) {
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${className}`}>{children}</span>;
}

export default function IntelligenceConsole() {
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [counts, setCounts] = useState({});
  const [workbooks, setWorkbooks] = useState([]);
  const [agents, setAgents] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [risks, setRisks] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [expanded, setExpanded] = useState(null);

  const loadCounts = useCallback(async () => {
    try {
      const res = await base44.functions.invoke("seedIntelligenceSuite", { action: "status" });
      setCounts(res.data?.counts || {});
    } catch { /* ignore */ }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [wb, ap, qs, kw, rk, mt] = await Promise.all([
        base44.entities.IntelligenceWorkbook.filter({}, { sort: "workbook_id", limit: 100 }),
        base44.entities.AgentPlaybook.filter({}, { sort: "agent_id", limit: 100 }),
        base44.entities.IntelligenceQuestion.filter({}, { sort: "question_id", limit: 200 }),
        base44.entities.KeywordCandidate.filter({}, { sort: "keyword_id", limit: 100 }),
        base44.entities.RiskControl.filter({}, { sort: "risk_id", limit: 100 }),
        base44.entities.MetricDefinition.filter({}, { sort: "metric_id", limit: 100 }),
      ]);
      setWorkbooks(wb.items || []);
      setAgents(ap.items || []);
      setQuestions(qs.items || []);
      setKeywords(kw.items || []);
      setRisks(rk.items || []);
      setMetrics(mt.items || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadCounts(); loadAll(); }, [loadCounts, loadAll]);

  const seed = async () => {
    setSeeding(true);
    try {
      await base44.functions.invoke("seedIntelligenceSuite", { action: "seed_all" });
      loadCounts();
      loadAll();
    } catch { /* ignore */ }
    finally { setSeeding(false); }
  };

  const totalRecords = Object.values(counts).reduce((a, b) => a + (b || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-slate-900">Intelligence Console</h1>
                <p className="text-xs text-slate-500">Strategic knowledge maps for autonomous agent operations</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-2xl font-black text-[#00d4ff]">{totalRecords}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Total Records</div>
              </div>
              <button
                onClick={seed}
                disabled={seeding}
                className="inline-flex items-center gap-2 rounded-full bg-[#00d4ff] px-5 py-2.5 text-sm font-bold text-white hover:brightness-110 disabled:opacity-50 transition"
              >
                {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {seeding ? "Seeding..." : "Seed Intelligence"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="border-b border-slate-200 bg-white sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 flex gap-1 overflow-x-auto">
          {TABS.map((t) => {
            const Icon = t.icon;
            const count = t.key === "workbooks" ? counts.workbooks : t.key === "agents" ? counts.agents : t.key === "questions" ? counts.questions : t.key === "keywords" ? counts.keywords : t.key === "risks" ? counts.risks : t.key === "metrics" ? counts.metrics : totalRecords;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                  tab === t.key
                    ? "border-[#00d4ff] text-[#00d4ff]"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
                {count > 0 && <span className="text-[10px] text-slate-400">({count})</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-[#00d4ff]" /></div>
        ) : (
          <>
            {/* OVERVIEW */}
            {tab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[
                    { label: "Workbooks", value: counts.workbooks, icon: BookOpen, color: "text-blue-500" },
                    { label: "Agent Playbooks", value: counts.agents, icon: Users, color: "text-purple-500" },
                    { label: "Questions", value: counts.questions, icon: HelpCircle, color: "text-cyan-500" },
                    { label: "Keywords", value: counts.keywords, icon: Search, color: "text-emerald-500" },
                    { label: "Risks", value: counts.risks, icon: Shield, color: "text-red-500" },
                    { label: "Metrics", value: counts.metrics, icon: Gauge, color: "text-amber-500" },
                  ].map((s) => {
                    const Icon = s.icon;
                    return (
                      <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <Icon className={`w-5 h-5 ${s.color} mb-2`} />
                        <div className="text-2xl font-black text-slate-900">{s.value || 0}</div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider">{s.label}</div>
                      </div>
                    );
                  })}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-sm font-bold mb-3 flex items-center gap-2 text-slate-900">
                    <Target className="w-4 h-4 text-[#00d4ff]" />
                    What This Console Does
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">
                    This is the strategic knowledge layer for your autonomous system. Every agent, pipeline stage,
                    and decision point can reference these intelligence maps instead of guessing. The workbooks
                    define what to build, the agent playbooks define how to execute, the questions define what to
                    ask, the keywords define what to target, the risks define what to avoid, and the metrics define
                    how to measure success.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { icon: BookOpen, text: "30 workbooks map every capability from discovery to release" },
                      { icon: Users, text: "40+ agent playbooks give each agent its exact role and system prompt" },
                      { icon: HelpCircle, text: "200+ questions ensure agents ask the right things before acting" },
                      { icon: Search, text: "800+ keywords + 300 modifiers feed the mass-launch engine" },
                      { icon: Shield, text: "100+ risks with mitigations prevent failures before they happen" },
                      { icon: Gauge, text: "100+ metric definitions ensure honest, evidence-based measurement" },
                    ].map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <div key={i} className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 border border-slate-100">
                          <Icon className="w-4 h-4 text-[#00d4ff] mt-0.5 shrink-0" />
                          <span className="text-xs text-slate-600">{item.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-2xl border border-[#00d4ff]/30 bg-[#00d4ff]/5 p-6">
                  <h3 className="text-sm font-bold mb-2 flex items-center gap-2 text-[#00d4ff]">
                    <Zap className="w-4 h-4" />
                    Next Action
                  </h3>
                  <p className="text-sm text-slate-700">
                    {totalRecords === 0
                      ? "Click 'Seed Intelligence' above to populate all 6 knowledge layers from the Digital Dominance workbook suite."
                      : "Intelligence is loaded and ready. Agents can now query these knowledge maps at runtime for keywords, questions, risks, metrics, and agent roles."}
                  </p>
                </div>
              </div>
            )}

            {/* WORKBOOKS */}
            {tab === "workbooks" && (
              <div className="space-y-2">
                {workbooks.map((wb) => {
                  const isOpen = expanded === wb.id;
                  return (
                    <div key={wb.id} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                      <button
                        onClick={() => setExpanded(isOpen ? null : wb.id)}
                        className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition text-left"
                      >
                        {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />}
                        <span className="text-xs font-mono text-[#00d4ff] shrink-0">{wb.workbook_id}</span>
                        <span className="text-sm font-semibold flex-1 truncate text-slate-800">{wb.title}</span>
                        <Badge className={PRIORITY_COLORS[wb.priority] || "border-slate-200"}>{wb.priority}</Badge>
                        <Badge className={STATUS_COLORS[wb.artifact_status] || "border-slate-200"}>{wb.artifact_status}</Badge>
                        {wb.system_installed ? (
                          <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200"><CheckCircle2 className="w-3 h-3" />Installed</Badge>
                        ) : (
                          <Badge className="bg-slate-50 text-slate-500 border-slate-200">Not Installed</Badge>
                        )}
                      </button>
                      {isOpen && (
                        <div className="border-t border-slate-100 p-4 space-y-3 bg-slate-50/50">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-[10px] text-slate-400 uppercase mb-1">Category</div>
                              <div className="text-xs text-slate-600">{wb.category} / {wb.phase}</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-slate-400 uppercase mb-1">Filename</div>
                              <div className="text-xs text-slate-600 font-mono">{wb.filename}</div>
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-400 uppercase mb-1">Intended Outcome</div>
                            <div className="text-xs text-slate-600">{wb.intended_outcome}</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-400 uppercase mb-1">First Question</div>
                            <div className="text-xs text-[#00d4ff]">{wb.first_question}</div>
                          </div>
                          {wb.sheets_summary && (
                            <div>
                              <div className="text-[10px] text-slate-400 uppercase mb-1">Sheets</div>
                              <div className="text-xs text-slate-500">{wb.sheets_summary}</div>
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-[10px] text-slate-400 uppercase mb-1">How to Consume</div>
                              <div className="text-xs text-slate-500">{wb.how_to_consume}</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-slate-400 uppercase mb-1">Routing Rule</div>
                              <div className="text-xs text-slate-500">{wb.routing_rule}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {workbooks.length === 0 && <EmptyState icon={BookOpen} label="No workbooks seeded yet" />}
              </div>
            )}

            {/* AGENTS */}
            {tab === "agents" && (
              <div className="space-y-2">
                {agents.map((ag) => {
                  const isOpen = expanded === ag.id;
                  return (
                    <div key={ag.id} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                      <button
                        onClick={() => setExpanded(isOpen ? null : ag.id)}
                        className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition text-left"
                      >
                        {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />}
                        <span className="text-xs font-mono text-[#00d4ff] shrink-0">{ag.agent_id}</span>
                        <span className="text-sm font-semibold flex-1 truncate text-slate-800">{ag.agent_name}</span>
                        <Badge className="bg-purple-50 text-purple-600 border-purple-200">{ag.pod}</Badge>
                        <Badge className={STATUS_COLORS[ag.installation_state] || "border-slate-200"}>{ag.installation_state}</Badge>
                      </button>
                      {isOpen && (
                        <div className="border-t border-slate-100 p-4 space-y-3 bg-slate-50/50">
                          <div className="grid grid-cols-2 gap-4">
                            <div><div className="text-[10px] text-slate-400 uppercase mb-1">Inputs</div><div className="text-xs text-slate-600">{ag.inputs}</div></div>
                            <div><div className="text-[10px] text-slate-400 uppercase mb-1">Tool Route</div><div className="text-xs text-slate-600">{ag.tool_route}</div></div>
                          </div>
                          <div><div className="text-[10px] text-slate-400 uppercase mb-1">Allowed Authority</div><div className="text-xs text-slate-500">{ag.allowed_authority}</div></div>
                          <div><div className="text-[10px] text-slate-400 uppercase mb-1">Definition of Success</div><div className="text-xs text-emerald-600">{ag.definition_of_success}</div></div>
                          <div><div className="text-[10px] text-slate-400 uppercase mb-1">Required Proof</div><div className="text-xs text-slate-500">{ag.required_proof}</div></div>
                          <div><div className="text-[10px] text-slate-400 uppercase mb-1">Failure / Escalation</div><div className="text-xs text-red-500">{ag.failure_escalation}</div></div>
                          {ag.system_prompt && (
                            <div>
                              <div className="text-[10px] text-slate-400 uppercase mb-1">System Prompt</div>
                              <pre className="text-[10px] text-slate-500 bg-slate-100 rounded-lg p-3 max-h-48 overflow-y-auto whitespace-pre-wrap font-mono border border-slate-200">{ag.system_prompt}</pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                {agents.length === 0 && <EmptyState icon={Users} label="No agent playbooks seeded yet" />}
              </div>
            )}

            {/* QUESTIONS */}
            {tab === "questions" && (
              <div className="space-y-2">
                {questions.map((q) => (
                  <div key={q.id} className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-mono text-[#00d4ff] shrink-0 mt-0.5">{q.question_id}</span>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-slate-800 mb-1">{q.question}</div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge className="bg-cyan-50 text-cyan-600 border-cyan-200">{q.intelligence_area}</Badge>
                          {q.priority && <Badge className={PRIORITY_COLORS[q.priority]}>{q.priority}</Badge>}
                          <Badge className={STATUS_COLORS[q.answer_status] || "border-slate-200"}>{q.answer_status}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div><span className="text-slate-400">Evidence: </span><span className="text-slate-600">{q.required_evidence}</span></div>
                          <div><span className="text-slate-400">Verify: </span><span className="text-slate-600">{q.verification_method}</span></div>
                        </div>
                        {q.answer && (
                          <div className="mt-2 rounded-lg bg-emerald-50 border border-emerald-200 p-2 text-xs text-emerald-700">
                            <span className="font-bold">Answer: </span>{q.answer}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {questions.length === 0 && <EmptyState icon={HelpCircle} label="No questions seeded yet" />}
              </div>
            )}

            {/* KEYWORDS */}
            {tab === "keywords" && (
              <div className="space-y-2">
                {keywords.map((kw) => (
                  <div key={kw.id} className="rounded-xl border border-slate-200 bg-white shadow-sm p-3 flex items-center gap-3">
                    <span className="text-xs font-mono text-[#00d4ff] shrink-0">{kw.keyword_id}</span>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-slate-800">{kw.search_phrase}</div>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        {kw.industry && <Badge className="bg-blue-50 text-blue-600 border-blue-200">{kw.industry}</Badge>}
                        {kw.intent && <Badge className="bg-purple-50 text-purple-600 border-purple-200">{kw.intent}</Badge>}
                        {kw.modifier_group && <Badge className="bg-cyan-50 text-cyan-600 border-cyan-200">{kw.modifier_group}</Badge>}
                        <Badge className={STATUS_COLORS[kw.status] || "border-slate-200"}>{kw.status}</Badge>
                      </div>
                    </div>
                    {kw.monthly_searches != null && (
                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-700">{kw.monthly_searches.toLocaleString()}</div>
                        <div className="text-[9px] text-slate-400">monthly</div>
                      </div>
                    )}
                  </div>
                ))}
                {keywords.length === 0 && <EmptyState icon={Search} label="No keywords seeded yet" />}
              </div>
            )}

            {/* RISKS */}
            {tab === "risks" && (
              <div className="space-y-2">
                {risks.map((r) => (
                  <div key={r.id} className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
                    <div className="flex items-start gap-3 mb-2">
                      <span className="text-xs font-mono text-[#00d4ff] shrink-0 mt-0.5">{r.risk_id}</span>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-slate-800">{r.risk}</div>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <Badge className="bg-slate-50 text-slate-600 border-slate-200">{r.control_stage}</Badge>
                          <Badge className={r.default_severity === "HIGH" || r.default_severity === "CRITICAL" ? "bg-red-50 text-red-600 border-red-200" : "bg-amber-50 text-amber-600 border-amber-200"}>{r.default_severity}</Badge>
                          <Badge className={STATUS_COLORS[r.status] || "border-slate-200"}>{r.status}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div><span className="text-slate-400">Failure: </span><span className="text-red-500">{r.failure_scenario}</span></div>
                      <div><span className="text-slate-400">Mitigation: </span><span className="text-emerald-600">{r.mitigation}</span></div>
                      <div><span className="text-slate-400">Owner: </span><span className="text-slate-600">{r.owner}</span></div>
                    </div>
                  </div>
                ))}
                {risks.length === 0 && <EmptyState icon={Shield} label="No risks seeded yet" />}
              </div>
            )}

            {/* METRICS */}
            {tab === "metrics" && (
              <div className="space-y-2">
                {metrics.map((m) => (
                  <div key={m.id} className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-mono text-[#00d4ff] shrink-0">{m.metric_id}</span>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-slate-800">{m.kpi}</div>
                        <div className="text-[10px] text-slate-400">{m.area}</div>
                      </div>
                      <Badge className={STATUS_COLORS[m.status] || "border-slate-200"}>{m.status}</Badge>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div><span className="text-slate-400">Definition: </span><span className="text-slate-600">{m.definition}</span></div>
                      <div><span className="text-slate-400">Source: </span><span className="text-[#00d4ff]">{m.authoritative_source}</span></div>
                      <div><span className="text-slate-400">Honesty: </span><span className="text-amber-600">{m.statistical_honesty}</span></div>
                    </div>
                  </div>
                ))}
                {metrics.length === 0 && <EmptyState icon={Gauge} label="No metrics seeded yet" />}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, label }) {
  return (
    <div className="text-center py-16">
      <Icon className="w-10 h-10 text-slate-200 mx-auto mb-3" />
      <p className="text-sm text-slate-400">{label}</p>
      <p className="text-xs text-slate-300 mt-1">Click "Seed Intelligence" to populate from the workbook suite</p>
    </div>
  );
}