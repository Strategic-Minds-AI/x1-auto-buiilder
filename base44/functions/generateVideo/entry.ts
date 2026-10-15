import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const prompt = (body?.prompt || '').trim();
    const aspectRatio = body?.aspect_ratio === '9:16' ? '9:16' : '16:9';
    const generateAudio = !!body?.generate_audio;

    if (!prompt || prompt.length < 10) {
      return Response.json({ error: 'Prompt must be at least 10 characters' }, { status: 400 });
    }
    if (prompt.length > 1000) {
      return Response.json({ error: 'Prompt must be under 1000 characters' }, { status: 400 });
    }

    const result = await base44.asServiceRole.integrations.Core.GenerateVideo({
      prompt,
      aspect_ratio: aspectRatio,
      generate_audio: generateAudio,
    });

    return Response.json({ url: result.url });
  } catch (error) {
    return Response.json({ error: error.message || 'Video generation failed' }, { status: 500 });
  }
}