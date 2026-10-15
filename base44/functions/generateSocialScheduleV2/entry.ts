import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const PLATFORMS = ['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok'];

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const projectId = body.projectId;
    const platforms = body.platforms && body.platforms.length > 0 ? body.platforms : PLATFORMS;
    const generateImages = body.generateImages === true;

    if (!projectId) return Response.json({ error: 'projectId is required' }, { status: 400 });

    const project = await base44.entities.WebsiteProject.get(projectId);
    if (!project) return Response.json({ error: 'Project not found' }, { status: 404 });

    const startDate = new Date();
    let allPosts = [];

    // Generate one platform at a time to avoid timeout
    for (const platform of platforms) {
      const scheduleRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt:
          'You are a social media marketing expert. Generate 30 days of social media posts for a "' + (project.industry || '') + '" business on ' + platform.toUpperCase() + '.\n\n' +
          'BUSINESS: ' + (project.business_name || '') + '\n' +
          'INDUSTRY: ' + (project.industry || '') + '\n' +
          'LOCATION: ' + (project.location || '') + '\n' +
          'SERVICES: ' + JSON.stringify(((project.content || {}).services || []).map(function(s) { return s.title; })) + '\n' +
          'VALUE PROPS: ' + JSON.stringify(((project.content || {}).valueProps || []).map(function(v) { return v.title; })) + '\n\n' +
          'Generate 30 posts (one per day) for ' + platform + '. Each post must have: content tailored to ' + platform + ' style, 3-5 hashtags, an image_prompt, and a post_type (promotional, educational, testimonial, behind_the_scenes, community, tips, call_to_action). ' +
          'Mix content types for variety. Make content locally relevant to ' + (project.location || 'the service area') + '. ' +
          'Return JSON with a "schedule" array of 30 items, each with: day (1-30), content, hashtags (array), image_prompt, post_type.',
        response_json_schema: {
          type: 'object',
          properties: {
            schedule: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  day: { type: 'number' },
                  content: { type: 'string' },
                  hashtags: { type: 'array', items: { type: 'string' } },
                  image_prompt: { type: 'string' },
                  post_type: { type: 'string' }
                },
                required: ['day', 'content', 'hashtags']
              }
            }
          },
          required: ['schedule']
        }
      });

      const platformPosts = (scheduleRes.schedule || []).map(function(post) {
        const postDate = new Date(startDate);
        postDate.setDate(postDate.getDate() + (post.day - 1));
        return {
          project_id: projectId,
          campaign_id: project.campaign_id || '',
          platform: platform,
          content: post.content,
          hashtags: post.hashtags || [],
          scheduled_date: postDate.toISOString(),
          day_number: post.day,
          status: 'draft',
          image_prompt: post.image_prompt || '',
          post_type: post.post_type || 'promotional'
        };
      });

      allPosts = allPosts.concat(platformPosts);
    }

    // Bulk create all posts
    let created = [];
    if (allPosts.length > 0) {
      for (let i = 0; i < allPosts.length; i += 200) {
        const batch = allPosts.slice(i, i + 200);
        const res = await base44.entities.SocialPost.bulkCreate(batch);
        const batchCreated = Array.isArray(res) ? res : (res.records || []);
        created = created.concat(batchCreated);
      }
    }

    // Generate images for first 10 posts if requested
    let imagesGenerated = 0;
    if (generateImages && created.length > 0) {
      const firstBatch = created.slice(0, 10);
      const imagePromises = firstBatch.map(async function(post) {
        if (!post.image_prompt) return;
        try {
          const imgRes = await base44.asServiceRole.integrations.Core.GenerateImage({ prompt: post.image_prompt });
          if (imgRes && imgRes.url) {
            await base44.entities.SocialPost.update(post.id, { image_url: imgRes.url });
            imagesGenerated++;
          }
        } catch (e) { /* skip failed images */ }
      });
      await Promise.allSettled(imagePromises);
    }

    return Response.json({
      projectId: projectId,
      platforms: platforms,
      totalPosts: created.length,
      imagesGenerated: imagesGenerated,
      posts: created
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}