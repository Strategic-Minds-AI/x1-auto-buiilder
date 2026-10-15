import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Search, RefreshCw, AlertCircle, TrendingUp, MousePointerClick, Eye, Target, ChevronDown } from "lucide-react";

export default function SearchConsolePanel() {
  const [projects, setProjects] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [customUrl, setCustomUrl] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { items } = await base44.entities.WebsiteProject.filter(
          { business_website: { $exists: true } },
          { sort: "-created_date", limit: 100, fields: ["id", "business_name", "business_website", "deploy_url"] }
        );
        const valid = (items || []).filter((p) => p.business_website || p.deploy_url);
        setProjects(valid);
        if (valid.length > 0) setSelectedId(valid[0].id);
      } catch {}
    })();
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const proj = projects.find((p) => p.id === selectedId);
      const propertyUrl = customUrl || proj?.deploy_url || proj?.business_website;
      if (!propertyUrl) {
        setError("No site URL available. Enter a URL manually below.");
        setLoading(false);
        return;
      }
      const res = await base44.functions.invoke("syncSearchConsole", {
        projectId: selectedId || undefined,
        propertyUrl,
      });
      const result = res.data;
      if (result.status === "AUTH_REQUIRED") {
        setError(result.message);
      } else if (result.status === "ERROR") {
        setError(result.message + (result.details ? "" : ""));
        if (result.details) setError((prev) => prev + "\n" + result.details);
      } else if (result.status === "NOT_CONFIGURED") {
        setError(result.message);
      } else {
        setData(result);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to fetch Search Console data");
    } finally {
      setLoading(false);
    }
  }, [selectedId, customUrl, projects]);

  useEffect(() => {
    if (selectedId || customUrl) fetchData();
  }, [selectedId, customUrl]);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold">Google Search Console</h3>
          {data && <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-bold text-green-500">CONNECTED</span>}
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-primary hover:border-primary/40 transition disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          Refresh
        </button>
      </div>

      {/* Property selector */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <select
            value={selectedId}
            onChange={(e) => { setSelectedId(e.target.value); setCustomUrl(""); }}
            className="w-full appearance-none rounded-lg border border-input bg-background px-3 py-2 pr-9 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">— Select a site —</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.business_name} ({p.deploy_url || p.business_website})
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        </div>
        <input
          type="text"
          placeholder="or enter URL (https://...)"
          value={customUrl}
          onChange={(e) => { setCustomUrl(e.target.value); setSelectedId(""); }}
          className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-xs font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-600">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold mb-0.5">Search Console API returned an error</p>
            <p className="text-amber-600/80 break-words">{error}</p>
            <p className="mt-1 text-amber-600/60">
              Make sure this property is verified in your Google Search Console account.
            </p>
          </div>
        </div>
      )}

      {/* Data */}
      {data && !loading && (
        <div className="space-y-4">
          {/* Metric cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <SCMetric icon={MousePointerClick} label="Clicks" value={data.metrics?.clicks ?? 0} color="text-blue-400" />
            <SCMetric icon={Eye} label="Impressions" value={data.metrics?.impressions ?? 0} color="text-cyan-400" />
            <SCMetric icon={Target} label="Avg CTR" value={`${data.metrics?.ctr ?? 0}%`} color="text-green-400" />
            <SCMetric icon={TrendingUp} label="Avg Position" value={data.metrics?.avgPosition ?? 0} color="text-amber-400" />
          </div>

          {/* Top queries table */}
          {data.topQueries && data.topQueries.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">Top Queries (28 days)</h4>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50">
                    <tr className="text-left text-muted-foreground">
                      <th className="px-3 py-2 font-semibold">Query</th>
                      <th className="px-3 py-2 font-semibold text-right">Clicks</th>
                      <th className="px-3 py-2 font-semibold text-right">Impr.</th>
                      <th className="px-3 py-2 font-semibold text-right">CTR</th>
                      <th className="px-3 py-2 font-semibold text-right">Pos.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topQueries.map((q, i) => (
                      <tr key={i} className="border-t border-border hover:bg-muted/30">
                        <td className="px-3 py-2 font-medium text-foreground">{q.query}</td>
                        <td className="px-3 py-2 text-right text-blue-400 font-mono">{q.clicks}</td>
                        <td className="px-3 py-2 text-right text-cyan-400 font-mono">{q.impressions}</td>
                        <td className="px-3 py-2 text-right text-green-400 font-mono">{q.ctr}%</td>
                        <td className="px-3 py-2 text-right text-amber-400 font-mono">{q.position}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <p className="text-[10px] text-muted-foreground/60">
            Data from Google Search Console · synced {new Date(data.syncedAt).toLocaleString()}
          </p>
        </div>
      )}

      {/* Empty state */}
      {!data && !loading && !error && (
        <div className="text-center py-6 text-xs text-muted-foreground">
          Select a site above to pull Search Console performance data.
        </div>
      )}
    </div>
  );
}

function SCMetric({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-lg border border-border bg-background/50 p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className={`w-3.5 h-3.5 ${color}`} />
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</span>
      </div>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
    </div>
  );
}