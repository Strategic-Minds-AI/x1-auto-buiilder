import { useState } from "react";
import { ACCENT_COLORS } from "@/lib/autoBuilderSteps";
import { FolderPlus, ArrowRight } from "lucide-react";

// Step 1 — Project Creator. Name the build and pick the accent color that
// will flow through every downstream generation step. Creates the BuildProject
// record and advances to the Vision step.
export default function ProjectCreator({ onCreate, accent, setAccent }) {
  const [name, setName] = useState("");

  const submit = () => {
    if (!name.trim()) return;
    onCreate(name.trim());
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="rounded-3xl bg-slate-900 p-8 sm:p-10 text-white shadow-xl">
        <div className="mb-6 flex items-center gap-3">
          <span
            className="flex h-11 w-11 items-center justify-center rounded-2xl"
            style={{ background: accent }}
          >
            <FolderPlus className="h-5 w-5 text-slate-900" />
          </span>
          <div>
            <h2 className="text-xl font-bold">Start a New Build</h2>
            <p className="text-sm text-slate-400">Name your project — this becomes your workspace for the whole journey.</p>
          </div>
        </div>

        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
          Project Name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="e.g. National Epoxy Pros, Apex SaaS, Lumen Agency"
          className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2"
          style={{ "--tw-ring-color": accent }}
          autoFocus
        />

        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mt-6 mb-2">
          Accent Color <span className="text-slate-500 normal-case font-normal">— flows through every step</span>
        </label>
        <div className="flex flex-wrap gap-2.5">
          {ACCENT_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setAccent(c.value)}
              className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition"
              style={{
                background: accent === c.value ? c.value : "transparent",
                borderColor: accent === c.value ? c.value : "#334155",
                color: accent === c.value ? "#0f172a" : "#cbd5e1",
              }}
            >
              <span className="h-3 w-3 rounded-full" style={{ background: c.value }} />
              {c.name}
            </button>
          ))}
        </div>

        <button
          onClick={submit}
          disabled={!name.trim()}
          className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold transition disabled:opacity-50"
          style={{ background: accent, color: "#0f172a" }}
        >
          Start Vision <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}