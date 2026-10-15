import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";
import {
  Search, Trash2, FileText, Loader2, RefreshCw, Eye, X,
  Calendar, Tag, ChevronRight,
} from "lucide-react";
import { GENERATION_TYPES } from "@/data/universalStudioData";

const ICON_MAP = {
  FileText, Globe: FileText, LayoutGrid: FileText, Workflow: FileText, Boxes: FileText,
  FileSignature: FileText, Gavel: FileText, PenLine: FileText, Code: FileText,
  Target: FileText, Mail: FileText, Share2: FileText, LayoutTemplate: FileText,
  Filter: FileText, Palette: FileText, Sparkles: FileText,
};

export default function GenerationLibrary({ onReload, onRefresh }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [viewItem, setViewItem] = useState(null);

  const loadItems = async () => {
    setLoading(true);
    try {
      const query = {};
      if (filterType !== "all") query.generation_type = filterType;
      if (search.trim()) query.title = { $regex: search, $options: "i" };
      const page = await base44.entities.GenerationItem.filter(query, { sort: "-created_date", limit: 50 });
      setItems(page.items || []);
    } catch (err) {
      console.error("Failed to load items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadItems(); }, [filterType, search]);
  useEffect(() => { if (onRefresh) loadItems(); }, [onRefresh]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this item?")) return;
    try {
      await base44.entities.GenerationItem.delete(id);
      setItems(items.filter((i) => i.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleRegenerate = async (item) => {
    onReload?.(item);
  };

  const typeLabel = (t) => GENERATION_TYPES.find((g) => g.value === t)?.label || t;

  return (
    <div className="space-y-4">
      {/* Search & filter */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your library..."
              className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/30"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/30"
          >
            <option value="all">All Types</option>
            {GENERATION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Items grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-[#00d4ff] animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-400">No items in your library yet</p>
          <p className="text-xs text-slate-400 mt-1">Generate something to start building your library</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-4 hover:border-[#00d4ff]/40 hover:shadow-sm transition group">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-700 truncate">{item.title}</h4>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] font-bold text-[#00d4ff] bg-[#00d4ff]/10 px-2 py-0.5 rounded-full">
                      {typeLabel(item.generation_type)}
                    </span>
                    {item.status === "regenerated" && (
                      <span className="text-[10px] font-bold text-purple-500 bg-purple-50 px-2 py-0.5 rounded-full">
                        Regenerated
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {item.industry && (
                <p className="text-xs text-slate-400 mt-2">
                  {item.industry}{item.category ? ` / ${item.category}` : ""}{item.subcategory ? ` / ${item.subcategory}` : ""}
                </p>
              )}

              <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-2">
                <Calendar className="w-3 h-3" />
                {new Date(item.created_date).toLocaleDateString()}
              </div>

              <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setViewItem(item)}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition"
                >
                  <Eye className="w-3 h-3" /> View
                </button>
                <button
                  onClick={() => handleRegenerate(item)}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition"
                >
                  <RefreshCw className="w-3 h-3" /> Reload
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="ml-auto p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View modal */}
      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setViewItem(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800">{viewItem.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold text-[#00d4ff] bg-[#00d4ff]/10 px-2 py-0.5 rounded-full">
                    {typeLabel(viewItem.generation_type)}
                  </span>
                  {viewItem.industry && <span className="text-xs text-slate-400">{viewItem.industry}</span>}
                </div>
              </div>
              <button onClick={() => setViewItem(null)} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {viewItem.prompt && (
                <div className="mb-4 rounded-lg bg-slate-50 border border-slate-100 p-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Prompt</p>
                  <p className="text-xs text-slate-500">{viewItem.prompt}</p>
                </div>
              )}
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 max-h-[50vh] overflow-y-auto">
                <ReactMarkdown className="text-sm text-slate-700 prose prose-sm max-w-none prose-p:my-2 prose-headings:my-2">
                  {viewItem.content || "No content"}
                </ReactMarkdown>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => { handleRegenerate(viewItem); setViewItem(null); }}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] px-4 py-2.5 text-sm font-bold text-white hover:brightness-110 transition"
                >
                  <ChevronRight className="w-4 h-4" /> Load to Generator
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}