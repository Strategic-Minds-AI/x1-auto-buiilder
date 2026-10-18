import { useState } from "react";
import { base44 } from "@/api/base44Client";
import AutoStepShell from "@/components/autobuilder/AutoStepShell";
import { getIndustryBuildProfile } from "@/lib/industryBuildProfiles";
import { Loader2, Globe, Check, Layers, Image as ImageIcon, Search, Workflow } from "lucide-react";

const OPTIONAL_MODULES = [
  { id: "lead-funnel", label: "Lead capture funnel", description: "Landing page, qualification questions, and conversion CTA." },
  { id: "crm-admin", label: "Admin portal + CRM", description: "Lead pipeline, contacts, follow-up status, and role-aware admin area." },
  { id: "bid-generator", label: "AI bid / estimate generator", description: "Scope-aware estimate draft with assumptions and owner approval." },
  { id: "invoice-generator", label: "Invoice generator", description: "Itemized invoice draft, payment terms, and status tracking." },
  { id: "booking", label: "Booking / consultation flow", description: "Appointment or consultation request matched to the industry." },
  { id: "local-pages", label: "Location landing pages", description: "Distinct local pages only for verified service areas." },
  { id: "template-library", label: "Reusable template library", description: "Save the approved industry template and brand tokens for reuse." },
  { id: "analytics", label: "Analytics + conversion events", description: "Track key CTA, form, booking, and funnel events." },
];

