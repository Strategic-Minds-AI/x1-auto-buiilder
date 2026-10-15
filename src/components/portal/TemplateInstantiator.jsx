import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { ArrowLeft, Loader2, Sparkles, Save, Rocket, ExternalLink, CheckCircle2 } from "lucide-react";

const LABELS = {
  business_name: "Business Name",
  businessname: "Business Name",
  phone: "Phone",
  email: "Email",
  address: "Address",
  location: "Location / Service Area",
  service_area: "Service Area",
  tagline: "Tagline",
  years_in_business: "Years in Business"
};

const labelFor = (key) => {
  const clean = key.replace(/[{}]/g, "");
  if (LABELS[clean]) return LABELS[clean];
  return clean.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

export default function TemplateInstantiator({ template, onBack }) {
  const vars = template.variables || [];
  const [values, setValues] = useState(() => {
    const v = {};
    vars.forEach((varDef) => { v[varDef.key] = ""; });
    return v;
  });
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState(null);
  const [deploying, setDeploying] = useState(false);
  const [deployUrl, setDeployUrl] = useState(null);
  const [deployError, setDeployError] = useState(null);

  const set = (key, val) => setValues((v) => ({ ...v, [key]: val }));

  const generate = async () => {
    setGenerating(true);
    setError(null);
    setResult(null);
    setSavedId(null);
    setDeployUrl(null);
    setDeployError(null);
    try {
      const res = await base44.functions.invoke("instantiateTemplate", { templateId: template.id, variables: values });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const save = async () => {
    if (!result) return;
    setSaving(true);
    try {
      const rec = await base44.entities.WebsiteProject.create({
        business_name: result.businessResearch?.businessName || values.business_name || "",
        business_website: "",
        industry: template.industry || "",
        status: "preview_ready",
        business_research: result.businessResearch,
        content: result.content,
        logo_url: result.logoUrl || "",
        hero_image_url: result.heroImageUrl || ""
      });
      setSavedId(rec.id);
    } catch (err) {
      setError(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const deploy = async () => {
    if (!savedId) return;
    setDeploying(true);
    setDeployError(null);
    setDeployUrl(null);
    try {
      const res = await base44.functions.invoke("deploySite", { projectId: savedId });
      setDeployUrl(res.data.url);
    } catch (err) {
      setDeployError(err.response?.data?.error || err.message || "Deploy failed");
    } finally {
      setDeploying(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to templates
      </button>

      <div className="mb-6">
        <h2 className="font-display font-bold text-2xl mb-1">{template.name}</h2>
        <p className="text-muted-foreground text-sm">
          Fill in the business details below. The generator will produce a logo, hero image, content, and accent colors tailored to this business.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card/60 p-5 space-y-4">
        {vars.length === 0 ? (
          <p className="text-sm text-muted-foreground">This template has no declared variables — add your business name and location below.</p>
        ) : (
          vars.map((varDef) => (
            <div key={varDef.key}>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                {labelFor(varDef.key)}
              </label>
              <input
                value={values[varDef.key] || ""}
                onChange={(e) => set(varDef.key, e.target.value)}
                placeholder={varDef.description || labelFor(varDef.key)}
                className="dd-input"
              />
            </div>
          ))
        )}
        <button
          onClick={generate}
          disabled={generating}
          className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:brightness-110 transition disabled:opacity-60"
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {generating ? "Generating logo, content & colors…" : "Generate from Template"}
        </button>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      {result && (
        <div className="mt-6 space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-border bg-card/60 p-5">
              <div className="text-xs font-semibold text-primary uppercase tracking-wide mb-3">Generated Logo</div>
              <div className="aspect-square rounded-xl bg-background/60 border border-border flex items-center justify-center overflow-hidden">
                {result.logoUrl ? (
                  <Image src={result.logoUrl} alt="logo" className="w-full h-full object-contain" fittingType="fit" />
                ) : (
                  <span className="text-sm text-destructive">{result.logoError || "Failed"}</span>
                )}
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card/60 p-5">
              <div className="text-xs font-semibold text-primary uppercase tracking-wide mb-3">Generated Hero</div>
              <div className="aspect-video rounded-xl bg-background/60 border border-border flex items-center justify-center overflow-hidden">
                {result.heroImageUrl ? (
                  <Image src={result.heroImageUrl} alt="hero" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm text-destructive">{result.heroError || "Failed"}</span>
                )}
              </div>
            </div>
          </div>

          {result.content?.hero && (
            <div className="rounded-2xl border border-border bg-card/60 p-5">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Hero</div>
              <p className="font-display font-bold text-xl">{result.content.hero.headline}</p>
              <p className="text-muted-foreground mt-1">{result.content.hero.subheadline}</p>
            </div>
          )}

          {result.content?.colorTokens && (
            <div className="rounded-2xl border border-border bg-card/60 p-5">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Accent Colors</div>
              <div className="flex gap-3">
                {["primary", "accent", "background"].map((k) => {
                  const hex = result.content.colorTokens[k];
                  return (
                    <div key={k} className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg border border-border" style={{ background: hex }} />
                      <div>
                        <div className="text-xs font-semibold capitalize">{k}</div>
                        <div className="text-xs text-muted-foreground font-mono">{hex}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {result.content?.services?.length > 0 && (
            <div className="rounded-2xl border border-border bg-card/60 p-5">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Services ({result.content.services.length})</div>
              <ul className="text-sm text-muted-foreground space-y-1">
                {result.content.services.map((s, i) => (
                  <li key={i}>• {s.title}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              onClick={save}
              disabled={saving || !!savedId}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground hover:brightness-110 transition disabled:opacity-60"
            >
              {savedId ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {savedId ? "Saved" : saving ? "Saving…" : "Save Project"}
            </button>
            {savedId && (
              <button
                onClick={deploy}
                disabled={deploying}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:brightness-110 transition disabled:opacity-60"
              >
                {deploying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
                Deploy to Vercel
              </button>
            )}
          </div>
          {deployError && <p className="text-sm text-destructive">{deployError}</p>}
          {deployUrl && (
            <div className="rounded-xl border border-border bg-background/60 p-3">
              <p className="text-xs text-muted-foreground mb-1">Live site deployed:</p>
              <a href={deployUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary break-all hover:underline">
                {deployUrl} <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}