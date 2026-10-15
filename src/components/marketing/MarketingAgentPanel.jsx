import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Bot, Sparkles, Loader2, Send, TrendingUp, Search, Share2, Mail, Target, CheckCircle, ArrowRight } from "lucide-react";

const AGENT_NAME = "super_agent";

const SUGGESTIONS = [
  "Analyze my top competitors and create a marketing plan",
  "Generate a 30-day content calendar for my latest project",
  "Run a full SEO audit on my deployed sites",
  "Create social media posts for all active projects",
  "Plan a Google Ads campaign for lead generation",
];

export default function MarketingAgentPanel() {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(true);

  useEffect(() => { startConversation(); }, []);

  const startConversation = async () => {
    try {
      const conv = await base44.agents.createConversation({
        agent_name: AGENT_NAME,
        metadata: { name: "Marketing Agent Session", description: "Marketing strategy and campaign planning" },
      });
      setConversation(conv);
      const unsub = base44.agents.subscribeToConversation(conv.id, (data) => {
        setMessages(data.messages || []);
      });
      return () => unsub();
    } catch {}
    finally { setStarting(false); }
  };

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || !conversation) return;
    setInput("");
    setLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    try {
      await base44.agents.addMessage(conversation, { role: "user", content: msg });
    } catch (e) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Error: " + (e.message || "Failed") }]);
    } finally { setLoading(false); }
  };

  if (starting) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#00d4ff]" /></div>;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl border border-[#00d4ff]/30 bg-gradient-to-br from-[#00d4ff]/5 via-[#0066ff]/5 to-transparent p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center shrink-0">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Marketing Agent</h3>
            <p className="text-sm text-slate-600">It reviews your app, competitors, and past campaigns, then plans what to build and launch.</p>
          </div>
        </div>
      </div>

      {/* Capabilities */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Search, label: "SEO Audit", desc: "Full compliance check" },
          { icon: Share2, label: "Social Content", desc: "30-day calendars" },
          { icon: Target, label: "Ad Campaigns", desc: "Google Ads planning" },
          { icon: TrendingUp, label: "Strategy", desc: "Competitor analysis" },
        ].map((cap, i) => {
          const Icon = cap.icon;
          return (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-3">
              <Icon className="w-4 h-4 text-[#00d4ff] mb-2" />
              <div className="text-xs font-bold text-slate-900">{cap.label}</div>
              <div className="text-[10px] text-slate-500">{cap.desc}</div>
            </div>
          );
        })}
      </div>

      {/* Chat */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center">
            <Bot className="w-3 h-3 text-white" />
          </div>
          <span className="text-xs font-bold text-slate-700">Marketing Agent Chat</span>
        </div>

        <div className="px-4 py-4 space-y-3 min-h-[300px] max-h-[400px] overflow-y-auto bg-slate-50">
          {messages.length === 0 && !loading && (
            <div className="text-center py-8">
              <Bot className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-500 mb-1">Marketing Agent Ready</p>
              <p className="text-xs text-slate-400 mb-4">Ask me to plan your marketing, run compliance, or generate content.</p>
              <div className="space-y-1.5 max-w-sm mx-auto">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs text-slate-600 hover:border-[#00d4ff]/40 hover:text-[#00d4ff] transition">{s}</button>
                ))}
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`rounded-2xl px-3.5 py-2 text-sm max-w-[85%] ${msg.role === "user" ? "bg-[#00d4ff] text-[#0a0e14] rounded-tr-sm" : "bg-white border border-slate-200 text-slate-700 rounded-tl-sm"}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Loader2 className="w-3 h-3 animate-spin" /> Processing...
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 bg-white p-3">
          <div className="flex items-end gap-2">
            <textarea value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Ask the marketing agent to plan, audit, or generate..." rows={1}
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/30 resize-none" style={{ minHeight: "38px" }} />
            <button onClick={() => send()} disabled={!input.trim() || loading}
              className="rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] p-2.5 text-white disabled:opacity-40 hover:brightness-110 transition shrink-0">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}