import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function BackButton({ fallback = "/portal", label = "Back to Portal" }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(fallback)}
      className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:text-[#00d4ff] hover:border-[#00d4ff]/40 transition mb-4"
    >
      <ArrowLeft className="w-4 h-4" /> {label}
    </button>
  );
}