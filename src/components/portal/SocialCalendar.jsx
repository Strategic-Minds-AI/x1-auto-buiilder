import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import BackButton from "@/components/shared/BackButton";
import { Loader2, Calendar, RefreshCw, Filter, ChevronLeft, ChevronRight, Instagram, Facebook, Twitter, Linkedin, Youtube, Wand2, CheckCircle2, Clock, Image as ImageIcon, Send } from "lucide-react";

const PLATFORMS = ["facebook", "instagram", "twitter", "linkedin", "tiktok"];
const PLATFORM_ICONS = { facebook: Facebook, instagram: Instagram, twitter: Twitter, linkedin: Linkedin, youtube: Youtube, tiktok: Youtube };
const PLATFORM_COLORS = { facebook: "#1877f2", instagram: "#e4405f", twitter: "#1da1f2", linkedin: "#0a66c2", tiktok: "#000000", youtube: "#ff0000" };
const POST_TYPES = ["promotional", "educational", "testimonial", "behind_the_scenes", "community", "tips", "call_to_action"];
const TYPE_COLORS = { promotional: "#ec4899", educational: "#3b82f6", testimonial: "#10b981", behind_the_scenes: "#f59e0b", community: "#8b5cf6", tips: "#06b6d4", call_to_action: "#ef4444" };

