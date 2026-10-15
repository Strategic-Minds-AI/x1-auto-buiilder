import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import BackButton from "@/components/shared/BackButton";
import PageHeader from "@/components/shared/PageHeader";
import { Plus, Loader2, Trash2, Edit2, Power, Save, X, MessageCircle, ExternalLink } from "lucide-react";

const CATEGORIES = [
  { value: "behavior", label: "Behavior", color: "bg-blue-100 text-blue-700" },
  { value: "restriction", label: "Restriction", color: "bg-red-100 text-red-700" },
  { value: "automation", label: "Automation", color: "bg-purple-100 text-purple-700" },
  { value: "personality", label: "Personality", color: "bg-amber-100 text-amber-700" },
  { value: "workflow", label: "Workflow", color: "bg-emerald-100 text-emerald-700" },
  { value: "custom", label: "Custom", color: "bg-slate-100 text-slate-700" },
];

export default function AgentInstructions() {
  const [instructions, setInstructions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", instruction_text: "", category: "custom", priority: 0, active: true });

  const load = async () => {
    setLoading(true);
    try {
      const page = await base44.entities.AgentInstruction.filter({}, { sort: "-priority", limit: 100 });
      setInstructions(page.items || []);
    } catch { setInstructions([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.title || !form.instruction_text) return;
    if (editing) {
      await base44.entities.AgentInstruction.update(editing.id, form);
    } else {
      await base44.entities.AgentInstruction.create(form);
    }
    setForm({ title: "", instruction_text: "", category: "custom", priority: 0, active: true });
    setEditing(null);
    setShowForm(false);
    load();
  };

  const toggle = async (inst) => {
    await base44.entities.AgentInstruction.update(inst.id, { active: !inst.active });
    load();
  };

  const remove = async (id) => {
    await base44.entities.AgentInstruction.delete(id);
    load();
  };

  const startEdit = (inst) => {
    setEditing(inst);
    setForm({ title: inst.title, instruction_text: inst.instruction_text, category: inst.category || "custom", priority: inst.priority || 0, active: inst.active });
    setShowForm(true);
  };

  const activeCount = instructions.filter(i => i.active).length;

  return (
    <div className="min-h-screen bg-white">
      <PageHeader title="Super Agent Instructions" subtitle="Custom directives that modify the Super Agent's behavior, restrictions, automations, and workflows — applied to every request" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton fallback="/portal" label="Back to Portal" />

        {/* WhatsApp banner */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#25D366] flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-800">WhatsApp Connected</div>
                <div className="text-xs text-slate-500">The Super Agent is available on WhatsApp. Click to connect your phone and operate the platform from anywhere.</div>
              </div>
            </div>
            <a
              href={base44.agents.getWhatsAppConnectURL("super_agent")}
              target="_blank"
              className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-bold text-white hover:brightness-110 transition shrink-0"
            >
              <MessageCircle className="w-4 h-4" /> Connect WhatsApp
            </a>
          </div>
        </div>

        {/* Stats + create */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-3">
              <div className="text-2xl font-black text-slate-900">{instructions.length}</div>
              <div className="text-xs text-slate-500 font-medium">Total Instructions</div>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3">
              <div className="text-2xl font-black text-emerald-700">{activeCount}</div>
              <div className="text-xs text-emerald-600 font-medium">Active</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-3">
              <div className="text-2xl font-black text-slate-400">{instructions.length - activeCount}</div>
              <div className="text-xs text-slate-500 font-medium">Inactive</div>
            </div>
          </div>
          {!showForm && (
            <button
              onClick={() => { setEditing(null); setForm({ title: "", instruction_text: "", category: "custom", priority: 0, active: true }); setShowForm(true); }}
              className="inline-flex items-center gap-2 rounded-full bg-[#00d4ff] px-5 py-2.5 text-sm font-bold text-[#0a0e14] hover:brightness-110 transition"
            >
              <Plus className="w-4 h-4" /> New Instruction
            </button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 mb-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-700">{editing ? "Edit Instruction" : "New Custom Instruction"}</h3>
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/30"
              placeholder="Instruction title (e.g. 'Always confirm before deploying')"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <textarea
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/30 resize-y"
              rows={4}
              placeholder="Full instruction text — the Super Agent will read and apply this to every request..."
              value={form.instruction_text}
              onChange={(e) => setForm({ ...form, instruction_text: e.target.value })}
            />
            <div className="grid grid-cols-3 gap-3">
              <select
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/30"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <input
                type="number"
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/30"
                placeholder="Priority (higher = first)"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 0 })}
              />
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 cursor-pointer">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="w-4 h-4 accent-[#00d4ff]" />
                Active
              </label>
            </div>
            <div className="flex gap-2">
              <button onClick={save} className="inline-flex items-center gap-2 rounded-full bg-[#00d4ff] px-5 py-2 text-sm font-bold text-[#0a0e14] hover:brightness-110">
                <Save className="w-4 h-4" /> {editing ? "Update" : "Create"} Instruction
              </button>
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Instructions list */}
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-slate-300" /></div>
        ) : instructions.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-sm font-semibold text-slate-400 mb-1">No custom instructions yet</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">Create instructions to modify the Super Agent's behavior, add restrictions, define automations, or set its personality. The agent checks these before every request.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {instructions.map((inst) => {
              const cat = CATEGORIES.find(c => c.value === inst.category) || CATEGORIES.find(c => c.value === "custom");
              return (
                <div key={inst.id} className={`rounded-2xl border p-4 transition ${inst.active ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50/50 opacity-60"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${cat.color}`}>{cat.label}</span>
                        {inst.priority > 0 && <span className="text-[10px] font-semibold text-slate-400">P{inst.priority}</span>}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${inst.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"}`}>
                          {inst.active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-slate-800 mb-1">{inst.title}</div>
                      <p className="text-sm text-slate-600 whitespace-pre-wrap">{inst.instruction_text}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => toggle(inst)} title={inst.active ? "Deactivate" : "Activate"} className={`p-2 rounded-lg transition ${inst.active ? "text-emerald-600 hover:bg-emerald-50" : "text-slate-400 hover:bg-slate-100"}`}>
                        <Power className="w-4 h-4" />
                      </button>
                      <button onClick={() => startEdit(inst)} title="Edit" className="p-2 rounded-lg text-slate-400 hover:text-[#00d4ff] hover:bg-[#00d4ff]/10 transition">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => remove(inst.id)} title="Delete" className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}