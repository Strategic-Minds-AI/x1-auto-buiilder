import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// ═══════════════════════════════════════════════════════════════
// PROMPT VALIDATION AGENT
// An independent LLM-as-judge agent that produces, evaluates,
// and iteratively improves prompts for ultra-premium website
// content generation. Uses multi-dimensional rubric scoring,
// failure-mode analysis, and auto-generated prompt improvements.
// ═══════════════════════════════════════════════════════════════

const QUALITY_RUBRIC = {
  industrySpecificity: { weight: 20, description: "How specific is the content to this industry? Does it use industry terminology, address industry pain points, and feel bespoke?" },
  contentDepth: { weight: 20, description: "Is every section deep and complete? Are there enough services, testimonials, FAQs, stats? Or is it shallow and basic?" },
  benefitFocus: { weight: 15, description: "Does the copy focus on customer benefits and outcomes, not just features and processes?" },
  trustBuilding: { weight: 15, description: "Does it include industry-specific trust signals, credentials, and social proof that build confidence?" },
  conversionOptimization: { weight: 15, description: "Are CTAs clear and compelling? Does every section serve a conversion purpose?" },
  emotionalImpact: { weight: 10, description: "Is the copy emotionally compelling? Does it make the reader feel something and want to act?" },
  originality: { weight: 5, description: "Is the copy original and specific, not generic template-speak that could apply to any business?" },
};

const JUDGE_PROMPT = (industry, generatedContent, qualityBar) =>
  `You are an elite QA judge for a multi-million-dollar AI software agency. You are evaluating website content generated for a "${industry}" business.

QUALITY BAR: The content must look like it was created by a top-tier agency charging $10,000+ per website. Score strictly — average content should NOT pass.

EVALUATION RUBRIC (score each dimension 0-100):
${Object.entries(QUALITY_RUBRIC).map(([k, v]) => `${k} (weight ${v.weight}): ${v.description}`).join('\n')}

GENERATED CONTENT TO EVALUATE:
${JSON.stringify(generatedContent, null, 2)}

INSTRUCTIONS:
1. Score each rubric dimension from 0-100 based on the content quality
2. Calculate a weighted total score
3. List specific failure modes — what is generic, shallow, missing, or not industry-specific
4. List specific improvements needed to reach the quality bar of ${qualityBar}
5. Give a verdict: PASS (score >= ${qualityBar}) or FAIL (score < ${qualityBar})

Be brutally honest. Generic copy that could apply to any industry should score below 50. Content that is specific, deep, and premium should score 85+. Only truly exceptional content should score 90+.

Return JSON with: scores (object of dimension scores), totalScore (weighted number), verdict ("PASS" or "FAIL"), failureModes (array of specific issues), improvements (array of specific improvements needed).`;