export default function SocialCalendar() {
  const [posts, setPosts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [platformFilter, setPlatformFilter] = useState("all");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState(PLATFORMS);
  const [generating, setGenerating] = useState(false);
  const [genStatus, setGenStatus] = useState("");
  const [generatingImages, setGeneratingImages] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [postRes, projRes] = await Promise.all([
        base44.entities.SocialPost.filter({}, { sort: "scheduled_date", limit: 500 }),
        base44.entities.WebsiteProject.filter({ status: { $in: ["generated", "preview_ready", "approved"] } }, { sort: "-created_date", limit: 100, fields: ["id", "business_name", "industry"] }),
      ]);
      setPosts(postRes.items || []);
      setProjects(projRes.items || []);
    } catch { setPosts([]); setProjects([]); }
    finally { setLoading(false); }
  };

  const generateCalendar = async () => {
    if (!selectedProject) { alert("Select a project first"); return; }
    setGenerating(true);
    setGenStatus("Generating 30-day content calendar...");
    try {
      const res = await base44.functions.invoke("generateSocialScheduleV2", {
        projectId: selectedProject,
        platforms: selectedPlatforms,
        generateImages: true
      });
      setGenStatus(`Generated ${res.data?.totalPosts || 0} posts, ${res.data?.imagesGenerated || 0} images`);
      await load();
    } catch (e) {
      alert("Generation failed: " + (e.message || "unknown"));
    } finally {
      setGenerating(false);
      setTimeout(() => setGenStatus(""), 3000);
    }
  };

  const generateMoreImages = async () => {
    setGeneratingImages(true);
    try {
      const draftPosts = posts.filter(p => !p.image_url && p.image_prompt).slice(0, 10);
      for (const post of draftPosts) {
        try {
          const imgRes = await base44.asServiceRole?.integrations?.Core?.GenerateImage?.({ prompt: post.image_prompt });
          if (imgRes?.url) {
            await base44.entities.SocialPost.update(post.id, { image_url: imgRes.url });
          }
        } catch (e) { /* skip */ }
      }
      await load();
    } catch (e) { alert("Image generation failed"); }
    finally { setGeneratingImages(false); }
  };

  const approvePost = async (postId) => {
    try {
      await base44.entities.SocialPost.update(postId, { status: "scheduled" });
      await load();
    } catch (e) { alert("Failed to approve post"); }
  };

  const approveAll = async () => {
    try {
      const draftIds = posts.filter(p => p.status === "draft").map(p => p.id);
      for (const id of draftIds) {
        await base44.entities.SocialPost.update(id, { status: "scheduled" });
      }
      await load();
    } catch (e) { alert("Failed to approve posts"); }
  };

  const filtered = useMemo(() => {
    return platformFilter === "all" ? posts : posts.filter(p => p.platform === platformFilter);
  }, [posts, platformFilter]);

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

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
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
      withImages: posts.filter(p => p.image_url).length,
    };
  }, [posts]);

  const togglePlatform = (p) => {
    setSelectedPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-[#00d4ff]" /></div>;
  }

  return (
    <div className="p-6 lg:p-8">
      <BackButton />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00d4ff]/10 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-[#00d4ff]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Social Media Automation</h1>
            <p className="text-sm text-slate-500">Full 30-day multi-platform content generation and scheduling</p>
          </div>
        </div>
        <button onClick={load} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:text-[#00d4ff] hover:border-[#00d4ff]/40 transition">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Generation panel */}
      <div className="rounded-2xl bg-white border border-slate-200 p-5 mb-6">
        <h3 className="text-sm font-bold text-slate-900 mb-3">Generate Social Content</h3>
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <select
            value={selectedProject}
            onChange={e => setSelectedProject(e.target.value)}
            className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#00d4ff]/50 transition min-w-[200px]"
          >
            <option value="">Select a project...</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.business_name} ({p.industry})</option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            {PLATFORMS.map(p => {
              const Icon = PLATFORM_ICONS[p];
              const active = selectedPlatforms.includes(p);
              return (
                <button
                  key={p}
                  onClick={() => togglePlatform(p)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold transition ${active ? "text-white" : "bg-slate-100 text-slate-400"}`}
                  style={active ? { background: PLATFORM_COLORS[p] } : {}}
                >
                  {Icon && <Icon className="w-3 h-3" />}
                  {p.slice(0, 2).toUpperCase()}
                </button>
              );
            })}
          </div>

          <button
            onClick={generateCalendar}
            disabled={generating || !selectedProject}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#00d4ff] to-[#0066ff] px-5 py-2.5 text-sm font-bold text-[#0a0e14] hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] transition disabled:opacity-50"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            {generating ? genStatus : "Generate 30-Day Calendar"}
          </button>
        </div>

        {posts.length > 0 && stats.withImages < stats.total && (
          <button
            onClick={generateMoreImages}
            disabled={generatingImages}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:text-[#00d4ff] hover:border-[#00d4ff]/40 transition disabled:opacity-50"
          >
            {generatingImages ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5" />}
            Generate More Post Images ({stats.total - stats.withImages} remaining)
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        <StatBox label="Total Posts" value={stats.total} color="#00d4ff" icon={Calendar} />
        <StatBox label="Drafts" value={stats.draft} color="#f59e0b" icon={Clock} />
        <StatBox label="Scheduled" value={stats.scheduled} color="#10b981" icon={CheckCircle2} />
        <StatBox label="Posted" value={stats.posted} color="#6366f1" icon={Send} />
        <StatBox label="With Images" value={stats.withImages} color="#06b6d4" icon={ImageIcon} />
      </div>

      {/* Action bar */}
      {stats.draft > 0 && (
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={approveAll}
            className="inline-flex items-center gap-2 rounded-full bg-[#10b981] px-4 py-2 text-xs font-bold text-white hover:brightness-110 transition"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Approve All Drafts ({stats.draft})
          </button>
        </div>
      )}

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
            <div key={i} className={`min-h-[120px] border-b border-r border-slate-100 p-1.5 ${!day ? "bg-slate-50/50" : ""}`}>
              {day && (
                <>
                  <div className="text-xs font-bold text-slate-400 mb-1">{day.day}</div>
                  <div className="space-y-1">
                    {(day.posts || []).slice(0, 4).map(post => {
                      const color = PLATFORM_COLORS[post.platform] || "#64748b";
                      const typeColor = TYPE_COLORS[post.post_type] || "#64748b";
                      return (
                        <div
                          key={post.id}
                          className="rounded px-1.5 py-1 text-[10px] truncate cursor-pointer hover:shadow-sm transition"
                          style={{ background: `${color}15`, borderLeft: `2px solid ${color}` }}
                          title={post.content}
                          onClick={() => approvePost(post.id)}
                        >
                          <div className="flex items-center gap-1">
                            <span className="font-bold" style={{ color }}>{post.platform.slice(0, 2).toUpperCase()}</span>
                            {post.image_url && <ImageIcon className="w-2.5 h-2.5 text-slate-400" />}
                            {post.status === "scheduled" && <CheckCircle2 className="w-2.5 h-2.5 text-green-500" />}
                          </div>
                          <div className="text-slate-600 mt-0.5 truncate">{(post.content || "").slice(0, 25)}</div>
                          {post.post_type && (
                            <div className="mt-0.5 inline-block rounded px-1 text-[8px] font-bold" style={{ background: `${typeColor}20`, color: typeColor }}>
                              {post.post_type.replace(/_/g, " ")}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {day.posts && day.posts.length > 4 && (
                      <div className="text-[9px] text-slate-400 px-1">+{day.posts.length - 4} more</div>
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
          <p className="text-sm text-slate-500">No social posts yet. Select a project and generate a 30-day calendar above.</p>
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, color, icon: Icon }) {
  return (
    <div className="rounded-xl bg-white border border-slate-200 p-3">
      {Icon && <Icon className="w-4 h-4 mb-1" style={{ color }} />}
      <div className="text-xl font-black" style={{ color }}>{value}</div>
      <div className="text-[10px] text-slate-500 mt-0.5">{label}</div>
    </div>
  );
}