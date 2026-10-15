import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";
import { Send, Loader2, Bot, Sparkles, Wand2, Rocket, Shield } from "lucide-react";

const AGENT_NAME = "super_agent";

export default function BuilderChat({ conversation, messages, onMessages, loading, onSend }) {
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const send = async () => {
    if (!input.trim() || !conversation) return;
    const msg = input.trim();
    setInput("");
    onSend(msg);
  };

  const quickActions = [
    { label: "Generate website", icon: Wand2, prompt: "Generate a complete website blueprint for a concrete polishing business in Dallas, TX" },
    { label: "Add services section", icon: Sparkles, prompt: "Add a services section with 6 services to the current project" },
    { label: "Deploy to Vercel", icon: Rocket, prompt: "Deploy the current project to Vercel" },
    { label: "Run compliance", icon: Shield, prompt: "Run compliance checks on the current project and auto-fix any issues" },
  ];

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Header */}
      <div className="h-12 px-4 flex items-center gap-2 border-b border-slate-200 bg-slate-50 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center">
          <Bot className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-slate-800">AI Builder Chat</div>
          <div className="text-[10px] text-slate-400">Super Agent · Full Platform Access</div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50">
        {messages.length === 0 && !loading && (
          <div className="text-center py-8">
            <Bot className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-400 mb-1">Chat with the Super Agent</p>
            <p className="text-xs text-slate-400 mb-4">Ask it to generate, edit, deploy, or manage anything</p>
            <div className="space-y-1.5">
              {quickActions.map((qa) => {
                const Icon = qa.icon;
                return (
                  <button key={qa.label} onClick={() => onSend(qa.prompt)} className="w-full flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs text-slate-600 hover:border-[#00d4ff]/40 hover:text-[#00d4ff] transition">
                    <Icon className="w-3.5 h-3.5 shrink-0" /> {qa.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {messages.map((msg, i) => {
          const isUser = msg.role === "user";
          return (
            <div key={i} className={isUser ? "flex justify-end" : "flex justify-start"}>
              <div className={isUser
                ? "rounded-2xl rounded-tr-sm bg-[#00d4ff] px-3.5 py-2 text-sm text-[#0a0e14] max-w-[90%]"
                : "max-w-[90%]"
              }>
                {isUser ? (
                  <p>{msg.content}</p>
                ) : (
                  <div className="rounded-2xl rounded-tl-sm bg-white border border-slate-200 px-3.5 py-2.5">
                    <ReactMarkdown className="text-sm text-slate-700 prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-headings:my-1.5">{msg.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          );
        })}
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
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Ask the AI to build, edit, or deploy..."
            rows={1}
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/30 resize-none max-h-32"
            style={{ minHeight: "38px" }}
          />
          <button onClick={send} disabled={!input.trim() || loading || !conversation}
            className="rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] p-2.5 text-white disabled:opacity-40 hover:brightness-110 transition shrink-0">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}