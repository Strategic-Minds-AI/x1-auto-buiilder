// Shared Google compliance logic used by runComplianceCheck and autoFixCompliance.
import { renderSiteHtml } from './siteRenderer.js';

// The canonical Google standards the system evaluates every site against.
// Seeded into the GoogleStandard entity on first run; the LLM checks the
// site's content blueprint against these and returns per-standard results.
export const GOOGLE_STANDARDS = [
  // SEO
  { category: 'SEO', requirement: 'Unique, descriptive title tag under 60 characters containing the primary keyword and business name', check_description: 'Title is present, under 60 chars, includes primary keyword and business name', weight: 5, fix_strategy: 'Rewrite the hero headline and metaDescription to include the primary industry keyword and business name within 60 characters' },
  { category: 'SEO', requirement: 'Meta description between 120-160 characters with compelling copy and primary keyword', check_description: 'metaDescription exists, 120-160 chars, includes primary keyword', weight: 4, fix_strategy: 'Rewrite metaDescription to 120-160 chars with the primary keyword and a compelling call to action' },
  { category: 'SEO', requirement: 'Single H1 tag with the primary keyword, followed by logical H2/H3 hierarchy', check_description: 'Hero headline serves as H1 and includes the primary keyword; section headings use H2', weight: 5, fix_strategy: 'Ensure the hero headline contains the primary keyword and all section titles are concise H2-level headings' },
  { category: 'SEO', requirement: 'Content depth of 800+ words across the page with comprehensive topic coverage', check_description: 'Total content across hero, services, about, FAQs, and testimonials exceeds 800 words', weight: 4, fix_strategy: 'Expand service descriptions, about section, and FAQs to increase total word count above 800' },
  { category: 'SEO', requirement: 'Internal linking between sections with descriptive anchor text', check_description: 'CTAs and navigation link to relevant on-page sections with descriptive text', weight: 3, fix_strategy: 'Add internal links from hero CTAs and value props to the services and contact sections' },
  // AEO
  { category: 'AEO', requirement: 'FAQ section with 5+ question-answer pairs targeting common search queries', check_description: 'FAQs array has 5+ entries with clear questions and concise direct answers', weight: 5, fix_strategy: 'Add or expand FAQs to at least 5 question-answer pairs targeting common industry search queries' },
  { category: 'AEO', requirement: 'Direct-answer content: concise summary blocks that AI overviews can cite', check_description: 'Value props and service descriptions start with a direct, citable answer sentence', weight: 4, fix_strategy: 'Rewrite value prop and service descriptions to lead with a concise direct-answer sentence' },
  { category: 'AEO', requirement: 'Question-targeted headings matching natural-language search queries', check_description: 'FAQ questions and section headings match how users phrase search queries', weight: 3, fix_strategy: 'Rewrite FAQ questions and section headings to match natural-language search queries' },
  // GEO
  { category: 'GEO', requirement: 'Location-specific content: city/region referenced in hero, about, and CTAs', check_description: 'Location appears in hero headline/subheadline, about section, and final CTA', weight: 5, fix_strategy: 'Weave the target city/region into the hero subheadline, about body, and final CTA headline' },
  { category: 'GEO', requirement: 'Local trust signals: service area, phone, and address prominently displayed', check_description: 'Service area, phone number, and address are present and visible in the content', weight: 4, fix_strategy: 'Add or surface the service area, phone, and address in the hero or contact section' },
  { category: 'GEO', requirement: 'Location-specific FAQ and testimonial content for local relevance', check_description: 'At least one FAQ and one testimonial reference the local area', weight: 3, fix_strategy: 'Add a location-specific FAQ and a testimonial that references the local area' },
  // Technical
  { category: 'Technical', requirement: 'Canonical URL and proper meta viewport tag in the HTML head', check_description: 'The rendered HTML includes a canonical link and viewport meta tag', weight: 4, fix_strategy: 'Ensure the site renderer outputs a canonical link and viewport meta tag in the head' },
  { category: 'Technical', requirement: 'JSON-LD structured data for LocalBusiness or Service schema', check_description: 'The rendered HTML includes JSON-LD structured data with business name, address, and phone', weight: 5, fix_strategy: 'Add JSON-LD LocalBusiness schema to the rendered HTML with business name, address, phone, and services' },
  { category: 'Technical', requirement: 'Mobile-responsive layout with proper viewport scaling', check_description: 'The rendered HTML uses responsive CSS with a viewport meta tag and mobile media queries', weight: 4, fix_strategy: 'Ensure the site renderer includes responsive CSS and a viewport meta tag' },
  { category: 'Technical', requirement: 'Semantic HTML5 structure with header, nav, main, section, footer', check_description: 'The rendered HTML uses semantic HTML5 landmarks', weight: 3, fix_strategy: 'Use semantic HTML5 tags in the site renderer' },
  // Content
  { category: 'Content', requirement: '100% original content with no copied or spun text from benchmark sites', check_description: 'Content is original and specific to this business, not generic filler', weight: 5, fix_strategy: 'Rewrite any generic content to be specific and original to this business and location' },
  { category: 'Content', requirement: 'E-E-A-T signals: expertise, experience, authoritativeness, and trust signals', check_description: 'About section, testimonials, and process sections demonstrate expertise and trust', weight: 4, fix_strategy: 'Strengthen the about section with expertise signals and add specific, credible testimonials' },
  { category: 'Content', requirement: 'People-first helpful content that answers user intent, not keyword-stuffed', check_description: 'Content reads naturally and answers user intent without keyword stuffing', weight: 4, fix_strategy: 'Rewrite content to be people-first and helpful, removing any keyword stuffing' },
  { category: 'Content', requirement: 'Clear primary conversion goal with prominent call-to-action', check_description: 'A single primary CTA is prominent in the hero and repeated in the final CTA section', weight: 4, fix_strategy: 'Ensure a clear primary CTA in the hero and a strong final CTA section' },
];

