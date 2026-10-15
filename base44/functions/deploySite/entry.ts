import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';
import { renderSiteHtml, slugify } from '../../shared/siteRenderer.js';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const projectId = body.projectId;
    if (!projectId) return Response.json({ error: 'projectId is required' }, { status: 400 });

    const project = await base44.entities.WebsiteProject.get(projectId);
    if (!project) return Response.json({ error: 'Project not found' }, { status: 404 });
    if (!project.content) return Response.json({ error: 'Project has no generated content to deploy' }, { status: 400 });

    const token = secrets.get('VERCEL_TOKEN');
    if (!token) return Response.json({ error: 'Vercel token not configured. Set VERCEL_TOKEN in dashboard -> Secrets.' }, { status: 500 });
    const teamId = secrets.get('VERCEL_TEAM_ID');

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
      return Response.json({ error: 'Vercel deploy failed: ' + ((data && data.error && data.error.message) || vercelRes.status), vercel: data }, { status: 502 });
    }

    const deployUrl = data.url ? 'https://' + data.url : '';
    const deployId = data.id || '';

    await base44.entities.WebsiteProject.update(projectId, {
      deploy_url: deployUrl,
      deploy_id: deployId
    });

    return Response.json({ url: deployUrl, id: deployId, projectId: projectId });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}