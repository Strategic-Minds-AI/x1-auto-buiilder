/**
 * Shared premium brand system for the website factory.
 * Every palette includes the complete UI/website color role mapping so a selection
 * can drive previews, generated prompts, and saved project brand tokens consistently.
 */
export const BRAND_PALETTES = [
  { id: "electric-midnight", name: "Electric Midnight", primary: "#05070B", surface: "#0B1220", ink: "#FFFFFF", muted: "#9AAAC0", accent: "#176BFF", accent2: "#00D4FF", gradient: "linear-gradient(115deg,#176BFF 0%,#00D4FF 100%)", mood: "futuristic, precise, premium" },
  { id: "arctic-circuit", name: "Arctic Circuit", primary: "#06111C", surface: "#0D1C2B", ink: "#F7FBFF", muted: "#A8C0D6", accent: "#00C2FF", accent2: "#5577FF", gradient: "linear-gradient(115deg,#00C2FF,#5577FF)", mood: "clean technology, confident" },
  { id: "royal-velocity", name: "Royal Velocity", primary: "#080817", surface: "#14142B", ink: "#FFFFFF", muted: "#B4B4D0", accent: "#6548FF", accent2: "#00B8FF", gradient: "linear-gradient(115deg,#6548FF,#00B8FF)", mood: "bold, innovative, high-end" },
  { id: "deep-ocean", name: "Deep Ocean", primary: "#04131B", surface: "#0B2633", ink: "#F1FCFF", muted: "#9CBCC6", accent: "#00B6C7", accent2: "#287BFF", gradient: "linear-gradient(115deg,#00B6C7,#287BFF)", mood: "calm, technical, trustworthy" },
  { id: "blueprint-pro", name: "Blueprint Pro", primary: "#07152D", surface: "#102443", ink: "#FFFFFF", muted: "#AABBD5", accent: "#3478F6", accent2: "#8CB8FF", gradient: "linear-gradient(115deg,#245BDB,#4AB7FF)", mood: "professional, engineered, reliable" },
  { id: "cyber-lime", name: "Cyber Lime", primary: "#090D0B", surface: "#151D18", ink: "#F8FFF9", muted: "#A8BBAE", accent: "#B6F23A", accent2: "#00D9A6", gradient: "linear-gradient(115deg,#B6F23A,#00D9A6)", mood: "energetic, modern, disruptive" },
  { id: "emerald-command", name: "Emerald Command", primary: "#06130E", surface: "#10251B", ink: "#F4FFF8", muted: "#A4C4B2", accent: "#10B981", accent2: "#6EE7B7", gradient: "linear-gradient(115deg,#059669,#6EE7B7)", mood: "growth, stability, sustainability" },
  { id: "gold-standard", name: "Gold Standard", primary: "#100D08", surface: "#21190D", ink: "#FFF9ED", muted: "#C9BDA5", accent: "#E9B949", accent2: "#FFF0B3", gradient: "linear-gradient(115deg,#B7791F,#F6D365)", mood: "luxury, authority, craftsmanship" },
  { id: "copper-forge", name: "Copper Forge", primary: "#130C0A", surface: "#281713", ink: "#FFF8F4", muted: "#C8AAA0", accent: "#F07845", accent2: "#F5B66B", gradient: "linear-gradient(115deg,#C44D2B,#F5B66B)", mood: "crafted, warm, premium" },
  { id: "crimson-edge", name: "Crimson Edge", primary: "#12080C", surface: "#261018", ink: "#FFF8FA", muted: "#CDAAB5", accent: "#F43F5E", accent2: "#FB7185", gradient: "linear-gradient(115deg,#BE123C,#FB7185)", mood: "urgent, bold, confident" },
  { id: "violet-signal", name: "Violet Signal", primary: "#0C0818", surface: "#1D1531", ink: "#FCF9FF", muted: "#B9AACF", accent: "#A855F7", accent2: "#6366F1", gradient: "linear-gradient(115deg,#A855F7,#6366F1)", mood: "creative, expressive, premium" },
  { id: "rose-quartz", name: "Rose Quartz", primary: "#140B10", surface: "#291721", ink: "#FFF8FB", muted: "#D1B2C1", accent: "#F472B6", accent2: "#C084FC", gradient: "linear-gradient(115deg,#F472B6,#C084FC)", mood: "elegant, welcoming, contemporary" },
  { id: "glacier", name: "Glacier", primary: "#F5FAFF", surface: "#FFFFFF", ink: "#102033", muted: "#52667D", accent: "#176BFF", accent2: "#00B8D9", gradient: "linear-gradient(115deg,#176BFF,#00B8D9)", mood: "bright, accessible, clinical-clean" },
  { id: "ivory-lux", name: "Ivory Luxury", primary: "#FAF7F0", surface: "#FFFFFF", ink: "#25211B", muted: "#766D60", accent: "#98733C", accent2: "#C8A86B", gradient: "linear-gradient(115deg,#98733C,#D7BD83)", mood: "editorial, understated, luxury" },
  { id: "sage-studio", name: "Sage Studio", primary: "#F3F6F0", surface: "#FFFFFF", ink: "#1F3026", muted: "#5E7265", accent: "#4D7C5B", accent2: "#A3B18A", gradient: "linear-gradient(115deg,#4D7C5B,#A3B18A)", mood: "natural, thoughtful, grounded" },
  { id: "terracotta-house", name: "Terracotta House", primary: "#FFF7F1", surface: "#FFFFFF", ink: "#38231B", muted: "#80665B", accent: "#C45D3A", accent2: "#E6A477", gradient: "linear-gradient(115deg,#C45D3A,#E6A477)", mood: "hospitality, warmth, authenticity" },
  { id: "monochrome-studio", name: "Monochrome Studio", primary: "#080808", surface: "#171717", ink: "#FFFFFF", muted: "#A3A3A3", accent: "#E5E5E5", accent2: "#737373", gradient: "linear-gradient(115deg,#737373,#E5E5E5)", mood: "minimal, architectural, editorial" },
  { id: "cobalt-pop", name: "Cobalt Pop", primary: "#080C1D", surface: "#141C38", ink: "#FFFFFF", muted: "#B2BDDD", accent: "#3B5BFF", accent2: "#FF4FD8", gradient: "linear-gradient(115deg,#3B5BFF,#FF4FD8)", mood: "youthful, digital, expressive" },
  { id: "tropical-current", name: "Tropical Current", primary: "#061514", surface: "#0D2926", ink: "#F3FFFC", muted: "#A6C9C2", accent: "#14B8A6", accent2: "#A3E635", gradient: "linear-gradient(115deg,#14B8A6,#A3E635)", mood: "fresh, vibrant, optimistic" },
  { id: "signal-orange", name: "Signal Orange", primary: "#101010", surface: "#202020", ink: "#FFFFFF", muted: "#B8B8B8", accent: "#FF6B35", accent2: "#FFC145", gradient: "linear-gradient(115deg,#FF6B35,#FFC145)", mood: "action-oriented, energetic, clear" },
];

export const DEFAULT_BRAND_PALETTE = BRAND_PALETTES[0];

export function getBrandPalette(id) {
  return BRAND_PALETTES.find((palette) => palette.id === id) || DEFAULT_BRAND_PALETTE;
}
