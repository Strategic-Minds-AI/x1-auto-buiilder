/**
 * BIDIRECTIONAL CONTROL CONTRACT
 *
 * Establishes GitHub as source truth for all generated code.
 * Base44 is a synchronized builder/runtime surface.
 * X1 owns durable orchestration.
 *
 * Every build action is validated against the master directory before execution.
 * No build proceeds without:
 *   1. Source SHA verification
 *   2. Master directory match
 *   3. Protected action approval (if applicable)
 *   4. Validation receipt
 */

export const CONTROL_CONTRACT_VERSION = "1.0.0";

// ─── SOURCE TRUTH HIERARCHY ─────────────────────────────────────────
export const SOURCE_TRUTH = {
  GITHUB: {
    role: "authoritative-source-code",
    description: "GitHub is the single source of truth for all source code. Every build must resolve the current HEAD SHA before proceeding.",
    bindings: ["repository", "branch", "head-sha", "write-permissions"],
  },
  BASE44: {
    role: "synchronized-builder-runtime",
    description: "Base44 is a synchronized builder and runtime surface. Changes here must reflect GitHub state.",
    bindings: ["app-id", "deployment-url", "sync-state"],
  },
  X1: {
    role: "durable-orchestration",
    description: "X1 owns the durable task queue, worker leases, and execution state.",
    bindings: ["queue", "worker-lease", "execution-state"],
  },
  GOOGLE_DRIVE: {
    role: "human-readable-evidence",
    description: "Google Drive stores human-readable client and project evidence.",
    bindings: ["folder-id", "file-ids"],
  },
  SUPABASE: {
    role: "durable-runtime-state",
    description: "Supabase/X1 owns durable task and runtime state.",
    bindings: ["project-ref", "tables"],
  },
};

// ─── SYNC VERIFICATION PROTOCOL ─────────────────────────────────────
// A sync cycle is NOT healthy merely because a scheduled workflow exists.
// Every cycle must verify all six checkpoints.

export const SYNC_CHECKPOINTS = [
  {
    id: "engine-configured",
    description: "GPT sync engine endpoint exists and is reachable",
    required: true,
    failure_status: "SYNC_FAILED",
  },
  {
    id: "auth-valid",
    description: "GPT_SYNC_API_KEY is present and accepted",
    required: true,
    failure_status: "SYNC_FAILED",
  },
  {
    id: "push-success",
    description: "POST /functions/gptSyncEngine returns HTTP 200",
    required: true,
    failure_status: "SYNC_DEGRADED",
  },
  {
    id: "pull-success",
    description: "Pull cycle retrieves pending commands without error",
    required: true,
    failure_status: "SYNC_DEGRADED",
  },
  {
    id: "command-executed",
    description: "Retrieved commands execute and produce receipts",
    required: true,
    failure_status: "SYNC_DEGRADED",
  },
  {
    id: "ack-success",
    description: "ACK cycle writes receipt with evidence references",
    required: true,
    failure_status: "SYNC_FAILED",
  },
];

export const SYNC_STATUSES = {
  SYNC_HEALTHY: "all checkpoints pass",
  SYNC_DEGRADED: "push or pull succeeded but command/ack failed",
  SYNC_FAILED: "engine unreachable or auth invalid",
};

// ─── MASTER DIRECTORY VALIDATION ────────────────────────────────────
// Every build action is validated against the master directory.
// The master directory is the canonical registry of approved:
//   - Industry families
//   - Platform packs
//   - Visual packs
//   - Template genomes
//   - Agent playbooks
//   - Validation requirements

export const MASTER_DIRECTORY = {
  registries: [
    "industryRegistry",
    "platformRegistry",
    "visualPackContract",
    "agentRoster",
    "validationRequirements",
  ],
  validation_rules: [
    {
      rule: "industry-must-exist",
      description: "The requested industry family must exist in the Industry Registry",
      check: "lookup industryRegistry by family_id",
      on_fail: "BLOCK — unknown industry",
    },
    {
      rule: "platform-must-exist",
      description: "The requested platform pack must exist in the Platform Registry",
      check: "lookup platformRegistry by platform_id",
      on_fail: "BLOCK — unknown platform",
    },
    {
      rule: "platform-must-match-industry",
      description: "The platform must be recommended for or compatible with the industry",
      check: "check recommended_industries includes family_id or 'all'",
      on_fail: "WARN — suboptimal match, proceed with operator confirmation",
    },
    {
      rule: "visualpack-must-be-specified",
      description: "A VisualPack must be specified or generated before build starts",
      check: "verify visualPack exists with valid tokens",
      on_fail: "BLOCK — no design system",
    },
    {
      rule: "template-genome-must-exist",
      description: "A TemplateGenome must be selected for the industry+platform combination",
      check: "lookup templateGenomes by industry + platform",
      on_fail: "BLOCK — no structural DNA",
    },
    {
      rule: "source-sha-must-be-current",
      description: "The GitHub HEAD SHA must be resolved and current",
      check: "fetch current HEAD SHA from GitHub",
      on_fail: "BLOCK — stale source",
    },
    {
      rule: "protected-actions-require-approval",
      description: "Production releases, branch merges, DB changes require explicit approval",
      check: "verify ApprovalRequest exists with status APPROVED",
      on_fail: "BLOCK — unapproved protected action",
    },
  ],
};

