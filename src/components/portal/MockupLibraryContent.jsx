import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import {
  WEBSITE_TYPES, INDUSTRY_TAXONOMY, ALL_INDUSTRIES, STYLES,
} from "@/data/mockupTaxonomy";
import {
  Loader2, Search, Filter, Image as ImageIcon, Upload,
  CheckCircle2, X, Sparkles, Tag, ShieldCheck, Layout,
} from "lucide-react";

// Portal-styled mockup library content — renders inside the white portal
// content area. Same branding as the rest of the portal (white bg, slate
// accents). Used by the Portal "mockups" tab and the standalone route.
export default function MockupLibraryContent() {
  const [mockups, setMockups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [industryFilter, setIndustryFilter] = useState("All");
  const [subFilter, setSubFilter] = useState("All");
  const [styleFilter, setStyleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showInstall, setShowInstall] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { items } = await base44.entities.MockupLibrary.filter(
        {},
        { sort: "-created_date", limit: 200 }
      );
      setMockups(items || []);
    } catch { setMockups([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const subsForIndustry = useMemo(
    () => industryFilter === "All" ? [] : (INDUSTRY_TAXONOMY[industryFilter] || []),
    [industryFilter]
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return mockups.filter((m) => {
      if (typeFilter !== "All" && m.website_type !== typeFilter) return false;
      if (industryFilter !== "All" && m.industry !== industryFilter) return false;
      if (subFilter !== "All" && m.sub_industry !== subFilter) return false;
      if (styleFilter !== "All" && m.style !== styleFilter) return false;
      if (statusFilter !== "All" && m.status !== statusFilter) return false;
      if (q && !(`${m.title} ${m.industry} ${m.sub_industry || ''} ${(m.tags || []).join(' ')}`.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [mockups, query, typeFilter, industryFilter, subFilter, styleFilter, statusFilter]);

  const counts = useMemo(() => {
    const c = { total: mockups.length, verified: 0, active: 0, pending: 0 };
    mockups.forEach((m) => {
      if (m.verified) c.verified++;
      if (m.status === "active") c.active++;
      if (m.status === "pending") c.pending++;
    });
    return c;
  }, [mockups]);

  return (
    <div className="p-6 lg:p-8 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Mockup Library</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            GPT-installable mockups powering the Digital Domination website factory
          </p>
        </div>
        <button
          onClick={() => setShowInstall(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#0066ff] px-4 py-2.5 text-[13px] font-bold text-[#0a0e14] hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] transition"
        >
          <Upload className="w-4 h-4" /> Install Mockup
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Total Mockups" value={counts.total} icon={Layout} />
        <Stat label="Verified" value={counts.verified} icon={ShieldCheck} color="text-emerald-500" />
        <Stat label="Active" value={counts.active} icon={CheckCircle2} color="text-[#00d4ff]" />
        <Stat label="Pending Review" value={counts.pending} icon={Sparkles} color="text-amber-500" />
      </div>

      {/* Taxonomy coverage */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center gap-2 mb-1.5">
          <Tag className="w-4 h-4 text-[#00d4ff]" />
          <span className="text-sm font-bold text-slate-900">Taxonomy Coverage</span>
        </div>
        <p className="text-xs text-slate-500">
          <span className="font-bold text-slate-900">{WEBSITE_TYPES.length}</span> website types ·{" "}
          <span className="font-bold text-slate-900">{ALL_INDUSTRIES.length}</span> industries ·{" "}
          <span className="font-bold text-slate-900">
            {Object.values(INDUSTRY_TAXONOMY).reduce((a, s) => a + s.length, 0)}
          </span> sub-industries
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-11 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00d4ff]/50 focus:ring-1 focus:ring-[#00d4ff]/30 transition"
          placeholder="Search mockups, industries, tags…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <Filter className="w-3.5 h-3.5 text-slate-400" />
        <FilterSelect label="Type" value={typeFilter} onChange={setTypeFilter} options={["All", ...WEBSITE_TYPES.map((t) => t.key)]} labels={{ All: "All Types", ...Object.fromEntries(WEBSITE_TYPES.map((t) => [t.key, t.label])) }} />
        <FilterSelect label="Industry" value={industryFilter} onChange={(v) => { setIndustryFilter(v); setSubFilter("All"); }} options={["All", ...ALL_INDUSTRIES]} />
        <FilterSelect label="Sub" value={subFilter} onChange={setSubFilter} options={["All", ...subsForIndustry]} disabled={industryFilter === "All"} />
        <FilterSelect label="Style" value={styleFilter} onChange={setStyleFilter} options={["All", ...STYLES]} />
        <FilterSelect label="Status" value={statusFilter} onChange={setStatusFilter} options={["All", "pending", "active", "archived", "rejected"]} />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-[#00d4ff]" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24">
          <ImageIcon className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <p className="text-slate-500 text-sm">No mockups match your filters. Install one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m) => <MockupCard key={m.id} m={m} />)}
        </div>
      )}

      {showInstall && <InstallModal onClose={() => setShowInstall(false)} onDone={() => { setShowInstall(false); load(); }} />}
    </div>
  );
}

function Stat({ label, value, icon: Icon, color }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
        <Icon className={`h-3.5 w-3.5 ${color || "text-[#00d4ff]"}`} /> {label}
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options, labels, disabled }) {
  return (
    <select
      disabled={disabled}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-xs rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700 disabled:opacity-40 focus:outline-none focus:border-[#00d4ff]/50"
    >
      {options.map((o) => <option key={o} value={o}>{labels?.[o] || (o === "All" ? `All ${label}` : o)}</option>)}
    </select>
  );
}

function MockupCard({ m }) {
  const typeLabel = WEBSITE_TYPES.find((t) => t.key === m.website_type)?.label || m.website_type;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden flex flex-col hover:shadow-md transition">
      <div className="relative aspect-video bg-slate-100 flex items-center justify-center">
        {m.image_url ? (
          <img src={m.image_url} alt={m.title} className="w-full h-full object-cover" />
        ) : (
          <ImageIcon className="w-10 h-10 text-slate-300" />
        )}
        {m.verified && (
          <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-emerald-500 text-white px-2 py-0.5 text-[10px] font-bold">
            <ShieldCheck className="w-3 h-3" /> Verified
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-sm text-slate-900 truncate">{m.title}</h3>
        <p className="text-[11px] text-slate-500 mt-0.5">{typeLabel}</p>
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          <span className="rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/20 px-2 py-0.5 text-[10px] font-semibold text-[#0066ff]">{m.industry}</span>
          {m.sub_industry && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">{m.sub_industry}</span>}
        </div>
        {(m.tags || []).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {(m.tags || []).slice(0, 4).map((t) => <span key={t} className="text-[10px] text-slate-400">#{t}</span>)}
          </div>
        )}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${m.status === "active" ? "bg-[#00d4ff]/15 text-[#0066ff]" : m.status === "pending" ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-400"}`}>{m.status}</span>
          {m.quality_score != null && <span className="text-[10px] font-mono text-slate-400">QA {m.quality_score}</span>}
        </div>
      </div>
    </div>
  );
}

function InstallModal({ onClose, onDone }) {
  const [form, setForm] = useState({
    title: "", website_type: "business", industry: ALL_INDUSTRIES[0],
    sub_industry: "", image_url: "", desktop_image_url: "", mobile_image_url: "",
    source_url: "", style: "modern", tags: "", for_digital_domination: true,
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const subs = INDUSTRY_TAXONOMY[form.industry] || [];
  const field = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setBusy(true); setErr("");
    try {
      const payload = {
        ...form,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        installed_by: "admin",
      };
      const res = await base44.functions.invoke("installMockup", payload);
      if (res?.error) throw new Error(res.error);
      onDone();
    } catch (e) {
      setErr(String((e && e.message) || e));
    } finally { setBusy(false); }
  };

  const inputCls = "w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#00d4ff]/50 transition";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="rounded-2xl border border-slate-200 bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2"><Upload className="w-5 h-5 text-[#00d4ff]" /> Install Mockup</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-500">Title *</label>
            <input className={inputCls + " mt-1"} value={form.title} onChange={field("title")} placeholder="e.g. Modern HVAC Service Landing" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500">Website Type *</label>
              <select className={inputCls + " mt-1"} value={form.website_type} onChange={field("website_type")}>
                {WEBSITE_TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Industry *</label>
              <select className={inputCls + " mt-1"} value={form.industry} onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value, sub_industry: "" }))}>
                {ALL_INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500">Sub-Industry</label>
              <select className={inputCls + " mt-1"} value={form.sub_industry} onChange={field("sub_industry")}>
                <option value="">— Any —</option>
                {subs.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Style</label>
              <select className={inputCls + " mt-1"} value={form.style} onChange={field("style")}>
                {STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">Image URL (preview)</label>
            <input className={inputCls + " mt-1"} value={form.image_url} onChange={field("image_url")} placeholder="https://…" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500">Desktop Image URL</label>
              <input className={inputCls + " mt-1"} value={form.desktop_image_url} onChange={field("desktop_image_url")} placeholder="https://…" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Mobile Image URL</label>
              <input className={inputCls + " mt-1"} value={form.mobile_image_url} onChange={field("mobile_image_url")} placeholder="https://…" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">Source URL (if cloned)</label>
            <input className={inputCls + " mt-1"} value={form.source_url} onChange={field("source_url")} placeholder="https://…" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">Tags (comma-separated)</label>
            <input className={inputCls + " mt-1"} value={form.tags} onChange={field("tags")} placeholder="modern, blue, hero-split" />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={form.for_digital_domination} onChange={(e) => setForm((f) => ({ ...f, for_digital_domination: e.target.checked }))} />
            Approved for Digital Domination mass-launch
          </label>

          {err && <p className="text-sm text-red-500">{err}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">Cancel</button>
            <button onClick={submit} disabled={busy || !form.title} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#0066ff] px-4 py-2 text-sm font-bold text-[#0a0e14] disabled:opacity-50">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Install
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}