// 20 distinct website layout renderers. Each produces a VISUALLY DIFFERENT
// mini-website preview at 760×460. Layouts differ in structure, typography,
// background treatment, and visual elements — not just rearrangement.

const FS = (n) => `font-size:calc(${n}px * var(--vg-font-scale,1))`;

function isDark(hex) {
  if (!hex) return true;
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) < 140;
}

function onAccent(accent, tone) {
  return isDark(tone) ? '#ffffff' : (isDark(accent) ? '#ffffff' : '#0b1523');
}

function navBar(t, opts = {}) {
  const dark = isDark(t.tone);
  const border = dark ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.08)';
  const muted = dark ? 'rgba(255,255,255,.6)' : 'rgba(0,0,0,.55)';
  const name = (t.name || 'Brand').split(' ');
  const pad = opts.pad || '14px 32px';
  return `
    <div style="display:flex;align-items:center;padding:${pad};gap:20px;border-bottom:1px solid ${border}">
      <span style="font-weight:800;${FS(14)};color:${t.ink};letter-spacing:-.02em">${name[0]}<b style="color:${t.accent}">${name.slice(1).join(' ') ? ' ' + name.slice(1).join(' ') : ''}</b></span>
      <div style="flex:1"></div>
      <span style="${FS(11)};color:${muted};font-weight:600">Services</span>
      <span style="${FS(11)};color:${muted};font-weight:600">Work</span>
      <span style="${FS(11)};color:${muted};font-weight:600">About</span>
      <span style="${FS(11)};color:${muted};font-weight:600">Contact</span>
      <span style="display:inline-flex;padding:7px 16px;border-radius:9999px;background:${t.accent};color:${onAccent(t.accent, t.tone)};${FS(11)};font-weight:800">${t.cta || 'Get Started'}</span>
    </div>`;
}

function heroImg(t, w, h) {
  if (!t.photo) return '';
  return `<img src="https://images.unsplash.com/${t.photo}?w=${w}&q=80" style="width:100%;height:100%;object-fit:cover" />`;
}

// ── 1. CENTERED — big centered headline, lots of whitespace ────
function layoutCentered(t) {
  const dark = isDark(t.tone);
  return `<div class="vg-screen" style="background:${t.tone};color:${t.ink};font-family:Inter,sans-serif;display:flex;flex-direction:column">
    ${navBar(t)}
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:20px 60px">
      ${t.eyebrow ? `<div style="${FS(10)};font-weight:800;letter-spacing:.25em;text-transform:uppercase;color:${t.accent};margin-bottom:14px">${t.eyebrow}</div>` : ''}
      <div style="${FS(36)};font-weight:900;line-height:1.05;letter-spacing:-.03em;max-width:520px;margin-bottom:14px">${t.head || t.name}</div>
      <div style="${FS(13)};line-height:1.6;opacity:.7;max-width:400px;margin-bottom:22px">${t.sub || ''}</div>
      <div style="display:flex;gap:12px">
        <span style="padding:12px 28px;border-radius:9999px;background:${t.accent};color:${onAccent(t.accent, t.tone)};${FS(12)};font-weight:800">${t.cta || 'Get Started'}</span>
        <span style="padding:12px 28px;border-radius:9999px;border:1px solid ${dark ? 'rgba(255,255,255,.2)' : 'rgba(0,0,0,.15)'};${FS(12)};font-weight:700">Learn More</span>
      </div>
    </div>
  </div>`;
}

// ── 2. SPLIT LEFT — text left, image right, hard 50/50 split ────
function layoutSplitLeft(t) {
  const dark = isDark(t.tone);
  const border = dark ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.08)';
  return `<div class="vg-screen" style="background:${t.tone};color:${t.ink};font-family:Inter,sans-serif;display:flex;flex-direction:column">
    ${navBar(t)}
    <div style="flex:1;display:flex;min-height:0">
      <div style="flex:1;display:flex;flex-direction:column;justify-content:center;padding:24px 36px;gap:10px">
        ${t.eyebrow ? `<div style="${FS(10)};font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:${t.accent}">${t.eyebrow}</div>` : ''}
        <div style="${FS(28)};font-weight:900;line-height:1.08;letter-spacing:-.03em">${t.head || t.name}</div>
        <div style="${FS(12)};line-height:1.6;opacity:.7;max-width:260px">${t.sub || ''}</div>
        <div style="display:flex;gap:10px;margin-top:6px">
          <span style="padding:11px 22px;border-radius:9999px;background:${t.accent};color:${onAccent(t.accent, t.tone)};${FS(11)};font-weight:800">${t.cta || 'Get Started'}</span>
          <span style="padding:11px 22px;border-radius:9999px;border:1px solid ${dark ? 'rgba(255,255,255,.2)' : 'rgba(0,0,0,.15)'};${FS(11)};font-weight:700">Explore</span>
        </div>
      </div>
      <div style="flex:1;border-left:1px solid ${border};overflow:hidden">${heroImg(t, 400, 400) || `<div style="width:100%;height:100%;background:${t.accent}22"></div>`}</div>
    </div>
  </div>`;
}

