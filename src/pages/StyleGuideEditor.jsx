import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/shared/PageHeader";
import { Loader2, Plus, Save, Trash2, Check } from "lucide-react";

const FONTS = ["Inter", "Roboto", "Open Sans", "Montserrat", "Poppins", "Lato", "Playfair Display", "Merriweather", "Source Sans Pro", "Nunito"];
const BLANK = { name: "", accent_color: "#00d4ff", primary_color: "#0b1523", secondary_color: "#1e293b", background_color: "#0b1523", text_color: "#ffffff", heading_font: "Inter", body_font: "Inter", spacing_scale: "1.25", border_radius: "12px" };

export default function StyleGuideEditor() {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState(BLANK);

  const load = async () => {
    setLoading(true);
    try { const page = await base44.entities.StyleGuide.filter({}, { sort: "-created_date", limit: 50 }); setGuides(page.items || []); } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const startNew = () => { setForm(BLANK); setEditing("new"); setSaved(false); };
  const startEdit = (g) => { setForm(g); setEditing(g.id); setSaved(false); };

  const save = async () => {
    if (!form.name) return;
    setSaving(true); setSaved(false);
    try {
      if (editing === "new") { const rec = await base44.entities.StyleGuide.create(form); setEditing(rec.id); }
      else { await base44.entities.StyleGuide.update(editing, form); }
      setSaved(true); load();
    } catch {} finally { setSaving(false); }
  };

  const remove = async (id) => { await base44.entities.StyleGuide.delete(id); load(); if (editing === id) setEditing(null); };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageHeader title="Style Guide Editor" subtitle="Define universal brand styles for generated sites" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-2">
          <button onClick={startNew} className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground mb-2"><Plus className="h-4 w-4" /> New Style Guide</button>
          {loading ? <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div> : (
            guides.map((g) => (
              <div key={g.id} className={`rounded-xl border p-3 cursor-pointer transition ${editing === g.id ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-secondary"}`} onClick={() => startEdit(g)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md border border-border" style={{ background: g.accent_color }} />
                    <span className="text-sm font-semibold">{g.name}</span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); remove(g.id); }} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            ))
          )}
        </div>

        {editing && (
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 space-y-4">
            <input className="dd-input" placeholder="Style guide name…" value={form.name} onChange={(e) => { setForm({ ...form, name: e.target.value }); setSaved(false); }} />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <ColorField label="Accent" value={form.accent_color} onChange={(v) => setForm({ ...form, accent_color: v })} />
              <ColorField label="Primary" value={form.primary_color} onChange={(v) => setForm({ ...form, primary_color: v })} />
              <ColorField label="Secondary" value={form.secondary_color} onChange={(v) => setForm({ ...form, secondary_color: v })} />
              <ColorField label="Background" value={form.background_color} onChange={(v) => setForm({ ...form, background_color: v })} />
              <ColorField label="Text" value={form.text_color} onChange={(v) => setForm({ ...form, text_color: v })} />
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Radius</label>
                <input className="dd-input" value={form.border_radius} onChange={(e) => setForm({ ...form, border_radius: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Heading Font</label>
                <select className="dd-input" value={form.heading_font} onChange={(e) => setForm({ ...form, heading_font: e.target.value })}>{FONTS.map((f) => <option key={f}>{f}</option>)}</select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Body Font</label>
                <select className="dd-input" value={form.body_font} onChange={(e) => setForm({ ...form, body_font: e.target.value })}>{FONTS.map((f) => <option key={f}>{f}</option>)}</select>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Spacing Scale</label>
              <input className="dd-input max-w-xs" value={form.spacing_scale} onChange={(e) => setForm({ ...form, spacing_scale: e.target.value })} />
            </div>
            <div className="rounded-xl p-6" style={{ background: form.background_color, color: form.text_color, borderRadius: form.border_radius }}>
              <h3 style={{ fontFamily: form.heading_font, color: form.accent_color }} className="text-xl font-bold mb-2">Preview Heading</h3>
              <p style={{ fontFamily: form.body_font }} className="text-sm opacity-80">Body text in {form.body_font}. This is how your generated site will look.</p>
              <button className="mt-3 px-4 py-2 text-sm font-bold" style={{ background: form.accent_color, color: form.background_color, borderRadius: form.border_radius }}>Button</button>
            </div>
            <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground disabled:opacity-50">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />} {saved ? "Saved" : "Save Style Guide"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ColorField({ label, value, onChange }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-9 w-12 rounded border border-border bg-transparent cursor-pointer" />
        <input className="dd-input flex-1" value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
}