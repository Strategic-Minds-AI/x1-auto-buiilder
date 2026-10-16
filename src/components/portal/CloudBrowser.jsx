import { useState, useRef, useCallback } from "react";
import { Monitor, Tablet, Smartphone, RefreshCw, ExternalLink, Globe, Lock, ArrowLeft, ArrowRight } from "lucide-react";

const DEVICES = {
  desktop: { width: "100%", height: "100%", icon: Monitor, label: "Desktop" },
  tablet: { width: "768px", height: "1024px", icon: Tablet, label: "Tablet" },
  mobile: { width: "375px", height: "667px", icon: Smartphone, label: "Mobile" },
};

export default function CloudBrowser({ url: initialUrl = "", onClose }) {
  const [url, setUrl] = useState(initialUrl);
  const [inputUrl, setInputUrl] = useState(initialUrl);
  const [device, setDevice] = useState("desktop");
  const [refreshKey, setRefreshKey] = useState(0);
  const [history, setHistory] = useState(initialUrl ? [initialUrl] : []);
  const [historyIdx, setHistoryIdx] = useState(initialUrl ? 0 : -1);
  const [loading, setLoading] = useState(false);
  const iframeRef = useRef(null);

  const navigate = useCallback((newUrl) => {
    let normalized = newUrl.trim();
    if (!normalized) return;
    if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
      normalized = "https://" + normalized;
    }
    setUrl(normalized);
    setInputUrl(normalized);
    setLoading(true);
    const newHistory = history.slice(0, historyIdx + 1);
    newHistory.push(normalized);
    setHistory(newHistory);
    setHistoryIdx(newHistory.length - 1);
  }, [history, historyIdx]);

  const goBack = () => {
    if (historyIdx > 0) {
      const newIdx = historyIdx - 1;
      setHistoryIdx(newIdx);
      setUrl(history[newIdx]);
      setInputUrl(history[newIdx]);
      setRefreshKey(k => k + 1);
    }
  };

  const goForward = () => {
    if (historyIdx < history.length - 1) {
      const newIdx = historyIdx + 1;
      setHistoryIdx(newIdx);
      setUrl(history[newIdx]);
      setInputUrl(history[newIdx]);
      setRefreshKey(k => k + 1);
    }
  };

  const refresh = () => {
    setRefreshKey(k => k + 1);
    setLoading(true);
  };

  const deviceConfig = DEVICES[device];
  const DeviceIcon = deviceConfig.icon;

  return (
    <div className="flex flex-col h-full bg-slate-100">
      {/* Browser chrome — address bar + controls */}
      <div className="bg-slate-800 px-3 py-2 flex items-center gap-2 shrink-0">
        {/* Nav buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={goBack}
            disabled={historyIdx <= 0}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/10 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={goForward}
            disabled={historyIdx >= history.length - 1}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/10 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={refresh}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Address bar */}
        <div className="flex-1 flex items-center gap-2 bg-slate-700 rounded-full px-3 py-1.5">
          <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <input
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && navigate(inputUrl)}
            placeholder="Enter URL or paste a deployed site address..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
          />
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded text-slate-400 hover:text-white transition shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Device toggle */}
        <div className="flex items-center gap-1 bg-slate-700 rounded-full p-1">
          {Object.entries(DEVICES).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <button
                key={key}
                onClick={() => setDevice(key)}
                title={config.label}
                className={`p-1.5 rounded-full transition ${device === key ? "bg-[#00d4ff] text-slate-900" : "text-slate-400 hover:text-white"}`}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            ✕
          </button>
        )}
      </div>

      {/* Browser viewport */}
      <div className="flex-1 overflow-auto flex items-start justify-center p-4 bg-slate-200">
        {url ? (
          <div
            className="bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300"
            style={{
              width: deviceConfig.width,
              height: deviceConfig.height,
              maxWidth: "100%",
            }}
          >
            <iframe
              key={refreshKey}
              ref={iframeRef}
              src={url}
              title="Cloud Browser Preview"
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              onLoad={() => setLoading(false)}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <Globe className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-sm font-semibold">Enter a URL above to preview any site</p>
            <p className="text-xs mt-1">Desktop, tablet, and mobile views available</p>
          </div>
        )}
      </div>
    </div>
  );
}