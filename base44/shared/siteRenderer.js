// Renders a WebsiteProject's generated content into a self-contained static HTML page.

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export function slugify(name) {
  const s = String(name || 'site').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48);
  return s || 'site';
}

function list(arr, render) {
  if (!Array.isArray(arr) || arr.length === 0) return '';
  return arr.map(render).join('');
}

export function renderSiteHtml(project) {
  const c = (project && project.content) || {};
  const br = (project && project.business_research) || {};
  const tokens = c.colorTokens || {};
  const primary = tokens.primary || '#00d4ff';
  const accent = tokens.accent || '#0ea5e9';
  const bg = tokens.background || '#0b1523';
  const text = '#e8eef7';
  const muted = '#9fb3c8';
  const card = 'rgba(255,255,255,0.04)';
  const businessName = project.business_name || br.businessName || 'Your Business';
  const tagline = br.tagline || (project.industry ? project.industry + ' experts' : '');
  const logo = project.logo_url || '';
  const heroImg = project.hero_image_url || '';
  const phone = br.phone || '';
  const email = br.email || '';
  const address = br.address || '';
  const hours = br.hours || '';
  const serviceArea = project.location || br.serviceArea || '';
  const hero = c.hero || {};
  const about = c.about || {};
  const finalCta = c.finalCta || {};

  const valuePropsHtml = list(c.valueProps, (v) => `
    <div class="card">
      <div class="dot"></div>
      <h3>${esc(v.title)}</h3>
      <p>${esc(v.description)}</p>
    </div>`);

  const servicesHtml = list(c.services, (s) => `
    <div class="card">
      <h3>${esc(s.title)}</h3>
      <p>${esc(s.description)}</p>
    </div>`);

  const processHtml = list(c.process, (p, i) => `
    <div class="step">
      <div class="step-num">${i + 1}</div>
      <div>
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.description)}</p>
      </div>
    </div>`);

  const faqsHtml = list(c.faqs, (f) => `
    <details class="faq">
      <summary>${esc(f.question)}</summary>
      <p>${esc(f.answer)}</p>
    </details>`);

  const testimonialsHtml = list(c.testimonials, (t) => `
    <figure class="card testimonial">
      <blockquote>"${esc(t.quote)}"</blockquote>
      <figcaption>— ${esc(t.author)}${t.role ? ', ' + esc(t.role) : ''}</figcaption>
    </figure>`);

  const contactLine = [phone, email, address, hours, serviceArea].filter(Boolean).map(esc).join(' &nbsp;·&nbsp; ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(businessName)}${tagline ? ' — ' + esc(tagline) : ''}</title>
<meta name="description" content="${esc(c.metaDescription || hero.subheadline || tagline)}">
<style>
  :root { --primary:${esc(primary)}; --accent:${esc(accent)}; --bg:${esc(bg)}; --text:${esc(text)}; --muted:${esc(muted)}; --card:${esc(card)}; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: var(--bg); color: var(--text); line-height: 1.6; }
  a { color: var(--primary); text-decoration: none; }
  img { max-width: 100%; display: block; }
  .wrap { max-width: 1120px; margin: 0 auto; padding: 0 24px; }
  header { position: sticky; top: 0; z-index: 10; background: rgba(11,21,35,0.85); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(255,255,255,0.08); }
  .nav { display: flex; align-items: center; justify-content: space-between; padding: 16px 0; }
  .brand { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 18px; }
  .brand img { width: 36px; height: 36px; border-radius: 8px; object-fit: cover; }
  .btn { display: inline-block; background: var(--primary); color: #0b1523; font-weight: 700; padding: 12px 24px; border-radius: 999px; }
  .btn:hover { filter: brightness(1.08); }
  .btn-ghost { background: transparent; border: 1px solid rgba(255,255,255,0.2); color: var(--text); }
  .hero { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 48px; align-items: center; padding: 80px 0 64px; }
  .hero h1 { font-size: clamp(32px, 5vw, 56px); line-height: 1.08; letter-spacing: -0.02em; margin-bottom: 18px; }
  .hero h1 span { color: var(--primary); }
  .hero p { color: var(--muted); font-size: 18px; margin-bottom: 28px; }
  .hero-cta { display: flex; gap: 14px; flex-wrap: wrap; }
  .hero-img { border-radius: 20px; overflow: hidden; aspect-ratio: 4/3; border: 1px solid rgba(255,255,255,0.08); }
  .hero-img img { width: 100%; height: 100%; object-fit: cover; }
  section { padding: 64px 0; }
  .eyebrow { color: var(--primary); font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; font-size: 12px; margin-bottom: 12px; }
  h2 { font-size: clamp(26px, 3.5vw, 38px); letter-spacing: -0.02em; margin-bottom: 36px; }
  .grid { display: grid; gap: 20px; }
  .grid-3 { grid-template-columns: repeat(3, 1fr); }
  .grid-2 { grid-template-columns: repeat(2, 1fr); }
  .card { background: var(--card); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 28px; }
  .card h3 { font-size: 19px; margin-bottom: 8px; }
  .card p { color: var(--muted); }
  .card .dot { width: 10px; height: 10px; border-radius: 50%; background: var(--primary); margin-bottom: 14px; }
  .step { display: flex; gap: 18px; align-items: flex-start; margin-bottom: 22px; }
  .step-num { flex: 0 0 40px; width: 40px; height: 40px; border-radius: 50%; background: var(--primary); color: #0b1523; font-weight: 700; display: flex; align-items: center; justify-content: center; }
  .step h3 { font-size: 18px; margin-bottom: 4px; }
  .step p { color: var(--muted); }
  .about { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; }
  .about p { color: var(--muted); font-size: 17px; }
  .faq { background: var(--card); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 20px 24px; margin-bottom: 12px; }
  .faq summary { font-weight: 600; cursor: pointer; font-size: 17px; }
  .faq p { color: var(--muted); margin-top: 10px; }
  .testimonial blockquote { font-size: 17px; font-style: italic; margin-bottom: 12px; }
  .testimonial figcaption { color: var(--muted); font-size: 14px; }
  .cta { text-align: center; background: linear-gradient(135deg, var(--primary), var(--accent)); color: #0b1523; border-radius: 24px; padding: 64px 32px; }
  .cta h2 { color: #0b1523; margin-bottom: 16px; }
  .cta .btn { background: #0b1523; color: #fff; }
  footer { border-top: 1px solid rgba(255,255,255,0.08); padding: 40px 0; color: var(--muted); font-size: 14px; }
  .foot { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
  @media (max-width: 860px) {
    .hero, .about { grid-template-columns: 1fr; }
    .grid-3, .grid-2 { grid-template-columns: 1fr; }
    .hero-img { order: -1; max-height: 280px; }
  }
</style>
</head>
<body>
<header><div class="wrap nav">
  <div class="brand">${logo ? `<img src="${esc(logo)}" alt="">` : ''}<span>${esc(businessName)}</span></div>
  ${phone ? `<a href="tel:${esc(phone.replace(/[^0-9+]/g, ''))}" class="btn btn-ghost">${esc(phone)}</a>` : ''}
</div></header>

<div class="wrap">
  <div class="hero">
    <div>
      <div class="eyebrow">${esc(project.industry || '')}${serviceArea ? ' · ' + esc(serviceArea) : ''}</div>
      <h1>${esc(hero.headline || 'Premium ' + (project.industry || 'Services'))}</h1>
      <p>${esc(hero.subheadline || tagline)}</p>
      <div class="hero-cta">
        ${hero.primaryCta ? `<a href="#contact" class="btn">${esc(hero.primaryCta)}</a>` : ''}
        ${hero.secondaryCta ? `<a href="#services" class="btn btn-ghost">${esc(hero.secondaryCta)}</a>` : ''}
      </div>
    </div>
    ${heroImg ? `<div class="hero-img"><img src="${esc(heroImg)}" alt="${esc(businessName)}"></div>` : ''}
  </div>
</div>

${valuePropsHtml ? `<section><div class="wrap">
  <div class="eyebrow">Why Choose Us</div><h2>Built to win ${esc(project.industry || '')} clients</h2>
  <div class="grid grid-3">${valuePropsHtml}</div>
</div></section>` : ''}

${servicesHtml ? `<section id="services"><div class="wrap">
  <div class="eyebrow">Services</div><h2>What we do</h2>
  <div class="grid grid-2">${servicesHtml}</div>
</div></section>` : ''}

${about.headline ? `<section><div class="wrap"><div class="about">
  <div>
    <div class="eyebrow">About</div><h2 style="margin-bottom:18px">${esc(about.headline)}</h2>
    <p>${esc(about.body)}</p>
  </div>
  ${heroImg ? `<div class="hero-img"><img src="${esc(heroImg)}" alt=""></div>` : '<div></div>'}
</div></div></section>` : ''}

${processHtml ? `<section><div class="wrap">
  <div class="eyebrow">How It Works</div><h2>Our process</h2>
  ${processHtml}
</div></section>` : ''}

${testimonialsHtml ? `<section><div class="wrap">
  <div class="eyebrow">Reviews</div><h2>What clients say</h2>
  <div class="grid grid-2">${testimonialsHtml}</div>
</div></section>` : ''}

${faqsHtml ? `<section><div class="wrap">
  <div class="eyebrow">FAQ</div><h2>Common questions</h2>
  ${faqsHtml}
</div></section>` : ''}

${finalCta.headline ? `<section id="contact"><div class="wrap">
  <div class="cta">
    <h2>${esc(finalCta.headline)}</h2>
    ${finalCta.button ? `<a href="${phone ? 'tel:' + esc(phone.replace(/[^0-9+]/g, '')) : 'mailto:' + esc(email || '')}" class="btn">${esc(finalCta.button)}</a>` : ''}
  </div>
</div></section>` : ''}

<footer><div class="wrap foot">
  <div><strong>${esc(businessName)}</strong>${tagline ? ' — ' + esc(tagline) : ''}</div>
  <div>${contactLine}</div>
</div></footer>
</body>
</html>`;
}