// ── 3. SPLIT RIGHT — image left, text right (mirror of split-left) ──
function layoutSplitRight(t) {
  const dark = isDark(t.tone);
  const border = dark ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.08)';
  return `<div class="vg-screen" style="background:${t.tone};color:${t.ink};font-family:Inter,sans-serif;display:flex;flex-direction:column">
    ${navBar(t)}
    <div style="flex:1;display:flex;min-height:0">
      <div style="flex:1;overflow:hidden;border-right:1px solid ${border}">${heroImg(t, 400, 400) || `<div style="width:100%;height:100%;background:${t.accent}22"></div>`}</div>
      <div style="flex:1;display:flex;flex-direction:column;justify-content:center;padding:24px 36px;gap:10px">
        ${t.eyebrow ? `<div style="${FS(10)};font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:${t.accent}">${t.eyebrow}</div>` : ''}
        <div style="${FS(28)};font-weight:900;line-height:1.08;letter-spacing:-.03em">${t.head || t.name}</div>
        <div style="${FS(12)};line-height:1.6;opacity:.7;max-width:260px">${t.sub || ''}</div>
        <div style="display:flex;gap:10px;margin-top:6px">
          <span style="padding:11px 22px;border-radius:9999px;background:${t.accent};color:${onAccent(t.accent, t.tone)};${FS(11)};font-weight:800">${t.cta || 'Get Started'}</span>
        </div>
      </div>
    </div>
  </div>`;
}

// ── 4. FULLSCREEN IMAGE — full-bleed photo with dark gradient overlay ──
function layoutFullscreenImage(t) {
  const bg = t.photo ? `https://images.unsplash.com/${t.photo}?w=800&q=80` : '';
  return `<div class="vg-screen" style="position:relative;font-family:Inter,sans-serif;overflow:hidden;background:${t.tone}">
    ${bg ? `<img src="${bg}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" />` : ''}
    <div style="position:absolute;inset:0;background:linear-gradient(135deg,${t.tone}ee 0%,${t.tone}99 60%,${t.tone}cc 100%)"></div>
    ${navBar({...t, tone: 'rgba(0,0,0,.3)', ink: '#fff'})}
    <div style="position:relative;flex:1;display:flex;flex-direction:column;justify-content:center;padding:24px 48px;gap:12px">
      ${t.eyebrow ? `<div style="${FS(10)};font-weight:800;letter-spacing:.25em;text-transform:uppercase;color:${t.accent}">${t.eyebrow}</div>` : ''}
      <div style="${FS(34)};font-weight:900;line-height:1.05;letter-spacing:-.03em;color:#fff;max-width:480px">${t.head || t.name}</div>
      <div style="${FS(13)};line-height:1.6;color:rgba(255,255,255,.8);max-width:360px">${t.sub || ''}</div>
      <div style="display:flex;gap:12px;margin-top:8px">
        <span style="padding:13px 30px;border-radius:9999px;background:${t.accent};color:${onAccent(t.accent, '#000')};${FS(12)};font-weight:800">${t.cta || 'Get Started'}</span>
        <span style="padding:13px 30px;border-radius:9999px;border:1px solid rgba(255,255,255,.3);color:#fff;${FS(12)};font-weight:700">Watch Video</span>
      </div>
    </div>
  </div>`;
}

// ── 5. VIDEO BG — gradient + play button, no nav bar, centered play ──
function layoutVideoBg(t) {
  return `<div class="vg-screen" style="background:linear-gradient(135deg,${t.tone} 0%,${t.accent}33 100%);color:${t.ink};font-family:Inter,sans-serif;display:flex;flex-direction:column;position:relative;overflow:hidden">
    <div style="position:absolute;top:-20%;right:-10%;width:300px;height:300px;border-radius:50%;background:${t.accent}22;filter:blur(60px)"></div>
    <div style="position:absolute;bottom:-15%;left:-5%;width:200px;height:200px;border-radius:50%;background:${t.accent}11;filter:blur(40px)"></div>
    ${navBar(t)}
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;position:relative;z-index:1;gap:14px;padding:20px">
      <div style="width:64px;height:64px;border-radius:50%;background:${t.accent};display:flex;align-items:center;justify-content:center;margin-bottom:6px;box-shadow:0 8px 24px ${t.accent}55">
        <span style="color:${onAccent(t.accent, t.tone)};font-size:24px;margin-left:4px">▶</span>
      </div>
      <div style="${FS(30)};font-weight:900;line-height:1.05;letter-spacing:-.03em;max-width:440px">${t.head || t.name}</div>
      <div style="${FS(13)};line-height:1.6;opacity:.7;max-width:340px">${t.sub || ''}</div>
      <span style="padding:12px 28px;border-radius:9999px;background:${t.accent};color:${onAccent(t.accent, t.tone)};${FS(12)};font-weight:800;margin-top:4px">${t.cta || 'Watch Now'}</span>
    </div>
  </div>`;
}

