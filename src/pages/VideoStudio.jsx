import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Video, Play, Smartphone, Monitor, Volume2, VolumeX, Sparkles } from "lucide-react";

export default function VideoStudio() {
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [audio, setAudio] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  const generate = async () => {
    if (prompt.trim().length < 10) {
      setError("Prompt must be at least 10 characters");
      return;
    }
    setGenerating(true);
    setError(null);
    setVideoUrl(null);
    try {
      const res = await base44.functions.invoke("generateVideo", {
        prompt: prompt.trim(),
        aspect_ratio: aspectRatio,
        generate_audio: audio,
      });
      setVideoUrl(res.data.url);
      setHistory((h) => [{ prompt: prompt.trim(), url: res.data.url, ts: Date.now() }, ...h].slice(0, 6));
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center">
            <Video className="w-5 h-5 text-[#0a0e14]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">AI Video Studio</h1>
            <p className="text-sm text-slate-500">Generate hero videos and background loops for your websites</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input panel */}
        <div className="rounded-2xl bg-white border border-slate-200 p-5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Video Prompt</label>
          <textarea
            className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#00d4ff]/50 focus:ring-1 focus:ring-[#00d4ff]/30 transition resize-none"
            rows={6}
            placeholder="A serene mountain lake at sunset with gentle ripples, cinematic wide shot, warm golden lighting…"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            maxLength={1000}
          />
          <div className="flex justify-between items-center mt-1.5">
            <span className="text-[10px] text-slate-400">{prompt.length}/1000</span>
          </div>

          {/* Controls */}
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Aspect Ratio</label>
              <div className="flex gap-2">
                <RatioBtn active={aspectRatio === "16:9"} onClick={() => setAspectRatio("16:9")} icon={Monitor} label="Landscape 16:9" />
                <RatioBtn active={aspectRatio === "9:16"} onClick={() => setAspectRatio("9:16")} icon={Smartphone} label="Portrait 9:16" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Audio</label>
              <button
                onClick={() => setAudio(!audio)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  audio ? "bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/30" : "bg-slate-50 text-slate-500 border border-slate-200"
                }`}
              >
                {audio ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                {audio ? "Audio enabled" : "Muted (default)"}
              </button>
            </div>
          </div>

          {/* Generate */}
          <button
            onClick={generate}
            disabled={generating || prompt.trim().length < 10}
            className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#00d4ff] px-5 py-3 text-sm font-bold text-[#0a0e14] hover:brightness-110 hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] transition disabled:opacity-50"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {generating ? "Generating… (30-60s)" : "Generate Video"}
          </button>
          {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
        </div>

        {/* Preview panel */}
        <div className="rounded-2xl bg-white border border-slate-200 p-5 flex flex-col">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Preview</label>
          {generating ? (
            <div className={`flex-1 flex flex-col items-center justify-center bg-slate-50 rounded-xl ${aspectRatio === "9:16" ? "max-w-[200px] mx-auto" : ""}`} style={{ minHeight: aspectRatio === "9:16" ? "360px" : "240px" }}>
              <Loader2 className="w-8 h-8 animate-spin text-[#00d4ff] mb-3" />
              <p className="text-xs text-slate-500 text-center px-4">Generating your video…<br />This takes 30-60 seconds.</p>
            </div>
          ) : videoUrl ? (
            <div className="flex-1 flex items-center justify-center">
              <video
                src={videoUrl}
                controls
                autoPlay
                loop
                muted={!audio}
                className={`rounded-xl ${aspectRatio === "9:16" ? "max-h-[360px] max-w-[200px]" : "w-full"}`}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 rounded-xl" style={{ minHeight: "240px" }}>
              <Play className="w-10 h-10 text-slate-300 mb-2" />
              <p className="text-xs text-slate-400">Your generated video will appear here</p>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Recent</div>
              <div className="flex gap-2 overflow-x-auto">
                {history.map((h, i) => (
                  <button
                    key={i}
                    onClick={() => setVideoUrl(h.url)}
                    className="shrink-0 w-16 h-10 rounded-lg overflow-hidden border border-slate-200 hover:border-[#00d4ff]/40 transition"
                  >
                    <video src={h.url} muted className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RatioBtn({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
        active ? "bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/30" : "bg-slate-50 text-slate-500 border border-slate-200"
      }`}
    >
      <Icon className="w-4 h-4" /> {label}
    </button>
  );
}