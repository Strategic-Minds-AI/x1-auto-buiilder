import { useState, useMemo } from "react";
import {
  ShieldCheck, Sparkles, Rocket, Clock, Plug, Activity, Library, Brain,
  Lock, Users, Factory, Palette, Code, FileText, CheckCircle2, XCircle,
  AlertTriangle, Circle, Flag, TrendingUp, Target, ListChecks,
} from "lucide-react";
import {
  OFFICIAL_FINISH_CRITERIA,
  AUDIT_CATEGORIES,
  KNOWN_ISSUES,
  STATUS_CONFIG,
} from "@/data/productionReadinessChecklist";

const ICON_MAP = {
  ShieldCheck, Sparkles, Rocket, Clock, Plug, Activity, Library, Brain,
  Lock, Users, Factory, Palette, Code, FileText,
};

export default function ProductionReadinessAudit() {
  const [filter, setFilter] = useState("all"); // all | done | partial | blocked | not_started
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Flatten all items
  const allItems = useMemo(() => {
    return AUDIT_CATEGORIES.flatMap((cat) =>
      cat.items.map((item) => ({ ...item, categoryId: cat.id, categoryName: cat.name }))
    );
  }, []);

  // Overall stats
  const stats = useMemo(() => {
    const total = allItems.length;
    const done = allItems.filter((i) => i.status === "done").length;
    const partial = allItems.filter((i) => i.status === "partial").length;
    const blocked = allItems.filter((i) => i.status === "blocked").length;
    const notStarted = allItems.filter((i) => i.status === "not_started").length;
    const pct = Math.round((done / total) * 100);
    const remaining = total - done;
    return { total, done, partial, blocked, notStarted, pct, remaining };
  }, [allItems]);

  // Per-category stats
  const categoryStats = useMemo(() => {
    return AUDIT_CATEGORIES.map((cat) => {
      const done = cat.items.filter((i) => i.status === "done").length;
      const total = cat.items.length;
      const blocked = cat.items.filter((i) => i.status === "blocked").length;
      const notStarted = cat.items.filter((i) => i.status === "not_started").length;
      const partial = cat.items.filter((i) => i.status === "partial").length;
      return {
        ...cat,
        doneCount: done,
        totalCount: total,
        pct: Math.round((done / total) * 100),
        blocked,
        notStarted,
        partial,
      };
    });
  }, []);

  // Blocked issues count
  const blockedCount = KNOWN_ISSUES.filter((i) => i.status === "blocked").length;
  const notStartedCount = KNOWN_ISSUES.filter((i) => i.status === "not_started").length;

  // Official finish line: all items done + 0 blocked + 0 not_started
  const isFinished = stats.done === stats.total && blockedCount === 0 && notStartedCount === 0;

  const filteredItems = (catId) => {
    const cat = AUDIT_CATEGORIES.find((c) => c.id === catId);
    if (!cat) return [];
    if (filter === "all") return cat.items;
    return cat.items.filter((i) => i.status === filter);
  };

  return (
    <div className="px-4 sm:px-6 py-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${isFinished ? "bg-emerald-500" : "bg-gradient-to-br from-[#00d4ff] to-[#0066ff]"}`}>
          {isFinished ? <CheckCircle2 className="w-6 h-6 text-white" /> : <Target className="w-6 h-6 text-[#0a0e14]" />}
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900">Production Readiness Audit</h1>
          <p className="text-xs sm:text-sm text-slate-500">Deep forensic audit · official finish line · full operational checklist</p>
        </div>
      </div>

      {/* Official Finish Line banner */}
      <div className={`rounded-2xl border p-5 mb-6 ${isFinished ? "bg-emerald-50 border-emerald-300" : "bg-slate-900 border-slate-700"}`}>
        <div className="flex items-center gap-2 mb-3">
          <Flag className={`w-5 h-5 ${isFinished ? "text-emerald-600" : "text-[#00d4ff]"}`} />
          <h2 className={`text-sm font-black ${isFinished ? "text-emerald-700" : "text-[#00d4ff]"}`}>
            {isFinished ? "SYSTEM IS PRODUCTION READY" : "OFFICIAL FINISH LINE — Not Yet Reached"}
          </h2>
        </div>
        <p className={`text-xs mb-4 ${isFinished ? "text-emerald-700" : "text-slate-300"}`}>
          The system is officially production and operation ready when ALL of the following are true:
        </p>
        <div className="space-y-1.5">
          {OFFICIAL_FINISH_CRITERIA.map((crit, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className={`text-xs font-bold mt-0.5 shrink-0 ${isFinished ? "text-emerald-500" : "text-slate-500"}`}>{i + 1}.</span>
              <span className={`text-xs ${isFinished ? "text-emerald-800" : "text-slate-300"}`}>{crit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Overall progress */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#00d4ff]" />
            <span className="text-sm font-bold text-slate-700">Overall Completion</span>
          </div>
          <span className="text-2xl font-black text-slate-900">{stats.pct}%</span>
        </div>
        <div className="h-3 rounded-full bg-slate-100 overflow-hidden mb-3">
          <div
            className={`h-full rounded-full transition-all duration-700 ${isFinished ? "bg-emerald-500" : "bg-gradient-to-r from-[#00d4ff] to-[#0066ff]"}`}
            style={{ width: `${stats.pct}%` }}
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <StatPill label="Total Items" value={stats.total} color="text-slate-700" />
          <StatPill label="Done" value={stats.done} color="text-emerald-600" />
          <StatPill label="In Progress" value={stats.partial} color="text-amber-600" />
          <StatPill label="Blocked" value={stats.blocked} color="text-red-500" />
          <StatPill label="Remaining" value={stats.notStarted} color="text-slate-500" />
        </div>
      </div>

      {/* Known issues summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <span className="text-sm font-bold text-slate-700">Known Issues & Blockers</span>
          <span className="text-xs text-slate-400">({KNOWN_ISSUES.length})</span>
        </div>
        <div className="space-y-2">
          {KNOWN_ISSUES.map((issue) => {
            const cfg = STATUS_CONFIG[issue.status] || STATUS_CONFIG.not_started;
            return (
              <div key={issue.id} className={`rounded-xl border ${cfg.border} ${cfg.bg} p-3`}>
                <div className="flex items-start gap-2">
                  <span className={`w-2 h-2 rounded-full ${cfg.dot} mt-1.5 shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className={`text-xs font-bold ${cfg.color}`}>{cfg.label}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        issue.severity === "critical" ? "bg-red-600 text-white" :
                        issue.severity === "high" ? "bg-red-100 text-red-700" :
                        issue.severity === "medium" ? "bg-amber-100 text-amber-700" :
                        "bg-slate-100 text-slate-600"
                      }`}>{issue.severity.toUpperCase()}</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-800">{issue.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{issue.impact}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
        <FilterTab active={filter === "all"} onClick={() => setFilter("all")}>All</FilterTab>
        <FilterTab active={filter === "done"} onClick={() => setFilter("done")}>Done ({stats.done})</FilterTab>
        <FilterTab active={filter === "partial"} onClick={() => setFilter("partial")}>In Progress ({stats.partial})</FilterTab>
        <FilterTab active={filter === "blocked"} onClick={() => setFilter("blocked")}>Blocked ({stats.blocked})</FilterTab>
        <FilterTab active={filter === "not_started"} onClick={() => setFilter("not_started")}>Remaining ({stats.notStarted})</FilterTab>
      </div>

      {/* Category breakdown */}
      <div className="space-y-3">
        {categoryStats.map((cat) => {
          const Icon = ICON_MAP[cat.icon] || ListChecks;
          const isExpanded = expandedCategory === cat.id || filter !== "all";
          const visibleItems = filteredItems(cat.id);
          const hasVisible = visibleItems.length > 0;
          const catIsComplete = cat.pct === 100;

          return (
            <div key={cat.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              {/* Category header */}
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : cat.id)}
                className="w-full flex items-center gap-3 px-4 sm:px-5 py-4 hover:bg-slate-50 transition text-left"
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${catIsComplete ? "bg-emerald-100" : "bg-slate-100"}`}>
                  {catIsComplete ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <Icon className="w-5 h-5 text-slate-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-slate-800">{cat.name}</div>
                  <div className="text-xs text-slate-400">
                    {cat.doneCount}/{cat.totalCount} done
                    {cat.blocked > 0 && <span className="text-red-500"> · {cat.blocked} blocked</span>}
                    {cat.notStarted > 0 && <span className="text-slate-400"> · {cat.notStarted} remaining</span>}
                    {cat.partial > 0 && <span className="text-amber-600"> · {cat.partial} in progress</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="hidden sm:block w-24">
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className={`h-full rounded-full ${catIsComplete ? "bg-emerald-500" : "bg-[#00d4ff]"}`} style={{ width: `${cat.pct}%` }} />
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-500 w-8 text-right">{cat.pct}%</span>
                </div>
              </button>

              {/* Items list */}
              {isExpanded && hasVisible && (
                <div className="border-t border-slate-100 divide-y divide-slate-50">
                  {visibleItems.map((item) => {
                    const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.not_started;
                    return (
                      <div key={item.id} className="flex items-start gap-3 px-4 sm:px-5 py-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                          item.status === "done" ? "border-emerald-500 bg-emerald-500" :
                          item.status === "partial" ? "border-amber-500" :
                          item.status === "blocked" ? "border-red-500" :
                          "border-slate-300"
                        }`}>
                          {item.status === "done" && <CheckCircle2 className="w-3 h-3 text-white" />}
                          {item.status === "partial" && <Circle className="w-2 h-2 text-amber-500" fill="currentColor" />}
                          {item.status === "blocked" && <XCircle className="w-3 h-3 text-red-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-slate-800">{item.name}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                          </div>
                          {item.description && <div className="text-xs text-slate-500 mt-0.5">{item.description}</div>}
                          {item.evidence && (
                            <div className="text-xs text-slate-400 mt-1 italic">
                              {item.status === "done" ? "✓ " : item.status === "blocked" ? "⚠ " : "→ "}
                              {item.evidence}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {isExpanded && !hasVisible && (
                <div className="border-t border-slate-100 px-5 py-6 text-center text-sm text-slate-400">
                  No items match this filter in this category.
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom summary */}
      <div className="mt-6 bg-slate-900 rounded-2xl p-5 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Target className="w-5 h-5 text-[#00d4ff]" />
          <span className="text-sm font-bold text-white">Audit Summary</span>
        </div>
        <p className="text-sm text-slate-300 mb-1">
          {stats.done} of {stats.total} items complete · {stats.remaining} remaining
        </p>
        <p className="text-xs text-slate-400">
          {blockedCount > 0 && `${blockedCount} blocked issues must be resolved · `}
          {notStartedCount > 0 && `${notStartedCount} items not yet started · `}
          {isFinished
            ? "All criteria met — system is production ready."
            : "System is NOT yet production ready. Resolve all blockers and remaining items to reach the official finish line."}
        </p>
      </div>
    </div>
  );
}

function StatPill({ label, value, color }) {
  return (
    <div className="text-center bg-slate-50 rounded-xl py-2 px-1">
      <div className={`text-xl font-black ${color}`}>{value}</div>
      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{label}</div>
    </div>
  );
}

function FilterTab({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-xs font-bold whitespace-nowrap transition ${
        active ? "bg-[#00d4ff] text-[#0a0e14]" : "bg-white border border-slate-200 text-slate-600 hover:border-[#00d4ff]/40"
      }`}
    >
      {children}
    </button>
  );
}