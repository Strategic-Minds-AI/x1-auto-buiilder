import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';
import { buildWebsiteBlueprint, runMassLaunch, generateBrandAssets, researchTemplates } from '../../shared/generation.js';

const ALLOWED_ENTITIES = ['WebsiteProject', 'Template', 'LaunchCampaign'];
const ALLOWED_FUNCS = ['generateWebsite', 'massLaunch', 'researchIndustryTemplates', 'generateAssets'];
const WRITE_ACTIONS = ['create', 'update', 'delete', 'execute'];

export default async function(req) {
  let body = null;
  try {
    // Bearer auth
    const auth = req.headers.get('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    const expected = secrets.get('GPT_SYNC_API_KEY');
    if (!expected || !token || token !== expected) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const base44 = createClientFromRequest(req);
    body = await req.json();
    const { action, idempotency_key } = body;

    // Idempotency: return the original receipt if this key was already processed
    if (idempotency_key && WRITE_ACTIONS.includes(action)) {
      const existing = await base44.asServiceRole.entities.SyncReceipt.filter({ idempotency_key }, { limit: 1 });
      if (existing.items && existing.items.length > 0) {
        return Response.json({ status: 'duplicate', receipt: existing.items[0] });
      }
    }

    let result = {};
    let summary = '';
    let record_id = '';
    let entityLabel = body.entity || '';

    if (action === 'read') {
      if (!ALLOWED_ENTITIES.includes(body.entity)) return Response.json({ error: 'Unknown entity' }, { status: 400 });
      const opts = {};
      if (body.sort) opts.sort = body.sort;
      if (body.limit) opts.limit = body.limit;
      const res = await base44.asServiceRole.entities[body.entity].filter(body.query || {}, opts);
      return Response.json({ items: res.items || [], has_more: res.has_more, next_cursor: res.next_cursor });
    }

    if (action === 'snapshot') {
      const snapshot = {};
      for (const e of ALLOWED_ENTITIES) {
        snapshot[e] = await base44.asServiceRole.entities[e].count();
      }
      return Response.json({ snapshot });
    }

    if (action === 'events') {
      const res = await base44.asServiceRole.entities.SyncReceipt.filter({}, { sort: '-created_date', limit: body.limit || 25 });
      return Response.json({ events: res.items || [] });
    }

    if (action === 'create') {
      if (!ALLOWED_ENTITIES.includes(body.entity)) return Response.json({ error: 'Unknown entity' }, { status: 400 });
      const rec = await base44.asServiceRole.entities[body.entity].create(body.data || {});
      record_id = rec.id;
      summary = `Created ${body.entity}`;
      result = { record: rec };
    } else if (action === 'update') {
      if (!ALLOWED_ENTITIES.includes(body.entity)) return Response.json({ error: 'Unknown entity' }, { status: 400 });
      const rec = await base44.asServiceRole.entities[body.entity].update(body.id, body.data || {});
      record_id = body.id;
      summary = `Updated ${body.entity}`;
      result = { record: rec };
    } else if (action === 'delete') {
      if (!ALLOWED_ENTITIES.includes(body.entity)) return Response.json({ error: 'Unknown entity' }, { status: 400 });
      await base44.asServiceRole.entities[body.entity].delete(body.id);
      record_id = body.id;
      summary = `Deleted ${body.entity}`;
      result = { deleted: true };
    } else if (action === 'execute') {
      if (!ALLOWED_FUNCS.includes(body.function)) return Response.json({ error: 'Unknown function' }, { status: 400 });
      entityLabel = body.function;
      const p = body.payload || {};
      if (body.function === 'generateWebsite') {
        const blueprint = await buildWebsiteBlueprint(base44, p);
        summary = 'Generated website blueprint';
        result = { blueprint };
      } else if (body.function === 'massLaunch') {
        const launched = await runMassLaunch(base44, p, 'service');
        record_id = launched.campaign?.id || '';
        summary = `Launched ${launched.projects?.length || 0} sites`;
        result = launched;
      } else if (body.function === 'researchIndustryTemplates') {
        const tpl = await researchTemplates(base44, p.industry, 'service');
        summary = `Researched ${tpl.templates?.length || 0} templates`;
        result = tpl;
      } else if (body.function === 'generateAssets') {
        const assets = await generateBrandAssets(base44, p);
        summary = 'Generated brand assets';
        result = assets;
      }
    } else {
      return Response.json({ error: 'Unknown action' }, { status: 400 });
    }

    // Write receipt
    const receipt = await base44.asServiceRole.entities.SyncReceipt.create({
      receipt_id: crypto.randomUUID(),
      idempotency_key: idempotency_key || '',
      action,
      entity: entityLabel,
      operation: body.function || '',
      status: 'success',
      record_id,
      summary
    });

    return Response.json({ status: 'success', receipt, result });
  } catch (error) {
    // Best-effort error receipt
    try {
      const base44 = createClientFromRequest(req);
      await base44.asServiceRole.entities.SyncReceipt.create({
        receipt_id: crypto.randomUUID(),
        idempotency_key: body?.idempotency_key || '',
        action: body?.action || '',
        entity: body?.entity || body?.function || '',
        operation: body?.function || '',
        status: 'error',
        record_id: body?.id || '',
        summary: String(error.message || error).slice(0, 400)
      });
    } catch (_) {}
    return Response.json({ error: String(error.message || error) }, { status: 500 });
  }
}