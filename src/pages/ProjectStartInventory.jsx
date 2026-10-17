import { useState, useEffect } from "react";
import PortalShell from "@/components/portal/PortalShell";
import BlueprintSelector from "@/components/portal/BlueprintSelector";
import { base44 } from "@/api/base44Client";
import { ALL_SECTIONS, STATUS_OPTIONS, TOTAL_ITEMS } from "@/data/projectStartInventory";
import {
  ClipboardList, Plus, Loader2, CheckCircle2, XCircle, AlertTriangle,
  HelpCircle, Ban, Clock, Search, ChevronDown, ChevronRight, Bot, FileText,
  Save, FolderOpen, Trash2, Rocket,
} from "lucide-react";

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

function deepCloneTemplate() {
  return JSON.parse(JSON.stringify(ALL_SECTIONS));
}

function calcStats(sections) {
  const all = sections.flatMap((s) => s.items);
  return {
    total: all.length,
    verified: all.filter((i) => i.status === "VERIFIED").length,
    missing: all.filter((i) => i.status === "MISSING").length,
    unknown: all.filter((i) => i.status === "UNKNOWN").length,
    blocked: all.filter((i) => i.status === "BLOCKED").length,
    na: all.filter((i) => i.status === "NOT_APPLICABLE").length,
  };
}

