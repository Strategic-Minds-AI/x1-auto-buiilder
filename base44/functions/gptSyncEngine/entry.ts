// APEX_UNIVERSAL_GENERATOR_SYNC v4.1
// Bidirectional sync engine with expanded module coverage, release gate,
// conflict detection, and autonomous execution support.
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';
import { buildWebsiteBlueprint, runMassLaunch, generateBrandAssets, researchTemplates } from '../../shared/generation.js';

// ── v4.1 Sync Configuration Manifest ───────────────────────────
const SYNC_CONFIG = {
  name: "APEX_UNIVERSAL_GENERATOR_SYNC",
  version: "4.1",
  mode: "bidirectional",
  enabled: true,
  endpoint: "/functions/gptSyncEngine",
  authentication: { enabled: true, type: "bearer", secret_ref: "GPT_SYNC_API_KEY", server_side_only: true },
  modules: {
    universal_generator: true, template_library: true, brand_generator: true,
    logo_generator: true, content_generator: true, responsive_preview: true,
    agent_orchestration: true, independent_validation: true, deployment_receipts: true,
    website_factory: true, app_factory: true, component_factory: true,
    seo_aeo_geo: true, market_research: true, competitor_intelligence: true,
    social_automation: true, crm_integration: true, analytics: true,
    self_healing: true, recursive_optimization: true,
    github_sync: true, vercel_sync: true, supabase_sync: true,
    railway_sync: true, google_drive_sync: true, base44_sync: true,
  },
  template_factory: {
    enabled: true, industry_families: 20, universal_generation: true,
    bulk_generation: true, design_selection: true, noindex_preview: true,
    responsive_validation: true, existing_X1_runtime: true,
  },
  sync: {
    enabled: true, direction: "both", read: true, write: true, create: true,
    update: true, delete: true, execute: true, events: true, snapshots: true,
    conflict_detection: true, idempotency_required: true, receipts_required: true,
  },
  permissions: {
    read: true, draft: true, preview: true, production_deploy: true, delete: true,
    manage_secrets: true, purchase_domains: true, manage_integrations: true,
    manage_agents: true, manage_templates: true, manage_workflows: true,
    manage_websites: true, manage_applications: true, autonomous_execution: true,
  },
  autonomy: {
    enabled: true, recursive_execution: true, automatic_repair: true,
    automatic_testing: true, automatic_optimization: true, agent_delegation: true,
    persistent_execution: true, protected_actions_require_approval: true,
  },
  release_gate: {
    enabled: true, independent_validation: true, operator_approval: true,
    rollback_required: true, security_validation: true, deployment_verification: true,
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
]);
const PROTECTED_ACTIONS = new Set(['delete']);

const WRITE_ACTIONS = new Set(['create', 'update', 'delete', 'execute']);

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
    if (isProtected && !body.approved) {
      const receipt = await base44.asServiceRole.entities.SyncReceipt.create({
        receipt_id: crypto.randomUUID(),
        idempotency_key: idempotency_key || '',
        action: action,
        entity: body.entity || body.function || '',
        operation: body.function || '',
        status: 'error',
        record_id: body.id || '',
        summary: 'Protected action requires operator approval (set approved: true)',
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
      return Response.json({ snapshot, config: { version: '4.1', modules: Object.keys(SYNC_CONFIG.modules) } });
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
        } catch { /* if get fails, proceed with update */ }
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