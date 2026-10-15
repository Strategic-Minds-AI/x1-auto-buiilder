import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import {
  Rocket, Globe, ShieldCheck, Loader2, CheckCircle2, XCircle, AlertCircle,
  Bot, Sparkles, Zap, TrendingUp, MapPin, ExternalLink, RefreshCw,
  Wand2, FileText, Users, Activity, DollarSign, Megaphone, Mail, BarChart3,
} from "lucide-react";

const AGENTS = [
  { name: "seo_sentinel", label: "SEO Compliance Sentinel", icon: ShieldCheck, desc: "Auto-converges sites to 100% Google compliance" },
  { name: "social_media_manager", label: "Social Media Manager", icon: Megaphone, desc: "30-day content calendars across all platforms" },
  { name: "communications_director", label: "Communications Director", icon: Mail, desc: "Gmail, Drive, and CRM sync operations" },
  { name: "analytics_watcher", label: "Analytics Watcher", icon: BarChart3, desc: "Monitors traffic, compliance, and performance" },
  { name: "monetization_agent", label: "Monetization Agent", icon: DollarSign, desc: "Operates product sales and revenue pipeline" },
];

export default function LaunchMonitor() {
  const [campaigns, setCampaigns] = useState([]);
  const [sites, setSites] = useState([]);
  const [reports, setReports] = useState({});
  const [socialCounts, setSocialCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [converging, setConverging] = useState({});
  const [provisioning, setProvisioning] = useState({});
  const [generatingSocial, setGeneratingSocial] = useState(null);
  const [expandedCampaign, setExpandedCampaign] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [campPage, sitePage] = await Promise.all([
        base44.entities.LaunchCampaign.filter({}, { sort: "-created_date", limit: 50 }),
        base44.entities.WebsiteProject.filter(
          { campaign_id: { $exists: true }, status: { $in: ["generated", "preview_ready", "approved"] } },
          { sort: "-created_date", limit: 200, fields: ["business_name", "industry", "location", "status", "deploy_url", "campaign_id", "content"] }
        ),
      ]);
      const campItems = campPage.items || [];
      const siteItems = sitePage.items || [];
      setCampaigns(campItems);
      setSites(siteItems);

      // Load latest compliance reports and social post counts for each site
      const reportPromises = siteItems.map(async (s) => {
        try {
          const rep = await base44.entities.ComplianceReport.filter(
            { project_id: s.id },
            { sort: "-created_date", limit: 1, fields: ["overall_score", "status", "round"] }
          );
          return [s.id, (rep.items && rep.items[0]) || null];
        } catch { return [s.id, null]; }
      });
      const socialPromises = siteItems.map(async (s) => {
        try {
          const count = await base44.entities.SocialPost.count({ project_id: s.id });
          return [s.id, count || 0];
        } catch { return [s.id, 0]; }
      });
      const [reportResults, socialResults] = await Promise.all([
        Promise.all(reportPromises),
        Promise.all(socialPromises),
      ]);
      setReports(Object.fromEntries(reportResults));
      setSocialCounts(Object.fromEntries(socialResults));
    } catch {
      setCampaigns([]); setSites([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const sitesByCampaign = sites.reduce((acc, s) => {
    const cid = s.campaign_id;
    if (!acc[cid]) acc[cid] = [];
    acc[cid].push(s);
    return acc;
  }, {});

  const stats = {
    total: sites.length,
    deployed: sites.filter((s) => s.deploy_url).length,
    avgScore: Object.values(reports).filter(Boolean).length > 0
      ? Math.round(Object.values(reports).filter(Boolean).reduce((sum, r) => sum + (r.overall_score || 0), 0) / Object.values(reports).filter(Boolean).length)
      : 0,
    socialPosts: Object.values(socialCounts).reduce((sum, c) => sum + c, 0),
  };

  const convergeSite = async (siteId) => {
    setConverging((c) => ({ ...c, [siteId]: true }));
    try {
      await base44.functions.invoke("autoConvergeSite", { projectId: siteId });
      await load();
    } catch (e) {
      console.error("Convergence failed:", e);
    } finally {
      setConverging((c) => ({ ...c, [siteId]: false }));
    }
  };

  const convergeCampaign = async (campaignId) => {
    const campaignSites = sitesByCampaign[campaignId] || [];
    for (const s of campaignSites) {
      await convergeSite(s.id);
    }
  };

  const provisionSite = async (siteId) => {
    setProvisioning((p) => ({ ...p, [siteId]: true }));
    try {
      await base44.functions.invoke("provisionSite", { projectId: siteId });
    } catch (e) {
      console.error("Provisioning failed:", e);
    } finally {
      setProvisioning((p) => ({ ...p, [siteId]: false }));
    }
  };

  const generateSocial = async (siteId) => {
    setGeneratingSocial(siteId);
    try {
      await base44.functions.invoke("generateSocialSchedule", { projectId: siteId });
      await load();
    } catch (e) {
      console.error("Social generation failed:", e);
    } finally {
      setGeneratingSocial(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-[#00d4ff]" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Rocket className="w-6 h-6 text-[#00d4ff]" /> Launch Monitor
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Autonomous monitoring, compliance convergence, and digital business operations across all launched sites.
          </p>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:text-[#00d4ff] hover:border-[#00d4ff]/40 transition"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Globe} label="Total Sites" value={stats.total} color="text-[#00d4ff]" />
        <StatCard icon={CheckCircle2} label="Deployed" value={stats.deployed} color="text-emerald-500" />
        <StatCard icon={ShieldCheck} label="Avg Compliance" value={`${stats.avgScore}%`} color={stats.avgScore >= 90 ? "text-emerald-500" : "text-amber-500"} />
        <StatCard icon={Megaphone} label="Social Posts" value={stats.socialPosts} color="text-purple-500" />
      </div>

      {/* Agent Specialist Team */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-[#00d4ff]" />
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Autonomous Agent Team</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {AGENTS.map((a) => {
            const Icon = a.icon;
            return (
              <div key={a.name} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00d4ff]/10">
                    <Icon className="w-4 h-4 text-[#00d4ff]" />
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> ACTIVE
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-900 mb-1">{a.label}</div>
                <div className="text-[10px] text-slate-500 leading-snug">{a.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Campaigns */}
      {campaigns.length === 0 ? (
        <div className="text-center py-20">
          <Rocket className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <h3 className="font-bold text-lg text-slate-900 mb-1">No campaigns yet</h3>
          <p className="text-slate-500 text-sm">Launch a mass campaign from the Mass Launch tab to see sites here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map((c) => {
            const cSites = sitesByCampaign[c.id] || [];
            const isExpanded = expandedCampaign === c.id;
            const allDeployed = cSites.length > 0 && cSites.every((s) => s.deploy_url);
            const avgScore = cSites.length > 0
              ? Math.round(cSites.reduce((sum, s) => sum + ((reports[s.id]?.overall_score) || 0), 0) / cSites.length)
              : 0;
            return (
              <div key={c.id} className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                <button
                  onClick={() => setExpandedCampaign(isExpanded ? null : c.id)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold ${allDeployed ? "bg-emerald-100 text-emerald-600" : "bg-[#00d4ff]/10 text-[#00d4ff]"}`}>
                      {c.sites_generated || cSites.length}
                    </span>
                    <div>
                      <div className="font-bold text-slate-900">{c.name}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        {c.industry} · {cSites.length} sites
                        {avgScore > 0 && <span className={`font-semibold ${avgScore >= 90 ? "text-emerald-600" : "text-amber-600"}`}>· {avgScore}% compliance</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {c.locations?.map((loc) => (
                      <span key={loc} className="hidden sm:inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
                        <MapPin className="w-2.5 h-2.5" /> {loc}
                      </span>
                    ))}
                    <button
                      onClick={(e) => { e.stopPropagation(); convergeCampaign(c.id); }}
                      disabled={cSites.length === 0}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#00d4ff] px-3 py-1.5 text-xs font-bold text-[#0a0e14] hover:brightness-110 transition disabled:opacity-50"
                    >
                      <Wand2 className="w-3 h-3" /> Auto-Converge All
                    </button>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-slate-200 p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {cSites.map((s) => {
                        const score = reports[s.id]?.overall_score || 0;
                        const deployed = !!s.deploy_url;
                        const socialCount = socialCounts[s.id] || 0;
                        return (
                          <div key={s.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <div className="flex items-start justify-between gap-2 mb-3">
                              <div className="min-w-0">
                                <div className="text-sm font-bold text-slate-900 truncate flex items-center gap-1.5">
                                  <MapPin className="w-3.5 h-3.5 text-[#00d4ff] shrink-0" />
                                  {s.location || s.industry}
                                </div>
                                <div className="text-[10px] text-slate-400 truncate mt-0.5">{s.business_name}</div>
                              </div>
                              <div className={`text-lg font-bold ${score >= 90 ? "text-emerald-600" : score >= 70 ? "text-amber-600" : "text-red-500"}`}>
                                {score || "—"}
                                {score > 0 && <span className="text-[10px] text-slate-400">%</span>}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 mb-3 text-[10px]">
                              {deployed ? (
                                <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                                  <CheckCircle2 className="w-3 h-3" /> Deployed
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-slate-400 font-semibold">
                                  <AlertCircle className="w-3 h-3" /> Not deployed
                                </span>
                              )}
                              {socialCount > 0 && (
                                <span className="inline-flex items-center gap-1 text-purple-500 font-semibold">
                                  <Megaphone className="w-3 h-3" /> {socialCount} posts
                                </span>
                              )}
                            </div>

                            {s.deploy_url && (
                              <a href={s.deploy_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-[#00d4ff] hover:underline mb-3 break-all">
                                <ExternalLink className="w-2.5 h-2.5 shrink-0" /> {s.deploy_url.replace("https://", "")}
                              </a>
                            )}

                            <div className="flex flex-wrap gap-1.5">
                              <button
                                onClick={() => convergeSite(s.id)}
                                disabled={!!converging[s.id]}
                                className="inline-flex items-center gap-1 rounded-lg bg-[#00d4ff]/10 border border-[#00d4ff]/20 px-2.5 py-1.5 text-[10px] font-bold text-[#00d4ff] hover:bg-[#00d4ff] hover:text-[#0a0e14] transition disabled:opacity-50"
                              >
                                {converging[s.id] ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3" />}
                                Converge
                              </button>
                              {deployed && (
                                <button
                                  onClick={() => provisionSite(s.id)}
                                  disabled={!!provisioning[s.id]}
                                  className="inline-flex items-center gap-1 rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1.5 text-[10px] font-bold text-slate-600 hover:bg-slate-200 transition disabled:opacity-50"
                                >
                                  {provisioning[s.id] ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />}
                                  Provision
                                </button>
                              )}
                              <button
                                onClick={() => generateSocial(s.id)}
                                disabled={generatingSocial === s.id}
                                className="inline-flex items-center gap-1 rounded-lg bg-purple-50 border border-purple-200 px-2.5 py-1.5 text-[10px] font-bold text-purple-600 hover:bg-purple-100 transition disabled:opacity-50"
                              >
                                {generatingSocial === s.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Megaphone className="w-3 h-3" />}
                                30-Day Posts
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
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

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
        <Icon className={`h-3.5 w-3.5 ${color}`} /> {label}
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
}