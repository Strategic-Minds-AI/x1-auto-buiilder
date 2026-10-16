import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2, Plus, ListChecks, Zap, Bot, Radio, CheckCircle2, AlertCircle, Clock, X } from "lucide-react";
import PortalShell from "@/components/portal/PortalShell";

const STATUS_STYLES = {
  pending: { color: "text-slate-600", bg: "bg-slate-100", label: "Pending" },
  assigned: { color: "text-blue-600", bg: "bg-blue-50", label: "Assigned" },
  processing: { color: "text-amber-600", bg: "bg-amber-50", label: "Processing" },
  completed: { color: "text-emerald-600", bg: "bg-emerald-50", label: "Completed" },
  failed: { color: "text-red-600", bg: "bg-red-50", label: "Failed" },
  cancelled: { color: "text-slate-400", bg: "bg-slate-50", label: "Cancelled" },
};

const PRIORITY_STYLES = {
  p0: { color: "text-red-600", bg: "bg-red-50", label: "P0" },
  p1: { color: "text-orange-600", bg: "bg-orange-50", label: "P1" },
  p2: { color: "text-slate-600", bg: "bg-slate-100", label: "P2" },
  p3: { color: "text-slate-400", bg: "bg-slate-50", label: "P3" },
};

export default function BuildQueueConsole() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [bulkText, setBulkText] = useState("");
  const [industry, setIndustry] = useState("");
  const [priority, setPriority] = useState("p2");
  const [adding, setAdding] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processResult, setProcessResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const inputRef = useRef(null);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const { items: data } = await base44.entities.BuildQueue.filter(
        {},
        { sort: '-created_date', limit: 100 }
      );
      setItems(data);
    } catch (err) {
      console.error("Failed to load queue:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
    const interval = setInterval(loadItems, 10000);
    return () => clearInterval(interval);
  }, [loadItems]);

  const addBulk = async () => {
    const lines = bulkText.split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return;
    setAdding(true);
    try {
      const records = lines.map(line => ({
        title: line,
        build_type: "website",
        industry: industry || "",
        priority,
        status: "pending",
      }));
      await base44.entities.BuildQueue.bulkCreate(records);
      setBulkText("");
      setIndustry("");
      await loadItems();
    } catch (err) {
      console.error("Failed to add items:", err);
    } finally {
      setAdding(false);
    }
  };

  const processNow = async () => {
    setProcessing(true);
    setProcessResult(null);
    try {
      const res = await base44.functions.invoke("processBuildQueue", { action: "process", limit: 5 });
      setProcessResult(res.data);
      await loadItems();
    } catch (err) {
      setProcessResult({ error: err.response?.data?.error || err.message });
    } finally {
      setProcessing(false);
    }
  };

  const cancelItem = async (id) => {
    try {
      await base44.entities.BuildQueue.update(id, { status: "cancelled" });
      await loadItems();
    } catch (err) {
      console.error("Cancel failed:", err);
    }
  };

  const deleteItem = async (id) => {
    try {
      await base44.entities.BuildQueue.delete(id);
      await loadItems();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const filteredItems = filter === "all" ? items : items.filter(i => i.status === filter);
  const counts = {
    pending: items.filter(i => i.status === "pending").length,
    assigned: items.filter(i => i.status === "assigned").length,
    processing: items.filter(i => i.status === "processing").length,
    completed: items.filter(i => i.status === "completed").length,
    failed: items.filter(i => i.status === "failed").length,
  };

  return (
    <PortalShell
      activeTab=""
      onTabChange={() => navigate("/portal")}
      onNew={() => inputRef.current?.focus()}
    >
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-black text-2xl sm:text-3xl flex items-center gap-3 text-slate-900">
              <ListChecks className="w-7 h-7 text-[#00d4ff]" />
              Build Queue
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Type a list of things to build. GPT processes them when online; the autonomous coder handles them as a fallback.
            </p>
          </div>
          <button
            onClick={processNow}
            disabled={processing}
            className="inline-flex items-center gap-2 rounded-full bg-[#00d4ff] px-5 py-2.5 text-sm font-bold text-[#0a0e14] hover:brightness-110 hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] transition disabled:opacity-60"
          >
            {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {processing ? "Processing..." : "Process Now"}
          </button>
        </div>

        {/* Process result banner */}
        {processResult && !processResult.error && (
          <div className="mb-6 rounded-xl border border-[#00d4ff]/30 bg-[#00d4ff]/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Radio className={`w-4 h-4 ${processResult.gpt_online ? "text-emerald-500" : "text-amber-500"}`} />
              <span className="text-sm font-semibold text-slate-800">
                GPT Engine: {processResult.gpt_online ? "Online" : "Offline — using autonomous coder"}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-slate-500">
              <span>Assigned: {processResult.assigned?.length || 0}</span>
              <span>Completed: {processResult.completed?.length || 0}</span>
              <span>Failed: {processResult.failed?.length || 0}</span>
              <span>Checked: {processResult.checked || 0}</span>
            </div>
          </div>
        )}
        {processResult?.error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {processResult.error}
          </div>
        )}

        {/* Input panel */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 mb-6 shadow-sm">
          <label className="block text-xs font-bold tracking-wide text-slate-500 uppercase mb-2">
            Type your build list — one item per line
          </label>
          <textarea
            ref={inputRef}
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder={`Epoxy flooring website for Dallas TX\nHVAC landing page for Phoenix AZ\nPlumbing funnel for Chicago IL\nRoofing site for Denver CO`}
            rows={6}
            className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00d4ff]/40 focus:ring-1 focus:ring-[#00d4ff]/20 resize-none"
          />
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <input
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="Industry (optional, e.g. epoxy flooring)"
              className="flex-1 min-w-[200px] rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00d4ff]/40"
            />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#00d4ff]/40"
            >
              <option value="p0">P0 — Urgent</option>
              <option value="p1">P1 — High</option>
              <option value="p2">P2 — Normal</option>
              <option value="p3">P3 — Low</option>
            </select>
            <button
              onClick={addBulk}
              disabled={adding || !bulkText.trim()}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 border border-slate-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition disabled:opacity-40"
            >
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add to Queue
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {Object.entries(counts).map(([key, count]) => (
            <button
              key={key}
              onClick={() => setFilter(filter === key ? "all" : key)}
              className={`rounded-xl border p-3 text-left transition ${filter === key ? "border-[#00d4ff]/40 bg-[#00d4ff]/5" : "border-slate-200 bg-white hover:border-slate-300"}`}
            >
              <div className="text-2xl font-black text-slate-900">{count}</div>
              <div className="text-xs text-slate-500 capitalize">{key}</div>
            </button>
          ))}
        </div>

        {/* Queue list */}
        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-12 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              Loading queue...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              {filter === "all" ? "No items in the queue yet. Type a list above to get started." : `No ${filter} items.`}
            </div>
          ) : (
            filteredItems.map((item) => {
              const st = STATUS_STYLES[item.status] || STATUS_STYLES.pending;
              const pr = PRIORITY_STYLES[item.priority] || PRIORITY_STYLES.p2;
              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 flex items-start gap-3 hover:border-slate-300 hover:shadow-sm transition"
                >
                  <div className={`shrink-0 rounded-lg ${pr.bg} ${pr.color} px-2 py-1 text-xs font-bold`}>
                    {pr.label}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-slate-900 truncate">{item.title}</span>
                      {item.industry && (
                        <span className="text-xs text-slate-400">· {item.industry}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs">
                      <span className={`inline-flex items-center gap-1 rounded-full ${st.bg} ${st.color} px-2 py-0.5 font-semibold`}>
                        {item.status === "completed" && <CheckCircle2 className="w-3 h-3" />}
                        {item.status === "failed" && <AlertCircle className="w-3 h-3" />}
                        {(item.status === "pending" || item.status === "assigned" || item.status === "processing") && <Clock className="w-3 h-3" />}
                        {st.label}
                      </span>
                      {item.assigned_to && (
                        <span className="inline-flex items-center gap-1 text-slate-500">
                          {item.assigned_to === "gpt_engine" ? <Radio className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                          {item.assigned_to === "gpt_engine" ? "GPT Engine" : "Autonomous Coder"}
                        </span>
                      )}
                      {item.project_id && (
                        <a
                          href={`/portal?prefill=${encodeURIComponent(item.project_id)}`}
                          className="text-[#00d4ff] hover:underline font-semibold"
                        >
                          View project →
                        </a>
                      )}
                      {item.error && (
                        <span className="text-red-500 truncate" title={item.error}>{item.error}</span>
                      )}
                    </div>
                  </div>
                  {(item.status === "pending" || item.status === "assigned") && (
                    <button
                      onClick={() => cancelItem(item.id)}
                      className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
                      title="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  {(item.status === "completed" || item.status === "failed" || item.status === "cancelled") && (
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
                      title="Delete"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </PortalShell>
  );
}