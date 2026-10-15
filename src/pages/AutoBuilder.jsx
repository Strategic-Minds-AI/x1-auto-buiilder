import { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import AutoBuilderTimeline from "@/components/autobuilder/AutoBuilderTimeline";
import ProjectCreator from "@/components/autobuilder/ProjectCreator";
import VisionStep from "@/components/autobuilder/VisionStep";
import StrategyStep from "@/components/autobuilder/StrategyStep";
import NameStep from "@/components/autobuilder/NameStep";
import BrandStep from "@/components/autobuilder/BrandStep";
import TemplateStep from "@/components/autobuilder/TemplateStep";
import WebsiteStep from "@/components/autobuilder/WebsiteStep";
import ContentStep from "@/components/autobuilder/ContentStep";
import ComplianceStep from "@/components/autobuilder/ComplianceStep";
import SocialStep from "@/components/autobuilder/SocialStep";
import ReviewStep from "@/components/autobuilder/ReviewStep";
import LaunchStep from "@/components/autobuilder/LaunchStep";
import { Hammer, ArrowLeft } from "lucide-react";

// The guided 12-step Auto Builder — a distraction-free, step-by-step journey
// with a horizontal timeline at the top. Each step persists into the BuildProject
// so the chain compounds: vision → strategy → name → brand → template → website →
// content → compliance → social → review → launch.
export default function AutoBuilder() {
  const [step, setStep] = useState("project");
  const [accent, setAccent] = useState("#00d4ff");
  const [projectId, setProjectId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Accumulated state across steps
  const [vision, setVision] = useState(null);
  const [strategy, setStrategy] = useState(null);
  const [nameData, setNameData] = useState(null);
  const [brandData, setBrandData] = useState(null);
  const [templateData, setTemplateData] = useState(null);
  const [websiteData, setWebsiteData] = useState(null);
  const [contentData, setContentData] = useState(null);
  const [complianceData, setComplianceData] = useState(null);
  const [socialData, setSocialData] = useState(null);

  const createProject = async (name) => {
    setSaving(true);
    try {
      const rec = await base44.entities.BuildProject.create({
        name, status: "draft", current_step: "project", accent_color: accent,
      });
      setProjectId(rec.id);
    } catch {
      setProjectId("local");
    } finally {
      setSaving(false);
    }
    setStep("vision");
  };

  const updateProject = async (patch) => {
    if (!projectId || projectId === "local") return;
    try {
      await base44.entities.BuildProject.update(projectId, { ...patch, current_step: step });
    } catch {}
  };

  // Step transitions — each carries accumulated state forward
  const approveVision = (v) => { setVision(v); setStep("strategy"); updateProject({ vision: v, vision_type: v.type, status: "vision" }); };
  const approveStrategy = ({ strategy: s, addons }) => { setStrategy({ ...s, addons }); setStep("name"); updateProject({ strategy: s, addons, status: "strategy" }); };
  const approveName = (n) => { setNameData(n); setStep("brand"); updateProject({ status: "building" }); };
  const approveBrand = (b) => { setBrandData(b); setStep("template"); updateProject({ accent_color: b.palette?.accent || accent }); };
  const approveTemplate = (t) => { setTemplateData(t); setStep("website"); };
  const approveWebsite = (w) => { setWebsiteData(w); setStep("content"); updateProject({ status: "building" }); };
  const approveContent = (c) => { setContentData(c); setStep("compliance"); };
  const approveCompliance = (c) => { setComplianceData(c); setStep("social"); };
  const approveSocial = (s) => { setSocialData(s); setStep("review"); };
  const approveReview = () => { setStep("launch"); updateProject({ status: "complete" }); };
  const approveLaunch = () => { /* done — stay on launch page */ };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Top bar */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: accent }}>
            <Hammer className="h-4 w-4 text-slate-900" />
          </span>
          <div className="leading-tight">
            <div className="text-sm font-bold text-slate-900">Auto Builder</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400">Digital Dominance Factory</div>
          </div>
          <Link
            to="/portal"
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Portal
          </Link>
        </div>
      </header>

      <AutoBuilderTimeline currentKey={step} accent={accent} />

      <main className="bg-white">
        {step === "project" && <ProjectCreator onCreate={createProject} accent={accent} setAccent={setAccent} />}
        {step === "vision" && <VisionStep accent={accent} setAccent={setAccent} onApprove={approveVision} />}
        {step === "strategy" && vision && <StrategyStep vision={vision} accent={accent} onApprove={approveStrategy} />}
        {step === "name" && <NameStep accent={accent} vision={vision} strategy={strategy} onApprove={approveName} />}
        {step === "brand" && <BrandStep accent={accent} setAccent={setAccent} nameData={nameData} onApprove={approveBrand} />}
        {step === "template" && <TemplateStep accent={accent} onApprove={approveTemplate} />}
        {step === "website" && <WebsiteStep accent={accent} vision={vision} strategy={strategy} nameData={nameData} brandData={brandData} templateData={templateData} onApprove={approveWebsite} />}
        {step === "content" && <ContentStep accent={accent} websiteData={websiteData} onApprove={approveContent} />}
        {step === "compliance" && <ComplianceStep accent={accent} websiteData={websiteData} onApprove={approveCompliance} />}
        {step === "social" && <SocialStep accent={accent} nameData={nameData} brandData={brandData} onApprove={approveSocial} />}
        {step === "review" && <ReviewStep accent={accent} vision={vision} strategy={strategy} nameData={nameData} brandData={brandData} templateData={templateData} websiteData={websiteData} contentData={contentData} complianceData={complianceData} socialData={socialData} onApprove={approveReview} />}
        {step === "launch" && <LaunchStep accent={accent} projectId={projectId} nameData={nameData} websiteData={websiteData} onApprove={approveLaunch} />}
      </main>

      {saving && (
        <div className="fixed bottom-4 right-4 rounded-full bg-slate-900 text-white text-xs px-4 py-2 shadow-lg">
          Saving…
        </div>
      )}
    </div>
  );
}