import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { Loader2, Search, X, ArrowRight, Sparkles } from "lucide-react";
import TemplatePreviewModal from "@/components/dd/TemplatePreviewModal";

const CATEGORY_TABS = [
  "All", "Roofing", "Electrical", "Legal", "Real Estate", "Medical", "Dental",
  "HVAC", "Plumbing", "Automotive", "Hospitality", "Fitness", "Finance", "Agency",
];

const FALLBACK_TEMPLATES = [
  { id: "f1", template_id: "FB1", name: "Premier Roofing Co.", category: "website", industry: "Roofing", family: "Bold industrial authority", layout: "split-left", tone: "#0f172a", ink: "#f8fafc", accent: "#f59e0b", head: "Built to Last. Trusted by Thousands.", sub: "Storm-ready roofing for Florida homes and businesses.", eyebrow: "Licensed & Insured", cta: "Get Free Estimate", feature: "Lifetime Warranty", feature_copy: "Every installation backed by our 25-year workmanship guarantee.", photo: "photo-1504307651254-35680f356dfd", img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80" },
  { id: "f2", template_id: "FB2", name: "Nova Electrical", category: "website", industry: "Electrical", family: "Clean technical precision", layout: "centered", tone: "#0a0e14", ink: "#ffffff", accent: "#00d4ff", head: "Powering Your World, Safely.", sub: "Licensed electricians for residential and commercial projects.", eyebrow: "24/7 Emergency Service", cta: "Schedule Inspection", feature: "Same-Day Response", feature_copy: "Emergency calls answered within the hour, every day.", photo: "photo-1621909085011-2b8b8b8b8b8b", img: "https://images.unsplash.com/photo-1581092160562-40aa67e2737f?w=600&q=80" },
  { id: "f3", template_id: "FB3", name: "Sterling Law Group", category: "website", industry: "Legal", family: "Editorial prestige", layout: "split-right", tone: "#1a1a2e", ink: "#e2e8f0", accent: "#c9a96e", head: "Your Case. Our Mission.", sub: "Aggressive representation. Proven results. Millions recovered.", eyebrow: "Free Consultation", cta: "Schedule Consultation", feature: "No Fee Unless We Win", feature_copy: "We work on contingency, so you pay nothing unless we win your case.", photo: "photo-1589829545856", img: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80" },
  { id: "f4", template_id: "FB4", name: "Halcyon Estates", category: "website", industry: "Real Estate", family: "Luxury minimalism", layout: "centered", tone: "#0c0a09", ink: "#fafaf9", accent: "#d4a574", head: "Where Luxury Finds Its Address.", sub: "Curated luxury properties in Florida's most exclusive communities.", eyebrow: "Private Listings Available", cta: "View Listings", feature: "Concierge Buying", feature_copy: "White-glove service from first viewing to closing day.", photo: "photo-1568605114967", img: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80" },
  { id: "f5", template_id: "FB5", name: "Aurora Dental", category: "website", industry: "Dental", family: "Warm clinical comfort", layout: "bento", tone: "#f8fafc", ink: "#0f172a", accent: "#0ea5e9", head: "Your Smile, Our Passion.", sub: "Comprehensive dental care for the whole family in a relaxing environment.", eyebrow: "Accepting New Patients", cta: "Book Appointment", feature: "Painless Dentistry", feature_copy: "Sedation options and gentle techniques for anxiety-free visits.", photo: "photo-1606811971618", img: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=600&q=80" },
  { id: "f6", template_id: "FB6", name: "Apex HVAC", category: "website", industry: "HVAC", family: "Reliable service authority", layout: "dashboard", tone: "#111827", ink: "#f9fafb", accent: "#3b82f6", head: "Comfort You Can Count On.", sub: "Heating and cooling experts serving homes and businesses 24/7.", eyebrow: "Same-Day Service Available", cta: "Request Quote", feature: "Energy Star Certified", feature_copy: "Lower your bills with high-efficiency systems installed by certified pros.", photo: "photo-1581094288338", img: "https://images.unsplash.com/photo-1581094288338-2314dddb06de?w=600&q=80" },
  { id: "f7", template_id: "FB7", name: "Flow Plumbing Co.", category: "website", industry: "Plumbing", family: "Fast dependable service", layout: "split-left", tone: "#0f172a", ink: "#f1f5f9", accent: "#06b6d4", head: "Fast. Reliable. Licensed.", sub: "From leaks to full repipes, we handle it all with upfront pricing.", eyebrow: "24/7 Emergency Plumbing", cta: "Call Now", feature: "Upfront Pricing", feature_copy: "Know the cost before we start. No surprises, no hidden fees.", photo: "photo-1607472586894", img: "https://images.unsplash.com/photo-1607472586894-ed13038d7f3a?w=600&q=80" },
  { id: "f8", template_id: "FB8", name: "Vanta Motors", category: "website", industry: "Automotive", family: "Premium performance", layout: "split-right", tone: "#0a0a0a", ink: "#ffffff", accent: "#dc2626", head: "Precision Performance. Pure Passion.", sub: "Premium auto detailing and performance upgrades for discerning owners.", eyebrow: "Book Your Detail", cta: "Book Now", feature: "Ceramic Coating", feature_copy: "5-year protection that keeps your paint looking showroom new.", photo: "photo-1503376780353", img: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80" },
  { id: "f9", template_id: "FB9", name: "Aster Escapes", category: "website", industry: "Hospitality", family: "Serene luxury retreat", layout: "centered", tone: "#1c1917", ink: "#fafaf9", accent: "#fbbf24", head: "Escape to Paradise.", sub: "Boutique resort experiences in Florida's most stunning coastal settings.", eyebrow: "Book Your Stay", cta: "Reserve Now", feature: "Oceanfront Suites", feature_copy: "Wake up to panoramic ocean views from your private balcony.", photo: "photo-1571896349842", img: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80" },
];

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { items } = await base44.entities.DesignTemplate.filter(
        { category: "website" },
        { sort: "industry", limit: 60, fields: ["template_id", "name", "category", "industry", "family", "layout", "tone", "ink", "accent", "head", "sub", "eyebrow", "cta", "feature", "feature_copy", "photo"] }
      );
      setTemplates(items && items.length > 0 ? items : FALLBACK_TEMPLATES);
    } catch {
      setTemplates(FALLBACK_TEMPLATES);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return templates.filter((t) => {
      const matchesTab = activeTab === "All" || (t.industry || "").toLowerCase().includes(activeTab.toLowerCase());
      const q = query.toLowerCase();
      const matchesQuery = !q || (t.name || "").toLowerCase().includes(q) || (t.industry || "").toLowerCase().includes(q) || (t.family || "").toLowerCase().includes(q);
      return matchesTab && matchesQuery;
    });
  }, [templates, activeTab, query]);

  return (
    <section id="templates" className="py-20 lg:py-28 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-primary font-semibold tracking-[0.2em] text-xs uppercase mb-3">Website Templates</p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl">Explore Real Templates</h2>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Preview full-page website concepts, then choose the exact design you want to customize. Click any template for a full interactive preview.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
          <input
            className="w-full rounded-xl bg-card border border-border pl-11 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition"
            placeholder="Search templates by industry or style…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-10">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Template grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-sm">No templates match your search. Try a different industry or keyword.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((t, i) => (
              <motion.button
                key={t.id || t.template_id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
                onClick={() => setSelected(t)}
                className="group text-left rounded-2xl overflow-hidden border border-border bg-card hover:border-primary/40 transition-all duration-200 hover:shadow-[0_0_30px_rgba(0,212,255,0.08)]"
              >
                <div className="aspect-[16/10] relative overflow-hidden">
                  <Image
                    src={t.img || (t.photo ? `https://images.unsplash.com/${t.photo}?w=600&q=80` : "https://images.unsplash.com/photo-1467232004574-p5cde63b4d62?w=600&q=80")}
                    alt={`${t.industry} template`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 rounded-full bg-background/80 backdrop-blur px-3 py-1 text-[10px] font-semibold text-primary tracking-wide">
                    {t.industry}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-background/50">
                    <span className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground inline-flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> Full Preview
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-foreground">{t.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {t.head || t.family || "Premium website template"}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      {["tone", "ink", "accent"].map((k) => t[k] && (
                        <div key={k} className="w-5 h-5 rounded border border-border" style={{ background: t[k] }} />
                      ))}
                    </div>
                    {t.layout && (
                      <span className="text-[10px] text-muted-foreground/60 font-mono ml-1">{t.layout}</span>
                    )}
                    <span className="ml-auto text-xs font-semibold text-primary inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                      View <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && <TemplatePreviewModal template={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </section>
  );
}