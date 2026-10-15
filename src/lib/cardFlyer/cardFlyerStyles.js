// Digital Business Card & Flyer Style Library
// 10 card layouts × 5 color treatments = 50 card styles
// 10 flyer layouts × 5 color treatments = 50 flyer styles
// Total: 100 unique style templates

export const CARD_LAYOUTS = [
  { id: "left-bar", name: "Left Bar", desc: "Color bar left, details right" },
  { id: "center-stack", name: "Centered", desc: "Centered text stack" },
  { id: "split", name: "Split", desc: "Top color, bottom white" },
  { id: "corner-mark", name: "Corner Mark", desc: "Diagonal corner accent" },
  { id: "monogram", name: "Monogram", desc: "Large background initial" },
  { id: "frame", name: "Framed", desc: "Corner-bracket frame" },
  { id: "diagonal", name: "Diagonal", desc: "Diagonal color split" },
  { id: "vertical", name: "Vertical", desc: "Rotated vertical text" },
  { id: "badge", name: "Badge", desc: "Circular badge + text" },
  { id: "minimal-line", name: "Minimal", desc: "Single accent line" },
];

export const FLYER_LAYOUTS = [
  { id: "hero-top", name: "Hero Top", desc: "Color hero, content below" },
  { id: "center-focus", name: "Center Focus", desc: "Large centered headline" },
  { id: "split-horizontal", name: "Split H", desc: "Top color, bottom white" },
  { id: "sidebar", name: "Sidebar", desc: "Left color sidebar" },
  { id: "grid", name: "Grid", desc: "Service grid layout" },
  { id: "poster", name: "Poster", desc: "Massive headline poster" },
  { id: "coupon", name: "Coupon", desc: "Dashed offer box" },
  { id: "event", name: "Event", desc: "Date badge + details" },
  { id: "menu", name: "Menu", desc: "Menu list style" },
  { id: "banner", name: "Banner", desc: "Headline banner band" },
];

export const COLOR_TREATMENTS = [
  { id: "solid", name: "Solid" },
  { id: "gradient", name: "Gradient" },
  { id: "split", name: "Two-Tone" },
  { id: "bordered", name: "Bordered" },
  { id: "inverted", name: "Inverted" },
];

export const TYPOGRAPHIES = [
  { id: "sans", name: "Sans", heading: "Inter, system-ui, sans-serif", body: "Inter, system-ui, sans-serif" },
  { id: "serif", name: "Serif", heading: "Georgia, 'Times New Roman', serif", body: "Georgia, 'Times New Roman', serif" },
  { id: "mono", name: "Mono", heading: "'Courier New', monospace", body: "'Courier New', monospace" },
  { id: "mixed", name: "Mixed", heading: "Georgia, serif", body: "Inter, system-ui, sans-serif" },
];

function generateStyles() {
  const cards = [];
  const flyers = [];

  CARD_LAYOUTS.forEach((layout, li) => {
    COLOR_TREATMENTS.forEach((color, ci) => {
      const typo = TYPOGRAPHIES[(li + ci) % TYPOGRAPHIES.length];
      cards.push({
        id: `card-${layout.id}-${color.id}`,
        name: `${layout.name} ${color.name}`,
        type: "business_card",
        layout: layout.id,
        layoutName: layout.name,
        colorTreatment: color.id,
        colorName: color.name,
        typography: typo.id,
        typographyName: typo.name,
        headingFont: typo.heading,
        bodyFont: typo.body,
        desc: layout.desc,
      });
    });
  });

  FLYER_LAYOUTS.forEach((layout, li) => {
    COLOR_TREATMENTS.forEach((color, ci) => {
      const typo = TYPOGRAPHIES[(li + ci + 1) % TYPOGRAPHIES.length];
      flyers.push({
        id: `flyer-${layout.id}-${color.id}`,
        name: `${layout.name} ${color.name}`,
        type: "flyer",
        layout: layout.id,
        layoutName: layout.name,
        colorTreatment: color.id,
        colorName: color.name,
        typography: typo.id,
        typographyName: typo.name,
        headingFont: typo.heading,
        bodyFont: typo.body,
        desc: layout.desc,
      });
    });
  });

  return { cards, flyers, all: [...cards, ...flyers] };
}

const generated = generateStyles();

export const CARD_STYLES = generated.cards;
export const FLYER_STYLES = generated.flyers;
export const ALL_STYLES = generated.all;

export const SAMPLE_CARD = {
  name: "Alex Morgan",
  title: "Creative Director",
  company: "Lumina Studio",
  phone: "(555) 123-4567",
  email: "alex@lumina.co",
  website: "lumina.co",
  address: "123 Design Ave, NYC",
  tagline: "Brand & Digital Excellence",
};

export const SAMPLE_FLYER = {
  company: "Lumina Studio",
  headline: "Grand Opening",
  subheadline: "Experience Something New",
  body: "Join us for our grand opening celebration with exclusive offers, live demos, and special guests. Don't miss this one-time event!",
  services: ["Free Consultations", "Live Demos", "Exclusive Offers", "Refreshments Served"],
  offer: "20% OFF First Visit",
  phone: "(555) 123-4567",
  email: "hello@lumina.co",
  website: "lumina.co",
  address: "123 Design Ave, New York",
  cta: "Visit Us Today",
};

export const DEFAULT_BRAND = {
  accent: "#00d4ff",
  ink: "#0b1523",
  tone: "#0b1523",
};