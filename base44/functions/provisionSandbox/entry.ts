import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { secrets } from 'base44:runtime';

const RAILWAY_API = "https://backboard.railway.com/graphql/v2";
const VERCEL_API = "https://api.vercel.com";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    let user = null;
    try { user = await base44.auth.me(); } catch {}
    if (user && user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { action, platform, projectId, sandboxId, name, clientId } = body;

    if (!action || !["create", "destroy", "list"].includes(action)) {
      return Response.json({ error: "action required (create | destroy | list)" }, { status: 400 });
    }

    // List sandboxes
    if (action === "list") {
      const page = await base44.entities.Sandbox.filter({}, { sort: "-created_date", limit: 50 });
      return Response.json({ sandboxes: page.items || [] });
    }

    if (!platform || !["railway", "vercel"].includes(platform)) {
      return Response.json({ error: "platform required (railway | vercel)" }, { status: 400 });
    }

    // Create sandbox
    if (action === "create") {
      const sandboxName = name || `sandbox-${Date.now()}`;

      // Create Sandbox entity record
      const sandbox = await base44.entities.Sandbox.create({
        project_id: projectId || null,
        platform,
        status: "provisioning",
        config: { name: sandboxName },
      });

      try {
        let platformId, url;

        if (platform === "railway") {
          const token = secrets.get("RAILWAY_API_TOKEN");
          if (!token) throw new Error("RAILWAY_API_TOKEN not set");

          // Create Railway project via GraphQL v2 (uses $input variable)
          const res = await fetch(RAILWAY_API, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: `mutation projectCreate($input: ProjectCreateInput!) { projectCreate(input: $input) { id name } }`,
              variables: { input: { name: sandboxName } },
            }),
            signal: AbortSignal.timeout(15000),
          });
          const data = await res.json();
          if (data.errors) throw new Error(data.errors[0]?.message || "Railway API error");
          platformId = data.data?.projectCreate?.id;
          if (!platformId) throw new Error("Failed to create Railway project");
          url = `https://railway.com/project/${platformId}`;

        } else if (platform === "vercel") {
          const token = secrets.get("VERCEL_TOKEN");
          const teamId = secrets.get("VERCEL_TEAM_ID");
          if (!token) throw new Error("VERCEL_TOKEN not set");

          const res = await fetch(`${VERCEL_API}/v10/projects${teamId ? `?teamId=${teamId}` : ""}`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: sandboxName }),
            signal: AbortSignal.timeout(15000),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error?.message || "Vercel API error");
          platformId = data.id;
          url = `https://vercel.com/${data.accountId || teamId}/${sandboxName}`;

          // Link a Git repo if projectId provided (optional)
          if (projectId) {
            try {
              const project = await base44.entities.WebsiteProject.get(projectId);
              if (project.business_website) {
                // Could auto-deploy here in the future
              }
            } catch {}
          }
        }

        // Update sandbox record
        const updated = await base44.entities.Sandbox.update(sandbox.id, {
          status: "active",
          sandbox_id: platformId,
          url,
        });

        // Link sandbox to client if clientId provided (auto-provisioning)
        if (clientId) {
          try {
            const client = await base44.entities.Client.get(clientId);
            const config = client.config || {};
            config.sandboxes = config.sandboxes || {};
            config.sandboxes[platform] = { id: platformId, url, sandboxEntityId: sandbox.id };
            await base44.entities.Client.update(clientId, { config });
          } catch {}
        }

        return Response.json({
          success: true,
          sandbox: updated,
          sandboxId: platformId,
          url,
          platform,
        });

      } catch (err) {
        await base44.entities.Sandbox.update(sandbox.id, { status: "failed" });
        return Response.json({ error: err.message, sandboxId: sandbox.id }, { status: 500 });
      }
    }

    // Destroy sandbox
    if (action === "destroy") {
      if (!sandboxId) return Response.json({ error: "sandboxId required" }, { status: 400 });

      const page = await base44.entities.Sandbox.filter({ id: sandboxId }, { limit: 1 });
      const sandbox = page.items?.[0];
      if (!sandbox) return Response.json({ error: "Sandbox not found" }, { status: 404 });

      if (sandbox.platform === "railway") {
        const token = secrets.get("RAILWAY_API_TOKEN");
        if (token && sandbox.sandbox_id) {
          await fetch(RAILWAY_API, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: `mutation { projectDelete(id: "${sandbox.sandbox_id}") }`,
            }),
            signal: AbortSignal.timeout(15000),
          });
        }
      } else if (sandbox.platform === "vercel") {
        const token = secrets.get("VERCEL_TOKEN");
        const teamId = secrets.get("VERCEL_TEAM_ID");
        if (token && sandbox.sandbox_id) {
          await fetch(`${VERCEL_API}/v9/projects/${sandbox.sandbox_id}${teamId ? `?teamId=${teamId}` : ""}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` },
            signal: AbortSignal.timeout(15000),
          });
        }
      }

      const destroyed = await base44.entities.Sandbox.update(sandboxId, {
        status: "destroyed",
        destroyed_at: new Date().toISOString(),
      });

      return Response.json({ success: true, sandbox: destroyed });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}