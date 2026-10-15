import { X, Layout, Grid3x3, FileText, Quote, Mail, Image, HelpCircle, DollarSign, MapPin } from "lucide-react";

const SECTIONS = [
  { id: "hero", label: "Hero Section", icon: Layout },
  { id: "services", label: "Services Grid", icon: Grid3x3 },
  { id: "about", label: "About Section", icon: FileText },
  { id: "testimonials", label: "Testimonials", icon: Quote },
  { id: "contact", label: "Contact Form", icon: Mail },
  { id: "gallery", label: "Image Gallery", icon: Image },
  { id: "faq", label: "FAQ Section", icon: HelpCircle },
  { id: "pricing", label: "Pricing Table", icon: DollarSign },
  { id: "map", label: "Map & Location", icon: MapPin },
];

export default function ComponentsPanel({ onClose, onAdd }) {
  return (
    <div className="absolute top-0 right-0 bottom-0 w-80 bg-white border-l border-slate-200 z-40 flex flex-col shadow-xl">
      <div className="h-12 px-4 flex items-center justify-between border-b border-slate-200 bg-slate-50 shrink-0">
        <h3 className="text-sm font-bold text-slate-800">Add Component</h3>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-200 transition"><X className="w-4 h-4" /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-3">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <button key={s.id} onClick={() => onAdd(s.label)}
              className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 p-4 hover:border-[#00d4ff]/40 hover:bg-[#00d4ff]/5 transition">
              <Icon className="w-6 h-6 text-slate-400" />
              <span className="text-xs font-semibold text-slate-600 text-center">{s.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}