// ─── PROTECTED ACTIONS ─────────────────────────────────────────────
export const PROTECTED_ACTIONS = [
  "PRODUCTION_RELEASE",
  "BRANCH_MERGE",
  "DB_CHANGE",
  "SECRET_ROTATION",
  "DNS_CHANGE",
  "PAYMENT_SPEND",
  "LIVE_COMMUNICATION",
  "DESTRUCTIVE_ACTION",
  "PERMISSION_ESCALATION",
];

export function isProtectedAction(actionClass) {
  return PROTECTED_ACTIONS.includes(actionClass);
}

// ─── CANARY SEQUENCE ───────────────────────────────────────────────
// Digital Dominance expansion requires validated canaries:
// 1 validated canary → 10 → validation → 100 → validation → 1,000
export const CANARY_SEQUENCE = [
  { stage: "canary", count: 1, requires_validation: true },
  { stage: "batch-10", count: 10, requires_validation: true },
  { stage: "batch-100", count: 100, requires_validation: true },
  { stage: "batch-1000", count: 1000, requires_validation: true },
];

// ─── SYNC HEALTH CHECK FUNCTION ─────────────────────────────────────
export function evaluateSyncHealth(checkpointResults) {
  const results = SYNC_CHECKPOINTS.map((cp) => ({
    ...cp,
    passed: checkpointResults[cp.id] === true,
  }));

  const allPassed = results.every((r) => r.passed);
  const criticalFailed = results
    .filter((r) => !r.passed && r.failure_status === "SYNC_FAILED")
    .some((r) => r);

  if (criticalFailed) {
    return {
      status: "SYNC_FAILED",
      results,
      message: "Critical sync checkpoint failed — engine unreachable or auth invalid",
    };
  }

  const degraded = results.some((r) => !r.passed);
  if (degraded) {
    return {
      status: "SYNC_DEGRADED",
      results,
      message: "Sync is degraded — push or pull succeeded but command/ack failed",
    };
  }

  return {
    status: "SYNC_HEALTHY",
    results,
    message: "All sync checkpoints passed",
  };
}

// ─── MASTER DIRECTORY VALIDATION ────────────────────────────────────
export function validateAgainstMasterDirectory(request, registries) {
  const violations = [];

  // industry-must-exist
  if (!registries.industryRegistry) {
    violations.push({ rule: "industry-must-exist", severity: "BLOCK", message: "Industry registry not loaded" });
  } else if (request.industry_family_id) {
    const family = registries.industryRegistry.find((f) => f.stable_id === request.industry_family_id);
    if (!family) {
      violations.push({ rule: "industry-must-exist", severity: "BLOCK", message: `Unknown industry family: ${request.industry_family_id}` });
    }
  }

  // platform-must-exist
  if (!registries.platformRegistry) {
    violations.push({ rule: "platform-must-exist", severity: "BLOCK", message: "Platform registry not loaded" });
  } else if (request.platform_id) {
    const platform = registries.platformRegistry.find((p) => p.stable_id === request.platform_id);
    if (!platform) {
      violations.push({ rule: "platform-must-exist", severity: "BLOCK", message: `Unknown platform: ${request.platform_id}` });
    } else if (request.industry_family_id) {
      // platform-must-match-industry
      const matches = platform.recommended_industries.includes(request.industry_family_id) ||
                      platform.recommended_industries.includes("all");
      if (!matches) {
        violations.push({
          rule: "platform-must-match-industry",
          severity: "WARN",
          message: `Platform ${request.platform_id} is not recommended for ${request.industry_family_id}`,
        });
      }
    }
  }

  // visualpack-must-be-specified
  if (!request.visual_pack_id && !request.auto_generate_visual_pack) {
    violations.push({
      rule: "visualpack-must-be-specified",
      severity: "BLOCK",
      message: "No VisualPack specified and auto-generate not enabled",
    });
  }

  // template-genome-must-exist
  if (!request.template_genome_id && !request.auto_select_genome) {
    violations.push({
      rule: "template-genome-must-exist",
      severity: "BLOCK",
      message: "No TemplateGenome selected and auto-select not enabled",
    });
  }

  // source-sha-must-be-current
  if (!request.source_sha) {
    violations.push({
      rule: "source-sha-must-be-current",
      severity: "BLOCK",
      message: "No source SHA resolved — cannot verify GitHub source truth",
    });
  }

  // protected-actions-require-approval
  if (request.action_class && isProtectedAction(request.action_class)) {
    if (!request.approval_id || request.approval_status !== "APPROVED") {
      violations.push({
        rule: "protected-actions-require-approval",
        severity: "BLOCK",
        message: `Protected action ${request.action_class} requires approved ApprovalRequest`,
      });
    }
  }

  const hasBlocks = violations.some((v) => v.severity === "BLOCK");
  return {
    valid: !hasBlocks,
    violations,
    has_blocks: hasBlocks,
    has_warnings: violations.some((v) => v.severity === "WARN"),
  };
}