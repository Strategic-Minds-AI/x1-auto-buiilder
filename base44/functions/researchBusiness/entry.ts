import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { skipTraceBusiness, benchmarkIndustry } from '../../shared/websiteResearch.js';

function capitalize(s) {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const businessWebsiteUrl = body.businessWebsiteUrl;
    const industry = body.industry || 'General';
    const businessName = body.businessName || '';

    if (!businessWebsiteUrl) {
      return Response.json({ error: 'A business website URL is required' }, { status: 400 });
    }

    // Normalize URL
    let url = businessWebsiteUrl.trim();
    if (!url.startsWith('http')) url = 'https://' + url;

    // Run skip-trace + benchmark in parallel
    const [businessResearch, benchmark] = await Promise.all([
      skipTraceBusiness(base44, url, industry, businessName),
      benchmarkIndustry(base44, industry),
    ]);

    // Auto-structure into a WebsiteProject so the data flows directly into onboarding
    const project = await base44.entities.WebsiteProject.create({
      business_name: businessResearch.businessName || businessName || '',
      business_website: url,
      industry,
      status: 'researching',
      business_research: businessResearch,
      benchmark,
    });

    // Build the pre-filled onboarding payload from extracted research
    const onboardingPrefill = {
      businessName: businessResearch.businessName || businessName || '',
      businessWebsiteUrl: url,
      industry,
      serviceArea: businessResearch.serviceArea || '',
      goal: 'More qualified leads',
      tone: businessResearch.tone ? capitalize(businessResearch.tone) : 'Professional',
    };

    return Response.json({
      businessResearch,
      benchmark,
      sourceUrl: url,
      industry,
      projectId: project.id,
      onboardingPrefill,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}