import { motion } from "framer-motion";
import { ArrowRight, Phone, Zap, Target, Building2, MapPin } from "lucide-react";
import { Image } from "@/components/ui/image";

const features = [
  { icon: Zap, text: "Fast website launch planning" },
  { icon: Target, text: "Conversion-focused premium designs" },
  { icon: Building2, text: "Built for 20+ industries" },
  { icon: MapPin, text: "Florida based nationwide reach" },
];

const BASE = "https://media.base44.com/images/public/6a77f4491f0bf92de9a3ed8b";
const sideCards = [
  { label: "Premier Roofing", img: `${BASE}/6a72c6e87_generated_image.png`, pos: "left-[6%] top-[16%] -rotate-6 z-10 opacity-80 w-60" },
  { label: "Epoxy Pros", img: `${BASE}/84000d10f_generated_image.png`, pos: "right-[6%] top-[26%] rotate-6 z-20 opacity-80 w-60" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 lg:pt-36 pb-20 lg:pb-28">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a1a2e] via-background to-background" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-accent/10 blur-[120px]" />
      <div className="absolute top-20 right-0 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-primary font-semibold tracking-[0.2em] text-xs sm:text-sm uppercase mb-4">
              Fast Websites. Real Leads. Bigger Business.
            </p>
            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight">
              Launch <span className="text-primary">100s</span> of Websites in{" "}
              <span className="text-primary">Minutes.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl">
              Explore premium, conversion-focused websites for high-value industries. Choose an industry,
              select a design, and launch your next site. Live builds and delivery are confirmed after approval.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#industries"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground hover:brightness-110 transition"
              >
                Browse Industries <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#templates"
                className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-secondary transition"
              >
                View Templates
              </a>
              <a
                href="tel:+17722090266"
                className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-secondary transition"
              >
                <Phone className="w-4 h-4" /> Call Now
              </a>
            </div>
            <ul className="mt-10 grid grid-cols-2 gap-4">
              {features.map((f) => (
                <li key={f.text} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="w-9 h-9 rounded-lg bg-secondary/60 border border-border flex items-center justify-center text-primary shrink-0">
                    <f.icon className="w-4 h-4" />
                  </span>
                  {f.text}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative hidden lg:block h-[520px]"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              {sideCards.map((c) => (
                <div key={c.label} className={`absolute ${c.pos}`}>
                  <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xl">
                    <div className="aspect-[4/3] relative">
                      <Image src={c.img} alt={c.label} className="w-full h-full object-cover" />
                    </div>
                    <div className="px-4 py-2.5 flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">{c.label}</span>
                    </div>
                  </div>
                </div>
              ))}
              <div className="relative z-30 w-72 scale-105 rounded-xl border border-primary/30 bg-card overflow-hidden shadow-2xl shadow-primary/10">
                <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border">
                  <span className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-primary/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-accent/60" />
                  <span className="ml-3 text-[10px] text-muted-foreground">nationwidepros.com</span>
                </div>
                <div className="aspect-[4/3] relative">
                  <Image src={`${BASE}/73200760e_generated_image.png`} alt="Legal Edge" className="w-full h-full object-cover" />
                </div>
                <div className="px-4 py-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">Legal Edge</span>
                  <span className="text-[10px] text-primary">● ● ●</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}