import ReactMarkdown from "react-markdown";
import { Image } from "@/components/ui/image";

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|svg)(\?[^\s]*)?$/i;
const VIDEO_EXT = /\.(mp4|webm|mov|og[gv])(\?[^\s]*)?$/i;

const MD_PROSE = "text-sm text-slate-700 prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-headings:my-1.5 prose-code:text-[#00d4ff] prose-code:bg-slate-50 prose-code:px-1 prose-code:rounded";

/**
 * Renders assistant message content with inline images and videos.
 * Detects markdown image syntax ![alt](url) and bare media URLs,
 * splits content into text + media segments, and renders each
 * segment with the appropriate component.
 */
export default function ChatMediaContent({ content }) {
  if (!content) return null;

  // Collect all media spans (markdown images + bare media URLs)
  const spans = [];
  let m;

  // 1. Markdown image syntax: ![alt](url)
  const mdImgRe = /!\[([^\]]*)\]\(([^)\s]+)\)/g;
  while ((m = mdImgRe.exec(content)) !== null) {
    const url = m[2];
    spans.push({
      start: m.index,
      end: m.index + m[0].length,
      url,
      alt: m[1],
      kind: VIDEO_EXT.test(url) ? "video" : "image",
    });
  }

  // 2. Bare media URLs not already inside markdown image syntax
  const urlRe = /https?:\/\/[^\s<>"')\]]+/g;
  while ((m = urlRe.exec(content)) !== null) {
    const insideMd = spans.some((s) => m.index >= s.start && m.index < s.end);
    if (insideMd) continue;
    const url = m[0].replace(/[.,;:!?]+$/, "");
    if (IMAGE_EXT.test(url)) {
      spans.push({ start: m.index, end: m.index + m[0].length, url, alt: "", kind: "image" });
    } else if (VIDEO_EXT.test(url)) {
      spans.push({ start: m.index, end: m.index + m[0].length, url, alt: "", kind: "video" });
    }
  }

  spans.sort((a, b) => a.start - b.start);

  // Build alternating text / media segments
  const segments = [];
  let cursor = 0;
  for (const s of spans) {
    if (s.start > cursor) segments.push({ kind: "text", text: content.slice(cursor, s.start) });
    segments.push({ kind: s.kind, url: s.url, alt: s.alt });
    cursor = s.end;
  }
  if (cursor < content.length) segments.push({ kind: "text", text: content.slice(cursor) });

  // No media found — render as pure markdown (single pass, preserves code blocks etc.)
  if (segments.length <= 1) {
    return <ReactMarkdown className={MD_PROSE}>{content}</ReactMarkdown>;
  }

  return (
    <div className="space-y-2">
      {segments.map((seg, i) => {
        if (seg.kind === "text") {
          if (!seg.text.trim()) return null;
          return <ReactMarkdown key={i} className={MD_PROSE}>{seg.text}</ReactMarkdown>;
        }
        if (seg.kind === "image") {
          return (
            <Image
              key={i}
              src={seg.url}
              alt={seg.alt || "image"}
              fittingType="fit"
              className="rounded-xl max-w-full h-auto border border-slate-200"
            />
          );
        }
        if (seg.kind === "video") {
          return (
            <video
              key={i}
              src={seg.url}
              controls
              preload="metadata"
              className="rounded-xl max-w-full h-auto border border-slate-200"
            />
          );
        }
        return null;
      })}
    </div>
  );
}