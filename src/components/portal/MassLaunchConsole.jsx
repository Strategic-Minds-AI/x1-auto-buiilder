import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { industries } from "@/data/industries";
import { Rocket, Globe, Building2, MapPin, Target, Search, CheckCircle2, Library } from "lucide-react";

const goals = ["More qualified leads", "Online bookings", "Phone calls", "Quote requests", "Brand awareness"];
const tones = ["Professional", "Friendly", "Premium", "Approachable", "Bold"];

const phases = [
  "Skip-tracing your business",
  "Benchmarking top 5 industry sites",
  "Generating location-tailored websites",
  "Saving campaign",
];

export default function MassLaunchConsole({ onDone }) {
  const [form, setForm] = useState({
    businessName: "",
    businessWebsiteUrl: "",
    industry: industries[0],
    locationsText: "",
    tone: tones[0],
    goal: goals[0],
  });
  const [industryQuery, setIndustryQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const locations = form.locationsText.split("\n").map((s) => s.trim()).filter(Boolean);

  const launch = async () => {
    if (!form.businessWebsiteUrl || !form.industry || locations.length === 0) return;
    setLoading(true);
    setPhase(0);
    setError(null);
    setResult(null);
    const t1 = setTimeout(() => setPhase(1), 5000);
    const t2 = setTimeout(() => setPhase(2), 14000);
    const t3 = setTimeout(() => setPhase(3), 22000);
    try {
      const res = await base44.functions.invoke("massLaunch", {
        businessWebsiteUrl: form.businessWebsiteUrl,
        industry: form.industry,
        businessName: form.businessName,
        locations,
        tone: form.tone,
        goal: form.goal,
      });
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      setResult(res.data);
    } catch (err) {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      setError(err.response?.data?.error || err.message || "Launch failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex w-16 h-16 rounded-2xl bg-primary/15 items-center justify-center mb-6">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
        <h2 className="font-display font-bold text-2xl mb-2">Launching {locations.length} websites</h2>
        <p className="text-muted-foreground mb-10">Skip-tracing, benchmarking, and generating original content per market.</p>
        <div className="space-y-3 text-left">
          {phases.map((p, i) => (
            <div
              key={p}
              className={`flex items-center gap-3 rounded-xl border p-4 transition ${
                i < phase ? "border-border bg-card opacity-80" : i === phase ? "border-primary/40 bg-primary/5" : "border-border bg-card opacity-40"
              }`}
            >
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${i <= phase ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}>
                {i < phase ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </span>
              <span className="text-sm font-semibold">{p}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-primary/15 items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-primary" />
          </div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl">Campaign Launched</h2>
          <p className="text-muted-foreground mt-1">
            {result.projects.length} location-tailored websites generated for {result.campaign.industry}.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 mb-6">
          <div className="text-sm font-semibold text-foreground mb-3">{result.campaign.name}</div>
          <div className="flex flex-wrap gap-2">
            {result.campaign.locations?.map((loc) => (
              <span key={loc} className="rounded-full bg-primary/10 text-primary text-xs font-semibold px-3 py-1">
                {loc}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-3 mb-8">
          {result.projects.map((p) => (
            <div key={p.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">{p.location}</span>
              </div>
              <div className="text-base font-display font-bold text-foreground">{p.content?.hero?.headline}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{p.content?.hero?.subheadline}</div>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-3">
          <button
            onClick={() => { setResult(null); }}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground hover:brightness-110 transition"
          >
            <Rocket className="w-4 h-4" /> New Campaign
          </button>
          <button
            onClick={onDone}
            className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-secondary transition"
          >
            <Library className="w-4 h-4" /> View All Campaigns
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="font-display font-bold text-3xl sm:text-4xl flex items-center justify-center gap-2">
          <Rocket className="w-7 h-7 text-primary" /> Mass Launch
        </h1>
        <p className="mt-2 text-muted-foreground">
          Skip-trace your business once, benchmark the top 5 sites in your industry, then generate a strategically
          location-tailored website for every market you list — all original content.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive text-sm p-3">{error}</div>
      )}

      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-5">
        <Field label="Business Name" icon={Building2}>
          <input value={form.businessName} onChange={set("businessName")} placeholder="Acme Epoxy Co." className="dd-input pl-10" />
        </Field>
        <Field label="Business Website" icon={Globe}>
          <input value={form.businessWebsiteUrl} onChange={set("businessWebsiteUrl")} placeholder="yourbusiness.com" className="dd-input pl-10" />
        </Field>

        <div>
          <span className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Industry</span>
          <input value={industryQuery} onChange={(e) => setIndustryQuery(e.target.value)} placeholder="Search industries..." className="dd-input mb-2" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
            {industries.filter((i) => i.toLowerCase().includes(industryQuery.trim().toLowerCase())).map((ind) => (
              <button
                key={ind}
                type="button"
                onClick={() => setForm({ ...form, industry: ind })}
                className={`rounded-xl border px-3 py-2 text-sm text-left transition ${
                  form.industry === ind ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {ind}
              </button>
            ))}
          </div>
        </div>

        <label className="block">
          <span className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Target Locations (one per line)</span>
          <textarea
            value={form.locationsText}
            onChange={set("locationsText")}
            rows={5}
            placeholder={"Miami, FL\nFort Lauderdale, FL\nWest Palm Beach, FL\nOrlando, FL\nTampa, FL"}
            className="dd-input resize-y"
          />
          <span className="text-xs text-muted-foreground mt-1 block">{locations.length} location{locations.length === 1 ? "" : "s"} ready</span>
        </label>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <span className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Goal</span>
            <select value={form.goal} onChange={set("goal")} className="dd-input">
              {goals.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <span className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Tone</span>
            <select value={form.tone} onChange={set("tone")} className="dd-input">
              {tones.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <button
          onClick={launch}
          disabled={!form.businessWebsiteUrl || locations.length === 0}
          className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-accent-foreground hover:brightness-110 transition disabled:opacity-50"
        >
          <Rocket className="w-4 h-4" /> Launch {locations.length || ""} Websites
        </button>
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