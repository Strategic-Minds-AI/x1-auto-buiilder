import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Zap, Terminal, Send, Shield, Code } from "lucide-react";
import BackButton from "@/components/shared/BackButton";

export default function GPTBridge() {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTool, setSelectedTool] = useState(null);
  const [params, setParams] = useState("{}");
  const [result, setResult] = useState(null);
  const [invoking, setInvoking] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { loadTools(); }, []);

  const loadTools = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("gptControlBridge", { action: "list_tools" });
      setTools(res.data?.tools || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const invoke = async () => {
    setInvoking(true);
    setError(null);
    setResult(null);
    try {
      let parsedParams = {};
      try { parsedParams = JSON.parse(params); } catch { /* allow empty */ }
      const res = await base44.functions.invoke("gptControlBridge", {
        action: "invoke",
        tool: selectedTool,
        params: parsedParams
      });
      setResult(res.data);
    } catch (e) { setError(e.response?.data?.error || e.message); }
    finally { setInvoking(false); }
  };

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-[#00d4ff]" /></div>;
  }

  return (
    <div className="p-6 lg:p-8">
      <BackButton />
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#00d4ff]/10 flex items-center justify-center">
          <Zap className="w-5 h-5 text-[#00d4ff]" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900">GPT Control Bridge</h1>
          <p className="text-sm text-slate-500">MCP-style API for ChatGPT and AI client integration</p>
        </div>
      </div>

      {/* Endpoint info */}
      <div className="rounded-2xl bg-slate-900 p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Terminal className="w-4 h-4 text-[#00d4ff]" />
          <span className="text-xs font-bold text-white/80">API Endpoint</span>
        </div>
        <code className="text-xs text-[#00d4ff] font-mono break-all">POST /functions/gptControlBridge</code>
        <div className="mt-2 text-xs text-white/50">Action: list_tools | invoke | Tool: {selectedTool || "select below"}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tool list */}
        <div className="lg:col-span-1">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Available Tools ({tools.length})</h3>
          <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
            {tools.map(t => (
              <button
                key={t.name}
                onClick={() => { setSelectedTool(t.name); setResult(null); setError(null); }}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition ${
                  selectedTool === t.name ? "bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/20" : "bg-white border border-slate-200 text-slate-700 hover:border-slate-300"
                }`}
              >
                {t.type === "read" ? <Code className="w-3.5 h-3.5 shrink-0" /> : <Shield className="w-3.5 h-3.5 shrink-0" />}
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">{t.name}</div>
                  <div className="text-[10px] text-slate-400">{t.type}{t.protected ? " · protected" : ""}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tool invoker */}
        <div className="lg:col-span-2">
          {selectedTool ? (
            <div className="rounded-2xl bg-white border border-slate-200 p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-1">{selectedTool}</h3>
              <p className="text-xs text-slate-500 mb-4">Enter parameters as JSON</p>

              <textarea
                className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#00d4ff]/50 transition"
                rows={6}
                placeholder='{"projectId": "your-project-id"}'
                value={params}
                onChange={e => setParams(e.target.value)}
              />

              <button
                onClick={invoke}
                disabled={invoking}
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#00d4ff] px-5 py-2.5 text-sm font-bold text-[#0a0e14] hover:brightness-110 transition disabled:opacity-50"
              >
                {invoking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Invoke Tool
              </button>

              {error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {result && (
                <div className="mt-4">
                  <div className="text-xs font-bold text-slate-700 mb-2">Result</div>
                  <pre className="rounded-xl bg-slate-900 p-4 text-xs text-green-400 font-mono overflow-x-auto max-h-96">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl bg-white border border-slate-200 p-12 text-center">
              <Zap className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p className="text-sm text-slate-500">Select a tool to invoke</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}