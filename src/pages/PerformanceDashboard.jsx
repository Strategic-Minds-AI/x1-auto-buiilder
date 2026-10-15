import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import BackButton from "@/components/shared/BackButton";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, Legend
} from "recharts";
import {
  BarChart3, RefreshCw, MousePointerClick, Eye, TrendingUp, Search,
  Loader2, AlertCircle, Globe, ChevronDown, ChevronRight
} from "lucide-react";

export default function PerformanceDashboard() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [syncError, setSyncError] = useState(null);
  const [expandedQuery, setExpandedQuery] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const page = await base44.entities.WebsiteProject.filter(
          { status: { $in: ["generated", "preview_ready", "approved"] } },
          { sort: "-created_date", limit: 50, fields: ["business_name", "industry", "status", "deploy_url", "business_website"] }
        );
        setProjects(page.items || []);
        if (page.items?.length > 0) setSelectedProject(page.items[0]);
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  const handleSync = async () => {
    if (!selectedProject) return;
    setSyncing(true);
    setSyncError(null);
    setSyncResult(null);
    try {
      const res = await base44.functions.invoke("syncSearchConsole", {
        projectId: selectedProject.id,
        siteUrl: selectedProject.business_website || selectedProject.deploy_url || "",
      });
      setSyncResult(res.data);
    } catch (err) {
      setSyncError(err.response?.data?.error || err.message || "Sync failed");
    } finally { setSyncing(false); }
  };

  // Build chart data from sync result
  const chartData = syncResult?.dailyMetrics?.map((d) => ({
    date: d.date,
    clicks: d.clicks || 0,
    impressions: d.impressions || 0,
    ctr: parseFloat((d.ctr || 0).toFixed(2)),
    position: parseFloat((d.position || 0).toFixed(1)),
  })) || [];

  const topQueries = syncResult?.topQueries || [];
  const topPages = syncResult?.topPages || [];
  const totalClicks = chartData.reduce((s, d) => s + d.clicks, 0);
  const totalImpressions = chartData.reduce((s, d) => s + d.impressions, 0);
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0";
  const avgPosition = chartData.length > 0 ? (chartData.reduce((s, d) => s + d.position, 0) / chartData.length).toFixed(1) : "—";

  const MetricCard = ({ icon: Icon, label, value, color }) => (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
        <Icon className={`w-3.5 h-3.5 ${color}`} /> {label}
      </div>
      <div className="text-2xl font-bold text-slate-800">{value}</div>
    </div>
  );

  return (
    <div className="portal-light min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton />
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">Performance Dashboard</h1>
              <p className="text-sm text-slate-500">Google Search Console data — traffic, rankings, and query trends</p>
            </div>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing || !selectedProject}
            className="inline-flex items-center gap-2 rounded-full bg-[#00d4ff] px-5 py-2.5 text-sm font-bold text-[#0a0e14] disabled:opacity-50 hover:brightness-110 transition"
          >
            {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {syncing ? "Syncing..." : "Sync Search Console"}
          </button>
        </div>

        {/* Project selector */}
        <div className="mb-4">
          {loading ? (
            <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-[#00d4ff]" /></div>
          ) : projects.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
              <Globe className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No projects with websites yet. Generate a website first to sync Search Console data.</p>
            </div>
          ) : (
            <select
              className="dd-input max-w-md"
              value={selectedProject?.id || ""}
              onChange={(e) => {
                const p = projects.find((p) => p.id === e.target.value);
                setSelectedProject(p);
                setSyncResult(null);
              }}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.business_name || p.industry || "Untitled"} — {p.industry || "Unknown"}</option>
              ))}
            </select>
          )}
        </div>

        {syncError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4" /> {syncError}
            </div>
          </div>
        )}

        {syncResult && (
          <div className="space-y-4">
            {/* Summary metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MetricCard icon={MousePointerClick} label="Total Clicks" value={totalClicks} color="text-[#00d4ff]" />
              <MetricCard icon={Eye} label="Impressions" value={totalImpressions.toLocaleString()} color="text-blue-500" />
              <MetricCard icon={TrendingUp} label="Avg CTR" value={`${avgCtr}%`} color="text-emerald-500" />
              <MetricCard icon={Search} label="Avg Position" value={avgPosition} color="text-amber-500" />
            </div>

            {/* Clicks & Impressions over time */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-bold text-slate-700 mb-4">Clicks & Impressions Over Time</h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="clickGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="impGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="impressions" stroke="#3b82f6" fill="url(#impGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="clicks" stroke="#00d4ff" fill="url(#clickGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* CTR & Position */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="text-sm font-bold text-slate-700 mb-4">CTR Trend</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
                    <Line type="monotone" dataKey="ctr" stroke="#10b981" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="text-sm font-bold text-slate-700 mb-4">Average Position</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                    <YAxis reversed tick={{ fontSize: 10, fill: "#94a3b8" }} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
                    <Line type="monotone" dataKey="position" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Queries */}
            {topQueries.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="text-sm font-bold text-slate-700 mb-4">Top Search Queries</h3>
                <div className="space-y-1">
                  {topQueries.slice(0, 15).map((q, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg border border-slate-100 p-2.5 hover:bg-slate-50">
                      <span className="text-xs font-bold text-slate-400 w-6">{i + 1}</span>
                      <span className="text-sm text-slate-700 flex-1 truncate">{q.query || q.keys?.[0] || "—"}</span>
                      <span className="text-xs text-[#00d4ff] font-semibold w-16 text-right">{q.clicks || 0}</span>
                      <span className="text-xs text-blue-500 font-semibold w-20 text-right">{(q.impressions || 0).toLocaleString()}</span>
                      <span className="text-xs text-emerald-500 font-semibold w-14 text-right">{((q.ctr || 0) * 100).toFixed(1)}%</span>
                      <span className="text-xs text-amber-500 font-semibold w-14 text-right">{(q.position || 0).toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Pages */}
            {topPages.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="text-sm font-bold text-slate-700 mb-4">Top Pages</h3>
                <div className="space-y-1">
                  {topPages.slice(0, 10).map((p, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg border border-slate-100 p-2.5 hover:bg-slate-50">
                      <span className="text-xs font-bold text-slate-400 w-6">{i + 1}</span>
                      <span className="text-sm text-slate-600 flex-1 truncate">{p.page || p.keys?.[0] || "—"}</span>
                      <span className="text-xs text-[#00d4ff] font-semibold w-16 text-right">{p.clicks || 0}</span>
                      <span className="text-xs text-blue-500 font-semibold w-20 text-right">{(p.impressions || 0).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!syncResult && !syncError && !syncing && selectedProject && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-12 text-center">
            <BarChart3 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-400">Click "Sync Search Console" to pull performance data for this project.</p>
          </div>
        )}
      </div>
    </div>
  );
}