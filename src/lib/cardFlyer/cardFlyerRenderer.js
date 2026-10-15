// Digital Card & Flyer Renderer
// Generates high-fidelity HTML for 100+ style templates

function shadeColor(hex, percent) {
  if (!hex) return "#000000";
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const f = (v) => Math.max(0, Math.min(255, Math.round(v * (1 + percent / 100))));
  return `#${f(r).toString(16).padStart(2, "0")}${f(g).toString(16).padStart(2, "0")}${f(b).toString(16).padStart(2, "0")}`;
}

function initial(c) {
  return (c.company || c.name || "B").charAt(0).toUpperCase();
}

function contactItems(arr) {
  return arr.filter(Boolean).map((i) => `<div>${i}</div>`).join("");
}

function servicesList(list, p) {
  if (!list || !list.length) return "";
  return `<div style="margin-bottom:10px;">
    ${list.slice(0, 6).map((s) => `<div style="font-size:11px;padding:4px 0;display:flex;align-items:center;gap:6px;"><span style="width:6px;height:6px;background:${p.accent};border-radius:50%;flex-shrink:0;"></span>${s}</div>`).join("")}
  </div>`;
}

function getPalette(treatment, brand) {
  const accent = brand.accent || "#00d4ff";
  const ink = brand.ink || "#0b1523";
  const tone = brand.tone || "#0b1523";
  const accentDark = shadeColor(accent, -25);
  const white = "#ffffff";

  switch (treatment) {
    case "solid":
      return { accent, accentDark, accentBg: accent, onAccent: white, cardBg: white, text: ink, border: "none" };
    case "gradient":
      return { accent, accentDark, accentBg: `linear-gradient(135deg, ${accent}, ${accentDark})`, onAccent: white, cardBg: white, text: ink, border: "none" };
    case "split":
      return { accent, accentDark, accentBg: ink, onAccent: white, cardBg: accent, text: white, border: "none" };
    case "bordered":
      return { accent, accentDark, accentBg: accent, onAccent: white, cardBg: white, text: ink, border: `2.5px solid ${accent}` };
    case "inverted":
      return { accent, accentDark, accentBg: accent, onAccent: white, cardBg: tone, text: white, border: "none" };
    default:
      return { accent, accentDark, accentBg: accent, onAccent: white, cardBg: white, text: ink, border: "none" };
  }
}

// ─── CARD LAYOUTS (10) ───

function cardLeftBar(c, p, hf, bf) {
  return `
    <div style="position:absolute;left:0;top:0;bottom:0;width:100px;background:${p.accentBg};display:flex;align-items:center;justify-content:center;">
      <span style="font-size:40px;font-weight:800;color:${p.onAccent};font-family:${hf};">${initial(c)}</span>
    </div>
    <div style="margin-left:100px;padding:24px 20px;height:100%;display:flex;flex-direction:column;justify-content:center;">
      <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;opacity:0.6;margin-bottom:4px;">${c.company || ""}</div>
      <div style="font-size:20px;font-weight:700;font-family:${hf};">${c.name || ""}</div>
      <div style="font-size:11px;opacity:0.7;margin-top:2px;">${c.title || ""}</div>
      <div style="height:1px;background:${p.accent};width:30px;margin:10px 0;"></div>
      <div style="font-size:9px;line-height:1.6;">${contactItems([c.phone, c.email, c.website, c.address])}</div>
    </div>`;
}

function cardCenterStack(c, p, hf, bf) {
  return `
    <div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:20px;">
      <div style="font-size:9px;letter-spacing:3px;text-transform:uppercase;opacity:0.6;margin-bottom:6px;">${c.company || ""}</div>
      <div style="font-size:22px;font-weight:700;font-family:${hf};">${c.name || ""}</div>
      <div style="font-size:11px;opacity:0.7;margin-top:2px;">${c.title || ""}</div>
      <div style="height:2px;width:36px;background:${p.accent};margin:10px 0;"></div>
      <div style="font-size:9px;line-height:1.8;">${contactItems([c.phone, c.email, c.website])}</div>
    </div>`;
}

