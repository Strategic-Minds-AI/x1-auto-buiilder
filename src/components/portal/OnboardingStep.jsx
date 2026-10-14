import { useState } from "react";
import { Search, Globe, Building2 } from "lucide-react";

const industries = [
  "Legal", "Real Estate", "Epoxy Flooring", "Roofing", "HVAC", "Plumbing", "Electrical",
  "Med Spa", "Dental", "Chiropractic", "Remodeling", "Landscaping", "Solar", "Pest Control",
  "Moving", "Auto Detailing", "Restaurants", "Insurance", "Mortgage", "Cleaning Services",
];

export default function OnboardingStep({ onGenerate }) {
  const [url, setUrl] = useState("");
  const [industry, setIndustry] = useState(industries[0]);
  const [name, setName] = useState("");

  const submit = (e) => {
    e.preventDefault();
    let cleanUrl = url.trim();
    if (cleanUrl && !/^https?:\/\//.test(cleanUrl)) cleanUrl = "https://" + cleanUrl;
    onGenerate({ businessWebsiteUrl: cleanUrl, industry, businessName: name });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="font-display font-bold text-3xl sm:text-4xl">Generate Your Website</h1>
        <p className="mt-3 text-muted-foreground">
          Enter your business website and industry. Our universal generator researches your business, benchmarks the
          top sites in your industry, and builds an original high-converting website blueprint.
        </p>
      </div>

      <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-5">
        <label className="block">
          <span className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Business Website</span>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              placeholder="yourbusiness.com"
              className="dd-input pl-10"
            />
          </div>
        </label>

        <label className="block">
          <span className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Business Name (optional)</span>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Acme Epoxy Co."
              className="dd-input pl-10"
            />
          </div>
        </label>

        <label className="block">
          <span className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Industry</span>
          <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="dd-input">
            {industries.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-accent-foreground hover:brightness-110 transition"
        >
          <Search className="w-4 h-4" /> Research & Generate
        </button>

        <p className="text-xs text-muted-foreground text-center">
          We research your existing site and top industry sites for design guidance. All generated content is original.
        </p>
      </form>
    </div>
  );
}