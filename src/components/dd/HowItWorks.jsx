import { motion } from "framer-motion";
import { LayoutGrid, Eye, Palette, ShieldCheck } from "lucide-react";

const steps = [
  { n: "01", icon: LayoutGrid, title: "Choose Your Industry", desc: "Explore the industry gallery and select your business category." },
  { n: "02", icon: Eye, title: "Pick a Real Template", desc: "Open a full-page preview and review the design before choosing it." },
  { n: "03", icon: Palette, title: "Customize Your Brand", desc: "Define the colors, content, service offering, and markets you need." },
  { n: "04", icon: ShieldCheck, title: "Approve Before Launch", desc: "Review the completed preview, run validation, and approve any release." },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="text-primary font-semibold tracking-[0.2em] text-xs uppercase mb-3">Simple Process</p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl">How It Works</h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Choose a design, see the details, and approve what gets built. No surprises and no unreviewed launches.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="relative rounded-2xl border border-border bg-card p-6"
            >
              <div className="text-primary font-display font-bold text-3xl mb-4">{s.n}</div>
              <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center text-primary mb-4">
                <s.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}