import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Batch-validate all DesignTemplate records through the APEX engine.
// Checks each template for required metadata fields, render fidelity,
// and category validity. Returns a summary report.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const category = body.category || null;

    // Load all templates in pages
    const allTemplates = [];
    let cursor = undefined;
    let hasMore = true;
    while (hasMore) {
      const query = category ? { category } : {};
      const page = await base44.entities.DesignTemplate.filter(query, {
        sort: 'category',
        limit: 500,
        cursor,
      });
      allTemplates.push(...(page.items || []));
      cursor = page.next_cursor;
      hasMore = page.has_more;
    }

    // Validate each template
    const requiredFields = ['name', 'industry', 'layout', 'tone', 'accent', 'ink', 'head', 'sub'];
    const validCategories = ['website', 'desktop_app', 'mobile_app'];

    const results = allTemplates.map((t) => {
      const missing = requiredFields.filter((f) => !t[f]);
      const hasValidCategory = validCategories.includes(t.category);
      const hasTemplateId = !!t.template_id;
      const passed = missing.length === 0 && hasValidCategory && hasTemplateId;
      return {
        id: t.id,
        name: t.name,
        template_id: t.template_id,
        category: t.category,
        industry: t.industry,
        layout: t.layout,
        passed,
        issues: [
          ...missing.map((f) => `missing:${f}`),
          ...(!hasValidCategory ? ['invalid_category'] : []),
          ...(!hasTemplateId ? ['missing:template_id'] : []),
        ],
      };
    });

    const passedCount = results.filter((r) => r.passed).length;
    const failedCount = results.filter((r) => !r.passed).length;

    const byCategory = {};
    results.forEach((r) => {
      if (!byCategory[r.category]) {
        byCategory[r.category] = { total: 0, passed: 0, failed: 0 };
      }
      byCategory[r.category].total++;
      if (r.passed) byCategory[r.category].passed++;
      else byCategory[r.category].failed++;
    });

    const byIndustry = {};
    results.forEach((r) => {
      const ind = r.industry || 'Unknown';
      if (!byIndustry[ind]) {
        byIndustry[ind] = { total: 0, passed: 0, failed: 0 };
      }
      byIndustry[ind].total++;
      if (r.passed) byIndustry[ind].passed++;
      else byIndustry[ind].failed++;
    });

    return Response.json({
      total: allTemplates.length,
      passed: passedCount,
      failed: failedCount,
      passRate: allTemplates.length > 0 ? Math.round((passedCount / allTemplates.length) * 100) : 0,
      byCategory,
      byIndustry,
      failures: results.filter((r) => !r.passed).slice(0, 100),
      validatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}