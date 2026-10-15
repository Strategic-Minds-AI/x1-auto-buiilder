import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { industries } from "@/data/industries";
import LocationPicker from "@/components/masslaunch/LocationPicker";
import CompliancePanel from "@/components/masslaunch/CompliancePanel";
import {
  Rocket, Globe, Building2, Search, Loader2, CheckCircle2, Library,
  CheckSquare, Square, Layers, ShieldCheck,
} from "lucide-react";

const goals = ["More qualified leads", "Online bookings", "Phone calls", "Quote requests", "Brand awareness"];
const tones = ["Professional", "Friendly", "Premium", "Approachable", "Bold"];

export default function MassLaunchConsoleV2({ onDone }) {
  const [mode, setMode] = useState("generate"); // "generate" | "existing"
  const [form, setForm] = useState({
    businessName: "",
    businessWebsiteUrl: "",
    industry: industries[0],
    tone: tones[0],
    goal: goals[0],
  });
  const [industryQuery, setIndustryQuery] = useState("");
  const [locations, setLocations] = useState([]);
  const [launching, setLaunching] = useState(false);
  const [generatedProjects, setGeneratedProjects] = useState([]);
  const [existingProjects, setExistingProjects] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (mode === "existing") loadExisting();
  }, [mode]);

  const loadExisting = async () => {
    try {
      const res = await base44.entities.WebsiteProject.filter(
        { status: { $in: ["generated", "preview_ready", "approved"] } },
        { sort: "-created_date", limit: 50 }
      );
      setExistingProjects(res.items || []);
    } catch { setExistingProjects([]); }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const launch = async () => {
    if (!form.businessWebsiteUrl || !form.industry || locations.length === 0) return;
    setLaunching(true); setError("");
    try {
      const res = await base44.functions.invoke("massLaunch", {
        businessWebsiteUrl: form.businessWebsiteUrl,
        industry: form.industry,
        businessName: form.businessName,
        locations,
        tone: form.tone,
        goal: form.goal,
      });
      setGeneratedProjects(res.data.projects || []);
      setSelectedIds((res.data.projects || []).map((p) => p.id));
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Launch failed");
    } finally {
      setLaunching(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const selectAllGenerated = () => {
    const allIds = generatedProjects.map((p) => p.id);
    const allSelected = allIds.every((id) => selectedIds.includes(id));
    setSelectedIds(allSelected ? selectedIds.filter((id) => !allIds.includes(id)) : [...new Set([...selectedIds, ...allIds])]);
  };

  const selectAllExisting = () => {
    const allIds = existingProjects.map((p) => p.id);
    const allSelected = allIds.every((id) => selectedIds.includes(id));
    setSelectedIds(allSelected ? selectedIds.filter((id) => !allIds.includes(id)) : [...new Set([...selectedIds, ...allIds])]);
  };

  const allProjects = [...generatedProjects, ...existingProjects];
  const projectMap = Object.fromEntries(allProjects.map((p) => [p.id, p]));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl flex items-center gap-2">
          <Rocket className="w-6 h-6 text-primary" /> Mass Launch Console
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Generate location-tailored sites, run Google compliance checks, auto-fix to meet standards, and batch-deploy to Vercel.
        </p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode("generate")}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${mode === "generate" ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:text-foreground"}`}
        >
          <Rocket className="w-4 h-4" /> Generate New Sites
        </button>
        <button
          onClick={() => setMode("existing")}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${mode === "existing" ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:text-foreground"}`}
        >
          <Library className="w-4 h-4" /> Select Existing Projects
        </button>
      </div>

      {/* Generate mode */}
      {mode === "generate" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Source Business</div>
            <Field label="Business Name" icon={Building2}>
              <input value={form.businessName} onChange={set("businessName")} placeholder="Acme Epoxy Co." className="dd-input pl-10" />
            </Field>
            <Field label="Business Website" icon={Globe}>
              <input value={form.businessWebsiteUrl} onChange={set("businessWebsiteUrl")} placeholder="yourbusiness.com" className="dd-input pl-10" />
            </Field>
            <div>
              <span className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Industry</span>
              <input value={industryQuery} onChange={(e) => setIndustryQuery(e.target.value)} placeholder="Search industries..." className="dd-input mb-2" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
                {industries.filter((i) => i.toLowerCase().includes(industryQuery.trim().toLowerCase())).map((ind) => (
                  <button key={ind} type="button" onClick={() => setForm({ ...form, industry: ind })}
                    className={`rounded-xl border px-3 py-2 text-sm text-left transition ${form.industry === ind ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}>
                    {ind}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Goal</span>
                <select value={form.goal} onChange={set("goal")} className="dd-input">{goals.map((g) => <option key={g}>{g}</option>)}</select>
              </div>
              <div>
                <span className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Tone</span>
                <select value={form.tone} onChange={set("tone")} className="dd-input">{tones.map((t) => <option key={t}>{t}</option>)}</select>
              </div>
            </div>
            <button
              onClick={launch}
              disabled={launching || !form.businessWebsiteUrl || locations.length === 0}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-bold text-accent-foreground disabled:opacity-50"
            >
              {launching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
              Launch {locations.length} Site{locations.length === 1 ? "" : "s"}
            </button>
            {error && <div className="rounded-lg border border-destructive/40 bg-destructive/10 text-destructive text-sm p-3">{error}</div>}
          </div>

          <LocationPicker selected={locations} onChange={setLocations} />
        </div>
      )}

      {/* Existing mode */}
      {mode === "existing" && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <Library className="w-3.5 h-3.5" /> Existing Projects
            </div>
            <button onClick={selectAllExisting} className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:brightness-110">
              {existingProjects.length > 0 && existingProjects.every((p) => selectedIds.includes(p.id)) ? <Square className="w-3.5 h-3.5" /> : <CheckSquare className="w-3.5 h-3.5" />}
              Select All
            </button>
          </div>
          {existingProjects.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No existing projects. Generate new sites first.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-96 overflow-y-auto">
              {existingProjects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => toggleSelect(p.id)}
                  className={`flex items-start gap-2 rounded-xl border p-3 text-left transition ${selectedIds.includes(p.id) ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"}`}
                >
                  {selectedIds.includes(p.id) ? <CheckSquare className="w-4 h-4 text-primary shrink-0 mt-0.5" /> : <Square className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />}
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">{p.business_name || p.industry}</div>
                    <div className="text-xs text-muted-foreground">{p.industry} {p.location ? `· ${p.location}` : ""}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Generated projects */}
      {generatedProjects.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> Generated Sites ({generatedProjects.length})
            </div>
            <button onClick={selectAllGenerated} className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:brightness-110">
              {generatedProjects.length > 0 && generatedProjects.every((p) => selectedIds.includes(p.id)) ? <Square className="w-3.5 h-3.5" /> : <CheckSquare className="w-3.5 h-3.5" />}
              Select All
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-80 overflow-y-auto">
            {generatedProjects.map((p) => (
              <button
                key={p.id}
                onClick={() => toggleSelect(p.id)}
                className={`flex items-start gap-2 rounded-xl border p-3 text-left transition ${selectedIds.includes(p.id) ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"}`}
              >
                {selectedIds.includes(p.id) ? <CheckSquare className="w-4 h-4 text-primary shrink-0 mt-0.5" /> : <Square className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />}
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">{p.location || p.industry}</div>
                  <div className="text-xs text-muted-foreground truncate">{p.content?.hero?.headline}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected count + Compliance */}
      {selectedIds.length > 0 && (
        <>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span className="font-semibold">{selectedIds.length} project{selectedIds.length === 1 ? "" : "s"} selected</span>
            <span className="text-muted-foreground">for compliance check and deployment</span>
          </div>
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
            <div className="text-xs font-semibold text-primary uppercase tracking-wide mb-4 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Google Compliance Engine
            </div>
            <CompliancePanel projectIds={selectedIds} onDeployed={onDone} />
          </div>
        </>
      )}
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