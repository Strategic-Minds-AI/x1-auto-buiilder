import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Scope requirements per action
const READ_ACTIONS = ['list', 'get', 'count', 'snapshot', 'events', 'distinct', 'aggregate'];
const INVOKE_ACTIONS = ['invoke'];
const WRITE_ACTIONS = ['create', 'update', 'delete', 'bulkCreate', 'bulkUpdate', 'updateMany', 'deleteMany', 'upsert'];

// Entities exposed via the gateway (excludes security-sensitive ones like AppApiKey, User)
const EXPOSED_ENTITIES = [
  'Client', 'WebsiteProject', 'LaunchCampaign', 'BuildProject',
  'AgentProfile', 'AgentTask', 'AgentInstruction', 'AITool', 'AISkill', 'AIToolTemplate',
  'GPTMission', 'PromptPack',
  'Template', 'SiteTemplate', 'PlatformTemplate', 'B2BTemplate', 'SaaSTemplate',
  'ChatUITemplate', 'FunnelTemplate', 'WorkflowTemplate', 'DesignTemplate', 'StyleGuide', 'FontSystem',
  'MediaAsset', 'VideoAsset', 'SocialCreativeKit', 'SocialPost', 'SocialCampaign', 'DigitalCardFlyer',
  'GenerationJob', 'ApprovalRequest', 'ValidationReceipt', 'SyncReceipt', 'ComplianceReport',
  'SystemTestReport', 'Sandbox', 'MeasurementBinding',
  'IntelligenceTask', 'FaultLineScan', 'MockupProject', 'PricingIntelligence', 'GoogleStandard',
  'CommChannel', 'ChannelConnection',
  'Lead', 'ApprovedBrandManifest',
  'CrmContact', 'Post', 'Project', 'Testimonial',
];

