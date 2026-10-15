import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { getIndustryPrompt } from '../../shared/industryPrompts.js';

// Comprehensive content generator — produces a full content blueprint for any
// business/industry/location combination, using industry-specific prompt libraries.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { businessName, industry, location, tone, goal, businessResearch } = body;

    if (!businessName || !industry) {
      return Response.json({ error: 'businessName and industry are required' }, { status: 400 });
    }

    const contentPrompt = getIndustryPrompt(industry, 'website_content');
    const socialPrompt = getIndustryPrompt(industry, 'social_content');
    const videoPrompt = getIndustryPrompt(industry, 'video_script');
    const seoPrompt = getIndustryPrompt(industry, 'seo_audit');
    const industryTone = getIndustryPrompt(industry, 'tone');

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      model: 'claude-sonnet-5',
      prompt:
        contentPrompt + '\n\n' +
        'BUSINESS: ' + businessName + '\n' +
        'INDUSTRY: ' + industry + '\n' +
        'LOCATION: ' + (location || 'National') + '\n' +
        'TONE: ' + (tone || industryTone) + '\n' +
        'PRIMARY GOAL: ' + (goal || 'Lead generation') + '\n\n' +
        'BUSINESS RESEARCH:\n' + JSON.stringify(businessResearch || {}) + '\n\n' +
        'Generate a COMPLETE content blueprint with ALL of the following sections:\n' +
        '1. hero: { headline, subheadline, primaryCta, secondaryCta }\n' +
        '2. services: array of { title, description } (5-7 services)\n' +
        '3. valueProps: array of { title, description } (3-5 value propositions)\n' +
        '4. about: { headline, body } (demonstrating E-E-A-T expertise)\n' +
        '5. process: array of { title, description } (4-6 steps)\n' +
        '6. testimonials: array of { quote, author, role } (3-5 testimonials, realistic but clearly marked as examples)\n' +
        '7. faqs: array of { question, answer } (6-8 FAQs targeting common search queries)\n' +
        '8. finalCta: { headline, button }\n' +
        '9. logoPrompt: string (detailed prompt for AI logo generation)\n' +
        '10. heroImagePrompt: string (detailed prompt for AI hero image generation)\n' +
        '11. metaDescription: string (120-160 chars with primary keyword)\n' +
        '12. colorTokens: { primary, accent, background, text, secondary }\n' +
        '13. socialContentPlan: array of { platform, postType, caption, hashtags } (5 sample posts)\n' +
        '14. videoScriptOutline: { hook, problem, solution, cta, duration } \n' +
        '15. seoKeywords: array of strings (10-15 target keywords)\n\n' +
        'Make all content 100% original, people-first, locally relevant, and conversion-focused. ' +
        'Weave the location naturally into the content. Do not keyword-stuff.',
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
          colorTokens: { type: 'object', properties: { primary: { type: 'string' }, accent: { type: 'string' }, background: { type: 'string' }, text: { type: 'string' }, secondary: { type: 'string' } } },
          socialContentPlan: { type: 'array', items: { type: 'object', properties: { platform: { type: 'string' }, postType: { type: 'string' }, caption: { type: 'string' }, hashtags: { type: 'array', items: { type: 'string' } } } } },
          videoScriptOutline: { type: 'object', properties: { hook: { type: 'string' }, problem: { type: 'string' }, solution: { type: 'string' }, cta: { type: 'string' }, duration: { type: 'string' } } },
          seoKeywords: { type: 'array', items: { type: 'string' } }
        },
        required: ['hero', 'services', 'valueProps', 'about', 'process', 'testimonials', 'faqs', 'finalCta', 'metaDescription', 'colorTokens', 'socialContentPlan', 'videoScriptOutline', 'seoKeywords']
      }
    });

    return Response.json({
      businessName,
      industry,
      location: location || 'National',
      content: result,
      promptSource: 'industry-specific'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}