export const COMPLIANCE_SCHEMA = {
  type: 'object',
  properties: {
    overall_score: { type: 'number' },
    category_scores: {
      type: 'object',
      properties: {
        SEO: { type: 'number' },
        AEO: { type: 'number' },
        GEO: { type: 'number' },
        Technical: { type: 'number' },
        Content: { type: 'number' }
      }
    },
    checks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          requirement: { type: 'string' },
          status: { type: 'string', enum: ['pass', 'fail', 'warning'] },
          recommendation: { type: 'string' }
        },
        required: ['category', 'requirement', 'status', 'recommendation']
      }
    },
    recommendations: {
      type: 'array',
      items: { type: 'string' }
    }
  },
  required: ['overall_score', 'category_scores', 'checks', 'recommendations']
};

// Runs the LLM compliance evaluation against the stored Google standards.
export async function evaluateCompliance(base44, project) {
  const standards = GOOGLE_STANDARDS.map(function (s) {
    return '- [' + s.category + '] ' + s.requirement + ' (Check: ' + s.check_description + ')';
  }).join('\n');

  const html = renderSiteHtml(project);

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    model: 'claude-sonnet-5',
    prompt:
      'You are a Google Search Quality Evaluator and technical SEO/AEO/GEO auditor. Evaluate this website content blueprint and rendered HTML against Google programmatic requirements.\n\n' +
      'For EACH standard below, assign a status of pass, fail, or warning, and write a specific, actionable recommendation if not a pass.\n' +
      'Calculate an overall_score (0-100) and per-category scores (0-100) for SEO, AEO, GEO, Technical, and Content.\n' +
      'List the top 5 recommendations to reach 90%+ compliance.\n\n' +
      'GOOGLE STANDARDS TO CHECK:\n' + standards + '\n\n' +
      'BUSINESS: ' + (project.business_name || '') + '\n' +
      'INDUSTRY: ' + (project.industry || '') + '\n' +
      'LOCATION: ' + (project.location || '') + '\n\n' +
      'CONTENT BLUEPRINT JSON:\n' + JSON.stringify(project.content || {}) + '\n\n' +
      'BUSINESS RESEARCH:\n' + JSON.stringify(project.business_research || {}) + '\n\n' +
      'RENDERED HTML (first 4000 chars):\n' + html.slice(0, 4000),
    response_json_schema: COMPLIANCE_SCHEMA
  });

  return {
    overall_score: Math.round(result.overall_score || 0),
    category_scores: result.category_scores || {},
    checks: (result.checks || []).map(function (c) {
      return Object.assign({}, c, { auto_fixed: false });
    }),
    recommendations: result.recommendations || []
  };
}

