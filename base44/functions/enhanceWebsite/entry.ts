import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { contentSchema } from '../../shared/websiteResearch.js';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const { projectId, comment, section, content: passedContent } = body;
    if (!comment || !comment.trim()) return Response.json({ error: 'comment is required' }, { status: 400 });

    let existingContent = passedContent || null;
    let industry = 'general';
    let businessName = 'this business';

    if (!existingContent && projectId) {
      const project = await base44.entities.WebsiteProject.get(projectId);
      if (!project) return Response.json({ error: 'Project not found' }, { status: 404 });
      existingContent = project.content || {};
      industry = project.industry || 'general';
      businessName = project.business_name || existingContent?.hero?.headline || 'this business';
    } else if (existingContent) {
      businessName = existingContent?.hero?.headline || 'this business';
    }

    let enhancedContent;

    if (section && section !== 'all') {
      // Regenerate a single section
      const sectionPrompt = buildSectionPrompt(section, existingContent, comment, industry, businessName);
      const sectionResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
        model: 'claude-sonnet-5',
        prompt: sectionPrompt.prompt,
        response_json_schema: sectionPrompt.schema,
      });
      enhancedContent = { ...existingContent, ...sectionResult };
    } else {
      // Full content enhancement based on comment
      enhancedContent = await base44.asServiceRole.integrations.Core.InvokeLLM({
        model: 'claude-sonnet-5',
        prompt:
          'You are an elite website copywriter and conversion strategist. A website for "' + businessName + '" (industry: ' + industry + ') already exists. ' +
          'The user wants to enhance it with this feedback:\n\n"' + comment + '"\n\n' +
          'Current content:\n' + JSON.stringify(existingContent) + '\n\n' +
          'Apply the user\'s feedback to produce an ULTRA HIGH QUALITY, enhanced version of the complete website content. ' +
          'Make every section more compelling, specific, and conversion-focused. Improve headlines, CTAs, services, about, FAQs, testimonials, value props, and process. ' +
          'If the user mentions colors, update colorTokens with appropriate hex values. ' +
          'If the user mentions imagery, update logoPrompt and heroImagePrompt accordingly. ' +
          'Keep the same JSON structure. Return the complete enhanced content blueprint.',
        response_json_schema: contentSchema,
      });
    }

    // Update the project with enhanced content if projectId provided
    if (projectId) {
      try {
        await base44.entities.WebsiteProject.update(projectId, { content: enhancedContent });
      } catch (e) { /* project may not exist yet during blueprint review */ }
    }

    return Response.json({ content: enhancedContent, projectId: projectId || null });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

function buildSectionPrompt(section, content, comment, industry, businessName) {
  const base = 'You are an elite website copywriter. Enhance ONLY the "' + section + '" section for "' + businessName + '" (' + industry + ').\n' +
    'User feedback: "' + comment + '"\n\n' +
    'Current ' + section + ':\n' + JSON.stringify(content[section]) + '\n\n' +
    'Return ONLY the enhanced "' + section + '" object as JSON.';

  if (section === 'hero') {
    return {
      prompt: base,
      schema: { type: 'object', properties: { hero: contentSchema.properties.hero }, required: ['hero'] },
    };
  }
  if (section === 'services') {
    return {
      prompt: base + ' Return 3-6 services.',
      schema: { type: 'object', properties: { services: contentSchema.properties.services }, required: ['services'] },
    };
  }
  if (section === 'about') {
    return {
      prompt: base,
      schema: { type: 'object', properties: { about: contentSchema.properties.about }, required: ['about'] },
    };
  }
  if (section === 'faqs') {
    return {
      prompt: base + ' Return 4-8 FAQs.',
      schema: { type: 'object', properties: { faqs: contentSchema.properties.faqs }, required: ['faqs'] },
    };
  }
  if (section === 'testimonials') {
    return {
      prompt: base + ' Return 3-5 testimonials.',
      schema: { type: 'object', properties: { testimonials: contentSchema.properties.testimonials }, required: ['testimonials'] },
    };
  }
  if (section === 'valueProps') {
    return {
      prompt: base + ' Return 3-5 value props.',
      schema: { type: 'object', properties: { valueProps: contentSchema.properties.valueProps }, required: ['valueProps'] },
    };
  }
  if (section === 'process') {
    return {
      prompt: base + ' Return 3-5 process steps.',
      schema: { type: 'object', properties: { process: contentSchema.properties.process }, required: ['process'] },
    };
  }
  if (section === 'finalCta') {
    return {
      prompt: base,
      schema: { type: 'object', properties: { finalCta: contentSchema.properties.finalCta }, required: ['finalCta'] },
    };
  }
  if (section === 'colorTokens') {
    return {
      prompt: base + ' Return primary, accent, and background as hex values. Also include secondary, text, muted, and surface if helpful.',
      schema: { type: 'object', properties: { colorTokens: contentSchema.properties.colorTokens }, required: ['colorTokens'] },
    };
  }
  return {
    prompt: base,
    schema: { type: 'object', properties: { [section]: contentSchema.properties[section] }, required: [section] },
  };
}