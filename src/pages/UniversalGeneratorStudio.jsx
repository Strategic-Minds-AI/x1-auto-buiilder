import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import BackButton from "@/components/shared/BackButton";
import GenerationStudioOutput from "@/components/universal/GenerationStudioOutput";
import ShareSaveModal from "@/components/universal/ShareSaveModal";
import GenerationLibrary from "@/components/universal/GenerationLibrary";
import { INDUSTRY_TREE, GENERATION_TYPES, FILE_TYPES } from "@/data/universalStudioData";
import {
  Wand2, Sparkles, Loader2, ChevronDown, Library, Plus,
  FileText, Globe, LayoutGrid, Workflow, Boxes, FileSignature,
  Gavel, PenLine, Code, Target, Mail, Share2, LayoutTemplate,
  Filter, Palette, Zap, Bot, Save, RefreshCw, Layers,
} from "lucide-react";

const ICON_MAP = {
  FileText, Globe, LayoutGrid, Workflow, Boxes, FileSignature,
  Gavel, PenLine, Code, Target, Mail, Share2, LayoutTemplate,
  Filter, Palette, Sparkles,
};

export default function UniversalGeneratorStudio() {
  const [mode, setMode] = useState("generator");
  const [genType, setGenType] = useState("report");
  const [industry, setIndustry] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [amount, setAmount] = useState(1);
  const [fileType, setFileType] = useState("markdown");
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [currentItem, setCurrentItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [assistLoading, setAssistLoading] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [libraryRefresh, setLibraryRefresh] = useState(0);

  // Library Creator state
  const [libTitle, setLibTitle] = useState("");
  const [libPrompt, setLibPrompt] = useState("");
  const [libSaving, setLibSaving] = useState(false);

  const industries = Object.keys(INDUSTRY_TREE);
  const categories = industry ? Object.keys(INDUSTRY_TREE[industry]?.categories || {}) : [];
  const subcategories = category ? INDUSTRY_TREE[industry]?.categories[category] || [] : [];

  const selectedType = GENERATION_TYPES.find((t) => t.value === genType);

  const handleGenerate = async () => {
    setLoading(true);
    setOutput("");
    setCurrentItem(null);
    try {
      const res = await base44.functions.invoke("universalGenerate", {
        action: "generate",
        generation_type: genType,
        industry,
        category,
        subcategory,
        amount,
        prompt,
        save_to_library: true,
      });
      if (res.data?.success) {
        setOutput(res.data.content);
        setCurrentItem(res.data.item);
        setLibraryRefresh((p) => p + 1);
      } else {
        setOutput(`Error: ${res.data?.error || "Generation failed"}`);
      }
    } catch (err) {
      setOutput(`Error: ${err.message || "Generation failed"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!currentItem) return;
    setLoading(true);
    try {
      const res = await base44.functions.invoke("universalGenerate", {
        action: "regenerate",
        item_id: currentItem.id,
        prompt,
      });
      if (res.data?.success) {
        setOutput(res.data.content);
        setCurrentItem(res.data.item);
        setLibraryRefresh((p) => p + 1);
      }
    } catch (err) {
      console.error("Regenerate failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAIAssist = async () => {
    setAssistLoading(true);
    try {
      const res = await base44.functions.invoke("universalGenerate", {
        action: "assist",
        generation_type: genType,
        industry,
        category,
        subcategory,
        partial_prompt: prompt,
      });
      if (res.data?.success && res.data.prompt) {
        setPrompt(res.data.prompt);
      }
    } catch (err) {
      console.error("AI assist failed:", err);
    } finally {
      setAssistLoading(false);
    }
  };

  const handleReloadFromLibrary = (item) => {
    setGenType(item.generation_type || "custom");
    setIndustry(item.industry || "");
    setCategory(item.category || "");
    setSubcategory(item.subcategory || "");
    setAmount(item.amount || 1);
    setPrompt(item.prompt || "");
    setOutput(item.content || "");
    setCurrentItem(item);
    setMode("generator");
  };

  const handleSaveTemplate = async () => {
    if (!libTitle.trim()) return;
    setLibSaving(true);
    try {
      const res = await base44.functions.invoke("universalGenerate", {
        action: "save_template",
        title: libTitle,
        generation_type: genType,
        industry,
        category,
        subcategory,
        amount,
        prompt: libPrompt || prompt,
        file_type: fileType,
      });
      if (res.data?.success) {
        setLibTitle("");
        setLibPrompt("");
        setLibraryRefresh((p) => p + 1);
        setMode("library");
      }
    } catch (err) {
      console.error("Save template failed:", err);
    } finally {
      setLibSaving(false);
    }
  };

  return (
    <div className="portal-light min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <BackButton fallback="/portal" label="Back to Portal" />

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center">
              <Wand2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800">Universal Generation Studio</h1>
              <p className="text-sm text-slate-500">Generate anything — reports, proposals, bids, websites, platforms, workflows, full systems & more</p>
            </div>
          </div>

          {/* Mode tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMode("generator")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                mode === "generator"
                  ? "bg-gradient-to-br from-[#00d4ff] to-[#0066ff] text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-500 hover:border-[#00d4ff]/40"
              }`}
            >
              <Wand2 className="w-4 h-4" /> Universal Generator
            </button>
            <button
              onClick={() => setMode("library-creator")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                mode === "library-creator"
                  ? "bg-gradient-to-br from-[#00d4ff] to-[#0066ff] text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-500 hover:border-[#00d4ff]/40"
              }`}
            >
              <Plus className="w-4 h-4" /> Library Creator
            </button>
            <button
              onClick={() => setMode("library")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                mode === "library"
                  ? "bg-gradient-to-br from-[#00d4ff] to-[#0066ff] text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-500 hover:border-[#00d4ff]/40"
              }`}
            >
              <Library className="w-4 h-4" /> Library
            </button>
          </div>
        </div>

        {/* Generator Mode */}
        {mode === "generator" && (
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Controls */}
            <div className="lg:col-span-2 space-y-4">
              {/* Generation Type */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3 block">Generation Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {GENERATION_TYPES.map((t) => {
                    const Icon = ICON_MAP[t.icon] || Sparkles;
                    const active = genType === t.value;
                    return (
                      <button
                        key={t.value}
                        onClick={() => setGenType(t.value)}
                        className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition ${
                          active
                            ? "border-[#00d4ff] bg-[#00d4ff]/5 shadow-sm"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <Icon className="w-5 h-5" style={{ color: active ? t.color : "#94a3b8" }} />
                        <span className={`text-[10px] font-bold text-center leading-tight ${active ? "text-slate-700" : "text-slate-400"}`}>
                          {t.label}
                        </span>
                        {t.complexity === "complex" && (
                          <span className="text-[8px] font-bold text-orange-400">COMPLEX</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Industry / Category / Subcategory */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block">Target Industry</label>
                <select
                  value={industry}
                  onChange={(e) => { setIndustry(e.target.value); setCategory(""); setSubcategory(""); }}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/30"
                >
                  <option value="">Select Industry...</option>
                  {industries.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
                </select>

                {categories.length > 0 && (
                  <select
                    value={category}
                    onChange={(e) => { setCategory(e.target.value); setSubcategory(""); }}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/30"
                  >
                    <option value="">Select Category...</option>
                    {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                )}

                {subcategories.length > 0 && (
                  <select
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/30"
                  >
                    <option value="">Select Subcategory...</option>
                    {subcategories.map((sub) => <option key={sub} value={sub}>{sub}</option>)}
                  </select>
                )}
              </div>

              {/* Amount & File Type */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5 block">Amount</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={amount}
                    onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5 block">File Type</label>
                  <select
                    value={fileType}
                    onChange={(e) => setFileType(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/30"
                  >
                    {FILE_TYPES.map((ft) => <option key={ft.value} value={ft.value}>{ft.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Prompt with AI Assist */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Instructions / Prompt</label>
                  <button
                    onClick={handleAIAssist}
                    disabled={assistLoading}
                    className="flex items-center gap-1.5 rounded-lg bg-purple-50 border border-purple-200 px-3 py-1.5 text-xs font-bold text-purple-600 hover:bg-purple-100 transition disabled:opacity-40"
                  >
                    {assistLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5" />}
                    AI Assist
                  </button>
                </div>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={`Describe what you want to generate...\n\nExample: "Generate a comprehensive proposal for a concrete polishing company targeting commercial clients in Dallas, TX. Include pricing tiers, timeline, and scope of work."`}
                  rows={5}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/30 resize-none"
                />
                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || loading}
                  className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] py-3 text-sm font-bold text-white disabled:opacity-40 hover:brightness-110 transition"
                >
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate</>}
                </button>
              </div>
            </div>

            {/* Output */}
            <div className="lg:col-span-3">
              <GenerationStudioOutput
                output={output}
                currentItem={currentItem}
                loading={loading}
                onRegenerate={handleRegenerate}
                onUpdateContent={(c) => setOutput(c)}
                onShowShare={() => setShowShare(true)}
              />
            </div>
          </div>
        )}

        {/* Library Creator Mode */}
        {mode === "library-creator" && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Library Creator</h2>
                  <p className="text-xs text-slate-400">Create a reusable generation template with AI-assisted prompt building</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5 block">Template Title</label>
                <input
                  value={libTitle}
                  onChange={(e) => setLibTitle(e.target.value)}
                  placeholder="e.g., Concrete Polishing Proposal Template"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/30"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 block">Generation Type</label>
                <div className="flex flex-wrap gap-2">
                  {GENERATION_TYPES.map((t) => {
                    const Icon = ICON_MAP[t.icon] || Sparkles;
                    const active = genType === t.value;
                    return (
                      <button
                        key={t.value}
                        onClick={() => setGenType(t.value)}
                        className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                          active ? "border-[#00d4ff] bg-[#00d4ff]/5 text-[#00d4ff]" : "border-slate-200 text-slate-500 hover:border-slate-300"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" /> {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5 block">Industry</label>
                  <select value={industry} onChange={(e) => { setIndustry(e.target.value); setCategory(""); setSubcategory(""); }}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/30">
                    <option value="">Select...</option>
                    {industries.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5 block">Category</label>
                  <select value={category} onChange={(e) => { setCategory(e.target.value); setSubcategory(""); }}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/30 disabled:opacity-40" disabled={!industry}>
                    <option value="">Select...</option>
                    {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5 block">Subcategory</label>
                  <select value={subcategory} onChange={(e) => setSubcategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/30 disabled:opacity-40" disabled={!category}>
                    <option value="">Select...</option>
                    {subcategories.map((sub) => <option key={sub} value={sub}>{sub}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Prompt / Instructions</label>
                  <button onClick={handleAIAssist} disabled={assistLoading}
                    className="flex items-center gap-1.5 rounded-lg bg-purple-50 border border-purple-200 px-3 py-1.5 text-xs font-bold text-purple-600 hover:bg-purple-100 transition disabled:opacity-40">
                    {assistLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5" />} AI Assist
                  </button>
                </div>
                <textarea
                  value={libPrompt || prompt}
                  onChange={(e) => setLibPrompt(e.target.value)}
                  placeholder="Describe what this template should generate..."
                  rows={5}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/30 resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={handleSaveTemplate}
                  disabled={!libTitle.trim() || libSaving}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] px-6 py-2.5 text-sm font-bold text-white disabled:opacity-40 hover:brightness-110 transition"
                >
                  {libSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save to Library
                </button>
                <button
                  onClick={() => { setLibTitle(""); setLibPrompt(""); setPrompt(""); }}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50 transition"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Library Mode */}
        {mode === "library" && (
          <GenerationLibrary onReload={handleReloadFromLibrary} onRefresh={libraryRefresh} />
        )}
      </div>

      {/* Share/Save Modal */}
      {showShare && (
        <ShareSaveModal
          item={currentItem}
          content={output}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}