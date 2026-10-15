import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Send, Search, Sparkles, Globe, Rocket, CheckCircle2 } from "lucide-react";

// Command panel — sends commands to the generator functions and logs each
// one as a SyncReceipt so it shows up in the live feed alongside external
// GPT-driven commands.
export default function SyncCommandPanel({ onCommandComplete }) {
  const [tab, setTab] = useState("templates");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const [tplForm, setTplForm] = useState({ industry: "" });
  const [assetForm, setAssetForm] = useState({ logoPrompt: "", heroImagePrompt: "" });
  const [webForm, setWebForm] = useState({ businessWebsiteUrl: "", industry: "", businessName: "" });
  const [launchForm, setLaunchForm] = useState({ businessWebsiteUrl: "", industry: "", businessName: "", locations: "", campaignName: "" });

  const logReceipt = async (entity, status, summary) => {
    try {
      await base44.entities.SyncReceipt.create({
        receipt_id: crypto.randomUUID(),
        idempotency_key: "",
        action: "execute",
        entity,
        operation: entity,
        status,
        record_id: "",
        summary: String(summary).slice(0, 400),
      });
    } catch {}
  };

  const send = async (funcName, payload, entityLabel) => {
    setSending(true); setError(""); setResult(null);
    try {
      const res = await base44.functions.invoke(funcName, payload);
      setResult(res.data);
      await logReceipt(entityLabel, "success", `${funcName} completed successfully`);
      onCommandComplete();
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Command failed";
      setError(msg);
      await logReceipt(entityLabel, "error", msg);
      onCommandComplete();
    } finally {
      setSending(false);
    }
  };

  const tabs = [
    { key: "templates", label: "Refine Templates", icon: Search },
    { key: "assets", label: "Refine Brand Assets", icon: Sparkles },
    { key: "website", label: "Generate Website", icon: Globe },
    { key: "launch", label: "Mass Launch", icon: Rocket },
  ];

  const switchTab = (k) => { setTab(k); setResult(null); setError(""); };

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
        <Send className="w-3.5 h-3.5" /> Command Panel
      </div>

      <div className="flex gap-1 mb-4 flex-wrap">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => switchTab(t.key)} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${tab === t.key ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:text-foreground"}`}>
              <Icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === "templates" && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Re-research the top 5 sites for an industry and refresh your template library with updated design analysis.</p>
          <input className="dd-input" placeholder="Industry (e.g. Roofing, HVAC, Dental)" value={tplForm.industry} onChange={(e) => setTplForm({ ...tplForm, industry: e.target.value })} />
          <SendBtn onClick={() => send("researchIndustryTemplates", { industry: tplForm.industry }, "researchIndustryTemplates")} disabled={sending || !tplForm.industry} sending={sending} icon={Search} label="Refine Templates" />
        </div>
      )}

      {tab === "assets" && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Generate new brand assets — a logo and hero image — from your prompts.</p>
          <textarea className="dd-input" rows={2} placeholder="Logo prompt — describe style, colors, mood" value={assetForm.logoPrompt} onChange={(e) => setAssetForm({ ...assetForm, logoPrompt: e.target.value })} />
          <textarea className="dd-input" rows={2} placeholder="Hero image prompt — describe the scene" value={assetForm.heroImagePrompt} onChange={(e) => setAssetForm({ ...assetForm, heroImagePrompt: e.target.value })} />
          <SendBtn onClick={() => send("generateAssets", assetForm, "generateAssets")} disabled={sending || !assetForm.logoPrompt} sending={sending} icon={Sparkles} label="Generate Assets" />
        </div>
      )}

      {tab === "website" && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Generate a full website blueprint from a business URL and industry.</p>
          <input className="dd-input" placeholder="Business website URL" value={webForm.businessWebsiteUrl} onChange={(e) => setWebForm({ ...webForm, businessWebsiteUrl: e.target.value })} />
          <input className="dd-input" placeholder="Industry" value={webForm.industry} onChange={(e) => setWebForm({ ...webForm, industry: e.target.value })} />
          <input className="dd-input" placeholder="Business name (optional)" value={webForm.businessName} onChange={(e) => setWebForm({ ...webForm, businessName: e.target.value })} />
          <SendBtn onClick={() => send("generateWebsite", webForm, "generateWebsite")} disabled={sending || !webForm.businessWebsiteUrl || !webForm.industry} sending={sending} icon={Globe} label="Generate Website" />
        </div>
      )}

      {tab === "launch" && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Launch location-tailored website variants across multiple markets.</p>
          <input className="dd-input" placeholder="Business website URL" value={launchForm.businessWebsiteUrl} onChange={(e) => setLaunchForm({ ...launchForm, businessWebsiteUrl: e.target.value })} />
          <input className="dd-input" placeholder="Industry" value={launchForm.industry} onChange={(e) => setLaunchForm({ ...launchForm, industry: e.target.value })} />
          <input className="dd-input" placeholder="Business name (optional)" value={launchForm.businessName} onChange={(e) => setLaunchForm({ ...launchForm, businessName: e.target.value })} />
          <input className="dd-input" placeholder="Locations (comma-separated)" value={launchForm.locations} onChange={(e) => setLaunchForm({ ...launchForm, locations: e.target.value })} />
          <input className="dd-input" placeholder="Campaign name (optional)" value={launchForm.campaignName} onChange={(e) => setLaunchForm({ ...launchForm, campaignName: e.target.value })} />
          <SendBtn onClick={() => send("massLaunch", { ...launchForm, locations: launchForm.locations.split(",").map((s) => s.trim()).filter(Boolean) }, "massLaunch")} disabled={sending || !launchForm.businessWebsiteUrl || !launchForm.industry} sending={sending} icon={Rocket} label="Launch Campaign" />
        </div>
      )}

      {error && <div className="mt-3 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive text-sm p-3">{error}</div>}
      {result && (
        <div className="mt-3 rounded-lg border border-border bg-background/60 p-3">
          <div className="text-xs font-semibold text-emerald-400 mb-1 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Command completed</div>
          <pre className="text-[11px] font-mono text-muted-foreground overflow-x-auto max-h-40 overflow-y-auto">{JSON.stringify(result, null, 2).slice(0, 800)}</pre>
        </div>
      )}
    </div>
  );
}

function SendBtn({ onClick, disabled, sending, icon: Icon, label }) {
  return (
    <button onClick={onClick} disabled={disabled} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50">
      {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />} {label}
    </button>
  );
}