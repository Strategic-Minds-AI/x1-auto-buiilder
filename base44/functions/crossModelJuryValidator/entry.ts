import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// ═══════════════════════════════════════════════════════════════
// CROSS-MODEL JURY VALIDATOR
// An independent second judge (Gemini) that scores generated content
// alongside the existing Claude judge. The pipeline ships only when
// BOTH judges agree the content passes. A disagreement flags the
// content for review instead of auto-shipping.
//
// Why two models? A single LLM judge has model-specific blind spots
// (over-familiarity with certain phrasings, systematic leniency on
// particular dimensions). A cross-model jury cancels those out: if
// Claude and Gemini — two completely independent model families —
// both rate the content above the quality bar, confidence is high.
// ═══════════════════════════════════════════════════════════════

// Independent rubric — intentionally a separate copy from promptValidationAgent
// so a bug or bias in one judge's rubric cannot correlate the two verdicts.
const JURY_RUBRIC = {
  industrySpecificity: { weight: 20, description: "How specific is the content to this industry? Does it use industry terminology, address industry pain points, and feel bespoke rather than generic?" },
  contentDepth: { weight: 20, description: "Is every section deep and complete? Are there enough services, testimonials, FAQs, stats? Or is it shallow and basic?" },
  benefitFocus: { weight: 15, description: "Does the copy focus on customer benefits and outcomes, not just features and processes?" },
  trustBuilding: { weight: 15, description: "Does it include industry-specific trust signals, credentials, and social proof that build confidence?" },
  conversionOptimization: { weight: 15, description: "Are CTAs clear and compelling? Does every section serve a conversion purpose?" },
  emotionalImpact: { weight: 10, description: "Is the copy emotionally compelling? Does it make the reader feel something and want to act?" },
  originality: { weight: 5, description: "Is the copy original and specific, not generic template-speak that could apply to any business?" },
};

const GEMINI_JUDGE_PROMPT = (industry, generatedContent, qualityBar) =>
  `You are an independent QA judge on a cross-model jury. You are evaluating website content generated for a "${industry}" business. Your verdict will be compared against another judge's verdict.

QUALITY BAR: The content must look like it was created by a top-tier agency charging $10,000+ per website. Score strictly — average content should NOT pass.

EVALUATION RUBRIC (score each dimension 0-100):
${Object.entries(JURY_RUBRIC).map(([k, v]) => `${k} (weight ${v.weight}): ${v.description}`).join('\n')}

GENERATED CONTENT TO EVALUATE:
${JSON.stringify(generatedContent, null, 2)}

INSTRUCTIONS:
1. Score each rubric dimension from 0-100 based on the content quality
2. Calculate a weighted total score
3. List specific failure modes — what is generic, shallow, missing, or not industry-specific
4. Give a verdict: PASS (score >= ${qualityBar}) or FAIL (score < ${qualityBar})

Be brutally honest and independent. Do not assume the content is good — prove it. Generic copy that could apply to any industry should score below 50. Content that is specific, deep, and premium should score 85+. Only truly exceptional content should score 90+.

Return JSON with: scores (object of dimension scores), totalScore (weighted number), verdict ("PASS" or "FAIL"), failureModes (array of specific issues).`;

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

    const body = await req.json();
    const { industry, generatedContent, qualityBar = 85 } = body;

    if (!generatedContent) return Response.json({ error: 'generatedContent is required' }, { status: 400 });

    // ── Judge 1: Claude (via existing promptValidationAgent) ──
    const claudeRes = await base44.functions.invoke('promptValidationAgent', {
      action: 'validate',
      industry,
      generatedContent,
      qualityBar,
    });
    const claudeResult = claudeRes.data?.result || {};
    const claudeScore = claudeResult.totalScore || 0;
    const claudeVerdict = claudeResult.verdict || 'FAIL';

    // ── Judge 2: Gemini (independent, different model family) ──
    const geminiRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
      model: 'gemini_3_1_pro',
      prompt: GEMINI_JUDGE_PROMPT(industry || 'general', generatedContent, qualityBar),
      response_json_schema: {
        type: 'object',
        properties: {
          scores: {
            type: 'object',
            properties: Object.fromEntries(
              Object.keys(JURY_RUBRIC).map(k => [k, { type: 'number' }])
            ),
          },
          totalScore: { type: 'number' },
          verdict: { type: 'string', enum: ['PASS', 'FAIL'] },
          failureModes: { type: 'array', items: { type: 'string' } },
        },
        required: ['scores', 'totalScore', 'verdict', 'failureModes'],
      },
    });
    const geminiScore = geminiRes.totalScore || 0;
    const geminiVerdict = geminiRes.verdict || 'FAIL';

    // ── Jury deliberation ──
    const bothPass = claudeVerdict === 'PASS' && geminiVerdict === 'PASS';
    const bothFail = claudeVerdict === 'FAIL' && geminiVerdict === 'FAIL';
    const disagreement = !bothPass && !bothFail;

    const juryVerdict = bothPass ? 'PASS' : (disagreement ? 'DISAGREEMENT' : 'FAIL');
    const avgScore = Math.round((claudeScore + geminiScore) / 2);
    const scoreDelta = Math.abs(claudeScore - geminiScore);

    return Response.json({
      industry,
      qualityBar,
      jury_verdict: juryVerdict,
      avg_score: avgScore,
      score_delta: scoreDelta,
      can_ship: bothPass,
      needs_review: disagreement,
      judges: {
        claude: { score: claudeScore, verdict: claudeVerdict, failure_modes: claudeResult.failureModes || [] },
        gemini: { score: geminiScore, verdict: geminiVerdict, failure_modes: geminiRes.failureModes || [] },
      },
      summary: bothPass
        ? `JURY PASS — both judges agree (${avgScore}/100 avg, Δ${scoreDelta})`
        : disagreement
          ? `JURY DISAGREEMENT — Claude ${claudeScore}/${claudeVerdict} vs Gemini ${geminiScore}/${geminiVerdict} (Δ${scoreDelta}) — needs review`
          : `JURY FAIL — both judges agree content is below bar (${avgScore}/100 avg)`,
    });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}