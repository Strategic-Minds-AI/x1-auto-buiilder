import { useState } from "react";
import { base44 } from "@/api/base44Client";
import BackButton from "@/components/shared/BackButton";
import EmailPreview from "@/components/email/EmailPreview";
import { EMAIL_TEMPLATES, TEMPLATE_CATEGORIES } from "@/lib/emailTemplateCatalog";
import { Mail, Search, Send, Loader2, X, Lock, FileText, CheckCircle, AlertCircle } from "lucide-react";

export default function EmailTemplateLibrary() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState(null);
  const [sendTest, setSendTest] = useState(null);
  const [testEmail, setTestEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);

  const filtered = EMAIL_TEMPLATES.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "All" || t.category === category;
    return matchSearch && matchCategory;
  });

  const platformCount = EMAIL_TEMPLATES.filter((t) => t.type === "platform").length;
  const customCount = EMAIL_TEMPLATES.filter((t) => t.type === "custom").length;

  const handleSendTest = async () => {
    if (!testEmail.trim() || !sendTest) return;
    setSending(true);
    setSendResult(null);
    try {
      const vars = {};
      sendTest.variables.forEach((v) => { vars[v] = `[${v}]`; });
      await base44.integrations.Core.SendEmail({
        to: testEmail.trim(),
        template_name: sendTest.name,
        variables: vars,
      });
      setSendResult({ success: true, message: `Test email sent to ${testEmail.trim()}` });
    } catch (err) {
      setSendResult({ success: false, message: err.message || "Failed to send test email" });
    } finally { setSending(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <BackButton fallback="/portal" label="Back to Portal" />
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Email Template Library</h1>
              <p className="text-sm text-slate-500">Browse, preview, and test all email templates</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1"><Mail className="w-3.5 h-3.5 text-blue-500" /> Total Templates</div>
            <div className="text-2xl font-bold text-slate-800">{EMAIL_TEMPLATES.length}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1"><Lock className="w-3.5 h-3.5 text-purple-500" /> Platform</div>
            <div className="text-2xl font-bold text-slate-800">{platformCount}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1"><FileText className="w-3.5 h-3.5 text-cyan-500" /> Custom</div>
            <div className="text-2xl font-bold text-slate-800">{customCount}</div>
          </div>
        </div>

        {/* Search + Categories */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search templates..."
              className="w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/30" />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {TEMPLATE_CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${category === cat ? "bg-[#00d4ff] text-[#0a0e14]" : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Template grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((tpl) => (
            <button key={tpl.name} onClick={() => setSelected(tpl)}
              className="text-left rounded-xl border border-slate-200 bg-white p-4 hover:border-[#00d4ff]/40 hover:shadow-sm transition">
              <div className="flex items-start justify-between mb-2">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: tpl.type === "platform" ? "#f3e8ff" : "#cffafe" }}>
                  {tpl.type === "platform" ? <Lock className="w-4 h-4 text-purple-500" /> : <FileText className="w-4 h-4 text-cyan-500" />}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full" style={{ background: tpl.type === "platform" ? "#f3e8ff" : "#cffafe", color: tpl.type === "platform" ? "#7c3aed" : "#0891b2" }}>
                  {tpl.type}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-800 mb-0.5">{tpl.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-2 mb-2">{tpl.description}</p>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-semibold text-slate-400">{tpl.category}</span>
                <span className="text-slate-300">·</span>
                <span className="text-[10px] text-slate-400">{tpl.variables.length} variables</span>
              </div>
            </button>
          ))}
        </div>
        {filtered.length === 0 && <p className="text-center text-sm text-slate-400 py-12">No templates match your search.</p>}
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-2xl max-h-[85vh] rounded-2xl bg-white shadow-2xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="h-14 px-5 flex items-center justify-between border-b border-slate-200 bg-slate-50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: selected.type === "platform" ? "#f3e8ff" : "#cffafe" }}>
                  {selected.type === "platform" ? <Lock className="w-4 h-4 text-purple-500" /> : <FileText className="w-4 h-4 text-cyan-500" />}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-800">{selected.title}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{selected.name}.html</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setSendTest(selected); setSendResult(null); setTestEmail(""); }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#00d4ff] px-3 py-1.5 text-xs font-bold text-[#0a0e14] hover:brightness-110 transition">
                  <Send className="w-3.5 h-3.5" /> Send Test
                </button>
                <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <div className="mb-4">
                <p className="text-sm text-slate-600 mb-3">{selected.description}</p>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold uppercase text-slate-400">Category:</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{selected.category}</span>
                  <span className="text-xs font-bold uppercase text-slate-400 ml-2">Type:</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: selected.type === "platform" ? "#f3e8ff" : "#cffafe", color: selected.type === "platform" ? "#7c3aed" : "#0891b2" }}>{selected.type}</span>
                </div>
              </div>
              <EmailPreview template={selected} />
            </div>

            {/* Send test panel */}
            {sendTest && (
              <div className="border-t border-slate-200 bg-slate-50 p-4 shrink-0">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Send test to:</label>
                    <input value={testEmail} onChange={(e) => setTestEmail(e.target.value)} placeholder="you@example.com" type="email"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/30" />
                  </div>
                  <button onClick={handleSendTest} disabled={!testEmail.trim() || sending}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#00d4ff] px-4 py-2 text-sm font-bold text-[#0a0e14] hover:brightness-110 disabled:opacity-50 transition shrink-0">
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send
                  </button>
                </div>
                {sendResult && (
                  <div className={`flex items-center gap-2 mt-2 text-xs ${sendResult.success ? "text-emerald-600" : "text-red-500"}`}>
                    {sendResult.success ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                    {sendResult.message}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}