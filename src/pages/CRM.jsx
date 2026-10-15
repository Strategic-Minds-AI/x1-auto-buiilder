import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import BackButton from "@/components/shared/BackButton";
import { Loader2, Plus, Users, Mail, Clock, CheckCircle, AlertCircle, Phone, Calendar, X, Send } from "lucide-react";

export default function CRM() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", source: "", notes: "", follow_up_subject: "", follow_up_body: "", follow_up_at: "" });
  const [filter, setFilter] = useState("all");

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { items } = await base44.entities.CrmContact.filter({}, { sort: "-created_date", limit: 100 });
      setContacts(items || []);
    } catch { setContacts([]); }
    finally { setLoading(false); }
  };

  const createContact = async () => {
    if (!form.name || !form.email) return;
    try {
      await base44.entities.CrmContact.create({
        name: form.name,
        email: form.email,
        phone: form.phone,
        source: form.source,
        notes: form.notes,
        status: "new",
        follow_up_subject: form.follow_up_subject,
        follow_up_body: form.follow_up_body,
        follow_up_at: form.follow_up_at ? new Date(form.follow_up_at).toISOString() : undefined,
        follow_up_status: form.follow_up_at ? "scheduled" : "paused",
      });
      setForm({ name: "", email: "", phone: "", source: "", notes: "", follow_up_subject: "", follow_up_body: "", follow_up_at: "" });
      setShowForm(false);
      load();
    } catch (err) {
      alert("Failed to create contact: " + (err.message || "unknown error"));
    }
  };

  const updateStatus = async (id, status) => {
    await base44.entities.CrmContact.update(id, { status });
    load();
  };

  const filtered = contacts.filter((c) => filter === "all" || c.status === filter);
  const counts = {
    all: contacts.length,
    new: contacts.filter((c) => c.status === "new").length,
    contacted: contacts.filter((c) => c.status === "contacted").length,
    qualified: contacts.filter((c) => c.status === "qualified").length,
    closed: contacts.filter((c) => c.status === "closed").length,
  };

  return (
    <div className="portal-light min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton />
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">AI CRM</h1>
              <p className="text-sm text-slate-500">Centralized lead management with automated email follow-up</p>
            </div>
          </div>
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-full bg-[#00d4ff] px-5 py-2.5 text-sm font-bold text-[#0a0e14] hover:brightness-110 transition">
            <Plus className="w-4 h-4" /> Add Lead
          </button>
        </div>

        {/* Pipeline stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {Object.entries(counts).map(([key, count]) => (
            <button key={key} onClick={() => setFilter(key)} className={`rounded-xl border p-3 text-left transition ${filter === key ? "border-[#00d4ff] bg-[#00d4ff]/5" : "border-slate-200 bg-white hover:border-slate-300"}`}>
              <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{key}</div>
              <div className="text-2xl font-bold text-slate-900">{count}</div>
            </button>
          ))}
        </div>

        {/* Contacts table */}
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#00d4ff]" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-slate-400 text-sm">No contacts yet. Add your first lead to get started.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr className="text-left text-slate-500">
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">Email</th>
                    <th className="px-4 py-3 font-semibold">Phone</th>
                    <th className="px-4 py-3 font-semibold">Source</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Follow-Up</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">{c.name}</td>
                      <td className="px-4 py-3 text-slate-600">{c.email}</td>
                      <td className="px-4 py-3 text-slate-600">{c.phone || "—"}</td>
                      <td className="px-4 py-3 text-slate-600">{c.source || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          c.status === "new" ? "bg-blue-100 text-blue-700" :
                          c.status === "contacted" ? "bg-amber-100 text-amber-700" :
                          c.status === "qualified" ? "bg-emerald-100 text-emerald-700" :
                          "bg-slate-100 text-slate-600"
                        }`}>{c.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        {c.follow_up_status === "scheduled" && <span className="inline-flex items-center gap-1 text-[11px] text-amber-600"><Clock className="w-3 h-3" /> {c.follow_up_at ? new Date(c.follow_up_at).toLocaleDateString() : ""}</span>}
                        {c.follow_up_status === "sent" && <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600"><CheckCircle className="w-3 h-3" /> Sent</span>}
                        {c.follow_up_status === "failed" && <span className="inline-flex items-center gap-1 text-[11px] text-red-500"><AlertCircle className="w-3 h-3" /> Failed</span>}
                        {c.follow_up_status === "paused" && <span className="text-[11px] text-slate-400">Paused</span>}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={c.status}
                          onChange={(e) => updateStatus(c.id, e.target.value)}
                          className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600 focus:outline-none focus:ring-1 focus:ring-[#00d4ff]/30"
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="qualified">Qualified</option>
                          <option value="closed">Closed</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add lead modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowForm(false)}>
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">Add New Lead</h2>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input className="dd-input" placeholder="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  <input className="dd-input" placeholder="Email *" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input className="dd-input" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  <input className="dd-input" placeholder="Source (website)" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
                </div>
                <textarea className="dd-input" placeholder="Notes" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                <div className="border-t border-slate-200 pt-3">
                  <p className="text-xs font-bold text-slate-500 mb-2">Schedule Follow-Up Email</p>
                  <input className="dd-input mb-2" placeholder="Follow-up subject" value={form.follow_up_subject} onChange={(e) => setForm({ ...form, follow_up_subject: e.target.value })} />
                  <textarea className="dd-input mb-2" placeholder="Follow-up hook / body" rows={2} value={form.follow_up_body} onChange={(e) => setForm({ ...form, follow_up_body: e.target.value })} />
                  <input type="datetime-local" className="dd-input" value={form.follow_up_at} onChange={(e) => setForm({ ...form, follow_up_at: e.target.value })} />
                </div>
                <button onClick={createContact} className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#00d4ff] px-4 py-3 text-sm font-bold text-[#0a0e14] hover:brightness-110 transition">
                  <Send className="w-4 h-4" /> Create Lead
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}