import { useState } from "react";
import { base44 } from "@/api/base44Client";
import CommandInput from "@/components/apex/CommandInput";
import CommandPlan from "@/components/apex/CommandPlan";
import CommandExecutor from "@/components/apex/CommandExecutor";
import CommandResults from "@/components/apex/CommandResults";
import { Hammer, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

// APEX Universal Build Command — one-command business creation.
// Decomposes a natural-language objective into a plan, then orchestrates
// the existing pipeline: research → website → assets → compliance → social → save.
export default function ApexCommand() {
  const [phase, setPhase] = useState("input"); // input | planning | plan | executing | complete
  const [objective, setObjective] = useState("");
  const [plan, setPlan] = useState(null);
  const [steps, setSteps] = useState([]);
  const [results, setResults] = useState({});
  const [error, setError] = useState(null);

  const decompose = async () => {
    setPhase("planning");
    setError(null);
    try {
      const res = await base44.functions.invoke("apexDecomposeCommand", { objective });
      setPlan(res.data);
      setPhase("plan");
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Decomposition failed");
      setPhase("input");
    }
  };

  const updateStep = (key, patch) => {
    setSteps((prev) => prev.map((s) => (s.key === key ? { ...s, ...patch } : s)));
  };

  const execute = async () => {
    const caps = plan.capabilities || [];
    const pipeline = [
      { key: "research", label: "Business Research", enabled: !!plan.website_url },
      { key: "website", label: "Website Generation", enabled: true },
      { key: "assets", label: "Brand Assets (Logo + Hero)", enabled: caps.includes("logo") || caps.includes("hero_image") },
      { key: "compliance", label: "Google Compliance Check", enabled: caps.includes("compliance") },
      { key: "fix", label: "Auto-Fix Compliance", enabled: caps.includes("compliance") },
      { key: "social", label: "30-Day Social Campaign", enabled: caps.includes("social_30day") },
      { key: "save", label: "Save Project", enabled: true },
    ].map((s) => ({ ...s, status: s.enabled ? "pending" : "skipped" }));

    setSteps(pipeline);
    setPhase("executing");
    setError(null);

    let websiteResult = null;
    let assetsResult = { logoUrl: null, heroImageUrl: null };
    let complianceScore = undefined;
    let projectId = null;
    let socialCount = 0;

    const formData = {
      businessWebsiteUrl: plan.website_url || "",
      industry: plan.industry,
      businessName: plan.business_name,
      goal: plan.goal,
      tone: plan.tone,
      locations: plan.locations || [],
    };

    // Step 1: Research
    if (plan.website_url) {
      updateStep("research", { status: "active" });
      try {
        await base44.functions.invoke("researchBusiness", { websiteUrl: plan.website_url, industry: plan.industry });
        updateStep("research", { status: "done", result: "OK" });
      } catch (e) {
        updateStep("research", { status: "error", detail: e.message });
      }
    }

    // Step 2: Website Generation
    updateStep("website", { status: "active" });
    try {
      const res = await base44.functions.invoke("generateWebsite", formData);
      websiteResult = res.data;
      updateStep("website", { status: "done", result: "Blueprint ready" });
    } catch (e) {
      updateStep("website", { status: "error", detail: e.message });
      setPhase("plan");
      setError("Website generation failed: " + (e.message || ""));
      return;
    }

    // Step 3: Assets
    if (pipeline.find((s) => s.key === "assets").enabled) {
      updateStep("assets", { status: "active" });
      try {
        const res = await base44.functions.invoke("generateAssets", {
          logoPrompt: websiteResult?.content?.logoPrompt || `professional logo for ${plan.business_name}`,
          heroImagePrompt: websiteResult?.content?.heroImagePrompt || `hero image for ${plan.industry} business`,
        });
        assetsResult = res.data;
        updateStep("assets", { status: "done", result: "Logo + Hero" });
      } catch (e) {
        updateStep("assets", { status: "error", detail: e.message });
      }
    }

    // Step 4: Compliance Check
    if (pipeline.find((s) => s.key === "compliance").enabled && projectId) {
      updateStep("compliance", { status: "active" });
      try {
        const res = await base44.functions.invoke("runComplianceCheck", { projectId });
        complianceScore = res.data?.overallScore;
        updateStep("compliance", { status: "done", result: `${complianceScore || 0}%` });
      } catch (e) {
        updateStep("compliance", { status: "error", detail: e.message });
      }
    }

    // Step 5: Auto-Fix
    if (pipeline.find((s) => s.key === "fix").enabled && complianceScore !== undefined && complianceScore < 90 && projectId) {
      updateStep("fix", { status: "active" });
      try {
        const res = await base44.functions.invoke("autoFixCompliance", { projectId });
        complianceScore = res.data?.overallScore || complianceScore;
        updateStep("fix", { status: "done", result: `${complianceScore}%` });
      } catch (e) {
        updateStep("fix", { status: "error", detail: e.message });
      }
    } else if (pipeline.find((s) => s.key === "fix").enabled) {
      updateStep("fix", { status: "done", result: complianceScore >= 90 ? "Already passing" : "No project" });
    }

    // Step 6: Social
    if (pipeline.find((s) => s.key === "social").enabled && projectId) {
      updateStep("social", { status: "active" });
      try {
        await base44.functions.invoke("generateSocialSchedule", { projectId });
        socialCount = 30;
        updateStep("social", { status: "done", result: "30 posts" });
      } catch (e) {
        updateStep("social", { status: "error", detail: e.message });
      }
    }

    // Step 7: Save
    updateStep("save", { status: "active" });
    try {
      const rec = await base44.entities.WebsiteProject.create({
        business_name: plan.business_name,
        business_website: plan.website_url || "",
        industry: plan.industry,
        status: "preview_ready",
        business_research: websiteResult?.businessResearch,
        benchmark: websiteResult?.benchmark,
        content: websiteResult?.content,
        logo_url: assetsResult.logoUrl || "",
        hero_image_url: assetsResult.heroImageUrl || "",
        location: plan.locations?.[0] || "",
      });
      projectId = rec.id;
      updateStep("save", { status: "done", result: "Saved" });
    } catch (e) {
      updateStep("save", { status: "error", detail: e.message });
    }

    setResults({ projectId, complianceScore, socialPosts: socialCount, assets: assetsResult, deployUrl: null });
    setPhase("complete");
  };

  const restart = () => {
    setPhase("input");
    setObjective("");
    setPlan(null);
    setSteps([]);
    setResults({});
    setError(null);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00d4ff]">
            <Hammer className="h-4 w-4 text-slate-900" />
          </span>
          <div className="leading-tight">
            <div className="text-sm font-bold text-slate-900">APEX Universal Build Command</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400">Digital Dominance Factory</div>
          </div>
          <Link to="/portal" className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition">
            <ArrowLeft className="h-3.5 w-3.5" /> Portal
          </Link>
        </div>
      </header>

      {error && (
        <div className="max-w-3xl mx-auto px-4 mt-4 rounded-xl border border-red-300 bg-red-50 text-red-600 text-sm p-3">
          {error}
        </div>
      )}

      {phase === "input" && <CommandInput objective={objective} setObjective={setObjective} onSubmit={decompose} loading={false} />}
      {phase === "planning" && <CommandInput objective={objective} setObjective={setObjective} onSubmit={decompose} loading={true} />}
      {phase === "plan" && <CommandPlan plan={plan} onExecute={execute} executing={false} />}
      {phase === "executing" && <CommandExecutor steps={steps} />}
      {phase === "complete" && <CommandResults results={results} onRestart={restart} />}
    </div>
  );
}