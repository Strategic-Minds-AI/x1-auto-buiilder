import { BarChart3, TrendingUp, Users, Globe, Link as LinkIcon } from "lucide-react";
import { Link } from "react-router-dom";

export default function AnalyticsPanel() {
  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-1">Analytics</h2>
          <p className="text-sm text-slate-500">Traffic, sales analytics, and session recordings for your published app.</p>
        </div>
        <Link to="/analytics" className="inline-flex items-center gap-1.5 rounded-lg bg-[#00d4ff] px-4 py-2 text-sm font-bold text-[#0a0e14] hover:brightness-110 transition">
          <BarChart3 className="w-4 h-4" /> Full Analytics
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard icon={TrendingUp} label="Page Views" value="—" />
        <StatCard icon={Users} label="Unique Visitors" value="—" />
        <StatCard icon={Globe} label="Deployed Sites" value="—" />
        <StatCard icon={BarChart3} label="Total Leads" value="—" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link to="/analytics" className="rounded-xl border border-slate-200 bg-white p-4 hover:border-[#00d4ff]/40 transition group">
          <BarChart3 className="w-5 h-5 text-[#00d4ff] mb-2" />
          <h3 className="text-sm font-bold text-slate-800 mb-0.5 group-hover:text-[#00d4ff]">Analytics Dashboard</h3>
          <p className="text-xs text-slate-500">View traffic trends, visitor data, and page performance</p>
        </Link>
        <Link to="/performance-dashboard" className="rounded-xl border border-slate-200 bg-white p-4 hover:border-[#00d4ff]/40 transition group">
          <TrendingUp className="w-5 h-5 text-[#00d4ff] mb-2" />
          <h3 className="text-sm font-bold text-slate-800 mb-0.5 group-hover:text-[#00d4ff]">Search Console</h3>
          <p className="text-xs text-slate-500">Google Search Console performance and keyword rankings</p>
        </Link>
      </div>
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 mt-4">
        <div className="flex items-center gap-2 mb-1">
          <LinkIcon className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-bold text-blue-700">Session Recordings & Sales Analytics</span>
        </div>
        <p className="text-xs text-blue-600">Full traffic analytics, session recordings, and sales data are available from the Analytics page in your app dashboard.</p>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-1"><Icon className="w-3.5 h-3.5 text-blue-500" /> {label}</div>
      <div className="text-2xl font-bold text-slate-800">{value}</div>
    </div>
  );
}