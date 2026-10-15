import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Search, AlertCircle, CheckCircle, AlertTriangle, TrendingUp, Bot, Sparkles, ArrowRight, Loader2, Megaphone, Share2, Target } from "lucide-react";

export default function MarketingOverview({ onTabChange }) {
  const [score, setScore] = useState(null);
  const [issues, setIssues] = useState(0);
  const [warnings, setWarnings] = useState(0);
  const [passed, setPassed] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [socialPosts, setSocialPosts] = useState([]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [projPage, postsPage] = await Promise.all([
        base44.entities.WebsiteProject.filter({ status: { $in: ["preview_ready", "approved", "generated"] } }, { sort: "-created_date", limit: 10, fields: ["business_name", "industry", "status", "deploy_url"] }),
        base44.entities.SocialPost.filter({}, { sort: "-created_date", limit: 5, fields: ["content", "platform", "status", "scheduled_at"] }),
      ]);
      setProjects(projPage.items || []);
      setSocialPosts(postsPage.items || []);

      // Try to load latest compliance report
      const reportPage = await base44.entities.ComplianceReport.filter({}, { sort: "-created_date", limit: 1 });
      if (reportPage.items?.length > 0) {
        const r = reportPage.items[0];
        setScore(r.score || 0);
        setIssues((r.issues || []).length);
        setWarnings((r.warnings || []).length);
        setPassed((r.passed_checks || []).length);
        setTotal(((r.issues || []).length + (r.warnings || []).length + (r.passed_checks || []).length));
      } else {
        setScore(0);
        setTotal(31);
      }
    } catch {
      setScore(0);
      setTotal(31);
    } finally { setLoading(false); }
  };

  const runCompliance = async () => {
    if (!selectedProject) { alert("Select a project first"); return; }
    setRunning(true);
    try {
      const res = await base44.functions.invoke("runMarketingCompliance", { projectId: selectedProject });
      const data = res.data || res;
      setScore(data.score || 0);
      setIssues(data.summary?.failed || 0);
      setWarnings(data.summary?.warnings || 0);
      setPassed(data.summary?.passed || 0);
      setTotal(data.summary?.total || 31);
    } catch (e) { alert("Compliance check failed: " + (e.message || "unknown")); }
    finally { setRunning(false); }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#00d4ff]" /></div>;

  const scoreColor = score >= 90 ? "text-emerald-500" : score >= 70 ? "text-amber-500" : "text-red-500";
  const scoreBg = score >= 90 ? "from-emerald-500 to-emerald-600" : score >= 70 ? "from-amber-500 to-amber-600" : "from-red-500 to-red-600";

  return (
    <div className="space-y-6">
      {/* Marketing Agent CTA */}
      <div className="rounded-2xl border border-[#00d4ff]/30 bg-gradient-to-br from-[#00d4ff]/5 via-[#0066ff]/5 to-transparent p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center shrink-0">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Hand your marketing to an agent</h3>
            <p className="text-sm text-slate-600 mb-3">It reviews your app, competitors, and past campaigns, then plans what to build and launch.</p>
            <button onClick={() => onTabChange("agent")} className="inline-flex items-center gap-2 rounded-full bg-[#00d4ff] px-5 py-2.5 text-sm font-bold text-[#0a0e14] hover:brightness-110 transition">
              <Sparkles className="w-4 h-4" /> Set up your marketing agent
            </button>
          </div>
        </div>
      </div>

      {/* Score + Issues grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Score */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-3">
            <Search className="w-3.5 h-3.5" /> SEO & AI Search
          </div>
          <div className="flex items-end gap-1 mb-2">
            <span className={`text-4xl font-black ${scoreColor}`}>{score}</span>
            <span className="text-sm text-slate-400 mb-1">%</span>
          </div>
          <div className="text-xs text-slate-500">score</div>
          <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden">
            <div className={`h-full bg-gradient-to-r ${scoreBg} rounded-full transition-all`} style={{ width: `${score}%` }} />
          </div>
        </div>

        {/* Issues */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-3">
            <AlertCircle className="w-3.5 h-3.5 text-red-500" /> Issues to fix
          </div>
          <div className="text-4xl font-black text-red-500 mb-2">{issues}</div>
          <div className="text-xs text-slate-500">critical items</div>
        </div>

        {/* Warnings */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-3">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Warnings
          </div>
          <div className="text-4xl font-black text-amber-500 mb-2">{warnings}</div>
          <div className="text-xs text-slate-500">improvements recommended</div>
        </div>

        {/* Passed */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-3">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Passed
          </div>
          <div className="text-4xl font-black text-emerald-500 mb-2">{passed}</div>
          <div className="text-xs text-slate-500">of {total} checks</div>
        </div>
      </div>

      {/* Run compliance */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Run Google Compliance Check</h3>
            <p className="text-xs text-slate-500">Select a project and run the full compliance test</p>
          </div>
          <button onClick={runCompliance} disabled={running || !selectedProject}
            className="inline-flex items-center gap-2 rounded-full bg-[#00d4ff] px-5 py-2.5 text-sm font-bold text-[#0a0e14] hover:brightness-110 disabled:opacity-40 transition">
            {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {running ? "Running..." : "Run Check"}
          </button>
        </div>
        <select value={selectedProject || ""} onChange={(e) => setSelectedProject(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-[#00d4ff]/50">
          <option value="">Select a project...</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.business_name || "Untitled"} · {p.industry}</option>
          ))}
        </select>
        <button onClick={() => onTabChange("compliance")} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#00d4ff] hover:underline">
          View checklist <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Google Ads + Social content row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Google Ads */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Megaphone className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Google Ads</h3>
              <p className="text-xs text-slate-500">Let people discover your business</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 mb-3">Create campaigns that drive targeted traffic to your sites. Connect your Google Ads account to launch.</p>
          <button onClick={() => onTabChange("ads")} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-[#00d4ff] hover:border-[#00d4ff]/40 transition">
            <Target className="w-3.5 h-3.5" /> Create a campaign
          </button>
        </div>

        {/* Social Content */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <Share2 className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Social content</h3>
              <p className="text-xs text-slate-500">Promote your app on social</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 mb-3">We'll write the posts and pick the platforms that fit your app.</p>
          <button onClick={() => onTabChange("social")} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-[#00d4ff] hover:border-[#00d4ff]/40 transition">
            View all posts <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Recent social posts preview */}
      {socialPosts.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-3">Recent Social Posts</h3>
          <div className="space-y-2">
            {socialPosts.map((post) => (
              <div key={post.id} className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{post.platform || "social"}</span>
                  <span className="text-[10px] text-slate-400">{post.status}</span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">{post.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}