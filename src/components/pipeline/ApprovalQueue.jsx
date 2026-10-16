import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Shield, Loader2, CheckCircle2, XCircle, Clock,
  GitBranch, Database, KeyRound, Globe, CreditCard,
  Mail, Trash2, UserCog, Rocket,
} from "lucide-react";

const ACTION_ICONS = {
  PRODUCTION_RELEASE: Rocket,
  BRANCH_MERGE: GitBranch,
  DB_CHANGE: Database,
  SECRET_ROTATION: KeyRound,
  DNS_CHANGE: Globe,
  PAYMENT_SPEND: CreditCard,
  LIVE_COMMUNICATION: Mail,
  DESTRUCTIVE_ACTION: Trash2,
  PERMISSION_ESCALATION: UserCog,
};

export default function ApprovalQueue() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);

  const loadApprovals = async () => {
    try {
      const page = await base44.entities.ApprovalRequest.filter(
        { status: "PENDING" },
        { sort: "-created_date", limit: 50 }
      );
      setApprovals(page.items || []);
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { loadApprovals(); }, []);

  const resolveApproval = async (id, decision) => {
    setActing(id);
    try {
      await base44.entities.ApprovalRequest.update(id, {
        status: decision === "approve" ? "APPROVED" : "REJECTED",
        resolved_at: new Date().toISOString(),
      });
      loadApprovals();
    } catch { }
    finally { setActing(null); }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-[#00d4ff]" /></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-4 h-4 text-red-500" />
        <h3 className="text-sm font-bold text-slate-700">Approval Queue</h3>
        {approvals.length > 0 && (
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">
            <Clock className="w-3 h-3" /> {approvals.length} pending
          </span>
        )}
      </div>

      {approvals.length === 0 ? (
        <div className="text-center py-6">
          <CheckCircle2 className="w-8 h-8 text-emerald-300 mx-auto mb-2" />
          <p className="text-xs text-slate-400">No pending approvals. All protected actions are clear.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {approvals.map((approval) => {
            const ActionIcon = ACTION_ICONS[approval.action_class] || Shield;
            const isExpired = approval.expires_at && new Date(approval.expires_at).getTime() < Date.now();
            return (
              <div key={approval.id} className={`rounded-lg border p-3 ${isExpired ? "border-amber-200 bg-amber-50/50" : "border-red-200 bg-red-50/50"}`}>
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                    <ActionIcon className="w-3.5 h-3.5 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="text-[10px] font-mono font-bold text-slate-500">{approval.request_id}</code>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-red-100 text-red-600">
                        {approval.action_class?.replace(/_/g, " ")}
                      </span>
                      {isExpired && <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-600">EXPIRED</span>}
                    </div>
                    <p className="text-xs font-semibold text-slate-700 mt-1">{approval.scope}</p>
                    {approval.description && <p className="text-[10px] text-slate-500 mt-0.5">{approval.description}</p>}
                    {approval.requested_by && <p className="text-[10px] text-slate-400 mt-1">Requested by: {approval.requested_by}</p>}
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => resolveApproval(approval.id, "approve")}
                    disabled={acting === approval.id || isExpired}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-600 disabled:opacity-50 transition"
                  >
                    {acting === approval.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                    Approve
                  </button>
                  <button
                    onClick={() => resolveApproval(approval.id, "reject")}
                    disabled={acting === approval.id}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-600 disabled:opacity-50 transition"
                  >
                    {acting === approval.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}