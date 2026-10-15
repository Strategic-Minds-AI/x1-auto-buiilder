import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { instantiateFromTemplate } from '../../shared/generation.js';

const CONNECTOR_ID = '69db1fad3c50db37ad0ce8dd';

function extractSheetId(url) {
  if (!url) return null;
  const m = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return m ? m[1] : url.trim();
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { spreadsheetUrl, sheetName, templateId, action } = body;

    // action: 'read' = just read sheet data, 'instantiate' = read + batch instantiate templates
    if (!spreadsheetUrl) return Response.json({ error: 'spreadsheetUrl is required' }, { status: 400 });

    // Get the app user's Google Sheets OAuth token
    let accessToken;
    try {
      const conn = await base44.asServiceRole.connectors.getCurrentAppUserConnection(CONNECTOR_ID);
      accessToken = conn.accessToken;
    } catch {
      return Response.json({ error: 'Google Sheets not connected. Please connect your account first.' }, { status: 403 });
    }

    const sheetId = extractSheetId(spreadsheetUrl);

    // Read sheet metadata to get available sheet names
    const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    if (!metaRes.ok) {
      const err = await metaRes.text();
      return Response.json({ error: `Failed to access spreadsheet: ${metaRes.status} — ${err}` }, { status: 400 });
    }
    const meta = await metaRes.json();
    const sheets = (meta.sheets || []).map(s => s.properties?.title);
    const targetSheet = sheetName || sheets[0];

    if (!targetSheet) {
      return Response.json({ error: 'No sheets found in this spreadsheet' }, { status: 400 });
    }

    // Read the sheet data
    const rangeRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(targetSheet)}!A1:Z1000`,
      { headers: { 'Authorization': `Bearer ${accessToken}` } }
    );
    if (!rangeRes.ok) {
      const err = await rangeRes.text();
      return Response.json({ error: `Failed to read sheet "${targetSheet}": ${rangeRes.status} — ${err}` }, { status: 400 });
    }
    const rangeData = await rangeRes.json();
    const rows = rangeData.values || [];

    if (rows.length < 2) {
      return Response.json({ error: 'Sheet has no data rows (need at least a header row and one data row)' }, { status: 400 });
    }

    // First row = header (variable keys), remaining rows = data
    const headers = rows[0].map(h => h.trim());
    const dataRows = rows.slice(1).map((row, idx) => {
      const obj = {};
      headers.forEach((key, i) => {
        if (key) obj[key] = (row[i] || '').trim();
      });
      return { rowNumber: idx + 2, variables: obj };
    }).filter(r => Object.values(r.variables).some(v => v));

    if (action === 'read' || !templateId) {
      return Response.json({
        spreadsheetTitle: meta.properties?.title,
        sheets,
        selectedSheet: targetSheet,
        headers,
        rows: dataRows,
        totalRows: dataRows.length,
      });
    }

    // action === 'instantiate': batch instantiate templates from sheet rows
    const template = await base44.entities.SiteTemplate.get(templateId);
    if (!template) return Response.json({ error: 'Template not found' }, { status: 404 });

    const results = [];
    for (const row of dataRows) {
      try {
        const result = await instantiateFromTemplate(base44, { template, variables: row.variables });
        const project = await base44.entities.WebsiteProject.create({
          business_name: row.variables.business_name || row.variables.businessName || `Sheet Row ${row.rowNumber}`,
          business_website: row.variables.website || row.variables.business_website || '',
          industry: template.industry || 'General',
          status: 'generated',
          business_research: result.businessResearch,
          content: result.content,
          logo_url: result.logoUrl || '',
          hero_image_url: result.heroImageUrl || '',
          location: row.variables.location || row.variables.service_area || '',
        });
        results.push({ row: row.rowNumber, success: true, projectId: project.id, businessName: project.business_name });
      } catch (err) {
        results.push({ row: row.rowNumber, success: false, error: err.message });
      }
    }

    return Response.json({
      spreadsheetTitle: meta.properties?.title,
      selectedSheet: targetSheet,
      totalRows: dataRows.length,
      instantiated: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}