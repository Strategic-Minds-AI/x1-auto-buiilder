import { useState } from "react";
import { base44 } from "@/api/base44Client";
import PortalNav from "@/components/portal/PortalNav";
import OnboardingStep from "@/components/portal/OnboardingStep";
import ProgressStep from "@/components/portal/ProgressStep";
import BlueprintReview from "@/components/portal/BlueprintReview";
import AssetStudio from "@/components/portal/AssetStudio";
import { CheckCircle2, Plus } from "lucide-react";

export default function Portal() {
  const [step, setStep] = useState("onboarding");
  const [phase, setPhase] = useState(0);
  const [form, setForm] = useState(null);
  const [result, setResult] = useState(null);
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
    const t1 = setTimeout(() => setPhase(1), 6000);
    const t2 = setTimeout(() => setPhase(2), 14000);
    try {
      const res = await base44.functions.invoke("generateWebsite", formData);
      clearTimeout(t1);
      clearTimeout(t2);
      setResult(res.data);
      setPhase(3);
      setStep("review");
    } catch (err) {
      clearTimeout(t1);
      clearTimeout(t2);
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
    setAssets({ logoUrl: null, heroImageUrl: null, logoError: null, heroError: null });
    setSavedId(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PortalNav onNew={reset} />

      {error && (
        <div className="max-w-2xl mx-auto px-4 mt-4 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive text-sm p-3">
          {error}
        </div>
      )}

      {step === "onboarding" && <OnboardingStep onGenerate={generate} />}
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
          <p className="text-muted-foreground mb-8">
            Your website blueprint and assets are saved to your projects.
          </p>
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground hover:brightness-110 transition"
          >
            <Plus className="w-4 h-4" /> Create Another
          </button>
        </div>
      )}
    </div>
  );
}