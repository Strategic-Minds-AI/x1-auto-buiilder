import { motion } from "framer-motion";
import { Cpu, Users, XCircle, CheckCircle2, ArrowRight } from "lucide-react";

const adminFeatures = [
  "Full website catalog & launch queue management",
  "Autonomous super agent orchestration",
  "Real-time SEO/AEO/GEO scoring dashboard",
  "God Mode optimizer with deterministic path-to-first-page",
  "Mass launch console for unlimited site scaling",
  "Automated system health monitoring & healing",
  "Gap analysis & competitive intelligence",
  "Eden Skye AI receptionist with Twilio + HeyGen",
];

const clientFeatures = [
  "Business onboarding & project management",
  "Live lead inbox with AI qualification scoring",
  "Website approval center with preview",
  "Support ticket system with AI routing",
  "Project timeline & milestone tracking",
  "Performance analytics for your sites",
  "Branded communication portal",
  "Automated follow-up scheduling",
];

const othersDont = [
  "Manual SEO work required",
  "Single website per account",
  "No autonomous agents",
  "No competitive intelligence",
  "No AI-powered content enhancement",
  "No automated validation",
  "No mass launch capability",
  "No CRM or follow-up automation",
];

const badges = [
  "Zero Points of Failure",
  "Autonomous Operation",
  "AI-Optimized CRM",
  "Guaranteed Validation",
  "3-Day Follow-Up Automation",
];

export default function WhyStandApart() {
  return (
    <section className="py-20 lg:py-28 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="text-primary font-semibold tracking-[0.2em] text-xs uppercase mb-3">Built For Your Business</p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl">Why We Stand Apart</h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Our admin control center and client workspace include capabilities no other provider offers.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-border bg-card p-7"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-xl text-foreground">Admin Control Center</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-5">
              The command center our super agents use to run your entire digital business autonomously — 24/7, no
              manual work required.
            </p>
            <ul className="space-y-2.5 mb-6">
              {adminFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-foreground/90">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <a href="#contact" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all">
              Explore Admin <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-border bg-card p-7"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-xl text-foreground">Client Workspace</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-5">
              Your personalized portal to monitor projects, manage leads, approve websites, and track performance —
              all in one beautiful interface.
            </p>
            <ul className="space-y-2.5 mb-6">
              {clientFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-foreground/90">
                  <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <a href="#contact" className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:gap-3 transition-all">
              Explore Client Portal <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-border bg-card p-7"
        >
          <h3 className="font-display font-bold text-lg text-foreground mb-5">What Other Providers Don't Include</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {othersDont.map((f) => (
              <div key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <XCircle className="w-4 h-4 text-destructive/70 shrink-0" />
                {f}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2.5 pt-5 border-t border-border">
            {badges.map((b) => (
              <span
                key={b}
                className="rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary"
              >
                {b}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}