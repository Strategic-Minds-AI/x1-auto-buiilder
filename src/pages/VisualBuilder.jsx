import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import BackButton from "@/components/shared/BackButton";
import BuilderToolbar from "@/components/builder/BuilderToolbar";
import BuilderChat from "@/components/builder/BuilderChat";
import BuilderPreview from "@/components/builder/BuilderPreview";
import { Loader2, ChevronDown, Plus, MessageCircle, Radio, Rocket } from "lucide-react";

const AGENT_NAME = "super_agent";

export default function VisualBuilder() {
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState("desktop");
  const [deploying, setDeploying] = useState(false);
  const [provisioning, setProvisioning] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState(false);

  useEffect(() => { loadProjects(); startConversation(); }, []);

  // Real-time preview — subscribe to WebsiteProject changes so the preview updates live
  useEffect(() => {
    const unsub = base44.entities.WebsiteProject.subscribe((event) => {
      if (activeProject && event.data?.id === activeProject.id) {
        setActiveProject(event.data);
      }
      if (event.type === "create") loadProjects();
    });
    return unsub;
  }, [activeProject?.id]);

  const loadProjects = async () => {
    setLoadingProjects(true);
    try {
      const page = await base44.entities.WebsiteProject.filter({}, { sort: "-created_date", limit: 50 });
      setProjects(page.items || []);
      if (page.items?.length > 0 && !activeProject) setActiveProject(page.items[0]);
    } catch {} finally { setLoadingProjects(false); }
  };

  const startConversation = async () => {
    try {
      const conv = await base44.agents.createConversation({
        agent_name: AGENT_NAME,
        metadata: { name: "Visual Builder Session", description: "Chat-guided visual editor" },
      });
      setConversation(conv);
      const unsub = base44.agents.subscribeToConversation(conv.id, (data) => {
        setMessages(data.messages || []);
      });
      return () => unsub();
    } catch {}
  };

  const sendMessage = async (text) => {
    if (!conversation) return;
    setChatLoading(true);
    setMessages(prev => [...prev, { role: "user", content: text }]);
    try {
      await base44.agents.addMessage(conversation, { role: "user", content: text });
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "Error: " + (err.message || "Failed") }]);
    } finally { setChatLoading(false); }
  };

  const handleDeploy = async () => {
    if (!activeProject) return;
    setDeploying(true);
    try {
      await base44.functions.invoke("deploySite", { projectId: activeProject.id });
      await loadProjects();
    } catch {} finally { setDeploying(false); }
  };

  const handleProvisionVercel = async () => {
    if (!activeProject) return;
    setProvisioning(true);
    try {
      await base44.functions.invoke("provisionSandbox", {
        action: "create",
        platform: "vercel",
        projectId: activeProject.id,
        name: activeProject.business_name || activeProject.id,
      });
      await base44.functions.invoke("deploySite", { projectId: activeProject.id });
      await loadProjects();
    } catch {} finally { setProvisioning(false); }
  };

  const handleNewProject = () => {
    sendMessage("Generate a new website project. Ask me for the business name, industry, and location.");
  };

  return (
    <div className="h-screen flex flex-col bg-slate-100">
      {/* Top bar */}
      <div className="h-12 bg-[#0a0e14] border-b border-black/20 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <BackButton fallback="/portal" label="Back" />
          <div className="h-4 w-px bg-white/20" />
          {/* Project selector */}
          <div className="relative">
            <button onClick={() => setShowProjectMenu(!showProjectMenu)}
              className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-sm font-semibold text-white hover:bg-white/20 transition">
              {activeProject?.business_name || "Select Project"} <ChevronDown className="w-3 h-3" />
            </button>
            {showProjectMenu && (
              <div className="absolute top-full mt-1 left-0 w-64 rounded-xl border border-slate-200 bg-white shadow-xl py-1 z-50 max-h-80 overflow-y-auto">
                <button onClick={() => { handleNewProject(); setShowProjectMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-[#00d4ff] hover:bg-slate-50">
                  <Plus className="w-4 h-4" /> New Project
                </button>
                {loadingProjects && <div className="px-3 py-2 text-xs text-slate-400">Loading...</div>}
                {projects.map((p) => (
                  <button key={p.id} onClick={() => { setActiveProject(p); setShowProjectMenu(false); }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 ${activeProject?.id === p.id ? "text-[#00d4ff] font-semibold" : "text-slate-600"}`}>
                    {p.business_name || "Untitled"} <span className="text-xs text-slate-400">· {p.industry}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
            <Radio className="w-3 h-3 animate-pulse" /> LIVE
          </div>
          <a href={base44.agents.getWhatsAppConnectURL(AGENT_NAME)} target="_blank" title="Connect your phone via WhatsApp"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366]/20 px-3 py-1.5 text-xs font-semibold text-[#25D366] hover:bg-[#25D366]/30 transition">
            <MessageCircle className="w-3.5 h-3.5" /> Connect Phone
          </a>
          <button onClick={handleProvisionVercel} disabled={!activeProject || provisioning}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#00d4ff] to-[#0066ff] px-3 py-1.5 text-xs font-bold text-white hover:brightness-110 disabled:opacity-40 transition">
            {provisioning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Rocket className="w-3.5 h-3.5" />}
            Provision to Vercel
          </button>
          <div className="text-xs text-white/40 font-semibold tracking-wide">VISUAL BUILDER</div>
        </div>
      </div>

      {/* Toolbar */}
      <BuilderToolbar project={activeProject} onGenerate={handleNewProject} onDeploy={handleDeploy} onNewProject={handleNewProject} deploying={deploying} />

      {/* Split layout */}
      <div className="flex-1 flex min-h-0">
        {/* Chat — left 40% */}
        <div className="w-2/5 min-w-[320px] max-w-[480px] shrink-0">
          <BuilderChat conversation={conversation} messages={messages} loading={chatLoading} onSend={sendMessage} onMessages={setMessages} />
        </div>
        {/* Preview — right 60% */}
        <div className="flex-1 min-w-0">
          <BuilderPreview project={activeProject} previewMode={previewMode} onModeChange={setPreviewMode} loading={chatLoading} />
        </div>
      </div>
    </div>
  );
}