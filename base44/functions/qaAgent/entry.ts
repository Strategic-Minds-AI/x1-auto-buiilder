import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// QA Agent — the comprehensive quality assurance agent that runs at the end of the pipeline.
// Checks everything against Google and human standards, finds ALL issues, and FIXES them.
// Returns fixed content + a detailed report of what was found and fixed.

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

    if (!content) return Response.json({ error: 'No content to check' }, { status: 400 });

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      model: 'claude-sonnet-5',
      prompt: buildQAPrompt(content, industry, businessName),
      response_json_schema: {
        type: 'object',
        properties: {
          section_fixes: {
            type: 'object',
            description: 'ONLY the sections that changed — a partial content object with the fixed versions. Do NOT include unchanged sections. Keys must match the input content keys (hero, services, about, valueProps, process, faqs, testimonials, finalCta, etc.)',
            additionalProperties: true,
          },
          issues_found: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                category: { type: 'string', enum: ['google_compliance', 'content_quality', 'trust_signals', 'conversion', 'readability', 'technical_seo', 'spam_policy'] },
                severity: { type: 'string', enum: ['critical', 'warning', 'info'] },
                issue: { type: 'string' },
                fix_applied: { type: 'string' },
                section: { type: 'string' },
              },
              required: ['category', 'severity', 'issue', 'fix_applied'],
            },
          },
          google_compliance_score: { type: 'number', description: '0-100 score for Google compliance after fixes' },
          human_quality_score: { type: 'number', description: '0-100 score for human quality after fixes' },
          summary: { type: 'string' },
        },
        required: ['section_fixes', 'issues_found', 'google_compliance_score', 'human_quality_score', 'summary'],
      },
    });

    // Merge the section fixes into the existing content
    const fixedContent = { ...content };
    const sectionFixes = result.section_fixes || {};
    let sectionsChanged = 0;
    for (const [key, value] of Object.entries(sectionFixes)) {
      if (value && typeof value === 'object' && Object.keys(value).length > 0) {
        fixedContent[key] = { ...(fixedContent[key] || {}), ...value };
        sectionsChanged++;
      } else if (value && typeof value === 'string') {
        fixedContent[key] = value;
        sectionsChanged++;
      }
    }

    // Only persist if we actually have meaningful fixes (don't wipe content with empty objects)
    const originalKeyCount = Object.keys(content || {}).length;
    const fixedKeyCount = Object.keys(fixedContent).length;
    if (projectId && sectionsChanged > 0 && fixedKeyCount >= originalKeyCount) {
      await base44.entities.WebsiteProject.update(projectId, { content: fixedContent });
    }

    return Response.json({
      agent: 'qa_agent',
      project_id: projectId || null,
      issues_found: result.issues_found || [],
      issues_fixed: (result.issues_found || []).length,
      sections_changed: sectionsChanged,
      google_compliance_score: result.google_compliance_score,
      human_quality_score: result.human_quality_score,
      summary: result.summary,
      fixed: sectionsChanged > 0,
    });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

function buildQAPrompt(content: any, industry: string, businessName: string): string {
  return `You are the QA Agent for the Digital Dominance Factory. Your job is to check the website content below against Google's standards AND human quality expectations, find ALL issues, and FIX them.

Website: ${businessName}
Industry: ${industry}

CURRENT CONTENT:
${JSON.stringify(content, null, 1)}

CHECK AND FIX THESE CATEGORIES:

1. GOOGLE COMPLIANCE (how Google's algorithms and quality raters judge):
   - E-E-A-T: Add experience signals, expertise demonstrations, authoritativeness cues, trustworthiness elements
   - Helpful Content: Ensure content is people-first, satisfies search intent, provides original value
   - Spam Policies: Remove any keyword stuffing, repetitive phrases, scraped-sounding content, hidden text patterns
   - YMYL: If health/money/legal topics, ensure accuracy, cite sources where needed
   - Meta Readiness: Ensure hero headline works as a title tag, tagline works as meta description

2. CONTENT QUALITY (completeness and professionalism):
   - No placeholder text, no "lorem ipsum", no "example" or "illustrative" labels that undermine trust
   - No truncated or incomplete sections
   - All sections have substantial, specific content (not generic)
   - No duplicate content across sections
   - Consistent tone and messaging

3. TRUST SIGNALS (what makes visitors believe this is a real business):
   - Contact information (phone, email, service area)
   - Certifications, licenses, insurance mentions
   - Years in business, number of projects completed
   - Guarantees and warranties
   - Social proof (testimonials that sound real, not labeled as examples)

4. CONVERSION OPTIMIZATION (turning visitors into leads):
   - Clear, compelling CTAs with urgency (not spammy)
   - Value proposition is instantly clear in the hero
   - Objection handling in FAQs and about sections
   - Multiple contact points throughout the page

5. READABILITY AND HUMAN APPEAL:
   - Sentences are scannable, not walls of text
   - No excessive jargon
   - Emotional resonance with the target customer's pain points
   - Professional but approachable tone

6. TECHNICAL SEO:
   - Proper heading hierarchy (H1 → H2 → H3)
   - Keyword-rich but natural headings
   - Alt text readiness for images
   - Internal linking suggestions between sections

FIX EVERY ISSUE YOU FIND. Return ONLY the sections that changed in "section_fixes" (a partial content object — do NOT include unchanged sections). Each key in section_fixes should match the original content structure (e.g. hero, services, about, valueProps, process, faqs, testimonials, finalCta). For each changed section, provide the complete fixed version of that section's object. Also provide a detailed report of every issue found and what fix you applied.`;
}