function cardSplit(c, p, hf, bf) {
  return `
    <div style="position:absolute;top:0;left:0;right:0;height:78px;background:${p.accentBg};display:flex;align-items:center;padding:0 20px;">
      <span style="font-size:16px;font-weight:700;color:${p.onAccent};font-family:${hf};">${c.company || c.name || ""}</span>
    </div>
    <div style="margin-top:78px;padding:16px 20px;">
      <div style="font-size:18px;font-weight:700;font-family:${hf};">${c.name || ""}</div>
      <div style="font-size:11px;opacity:0.7;">${c.title || ""}</div>
      <div style="height:1px;background:${p.accent};width:30px;margin:8px 0;"></div>
      <div style="font-size:9px;line-height:1.6;">${contactItems([c.phone, c.email, c.website, c.address])}</div>
    </div>`;
}

function cardCornerMark(c, p, hf, bf) {
  return `
    <div style="position:absolute;top:0;right:0;width:0;height:0;border-style:solid;border-width:0 60px 60px 0;border-color:transparent ${p.accent} transparent transparent;"></div>
    <div style="padding:24px 20px;height:100%;display:flex;flex-direction:column;justify-content:center;">
      <div style="font-size:9px;letter-spacing:2px;text-transform:uppercase;opacity:0.6;">${c.company || ""}</div>
      <div style="font-size:20px;font-weight:700;margin-top:4px;font-family:${hf};">${c.name || ""}</div>
      <div style="font-size:11px;opacity:0.7;">${c.title || ""}</div>
      <div style="height:1px;background:${p.accent};width:40px;margin:10px 0;"></div>
      <div style="font-size:9px;line-height:1.6;">${contactItems([c.phone, c.email, c.website])}</div>
    </div>`;
}

function cardMonogram(c, p, hf, bf) {
  return `
    <div style="position:absolute;right:-10px;bottom:-20px;font-size:140px;font-weight:800;color:${p.accent};opacity:0.12;line-height:1;font-family:${hf};">${initial(c)}</div>
    <div style="padding:24px 20px;height:100%;display:flex;flex-direction:column;justify-content:center;position:relative;z-index:1;">
      <div style="font-size:9px;letter-spacing:2px;text-transform:uppercase;opacity:0.6;">${c.company || ""}</div>
      <div style="font-size:20px;font-weight:700;margin-top:4px;font-family:${hf};">${c.name || ""}</div>
      <div style="font-size:11px;opacity:0.7;">${c.title || ""}</div>
      <div style="height:2px;background:${p.accent};width:36px;margin:10px 0;"></div>
      <div style="font-size:9px;line-height:1.6;">${contactItems([c.phone, c.email, c.website])}</div>
    </div>`;
}

function cardFrame(c, p, hf, bf) {
  const corner = (pos) => `<div style="position:absolute;${pos};width:14px;height:14px;border-${pos.includes("top") ? "top" : "bottom"}:2px solid ${p.accent};border-${pos.includes("left") ? "left" : "right"}:2px solid ${p.accent};"></div>`;
  return `
    ${corner("top:10px;left:10px")}${corner("top:10px;right:10px")}${corner("bottom:10px;left:10px")}${corner("bottom:10px;right:10px")}
    <div style="padding:24px;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;">
      <div style="font-size:9px;letter-spacing:3px;text-transform:uppercase;opacity:0.6;">${c.company || ""}</div>
      <div style="font-size:20px;font-weight:700;margin-top:4px;font-family:${hf};">${c.name || ""}</div>
      <div style="font-size:11px;opacity:0.7;">${c.title || ""}</div>
      <div style="height:1px;background:${p.accent};width:40px;margin:10px 0;"></div>
      <div style="font-size:9px;line-height:1.6;">${contactItems([c.phone, c.email, c.website])}</div>
    </div>`;
}

function cardDiagonal(c, p, hf, bf) {
  return `
    <div style="position:absolute;inset:0;background:${p.accentBg};clip-path:polygon(0 0, 100% 0, 100% 100%, 0 55%);"></div>
    <div style="position:absolute;top:16px;right:20px;text-align:right;color:${p.onAccent};">
      <div style="font-size:9px;letter-spacing:2px;text-transform:uppercase;opacity:0.8;">${c.company || ""}</div>
    </div>
    <div style="position:absolute;bottom:16px;left:20px;right:20px;">
      <div style="font-size:20px;font-weight:700;font-family:${hf};">${c.name || ""}</div>
      <div style="font-size:11px;opacity:0.7;">${c.title || ""}</div>
      <div style="height:1px;background:${p.accent};width:30px;margin:8px 0;"></div>
      <div style="font-size:9px;line-height:1.6;">${contactItems([c.phone, c.email, c.website])}</div>
    </div>`;
}

