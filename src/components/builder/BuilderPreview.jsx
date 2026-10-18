import { Monitor, Smartphone, Tablet, Loader2, Globe } from "lucide-react";
import { DEFAULT_BRAND_PALETTE, getBrandPalette } from "@/lib/brandPalettes";

export default function BuilderPreview({ project, previewMode, onModeChange, loading }) {
  const content = project?.content || {};
  const businessName = project?.business_name || "Your Business";
  const industry = project?.industry || "";
  const savedPalette = project?.brand_palette || getBrandPalette(project?.brand_palette_id);
  const palette = {
    ...DEFAULT_BRAND_PALETTE,
    ...savedPalette,
    accent: project?.brand_color || savedPalette?.accent || DEFAULT_BRAND_PALETTE.accent,
  };
  const accentGradient = `linear-gradient(115deg,${palette.accent},${palette.accent2 || "#00D4FF"})`;
  const deviceWidths = { desktop: "100%", tablet: "768px", mobile: "375px" };

  const renderHero = () => {
    const hero = content.hero || content.homepage?.hero || {};
    return (
      <div className="relative py-20 px-8 text-center" style={{ background: `linear-gradient(135deg,${palette.primary},${palette.surface})`, color: palette.ink }}>
        <div className="mx-auto mb-4 h-1 w-16 rounded-full" style={{ background: accentGradient }} />
        <h1 className="mb-3 text-4xl font-black">{hero.headline || hero.title || businessName}</h1>
        <p className="mx-auto mb-6 max-w-xl text-lg" style={{ color: palette.muted }}>{hero.subheadline || hero.subtitle || `Professional ${industry} services`}</p>
        <button className="rounded-full px-6 py-3 font-bold text-white shadow-lg transition hover:brightness-110" style={{ background: accentGradient }}>{hero.cta || "Get Started"}</button>
      </div>
    );
  };

  const renderServices = () => {
    const services = content.services || [];
    if (!services.length) return null;
    return (
      <div className="px-8 py-16" style={{ background: palette.surface, color: palette.ink }}>
        <h2 className="mb-10 text-center text-3xl font-black" style={{ color: palette.ink }}>Our Services</h2>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.slice(0, 6).map((service, index) => (
            <div key={index} className="rounded-xl border p-5 text-center" style={{ background: palette.primary, borderColor: palette.accent + "44" }}>
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold" style={{ background: palette.accent + "20", color: palette.accent }}>{index + 1}</div>
              <h3 className="mb-1 font-bold" style={{ color: palette.ink }}>{service.title || service.name || `Service ${index + 1}`}</h3>
              <p className="text-sm" style={{ color: palette.muted }}>{service.description || service.desc || ""}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAbout = () => {
    const about = content.about || {};
    if (!about.title && !about.body) return null;
    return (
      <div className="px-8 py-16" style={{ background: palette.primary, color: palette.ink }}>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-black" style={{ color: palette.ink }}>{about.title || "About Us"}</h2>
          <p className="leading-relaxed" style={{ color: palette.muted }}>{about.body || about.content || ""}</p>
        </div>
      </div>
    );
  };

  const renderContact = () => {
    const contact = content.contact || {};
    if (!contact.phone && !contact.email && !contact.address) return null;
    return (
      <div className="px-8 py-16 text-center" style={{ background: palette.surface, color: palette.ink }}>
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-6 text-3xl font-black" style={{ color: palette.ink }}>Get In Touch</h2>
          <div className="flex flex-wrap justify-center gap-8 text-sm">
            {contact.phone && <div><div className="mb-1 text-xs" style={{ color: palette.muted }}>Call Us</div><div className="font-bold">{contact.phone}</div></div>}
            {contact.email && <div><div className="mb-1 text-xs" style={{ color: palette.muted }}>Email Us</div><div className="font-bold">{contact.email}</div></div>}
            {contact.address && <div><div className="mb-1 text-xs" style={{ color: palette.muted }}>Visit Us</div><div className="font-bold">{contact.address}</div></div>}
          </div>
          <button className="mt-8 rounded-full px-6 py-3 font-bold text-white transition hover:brightness-110" style={{ background: accentGradient }}>Contact Today</button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col" style={{ background: palette.primary, color: palette.ink }}>
      <div className="flex h-12 shrink-0 items-center justify-between border-b px-4" style={{ borderColor: palette.accent + "33", background: palette.primary }}>
        <div className="flex min-w-0 items-center gap-2">
          <Globe className="h-4 w-4 shrink-0" style={{ color: palette.accent }} />
          <span className="max-w-[200px] truncate text-sm font-semibold" style={{ color: palette.ink }}>{project ? businessName : "No project selected"}</span>
          {project?.deploy_url && <a href={project.deploy_url} target="_blank" rel="noreferrer" className="max-w-[150px] truncate text-xs hover:underline" style={{ color: palette.accent }}>{project.deploy_url}</a>}
        </div>
        <div className="flex items-center gap-1 rounded-lg p-1" style={{ background: palette.surface }}>
          {[
            { mode: "desktop", icon: Monitor },
            { mode: "tablet", icon: Tablet },
            { mode: "mobile", icon: Smartphone },
          ].map(({ mode, icon: Icon }) => (
            <button key={mode} type="button" onClick={() => onModeChange(mode)} aria-pressed={previewMode === mode} className="rounded-md p-1.5 transition" style={{ background: previewMode === mode ? palette.accent : "transparent", color: previewMode === mode ? "#FFFFFF" : palette.muted }}>
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 justify-center overflow-y-auto p-4">
        {loading ? (
          <div className="flex h-full items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" style={{ color: palette.accent }} /></div>
        ) : !project ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <Monitor className="mb-3 h-12 w-12" style={{ color: palette.muted }} />
            <p className="mb-1 text-sm font-semibold" style={{ color: palette.ink }}>No project selected</p>
            <p className="text-xs" style={{ color: palette.muted }}>Select a project or ask the AI to generate one</p>
          </div>
        ) : (
          <div className="shadow-lg transition-all duration-200" style={{ width: deviceWidths[previewMode], maxWidth: "100%", background: palette.primary }}>
            {renderHero()}
            {renderServices()}
            {renderAbout()}
            {renderContact()}
            <div className="px-8 py-6 text-center text-xs" style={{ background: palette.surface, color: palette.muted, borderTop: `1px solid ${palette.accent}33` }}>
              © {new Date().getFullYear()} {businessName}. All rights reserved.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