// ── 6. ASYMMETRIC — offset rotated image card, overlapping elements ──
function layoutAsymmetric(t) {
  const dark = isDark(t.tone);
  return `<div class="vg-screen" style="background:${t.tone};color:${t.ink};font-family:Inter,sans-serif;display:flex;flex-direction:column;position:relative;overflow:hidden">
    ${navBar(t)}
    <div style="flex:1;display:flex;position:relative;min-height:0">
      <div style="flex:1.2;display:flex;flex-direction:column;justify-content:center;padding:20px 32px;gap:10px;z-index:2">
        ${t.eyebrow ? `<div style="${FS(10)};font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:${t.accent}">${t.eyebrow}</div>` : ''}
        <div style="${FS(30)};font-weight:900;line-height:1.02;letter-spacing:-.04em">${t.head || t.name}</div>
        <div style="${FS(12)};line-height:1.6;opacity:.7;max-width:240px">${t.sub || ''}</div>
        <div style="display:flex;gap:10px;margin-top:6px">
          <span style="padding:11px 24px;border-radius:8px;background:${t.accent};color:${onAccent(t.accent, t.tone)};${FS(11)};font-weight:800">${t.cta || 'Start'}</span>
        </div>
      </div>
      <div style="position:absolute;right:-30px;top:20px;width:280px;height:320px;border-radius:20px;overflow:hidden;transform:rotate(4deg);box-shadow:0 20px 40px rgba(0,0,0,.3);border:3px solid ${t.accent}">
        ${heroImg(t, 300, 350) || `<div style="width:100%;height:100%;background:linear-gradient(135deg,${t.accent},${t.accent}88)"></div>`}
      </div>
    </div>
  </div>`;
}

// ── 7. PRODUCT FOCUS — centered product image card, gallery-style ──
function layoutProductFocus(t) {
  const dark = isDark(t.tone);
  return `<div class="vg-screen" style="background:${t.tone};color:${t.ink};font-family:Inter,sans-serif;display:flex;flex-direction:column">
    ${navBar(t)}
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:20px;text-align:center">
      <div style="width:200px;height:160px;border-radius:16px;overflow:hidden;box-shadow:0 16px 40px rgba(0,0,0,.25);border:1px solid ${t.accent}44">
        ${heroImg(t, 220, 180) || `<div style="width:100%;height:100%;background:linear-gradient(135deg,${t.accent},${t.accent}66)"></div>`}
      </div>
      <div style="${FS(26)};font-weight:900;letter-spacing:-.03em">${t.head || t.name}</div>
      <div style="${FS(12)};line-height:1.6;opacity:.7;max-width:320px">${t.sub || ''}</div>
      <div style="display:flex;gap:10px">
        <span style="padding:11px 26px;border-radius:9999px;background:${t.accent};color:${onAccent(t.accent, t.tone)};${FS(11)};font-weight:800">${t.cta || 'Buy Now'}</span>
        <span style="padding:11px 26px;border-radius:9999px;border:1px solid ${dark ? 'rgba(255,255,255,.2)' : 'rgba(0,0,0,.15)'};${FS(11)};font-weight:700">View Details</span>
      </div>
    </div>
  </div>`;
}

// ── 8. GRID CARDS — 4 feature cards in a row, card-heavy ───────
function layoutGridCards(t) {
  const dark = isDark(t.tone);
  const cardBg = dark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.04)';
  const icons = ['◆', '◈', '◉', '✦'];
  return `<div class="vg-screen" style="background:${t.tone};color:${t.ink};font-family:Inter,sans-serif;display:flex;flex-direction:column">
    ${navBar(t)}
    <div style="flex:1;display:flex;flex-direction:column;padding:20px 32px;gap:16px">
      <div style="text-align:center;gap:8px;display:flex;flex-direction:column">
        ${t.eyebrow ? `<div style="${FS(10)};font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:${t.accent}">${t.eyebrow}</div>` : ''}
        <div style="${FS(24)};font-weight:900;letter-spacing:-.03em">${t.head || t.name}</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:10px;flex:1">
        ${[0,1,2,3].map(i => `<div style="background:${cardBg};border:1px solid ${t.accent}33;border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:8px">
          <div style="width:32px;height:32px;border-radius:8px;background:${t.accent}22;display:flex;align-items:center;justify-content:center;color:${t.accent};${FS(16)};font-weight:900">${icons[i]}</div>
          <div style="${FS(12)};font-weight:800">${['Speed','Quality','Trust','Scale'][i]}</div>
          <div style="${FS(9)};opacity:.6;line-height:1.4">${t.sub || 'Built for performance and reliability.'}</div>
        </div>`).join('')}
      </div>
      <div style="text-align:center">
        <span style="display:inline-flex;padding:11px 28px;border-radius:9999px;background:${t.accent};color:${onAccent(t.accent, t.tone)};${FS(11)};font-weight:800">${t.cta || 'Get Started'}</span>
      </div>
    </div>
  </div>`;
}