function cardVertical(c, p, hf, bf) {
  return `
    <div style="position:absolute;left:0;top:0;bottom:0;width:40px;background:${p.accentBg};"></div>
    <div style="margin-left:40px;padding:20px;height:100%;display:flex;align-items:center;">
      <div style="transform:rotate(-90deg);transform-origin:left center;white-space:nowrap;">
        <span style="font-size:20px;font-weight:700;font-family:${hf};">${c.name || ""}</span>
        <span style="font-size:11px;opacity:0.7;margin-left:10px;">${c.title || ""}</span>
      </div>
    </div>
    <div style="position:absolute;right:20px;bottom:16px;text-align:right;font-size:9px;line-height:1.6;">
      ${contactItems([c.company, c.phone, c.email, c.website])}
    </div>`;
}

function cardBadge(c, p, hf, bf) {
  return `
    <div style="padding:20px;height:100%;display:flex;align-items:center;gap:16px;">
      <div style="width:64px;height:64px;border-radius:50%;background:${p.accentBg};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        <span style="font-size:28px;font-weight:800;color:${p.onAccent};font-family:${hf};">${initial(c)}</span>
      </div>
      <div style="flex:1;">
        <div style="font-size:9px;letter-spacing:2px;text-transform:uppercase;opacity:0.6;">${c.company || ""}</div>
        <div style="font-size:18px;font-weight:700;margin-top:2px;font-family:${hf};">${c.name || ""}</div>
        <div style="font-size:11px;opacity:0.7;">${c.title || ""}</div>
        <div style="height:1px;background:${p.accent};width:30px;margin:6px 0;"></div>
        <div style="font-size:9px;line-height:1.5;">${contactItems([c.phone, c.email, c.website])}</div>
      </div>
    </div>`;
}

function cardMinimalLine(c, p, hf, bf) {
  return `
    <div style="padding:28px 24px;height:100%;display:flex;flex-direction:column;justify-content:center;">
      <div style="font-size:22px;font-weight:300;letter-spacing:-0.5px;font-family:${hf};">${c.name || ""}</div>
      <div style="font-size:11px;opacity:0.6;margin-top:2px;">${c.title || ""}${c.title && c.company ? " · " : ""}${c.company || ""}</div>
      <div style="height:2px;background:${p.accent};width:48px;margin:12px 0;"></div>
      <div style="font-size:9px;line-height:1.8;opacity:0.8;">${contactItems([c.phone, c.email, c.website])}</div>
    </div>`;
}

// ─── FLYER LAYOUTS (10) ───

function flyerHeroTop(c, p, hf, bf) {
  return `
    <div style="background:${p.accentBg};color:${p.onAccent};padding:36px 28px;min-height:200px;display:flex;flex-direction:column;justify-content:center;">
      <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;opacity:0.8;margin-bottom:8px;">${c.company || ""}</div>
      <div style="font-size:32px;font-weight:800;line-height:1.1;font-family:${hf};">${c.headline || c.company || ""}</div>
      <div style="font-size:14px;opacity:0.85;margin-top:8px;">${c.subheadline || ""}</div>
    </div>
    <div style="padding:24px 28px;flex:1;">
      <div style="font-size:12px;line-height:1.7;opacity:0.85;margin-bottom:16px;">${c.body || ""}</div>
      ${servicesList(c.services, p)}
      ${c.offer ? `<div style="margin-top:16px;padding:12px 16px;border:2px dashed ${p.accent};border-radius:8px;text-align:center;font-size:16px;font-weight:700;color:${p.accent};">${c.offer}</div>` : ""}
      <div style="margin-top:20px;padding-top:16px;border-top:1px solid ${p.accent}33;font-size:10px;line-height:1.6;">
        ${contactItems([c.phone, c.email, c.website, c.address])}
      </div>
    </div>`;
}

function flyerCenterFocus(c, p, hf, bf) {
  return `
    <div style="padding:40px 28px;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;">
      <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;opacity:0.6;margin-bottom:12px;">${c.company || ""}</div>
      <div style="font-size:36px;font-weight:800;line-height:1.1;font-family:${hf};">${c.headline || ""}</div>
      <div style="font-size:14px;opacity:0.7;margin-top:10px;">${c.subheadline || ""}</div>
      <div style="height:3px;width:48px;background:${p.accent};margin:20px 0;"></div>
      <div style="font-size:12px;line-height:1.7;opacity:0.8;max-width:300px;">${c.body || ""}</div>
      ${c.offer ? `<div style="margin-top:20px;padding:12px 24px;background:${p.accentBg};color:${p.onAccent};border-radius:24px;font-size:16px;font-weight:700;">${c.offer}</div>` : ""}
      ${c.cta ? `<div style="margin-top:14px;padding:10px 28px;background:${p.accent};color:${p.onAccent};border-radius:24px;font-size:13px;font-weight:600;">${c.cta}</div>` : ""}
    </div>
    <div style="padding:16px 28px;text-align:center;font-size:10px;line-height:1.6;border-top:1px solid ${p.accent}22;">
      ${[c.phone, c.email, c.website, c.address].filter(Boolean).join(" · ")}
    </div>`;
}

