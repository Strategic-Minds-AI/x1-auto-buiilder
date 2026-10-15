import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import DashboardChat from "./DashboardChat";
import DashboardNav from "./DashboardNav";
import DataExplorer from "./DataExplorer";
import { Database, Users, Shield, Table, Loader2, ArrowRight } from "lucide-react";

const ENTITY_LIST = [
  "AgentInstruction", "AgentProfile", "AgentTask", "AISkill", "AITool", "AIToolTemplate",
  "AppApiKey", "ApprovalRequest", "ApprovedBrandManifest", "B2BTemplate", "BuildProject",
  "ChannelConnection", "ChatUITemplate", "Client", "CommChannel", "ComplianceReport",
  "CrmContact", "DesignTemplate", "DigitalCardFlyer", "FaultLineScan", "FontSystem",
  "FunnelTemplate", "GenerationJob", "GoogleStandard", "GPTMission", "IntelligenceTask",
  "LaunchCampaign", "Lead", "MeasurementBinding", "MediaAsset", "MockupProject",
  "PlatformTemplate", "PricingIntelligence", "PromptPack", "SaaSTemplate", "Sandbox",
  "SiteTemplate", "SocialCampaign", "SocialCreativeKit", "SocialPost", "StyleGuide",
  "SyncReceipt", "SystemTestReport", "Template", "ValidationReceipt", "VideoAsset",
  "WebsiteProject", "WorkflowTemplate",
];

export default function DashboardMode({ conversation, messages, chatLoading, onSend }) {
  const [activeSection, setActiveSection] = useState("data");
  const [activeEntity, setActiveEntity] = useState(null);

  const handleEntitySelect = (entity) => {
    setActiveEntity(entity);
    setActiveSection("data");
  };

  return (
    <div className="flex-1 flex min-h-0 bg-white">
      <div className="w-80 shrink-0 border-r border-slate-200 bg-white">
        <DashboardChat conversation={conversation} messages={messages} loading={chatLoading} onSend={onSend} />
      </div>
      <div className="w-60 shrink-0 border-r border-slate-200 bg-[#f4f4f4]">
        <DashboardNav
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          activeEntity={activeEntity}
          onEntitySelect={handleEntitySelect}
          entities={ENTITY_LIST}
        />
      </div>
      <div className="flex-1 min-w-0 overflow-y-auto bg-white">
        {activeSection === "overview" && <OverviewContent onNavigate={setActiveSection} entityCount={ENTITY_LIST.length} />}
        {activeSection === "users" && <UsersContent />}
        {activeSection === "data" && (
          <DataExplorer entities={ENTITY_LIST} activeEntity={activeEntity} onEntitySelect={setActiveEntity} />
        )}
      </div>
    </div>
  );
}

function OverviewContent({ onNavigate, entityCount }) {
  const [stats, setStats] = useState({ projects: 0, clients: 0, tests: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [projects, clients, testPage] = await Promise.all([
          base44.entities.WebsiteProject.count({}).catch(() => 0),
          base44.entities.Client.count({}).catch(() => 0),
          base44.entities.SystemTestReport.filter({}, { sort: "-created_date", limit: 1, fields: ["score", "status", "total_tests", "passed_tests", "failed_tests"] }).catch(() => ({ items: [] })),
        ]);
        setStats({ projects, clients, tests: testPage.items?.[0] || null });
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Overview</h1>
      <p className="text-sm text-slate-500 mb-6">System-wide dashboard and quick actions</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Database} label="Data Tables" value={entityCount} color="text-blue-500" />
        <StatCard icon={Table} label="Projects" value={stats.projects} color="text-cyan-500" />
        <StatCard icon={Users} label="Clients" value={stats.clients} color="text-purple-500" />
        <StatCard icon={Shield} label="Test Score" value={stats.tests?.score != null ? `${stats.tests.score}%` : "—"} color={stats.tests?.score === 100 ? "text-emerald-500" : "text-amber-500"} />
      </div>
      <div className="space-y-2">
        <button onClick={() => onNavigate("data")} className="w-full flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:border-[#00d4ff]/40 hover:text-[#00d4ff] transition">
          <span className="flex items-center gap-3"><Database className="w-4 h-4" /> Browse Data Tables</span>
          <ArrowRight className="w-4 h-4" />
        </button>
        <button onClick={() => onNavigate("users")} className="w-full flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:border-[#00d4ff]/40 hover:text-[#00d4ff] transition">
          <span className="flex items-center gap-3"><Users className="w-4 h-4" /> Manage App Users</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function UsersContent() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const result = await base44.entities.User.list({ limit: 50 });
        setUsers(result.items || result || []);
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">App Users</h1>
      <p className="text-sm text-slate-500 mb-6">Users who have access to this app</p>
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
      ) : users.length === 0 ? (
        <p className="text-sm text-slate-400">No users found.</p>
      ) : (
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-2 font-semibold text-slate-600">Name</th>
                <th className="text-left px-4 py-2 font-semibold text-slate-600">Email</th>
                <th className="text-left px-4 py-2 font-semibold text-slate-600">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-slate-100">
                  <td className="px-4 py-2.5 text-slate-700">{u.full_name || "—"}</td>
                  <td className="px-4 py-2.5 text-slate-600">{u.email || "—"}</td>
                  <td className="px-4 py-2.5"><span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{u.role || "user"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-2"><Icon className={`w-3.5 h-3.5 ${color}`} /> {label}</div>
      <div className="text-2xl font-bold text-slate-800">{value}</div>
    </div>
  );
}