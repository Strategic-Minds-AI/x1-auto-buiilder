import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Share2, Loader2, Plus, Calendar, Sparkles, RefreshCw } from "lucide-react";

const PLATFORM_META = {
  facebook: { color: "#1877f2", label: "Facebook" },
  instagram: { color: "#e4405f", label: "Instagram" },
  tiktok: { color: "#000000", label: "TikTok" },
  youtube: { color: "#ff0000", label: "YouTube" },
  linkedin: { color: "#0a66c2", label: "LinkedIn" },
  pinterest: { color: "#bd081c", label: "Pinterest" },
  twitter: { color: "#1da1f2", label: "Twitter" },
  threads: { color: "#000000", label: "Threads" },
  google_business: { color: "#4285f4", label: "Google Business" },
};

export default function SocialContentPanel() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [postsPage, projPage] = await Promise.all([
        base44.entities.SocialPost.filter({}, { sort: "-created_date", limit: 50 }),
        base44.entities.WebsiteProject.filter({ status: { $in: ["preview_ready", "approved", "generated"] } }, { sort: "-created_date", limit: 20, fields: ["business_name", "industry"] }),
      ]);
      setPosts(postsPage.items || []);
      setProjects(projPage.items || []);
    } catch { setPosts([]); }
    finally { setLoading(false); }
  };

  const generate = async () => {
    if (!selectedProject) { alert("Select a project first"); return; }
    setGenerating(true);
    try {
      const proj = projects.find((p) => p.id === selectedProject);
      await base44.functions.invoke("generateSocialScheduleV2", {
        projectId: selectedProject,
        industry: proj?.industry || "general",
        businessName: proj?.business_name || "Business"
      });
      await load();
    } catch (e) { alert("Generation failed: " + (e.message || "unknown")); }
    finally { setGenerating(false); }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#00d4ff]" /></div>;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center">
          <Share2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Social Content</h3>
          <p className="text-xs text-slate-500">Promote your app on social — we'll write the posts and pick the platforms</p>
        </div>
      </div>

      {/* Generate */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-3">
          <select value={selectedProject || ""} onChange={(e) => setSelectedProject(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-[#00d4ff]/50">
            <option value="">Select a project to generate social content...</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.business_name || "Untitled"} · {p.industry}</option>
            ))}
          </select>
          <button onClick={generate} disabled={generating || !selectedProject}
            className="inline-flex items-center gap-2 rounded-full bg-[#00d4ff] px-5 py-2.5 text-sm font-bold text-[#0a0e14] hover:brightness-110 disabled:opacity-40 transition shrink-0">
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {generating ? "Generating..." : "Generate 30-Day Calendar"}
          </button>
        </div>
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <Share2 className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <p className="text-sm text-slate-400 mb-1">No social posts yet.</p>
          <p className="text-xs text-slate-400">Select a project and generate a 30-day social calendar.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">{posts.length} posts</span>
            <button onClick={load} className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-[#00d4ff]"><RefreshCw className="w-3 h-3" /> Refresh</button>
          </div>
          {posts.map((post) => {
            const meta = PLATFORM_META[post.platform] || { color: "#64748b", label: post.platform || "Social" };
            return (
              <div key={post.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: meta.color + "20" }}>
                    <Share2 className="w-3 h-3" style={{ color: meta.color }} />
                  </div>
                  <span className="text-xs font-bold" style={{ color: meta.color }}>{meta.label}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${post.status === "published" ? "bg-emerald-100 text-emerald-600" : post.status === "scheduled" ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"}`}>{post.status || "draft"}</span>
                  {post.scheduled_at && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                      <Calendar className="w-3 h-3" /> {new Date(post.scheduled_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{post.content}</p>
                {post.hashtags && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {post.hashtags.split(",").map((tag, i) => (
                      <span key={i} className="text-[10px] text-[#00d4ff] font-medium">{tag.trim()}</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}