// ── 9. CAROUSEL — slider with dots and arrows, image panel ─────
function layoutCarousel(t) {
  const dark = isDark(t.tone);
  return `<div class="vg-screen" style="background:${t.tone};color:${t.ink};font-family:Inter,sans-serif;display:flex;flex-direction:column">
    ${navBar(t)}
    <div style="flex:1;display:flex;min-height:0">
      <div style="flex:1;display:flex;flex-direction:column;justify-content:center;padding:24px 36px;gap:12px">
        ${t.eyebrow ? `<div style="${FS(10)};font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:${t.accent}">${t.eyebrow}</div>` : ''}
        <div style="${FS(28)};font-weight:900;line-height:1.05;letter-spacing:-.03em">${t.head || t.name}</div>
        <div style="${FS(12)};line-height:1.6;opacity:.7;max-width:260px">${t.sub || ''}</div>
        <div style="display:flex;gap:6px;margin-top:8px;align-items:center">
          <span style="width:28px;height:4px;border-radius:2px;background:${t.accent}"></span>
          <span style="width:12px;height:4px;border-radius:2px;background:${dark ? 'rgba(255,255,255,.2)' : 'rgba(0,0,0,.15)'}"></span>
          <span style="width:12px;height:4px;border-radius:2px;background:${dark ? 'rgba(255,255,255,.2)' : 'rgba(0,0,0,.15)'}"></span>
          <span style="margin-left:12px;${FS(11)};opacity:.5;font-weight:700">01 / 03</span>
        </div>
      </div>
      <div style="flex:1;overflow:hidden;position:relative">
        ${heroImg(t, 400, 400) || `<div style="width:100%;height:100%;background:linear-gradient(135deg,${t.accent},${t.accent}44)"></div>`}
        <div style="position:absolute;bottom:16px;right:16px;display:flex;gap:8px">
          <span style="width:36px;height:36px;border-radius:50%;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;color:#fff;${FS(14)}">‹</span>
          <span style="width:36px;height:36px;border-radius:50%;background:${t.accent};display:flex;align-items:center;justify-content:center;color:${onAccent(t.accent, t.tone)};${FS(14)}">›</span>
        </div>
      </div>
    </div>
  </div>`;
}

// ── 10. MINIMAL — ultra-thin font, no button border, accent line ──
function layoutMinimal(t) {
  return `<div class="vg-screen" style="background:${t.tone};color:${t.ink};font-family:Inter,sans-serif;display:flex;flex-direction:column">
    ${navBar(t)}
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:20px;gap:20px">
      <div style="${FS(42)};font-weight:200;line-height:1.1;letter-spacing:-.04em;max-width:500px">${t.head || t.name}</div>
      <div style="width:40px;height:2px;background:${t.accent}"></div>
      <div style="${FS(12)};opacity:.6;max-width:300px;line-height:1.6">${t.sub || ''}</div>
      <span style="padding:12px 30px;border-radius:0;background:${t.accent};color:${onAccent(t.accent, t.tone)};${FS(11)};font-weight:800;letter-spacing:.1em;text-transform:uppercase;margin-top:4px">${t.cta || 'Start'}</span>
    </div>
  </div>`;
}

// ── 11. MAGAZINE — serif italic, editorial, byline, feature tag ──
function layoutMagazine(t) {
  const dark = isDark(t.tone);
  return `<div class="vg-screen" style="background:${t.tone};color:${t.ink};font-family:Georgia,serif;display:flex;flex-direction:column">
    ${navBar(t)}
    <div style="flex:1;display:flex;min-height:0">
      <div style="flex:1.3;display:flex;flex-direction:column;justify-content:center;padding:24px 36px;gap:14px">
        <div style="display:flex;align-items:center;gap:10px">
          <span style="padding:3px 10px;background:${t.accent};color:${onAccent(t.accent, t.tone)};${FS(9)};font-weight:800;font-family:Inter,sans-serif;letter-spacing:.1em">FEATURE</span>
          <span style="${FS(10)};opacity:.5;font-family:Inter,sans-serif;letter-spacing:.1em;text-transform:uppercase">${t.eyebrow || 'Story'}</span>
        </div>
        <div style="${FS(32)};font-weight:700;line-height:1.1;letter-spacing:-.02em;font-style:italic">${t.head || t.name}</div>
        <div style="${FS(13)};line-height:1.7;opacity:.75;max-width:280px">${t.sub || ''}</div>
        <div style="display:flex;align-items:center;gap:10px;margin-top:6px">
          <div style="width:32px;height:32px;border-radius:50%;background:${t.accent}33"></div>
          <div>
            <div style="${FS(10)};font-weight:700;font-family:Inter,sans-serif">By Editor</div>
            <div style="${FS(9)};opacity:.5;font-family:Inter,sans-serif">5 min read</div>
          </div>
        </div>
      </div>
      <div style="flex:1;overflow:hidden">${heroImg(t, 380, 400) || `<div style="width:100%;height:100%;background:${t.accent}22"></div>`}</div>
    </div>
  </div>`;
}

