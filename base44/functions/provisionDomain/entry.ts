import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";
import { secrets } from "base44:runtime";

// Domain Provisioner — full domain lifecycle management through Vercel:
// check availability, purchase/register, assign to projects, configure DNS,
// and list all domains. Uses VERCEL_TOKEN and VERCEL_TEAM_ID secrets.

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { action, domain, team_id, project_id, use_xps } = body;

    const token = secrets.get("VERCEL_TOKEN");
    const defaultTeam = use_xps ? secrets.get("XPS_VERCEL_TEAM_ID") : secrets.get("VERCEL_TEAM_ID");

    if (!token) return Response.json({ error: "VERCEL_TOKEN not configured" }, { status: 500 });

    const teamId = team_id || defaultTeam;
    const teamParam = teamId ? `?teamId=${teamId}` : "";

    switch (action) {
      case "check": {
        if (!domain) return Response.json({ error: "domain is required" }, { status: 400 });
        const res = await fetch(
          `https://api.vercel.com/v4/domains/status?domain=${encodeURIComponent(domain)}${teamParam}`,
          { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(10000) }
        );
        const status = await res.json();
        return Response.json({ success: true, domain, status });
      }

      case "purchase": {
        if (!domain) return Response.json({ error: "domain is required" }, { status: 400 });
        // Register the domain with Vercel
        const res = await fetch("https://api.vercel.com/v4/domains", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ name: domain, ...(teamId ? { teamId } : {}) }),
          signal: AbortSignal.timeout(15000),
        });
        const result = await res.json();
        if (!res.ok) {
          return Response.json({ error: result.error?.message || "Failed to register domain", details: result }, { status: res.status });
        }
        return Response.json({ success: true, domain, result });
      }

      case "assign": {
        if (!domain || !project_id) return Response.json({ error: "domain and project_id are required" }, { status: 400 });
        const res = await fetch(`https://api.vercel.com/v9/projects/${project_id}/domains${teamParam}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ name: domain }),
          signal: AbortSignal.timeout(10000),
        });
        const result = await res.json();
        if (!res.ok) {
          return Response.json({ error: result.error?.message || "Failed to assign domain", details: result }, { status: res.status });
        }
        return Response.json({ success: true, domain, project_id, result });
      }

      case "list": {
        const res = await fetch(`https://api.vercel.com/v5/domains${teamParam}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: AbortSignal.timeout(10000),
        });
        const result = await res.json();
        return Response.json({ success: true, domains: result.domains || result });
      }

      case "verify": {
        if (!domain) return Response.json({ error: "domain is required" }, { status: 400 });
        const res = await fetch(`https://api.vercel.com/v4/domains/${encodeURIComponent(domain)}/verify${teamParam}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          signal: AbortSignal.timeout(10000),
        });
        const result = await res.json();
        return Response.json({ success: true, domain, result });
      }

      case "remove": {
        if (!domain) return Response.json({ error: "domain is required" }, { status: 400 });
        const res = await fetch(`https://api.vercel.com/v4/domains/${encodeURIComponent(domain)}${teamParam}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
          signal: AbortSignal.timeout(10000),
        });
        const result = await res.json();
        return Response.json({ success: true, domain, result });
      }

      default:
        return Response.json({ error: "Unknown action: " + action + ". Valid: check, purchase, assign, list, verify, remove" }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message || "Domain operation failed" }, { status: 500 });
  }
}