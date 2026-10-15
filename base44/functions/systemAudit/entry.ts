import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";
import { SYSTEM_INTELLIGENCE } from "../../shared/systemIntelligence.js";

// System Audit — proactive intelligence function that audits the entire platform,
// identifies optimization opportunities, suggests upgrades, and can auto-integrate
// improvements. Also returns the full system intelligence knowledge base.

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { action } = body;

    // Return system intelligence
    if (action === "intelligence") {
      return Response.json({ success: true, intelligence: SYSTEM_INTELLIGENCE });
    }

    // Gather system state
    const [projects, clients, campaigns, jobs, tasks, leads, socialPosts, mediaAssets] = await Promise.allSettled([
      base44.entities.WebsiteProject.filter({}, { limit: 50, fields: ["id", "status", "industry", "business_name", "deploy_url", "created_date"] }),
      base44.entities.Client.filter({}, { limit: 50 }),
      base44.entities.LaunchCampaign.filter({}, { limit: 20 }),
      base44.entities.GenerationJob.filter({ status: { $in: ["queued", "in_progress"] } }, { limit: 50 }),
      base44.entities.IntelligenceTask.filter({ status: { $ne: "complete" } }, { limit: 50 }),
      base44.entities.Lead.filter({}, { limit: 50 }),
      base44.entities.SocialPost.filter({}, { limit: 50 }),
      base44.entities.MediaAsset.filter({}, { limit: 50 }),
    ]);

    const systemState = {
      projects: projects.status === "fulfilled" ? (projects.value.items || projects.value) : [],
      clients: clients.status === "fulfilled" ? (clients.value.items || clients.value) : [],
      campaigns: campaigns.status === "fulfilled" ? (campaigns.value.items || campaigns.value) : [],
      activeJobs: jobs.status === "fulfilled" ? (jobs.value.items || jobs.value) : [],
      pendingTasks: tasks.status === "fulfilled" ? (tasks.value.items || tasks.value) : [],
      leads: leads.status === "fulfilled" ? (leads.value.items || leads.value) : [],
      socialPosts: socialPosts.status === "fulfilled" ? (socialPosts.value.items || socialPosts.value) : [],
      mediaAssets: mediaAssets.status === "fulfilled" ? (mediaAssets.value.items || mediaAssets.value) : [],
      errors: {
        projects: projects.status === "rejected" ? projects.reason?.message : null,
        clients: clients.status === "rejected" ? clients.reason?.message : null,
        campaigns: campaigns.status === "rejected" ? campaigns.reason?.message : null,
        jobs: jobs.status === "rejected" ? jobs.reason?.message : null,
        tasks: tasks.status === "rejected" ? tasks.reason?.message : null,
      },
    };

    // Count totals
    const counts = {
      totalProjects: systemState.projects.length,
      totalClients: systemState.clients.length,
      activeJobs: systemState.activeJobs.length,
      pendingTasks: systemState.pendingTasks.length,
      totalLeads: systemState.leads.length,
      deployedSites: systemState.projects.filter((p: any) => p.deploy_url).length,
    };

    // Use LLM to analyze and suggest improvements
    const audit = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are the proactive system auditor for the Digital Dominance Factory platform. Analyze the current system state and provide a comprehensive audit with:
1. Health score (0-100)
2. Key findings (severity, area, finding, recommendation)
3. Optimization opportunities (specific, actionable)
4. Recommended upgrades (with priority)
5. Priority actions (immediate next steps)

Be specific and actionable. Reference actual data from the system state.

System counts: ${JSON.stringify(counts)}
System state (truncated): ${JSON.stringify(systemState).substring(0, 8000)}
Platform capabilities: ${JSON.stringify(SYSTEM_INTELLIGENCE.capabilities).substring(0, 3000)}`,
      response_json_schema: {
        type: "object",
        properties: {
          health_score: { type: "number", description: "0-100" },
          health_status: { type: "string", description: "excellent, good, fair, poor, critical" },
          findings: {
            type: "array",
            items: {
              type: "object",
              properties: {
                severity: { type: "string", enum: ["critical", "high", "medium", "low", "info"] },
                area: { type: "string" },
                finding: { type: "string" },
                recommendation: { type: "string" },
              },
            },
          },
          optimizations: { type: "array", items: { type: "string" } },
          upgrades: { type: "array", items: { type: "string" } },
          priority_actions: { type: "array", items: { type: "string" } },
          summary: { type: "string" },
        },
      },
    });

    // Save audit as an IntelligenceTask
    const auditTask = await base44.entities.IntelligenceTask.create({
      title: `System Audit - ${new Date().toISOString().split("T")[0]}`,
      category: "governance",
      priority: "p1",
      status: "in_progress",
      description: audit.summary || "Proactive system audit completed",
      assigned_agent: "super_agent",
      evidence_required: "Review findings and implement recommendations",
    });

    return Response.json({
      success: true,
      audit,
      counts,
      auditTaskId: auditTask.id,
      intelligence: action === "full" ? SYSTEM_INTELLIGENCE : undefined,
    });
  } catch (error) {
    return Response.json({ error: error.message || "System audit failed" }, { status: 500 });
  }
}