function flyerSplitHorizontal(c, p, hf, bf) {
  return `
    <div style="background:${p.accentBg};color:${p.onAccent};padding:32px 28px;flex:0 0 48%;display:flex;flex-direction:column;justify-content:center;">
      <div style="font-size:30px;font-weight:800;line-height:1.1;font-family:${hf};">${c.headline || ""}</div>
      <div style="font-size:14px;opacity:0.85;margin-top:8px;">${c.subheadline || ""}</div>
      ${c.offer ? `<div style="margin-top:16px;font-size:18px;font-weight:700;">${c.offer}</div>` : ""}
    </div>
    <div style="padding:24px 28px;flex:1;">
      <div style="font-size:12px;line-height:1.7;opacity:0.85;margin-bottom:14px;">${c.body || ""}</div>
      ${servicesList(c.services, p)}
      ${c.cta ? `<div style="margin-top:14px;padding:10px 24px;background:${p.accent};color:${p.onAccent};border-radius:8px;text-align:center;font-size:13px;font-weight:600;">${c.cta}</div>` : ""}
      <div style="margin-top:16px;padding-top:12px;border-top:1px solid ${p.accent}33;font-size:10px;line-height:1.6;">
        ${contactItems([c.phone, c.email, c.website, c.address])}
      </div>
    </div>`;
}

function flyerSidebar(c, p, hf, bf) {
  return `
    <div style="display:flex;flex:1;">
      <div style="background:${p.accentBg};color:${p.onAccent};width:130px;padding:24px 16px;display:flex;flex-direction:column;justify-content:space-between;">
        <div>
          <div style="font-size:9px;letter-spacing:2px;text-transform:uppercase;opacity:0.8;">${c.company || ""}</div>
          <div style="font-size:20px;font-weight:800;margin-top:8px;line-height:1.1;font-family:${hf};">${c.headline || ""}</div>
        </div>
        <div style="font-size:9px;line-height:1.6;">
          ${contactItems([c.phone, c.email, c.website, c.address])}
        </div>
      </div>
      <div style="flex:1;padding:24px 20px;">
        <div style="font-size:14px;font-weight:700;margin-bottom:8px;font-family:${hf};">${c.subheadline || ""}</div>
        <div style="font-size:12px;line-height:1.7;opacity:0.85;margin-bottom:14px;">${c.body || ""}</div>
        ${servicesList(c.services, p)}
        ${c.offer ? `<div style="margin-top:14px;padding:10px 16px;border:2px dashed ${p.accent};border-radius:8px;text-align:center;font-size:14px;font-weight:700;color:${p.accent};">${c.offer}</div>` : ""}
        ${c.cta ? `<div style="margin-top:12px;font-size:12px;font-weight:600;color:${p.accent};">${c.cta} →</div>` : ""}
      </div>
    </div>`;
}

function flyerGrid(c, p, hf, bf) {
  const svcs = (c.services || []).slice(0, 6);
  return `
    <div style="padding:28px;text-align:center;">
      <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;opacity:0.6;">${c.company || ""}</div>
      <div style="font-size:28px;font-weight:800;margin-top:4px;font-family:${hf};">${c.headline || ""}</div>
      <div style="font-size:13px;opacity:0.7;margin-top:4px;">${c.subheadline || ""}</div>
      <div style="height:3px;width:40px;background:${p.accent};margin:12px auto;"></div>
    </div>
    <div style="padding:0 24px;flex:1;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
        ${svcs.map((s, i) => `<div style="padding:14px;background:${p.accent}11;border-left:3px solid ${p.accent};border-radius:6px;"><div style="font-size:20px;font-weight:800;color:${p.accent};">${String(i + 1).padStart(2, "0")}</div><div style="font-size:11px;font-weight:600;margin-top:2px;">${s}</div></div>`).join("")}
      </div>
      ${c.offer ? `<div style="margin-top:16px;text-align:center;padding:12px;background:${p.accentBg};color:${p.onAccent};border-radius:8px;font-size:16px;font-weight:700;">${c.offer}</div>` : ""}
    </div>
    <div style="padding:16px 24px;text-align:center;font-size:10px;border-top:1px solid ${p.accent}22;">
      ${[c.phone, c.email, c.website].filter(Boolean).join(" · ")}
    </div>`;
}

