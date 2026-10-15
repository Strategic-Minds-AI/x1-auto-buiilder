import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";
import {
  Loader2, RefreshCw, Wand2, Edit3, Save, X, Sparkles,
  MousePointer2, Check, AlertCircle,
} from "lucide-react";

export default function GenerationStudioOutput({
  output,
  currentItem,
  loading,
  onRegenerate,
  onUpdateContent,
  onShowShare,
}) {
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [selection, setSelection] = useState(null);
  const [regenModal, setRegenModal] = useState(false);
  const [regenInstructions, setRegenInstructions] = useState("");
  const [regenLoading, setRegenLoading] = useState(false);
  const [regenError, setRegenError] = useState("");
  const outputRef = useRef(null);

  useEffect(() => {
    setEditContent(output);
  }, [output]);

  const handleMouseUp = () => {
    if (editMode) return;
    setTimeout(() => {
      const sel = window.getSelection();
      const text = sel?.toString()?.trim();
      if (text && text.length > 10 && outputRef.current?.contains(sel.anchorNode)) {
        const rect = sel.getRangeAt(0).getBoundingClientRect();
        setSelection({ text, rect });
      } else {
        setSelection(null);
      }
    }, 10);
  };

  const handleRegenerateSelection = async () => {
    if (!currentItem || !selection) return;
    setRegenLoading(true);
    setRegenError("");
    try {
      const res = await base44.functions.invoke("universalGenerate", {
        action: "regenerate_selection",
        item_id: currentItem.id,
        selection_text: selection.text,
        selection_context: output.substring(0, 800),
        instructions: regenInstructions,
      });
      if (res.data?.success) {
        onUpdateContent(res.data.content);
        setSelection(null);
        setRegenModal(false);
        setRegenInstructions("");
      } else {
        setRegenError(res.data?.error || "Failed to regenerate");
      }
    } catch (err) {
      setRegenError(err.message || "Failed to regenerate");
    } finally {
      setRegenLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!currentItem) return;
    try {
      await base44.functions.invoke("universalGenerate", {
        action: "update_content",
        item_id: currentItem.id,
        content: editContent,
      });
      onUpdateContent(editContent);
      setEditMode(false);
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00d4ff]/20 to-[#0066ff]/20 flex items-center justify-center mb-4">
          <Loader2 className="w-8 h-8 text-[#00d4ff] animate-spin" />
        </div>
        <p className="text-sm font-semibold text-slate-600">Generating your content...</p>
        <p className="text-xs text-slate-400 mt-1">This may take a few moments</p>
      </div>
    );
  }

  if (!output) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-slate-300" />
        </div>
        <p className="text-sm font-semibold text-slate-400">No output yet</p>
        <p className="text-xs text-slate-400 mt-1">Configure your generator and click Generate</p>
        <div className="mt-6 flex items-center gap-2 text-xs text-slate-400">
          <MousePointer2 className="w-3.5 h-3.5" />
          <span>Tip: Select any text in the output to regenerate just that section</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Generated Output</span>
          {currentItem && (
            <span className="text-[10px] text-slate-400 ml-2">ID: {currentItem.id?.substring(0, 8)}...</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {editMode ? (
            <>
              <button onClick={handleSaveEdit} className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-600 transition">
                <Save className="w-3.5 h-3.5" /> Save
              </button>
              <button onClick={() => { setEditMode(false); setEditContent(output); }} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 transition">
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setEditMode(true)} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 transition">
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </button>
              <button onClick={onRegenerate} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 transition">
                <RefreshCw className="w-3.5 h-3.5" /> Regenerate
              </button>
              <button onClick={onShowShare} className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#00d4ff] to-[#0066ff] px-3 py-1.5 text-xs font-bold text-white hover:brightness-110 transition">
                <Wand2 className="w-3.5 h-3.5" /> Share / Save
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      {editMode ? (
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="w-full min-h-[500px] p-6 text-sm text-slate-700 font-mono focus:outline-none resize-y"
          placeholder="Edit your content..."
        />
      ) : (
        <div ref={outputRef} onMouseUp={handleMouseUp} className="p-6 max-h-[calc(100vh-320px)] overflow-y-auto">
          <ReactMarkdown
            className="text-sm text-slate-700 prose prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-li:my-0.5 prose-headings:my-3 prose-h1:text-lg prose-h1:font-bold prose-h2:text-base prose-h2:font-bold prose-h3:text-sm prose-h3:font-semibold prose-code:text-[#00d4ff] prose-code:bg-slate-100 prose-code:px-1 prose-code:rounded prose-pre:bg-slate-900 prose-pre:text-slate-100"
          >
            {output}
          </ReactMarkdown>
        </div>
      )}

      {/* Floating selection toolbar */}
      {selection && !editMode && (
        <div
          className="fixed z-50 flex items-center gap-1 rounded-xl bg-[#0a0e14] px-2 py-1.5 shadow-2xl"
          style={{
            left: Math.min(selection.rect.left + selection.rect.width / 2 - 60, window.innerWidth - 130),
            top: Math.max(selection.rect.top - 48, 10),
          }}
        >
          <button
            onClick={() => { setRegenModal(true); }}
            className="flex items-center gap-1.5 rounded-lg bg-[#00d4ff] px-3 py-1.5 text-xs font-bold text-[#0a0e14] hover:brightness-110 transition"
          >
            <RefreshCw className="w-3 h-3" /> Regenerate Selection
          </button>
          <button
            onClick={() => setSelection(null)}
            className="rounded-lg p-1.5 text-white/60 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Regenerate selection modal */}
      {regenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setRegenModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#00d4ff]/10 flex items-center justify-center">
                <RefreshCw className="w-4 h-4 text-[#00d4ff]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Regenerate Selection</h3>
                <p className="text-xs text-slate-400">The selected text will be replaced with a new version</p>
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 mb-4 max-h-32 overflow-y-auto">
              <p className="text-xs text-slate-500 italic">"{selection?.text?.substring(0, 200)}..."</p>
            </div>

            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5 block">Additional Instructions (optional)</label>
            <textarea
              value={regenInstructions}
              onChange={(e) => setRegenInstructions(e.target.value)}
              placeholder="e.g., Make it more detailed, add specific examples, change the tone..."
              rows={3}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/30 resize-none mb-4"
            />

            {regenError && (
              <div className="flex items-center gap-2 text-xs text-red-500 mb-3">
                <AlertCircle className="w-4 h-4" /> {regenError}
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={handleRegenerateSelection}
                disabled={regenLoading}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] py-2.5 text-sm font-bold text-white disabled:opacity-40 hover:brightness-110 transition"
              >
                {regenLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Regenerating...</> : <><RefreshCw className="w-4 h-4" /> Regenerate</>}
              </button>
              <button onClick={() => { setRegenModal(false); setRegenInstructions(""); }} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-100 transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}