import { useState } from "react";
import { base44 } from "@/api/base44Client";
import PortalNav from "@/components/portal/PortalNav";
import OnboardingWizard from "@/components/portal/OnboardingWizard";
import ProgressStep from "@/components/portal/ProgressStep";
import BlueprintReview from "@/components/portal/BlueprintReview";
import AssetStudio from "@/components/portal/AssetStudio";
import TemplateLibrary from "@/components/portal/TemplateLibrary";
import { CheckCircle2, Plus, Wand2, Library } from "lucide-react";

export default function Portal() {
  const [tab, setTab] = useState("generator");
  const [step, setStep] = useState("onboarding");
  const [phase, setPhase] = useState(0);
  const [form, setForm] = useState(null);
  const [result, setResult] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [assets, setAssets] = useState({ logoUrl: null, heroImageUrl: null, logoError: null, heroError: null });
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState(null);
  const [error, setError] = useState(null);

  const generate = async (formData) => {
    setForm(formData);
    setStep("generating");
    setPhase(0);
    setError(null);
    const t1 = setTimeout(() => setPhase(1), 5000);
    const t2 = setTimeout(() => setPhase(2), 14000);
    const t3 = setTimeout(() => setPhase(3), 22000);
    try {
      const [siteRes, tplRes] = await Promise.all([
        base44.functions.invoke("generateWebsite", formData),
        base44.functions.invoke("researchIndustryTemplates", { industry: formData.industry }),
      ]);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      setResult(siteRes.data);
      setTemplates(tplRes.data?.templates || []);
      setPhase(4);
      setStep("review");
    } catch (err) {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      setError(err.response?.data?.error || err.message || "Generation failed");
      setStep("onboarding");
    }
  };

  const generateAssets = async () => {
    if (!result?.content) return;
    setLoadingAssets(true);
    setAssets({ logoUrl: null, heroImageUrl: null, logoError: null, heroError: null });
    setStep("assets");
    try {
      const res = await base44.functions.invoke("generateAssets", {
        logoPrompt: result.content.logoPrompt,
        heroImagePrompt: result.content.heroImagePrompt,
      });
      setAssets(res.data);
    } catch (err) {
      setAssets({
        logoUrl: null,
        heroImageUrl: null,
        logoError: "Failed",
        heroError: err.response?.data?.error || err.message,
      });
    } finally {
      setLoadingAssets(false);
    }
  };

  const save = async () => {
    if (!result) return;
    setSaving(true);
    try {
      const rec = await base44.entities.WebsiteProject.create({
        business_name: result.businessResearch?.businessName || form?.businessName || "",
        business_website: form?.businessWebsiteUrl || "",
        industry: form?.industry || "",
        status: "preview_ready",
        business_research: result.businessResearch,
        benchmark: result.benchmark,
        content: result.content,
        logo_url: assets.logoUrl || "",
        hero_image_url: assets.heroImageUrl || "",
      });
      setSavedId(rec.id);
      setStep("saved");
    } catch (err) {
      setError(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setStep("onboarding");
    setForm(null);
    setResult(null);
    setTemplates([]);
    setAssets({ logoUrl: null, heroImageUrl: null, logoError: null, heroError: null });
    setSavedId(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PortalNav onNew={() => { reset(); setTab("generator"); }} />

      {/* Tabs */}
      <div className="border-b border-border bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-1">
          <TabButton active={tab === "generator"} onClick={() => setTab("generator")} icon={Wand2} label="Website Generator" />
          <TabButton active={tab === "library"} onClick={() => setTab("library")} icon={Library} label="Template Library" />
        </div>
      </div>

      {error && (
        <div className="max-w-2xl mx-auto px-4 mt-4 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive text-sm p-3">
          {error}
        </div>
      )}

      {tab === "generator" && (
        <>
          {step === "onboarding" && <OnboardingWizard onComplete={generate} />}
          {step === "generating" && <ProgressStep phase={phase} />}
          {step === "review" && result && (
            <BlueprintReview
              result={result}
              onGenerateAssets={generateAssets}
              loadingAssets={loadingAssets}
              onSave={save}
              saving={saving}
            />
          )}
          {step === "assets" && (
            <AssetStudio
              assets={assets}
              loading={loadingAssets}
              onRegenerate={generateAssets}
              onSave={save}
              saving={saving}
              saved={!!savedId}
            />
          )}
          {step === "saved" && (
            <div className="max-w-xl mx-auto px-4 py-20 text-center">
              <div className="inline-flex w-16 h-16 rounded-2xl bg-primary/15 items-center justify-center mb-6">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <h2 className="font-display font-bold text-2xl mb-2">Project Saved</h2>
              <p className="text-muted-foreground mb-4">
                Your website blueprint and assets are saved, and {templates.length} industry templates were added to your library.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={reset}
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground hover:brightness-110 transition"
                >
                  <Plus className="w-4 h-4" /> Create Another
                </button>
                <button
                  onClick={() => setTab("library")}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-secondary transition"
                >
                  <Library className="w-4 h-4" /> View Templates
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {tab === "library" && <TemplateLibrary />}
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition ${
        active ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon className="w-4 h-4" /> {label}
    </button>
  );
}