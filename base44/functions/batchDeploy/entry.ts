import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';
import { renderSiteHtml, slugify } from '../../shared/siteRenderer.js';

async function deployOne(project, token, teamId) {
  const html = renderSiteHtml(project);
  const name = slugify(project.business_name || project.industry || 'site') + '-' + String(project.id).slice(0, 6);
  const endpoint = 'https://api.vercel.com/v13/deployments' + (teamId ? '?teamId=' + encodeURIComponent(teamId) : '');
  const vercelRes = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: name,
      files: [{ file: 'index.html', data: html }],
      projectSettings: { framework: null },
      target: 'production'
    }),
    signal: AbortSignal.timeout(60000)
  });
  const data = await vercelRes.json();
  if (!vercelRes.ok) {
    return { projectId: project.id, status: 'error', error: 'Vercel deploy failed: ' + ((data && data.error && data.error.message) || vercelRes.status) };
  }
  return { projectId: project.id, status: 'success', url: data.url ? 'https://' + data.url : '', deployId: data.id || '' };
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { projectIds } = await req.json();
    if (!Array.isArray(projectIds) || projectIds.length === 0) {
      return Response.json({ error: 'projectIds array is required' }, { status: 400 });
    }

    const token = secrets.get('VERCEL_TOKEN');
    if (!token) return Response.json({ error: 'Vercel token not configured. Set VERCEL_TOKEN in dashboard -> Secrets.' }, { status: 500 });
    const teamId = secrets.get('VERCEL_TEAM_ID');

    // Load all projects in one query
    const page = await base44.entities.WebsiteProject.filter({ id: { $in: projectIds } }, { limit: projectIds.length });
    const projects = page.items || [];

    // Deploy in batches of 4 to respect connection limits
    const results = [];
    for (let i = 0; i < projects.length; i += 4) {
      const batch = projects.slice(i, i + 4);
      const batchResults = await Promise.allSettled(
        batch.map(function (p) { return deployOne(p, token, teamId); })
      );
      for (let j = 0; j < batchResults.length; j++) {
        const r = batchResults[j];
        const res = r.status === 'fulfilled' ? r.value : { projectId: batch[j].id, status: 'error', error: String(r.reason && r.reason.message || r.reason) };
        results.push(res);
        // Update the project with deploy URL on success
        if (res.status === 'success' && res.url) {
          try {
            await base44.entities.WebsiteProject.update(res.projectId, { deploy_url: res.url, deploy_id: res.deployId, status: 'approved' });
          } catch (_) {}
        }
      }
    }

    const succeeded = results.filter(function (r) { return r.status === 'success'; });
    const failed = results.filter(function (r) { return r.status === 'error'; });

    return Response.json({
      total: results.length,
      succeeded: succeeded.length,
      failed: failed.length,
      results: results
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}