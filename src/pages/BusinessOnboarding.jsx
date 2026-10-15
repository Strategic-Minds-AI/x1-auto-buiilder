import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import OnboardingWizard from "@/components/portal/OnboardingWizard";
import PageHeader from "@/components/shared/PageHeader";
import { Loader2, CheckCircle } from "lucide-react";

export default function BusinessOnboarding() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState("form");
  const [error, setError] = useState("");

  const handleComplete = async (formData) => {
    setPhase("generating");
    setError("");
    try {
      const res = await base44.functions.invoke("generateWebsite", formData);
      await base44.entities.WebsiteProject.create({
        business_name: res.data.businessResearch?.businessName || formData.businessName || "",
        business_website: formData.businessWebsiteUrl || "",
        industry: formData.industry || "",
        status: "generated",
        business_research: res.data.businessResearch,
        benchmark: res.data.benchmark,
        content: res.data.content,
      });
      setPhase("done");
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Generation failed");
      setPhase("error");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageHeader title="Business Onboarding" subtitle="Input your business vision, industry, and core requirements to start" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {phase === "form" && <OnboardingWizard onComplete={handleComplete} />}
        {phase === "generating" && (
          <div className="flex flex-col items-center gap-3 py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Researching your business and generating your blueprint…</p>
          </div>
        )}
        {phase === "done" && (
          <div className="max-w-xl mx-auto text-center py-20">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-5">
              <CheckCircle className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-2">Onboarding complete!</h2>
            <p className="text-muted-foreground mb-6">Your business blueprint has been generated and saved.</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => navigate("/research-hub")} className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground">View Research</button>
              <button onClick={() => navigate("/project-timeline")} className="rounded-full border border-border px-6 py-3 text-sm font-bold text-foreground">Project Timeline</button>
            </div>
          </div>
        )}
        {phase === "error" && (
          <div className="max-w-xl mx-auto text-center py-20">
            <p className="text-destructive mb-4">{error}</p>
            <button onClick={() => setPhase("form")} className="rounded-full border border-border px-6 py-3 text-sm font-bold">Try Again</button>
          </div>
        )}
      </div>
    </div>
  );
}