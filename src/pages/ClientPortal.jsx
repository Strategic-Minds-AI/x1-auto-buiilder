import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  Loader2, Globe, Rocket, Users, BarChart3, Calendar, Mail,
  CheckCircle, ArrowRight, Building2, Sparkles, ExternalLink
} from "lucide-react";

export default function ClientPortal() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [projects, setProjects] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { items } = await base44.entities.Client.filter(
          { status: "active" },
          { sort: "name", limit: 50 }
        );
        setClients(items || []);
        if (items?.length > 0) setSelectedClient(items[0]);
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  useEffect(() => {
    if (!selectedClient) return;
    (async () => {
      setDataLoading(true);
      try {
        const [projPage, campPage] = await Promise.all([
          base44.entities.WebsiteProject.filter(
            { client_id: selectedClient.id },
            { sort: "-created_date", limit: 50, fields: ["business_name", "industry", "status", "deploy_url", "location"] }
          ),
          base44.entities.SocialCampaign.filter(
            { project_id: { $exists: true } },
            { sort: "-created_date", limit: 10, fields: ["name", "status", "platforms", "total_posts"] }
          ),
        ]);
        setProjects(projPage.items || []);
        setCampaigns(campPage.items || []);
        // Contacts aren't client-scoped yet — load recent ones
        try {
          const contactPage = await base44.entities.CrmContact.filter({}, { sort: "-created_date", limit: 10, fields: ["name", "email", "status", "source"] });
          setContacts(contactPage.items || []);
        } catch { setContacts([]); }
      } catch {} finally { setDataLoading(false); }
    })();
  }, [selectedClient]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#00d4ff]" />
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="portal-light min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-700 mb-2">No clients yet</h2>
          <p className="text-sm text-slate-400 mb-4">Create a client first to set up their portal.</p>
          <Link to="/portal" className="inline-flex items-center gap-2 rounded-full bg-[#00d4ff] px-5 py-2.5 text-sm font-bold text-[#0a0e14]">
            Go to Admin Portal <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="portal-light min-h-screen bg-white">
      {/* Client header bar */}
      <div className="border-b border-slate-200 bg-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/portal" className="text-sm text-slate-400 hover:text-[#00d4ff] transition">← Admin</Link>
            <div className="h-4 w-px bg-slate-200" />
            <select
              value={selectedClient?.id || ""}
              onChange={(e) => setSelectedClient(clients.find(c => c.id === e.target.value))}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/30"
            >
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {selectedClient?.status === "active" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                <CheckCircle className="w-3 h-3" /> Active
              </span>
            )}
          </div>
          <button
            onClick={() => navigate("/auto-builder")}
            className="inline-flex items-center gap-2 rounded-full bg-[#00d4ff] px-5 py-2 text-sm font-bold text-[#0a0e14] hover:brightness-110 transition"
          >
            <Rocket className="w-4 h-4" /> New Website
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Client overview */}
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900">{selectedClient?.name}</h1>
              {selectedClient?.parent_organization && (
                <p className="text-sm text-slate-500 mt-0.5">Under {selectedClient.parent_organization}</p>
              )}
              <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                {selectedClient?.industry && <span>Industry: {selectedClient.industry}</span>}
                {selectedClient?.supabase_project_ref && <span>Sandbox: Active</span>}
                {selectedClient?.vercel_team_id && <span>Vercel: Connected</span>}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <StatBox icon={Globe} label="Websites" value={projects.length} />
              <StatBox icon={Users} label="Leads" value={contacts.length} />
              <StatBox icon={Calendar} label="Campaigns" value={campaigns.length} />
            </div>
          </div>
        </div>

        {dataLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-[#00d4ff]" /></div>
        ) : (
          <>
            {/* Website projects */}
            <Section title="Website Projects" icon={Globe} action={
              <button onClick={() => navigate("/auto-builder")} className="text-xs font-semibold text-[#00d4ff] hover:underline">
                Generate new →
              </button>
            }>
              {projects.length === 0 ? (
                <EmptyState icon={Globe} text="No websites yet. Generate one to get started." />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects.map(p => (
                    <div key={p.id} className="rounded-xl border border-slate-200 bg-white p-4 hover:border-[#00d4ff]/40 transition">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-slate-800 truncate">{p.business_name || p.industry}</span>
                        <StatusBadge status={p.status} />
                      </div>
                      <div className="text-xs text-slate-400 mb-3">{p.industry} {p.location && `· ${p.location}`}</div>
                      {p.deploy_url ? (
                        <a href={p.deploy_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-[#00d4ff] hover:underline">
                          View live site <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-300">Not deployed yet</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* Recent leads */}
            <Section title="Recent Leads" icon={Users} action={
              <Link to="/crm" className="text-xs font-semibold text-[#00d4ff] hover:underline">Open CRM →</Link>
            }>
              {contacts.length === 0 ? (
                <EmptyState icon={Users} text="No leads captured yet." />
              ) : (
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr className="text-left text-slate-500">
                        <th className="px-4 py-2.5 font-semibold">Name</th>
                        <th className="px-4 py-2.5 font-semibold">Email</th>
                        <th className="px-4 py-2.5 font-semibold">Source</th>
                        <th className="px-4 py-2.5 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contacts.slice(0, 8).map(c => (
                        <tr key={c.id} className="border-t border-slate-100">
                          <td className="px-4 py-2.5 font-medium text-slate-800">{c.name}</td>
                          <td className="px-4 py-2.5 text-slate-600">{c.email}</td>
                          <td className="px-4 py-2.5 text-slate-600">{c.source || "—"}</td>
                          <td className="px-4 py-2.5">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              c.status === "new" ? "bg-blue-100 text-blue-700" :
                              c.status === "contacted" ? "bg-amber-100 text-amber-700" :
                              c.status === "qualified" ? "bg-emerald-100 text-emerald-700" :
                              "bg-slate-100 text-slate-600"
                            }`}>{c.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Section>

            {/* Social campaigns */}
            <Section title="Social Media Campaigns" icon={Sparkles} action={
              <Link to="/portal" className="text-xs font-semibold text-[#00d4ff] hover:underline">Manage →</Link>
            }>
              {campaigns.length === 0 ? (
                <EmptyState icon={Sparkles} text="No social campaigns yet." />
              ) : (
                <div className="space-y-2">
                  {campaigns.map(c => (
                    <div key={c.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
                      <div>
                        <div className="text-sm font-semibold text-slate-800">{c.name}</div>
                        <div className="text-xs text-slate-400">{(c.platforms || []).join(", ")} · {c.total_posts || 0} posts</div>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        c.status === "active" ? "bg-emerald-100 text-emerald-700" :
                        c.status === "draft" ? "bg-slate-100 text-slate-600" :
                        "bg-blue-100 text-blue-700"
                      }`}>{c.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* Quick actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <QuickAction icon={BarChart3} label="Analytics" to="/performance-dashboard" />
              <QuickAction icon={Mail} label="Email" to="/crm" />
              <QuickAction icon={Calendar} label="Calendar" to="/portal" />
              <QuickAction icon={Rocket} label="Launch" to="/mass-launch-console" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatBox({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center">
      <Icon className="w-4 h-4 text-[#00d4ff] mx-auto mb-1" />
      <div className="text-xl font-bold text-slate-900">{value}</div>
      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</div>
    </div>
  );
}

function Section({ title, icon: Icon, action, children }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-bold text-slate-700">{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    draft: "bg-slate-100 text-slate-600",
    researching: "bg-blue-50 text-blue-600",
    generated: "bg-[#00d4ff]/10 text-[#00d4ff]",
    preview_ready: "bg-amber-50 text-amber-600",
    approved: "bg-emerald-50 text-emerald-600",
  };
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${colors[status] || colors.draft}`}>{status}</span>;
}

function EmptyState({ icon: Icon, text }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
      <Icon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
      <p className="text-sm text-slate-400">{text}</p>
    </div>
  );
}

function QuickAction({ icon: Icon, label, to }) {
  return (
    <Link to={to} className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col items-center gap-2 hover:border-[#00d4ff]/40 hover:bg-[#00d4ff]/5 transition">
      <Icon className="w-5 h-5 text-slate-400" />
      <span className="text-xs font-semibold text-slate-600">{label}</span>
    </Link>
  );
}