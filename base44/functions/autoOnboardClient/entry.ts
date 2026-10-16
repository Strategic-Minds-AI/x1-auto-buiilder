import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { skipTraceBusiness, benchmarkIndustry } from '../../shared/websiteResearch.js';

function capitalize(s) {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

// ─── Auto-Onboard Client ───────────────────────────────────────────
// Triggered automatically when a new Client is created.
// Runs skip-tracing + industry benchmark, then populates the client
// record with all research data so the portal is ready to build.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { client_id, website, industry, businessName } = body;

    if (!client_id) return Response.json({ error: 'client_id is required' }, { status: 400 });

    // Fetch the client record
    const client = await base44.asServiceRole.entities.Client.get(client_id);
    if (!client) return Response.json({ error: 'Client not found' }, { status: 404 });

    // Determine website URL — prefer explicit, fall back to client record
    const siteUrl = website || client.website;
    const targetIndustry = industry || client.industry || 'General';
    const targetName = businessName || client.name || '';

    // Update status to researching
    await base44.asServiceRole.entities.Client.update(client_id, {
      status: 'researching',
    });

    let businessResearch = null;
    let benchmark = null;
    let onboardingPrefill = null;
    let researchError = null;

    if (siteUrl) {
      try {
        // Normalize URL
        let url = siteUrl.trim();
        if (!url.startsWith('http')) url = 'https://' + url;

        // Run skip-trace + benchmark in parallel
        const [research, bench] = await Promise.all([
          skipTraceBusiness(base44, url, targetIndustry, targetName),
          benchmarkIndustry(base44, targetIndustry),
        ]);

        businessResearch = research;
        benchmark = bench;

        // Build pre-filled onboarding payload from extracted research
        onboardingPrefill = {
          businessName: research.businessName || targetName || '',
          businessWebsiteUrl: url,
          industry: targetIndustry,
          serviceArea: research.serviceArea || '',
          goal: 'More qualified leads',
          tone: research.tone ? capitalize(research.tone) : 'Professional',
        };
      } catch (err) {
        researchError = err.message;
      }
    } else {
      // No website — run benchmark only, flag for manual research
      try {
        benchmark = await benchmarkIndustry(base44, targetIndustry);
        researchError = 'No website URL provided — skip-tracing skipped. Industry benchmark completed.';
      } catch (err) {
        researchError = 'No website URL and benchmark failed: ' + err.message;
      }
    }

    // Update the client with all research data
    await base44.asServiceRole.entities.Client.update(client_id, {
      status: researchError && !businessResearch ? 'onboarding' : 'active',
      business_research: businessResearch,
      benchmark,
      onboarding_prefill: onboardingPrefill,
      research_completed_at: new Date().toISOString(),
      research_error: researchError,
    });

    // Also create a WebsiteProject so the data flows into the build pipeline
    let projectId = null;
    if (businessResearch) {
      const project = await base44.asServiceRole.entities.WebsiteProject.create({
        business_name: businessResearch.businessName || targetName || '',
        business_website: siteUrl,
        industry: targetIndustry,
        status: 'researching',
        business_research: businessResearch,
        benchmark,
      });
      projectId = project.id;
    }

    return Response.json({
      ok: true,
      client_id,
      client_name: targetName,
      has_research: !!businessResearch,
      has_benchmark: !!benchmark,
      research_error: researchError,
      project_id: projectId,
      onboarding_prefill: onboardingPrefill,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}