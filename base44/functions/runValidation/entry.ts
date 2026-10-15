import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Quality scoring and independent validation — runs functional, visual, security,
// and accessibility checks against a project and creates a ValidationReceipt.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { projectId, validationTypes } = body;
    if (!projectId) return Response.json({ error: 'projectId is required' }, { status: 400 });

    const project = await base44.entities.WebsiteProject.get(projectId);
    if (!project) return Response.json({ error: 'Project not found' }, { status: 404 });

    const types = validationTypes || ['functional', 'visual', 'security', 'accessibility'];
    const receipts = [];

    for (const type of types) {
      let result = 'unknown';
      let score = 0;
      let findings = [];
      let recommendations = [];

      if (type === 'functional') {
        // Run compliance check as functional validation
        try {
          const complianceRes = await base44.functions.invoke('runComplianceCheck', { projectId });
          const report = complianceRes.data;
          score = report?.overall_score || 0;
          result = score >= 80 ? 'pass' : score >= 50 ? 'unknown' : 'fail';
          findings = (report?.checks || []).filter(c => c.status === 'fail').map(c => c.requirement);
          recommendations = report?.recommendations || [];
        } catch (e) {
          result = 'blocked';
          findings = ['Compliance check failed: ' + e.message];
        }
      } else if (type === 'visual') {
        // Visual quality check via LLM
        try {
          const visualResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
            model: 'claude-sonnet-5',
            prompt:
              'You are a visual quality evaluator. Score this website content blueprint on a 0-100 scale for visual excellence. ' +
              'Evaluate: design coherence, typography hierarchy, color harmony, spacing rhythm, imagery direction, and conversion design. ' +
              'Return a score and list of findings.\n\n' +
              'BUSINESS: ' + (project.business_name || '') + '\n' +
              'CONTENT: ' + JSON.stringify(project.content || {}).slice(0, 3000),
            response_json_schema: {
              type: 'object',
              properties: {
                score: { type: 'number' },
                findings: { type: 'array', items: { type: 'string' } },
                recommendations: { type: 'array', items: { type: 'string' } }
              }
            }
          });
          score = visualResult.score || 0;
          // Blueprint-only AI opinion cannot certify pixel parity or real images.
          result = 'unknown';
          findings = [...(visualResult.findings || []), 'Blueprint assessment only; real browser screenshot parity is unmeasured'];
          recommendations = visualResult.recommendations || [];
        } catch (e) {
          result = 'blocked';
          findings = ['Visual check failed: ' + e.message];
        }
      } else if (type === 'security') {
        // Security check — verify no sensitive data exposure, proper auth
        const content = JSON.stringify(project.content || {});
        const securityIssues = [];
        if (content.includes('password') || content.includes('secret') || content.includes('api_key')) {
          securityIssues.push('Potential sensitive data in content');
        }
        if (!project.deploy_url) {
          securityIssues.push('No deployment — preview not provisioned');
        }
        score = securityIssues.length === 0 ? 90 : Math.max(0, 90 - securityIssues.length * 20);
        // Word-scanning content is not authentication, tenancy, CSP or API security.
        result = securityIssues.length === 0 ? 'unknown' : 'fail';
        findings = securityIssues.length > 0 ? securityIssues : ['No security issues found'];
      } else if (type === 'accessibility') {
        // Accessibility check via LLM
        try {
          const a11yResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
            model: 'claude-sonnet-5',
            prompt:
              'You are an accessibility evaluator (WCAG 2.1). Score this website content blueprint 0-100 for accessibility. ' +
              'Check: semantic structure, alt text plans, color contrast considerations, keyboard navigation, form labels, and ARIA usage. ' +
              'Return a score and findings.\n\nCONTENT: ' + JSON.stringify(project.content || {}).slice(0, 2000),
            response_json_schema: {
              type: 'object',
              properties: {
                score: { type: 'number' },
                findings: { type: 'array', items: { type: 'string' } },
                recommendations: { type: 'array', items: { type: 'string' } }
              }
            }
          });
          score = a11yResult.score || 0;
          // LLM content critique is not a WCAG browser/assistive-tech audit.
          result = 'unknown';
          findings = [...(a11yResult.findings || []), 'Real DOM, contrast and keyboard audit required'];
          recommendations = a11yResult.recommendations || [];
        } catch (e) {
          result = 'blocked';
          findings = ['Accessibility check failed: ' + e.message];
        }
      }

      const receipt = await base44.entities.ValidationReceipt.create({
        project_id: projectId,
        validation_type: type,
        result,
        score,
        findings,
        recommendations,
        details: { evaluatedAt: new Date().toISOString() }
      });
      receipts.push(receipt);
    }

    // Calculate overall quality score
    const avgScore = receipts.length > 0
      ? Math.round(receipts.reduce((s, r) => s + (r.score || 0), 0) / receipts.length)
      : 0;
    const allPassed = receipts.every(r => r.result === 'pass');

    return Response.json({
      projectId,
      overallScore: avgScore,
      allPassed,
      receipts: receipts.map(r => ({
        id: r.id,
        type: r.validation_type,
        result: r.result,
        score: r.score,
        findings: r.findings
      })),
      message: allPassed
        ? 'All validations passed. Overall score: ' + avgScore + '/100'
        : 'Validation complete. Overall score: ' + avgScore + '/100. Some checks need attention.'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}