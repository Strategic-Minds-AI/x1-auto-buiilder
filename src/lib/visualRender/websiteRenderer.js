// Website hero renderer — renders a real mini-website preview using the
// template's actual brand colors, hero copy, and Unsplash image.
import { DEFAULT_CONFIG } from "./studioConfig.js";

const FS = (n) => `font-size:calc(${n}px * var(--vg-font-scale,1))`;
const ctxd = (config) => ({ ...DEFAULT_CONFIG, ...config });

const BROWSER = { w: 760, h: 460 };

function websiteHero(ctx, t) {
  const heroImg = t.photo ? `https://images.unsplash.com/${t.photo}?w=800&q=80` : null;
  const isDark = isDarkColor(t.tone);

  return `
    <div class="vg-screen" style="background:${t.tone || '#0b1523'};color:${t.ink || '#fff'};font-family:Inter,sans-serif">
      <div class="vg-nav" style="background:transparent;border-color:${isDark ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.08)'}">
        <span class="logo" style="color:${t.ink}">${(t.name || '').split(' ')[0]} <b style="color:${t.accent}">${(t.name || '').split(' ').slice(1).join(' ') || ''}</b></span>
        <div style="flex:1"></div>
        <span class="vg-tab" style="color:${t.ink};opacity:.6">Services</span>
        <span class="vg-tab" style="color:${t.ink};opacity:.6">Work</span>
        <span class="vg-tab" style="color:${t.ink};opacity:.6">About</span>
        <span class="vg-btn pri" style="background:${t.accent};color:${contrastOn(t.accent, t.tone)};border:0;padding:6px 14px;border-radius:9999px;${FS(10)};font-weight:700">${t.cta || 'Learn more'}</span>
      </div>
      <div style="flex:1;display:flex;align-items:center;padding:24px 40px;gap:24px;min-height:0">
        <div style="flex:1;min-width:0">
          ${t.eyebrow ? `<div style="${FS(10)};font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:${t.accent};margin-bottom:10px">${t.eyebrow}</div>` : ''}
          <div style="${FS(28)};font-weight:900;line-height:1.05;letter-spacing:-.03em;color:${t.ink};margin-bottom:12px">${t.head || t.name}</div>
          <div style="${FS(12)};line-height:1.6;opacity:.7;color:${t.ink};max-width:280px;margin-bottom:18px">${t.sub || ''}</div>
          <div style="display:flex;gap:10px">
            <span style="display:inline-flex;align-items:center;gap:6px;padding:10px 20px;border-radius:9999px;background:${t.accent};color:${contrastOn(t.accent, t.tone)};${FS(11)};font-weight:800">${t.cta || 'Get started'}</span>
            <span style="display:inline-flex;align-items:center;gap:6px;padding:10px 20px;border-radius:9999px;border:1px solid ${isDark ? 'rgba(255,255,255,.2)' : 'rgba(0,0,0,.15)'};color:${t.ink};${FS(11)};font-weight:700">Explore</span>
          </div>
        </div>
        ${heroImg ? `<div style="flex:1;min-width:0;height:280px;border-radius:14px;overflow:hidden;border:1px solid ${isDark ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.08)'}"><img src="${heroImg}" style="width:100%;height:100%;object-fit:cover" /></div>` : ''}
      </div>
      ${t.feature ? `
      <div style="padding:16px 40px;border-top:1px solid ${isDark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)'};display:flex;gap:20px;align-items:center">
        <div style="flex:1">
          <div style="${FS(13)};font-weight:800;color:${t.ink}">${t.feature}</div>
          ${t.feature_copy ? `<div style="${FS(10)};opacity:.6;color:${t.ink};margin-top:3px">${t.feature_copy}</div>` : ''}
        </div>
        <div style="display:flex;gap:8px">
          ${[1,2,3].map(i => `<div style="width:36px;height:36px;border-radius:10px;background:${t.accent}22;border:1px solid ${t.accent}44;display:flex;align-items:center;justify-content:center;color:${t.accent};${FS(14)};font-weight:900">${['◆','◈','◉'][i-1]}</div>`).join('')}
        </div>
      </div>` : ''}
    </div>
  `;
}

function isDarkColor(hex) {
  if (!hex) return true;
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) < 128;
}

function contrastOn(fg, bg) {
  return isDarkColor(bg) ? '#ffffff' : (isDarkColor(fg) ? '#ffffff' : '#0b1523');
}

export function renderWebsite(template, config) {
  const ctx = ctxd(config);
  return {
    frame: "browser",
    designW: BROWSER.w,
    designH: BROWSER.h,
    html: websiteHero(ctx, template),
  };
}