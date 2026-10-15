import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// AI-powered content generation for digital business cards and flyers.
// Takes a business name, industry, and type (business_card | flyer),
// returns realistic content fields via LLM.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { type, businessName, industry } = body;

    if (!type) return Response.json({ error: 'type is required (business_card or flyer)' }, { status: 400 });

    const isCard = type === 'business_card';

    const schema = isCard ? {
      type: "object",
      properties: {
        name: { type: "string", description: "Person's full name" },
        title: { type: "string", description: "Job title" },
        company: { type: "string", description: "Company name" },
        phone: { type: "string" },
        email: { type: "string" },
        website: { type: "string" },
        address: { type: "string" },
        tagline: { type: "string" }
      },
      required: ["name", "company"]
    } : {
      type: "object",
      properties: {
        company: { type: "string" },
        headline: { type: "string", description: "Main attention-grabbing headline" },
        subheadline: { type: "string" },
        body: { type: "string", description: "Descriptive body text" },
        services: { type: "array", items: { type: "string" }, description: "4-6 key services or offerings" },
        offer: { type: "string", description: "Special offer or promotion" },
        cta: { type: "string", description: "Call to action" },
        phone: { type: "string" },
        email: { type: "string" },
        website: { type: "string" },
        address: { type: "string" }
      },
      required: ["headline", "company"]
    };

    const prompt = isCard
      ? `Generate realistic business card content for a ${industry || 'professional'} business${businessName ? ` named "${businessName}"` : ''}.
Create a fictional but realistic professional person who works there. Include:
- Their full name
- Their job title
- The company name
- A phone number (format: (555) XXX-XXXX)
- An email address
- A website URL
- A street address

Make everything consistent and professional. Return as JSON.`
      : `Generate compelling flyer content for a ${industry || 'professional'} business${businessName ? ` named "${businessName}"` : ''}.
Include:
- Company name
- A bold, attention-grabbing headline (5-8 words)
- A supporting subheadline
- A body paragraph describing the business and its value proposition (2-3 sentences)
- 4-6 key services or offerings as an array of short strings
- A special offer or promotion
- A clear call to action (3-5 words)
- Contact info: phone, email, website, address

Make it engaging, professional, and ready to use. Return as JSON.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: schema,
    });

    return Response.json({ content: result });
  } catch (err) {
    return Response.json({ error: err.message || 'Generation failed' }, { status: 500 });
  }
}