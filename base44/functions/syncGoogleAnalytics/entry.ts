import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Google Analytics 4 sync — retrieves traffic, acquisition, and conversion data.
// Requires google_analytics connector authorization.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { projectId, propertyId } = body;

    // Check if GA4 connector is authorized
    let connection;
    try {
      connection = await base44.asServiceRole.connectors.getConnection('google_analytics');
    } catch (e) {
      return Response.json({
        status: 'AUTH_REQUIRED',
        message: 'Google Analytics connector is not authorized. Authorize it in Integrations.',
        projectId
      });
    }

    if (!connection || !connection.accessToken) {
      return Response.json({
        status: 'AUTH_REQUIRED',
        message: 'Google Analytics connector is not authorized.',
        projectId
      });
    }

    if (!propertyId) {
      // List available properties
      const accountResponse = await fetch('https://analyticsadmin.googleapis.com/v1beta/accountSummaries', {
        headers: { 'Authorization': 'Bearer ' + connection.accessToken },
        signal: AbortSignal.timeout(15000)
      });

      if (!accountResponse.ok) {
        return Response.json({ status: 'ERROR', message: 'GA4 Admin API error: ' + accountResponse.status });
      }

      const accountData = await accountResponse.json();
      const properties = (accountData.accountSummaries || []).flatMap(a =>
        (a.propertySummaries || []).map(p => ({ name: p.property, displayName: p.displayName }))
      );

      return Response.json({
        status: 'CONNECTED',
        properties,
        message: 'Select a property to sync.'
      });
    }

    // Query GA4 Data API for traffic and conversions
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

    const dataResponse = await fetch('https://analyticsdata.googleapis.com/v1beta/' + propertyId + ':runReport', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + connection.accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'date' }, { name: 'sessionDefaultChannelGroup' }],
        metrics: [
          { name: 'sessions' }, { name: 'totalUsers' }, { name: 'screenPageViews' },
          { name: 'conversions' }, { name: 'totalRevenue' }
        ],
        orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }]
      }),
      signal: AbortSignal.timeout(15000)
    });

    if (!dataResponse.ok) {
      const errText = await dataResponse.text();
      return Response.json({ status: 'ERROR', message: 'GA4 Data API error: ' + dataResponse.status, details: errText });
    }

    const data = await dataResponse.json();
    const rows = data.rows || [];

    // Aggregate metrics
    const totalSessions = rows.reduce((s, r) => s + parseInt(r.metricValues[0]?.value || 0), 0);
    const totalUsers = rows.reduce((s, r) => s + parseInt(r.metricValues[1]?.value || 0), 0);
    const totalPageViews = rows.reduce((s, r) => s + parseInt(r.metricValues[2]?.value || 0), 0);
    const totalConversions = rows.reduce((s, r) => s + parseInt(r.metricValues[3]?.value || 0), 0);
    const totalRevenue = rows.reduce((s, r) => s + parseFloat(r.metricValues[4]?.value || 0), 0);

    // Update measurement binding
    if (projectId) {
      const { items } = await base44.entities.MeasurementBinding.filter({ project_id: projectId }, { limit: 1 });
      const bindingData = {
        ga4_property_id: propertyId,
        status: 'healthy',
        last_sync: new Date().toISOString(),
        sync_receipt: {
          source: 'google_analytics',
          sessions: totalSessions, users: totalUsers, pageViews: totalPageViews,
          conversions: totalConversions, revenue: totalRevenue,
          synced_at: new Date().toISOString()
        }
      };
      if (items && items.length > 0) {
        await base44.entities.MeasurementBinding.update(items[0].id, bindingData);
      } else {
        await base44.entities.MeasurementBinding.create({ project_id: projectId, ...bindingData });
      }
    }

    return Response.json({
      status: 'HEALTHY',
      propertyId,
      metrics: {
        sessions: totalSessions,
        users: totalUsers,
        pageViews: totalPageViews,
        conversions: totalConversions,
        revenue: totalRevenue
      },
      dailyData: rows.map(r => ({
        date: r.dimensionValues[0]?.value,
        channel: r.dimensionValues[1]?.value,
        sessions: parseInt(r.metricValues[0]?.value || 0)
      })),
      syncedAt: new Date().toISOString()
    });
  } catch (error) {
    return Response.json({ error: error.message, status: 'ERROR' }, { status: 500 });
  }
}