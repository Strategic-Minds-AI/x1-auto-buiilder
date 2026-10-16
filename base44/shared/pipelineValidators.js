// Independent validators for the gated pipeline.
// Each validator is a fresh LLM call with a specific focus — it does NOT share state
// with the stage that produced the content. It judges the content on its own merits.
// If a validator returns verdict !== "pass", the pipeline gates (stops) and reports the blocker.

const MODEL = 'claude-sonnet-5';

// ── Validator 1: Research Quality Gate ──────────────────────
// Runs AFTER research, BEFORE generation. Checks that business research is complete,
// specific, and actionable enough to generate a high-quality site from.
export async function validateResearch(base44, research, industry, businessName) {
  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    model: MODEL,
    prompt:
      `You are an INDEPENDENT Research Quality Validator. You did NOT do the research — you are judging it cold.\n\n` +
      `Business: ${businessName}\nIndustry: ${industry}\n\n` +
      `Research data:\n${JSON.stringify(research).slice(0, 6000)}\n\n` +
      `Judge whether this research is sufficient to generate a high-quality, specific, non-generic website.\n\n` +
      `Check:\n` +
      `1. Is the business name, location, and contact info captured?\n` +
      `2. Are the services/products specific (not just "we offer quality services")?\n` +
      `3. Are there unique selling points or differentiators identified?\n` +
      `4. Is there enough detail to write compelling, non-generic copy?\n` +
      `5. Are there gaps that would force the generator to invent content?\n\n` +
      `Verdict: pass (research is sufficient) or fail (critical gaps remain).\n` +
      `If fail, list the specific gaps that block generation.`,
    response_json_schema: {
      type: 'object',
      properties: {
        verdict: { type: 'string', enum: ['pass', 'fail'] },
        score: { type: 'number', description: '0-100 research completeness score' },
        gaps: { type: 'array', items: { type: 'string' }, description: 'Missing info that blocks generation (empty if pass)' },
        summary: { type: 'string' },
      },
      required: ['verdict', 'score', 'gaps', 'summary'],
    },
  });
  return result;
}

// ── Validator 2: Content Completeness Gate ───────────────────
// Runs AFTER content generation, BEFORE compliance. Checks that all sections
// are present, substantial, and free of placeholder/generic text.
export async function validateContentCompleteness(base44, content, industry, businessName) {
  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    model: MODEL,
    prompt:
      `You are an INDEPENDENT Content Completeness Validator. You are seeing this content for the first time.\n\n` +
      `Business: ${businessName}\nIndustry: ${industry}\n\n` +
      `Generated content:\n${JSON.stringify(content).slice(0, 10000)}\n\n` +
      `Judge whether this content is complete and substantial enough to deploy.\n\n` +
      `Check:\n` +
      `1. Are all essential sections present (hero, services, about, testimonials, CTA, contact)?\n` +
      `2. Is each section substantial (not 1-2 sentences)?\n` +
      `3. Is there any placeholder text, "lorem ipsum", "[example]", or generic filler?\n` +
      `4. Is the content specific to THIS business and industry, or could it apply to anyone?\n` +
      `5. Are there truncated or incomplete sections?\n\n` +
      `Verdict: pass (complete and substantial) or fail (sections missing or incomplete).\n` +
      `If fail, list the specific sections that need regeneration.`,
    response_json_schema: {
      type: 'object',
      properties: {
        verdict: { type: 'string', enum: ['pass', 'fail'] },
        score: { type: 'number', description: '0-100 completeness score' },
        missing_sections: { type: 'array', items: { type: 'string' } },
        placeholder_found: { type: 'boolean' },
        issues: { type: 'array', items: { type: 'string' } },
        summary: { type: 'string' },
      },
      required: ['verdict', 'score', 'issues', 'summary'],
    },
  });
  return result;
}

// ── Validator 3: Google Compliance Gate ───────────────────────
// Runs AFTER compliance check, BEFORE auto-fix. Independently verifies
// E-E-A-T, helpful content, and spam policy adherence.
export async function validateGoogleCompliance(base44, content, industry, businessName) {
  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    model: MODEL,
    prompt:
      `You are an INDEPENDENT Google Compliance Validator. You are a Search Quality Rater judging this site cold.\n\n` +
      `Business: ${businessName}\nIndustry: ${industry}\n\n` +
      `Content:\n${JSON.stringify(content).slice(0, 10000)}\n\n` +
      `Judge this content against Google's standards as if you were rating it for Search.\n\n` +
      `Check:\n` +
      `1. E-E-A-T: Does it demonstrate Experience, Expertise, Authoritativeness, Trustworthiness?\n` +
      `2. Helpful Content: Is it people-first, satisfying search intent, providing original value?\n` +
      `3. Spam Policies: Any keyword stuffing, hidden text, scraped content, misleading claims?\n` +
      `4. YMYL: If health/finance/legal, is the content accurate and trustworthy?\n` +
      `5. Meta Readiness: Does the hero headline work as a title tag? Tagline as meta description?\n\n` +
      `Verdict: pass (Google-ready, score >= 75) or fail (would rank poorly or risk penalty).`,
    response_json_schema: {
      type: 'object',
      properties: {
        verdict: { type: 'string', enum: ['pass', 'fail'] },
        score: { type: 'number', description: '0-100 Google compliance score' },
        eeat_score: { type: 'number' },
        helpful_content_score: { type: 'number' },
        spam_risk: { type: 'string', enum: ['none', 'low', 'medium', 'high'] },
        critical_issues: { type: 'array', items: { type: 'string' } },
        summary: { type: 'string' },
      },
      required: ['verdict', 'score', 'eeat_score', 'helpful_content_score', 'spam_risk', 'critical_issues', 'summary'],
    },
  });
  return result;
}

