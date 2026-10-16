import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import {
  WEBSITE_TYPES, INDUSTRY_TAXONOMY, ALL_INDUSTRIES, STYLES,
} from "@/data/mockupTaxonomy";
import PageHeader from "@/components/shared/PageHeader";
import {
  Loader2, Search, Layout, Filter, Image as ImageIcon, Upload,
  CheckCircle2, XCircle, X, Sparkles, Tag, ShieldCheck,
} from "lucide-react";

export default function MockupLibrary() {
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
    <div className="min-h-screen bg-background text-foreground">
      <PageHeader title="Mockup Library" subtitle="GPT-installable mockups powering the Digital Domination website factory" />

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
        {/* Stats + actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Total Mockups" value={counts.total} icon={Layout} />
          <Stat label="Verified" value={counts.verified} icon={ShieldCheck} color="text-emerald-400" />
          <Stat label="Active" value={counts.active} icon={CheckCircle2} color="text-primary" />
          <Stat label="Pending Review" value={counts.pending} icon={Sparkles} color="text-amber-400" />
        </div>

        {/* Taxonomy coverage banner */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold">Taxonomy Coverage</span>
          </div>
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{WEBSITE_TYPES.length}</span> website types ·{" "}
            <span className="font-semibold text-foreground">{ALL_INDUSTRIES.length}</span> industries ·{" "}
            <span className="font-semibold text-foreground">
              {Object.values(INDUSTRY_TAXONOMY).reduce((a, s) => a + s.length, 0)}
            </span> sub-industries
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              className="dd-input pl-11"
              placeholder="Search mockups, industries, tags…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowInstall(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-bold hover:opacity-90 transition"
          >
            <Upload className="w-4 h-4" /> Install Mockup
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <FilterSelect label="Type" value={typeFilter} onChange={setTypeFilter} options={["All", ...WEBSITE_TYPES.map((t) => t.key)]} labels={{ All: "All Types", ...Object.fromEntries(WEBSITE_TYPES.map((t) => [t.key, t.label])) }} />
          <FilterSelect label="Industry" value={industryFilter} onChange={(v) => { setIndustryFilter(v); setSubFilter("All"); }} options={["All", ...ALL_INDUSTRIES]} />
          <FilterSelect label="Sub-Industry" value={subFilter} onChange={setSubFilter} options={["All", ...subsForIndustry]} disabled={industryFilter === "All"} />
          <FilterSelect label="Style" value={styleFilter} onChange={setStyleFilter} options={["All", ...STYLES]} />
          <FilterSelect label="Status" value={statusFilter} onChange={setStatusFilter} options={["All", "pending", "active", "archived", "rejected"]} />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground/40" />
            <p className="text-muted-foreground text-sm">No mockups match your filters. Install one to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((m) => <MockupCard key={m.id} m={m} />)}
          </div>
        )}
      </div>

      {showInstall && <InstallModal onClose={() => setShowInstall(false)} onDone={() => { setShowInstall(false); load(); }} />}
    </div>
  );
}

function Stat({ label, value, icon: Icon, color }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
        <Icon className={`h-3.5 w-3.5 ${color || "text-primary"}`} /> {label}
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options, labels, disabled }) {
  return (
    <select
      disabled={disabled}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-xs rounded-lg border border-border bg-background px-3 py-2 disabled:opacity-40"
    >
      {options.map((o) => <option key={o} value={o}>{labels?.[o] || (o === "All" ? `All ${label}s` : o)}</option>)}
    </select>
  );
}

function MockupCard({ m }) {
  const typeLabel = WEBSITE_TYPES.find((t) => t.key === m.website_type)?.label || m.website_type;
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col">
      <div className="relative aspect-video bg-muted/30 flex items-center justify-center">
        {m.image_url ? (
          <img src={m.image_url} alt={m.title} className="w-full h-full object-cover" />
        ) : (
          <ImageIcon className="w-10 h-10 text-muted-foreground/30" />
        )}
        {m.verified && (
          <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-emerald-500/90 text-white px-2 py-0.5 text-[10px] font-bold">
            <ShieldCheck className="w-3 h-3" /> Verified
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-sm truncate">{m.title}</h3>
        <p className="text-[11px] text-muted-foreground mt-0.5">{typeLabel}</p>
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          <span className="rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary">{m.industry}</span>
          {m.sub_industry && <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{m.sub_industry}</span>}
        </div>
        {(m.tags || []).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {(m.tags || []).slice(0, 4).map((t) => <span key={t} className="text-[10px] text-muted-foreground/70">#{t}</span>)}
          </div>
        )}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${m.status === "active" ? "bg-primary/15 text-primary" : m.status === "pending" ? "bg-amber-500/15 text-amber-400" : "bg-muted text-muted-foreground"}`}>{m.status}</span>
          {m.quality_score != null && <span className="text-[10px] font-mono text-muted-foreground">QA {m.quality_score}</span>}
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

  const field = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="rounded-2xl border border-border bg-card w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg flex items-center gap-2"><Upload className="w-5 h-5 text-primary" /> Install Mockup</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Title *</label>
            <input className="dd-input mt-1" value={form.title} onChange={field("title")} placeholder="e.g. Modern HVAC Service Landing" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Website Type *</label>
              <select className="dd-input mt-1" value={form.website_type} onChange={field("website_type")}>
                {WEBSITE_TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Industry *</label>
              <select className="dd-input mt-1" value={form.industry} onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value, sub_industry: "" }))}>
                {ALL_INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Sub-Industry</label>
              <select className="dd-input mt-1" value={form.sub_industry} onChange={field("sub_industry")}>
                <option value="">— Any —</option>
                {subs.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Style</label>
              <select className="dd-input mt-1" value={form.style} onChange={field("style")}>
                {STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Image URL (preview)</label>
            <input className="dd-input mt-1" value={form.image_url} onChange={field("image_url")} placeholder="https://…" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Desktop Image URL</label>
              <input className="dd-input mt-1" value={form.desktop_image_url} onChange={field("desktop_image_url")} placeholder="https://…" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Mobile Image URL</label>
              <input className="dd-input mt-1" value={form.mobile_image_url} onChange={field("mobile_image_url")} placeholder="https://…" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Source URL (if cloned)</label>
            <input className="dd-input mt-1" value={form.source_url} onChange={field("source_url")} placeholder="https://…" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Tags (comma-separated)</label>
            <input className="dd-input mt-1" value={form.tags} onChange={field("tags")} placeholder="modern, blue, hero-split" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.for_digital_domination} onChange={(e) => setForm((f) => ({ ...f, for_digital_domination: e.target.checked }))} />
            Approved for Digital Domination mass-launch
          </label>

          {err && <p className="text-sm text-destructive">{err}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:bg-muted transition">Cancel</button>
            <button onClick={submit} disabled={busy || !form.title} className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-bold disabled:opacity-50">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Install
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}