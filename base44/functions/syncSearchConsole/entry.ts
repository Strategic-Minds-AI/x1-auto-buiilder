import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Google Search Console sync — retrieves daily metrics, top queries, and top pages.
// Returns data in the shape PerformanceDashboard expects (dailyMetrics, topQueries, topPages).
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { projectId, propertyUrl, siteUrl } = body;

    let connection;
    try {
      connection = await base44.asServiceRole.connectors.getConnection('google_search_console');
    } catch (e) {
      return Response.json({ status: 'AUTH_REQUIRED', message: 'Google Search Console connector is not authorized.' });
    }
    if (!connection || !connection.accessToken) {
      return Response.json({ status: 'AUTH_REQUIRED', message: 'Google Search Console connector is not authorized.' });
    }

    let url = siteUrl || propertyUrl;
    if (!url && projectId) {
      const proj = await base44.entities.WebsiteProject.get(projectId);
      url = proj?.deploy_url || proj?.business_website || '';
    }
    if (!url) {
      return Response.json({ status: 'NOT_CONFIGURED', message: 'No site URL configured for this project.' });
    }

    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 28 * 86400000).toISOString().split('T')[0];
    const authHeader = { 'Authorization': 'Bearer ' + connection.accessToken, 'Content-Type': 'application/json' };
    const apiUrl = 'https://searchconsole.googleapis.com/webmasters/v3/sites/' + encodeURIComponent(url) + '/searchAnalytics/query';

    // Run 3 queries in parallel: daily, by query, by page
    const [dailyRes, queryRes, pageRes] = await Promise.allSettled([
      fetch(apiUrl, {
        method: 'POST', headers: authHeader,
        body: JSON.stringify({ startDate, endDate, dimensions: ['date'], rowLimit: 1000 }),
        signal: AbortSignal.timeout(15000)
      }),
      fetch(apiUrl, {
        method: 'POST', headers: authHeader,
        body: JSON.stringify({ startDate, endDate, dimensions: ['query'], rowLimit: 100 }),
        signal: AbortSignal.timeout(15000)
      }),
      fetch(apiUrl, {
        method: 'POST', headers: authHeader,
        body: JSON.stringify({ startDate, endDate, dimensions: ['page'], rowLimit: 100 }),
        signal: AbortSignal.timeout(15000)
      }),
    ]);

    // Process daily metrics
    const dailyMetrics = [];
    if (dailyRes.status === 'fulfilled' && dailyRes.value.ok) {
      const data = await dailyRes.value.json();
      for (const r of (data.rows || [])) {
        dailyMetrics.push({
          date: r.keys[0],
          clicks: r.clicks || 0,
          impressions: r.impressions || 0,
          ctr: r.ctr || 0,
          position: r.position || 0,
        });
      }
    }

    // Process top queries
    const topQueries = [];
    if (queryRes.status === 'fulfilled' && queryRes.value.ok) {
      const data = await queryRes.value.json();
      for (const r of (data.rows || [])) {
        topQueries.push({
          query: r.keys[0],
          clicks: r.clicks || 0,
          impressions: r.impressions || 0,
          ctr: r.ctr || 0,
          position: r.position || 0,
        });
      }
    }

    // Process top pages
    const topPages = [];
    if (pageRes.status === 'fulfilled' && pageRes.value.ok) {
      const data = await pageRes.value.json();
      for (const r of (data.rows || [])) {
        topPages.push({
          page: r.keys[0],
          clicks: r.clicks || 0,
          impressions: r.impressions || 0,
          ctr: r.ctr || 0,
          position: r.position || 0,
        });
      }
    }

    // Aggregate
    const totalClicks = dailyMetrics.reduce((s, d) => s + d.clicks, 0);
    const totalImpressions = dailyMetrics.reduce((s, d) => s + d.impressions, 0);
    const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) : 0;
    const avgPosition = topQueries.length > 0 ? (topQueries.reduce((s, q) => s + q.position, 0) / topQueries.length) : 0;

    // Update measurement binding
    if (projectId) {
      const { items } = await base44.entities.MeasurementBinding.filter({ project_id: projectId }, { limit: 1 });
      const bindingData = {
        search_console_property: url,
        status: 'healthy',
        last_sync: new Date().toISOString(),
        sync_receipt: { source: 'google_search_console', clicks: totalClicks, impressions: totalImpressions, ctr: avgCtr, position: avgPosition, synced_at: new Date().toISOString() }
      };
      if (items && items.length > 0) {
        await base44.entities.MeasurementBinding.update(items[0].id, bindingData);
      } else {
        await base44.entities.MeasurementBinding.create({ project_id: projectId, ...bindingData });
      }
    }

    return Response.json({
      status: 'HEALTHY',
      siteUrl: url,
      metrics: { impressions: totalImpressions, clicks: totalClicks, ctr: avgCtr, avgPosition },
      dailyMetrics,
      topQueries,
      topPages,
      syncedAt: new Date().toISOString()
    });
  } catch (error) {
    return Response.json({ error: error.message, status: 'ERROR' }, { status: 500 });
  }
}