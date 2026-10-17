import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// List available high-performer blueprints for selection when starting new factory builds.
// Filters by industry (optional) and sorts by quality score so the best structures surface first.

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const url = new URL(req.url);
    const industry = url.searchParams.get('industry') || '';
    const subIndustry = url.searchParams.get('sub_industry') || '';
    const websiteType = url.searchParams.get('website_type') || '';
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);

    const query: any = { blueprint_status: 'high_performer' };
    if (industry) query.industry = industry;
    if (subIndustry) query.sub_industry = subIndustry;
    if (websiteType) query.website_type = websiteType;

    const result = await base44.entities.SiteTemplate.filter(query, {
      sort: '-quality_score',
      limit: Math.min(limit, 100),
      fields: ['name', 'industry', 'sub_industry', 'website_type', 'quality_score', 'parity_score', 'performance_metrics', 'source_deploy_url', 'usage_count', 'variables', 'visual_pack'],
    });

    const blueprints = (result as any).items || result || [];

    return Response.json({
      blueprints,
      count: Array.isArray(blueprints) ? blueprints.length : 0,
      filters: { industry, sub_industry: subIndustry, website_type: websiteType },
    });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}