import { useState } from "react";
import { useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import PortalShell from "@/components/portal/PortalShell";
import OnboardingWizard from "@/components/portal/OnboardingWizard";
import ProgressStep from "@/components/portal/ProgressStep";
import BlueprintReview from "@/components/portal/BlueprintReview";
import AssetStudio from "@/components/portal/AssetStudio";
import PremiumDesignLibrary from "@/pages/PremiumDesignLibrary";
import MassLaunchConsoleV2 from "@/components/masslaunch/MassLaunchConsoleV2";
import Campaigns from "@/components/portal/Campaigns";
import GPTSyncDashboard from "@/components/portal/GPTSyncDashboard";
import GoogleSheetsSync from "@/components/portal/GoogleSheetsSync";
import WebsiteLibrary from "@/components/portal/WebsiteLibrary";
import SiteTemplates from "@/components/portal/SiteTemplates";
import ModulesGrid from "@/components/portal/ModulesGrid";
import LogoLibrary from "@/components/portal/LogoLibrary";
import BrandLibrary from "@/components/portal/BrandLibrary";
import ImageLibrary from "@/components/portal/ImageLibrary";
import WebPackLibrary from "@/components/portal/WebPackLibrary";
import AppPackLibrary from "@/components/portal/AppPackLibrary";
import { Link } from "react-router-dom";
import { CheckCircle2, Plus, Loader2, Rocket, ExternalLink, Library } from "lucide-react";

export default function Portal() {
  const location = useLocation();
  const prefill = location.state?.prefill;
  const [tab, setTab] = useState("generator");
  const [step, setStep] = useState(prefill ? "onboarding" : "onboarding");
  const [phase, setPhase] = useState(0);
  const [form, setForm] = useState(null);
  const [result, setResult] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [assets, setAssets] = useState({ logoUrl: null, heroImageUrl: null, logoError: null, heroError: null });
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState(null);
  const [deploying, setDeploying] = useState(false);
  const [deployUrl, setDeployUrl] = useState(null);
  const [deployError, setDeployError] = useState(null);
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
    setDeploying(false);
    setDeployUrl(null);
    setDeployError(null);
    setError(null);
  };

  const deployToVercel = async () => {
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
    <PortalShell activeTab={tab} onTabChange={setTab} onNew={() => { reset(); setTab("generator"); }}>
      {error && tab === "generator" && (
        <div className="max-w-2xl mx-auto px-4 mt-4 rounded-xl border border-red-500/40 bg-red-500/10 text-red-400 text-sm p-3">
          {error}
        </div>
      )}

      {tab === "generator" && (
        <>
          {step === "onboarding" && <OnboardingWizard onComplete={generate} prefill={prefill} />}
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
              <div className="inline-flex w-16 h-16 rounded-2xl bg-[#00d4ff]/15 items-center justify-center mb-6">
                <CheckCircle2 className="w-8 h-8 text-[#00d4ff]" />
              </div>
              <h2 className="font-black text-2xl mb-2 text-white">Project Saved</h2>
              <p className="text-white/50 mb-4">
                Your website blueprint and assets are saved, and {templates.length} industry templates were added to your library.
              </p>
              <div className="flex flex-col items-center gap-3 w-full">
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={reset}
                    className="inline-flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 transition"
                  >
                    <Plus className="w-4 h-4" /> Create Another
                  </button>
                  <button
                    onClick={() => setTab("library")}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white/70 hover:text-[#00d4ff] hover:border-[#00d4ff]/40 transition"
                  >
                    <Library className="w-4 h-4" /> View Templates
                  </button>
                </div>
                <div className="w-full mt-2">
                  <button
                    onClick={deployToVercel}
                    disabled={deploying}
                    className="inline-flex items-center gap-2 rounded-full bg-[#00d4ff] px-6 py-3 text-sm font-bold text-[#0a0e14] hover:brightness-110 hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] transition disabled:opacity-60"
                  >
                    {deploying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />} Deploy to Vercel
                  </button>
                  {deployError && (
                    <p className="mt-3 text-left text-sm text-red-400">{deployError}</p>
                  )}
                  {deployUrl && (
                    <div className="mt-3 rounded-xl border border-white/10 bg-[#0d1117] p-3 text-left">
                      <p className="text-xs text-white/40 mb-1">Live site deployed:</p>
                      <a href={deployUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#00d4ff] break-all hover:underline">
                        {deployUrl} <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {tab === "library" && <PremiumDesignLibrary />}
      {tab === "sites" && <WebsiteLibrary />}
      {tab === "templates" && <SiteTemplates />}
      {tab === "logos" && <LogoLibrary />}
      {tab === "brands" && <BrandLibrary />}
      {tab === "images" && <ImageLibrary />}
      {tab === "web-packs" && <WebPackLibrary />}
      {tab === "app-packs" && <AppPackLibrary />}
      {tab === "launch" && <MassLaunchConsoleV2 onDeployed={() => setTab("campaigns")} />}
      {tab === "campaigns" && <Campaigns />}
      {tab === "modules" && <ModulesGrid />}
      {tab === "sync" && <GPTSyncDashboard />}
      {tab === "sheets" && <GoogleSheetsSync />}
    </PortalShell>
  );
}