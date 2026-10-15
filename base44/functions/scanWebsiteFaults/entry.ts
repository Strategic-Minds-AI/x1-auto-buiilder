import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { website_url, business_name, industry, faultLineScanId } = body;

    if (!website_url) return Response.json({ error: 'Website URL required' }, { status: 400 });

    // Update status to scanning
    if (faultLineScanId) {
      await base44.entities.FaultLineScan.update(faultLineScanId, { status: 'scanning' });
    }

    // Use InvokeLLM with web search to scan the website for problems
    const scanPrompt = `You are an expert web auditor and SEO specialist. Scan the website at ${website_url} for problems that would hurt their business.

Analyze for:
1. SEO ISSUES: Missing meta tags, poor title/description, missing structured data, slow loading indicators, missing alt text, broken internal links, thin content, duplicate content
2. CONVERSION ISSUES: Weak CTAs, confusing navigation, too many form fields, missing trust signals, no phone number, no clear value proposition, poor mobile experience
3. TECHNICAL ISSUES: Missing HTTPS, slow page speed indicators, broken images, missing favicon, poor HTML structure, accessibility violations
4. CONTENT ISSUES: Outdated content, missing service pages, no blog/content marketing, poor local SEO, missing FAQ, no testimonials/reviews
5. DESIGN ISSUES: Outdated design, poor visual hierarchy, inconsistent branding, low-quality images, poor color contrast
6. BUSINESS ISSUES: No clear contact method, missing business hours, no service area info, no pricing transparency, missing about page

For each problem found, provide:
- Type (seo, conversion, technical, content, design, business)
- Severity (critical, high, medium, low)
- Description of the problem
- Specific recommendation to fix it
- Estimated impact on their business (revenue loss, lost leads, poor ranking)

Then generate a professional outreach message to the business owner explaining the problems found and offering to help fix them. The message should be:
- Professional and consultative (not salesy)
- Specific to their actual problems
- Include 2-3 concrete examples of issues found
- Offer a free audit or consultation
- Include a clear next step

Return a JSON object with the problems array and outreach message.`;

    const scanResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: scanPrompt,
      add_context_from_internet: true,
      model: 'gemini_3_8_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          problems: {
            type: 'array',
            description: 'List of problems found',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string' },
                severity: { type: 'string' },
                title: { type: 'string' },
                description: { type: 'string' },
                recommendation: { type: 'string' },
                impact: { type: 'string' }
              }
            }
          },
          severityScore: { type: 'number', description: '0-100, higher = more problems' },
          outreachMessage: { type: 'string', description: 'Professional outreach message to the business' },
          summary: { type: 'string', description: 'One-paragraph summary of findings' },
          topProblems: { type: 'array', description: 'Top 3 most critical problems' }
        }
      }
    });

    const problems = scanResult.problems || [];
    const problemCount = problems.length;
    const severityScore = scanResult.severityScore || 0;
    const outreachMessage = scanResult.outreachMessage || '';

    // Update or create the scan record
    if (faultLineScanId) {
      await base44.entities.FaultLineScan.update(faultLineScanId, {
        status: 'outreach_drafted',
        problems_found: problems,
        problem_count: problemCount,
        severity_score: severityScore,
        outreach_message: outreachMessage,
        outreach_status: 'drafted',
        scan_date: new Date().toISOString()
      });
    }

    return Response.json({
      success: true,
      problems,
      problemCount,
      severityScore,
      outreachMessage,
      summary: scanResult.summary || '',
      topProblems: scanResult.topProblems || [],
      faultLineScanId
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}