const PROMPT_IMPROVEMENT_PROMPT = (originalPrompt, judgeFeedback, industry) =>
  `You are a prompt engineering expert. A prompt was used to generate website content for a "${industry}" business, but the output failed quality validation.

ORIGINAL PROMPT:
${originalPrompt}

JUDGE FEEDBACK (failure modes and improvements needed):
${JSON.stringify(judgeFeedback, null, 2)}

TASK: Rewrite the prompt to fix every identified failure mode and incorporate every improvement. The improved prompt must:
1. Be more specific about what makes content "ultra-premium" for this industry
2. Include explicit instructions to address each failure mode
3. Add specific examples or constraints where the original was too vague
4. Be more prescriptive about content depth, industry specificity, and benefit focus
5. Maintain the same overall structure and intent

Return the improved prompt as a string. Do not include any explanation — just the new prompt text.`;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

    const body = await req.json();
    const {
      action,
      prompt,
      industry,
      context,
      outputSchema,
      qualityBar = 85,
      maxIterations = 3,
      generatedContent,
      judgeFeedback,
    } = body;

    // ── ACTION: validate ── Evaluate generated content against the rubric
    if (action === 'validate') {
      if (!generatedContent) return Response.json({ error: 'generatedContent is required for validate action' }, { status: 400 });
      const judgeRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
        model: 'claude-sonnet-5',
        prompt: JUDGE_PROMPT(industry || 'general', generatedContent, qualityBar),
        response_json_schema: {
          type: 'object',
          properties: {
            scores: {
              type: 'object',
              properties: Object.fromEntries(
                Object.keys(QUALITY_RUBRIC).map(k => [k, { type: 'number' }])
              ),
            },
            totalScore: { type: 'number' },
            verdict: { type: 'string', enum: ['PASS', 'FAIL'] },
            failureModes: { type: 'array', items: { type: 'string' } },
            improvements: { type: 'array', items: { type: 'string' } },
          },
          required: ['scores', 'totalScore', 'verdict', 'failureModes', 'improvements'],
        },
      });
      return Response.json({
        action: 'validate',
        industry,
        qualityBar,
        result: judgeRes,
      });
    }

    // ── ACTION: improve_prompt ── Generate an improved prompt from judge feedback
    if (action === 'improve_prompt') {
      if (!prompt) return Response.json({ error: 'prompt is required for improve_prompt action' }, { status: 400 });
      if (!judgeFeedback) return Response.json({ error: 'judgeFeedback is required for improve_prompt action' }, { status: 400 });
      const improvedPrompt = await base44.asServiceRole.integrations.Core.InvokeLLM({
        model: 'claude-sonnet-5',
        prompt: PROMPT_IMPROVEMENT_PROMPT(prompt, judgeFeedback, industry || 'general'),
        response_json_schema: {
          type: 'object',
          properties: {
            improvedPrompt: { type: 'string' },
            changesSummary: { type: 'string', description: 'Brief summary of what was changed and why' },
          },
          required: ['improvedPrompt', 'changesSummary'],
        },
      });
      return Response.json({
        action: 'improve_prompt',
        originalPrompt: prompt,
        improvedPrompt: improvedPrompt.improvedPrompt,
        changesSummary: improvedPrompt.changesSummary,
      });
    }

    // ── ACTION: validate_and_improve ── Full iterative loop: generate → judge → improve → repeat
    if (action === 'validate_and_improve') {
      if (!prompt) return Response.json({ error: 'prompt is required' }, { status: 400 });
      if (!outputSchema) return Response.json({ error: 'outputSchema is required for validate_and_improve' }, { status: 400 });

      let currentPrompt = prompt;
      const history = [];
      let bestScore = 0;
      let bestContent = null;
      let bestPrompt = prompt;
      let finalVerdict = 'FAIL';

      for (let i = 0; i < maxIterations; i++) {
        // Step 1: Generate content using current prompt
        const generated = await base44.asServiceRole.integrations.Core.InvokeLLM({
          model: 'claude-sonnet-5',
          prompt: currentPrompt + (context ? '\n\nADDITIONAL CONTEXT:\n' + JSON.stringify(context) : ''),
          response_json_schema: outputSchema,
        });

        // Step 2: Judge the generated content
        const judgeRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
          model: 'claude-sonnet-5',
          prompt: JUDGE_PROMPT(industry || 'general', generated, qualityBar),
          response_json_schema: {
            type: 'object',
            properties: {
              scores: {
                type: 'object',
                properties: Object.fromEntries(
                  Object.keys(QUALITY_RUBRIC).map(k => [k, { type: 'number' }])
                ),
              },
              totalScore: { type: 'number' },
              verdict: { type: 'string', enum: ['PASS', 'FAIL'] },
              failureModes: { type: 'array', items: { type: 'string' } },
              improvements: { type: 'array', items: { type: 'string' } },
            },
            required: ['scores', 'totalScore', 'verdict', 'failureModes', 'improvements'],
          },
        });

        const iteration = {
          iteration: i + 1,
          prompt: currentPrompt,
          generatedContent: generated,
          scores: judgeRes.scores,
          totalScore: judgeRes.totalScore,
          verdict: judgeRes.verdict,
          failureModes: judgeRes.failureModes,
          improvements: judgeRes.improvements,
        };
        history.push(iteration);

        if (judgeRes.totalScore > bestScore) {
          bestScore = judgeRes.totalScore;
          bestContent = generated;
          bestPrompt = currentPrompt;
        }

        if (judgeRes.verdict === 'PASS' || judgeRes.totalScore >= qualityBar) {
          finalVerdict = 'PASS';
          break;
        }

        // Step 3: Improve the prompt based on judge feedback (if not last iteration)
        if (i < maxIterations - 1) {
          const improved = await base44.asServiceRole.integrations.Core.InvokeLLM({
            model: 'claude-sonnet-5',
            prompt: PROMPT_IMPROVEMENT_PROMPT(currentPrompt, {
              failureModes: judgeRes.failureModes,
              improvements: judgeRes.improvements,
              scores: judgeRes.scores,
              totalScore: judgeRes.totalScore,
            }, industry || 'general'),
            response_json_schema: {
              type: 'object',
              properties: {
                improvedPrompt: { type: 'string' },
                changesSummary: { type: 'string' },
              },
              required: ['improvedPrompt', 'changesSummary'],
            },
          });
          currentPrompt = improved.improvedPrompt;
          iteration.improvementSummary = improved.changesSummary;
        }
      }

      return Response.json({
        action: 'validate_and_improve',
        industry,
        qualityBar,
        iterations: history.length,
        maxIterations,
        finalVerdict,
        bestScore,
        bestPrompt,
        bestContent,
        history,
      });
    }

    // ── ACTION: rubric ── Return the quality rubric for display
    if (action === 'rubric') {
      return Response.json({
        action: 'rubric',
        rubric: QUALITY_RUBRIC,
        dimensions: Object.keys(QUALITY_RUBRIC),
      });
    }

    return Response.json({ error: 'Unknown action. Use: validate, improve_prompt, validate_and_improve, or rubric' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}