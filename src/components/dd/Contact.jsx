import { useState } from "react";
import { Phone, Mail, MapPin, Send, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const industries = [
  "Legal", "Real Estate", "Epoxy Flooring", "Roofing", "HVAC", "Plumbing", "Electrical",
  "Med Spa", "Dental", "Chiropractic", "Remodeling", "Landscaping", "Solar", "Pest Control",
  "Moving", "Auto Detailing", "Restaurants", "Insurance", "Mortgage", "Cleaning Services",
];

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    industry: industries[0],
    message: "",
  });
  const [status, setStatus] = useState("idle");
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setStatus("sending");
    try {
      await base44.entities.Lead.create({
        form_type: "contact",
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: `Industry: ${form.industry}\n\n${form.message}`,
      });
      setStatus("success");
      setForm({ name: "", email: "", phone: "", industry: industries[0], message: "" });
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <section id="contact" className="py-20 lg:py-28 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <p className="text-primary font-semibold tracking-[0.2em] text-xs uppercase mb-3">
              Ready To Explore Your Next Websites?
            </p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl">Ready to Launch?</h2>
            <p className="mt-4 text-muted-foreground max-w-md">
              Florida-based, with nationwide reach. Explore website concepts and plan your next launch.
            </p>
            <div className="mt-8 space-y-4">
              <a href="tel:+17722090266" className="flex items-center gap-3 text-foreground hover:text-primary transition">
                <span className="w-11 h-11 rounded-xl bg-secondary border border-border flex items-center justify-center text-primary shrink-0">
                  <Phone className="w-5 h-5" />
                </span>
                (772) 209-0266
              </a>
              <a href="mailto:jeremy@strategicmindsai.com" className="flex items-center gap-3 text-foreground hover:text-primary transition">
                <span className="w-11 h-11 rounded-xl bg-secondary border border-border flex items-center justify-center text-primary shrink-0">
                  <Mail className="w-5 h-5" />
                </span>
                jeremy@strategicmindsai.com
              </a>
              <div className="flex items-center gap-3 text-muted-foreground">
                <span className="w-11 h-11 rounded-xl bg-secondary border border-border flex items-center justify-center text-primary shrink-0">
                  <MapPin className="w-5 h-5" />
                </span>
                Florida based — nationwide reach
              </div>
            </div>
          </div>

          <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-6 lg:p-8">
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Name</span>
                <input value={form.name} onChange={set("name")} required className="dd-input" placeholder="Your name" />
              </label>
              <label className="block">
                <span className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Email</span>
                <input type="email" value={form.email} onChange={set("email")} required className="dd-input" placeholder="you@company.com" />
              </label>
              <label className="block">
                <span className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Phone</span>
                <input value={form.phone} onChange={set("phone")} className="dd-input" placeholder="(555) 555-5555" />
              </label>
              <label className="block">
                <span className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Industry</span>
                <select value={form.industry} onChange={set("industry")} className="dd-input">
                  {industries.map((i) => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block mt-4">
              <span className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Message</span>
              <textarea value={form.message} onChange={set("message")} required rows={4} className="dd-input resize-none" placeholder="Tell us about your project..." />
            </label>
            <button
              type="submit"
              disabled={status === "sending"}
              className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-accent-foreground hover:brightness-110 transition disabled:opacity-60"
            >
              {status === "sending" ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
              ) : (
                <>Submit to AI CRM <Send className="w-4 h-4" /></>
              )}
            </button>
            {status === "success" && (
              <p className="mt-3 text-sm text-primary text-center">Thanks — your inquiry is in. We'll be in touch shortly.</p>
            )}
            {status === "error" && (
              <p className="mt-3 text-sm text-destructive text-center">Something went wrong. Please try again or call us.</p>
            )}
            <p className="mt-3 text-xs text-muted-foreground text-center">
              We use your details to respond to your inquiry. No automatic marketing messages are sent by this form.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}