import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { X, Loader2, Plus, Trash2, RefreshCw, AlertCircle } from "lucide-react";

export default function RecordViewer({ entityName, onClose }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [jsonInput, setJsonInput] = useState("{}");
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const page = await base44.entities[entityName].filter({}, { sort: "-created_date", limit: 50 });
      setRecords(page.items || []);
    } catch (err) {
      setError(err.message || "Failed to load records");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [entityName]);

  const createRecord = async () => {
    setCreating(true);
    try {
      const data = JSON.parse(jsonInput);
      await base44.entities[entityName].create(data);
      setJsonInput("{}");
      setShowCreate(false);
      load();
    } catch (err) {
      setError(err.message || "Failed to create record");
    } finally { setCreating(false); }
  };

  const deleteRecord = async (id) => {
    setDeletingId(id);
    try {
      await base44.entities[entityName].delete(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err.message || "Failed to delete record");
    } finally { setDeletingId(null); }
  };

  // Collect all field names from records
  const fieldNames = records.length > 0
    ? [...new Set(records.flatMap((r) => Object.keys(r)))].filter((f) => !["id"].includes(f)).slice(0, 6)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-4xl max-h-[85vh] rounded-2xl bg-white shadow-2xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="h-14 px-5 flex items-center justify-between border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00d4ff]/10 flex items-center justify-center">
              <span className="text-xs font-bold text-[#00d4ff]">{entityName.charAt(0)}</span>
            </div>
            <div>
              <div className="text-sm font-bold text-slate-800">{entityName}</div>
              <div className="text-[10px] text-slate-400">{records.length} records</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} disabled={loading} title="Refresh"
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#00d4ff] hover:bg-slate-100 transition">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button onClick={() => setShowCreate(!showCreate)} title="New record"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#00d4ff] px-3 py-1.5 text-xs font-bold text-[#0a0e14] hover:brightness-110 transition">
              <Plus className="w-3.5 h-3.5" /> New
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Create form */}
        {showCreate && (
          <div className="border-b border-slate-200 bg-slate-50 p-4 shrink-0">
            <p className="text-xs font-semibold text-slate-600 mb-2">Enter record data as JSON:</p>
            <textarea value={jsonInput} onChange={(e) => setJsonInput(e.target.value)} rows={4}
              className="w-full rounded-lg border border-slate-200 p-2 text-xs font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/30 resize-none" />
            <div className="flex gap-2 mt-2">
              <button onClick={createRecord} disabled={creating}
                className="rounded-lg bg-[#00d4ff] px-4 py-1.5 text-xs font-bold text-[#0a0e14] hover:brightness-110 disabled:opacity-50 transition">
                {creating ? <Loader2 className="w-3 h-3 animate-spin" /> : "Create Record"}
              </button>
              <button onClick={() => setShowCreate(false)} className="rounded-lg border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition">Cancel</button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 px-5 py-2 bg-red-50 text-xs text-red-600 shrink-0">
            <AlertCircle className="w-3.5 h-3.5" /> {error}
          </div>
        )}

        {/* Records table */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
          ) : records.length === 0 ? (
            <div className="text-center py-12 text-sm text-slate-400">No records found in {entityName}.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                <tr>
                  {fieldNames.map((f) => (
                    <th key={f} className="text-left px-3 py-2 font-semibold text-slate-600 whitespace-nowrap">{f}</th>
                  ))}
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                    {fieldNames.map((f) => (
                      <td key={f} className="px-3 py-2 text-slate-700 max-w-[200px] truncate">
                        {formatValue(r[f])}
                      </td>
                    ))}
                    <td className="px-2 py-2">
                      <button onClick={() => deleteRecord(r.id)} disabled={deletingId === r.id}
                        className="p-1 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 transition disabled:opacity-50">
                        {deletingId === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function formatValue(val) {
  if (val === null || val === undefined) return <span className="text-slate-300">—</span>;
  if (typeof val === "boolean") return val ? "true" : "false";
  if (typeof val === "object") return JSON.stringify(val).slice(0, 60) + "...";
  if (typeof val === "string" && val.length > 80) return val.slice(0, 80) + "...";
  return String(val);
}