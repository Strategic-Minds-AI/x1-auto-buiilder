import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";
import { Send, Loader2, Bot, MessageCircle, Mic, ChevronDown, Zap, Database, Shield, Rocket, Sparkles } from "lucide-react";

const AGENT_NAME = "super_agent";

const SUGGESTIONS = [
  { label: "Enable automated CRM sync", icon: Database, prompt: "Enable automated CRM sync for all active projects and start syncing leads" },
  { label: "Visualize project data", icon: Sparkles, prompt: "Show me a summary of all website projects and their current status" },
  { label: "Run security scan", icon: Shield, prompt: "Run a full system security scan and report any issues" },
  { label: "Generate a new website", icon: Rocket, prompt: "Generate a new website project for a concrete polishing business in Dallas, TX" },
];

export default function DashboardChat({ conversation, messages, loading, onSend }) {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("auto");
  const [showModeMenu, setShowModeMenu] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const send = () => {
    if (!input.trim() || !conversation) return;
    const prefix = mode === "build" ? "[BUILD MODE] " : "";
    onSend(prefix + input.trim());
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="h-12 px-4 flex items-center gap-2 border-b border-slate-200 bg-slate-50 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center">
          <Bot className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-slate-800">Super Agent</div>
          <div className="text-[10px] text-slate-400">Full Platform Access</div>
        </div>
        <a href={base44.agents.getWhatsAppConnectURL(AGENT_NAME)} target="_blank" title="Connect via WhatsApp"
          className="p-1.5 rounded-lg text-slate-400 hover:text-[#25D366] hover:bg-[#25D366]/10 transition">
          <MessageCircle className="w-4 h-4" />
        </a>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50">
        {messages.length === 0 && !loading && (
          <div className="text-center py-8">
            <Bot className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-400 mb-1">Super Agent Ready</p>
            <p className="text-xs text-slate-400 mb-4">Ask me to manage data, run scans, deploy sites, or anything else</p>
          </div>
        )}
        {messages.map((msg, i) => {
          const isUser = msg.role === "user";
          return (
            <div key={i} className={isUser ? "flex justify-end" : "flex justify-start"}>
              {isUser ? (
                <div className="rounded-2xl rounded-tr-sm bg-[#00d4ff] px-3.5 py-2 text-sm text-[#0a0e14] max-w-[90%]">{msg.content}</div>
              ) : (
                <div className="max-w-[90%]">
                  {msg.content && (
                    <div className="rounded-2xl rounded-tl-sm bg-white border border-slate-200 px-3.5 py-2.5">
                      <ReactMarkdown className="text-sm text-slate-700 prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-headings:my-1.5">{msg.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Loader2 className="w-3 h-3 animate-spin" /><span>Processing...</span>
          </div>
        )}
      </div>

      {/* Suggestions */}
      {messages.length > 0 && (
        <div className="px-3 py-2 border-t border-slate-100 bg-white flex flex-wrap gap-1.5 shrink-0">
          {SUGGESTIONS.map((s) => {
            const Icon = s.icon;
            return (
              <button key={s.label} onClick={() => onSend(s.prompt)}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:border-[#00d4ff]/40 hover:text-[#00d4ff] transition">
                <Icon className="w-3 h-3" /> {s.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-slate-200 bg-white p-3 shrink-0">
        <div className="flex items-end gap-2">
          {/* Mode dropdown */}
          <div className="relative shrink-0">
            <button onClick={() => setShowModeMenu(!showModeMenu)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-semibold text-slate-600 hover:border-[#00d4ff]/40 transition">
              {mode === "auto" ? <Zap className="w-3 h-3 text-[#00d4ff]" /> : <Rocket className="w-3 h-3 text-[#0066ff]" />}
              <span className="capitalize">{mode}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {showModeMenu && (
              <div className="absolute bottom-full mb-1 left-0 w-28 rounded-lg border border-slate-200 bg-white shadow-lg py-0.5 z-50">
                <button onClick={() => { setMode("auto"); setShowModeMenu(false); }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
                  <Zap className="w-3 h-3 text-[#00d4ff]" /> Auto
                </button>
                <button onClick={() => { setMode("build"); setShowModeMenu(false); }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
                  <Rocket className="w-3 h-3 text-[#0066ff]" /> Build
                </button>
              </div>
            )}
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Ask the agent..."
            rows={1}
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/30 resize-none max-h-32"
            style={{ minHeight: "38px" }}
          />
          <button className="rounded-xl border border-slate-200 p-2.5 text-slate-400 hover:text-slate-600 transition shrink-0" title="Voice input">
            <Mic className="w-4 h-4" />
          </button>
          <button onClick={send} disabled={!input.trim() || loading || !conversation}
            className="rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] p-2.5 text-white disabled:opacity-40 hover:brightness-110 transition shrink-0">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}