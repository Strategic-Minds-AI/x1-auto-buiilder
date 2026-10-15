import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";
import {
  getSystemStatus,
  pushWorkItem,
  readTable,
  insertRows,
  runReadOnlyQuery,
  listProjects,
  X1_PROJECT_REF,
  X1_STAGING_REF,
} from "../../shared/supabaseBridge.js";

// Supabase Bridge — connects this Digital Dominance Factory platform to the
// user's existing X1 AI Hub autonomous build system backend in Supabase.
//
// Operations:
//   - "status"     → unified dashboard read (work queue, pipelines, cycles, events, workers)
//   - "push_work"  → submit a work item to the X1 work queue
//   - "read"       → read rows from any Supabase table
//   - "query"      → run a read-only SQL query
//   - "projects"   → list all Supabase projects
//   - "sync_project" → push a Base44 WebsiteProject to Supabase factory_definition

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { operation } = body;

    switch (operation) {
      case "status": {
        const projectRef = body.project_ref || X1_PROJECT_REF;
        const status = await getSystemStatus(base44, projectRef);
        return Response.json({ project: projectRef, ...status });
      }

      case "push_work": {
        const projectRef = body.project_ref || X1_PROJECT_REF;
        const result = await pushWorkItem(
          base44,
          {
            task_id: body.task_id,
            requested_by: user.email || user.id,
            action_class: body.action_class,
            required_capabilities: body.required_capabilities || [],
            workPayload: body.payload || {},
            priority: body.priority || 100,
            mission_id: body.mission_id,
            tenant_id: body.tenant_id,
          },
          projectRef
        );
        return Response.json({ success: true, workItem: result });
      }

      case "read": {
        const projectRef = body.project_ref || X1_PROJECT_REF;
        if (!body.table) {
          return Response.json({ error: "table is required for read operation" }, { status: 400 });
        }
        const result = await readTable(
          base44,
          body.table,
          {
            select: body.select,
            filter: body.filter,
            order: body.order,
            limit: body.limit || 50,
            offset: body.offset,
          },
          projectRef
        );
        return Response.json(result);
      }

      case "query": {
        const projectRef = body.project_ref || X1_PROJECT_REF;
        if (!body.query) {
          return Response.json({ error: "query is required" }, { status: 400 });
        }
        const result = await runReadOnlyQuery(base44, body.query, projectRef);
        return Response.json({ rows: result });
      }

      case "projects": {
        const projects = await listProjects(base44);
        return Response.json({ projects });
      }

      case "sync_project": {
        const projectRef = body.project_ref || X1_PROJECT_REF;
        if (!body.project_id) {
          return Response.json({ error: "project_id is required" }, { status: 400 });
        }
        // Read the Base44 WebsiteProject
        const project = await base44.entities.WebsiteProject.get(body.project_id);
        if (!project) {
          return Response.json({ error: "Project not found" }, { status: 404 });
        }

        // Push to Supabase factory_definition table
        const factoryRow = {
          factory_type: "website",
          name: project.business_name || "Untitled",
          slug: (project.business_name || "untitled").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
          industry: project.industry || null,
          need_statement: project.content?.heroHeadline || null,
          opportunity: JSON.stringify(project.content || {}),
          competitors: JSON.stringify(project.benchmark?.competitors || []),
          pricing: JSON.stringify({}),
          brand_options: JSON.stringify(project.content?.brandOptions || []),
          approved: JSON.stringify({}),
          status: project.status || "draft",
          validation: JSON.stringify({}),
          owner_id: user.id,
        };

        const inserted = await insertRows(base44, "factory_definition", factoryRow, projectRef);

        // Also push a work item so the autonomous system picks it up
        const workResult = await pushWorkItem(
          base44,
          {
            task_id: `sync_${project.id}`,
            requested_by: user.email || user.id,
            action_class: "BUILD_WEBSITE",
            required_capabilities: ["code", "deploy"],
            workPayload: {
              source: "digital_dominance_factory",
              project_id: project.id,
              business_name: project.business_name,
              industry: project.industry,
              content: project.content,
              deploy_url: project.deploy_url || null,
            },
            priority: 50,
            mission_id: `mission_${project.id}`,
          },
          projectRef
        );

        return Response.json({
          success: true,
          factoryDefinition: inserted,
          workItem: workResult,
        });
      }

      default:
        return Response.json(
          { error: `Unknown operation: ${operation}. Valid: status, push_work, read, query, projects, sync_project` },
          { status: 400 }
        );
    }
  } catch (error) {
    return Response.json(
      { error: error.message || "Supabase bridge operation failed" },
      { status: 500 }
    );
  }
}