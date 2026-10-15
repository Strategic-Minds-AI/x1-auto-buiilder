import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/shared/PageHeader";
import { Image } from "@/components/ui/image";
import { Loader2, Sparkles, Save, Check } from "lucide-react";

export default function LogoWorkshop() {
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState("");
  const [prompt, setPrompt] = useState("");
  const [logoUrl, setLogoUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const page = await base44.entities.WebsiteProject.filter({}, { sort: "-created_date", limit: 50, fields: ["business_name", "industry", "logo_url", "content"] });
        setProjects(page.items || []);
      } catch {}
    })();
  }, []);

  const selectProject = (id) => {
    setSelected(id); setSaved(false);
    const p = projects.find((x) => x.id === id);
    if (p?.content?.logoPrompt) setPrompt(p.content.logoPrompt);
    setLogoUrl(p?.logo_url || null);
  };

  const generate = async () => {
    if (!prompt) return;
    setLoading(true); setError(""); setSaved(false);
    try {
      const res = await base44.functions.invoke("generateAssets", { logoPrompt: prompt, heroImagePrompt: prompt });
      setLogoUrl(res.data.logoUrl || null);
      if (res.data.logoError) setError(res.data.logoError);
    } catch (err) { setError(err.message || "Generation failed"); }
    finally { setLoading(false); }
  };

  const saveToProject = async () => {
    if (!selected || !logoUrl) return;
    setSaving(true);
    try { await base44.entities.WebsiteProject.update(selected, { logo_url: logoUrl }); setSaved(true); } catch {} finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageHeader title="Logo Workshop" subtitle="Generate, preview, and select professional logos for each project" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <label className="text-xs font-semibold uppercase text-muted-foreground mb-1.5 block">Select Project</label>
          <select className="dd-input" value={selected} onChange={(e) => selectProject(e.target.value)}>
            <option value="">Choose a project…</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.business_name || "Untitled"} — {p.industry}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase text-muted-foreground mb-1.5 block">Logo Prompt</label>
          <textarea className="dd-input" rows={3} placeholder="Describe the logo style, colors, and mood…" value={prompt} onChange={(e) => { setPrompt(e.target.value); setSaved(false); }} />
        </div>
        <button onClick={generate} disabled={loading || !prompt} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground disabled:opacity-50">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Generate Logo
        </button>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {logoUrl && (
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="text-xs font-semibold uppercase text-muted-foreground mb-3">Preview</div>
            <div className="flex items-center justify-center rounded-xl bg-background/60 p-8">
              <Image src={logoUrl} fittingType="fit" className="h-32 w-32" />
            </div>
            {selected && (
              <button onClick={saveToProject} disabled={saving} className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-accent-foreground disabled:opacity-50">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />} {saved ? "Saved" : "Save to Project"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}