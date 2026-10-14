import { Search, BarChart3, Sparkles, Check } from "lucide-react";

const phases = [
  { icon: Search, label: "Researching your business", desc: "Skip-tracing your website to extract services, value props, and tone." },
  { icon: BarChart3, label: "Benchmarking top sites", desc: "Identifying the 5 best-designed sites in your industry for design guidance." },
  { icon: Sparkles, label: "Generating original content", desc: "Writing hero copy, services, about, FAQs, and a design direction." },
];

export default function ProgressStep({ phase }) {
  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <div className="inline-flex w-16 h-16 rounded-2xl bg-primary/15 items-center justify-center mb-6">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
      <h2 className="font-display font-bold text-2xl mb-2">Building your website</h2>
      <p className="text-muted-foreground mb-10">This takes about 30–60 seconds.</p>

      <div className="space-y-3 text-left">
        {phases.map((p, i) => {
          const done = i < phase;
          const active = i === phase;
          return (
            <div
              key={p.label}
              className={`flex items-start gap-3 rounded-xl border p-4 transition ${
                active ? "border-primary/40 bg-primary/5" : done ? "border-border bg-card opacity-80" : "border-border bg-card opacity-40"
              }`}
            >
              <span
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  active ? "bg-primary/15 text-primary" : done ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
                }`}
              >
                {done ? <Check className="w-4 h-4" /> : <p.icon className="w-4 h-4" />}
              </span>
              <div>
                <div className="text-sm font-semibold text-foreground">{p.label}</div>
                <div className="text-xs text-muted-foreground">{p.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}