import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import {
  Search, Globe, Loader2, CheckCircle2, Building2, Phone, Mail,
  MapPin, Clock, Sparkles, TrendingUp, Zap, ArrowRight, ChevronDown,
} from "lucide-react";

const INDUSTRIES = [
  "Roofing", "HVAC", "Plumbing", "Electrical", "Landscaping", "Pest Control",
  "Dental", "Legal", "Real Estate", "Insurance", "Auto Repair", "Cleaning",
  "Construction", "Painting", "Solar", "Other",
];

export default function ResearchHub() {
  const [url, setUrl] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState(INDUSTRIES[0]);
  const [researching, setResearching] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => { loadProjects(); }, []);

  const loadProjects = async () => {
    try {
      const { items } = await base44.entities.WebsiteProject.filter(
        { business_research: { $exists: true } },
        { sort: "-created_date", limit: 50 }
      );
      setProjects(items || []);
    } catch { setProjects([]); }
    finally { setLoading(false); }
  };

  const research = async (e) => {
    e.preventDefault();
    setResearching(true);
    setError(null);
    setResult(null);
    try {
      const res = await base44.functions.invoke("researchBusiness", {
        websiteUrl: url, businessName, industry,
      });
      setResult(res.data);
      await loadProjects();
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Research failed");
    } finally {
      setResearching(false);
    }
  };

  const continueToOnboarding = () => {
    // Navigate to portal with prefill data
    window.location.href = "/portal";
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Skip-trace form */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 mb-8">
        <div className="flex items-center gap-3 mb-1">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00d4ff]/10">
            <Search className="h-5 w-5 text-[#00d4ff]" />
          </span>
          <h2 className="text-lg font-black text-slate-900">Skip-Trace a Business</h2>
        </div>
        <p className="text-sm text-slate-500 mb-5">Enter a business website URL to automatically pull and structure their data — services, contact info, value props, and industry benchmarks.</p>

        <form onSubmit={research} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Business Website URL</span>
              <div className="relative">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-11 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00d4ff]/50 focus:ring-1 focus:ring-[#00d4ff]/30 transition"
                  placeholder="example.com"
                />
              </div>
            </label>
            <label className="block">
              <span className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Business Name (optional)</span>
              <input
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00d4ff]/50 focus:ring-1 focus:ring-[#00d4ff]/30 transition"
                placeholder="Acme Roofing Co."
              />
            </label>
          </div>
          <label className="block">
            <span className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Industry</span>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#00d4ff]/50 transition"
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

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
      </div>

      {/* Research result */}
      {result && (
        <div className="rounded-2xl bg-white border border-[#00d4ff]/30 p-6 mb-8">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-5 h-5 text-[#00d4ff]" />
                <h3 className="text-lg font-black text-slate-900">Research Complete</h3>
              </div>
              <p className="text-sm text-slate-500">Structured data extracted from {result.sourceUrl}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5" /> Auto-saved
              </span>
              <button
                onClick={continueToOnboarding}
                className="inline-flex items-center gap-2 rounded-xl bg-[#00d4ff] px-5 py-2.5 text-sm font-bold text-[#0a0e14] hover:brightness-110 hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] transition"
              >
                <Zap className="w-4 h-4" /> Continue to Onboarding <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Business research */}
          {result.businessResearch && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-4 h-4 text-[#00d4ff]" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Business Research</span>
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
                  <span className="text-xs font-semibold text-slate-500">Services:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {result.businessResearch.services.map((s, i) => (
                      <span key={i} className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs text-slate-700">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {result.businessResearch.differentiators?.length > 0 && (
                <div className="mt-3">
                  <span className="text-xs font-semibold text-slate-500">Differentiators:</span>
                  <ul className="mt-2 space-y-1">
                    {result.businessResearch.differentiators.map((d, i) => (
                      <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
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
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Industry Benchmark</span>
              </div>
              {result.benchmark.designGuidance && (
                <div className="space-y-2 text-sm text-slate-600">
                  {result.benchmark.designGuidance.colorPalette && <p><span className="text-slate-400">Palette:</span> {result.benchmark.designGuidance.colorPalette}</p>}
                  {result.benchmark.designGuidance.typography && <p><span className="text-slate-400">Typography:</span> {result.benchmark.designGuidance.typography}</p>}
                  {result.benchmark.designGuidance.heroPattern && <p><span className="text-slate-400">Hero:</span> {result.benchmark.designGuidance.heroPattern}</p>}
                </div>
              )}
              {result.benchmark.topSites?.length > 0 && (
                <div className="mt-3 space-y-1">
                  <span className="text-xs font-semibold text-slate-500">Top Sites Analyzed:</span>
                  {result.benchmark.topSites.map((s, i) => (
                    <div key={i} className="text-xs text-slate-500 flex items-start gap-2">
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
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Researched Projects</h2>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-[#00d4ff]" /></div>
        ) : projects.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
            <Building2 className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500 text-sm">No research data yet. Skip-trace a business above to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((p) => (
              <div key={p.id} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <button onClick={() => setExpanded(expanded === p.id ? null : p.id)} className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#00d4ff]/10 shrink-0">
                      <Building2 className="h-4 w-4 text-[#00d4ff]" />
                    </span>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{p.business_name || "Untitled"}</div>
                      <div className="text-xs text-slate-500">{p.industry} · {p.business_website}</div>
                    </div>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition ${expanded === p.id ? "rotate-180" : ""}`} />
                </button>
                {expanded === p.id && (
                  <div className="border-t border-slate-100 p-4 space-y-4">
                    {p.business_research && (
                      <div>
                        <div className="text-xs font-semibold uppercase text-slate-400 mb-2">Business Research</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          {Object.entries(p.business_research).map(([k, v]) => v && typeof v !== "object" && (
                            <div key={k}><span className="text-slate-400">{k}:</span> <span className="font-medium text-slate-700">{String(v)}</span></div>
                          ))}
                          {p.business_research.services && Array.isArray(p.business_research.services) && (
                            <div className="sm:col-span-2"><span className="text-slate-400">Services:</span> <span className="font-medium text-slate-700">{p.business_research.services.join(", ")}</span></div>
                          )}
                        </div>
                      </div>
                    )}
                    {p.benchmark && (
                      <div>
                        <div className="text-xs font-semibold uppercase text-slate-400 mb-2 flex items-center gap-1.5">
                          <TrendingUp className="h-3 w-3" /> Industry Benchmark
                        </div>
                        {p.benchmark.designGuidance && <p className="text-sm text-slate-500">{p.benchmark.designGuidance.colorPalette}</p>}
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
  );
}

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="w-4 h-4 text-slate-300 shrink-0" />
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wide text-slate-400">{label}</div>
        <div className="text-sm text-slate-800 truncate">{value}</div>
      </div>
    </div>
  );
}