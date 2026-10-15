import React, { useMemo } from "react";
import DeviceFrame from "@/components/shared/DeviceFrame";
import { PREVIEW_STYLES } from "@/lib/visualRender/previewStyles.js";
import { renderPreview } from "@/lib/visualRender/previewRenderer.js";
import { renderWebsite } from "@/lib/visualRender/websiteRenderer.js";
import { themeToCssVars } from "@/lib/visualRender/studioConfig.js";

// Inject the scoped preview styles once
let stylesInjected = false;
function injectStyles() {
  if (stylesInjected || typeof document === "undefined") return;
  const el = document.createElement("style");
  el.id = "vg-preview-styles";
  el.textContent = PREVIEW_STYLES;
  document.head.appendChild(el);
  stylesInjected = true;
}

// Maps a DesignTemplate entity to a live visual rendering of exactly what
// that template looks like — a real mini-UI rendered with the template's
// actual brand colors, copy, and layout. Every template gets this; no
// generic color strips.
export default function VisualTemplateRender({ template, displayW = 280 }) {
  injectStyles();

  const { frame, designW, designH, html, vars } = useMemo(() => {
    const isWebsite = template.category === "website";
    const isMobile = template.category === "mobile_app";

    // Build brand config from the template's own colors
    const config = {
      primaryColor: template.accent || "#00d4ff",
      secondaryColor: template.tone || "#0b1523",
      backgroundColor: template.tone || "#0b1523",
      logoText: template.name || "Brand",
      heading: template.name || "Overview",
      subtitle: template.family || "",
      brandName: template.name || "Brand",
      themeMode: isDarkColor(template.tone) ? "dark" : "light",
      fontColor: template.ink || "",
      fontFamily: "Inter",
      fontScale: 1,
    };

    const cssVars = themeToCssVars(config);

    if (isWebsite) {
      const r = renderWebsite(template, config);
      return { ...r, vars: cssVars };
    }

    // Desktop / mobile app patterns: use the pattern renderer
    const patternObj = { id: template.template_id, name: template.name };
    const platform = isMobile ? "mobile" : "desktop";
    const r = renderPreview(patternObj, platform, config);
    return { ...r, vars: cssVars };
  }, [template]);

  return (
    <div style={{ ...vars, ["--brand-secondary"]: template.tone || vars["--brand-secondary"] }}>
      <DeviceFrame type={frame} designW={designW} designH={designH} displayW={displayW}>
        <div style={{ width: designW, height: designH }} dangerouslySetInnerHTML={{ __html: html }} />
      </DeviceFrame>
    </div>
  );
}

function isDarkColor(hex) {
  if (!hex) return true;
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) < 128;
}