// ── 12. SIDEBAR — app dashboard with left nav + KPI cards + chart ──
function layoutSidebar(t) {
  const dark = isDark(t.tone);
  const sideBg = dark ? 'rgba(0,0,0,.3)' : 'rgba(0,0,0,.04)';
  const items = ['Dashboard', 'Projects', 'Reports', 'Settings', 'Team'];
  return `<div class="vg-screen" style="background:${t.tone};color:${t.ink};font-family:Inter,sans-serif;display:flex">
    <div style="width:160px;background:${sideBg};border-right:1px solid ${dark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)'};padding:20px 0;display:flex;flex-direction:column;gap:4px">
      <div style="padding:0 20px 20px;font-weight:800;${FS(14)};color:${t.ink}">${(t.name || 'Brand').split(' ')[0]}<b style="color:${t.accent}">.</b></div>
      ${items.map((item, i) => `<div style="padding:10px 20px;${FS(11)};font-weight:${i === 0 ? '800' : '600'};color:${i === 0 ? t.accent : (dark ? 'rgba(255,255,255,.6)' : 'rgba(0,0,0,.55)')};background:${i === 0 ? (dark ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.03)') : 'transparent'};border-left:3px solid ${i === 0 ? t.accent : 'transparent'}">${item}</div>`).join('')}
    </div>
    <div style="flex:1;display:flex;flex-direction:column">
      <div style="padding:14px 28px;border-bottom:1px solid ${dark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)'};display:flex;align-items:center;gap:12px">
        <span style="${FS(14)};font-weight:800">${t.head || 'Dashboard'}</span>
        <div style="flex:1"></div>
        <span style="padding:7px 16px;border-radius:9999px;background:${t.accent};color:${onAccent(t.accent, t.tone)};${FS(10)};font-weight:800">${t.cta || 'New'}</span>
      </div>
      <div style="flex:1;padding:24px 28px;display:grid;grid-template-columns:1fr 1fr;gap:12px">
        ${[0,1,2,3].map(i => `<div style="background:${dark ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.03)'};border:1px solid ${dark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)'};border-radius:12px;padding:16px;display:flex;flex-direction:column;gap:8px">
          <div style="${FS(10)};opacity:.5;font-weight:600">${['Revenue','Users','Growth','Churn'][i]}</div>
          <div style="${FS(22)};font-weight:900">${['$48.2k','12,840','+24%','2.1%'][i]}</div>
          <div style="height:4px;border-radius:2px;background:${t.accent}33;overflow:hidden"><div style="height:100%;width:${[70,85,60,30][i]}%;background:${t.accent}"></div></div>
        </div>`).join('')}
      </div>
    </div>
  </div>`;
}

// ── 13. STATS — big numbers row, data-driven hero ──────────────
function layoutStats(t) {
  const dark = isDark(t.tone);
  return `<div class="vg-screen" style="background:${t.tone};color:${t.ink};font-family:Inter,sans-serif;display:flex;flex-direction:column">
    ${navBar(t)}
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:20px;padding:20px">
      ${t.eyebrow ? `<div style="${FS(10)};font-weight:800;letter-spacing:.25em;text-transform:uppercase;color:${t.accent}">${t.eyebrow}</div>` : ''}
      <div style="${FS(28)};font-weight:900;line-height:1.05;letter-spacing:-.03em;max-width:440px">${t.head || t.name}</div>
      <div style="display:flex;gap:32px;margin-top:8px">
        ${[['10K+','Clients'],['98%','Satisfaction'],['500+','Projects'],['24/7','Support']].map(([num, label]) => `<div style="display:flex;flex-direction:column;align-items:center;gap:4px">
          <div style="${FS(28)};font-weight:900;color:${t.accent}">${num}</div>
          <div style="${FS(10)};opacity:.6;font-weight:600;letter-spacing:.05em;text-transform:uppercase">${label}</div>
        </div>`).join('')}
      </div>
      <span style="padding:12px 30px;border-radius:9999px;background:${t.accent};color:${onAccent(t.accent, t.tone)};${FS(12)};font-weight:800;margin-top:8px">${t.cta || 'Get Started'}</span>
    </div>
  </div>`;
}

