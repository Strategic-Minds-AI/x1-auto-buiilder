import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import BackButton from "@/components/shared/BackButton";
import { Loader2, Search, Wand2, Phone, MessageSquare, Send, CheckCircle, AlertCircle, Radio, Mail, Smartphone, Bell } from "lucide-react";

const TYPE_ICONS = { sms: MessageSquare, voice: Phone, whatsapp: Smartphone, mms: Mail, ivr: Radio, email: Mail, push: Bell, chat: MessageSquare };

export default function CommLibrary() {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [showSMS, setShowSMS] = useState(false);
  const [smsForm, setSMSForm] = useState({ to: "", message: "" });
  const [smsResult, setSMSResult] = useState(null);
  const [sending, setSending] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { items } = await base44.entities.CommChannel.filter({}, { sort: "channel_type", limit: 50 });
      setChannels(items || []);
    } catch { setChannels([]); }
    finally { setLoading(false); }
  };

  const seed = async () => {
    setSeeding(true);
    try {
      await base44.functions.invoke("seedLibraries", { library: "comms" });
      await load();
    } catch (e) { alert("Seed failed: " + (e.message || "unknown")); }
    finally { setSeeding(false); }
  };

  const sendSMS = async () => {
    setSending(true);
    setSMSResult(null);
    try {
      const res = await base44.functions.invoke("sendTwilioSMS", { to: smsForm.to, message: smsForm.message });
      setSMSResult(res.data);
    } catch (err) {
      setSMSResult({ error: err.response?.data?.error || err.message || "Failed to send SMS" });
    } finally { setSending(false); }
  };

  return (
    <div className="portal-light min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton />
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center">
              <Radio className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">AI Communications Library</h1>
              <p className="text-sm text-slate-500">Xtreme Comms (Twilio) + multi-channel messaging — phone: +1 (866) 571-1174</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowSMS(true)} className="inline-flex items-center gap-2 rounded-full bg-[#00d4ff] px-5 py-2.5 text-sm font-bold text-[#0a0e14] hover:brightness-110 transition">
              <Send className="w-4 h-4" /> Send SMS
            </button>
            {channels.length === 0 && (
              <button onClick={seed} disabled={seeding} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-[#00d4ff] hover:border-[#00d4ff]/40 transition disabled:opacity-50">
                {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />} Seed Channels
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#00d4ff]" /></div>
        ) : channels.length === 0 ? (
          <div className="text-center py-12">
            <Radio className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-slate-400 text-sm mb-3">No channels yet. Click "Seed Channels" to populate the library.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {channels.map((ch) => {
              const Icon = TYPE_ICONS[ch.channel_type] || MessageSquare;
              const isXtreme = ch.provider?.includes("Twilio") || ch.provider?.includes("Xtreme");
              return (
                <div key={ch.id} className={`rounded-2xl border p-5 transition ${isXtreme ? "border-[#00d4ff]/40 bg-[#00d4ff]/5" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isXtreme ? "bg-[#00d4ff] text-[#0a0e14]" : "bg-slate-100 text-slate-600"}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{ch.name}</h3>
                        <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{ch.channel_type}</span>
                      </div>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${ch.status === "active" ? "bg-emerald-100 text-emerald-700" : ch.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}`}>{ch.status}</span>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">{ch.description}</p>
                  {ch.phone_number && (
                    <div className="flex items-center gap-1.5 mb-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-sm font-mono text-slate-700">{ch.phone_number}</span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {(ch.capabilities || []).slice(0, 4).map((cap, i) => (
                      <span key={i} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">{cap}</span>
                    ))}
                  </div>
                  <div className="text-[10px] text-slate-400">{ch.provider}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* SMS modal */}
        {showSMS && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => { setShowSMS(false); setSMSResult(null); }}>
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-bold text-slate-900 mb-1">Send SMS via Xtreme Comms</h2>
              <p className="text-xs text-slate-500 mb-4">From: +1 (866) 571-1174</p>
              <div className="space-y-3">
                <input className="dd-input" placeholder="To (e.g. +15551234567)" value={smsForm.to} onChange={(e) => setSMSForm({ ...smsForm, to: e.target.value })} />
                <textarea className="dd-input" placeholder="Message" rows={3} value={smsForm.message} onChange={(e) => setSMSForm({ ...smsForm, message: e.target.value })} />
                <button onClick={sendSMS} disabled={sending || !smsForm.to || !smsForm.message} className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#00d4ff] px-4 py-3 text-sm font-bold text-[#0a0e14] hover:brightness-110 transition disabled:opacity-50">
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send SMS
                </button>
                {smsResult && (
                  <div className={`rounded-lg p-3 text-sm ${smsResult.error ? "bg-red-50 text-red-600 border border-red-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
                    {smsResult.error ? (
                      <div className="flex items-start gap-2"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {smsResult.error}</div>
                    ) : (
                      <div className="flex items-start gap-2"><CheckCircle className="w-4 h-4 shrink-0 mt-0.5" /> SMS sent! Status: {smsResult.status}</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}