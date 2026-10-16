import { useState } from "react";
import { useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import PortalShell from "@/components/portal/PortalShell";
import OnboardingWizard from "@/components/portal/OnboardingWizard";
import ProgressStep from "@/components/portal/ProgressStep";
import BlueprintReview from "@/components/portal/BlueprintReview";
import AssetStudio from "@/components/portal/AssetStudio";
import PremiumDesignLibrary from "@/pages/PremiumDesignLibrary";
import AppFactory from "@/pages/AppFactory";
import VideoStudio from "@/pages/VideoStudio";
import MassLaunchConsoleV2 from "@/components/masslaunch/MassLaunchConsoleV2";
import CardFlyerStudio from "@/pages/CardFlyerStudio";
import ComplianceDashboard from "@/components/portal/ComplianceDashboard";
import UniversalLibrary from "@/components/portal/UniversalLibrary";
import SocialCalendar from "@/components/portal/SocialCalendar";
import QualityDashboard from "@/components/portal/QualityDashboard";
import GPTBridge from "@/components/portal/GPTBridge";
import Campaigns from "@/components/portal/Campaigns";
import GPTSyncDashboard from "@/components/portal/GPTSyncDashboard";
import GoogleSheetsSync from "@/components/portal/GoogleSheetsSync";
import SupabaseBridgePanel from "@/components/portal/SupabaseBridgePanel";
import LaunchMonitor from "@/components/portal/LaunchMonitor";
import WebsiteLibrary from "@/components/portal/WebsiteLibrary";
import SiteTemplates from "@/components/portal/SiteTemplates";
import ModulesGrid from "@/components/portal/ModulesGrid";
import LogoLibrary from "@/components/portal/LogoLibrary";
import BrandLibrary from "@/components/portal/BrandLibrary";
import ImageLibrary from "@/components/portal/ImageLibrary";
import WebPackLibrary from "@/components/portal/WebPackLibrary";
import AppPackLibrary from "@/components/portal/AppPackLibrary";
import TemplateIngestion from "@/components/portal/TemplateIngestion";
import MockupLibraryContent from "@/components/portal/MockupLibraryContent";
import IndustryLibraryContent from "@/components/portal/IndustryLibraryContent";
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
  const [pipelineResult, setPipelineResult] = useState(null);
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
    setPipelineResult(null);
    setError(null);
  };

  const deployToVercel = async () => {
    if (!savedId) return;
    setDeploying(true);
    setDeployError(null);
    setDeployUrl(null);
    setPipelineResult(null);
    try {
      const res = await base44.functions.invoke("validatorGatedPipeline", {
        projectId: savedId,
        skipDeploy: false,
        maxRepairLoops: 3,
      });
      const pipeline = res.data || {};
      setPipelineResult(pipeline);
      if (pipeline.gated) {
        setDeployError(pipeline.gate_reason || "Quality gates failed — site not deployed");
      } else if (pipeline.success) {
        const deployStage = pipeline.stages?.find((s) => s.stage === "deploy");
        setDeployUrl(deployStage?.url || "");
      }
    } catch (err) {
      setDeployError(err.response?.data?.error || err.message || "Pipeline failed");
    } finally {
      setDeploying(false);
    }
  };

  return (
    <PortalShell activeTab={tab} onTabChange={setTab} onNew={() => { reset(); setTab("generator"); }}>
      {error && tab === "generator" && (
        <div className="max-w-2xl mx-auto px-4 mt-4 rounded-xl border border-red-300 bg-red-50 text-red-600 text-sm p-3">
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
              <h2 className="font-black text-2xl mb-2 text-slate-900">Project Saved</h2>
              <p className="text-slate-500 mb-4">
                Your website blueprint and assets are saved, and {templates.length} industry templates were added to your library.
              </p>
              <div className="flex flex-col items-center gap-3 w-full">
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={reset}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition"
                  >
                    <Plus className="w-4 h-4" /> Create Another
                  </button>
                  <button
                    onClick={() => setTab("library")}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 hover:text-[#00d4ff] hover:border-[#00d4ff]/40 transition"
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
                    {deploying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />} Run Quality Gates & Deploy
                  </button>
                  {deployError && (
                    <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-left">
                      <p className="text-sm font-semibold text-red-600 mb-1">Deployment Blocked</p>
                      <p className="text-xs text-red-500">{deployError}</p>
                    </div>
                  )}
                  {pipelineResult && (
                    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-left w-full">
                      <p className="text-xs font-bold text-slate-700 mb-2">Quality Gate Results</p>
                      <div className="space-y-1">
                        {pipelineResult.gates?.map((g, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            {g.gated ? (
                              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                            ) : (
                              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                            )}
                            <span className="font-mono text-slate-500 shrink-0">{g.gate}</span>
                            <span className="text-slate-400">→</span>
                            <span className={`font-semibold ${g.gated ? "text-red-600" : "text-emerald-600"}`}>
                              {g.gated ? "BLOCKED" : "PASS"}
                              {g.score ? ` (${g.score})` : ""}
                            </span>
                          </div>
                        ))}
                      </div>
                      {pipelineResult.total_fix_runs > 0 && (
                        <p className="text-[10px] text-slate-400 mt-2">
                          {pipelineResult.total_fix_runs} auto-fix runs executed across gates
                        </p>
                      )}
                    </div>
                  )}
                  {deployUrl && (
                    <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-left">
                      <p className="text-xs text-emerald-600 mb-1 font-semibold">All gates passed — live site deployed:</p>
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

      {tab === "ingest" && <TemplateIngestion />}
      {tab === "library" && <PremiumDesignLibrary />}
      {tab === "sites" && <WebsiteLibrary />}
      {tab === "templates" && <SiteTemplates />}
      {tab === "logos" && <LogoLibrary />}
      {tab === "brands" && <BrandLibrary />}
      {tab === "images" && <ImageLibrary />}
      {tab === "web-packs" && <WebPackLibrary />}
      {tab === "app-packs" && <AppPackLibrary />}
      {tab === "mockups" && <MockupLibraryContent />}
      {tab === "industry-library" && <IndustryLibraryContent />}
      {tab === "launch" && <MassLaunchConsoleV2 onDeployed={() => setTab("campaigns")} />}
      {tab === "monitor" && <LaunchMonitor />}
      {tab === "compliance" && <ComplianceDashboard />}
      {tab === "social-calendar" && <SocialCalendar />}
      {tab === "campaigns" && <Campaigns />}
      {tab === "app-factory" && <AppFactory />}
      {tab === "video-studio" && <VideoStudio />}
      {tab === "universal-library" && <UniversalLibrary />}
      {tab === "card-flyer" && <CardFlyerStudio />}
      {tab === "modules" && <ModulesGrid />}
      {tab === "quality" && <QualityDashboard />}
      {tab === "gpt-bridge" && <GPTBridge />}
      {tab === "sync" && <GPTSyncDashboard />}
      {tab === "sheets" && <GoogleSheetsSync />}
      {tab === "supabase" && <SupabaseBridgePanel />}
    </PortalShell>
  );
}