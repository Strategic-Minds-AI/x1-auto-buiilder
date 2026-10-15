import { Image } from "@/components/ui/image";

function isDarkColor(hex) {
  if (!hex) return true;
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) < 140;
}

// Renders a browser-frame mockup from a site's content blueprint, giving a
// visual sense of the site's style (colors, hero, logo) at a glance — even
// for templates that have no stored images.
export default function MiniSitePreview({ heroImage, logoUrl, headline, subheadline, colorTokens, ctaLabel, className }) {
  const bg = colorTokens?.background || "#0b1523";
  const primary = colorTokens?.primary || "#00d4ff";
  const accent = colorTokens?.accent || primary;
  const dark = isDarkColor(bg);
  const textOnBg = dark ? "#ffffff" : "#1a1a2e";
  const mutedText = dark ? "rgba(255,255,255,0.6)" : "rgba(26,26,46,0.55)";

  return (
    <div className={`rounded-xl overflow-hidden border border-border bg-background ${className || ""}`}>
      {/* Browser bar */}
      <div className="flex items-center gap-1.5 px-3 py-2 bg-background/80 border-b border-border">
        <span className="w-2 h-2 rounded-full bg-red-400/70" />
        <span className="w-2 h-2 rounded-full bg-amber-400/70" />
        <span className="w-2 h-2 rounded-full bg-emerald-400/70" />
        <span className="flex-1 ml-2 h-3 rounded-full bg-background/60" />
      </div>
      {/* Hero area */}
      <div className="relative aspect-video overflow-hidden" style={{ background: bg }}>
        {heroImage ? (
          <Image src={heroImage} fittingType="fill" className="absolute inset-0 w-full h-full" />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, ${primary}33, ${accent}22, ${bg})` }}
          />
        )}
        {/* Subtle bottom-to-top scrim for text legibility over photos */}
        {heroImage && (
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(to top, ${bg}cc 0%, ${bg}55 35%, transparent 70%)` }}
          />
        )}
        <div className="absolute inset-0 flex flex-col justify-center p-3 sm:p-4">
          {logoUrl && (
            <Image src={logoUrl} fittingType="fit" className="h-5 w-5 rounded mb-2 object-contain" />
          )}
          {headline && (
            <div className="text-[11px] sm:text-xs font-bold leading-tight line-clamp-2" style={{ color: textOnBg }}>
              {headline}
            </div>
          )}
          {subheadline && (
            <div className="text-[9px] sm:text-[10px] mt-1 line-clamp-1" style={{ color: mutedText }}>
              {subheadline}
            </div>
          )}
          <div
            className="mt-2 inline-block rounded-full px-2.5 py-1 text-[8px] sm:text-[9px] font-bold w-fit"
            style={{ background: primary, color: dark ? bg : "#ffffff" }}
          >
            {ctaLabel || "Get Started"}
          </div>
        </div>
      </div>
    </div>
  );
}