import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";

const APEX_AGENTS = [
  { agent_id: "apex_supervisor", name: "APEX God Mode Supervisor", skill_category: "supervision", description: "Top-level autonomous coordinator. Reads the authoritative queue, dispatches eligible work, collects receipts, escalates protected decisions.", capabilities: ["task_decomposition", "specialist_routing", "queue_management", "approval_escalation"], autonomy_level: "autonomous", icon: "Crown", color: "#00d4ff" },
  { agent_id: "chief_strategy", name: "Chief Strategy Agent", skill_category: "strategy", description: "Identifies high-value commercial opportunities and designs winning business strategies.", capabilities: ["market_analysis", "strategy_design", "opportunity_scoring"], autonomy_level: "autonomous", icon: "Target", color: "#3b82f6" },
  { agent_id: "market_intel", name: "Market Intelligence Agent", skill_category: "intelligence", description: "Researches US commercial demand across industries using authorized data sources.", capabilities: ["demand_research", "trend_analysis", "data_sourcing"], autonomy_level: "autonomous", icon: "Search", color: "#8b5cf6" },
  { agent_id: "lead_foresight", name: "God Mode Lead Foresight Agent", skill_category: "foresight", description: "Simulates 1,000 reproducible scenarios per opportunity. Models traffic, conversion, lead value, revenue and costs.", capabilities: ["scenario_modeling", "financial_simulation", "risk_assessment"], autonomy_level: "autonomous", icon: "Eye", color: "#f59e0b" },
  { agent_id: "industry_research", name: "Industry Research Agent", skill_category: "research", description: "Deep-dives into specific industries to document buyer segments, problems, competitors, and economics.", capabilities: ["industry_analysis", "competitor_research", "pricing_discovery"], autonomy_level: "autonomous", icon: "Building2", color: "#14b8a6" },
  { agent_id: "buyer_discovery", name: "Buyer Discovery Agent", skill_category: "discovery", description: "Identifies plausible buyer organizations and verifies public business evidence.", capabilities: ["buyer_identification", "lead_validation", "market_fit"], autonomy_level: "assisted", icon: "Users", color: "#ec4899" },
  { agent_id: "competitor_intel", name: "Competitor Intelligence Agent", skill_category: "intelligence", description: "Studies 5-15 competitors per opportunity. Documents offers, pricing, positioning, SEO, and UX.", capabilities: ["competitor_analysis", "pricing_intelligence", "positioning_research"], autonomy_level: "autonomous", icon: "Crosshair", color: "#ef4444" },
  { agent_id: "pricing_economics", name: "Pricing & Unit Economics Agent", skill_category: "economics", description: "Analyzes pricing models, unit economics, margins, and cost structures.", capabilities: ["pricing_strategy", "margin_analysis", "cost_modeling"], autonomy_level: "autonomous", icon: "DollarSign", color: "#10b981" },
  { agent_id: "seo_aeo_geo", name: "SEO/AEO/GEO Research Agent", skill_category: "seo", description: "Researches search intent, keyword evidence, answer engine optimization, and geographic search patterns.", capabilities: ["keyword_research", "search_intent", "geo_optimization"], autonomy_level: "autonomous", icon: "Globe", color: "#6366f1" },
  { agent_id: "creative_director", name: "Premium Creative Director", skill_category: "design", description: "Directs award-winning visual design. Ensures 100+ structurally different styles per category.", capabilities: ["design_direction", "visual_strategy", "quality_review"], autonomy_level: "assisted", icon: "Palette", color: "#f97316" },
  { agent_id: "brand_logo", name: "Brand & Logo Agent", skill_category: "branding", description: "Generates original brand identities, logos, color systems, and typography pairings.", capabilities: ["brand_generation", "logo_design", "color_theory"], autonomy_level: "autonomous", icon: "Sparkles", color: "#a855f7" },
  { agent_id: "website_architect", name: "Website Architect", skill_category: "architecture", description: "Designs complete website blueprints with section structure, design systems, and component libraries.", capabilities: ["site_architecture", "ux_design", "component_planning"], autonomy_level: "autonomous", icon: "Layout", color: "#0ea5e9" },
  { agent_id: "app_architect", name: "Application/SaaS Architect", skill_category: "architecture", description: "Architects SaaS applications, AI tools, and business operating portals with tested backend contracts.", capabilities: ["app_design", "saas_architecture", "api_design"], autonomy_level: "autonomous", icon: "Boxes", color: "#06b6d4" },
  { agent_id: "frontend_engineer", name: "Frontend Engineering Agent", skill_category: "engineering", description: "Builds responsive, accessible, performant React interfaces from approved designs.", capabilities: ["react", "tailwind", "responsive_design", "accessibility"], autonomy_level: "autonomous", icon: "Code", color: "#3b82f6" },
  { agent_id: "backend_engineer", name: "Backend & Integration Agent", skill_category: "engineering", description: "Builds backend functions, API integrations, and data pipelines with proper auth and tenant isolation.", capabilities: ["backend", "api_integration", "data_pipeline", "auth"], autonomy_level: "autonomous", icon: "Server", color: "#8b5cf6" },
  { agent_id: "content_editorial", name: "Content & Editorial Agent", skill_category: "content", description: "Produces original, industry-accurate, helpful content. No generic filler or duplicated city pages.", capabilities: ["content_writing", "copywriting", "editorial_review"], autonomy_level: "autonomous", icon: "FileText", color: "#14b8a6" },
  { agent_id: "image_video", name: "Image & Video Director", skill_category: "media", description: "Generates industry-correct images, video scripts, and supported video renders.", capabilities: ["image_generation", "video_scripts", "creative_direction"], autonomy_level: "autonomous", icon: "Video", color: "#f59e0b" },
  { agent_id: "social_marketing", name: "Social Marketing Agent", skill_category: "marketing", description: "Creates 30-day social campaigns with platform-specific creative, captions, and hashtags.", capabilities: ["social_strategy", "content_calendar", "platform_optimization"], autonomy_level: "autonomous", icon: "Share2", color: "#ec4899" },
  { agent_id: "lead_funnel", name: "Lead Funnel Architect", skill_category: "funnel", description: "Designs legitimate lead-generation and conversion journeys with qualified lead intake.", capabilities: ["funnel_design", "conversion_optimization", "lead_routing"], autonomy_level: "autonomous", icon: "Filter", color: "#f97316" },
  { agent_id: "crm_qualification", name: "CRM & Qualification Agent", skill_category: "crm", description: "Routes consented leads through CRM, qualifies them, and manages contact preferences.", capabilities: ["lead_qualification", "crm_routing", "contact_management"], autonomy_level: "assisted", icon: "Database", color: "#10b981" },
  { agent_id: "xtreme_comms", name: "Xtreme Communications Agent", skill_category: "communications", description: "Handles inbound voice/SMS, lead intake, qualification, and human escalation with consent controls.", capabilities: ["voice_handling", "sms_replies", "lead_intake", "escalation"], autonomy_level: "assisted", icon: "Phone", color: "#ef4444" },
  { agent_id: "analytics_attribution", name: "Analytics & Attribution Agent", skill_category: "analytics", description: "Measures qualified leads, appointments, sales, and profitability using first-party data.", capabilities: ["ga4", "search_console", "revenue_attribution", "kpi_tracking"], autonomy_level: "autonomous", icon: "BarChart3", color: "#6366f1" },
  { agent_id: "security_compliance", name: "Security & Compliance Reviewer", skill_category: "security", description: "Reviews GPT sync scopes, production gates, tenant isolation, and consent controls.", capabilities: ["security_audit", "compliance_review", "tenant_isolation"], autonomy_level: "assisted", icon: "Shield", color: "#ef4444" },
  { agent_id: "browser_qa", name: "Browser/Playwright QA Agent", skill_category: "testing", description: "Runs Playwright desktop/tablet/mobile tests, broken-link checks, and form validation.", capabilities: ["playwright", "visual_testing", "form_validation"], autonomy_level: "autonomous", icon: "MonitorCheck", color: "#0ea5e9" },
  { agent_id: "guardian_validator", name: "Independent Guardian Validator", skill_category: "validation", description: "Independently validates release-critical claims. No QA evidence means UNKNOWN, not PASS.", capabilities: ["independent_validation", "evidence_review", "gate_enforcement"], autonomy_level: "manual", icon: "ShieldCheck", color: "#10b981" },
  { agent_id: "release_coordinator", name: "Release & Runtime Coordinator", skill_category: "operations", description: "Manages approval-gated provisioning, preview-to-production pipeline, and rollback references.", capabilities: ["release_management", "deployment_coordination", "rollback"], autonomy_level: "manual", icon: "Rocket", color: "#f59e0b" },
];

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { action } = body;

    switch (action) {
      case "get_dashboard_data": {
        const [opps, missions, agents, jobs, approvals, receipts] = await Promise.all([
          base44.entities.ApexOpportunity.list({ sort: "-overall_score", limit: 100 }).then(p => p.items || []).catch(() => []),
          base44.entities.ApexMission.list({ sort: "-created_date", limit: 100 }).then(p => p.items || []).catch(() => []),
          base44.entities.AgentProfile.list({ limit: 100 }).then(p => p.items || []).catch(() => []),
          base44.entities.GenerationJob.filter({ status: { $in: ["queued", "in_progress"] } }, { sort: "-created_date", limit: 20 }).then(p => p.items || []).catch(() => []),
          base44.entities.ApprovalRequest.filter({ status: "pending" }, { limit: 20 }).then(p => p.items || []).catch(() => []),
          base44.entities.ValidationReceipt.list({ sort: "-created_date", limit: 10 }).then(p => p.items || []).catch(() => []),
        ]);

        const phaseStatus = {
          phase0: "Forensic Discovery",
          phase1: "Security Repair",
          phase2: "Queue Convergence",
          phase3: "Agent Control",
          phase4: "Demand Intelligence",
          phase5: "Strategy Factory",
          phase6: "Website Generator",
          phase7: "Lead Capture",
          phase8: "Communications",
          phase9: "Social & Video",
          phase10: "GPT Integration",
          phase11: "National Expansion",
          phase12: "Release & Operations",
        };

        return Response.json({
          success: true,
          data: {
            opportunities: opps,
            missions: missions,
            agents: agents,
            activeJobs: jobs,
            pendingApprovals: approvals,
            recentReceipts: receipts,
            phaseStatus,
            counts: {
              opportunities: opps.length,
              missions: missions.length,
              activeMissions: missions.filter(m => m.status === "in_progress").length,
              pendingMissions: missions.filter(m => m.status === "pending").length,
              agents: agents.length,
              activeJobs: jobs.length,
              pendingApprovals: approvals.length,
            },
          },
        });
      }

      case "seed_agents": {
        const existing = await base44.entities.AgentProfile.list({ limit: 100 }).then(p => p.items || []).catch(() => []);
        const existingIds = new Set(existing.map(a => a.agent_id));
        const toCreate = APEX_AGENTS.filter(a => !existingIds.has(a.agent_id)).map(a => ({
          agent_id: a.agent_id,
          name: a.name,
          skill_category: a.skill_category,
          description: a.description,
          capabilities: a.capabilities,
          autonomy_level: a.autonomy_level,
          icon: a.icon,
          color: a.color,
          industries: [],
        }));
        let created = [];
        if (toCreate.length > 0) {
          created = await base44.entities.AgentProfile.bulkCreate(toCreate);
        }
        return Response.json({ success: true, created: created.length, total: existing.length + toCreate.length, agents: APEX_AGENTS });
      }

      case "discover_opportunities": {
        const { industries, geography } = body;
        const targetIndustries = industries || ["legal services", "home improvement", "healthcare services", "real estate", "HVAC", "roofing", "plumbing", "electrical", "epoxy flooring", "restoration"];
        const targetGeo = geography || "United States";

        const prompt = `You are the APEX Market Intelligence Agent. Research current US commercial demand for high-intent service-sector opportunities.

Target industries: ${targetIndustries.join(", ")}
Geography: ${targetGeo}

For each industry, identify the top 3-5 specific service opportunities where:
1. Buyers are actively searching (high buyer intent)
2. There is verified commercial value (real pricing, real demand)
3. Competition is manageable (not dominated by major brands)
4. A differentiated digital property could capture qualified leads
5. Lead value justifies the investment

For each opportunity, provide:
- industry and subindustry
- specific service_or_product
- buyer_intent (high/medium/low)
- demand_score (0-100, based on search interest evidence)
- competition_score (0-100, higher = more competition)
- profitability_score (0-100, based on lead value and margins)
- overall_score (0-100, weighted average)
- buyer_organizations (3-5 plausible buyer types)
- key competitors (3-5 with names and URLs if available)
- pricing_evidence (observed price ranges with source)
- confidence (verified/inferred/simulated/unknown)
- source_links (URLs where evidence was found)
- assumptions (what was assumed)
- next_actions (what research is needed next)

Focus on REAL, EVIDENCE-SUPPORTED opportunities. Do not invent demand or fabricate search volumes.
Label everything with proper confidence levels.`;

        const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt,
          add_context_from_internet: true,
          model: "gemini_3_flash",
          response_json_schema: {
            type: "object",
            properties: {
              opportunities: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    industry: { type: "string" },
                    subindustry: { type: "string" },
                    service_or_product: { type: "string" },
                    buyer_intent: { type: "string" },
                    demand_score: { type: "number" },
                    competition_score: { type: "number" },
                    profitability_score: { type: "number" },
                    overall_score: { type: "number" },
                    buyer_organizations: { type: "array", items: { type: "string" } },
                    competitors: { type: "array", items: { type: "object", properties: { name: { type: "string" }, url: { type: "string" } } } },
                    pricing_evidence: { type: "array", items: { type: "object", properties: { item: { type: "string" }, price: { type: "string" }, source: { type: "string" } } } },
                    confidence: { type: "string" },
                    source_links: { type: "array", items: { type: "string" } },
                    assumptions: { type: "array", items: { type: "string" } },
                    next_actions: { type: "array", items: { type: "string" } },
                    offer: { type: "string" },
                    geography: { type: "string" },
                  },
                },
              },
            },
          },
        });

        const opportunities = result.opportunities || [];
        const created = await base44.entities.ApexOpportunity.bulkCreate(
          opportunities.map(o => ({
            industry: o.industry,
            subindustry: o.subindustry || "",
            service_or_product: o.service_or_product,
            buyer_intent: o.buyer_intent || "medium",
            geography: o.geography || targetGeo,
            offer: o.offer || "",
            demand_score: o.demand_score || 50,
            competition_score: o.competition_score || 50,
            profitability_score: o.profitability_score || 50,
            overall_score: o.overall_score || 50,
            buyer_organizations: o.buyer_organizations || [],
            competitors: o.competitors || [],
            pricing_evidence: o.pricing_evidence || [],
            status: "scored",
            confidence: o.confidence || "inferred",
            source_links: o.source_links || [],
            assumptions: o.assumptions || [],
            next_actions: o.next_actions || [],
          }))
        );

        return Response.json({ success: true, discovered: opportunities.length, created: created.length || opportunities.length, opportunities });
      }

      case "generate_strategies": {
        const { opportunity_id } = body;
        if (!opportunity_id) return Response.json({ error: "opportunity_id is required" }, { status: 400 });

        const opp = await base44.entities.ApexOpportunity.get(opportunity_id);

        const prompt = `You are the APEX Chief Strategy Agent. Generate 10 distinct, evidence-backed business strategies for this opportunity.

Opportunity:
- Industry: ${opp.industry} / ${opp.subindustry}
- Service: ${opp.service_or_product}
- Geography: ${opp.geography}
- Buyer intent: ${opp.buyer_intent}
- Demand score: ${opp.demand_score}/100
- Competition score: ${opp.competition_score}/100
- Profitability score: ${opp.profitability_score}/100
- Buyer organizations: ${(opp.buyer_organizations || []).join(", ")}
- Pricing evidence: ${JSON.stringify(opp.pricing_evidence || []).substring(0, 500)}
- Competitors: ${JSON.stringify(opp.competitors || []).substring(0, 500)}

Generate 10 different business strategies. Each strategy must include:
1. strategy_name: A clear name
2. approach: How this strategy wins (differentiation, cost, niche, etc.)
3. target_buyer: Who specifically this targets
4. value_proposition: Why they would choose this
5. digital_property_type: What kind of website/app/tool to build
6. revenue_model: How it makes money
7. estimated_lead_value: Estimated value per qualified lead (USD)
8. estimated_monthly_leads: Estimated monthly lead volume
9. estimated_monthly_revenue: Estimated monthly revenue
10. estimated_monthly_cost: Estimated monthly operating cost
11. key_risks: Main risks
12. confidence: verified/inferred/simulated/unknown

Make strategies genuinely different — not variations of the same idea.
Label all financial estimates as SIMULATED unless backed by verified evidence.`;

        const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              strategies: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    strategy_name: { type: "string" },
                    approach: { type: "string" },
                    target_buyer: { type: "string" },
                    value_proposition: { type: "string" },
                    digital_property_type: { type: "string" },
                    revenue_model: { type: "string" },
                    estimated_lead_value: { type: "number" },
                    estimated_monthly_leads: { type: "number" },
                    estimated_monthly_revenue: { type: "number" },
                    estimated_monthly_cost: { type: "number" },
                    key_risks: { type: "array", items: { type: "string" } },
                    confidence: { type: "string" },
                  },
                },
              },
            },
          },
          model: "claude-sonnet-5",
        });

        const strategies = result.strategies || [];
        await base44.entities.ApexOpportunity.update(opportunity_id, {
          strategy_options: strategies,
          status: "researched",
        });

        return Response.json({ success: true, strategies });
      }

      case "simulate_scenarios": {
        const { opportunity_id, strategy_index } = body;
        if (!opportunity_id) return Response.json({ error: "opportunity_id is required" }, { status: 400 });

        const opp = await base44.entities.ApexOpportunity.get(opportunity_id);
        const strategies = opp.strategy_options || [];
        const selectedStrategy = strategies[strategy_index || 0];

        if (!selectedStrategy) return Response.json({ error: "No strategy found. Generate strategies first." }, { status: 400 });

        const prompt = `You are the APEX God Mode Lead Foresight Agent. Run 1,000-scenario financial simulations for this strategy.

Strategy: ${selectedStrategy.strategy_name}
Approach: ${selectedStrategy.approach}
Target buyer: ${selectedStrategy.target_buyer}
Revenue model: ${selectedStrategy.revenue_model}
Estimated lead value: $${selectedStrategy.estimated_lead_value}
Estimated monthly leads: ${selectedStrategy.estimated_monthly_leads}
Estimated monthly revenue: $${selectedStrategy.estimated_monthly_revenue}
Estimated monthly cost: $${selectedStrategy.estimated_monthly_cost}

Generate a simulation summary with:
1. conservative_scenario: Worst 10th percentile outcome
2. base_scenario: Median (50th percentile) outcome
3. optimistic_scenario: Best 90th percentile outcome
4. key_variables: What drives the variance
5. break_even_point: What it takes to break even
6. downside_risks: What could go wrong
7. saturation_risk: What happens if competitors copy
8. recommendation: Should this be pursued and why

All numbers are SIMULATED based on assumptions, not verified market data.
Label everything SIMULATED.`;

        const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              conservative: { type: "object", properties: { monthly_revenue: { type: "number" }, monthly_cost: { type: "number" }, monthly_leads: { type: "number" }, profit: { type: "number" } } },
              base: { type: "object", properties: { monthly_revenue: { type: "number" }, monthly_cost: { type: "number" }, monthly_leads: { type: "number" }, profit: { type: "number" } } },
              optimistic: { type: "object", properties: { monthly_revenue: { type: "number" }, monthly_cost: { type: "number" }, monthly_leads: { type: "number" }, profit: { type: "number" } } },
              key_variables: { type: "array", items: { type: "string" } },
              break_even_point: { type: "string" },
              downside_risks: { type: "array", items: { type: "string" } },
              saturation_risk: { type: "string" },
              recommendation: { type: "string" },
            },
          },
          model: "claude-sonnet-5",
        });

        const simulations = [...(opp.simulations || []), { strategy: selectedStrategy.strategy_name, ...result, simulated_at: new Date().toISOString() }];
        await base44.entities.ApexOpportunity.update(opportunity_id, { simulations });

        return Response.json({ success: true, simulation: result });
      }

      case "create_mission": {
        const { title, mission_type, priority, phase, assigned_agent, description, authorization_scope, opportunity_id, project_id, dependencies } = body;
        if (!title || !mission_type) return Response.json({ error: "title and mission_type are required" }, { status: 400 });

        const mission = await base44.entities.ApexMission.create({
          title,
          mission_type,
          priority: priority || "p1",
          phase: phase || "phase0",
          assigned_agent: assigned_agent || "",
          description: description || "",
          authorization_scope: authorization_scope || "safe",
          opportunity_id: opportunity_id || "",
          project_id: project_id || "",
          dependencies: dependencies || [],
          approval_required: authorization_scope === "protected" || authorization_scope === "production",
          approval_status: (authorization_scope === "protected" || authorization_scope === "production") ? "pending" : "not_required",
        });

        return Response.json({ success: true, mission });
      }

      case "execute_research": {
        const { mission_id } = body;
        if (!mission_id) return Response.json({ error: "mission_id is required" }, { status: 400 });

        const mission = await base44.entities.ApexMission.get(mission_id);
        await base44.entities.ApexMission.update(mission_id, { status: "in_progress" });

        const prompt = `You are the APEX ${mission.assigned_agent || "Research Agent"}. Execute this research mission.

Mission: ${mission.title}
Type: ${mission.mission_type}
Description: ${mission.description}
Inputs: ${JSON.stringify(mission.inputs || {}).substring(0, 1000)}

Execute the research and provide:
1. findings: Key findings as an array of {finding, evidence, confidence}
2. recommendations: Actionable recommendations
3. evidence_links: URLs or sources supporting findings
4. next_actions: What should happen next
5. summary: Executive summary

Use real, verifiable information. Label confidence levels accurately.`;

        const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt,
          add_context_from_internet: true,
          model: "gemini_3_flash",
          response_json_schema: {
            type: "object",
            properties: {
              findings: { type: "array", items: { type: "object", properties: { finding: { type: "string" }, evidence: { type: "string" }, confidence: { type: "string" } } } },
              recommendations: { type: "array", items: { type: "string" } },
              evidence_links: { type: "array", items: { type: "string" } },
              next_actions: { type: "array", items: { type: "string" } },
              summary: { type: "string" },
            },
          },
        });

        const updated = await base44.entities.ApexMission.update(mission_id, {
          status: "complete",
          outputs: result,
          evidence: (result.findings || []).map((f, i) => ({ type: "research", description: f.finding, verified: f.confidence === "verified", url: result.evidence_links?.[i] || "" })),
        });

        return Response.json({ success: true, mission: updated, results: result });
      }

      case "create_canary": {
        const { opportunity_id } = body;
        if (!opportunity_id) return Response.json({ error: "opportunity_id is required" }, { status: 400 });

        const opp = await base44.entities.ApexOpportunity.get(opportunity_id);

        const canaryMission = await base44.entities.ApexMission.create({
          title: `First Synthetic National Canary: ${opp.industry} - ${opp.service_or_product}`,
          mission_type: "build",
          priority: "p0",
          phase: "phase6",
          assigned_agent: "website_architect",
          description: `Build the first complete synthetic national canary for ${opp.service_or_product} in ${opp.industry}. Must include: industry research, keyword evidence, 3+ competitors, 3+ buyer organizations, verified pricing or UNKNOWN, 10 strategy alternatives, reproducible financial simulations, premium original brand and design, complete functional noindex website, real preview URL, synthetic qualified-lead submission, tenant-scoped CRM/queue receipt, working browser validation, approved brand-matched content package, draft 30-day campaign, appropriate video/art assets, GPT retrieval, independent Guardian review, NO production publication or customer contact.`,
          authorization_scope: "safe",
          opportunity_id,
          approval_required: false,
          approval_status: "not_required",
          inputs: { opportunity: opp, steps: [
            "industry_research", "keyword_evidence", "competitor_analysis", "buyer_discovery",
            "pricing_verification", "strategy_generation", "financial_simulation",
            "brand_design", "website_build", "noindex_preview", "lead_form_test",
            "crm_receipt", "browser_validation", "content_package", "social_campaign",
            "guardian_review"
          ]},
        });

        await base44.entities.ApexOpportunity.update(opportunity_id, { canary: true, status: "building" });

        return Response.json({ success: true, canary: canaryMission });
      }

      case "get_agent_swarm": {
        return Response.json({ success: true, agents: APEX_AGENTS });
      }

      default:
        return Response.json({ error: "Unknown action: " + action }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message || "APEX orchestrator failed" }, { status: 500 });
  }
}