// Shared helpers for app layout rendering — used by desktopLayouts.js and mobileLayouts.js
import { DEFAULT_CONFIG } from "./studioConfig.js";

export const PHONE = { w: 300, h: 600 };
export const BROWSER = { w: 760, h: 460 };
export const FS = (n) => `font-size:calc(${n}px * var(--vg-font-scale,1))`;

export const ctxd = (config) => ({ ...DEFAULT_CONFIG, ...config });

export const logo = (ctx) => {
  if (ctx.logoImage) return `<span class="logo"><img src="${ctx.logoImage}" alt="" style="height:16px;width:auto;border-radius:4px;vertical-align:middle" /></span>`;
  const parts = String(ctx.logoText || "Strategic Minds").trim().split(/\s+/);
  if (parts.length < 2) return `<span class="logo">${parts[0] || ""}</span>`;
  const last = parts.pop();
  return `<span class="logo">${parts.join(" ")} <b>${last}</b></span>`;
};

export const nav = (ctx, active, tabs = ["Dashboard", "Projects", "Reports"]) =>
  `<div class="vg-nav">${logo(ctx)}${tabs.map((t) => `<span class="vg-tab ${t === active ? "on" : ""}">${t}</span>`).join("")}<div style="flex:1"></div><span class="vg-avatar"></span></div>`;

export const phoneNav = (ctx) =>
  `<div class="vg-nav" style="justify-content:space-between">${logo(ctx)}<span class="vg-avatar"></span></div>`;

export const tabbar = (tabs, active = 0) =>
  `<div class="vg-tabbar">${tabs.map((t, i) => `<div class="t ${i === active ? "on" : ""}"><div class="d"></div><span>${t}</span></div>`).join("")}</div>`;

export const feedItem = (ttl, meta, w = 80) =>
  `<div class="item"><div class="thumb"></div><div class="body"><div class="ttl">${ttl}</div><div class="meta">${meta}</div><div class="ln" style="width:${w}%"></div></div></div>`;

export const ln = (w) => `<div style="height:6px;border-radius:9999px;background:var(--brand-muted);width:${w}%"></div>`;
export const lines = (n) => Array.from({ length: n }, (_, i) => ln(58 + ((i * 23) % 38))).join("");

export const kpi = (v, l) => `<div class="vg-kpi"><div class="v">${v}</div><div class="l">${l}</div></div>`;
export const card = (inner) => `<div class="vg-card">${inner}</div>`;
export const bar = (w) => `<div class="vg-bar"><i style="width:${w}%"></i></div>`;
export const pill = (s, on = false) => `<span class="pill ${on ? "" : "soft"}">${s}</span>`;
export const chip = (s, on = false) => `<span class="vg-chip ${on ? "" : "soft"}">${s}</span>`;
export const btn = (label, pri = true) => `<button class="vg-btn ${pri ? "pri" : "out"}">${label}</button>`;
export const avatar = () => `<span class="vg-avatar"></span>`;