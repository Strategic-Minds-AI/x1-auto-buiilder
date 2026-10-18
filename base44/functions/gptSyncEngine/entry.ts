// APEX_UNIVERSAL_GENERATOR_SYNC v4.1
// Bidirectional sync engine with expanded module coverage, release gate,
// conflict detection, and autonomous execution support.
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';
import { buildWebsiteBlueprint, runMassLaunch, generateBrandAssets, researchTemplates } from '../../shared/generation.js';

// ── ULTIMATE_AUTO_BUILDER_BIDIRECTIONAL_CONTROL Manifest ─────────
const SYNC_CONFIG = {
  name: "ULTIMATE_AUTO_BUILDER_BIDIRECTIONAL_CONTROL",
  version: "1.0.0",
  enabled: true,
  mode: "full_bidirectional_autonomous",
  mission: "Operate the Ultimate Auto Builder as an autonomous, evidence-driven build system using GitHub as source truth, Base44 as the synchronized application builder, and authorized external providers for preview, validation, storage, workers, and deployment.",
  source_truth: {
    provider: "github",
    repository: "Strategic-Minds-AI/x1-auto-buiilder",
    default_branch: "main",
    git_is_authoritative: true,
    base44_git_sync: true,
    require_fresh_sha_before_write: true,
    require_diff_before_commit: true,
    require_receipt_after_commit: true,
  },
  base44: {
    enabled: true, mode: "bidirectional", git_sync_enabled: true,
    local_dev_enabled: true, remote_dev_enabled: true, builder_sync: true,
    entity_read: true, entity_write: true, function_read: true, function_write: true,
    schema_read: true, schema_write: true, app_edit: true, frontend_edit: true,
    backend_edit: true, auth_edit: true, workflow_edit: true, integration_edit: true,
    publish_capable: true, production_data_access: true,
    production_publish_requires_approval: true,
  },
  github: {
    enabled: true, read: true, write: true, create_branch: true,
    create_file: true, update_file: true, delete_file: true, create_commit: true,
    create_pull_request: true, review_pull_request: true, update_pull_request: true,
    merge_pull_request: true, rerun_actions: true, read_workflow_logs: true,
    force_push: false, protected_branch_merge_requires_approval: true,
  },
  autonomy: {
    enabled: true, level: "maximum_authorized", recursive_execution: true,
    self_directed_planning: true, self_directed_discovery: true, self_directed_build: true,
    self_directed_testing: true, self_directed_debugging: true, self_directed_repair: true,
    self_directed_refactoring: true, self_directed_optimization: true, self_directed_validation: true,
    self_directed_documentation: true, self_directed_branch_creation: true,
    self_directed_preview_deployment: true, self_directed_pull_requests: true,
    self_directed_ci_retry: true, self_directed_rollback_preparation: true,
    continue_until_complete_or_blocked: true, do_not_stop_at_plan: true,
    do_not_stop_at_draft: true, do_not_stop_at_queue: true, do_not_stop_at_ready_badge: true,
  },
  recursive_engine: {
    enabled: true,
    sequence: ["DISCOVER","RECONCILE_SOURCE_TRUTH","PLAN","BUILD","TEST","DIAGNOSE","REPAIR","RETEST","HARDEN","OPTIMIZE","PREVIEW","INDEPENDENTLY_VALIDATE","PREPARE_RELEASE","COMPLETE"],
    repeat_until: ["acceptance_criteria_pass","authorization_boundary","resource_boundary","provider_boundary","security_boundary"],
  },
  capabilities: {
    website_generation: true, app_generation: true, component_generation: true,
    template_generation: true, template_reuse: true, unlimited_industries: true,
    unlimited_markets: true, unlimited_locations: true, multi_language: true,
    brand_generation: true, logo_generation: true, content_generation: true,
    seo_generation: true, aeo_generation: true, geo_generation: true, schema_generation: true,
    forms: true, lead_capture: true, crm_workflows: true, client_portals: true,
    admin_portals: true, payments: true, email_workflows: true, sms_workflows: true,
    analytics: true, market_research: true, competitor_research: true,
    image_generation: true, image_asset_reuse: true, responsive_generation: true,
    accessibility_validation: true, performance_validation: true, security_validation: true,
    synthetic_testing: true, visual_regression: true, deployment_receipts: true, rollback_receipts: true,
  },
  generator: {
    enabled: true, universal: true, industry_limit: null, location_limit: null,
    site_limit: null, app_limit: null, template_limit: null, market_limit: null,
    batch_generation: true, single_canary_first: true,
    scale_sequence: [1,10,100,1000], require_canary_validation_before_scale: true,
  },
  sync: {
    enabled: true, direction: "both", github_to_base44: true, base44_to_github: true,
    read: true, write: true, create: true, update: true, delete: true, execute: true,
    snapshot: true, events: true, conflict_detection: true,
    conflict_resolution: "source_truth_and_newest_verified_state",
    idempotency_required: true, hash_verification: true, receipts_required: true, audit_log_required: true,
  },
  providers: {
    vercel: { enabled: true, preview_deploy: true, production_deploy: true, production_deploy_requires_approval: true, noindex_preview: true, deployment_receipt_required: true },
    supabase: { enabled: true, read: true, write: true, auth: true, storage: true, database: true, rls: true, production_schema_changes_require_approval: true },
    railway: { enabled: true, durable_workers: true, jobs: true, queues: true, leases: true, retries: true, idempotency: true, reuse_existing_workers: true },
    google_drive: { enabled: true, read_assets: true, read_brand_assets: true, read_documents: true, write_generated_assets: true },
  },
  agents: {
    enabled: true, delegation: true, parallel_research: true, parallel_validation: true,
    parallel_testing: true, coding_agent: true, design_agent: true, seo_agent: true,
    qa_agent: true, security_agent: true, deployment_agent: true, guardian_agent: true,
    independent_validator_required: true,
  },
  testing: {
    enabled: true, build: true, lint: true, typecheck: true, unit: true, integration: true,
    e2e: true, browser: true, mobile: true, tablet: true, desktop: true, forms: true,
    auth: true, role_negative_tests: true, tenant_isolation: true, rls: true, api: true,
    queue: true, lease: true, retry: true, idempotency: true, accessibility: true,
    performance: true, security: true, seo: true, noindex_preview: true, rollback: true,
    untested_status: "UNKNOWN",
  },
  permissions: {
    read_everything_authorized: true, write_everything_authorized: true,
    create: true, update: true, delete: true, execute: true, branch: true,
    commit: true, pull_request: true, preview: true, deploy: true,
    manage_templates: true, manage_agents: true, manage_workflows: true,
    manage_websites: true, manage_apps: true, manage_integrations: true,
    manage_data: true, manage_auth: true, manage_storage: true, manage_queues: true,
    manage_workers: true, manage_analytics: true, manage_seo: true, manage_assets: true,
  },
  protected_actions: {
    production_release: true, production_rollback: true, default_branch_merge: true,
    protected_branch_merge: true, production_database_migration: true, rls_change: true,
    secret_change: true, oauth_change: true, dns_change: true, domain_purchase: true,
    permission_change: true, real_payment: true, spend: true, customer_email: true,
    customer_sms: true, public_social_post: true, destructive_change: true,
    irreversible_migration: true, require_explicit_scoped_approval: true,
  },
  release_gate: {
    enabled: true, require_source_sha: true, require_build_pass: true,
    require_test_pass: true, require_browser_validation: true, require_mobile_validation: true,
    require_security_validation: true, require_independent_validation: true,
    require_preview_url: true, require_noindex_preview: true, require_receipts: true,
    require_rollback_reference: true, require_operator_approval_for_production: true,
  },
  failure_policy: {
    automatic_diagnosis: true, automatic_repair: true, automatic_retest: true,
    max_repair_loops: 10, preserve_failure_evidence: true,
    never_hide_errors: true, never_mark_failed_as_complete: true,
  },
  reporting: {
    required: true,
    format: ["RESULT","EVIDENCE","VERIFIED","INFERRED","UNKNOWN","GAP","BLOCKERS","WORKAROUND","ROLLBACK","NEXT_ACTION"],
  },
};

