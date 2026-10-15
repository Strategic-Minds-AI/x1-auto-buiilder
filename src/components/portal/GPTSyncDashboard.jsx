import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import SyncCommandPanel from "@/components/portal/SyncCommandPanel";
import AutonomousSyncPanel from "@/components/portal/AutonomousSyncPanel";
import { Cable, RefreshCw, CheckCircle2, XCircle, Loader2, Activity, AlertCircle, CheckCheck, KeyRound } from "lucide-react";

export default function GPTSyncDashboard() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, success: 0, error: 0 });
  const [actionFilter, setActionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    try {
      const [receiptPage, totalCount, successCount, errorCount] = await Promise.all([
        base44.entities.SyncReceipt.filter({}, { sort: "-created_date", limit: 50 }),
        base44.entities.SyncReceipt.count({}),
        base44.entities.SyncReceipt.count({ status: "success" }),
        base44.entities.SyncReceipt.count({ status: "error" }),
      ]);
      setReceipts(receiptPage.items || []);
      setStats({ total: totalCount || 0, success: successCount || 0, error: errorCount || 0 });
    } catch { setReceipts([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { const unsub = base44.entities.SyncReceipt.subscribe(() => load()); return unsub; }, []);

  const filtered = receipts.filter((r) => {
    if (actionFilter !== "all" && r.action !== actionFilter) return false;
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl flex items-center gap-2">
            <Cable className="w-6 h-6 text-primary" /> GPT Sync Dashboard
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Monitor AI validation receipts and send commands to the generator to refine templates and brand assets.
          </p>
        </div>
        <button onClick={load} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition rounded-full border border-border px-3 py-2">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total Commands" value={stats.total} icon={Activity} color="text-primary" />
        <StatCard label="Successful" value={stats.success} icon={CheckCheck} color="text-emerald-400" />
        <StatCard label="Failed" value={stats.error} icon={AlertCircle} color="text-destructive" />
      </div>

      <AutonomousSyncPanel />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SyncCommandPanel onCommandComplete={load} />

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" /> Live Sync Feed
          </div>
          <div className="flex gap-2 mb-3">
            <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="text-xs rounded-lg border border-border bg-background px-2 py-1.5">
              <option value="all">All Actions</option>
              <option value="read">Read</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="execute">Execute</option>
              <option value="snapshot">Snapshot</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="text-xs rounded-lg border border-border bg-background px-2 py-1.5">
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="error">Error</option>
              <option value="duplicate">Duplicate</option>
            </select>
          </div>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No sync activity yet. Send a command to get started.</p>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {filtered.map((r) => (
                <div key={r.id} className="flex items-start gap-3 rounded-xl border border-border p-3">
                  {r.status === "success" ? <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" /> : r.status === "duplicate" ? <CheckCheck className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" /> : <XCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground">
                      {r.action} {r.entity && <span className="text-muted-foreground font-normal">· {r.entity}</span>}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{r.summary}</div>
                    {r.idempotency_key && <div className="text-[11px] text-muted-foreground/70 font-mono mt-0.5">key: {r.idempotency_key}</div>}
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${r.status === "success" ? "bg-primary/15 text-primary" : r.status === "duplicate" ? "bg-muted text-muted-foreground" : "bg-destructive/15 text-destructive"}`}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5 mb-1">
          <KeyRound className="w-3.5 h-3.5" /> External Endpoint
        </div>
        <p className="text-xs text-muted-foreground">External systems (e.g. ChatGPT) can send commands to the same engine via:</p>
        <code className="block rounded-lg bg-background/60 border border-border px-3 py-2 text-sm text-primary font-mono">
          POST /functions/gptSyncEngine · Authorization: Bearer &lt;GPT_SYNC_API_KEY&gt;
        </code>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
        <Icon className={`h-3.5 w-3.5 ${color}`} /> {label}
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}