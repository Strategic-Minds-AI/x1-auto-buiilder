import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { X, Loader2, Plus, Trash2, ChevronRight, Inbox, AlertCircle } from "lucide-react";

export default function RecordBrowser({ entity, onClose }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newRecord, setNewRecord] = useState({});
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const loadRecords = async (reset = false) => {
    setLoading(true);
    setError(null);
    try {
      const page = await base44.entities[entity.name].filter(
        {},
        { sort: "-created_date", limit: 25, cursor: reset ? undefined : cursor }
      );
      const items = page.items || page;
      setRecords(reset ? items : [...records, ...items]);
      setCursor(page.next_cursor);
      setHasMore(page.has_more);
    } catch (err) {
      setError(err.message || "Failed to load records");
    } finally { setLoading(false); }
  };

  useEffect(() => { loadRecords(true); }, [entity.name]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      await base44.entities[entity.name].create(newRecord);
      setShowCreate(false);
      setNewRecord({});
      loadRecords(true);
    } catch (err) {
      setError(err.message || "Failed to create record");
    } finally { setCreating(false); }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await base44.entities[entity.name].delete(id);
      setRecords(records.filter((r) => r.id !== id));
    } catch (err) {
      setError(err.message || "Failed to delete record");
    } finally { setDeleting(null); }
  };

  const renderValue = (val) => {
    if (val === null || val === undefined) return <span className="text-slate-300">—</span>;
    if (typeof val === "boolean") return <span className="text-xs font-mono text-slate-500">{String(val)}</span>;
    if (typeof val === "object") return <span className="text-xs text-slate-400 truncate max-w-[180px] block">{JSON.stringify(val).slice(0, 60)}...</span>;
    if (typeof val === "string" && val.length > 80) return <span className="text-xs text-slate-500 truncate max-w-[180px] block">{val.slice(0, 80)}...</span>;
    return <span className="text-xs text-slate-600">{String(val)}</span>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-4xl max-h-[85vh] rounded-2xl bg-white shadow-2xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="h-14 px-5 flex items-center justify-between border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00d4ff]/10 flex items-center justify-center">
              <span className="text-xs font-bold text-[#00d4ff]">{entity.name.charAt(0)}</span>
            </div>
            <div>
              <div className="text-sm font-bold text-slate-800">{entity.name} Records</div>
              <div className="text-[10px] text-slate-400">{entity.description}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowCreate(!showCreate)} className="inline-flex items-center gap-1.5 rounded-lg bg-[#00d4ff] px-3 py-1.5 text-xs font-bold text-[#0a0e14] hover:brightness-110 transition">
              <Plus className="w-3.5 h-3.5" /> New Record
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Create form */}
        {showCreate && (
          <div className="border-b border-slate-200 bg-slate-50 p-4 shrink-0">
            <div className="text-xs font-bold text-slate-500 mb-2">Create New Record</div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {entity.keyFields.map((field) => (
                <input key={field} value={newRecord[field] || ""} onChange={(e) => setNewRecord({ ...newRecord, [field]: e.target.value })}
                  placeholder={field} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/30" />
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={handleCreate} disabled={creating} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white hover:brightness-110 disabled:opacity-50 transition">
                {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />} Create
              </button>
              <button onClick={() => { setShowCreate(false); setNewRecord({}); }} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition">Cancel</button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-xs text-red-600 shrink-0">
            <AlertCircle className="w-3.5 h-3.5" /> {error}
          </div>
        )}

        {/* Records list */}
        <div className="flex-1 overflow-y-auto">
          {loading && records.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-5 h-5 text-slate-300 animate-spin" />
            </div>
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Inbox className="w-10 h-10 mb-2 text-slate-200" />
              <p className="text-sm">No records found</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {records.map((rec) => (
                <div key={rec.id} className="px-5 py-3 hover:bg-slate-50 transition group">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
                        <span className="text-xs font-mono text-slate-400 truncate">{rec.id?.slice(-8)}</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 ml-5">
                        {entity.keyFields.map((field) => (
                          <div key={field} className="flex items-center gap-1.5 min-w-0">
                            <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">{field}:</span>
                            {renderValue(rec[field])}
                          </div>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => handleDelete(rec.id)} disabled={deleting === rec.id}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition opacity-0 group-hover:opacity-100 disabled:opacity-50 shrink-0">
                      {deleting === rec.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {hasMore && !loading && (
            <div className="p-4 text-center">
              <button onClick={() => loadRecords(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition">Load More</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}