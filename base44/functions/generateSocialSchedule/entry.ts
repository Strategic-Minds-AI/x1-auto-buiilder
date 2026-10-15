import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const PLATFORMS = ['facebook', 'instagram', 'twitter', 'linkedin'];

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const projectId = body.projectId;
    const platforms = body.platforms;

    if (!projectId) return Response.json({ error: 'projectId is required' }, { status: 400 });

    const project = await base44.entities.WebsiteProject.get(projectId);
    if (!project) return Response.json({ error: 'Project not found' }, { status: 404 });

    const selectedPlatforms = (platforms && platforms.length > 0) ? platforms : PLATFORMS;

    // Generate 30 days of posts for each platform
    const scheduleRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
      model: 'claude-sonnet-5',
      prompt:
        'You are a social media marketing expert. Generate a 30-day social media content calendar for a "' + (project.industry || '') + '" business.\n\n' +
        'BUSINESS: ' + (project.business_name || '') + '\n' +
        'INDUSTRY: ' + (project.industry || '') + '\n' +
        'LOCATION: ' + (project.location || '') + '\n' +
        'SERVICES: ' + JSON.stringify(((project.content || {}).services || []).map(function(s) { return s.title; })) + '\n' +
        'VALUE PROPS: ' + JSON.stringify(((project.content || {}).valueProps || []).map(function(v) { return v.title; })) + '\n' +
        'HERO HEADLINE: ' + ((project.content || {}).hero || {}).headline + '\n\n' +
        'For EACH of these platforms: ' + selectedPlatforms.join(', ') + ', generate 30 days of posts (one per day per platform). ' +
        'Each post must have: compelling content tailored to the platform style, 3-5 relevant hashtags, and an image_prompt for AI image generation. ' +
        'Mix content types across the 30 days: promotional, educational, testimonial, behind-the-scenes, community engagement, tips, and call-to-action. ' +
        'Make content locally relevant to ' + (project.location || 'the service area') + '. ' +
        'Return JSON with a "schedule" array, each item having: platform, day (1-30), content, hashtags (array of strings), image_prompt.',
      response_json_schema: {
        type: 'object',
        properties: {
          schedule: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                platform: { type: 'string' },
                day: { type: 'number' },
                content: { type: 'string' },
                hashtags: { type: 'array', items: { type: 'string' } },
                image_prompt: { type: 'string' }
              },
              required: ['platform', 'day', 'content', 'hashtags']
            }
          }
        },
        required: ['schedule']
      }
    });

    // Create SocialPost records
    const startDate = new Date();
    const records = (scheduleRes.schedule || []).map(function(post) {
      const postDate = new Date(startDate);
      postDate.setDate(postDate.getDate() + (post.day - 1));
      return {
        project_id: projectId,
        campaign_id: project.campaign_id || '',
        platform: post.platform,
        content: post.content,
        hashtags: post.hashtags || [],
        scheduled_date: postDate.toISOString(),
        day_number: post.day,
        status: 'draft',
        image_prompt: post.image_prompt || ''
      };
    });

    let created = [];
    if (records.length > 0) {
      const res = await base44.entities.SocialPost.bulkCreate(records);
      created = Array.isArray(res) ? res : (res.records || []);
    }

    return Response.json({
      projectId: projectId,
      platforms: selectedPlatforms,
      totalPosts: created.length,
      posts: created
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}