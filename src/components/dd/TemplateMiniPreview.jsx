import { useMemo, useRef, useState, useEffect } from "react";
import { renderWebsite } from "@/lib/visualRender/websiteRenderer.js";
import { PREVIEW_STYLES } from "@/lib/visualRender/previewStyles.js";
import { themeToCssVars } from "@/lib/visualRender/studioConfig.js";

let stylesInjected = false;
function injectStyles() {
  if (stylesInjected || typeof document === "undefined") return;
  const el = document.createElement("style");
  el.id = "vg-preview-styles";
  el.textContent = PREVIEW_STYLES;
  document.head.appendChild(el);
  stylesInjected = true;
}

function isDarkColor(hex) {
  if (!hex) return true;
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) < 128;
}

const DESIGN_W = 760;
const DESIGN_H = 460;

// Renders a unique, scaled CSS mini-website for each template — no external
// images needed for the card thumbnail. Each template looks completely
// different based on its layout, colors, and content.
export default function TemplateMiniPreview({ template, className }) {
  injectStyles();
  const ref = useRef(null);
  const [scale, setScale] = useState(0.4);

  useEffect(() => {
    if (!ref.current) return;
    const update = () => {
      const w = ref.current.offsetWidth;
      if (w > 0) setScale(w / DESIGN_W);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  const { html, vars } = useMemo(() => {
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
    const r = renderWebsite(template, config);
    return { html: r.html, vars: cssVars };
  }, [template]);

  return (
    <div
      ref={ref}
      className={className}
      style={{ overflow: "hidden", position: "relative", aspectRatio: `${DESIGN_W} / ${DESIGN_H}`, ...vars }}
    >
      <div
        style={{
          width: DESIGN_W,
          height: DESIGN_H,
          transformOrigin: "top left",
          transform: `scale(${scale})`,
          position: "absolute",
          top: 0,
          left: 0,
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}