// ── Entity Allowlist (grouped by module) ────────────────────────
const ENTITY_GROUPS = {
  generation: ['WebsiteProject', 'Template', 'DesignTemplate', 'GenerationItem', 'CloneProject', 'LaunchCampaign'],
  agent: ['AgentProfile', 'AgentInstruction', 'AgentTask', 'ApexMission', 'ApexOpportunity'],
  workflow: ['CustomWorkflow'],
  client: ['Client', 'ClientProject'],
  deployment: ['BuildProject', 'Sandbox'],
  validation: ['SystemTestReport', 'ValidationReceipt', 'ApprovalRequest'],
  crm: ['Lead', 'CrmContact'],
  social: ['SocialPost', 'SocialCampaign'],
  libraries: ['GitHubRepo', 'FreeAsset', 'AITool', 'AISkill'],
};
const ALL_ENTITIES = Object.values(ENTITY_GROUPS).flat();

// ── Function Allowlist ──────────────────────────────────────────
const FUNCTION_ALLOWLIST = [
  'generateWebsite', 'massLaunch', 'researchIndustryTemplates', 'generateAssets',
  'universalGenerator', 'universalGenerate', 'generateDesignTemplates', 'generateContent',
  'generateBusinessNames', 'cloneGenerator', 'deploySite', 'batchDeploy',
  'provisionSite', 'provisionSandbox', 'runValidation', 'runSystemTests',
  'runComplianceCheck', 'authorizeRelease', 'generateStrategies', 'discoverPricing',
  'generateSocialCreative', 'generateSocialSchedule', 'apexOrchestrator',
  'apexDecomposeCommand', 'syncAllAnalytics', 'syncSearchConsole', 'syncGoogleAnalytics',
  'autoFixCompliance', 'autoConvergeSite', 'generatePricingStrategy', 'generateVision',
  'generateVideoPipeline', 'generateSocialScheduleV2', 'generateCardFlyerContent',
  'generateLibraryBatch', 'generateAssetBatch', 'generateIndustryPrompts',
  'scrapeGitHubTrending', 'populateLibraries', 'seedLibraries',
  'provisionDomain', 'checkDomainAvailability', 'provisionPreview',
  'processComplianceReview', 'batchValidateTemplates', 'suggestTemplates',
  'instantlateTemplate', 'universalizeTemplate', 'createBrandManifest',
  'generateSocialCreative', 'systemAudit', 'webScraper', 'researchBusiness',
  'gptControlBridge', 'syncStrategiesToMissions', 'customApiGateway',
];