export default function ProjectStartInventory() {
  const [inventories, setInventories] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedInv, setSelectedInv] = useState(null);
  const [view, setView] = useState("user");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newClient, setNewClient] = useState("");
  const [expandedSections, setExpandedSections] = useState(new Set([0, 1, 2]));
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [saving, setSaving] = useState(false);

  const loadInventories = async () => {
    try {
      const page = await base44.entities.ProjectInventory.filter({}, { sort: "-created_date", limit: 50 });
      setInventories(page.items || []);
    } catch { }
    finally { setLoading(false); }
  };

  const loadSelected = async (id) => {
    try {
      const inv = await base44.entities.ProjectInventory.get(id);
      setSelectedInv(inv);
    } catch { }
  };

  useEffect(() => { loadInventories(); }, []);
  useEffect(() => { if (selectedId) loadSelected(selectedId); }, [selectedId]);

  const createInventory = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const template = deepCloneTemplate();
      const stats = calcStats(template);
      const inv = await base44.entities.ProjectInventory.create({
        project_name: newName.trim(),
        client_name: newClient.trim(),
        inventory_data: { sections: template },
        bootstrap_ready: false,
        stats,
        template_version: "v1",
        status: "active",
        current_gate: "GATE 00",
      });
      setNewName("");
      setNewClient("");
      loadInventories();
      setSelectedId(inv.id);
    } catch { }
    finally { setCreating(false); }
  };

  const updateItem = (sectionIdx, itemId, field, value) => {
    if (!selectedInv) return;
    const sections = JSON.parse(JSON.stringify(selectedInv.inventory_data.sections));
    const section = sections[sectionIdx];
    const item = section.items.find((i) => i.id === itemId);
    if (!item) return;
    item[field] = value;
    if (field === "status" && value === "VERIFIED") {
      item.lastVerified = new Date().toISOString();
    }
    const stats = calcStats(sections);
    const bootstrapReady = stats.unknown === 0 && stats.missing === 0 && stats.blocked === 0;
    setSelectedInv({ ...selectedInv, inventory_data: { sections }, stats, bootstrap_ready: bootstrapReady });
  };

  const saveInventory = async () => {
    if (!selectedInv) return;
    setSaving(true);
    try {
      await base44.entities.ProjectInventory.update(selectedInv.id, {
        inventory_data: selectedInv.inventory_data,
        stats: selectedInv.stats,
        bootstrap_ready: selectedInv.bootstrap_ready,
      });
    } catch { }
    finally { setSaving(false); }
  };

  const deleteInventory = async (id) => {
    try {
      await base44.entities.ProjectInventory.delete(id);
      if (selectedId === id) { setSelectedId(null); setSelectedInv(null); }
      loadInventories();
    } catch { }
  };

  const toggleSection = (idx) => {
    const next = new Set(expandedSections);
    if (next.has(idx)) next.delete(idx); else next.add(idx);
    setExpandedSections(next);
  };

  const sections = selectedInv?.inventory_data?.sections || [];
  const stats = selectedInv?.stats || { total: 0, verified: 0, missing: 0, unknown: 0, blocked: 0, na: 0 };

  const filteredSections = sections.map((section, idx) => ({
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

  return (
    <PortalShell title="Project Start Inventory" activeTab="" onTabChange={() => {}} onNew={() => {}}>
      <div className="px-6 py-8 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-[#0a0e14]" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">Universal Project Start Inventory</h1>
            <p className="text-sm text-slate-500">Track status, verification, and blockers for every item. Template system for every project.</p>
          </div>
        </div>

        {/* Blueprint selector — load proven structures into the factory pipeline */}
        <BlueprintSelector />

        {/* Create new inventory */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Plus className="w-4 h-4 text-[#00d4ff]" />
            <h3 className="text-sm font-bold text-slate-700">Create New Project Inventory from Template</h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/40"
              placeholder="Project name (e.g. Epoxy Flooring Dallas)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <input
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/40"
              placeholder="Client name (optional)"
              value={newClient}
              onChange={(e) => setNewClient(e.target.value)}
            />
            <button
              onClick={createInventory}
              disabled={creating || !newName.trim()}
              className="inline-flex items-center gap-2 rounded-full bg-[#00d4ff] px-5 py-2.5 text-sm font-bold text-[#0a0e14] hover:brightness-110 disabled:opacity-50 transition"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Instantiate Template
            </button>
          </div>
        </div>

        {/* Inventory list */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-[#00d4ff]" />
          </div>
        ) : inventories.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <FolderOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No project inventories yet. Create one above to instantiate the template.</p>
          </div>
        ) : (
          <>
            {/* Project selector */}
            <div className="flex flex-wrap gap-2 mb-6">
              {inventories.map((inv) => (
                <button
                  key={inv.id}
                  onClick={() => setSelectedId(inv.id)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    selectedId === inv.id
                      ? "bg-[#00d4ff] text-[#0a0e14]"
                      : "bg-white border border-slate-200 text-slate-600 hover:border-[#00d4ff]/40"
                  }`}
                >
                  {inv.bootstrap_ready && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                  {inv.project_name}
                  {inv.client_name && <span className="text-xs opacity-60">— {inv.client_name}</span>}
                </button>
              ))}
            </div>

            {/* Selected inventory detail */}
            {selectedInv && (
              <>
                {/* View toggle */}
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                  <div className="flex gap-2">
                    <ViewButton active={view === "user"} onClick={() => setView("user")} icon={ClipboardList}>User Checklist</ViewButton>
                    <ViewButton active={view === "agent"} onClick={() => setView("agent")} icon={Bot}>Agent View</ViewButton>
                    <ViewButton active={view === "template"} onClick={() => setView("template")} icon={FileText}>Template System</ViewButton>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={saveInventory}
                      disabled={saving}
                      className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700 disabled:opacity-50 transition"
                    >
                      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      Save
                    </button>
                    <button
                      onClick={() => deleteInventory(selectedInv.id)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Bootstrap status banner */}
                <div className={`rounded-xl p-4 mb-4 flex items-center gap-3 ${
                  selectedInv.bootstrap_ready
                    ? "bg-emerald-50 border border-emerald-200"
                    : "bg-amber-50 border border-amber-200"
                }`}>
                  {selectedInv.bootstrap_ready
                    ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    : <AlertTriangle className="w-5 h-5 text-amber-500" />}
                  <div>
                    <div className="font-bold text-sm">
                      {selectedInv.bootstrap_ready ? "BOOTSTRAP_READY" : "BOOTSTRAP NOT READY"}
                    </div>
                    <div className="text-xs text-slate-500">
                      {stats.verified + stats.na}/{stats.total} resolved — {stats.unknown} UNKNOWN, {stats.missing} MISSING, {stats.blocked} BLOCKED
                    </div>
                  </div>
                  {selectedInv.bootstrap_ready && (
                    <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white">
                      <Rocket className="w-3.5 h-3.5" /> READY
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
                  <StatCard label="Total" value={stats.total} color="slate" />
                  <StatCard label="Verified" value={stats.verified} color="emerald" />
                  <StatCard label="Missing" value={stats.missing} color="red" />
                  <StatCard label="Unknown" value={stats.unknown} color="slate" />
                  <StatCard label="Blocked" value={stats.blocked} color="amber" />
                  <StatCard label="N/A" value={stats.na} color="slate" />
                </div>

                {/* USER VIEW — interactive checklist */}
                {view === "user" && (
                  <>
                    <div className="flex flex-col sm:flex-row gap-3 mb-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search items..."
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
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div className="space-y-3">
                      {filteredSections.map((section) => {
                        const isExpanded = expandedSections.has(section.idx);
                        const verifiedCount = section.items.filter((i) => i.status === "VERIFIED" || i.status === "NOT_APPLICABLE").length;
                        const progress = section.items.length > 0 ? Math.round((verifiedCount / section.items.length) * 100) : 0;
                        return (
                          <div key={section.idx} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                            <button
                              onClick={() => toggleSection(section.idx)}
                              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition"
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
                            {isExpanded && section.items.length > 0 && (
                              <div className="border-t border-slate-100 divide-y divide-slate-50">
                                {section.items.map((item) => {
                                  const StatusIcon = STATUS_ICONS[item.status] || STATUS_ICONS.UNKNOWN;
                                  return (
                                    <div key={item.id} className="p-4 hover:bg-slate-50/50">
                                      <div className="flex items-start gap-3">
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <code className="text-xs font-mono font-bold text-slate-600">{item.id}</code>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${REQ_COLORS[item.requirement] || REQ_COLORS["N/A"]}`}>
                                              {item.requirement}
                                            </span>
                                          </div>
                                          <p className="text-sm text-slate-700 font-medium">{item.expectedValue}</p>
                                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                                            <span>Source: {item.source}</span>
                                            <span>Owner: {item.owner}</span>
                                            <span>Verify: {item.verificationMethod}</span>
                                          </div>
                                          {item.blocker && (
                                            <div className="mt-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs text-amber-700">
                                              <span className="font-bold">Blocker:</span> {item.blocker}
                                            </div>
                                          )}
                                        </div>
                                        <div className="shrink-0 w-40">
                                          <select
                                            value={item.status}
                                            onChange={(e) => updateItem(section.idx, item.id, "status", e.target.value)}
                                            className={`w-full text-xs font-bold rounded-lg border px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/40 ${STATUS_ICONS[item.status]?.border || "border-slate-200"} ${STATUS_ICONS[item.status]?.bg || "bg-white"} ${STATUS_ICONS[item.status]?.color || "text-slate-600"}`}
                                          >
                                            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                                          </select>
                                          {item.status === "BLOCKED" && (
                                            <input
                                              className="w-full mt-1.5 text-xs rounded-lg border border-amber-200 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                                              placeholder="Blocker description..."
                                              value={item.blocker || ""}
                                              onChange={(e) => updateItem(section.idx, item.id, "blocker", e.target.value)}
                                            />
                                          )}
                                          {item.status === "VERIFIED" && (
                                            <input
                                              className="w-full mt-1.5 text-xs rounded-lg border border-emerald-200 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                                              placeholder="Receipt ID..."
                                              value={item.receiptId || ""}
                                              onChange={(e) => updateItem(section.idx, item.id, "receiptId", e.target.value)}
                                            />
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* AGENT VIEW — compact, machine-readable */}
                {view === "agent" && <AgentView sections={sections} />}

                {/* TEMPLATE VIEW — the base template definition */}
                {view === "template" && <TemplateView />}
              </>
            )}
          </>
        )}
      </div>
    </PortalShell>
  );
}

function ViewButton({ active, onClick, icon: Icon, children }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
        active ? "bg-[#00d4ff] text-[#0a0e14]" : "bg-white border border-slate-200 text-slate-600 hover:border-[#00d4ff]/40"
      }`}
    >
      <Icon className="w-4 h-4" />
      {children}
    </button>
  );
}

function StatCard({ label, value, color }) {
  const colors = {
    slate: "text-slate-600", emerald: "text-emerald-600",
    red: "text-red-600", amber: "text-amber-600",
  };
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 text-center">
      <div className={`text-2xl font-black ${colors[color] || colors.slate}`}>{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
    </div>
  );
}

function AgentView({ sections }) {
  const agentGroups = {};
  sections.forEach((section) => {
    section.items.forEach((item) => {
      const owner = item.owner || "Unassigned";
      if (!agentGroups[owner]) agentGroups[owner] = [];
      agentGroups[owner].push({ ...item, section: section.title });
    });
  });

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Bot className="w-5 h-5 text-[#00d4ff]" />
          <h2 className="text-lg font-black text-slate-900">Agent Assignment Matrix</h2>
        </div>
        <p className="text-sm text-slate-500 mb-4">Every item grouped by responsible agent. Agents see their tasks and verification methods.</p>
        <div className="space-y-3">
          {Object.entries(agentGroups).sort(([a], [b]) => a.localeCompare(b)).map(([agent, items]) => {
            const verified = items.filter((i) => i.status === "VERIFIED" || i.status === "NOT_APPLICABLE").length;
            const blocked = items.filter((i) => i.status === "BLOCKED").length;
            return (
              <div key={agent} className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-bold text-slate-700">{agent}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-emerald-600">{verified} done</span>
                    {blocked > 0 && <span className="font-bold text-amber-600">{blocked} blocked</span>}
                    <span className="text-slate-400">{items.length} total</span>
                  </div>
                </div>
                <div className="divide-y divide-slate-50">
                  {items.map((item) => {
                    const StatusIcon = STATUS_ICONS[item.status] || STATUS_ICONS.UNKNOWN;
                    return (
                      <div key={item.id} className="px-4 py-2 flex items-center gap-3 text-xs">
                        <code className="font-mono font-bold text-slate-500 shrink-0">{item.id}</code>
                        <span className="text-slate-700 flex-1 truncate">{item.expectedValue}</span>
                        <span className="text-slate-400 shrink-0 hidden md:block">{item.verificationMethod}</span>
                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold border shrink-0 ${StatusIcon.bg} ${StatusIcon.border} ${StatusIcon.color}`}>
                          <StatusIcon.icon className="w-3 h-3" />
                          {item.status}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TemplateView() {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-5 h-5 text-[#00d4ff]" />
          <h2 className="text-lg font-black text-slate-900">Template System Definition</h2>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          This is the canonical template. Every new project instantiates a copy of this definition.
          {ALL_SECTIONS.length} sections, {TOTAL_ITEMS} total items. Each item has 12 fields: ID, Category, Requirement,
          Expected Value, Actual Value, Source, Owner, Verification Method, Status, Receipt ID, Blocker, Last Verified.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
          {ALL_SECTIONS.map((section, i) => (
            <div key={i} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <div className="text-[10px] font-bold text-slate-400">SECTION {i + 1}</div>
              <div className="text-xs font-bold text-slate-700">{section.title}</div>
              <div className="text-[10px] text-slate-400">{section.items.length} items</div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="text-sm font-bold text-slate-700 mb-3">Status Values (only these are valid)</h3>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((s) => {
            const StatusIcon = STATUS_ICONS[s] || STATUS_ICONS.UNKNOWN;
            return (
              <div key={s} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${StatusIcon.bg} ${StatusIcon.border} ${StatusIcon.color}`}>
                <StatusIcon.icon className="w-3.5 h-3.5" />
                {s}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}