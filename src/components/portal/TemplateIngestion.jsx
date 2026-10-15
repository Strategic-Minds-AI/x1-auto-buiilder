import { useState, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import {
  UploadCloud, FileCode2, Loader2, CheckCircle2, AlertCircle,
  Sparkles, Boxes, FolderTree, Package, ChevronDown, ChevronRight, X, RefreshCw,
} from "lucide-react";

const TEMPLATE_TYPES = [
  { value: "auto", label: "Auto-Detect", icon: Sparkles },
  { value: "website", label: "Website", icon: Boxes },
  { value: "design", label: "Design Layout", icon: FileCode2 },
  { value: "platform", label: "Platform", icon: Package },
  { value: "b2b", label: "B2B", icon: FileCode2 },
  { value: "saas", label: "SaaS", icon: FileCode2 },
  { value: "funnel", label: "Funnel", icon: FileCode2 },
  { value: "chat_ui", label: "Chat UI", icon: FileCode2 },
  { value: "workflow", label: "Workflow", icon: Boxes },
];

const ACCEPTED = ".html,.htm,.json,.jsx,.tsx,.js,.ts,.css,.md,.txt,.xml,.yaml,.yml,.vue,.svelte";

const STAGES = {
  pending: { label: "Pending", icon: UploadCloud, color: "text-slate-400" },
  reading: { label: "Reading file", icon: Loader2, color: "text-blue-500" },
  classifying: { label: "AI classifying", icon: Sparkles, color: "text-purple-500" },
  universalizing: { label: "Universalizing", icon: Boxes, color: "text-indigo-500" },
  installing: { label: "Installing", icon: Package, color: "text-cyan-500" },
  done: { label: "Installed", icon: CheckCircle2, color: "text-emerald-500" },
  error: { label: "Failed", icon: AlertCircle, color: "text-red-500" },
};

export default function TemplateIngestion() {
  const [files, setFiles] = useState([]); // { id, file, stage, result, error, overrideType }
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const inputRef = useRef(null);
  const idCounter = useRef(0);

  const addFiles = useCallback((fileList) => {
    const newFiles = Array.from(fileList).map((file) => ({
      id: `f${++idCounter.current}`,
      file,
      stage: "pending",
      result: null,
      error: null,
      overrideType: "auto",
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files;
    if (dropped && dropped.length) addFiles(dropped);
  }, [addFiles]);

  const readFile = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });

  const processFile = async (fileEntry) => {
    const update = (id, patch) =>
      setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));

    try {
      update(fileEntry.id, { stage: "reading" });
      const content = await readFile(fileEntry.file);

      update(fileEntry.id, { stage: "classifying" });
      const overrideType = fileEntry.overrideType === "auto" ? null : fileEntry.overrideType;

      const res = await base44.functions.invoke("ingestTemplate", {
        filename: fileEntry.file.name,
        content,
        overrideType,
        install: true,
      });

      update(fileEntry.id, { stage: "done", result: res.data });
    } catch (err) {
      update(fileEntry.id, {
        stage: "error",
        error: err.response?.data?.error || err.message || "Processing failed",
      });
    }
  };

  const processAll = async () => {
    const pending = files.filter((f) => f.stage === "pending" || f.stage === "error");
    if (!pending.length) return;
    setProcessing(true);
    // Process in batches of 3 for concurrency control
    for (let i = 0; i < pending.length; i += 3) {
      const batch = pending.slice(i, i + 3);
      await Promise.allSettled(batch.map(processFile));
    }
    setProcessing(false);
  };

  const removeFile = (id) => setFiles((prev) => prev.filter((f) => f.id !== id));
  const clearDone = () => setFiles((prev) => prev.filter((f) => f.stage !== "done"));

  const doneCount = files.filter((f) => f.stage === "done").length;
  const errCount = files.filter((f) => f.stage === "error").length;
  const pendingCount = files.filter((f) => f.stage === "pending").length;

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#00d4ff]/10 flex items-center justify-center">
            <UploadCloud className="w-5 h-5 text-[#00d4ff]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Template Ingestion System</h1>
            <p className="text-sm text-slate-500">
              Upload your existing templates — the AI classifies the type, universalizes the structure, and installs it into the right library.
            </p>
          </div>
        </div>
      </div>

      {/* Pipeline visualization */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {[
          { icon: UploadCloud, label: "Upload", color: "text-slate-600" },
          { icon: Sparkles, label: "Classify", color: "text-purple-500" },
          { icon: Boxes, label: "Universalize", color: "text-indigo-500" },
          { icon: FolderTree, label: "Organize", color: "text-cyan-500" },
          { icon: Package, label: "Install", color: "text-emerald-500" },
        ].map((step, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
              <step.icon className={`w-3.5 h-3.5 ${step.color}`} />
              {step.label}
            </div>
            {i < 4 && <div className="w-4 h-px bg-slate-300" />}
          </div>
        ))}
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative rounded-2xl border-2 border-dashed transition-all cursor-pointer p-10 mb-6 ${
          dragOver
            ? "border-[#00d4ff] bg-[#00d4ff]/5 scale-[1.01]"
            : "border-slate-300 bg-slate-50 hover:border-[#00d4ff]/50 hover:bg-[#00d4ff]/3"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED}
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
        <div className="text-center">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-white shadow-sm items-center justify-center mb-3">
            <UploadCloud className="w-7 h-7 text-[#00d4ff]" />
          </div>
          <p className="font-bold text-slate-800 mb-1">Drop template files here or click to browse</p>
          <p className="text-xs text-slate-400">
            Supports HTML, JSON, JSX, TSX, CSS, Markdown, Vue, Svelte — multiple files at once
          </p>
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-3">
          {/* Summary bar */}
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3 text-sm">
              <span className="font-bold text-slate-700">{files.length} file{files.length !== 1 ? "s" : ""}</span>
              {doneCount > 0 && <span className="text-emerald-600 font-semibold">{doneCount} installed</span>}
              {errCount > 0 && <span className="text-red-500 font-semibold">{errCount} failed</span>}
              {pendingCount > 0 && <span className="text-slate-400">{pendingCount} pending</span>}
            </div>
            <div className="flex items-center gap-2">
              {doneCount > 0 && (
                <button onClick={clearDone} className="text-xs text-slate-400 hover:text-slate-600 font-medium">
                  Clear installed
                </button>
              )}
              <button
                onClick={processAll}
                disabled={processing || pendingCount === 0}
                className="inline-flex items-center gap-2 rounded-full bg-[#00d4ff] px-5 py-2 text-sm font-bold text-[#0a0e14] hover:brightness-110 hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] transition disabled:opacity-40"
              >
                {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {processing ? "Processing..." : `Process ${pendingCount || ""} Template${pendingCount !== 1 ? "s" : ""}`}
              </button>
            </div>
          </div>

          {files.map((f) => (
            <FileCard
              key={f.id}
              entry={f}
              onRemove={() => removeFile(f.id)}
              onOverride={(type) =>
                setFiles((prev) => prev.map((x) => (x.id === f.id ? { ...x, overrideType: type } : x)))
              }
              expanded={expanded === f.id}
              onToggle={() => setExpanded(expanded === f.id ? null : f.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FileCard({ entry, onRemove, onOverride, expanded, onToggle }) {
  const { file, stage, result, error, overrideType } = entry;
  const stageInfo = STAGES[stage] || STAGES.pending;
  const Icon = stageInfo.icon;
  const sizeKb = (file.size / 1024).toFixed(1);

  return (
    <div
      className={`rounded-xl border transition-all ${
        stage === "done"
          ? "border-emerald-200 bg-emerald-50/50"
          : stage === "error"
          ? "border-red-200 bg-red-50/50"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-center gap-3 p-3.5">
        {/* Stage icon */}
        <div className={`shrink-0 ${stageInfo.color}`}>
          <Icon className={`w-5 h-5 ${stage === "reading" || stage === "classifying" || stage === "universalizing" || stage === "installing" ? "animate-spin" : ""}`} />
        </div>

        {/* File info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-slate-800 truncate">{file.name}</span>
            <span className="text-xs text-slate-400 shrink-0">{sizeKb} KB</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-xs font-medium ${stageInfo.color}`}>{stageInfo.label}</span>
            {result && (
              <>
                <span className="text-slate-300">→</span>
                <span className="text-xs font-bold text-slate-700">{result.entity}</span>
                {result.sub_type && (
                  <span className="text-xs text-slate-400">({result.sub_type})</span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Type override selector (only when pending) */}
        {stage === "pending" && (
          <select
            value={overrideType}
            onChange={(e) => onOverride(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className="text-xs rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-slate-600 font-medium focus:outline-none focus:border-[#00d4ff]/40"
          >
            {TEMPLATE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        )}

        {/* Expand button */}
        {result && (
          <button onClick={onToggle} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        )}

        {/* Remove */}
        <button onClick={onRemove} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-300 hover:text-slate-500">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="px-3.5 pb-3.5">
          <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600">
            {error}
          </div>
        </div>
      )}

      {/* Expanded result */}
      {result && expanded && (
        <div className="border-t border-slate-100 p-4 space-y-3">
          {/* Classification */}
          <div className="grid grid-cols-2 gap-3">
            <InfoBox label="Template Type" value={result.template_type} />
            <InfoBox label="Sub-Type" value={result.sub_type || "—"} />
            <InfoBox label="Name" value={result.name} />
            <InfoBox label="Industry" value={result.industry || "—"} />
            <InfoBox label="Confidence" value={result.confidence ? `${result.confidence}%` : "—"} />
            <InfoBox label="Installed To" value={result.entity} highlight />
          </div>

          {/* Colors */}
          {result.colors && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-500">Colors:</span>
              {result.colors.tone && <ColorChip color={result.colors.tone} label="BG" />}
              {result.colors.ink && <ColorChip color={result.colors.ink} label="Text" />}
              {result.colors.accent && <ColorChip color={result.colors.accent} label="Accent" />}
            </div>
          )}

          {/* Reasoning */}
          {result.reasoning && (
            <div>
              <span className="text-xs font-semibold text-slate-500">AI Analysis:</span>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">{result.reasoning}</p>
            </div>
          )}

          {/* Install error */}
          {result.install_error && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700">
              <strong>Install failed:</strong> {result.install_error}
            </div>
          )}

          {/* Record ID */}
          {result.record_id && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Record ID: <code className="font-mono text-emerald-700">{result.record_id}</code>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InfoBox({ label, value, highlight }) {
  return (
    <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
      <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-0.5">{label}</div>
      <div className={`text-sm font-semibold ${highlight ? "text-[#00d4ff]" : "text-slate-800"}`}>
        {value || "—"}
      </div>
    </div>
  );
}

function ColorChip({ color, label }) {
  return (
    <div className="inline-flex items-center gap-1.5">
      <span
        className="w-4 h-4 rounded border border-slate-200"
        style={{ background: color }}
      />
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}