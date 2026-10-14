import { Link } from "react-router-dom";
import { Plus, ExternalLink } from "lucide-react";

export default function PortalNav({ onNew }) {
  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center font-display font-bold text-primary-foreground text-sm">
            D
          </div>
          <div className="leading-none">
            <div className="font-display font-bold text-xs tracking-wide">DIGITAL DOMINANCE</div>
            <div className="text-[10px] tracking-[0.2em] text-muted-foreground">CLIENT PORTAL</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition"
          >
            <ExternalLink className="w-4 h-4" /> View Site
          </Link>
          <button
            onClick={onNew}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:brightness-110 transition"
          >
            <Plus className="w-4 h-4" /> New Project
          </button>
        </div>
      </div>
    </header>
  );
}