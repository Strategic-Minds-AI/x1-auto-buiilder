import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";

const TYPE_META: Record<string, { label: string; system: string; model?: string }> = {
  report: { label: "Professional Report", system: "Generate a comprehensive professional report" },
  proposal: { label: "Business Proposal", system: "Generate a detailed business proposal" },
  bid: { label: "Bid / Tender Response", system: "Generate a competitive bid or tender response" },
  website: { label: "Website Blueprint", system: "Generate a complete website blueprint with all pages, sections, content, design direction, and technical specifications", model: "claude-sonnet-5" },
  platform: { label: "Platform Architecture", system: "Generate a platform architecture with features, user roles, core modules, data model, API endpoints, and scaling strategy", model: "claude-sonnet-5" },
  workflow: { label: "Workflow Automation", system: "Generate an automation workflow with triggers, conditions, actions, integrations, and monitoring" },
  system: { label: "Full System Design", system: "Generate a complete system design including architecture overview, database schema, API design, UI/UX plan, technology stack, deployment strategy, and implementation roadmap", model: "claude-sonnet-5" },
  document: { label: "Document", system: "Generate a professional document" },
  content: { label: "Content", system: "Generate marketing or web content" },
  code: { label: "Code", system: "Generate code based on the specification" },
  strategy: { label: "Strategy", system: "Generate a business strategy" },
  email: { label: "Email", system: "Generate an email" },
  social: { label: "Social Media", system: "Generate social media content" },
  landing: { label: "Landing Page", system: "Generate a high-converting landing page blueprint" },
  funnel: { label: "Lead Funnel", system: "Generate a lead generation funnel" },
  brand: { label: "Brand Identity", system: "Generate a brand identity" },
  custom: { label: "Custom", system: "Generate based on custom instructions" },
};

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { action } = body;

    switch (action) {
      case "generate": {
        const {
          generation_type = "custom",
          industry = "",
          category = "",
          subcategory = "",
          amount = 1,
          prompt = "",
          custom_instructions = "",
          model,
          save_to_library = true,
        } = body;

        const meta = TYPE_META[generation_type] || TYPE_META.custom;

        let fullPrompt = `${meta.system}.\n\n`;
        fullPrompt += `Parameters:\n`;
        fullPrompt += `- Industry: ${industry || "General"}\n`;
        fullPrompt += `- Category: ${category || "General"}\n`;
        fullPrompt += `- Subcategory: ${subcategory || "General"}\n`;
        fullPrompt += `- Amount: ${amount}\n\n`;
        fullPrompt += `Instructions: ${prompt || custom_instructions || "Generate high-quality, professional content."}\n\n`;

        if (generation_type === "system") {
          fullPrompt += "Include: architecture overview, database schema, API design, UI/UX plan, technology stack, deployment strategy, and implementation roadmap.\n";
        }
        if (generation_type === "platform") {
          fullPrompt += "Include: platform overview, user roles, core features, data model, API endpoints, and scaling strategy.\n";
        }
        if (generation_type === "workflow") {
          fullPrompt += "Include: workflow name, trigger configuration, step-by-step actions, conditions, integrations, and monitoring.\n";
        }

        fullPrompt += "Format the output in clean markdown with clear sections, headers, and bullet points. Make it comprehensive and professional.";

        const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: fullPrompt,
          model: model || meta.model || "automatic",
        });

        const content = typeof result === "string" ? result : JSON.stringify(result, null, 2);

        let savedItem = null;
        if (save_to_library) {
          savedItem = await base44.entities.GenerationItem.create({
            title: `${meta.label} — ${industry || "General"}${category ? " / " + category : ""}${subcategory ? " / " + subcategory : ""}`,
            generation_type,
            industry,
            category,
            subcategory,
            amount,
            prompt: prompt || custom_instructions,
            content,
            status: "generated",
          });
        }

        return Response.json({ success: true, content, item: savedItem });
      }

      case "assist": {
        const { industry, category, subcategory, generation_type, partial_prompt } = body;
        const meta = TYPE_META[generation_type] || TYPE_META.custom;

        const assistPrompt = `You are an AI prompt assistant. The user is building a prompt for a "${meta.label}" generator.

Current selections:
- Industry: ${industry || "Not selected"}
- Category: ${category || "Not selected"}
- Subcategory: ${subcategory || "Not selected"}
- Partial prompt: ${partial_prompt || "(empty)"}

Generate a detailed, professional prompt that the user can use. The prompt should:
1. Be specific to the industry and category
2. Include key requirements and deliverables
3. Mention the target audience and tone
4. Include any industry-specific terminology
5. Be 3-5 sentences long

Return ONLY the prompt text, nothing else.`;

        const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: assistPrompt,
          model: "automatic",
        });

        return Response.json({ success: true, prompt: typeof result === "string" ? result : String(result) });
      }

      case "regenerate": {
        const { item_id, prompt: regenPrompt, model } = body;
        if (!item_id) return Response.json({ error: "item_id is required" }, { status: 400 });

        const original = await base44.entities.GenerationItem.get(item_id);
        const meta = TYPE_META[original.generation_type] || TYPE_META.custom;

        let fullPrompt = `${meta.system}.\n\n`;
        fullPrompt += `Parameters:\n`;
        fullPrompt += `- Industry: ${original.industry || "General"}\n`;
        fullPrompt += `- Category: ${original.category || "General"}\n`;
        fullPrompt += `- Subcategory: ${original.subcategory || "General"}\n`;
        fullPrompt += `- Amount: ${original.amount || 1}\n\n`;
        fullPrompt += `Additional instructions: ${regenPrompt || "Regenerate with improvements and variations."}\n\n`;
        fullPrompt += "Format the output in clean markdown with clear sections, headers, and bullet points.";

        const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: fullPrompt,
          model: model || meta.model || "automatic",
        });

        const content = typeof result === "string" ? result : JSON.stringify(result, null, 2);

        const newItem = await base44.entities.GenerationItem.create({
          title: `${meta.label} — ${original.industry || "General"} (Regenerated)`,
          generation_type: original.generation_type,
          industry: original.industry,
          category: original.category,
          subcategory: original.subcategory,
          amount: original.amount,
          prompt: regenPrompt || "Regenerated",
          content,
          status: "regenerated",
          parent_id: item_id,
        });

        return Response.json({ success: true, content, item: newItem });
      }

      case "regenerate_selection": {
        const { item_id, selection_text, selection_context, instructions, model } = body;
        if (!item_id || !selection_text) return Response.json({ error: "item_id and selection_text are required" }, { status: 400 });

        const original = await base44.entities.GenerationItem.get(item_id);
        const meta = TYPE_META[original.generation_type] || TYPE_META.custom;

        const fullPrompt = `You are regenerating a specific section of a ${meta.label}.

Context from the original document:
${selection_context || (original.content || "").substring(0, 800)}

Section to regenerate:
"${selection_text}"

Instructions: ${instructions || "Improve and enhance this section. Make it more detailed, professional, and actionable."}

Return ONLY the regenerated section text in markdown. Do not include any preamble or explanation.`;

        const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: fullPrompt,
          model: model || "automatic",
        });

        const regeneratedText = typeof result === "string" ? result : String(result);

        let updatedContent = original.content || "";
        if (updatedContent.includes(selection_text)) {
          updatedContent = updatedContent.replace(selection_text, regeneratedText);
        } else {
          updatedContent = updatedContent + "\n\n--- Regenerated Section ---\n" + regeneratedText;
        }

        await base44.entities.GenerationItem.update(item_id, {
          content: updatedContent,
          status: "regenerated",
        });

        return Response.json({ success: true, content: updatedContent, regenerated_section: regeneratedText });
      }

      case "update_content": {
        const { item_id, content } = body;
        if (!item_id) return Response.json({ error: "item_id is required" }, { status: 400 });
        const updated = await base44.entities.GenerationItem.update(item_id, { content });
        return Response.json({ success: true, item: updated });
      }

      case "save_template": {
        const { title, generation_type, industry, category, subcategory, amount, prompt, file_type, tags } = body;
        if (!title || !generation_type) return Response.json({ error: "title and generation_type are required" }, { status: 400 });

        const item = await base44.entities.GenerationItem.create({
          title,
          generation_type,
          industry: industry || "",
          category: category || "",
          subcategory: subcategory || "",
          amount: amount || 1,
          prompt: prompt || "",
          content: "",
          file_type: file_type || "markdown",
          status: "draft",
          tags: tags || [],
        });

        return Response.json({ success: true, item });
      }

      default:
        return Response.json({ error: "Unknown action: " + action }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message || "Generation failed" }, { status: 500 });
  }
}