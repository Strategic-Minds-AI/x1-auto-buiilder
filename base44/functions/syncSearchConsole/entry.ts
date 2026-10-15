import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Google Search Console sync — retrieves search performance data for connected properties.
// Requires google_search_console connector authorization.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { projectId, propertyUrl } = body;

    // Check if Search Console connector is authorized
    let connection;
    try {
      connection = await base44.asServiceRole.connectors.getConnection('google_search_console');
    } catch (e) {
      return Response.json({
        status: 'AUTH_REQUIRED',
        message: 'Google Search Console connector is not authorized. Authorize it in Integrations.',
        projectId
      });
    }

    if (!connection || !connection.accessToken) {
      return Response.json({
        status: 'AUTH_REQUIRED',
        message: 'Google Search Console connector is not authorized.',
        projectId
      });
    }

    // Query Search Console API for search performance
    let siteUrl = propertyUrl;
    if (!siteUrl && projectId) {
      const proj = await base44.entities.WebsiteProject.get(projectId);
      siteUrl = proj?.deploy_url || proj?.business_website || '';
    }
    if (!siteUrl) {
      return Response.json({ status: 'NOT_CONFIGURED', message: 'No site URL configured for this project.' });
    }

    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 28 * 86400000).toISOString().split('T')[0];

    const scResponse = await fetch('https://searchconsole.googleapis.com/webmasters/v3/sites/' + encodeURIComponent(siteUrl) + '/searchAnalytics/query', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + connection.accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: ['query'],
        rowLimit: 100
      }),
      signal: AbortSignal.timeout(15000)
    });

    if (!scResponse.ok) {
      const errText = await scResponse.text();
      return Response.json({
        status: 'ERROR',
        message: 'Search Console API error: ' + scResponse.status,
        details: errText
      });
    }

    const scData = await scResponse.json();
    const rows = scData.rows || [];

    // Aggregate metrics
    const totalImpressions = rows.reduce((s, r) => s + (r.impressions || 0), 0);
    const totalClicks = rows.reduce((s, r) => s + (r.clicks || 0), 0);
    const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions * 100).toFixed(2) : 0;
    const avgPosition = rows.length > 0 ? (rows.reduce((s, r) => s + (r.position || 0), 0) / rows.length).toFixed(1) : 0;

    // Update or create measurement binding
    if (projectId) {
      const { items } = await base44.entities.MeasurementBinding.filter({ project_id: projectId }, { limit: 1 });
      if (items && items.length > 0) {
        await base44.entities.MeasurementBinding.update(items[0].id, {
          search_console_property: siteUrl,
          status: 'healthy',
          last_sync: new Date().toISOString(),
          sync_receipt: { source: 'google_search_console', impressions: totalImpressions, clicks: totalClicks, ctr: avgCtr, position: avgPosition, synced_at: new Date().toISOString() }
        });
      } else {
        await base44.entities.MeasurementBinding.create({
          project_id: projectId,
          search_console_property: siteUrl,
          status: 'healthy',
          last_sync: new Date().toISOString(),
          sync_receipt: { source: 'google_search_console', impressions: totalImpressions, clicks: totalClicks, ctr: avgCtr, position: avgPosition }
        });
      }
    }

    return Response.json({
      status: 'HEALTHY',
      siteUrl,
      metrics: {
        impressions: totalImpressions,
        clicks: totalClicks,
        ctr: parseFloat(avgCtr),
        avgPosition: parseFloat(avgPosition)
      },
      topQueries: rows.slice(0, 20).map(r => ({ query: r.keys[0], clicks: r.clicks, impressions: r.impressions, ctr: (r.ctr * 100).toFixed(2), position: r.position.toFixed(1) })),
      syncedAt: new Date().toISOString()
    });
  } catch (error) {
    return Response.json({ error: error.message, status: 'ERROR' }, { status: 500 });
  }
}