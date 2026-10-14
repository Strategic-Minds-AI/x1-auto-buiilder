import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { logoPrompt, heroImagePrompt } = body;
    if (!logoPrompt || !heroImagePrompt) {
      return Response.json({ error: 'logoPrompt and heroImagePrompt are required' }, { status: 400 });
    }

    const [logoRes, heroRes] = await Promise.allSettled([
      base44.asServiceRole.integrations.Core.GenerateImage({ prompt: logoPrompt }),
      base44.asServiceRole.integrations.Core.GenerateImage({ prompt: heroImagePrompt }),
    ]);

    return Response.json({
      logoUrl: logoRes.status === 'fulfilled' ? logoRes.value.url : null,
      heroImageUrl: heroRes.status === 'fulfilled' ? heroRes.value.url : null,
      logoError: logoRes.status === 'rejected' ? String(logoRes.reason?.message || logoRes.reason) : null,
      heroError: heroRes.status === 'rejected' ? String(heroRes.reason?.message || heroRes.reason) : null,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}