import { useState } from "react";
import { Sparkles, Save, Loader2, RefreshCw, Edit3, Check, X, Palette } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function BlueprintReview({ result, onGenerateAssets, loadingAssets, onSave, saving }) {
  const { businessResearch, benchmark, content: initialContent } = result;
  const [content, setContent] = useState(initialContent || {});
  const [editing, setEditing] = useState({});
  const [regenerating, setRegenerating] = useState({});
  const [editValues, setEditValues] = useState({});

  const updateContent = (newContent) => {
    setContent(newContent);
    result.content = newContent; // keep result in sync for save
  };

  const startEdit = (key, value) => {
    setEditing({ ...editing, [key]: true });
    setEditValues({ ...editValues, [key]: JSON.parse(JSON.stringify(value)) });
  };

  const saveEdit = (key) => {
    const newContent = { ...content };
    // Handle nested updates
    if (key.startsWith("hero.")) {
      const field = key.split(".")[1];
      newContent.hero = { ...newContent.hero, [field]: editValues[key] };
    } else if (key.startsWith("about.")) {
      const field = key.split(".")[1];
      newContent.about = { ...newContent.about, [field]: editValues[key] };
    } else if (key.startsWith("finalCta.")) {
      const field = key.split(".")[1];
      newContent.finalCta = { ...newContent.finalCta, [field]: editValues[key] };
    } else {
      newContent[key] = editValues[key];
    }
    updateContent(newContent);
    setEditing({ ...editing, [key]: false });
  };

  const cancelEdit = (key) => {
    setEditing({ ...editing, [key]: false });
  };

  const regenerateSection = async (section) => {
    setRegenerating({ ...regenerating, [section]: true });
    try {
      const res = await base44.functions.invoke("enhanceWebsite", {
        comment: `Regenerate the ${section} section with higher quality, more compelling copy`,
        section,
        content: content, // pass current content for context
      });
      if (res.data?.content) {
        const newContent = { ...content, ...res.data.content };
        updateContent(newContent);
      }
    } catch (err) {
      console.error("Regenerate failed:", err);
    } finally {
      setRegenerating({ ...regenerating, [section]: false });
    }
  };

  const colorKeys = content.colorTokens ? Object.keys(content.colorTokens) : [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div>
        <h2 className="font-display font-bold text-2xl sm:text-3xl">Your Website Blueprint</h2>
        <p className="text-muted-foreground mt-1">
          Review, edit, or regenerate any section. Then generate your logo and hero image.
        </p>
      </div>

      {/* Business Research */}
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
          </div>
        )}
      </Card>

      {/* Hero Section — Editable */}
      {content.hero && (
        <Card title="Hero Section" subtitle="Main headline and call-to-action" actions={
          <RegenButton onClick={() => regenerateSection("hero")} loading={regenerating.hero} />
        }>
          <div className="space-y-3">
            <EditableField
              label="Headline"
              value={content.hero.headline}
              editing={editing["hero.headline"]}
              editValue={editValues["hero.headline"]}
              onEdit={() => startEdit("hero.headline", content.hero.headline)}
              onChange={(v) => setEditValues({ ...editValues, "hero.headline": v })}
              onSave={() => saveEdit("hero.headline")}
              onCancel={() => cancelEdit("hero.headline")}
              large
            />
            <EditableField
              label="Subheadline"
              value={content.hero.subheadline}
              editing={editing["hero.subheadline"]}
              editValue={editValues["hero.subheadline"]}
              onEdit={() => startEdit("hero.subheadline", content.hero.subheadline)}
              onChange={(v) => setEditValues({ ...editValues, "hero.subheadline": v })}
              onSave={() => saveEdit("hero.subheadline")}
              onCancel={() => cancelEdit("hero.subheadline")}
            />
            <EditableField
              label="Primary CTA"
              value={content.hero.primaryCta}
              editing={editing["hero.primaryCta"]}
              editValue={editValues["hero.primaryCta"]}
              onEdit={() => startEdit("hero.primaryCta", content.hero.primaryCta)}
              onChange={(v) => setEditValues({ ...editValues, "hero.primaryCta": v })}
              onSave={() => saveEdit("hero.primaryCta")}
              onCancel={() => cancelEdit("hero.primaryCta")}
            />
            {content.hero.secondaryCta && (
              <EditableField
                label="Secondary CTA"
                value={content.hero.secondaryCta}
                editing={editing["hero.secondaryCta"]}
                editValue={editValues["hero.secondaryCta"]}
                onEdit={() => startEdit("hero.secondaryCta", content.hero.secondaryCta)}
                onChange={(v) => setEditValues({ ...editValues, "hero.secondaryCta": v })}
                onSave={() => saveEdit("hero.secondaryCta")}
                onCancel={() => cancelEdit("hero.secondaryCta")}
              />
            )}
          </div>
        </Card>
      )}

      {/* Services — Editable */}
      {content.services?.length > 0 && (
        <Card title="Services" subtitle={`${content.services.length} services`} actions={
          <RegenButton onClick={() => regenerateSection("services")} loading={regenerating.services} />
        }>
          <div className="grid sm:grid-cols-2 gap-2">
            {content.services.map((s, i) => (
              <div key={i} className="rounded-lg border border-border p-3">
                <EditableField
                  label={`Service ${i + 1} title`}
                  value={s.title}
                  editing={editing[`services.${i}.title`]}
                  editValue={editValues[`services.${i}.title`]}
                  onEdit={() => startEdit(`services.${i}.title`, s.title)}
                  onChange={(v) => {
                    const newServices = [...content.services];
                    newServices[i] = { ...newServices[i], title: v };
                    updateContent({ ...content, services: newServices });
                  }}
                  onSave={() => {}}
                  onCancel={() => {}}
                  noButtons
                />
                <EditableField
                  label="Description"
                  value={s.description}
                  editing={editing[`services.${i}.desc`]}
                  editValue={editValues[`services.${i}.desc`]}
                  onEdit={() => startEdit(`services.${i}.desc`, s.description)}
                  onChange={(v) => {
                    const newServices = [...content.services];
                    newServices[i] = { ...newServices[i], description: v };
                    updateContent({ ...content, services: newServices });
                  }}
                  onSave={() => {}}
                  onCancel={() => {}}
                  noButtons
                  small
                />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* About — Editable */}
      {content.about && (
        <Card title="About" subtitle="Company story" actions={
          <RegenButton onClick={() => regenerateSection("about")} loading={regenerating.about} />
        }>
          <div className="space-y-3">
            <EditableField
              label="Headline"
              value={content.about.headline}
              editing={editing["about.headline"]}
              editValue={editValues["about.headline"]}
              onEdit={() => startEdit("about.headline", content.about.headline)}
              onChange={(v) => setEditValues({ ...editValues, "about.headline": v })}
              onSave={() => saveEdit("about.headline")}
              onCancel={() => cancelEdit("about.headline")}
            />
            <EditableField
              label="Body"
              value={content.about.body}
              editing={editing["about.body"]}
              editValue={editValues["about.body"]}
              onEdit={() => startEdit("about.body", content.about.body)}
              onChange={(v) => setEditValues({ ...editValues, "about.body": v })}
              onSave={() => saveEdit("about.body")}
              onCancel={() => cancelEdit("about.body")}
              multiline
            />
          </div>
        </Card>
      )}

      {/* FAQs — Editable */}
      {content.faqs?.length > 0 && (
        <Card title="FAQs" subtitle={`${content.faqs.length} questions`} actions={
          <RegenButton onClick={() => regenerateSection("faqs")} loading={regenerating.faqs} />
        }>
          <div className="space-y-2">
            {content.faqs.map((f, i) => (
              <div key={i} className="rounded-lg border border-border p-3">
                <input
                  className="w-full bg-transparent text-sm font-semibold text-foreground focus:outline-none border-b border-transparent focus:border-primary pb-1"
                  value={f.question}
                  onChange={(e) => {
                    const newFaqs = [...content.faqs];
                    newFaqs[i] = { ...newFaqs[i], question: e.target.value };
                    updateContent({ ...content, faqs: newFaqs });
                  }}
                />
                <textarea
                  className="w-full bg-transparent text-xs text-muted-foreground focus:outline-none mt-1 resize-none border-b border-transparent focus:border-primary pb-1"
                  value={f.answer}
                  rows={2}
                  onChange={(e) => {
                    const newFaqs = [...content.faqs];
                    newFaqs[i] = { ...newFaqs[i], answer: e.target.value };
                    updateContent({ ...content, faqs: newFaqs });
                  }}
                />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Testimonials */}
      {content.testimonials?.length > 0 && (
        <Card title="Testimonials" subtitle={`${content.testimonials.length} testimonials`} actions={
          <RegenButton onClick={() => regenerateSection("testimonials")} loading={regenerating.testimonials} />
        }>
          <div className="space-y-2">
            {content.testimonials.map((t, i) => (
              <div key={i} className="rounded-lg border border-border p-3">
                <textarea
                  className="w-full bg-transparent text-sm text-foreground focus:outline-none resize-none border-b border-transparent focus:border-primary pb-1"
                  value={t.quote}
                  rows={2}
                  onChange={(e) => {
                    const newTest = [...content.testimonials];
                    newTest[i] = { ...newTest[i], quote: e.target.value };
                    updateContent({ ...content, testimonials: newTest });
                  }}
                />
                <input
                  className="w-full bg-transparent text-xs text-muted-foreground focus:outline-none mt-1"
                  value={`${t.author}${t.role ? " — " + t.role : ""}`}
                  onChange={(e) => {
                    const newTest = [...content.testimonials];
                    newTest[i] = { ...newTest[i], author: e.target.value };
                    updateContent({ ...content, testimonials: newTest });
                  }}
                />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Value Props */}
      {content.valueProps?.length > 0 && (
        <Card title="Value Props" subtitle={`${content.valueProps.length} value propositions`} actions={
          <RegenButton onClick={() => regenerateSection("valueProps")} loading={regenerating.valueProps} />
        }>
          <div className="grid sm:grid-cols-2 gap-2">
            {content.valueProps.map((v, i) => (
              <div key={i} className="rounded-lg border border-border p-3">
                <input
                  className="w-full bg-transparent text-sm font-semibold text-foreground focus:outline-none border-b border-transparent focus:border-primary pb-1"
                  value={v.title}
                  onChange={(e) => {
                    const newVP = [...content.valueProps];
                    newVP[i] = { ...newVP[i], title: e.target.value };
                    updateContent({ ...content, valueProps: newVP });
                  }}
                />
                <textarea
                  className="w-full bg-transparent text-xs text-muted-foreground focus:outline-none mt-1 resize-none"
                  value={v.description}
                  rows={2}
                  onChange={(e) => {
                    const newVP = [...content.valueProps];
                    newVP[i] = { ...newVP[i], description: e.target.value };
                    updateContent({ ...content, valueProps: newVP });
                  }}
                />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Process */}
      {content.process?.length > 0 && (
        <Card title="Process" subtitle={`${content.process.length} steps`} actions={
          <RegenButton onClick={() => regenerateSection("process")} loading={regenerating.process} />
        }>
          <div className="space-y-2">
            {content.process.map((p, i) => (
              <div key={i} className="rounded-lg border border-border p-3 flex gap-3">
                <span className="text-primary font-bold text-sm shrink-0">{p.step}</span>
                <div className="flex-1">
                  <input
                    className="w-full bg-transparent text-sm font-semibold text-foreground focus:outline-none border-b border-transparent focus:border-primary pb-1"
                    value={p.title}
                    onChange={(e) => {
                      const newProc = [...content.process];
                      newProc[i] = { ...newProc[i], title: e.target.value };
                      updateContent({ ...content, process: newProc });
                    }}
                  />
                  <textarea
                    className="w-full bg-transparent text-xs text-muted-foreground focus:outline-none mt-1 resize-none"
                    value={p.description}
                    rows={2}
                    onChange={(e) => {
                      const newProc = [...content.process];
                      newProc[i] = { ...newProc[i], description: e.target.value };
                      updateContent({ ...content, process: newProc });
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Final CTA */}
      {content.finalCta && (
        <Card title="Final CTA" subtitle="Closing call-to-action" actions={
          <RegenButton onClick={() => regenerateSection("finalCta")} loading={regenerating.finalCta} />
        }>
          <div className="space-y-3">
            <EditableField
              label="Headline"
              value={content.finalCta.headline}
              editing={editing["finalCta.headline"]}
              editValue={editValues["finalCta.headline"]}
              onEdit={() => startEdit("finalCta.headline", content.finalCta.headline)}
              onChange={(v) => setEditValues({ ...editValues, "finalCta.headline": v })}
              onSave={() => saveEdit("finalCta.headline")}
              onCancel={() => cancelEdit("finalCta.headline")}
            />
            <EditableField
              label="Button"
              value={content.finalCta.button}
              editing={editing["finalCta.button"]}
              editValue={editValues["finalCta.button"]}
              onEdit={() => startEdit("finalCta.button", content.finalCta.button)}
              onChange={(v) => setEditValues({ ...editValues, "finalCta.button": v })}
              onSave={() => saveEdit("finalCta.button")}
              onCancel={() => cancelEdit("finalCta.button")}
            />
          </div>
        </Card>
      )}

      {/* Color Palette — Expanded */}
      {content.colorTokens && (
        <Card title="Color Palette" subtitle={`${colorKeys.length} color tokens — click to edit any color`} actions={
          <RegenButton onClick={() => regenerateSection("colorTokens")} loading={regenerating.colorTokens} />
        }>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {colorKeys.map((k) => (
              <div key={k} className="rounded-lg border border-border p-3">
                <div className="flex items-center gap-2 mb-2">
                  <label className="relative cursor-pointer">
                    <div
                      className="w-10 h-10 rounded-lg border border-border"
                      style={{ background: content.colorTokens[k] }}
                    />
                    <input
                      type="color"
                      value={content.colorTokens[k]}
                      onChange={(e) => {
                        updateContent({
                          ...content,
                          colorTokens: { ...content.colorTokens, [k]: e.target.value },
                        });
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </label>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-foreground capitalize">{k}</div>
                    <div className="text-[10px] font-mono text-muted-foreground">{content.colorTokens[k]}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Add custom color */}
          <div className="mt-4 flex items-center gap-2">
            <input
              type="color"
              className="w-10 h-10 rounded-lg border border-border cursor-pointer"
              onChange={(e) => {
                const key = `custom${colorKeys.filter(k => k.startsWith("custom")).length + 1}`;
                updateContent({
                  ...content,
                  colorTokens: { ...content.colorTokens, [key]: e.target.value },
                });
              }}
            />
            <span className="text-xs text-muted-foreground">Add a custom color token</span>
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onGenerateAssets}
          disabled={loadingAssets}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground hover:brightness-110 transition disabled:opacity-60"
        >
          {loadingAssets ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
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

function EditableField({ label, value, editing, editValue, onEdit, onChange, onSave, onCancel, large, multiline, small, noButtons }) {
  if (noButtons) {
    // Direct inline editing (always editable)
    if (multiline) {
      return (
        <textarea
          className="w-full bg-transparent text-xs text-muted-foreground focus:outline-none resize-none mt-1"
          value={value}
          rows={2}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    }
    return (
      <input
        className={`w-full bg-transparent ${small ? "text-xs text-muted-foreground" : "text-sm font-semibold text-foreground"} focus:outline-none border-b border-transparent focus:border-primary pb-1`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  return (
    <div>
      <div className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">{label}</div>
      {editing ? (
        <div className="flex items-start gap-2">
          {multiline ? (
            <textarea
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary resize-none"
              value={editValue}
              onChange={(e) => onChange(e.target.value)}
              rows={3}
              autoFocus
            />
          ) : (
            <input
              className={`flex-1 rounded-lg border border-border bg-background px-3 py-2 ${large ? "text-lg font-bold" : "text-sm"} text-foreground focus:outline-none focus:border-primary`}
              value={editValue}
              onChange={(e) => onChange(e.target.value)}
              autoFocus
            />
          )}
          <button onClick={onSave} className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition">
            <Check className="w-4 h-4" />
          </button>
          <button onClick={onCancel} className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary transition">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-start gap-2 group">
          <div className={large ? "text-xl font-display font-bold text-foreground flex-1" : multiline ? "text-sm text-muted-foreground flex-1" : "text-sm text-foreground flex-1"}>
            {value || "—"}
          </div>
          <button
            onClick={onEdit}
            className="opacity-0 group-hover:opacity-100 p-1 rounded text-muted-foreground hover:text-primary transition shrink-0"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

function RegenButton({ onClick, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-primary hover:border-primary/40 transition disabled:opacity-50 shrink-0"
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
      {loading ? "Regenerating..." : "Regenerate"}
    </button>
  );
}

function Card({ title, subtitle, children, actions }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-display font-bold text-lg text-foreground">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        {actions}
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