function flyerPoster(c, p, hf, bf) {
  return `
    <div style="padding:32px 24px;flex:1;display:flex;flex-direction:column;justify-content:center;">
      <div style="font-size:52px;font-weight:900;line-height:0.95;letter-spacing:-1px;font-family:${hf};">${c.headline || ""}</div>
      <div style="font-size:16px;opacity:0.7;margin-top:8px;">${c.subheadline || ""}</div>
      <div style="height:4px;width:60px;background:${p.accent};margin:20px 0;"></div>
      <div style="font-size:13px;line-height:1.6;opacity:0.8;">${c.body || ""}</div>
      ${c.offer ? `<div style="margin-top:16px;font-size:20px;font-weight:800;color:${p.accent};">${c.offer}</div>` : ""}
    </div>
    <div style="background:${p.accentBg};color:${p.onAccent};padding:16px 24px;text-align:center;font-size:11px;font-weight:600;">
      ${[c.company, c.phone, c.website].filter(Boolean).join(" · ")}
    </div>`;
}

function flyerCoupon(c, p, hf, bf) {
  return `
    <div style="padding:24px;">
      <div style="border:3px dashed ${p.accent};border-radius:12px;padding:20px;text-align:center;background:${p.accent}08;">
        <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;opacity:0.6;">${c.company || ""}</div>
        <div style="font-size:28px;font-weight:800;margin-top:6px;font-family:${hf};">${c.headline || ""}</div>
        ${c.offer ? `<div style="margin-top:10px;display:inline-block;padding:8px 24px;background:${p.accentBg};color:${p.onAccent};border-radius:6px;font-size:22px;font-weight:800;">${c.offer}</div>` : ""}
        <div style="font-size:12px;opacity:0.7;margin-top:10px;">${c.subheadline || ""}</div>
      </div>
    </div>
    <div style="padding:0 24px 16px;flex:1;">
      <div style="font-size:12px;line-height:1.7;opacity:0.85;margin-bottom:14px;">${c.body || ""}</div>
      ${servicesList(c.services, p)}
      ${c.cta ? `<div style="margin-top:14px;padding:10px 24px;background:${p.accent};color:${p.onAccent};border-radius:8px;text-align:center;font-size:13px;font-weight:600;">${c.cta}</div>` : ""}
    </div>
    <div style="padding:12px 24px;text-align:center;font-size:10px;border-top:1px solid ${p.accent}22;">
      ${[c.phone, c.email, c.website, c.address].filter(Boolean).join(" · ")}
    </div>`;
}

function flyerEvent(c, p, hf, bf) {
  return `
    <div style="display:flex;align-items:stretch;">
      <div style="background:${p.accentBg};color:${p.onAccent};padding:20px 16px;text-align:center;min-width:90px;display:flex;flex-direction:column;justify-content:center;">
        <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;opacity:0.8;">OCT</div>
        <div style="font-size:36px;font-weight:900;line-height:1;font-family:${hf};">15</div>
        <div style="font-size:10px;opacity:0.8;">6:00 PM</div>
      </div>
      <div style="flex:1;padding:20px;display:flex;flex-direction:column;justify-content:center;">
        <div style="font-size:24px;font-weight:800;line-height:1.1;font-family:${hf};">${c.headline || ""}</div>
        <div style="font-size:13px;opacity:0.7;margin-top:4px;">${c.subheadline || ""}</div>
      </div>
    </div>
    <div style="padding:20px 24px;flex:1;">
      <div style="font-size:12px;line-height:1.7;opacity:0.85;margin-bottom:14px;">${c.body || ""}</div>
      ${servicesList(c.services, p)}
      <div style="margin-top:16px;padding:12px;background:${p.accent}11;border-radius:8px;">
        <div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:1px;opacity:0.6;">Venue</div>
        <div style="font-size:12px;margin-top:2px;">${c.address || ""}</div>
      </div>
    </div>
    <div style="padding:12px 24px;text-align:center;font-size:10px;border-top:1px solid ${p.accent}22;">
      ${[c.phone, c.email, c.website].filter(Boolean).join(" · ")}
    </div>`;
}

