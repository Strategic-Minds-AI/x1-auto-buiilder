import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import {
  Loader2, Building2, TrendingUp, Search, ChevronDown, ArrowRight,
  Globe, Phone, Mail, MapPin, Clock, Sparkles, Plus, CheckCircle2,
} from "lucide-react";

const INDUSTRIES = [
  "Roofing", "Electrical", "HVAC", "Plumbing", "Legal", "Real Estate",
  "Dental", "Medical", "Automotive", "Hospitality", "Fitness", "Finance",
  "Remodeling", "Landscaping", "Solar", "Pest Control", "Cleaning", "Insurance",
];

export default function ResearchHub() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  // Skip-tracing form
  const [url, setUrl] = useState("");
  const [industry, setIndustry] = useState(INDUSTRIES[0]);
  const [businessName, setBusinessName] = useState("");
  const [researching, setResearching] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState(null);

  useEffect(() => { loadProjects(); }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const page = await base44.entities.WebsiteProject.filter(
        {},
        { sort: "-created_date", limit: 50, fields: ["business_name", "industry", "business_website", "business_research", "benchmark", "status"] }
      );
      setProjects(page.items || []);
    } catch { setProjects([]); }
    finally { setLoading(false); }
  };

  const research = async (e) => {
    e.preventDefault();
    if (!url) return;
    setResearching(true);
    setError(null);
    setResult(null);
    setSavedId(null);
    try {
      const res = await base44.functions.invoke("researchBusiness", {
        businessWebsiteUrl: url,
        industry,
        businessName,
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Research failed");
    } finally {
      setResearching(false);
    }
  };

  const pushToOnboarding = async () => {
    if (!result) return;
    setSaving(true);
    try {
      const rec = await base44.entities.WebsiteProject.create({
        business_name: result.businessResearch?.businessName || businessName || "",
        business_website: result.sourceUrl || url,
        industry: result.industry || industry,
        status: "researching",
        business_research: result.businessResearch,
        benchmark: result.benchmark,
      });
      setSavedId(rec.id);
      await loadProjects();
    } catch (err) {
      setError(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e14] text-white">
      {/* Header */}
      <header className="border-b border-white/8 bg-[#0d1117]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00d4ff]/10">
              <Search className="h-5 w-5 text-[#00d4ff]" />
            </span>
            <div>
              <div className="text-sm font-bold">Research Hub</div>
              <div className="text-[10px] uppercase tracking-wider text-white/30">Skip-Trace & Benchmark</div>
            </div>
          </div>
          <Link to="/portal" className="text-xs text-white/50 hover:text-[#00d4ff] transition">← Portal</Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Skip-trace form */}
        <div className="rounded-2xl bg-[#0d1117] border border-white/8 p-6 mb-8">
          <h2 className="text-lg font-black mb-1">Skip-Trace a Business</h2>
          <p className="text-sm text-white/40 mb-5">Enter a business website URL to automatically pull and structure their data — services, contact info, value props, and industry benchmarks.</p>

          <form onSubmit={research} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wide">Business Website URL</span>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                    className="w-full rounded-xl bg-[#0a0e14] border border-white/10 pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#00d4ff]/50 transition"
                    placeholder="example.com"
                  />
                </div>
              </label>
              <label className="block">
                <span className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wide">Business Name (optional)</span>
                <input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full rounded-xl bg-[#0a0e14] border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#00d4ff]/50 transition"
                  placeholder="Acme Roofing Co."
                />
              </label>
            </div>
            <label className="block">
              <span className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wide">Industry</span>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full rounded-xl bg-[#0a0e14] border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00d4ff]/50 transition"
              >
                {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </label>
            <button
              type="submit"
              disabled={researching}
              className="inline-flex items-center gap-2 rounded-xl bg-[#00d4ff] px-6 py-3 text-sm font-bold text-[#0a0e14] hover:brightness-110 hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] transition disabled:opacity-60"
            >
              {researching ? <><Loader2 className="w-4 h-4 animate-spin" /> Skip-Tracing…</> : <><Search className="w-4 h-4" /> Research Business</>}
            </button>
          </form>

          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        </div>

        {/* Research result */}
        {result && (
          <div className="rounded-2xl bg-[#0d1117] border border-[#00d4ff]/20 p-6 mb-8">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-5 h-5 text-[#00d4ff]" />
                  <h3 className="text-lg font-black">Research Complete</h3>
                </div>
                <p className="text-sm text-white/40">Structured data extracted from {result.sourceUrl}</p>
              </div>
              {savedId ? (
                <Link to="/portal" className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/20 transition">
                  Open in Portal <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <button
                  onClick={pushToOnboarding}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#00d4ff] px-5 py-2.5 text-sm font-bold text-[#0a0e14] hover:brightness-110 transition disabled:opacity-60"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Push to Onboarding
                </button>
              )}
            </div>

            {/* Business research */}
            {result.businessResearch && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="w-4 h-4 text-[#00d4ff]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white/50">Business Research</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <InfoRow icon={Building2} label="Business Name" value={result.businessResearch.businessName} />
                  <InfoRow icon={Sparkles} label="Tagline" value={result.businessResearch.tagline} />
                  <InfoRow icon={Phone} label="Phone" value={result.businessResearch.phone} />
                  <InfoRow icon={Mail} label="Email" value={result.businessResearch.email} />
                  <InfoRow icon={MapPin} label="Service Area" value={result.businessResearch.serviceArea} />
                  <InfoRow icon={Clock} label="Hours" value={result.businessResearch.hours} />
                </div>
                {result.businessResearch.services?.length > 0 && (
                  <div className="mt-3">
                    <span className="text-xs font-semibold text-white/50">Services:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {result.businessResearch.services.map((s, i) => (
                        <span key={i} className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs text-white/70">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {result.businessResearch.differentiators?.length > 0 && (
                  <div className="mt-3">
                    <span className="text-xs font-semibold text-white/50">Differentiators:</span>
                    <ul className="mt-2 space-y-1">
                      {result.businessResearch.differentiators.map((d, i) => (
                        <li key={i} className="text-sm text-white/60 flex items-start gap-2">
                          <span className="text-[#00d4ff] mt-0.5">•</span> {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Benchmark */}
            {result.benchmark && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-[#00d4ff]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white/50">Industry Benchmark</span>
                </div>
                {result.benchmark.designGuidance && (
                  <div className="space-y-2 text-sm text-white/60">
                    {result.benchmark.designGuidance.colorPalette && <p><span className="text-white/40">Palette:</span> {result.benchmark.designGuidance.colorPalette}</p>}
                    {result.benchmark.designGuidance.typography && <p><span className="text-white/40">Typography:</span> {result.benchmark.designGuidance.typography}</p>}
                    {result.benchmark.designGuidance.heroPattern && <p><span className="text-white/40">Hero:</span> {result.benchmark.designGuidance.heroPattern}</p>}
                  </div>
                )}
                {result.benchmark.topSites?.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <span className="text-xs font-semibold text-white/50">Top Sites Analyzed:</span>
                    {result.benchmark.topSites.map((s, i) => (
                      <div key={i} className="text-xs text-white/50 flex items-start gap-2">
                        <span className="text-[#00d4ff]">{i + 1}.</span> <span>{s.name} — {s.designNotes}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Existing projects */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-white/40 mb-4">Researched Projects</h2>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-[#00d4ff]" /></div>
          ) : projects.length === 0 ? (
            <div className="rounded-xl border border-white/8 bg-[#0d1117] p-8 text-center">
              <Building2 className="w-10 h-10 mx-auto mb-3 text-white/20" />
              <p className="text-white/40 text-sm">No research data yet. Skip-trace a business above to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((p) => (
                <div key={p.id} className="rounded-xl border border-white/8 bg-[#0d1117] overflow-hidden">
                  <button onClick={() => setExpanded(expanded === p.id ? null : p.id)} className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#00d4ff]/10 shrink-0">
                        <Building2 className="h-4 w-4 text-[#00d4ff]" />
                      </span>
                      <div>
                        <div className="text-sm font-bold">{p.business_name || "Untitled"}</div>
                        <div className="text-xs text-white/40">{p.industry} · {p.business_website}</div>
                      </div>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-white/40 transition ${expanded === p.id ? "rotate-180" : ""}`} />
                  </button>
                  {expanded === p.id && (
                    <div className="border-t border-white/8 p-4 space-y-4">
                      {p.business_research && (
                        <div>
                          <div className="text-xs font-semibold uppercase text-white/40 mb-2">Business Research</div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                            {Object.entries(p.business_research).map(([k, v]) => v && typeof v !== "object" && (
                              <div key={k}><span className="text-white/40">{k}:</span> <span className="font-medium">{String(v)}</span></div>
                            ))}
                            {p.business_research.services && Array.isArray(p.business_research.services) && (
                              <div className="sm:col-span-2"><span className="text-white/40">Services:</span> <span className="font-medium">{p.business_research.services.join(", ")}</span></div>
                            )}
                          </div>
                        </div>
                      )}
                      {p.benchmark && (
                        <div>
                          <div className="text-xs font-semibold uppercase text-white/40 mb-2 flex items-center gap-1.5">
                            <TrendingUp className="h-3 w-3" /> Industry Benchmark
                          </div>
                          {p.benchmark.designGuidance && <p className="text-sm text-white/50">{p.benchmark.designGuidance.colorPalette}</p>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="w-4 h-4 text-white/30 shrink-0" />
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wide text-white/30">{label}</div>
        <div className="text-sm text-white/80 truncate">{value}</div>
      </div>
    </div>
  );
}