// ── Validator 4: Fix Verification Gate ────────────────────────
// Runs AFTER auto-fix, BEFORE QA. Independently verifies that the fixes
// actually resolved the issues — the fixer cannot grade its own homework.
export async function validateFixes(base44, content, originalIssues, industry, businessName) {
  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    model: MODEL,
    prompt:
      `You are an INDEPENDENT Fix Verification Validator. A fixer claims to have resolved these issues:\n\n` +
      `Business: ${businessName}\nIndustry: ${industry}\n\n` +
      `Original issues that were supposed to be fixed:\n${JSON.stringify(originalIssues).slice(0, 4000)}\n\n` +
      `Current content (after fixes):\n${JSON.stringify(content).slice(0, 10000)}\n\n` +
      `Independently verify whether each issue was ACTUALLY resolved. The fixer cannot grade its own homework — you can.\n\n` +
      `For each issue, state: resolved, partially_resolved, or not_resolved.\n` +
      `Verdict: pass (all critical issues resolved) or fail (critical issues remain).`,
    response_json_schema: {
      type: 'object',
      properties: {
        verdict: { type: 'string', enum: ['pass', 'fail'] },
        score: { type: 'number', description: '0-100 fix effectiveness score' },
        issues_resolved: { type: 'number' },
        issues_remaining: { type: 'number' },
        unresolved_issues: { type: 'array', items: { type: 'string' } },
        summary: { type: 'string' },
      },
      required: ['verdict', 'score', 'issues_resolved', 'issues_remaining', 'unresolved_issues', 'summary'],
    },
  });
  return result;
}

// ── Validator 5: Human Quality Gate ──────────────────────────
// Runs AFTER QA, BEFORE deploy. Independently judges how a human visitor
// will perceive the site — trust, clarity, persuasion, conversion.
export async function validateHumanQuality(base44, content, industry, businessName) {
  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    model: MODEL,
    prompt:
      `You are an INDEPENDENT Human Quality Validator. You are a potential customer visiting this site for the first time.\n\n` +
      `Business: ${businessName}\nIndustry: ${industry}\n\n` +
      `Content:\n${JSON.stringify(content).slice(0, 10000)}\n\n` +
      `Judge this site as a real human visitor would. Be honest — do not inflate scores.\n\n` +
      `Check:\n` +
      `1. Trust: Does it build trust in 3 seconds? Does it look like a real, established business?\n` +
      `2. Clarity: Is the value proposition instantly clear? Can you understand the services in 5 seconds?\n` +
      `3. Persuasion: Does it motivate you to act? Does it address your pain points emotionally?\n` +
      `4. Conversion: Is there a clear, frictionless path to contact/buy? Are CTAs visible and compelling?\n` +
      `5. Authenticity: Does it feel authentic, not robotic or generic?\n\n` +
      `Verdict: pass (human-ready, score >= 75) or fail (would bounce or not convert).`,
    response_json_schema: {
      type: 'object',
      properties: {
        verdict: { type: 'string', enum: ['pass', 'fail'] },
        score: { type: 'number', description: '0-100 human quality score' },
        trust_score: { type: 'number' },
        clarity_score: { type: 'number' },
        persuasion_score: { type: 'number' },
        conversion_score: { type: 'number' },
        critical_issues: { type: 'array', items: { type: 'string' } },
        summary: { type: 'string' },
      },
      required: ['verdict', 'score', 'trust_score', 'clarity_score', 'persuasion_score', 'conversion_score', 'critical_issues', 'summary'],
    },
  });
  return result;
}

// ── Validator 6: Final Release Gate ──────────────────────────
// Runs AFTER deploy, BEFORE marking complete. The ultimate independent judge —
// combines Google + human + deployment verification into a final go/no-go.
export async function validateRelease(base44, content, deployUrl, industry, businessName) {
  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    model: MODEL,
    prompt:
      `You are the INDEPENDENT Final Release Validator — the ultimate quality gate. You are the last check before this site goes live to customers.\n\n` +
      `Business: ${businessName}\nIndustry: ${industry}\n` +
      `Deploy URL: ${deployUrl || 'NOT DEPLOYED'}\n\n` +
      `Content:\n${JSON.stringify(content).slice(0, 10000)}\n\n` +
      `Make the final go/no-go decision. You are independent — you did not build, fix, or validate this content before.\n\n` +
      `Judge on BOTH dimensions:\n` +
      `A. GOOGLE: E-E-A-T, helpful content, spam compliance, SEO readiness (score 0-100)\n` +
      `B. HUMAN: Trust, clarity, persuasion, conversion path (score 0-100)\n\n` +
      `Verdict rules:\n` +
      `PASS: Both scores >= 80, no critical issues. Ready for production.\n` +
      `CONDITIONAL_PASS: Scores >= 65 but one dimension below 80. Deploy but monitor.\n` +
      `FAIL: Either score below 65, or critical issues remain. Do not release.`,
    response_json_schema: {
      type: 'object',
      properties: {
        verdict: { type: 'string', enum: ['pass', 'conditional_pass', 'fail'] },
        google_score: { type: 'number' },
        human_score: { type: 'number' },
        overall_score: { type: 'number' },
        critical_issues: { type: 'array', items: { type: 'string' } },
        recommendations: { type: 'array', items: { type: 'string' } },
        summary: { type: 'string' },
      },
      required: ['verdict', 'google_score', 'human_score', 'overall_score', 'critical_issues', 'recommendations', 'summary'],
    },
  });
  return result;
}