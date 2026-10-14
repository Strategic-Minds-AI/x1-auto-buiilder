import { useState } from "react";
import { Globe, Building2, MapPin, Target, ArrowRight, ArrowLeft, Check, Sparkles } from "lucide-react";

const industries = [
  "Accounting & Bookkeeping", "Advertising Agency", "AI Consultant", "Architecture", "Assisted Living",
  "Auto Detailing", "Auto Repair", "Aviation & Flight School", "Bakery", "Banking & Credit Union",
  "Bar & Nightclub", "Barbershop", "Bed & Breakfast", "Body Shop & Collision", "Branding & Design",
  "Business Coach", "Career Coaching", "Carpet Cleaning", "Catering", "Childcare & Daycare",
  "Chiropractic", "Cleaning Services", "Coffee Shop & Cafe", "College & University", "Construction",
  "Consulting", "Content Marketing", "Corporate Law", "Criminal Defense Law", "Dance Studio",
  "Deck & Patio", "Dental & Dentist", "Dermatology", "Ecommerce Store", "Electrical",
  "Email Marketing", "Engineering", "Environmental Services", "Epoxy Flooring", "Estate Planning Law",
  "Event Planning", "Family Law", "Fencing", "Financial Advisor", "Fitness & Gym",
  "Florist", "Flooring", "Food Truck", "Freight & Logistics", "Funeral Home",
  "Garage Door", "General Contractor", "Home Health Care", "Home Inspection", "HVAC",
  "Immigration Law", "Interior Design", "Investment Firm", "IP & Patent Law", "Janitorial",
  "Junk Removal", "Kitchen & Bath", "Landscaping", "Lawn Care", "Law Firm",
  "Life Coach", "Locksmith", "Manufacturing", "Marketing Agency", "Martial Arts",
  "Massage Therapy", "Med Spa & Aesthetics", "Mental Health & Therapy", "Mortgage & Lending", "Moving Company",
  "Nail Salon", "Nonprofit", "Optometry", "Orthodontics", "Painting",
  "Personal Injury Law", "Personal Training", "Pest Control", "Photography", "Physical Therapy",
  "Plastic Surgery", "Plumbing", "Pool & Spa", "Preschool", "Pressure Washing",
  "Primary Care Clinic", "PR & Communications", "Private School", "Property Management", "Public Relations",
  "Real Estate", "Real Estate Brokerage", "Remodeling", "Renewable Energy", "Restaurant",
  "Roofing", "SEO Agency", "Security Services", "Senior Care", "Septic Services",
  "Siding", "Social Media Agency", "Software & SaaS", "Solar", "Spa & Wellness",
  "Storage", "Tax Services", "Title Company", "Towing", "Tree Service",
  "Tutoring", "Urgent Care", "Vacation Rental", "Veterinary", "Videography",
  "Warehousing", "Wealth Management", "Web Design Agency", "Wedding Planning", "Windows & Doors",
  "Yoga Studio",
];
const goals = ["More qualified leads", "Online bookings", "Phone calls", "Quote requests", "Brand awareness"];
const tones = ["Professional", "Friendly", "Premium", "Approachable", "Bold"];

const stepLabels = ["Business", "Industry", "Markets", "Goals"];

export default function OnboardingWizard({ onComplete }) {
  const [step, setStep] = useState(0);
  const [industryQuery, setIndustryQuery] = useState("");
  const [data, setData] = useState({
    businessName: "",
    businessWebsiteUrl: "",
    industry: industries[0],
    serviceArea: "",
    goal: goals[0],
    tone: tones[0],
  });
  const set = (k) => (e) => setData({ ...data, [k]: e.target.value });
  const canNext = step === 0 ? data.businessName && data.businessWebsiteUrl : true;

  const next = () => (step < 3 ? setStep(step + 1) : onComplete(data));
  const back = () => setStep(Math.max(0, step - 1));

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="font-display font-bold text-3xl sm:text-4xl">Onboarding</h1>
        <p className="mt-2 text-muted-foreground">
          Answer a few questions and we'll skip-trace your business, analyze the top 5 sites in your industry, and
          build your website + template library.
        </p>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between mb-8 px-2">
        {stepLabels.map((label, i) => (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border transition ${
                  i < step
                    ? "bg-primary text-primary-foreground border-primary"
                    : i === step
                    ? "bg-accent text-accent-foreground border-accent"
                    : "bg-card text-muted-foreground border-border"
                }`}
              >
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-[11px] ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
            </div>
            {i < stepLabels.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 rounded ${i < step ? "bg-primary" : "bg-border"}`} />
            )}
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        {step === 0 && (
          <div className="space-y-5">
            <Field label="Business Name" icon={Building2}>
              <input value={data.businessName} onChange={set("businessName")} placeholder="Acme Epoxy Co." className="dd-input pl-10" />
            </Field>
            <Field label="Business Website" icon={Globe}>
              <input value={data.businessWebsiteUrl} onChange={set("businessWebsiteUrl")} placeholder="yourbusiness.com" className="dd-input pl-10" />
            </Field>
            <p className="text-xs text-muted-foreground">We'll skip-trace this site to extract your services, value props, and brand tone.</p>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground mb-1">Select your industry</p>
            <input
              value={industryQuery}
              onChange={(e) => setIndustryQuery(e.target.value)}
              placeholder="Search industries..."
              className="dd-input mb-1"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
              {industries
                .filter((ind) => ind.toLowerCase().includes(industryQuery.trim().toLowerCase()))
                .map((ind) => (
                  <button
                    key={ind}
                    type="button"
                    onClick={() => setData({ ...data, industry: ind })}
                    className={`rounded-xl border px-3 py-2.5 text-sm text-left transition ${
                      data.industry === ind ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {ind}
                  </button>
                ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">We'll analyze the top 5 rated sites in this industry for style, layout, SEO, AEO & GEO.</p>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <Field label="Service Area / Markets" icon={MapPin}>
              <input value={data.serviceArea} onChange={set("serviceArea")} placeholder="e.g. South Florida, 47 states, nationwide" className="dd-input pl-10" />
            </Field>
            <p className="text-xs text-muted-foreground">Optional. We'll also extract this from your website during skip-tracing.</p>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div>
              <p className="text-sm font-semibold text-foreground mb-2">Primary Goal</p>
              <div className="flex flex-wrap gap-2">
                {goals.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setData({ ...data, goal: g })}
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      data.goal === g ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground mb-2">Brand Tone</p>
              <div className="flex flex-wrap gap-2">
                {tones.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setData({ ...data, tone: t })}
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      data.tone === t ? "border-accent bg-accent/10 text-foreground" : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-7">
          <button
            type="button"
            onClick={back}
            disabled={step === 0}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition disabled:opacity-40"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <button
            type="button"
            onClick={next}
            disabled={step === 0 && !canNext}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground hover:brightness-110 transition disabled:opacity-50"
          >
            {step === 3 ? <><Sparkles className="w-4 h-4" /> Launch Research</> : <>Continue <ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, icon: Icon, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">{label}</span>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        {children}
      </div>
    </label>
  );
}