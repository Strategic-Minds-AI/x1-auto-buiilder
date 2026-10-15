import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { image_url, mockupProjectId, industry, template_type } = body;

    if (!image_url) return Response.json({ error: 'Image URL required' }, { status: 400 });

    // Update status to scanning
    if (mockupProjectId) {
      await base44.entities.MockupProject.update(mockupProjectId, { status: 'scanning' });
    }

    // Step 1: Analyze the mock-up image pixel by pixel
    const analysisPrompt = `You are an expert UI/UX designer and frontend engineer. Analyze this mock-up image in extreme detail, pixel by pixel.

Break down every visible element:
1. LAYOUT: Describe the overall layout structure (header, hero, sections, footer, sidebar, grid, columns)
2. COMPONENTS: List every visible component (buttons, forms, cards, navigation, images, text blocks, icons, tables, charts)
3. COLORS: Extract the exact color palette (hex codes) for backgrounds, text, accents, borders
4. TYPOGRAPHY: Identify font families, sizes, weights, line heights
5. SPACING: Estimate padding, margins, gaps between elements
6. IMAGERY: Describe all images, their placement, aspect ratios, style
7. INTERACTIONS: Infer interactive elements (hover states, dropdowns, modals, tabs, accordions)
8. RESPONSIVE: Infer how the layout would adapt to mobile/tablet
9. SECTIONS: List each section in order with its purpose and content
10. CONVERSION: Identify CTAs, form fields, trust signals, social proof

Return a detailed JSON analysis.`;

    const analysisResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      file_urls: [image_url],
      model: 'gemini_3_8_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          layout: { type: 'object', description: 'Overall layout structure' },
          components: { type: 'array', description: 'List of all visible components' },
          colors: { type: 'object', description: 'Color palette with hex codes' },
          typography: { type: 'object', description: 'Font families, sizes, weights' },
          spacing: { type: 'object', description: 'Padding, margins, gaps' },
          sections: { type: 'array', description: 'Ordered list of sections' },
          ctas: { type: 'array', description: 'Call-to-action elements' },
          forms: { type: 'array', description: 'Form elements' },
          responsiveNotes: { type: 'string', description: 'Mobile/tablet adaptation notes' },
          componentCount: { type: 'number', description: 'Total component count' },
          summary: { type: 'string', description: 'One-paragraph summary of the design' }
        }
      }
    });

    // Step 2: Generate code blueprint from the analysis
    const codePrompt = `You are an expert frontend engineer. Based on this mock-up analysis, generate a complete React component blueprint.

Analysis: ${JSON.stringify(analysisResult)}

Generate:
1. A component tree showing the parent-child relationships
2. The JSX structure for each major section
3. Tailwind CSS classes for styling (using the extracted colors and typography)
4. Interactive state definitions (useState hooks needed)
5. Props interface for reusable components
6. Responsive breakpoints

Return a JSON object with:
{
  "componentTree": [{ "name": "...", "children": [...], "type": "..." }],
  "sections": [{ "name": "...", "jsx": "...", "tailwindClasses": "..." }],
  "stateHooks": [{ "name": "...", "type": "...", "initialValue": "..." }],
  "colorTokens": { "primary": "...", "secondary": "...", "background": "...", "text": "...", "accent": "..." },
  "responsiveBreakpoints": { "mobile": "...", "tablet": "...", "desktop": "..." },
  "estimatedLines": ...
}`;

    const codeResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: codePrompt,
      model: 'gemini_3_8_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          componentTree: { type: 'array' },
          sections: { type: 'array' },
          stateHooks: { type: 'array' },
          colorTokens: { type: 'object' },
          responsiveBreakpoints: { type: 'object' },
          estimatedLines: { type: 'number' }
        }
      }
    });

    // Update the project with analysis and code
    if (mockupProjectId) {
      await base44.entities.MockupProject.update(mockupProjectId, {
        status: 'analyzed',
        analysis: { ...analysisResult, codeBlueprint: codeResult },
        component_breakdown: analysisResult.components || []
      });
    }

    return Response.json({
      success: true,
      analysis: analysisResult,
      codeBlueprint: codeResult,
      mockupProjectId
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}