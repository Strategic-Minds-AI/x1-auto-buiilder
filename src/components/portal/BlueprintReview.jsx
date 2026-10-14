import { Sparkles, Save } from "lucide-react";

export default function BlueprintReview({ result, onGenerateAssets, loadingAssets, onSave, saving }) {
  const { businessResearch, benchmark, content } = result;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div>
        <h2 className="font-display font-bold text-2xl sm:text-3xl">Your Website Blueprint</h2>
        <p className="text-muted-foreground mt-1">
          Review the generated content and design direction, then generate your logo and hero image.
        </p>
      </div>

      <Card title="Business Research" subtitle="Extracted from your website">
        {businessResearch?.error ? (
          <p className="text-sm text-destructive">{businessResearch.error}</p>
        ) : (
          <div className="space-y-2 text-sm">
            <Row label="Business" value={businessResearch?.businessName || "—"} />
            <Row label="Tagline" value={businessResearch?.tagline || "—"} />
            <Row label="Tone" value={businessResearch?.tone || "—"} />
            <Row label="Service area" value={businessResearch?.serviceArea || "—"} />
            {businessResearch?.services?.length > 0 && (
              <div className="flex gap-2">
                <span className="text-muted-foreground min-w-[110px]">Services:</span>
                <span>{businessResearch.services.join(", ")}</span>
              </div>
            )}
            {businessResearch?.differentiators?.length > 0 && (
              <div className="flex gap-2">
                <span className="text-muted-foreground min-w-[110px]">Differentiators:</span>
                <span>{businessResearch.differentiators.join(", ")}</span>
              </div>
            )}
          </div>
        )}
      </Card>

      {benchmark?.topSites?.length > 0 && (
        <Card title="Industry Benchmark" subtitle="Top-rated sites used as design guidance (not copied)">
          <div className="space-y-2">
            {benchmark.topSites.map((s, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className="text-primary font-semibold">{i + 1}.</span>
                <div>
                  <span className="font-medium text-foreground">{s.name}</span>
                  <span className="text-muted-foreground"> — {s.designNotes}</span>
                </div>
              </div>
            ))}
          </div>
          {benchmark.designGuidance && (
            <div className="mt-4 pt-4 border-t border-border space-y-2 text-sm">
              <Row label="Palette" value={benchmark.designGuidance.colorPalette} />
              <Row label="Typography" value={benchmark.designGuidance.typography} />
              <Row label="Hero pattern" value={benchmark.designGuidance.heroPattern} />
              {benchmark.designGuidance.sectionOrder?.length > 0 && (
                <Row label="Section order" value={benchmark.designGuidance.sectionOrder.join(" → ")} />
              )}
            </div>
          )}
        </Card>
      )}

      {content && (
        <>
          <Card title="Generated Website Content" subtitle="Original copy ready for your new site">
            <div className="space-y-5">
              <div>
                <div className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">Hero</div>
                <div className="text-xl font-display font-bold text-foreground">{content.hero?.headline}</div>
                <div className="text-sm text-muted-foreground mt-1">{content.hero?.subheadline}</div>
                <div className="flex gap-2 mt-2">
                  <span className="rounded-full bg-accent/15 text-accent text-xs font-semibold px-3 py-1">
                    {content.hero?.primaryCta}
                  </span>
                  {content.hero?.secondaryCta && (
                    <span className="rounded-full border border-border text-muted-foreground text-xs font-semibold px-3 py-1">
                      {content.hero.secondaryCta}
                    </span>
                  )}
                </div>
              </div>

              {content.services?.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Services</div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {content.services.map((s, i) => (
                      <div key={i} className="rounded-lg border border-border p-3">
                        <div className="text-sm font-semibold text-foreground">{s.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{s.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {content.about && (
                <div>
                  <div className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">About</div>
                  <div className="text-sm font-semibold text-foreground">{content.about.headline}</div>
                  <div className="text-sm text-muted-foreground mt-1">{content.about.body}</div>
                </div>
              )}

              {content.faqs?.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">FAQs</div>
                  <div className="space-y-2">
                    {content.faqs.map((f, i) => (
                      <div key={i}>
                        <div className="text-sm font-semibold text-foreground">{f.question}</div>
                        <div className="text-xs text-muted-foreground">{f.answer}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card title="Design Direction" subtitle="Recommended color tokens">
            {content.colorTokens && (
              <div className="flex flex-wrap gap-4">
                {["primary", "accent", "background"].map((k) => (
                  <div key={k} className="flex items-center gap-2">
                    <span
                      className="w-8 h-8 rounded-lg border border-border"
                      style={{ background: content.colorTokens[k] }}
                    />
                    <span className="text-xs text-muted-foreground">{k}: {content.colorTokens[k]}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          onClick={onGenerateAssets}
          disabled={loadingAssets}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground hover:brightness-110 transition disabled:opacity-60"
        >
          {loadingAssets ? (
            <><span className="w-4 h-4 border-2 border-accent-foreground/40 border-t-accent-foreground rounded-full animate-spin" /> Generating...</>
          ) : (
            <><Sparkles className="w-4 h-4" /> Generate Logo & Hero Image</>
          )}
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-secondary transition disabled:opacity-60"
        >
          {saving ? "Saving..." : <><Save className="w-4 h-4" /> Save Project</>}
        </button>
      </div>
    </div>
  );
}

function Card({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-4">
        <h3 className="font-display font-bold text-lg text-foreground">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex gap-2">
      <span className="text-muted-foreground min-w-[110px]">{label}:</span>
      <span className="text-foreground">{value || "—"}</span>
    </div>
  );
}