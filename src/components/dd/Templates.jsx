import { motion } from "framer-motion";
import { Image } from "@/components/ui/image";

const categories = [
  { name: "All Styles", img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80" },
  { name: "Contractor", img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=80" },
  { name: "Health & Wellness", img: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80" },
  { name: "Legal", img: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&q=80" },
  { name: "Professional", img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80" },
  { name: "Real Estate", img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80" },
  { name: "Home Services", img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80" },
  { name: "Automotive", img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80" },
];

const BASE = "https://media.base44.com/images/public/6a77f4491f0bf92de9a3ed8b";
const featured = [
  { industry: "Electrical", img: `${BASE}/22e023aa5_generated_image.png` },
  { industry: "Roofing", img: `${BASE}/6a72c6e87_generated_image.png` },
  { industry: "Epoxy Flooring", img: `${BASE}/84000d10f_generated_image.png` },
  { industry: "Real Estate", img: `${BASE}/aac8fa18c_generated_image.png` },
  { industry: "Legal", img: `${BASE}/73200760e_generated_image.png` },
  { industry: "Landscaping", img: `${BASE}/771c1b32a_generated_image.png` },
];

export default function Templates() {
  return (
    <section id="templates" className="py-20 lg:py-28 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="text-primary font-semibold tracking-[0.2em] text-xs uppercase mb-3">Website Templates</p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl">Explore Real Templates</h2>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Preview full-page website concepts, then choose the exact design you want to customize.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 mb-12">
          {categories.map((c) => (
            <div key={c.name} className="group relative w-36 rounded-xl overflow-hidden border border-border">
              <div className="aspect-square relative">
                <Image src={c.img} alt={c.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-background/50 group-hover:bg-background/30 transition" />
              </div>
              <span className="absolute bottom-2 inset-x-0 text-center text-xs font-semibold text-foreground">
                {c.name}
              </span>
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((t, i) => (
            <motion.div
              key={t.industry}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
              className="group rounded-2xl overflow-hidden border border-border bg-card"
            >
              <div className="aspect-[16/10] relative">
                <Image
                  src={t.img}
                  alt={`${t.industry} template`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 rounded-full bg-background/80 backdrop-blur px-3 py-1 text-[10px] font-semibold text-primary tracking-wide">
                  ● ● ● {t.industry}
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-background/40">
                  <span className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground">
                    View Full Preview
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-foreground">{t.industry} / Signature Atelier</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Editorial split hero, numbered services and a quiet architectural rhythm.
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}