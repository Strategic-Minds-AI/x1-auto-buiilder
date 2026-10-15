import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Check domain availability using RDAP (Registration Data Access Protocol) — public, no auth needed.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { domain } = body;
    if (!domain) return Response.json({ error: 'Domain is required' }, { status: 400 });

    const cleanDomain = domain.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];

    // Use RDAP — the official registry lookup protocol
    const rdapUrl = `https://rdap.org/domain/${cleanDomain}`;
    const response = await fetch(rdapUrl, {
      headers: { 'Accept': 'application/rdap+json' },
      signal: AbortSignal.timeout(10000)
    });

    if (response.status === 404) {
      // 404 from RDAP means the domain is NOT registered — available
      return Response.json({
        domain: cleanDomain,
        available: true,
        status: 'AVAILABLE',
        message: `${cleanDomain} appears to be available for registration.`,
        checkedAt: new Date().toISOString()
      });
    }

    if (response.ok) {
      const data = await response.json();
      const events = data.events || [];
      const registration = events.find(e => e.eventAction === 'registration');
      const expiration = events.find(e => e.eventAction === 'expiration');
      const registrar = (data.entities || []).find(e => (e.roles || []).includes('registrar'));

      return Response.json({
        domain: cleanDomain,
        available: false,
        status: 'REGISTERED',
        message: `${cleanDomain} is already registered.`,
        registrationDate: registration?.eventDate || null,
        expirationDate: expiration?.eventDate || null,
        registrar: registrar?.vcardArray?.[1]?.find(v => v[0] === 'fn')?.[3] || null,
        checkedAt: new Date().toISOString()
      });
    }

    // Any other status — unknown
    return Response.json({
      domain: cleanDomain,
      available: null,
      status: 'UNKNOWN',
      message: `Could not determine availability for ${cleanDomain}. RDAP returned ${response.status}.`,
      checkedAt: new Date().toISOString()
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}