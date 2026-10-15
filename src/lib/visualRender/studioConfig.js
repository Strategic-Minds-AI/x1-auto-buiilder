// Brand config and CSS variable projection for the visual template renderer.
// Ported from universal-template-system/src/lib/gallery/studioConfig.js

export const DEFAULT_CONFIG = {
  primaryColor: "#00d4ff",
  secondaryColor: "#0b1523",
  logoText: "Digital Dominance",
  heading: "Overview",
  subtitle: "Workspace summary",
  brandName: "Dominance Factory",
  themeMode: "dark",
  fontColor: "",
  fontFamily: "Inter",
  fontScale: 1,
  logoImage: "",
};

/* ---------- color utils ---------- */
const clamp = (n) => Math.max(0, Math.min(255, n));
function hexToRgb(hex) {
  let h = String(hex || "#000000").replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16) || 0;
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map((x) => clamp(Math.round(x)).toString(16).padStart(2, "0")).join("");
}
function mix(hex, target, amt) {
  const c = hexToRgb(hex);
  return rgbToHex(c.r + (target - c.r) * amt, c.g + (target - c.g) * amt, c.b + (target - c.b) * amt);
}
export const lighten = (hex, amt) => mix(hex, 255, amt);
export const darken = (hex, amt) => mix(hex, 0, amt);
export function hexToRgba(hex, amt) {
  const c = hexToRgb(hex);
  return `rgba(${c.r},${c.g},${c.b},${amt})`;
}
function luminance(hex) {
  const c = hexToRgb(hex);
  const a = [c.r, c.g, c.b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}
export function contrastColor(hex) {
  return luminance(hex) > 0.5 ? "#0b1020" : "#ffffff";
}

/* ---------- config -> CSS custom properties ---------- */
export function themeToCssVars(config) {
  const c = { ...DEFAULT_CONFIG, ...config };
  const primary = c.primaryColor;
  const secondary = c.secondaryColor;
  const dark = c.themeMode === "dark";
  const vars = {
    "--brand-primary": primary,
    "--brand-accent": primary,
    "--brand-gold-mid": primary,
    "--brand-gold-bright": lighten(primary, 0.15),
    "--brand-gold-light": lighten(primary, 0.36),
    "--brand-gold-deep": darken(primary, 0.22),
    "--brand-secondary": secondary,
    "--brand-on-primary": contrastColor(primary),
    "--vg-chip-bg": dark ? hexToRgba(primary, 0.22) : lighten(primary, 0.86),
    "--vg-chip-fg": dark ? lighten(primary, 0.3) : darken(primary, 0.2),
    "--brand-font-body": `'${c.fontFamily}', sans-serif`,
    "--brand-font-heading": `'${c.fontFamily}', sans-serif`,
    "--vg-font-scale": String(c.fontScale || 1),
  };
  if (dark) {
    vars["--brand-background"] = c.backgroundColor || "#0b1020";
    vars["--brand-surface"] = "#111827";
    vars["--brand-text"] = "#f8fafc";
    vars["--brand-muted"] = "#1f2937";
    vars["--brand-muted-foreground"] = "#94a3b8";
    vars["--brand-border"] = "#243044";
    vars["--brand-card-subtle"] = "#0f172a";
  } else {
    vars["--brand-background"] = c.backgroundColor || "#ffffff";
    vars["--brand-surface"] = "#ffffff";
    vars["--brand-text"] = "#14213d";
    vars["--brand-muted"] = "#f4f8ff";
    vars["--brand-muted-foreground"] = "#4b5563";
    vars["--brand-border"] = "#e2e8f0";
    vars["--brand-card-subtle"] = "#f7faff";
  }
  if (c.fontColor) vars["--brand-text"] = c.fontColor;
  return vars;
}