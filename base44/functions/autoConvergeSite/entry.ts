import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';
import { evaluateCompliance, autoFixContent, seedStandards } from '../../shared/compliance.js';
import { renderSiteHtml, slugify } from '../../shared/siteRenderer.js';

const MAX_ROUNDS = 3;
const TARGET_SCORE = 90;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { projectId } = await req.json();
    if (!projectId) return Response.json({ error: 'projectId is required' }, { status: 400 });

    const project = await base44.entities.WebsiteProject.get(projectId);
    if (!project) return Response.json({ error: 'Project not found' }, { status: 404 });
    if (!project.content) return Response.json({ error: 'Project has no content to converge' }, { status: 400 });

    await seedStandards(base44);

    const convergenceLog = [];
    let currentProject = project;
    let currentScore = 0;
    let round = 0;

    // Auto-convergence loop: check -> fix -> re-check until target score or max rounds
    while (round < MAX_ROUNDS) {
      round++;
      const evalResult = await evaluateCompliance(base44, currentProject);
      currentScore = evalResult.overall_score;
      const failingCount = (evalResult.checks || []).filter(function(c) { return c.status !== 'pass'; }).length;

      convergenceLog.push({
        round: round,
        action: 'check',
        score: currentScore,
        category_scores: evalResult.category_scores,
        failing: failingCount
      });

      await base44.entities.ComplianceReport.create({
        project_id: projectId,
        overall_score: currentScore,
        category_scores: evalResult.category_scores,
        checks: evalResult.checks,
        recommendations: evalResult.recommendations,
        status: currentScore >= TARGET_SCORE ? 'fixed' : 'scored',
        round: round
      });

      if (currentScore >= TARGET_SCORE) break;

      // Auto-fix the content
      const fixedContent = await autoFixContent(base44, currentProject, {
        checks: evalResult.checks,
        recommendations: evalResult.recommendations
      });
      await base44.entities.WebsiteProject.update(projectId, { content: fixedContent });
      currentProject = await base44.entities.WebsiteProject.get(projectId);

      convergenceLog.push({
        round: round,
        action: 'fix',
        applied: failingCount
      });
    }

    // Deploy to Vercel with sitemap and robots
    const token = secrets.get('VERCEL_TOKEN');
    let deployResult = null;
    if (token) {
      const teamId = secrets.get('VERCEL_TEAM_ID');
      const html = renderSiteHtml(currentProject);
      const name = slugify(currentProject.business_name || currentProject.industry || 'site') + '-' + String(currentProject.id).slice(0, 6);
      const sitemapXml = generateSitemap(currentProject);
      const robotsTxt = generateRobots(currentProject);

      const endpoint = 'https://api.vercel.com/v13/deployments' + (teamId ? '?teamId=' + encodeURIComponent(teamId) : '');
      const vercelRes = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          files: [
            { file: 'index.html', data: html },
            { file: 'sitemap.xml', data: sitemapXml },
            { file: 'robots.txt', data: robotsTxt }
          ],
          projectSettings: { framework: null },
          target: 'production'
        }),
        signal: AbortSignal.timeout(60000)
      });
      const data = await vercelRes.json();
      if (vercelRes.ok) {
        deployResult = { url: data.url ? 'https://' + data.url : '', id: data.id || '' };
        await base44.entities.WebsiteProject.update(projectId, {
          deploy_url: deployResult.url,
          deploy_id: deployResult.id,
          status: 'approved'
        });
      } else {
        deployResult = { error: 'Vercel deploy failed: ' + ((data && data.error && data.error.message) || vercelRes.status) };
      }
    }

    return Response.json({
      projectId: projectId,
      converged: currentScore >= TARGET_SCORE,
      finalScore: currentScore,
      rounds: round,
      convergenceLog: convergenceLog,
      deploy: deployResult
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

function generateSitemap(project) {
  const url = project.deploy_url || 'https://example.com';
  const lastmod = new Date().toISOString();
  return '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    '  <url>\n    <loc>' + url + '</loc>\n    <lastmod>' + lastmod + '</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n' +
    '</urlset>';
}

function generateRobots(project) {
  const url = project.deploy_url || 'https://example.com';
  return 'User-agent: *\nAllow: /\nSitemap: ' + url + '/sitemap.xml';
}