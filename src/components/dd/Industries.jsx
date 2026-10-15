import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Image } from "@/components/ui/image";
import { INDUSTRY_IMAGES, INDUSTRY_LIST } from "@/data/homeTemplates";

export default function Industries({ onSelectIndustry }) {
  const industries = INDUSTRY_LIST.map((name) => ({ name, img: INDUSTRY_IMAGES[name] }));

  const handleClick = (e, name) => {
    e.preventDefault();
    if (onSelectIndustry) {
      onSelectIndustry(name);
    }
  };

  return (
    <section id="industries" className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-primary font-semibold tracking-[0.2em] text-xs uppercase mb-3">Our Solutions</p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl">Top 20 Industries</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl">
              Premium website concepts for the businesses that power the economy. Click an industry to explore its designs.
            </p>
          </div>
          <a
            href="#templates"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all whitespace-nowrap"
          >
            Explore Templates <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {industries.map((ind, i) => (
            <motion.button
              key={ind.name}
              onClick={(e) => handleClick(e, ind.name)}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: (i % 5) * 0.05 }}
              className="group relative rounded-2xl overflow-hidden border border-border bg-card text-left hover:border-primary/40 transition-all duration-200"
            >
              <div className="aspect-[4/5] relative">
                <Image
                  src={ind.img}
                  alt={ind.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-background/40">
                  <span className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground inline-flex items-center gap-1.5">
                    View Templates <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
              <div className="absolute bottom-0 inset-x-0 p-4">
                <span className="text-sm font-semibold text-foreground">{ind.name}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}