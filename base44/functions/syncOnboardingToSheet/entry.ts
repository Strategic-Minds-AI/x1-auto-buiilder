import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';

// Sync onboarding research data to a Google Sheet (centralized record of skip-traced data)
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { projectId, businessName, industry, businessWebsite, location, businessResearch, benchmark, content } = body;

    const sheetId = secrets.get('GOOGLE_SHEET_ID');
    if (!sheetId) {
      return Response.json({ error: 'GOOGLE_SHEET_ID secret not set. Create a Google Sheet and set its ID in Secrets.' }, { status: 500 });
    }

    // Get Google Sheets connector connection
    let connection;
    try {
      connection = await base44.asServiceRole.connectors.getConnection('googlesheets');
    } catch (e) {
      return Response.json({ error: 'Google Sheets connector not authorized. Authorize it in Integrations.' }, { status: 500 });
    }

    if (!connection || !connection.accessToken) {
      return Response.json({ error: 'Google Sheets connector has no access token.' }, { status: 500 });
    }

    // Build the row data from research
    const timestamp = new Date().toISOString();
    const services = businessResearch?.services ? JSON.stringify(businessResearch.services) : '';
    const competitors = benchmark?.sites ? JSON.stringify(benchmark.sites.slice(0, 5).map(s => s.name || s.url)) : '';
    const researchData = businessResearch ? JSON.stringify(businessResearch).substring(0, 5000) : '';

    const rowValues = [[
      timestamp,
      projectId || '',
      businessName || businessResearch?.businessName || '',
      industry || '',
      businessWebsite || '',
      location || '',
      services,
      competitors,
      businessResearch?.phone || '',
      businessResearch?.email || '',
      businessResearch?.address || '',
      businessResearch?.description || '',
      researchData,
    ]];

    // Append to the sheet (Sheet1, starting at A1)
    const range = 'Sheet1!A:M';
    const sheetsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;

    const sheetsRes = await fetch(sheetsUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${connection.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: rowValues }),
      signal: AbortSignal.timeout(15000),
    });

    if (!sheetsRes.ok) {
      const errText = await sheetsRes.text();
      return Response.json({
        error: 'Google Sheets API error: ' + sheetsRes.status,
        details: errText,
      }, { status: sheetsRes.status });
    }

    const sheetsData = await sheetsRes.json();

    return Response.json({
      success: true,
      updatedRange: sheetsData.updates?.updatedRange,
      updatedRows: sheetsData.updates?.updatedRows,
      syncedAt: timestamp,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}