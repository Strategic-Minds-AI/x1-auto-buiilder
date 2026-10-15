import { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import AutoBuilderTimeline from "@/components/autobuilder/AutoBuilderTimeline";
import ProjectCreator from "@/components/autobuilder/ProjectCreator";
import VisionStep from "@/components/autobuilder/VisionStep";
import StrategyStep from "@/components/autobuilder/StrategyStep";
import { Hammer, ArrowLeft } from "lucide-react";

// The guided Auto Builder — a distraction-free, step-by-step journey with a
// horizontal timeline at the top, a project creator, and a library for every
// stage (added in later turns). White background, dark boxes, accent flows
// through every generation step. Each step persists into the BuildProject so
// the chain compounds: vision → strategy → (next) name → brand → website → …
export default function AutoBuilder() {
  const [step, setStep] = useState("project");
  const [accent, setAccent] = useState("#00d4ff");
  const [projectId, setProjectId] = useState(null);
  const [vision, setVision] = useState(null);
  const [saving, setSaving] = useState(false);

  const createProject = async (name) => {
    setSaving(true);
    try {
      const rec = await base44.entities.BuildProject.create({
        name,
        status: "draft",
        current_step: "project",
        accent_color: accent,
      });
      setProjectId(rec.id);
      setStep("vision");
    } catch (e) {
      // fall back to an in-memory build if persistence fails
      setProjectId("local");
      setStep("vision");
    } finally {
      setSaving(false);
    }
  };

  const updateProject = async (patch) => {
    if (!projectId || projectId === "local") return;
    try {
      await base44.entities.BuildProject.update(projectId, patch);
    } catch {}
  };

  const approveVision = async (v) => {
    setVision(v);
    setStep("strategy");
    updateProject({ vision: v, vision_type: v.type, status: "vision", current_step: "strategy" });
  };

  const approveStrategy = async ({ strategy, addons }) => {
    updateProject({ strategy, addons, status: "strategy", current_step: "name" });
    // Next steps (Name, Brand, Website…) are staged for the following turns.
    setStep("name");
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Top bar */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: accent }}>
            <Hammer className="h-4 w-4 text-slate-900" />
          </span>
          <div className="leading-tight">
            <div className="text-sm font-bold text-slate-900">Auto Builder</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400">Digital Dominance Factory</div>
          </div>
          <Link
            to="/portal"
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Portal
          </Link>
        </div>
      </header>

      <AutoBuilderTimeline currentKey={step} accent={accent} />

      <main className="bg-white">
        {step === "project" && (
          <ProjectCreator onCreate={createProject} accent={accent} setAccent={setAccent} />
        )}
        {step === "vision" && (
          <VisionStep accent={accent} setAccent={setAccent} onApprove={approveVision} />
        )}
        {step === "strategy" && vision && (
          <StrategyStep vision={vision} accent={accent} onApprove={approveStrategy} />
        )}
        {step === "name" && (
          <div className="max-w-2xl mx-auto px-4 py-20 text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 mb-5">
              <Hammer className="h-6 w-6" style={{ color: accent }} />
            </div>
            <h2 className="text-xl font-bold">Strategy locked in.</h2>
            <p className="text-slate-500 mt-2 max-w-md mx-auto">
              The next steps — Name &amp; Domain, Brand Library, Website Generator, Social, and Launch —
              are built on this same guided chain, each carrying your vision, strategy, and accent forward.
            </p>
            <p className="text-sm text-slate-400 mt-4">Coming up in the next turns.</p>
          </div>
        )}
      </main>

      {saving && (
        <div className="fixed bottom-4 right-4 rounded-full bg-slate-900 text-white text-xs px-4 py-2 shadow-lg">
          Saving…
        </div>
      )}
    </div>
  );
}