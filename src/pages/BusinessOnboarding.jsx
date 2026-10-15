import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import OnboardingWizard from "@/components/portal/OnboardingWizard";
import NamingStep from "@/components/onboarding/NamingStep";
import PricingDisplay from "@/components/onboarding/PricingDisplay";
import PageHeader from "@/components/shared/PageHeader";
import { Loader2, CheckCircle, DollarSign, Building2 } from "lucide-react";

export default function BusinessOnboarding() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState("form");
  const [error, setError] = useState("");
  const [formData, setFormData] = useState(null);
  const [selectedName, setSelectedName] = useState(null);
  const [pricingStrategy, setPricingStrategy] = useState(null);
  const [savedProject, setSavedProject] = useState(null);

  const handleFormComplete = (formData) => {
    setFormData(formData);
    setPhase("naming");
  };

  const handleNameSelected = (nameOption) => {
    setSelectedName(nameOption);
    startGeneration(formData, nameOption);
  };

  const handleNameSkip = () => {
    startGeneration(formData, null);
  };

  const startGeneration = async (form, nameOpt) => {
    setPhase("generating");
    setError("");
    setPricingStrategy(null);
    setSavedProject(null);

    const enrichedForm = nameOpt
      ? { ...form, businessName: nameOpt.name }
      : form;

    try {
      // Run website generation and pricing discovery in parallel
      const [siteRes, pricingRes] = await Promise.allSettled([
        base44.functions.invoke("generateWebsite", enrichedForm),
        base44.functions.invoke("discoverPricing", {
          industry: form.industry,
          location: form.location || "",
          service: form.goal || "",
        }),
      ]);

      if (siteRes.status !== "fulfilled") {
        throw new Error(siteRes.reason?.response?.data?.error || siteRes.reason?.message || "Website generation failed");
      }

      const siteData = siteRes.value.data;

      // Generate pricing strategy from discovered pricing (if discovery succeeded)
      let strategy = null;
      if (pricingRes.status === "fulfilled" && pricingRes.value.data?.records?.length > 0) {
        try {
          const stratRes = await base44.functions.invoke("generatePricingStrategy", {
            industry: form.industry,
            market: form.location || "",
          });
          strategy = stratRes.data?.strategy || null;
        } catch {}
      }

      // Save the project with all data
      const project = await base44.entities.WebsiteProject.create({
        business_name: nameOpt?.name || siteData.businessResearch?.businessName || form.businessName || "",
        business_website: form.businessWebsiteUrl || "",
        industry: form.industry || "",
        status: "generated",
        business_research: {
          ...siteData.businessResearch,
          brandNameOption: nameOpt ? {
            name: nameOpt.name,
            positioning: nameOpt.positioning,
            rationale: nameOpt.rationale,
            logoDirection: nameOpt.logoDirection,
            palettePreview: nameOpt.palettePreview,
            domainOptions: nameOpt.domainOptions,
            confidence: nameOpt.confidence,
          } : undefined,
        },
        benchmark: siteData.benchmark,
        content: siteData.content,
      });

      setSavedProject(project);
      setPricingStrategy(strategy);
      setPhase("done");
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Generation failed");
      setPhase("error");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <PageHeader title="Business Onboarding" subtitle="Input your business vision, generate a brand identity, and get competitive pricing — all in one flow" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {phase === "form" && <OnboardingWizard onComplete={handleFormComplete} />}

        {phase === "naming" && formData && (
          <NamingStep
            form={formData}
            onSelected={handleNameSelected}
            onSkip={handleNameSkip}
          />
        )}

        {phase === "generating" && (
          <div className="flex flex-col items-center gap-4 py-20">
            <Loader2 className="h-10 w-10 animate-spin text-[#00d4ff]" />
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-700">Researching your business, generating your blueprint, and discovering competitive pricing…</p>
              <p className="text-xs text-slate-400 mt-1">This takes 30-60 seconds</p>
            </div>
          </div>
        )}

        {phase === "done" && (
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Success header */}
            <div className="text-center py-6">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00d4ff]/10 mb-4">
                <CheckCircle className="h-7 w-7 text-[#00d4ff]" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-1">Onboarding Complete!</h2>
              <p className="text-slate-500">
                {selectedName ? `Brand "${selectedName.name}" saved` : "Blueprint saved"}
                {savedProject?.industry ? ` · ${savedProject.industry}` : ""}
              </p>
            </div>

            {/* Brand name summary */}
            {selectedName && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="w-4 h-4 text-[#00d4ff]" />
                  <h3 className="text-sm font-bold text-slate-700">Brand Identity</h3>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    {(selectedName.palettePreview || []).map((color, ci) => (
                      <div key={ci} className="w-8 h-8 rounded-lg border border-slate-200" style={{ background: color }} />
                    ))}
                  </div>
                  <div>
                    <div className="text-lg font-black text-slate-900">{selectedName.name}</div>
                    <div className="text-sm text-slate-500 italic">"{selectedName.positioning}"</div>
                  </div>
                </div>
              </div>
            )}

            {/* Pricing strategy */}
            {pricingStrategy ? (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-5 h-5 text-[#00d4ff]" />
                  <h3 className="text-lg font-bold text-slate-900">Pricing Strategy</h3>
                  <span className="text-xs text-slate-400">Auto-generated from competitor data</span>
                </div>
                <PricingDisplay strategy={pricingStrategy} industry={formData?.industry} market={formData?.location} />
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
                <p className="text-sm text-slate-400">Pricing discovery unavailable for this industry. You can run it manually from the Research Hub.</p>
              </div>
            )}

            {/* Next steps */}
            <div className="flex justify-center gap-3 pt-4">
              <button
                onClick={() => navigate("/auto-builder")}
                className="inline-flex items-center gap-2 rounded-full bg-[#00d4ff] px-6 py-3 text-sm font-bold text-[#0a0e14] hover:brightness-110 transition"
              >
                Continue to Auto Builder
              </button>
              <button
                onClick={() => navigate("/research-hub")}
                className="rounded-full border border-slate-200 px-6 py-3 text-sm font-bold text-slate-600 hover:text-[#00d4ff] hover:border-[#00d4ff]/40 transition"
              >
                View Research Hub
              </button>
            </div>
          </div>
        )}

        {phase === "error" && (
          <div className="max-w-xl mx-auto text-center py-20">
            <p className="text-red-500 mb-4">{error}</p>
            <button onClick={() => setPhase("form")} className="rounded-full border border-slate-200 px-6 py-3 text-sm font-bold text-slate-600 hover:text-[#00d4ff] transition">
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}