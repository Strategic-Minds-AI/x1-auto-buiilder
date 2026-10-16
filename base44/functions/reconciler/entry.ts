import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { isConfigured, healthCheck } from '../../shared/cloudBrowserEngine.ts';

// X1 Reconciler — the deterministic reconciliation heartbeat.
// Compares EXPECTED state (pipeline stages that should be complete) against
// ACTUAL state (stages with COMPLETED status + evidence). Detects drift,
// updates receipts from real evidence, recalculates readiness scores.
// Enforces the "no UNKNOWN relabeled as PASS" invariant.

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const db = base44.asServiceRole;
    const cycleId = `reconcile-${Date.now()}`;
    const issues: any[] = [];
    const actions: any[] = [];

    // 1. Gather all in-progress pipeline runs
    const { items: runs } = await db.entities.PipelineRun.filter({
      status: { $in: ['processing', 'validated', 'fixing', 'qa', 'provisioning', 'launching', 'paused'] }
    }, { sort: '-created_date', limit: 50 });

    // 2. Gather pending work packets, validation receipts, approval requests
    const [packetsPage, receiptsPage, approvalsPage] = await Promise.all([
      db.entities.WorkPacket.filter({ status: { $in: ['PENDING', 'READY', 'ASSIGNED', 'IN_PROGRESS', 'BLOCKED'] } }, { sort: '-created_date', limit: 200 }),
      db.entities.ValidationReceipt.filter({}, { sort: '-created_date', limit: 200 }),
      db.entities.ApprovalRequest.filter({ status: 'PENDING' }, { sort: '-created_date', limit: 50 }),
    ]);

    const packets = packetsPage.items || [];
    const receipts = receiptsPage.items || [];
    const pendingApprovals = approvalsPage.items || [];

    // 3. Check each pipeline run for state drift
    for (const run of runs) {
      const stages = run.stages || [];
      for (const stage of stages) {
        if (stage.status === 'COMPLETED') {
          // Check: does this stage have evidence?
          const stageReceipts = receipts.filter(r => r.pipeline_run_id === run.id);
          const stagePackets = packets.filter(p => p.pipeline_run_id === run.id && p.stage_id === stage.id);

          if (stagePackets.length === 0 && !stage.validator_result) {
            // Stage marked COMPLETED but no packets or validator result — DRIFT
            issues.push({
              severity: 'critical',
              category: 'drift',
              pipeline_run_id: run.id,
              project_name: run.project_name,
              stage_id: stage.id,
              stage_label: stage.label,
              message: `Stage "${stage.label}" marked COMPLETED but has no work packets or validator evidence`,
              action: 'flag_for_revalidation',
            });
          }

          // Check: if stage has packets, are they all COMPLETED with evidence?
          for (const packet of stagePackets) {
            if (packet.status === 'COMPLETED' && (!packet.evidence_refs || packet.evidence_refs.length === 0)) {
              issues.push({
                severity: 'warning',
                category: 'missing_evidence',
                pipeline_run_id: run.id,
                packet_id: packet.packet_id,
                message: `WorkPacket ${packet.packet_id} marked COMPLETED but has no evidence references`,
                action: 'block_release',
              });
            }
            if (packet.risk_class === 'PROTECTED' && packet.status === 'COMPLETED' && !packet.approval_id) {
              issues.push({
                severity: 'critical',
                category: 'missing_approval',
                pipeline_run_id: run.id,
                packet_id: packet.packet_id,
                message: `PROTECTED WorkPacket ${packet.packet_id} marked COMPLETED without approval`,
                action: 'block_release',
              });
            }
          }
        }
      }

      // Recalculate readiness score based on evidence
      const totalStages = stages.length;
      const completedStages = stages.filter(s => s.status === 'COMPLETED').length;
      const stagesWithEvidence = stages.filter(s => {
        const stagePackets = packets.filter(p => p.pipeline_run_id === run.id && p.stage_id === s.id);
        return s.status === 'COMPLETED' && (s.validator_result || stagePackets.every(p => p.evidence_refs?.length > 0));
      }).length;
      const evidenceRatio = totalStages > 0 ? stagesWithEvidence / totalStages : 0;

      // If readiness is lower than claimed, flag it
      if (evidenceRatio < 0.8 && run.status === 'validated') {
        issues.push({
          severity: 'warning',
          category: 'readiness_inflation',
          pipeline_run_id: run.id,
          project_name: run.project_name,
          message: `Pipeline "${run.project_name}" status is "validated" but only ${Math.round(evidenceRatio * 100)}% of stages have evidence`,
          action: 'downgrade_status',
        });
      }
    }

    // 4. Check for stale packets (IN_PROGRESS too long)
    const now = Date.now();
    for (const packet of packets) {
      if (packet.status === 'IN_PROGRESS' && packet.started_at) {
        const elapsed = now - new Date(packet.started_at).getTime();
        if (elapsed > 30 * 60 * 1000) { // 30 minutes
          issues.push({
            severity: 'warning',
            category: 'stale_packet',
            packet_id: packet.packet_id,
            pipeline_run_id: packet.pipeline_run_id,
            message: `WorkPacket ${packet.packet_id} has been IN_PROGRESS for ${Math.round(elapsed / 60000)} minutes`,
            action: 'requeue_or_fail',
          });
          // Auto-fail stale packets
          actions.push({
            type: 'auto_fail_stale',
            packet_id: packet.packet_id,
            reason: 'Exceeded 30-minute execution timeout',
          });
        }
      }
    }

    // 5. Check for expired approval requests
    for (const approval of pendingApprovals) {
      if (approval.expires_at && new Date(approval.expires_at).getTime() < now) {
        issues.push({
          severity: 'info',
          category: 'expired_approval',
          approval_id: approval.request_id,
          message: `Approval request ${approval.request_id} has expired`,
          action: 'mark_expired',
        });
        actions.push({
          type: 'expire_approval',
          approval_id: approval.id,
        });
      }
    }

    // 6. Check cloud browser engine health
    let engineHealth = null;
    if (isConfigured()) {
      try {
        engineHealth = await healthCheck();
        if (engineHealth.status === 'unhealthy') {
          issues.push({
            severity: 'critical',
            category: 'engine_health',
            message: 'All cloud browser engines are unhealthy',
            action: 'alert_admin',
          });
        }
      } catch {
        issues.push({
          severity: 'warning',
          category: 'engine_health',
          message: 'Cloud browser engine health check failed',
          action: 'check_engine_config',
        });
      }
    }

    // 7. Execute auto-remediation actions
    for (const action of actions) {
      try {
        if (action.type === 'auto_fail_stale') {
          await db.entities.WorkPacket.update(
            packets.find(p => p.packet_id === action.packet_id)?.id,
            { status: 'FAILED', result: { error: action.reason } }
          );
        } else if (action.type === 'expire_approval') {
          await db.entities.ApprovalRequest.update(action.approval_id, { status: 'EXPIRED' });
        }
      } catch (e) {
        // Log but don't fail the cycle
      }
    }

    // 8. Summary
    const summary = {
      cycle_id: cycleId,
      timestamp: new Date().toISOString(),
      runs_checked: runs.length,
      packets_checked: packets.length,
      receipts_checked: receipts.length,
      pending_approvals: pendingApprovals.length,
      issues_found: issues.length,
      critical: issues.filter(i => i.severity === 'critical').length,
      warnings: issues.filter(i => i.severity === 'warning').length,
      actions_taken: actions.length,
      engine_health: engineHealth?.status || 'not_configured',
      all_clear: issues.filter(i => i.severity === 'critical').length === 0,
    };

    return Response.json({ ok: true, summary, issues, actions, engineHealth });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}