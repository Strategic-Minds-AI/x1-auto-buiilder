import { Image } from "@/components/ui/image";
import { RefreshCw, Save, CheckCircle2 } from "lucide-react";

export default function AssetStudio({ assets, loading, onRegenerate, onSave, saving, saved }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div>
        <h2 className="font-display font-bold text-2xl sm:text-3xl">Your Brand Assets</h2>
        <p className="text-muted-foreground mt-1">AI-generated logo and hero image for your new website.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="text-xs font-semibold text-primary uppercase tracking-wide mb-3">Logo</div>
          <div className="aspect-square rounded-xl bg-background/60 border border-border flex items-center justify-center overflow-hidden">
            {loading && !assets.logoUrl ? (
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            ) : assets.logoUrl ? (
              <Image src={assets.logoUrl} alt="Generated logo" className="w-full h-full object-contain" />
            ) : (
              <span className="text-sm text-muted-foreground">Not generated yet</span>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="text-xs font-semibold text-primary uppercase tracking-wide mb-3">Hero Image</div>
          <div className="aspect-video rounded-xl bg-background/60 border border-border flex items-center justify-center overflow-hidden">
            {loading && !assets.heroImageUrl ? (
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            ) : assets.heroImageUrl ? (
              <Image src={assets.heroImageUrl} alt="Generated hero" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm text-muted-foreground">Not generated yet</span>
            )}
          </div>
        </div>
      </div>

      {assets.logoError && <p className="text-sm text-destructive">Logo: {assets.logoError}</p>}
      {assets.heroError && <p className="text-sm text-destructive">Hero: {assets.heroError}</p>}

      <div className="flex flex-wrap gap-3">
        <button
          onClick={onRegenerate}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-secondary transition disabled:opacity-60"
        >
          <RefreshCw className="w-4 h-4" /> Regenerate
        </button>
        <button
          onClick={onSave}
          disabled={saving || saved}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground hover:brightness-110 transition disabled:opacity-60"
        >
          {saved ? (
            <><CheckCircle2 className="w-4 h-4" /> Saved</>
          ) : saving ? (
            "Saving..."
          ) : (
            <><Save className="w-4 h-4" /> Save Project</>
          )}
        </button>
      </div>
    </div>
  );
}