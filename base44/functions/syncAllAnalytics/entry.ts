import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Admin-only: iterates all deployed projects and syncs Search Console + GA4 data.
// Called by the ScheduledAnalyticsSync workflow.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { items: projects } = await base44.asServiceRole.entities.WebsiteProject.filter(
      { status: { $in: ['generated', 'preview_ready', 'approved'] } },
      { limit: 100, fields: ['id', 'business_name', 'deploy_url', 'business_website'] }
    );

    const results = [];
    // Process in batches of 6 for parallelism
    for (let i = 0; i < projects.length; i += 6) {
      const batch = projects.slice(i, i + 6);
      const batchResults = await Promise.allSettled(
        batch.map(async (proj) => {
          const siteUrl = proj.deploy_url || proj.business_website;
          if (!siteUrl) return { projectId: proj.id, name: proj.business_name, status: 'skipped', reason: 'no URL' };

          const scRes = await base44.functions.invoke('syncSearchConsole', { projectId: proj.id, siteUrl });
          return {
            projectId: proj.id,
            name: proj.business_name,
            status: 'synced',
            metrics: scRes.data?.metrics,
          };
        })
      );
      for (const r of batchResults) {
        if (r.status === 'fulfilled') results.push(r.value);
        else results.push({ status: 'failed', error: r.reason?.message || 'unknown' });
      }
    }

    return Response.json({
      total: projects.length,
      synced: results.filter(r => r.status === 'synced').length,
      skipped: results.filter(r => r.status === 'skipped').length,
      failed: results.filter(r => r.status === 'failed').length,
      results,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}