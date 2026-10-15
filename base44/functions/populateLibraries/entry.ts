import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const INDUSTRIES = [
  'roofing', 'hvac', 'plumbing', 'dental', 'legal', 'restaurant', 'fitness', 'realestate',
  'accounting', 'medspa', 'automotive', 'construction', 'electrical', 'landscaping', 'painting',
  'cleaning', 'pest control', 'veterinary', 'optometry', 'chiropractic', 'physical therapy',
  'dermatology', 'pediatrics', 'orthopedics', 'cardiology', 'mental health', 'addiction treatment',
  'cosmetic surgery', 'tattoo studio', 'hair salon', 'nail salon', 'barber shop', 'spa',
  'massage therapy', 'acupuncture', 'nutritionist', 'personal trainer', 'yoga studio',
  'martial arts', 'dance studio', 'music school', 'art gallery', 'photography', 'videographer',
  'wedding planner', 'event venue', 'catering', 'food truck', 'bakery', 'coffee shop',
  'bar pub', 'winery', 'brewery', 'hotel', 'bed breakfast', 'travel agency', 'car rental',
  'moving company', 'storage units', 'junk removal', 'tree service', 'pool service',
  'solar installation', 'insulation', 'windows doors', 'flooring', 'roofing', 'siding',
  'masonry', 'fencing', 'deck building', 'kitchen remodeling', 'bathroom remodeling',
  'basement finishing', 'home inspection', 'property management', 'mortgage broker',
  'insurance agency', 'financial advisor', 'tax preparation', 'bookkeeping', 'payroll service',
  'marketing agency', 'web design', 'SEO consultant', 'PR firm', 'advertising agency',
  'IT services', 'computer repair', 'data recovery', 'cybersecurity', 'software development',
  'app development', 'cloud consulting', 'managed services', 'VOIP phone', 'security systems',
  'locksmith', 'garage door', 'appliance repair', 'furniture repair', 'tailor', 'dry cleaner',
  'laundry service', 'pet grooming', 'dog walking', 'pet boarding', 'aquarium maintenance',
  'tutoring', 'driving school', 'test prep', 'language school', 'coding bootcamp',
  'career coaching', 'life coaching', 'business consulting', 'HR consulting', 'legal mediation',
  'notary service', 'passport photo', 'fingerprinting', 'DNA testing', 'drug testing',
  'medical billing', 'home health care', 'senior care', 'assisted living', 'hospice care',
  'funeral home', 'memorial services', 'cemetery', 'cremation services', 'estate planning',
  'immigration law', 'family law', 'criminal defense', 'personal injury', 'corporate law',
  'intellectual property', 'bankruptcy law', 'workers compensation', 'social security disability',
  'veterans benefits', 'tax law', 'real estate law', 'employment law', 'divorce mediation',
  'mediation services', 'arbitration', 'court reporting', 'process serving', 'bail bonds',
];

const PROFILE_SCHEMA = {
  type: 'object',
  properties: {
    profiles: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          business_name: { type: 'string' },
          industry: { type: 'string' },
          tagline: { type: 'string' },
          color_tokens: {
            type: 'object',
            properties: {
              primary: { type: 'string' },
              accent: { type: 'string' },
              background: { type: 'string' },
              text: { type: 'string' }
            }
          },
          logo_prompt: { type: 'string' },
          hero_image_prompt: { type: 'string' },
          hero_headline: { type: 'string' },
          hero_subheadline: { type: 'string' },
          services: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' }
              }
            }
          },
          value_props: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' }
              }
            }
          }
        },
        required: ['business_name', 'industry', 'tagline', 'color_tokens', 'logo_prompt', 'hero_image_prompt', 'hero_headline', 'hero_subheadline']
      }
    }
  },
  required: ['profiles']
};

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const count = Math.min(body.count || 300, 500);
    const batchSize = 50;
    const batches = Math.ceil(count / batchSize);

    let allProfiles = [];

    for (let b = 0; b < batches; b++) {
      const remaining = count - allProfiles.length;
      const thisBatch = Math.min(batchSize, remaining);

      // Pick diverse industries for this batch
      const startIdx = (b * batchSize) % INDUSTRIES.length;
      const batchIndustries = [];
      for (let i = 0; i < thisBatch; i++) {
        batchIndustries.push(INDUSTRIES[(startIdx + i) % INDUSTRIES.length]);
      }

      const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt:
          'You are a brand strategist. Generate ' + thisBatch + ' diverse, creative business profiles for a digital business factory library. ' +
          'Each profile must have a UNIQUE, realistic business name (not generic like "ABC Corp"), a specific industry, a compelling tagline, ' +
          'a cohesive color palette (4 hex values: primary, accent, background, text — make them visually distinct and industry-appropriate), ' +
          'a detailed logo generation prompt (clean modern professional logo mark, no text, describe style and colors), ' +
          'a detailed hero image generation prompt (cinematic photorealistic image representing this industry), ' +
          'a hero headline and subheadline, 3-4 services with titles and descriptions, and 3-4 value propositions with titles and descriptions. ' +
          'Assign each business to this industry (in order): ' + batchIndustries.join(', ') + '. ' +
          'Make every profile feel like a real, distinct business — vary the naming style, color palette, and tone across profiles. ' +
          'Return JSON with a "profiles" array.',
        response_json_schema: PROFILE_SCHEMA
      });

      allProfiles = allProfiles.concat(res.profiles || []);
    }

    // Create WebsiteProject records
    const records = allProfiles.map(function(p) {
      const slug = (p.business_name || 'business').toLowerCase().replace(/[^a-z0-9]+/g, '');
      return {
        business_name: p.business_name,
        business_website: 'https://' + slug + '.com',
        industry: p.industry,
        status: 'generated',
        content: {
          hero: { headline: p.hero_headline, subheadline: p.hero_subheadline },
          colorTokens: p.color_tokens,
          services: p.services || [],
          valueProps: p.value_props || [],
          tagline: p.tagline,
          logoPrompt: p.logo_prompt,
          heroImagePrompt: p.hero_image_prompt
        },
        logo_prompt: p.logo_prompt,
        hero_image_prompt: p.hero_image_prompt
      };
    });

    let created = 0;
    for (let i = 0; i < records.length; i += 200) {
      const batch = records.slice(i, i + 200);
      await base44.entities.WebsiteProject.bulkCreate(batch);
      created += batch.length;
    }

    return Response.json({
      generated: allProfiles.length,
      created: created,
      message: 'Generated ' + created + ' business profiles across ' + new Set(allProfiles.map(p => p.industry)).size + ' industries'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}