import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Install a free asset into a project — marks it as installed and returns integration instructions
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { asset_id, project_id } = body;
    if (!asset_id) return Response.json({ error: 'asset_id required' }, { status: 400 });

    // Find the asset
    const { items } = await base44.entities.FreeAsset.filter({ asset_id }, { limit: 1 });
    const asset = items?.[0];
    if (!asset) return Response.json({ error: 'Asset not found' }, { status: 404 });

    // Increment install count
    await base44.asServiceRole.entities.FreeAsset.update(asset.id, {
      installed_count: (asset.installed_count || 0) + 1,
      status: 'installed',
    });

    // If project_id provided, create an AgentTask to track the installation
    if (project_id) {
      await base44.entities.AgentTask.create({
        title: `Install ${asset.name} into project`,
        description: `Install ${asset.name} (${asset.type}) from the Free Library. Steps: ${(asset.install_steps || []).join('; ')}`,
        assigned_agent: 'super_agent',
        status: 'not_started',
        priority: 'p2',
        source_id: project_id,
        evidence_required: `Asset ${asset.name} integrated and functional in project`,
      });
    }

    return Response.json({
      success: true,
      asset: {
        name: asset.name,
        type: asset.type,
        install_steps: asset.install_steps,
        code_snippet: asset.code_snippet,
        source_url: asset.source_url,
        docs_url: asset.docs_url,
      },
      project_id: project_id || null,
      installed_at: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}