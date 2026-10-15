import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";
import { Send, Loader2, Bot, User } from "lucide-react";

export default function AssistPanel() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const sendQuestion = async () => {
    if (!input.trim() || loading) return;
    const q = input.trim();
    setInput("");
    setLoading(true);
    setMessages(prev => [...prev, { role: "user", content: q }]);

    try {
      const res = await base44.functions.invoke("universalGenerator", {
        action: "assist",
        prompt: q,
      });
      setMessages(prev => [...prev, { role: "assistant", content: res.data?.response || "No response" }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "Error: " + (err.message || "Failed to get assistance") }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-[#0a0e14] to-[#0d1525] flex items-center gap-2">
        <Bot className="w-4 h-4 text-[#00d4ff]" />
        <span className="text-sm font-bold text-white">AI Assist</span>
        <span className="text-[10px] text-white/40 ml-auto">Integration help</span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 bg-slate-50 min-h-[200px]">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Bot className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Ask about integrating generated content, choosing types, or troubleshooting</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && <Bot className="w-4 h-4 text-[#00d4ff] mt-0.5 shrink-0" />}
            <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs ${
              msg.role === "user"
                ? "bg-[#00d4ff] text-[#0a0e14]"
                : "bg-white border border-slate-200 text-slate-700"
            }`}>
              {msg.role === "user" ? msg.content : (
                <ReactMarkdown className="prose prose-sm max-w-none prose-p:my-0.5 prose-ul:my-0.5 prose-li:my-0">{msg.content}</ReactMarkdown>
              )}
            </div>
            {msg.role === "user" && <User className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Loader2 className="w-3 h-3 animate-spin" /> Thinking...
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 p-2.5 flex items-end gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendQuestion()}
          placeholder="Ask about integration..."
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/30"
        />
        <button
          onClick={sendQuestion}
          disabled={!input.trim() || loading}
          className="rounded-lg bg-gradient-to-br from-[#00d4ff] to-[#0066ff] p-2 text-white disabled:opacity-40 hover:brightness-110 transition shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}