// ── 14. TESTIMONIAL — big quote mark, italic, avatar + stars ────
function layoutTestimonial(t) {
  const dark = isDark(t.tone);
  return `<div class="vg-screen" style="background:${t.tone};color:${t.ink};font-family:Inter,sans-serif;display:flex;flex-direction:column">
    ${navBar(t)}
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:18px;padding:30px 60px">
      <div style="${FS(48)};color:${t.accent};line-height:1;font-family:Georgia,serif">"</div>
      <div style="${FS(20)};font-weight:600;line-height:1.4;max-width:480px;font-style:italic">${t.head || t.sub || 'Exceptional service that transformed our business completely.'}</div>
      <div style="display:flex;align-items:center;gap:12px;margin-top:8px">
        <div style="width:44px;height:44px;border-radius:50%;background:${t.accent}33;border:2px solid ${t.accent}"></div>
        <div style="text-align:left">
          <div style="${FS(12)};font-weight:800">Jane Doe</div>
          <div style="${FS(10)};opacity:.6">CEO, Acme Corp</div>
        </div>
      </div>
      <div style="display:flex;gap:3px;margin-top:4px">
        ${[1,2,3,4,5].map(() => `<span style="color:${t.accent};${FS(14)}">★</span>`).join('')}
      </div>
    </div>
  </div>`;
}

