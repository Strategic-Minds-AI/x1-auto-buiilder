import { useState, useMemo } from "react";
import { ALL_SECTIONS, TOTAL_ITEMS, STATUS_OPTIONS, GENERATOR_OUTPUTS } from "@/data/projectStartInventory";
import { ClipboardList, Search, CheckCircle2, XCircle, AlertTriangle, HelpCircle, Ban, Clock, Rocket, FileJson, FileText, ChevronDown, ChevronRight } from "lucide-react";

const STATUS_ICONS = {
  VERIFIED: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-200" },
  MISSING: { icon: XCircle, color: "text-red-500", bg: "bg-red-50", border: "border-red-200" },
  UNKNOWN: { icon: HelpCircle, color: "text-slate-400", bg: "bg-slate-50", border: "border-slate-200" },
  BLOCKED: { icon: Ban, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-200" },
  NOT_APPLICABLE: { icon: CheckCircle2, color: "text-slate-400", bg: "bg-slate-50", border: "border-slate-200" },
  STALE: { icon: Clock, color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-200" },
};

const REQ_COLORS = {
  REQUIRED: "bg-red-100 text-red-600",
  CONDITIONAL: "bg-amber-100 text-amber-600",
  "N/A": "bg-slate-100 text-slate-400",
};

export default function ProjectStartInventory() {
  const [expandedSections, setExpandedSections] = useState(new Set([0, 1, 2]));
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const toggleSection = (idx) => {
    const next = new Set(expandedSections);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setExpandedSections(next);
  };

  const filteredSections = useMemo(() => {
    return ALL_SECTIONS.map((section, idx) => ({
      ...section,
      idx,
      items: section.items.filter((item) => {
        const matchesSearch = !search ||
          item.id.toLowerCase().includes(search.toLowerCase()) ||
          item.expectedValue.toLowerCase().includes(search.toLowerCase()) ||
          item.category.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    }));
  }, [search, statusFilter]);

  const stats = useMemo(() => {
    const all = ALL_SECTIONS.flatMap((s) => s.items);
    return {
      total: all.length,
      verified: all.filter((i) => i.status === "VERIFIED").length,
      missing: all.filter((i) => i.status === "MISSING").length,
      unknown: all.filter((i) => i.status === "UNKNOWN").length,
      blocked: all.filter((i) => i.status === "BLOCKED").length,
      na: all.filter((i) => i.status === "NOT_APPLICABLE").length,
    };
  }, []);

  const bootstrapReady = stats.unknown === 0 && stats.missing === 0 && stats.blocked === 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0a0e14] to-[#0d1b2a] text-white">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center">
              <ClipboardList className="w-7 h-7 text-[#0a0e14]" />
            </div>
            <div>
              <h1 className="text-2xl font-black">Universal Project Start Inventory</h1>
              <p className="text-sm text-white/60">Every project receives this inventory. No blank boxes. Every item VERIFIED or NOT_APPLICABLE before BOOTSTRAP_READY.</p>
            </div>
          </div>

          {/* Bootstrap status */}
          <div className={`mt-4 rounded-xl p-4 flex items-center gap-3 ${bootstrapReady ? "bg-emerald-500/20 border border-emerald-400/40" : "bg-amber-500/20 border border-amber-400/40"}`}>
            {bootstrapReady ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-amber-400" />
            )}
            <div>
              <div className="font-bold text-sm">
                {bootstrapReady ? "BOOTSTRAP_READY" : "BOOTSTRAP NOT READY"}
              </div>
              <div className="text-xs text-white/60">
                {bootstrapReady
                  ? "All mandatory items are VERIFIED or NOT_APPLICABLE. Project can advance."
                  : `${stats.unknown} UNKNOWN, ${stats.missing} MISSING, ${stats.blocked} BLOCKED — must resolve before bootstrap.`}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
          <StatCard label="Total Items" value={stats.total} color="slate" />
          <StatCard label="Verified" value={stats.verified} color="emerald" />
          <StatCard label="Missing" value={stats.missing} color="red" />
          <StatCard label="Unknown" value={stats.unknown} color="slate" />
          <StatCard label="Blocked" value={stats.blocked} color="amber" />
          <StatCard label="N/A" value={stats.na} color="slate" />
        </div>

        {/* Generator section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Rocket className="w-5 h-5 text-[#00d4ff]" />
            <h2 className="text-lg font-black text-slate-900">Project Start Generator</h2>
          </div>
          <p className="text-sm text-slate-500 mb-4">
            Invocation: <code className="text-xs bg-slate-100 px-2 py-1 rounded">GPT Builder Factory, start a project.</code> Generates all outputs below, then issues <code className="text-xs bg-slate-100 px-2 py-1 rounded">BOOTSTRAP_READY</code> only after every mandatory item is VERIFIED or NOT_APPLICABLE.
          </p>
          <div className="flex flex-wrap gap-2">
            {GENERATOR_OUTPUTS.map((output) => (
              <span key={output} className="text-xs px-3 py-1.5 rounded-full bg-[#00d4ff]/10 text-[#0066ff] font-medium border border-[#00d4ff]/20">
                {output}
              </span>
            ))}
          </div>
        </div>

        {/* Deliverables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-2">
              <FileJson className="w-4 h-4 text-[#00d4ff]" />
              <h3 className="text-sm font-bold text-slate-700">Machine-Readable</h3>
            </div>
            <code className="text-xs text-slate-500 bg-slate-50 rounded-lg p-2 block">00_CONTROL_PLANE/PROJECT_START_INVENTORY.json</code>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-[#00d4ff]" />
              <h3 className="text-sm font-bold text-slate-700">Human-Readable</h3>
            </div>
            <code className="text-xs text-slate-500 bg-slate-50 rounded-lg p-2 block">00_CONTROL_PLANE/PROJECT_START_CHECKLIST.md</code>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search items by ID, category, or expected value..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/40"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/40"
          >
            <option value="ALL">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Sections */}
        <div className="space-y-3">
          {filteredSections.map((section) => {
            const isExpanded = expandedSections.has(section.idx);
            const verifiedCount = section.items.filter((i) => i.status === "VERIFIED" || i.status === "NOT_APPLICABLE").length;
            const progress = section.items.length > 0 ? Math.round((verifiedCount / section.items.length) * 100) : 0;

            return (
              <div key={section.idx} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <button
                  onClick={() => toggleSection(section.idx)}
                  className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-3 text-left">
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400">SECTION {section.idx + 1}</span>
                        <h3 className="text-sm font-bold text-slate-900">{section.title}</h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{section.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-bold text-slate-500">{verifiedCount}/{section.items.length}</span>
                    <div className="w-16 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-slate-100 overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-400 uppercase tracking-wide">
                          <th className="text-left px-4 py-2 font-bold">ID</th>
                          <th className="text-left px-4 py-2 font-bold">Req</th>
                          <th className="text-left px-4 py-2 font-bold">Expected Value</th>
                          <th className="text-left px-4 py-2 font-bold">Source</th>
                          <th className="text-left px-4 py-2 font-bold">Owner</th>
                          <th className="text-left px-4 py-2 font-bold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {section.items.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center py-6 text-slate-400">No items match your filters</td>
                          </tr>
                        ) : (
                          section.items.map((item) => {
                            const StatusIcon = STATUS_ICONS[item.status] || STATUS_ICONS.UNKNOWN;
                            return (
                              <tr key={item.id} className="border-t border-slate-50 hover:bg-slate-50/50">
                                <td className="px-4 py-2.5 font-mono font-bold text-slate-600 whitespace-nowrap">{item.id}</td>
                                <td className="px-4 py-2.5">
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${REQ_COLORS[item.requirement] || REQ_COLORS["N/A"]}`}>
                                    {item.requirement}
                                  </span>
                                </td>
                                <td className="px-4 py-2.5 text-slate-700 max-w-xs">{item.expectedValue}</td>
                                <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap">{item.source}</td>
                                <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap">{item.owner}</td>
                                <td className="px-4 py-2.5">
                                  <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold border ${StatusIcon.bg} ${StatusIcon.border} ${StatusIcon.color}`}>
                                    <StatusIcon.icon className="w-3 h-3" />
                                    {item.status}
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  const colors = {
    slate: "text-slate-600",
    emerald: "text-emerald-600",
    red: "text-red-600",
    amber: "text-amber-600",
  };
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 text-center">
      <div className={`text-2xl font-black ${colors[color] || colors.slate}`}>{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
    </div>
  );
}