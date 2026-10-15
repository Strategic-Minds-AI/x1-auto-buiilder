import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { GITHUB_SCAN_TOPICS } from '../../shared/freeLibrary.js';

// Scrape GitHub trending repos for passive intelligence ingest
// Runs daily via workflow, or manually from the Integration Hub
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const maxPerTopic = Math.min(body.maxPerTopic || 5, 10);
    const topics = body.topics || GITHUB_SCAN_TOPICS;

    const allRepos = [];
    const errors = [];

    // Use the authorized GitHub connector for authenticated API access
    const authHeaders = { Accept: 'application/vnd.github.v3+json', 'User-Agent': 'DigitalDominanceFactory/1.0' };
    try {
      const conn = await base44.asServiceRole.connectors.getConnection('github');
      if (conn?.accessToken) authHeaders['Authorization'] = `Bearer ${conn.accessToken}`;
    } catch {}

    // Scan each topic individually — GitHub search API, 1 request per topic (30/min limit)
    for (const topic of topics) {
      try {
        const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(topic.query)}+stars:>100&sort=stars&order=desc&per_page=${maxPerTopic}`;
        const res = await fetch(url, {
          headers: authHeaders,
          signal: AbortSignal.timeout(15000),
        });
        if (!res.ok) {
          const errText = await res.text().catch(() => '');
          errors.push({ topic: topic.query, error: `GitHub API ${res.status}: ${errText.slice(0, 150)}` });
          continue;
        }
        const data = await res.json();
        for (const repo of (data.items || []).slice(0, maxPerTopic)) {
          allRepos.push({
            repo_id: repo.id,
            full_name: repo.full_name,
            name: repo.name,
            description: repo.description || '',
            url: repo.html_url,
            html_url: repo.html_url,
            stars: repo.stargazers_count || 0,
            forks: repo.forks_count || 0,
            language: repo.language || '',
            topics: repo.topics || [],
            license: repo.license?.spdx_id || '',
            is_template: repo.is_template || false,
            is_free: true,
            category: topic.category,
            relevance_tags: topic.tags,
            scanned_at: new Date().toISOString(),
            intelligence_score: Math.min(100, Math.round((repo.stargazers_count || 0) / 100)),
          });
        }
      } catch (err) {
        errors.push({ topic: topic.query, error: err.message });
      }
    }

    // Generate AI summaries for top repos using InvokeLLM
    const topRepos = allRepos.filter(r => r.stars > 50).slice(0, 20);
    if (topRepos.length > 0) {
      try {
        const llmResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `Summarize these GitHub repositories for a website/app generation platform. For each repo, provide a 1-sentence summary of what it does and how it could be used. Return JSON array: [{"full_name": "...", "readme_summary": "...", "install_instructions": "..."}]\n\nRepos:\n${JSON.stringify(topRepos.map(r => ({ full_name: r.full_name, description: r.description, language: r.language, topics: r.relevance_tags })), null, 2)}`,
          response_json_schema: {
            type: 'object',
            properties: {
              summaries: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    full_name: { type: 'string' },
                    readme_summary: { type: 'string' },
                    install_instructions: { type: 'string' },
                  },
                },
              },
            },
          },
        });
        const summaries = (llmResult as any)?.summaries || [];
        for (const sum of summaries) {
          const repo = allRepos.find(r => r.full_name === sum.full_name);
          if (repo) {
            repo.readme_summary = sum.readme_summary;
            repo.install_instructions = sum.install_instructions;
          }
        }
      } catch {}
    }

    // Upsert repos — avoid duplicates by full_name
    if (allRepos.length > 0) {
      await base44.asServiceRole.entities.GitHubRepo.upsert(allRepos, { key: 'full_name' });
    }

    // Count total repos in database
    const totalRepos = await base44.asServiceRole.entities.GitHubRepo.count({});

    return Response.json({
      success: true,
      scanned: allRepos.length,
      topics_scanned: topics.length,
      errors: errors.length > 0 ? errors.slice(0, 5) : undefined,
      total_in_database: totalRepos,
      scanned_at: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}