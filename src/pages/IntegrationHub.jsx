import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import BackButton from "@/components/shared/BackButton";
import { Loader2, Search, Zap, Download, Bot, Wrench, GitBranch, Package, Sparkles, Plug, CheckCircle, RefreshCw, ArrowRight, Boxes, Brain, Code, Star, TrendingUp } from "lucide-react";

const LIBRARIES = [
  { key: 'skills', entity: 'AISkill', name: 'AI Skills', icon: Zap, color: 'from-purple-500 to-indigo-500', desc: '300+ AI skills across 30 categories', route: '/ai-skills-library' },
  { key: 'tools', entity: 'AITool', name: 'AI Tools', icon: Wrench, color: 'from-blue-500 to-cyan-500', desc: '300+ AI tools with providers and APIs', route: '/ai-tool-library' },
  { key: 'free', entity: 'FreeAsset', name: 'Free Assets', icon: Download, color: 'from-emerald-400 to-teal-500', desc: 'Free AI tools, templates, prompt packs & more', route: '/free-library' },
  { key: 'agents', entity: 'AgentProfile', name: 'Agent Library', icon: Bot, color: 'from-amber-500 to-orange-500', desc: '40+ specialized AI agents', route: '/agent-library' },
  { key: 'github', entity: 'GitHubRepo', name: 'GitHub Intelligence', icon: GitBranch, color: 'from-slate-700 to-slate-900', desc: 'Daily scraped trending repos', route: '/integration-hub' },
  { key: 'templates', entity: 'Template', name: 'Templates', icon: Package, color: 'from-pink-500 to-rose-500', desc: 'Master website & app templates', route: '/portal' },
  { key: 'comm', entity: 'CommChannel', name: 'Comms Library', icon: Plug, color: 'from-cyan-500 to-blue-500', desc: 'SMS, voice, email, WhatsApp channels', route: '/comm-library' },
];

