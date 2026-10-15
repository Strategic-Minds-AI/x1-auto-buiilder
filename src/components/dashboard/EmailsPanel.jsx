import { Mail, Link as LinkIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { EMAIL_TEMPLATES } from "@/lib/emailTemplateCatalog";

export default function EmailsPanel() {
  const platform = EMAIL_TEMPLATES.filter((t) => t.type === "platform");
  const custom = EMAIL_TEMPLATES.filter((t) => t.type === "custom");

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-1">Email Templates</h2>
          <p className="text-sm text-slate-500">{EMAIL_TEMPLATES.length} templates — {platform.length} platform + {custom.length} custom.</p>
        </div>
        <Link to="/email-templates" className="inline-flex items-center gap-1.5 rounded-lg bg-[#00d4ff] px-4 py-2 text-sm font-bold text-[#0a0e14] hover:brightness-110 transition">
          <LinkIcon className="w-4 h-4" /> Open Library
        </Link>
      </div>
      <div className="mb-6">
        <div className="text-xs font-bold uppercase text-slate-400 mb-2">Platform Templates</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {platform.map((t) => (
            <div key={t.name} className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="flex items-center gap-2 mb-1">
                <Mail className="w-3.5 h-3.5 text-purple-500" />
                <span className="text-xs font-bold text-slate-700">{t.title}</span>
              </div>
              <div className="text-[10px] text-slate-400 truncate">{t.name}.html</div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="text-xs font-bold uppercase text-slate-400 mb-2">Custom Templates</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {custom.map((t) => (
            <div key={t.name} className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="flex items-center gap-2 mb-1">
                <Mail className="w-3.5 h-3.5 text-cyan-500" />
                <span className="text-xs font-bold text-slate-700">{t.title}</span>
              </div>
              <div className="text-[10px] text-slate-400 truncate">{t.name}.html</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}