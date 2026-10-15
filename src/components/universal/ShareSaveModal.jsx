import { useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  X, Download, Mail, MessageCircle, Cloud, Copy, Check,
  Loader2, FileText, FileType, Send, HardDrive, Bot,
} from "lucide-react";
import { FILE_TYPES } from "@/data/universalStudioData";

export default function ShareSaveModal({ item, content, onClose }) {
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState(item?.title || "Generated Content");
  const [sending, setSending] = useState(null);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!item && !content) return null;

  const handleDownload = (fileType) => {
    const ft = FILE_TYPES.find((f) => f.value === fileType);
    let blobContent = content || "";
    let mime = ft?.mime || "text/plain";
    let ext = ft?.ext || "txt";

    if (fileType === "html") {
      blobContent = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${item?.title || "Generated Content"}</title>
<style>
body { font-family: -apple-system, system-ui, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; color: #1e293b; line-height: 1.6; }
h1, h2, h3 { color: #0f172a; }
pre { background: #f1f5f9; padding: 16px; border-radius: 8px; overflow-x: auto; }
code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
</style>
</head>
<body>
<pre style="white-space: pre-wrap; font-family: inherit;">${content}</pre>
</body>
</html>`;
    } else if (fileType === "json") {
      blobContent = JSON.stringify({
        title: item?.title,
        generation_type: item?.generation_type,
        industry: item?.industry,
        category: item?.category,
        subcategory: item?.subcategory,
        content,
        created_at: new Date().toISOString(),
      }, null, 2);
    } else if (fileType === "pdf") {
      import("jspdf").then(({ jsPDF }) => {
        const doc = new jsPDF();
        const lines = doc.splitTextToSize(content || "", 180);
        let y = 20;
        const pageHeight = doc.internal.pageSize.height;
        for (const line of lines) {
          if (y > pageHeight - 20) { doc.addPage(); y = 20; }
          doc.text(line, 15, y);
          y += 7;
        }
        doc.save(`${(item?.title || "generated").replace(/[^a-z0-9]/gi, "_")}.pdf`);
      });
      return;
    }

    const blob = new Blob([blobContent], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(item?.title || "generated").replace(/[^a-z0-9]/gi, "_")}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSendGmail = async () => {
    if (!emailTo.trim()) return;
    setSending("gmail");
    setResult(null);
    try {
      const res = await base44.functions.invoke("sendGmailEmail", {
        to: emailTo,
        subject: emailSubject,
        body: content,
      });
      if (res.data?.error) {
        setResult({ type: "error", msg: res.data.error });
      } else {
        setResult({ type: "success", msg: "Email sent successfully!" });
      }
    } catch (err) {
      setResult({ type: "error", msg: err.message || "Failed to send email" });
    } finally {
      setSending(null);
    }
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(content?.substring(0, 4000) || "");
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleGoogleDrive = () => {
    window.open("https://drive.google.com", "_blank");
  };

  const handleCopyChatGPT = async () => {
    try {
      await navigator.clipboard.writeText(content || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Share / Save / Send</h3>
            <p className="text-xs text-slate-400">{item?.title || "Generated content"}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Download section */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 block flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" /> Download to Computer
            </label>
            <div className="grid grid-cols-5 gap-2">
              {FILE_TYPES.map((ft) => {
                const Icon = ft.value === "pdf" ? FileType : ft.value === "html" ? FileText : FileText;
                return (
                  <button
                    key={ft.value}
                    onClick={() => handleDownload(ft.value)}
                    className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 py-3 px-2 hover:border-[#00d4ff]/40 hover:bg-[#00d4ff]/5 transition group"
                  >
                    <Icon className="w-5 h-5 text-slate-400 group-hover:text-[#00d4ff]" />
                    <span className="text-[10px] font-semibold text-slate-500 group-hover:text-[#00d4ff]">{ft.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Gmail section */}
          <div className="rounded-xl border border-slate-200 p-4">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2.5 block flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> Send via Gmail
            </label>
            <div className="space-y-2">
              <input
                type="email"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                placeholder="recipient@example.com"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/30"
              />
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Email subject"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/30"
              />
              <button
                onClick={handleSendGmail}
                disabled={!emailTo.trim() || sending === "gmail"}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-500 py-2.5 text-sm font-bold text-white disabled:opacity-40 hover:bg-red-600 transition"
              >
                {sending === "gmail" ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : <><Send className="w-4 h-4" /> Send Email</>}
              </button>
            </div>
          </div>

          {/* Quick share buttons */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 block flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5" /> Quick Share
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handleWhatsApp}
                className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 py-4 hover:border-green-400 hover:bg-green-50 transition group"
              >
                <MessageCircle className="w-5 h-5 text-green-500" />
                <span className="text-xs font-semibold text-slate-500 group-hover:text-green-600">WhatsApp</span>
              </button>
              <button
                onClick={handleGoogleDrive}
                className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 py-4 hover:border-blue-400 hover:bg-blue-50 transition group"
              >
                <Cloud className="w-5 h-5 text-blue-500" />
                <span className="text-xs font-semibold text-slate-500 group-hover:text-blue-600">Google Drive</span>
              </button>
              <button
                onClick={handleCopyChatGPT}
                className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 py-4 hover:border-purple-400 hover:bg-purple-50 transition group"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5 text-purple-500" />}
                <span className="text-xs font-semibold text-slate-500 group-hover:text-purple-600">{copied ? "Copied!" : "Copy for ChatGPT"}</span>
              </button>
            </div>
          </div>

          {/* Result message */}
          {result && (
            <div className={`rounded-lg p-3 flex items-center gap-2 text-sm font-semibold ${
              result.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
            }`}>
              {result.type === "success" ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
              {result.msg}
            </div>
          )}

          {/* Info */}
          <div className="rounded-lg bg-slate-50 border border-slate-100 p-3 flex items-start gap-2">
            <HardDrive className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-500">
              This item is automatically saved to your Generation Library when generated. Use the Library tab to view, reload, and manage all your generated items.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}