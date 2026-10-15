import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function PageHeader({ title, subtitle }) {
  return (
    <header className="border-b border-border bg-background/80 backdrop-blur sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-3">
        <Link to="/portal" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="h-4 w-4" /> Portal
        </Link>
        <div className="h-4 w-px bg-border" />
        <div>
          <h1 className="text-sm font-bold text-foreground leading-tight">{title}</h1>
          {subtitle && <p className="text-xs text-muted-foreground leading-tight hidden sm:block">{subtitle}</p>}
        </div>
      </div>
    </header>
  );
}