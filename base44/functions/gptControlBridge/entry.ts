import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// GPT Control Bridge — MCP-style API that allows ChatGPT and authorized AI clients
// to operate the Auto Builder through authenticated, structured tools.
// Exposes a versioned allowlist of typed tools with read/write separation.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);

    // Authenticate via GPT_SYNC_API_KEY for external AI clients, or user session
    const authHeader = req.headers.get('authorization') || '';
    const body = await req.json();
    const { action, tool, params } = body;

    // Validate API key for external access
    const { secrets } = await import('base44:runtime');
    const validKey = secrets.get('GPT_SYNC_API_KEY');
    let authenticatedUser = null;

    const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (bearer && validKey && bearer === validKey) {
      authenticatedUser = { role: 'admin', id: 'gpt-bridge' };
    } else {
      authenticatedUser = await base44.auth.me().catch(() => null);
    }
    if (!authenticatedUser) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    // The bridge uses asServiceRole for cross-tenant records: non-admin access must be denied.
    if (authenticatedUser.role !== 'admin') {
      return Response.json({ error: 'Administrator authority required for service-role operations' }, { status: 403 });
    }

    // Tool registry — typed tools with read/write separation
    const TOOLS = {
      // Discovery tools (read-only)
      system_status: async () => {
        const [projects, templates, campaigns, jobs] = await Promise.all([
          base44.asServiceRole.entities.WebsiteProject.count({}),
          base44.asServiceRole.entities.DesignTemplate.count({}),
          base44.asServiceRole.entities.LaunchCampaign.count({}),
          base44.asServiceRole.entities.GenerationJob.count({ status: { $in: ['queued', 'in_progress'] } })
        ]);
        return { projects, templates, campaigns, activeJobs: jobs, status: 'operational' };
      },

      list_projects: async (p) => {
        const { items } = await base44.asServiceRole.entities.WebsiteProject.filter({}, { sort: '-created_date', limit: p?.limit || 20, fields: ['id', 'business_name', 'industry', 'status', 'created_date'] });
        return items;
      },

      get_project: async (p) => {
        if (!p?.projectId) throw new Error('projectId required');
        return await base44.asServiceRole.entities.WebsiteProject.get(p.projectId);
      },

      list_libraries: async () => {
        const [web, desk, mob] = await Promise.all([
          base44.asServiceRole.entities.DesignTemplate.count({ category: 'website' }),
          base44.asServiceRole.entities.DesignTemplate.count({ category: 'desktop_app' }),
          base44.asServiceRole.entities.DesignTemplate.count({ category: 'mobile_app' })
        ]);
        return { website: web, desktop_app: desk, mobile_app: mob };
      },

      search_industries: async (p) => {
        const { items } = await base44.asServiceRole.entities.DesignTemplate.filter(
          { industry: { $regex: p?.query || '', $options: 'i' } },
          { distinct: 'industry', limit: 50 }
        );
        return items;
      },

      get_analytics_summary: async (p) => {
        if (!p?.projectId) throw new Error('projectId required');
        const { items } = await base44.asServiceRole.entities.MeasurementBinding.filter({ project_id: p.projectId }, { limit: 1 });
        return items[0] || { status: 'NOT_CONFIGURED' };
      },

      // Draft-safe execution tools (create drafts, generate previews)
      create_project_draft: async (p) => {
        return await base44.asServiceRole.entities.WebsiteProject.create({
          business_name: p?.businessName || 'Untitled',
          business_website: p?.businessWebsite || '',
          industry: p?.industry || 'General',
          status: 'draft'
        });
      },

      generate_brand_options: async (p) => {
        return await base44.functions.invoke('generateAssets', {
          logoPrompt: p?.logoPrompt || 'Professional logo for ' + (p?.businessName || 'business'),
          heroImagePrompt: p?.heroPrompt || 'Professional hero image'
        });
      },

      generate_template_preview: async (p) => {
        return await base44.functions.invoke('generateWebsite', p);
      },

      generate_social_campaign_draft: async (p) => {
        return await base44.functions.invoke('generateSocialSchedule', p);
      },

      generate_video_draft: async (p) => {
        return await base44.functions.invoke('generateVideoPipeline', { ...p, generateVideo: false });
      },

      run_validation: async (p) => {
        return await base44.functions.invoke('runValidation', p);
      },

      // Governance tools (protected actions)
      list_pending_approvals: async () => {
        const { items } = await base44.asServiceRole.entities.ApprovalRequest.filter({ status: 'PENDING' }, { sort: '-created_date', limit: 20 });
        return items;
      },

      request_operator_approval: async (p) => {
        const approvedClasses = new Set([
          'PRODUCTION_RELEASE', 'BRANCH_MERGE', 'DB_CHANGE', 'SECRET_ROTATION',
          'DNS_CHANGE', 'PAYMENT_SPEND', 'LIVE_COMMUNICATION',
          'DESTRUCTIVE_ACTION', 'PERMISSION_ESCALATION',
        ]);
        if (!approvedClasses.has(p?.actionClass) || !p?.scope || !p?.rollbackRef) {
          throw new Error('Valid actionClass, exact scope, and rollbackRef are required');
        }
        return await base44.asServiceRole.entities.ApprovalRequest.create({
          request_id: 'AR-' + crypto.randomUUID(),
          action_class: p.actionClass,
          scope: p.scope,
          description: p?.description || 'Approval requested via GPT bridge',
          requested_by: authenticatedUser.id,
          rollback_ref: p.rollbackRef,
          created_at: new Date().toISOString(),
          status: 'PENDING',
        });
      },

      get_security_findings: async () => {
        const { items } = await base44.asServiceRole.entities.ValidationReceipt.filter({ verdict: 'FAIL' }, { sort: '-created_date', limit: 10 });
        return items;
      }
    };

    // Handle different actions
    if (action === 'list_tools') {
      return Response.json({
        tools: Object.keys(TOOLS).map(name => ({
          name,
          type: name.startsWith('list') || name.startsWith('get') || name.startsWith('search') || name === 'system_status' ? 'read' : 'write',
          protected: ['request_operator_approval', 'get_security_findings'].includes(name)
        }))
      });
    }

    if (action === 'invoke') {
      if (!tool || !TOOLS[tool]) {
        return Response.json({ error: 'Unknown tool: ' + tool, available: Object.keys(TOOLS) }, { status: 400 });
      }

      // Check if tool is protected
      const protectedTools = ['request_operator_approval', 'get_security_findings'];
      if (protectedTools.includes(tool) && authenticatedUser.role !== 'admin') {
        return Response.json({ error: 'Protected tool requires admin authorization' }, { status: 403 });
      }

      const result = await TOOLS[tool](params || {});
      return Response.json({ tool, result, receipt: { tool, timestamp: new Date().toISOString(), user: authenticatedUser.id } });
    }

    return Response.json({ error: 'Unknown action. Use list_tools or invoke.' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}