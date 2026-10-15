import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { projectId } = await req.json();
    if (!projectId) return Response.json({ error: 'projectId is required' }, { status: 400 });

    const project = await base44.asServiceRole.entities.BuildProject.get(projectId);
    if (!project) return Response.json({ error: 'BuildProject not found' }, { status: 404 });

    const strategy = project.strategy || {};
    const tactics = strategy.tactics || [];
    const missionText = `Execute strategy "${strategy.name || project.name}" for ${project.name}.` +
      ` Summary: ${strategy.summary || 'N/A'}.` +
      ` Tactics: ${JSON.stringify(tactics)}.` +
      ` Vision type: ${project.vision_type || 'N/A'}.`;

    const mission = await base44.asServiceRole.entities.GPTMission.create({
      mission_text: missionText,
      decomposed_plan: { strategy, vision: project.vision, addons: project.addons },
      project_id: projectId,
      status: 'awaiting_approval'
    });

    await base44.asServiceRole.entities.AgentTask.create({
      agent_name: 'communications_director',
      task: `Review GPT Mission alignment for "${project.name}". Mission ID: ${mission.id}. Verify strategy decomposition and mission alignment before it goes live to the agents.`,
      status: 'pending',
      priority: 'high',
      project_id: projectId,
      assigned_to: 'communications_director'
    });

    return Response.json({ mission: { id: mission.id, status: mission.status }, notified: 'communications_director' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}