// ── 15. DASHBOARD — SaaS app preview with KPIs + bar chart ──────
function layoutDashboard(t) {
  const dark = isDark(t.tone);
  const panelBg = dark ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.03)';
  return `<div class="vg-screen" style="background:${t.tone};color:${t.ink};font-family:Inter,sans-serif;display:flex;flex-direction:column">
    ${navBar(t)}
    <div style="flex:1;display:flex;min-height:0">
      <div style="flex:1;display:flex;flex-direction:column;justify-content:center;padding:20px 32px;gap:12px">
        ${t.eyebrow ? `<div style="${FS(10)};font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:${t.accent}">${t.eyebrow}</div>` : ''}
        <div style="${FS(26)};font-weight:900;line-height:1.05;letter-spacing:-.03em">${t.head || t.name}</div>
        <div style="${FS(12)};line-height:1.6;opacity:.7;max-width:240px">${t.sub || ''}</div>
        <div style="display:flex;gap:10px;margin-top:6px">
          <span style="padding:11px 22px;border-radius:8px;background:${t.accent};color:${onAccent(t.accent, t.tone)};${FS(11)};font-weight:800">${t.cta || 'Start Free'}</span>
        </div>
      </div>
      <div style="flex:1.1;background:${panelBg};border-left:1px solid ${dark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)'};padding:16px;display:flex;flex-direction:column;gap:10px">
        <div style="display:flex;gap:8px">
          ${[0,1,2].map(i => `<div style="flex:1;background:${dark ? 'rgba(255,255,255,.04)' : '#fff'};border:1px solid ${dark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)'};border-radius:8px;padding:10px">
            <div style="${FS(8)};opacity:.5;font-weight:600">${['MRR','Active','Churn'][i]}</div>
            <div style="${FS(16)};font-weight:900;margin-top:2px">${['$12.4k','1,284','3.2%'][i]}</div>
          </div>`).join('')}
        </div>
        <div style="flex:1;background:${dark ? 'rgba(255,255,255,.04)' : '#fff'};border:1px solid ${dark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)'};border-radius:8px;padding:12px;display:flex;flex-direction:column;gap:8px">
          <div style="${FS(10)};font-weight:700;opacity:.7">Weekly Activity</div>
          <div style="flex:1;display:flex;align-items:flex-end;gap:6px">
            ${[40,65,50,80,60,90,75].map((h) => `<div style="flex:1;height:${h}%;background:linear-gradient(to top,${t.accent},${t.accent}66);border-radius:3px 3px 0 0"></div>`).join('')}
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

// ── 16. LOGO WALL — trust badges row at bottom ─────────────────
function layoutLogoWall(t) {
  const dark = isDark(t.tone);
  const logoStyle = `${FS(13)};font-weight:800;opacity:.4;letter-spacing:-.02em`;
  return `<div class="vg-screen" style="background:${t.tone};color:${t.ink};font-family:Inter,sans-serif;display:flex;flex-direction:column">
    ${navBar(t)}
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:24px;padding:20px 40px">
      ${t.eyebrow ? `<div style="${FS(10)};font-weight:800;letter-spacing:.25em;text-transform:uppercase;color:${t.accent}">${t.eyebrow}</div>` : ''}
      <div style="${FS(28)};font-weight:900;line-height:1.05;letter-spacing:-.03em;max-width:440px">${t.head || t.name}</div>
      <div style="${FS(12)};opacity:.7;max-width:340px;line-height:1.6">${t.sub || ''}</div>
      <span style="padding:12px 28px;border-radius:9999px;background:${t.accent};color:${onAccent(t.accent, t.tone)};${FS(12)};font-weight:800">${t.cta || 'Get Started'}</span>
      <div style="width:100%;border-top:1px solid ${dark ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.08)'};padding-top:20px;display:flex;justify-content:center;gap:28px;flex-wrap:wrap">
        ${['ACME','VANTA','NEXUS','PRIME','FORGE','APEX'].map(l => `<span style="${logoStyle}">${l}</span>`).join('')}
      </div>
    </div>
  </div>`;
}

// ── 17. BOOKING — form panel on right with input fields ────────
function layoutBooking(t) {
  const dark = isDark(t.tone);
  const inputBg = dark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.04)';
  return `<div class="vg-screen" style="background:${t.tone};color:${t.ink};font-family:Inter,sans-serif;display:flex;flex-direction:column">
    ${navBar(t)}
    <div style="flex:1;display:flex;min-height:0">
      <div style="flex:1;display:flex;flex-direction:column;justify-content:center;padding:20px 32px;gap:10px">
        ${t.eyebrow ? `<div style="${FS(10)};font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:${t.accent}">${t.eyebrow}</div>` : ''}
        <div style="${FS(26)};font-weight:900;line-height:1.05;letter-spacing:-.03em">${t.head || t.name}</div>
        <div style="${FS(12)};line-height:1.6;opacity:.7;max-width:240px">${t.sub || ''}</div>
      </div>
      <div style="width:260px;background:${dark ? 'rgba(0,0,0,.2)' : 'rgba(0,0,0,.03)'};border-left:1px solid ${dark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)'};padding:20px;display:flex;flex-direction:column;gap:10px">
        <div style="${FS(13)};font-weight:800;margin-bottom:4px">Book Now</div>
        <div style="background:${inputBg};border:1px solid ${dark ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.08)'};border-radius:8px;padding:9px 12px;${FS(11)};opacity:.5">Select service</div>
        <div style="background:${inputBg};border:1px solid ${dark ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.08)'};border-radius:8px;padding:9px 12px;${FS(11)};opacity:.5">Choose date</div>
        <div style="background:${inputBg};border:1px solid ${dark ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.08)'};border-radius:8px;padding:9px 12px;${FS(11)};opacity:.5">Your name</div>
        <div style="background:${inputBg};border:1px solid ${dark ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.08)'};border-radius:8px;padding:9px 12px;${FS(11)};opacity:.5">Phone</div>
        <span style="padding:11px;border-radius:8px;background:${t.accent};color:${onAccent(t.accent, t.tone)};${FS(12)};font-weight:800;text-align:center;margin-top:4px">${t.cta || 'Book Now'}</span>
      </div>
    </div>
  </div>`;
}

// ── 18. GALLERY — 2×2 image grid on right, text on left ────────
function layoutGallery(t) {
  const dark = isDark(t.tone);
  return `<div class="vg-screen" style="background:${t.tone};color:${t.ink};font-family:Inter,sans-serif;display:flex;flex-direction:column">
    ${navBar(t)}
    <div style="flex:1;display:flex;min-height:0">
      <div style="width:200px;display:flex;flex-direction:column;justify-content:center;padding:20px 24px;gap:10px">
        ${t.eyebrow ? `<div style="${FS(10)};font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:${t.accent}">${t.eyebrow}</div>` : ''}
        <div style="${FS(22)};font-weight:900;line-height:1.05;letter-spacing:-.03em">${t.head || t.name}</div>
        <div style="${FS(11)};line-height:1.6;opacity:.7">${t.sub || ''}</div>
        <span style="padding:10px 20px;border-radius:9999px;background:${t.accent};color:${onAccent(t.accent, t.tone)};${FS(10)};font-weight:800;text-align:center;margin-top:4px">${t.cta || 'View'}</span>
      </div>
      <div style="flex:1;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:4px;padding:4px">
        ${[0,1,2,3].map(i => `<div style="background:${t.accent}22;border-radius:8px;overflow:hidden;display:flex;align-items:center;justify-content:center">
          <div style="${FS(24)};color:${t.accent};opacity:.4">${['◆','◈','◉','✦'][i]}</div>
        </div>`).join('')}
      </div>
    </div>
  </div>`;
}

// ── 19. TIMELINE — 4-step horizontal process with connected dots ──
function layoutTimeline(t) {
  const dark = isDark(t.tone);
  return `<div class="vg-screen" style="background:${t.tone};color:${t.ink};font-family:Inter,sans-serif;display:flex;flex-direction:column">
    ${navBar(t)}
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;padding:20px 32px">
      ${t.eyebrow ? `<div style="${FS(10)};font-weight:800;letter-spacing:.25em;text-transform:uppercase;color:${t.accent}">${t.eyebrow}</div>` : ''}
      <div style="${FS(24)};font-weight:900;text-align:center;letter-spacing:-.03em">${t.head || t.name}</div>
      <div style="display:flex;align-items:center;gap:0;width:100%;max-width:600px;margin-top:8px">
        ${[1,2,3,4].map((n, i) => `<div style="flex:1;display:flex;flex-direction:column;align-items:center;position:relative">
          <div style="width:40px;height:40px;border-radius:50%;background:${i === 0 ? t.accent : (dark ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.08)')};color:${i === 0 ? onAccent(t.accent, t.tone) : t.ink};display:flex;align-items:center;justify-content:center;font-weight:900;${FS(14)};z-index:2">${n}</div>
          <div style="${FS(10)};font-weight:700;margin-top:8px;text-align:center">${['Discover','Design','Build','Launch'][i]}</div>
          ${i < 3 ? `<div style="position:absolute;top:20px;left:50%;width:100%;height:2px;background:${dark ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.08)'};z-index:1"></div>` : ''}
        </div>`).join('')}
      </div>
      <span style="padding:12px 28px;border-radius:9999px;background:${t.accent};color:${onAccent(t.accent, t.tone)};${FS(12)};font-weight:800;margin-top:8px">${t.cta || 'Start'}</span>
    </div>
  </div>`;
}

// ── 20. BENTO — asymmetric grid with spanning cell + 4 small cells ──
function layoutBento(t) {
  const dark = isDark(t.tone);
  const cellBg = dark ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.03)';
  return `<div class="vg-screen" style="background:${t.tone};color:${t.ink};font-family:Inter,sans-serif;display:flex;flex-direction:column">
    ${navBar(t)}
    <div style="flex:1;padding:20px 28px;display:flex;flex-direction:column;gap:12px">
      <div style="display:flex;gap:10px;align-items:center">
        <div style="flex:1">
          ${t.eyebrow ? `<div style="${FS(10)};font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:${t.accent};margin-bottom:4px">${t.eyebrow}</div>` : ''}
          <div style="${FS(22)};font-weight:900;letter-spacing:-.03em">${t.head || t.name}</div>
        </div>
        <span style="padding:9px 20px;border-radius:9999px;background:${t.accent};color:${onAccent(t.accent, t.tone)};${FS(10)};font-weight:800">${t.cta || 'Start'}</span>
      </div>
      <div style="flex:1;display:grid;grid-template-columns:1.5fr 1fr 1fr;grid-template-rows:1fr 1fr;gap:8px">
        <div style="grid-row:span 2;background:${cellBg};border:1px solid ${t.accent}33;border-radius:14px;padding:16px;display:flex;flex-direction:column;justify-content:flex-end;gap:6px">
          <div style="${FS(16)};font-weight:900">${t.sub || 'Powerful features'}</div>
          <div style="${FS(10)};opacity:.6;line-height:1.5">Everything you need in one platform.</div>
        </div>
        ${[0,1,2,3].map(i => `<div style="background:${cellBg};border:1px solid ${dark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)'};border-radius:12px;padding:12px;display:flex;flex-direction:column;gap:6px">
          <div style="width:24px;height:24px;border-radius:6px;background:${t.accent}22;display:flex;align-items:center;justify-content:center;color:${t.accent};${FS(12)}">${['⚡','🔒','📊','🚀'][i]}</div>
          <div style="${FS(11)};font-weight:800">${['Fast','Secure','Insights','Scale'][i]}</div>
        </div>`).join('')}
      </div>
    </div>
  </div>`;
}

export const WEBSITE_LAYOUTS = {
  centered: layoutCentered,
  'split-left': layoutSplitLeft,
  'split-right': layoutSplitRight,
  'fullscreen-image': layoutFullscreenImage,
  'video-bg': layoutVideoBg,
  asymmetric: layoutAsymmetric,
  'product-focus': layoutProductFocus,
  'grid-cards': layoutGridCards,
  carousel: layoutCarousel,
  minimal: layoutMinimal,
  magazine: layoutMagazine,
  sidebar: layoutSidebar,
  stats: layoutStats,
  testimonial: layoutTestimonial,
  dashboard: layoutDashboard,
  'logo-wall': layoutLogoWall,
  booking: layoutBooking,
  gallery: layoutGallery,
  timeline: layoutTimeline,
  bento: layoutBento,
};

export function renderWebsiteLayout(template) {
  const fn = WEBSITE_LAYOUTS[template.layout] || layoutSplitLeft;
  return fn(template);
}