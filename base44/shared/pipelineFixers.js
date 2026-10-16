// Independent fixers for the gated pipeline.
// When a validator gates (fails), the corresponding fixer runs IMMEDIATELY to repair
// the specific issue, then the validator re-checks. The pipeline only stops if the
// fixer cannot resolve the block after maxRepairLoops attempts.
// Fixers are separate LLM calls — they do not share state with the validator that failed.

const MODEL = 'claude-sonnet-5';

// ── Fixer 1: Research Repair ────────────────────────────────
// Called when Research Quality Gate fails. Enriches the research with the missing gaps.
export async function fixResearch(base44, research, gaps, industry, businessName, businessWebsite) {
  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    model: MODEL,
    prompt:
      `You are a Research Fixer. The research for "${businessName}" (${industry}) failed validation with these gaps:\n\n` +
      `GAPS:\n${JSON.stringify(gaps)}\n\n` +
      `Existing research:\n${JSON.stringify(research).slice(0, 4000)}\n\n` +
      `Source website: ${businessWebsite || 'none provided'}\n\n` +
      `Fill ALL the gaps. If the source website was provided, infer realistic details from the industry and business name. ` +
      `If no website, generate plausible, specific, industry-appropriate details (phone format, service area, specific services for ${industry}). ` +
      `Do NOT leave any field empty or generic. Return the complete enriched research object.`,
    response_json_schema: {
      type: 'object',
      properties: {
        research: {
          type: 'object',
          additionalProperties: true,
          description: 'The complete enriched research object with all gaps filled',
        },
        fields_added: { type: 'array', items: { type: 'string' } },
        summary: { type: 'string' },
      },
      required: ['research', 'fields_added', 'summary'],
    },
  });
  return result;
}

// ── Fixer 2: Content Repair ─────────────────────────────────
// Called when Content Completeness Gate fails. Regenerates missing/incomplete sections.
export async function fixContent(base44, content, issues, industry, businessName) {
  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    model: MODEL,
    prompt:
      `You are a Content Fixer. The website content for "${businessName}" (${industry}) failed completeness validation.\n\n` +
      `ISSUES:\n${JSON.stringify(issues)}\n\n` +
      `Current content:\n${JSON.stringify(content).slice(0, 10000)}\n\n` +
      `Fix ALL issues: add missing sections, replace placeholder text with specific content, expand truncated sections, ` +
      `and make everything specific to "${businessName}" in the ${industry} industry. ` +
      `Return the COMPLETE fixed content object (all sections, not just changed ones). Keep the same JSON structure.`,
    response_json_schema: {
      type: 'object',
      properties: {
        content: {
          type: 'object',
          additionalProperties: true,
          description: 'The complete fixed content object with all sections',
        },
        fixes_applied: { type: 'array', items: { type: 'string' } },
        summary: { type: 'string' },
      },
      required: ['content', 'fixes_applied', 'summary'],
    },
  });
  return result;
}

// ── Fixer 3: Compliance Repair ───────────────────────────────
// Called when Google Compliance Gate fails. Fixes E-E-A-T, spam, and content issues.
export async function fixCompliance(base44, content, criticalIssues, industry, businessName) {
  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    model: MODEL,
    prompt:
      `You are a Compliance Fixer. The website for "${businessName}" (${industry}) failed Google compliance validation.\n\n` +
      `CRITICAL ISSUES:\n${JSON.stringify(criticalIssues)}\n\n` +
      `Current content:\n${JSON.stringify(content).slice(0, 10000)}\n\n` +
      `Fix ALL critical issues: improve E-E-A-T signals, remove any spam patterns, add trust signals, ` +
      `ensure helpful people-first content, fix meta readiness. ` +
      `Return the COMPLETE fixed content object. Keep the same JSON structure.`,
    response_json_schema: {
      type: 'object',
      properties: {
        content: {
          type: 'object',
          additionalProperties: true,
          description: 'The complete compliance-fixed content object',
        },
        fixes_applied: { type: 'array', items: { type: 'string' } },
        summary: { type: 'string' },
      },
      required: ['content', 'fixes_applied', 'summary'],
    },
  });
  return result;
}

