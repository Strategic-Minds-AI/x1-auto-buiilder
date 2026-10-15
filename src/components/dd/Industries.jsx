import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Image } from "@/components/ui/image";

const BASE = "https://media.base44.com/images/public/6a77f4491f0bf92de9a3ed8b";
const industries = [
  { name: "Legal", img: `${BASE}/73200760e_generated_image.png` },
  { name: "Real Estate", img: `${BASE}/aac8fa18c_generated_image.png` },
  { name: "Epoxy Flooring", img: `${BASE}/84000d10f_generated_image.png` },
  { name: "Roofing", img: `${BASE}/6a72c6e87_generated_image.png` },
  { name: "HVAC", img: `${BASE}/8e9292cb0_generated_image.png` },
  { name: "Plumbing", img: `${BASE}/1d3f41b69_generated_image.png` },
  { name: "Electrical", img: `${BASE}/22e023aa5_generated_image.png` },
  { name: "Med Spa", img: `${BASE}/d89216fde_generated_image.png` },
  { name: "Dental", img: `${BASE}/b091621aa_generated_image.png` },
  { name: "Chiropractic", img: `${BASE}/4d25674b7_generated_image.png` },
  { name: "Remodeling", img: `${BASE}/facd44e18_generated_image.png` },
  { name: "Landscaping", img: `${BASE}/771c1b32a_generated_image.png` },
  { name: "Solar", img: `${BASE}/6a2dd529e_generated_image.png` },
  { name: "Pest Control", img: `${BASE}/48c18e646_generated_image.png` },
  { name: "Moving", img: "https://media.base44.com/images/public/6acfedce320afe2f706c6bfd/45c755cef_generated_image.png" },
  { name: "Auto Detailing", img: "https://media.base44.com/images/public/6acfedce320afe2f706c6bfd/7ea2bef36_generated_image.png" },
  { name: "Restaurants", img: "https://media.base44.com/images/public/6acfedce320afe2f706c6bfd/5836c1a12_generated_image.png" },
  { name: "Insurance", img: "https://media.base44.com/images/public/6acfedce320afe2f706c6bfd/f28e53677_generated_image.png" },
  { name: "Mortgage", img: "https://media.base44.com/images/public/6acfedce320afe2f706c6bfd/24dd67241_generated_image.png" },
  { name: "Cleaning Services", img: "https://media.base44.com/images/public/6acfedce320afe2f706c6bfd/358b2dd14_generated_image.png" },
];

export default function Industries() {
  return (
    <section id="industries" className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-primary font-semibold tracking-[0.2em] text-xs uppercase mb-3">Our Solutions</p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl">Top 20 Industries</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl">
              Premium website concepts for the businesses that power the economy. Select an industry to explore
              its designs.
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
            <motion.a
              key={ind.name}
              href="#templates"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: (i % 5) * 0.05 }}
              className="group relative rounded-2xl overflow-hidden border border-border bg-card"
            >
              <div className="aspect-[4/5] relative">
                <Image
                  src={ind.img}
                  alt={ind.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
              </div>
              <div className="absolute bottom-0 inset-x-0 p-4">
                <span className="text-sm font-semibold text-foreground">{ind.name}</span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}