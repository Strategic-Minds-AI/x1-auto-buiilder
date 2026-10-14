import { useState, useEffect } from "react";
import { Phone, Menu, X } from "lucide-react";

const navLinks = [
  { label: "Industries", href: "#industries" },
  { label: "Templates", href: "#templates" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/90 backdrop-blur-md border-b border-border" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <a href="#" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center font-display font-bold text-primary-foreground text-lg">
              D
            </div>
            <div className="leading-none">
              <div className="font-display font-bold text-sm tracking-wide text-foreground">DIGITAL DOMINANCE</div>
              <div className="text-[10px] tracking-[0.2em] text-muted-foreground">A STRATEGIC MINDS AI SYSTEM</div>
            </div>
          </a>

          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <a
            href="tel:+17722090266"
            className="hidden lg:inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:brightness-110 transition"
          >
            <Phone className="w-4 h-4" /> (772) 209-0266
          </a>

          <button
            className="lg:hidden text-foreground p-1"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden bg-background/95 backdrop-blur-md border-t border-border">
          <nav className="px-4 py-4 flex flex-col gap-1">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground py-2.5"
              >
                {l.label}
              </a>
            ))}
            <a
              href="tel:+17722090266"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground mt-2 w-fit"
            >
              <Phone className="w-4 h-4" /> (772) 209-0266
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}