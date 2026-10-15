import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import BackButton from "@/components/shared/BackButton";
import { Loader2, RefreshCw, MousePointerClick, Eye, Target, TrendingUp, AlertCircle, Globe, BarChart3 } from "lucide-react";

export default function PerformanceReport() {
  const [projects, setProjects] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allStats, setAllStats] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { items } = await base44.entities.WebsiteProject.filter(
          { business_website: { $exists: true } },
          { sort: "-created_date", limit: 100, fields: ["id", "business_name", "business_website", "deploy_url", "industry"] }
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
      const propertyUrl = proj?.deploy_url || proj?.business_website;
      if (!propertyUrl) { setError("No site URL for this project."); setLoading(false); return; }
      const res = await base44.functions.invoke("syncSearchConsole", { projectId: selectedId, propertyUrl });
      const result = res.data;
      if (result.status === "AUTH_REQUIRED" || result.status === "ERROR" || result.status === "NOT_CONFIGURED") {
        setError(result.message || "Search Console error");
      } else {
        setData(result);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, [selectedId, projects]);

  useEffect(() => {
    if (selectedId) fetchData();
  }, [selectedId]);

  // Fetch stats for all projects (aggregate view)
  useEffect(() => {
    (async () => {
      const stats = [];
      for (const p of projects.slice(0, 10)) {
        try {
          const res = await base44.functions.invoke("syncSearchConsole", {
            projectId: p.id,
            propertyUrl: p.deploy_url || p.business_website,
          });
          if (res.data?.status === "HEALTHY") {
            stats.push({ id: p.id, name: p.business_name, ...res.data.metrics });
          }
        } catch {}
      }
      setAllStats(stats);
    })();
  }, [projects]);

  const totalClicks = allStats.reduce((s, p) => s + (p.clicks || 0), 0);
  const totalImpressions = allStats.reduce((s, p) => s + (p.impressions || 0), 0);
  const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions * 100).toFixed(1) : 0;

  return (
    <div className="portal-light min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton />
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Performance Report</h1>
            <p className="text-sm text-slate-500">Real traffic stats from Google Search Console across all launched sites</p>
          </div>
        </div>

        {/* Aggregate metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <MetricCard icon={Globe} label="Sites Tracked" value={allStats.length} color="text-cyan-600" />
          <MetricCard icon={MousePointerClick} label="Total Clicks" value={totalClicks} color="text-blue-600" />
          <MetricCard icon={Eye} label="Total Impressions" value={totalImpressions.toLocaleString()} color="text-indigo-600" />
          <MetricCard icon={Target} label="Avg CTR" value={`${avgCtr}%`} color="text-emerald-600" />
        </div>

        {/* All sites comparison */}
        {allStats.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 mb-6">
            <h3 className="text-sm font-bold text-slate-700 mb-3">All Sites Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr className="text-left text-slate-500">
                    <th className="px-3 py-2 font-semibold">Site</th>
                    <th className="px-3 py-2 font-semibold text-right">Clicks</th>
                    <th className="px-3 py-2 font-semibold text-right">Impressions</th>
                    <th className="px-3 py-2 font-semibold text-right">CTR</th>
                    <th className="px-3 py-2 font-semibold text-right">Position</th>
                  </tr>
                </thead>
                <tbody>
                  {allStats.map((s) => (
                    <tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedId(s.id)}>
                      <td className="px-3 py-2 font-medium text-slate-800">{s.name}</td>
                      <td className="px-3 py-2 text-right font-mono text-blue-600">{s.clicks || 0}</td>
                      <td className="px-3 py-2 text-right font-mono text-indigo-600">{(s.impressions || 0).toLocaleString()}</td>
                      <td className="px-3 py-2 text-right font-mono text-emerald-600">{s.ctr || 0}%</td>
                      <td className="px-3 py-2 text-right font-mono text-amber-600">{s.avgPosition || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Selected site detail */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#00d4ff]" />
              <h3 className="text-sm font-bold text-slate-700">Site Detail</h3>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/30"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.business_name}</option>
                ))}
              </select>
              <button onClick={fetchData} disabled={loading} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-[#00d4ff] hover:border-[#00d4ff]/40 transition disabled:opacity-50">
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />} Refresh
              </button>
            </div>
          </div>

          {loading && <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[#00d4ff]" /></div>}

          {error && !loading && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-0.5">Search Console API returned an error</p>
                <p>{error}</p>
                <p className="mt-1 text-amber-600/80">Make sure this property is verified in your Google Search Console account.</p>
              </div>
            </div>
          )}

          {data && !loading && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <MetricCard icon={MousePointerClick} label="Clicks" value={data.metrics?.clicks ?? 0} color="text-blue-600" />
                <MetricCard icon={Eye} label="Impressions" value={(data.metrics?.impressions ?? 0).toLocaleString()} color="text-indigo-600" />
                <MetricCard icon={Target} label="Avg CTR" value={`${data.metrics?.ctr ?? 0}%`} color="text-emerald-600" />
                <MetricCard icon={TrendingUp} label="Avg Position" value={data.metrics?.avgPosition ?? 0} color="text-amber-600" />
              </div>

              {data.topQueries && data.topQueries.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Top Queries (28 days)</h4>
                  <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50">
                        <tr className="text-left text-slate-500">
                          <th className="px-3 py-2 font-semibold">Query</th>
                          <th className="px-3 py-2 font-semibold text-right">Clicks</th>
                          <th className="px-3 py-2 font-semibold text-right">Impr.</th>
                          <th className="px-3 py-2 font-semibold text-right">CTR</th>
                          <th className="px-3 py-2 font-semibold text-right">Pos.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.topQueries.map((q, i) => (
                          <tr key={i} className="border-t border-slate-100 hover:bg-slate-50">
                            <td className="px-3 py-2 font-medium text-slate-800">{q.query}</td>
                            <td className="px-3 py-2 text-right font-mono text-blue-600">{q.clicks}</td>
                            <td className="px-3 py-2 text-right font-mono text-indigo-600">{q.impressions}</td>
                            <td className="px-3 py-2 text-right font-mono text-emerald-600">{q.ctr}%</td>
                            <td className="px-3 py-2 text-right font-mono text-amber-600">{q.position}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              <p className="text-xs text-slate-400">Data from Google Search Console · synced {new Date(data.syncedAt).toLocaleString()}</p>
            </div>
          )}

          {!data && !loading && !error && <div className="text-center py-6 text-sm text-slate-400">Select a site to pull Search Console performance data.</div>}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className={`w-3.5 h-3.5 ${color}`} />
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{label}</span>
      </div>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
    </div>
  );
}