export default function IntegrationHub() {
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [scrapeResult, setScrapeResult] = useState(null);
  const [query, setQuery] = useState("");
  const [githubRepos, setGithubRepos] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => { loadCounts(); loadGithubRepos(); }, []);

  const loadCounts = async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled(
        LIBRARIES.map(async (lib) => {
          const count = await base44.entities[lib.entity].count({});
          return { key: lib.key, count };
        })
      );
      const c = {};
      results.forEach((r, i) => { if (r.status === 'fulfilled') c[LIBRARIES[i].key] = r.value.count; });
      setCounts(c);
    } catch {}
    finally { setLoading(false); }
  };

  const loadGithubRepos = async () => {
    try {
      const { items } = await base44.entities.GitHubRepo.filter({}, { sort: '-stars', limit: 20, fields: ['full_name', 'description', 'stars', 'language', 'category', 'url', 'readme_summary', 'intelligence_score', 'scanned_at'] });
      setGithubRepos(items || []);
    } catch { setGithubRepos([]); }
  };

  const runScrape = async () => {
    setScraping(true);
    setScrapeResult(null);
    try {
      const res = await base44.functions.invoke("scrapeGitHubTrending", {});
      setScrapeResult(res.data);
      await loadGithubRepos();
      await loadCounts();
    } catch (e) { setScrapeResult({ error: e.message || 'Scrape failed' }); }
    finally { setScraping(false); }
  };

  const filteredRepos = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return githubRepos;
    return githubRepos.filter(r => (r.full_name || '').toLowerCase().includes(q) || (r.description || '').toLowerCase().includes(q) || (r.language || '').toLowerCase().includes(q));
  }, [githubRepos, query]);

  return (
    <div className="portal-light min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BackButton />
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center">
            <Boxes className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Integration Hub</h1>
            <p className="text-sm text-slate-500">Find, sync, and implement assets across all your libraries</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-slate-200">
          {[
            { key: 'overview', label: 'Overview', icon: Boxes },
            { key: 'github', label: 'GitHub Intelligence', icon: GitBranch },
            { key: 'implement', label: 'Quick Implement', icon: Zap },
          ].map((t) => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition ${activeTab === t.key ? 'border-[#00d4ff] text-[#00d4ff]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Library cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {LIBRARIES.map((lib) => {
                const Icon = lib.icon;
                const count = counts[lib.key] ?? null;
                return (
                  <div key={lib.key} className="rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-md transition group">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${lib.color} flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      {count !== null && <span className="text-2xl font-black text-slate-900">{count}</span>}
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm mb-1">{lib.name}</h3>
                    <p className="text-xs text-slate-500 mb-3">{lib.desc}</p>
                    <a href={lib.route} className="inline-flex items-center gap-1 text-xs font-bold text-[#00d4ff] hover:gap-2 transition-all">
                      Open Library <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                );
              })}
            </div>

            {/* GitHub scrape control */}
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
                    <GitBranch className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">GitHub Passive Intelligence</h3>
                    <p className="text-xs text-slate-500">Daily automated scrape of trending repos — discovers new AI tools, templates, and frameworks</p>
                  </div>
                </div>
                <button onClick={runScrape} disabled={scraping} className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800 transition disabled:opacity-50">
                  {scraping ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Run Scrape Now
                </button>
              </div>
              {scrapeResult && (
                <div className={`rounded-xl p-4 text-sm ${scrapeResult.error ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>
                  {scrapeResult.error ? scrapeResult.error : `✓ Scanned ${scrapeResult.scanned} repos across ${scrapeResult.topics_scanned} topics. ${scrapeResult.total_in_database} total repos in database.`}
                </div>
              )}
              <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Auto-runs daily at 6:00 AM ET via the GitHub Daily Scrape workflow</span>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <QuickStat label="Total Assets" value={Object.values(counts).reduce((a, b) => a + b, 0)} icon={Boxes} />
              <QuickStat label="AI Skills" value={counts.skills || 0} icon={Zap} />
              <QuickStat label="Free Assets" value={counts.free || 0} icon={Download} />
              <QuickStat label="GitHub Repos" value={counts.github || 0} icon={GitBranch} />
            </div>
          </>
        )}

        {activeTab === 'github' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-slate-700" />
                <h3 className="font-bold text-slate-900">Trending Repositories</h3>
                <span className="text-sm text-slate-400">({githubRepos.length} shown)</span>
              </div>
              <button onClick={runScrape} disabled={scraping} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:text-[#00d4ff] hover:border-[#00d4ff]/40 transition disabled:opacity-50">
                {scraping ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Refresh
              </button>
            </div>
            <div className="relative mb-4">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-11 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00d4ff]/50" placeholder="Search repos..." value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            {filteredRepos.length === 0 ? (
              <div className="text-center py-12">
                <GitBranch className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="text-slate-400 text-sm mb-3">No repos scanned yet. Run a scrape to discover trending repos.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRepos.map((repo) => (
                  <div key={repo.id} className="rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300 transition">
                    <div className="flex items-start justify-between mb-2">
                      <div className="min-w-0">
                        <a href={repo.url} target="_blank" rel="noreferrer" className="font-bold text-slate-900 text-sm hover:text-[#00d4ff] transition flex items-center gap-1.5">
                          {repo.full_name} <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                        </a>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{repo.readme_summary || repo.description}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-4">
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                          <Star className="w-3.5 h-3.5" /> {repo.stars}
                        </div>
                        {repo.intelligence_score > 0 && (
                          <div className="rounded-full bg-[#00d4ff]/10 px-2 py-0.5 text-[10px] font-bold text-[#00d4ff]">
                            Score: {repo.intelligence_score}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {repo.language && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">{repo.language}</span>}
                      <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-700">{(repo.category || '').replace(/_/g, ' ')}</span>
                      {(repo.relevance_tags || []).slice(0, 3).map((t) => <span key={t} className="rounded-full bg-slate-50 px-2 py-0.5 text-[10px] text-slate-400">{t}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'implement' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 mb-2">Quick Implement — One-Click Asset Installation</h3>
            <p className="text-sm text-slate-500 mb-4">Browse all available assets and implement them directly into your projects. Each asset includes installation steps, code snippets, and integration guides.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ImplementCard icon={Download} title="Free Assets Library" desc="Install free AI tools, templates, prompt packs, video assets, and workflow templates into your projects." route="/free-library" color="from-emerald-400 to-teal-500" />
              <ImplementCard icon={Zap} title="AI Skills Library" desc="Browse 300+ AI skills with input/output schemas. Copy skill definitions for use in any AI system." route="/ai-skills-library" color="from-purple-500 to-indigo-500" />
              <ImplementCard icon={Wrench} title="AI Tools Library" desc="Browse 300+ AI tools with provider info, API docs, and integration types." route="/ai-tool-library" color="from-blue-500 to-cyan-500" />
              <ImplementCard icon={Bot} title="Agent Library" desc="Browse 40+ specialized agents and assign them to your projects." route="/agent-library" color="from-amber-500 to-orange-500" />
              <ImplementCard icon={Code} title="API Documentation" desc="Connect external systems via the API gateway with full entity and function docs." route="/api-docs" color="from-slate-700 to-slate-900" />
              <ImplementCard icon={Plug} title="API Connectors" desc="Manage OAuth connectors for Gmail, Calendar, Supabase, GitHub, and more." route="/api-connectors" color="from-cyan-500 to-blue-500" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function QuickStat({ label, value, icon: Icon }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 text-[#00d4ff]" />
        <span className="text-xs font-semibold text-slate-400">{label}</span>
      </div>
      <p className="text-2xl font-black text-slate-900">{value}</p>
    </div>
  );
}

function ImplementCard({ icon: Icon, title, desc, route, color }) {
  return (
    <a href={route} className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-[#00d4ff]/40 hover:shadow-md transition group block">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h4 className="font-bold text-slate-900 text-sm mb-1">{title}</h4>
      <p className="text-xs text-slate-500 mb-3">{desc}</p>
      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#00d4ff] group-hover:gap-2 transition-all">
        Open <ArrowRight className="w-3 h-3" />
      </span>
    </a>
  );
}