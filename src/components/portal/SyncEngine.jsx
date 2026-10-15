import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Cable, KeyRound, RefreshCw, CheckCircle2, XCircle, Copy } from "lucide-react";

const actions = [
  { name: "read", desc: "List records from an entity", example: '{"action":"read","entity":"WebsiteProject","query":{},"sort":"-created_date","limit":50}' },
  { name: "snapshot", desc: "Counts of all entities", example: '{"action":"snapshot"}' },
  { name: "create", desc: "Create a record", example: '{"action":"create","entity":"WebsiteProject","data":{"industry":"Roofing","business_website":"https://x.com"},"idempotency_key":"abc123"}' },
  { name: "update", desc: "Update a record by id", example: '{"action":"update","entity":"WebsiteProject","id":"<id>","data":{"status":"approved"}}' },
  { name: "delete", desc: "Delete a record by id", example: '{"action":"delete","entity":"WebsiteProject","id":"<id>"}' },
  { name: "execute", desc: "Trigger a generator function", example: '{"action":"execute","function":"massLaunch","payload":{"businessWebsiteUrl":"https://x.com","industry":"Roofing","locations":["Miami, FL"]},"idempotency_key":"launch-1"}' },
  { name: "events", desc: "Recent sync receipts", example: '{"action":"events","limit":25}' },
];

export default function SyncEngine() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await base44.entities.SyncReceipt.filter({}, { sort: "-created_date", limit: 25 });
      setReceipts(res.items || []);
    } catch (e) {
      setReceipts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const copy = (text, key) => {
    navigator.clipboard?.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 1500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <div>
        <h2 className="font-display font-bold text-2xl sm:text-3xl flex items-center gap-2">
          <Cable className="w-6 h-6 text-primary" /> GPT Sync Engine
        </h2>
        <p className="text-muted-foreground mt-1">
          A bidirectional endpoint an external system (e.g. ChatGPT) calls with a bearer token to read/write your
          projects, templates, and campaigns and trigger generation — with idempotency and signed receipts.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Endpoint</div>
          <code className="block rounded-lg bg-background/60 border border-border px-3 py-2 text-sm text-primary font-mono">
            POST /functions/gptSyncEngine
          </code>
          <p className="text-xs text-muted-foreground mt-1.5">
            Publish the app to get a live URL, then append <code className="text-foreground">/functions/gptSyncEngine</code>.
          </p>
        </div>
        <div>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5" /> Authentication
          </div>
          <code className="block rounded-lg bg-background/60 border border-border px-3 py-2 text-sm font-mono">
            Authorization: Bearer &lt;GPT_SYNC_API_KEY&gt;
          </code>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Actions</div>
        <div className="space-y-3">
          {actions.map((a) => (
            <div key={a.name} className="rounded-xl border border-border p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-primary font-mono">{a.name}</span>
                <button
                  onClick={() => copy(a.example, a.name)}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition"
                >
                  {copied === a.name ? <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />} copy
                </button>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{a.desc}</p>
              <pre className="text-[11px] font-mono text-foreground/80 bg-background/60 rounded-lg border border-border p-2 overflow-x-auto">{a.example}</pre>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Recent Sync Receipts</div>
          <button onClick={load} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : receipts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No sync activity yet.</p>
        ) : (
          <div className="space-y-2">
            {receipts.map((r) => (
              <div key={r.id} className="flex items-start gap-3 rounded-xl border border-border p-3">
                {r.status === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground">
                    {r.action} {r.entity && <span className="text-muted-foreground font-normal">· {r.entity}</span>}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{r.summary}</div>
                  {r.idempotency_key && (
                    <div className="text-[11px] text-muted-foreground/70 font-mono mt-0.5">key: {r.idempotency_key}</div>
                  )}
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${r.status === "success" ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"}`}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}