function flyerMenu(c, p, hf, bf) {
  const svcs = (c.services || []).slice(0, 8);
  return `
    <div style="padding:28px 24px;text-align:center;">
      <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;opacity:0.6;">${c.company || ""}</div>
      <div style="font-size:26px;font-weight:800;margin-top:4px;font-family:${hf};">${c.headline || ""}</div>
      <div style="height:2px;width:40px;background:${p.accent};margin:10px auto;"></div>
    </div>
    <div style="padding:0 28px;flex:1;">
      ${svcs.map((s, i) => `<div style="display:flex;align-items:baseline;gap:8px;padding:8px 0;border-bottom:1px dotted ${p.accent}33;"><span style="font-size:11px;font-weight:700;color:${p.accent};">${String(i + 1).padStart(2, "0")}</span><span style="font-size:12px;flex:1;">${s}</span></div>`).join("")}
      ${c.offer ? `<div style="margin-top:16px;text-align:center;font-size:16px;font-weight:700;color:${p.accent};">${c.offer}</div>` : ""}
    </div>
    <div style="padding:14px 24px;text-align:center;font-size:10px;border-top:1px solid ${p.accent}22;">
      ${[c.phone, c.email, c.website, c.address].filter(Boolean).join(" · ")}
    </div>`;
}

function flyerBanner(c, p, hf, bf) {
  return `
    <div style="background:${p.accentBg};color:${p.onAccent};padding:20px 24px;text-align:center;">
      <div style="font-size:30px;font-weight:900;letter-spacing:-0.5px;font-family:${hf};">${c.headline || ""}</div>
      <div style="font-size:13px;opacity:0.85;margin-top:4px;">${c.subheadline || ""}</div>
    </div>
    <div style="padding:24px;flex:1;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <div>
          <div style="font-size:12px;line-height:1.7;opacity:0.85;">${c.body || ""}</div>
          ${c.offer ? `<div style="margin-top:12px;padding:10px 16px;border:2px solid ${p.accent};border-radius:8px;text-align:center;font-size:14px;font-weight:700;color:${p.accent};">${c.offer}</div>` : ""}
        </div>
        <div>${servicesList(c.services, p)}</div>
      </div>
      ${c.cta ? `<div style="margin-top:16px;padding:12px;background:${p.accent};color:${p.onAccent};border-radius:8px;text-align:center;font-size:14px;font-weight:700;">${c.cta}</div>` : ""}
    </div>
    <div style="padding:12px 24px;text-align:center;font-size:10px;border-top:1px solid ${p.accent}22;">
      ${[c.phone, c.email, c.website, c.address].filter(Boolean).join(" · ")}
    </div>`;
}

const CARD_RENDERERS = {
  "left-bar": cardLeftBar,
  "center-stack": cardCenterStack,
  "split": cardSplit,
  "corner-mark": cardCornerMark,
  "monogram": cardMonogram,
  "frame": cardFrame,
  "diagonal": cardDiagonal,
  "vertical": cardVertical,
  "badge": cardBadge,
  "minimal-line": cardMinimalLine,
};

const FLYER_RENDERERS = {
  "hero-top": flyerHeroTop,
  "center-focus": flyerCenterFocus,
  "split-horizontal": flyerSplitHorizontal,
  "sidebar": flyerSidebar,
  "grid": flyerGrid,
  "poster": flyerPoster,
  "coupon": flyerCoupon,
  "event": flyerEvent,
  "menu": flyerMenu,
  "banner": flyerBanner,
};

export function renderCardFlyer(style, content, brand = {}) {
  const isCard = style.type === "business_card";
  const w = isCard ? 350 : 420;
  const h = isCard ? 200 : 595;
  const p = getPalette(style.colorTreatment, brand);
  const hf = style.headingFont || "Inter, system-ui, sans-serif";
  const bf = style.bodyFont || "Inter, system-ui, sans-serif";

  const renderer = isCard ? CARD_RENDERERS[style.layout] : FLYER_RENDERERS[style.layout];
  const inner = renderer ? renderer(content || {}, p, hf, bf) : "";

  const html = `<div class="cf-preview" style="width:${w}px;height:${h}px;background:${p.cardBg};color:${p.text};font-family:${bf};border:${p.border || "none"};position:relative;overflow:hidden;box-sizing:border-box;${isCard ? "" : "display:flex;flex-direction:column;"}">${inner}</div>`;

  return { html, designW: w, designH: h, frame: isCard ? "card" : "flyer" };
}