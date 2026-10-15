import { X, Loader2 } from "lucide-react";
import { useState } from "react";
import { base44 } from "@/api/base44Client";

export default function SettingsPanel({ project, onClose, onUpdate }) {
  const [name, setName] = useState(project?.business_name || "");
  const [industry, setIndustry] = useState(project?.industry || "");
  const [location, setLocation] = useState(project?.location || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!project?.id) return;
    setSaving(true);
    try {
      await base44.entities.WebsiteProject.update(project.id, {
        business_name: name, industry, location,
      });
      onUpdate();
      onClose();
    } catch {} finally { setSaving(false); }
  };

  return (
    <div className="absolute top-0 right-0 bottom-0 w-80 bg-white border-l border-slate-200 z-40 flex flex-col shadow-xl">
      <div className="h-12 px-4 flex items-center justify-between border-b border-slate-200 bg-slate-50 shrink-0">
        <h3 className="text-sm font-bold text-slate-800">Project Settings</h3>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-200 transition"><X className="w-4 h-4" /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <label className="text-sm font-semibold text-slate-700 mb-1 block">Business Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/30" />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700 mb-1 block">Industry</label>
          <input value={industry} onChange={(e) => setIndustry(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/30" />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700 mb-1 block">Location</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/30" />
        </div>
        <div className="pt-2 border-t border-slate-100">
          <div className="text-xs text-slate-400 mb-1">Project ID</div>
          <div className="text-xs font-mono text-slate-500 truncate">{project?.id || "N/A"}</div>
        </div>
        <div>
          <div className="text-xs text-slate-400 mb-1">Status</div>
          <div className="text-sm font-semibold text-slate-600 capitalize">{project?.status?.replace("_", " ") || "draft"}</div>
        </div>
        {project?.deploy_url && (
          <div>
            <div className="text-xs text-slate-400 mb-1">Deploy URL</div>
            <a href={project.deploy_url} target="_blank" className="text-xs text-[#00d4ff] hover:underline truncate block">{project.deploy_url}</a>
          </div>
        )}
        <button onClick={save} disabled={saving || !project}
          className="w-full rounded-xl bg-[#00d4ff] py-2.5 text-sm font-bold text-[#0a0e14] disabled:opacity-40 hover:brightness-110 transition flex items-center justify-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}