import { useState } from "react";
import { X, ExternalLink, Sparkles, Loader2, Send } from "lucide-react";
import MiniSitePreview from "@/components/shared/MiniSitePreview";
import { base44 } from "@/api/base44Client";

export default function WebsitePreviewModal({ site, onClose }) {
  const [comment, setComment] = useState("");
  const [enhancing, setEnhancing] = useState(false);
  const [enhancedContent, setEnhancedContent] = useState(null);
  const [error, setError] = useState(null);
  const [showComment, setShowComment] = useState(false);

  const content = enhancedContent || site.content || {};
  const heroImage = enhancedContent ? null : site.hero_image_url;
  const logoUrl = site.logo_url;

  const enhance = async () => {
    if (!comment.trim()) return;
    setEnhancing(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("enhanceWebsite", {
        projectId: site.id,
        comment: comment.trim(),
      });
      setEnhancedContent(res.data.content);
      setComment("");
      setShowComment(false);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Enhancement failed");
    } finally {
      setEnhancing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 shrink-0">
          <div className="min-w-0">
            <h2 className="font-black text-lg text-slate-900 truncate">{site.business_name || "Untitled"}</h2>
            <p className="text-xs text-slate-500">{site.industry}{site.location ? " · " + site.location : ""}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {site.deploy_url && (
              <a
                href={site.deploy_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#00d4ff] px-4 py-2 text-xs font-bold text-[#0a0e14] hover:brightness-110 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Live Site
              </a>
            )}
            <button
              onClick={() => setShowComment(!showComment)}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:text-[#00d4ff] hover:border-[#00d4ff]/40 transition"
            >
              <Sparkles className="w-3.5 h-3.5" /> Enhance with AI
            </button>
            <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Comment box */}
        {showComment && (
          <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
              Tell the AI how to enhance this website
            </label>
            <div className="flex gap-2">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="e.g. Make the hero more bold and attention-grabbing. Use a dark navy and gold color scheme. Add more specific service descriptions. Make the CTAs more urgent..."
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00d4ff]/50 transition resize-none"
                rows={2}
              />
              <button
                onClick={enhance}
                disabled={enhancing || !comment.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-[#00d4ff] px-5 py-2.5 text-sm font-bold text-[#0a0e14] hover:brightness-110 transition disabled:opacity-50 shrink-0"
              >
                {enhancing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {enhancing ? "Enhancing..." : "Regenerate"}
              </button>
            </div>
            {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
            {enhancedContent && !showComment && (
              <p className="mt-2 text-xs text-[#00d4ff] font-semibold">✓ Content enhanced and saved!</p>
            )}
          </div>
        )}

        {enhancedContent && (
          <div className="px-5 py-2 bg-[#00d4ff]/5 border-b border-[#00d4ff]/20 shrink-0">
            <p className="text-xs text-[#00d4ff] font-semibold">✓ Content enhanced with AI — preview updated below</p>
          </div>
        )}

        {/* Preview */}
        <div className="flex-1 overflow-y-auto bg-slate-100 p-6">
          <div className="max-w-3xl mx-auto">
            <MiniSitePreview
              heroImage={heroImage}
              logoUrl={logoUrl}
              headline={content?.hero?.headline}
              subheadline={content?.hero?.subheadline}
              colorTokens={content?.colorTokens}
              ctaLabel={content?.hero?.primaryCta}
              className="rounded-xl overflow-hidden shadow-xl"
            />
            <div className="mt-4 space-y-4">
              {content?.services?.length > 0 && (
                <div className="rounded-xl bg-white p-5 shadow-sm">
                  <h3 className="font-bold text-sm text-slate-900 mb-3">Services</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {content.services.map((s, i) => (
                      <div key={i} className="rounded-lg border border-slate-200 p-3">
                        <div className="text-sm font-semibold text-slate-800">{s.title}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{s.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {content?.about && (
                <div className="rounded-xl bg-white p-5 shadow-sm">
                  <h3 className="font-bold text-sm text-slate-900 mb-1">About</h3>
                  <div className="text-sm font-semibold text-slate-700">{content.about.headline}</div>
                  <div className="text-sm text-slate-500 mt-1">{content.about.body}</div>
                </div>
              )}
              {content?.faqs?.length > 0 && (
                <div className="rounded-xl bg-white p-5 shadow-sm">
                  <h3 className="font-bold text-sm text-slate-900 mb-3">FAQs</h3>
                  <div className="space-y-2">
                    {content.faqs.map((f, i) => (
                      <div key={i}>
                        <div className="text-sm font-semibold text-slate-800">{f.question}</div>
                        <div className="text-xs text-slate-500">{f.answer}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}