// ── Protected actions requiring operator approval ──────────────
const PROTECTED_FUNCTIONS = new Set([
  'deploySite', 'batchDeploy', 'authorizeRelease', 'massLaunch',
  'provisionDomain', 'provisionSandbox', 'batchDeploy',
  'provisionSite', 'autoConvergeSite', 'apexOrchestrator',
  'gptControlBridge', 'customApiGateway',
]);
const PROTECTED_ACTIONS = new Set(['delete']);

const WRITE_ACTIONS = new Set(['create', 'update', 'delete', 'execute']);
const INDEPENDENT_CONTROL_ENTITIES = new Set(['ApprovalRequest', 'ValidationReceipt']);

// ── Inline function handlers (shared module imports) ───────────
const INLINE_HANDLERS = {
  generateWebsite: async (base44, p) => ({ blueprint: await buildWebsiteBlueprint(base44, p) }),
  massLaunch: async (base44, p) => runMassLaunch(base44, p, 'service'),
  researchIndustryTemplates: async (base44, p) => researchTemplates(base44, p.industry, 'service'),
  generateAssets: async (base44, p) => generateBrandAssets(base44, p),
};

export default async function(req) {
  let body = null;
  let base44 = null;

  try {
    // ── Authentication ───────────────────────────────────────────
    const auth = req.headers.get('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    const expected = secrets.get('GPT_SYNC_API_KEY');
    if (!expected || !token || token !== expected) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    base44 = createClientFromRequest(req);
    body = await req.json();
    const { action, idempotency_key } = body;

    if (WRITE_ACTIONS.has(action) && !idempotency_key) {
      return Response.json({ error: 'A stable idempotency_key is required for writes' }, { status: 428 });
    }
    if (WRITE_ACTIONS.has(action) && INDEPENDENT_CONTROL_ENTITIES.has(body.entity)) {
      return Response.json({ error: 'Independent approvals and validator receipts are read-only to this sync bridge' }, { status: 403 });
    }
    if (action === 'update' && !body.expected_updated_date) {
      return Response.json({ error: 'expected_updated_date is required to prevent stale writes' }, { status: 428 });
    }

    // ── Idempotency check ──────────────────────────────────────
    if (idempotency_key && WRITE_ACTIONS.has(action)) {
      const existing = await base44.asServiceRole.entities.SyncReceipt.filter({ idempotency_key }, { limit: 1 });
      if (existing.items && existing.items.length > 0) {
        return Response.json({ status: 'duplicate', receipt: existing.items[0] });
      }
    }

    // ── Config action: return v4.1 manifest ────────────────────
    if (action === 'config') {
      return Response.json(SYNC_CONFIG);
    }

    // ── Release gate: protected actions require approval ──────
    const isProtected = PROTECTED_ACTIONS.has(action) ||
      (action === 'execute' && PROTECTED_FUNCTIONS.has(body.function));
    let approvalValid = false;
    if (isProtected) {
      const approvalClass = action === 'delete' ? 'DESTRUCTIVE_ACTION'
        : body.function === 'provisionDomain' ? 'DNS_CHANGE'
        : body.function === 'provisionSandbox' ? 'PAYMENT_SPEND'
        : 'PRODUCTION_RELEASE';
      const targetRef = action === 'delete'
        ? `delete:${body.entity}:${body.id || ''}`
        : `execute:${body.function}:${body.work_packet_id || ''}`;
      try {
        if (body.approval_id && (action === 'delete' ? !!body.id : !!body.work_packet_id)) {
          const approval = await base44.asServiceRole.entities.ApprovalRequest.get(body.approval_id);
          const expiryValid = !approval?.expires_at || (Number.isFinite(Date.parse(approval.expires_at)) && Date.parse(approval.expires_at) > Date.now());
          approvalValid = !!(approval && approval.status === 'APPROVED' &&
            approval.action_class === approvalClass && approval.scope === targetRef &&
            approval.request_id && approval.approved_by && approval.resolved_at &&
            approval.rollback_ref && expiryValid &&
            (action === 'delete' || approval.work_packet_id === body.work_packet_id));
        }
      } catch { /* fail closed */ }
    }
    if (isProtected && !approvalValid) {
      const receipt = await base44.asServiceRole.entities.SyncReceipt.create({
        receipt_id: crypto.randomUUID(),
        idempotency_key: idempotency_key || '',
        action: action,
        entity: body.entity || body.function || '',
        operation: body.function || '',
        status: 'error',
        record_id: body.id || '',
        summary: 'Protected action requires independently verified scoped ApprovalRequest',
      });
      return Response.json({
        error: 'Protected action requires operator approval',
        release_gate: SYNC_CONFIG.release_gate,
        receipt,
      }, { status: 403 });
    }

    let result = {};
    let summary = '';
    let record_id = '';
    let entityLabel = body.entity || '';

    // ── Read ────────────────────────────────────────────────────
    if (action === 'read') {
      if (!ALL_ENTITIES.includes(body.entity)) {
        return Response.json({ error: 'Unknown entity', allowed: ALL_ENTITIES }, { status: 400 });
      }
      const opts = {};
      if (body.sort) opts.sort = body.sort;
      if (body.limit) opts.limit = body.limit;
      if (body.fields) opts.fields = body.fields;
      const res = await base44.asServiceRole.entities[body.entity].filter(body.query || {}, opts);
      return Response.json({ items: res.items || [], has_more: res.has_more, next_cursor: res.next_cursor });
    }

    // ── Snapshot ───────────────────────────────────────────────
    if (action === 'snapshot') {
      const snapshot = {};
      for (const e of ALL_ENTITIES) {
        try { snapshot[e] = await base44.asServiceRole.entities[e].count(); }
        catch { snapshot[e] = -1; }
      }
      return Response.json({ snapshot, config: { version: '4.1', modules: Object.keys(ENTITY_GROUPS) } });
    }

    // ── Events ─────────────────────────────────────────────────
    if (action === 'events') {
      const res = await base44.asServiceRole.entities.SyncReceipt.filter(
        body.query || {}, { sort: '-created_date', limit: body.limit || 50 }
      );
      return Response.json({ events: res.items || [], has_more: res.has_more });
    }

    // ── Validate (release gate: independent validation) ────────
    if (action === 'validate') {
      const checks = [];
      if (body.project_id) {
        try {
          const proj = await base44.asServiceRole.entities.WebsiteProject.get(body.project_id);
          checks.push({ check: 'project_exists', passed: true, detail: proj.business_name || proj.id });
        } catch {
          checks.push({ check: 'project_exists', passed: false, detail: 'Project not found' });
        }
      }
      if (body.template_id) {
        try {
          const tpl = await base44.asServiceRole.entities.DesignTemplate.get(body.template_id);
          checks.push({ check: 'template_exists', passed: true, detail: tpl.name || tpl.id });
        } catch {
          checks.push({ check: 'template_exists', passed: false, detail: 'Template not found' });
        }
      }
      const allPassed = checks.length > 0 && checks.every(c => c.passed);
      summary = allPassed ? 'Validation passed' : 'Validation failed';
      result = { validated: allPassed, checks };
      record_id = body.project_id || body.template_id || '';
      entityLabel = 'validation';
    }

    // ── Create ─────────────────────────────────────────────────
    else if (action === 'create') {
      if (!ALL_ENTITIES.includes(body.entity)) {
        return Response.json({ error: 'Unknown entity', allowed: ALL_ENTITIES }, { status: 400 });
      }
      const rec = await base44.asServiceRole.entities[body.entity].create(body.data || {});
      record_id = rec.id;
      summary = 'Created ' + body.entity;
      result = { record: rec };
    }

    // ── Update (with conflict detection) ───────────────────────
    else if (action === 'update') {
      if (!ALL_ENTITIES.includes(body.entity)) {
        return Response.json({ error: 'Unknown entity', allowed: ALL_ENTITIES }, { status: 400 });
      }
      // Conflict detection: if expected_updated_date is provided, verify it matches
      if (body.expected_updated_date) {
        try {
          const current = await base44.asServiceRole.entities[body.entity].get(body.id);
          if (current.updated_date && current.updated_date !== body.expected_updated_date) {
            return Response.json({
              error: 'Conflict detected',
              detail: 'Record was modified since last read',
              current_updated_date: current.updated_date,
              expected_updated_date: body.expected_updated_date,
            }, { status: 409 });
          }
        } catch { return Response.json({ error: 'Unable to verify existing record version' }, { status: 409 }); }
      }
      const rec = await base44.asServiceRole.entities[body.entity].update(body.id, body.data || {});
      record_id = body.id;
      summary = 'Updated ' + body.entity;
      result = { record: rec };
    }

    // ── Delete (protected — requires approval, checked above) ─
    else if (action === 'delete') {
      if (!ALL_ENTITIES.includes(body.entity)) {
        return Response.json({ error: 'Unknown entity', allowed: ALL_ENTITIES }, { status: 400 });
      }
      await base44.asServiceRole.entities[body.entity].delete(body.id);
      record_id = body.id;
      summary = 'Deleted ' + body.entity;
      result = { deleted: true };
    }

    // ── Execute (function invocation) ──────────────────────────
    else if (action === 'execute') {
      if (!FUNCTION_ALLOWLIST.includes(body.function)) {
        return Response.json({ error: 'Unknown function', allowed: FUNCTION_ALLOWLIST }, { status: 400 });
      }
      entityLabel = body.function;
      const p = body.payload || {};

      // Try inline handler first (shared module imports)
      if (INLINE_HANDLERS[body.function]) {
        result = await INLINE_HANDLERS[body.function](base44, p);
        if (body.function === 'massLaunch') {
          record_id = (result.campaign && result.campaign.id) || '';
          summary = 'Launched ' + (result.projects ? result.projects.length : 0) + ' sites';
        } else if (body.function === 'researchIndustryTemplates') {
          summary = 'Researched ' + (result.templates ? result.templates.length : 0) + ' templates';
        } else {
          summary = 'Executed ' + body.function;
        }
      } else {
        // Invoke via functions API for all other allowed functions
        try {
          const fnResult = await base44.functions.invoke(body.function, p);
          result = fnResult.data || fnResult;
          summary = 'Executed ' + body.function;
          if (result.id) record_id = result.id;
        } catch (fnErr) {
          return Response.json({
            error: 'Function execution failed',
            function: body.function,
            detail: String(fnErr.message || fnErr),
          }, { status: 502 });
        }
      }
    }

    else {
      return Response.json({ error: 'Unknown action', allowed: ['config', 'read', 'create', 'update', 'delete', 'execute', 'snapshot', 'events', 'validate'] }, { status: 400 });
    }

    // ── Create receipt ──────────────────────────────────────────
    const receipt = await base44.asServiceRole.entities.SyncReceipt.create({
      receipt_id: crypto.randomUUID(),
      idempotency_key: idempotency_key || '',
      action: action,
      entity: entityLabel,
      operation: body.function || '',
      status: 'success',
      record_id: record_id,
      summary: summary,
    });

    return Response.json({ status: 'success', receipt, result });
  } catch (error) {
    // ── Error receipt ───────────────────────────────────────────
    try {
      if (base44) {
        await base44.asServiceRole.entities.SyncReceipt.create({
          receipt_id: crypto.randomUUID(),
          idempotency_key: (body && body.idempotency_key) || '',
          action: (body && body.action) || '',
          entity: (body && (body.entity || body.function)) || '',
          operation: (body && body.function) || '',
          status: 'error',
          record_id: (body && body.id) || '',
          summary: String(error.message || error).slice(0, 400),
        });
      }
    } catch (_) {}
    return Response.json({ error: String(error.message || error) }, { status: 500 });
  }
}