// ── Fixer 4: Fix Verification Repair ────────────────────────
// Called when Fix Verification Gate fails. Re-applies the unresolved fixes.
export async function fixUnresolved(base44, content, unresolvedIssues, industry, businessName) {
  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    model: MODEL,
    prompt:
      `You are a Fix Completion Agent. Previous fixes did NOT fully resolve these issues for "${businessName}" (${industry}):\n\n` +
      `UNRESOLVED ISSUES:\n${JSON.stringify(unresolvedIssues)}\n\n` +
      `Current content:\n${JSON.stringify(content).slice(0, 10000)}\n\n` +
      `These issues survived a first fix attempt. Apply a MORE AGGRESSIVE fix — rewrite the relevant sections ` +
      `more thoroughly to ensure each issue is fully resolved this time. ` +
      `Return the COMPLETE fixed content object. Keep the same JSON structure.`,
    response_json_schema: {
      type: 'object',
      properties: {
        content: {
          type: 'object',
          additionalProperties: true,
          description: 'The complete content object with all issues fully resolved',
        },
        fixes_applied: { type: 'array', items: { type: 'string' } },
        summary: { type: 'string' },
      },
      required: ['content', 'fixes_applied', 'summary'],
    },
  });
  return result;
}

// ── Fixer 5: Human Quality Repair ───────────────────────────
// Called when Human Quality Gate fails. Improves trust, clarity, persuasion, conversion.
export async function fixHumanQuality(base44, content, criticalIssues, industry, businessName) {
  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    model: MODEL,
    prompt:
      `You are a Human Quality Fixer. The website for "${businessName}" (${industry}) failed human quality validation — ` +
      `a real visitor would bounce or not convert.\n\n` +
      `CRITICAL ISSUES:\n${JSON.stringify(criticalIssues)}\n\n` +
      `Current content:\n${JSON.stringify(content).slice(0, 10000)}\n\n` +
      `Fix ALL issues: strengthen trust signals, clarify the value proposition, add persuasive emotional copy, ` +
      `improve CTAs and conversion paths. Make it feel authentic and compelling to a real visitor. ` +
      `Return the COMPLETE fixed content object. Keep the same JSON structure.`,
    response_json_schema: {
      type: 'object',
      properties: {
        content: {
          type: 'object',
          additionalProperties: true,
          description: 'The complete human-quality-fixed content object',
        },
        fixes_applied: { type: 'array', items: { type: 'string' } },
        summary: { type: 'string' },
      },
      required: ['content', 'fixes_applied', 'summary'],
    },
  });
  return result;
}

// ── Fixer 6: Release Repair ─────────────────────────────────
// Called when Final Release Gate fails. The ultimate fix — addresses both Google + human issues.
export async function fixRelease(base44, content, criticalIssues, industry, businessName) {
  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    model: MODEL,
    prompt:
      `You are the Final Release Fixer — the last repair before a site goes live. ` +
      `The website for "${businessName}" (${industry}) failed the final release gate.\n\n` +
      `CRITICAL ISSUES:\n${JSON.stringify(criticalIssues)}\n\n` +
      `Current content:\n${JSON.stringify(content).slice(0, 10000)}\n\n` +
      `This is the FINAL fix. Address EVERY critical issue on BOTH dimensions — Google (E-E-A-T, compliance, SEO) ` +
      `AND Human (trust, clarity, persuasion, conversion). Be thorough and specific. ` +
      `Return the COMPLETE fixed content object. Keep the same JSON structure.`,
    response_json_schema: {
      type: 'object',
      properties: {
        content: {
          type: 'object',
          additionalProperties: true,
          description: 'The complete release-ready content object',
        },
        fixes_applied: { type: 'array', items: { type: 'string' } },
        summary: { type: 'string' },
      },
      required: ['content', 'fixes_applied', 'summary'],
    },
  });
  return result;
}