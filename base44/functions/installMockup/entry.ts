// installMockup — GPT-installable mockup library endpoint.
// GPT (or an admin) POSTs mockup metadata + image URLs to register a mockup
// in the MockupLibrary for the Digital Domination website generation system.
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';

export default async function (req) {
  const auth = req.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const expected = secrets.get('GPT_SYNC_API_KEY');
  if (!expected || !token || token !== expected) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const base44 = createClientFromRequest(req);

  // Required fields
  if (!body.title || !body.website_type || !body.industry) {
    return Response.json({
      error: 'Missing required fields: title, website_type, industry',
    }, { status: 400 });
  }

  // Validate website_type against taxonomy (loose — accept any string but warn)
  const slug = (body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')).slice(0, 120);
  const mockup_id = body.mockup_id || ('MK-' + Math.random().toString(36).slice(2, 8).toUpperCase());

  try {
    const record = await base44.asServiceRole.entities.MockupLibrary.create({
      mockup_id,
      title: body.title,
      slug,
      website_type: body.website_type,
      industry: body.industry,
      sub_industry: body.sub_industry || '',
      image_url: body.image_url || body.desktop_image_url || '',
      desktop_image_url: body.desktop_image_url || body.image_url || '',
      mobile_image_url: body.mobile_image_url || '',
      source_url: body.source_url || '',
      design_system: body.design_system || null,
      layout_structure: body.layout_structure || null,
      content_blueprint: body.content_blueprint || null,
      conversion_elements: body.conversion_elements || [],
      tags: body.tags || [],
      style: body.style || 'modern',
      quality_score: body.quality_score || null,
      verified: body.verified === true,
      installed_by: body.installed_by || 'gpt',
      usage_count: 0,
      for_digital_domination: body.for_digital_domination !== false,
      status: body.status || 'pending',
    });

    // Log a sync receipt for audit
    await base44.asServiceRole.entities.SyncReceipt.create({
      receipt_id: crypto.randomUUID(),
      idempotency_key: body.idempotency_key || mockup_id,
      action: 'create',
      entity: 'MockupLibrary',
      operation: 'installMockup',
      status: 'success',
      record_id: record.id,
      summary: 'Installed mockup "' + body.title + '" (' + body.website_type + ' / ' + body.industry + ')',
    });

    return Response.json({ status: 'success', mockup: record }, { status: 201 });
  } catch (e) {
    return Response.json({ error: 'Install failed: ' + String((e && e.message) || e) }, { status: 500 });
  }
}