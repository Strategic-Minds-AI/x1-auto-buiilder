import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import ReactMarkdown from "react-markdown";
import {
  Bot, Send, X, Plus, Loader2,
  ChevronDown, ChevronRight, Wrench, CheckCircle, AlertCircle, Clock, Sparkles, MessageCircle
} from "lucide-react";

const AGENT_NAME = "super_agent";

export default function SuperAgentChat() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    loadConversations();
  }, [open]);

  const loadConversations = async () => {
    try {
      const convs = await base44.agents.listConversations({ agent_name: AGENT_NAME });
      setConversations(convs || []);
      if (convs?.length > 0 && !activeConv) selectConversation(convs[0]);
    } catch { setConversations([]); }
  };

  const selectConversation = async (conv) => {
    setActiveConv(conv);
    setMessages(conv.messages || []);
    const unsubscribe = base44.agents.subscribeToConversation(conv.id, (data) => {
      setMessages(data.messages || []);
    });
    if (window._superAgentUnsub) window._superAgentUnsub();
    window._superAgentUnsub = unsubscribe;
  };

  const startNewConversation = async () => {
    try {
      const conv = await base44.agents.createConversation({
        agent_name: AGENT_NAME,
        metadata: { name: "New Operation", description: "Super Agent session" },
      });
      setConversations([conv, ...conversations]);
      selectConversation(conv);
    } catch (err) { console.error("Failed to create conversation:", err); }
  };

  const sendMessage = async () => {
    if (!input.trim() || !activeConv) return;
    const userMsg = input.trim();
    setInput("");
    setLoading(true);
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    try {
      await base44.agents.addMessage(activeConv, { role: "user", content: userMsg });
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "Error: " + (err.message || "Failed to send message") }]);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => () => { if (window._superAgentUnsub) window._superAgentUnsub(); }, []);

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Vertical tab on the right edge — admin only */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed top-1/2 right-0 -translate-y-1/2 z-50 flex flex-col items-center gap-1 rounded-l-xl bg-gradient-to-b from-[#00d4ff] to-[#0066ff] py-4 px-2.5 text-white shadow-lg hover:shadow-[0_0_25px_rgba(0,212,255,0.4)] transition-all duration-200 ${open ? "translate-x-[calc(100%-0px)] opacity-0 pointer-events-none" : "translate-x-0"}`}
        style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
      >
        <Sparkles className="w-4 h-4 mb-1" style={{ writingMode: "horizontal-tb" }} />
        <span className="text-[11px] font-bold tracking-[0.15em] uppercase whitespace-nowrap">Super Agent</span>
      </button>

      {/* Slide-in panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md z-50 bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="h-14 bg-gradient-to-r from-[#0a0e14] to-[#0d1525] flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Super Agent</div>
              <div className="text-[10px] text-white/50">Full Platform Access</div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <a href={base44.agents.getWhatsAppConnectURL(AGENT_NAME)} target="_blank" title="Connect via WhatsApp" className="p-1.5 rounded-lg text-white/60 hover:text-[#25D366] hover:bg-white/10 transition">
              <MessageCircle className="w-4 h-4" />
            </a>
            <button onClick={startNewConversation} title="New conversation" className="p-1.5 rounded-lg text-white/60 hover:text-[#00d4ff] hover:bg-white/10 transition">
              <Plus className="w-4 h-4" />
            </button>
            <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Conversation tabs */}
        {conversations.length > 1 && (
          <div className="border-b border-slate-100 bg-slate-50 px-3 py-1.5 flex gap-1 overflow-x-auto shrink-0">
            {conversations.slice(0, 8).map((c) => (
              <button key={c.id} onClick={() => selectConversation(c)}
                className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold transition ${activeConv?.id === c.id ? "bg-[#00d4ff] text-[#0a0e14]" : "bg-white text-slate-500 hover:text-slate-700 border border-slate-200"}`}>
                {c.metadata?.name || "Chat"}
              </button>
            ))}
          </div>
        )}

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50">
          {messages.length === 0 && !loading && (
            <div className="text-center py-12">
              <Bot className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-400 mb-1">Super Agent Ready</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">Ask me to generate a website, deploy a site, sync analytics, send an email, manage CRM, run compliance, or anything else across the platform.</p>
              <div className="mt-4 space-y-1.5 max-w-xs mx-auto">
                {["Generate a website for a concrete polishing business", "Sync analytics for all deployed sites", "Send a follow-up email to my latest leads", "Run compliance checks on all sites"].map((s) => (
                  <button key={s} onClick={() => setInput(s)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs text-slate-600 hover:border-[#00d4ff]/40 hover:text-[#00d4ff] transition">{s}</button>
                ))}
              </div>
            </div>
          )}
          {messages.map((msg, i) => <MessageBubble key={i} message={msg} />)}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Loader2 className="w-3 h-3 animate-spin" /><span>Processing...</span>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-slate-200 bg-white p-3 shrink-0">
          <div className="flex items-end gap-2">
            <textarea
              value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Ask the Super Agent to do anything..." rows={1}
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/30 resize-none max-h-32"
              style={{ minHeight: "38px" }}
            />
            <button onClick={sendMessage} disabled={!input.trim() || loading || !activeConv}
              className="rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] p-2.5 text-white disabled:opacity-40 hover:brightness-110 transition shrink-0">
              <Send className="w-4 h-4" />
            </button>
          </div>
          {!activeConv && <p className="text-[10px] text-amber-500 mt-1.5 text-center">Click + to start a new conversation</p>}
        </div>
      </div>
    </>
  );
}

function MessageBubble({ message }) {
  const isUser = message.role === "user";
  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="rounded-2xl rounded-tr-sm bg-[#00d4ff] px-3.5 py-2 text-sm text-[#0a0e14] max-w-[85%]">{message.content}</div>
      </div>
    );
  }
  return (
    <div className="flex justify-start">
      <div className="max-w-[90%]">
        {message.content && (
          <div className="rounded-2xl rounded-tl-sm bg-white border border-slate-200 px-3.5 py-2.5">
            <ReactMarkdown className="text-sm text-slate-700 prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-headings:my-1.5 prose-code:text-[#00d4ff] prose-code:bg-slate-50 prose-code:px-1 prose-code:rounded">{message.content}</ReactMarkdown>
          </div>
        )}
        {message.tool_calls?.map((tc, i) => <ToolCallDisplay key={i} toolCall={tc} />)}
      </div>
    </div>
  );
}

function ToolCallDisplay({ toolCall }) {
  const [expanded, setExpanded] = useState(false);
  const statusMeta = {
    pending: { icon: Clock, color: "text-slate-400", label: "Pending" },
    running: { icon: Loader2, color: "text-blue-500", label: "Running", spin: true },
    in_progress: { icon: Loader2, color: "text-blue-500", label: "In Progress", spin: true },
    completed: { icon: CheckCircle, color: "text-emerald-500", label: "Completed" },
    success: { icon: CheckCircle, color: "text-emerald-500", label: "Success" },
    failed: { icon: AlertCircle, color: "text-red-500", label: "Failed" },
    error: { icon: AlertCircle, color: "text-red-500", label: "Error" },
  };
  const meta = statusMeta[toolCall.status] || statusMeta.pending;
  const Icon = meta.icon;
  const isFailed = toolCall.status === "failed" || toolCall.status === "error";
  let parsedResults = toolCall.results;
  try { if (typeof parsedResults === "string") parsedResults = JSON.parse(parsedResults); } catch {}
  let parsedArgs = toolCall.arguments_string;
  try { if (typeof parsedArgs === "string") parsedArgs = JSON.parse(parsedArgs); } catch {}
  const hideDetails = toolCall.display_projection?.hide_details && toolCall.display_projection?.details_redacted;
  if (hideDetails) {
    return (
      <div className="mt-1.5 text-xs">
        <div className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 ${isFailed ? "bg-red-50" : "bg-slate-50"}`}>
          <Icon className={`w-3 h-3 ${meta.color} ${meta.spin ? "animate-spin" : ""}`} />
          <span className="font-semibold text-slate-600">{isFailed ? toolCall.display_projection?.error_label : meta.label}</span>
        </div>
      </div>
    );
  }
  return (
    <div className="mt-1.5 text-xs">
      <button onClick={() => setExpanded(!expanded)}
        className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 transition ${isFailed ? "bg-red-50 hover:bg-red-100" : "bg-slate-50 hover:bg-slate-100"}`}>
        {expanded ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronRight className="w-3 h-3 text-slate-400" />}
        <Wrench className={`w-3 h-3 ${meta.color}`} />
        <span className="font-semibold text-slate-700 truncate max-w-[180px]">{toolCall.name || "tool"}</span>
        <Icon className={`w-3 h-3 ${meta.color} ${meta.spin ? "animate-spin" : ""}`} />
        <span className={`font-medium ${meta.color}`}>{meta.label}</span>
      </button>
      {expanded && (
        <div className="mt-1 ml-5 space-y-1">
          {parsedArgs && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">Parameters</div>
              <pre className="rounded-lg bg-slate-100 p-2 text-[10px] text-slate-600 overflow-x-auto max-h-32">{typeof parsedArgs === "string" ? parsedArgs : JSON.stringify(parsedArgs, null, 2)}</pre>
            </div>
          )}
          {parsedResults && (
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">Result</div>
              <pre className={`rounded-lg p-2 text-[10px] overflow-x-auto max-h-40 ${isFailed ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"}`}>{typeof parsedResults === "string" ? parsedResults : JSON.stringify(parsedResults, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}