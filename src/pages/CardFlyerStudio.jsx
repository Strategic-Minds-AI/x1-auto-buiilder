import { useState, useMemo, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import CardFlyerRender from "@/components/shared/CardFlyerRender";
import BackButton from "@/components/shared/BackButton";
import {
  CARD_STYLES, FLYER_STYLES, SAMPLE_CARD, SAMPLE_FLYER, DEFAULT_BRAND,
} from "@/lib/cardFlyer/cardFlyerStyles";
import {
  CreditCard, FileText, Search, X, Save, Loader2, Sparkles, Wand2,
  Check, Palette, Type, Layout, Filter,
} from "lucide-react";

export default function CardFlyerStudio() {
  const [tab, setTab] = useState("business_card");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [content, setContent] = useState(SAMPLE_CARD);
  const [brand, setBrand] = useState(DEFAULT_BRAND);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [library, setLibrary] = useState([]);

  const styles = tab === "business_card" ? CARD_STYLES : FLYER_STYLES;

  const filtered = useMemo(() => {
    if (!query) return styles;
    const q = query.toLowerCase();
    return styles.filter((s) =>
      s.name.toLowerCase().includes(q) ||
      s.layoutName.toLowerCase().includes(q) ||
      s.colorName.toLowerCase().includes(q) ||
      s.desc.toLowerCase().includes(q)
    );
  }, [styles, query]);

  const openStyle = (style) => {
    setSelected(style);
    setSaved(false);
    setContent(style.type === "business_card" ? { ...SAMPLE_CARD } : { ...SAMPLE_FLYER });
    setBrand({ ...DEFAULT_BRAND });
  };

  const closeStyle = () => {
    setSelected(null);
    setSaved(false);
  };

  const updateField = (field, value) => {
    setContent((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    setSaved(false);
    try {
      const record = await base44.entities.DigitalCardFlyer.create({
        name: selected.type === "business_card"
          ? `${content.name || "Untitled"} — ${selected.name}`
          : `${content.headline || "Untitled"} — ${selected.name}`,
        type: selected.type,
        style_id: selected.id,
        style_name: selected.name,
        layout: selected.layout,
        color_treatment: selected.colorTreatment,
        typography: selected.typography,
        accent: brand.accent,
        ink: brand.ink,
        tone: brand.tone,
        content,
        status: "generated",
      });
      setLibrary((prev) => [record, ...prev]);
      setSaved(true);
    } catch (err) {
      alert("Save failed: " + (err.message || "unknown error"));
    } finally {
      setSaving(false);
    }
  };

  const handleAiGenerate = async () => {
    setAiLoading(true);
    try {
      const res = await base44.functions.invoke("generateCardFlyerContent", {
        type: selected.type,
        businessName: content.company || content.name || "",
        industry: content.industry || "",
      });
      if (res.data?.content) {
        setContent((prev) => ({ ...prev, ...res.data.content }));
      }
    } catch (err) {
      alert("AI generation failed: " + (err.message || "unknown error"));
    } finally {
      setAiLoading(false);
    }
  };

  const previewW = selected?.type === "business_card" ? 350 : 300;

  return (
    <div className="min-h-full bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <BackButton />

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Card & Flyer Studio</h1>
          <p className="text-sm text-slate-500 mt-1">
            Generate professional digital business cards and flyers — {CARD_STYLES.length} card styles + {FLYER_STYLES.length} flyer styles
          </p>
        </div>

        {/* Tab switcher + search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="inline-flex rounded-xl border border-slate-200 p-1 bg-slate-50">
            <button
              onClick={() => setTab("business_card")}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                tab === "business_card" ? "bg-[#00d4ff] text-[#0a0e14]" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <CreditCard className="w-4 h-4" /> Business Cards
              <span className={`text-xs font-mono ${tab === "business_card" ? "text-[#0a0e14]/60" : "text-slate-400"}`}>{CARD_STYLES.length}</span>
            </button>
            <button
              onClick={() => setTab("flyer")}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                tab === "flyer" ? "bg-[#00d4ff] text-[#0a0e14]" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText className="w-4 h-4" /> Flyers
              <span className={`text-xs font-mono ${tab === "flyer" ? "text-[#0a0e14]/60" : "text-slate-400"}`}>{FLYER_STYLES.length}</span>
            </button>
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-11 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00d4ff]/50 focus:ring-1 focus:ring-[#00d4ff]/30 transition"
              placeholder="Search styles, layouts, colors..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Style grid */}
        <div className={tab === "business_card"
          ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
          : "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        }>
          {filtered.map((style) => (
            <StyleCard key={style.id} style={style} onClick={() => openStyle(style)} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <Filter className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="text-slate-400 text-sm">No styles match "{query}"</p>
          </div>
        )}

        {/* Saved library preview */}
        {library.length > 0 && (
          <div className="mt-10 pt-8 border-t border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Your Saved Designs ({library.length})</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {library.slice(0, 12).map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-200 p-2 bg-slate-50">
                  <CardFlyerRender
                    style={item}
                    content={item.content}
                    brand={{ accent: item.accent, ink: item.ink, tone: item.tone }}
                    displayW={tab === "business_card" ? 140 : 100}
                  />
                  <p className="text-[10px] text-slate-500 mt-1.5 truncate">{item.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Generator Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-y-auto p-4" onClick={closeStyle}>
          <div
            className="relative bg-white rounded-2xl shadow-2xl max-w-5xl w-full my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white rounded-t-2xl">
              <div>
                <h3 className="font-bold text-slate-900">{selected.name}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <Badge icon={Layout} label={selected.layoutName} />
                  <Badge icon={Palette} label={selected.colorName} />
                  <Badge icon={Type} label={selected.typographyName} />
                </div>
              </div>
              <button onClick={closeStyle} className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="flex flex-col lg:flex-row gap-6 p-6">
              {/* Live preview */}
              <div className="flex-1 flex items-start justify-center bg-slate-50 rounded-xl p-6 min-h-[300px]">
                <CardFlyerRender
                  style={selected}
                  content={content}
                  brand={brand}
                  displayW={previewW}
                />
              </div>

              {/* Form */}
              <div className="w-full lg:w-80 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">Content</h4>
                  <button
                    onClick={handleAiGenerate}
                    disabled={aiLoading}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#00d4ff]/10 px-3 py-1.5 text-xs font-semibold text-[#00d4ff] hover:bg-[#00d4ff]/20 transition disabled:opacity-50"
                  >
                    {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                    AI Generate
                  </button>
                </div>

                {selected.type === "business_card" ? (
                  <>
                    <FormField label="Name" value={content.name || ""} onChange={(v) => updateField("name", v)} />
                    <FormField label="Title" value={content.title || ""} onChange={(v) => updateField("title", v)} />
                    <FormField label="Company" value={content.company || ""} onChange={(v) => updateField("company", v)} />
                    <FormField label="Phone" value={content.phone || ""} onChange={(v) => updateField("phone", v)} />
                    <FormField label="Email" value={content.email || ""} onChange={(v) => updateField("email", v)} />
                    <FormField label="Website" value={content.website || ""} onChange={(v) => updateField("website", v)} />
                    <FormField label="Address" value={content.address || ""} onChange={(v) => updateField("address", v)} />
                  </>
                ) : (
                  <>
                    <FormField label="Company" value={content.company || ""} onChange={(v) => updateField("company", v)} />
                    <FormField label="Headline" value={content.headline || ""} onChange={(v) => updateField("headline", v)} />
                    <FormField label="Subheadline" value={content.subheadline || ""} onChange={(v) => updateField("subheadline", v)} />
                    <FormArea label="Body" value={content.body || ""} onChange={(v) => updateField("body", v)} />
                    <FormArea label="Services (one per line)" value={(content.services || []).join("\n")} onChange={(v) => updateField("services", v.split("\n").filter(Boolean))} />
                    <FormField label="Offer" value={content.offer || ""} onChange={(v) => updateField("offer", v)} />
                    <FormField label="Call to Action" value={content.cta || ""} onChange={(v) => updateField("cta", v)} />
                    <FormField label="Phone" value={content.phone || ""} onChange={(v) => updateField("phone", v)} />
                    <FormField label="Email" value={content.email || ""} onChange={(v) => updateField("email", v)} />
                    <FormField label="Website" value={content.website || ""} onChange={(v) => updateField("website", v)} />
                    <FormField label="Address" value={content.address || ""} onChange={(v) => updateField("address", v)} />
                  </>
                )}

                {/* Brand colors */}
                <div className="pt-2 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-900 mb-2">Brand Colors</h4>
                  <div className="flex items-center gap-4">
                    <ColorField label="Accent" value={brand.accent} onChange={(v) => setBrand((p) => ({ ...p, accent: v }))} />
                    <ColorField label="Ink" value={brand.ink} onChange={(v) => setBrand((p) => ({ ...p, ink: v }))} />
                  </div>
                </div>

                {/* Save */}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#00d4ff] px-4 py-3 text-sm font-bold text-[#0a0e14] hover:brightness-110 hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] transition disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {saving ? "Saving..." : saved ? "Saved!" : "Save to Library"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StyleCard({ style, onClick }) {
  const isCard = style.type === "business_card";
  const sample = isCard ? SAMPLE_CARD : SAMPLE_FLYER;
  const previewW = isCard ? 155 : 120;

  return (
    <div
      className="rounded-xl border border-slate-200 bg-white overflow-hidden cursor-pointer transition-all duration-150 hover:border-[#00d4ff]/40 hover:shadow-[0_0_20px_rgba(0,212,255,0.08)]"
      onClick={onClick}
    >
      <div className="flex items-center justify-center bg-slate-50 p-3" style={{ minHeight: isCard ? "110px" : "180px" }}>
        <CardFlyerRender style={style} content={sample} brand={DEFAULT_BRAND} displayW={previewW} />
      </div>
      <div className="p-2.5 border-t border-slate-100">
        <div className="text-[11px] font-bold text-slate-800 truncate">{style.name}</div>
        <div className="text-[9px] text-slate-400 truncate">{style.desc}</div>
        <div className="flex items-center gap-1 mt-1.5">
          <span className="text-[8px] font-semibold bg-slate-100 rounded px-1 py-0.5 text-slate-500">{style.typographyName}</span>
        </div>
      </div>
    </div>
  );
}

function Badge({ icon: Icon, label }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
      <Icon className="w-3 h-3" /> {label}
    </span>
  );
}

function FormField({ label, value, onChange }) {
  return (
    <div>
      <label className="text-[11px] font-semibold text-slate-500 mb-1 block">{label}</label>
      <input
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-[#00d4ff]/50 focus:ring-1 focus:ring-[#00d4ff]/30 transition"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={label}
      />
    </div>
  );
}

function FormArea({ label, value, onChange }) {
  return (
    <div>
      <label className="text-[11px] font-semibold text-slate-500 mb-1 block">{label}</label>
      <textarea
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-[#00d4ff]/50 focus:ring-1 focus:ring-[#00d4ff]/30 transition resize-none"
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={label}
      />
    </div>
  );
}

function ColorField({ label, value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer"
      />
      <div>
        <div className="text-[10px] font-semibold text-slate-500">{label}</div>
        <div className="text-[10px] font-mono text-slate-400">{value}</div>
      </div>
    </div>
  );
}