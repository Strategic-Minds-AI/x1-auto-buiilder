import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Calendar, RefreshCw, Filter, ChevronLeft, ChevronRight, Instagram, Facebook, Twitter, Linkedin, Youtube } from "lucide-react";

const PLATFORMS = ["facebook", "instagram", "twitter", "linkedin", "tiktok", "youtube"];
const PLATFORM_ICONS = { facebook: Facebook, instagram: Instagram, twitter: Twitter, linkedin: Linkedin, youtube: Youtube, tiktok: Youtube };
const PLATFORM_COLORS = { facebook: "#1877f2", instagram: "#e4405f", twitter: "#1da1f2", linkedin: "#0a66c2", tiktok: "#000000", youtube: "#ff0000" };

export default function SocialCalendar() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [platformFilter, setPlatformFilter] = useState("all");
  const [viewMode, setViewMode] = useState("month");
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { items } = await base44.entities.SocialPost.filter({}, { sort: "scheduled_date", limit: 500 });
      setPosts(items || []);
    } catch { setPosts([]); }
    finally { setLoading(false); }
  };

  const filtered = useMemo(() => {
    return platformFilter === "all" ? posts : posts.filter(p => p.platform === platformFilter);
  }, [posts, platformFilter]);

  // Group posts by day
  const postsByDay = useMemo(() => {
    const map = {};
    filtered.forEach(p => {
      const day = p.scheduled_date ? new Date(p.scheduled_date).toISOString().split("T")[0] : null;
      if (day) {
        if (!map[day]) map[day] = [];
        map[day].push(p);
      }
    });
    return map;
  }, [filtered]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    // Pad start
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = new Date(year, month, d).toISOString().split("T")[0];
      days.push({ day: d, dateStr, posts: postsByDay[dateStr] || [] });
    }
    return days;
  }, [currentMonth, postsByDay]);

  const stats = useMemo(() => {
    return {
      total: posts.length,
      scheduled: posts.filter(p => p.status === "scheduled").length,
      draft: posts.filter(p => p.status === "draft").length,
      posted: posts.filter(p => p.status === "posted").length,
    };
  }, [posts]);

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-[#00d4ff]" /></div>;
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00d4ff]/10 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-[#00d4ff]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Social Calendar</h1>
            <p className="text-sm text-slate-500">30-day multi-platform content schedule</p>
          </div>
        </div>
        <button onClick={load} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:text-[#00d4ff] hover:border-[#00d4ff]/40 transition">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <StatBox label="Total Posts" value={stats.total} color="#00d4ff" />
        <StatBox label="Scheduled" value={stats.scheduled} color="#10b981" />
        <StatBox label="Drafts" value={stats.draft} color="#f59e0b" />
        <StatBox label="Posted" value={stats.posted} color="#6366f1" />
      </div>

      {/* Platform filter */}
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4 text-slate-400" />
        <button
          onClick={() => setPlatformFilter("all")}
          className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${platformFilter === "all" ? "bg-[#00d4ff] text-[#0a0e14]" : "bg-slate-100 text-slate-500"}`}
        >
          All Platforms
        </button>
        {PLATFORMS.map(p => {
          const Icon = PLATFORM_ICONS[p];
          return (
            <button
              key={p}
              onClick={() => setPlatformFilter(p)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition ${platformFilter === p ? "text-white" : "bg-slate-100 text-slate-500"}`}
              style={platformFilter === p ? { background: PLATFORM_COLORS[p] } : {}}
            >
              {Icon && <Icon className="w-3 h-3" />}
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          );
        })}
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-2 rounded-lg hover:bg-slate-100">
          <ChevronLeft className="w-5 h-5 text-slate-500" />
        </button>
        <h2 className="text-lg font-bold text-slate-900">
          {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h2>
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-2 rounded-lg hover:bg-slate-100">
          <ChevronRight className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-slate-200">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
            <div key={d} className="text-center text-xs font-bold text-slate-500 py-2">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {calendarDays.map((day, i) => (
            <div key={i} className={`min-h-[100px] border-b border-r border-slate-100 p-1.5 ${!day ? "bg-slate-50/50" : ""}`}>
              {day && (
                <>
                  <div className="text-xs font-bold text-slate-400 mb-1">{day.day}</div>
                  <div className="space-y-1">
                    {(day.posts || []).slice(0, 3).map(post => {
                      const color = PLATFORM_COLORS[post.platform] || "#64748b";
                      return (
                        <div key={post.id} className="rounded px-1.5 py-1 text-[10px] truncate" style={{ background: `${color}15`, borderLeft: `2px solid ${color}` }}>
                          <span className="font-bold" style={{ color }}>{post.platform.slice(0, 2).toUpperCase()}</span>
                          <span className="text-slate-600 ml-1">{(post.content || "").slice(0, 20)}</span>
                        </div>
                      );
                    })}
                    {day.posts && day.posts.length > 3 && (
                      <div className="text-[9px] text-slate-400 px-1">+{day.posts.length - 3} more</div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {posts.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <p className="text-sm text-slate-500">No social posts scheduled yet. Generate a social campaign from a project.</p>
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, color }) {
  return (
    <div className="rounded-xl bg-white border border-slate-200 p-3">
      <div className="text-xl font-black" style={{ color }}>{value}</div>
      <div className="text-[10px] text-slate-500 mt-0.5">{label}</div>
    </div>
  );
}