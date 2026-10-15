import { useState } from "react";
import { base44 } from "@/api/base44Client";
import AutoStepShell from "@/components/autobuilder/AutoStepShell";
import { Loader2, Rocket, CheckCircle2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

export default function LaunchStep({ accent, projectId, nameData, websiteData, onApprove }) {
  const [loading, setLoading] = useState(false);
  const [deployUrl, setDeployUrl] = useState(null);
  const [error, setError] = useState(null);
  const [savedProject, setSavedProject] = useState(null);

  const launch = async () => {
    setLoading(true);
    setError(null);
    try {
      // Save the project first
      const rec = await base44.entities.WebsiteProject.create({
        business_name: nameData?.name || "Auto Builder Project",
        business_website: "",
        industry: "General",
        status: "preview_ready",
        content: websiteData?.website?.content || {},
      });
      setSavedProject(rec);

      // Deploy
      const res = await base44.functions.invoke("deploySite", { projectId: rec.id });
      setDeployUrl(res.data?.url);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Launch failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AutoStepShell
      step={12}
      accent={accent}
      title="Launch"
      subtitle="Deploy your website to Vercel."
      onApprove={deployUrl ? () => onApprove({ deployUrl }) : undefined}
      approveLabel="Finish"
      canApprove={!!deployUrl}
    >
      {!deployUrl && !loading && !error && (
        <div className="text-center py-8">
          <Rocket className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <p className="text-slate-500 text-sm mb-5 max-w-md mx-auto">
            Everything is ready. Click launch to deploy your website to Vercel and go live.
          </p>
          <button
            onClick={launch}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
          >
            <Rocket className="w-4 h-4" /> Launch Website
          </button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400 mb-3" />
          <p className="text-sm text-slate-500">Deploying to Vercel…</p>
        </div>
      )}

      {error && <p className="text-sm text-red-500 text-center">{error}</p>}

      {deployUrl && (
        <div className="text-center py-8">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">Website Launched!</h3>
          <a
            href={deployUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:underline"
          >
            {deployUrl} <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <div className="mt-6">
            <Link
              to="/portal"
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition"
            >
              Back to Portal
            </Link>
          </div>
        </div>
      )}
    </AutoStepShell>
  );
}