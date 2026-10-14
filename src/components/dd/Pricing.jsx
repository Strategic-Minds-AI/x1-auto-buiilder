import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const tiers = [
  {
    name: "One Great Website",
    desc: "For a business ready to launch a polished, conversion-focused digital home.",
    featured: false,
  },
  {
    name: "Multi-Market Expansion",
    desc: "For teams exploring more than one verified target market with distinctive content.",
    featured: true,
  },
  {
    name: "Website Factory",
    desc: "For larger approved portfolios with preview, validation, and release controls.",
    featured: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="text-primary font-semibold tracking-[0.2em] text-xs uppercase mb-3">Built To Grow</p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl">Launch One. Grow With Confidence.</h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Choose a launch path that matches your real business goals. Exact scope and pricing are confirmed in a
            proposal.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className={`relative rounded-2xl border p-7 flex flex-col ${
                t.featured ? "border-primary/40 bg-card shadow-lg shadow-primary/5" : "border-border bg-card"
              }`}
            >
              {t.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-[10px] font-bold tracking-wide text-primary-foreground">
                  MOST POPULAR
                </span>
              )}
              <h3 className="font-display font-bold text-xl text-foreground">{t.name}</h3>
              <p className="mt-3 text-sm text-muted-foreground flex-1">{t.desc}</p>
              <a
                href="#contact"
                className={`mt-6 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition ${
                  t.featured
                    ? "bg-accent text-accent-foreground hover:brightness-110"
                    : "border border-border text-foreground hover:bg-secondary"
                }`}
              >
                Get a tailored quote <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}