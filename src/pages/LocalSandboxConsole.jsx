import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Monitor, Cpu, Terminal, Wifi, WifiOff, Send, RefreshCw, Loader2, Download, Copy, CheckCircle2, XCircle, Clock } from "lucide-react";

export default function LocalSandboxConsole() {
  const [sessions, setSessions] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [newSession, setNewSession] = useState(null);
  const [copied, setCopied] = useState("");
  const [commandForm, setCommandForm] = useState({ sessionId: "", commandType: "shell", cmd: "" });
  const [sending, setSending] = useState(false);

  const loadStatus = useCallback(async () => {
    try {
      const res = await base44.functions.invoke("localSandboxBridge", { action: "status" });
      setSessions(res.data?.sessions || []);
      setPendingCount(res.data?.pending_commands || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 10000);
    return () => clearInterval(interval);
  }, [loadStatus]);

  const registerMachine = async () => {
    setRegistering(true);
    try {
      const res = await base44.functions.invoke("localSandboxBridge", {
        action: "register",
        machineName: `Machine-${Math.random().toString(36).slice(2, 6)}`,
        capabilities: ["shell", "filesystem", "npm", "node", "git", "dev_server"],
        workingDir: "~",
        os: "unknown",
      });
      setNewSession(res.data);
      loadStatus();
    } catch (err) {
      console.error(err);
    } finally {
      setRegistering(false);
    }
  };

  const sendCommand = async () => {
    if (!commandForm.sessionId || !commandForm.cmd) return;
    setSending(true);
    try {
      await base44.functions.invoke("localSandboxBridge", {
        action: "command",
        sessionId: commandForm.sessionId,
        commandType: commandForm.commandType,
        payload: { cmd: commandForm.cmd },
        source: "admin",
      });
      setCommandForm({ ...commandForm, cmd: "" });
      loadStatus();
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const copy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  };

  const onlineCount = sessions.filter(s => s.online).length;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Monitor className="w-7 h-7 text-[#00d4ff]" />
              <h1 className="text-2xl font-black text-slate-900">Local Sandbox Bridge</h1>
            </div>
            <p className="text-sm text-slate-500">Connect your local computer as a live sandbox — GPT sends commands, your machine executes them.</p>
          </div>
          <button onClick={loadStatus} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition">
            <RefreshCw className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatCard icon={Wifi} label="Online Machines" value={onlineCount} color="emerald" />
          <StatCard icon={Cpu} label="Total Sessions" value={sessions.length} color="blue" />
          <StatCard icon={Clock} label="Pending Commands" value={pendingCount} color="amber" />
        </div>

        {/* Register new machine */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Register New Machine</h2>
            <button
              onClick={registerMachine}
              disabled={registering}
              className="inline-flex items-center gap-2 rounded-full bg-[#00d4ff] px-5 py-2 text-sm font-bold text-[#0a0e14] hover:brightness-110 disabled:opacity-50 transition"
            >
              {registering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {registering ? "Registering..." : "Generate Session"}
            </button>
          </div>

          {newSession && (
            <div className="bg-slate-900 rounded-xl p-4 font-mono text-sm">
              <div className="text-[#00d4ff] mb-2 text-xs">▸ Run this command on your local machine:</div>
              <div className="text-white/90 break-all">
                node local-sandbox-agent.js {newSession.session_id} {newSession.auth_token}
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => copy(`node local-sandbox-agent.js ${newSession.session_id} ${newSession.auth_token}`, "cmd")} className="text-xs px-3 py-1 rounded-full bg-white/10 text-white hover:bg-white/20 transition">
                  {copied === "cmd" ? <CheckCircle2 className="w-3 h-3 inline mr-1" /> : <Copy className="w-3 h-3 inline mr-1" />}
                  Copy Command
                </button>
                <a href="/local-sandbox-agent.js" download className="text-xs px-3 py-1 rounded-full bg-white/10 text-white hover:bg-white/20 transition inline-flex items-center gap-1">
                  <Download className="w-3 h-3" /> Download Agent
                </a>
              </div>
              <div className="text-white/40 text-xs mt-3">
                Session ID: {newSession.session_id}
              </div>
            </div>
          )}

          {!newSession && (
            <p className="text-xs text-slate-500">
              Click "Generate Session" to create a connection token. Then download the agent script and run the command on your computer.
              The agent will poll this app every 5 seconds for commands from GPT and execute them locally.
            </p>
          )}
        </div>

        {/* Send command */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">Send Command to Machine</h2>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <select
              value={commandForm.sessionId}
              onChange={(e) => setCommandForm({ ...commandForm, sessionId: e.target.value })}
              className="md:col-span-4 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/40"
            >
              <option value="">Select machine...</option>
              {sessions.map(s => (
                <option key={s.id} value={s.session_id}>{s.machine_name} {s.online ? "🟢" : "⚫"}</option>
              ))}
            </select>
            <select
              value={commandForm.commandType}
              onChange={(e) => setCommandForm({ ...commandForm, commandType: e.target.value })}
              className="md:col-span-2 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/40"
            >
              <option value="shell">Shell</option>
              <option value="file_write">File Write</option>
              <option value="file_read">File Read</option>
              <option value="file_list">File List</option>
              <option value="npm_run">npm run</option>
              <option value="npm_install">npm install</option>
              <option value="git_clone">git clone</option>
              <option value="dev_server">Dev Server</option>
            </select>
            <input
              type="text"
              value={commandForm.cmd}
              onChange={(e) => setCommandForm({ ...commandForm, cmd: e.target.value })}
              placeholder="e.g. ls -la  or  npm run dev  or  echo hello"
              className="md:col-span-4 rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/40"
              onKeyDown={(e) => e.key === "Enter" && sendCommand()}
            />
            <button
              onClick={sendCommand}
              disabled={sending || !commandForm.sessionId || !commandForm.cmd}
              className="md:col-span-2 inline-flex items-center justify-center gap-2 rounded-lg bg-[#0a0e14] px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50 transition"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Terminal className="w-4 h-4" />}
              Send
            </button>
          </div>
        </div>

        {/* Sessions list */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">Connected Machines</h2>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              <Monitor className="w-10 h-10 mx-auto mb-2 opacity-30" />
              No machines registered yet. Generate a session above to connect your computer.
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map(s => (
                <div key={s.id} className="border border-slate-200 rounded-xl p-4 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${s.online ? "bg-emerald-100" : "bg-slate-100"}`}>
                    {s.online ? <Wifi className="w-5 h-5 text-emerald-600" /> : <WifiOff className="w-5 h-5 text-slate-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-800 text-sm">{s.machine_name}</div>
                    <div className="text-xs text-slate-500">
                      {s.os} · {s.commands_executed || 0} commands · {s.commands_failed || 0} failed
                      {s.working_dir && ` · ${s.working_dir}`}
                    </div>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {(s.capabilities || []).map(c => (
                        <span key={c} className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">{c}</span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`text-xs font-bold ${s.online ? "text-emerald-600" : "text-slate-400"}`}>
                      {s.online ? "ONLINE" : "OFFLINE"}
                    </div>
                    {s.last_heartbeat && (
                      <div className="text-[10px] text-slate-400">
                        {new Date(s.last_heartbeat).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
  };
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-2xl font-black text-slate-900">{value}</div>
        <div className="text-xs text-slate-500">{label}</div>
      </div>
    </div>
  );
}