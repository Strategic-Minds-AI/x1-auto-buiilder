import { useState } from "react";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";
import BackButton from "@/components/shared/BackButton";
import IdeaButtons from "@/components/universal/IdeaButtons";
import AssistPanel from "@/components/universal/AssistPanel";
import {
  Sparkles, Loader2, Download, Wand2, ChevronDown, CheckCircle,
  AlertCircle, Zap, Globe, ShoppingCart, Filter, Smartphone, Palette,
  Share2, Video, Mail, Users, MessageCircle, Calendar, BarChart3,
  Shield, Target, DollarSign, UserPlus, Gift, FileText, LayoutTemplate,
  Code, Plug, Database, GitBranch, CreditCard, Image,
} from "lucide-react";

const GENERATION_TYPES = [
  { value: "website", label: "Website Blueprint", icon: Globe },
  { value: "landing", label: "Landing Page", icon: LayoutTemplate },
  { value: "ecommerce", label: "E-commerce Store", icon: ShoppingCart },
  { value: "app", label: "App UI Design", icon: Smartphone },
  { value: "funnel", label: "Lead Gen Funnel", icon: Filter },
  { value: "content", label: "SEO Content", icon: FileText },
  { value: "brand", label: "Brand Identity", icon: Palette },
  { value: "social", label: "Social Media Kit", icon: Share2 },
  { value: "video", label: "Video Script", icon: Video },
  { value: "email", label: "Email Sequence", icon: Mail },
  { value: "crm", label: "CRM Workflow", icon: Users },
  { value: "chatbot", label: "Chatbot Script", icon: MessageCircle },
  { value: "booking", label: "Booking System", icon: Calendar },
  { value: "dashboard", label: "Analytics Dashboard", icon: BarChart3 },
  { value: "compliance", label: "Compliance Checklist", icon: Shield },
  { value: "competitor", label: "Competitor Analysis", icon: Target },
  { value: "pricing", label: "Pricing Strategy", icon: DollarSign },
  { value: "onboarding", label: "Customer Onboarding", icon: UserPlus },
  { value: "referral", label: "Referral Program", icon: Gift },
  { value: "code", label: "Custom Code", icon: Code },
  { value: "api", label: "API Integration", icon: Plug },
  { value: "database", label: "Database Schema", icon: Database },
  { value: "workflow", label: "Workflow Automation", icon: GitBranch },
  { value: "card", label: "Business Card", icon: CreditCard },
  { value: "flyer", label: "Flyer Design", icon: Image },
];

export default function UniversalGenerator() {
  const [genType, setGenType] = useState("website");
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installResult, setInstallResult] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const selectedType = GENERATION_TYPES.find(t => t.value === genType);
  const SelectedIcon = selectedType?.icon || Wand2;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResult(null);
    setInstallResult(null);
    try {
      const res = await base44.functions.invoke("universalGenerator", {
        action: "generate",
        generation_type: genType,
        prompt,
      });
      setResult(res.data?.result || null);
    } catch (err) {
      setResult({ error: err.message || "Generation failed" });
    } finally {
      setLoading(false);
    }
  };

  const handleInstall = async () => {
    if (!result) return;
    setInstalling(true);
    setInstallResult(null);
    try {
      const res = await base44.functions.invoke("universalGenerator", {
        action: "install",
        generation_type: genType,
        generated_content: result,
      });
      setInstallResult(res.data);
    } catch (err) {
      setInstallResult({ error: err.message || "Install failed" });
    } finally {
      setInstalling(false);
    }
  };

  const handleIdeaSelect = (type, ideaPrompt) => {
    setGenType(type);
    setPrompt(ideaPrompt);
    setDropdownOpen(false);
  };

  return (
    <div className="portal-light min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <BackButton fallback="/portal" label="Back to Portal" />

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#0066ff] flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800">Universal Generator</h1>
              <p className="text-sm text-slate-500">Generate anything — websites, apps, funnels, brands, code, and more</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Generator (2/3) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Type selector */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 block">Generation Type</label>
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:border-[#00d4ff]/40 transition"
                >
                  <span className="flex items-center gap-2.5">
                    <SelectedIcon className="w-4 h-4 text-[#00d4ff]" />
                    {selectedType?.label || "Select type"}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>
                {dropdownOpen && (
                  <div className="absolute z-20 mt-1 w-full max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                    {GENERATION_TYPES.map(t => {
                      const Icon = t.icon;
                      return (
                        <button
                          key={t.value}
                          onClick={() => { setGenType(t.value); setDropdownOpen(false); }}
                          className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-[#00d4ff]/5 transition ${
                            genType === t.value ? "bg-[#00d4ff]/10 text-[#00d4ff] font-bold" : "text-slate-600"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Prompt */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 block">Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want to generate..."
                rows={4}
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

            {/* Idea buttons */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3 block">Quick Ideas — Click to Generate</label>
              <IdeaButtons onSelect={handleIdeaSelect} />
            </div>

            {/* Results */}
            {result && (
              <div className="bg-white rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Result</label>
                  <button
                    onClick={handleInstall}
                    disabled={installing}
                    className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-white disabled:opacity-40 hover:bg-emerald-600 transition"
                  >
                    {installing ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Installing...</> : <><Download className="w-3.5 h-3.5" /> Install / Integrate</>}
                  </button>
                </div>
                {result.error ? (
                  <div className="flex items-center gap-2 text-sm text-red-500">
                    <AlertCircle className="w-4 h-4" /> {result.error}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {result.title && <h3 className="text-lg font-bold text-slate-800">{result.title}</h3>}
                    {result.summary && <p className="text-sm text-slate-500">{result.summary}</p>}
                    {result.content && (
                      <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 max-h-[400px] overflow-y-auto">
                        <ReactMarkdown className="text-sm text-slate-700 prose prose-sm max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0.5 prose-headings:my-2 prose-code:text-[#00d4ff] prose-code:bg-slate-100 prose-code:px-1 prose-code:rounded">
                          {result.content}
                        </ReactMarkdown>
                      </div>
                    )}
                    {result.sections?.length > 0 && (
                      <div className="space-y-2">
                        {result.sections.map((s, i) => (
                          <div key={i} className="rounded-lg border border-slate-100 p-3">
                            <h4 className="text-sm font-bold text-slate-700 mb-1">{s.heading}</h4>
                            <p className="text-xs text-slate-500">{s.body}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {result.install_instructions && (
                      <div className="rounded-lg bg-blue-50 border border-blue-100 p-3">
                        <p className="text-xs text-blue-600 font-semibold mb-1">Install Instructions</p>
                        <p className="text-xs text-blue-700">{result.install_instructions}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Install result */}
                {installResult && (
                  <div className={`mt-3 rounded-lg p-3 flex items-center gap-2 ${
                    installResult.error ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"
                  }`}>
                    {installResult.error ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    <span className="text-xs font-semibold">
                      {installResult.error || `Installed successfully as ${installResult.generation_type} — ID: ${installResult.installed?.id?.substring(0, 8)}...`}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: AI Assist (1/3) */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 h-[calc(100vh-8rem)]">
              <AssistPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}