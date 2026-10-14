export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center font-display font-bold text-primary-foreground text-sm">
              D
            </div>
            <div className="leading-none">
              <div className="font-display font-bold text-xs tracking-wide">DIGITAL DOMINANCE</div>
              <div className="text-[10px] tracking-[0.2em] text-muted-foreground">A STRATEGIC MINDS AI SYSTEM</div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Strategic Minds AI. All rights reserved.
          </p>
          <div className="flex gap-5 text-xs text-muted-foreground">
            <a href="#industries" className="hover:text-foreground transition">Industries</a>
            <a href="#templates" className="hover:text-foreground transition">Templates</a>
            <a href="#contact" className="hover:text-foreground transition">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}