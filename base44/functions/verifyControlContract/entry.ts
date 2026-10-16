import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import {
  SYNC_CHECKPOINTS,
  evaluateSyncHealth,
  validateAgainstMasterDirectory,
  MASTER_DIRECTORY,
  PROTECTED_ACTIONS,
  isProtectedAction,
  CANARY_SEQUENCE,
} from "../../shared/bidirectionalControlContract.js";
import { INDUSTRY_FAMILIES } from "../../shared/industryRegistry.js";
import { PLATFORM_PACKS } from "../../shared/platformRegistry.js";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const { action } = body;

    if (action === 'sync_health') {
      // Verify GPT sync engine health by checking recent sync receipts
      const { items: recentReceipts } = await base44.entities.SyncReceipt.filter(
        {},
        { sort: '-created_date', limit: 20 }
      );

      const lastReceipt = recentReceipts[0];
      const checkpointResults = {
        'engine-configured': true,
        'auth-valid': true,
        'push-success': lastReceipt?.status === 'success' || lastReceipt?.action_type === 'PUSH',
        'pull-success': recentReceipts.some(r => r.action_type === 'PULL' && r.status === 'success'),
        'command-executed': recentReceipts.some(r => r.action_type === 'COMMAND' && r.status === 'success'),
        'ack-success': recentReceipts.some(r => r.action_type === 'ACK' && r.status === 'success'),
      };

      const health = evaluateSyncHealth(checkpointResults);

      return Response.json({
        ...health,
        last_receipt: lastReceipt,
        recent_count: recentReceipts.length,
        contract_version: '1.0.0',
      });
    }

    if (action === 'validate_request') {
      const validation = validateAgainstMasterDirectory(body.request || {}, {
        industryRegistry: INDUSTRY_FAMILIES,
        platformRegistry: PLATFORM_PACKS,
      });

      return Response.json({
        valid: validation.valid,
        violations: validation.violations,
        has_blocks: validation.has_blocks,
        has_warnings: validation.has_warnings,
      });
    }

    if (action === 'get_contract') {
      return Response.json({
        version: '1.0.0',
        source_truth: {
          github: 'authoritative-source-code',
          base44: 'synchronized-builder-runtime',
          x1: 'durable-orchestration',
          google_drive: 'human-readable-evidence',
          supabase: 'durable-runtime-state',
        },
        sync_checkpoints: SYNC_CHECKPOINTS,
        master_directory: MASTER_DIRECTORY,
        protected_actions: PROTECTED_ACTIONS,
        canary_sequence: CANARY_SEQUENCE,
      });
    }

    if (action === 'check_protected') {
      const { action_class } = body;
      return Response.json({
        action_class,
        is_protected: isProtectedAction(action_class),
        requires_approval: isProtectedAction(action_class),
      });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}