// Uses the LLM to regenerate the content blueprint fixing all failing checks.
export async function autoFixContent(base44, project, report) {
  const failedChecks = (report.checks || [])
    .filter(function (c) { return c.status !== 'pass'; })
    .map(function (c) { return '- [' + c.category + '] ' + c.requirement + ' -> ' + c.recommendation; })
    .join('\n');

  const fixedContent = await base44.asServiceRole.integrations.Core.InvokeLLM({
    model: 'claude-sonnet-5',
    prompt:
      'You are an elite website content strategist. The following website content blueprint FAILED several Google compliance checks. ' +
      'Rewrite and improve the ENTIRE content blueprint to fix every failing check while preserving the structure, tone, and conversion focus. ' +
      'Make the content 100% original, people-first, and locally relevant. Return a complete, valid content blueprint JSON with the same structure (hero, services, valueProps, about, process, testimonials, faqs, finalCta, logoPrompt, heroImagePrompt, metaDescription, colorTokens).\n\n' +
      'BUSINESS: ' + (project.business_name || '') + '\n' +
      'INDUSTRY: ' + (project.industry || '') + '\n' +
      'LOCATION: ' + (project.location || '') + '\n\n' +
      'CURRENT CONTENT:\n' + JSON.stringify(project.content || {}) + '\n\n' +
      'FAILING CHECKS TO FIX:\n' + failedChecks + '\n\n' +
      'TOP RECOMMENDATIONS:\n' + (report.recommendations || []).join('\n'),
    response_json_schema: {
      type: 'object',
      properties: {
        hero: { type: 'object', properties: { headline: { type: 'string' }, subheadline: { type: 'string' }, primaryCta: { type: 'string' }, secondaryCta: { type: 'string' } } },
        services: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' }, description: { type: 'string' } } } },
        valueProps: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' }, description: { type: 'string' } } } },
        about: { type: 'object', properties: { headline: { type: 'string' }, body: { type: 'string' } } },
        process: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' }, description: { type: 'string' } } } },
        testimonials: { type: 'array', items: { type: 'object', properties: { quote: { type: 'string' }, author: { type: 'string' }, role: { type: 'string' } } } },
        faqs: { type: 'array', items: { type: 'object', properties: { question: { type: 'string' }, answer: { type: 'string' } } } },
        finalCta: { type: 'object', properties: { headline: { type: 'string' }, button: { type: 'string' } } },
        logoPrompt: { type: 'string' },
        heroImagePrompt: { type: 'string' },
        metaDescription: { type: 'string' },
        colorTokens: { type: 'object', properties: { primary: { type: 'string' }, accent: { type: 'string' }, background: { type: 'string' } } }
      },
      required: ['hero', 'services', 'valueProps', 'about', 'faqs', 'finalCta', 'metaDescription']
    }
  });

  return fixedContent;
}

// Seeds the Google standards into the entity if not already present.
export async function seedStandards(base44) {
  const existing = await base44.asServiceRole.entities.GoogleStandard.count({});
  if (existing > 0) return;
  await base44.asServiceRole.entities.GoogleStandard.bulkCreate(
    GOOGLE_STANDARDS.map(function (s) {
      return {
        category: s.category,
        requirement: s.requirement,
        check_description: s.check_description,
        weight: s.weight,
        fix_strategy: s.fix_strategy
      };
    })
  );
}