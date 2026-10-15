import { useState } from "react";
import { base44 } from "@/api/base44Client";
import AutoStepShell from "@/components/autobuilder/AutoStepShell";
import { Loader2, Share2, Image as ImageIcon } from "lucide-react";

export default function SocialStep({ accent, nameData, brandData, onApprove }) {
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState([]);
  const [error, setError] = useState(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const promises = [
        base44.integrations.Core.GenerateImage({
          prompt: `Social media post for "${nameData?.name || "business"}", modern professional design, ${brandData?.palette?.accent || accent} accent, square format, bold headline`,
        }),
        base44.integrations.Core.GenerateImage({
          prompt: `Instagram story template for "${nameData?.name || "business"}", vertical format, elegant design, ${brandData?.palette?.accent || accent} brand color`,
        }),
        base44.integrations.Core.GenerateImage({
          prompt: `Facebook cover photo for "${nameData?.name || "business"}", wide banner, professional service business, ${brandData?.palette?.accent || accent} accent`,
        }),
      ];
      const results = await Promise.allSettled(promises);
      const urls = results.filter((r) => r.status === "fulfilled").map((r) => r.value.url);
      setAssets(urls);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = () => {
    onApprove({ socialAssets: assets });
  };

  return (
    <AutoStepShell
      step={10}
      accent={accent}
      title="Social Assets"
      subtitle="Generate social media images for your launch."
      onApprove={assets.length > 0 ? handleApprove : undefined}
      approveLabel="Approve Assets"
      canApprove={assets.length > 0}
    >
      {!assets.length && !loading && (
        <div className="text-center py-8">
          <Share2 className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <p className="text-slate-500 text-sm mb-5 max-w-md mx-auto">
            Generate a social media post, Instagram story, and Facebook cover photo with your brand colors.
          </p>
          <button
            onClick={generate}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition"
          >
            <Share2 className="w-4 h-4" /> Generate Social Assets
          </button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400 mb-3" />
          <p className="text-sm text-slate-500">Generating social media assets…</p>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      {assets.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {assets.map((url, i) => (
            <div key={i} className="rounded-xl border border-slate-200 overflow-hidden">
              <img src={url} alt={`Social asset ${i + 1}`} className="w-full h-40 object-cover" />
            </div>
          ))}
        </div>
      )}
    </AutoStepShell>
  );
}