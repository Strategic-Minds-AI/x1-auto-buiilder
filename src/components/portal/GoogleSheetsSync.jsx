import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Table, Link2, CheckCircle2, XCircle, Upload, Sparkles, FileSpreadsheet } from "lucide-react";

const CONNECTOR_ID = "69db1fad3c50db37ad0ce8dd";

export default function GoogleSheetsSync() {
  const [authed, setAuthed] = useState(false);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sheetUrl, setSheetUrl] = useState("");
  const [sheetData, setSheetData] = useState(null);
  const [reading, setReading] = useState(false);
  const [readError, setReadError] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [instantiating, setInstantiating] = useState(false);
  const [results, setResults] = useState(null);

  // Load templates for the dropdown
  useEffect(() => {
    base44.entities.SiteTemplate.filter({}, { sort: "-created_date", limit: 50, fields: ["name", "industry"] })
      .then(({ items }) => setTemplates(items || []))
      .catch(() => {});
  }, []);

  // Rule 1: check auth, then Rule 2: fetch to detect connection
  useEffect(() => {
    base44.auth.isAuthenticated().then(async (isAuthed) => {
      setAuthed(isAuthed);
      if (!isAuthed) { setLoading(false); return; }
      // Try a lightweight call to detect if Google Sheets is connected
      try {
        await base44.functions.invoke("syncGoogleSheet", { spreadsheetUrl: "test", action: "read" });
        setConnected(true); // shouldn't reach here with "test" but if it does, connected
      } catch (err) {
        // If the error is about the sheet not being found, the connection works
        const msg = err?.message || err?.response?.data?.error || "";
        setConnected(!msg.toLowerCase().includes("not connected"));
      }
      setLoading(false);
    });
  }, []);

  // Rule 3: open OAuth popup, poll for close, then re-check
  const handleConnect = async () => {
    try {
      const url = await base44.connectors.connectAppUser(CONNECTOR_ID);
      const popup = window.open(url, "_blank");
      const timer = setInterval(() => {
        if (!popup || popup.closed) {
          clearInterval(timer);
          setConnected(true);
        }
      }, 500);
    } catch (err) {
      setReadError("Failed to start OAuth: " + (err.message || "unknown"));
    }
  };

  const handleDisconnect = async () => {
    try {
      await base44.connectors.disconnectAppUser(CONNECTOR_ID);
      setConnected(false);
      setSheetData(null);
    } catch {}
  };

  const readSheet = async () => {
    setReading(true);
    setReadError(null);
    setSheetData(null);
    setResults(null);
    try {
      const res = await base44.functions.invoke("syncGoogleSheet", {
        spreadsheetUrl: sheetUrl,
        action: "read",
      });
      setSheetData(res.data);
    } catch (err) {
      setReadError(err?.response?.data?.error || err?.message || "Failed to read sheet");
      setConnected(false);
    } finally {
      setReading(false);
    }
  };

  const instantiate = async () => {
    if (!selectedTemplate || !sheetData) return;
    setInstantiating(true);
    setResults(null);
    try {
      const res = await base44.functions.invoke("syncGoogleSheet", {
        spreadsheetUrl: sheetUrl,
        action: "instantiate",
        templateId: selectedTemplate,
      });
      setResults(res.data);
    } catch (err) {
      setReadError(err?.response?.data?.error || err?.message || "Instantiation failed");
    } finally {
      setInstantiating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-[#00d4ff]" />
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 text-white/20" />
        <p className="text-white/50 text-sm mb-5">Please sign in to use Google Sheets sync.</p>
        <button
          onClick={() => base44.auth.redirectToLogin()}
          className="inline-flex items-center gap-2 rounded-full bg-[#00d4ff] px-5 py-2.5 text-sm font-bold text-[#0a0e14] hover:brightness-110 transition"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
          <Table className="w-6 h-6 text-[#00d4ff]" /> Google Sheets Sync
        </h1>
        <p className="text-sm text-white/40 mt-1">
          Read template variables from a Google Sheet and batch-instantiate websites.
        </p>
      </div>

      {/* Connection card */}
      <div className="rounded-2xl bg-[#0d1117] border border-white/8 p-5 mb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${connected ? "bg-green-500/15" : "bg-white/5"}`}>
              {connected ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <Link2 className="w-5 h-5 text-white/40" />}
            </div>
            <div>
              <div className="text-sm font-bold text-white">{connected ? "Google Sheets Connected" : "Not Connected"}</div>
              <div className="text-xs text-white/40">{connected ? "Your Google account is linked" : "Connect your Google account to read sheets"}</div>
            </div>
          </div>
          {connected ? (
            <button
              onClick={handleDisconnect}
              className="rounded-lg border border-white/15 px-4 py-2 text-xs font-semibold text-white/60 hover:text-white hover:bg-white/5 transition"
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={handleConnect}
              className="inline-flex items-center gap-2 rounded-lg bg-[#00d4ff] px-4 py-2 text-xs font-bold text-[#0a0e14] hover:brightness-110 transition"
            >
              <Link2 className="w-3.5 h-3.5" /> Connect Google Sheets
            </button>
          )}
        </div>
      </div>

      {/* Sheet URL input */}
      {connected && (
        <div className="rounded-2xl bg-[#0d1117] border border-white/8 p-5 mb-5">
          <label className="block mb-3">
            <span className="block text-xs font-bold text-white/40 uppercase tracking-wide mb-1.5">Google Sheet URL</span>
            <input
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              className="w-full rounded-xl bg-[#0a0e14] border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#00d4ff]/50 transition"
              placeholder="https://docs.google.com/spreadsheets/d/..."
            />
          </label>
          <button
            onClick={readSheet}
            disabled={!sheetUrl || reading}
            className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/15 transition disabled:opacity-50"
          >
            {reading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Read Sheet
          </button>
          {readError && <p className="mt-3 text-sm text-red-400">{readError}</p>}
        </div>
      )}

      {/* Sheet data preview */}
      {sheetData && (
        <div className="rounded-2xl bg-[#0d1117] border border-white/8 p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-bold text-white">{sheetData.spreadsheetTitle || "Sheet"}</div>
              <div className="text-xs text-white/40">{sheetData.selectedSheet} · {sheetData.totalRows} data rows</div>
            </div>
          </div>

          {/* Data table */}
          <div className="overflow-x-auto rounded-xl border border-white/8">
            <table className="w-full text-sm">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-3 py-2 text-left text-[10px] font-bold text-white/40 uppercase">#</th>
                  {sheetData.headers.map((h, i) => (
                    <th key={i} className="px-3 py-2 text-left text-[10px] font-bold text-white/40 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sheetData.rows.slice(0, 10).map((row) => (
                  <tr key={row.rowNumber} className="border-t border-white/5">
                    <td className="px-3 py-2 text-white/30 font-mono text-xs">{row.rowNumber}</td>
                    {sheetData.headers.map((h, i) => (
                      <td key={i} className="px-3 py-2 text-white/70 text-xs whitespace-nowrap">{row.variables[h] || "—"}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {sheetData.totalRows > 10 && (
            <p className="text-xs text-white/30 mt-2">Showing first 10 of {sheetData.totalRows} rows</p>
          )}

          {/* Template selector + instantiate */}
          <div className="mt-5 pt-5 border-t border-white/8">
            <label className="block mb-3">
              <span className="block text-xs font-bold text-white/40 uppercase tracking-wide mb-1.5">Site Template</span>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full rounded-xl bg-[#0a0e14] border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00d4ff]/50 transition"
              >
                <option value="">Select a template…</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>{t.name} ({t.industry})</option>
                ))}
              </select>
            </label>
            <button
              onClick={instantiate}
              disabled={!selectedTemplate || instantiating}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#00d4ff] to-[#0066ff] px-5 py-2.5 text-sm font-bold text-[#0a0e14] hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] transition disabled:opacity-50"
            >
              {instantiating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {instantiating ? "Instantiating…" : `Instantiate ${sheetData.totalRows} Sites`}
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="rounded-2xl bg-[#0d1117] border border-white/8 p-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-black text-green-400">{results.instantiated}</div>
              <div className="text-[10px] text-white/40 uppercase">Created</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-red-400">{results.failed}</div>
              <div className="text-[10px] text-white/40 uppercase">Failed</div>
            </div>
          </div>
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {results.results.map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                {r.success ? <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" /> : <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
                <span className="text-white/30 font-mono text-xs">Row {r.row}</span>
                <span className="text-white/70 text-xs">{r.success ? r.businessName : r.error}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}