function hasScope(apiKey, required) {
  if ((apiKey.scopes || []).includes('admin')) return true;
  return (apiKey.scopes || []).includes(required);
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);

    // --- Auth: verify API key via hash comparison ---
    const auth = req.headers.get('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token) return Response.json({ error: 'Missing API key. Pass it in the Authorization: Bearer header.' }, { status: 401 });

    const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
    const tokenHash = Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, '0')).join('');

    const keyPage = await base44.asServiceRole.entities.AppApiKey.filter({ key_hash: tokenHash, status: 'active' }, { limit: 1 });
    if (!keyPage.items || keyPage.items.length === 0) {
      return Response.json({ error: 'Invalid or revoked API key' }, { status: 401 });
    }
    const apiKey = keyPage.items[0];

    if (apiKey.expires_at && new Date(apiKey.expires_at) < new Date()) {
      return Response.json({ error: 'API key expired' }, { status: 401 });
    }

    // Update last_used_at (fire-and-forget)
    base44.asServiceRole.entities.AppApiKey.update(apiKey.id, { last_used_at: new Date().toISOString() }).catch(() => {});

    // --- Parse and route ---
    const body = await req.json();
    const { action } = body;

    // Scope check
    if (READ_ACTIONS.includes(action) && !hasScope(apiKey, 'read')) {
      return Response.json({ error: 'Insufficient scope: read required' }, { status: 403 });
    }
    if (INVOKE_ACTIONS.includes(action) && !hasScope(apiKey, 'invoke')) {
      return Response.json({ error: 'Insufficient scope: invoke required' }, { status: 403 });
    }
    if (WRITE_ACTIONS.includes(action) && !hasScope(apiKey, 'write')) {
      return Response.json({ error: 'Insufficient scope: write required' }, { status: 403 });
    }

    // Entity validation
    if (body.entity && !EXPOSED_ENTITIES.includes(body.entity)) {
      return Response.json({ error: 'Entity not exposed via API: ' + body.entity, exposed: EXPOSED_ENTITIES }, { status: 400 });
    }

    let result = {};

    // --- Entity operations ---
    if (action === 'list') {
      const opts = {};
      if (body.sort) opts.sort = body.sort;
      if (body.limit) opts.limit = body.limit;
      if (body.fields) opts.fields = body.fields;
      if (body.cursor) opts.cursor = body.cursor;
      const res = await base44.asServiceRole.entities[body.entity].filter(body.query || {}, opts);
      result = { items: res.items || [], has_more: res.has_more, next_cursor: res.next_cursor };
    } else if (action === 'get') {
      const record = await base44.asServiceRole.entities[body.entity].get(body.id);
      result = { record };
    } else if (action === 'count') {
      const count = await base44.asServiceRole.entities[body.entity].count(body.query || {});
      result = { count };
    } else if (action === 'distinct') {
      const res = await base44.asServiceRole.entities[body.entity].filter(body.query || {}, { distinct: body.field, limit: body.limit || 100 });
      result = { values: res.items || [] };
    } else if (action === 'aggregate') {
      const res = await base44.asServiceRole.entities[body.entity].aggregate(body.params || {});
      result = { rows: res.rows || [], truncated: res.truncated };
    } else if (action === 'create') {
      const record = await base44.asServiceRole.entities[body.entity].create(body.data || {});
      result = { record };
    } else if (action === 'update') {
      const record = await base44.asServiceRole.entities[body.entity].update(body.id, body.data || {});
      result = { record };
    } else if (action === 'delete') {
      await base44.asServiceRole.entities[body.entity].delete(body.id);
      result = { deleted: true, id: body.id };
    } else if (action === 'bulkCreate') {
      const res = await base44.asServiceRole.entities[body.entity].bulkCreate(body.records || []);
      result = res;
    } else if (action === 'bulkUpdate') {
      const res = await base44.asServiceRole.entities[body.entity].bulkUpdate(body.records || []);
      result = res;
    } else if (action === 'updateMany') {
      const res = await base44.asServiceRole.entities[body.entity].updateMany(body.query || {}, body.update || {});
      result = res;
    } else if (action === 'deleteMany') {
      const res = await base44.asServiceRole.entities[body.entity].deleteMany(body.query || {});
      result = res;
    } else if (action === 'upsert') {
      const res = await base44.asServiceRole.entities[body.entity].upsert(body.records || [], { key: body.key || 'id' });
      result = res;

    // --- Function invocation ---
    } else if (action === 'invoke') {
      try {
        const res = await base44.asServiceRole.functions.invoke(body.function, body.args || {});
        result = { result: res.data || res };
      } catch (invokeErr) {
        // Fallback: call via HTTP
        const appUrl = req.headers.get('X-Base44-App-Url') || '';
        if (appUrl) {
          const funcRes = await fetch(appUrl + '/functions/' + body.function, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body.args || {}),
            signal: AbortSignal.timeout(120000)
          });
          result = { result: await funcRes.json() };
        } else {
          throw invokeErr;
        }
      }

    // --- Snapshot: counts for all exposed entities ---
    } else if (action === 'snapshot') {
      const entities = body.entities || EXPOSED_ENTITIES.slice(0, 15);
      const snapshot = {};
      await Promise.all(entities.map(async (e) => {
        try { snapshot[e] = await base44.asServiceRole.entities[e].count(); } catch { snapshot[e] = -1; }
      }));
      result = { snapshot };
    } else if (action === 'events') {
      const res = await base44.asServiceRole.entities.SyncReceipt.filter({}, { sort: '-created_date', limit: body.limit || 25 });
      result = { events: res.items || [] };

    // --- Discovery: list exposed entities and functions ---
    } else if (action === 'discover') {
      result = {
        entities: EXPOSED_ENTITIES,
        actions: [...READ_ACTIONS, ...INVOKE_ACTIONS, ...WRITE_ACTIONS, 'discover'],
        scopes: ['read', 'invoke', 'write', 'admin'],
        keyInfo: { name: apiKey.name, scopes: apiKey.scopes, prefix: apiKey.key_prefix }
      };
    } else {
      return Response.json({ error: 'Unknown action: ' + action + '. Use discover to see available actions.' }, { status: 400 });
    }

    return Response.json({ status: 'success', ...result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}