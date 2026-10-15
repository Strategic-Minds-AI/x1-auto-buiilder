import {
  Shield, CheckCircle, AlertCircle, Clock, Lock, FileCheck,
  ShieldCheck, Loader2,
} from "lucide-react";

const SECURITY_GATES = [
  { gate: "GPT Sync Scoping", status: "investigate", desc: "Narrowly scope service-role entity operations. Server-side allowlists, tenant isolation, rate limits, idempotency, audit receipts." },
  { gate: "Production Deployment Isolation", status: "investigate", desc: "Separate staging previews from approved production releases. Require exact deployment identity, validated evidence, rollback." },
  { gate: "Base44 App Identity", status: "verified", desc: "Application matched to verified app ID. Never write into an app chosen solely by title similarity." },
  { gate: "Secrets Management", status: "verified", desc: "Tokens never in prompts, repo files, frontend code, logs, or chat. Provider-native secret storage only." },
  { gate: "Tenant Isolation", status: "investigate", desc: "RLS boundaries verified per entity. Multi-tenant data routing with client_id resolution." },
  { gate: "Approval Gates", status: "active", desc: "Production publishing, domain ops, credential ops, paid actions, customer comms require scoped approval enforcement." },
];

const QA_GATES = [
  "Typecheck", "Lint", "Build", "Unit/Integration Tests",
  "Playwright Desktop/Tablet/Mobile", "Broken-link & Image Checks",
  "Form Validation", "Auth/Role Negative Tests", "Tenant/RLS Isolation",
  "Queue/Lease/Retry/Idempotency", "API Permission Tests",
  "SEO/noindex Tests", "Accessibility-critical", "Performance Checks",
  "Analytics Event Tests", "Communications Consent Tests",
  "Social Approval & Publishing Simulations", "Deployment & Rollback Validation",
];

export default function GovernancePanel({ data }) {
  const approvals = data?.pendingApprovals || [];
  const receipts = data?.recentReceipts || [];

  return (
    <div>
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-1">
          <Shield className="w-5 h-5 text-[#10b981]" />
          <h2 className="text-xl font-bold">Governance</h2>
        </div>
        <p className="text-sm text-white/40">Permissions, security gates, production controls, rollback, and independent QA</p>
      </div>

      {/* Security Gates */}
      <div className="mb-6">
        <p className="text-xs font-bold text-white/30 uppercase tracking-wide mb-2">Security & Authorization Gates</p>
        <div className="space-y-2">
          {SECURITY_GATES.map((g, i) => (
            <div key={i} className="rounded-xl bg-white/5 border border-white/10 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {g.status === "verified" ? <CheckCircle className="w-4 h-4 text-emerald-400" /> :
                     g.status === "investigate" ? <AlertCircle className="w-4 h-4 text-amber-400" /> :
                     <Clock className="w-4 h-4 text-blue-400" />}
                    <p className="text-sm font-bold text-white">{g.gate}</p>
                  </div>
                  <p className="text-xs text-white/40">{g.desc}</p>
                </div>
                <span className={`text-[9px] font-bold px-2 py-1 rounded shrink-0 ${
                  g.status === "verified" ? "bg-emerald-500/10 text-emerald-400" :
                  g.status === "investigate" ? "bg-amber-500/10 text-amber-400" :
                  "bg-blue-500/10 text-blue-400"
                }`}>{g.status.toUpperCase()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Approvals */}
      <div className="mb-6">
        <p className="text-xs font-bold text-white/30 uppercase tracking-wide mb-2">Pending Approvals ({approvals.length})</p>
        {approvals.length === 0 ? (
          <div className="rounded-xl bg-white/5 border border-white/10 p-6 text-center">
            <CheckCircle className="w-8 h-8 text-emerald-400/50 mx-auto mb-2" />
            <p className="text-xs text-white/40">No pending approvals. All clear.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {approvals.map((a) => (
              <div key={a.id} className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-3 flex items-center gap-3">
                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white/70">{a.description || a.id}</p>
                </div>
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 px-2 py-1 rounded">PENDING</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QA Gates */}
      <div className="mb-6">
        <p className="text-xs font-bold text-white/30 uppercase tracking-wide mb-2">Quality & Security Test Gates</p>
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <div className="flex flex-wrap gap-2">
            {QA_GATES.map((q, i) => (
              <span key={i} className="flex items-center gap-1.5 text-xs text-white/50 bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-lg">
                <FileCheck className="w-3 h-3 text-white/30" /> {q}
              </span>
            ))}
          </div>
          <p className="text-[10px] text-white/30 mt-3">No QA evidence means UNKNOWN, not PASS. Distinct Guardian/Fault Line review required for release-critical claims.</p>
        </div>
      </div>

      {/* Recent Receipts */}
      <div>
        <p className="text-xs font-bold text-white/30 uppercase tracking-wide mb-2">Recent Validation Receipts</p>
        {receipts.length === 0 ? (
          <div className="rounded-xl bg-white/5 border border-white/10 p-6 text-center">
            <ShieldCheck className="w-8 h-8 text-white/20 mx-auto mb-2" />
            <p className="text-xs text-white/40">No validation receipts yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {receipts.map((r) => (
              <div key={r.id} className="rounded-xl bg-white/5 border border-white/10 p-3 flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white/70">{r.test_suite || r.id.substring(0, 8)}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                  r.status === "passed" ? "bg-emerald-500/10 text-emerald-400" :
                  r.status === "failed" ? "bg-red-500/10 text-red-400" :
                  "bg-white/10 text-white/40"
                }`}>{r.status?.toUpperCase()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}