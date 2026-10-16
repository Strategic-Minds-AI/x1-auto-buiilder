import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Validator Agent — the final quality gate that judges how Google AND humans will perceive a website.
// Runs after the QA Agent has fixed everything and the site is deploy-ready.
// Returns a PASS / CONDITIONAL_PASS / FAIL verdict with detailed scores on both dimensions.

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin required' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const { projectId, content: directContent } = body;

    let content: any = directContent || null;
    let industry = 'general';
    let businessName = 'this business';

    if (projectId) {
      const project = await base44.entities.WebsiteProject.get(projectId);
      if (!project) return Response.json({ error: 'Project not found' }, { status: 404 });
      content = project.content;
      industry = project.industry || 'general';
      businessName = project.business_name || 'this business';
    } else if (!content) {
      return Response.json({ error: 'Provide projectId or content' }, { status: 400 });
    }

    if (!content) return Response.json({ error: 'No content to validate' }, { status: 400 });

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      model: 'claude-sonnet-5',
      prompt: buildValidatorPrompt(content, industry, businessName),
      response_json_schema: {
        type: 'object',
        properties: {
          verdict: { type: 'string', enum: ['pass', 'conditional_pass', 'fail'] },
          google_score: { type: 'number', description: '0-100 — how Google will judge this site' },
          human_score: { type: 'number', description: '0-100 — how humans will judge this site' },
          overall_score: { type: 'number', description: '0-100 weighted overall' },
          google_assessment: {
            type: 'object',
            properties: {
              eeat_score: { type: 'number', description: '0-100 Experience, Expertise, Authoritativeness, Trustworthiness' },
              helpful_content_score: { type: 'number', description: '0-100 people-first content quality' },
              seo_score: { type: 'number', description: '0-100 technical SEO readiness' },
              spam_risk: { type: 'string', enum: ['none', 'low', 'medium', 'high'] },
              notes: { type: 'string' },
            },
            required: ['eeat_score', 'helpful_content_score', 'seo_score', 'spam_risk', 'notes'],
          },
          human_assessment: {
            type: 'object',
            properties: {
              trust_score: { type: 'number', description: '0-100 does it build trust in 3 seconds' },
              clarity_score: { type: 'number', description: '0-100 is the value prop instantly clear' },
              persuasion_score: { type: 'number', description: '0-100 does it motivate action' },
              conversion_score: { type: 'number', description: '0-100 is there a clear frictionless path to contact/buy' },
              notes: { type: 'string' },
            },
            required: ['trust_score', 'clarity_score', 'persuasion_score', 'conversion_score', 'notes'],
          },
          critical_issues: { type: 'array', items: { type: 'string' } },
          recommendations: { type: 'array', items: { type: 'string' } },
          summary: { type: 'string' },
        },
        required: ['verdict', 'google_score', 'human_score', 'overall_score', 'google_assessment', 'human_assessment', 'critical_issues', 'recommendations', 'summary'],
      },
    });

    return Response.json({
      agent: 'validator_agent',
      project_id: projectId || null,
      verdict: result.verdict,
      google_score: result.google_score,
      human_score: result.human_score,
      overall_score: result.overall_score,
      google_assessment: result.google_assessment,
      human_assessment: result.human_assessment,
      critical_issues: result.critical_issues || [],
      recommendations: result.recommendations || [],
      summary: result.summary,
    });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

function buildValidatorPrompt(content: any, industry: string, businessName: string): string {
  return `You are the Validator Agent — the FINAL quality gate before a website goes live. You judge how Google AND humans will perceive this website. Be rigorous, honest, and specific. Do not inflate scores.

Website: ${businessName}
Industry: ${industry}

CONTENT TO VALIDATE:
${JSON.stringify(content, null, 1)}

JUDGE ON TWO DIMENSIONS:

═══ A. GOOGLE'S JUDGMENT ═══
(How Google's algorithms and Search Quality Raters will evaluate this site)

1. E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness):
   - Does the content demonstrate first-hand experience?
   - Is there evidence of expertise (specific details, not generic)?
   - Does it establish authority in the industry?
   - Is it trustworthy (accurate, transparent, no misleading claims)?

2. Helpful Content:
   - Does it satisfy the visitor's search intent?
   - Is it people-first (written for humans, not search engines)?
   - Does it provide original value, not just rephrasing what competitors say?
   - Would a visitor leave satisfied or bounce?

3. Quality Rater Guidelines:
   - YMYL (Your Money Your Life) considerations if applicable
   - Reputation and accuracy of claims
   - No deceptive practices

4. SEO Fundamentals:
   - Title tag readiness (hero headline as title)
   - Meta description readiness (tagline as meta)
   - Heading hierarchy (H1 → H2 → H3)
   - Keyword usage (natural, not stuffed)
   - Semantic relevance to the industry

5. Spam Policies:
   - No keyword stuffing
   - No hidden text or manipulative tactics
   - No scraped or duplicate content
   - No misleading claims

═══ B. HUMAN JUDGMENT ═══
(How a real human visitor will perceive this site)

1. First Impression (3 seconds):
   - Does it build trust immediately?
   - Is it clear what this business does?
   - Does it look professional and established?

2. Clarity:
   - Is the value proposition instantly clear?
   - Can a visitor understand the services in 5 seconds?
   - Is the messaging consistent throughout?

3. Persuasion:
   - Does it motivate the visitor to act?
   - Does it address pain points emotionally?
   - Is there urgency without being spammy?

4. Emotional Resonance:
   - Does it connect with the target customer's needs?
   - Does it feel authentic, not robotic?
   - Would a visitor feel confident contacting this business?

5. Conversion Path:
   - Is there a clear, frictionless path to contact/buy?
   - Are CTAs visible and compelling?
   - Are there multiple contact opportunities?

═══ VERDICT RULES ═══

PASS: Both Google score ≥ 80 AND Human score ≥ 80. No critical issues. Ready to deploy.
CONDITIONAL_PASS: Scores ≥ 65 but at least one dimension below 80, or minor critical issues that should be addressed post-launch. Deploy but monitor.
FAIL: Either score below 65, or serious critical issues that must be fixed before launch. Do not deploy.

Provide your verdict, detailed scores, and specific actionable recommendations.`;
}