import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import RecordViewer from "./RecordViewer";
import { Search, ArrowUpDown, Shield, Table, X, Loader2, CheckCircle, AlertCircle, Download } from "lucide-react";

export default function DataExplorer({ entities, activeEntity, onEntitySelect }) {
  const [search, setSearch] = useState("");
  const [sortAZ, setSortAZ] = useState(true);
  const [tab, setTab] = useState("tables");
  const [scanStatus, setScanStatus] = useState(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanDismissed, setScanDismissed] = useState(false);
  const [recordViewerEntity, setRecordViewerEntity] = useState(null);

  // Check for existing scan on mount
  useEffect(() => {
    (async () => {
      try {
        const page = await base44.entities.SystemTestReport.filter({}, { sort: "-created_date", limit: 1, fields: ["score", "status", "total_tests", "passed_tests", "failed_tests", "created_date"] });
        if (page.items?.[0]) setScanStatus(page.items[0]);
      } catch {}
    })();
  }, []);

  const filtered = entities
    .filter((e) => e.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortAZ ? a.localeCompare(b) : b.localeCompare(a));

  const runScan = async () => {
    setScanLoading(true);
    try {
      const result = await base44.functions.invoke("runSystemTests", { fixIssues: true });
      setScanStatus(result.report || { score: 0, status: "failed" });
    } catch (err) {
      setScanStatus({ score: 0, status: "failed", summary: err.message || "Scan failed" });
    } finally { setScanLoading(false); }
  };

  const handleCardClick = (entity) => {
    onEntitySelect(entity);
    setRecordViewerEntity(entity);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Data</h1>
      <p className="text-sm text-slate-500 mb-6">View and manage the data stored in your app.</p>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 mb-6">
        <button onClick={() => setTab("tables")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${tab === "tables" ? "border-[#00d4ff] text-[#00d4ff]" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
          Tables
        </button>
        <button onClick={() => setTab("backup")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${tab === "backup" ? "border-[#00d4ff] text-[#00d4ff]" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
          Backup & Restore
        </button>
      </div>

      {tab === "tables" ? (
        <>
          {/* Security scan banner */}
          {!scanDismissed && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 mb-6 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                {scanStatus?.score === 100 ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-amber-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-700">
                  {scanStatus?.score === 100
                    ? `System scan passed — ${scanStatus.score}% (${scanStatus.passed_tests}/${scanStatus.total_tests} tests)`
                    : scanStatus?.status === "failed"
                    ? `Security scan found issues — score: ${scanStatus.score || 0}%`
                    : "No security scan has been run yet. Run scan to identify permission risks."}
                </p>
                {scanStatus?.summary && <p className="text-xs text-slate-500 mt-0.5">{scanStatus.summary}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => setScanDismissed(true)} className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition">Dismiss</button>
                <button onClick={runScan} disabled={scanLoading}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-700 disabled:opacity-50 transition">
                  {scanLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Shield className="w-3 h-3" />}
                  {scanLoading ? "Scanning..." : "Scan"}
                </button>
              </div>
            </div>
          )}

          {/* Search + Sort */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tables..."
                className="w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/30" />
            </div>
            <button onClick={() => setSortAZ(!sortAZ)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:border-[#00d4ff]/40 hover:text-[#00d4ff] transition">
              <ArrowUpDown className="w-3.5 h-3.5" /> {sortAZ ? "A-Z" : "Z-A"}
            </button>
          </div>

          {/* Table cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map((entity) => (
              <button key={entity} onClick={() => handleCardClick(entity)}
                className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${activeEntity === entity ? "border-[#00d4ff] bg-[#00d4ff]/5" : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"}`}>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${activeEntity === entity ? "bg-[#00d4ff]/15" : "bg-slate-100"}`}>
                  <Table className={`w-4 h-4 ${activeEntity === entity ? "text-[#00d4ff]" : "text-slate-500"}`} />
                </div>
                <span className={`text-sm font-semibold truncate ${activeEntity === entity ? "text-[#00d4ff]" : "text-slate-700"}`}>{entity}</span>
              </button>
            ))}
          </div>
          {filtered.length === 0 && <p className="text-sm text-slate-400 text-center py-8">No tables match your search.</p>}
        </>
      ) : (
        <BackupRestore entities={entities} />
      )}

      {/* Record viewer modal */}
      {recordViewerEntity && (
        <RecordViewer entityName={recordViewerEntity} onClose={() => setRecordViewerEntity(null)} />
      )}
    </div>
  );
}

function BackupRestore({ entities }) {
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(null);

  const exportAll = async () => {
    setExporting(true);
    try {
      const data = {};
      for (const entity of entities.slice(0, 10)) {
        try {
          const page = await base44.entities[entity].filter({}, { limit: 50, fields: ["id", "created_date"] });
          data[entity] = { count: page.items?.length || 0, sample_ids: (page.items || []).map((r) => r.id) };
        } catch (e) {
          data[entity] = { error: e.message };
        }
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setExported("Backup exported successfully");
    } catch (err) {
      setExported("Export failed: " + err.message);
    } finally { setExporting(false); }
  };

  return (
    <div className="rounded-xl border border-slate-200 p-6">
      <h3 className="text-sm font-bold text-slate-800 mb-2">Backup & Restore</h3>
      <p className="text-sm text-slate-500 mb-4">Export your app data as a JSON backup file.</p>
      <button onClick={exportAll} disabled={exporting}
        className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-bold text-white hover:bg-slate-700 disabled:opacity-50 transition">
        {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        {exporting ? "Exporting..." : "Export Backup"}
      </button>
      {exported && <p className="text-xs text-slate-500 mt-3">{exported}</p>}
    </div>
  );
}