export default function WebsiteStep({ accent, vision, strategy, nameData, brandData, templateData, onApprove }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [approvedDesignContext, setApprovedDesignContext] = useState(null);
  const [error, setError] = useState(null);
  const [extraPages, setExtraPages] = useState("About, Contact, FAQs");
  const [imageCount, setImageCount] = useState(6);
  const [modules, setModules] = useState(["lead-funnel", "crm-admin", "template-library"]);
  const [seo, setSeo] = useState(true);
  const [aeo, setAeo] = useState(true);
  const [geo, setGeo] = useState(true);

  const industryProfile = getIndustryBuildProfile(
    vision?.industry || vision?.industryLabel || vision?.industryProfile?.label
  );
  const industry = vision?.industryLabel || vision?.industryProfile?.label || strategy?.industry || strategy?.name || vision?.type || "General Business";
  const palette = brandData?.palette || {};
  const selectedTemplate = templateData?.template || templateData || {};

  const toggleModule = (id) => {
    setModules((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const designContext = {
        industryId: industryProfile.id,
        industryLabel: industry,
        industryProfile,
        brandPalette: {
          name: palette.name || "Electric Midnight",
          primary: palette.primary || "#05070B",
          surface: palette.surface || "#0B1220",
          ink: palette.ink || "#FFFFFF",
          muted: palette.muted || "#9AAAC0",
          accent: palette.accent || accent,
          accent2: palette.accent2 || "#00D4FF",
          gradient: palette.gradient || "linear-gradient(115deg,#176BFF 0%,#00D4FF 100%)",
          mood: palette.mood || "futuristic, precise, premium",
        },
        selectedTemplate: {
          name: selectedTemplate.name || selectedTemplate.template_id || "AI-selected industry template",
          layout: selectedTemplate.layout || "industry-optimized responsive layout",
          tone: selectedTemplate.tone || "",
        },
        requestedPages: extraPages.split(",").map((page) => page.trim()).filter(Boolean),
        targetImageCount: imageCount,
        requestedModules: OPTIONAL_MODULES.filter((item) => modules.includes(item.id)).map((item) => ({ id: item.id, name: item.label, requirements: item.description })),
        optimization: { seo, aeo, geo },
        requirements: [
          "All imagery and copy must be specific to the selected industry, target audience, business name, and supplied location/context.",
          "Generate distinct image prompts for the logo and each major image; do not repeat one generic image across unrelated sections.",
          "Do not invent reviews, credentials, service areas, statistics, prices, licenses, awards, or customer results.",
          "Treat CRM, admin, estimates, invoices, booking, and analytics as integrations requiring real data models, authentication, and server-side authorization; never imply a front-end mock is production connected.",
          seo ? "SEO: unique title/meta direction, semantic heading plan, internal links, descriptive image alt text, crawlable page structure." : "",
          aeo ? "AEO: answer-first FAQs, concise definitions, well-structured question/answer content, suitable schema recommendations." : "",
          geo ? "GEO/local: verified business entity details, local intent, consistent NAP only when provided, and unique location content." : "",
        ].filter(Boolean),
      };
      setApprovedDesignContext(designContext);
      const res = await base44.functions.invoke("generateWebsite", {
        businessName: nameData?.name || "",
        businessWebsiteUrl: "",
        industry,
        goal: vision?.statement || "",
        tone: "professional",
        designContext,
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = () => onApprove({ website: result, designContext: approvedDesignContext });

  return (
    <AutoStepShell
      step={7}
      accent={accent}
      title="Industry-Optimized Website"
      subtitle={`Build a ${industry} experience with matching visuals, conversion strategy, and SEO/AEO/GEO requirements.`}
      onApprove={result ? handleApprove : undefined}
      approveLabel="Approve Website"
      canApprove={!!result}
    >
      {!result && !loading && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-700 bg-slate-950 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-white"><Layers className="h-4 w-4" style={{ color: accent }} /> Generation brief</div>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{industryProfile.visual}</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-400"><strong className="text-slate-200">Trust:</strong> {industryProfile.proof}</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-400"><strong className="text-slate-200">Conversion:</strong> {industryProfile.conversion}</p>
          </div>

          <div>
            <label htmlFor="extra-pages" className="mb-2 block text-sm font-semibold text-slate-100">Additional pages / sections</label>
            <input id="extra-pages" value={extraPages} onChange={(event) => setExtraPages(event.target.value)} placeholder="About, Contact, FAQs, Pricing, Portfolio" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2" style={{ "--tw-ring-color": accent }} />
            <p className="mt-1.5 text-xs text-slate-400">Separate items with commas. Existing core pages are preserved.</p>
          </div>

          <div>
            <label htmlFor="target-images" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-100"><ImageIcon className="h-4 w-4" style={{ color: accent }} /> Target image assets: <span className="text-white">{imageCount}</span></label>
            <input id="target-images" type="range" min="3" max="16" value={imageCount} onChange={(event) => setImageCount(Number(event.target.value))} className="w-full" style={{ accentColor: accent }} />
            <div className="flex justify-between text-[11px] text-slate-500"><span>3 core images</span><span>16 extended library</span></div>
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-100"><Workflow className="h-4 w-4" style={{ color: accent }} /> Optional system modules</div>
            <div className="grid gap-2 sm:grid-cols-2">
              {OPTIONAL_MODULES.map((item) => {
                const checked = modules.includes(item.id);
                return (
                  <button key={item.id} type="button" aria-pressed={checked} onClick={() => toggleModule(item.id)} className={`rounded-xl border p-3 text-left transition ${checked ? "border-blue-400/70 bg-blue-400/10" : "border-slate-700 bg-slate-950 hover:border-slate-500"}`}>
                    <span className="flex items-center justify-between gap-2 text-sm font-semibold text-slate-100">{item.label}{checked && <Check className="h-4 w-4 shrink-0" style={{ color: accent }} />}</span>
                    <span className="mt-1 block text-xs leading-relaxed text-slate-400">{item.description}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-slate-500">Module selection shapes the generated blueprint. Connected production behavior still requires its backend, database entities, authentication, and QA gates.</p>
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-100"><Search className="h-4 w-4" style={{ color: accent }} /> Search visibility requirements</div>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "seo", label: "SEO" , value: seo, set: setSeo },
                { id: "aeo", label: "AEO / answer engines", value: aeo, set: setAeo },
                { id: "geo", label: "GEO / local discovery", value: geo, set: setGeo },
              ].map((item) => (
                <button key={item.id} type="button" aria-pressed={item.value} onClick={() => item.set(!item.value)} className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${item.value ? "border-blue-400/60 bg-blue-400/10 text-blue-100" : "border-slate-700 bg-slate-950 text-slate-400"}`}>
                  {item.value ? "✓ " : ""}{item.label}
                </button>
              ))}
            </div>
          </div>

          <button type="button" onClick={generate} className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition hover:brightness-110" style={{ background: palette.gradient || "linear-gradient(110deg,#176BFF,#00D4FF)" }}>
            <Globe className="h-4 w-4" /> Generate industry-specific website
          </button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center py-12">
          <Loader2 className="mb-3 h-8 w-8 animate-spin" style={{ color: accent }} />
          <p className="text-sm text-slate-300">Generating industry-specific copy, image prompts, conversion sections, and search visibility guidance…</p>
        </div>
      )}

      {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}

      {result && (
        <div className="space-y-4">
          {result.content?.hero && (
            <div className="rounded-xl border border-slate-700 bg-slate-950 p-4">
              <div className="mb-1 text-xs font-bold uppercase text-slate-400">Hero</div>
              <h3 className="text-lg font-bold text-white">{result.content.hero.headline}</h3>
              <p className="text-sm text-slate-300">{result.content.hero.subheadline}</p>
            </div>
          )}
          {result.content?.services?.length > 0 && (
            <div className="rounded-xl border border-slate-700 bg-slate-950 p-4">
              <div className="mb-2 text-xs font-bold uppercase text-slate-400">Services ({result.content.services.length})</div>
              {result.content.services.slice(0, 6).map((service, index) => <div key={index} className="mb-1 text-sm text-slate-200">• {service.title}</div>)}
            </div>
          )}
          <div className="rounded-xl border border-slate-700 bg-slate-950 p-4">
            <div className="text-xs font-bold uppercase text-slate-400">Generation quality gates</div>
            <p className="mt-2 text-sm text-slate-300">Review the generated facts, industry fit, image prompts, metadata, and selected modules before publication. No invented claims should pass approval.</p>
          </div>
          <p className="text-xs text-slate-400">Blueprint generated. Continue to content review, compliance checks, and launch approval.</p>
        </div>
      )}
    </AutoStepShell>
  );
}
