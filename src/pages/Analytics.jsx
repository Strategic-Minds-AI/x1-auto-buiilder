import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/shared/PageHeader";
import { Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import SearchConsolePanel from "@/components/analytics/SearchConsolePanel";

const PIE_COLORS = ["#00d4ff", "#0099ff", "#6366f1", "#f59e0b", "#ef4444", "#10b981"];

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [statusData, setStatusData] = useState([]);
  const [totals, setTotals] = useState({ projects: 0, campaigns: 0, templates: 0, deployed: 0 });

  useEffect(() => {
    (async () => {
      try {
        const [projAgg, projCount, campCount, tplCount, deployedCount] = await Promise.all([
          base44.entities.WebsiteProject.aggregate({ groupBy: "status" }),
          base44.entities.WebsiteProject.count({}),
          base44.entities.LaunchCampaign.count({}),
          base44.entities.Template.count({}),
          base44.entities.WebsiteProject.count({ deploy_url: { $exists: true } }),
        ]);
        const rows = projAgg.rows || [];
        setStatusData(rows.map((r) => ({ name: r.status || "unknown", value: r.count || 0 })));
        setTotals({ projects: projCount || 0, campaigns: campCount || 0, templates: tplCount || 0, deployed: deployedCount || 0 });
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="min-h-screen bg-background flex justify-center items-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageHeader title="Analytics Dashboard" subtitle="Traffic, performance, and SEO health across all managed sites" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard label="Total Projects" value={totals.projects} />
          <MetricCard label="Deployed Sites" value={totals.deployed} />
          <MetricCard label="Campaigns" value={totals.campaigns} />
          <MetricCard label="Templates" value={totals.templates} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-bold mb-4">Projects by Status</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statusData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" fill="#00d4ff" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-bold mb-4">Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={{ fontSize: 11 }}>
                  {statusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Google Search Console */}
        <SearchConsolePanel />
      </div>
    </div>
  );
}

function MetricCard({ label, value }) {
  return <div className="rounded-xl border border-border bg-card p-4"><div className="text-xs text-muted-foreground mb-1">{label}</div><div className="text-2xl font-bold">{value}</div></div>;
}