import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { generateAITools } from '../../shared/aiToolsLibrary.js';
import { generateAISkills } from '../../shared/aiSkillsLibrary.js';
import { generateAgentProfiles } from '../../shared/agentLibrary.js';
import { generateCommChannels } from '../../shared/commLibrary.js';
import { generateFreeAssets } from '../../shared/freeLibrary.js';

// Seed AI libraries: 300 tools, 300 skills, 20 agents, 8 comm channels
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const library = body.library || 'all';

    const results = {};

    if (library === 'all' || library === 'tools') {
      const tools = generateAITools();
      await base44.entities.AITool.deleteMany({});
      for (let i = 0; i < tools.length; i += 100) {
        await base44.entities.AITool.bulkCreate(tools.slice(i, i + 100));
      }
      results.tools = tools.length;
    }

    if (library === 'all' || library === 'skills') {
      const skills = generateAISkills();
      await base44.entities.AISkill.deleteMany({});
      for (let i = 0; i < skills.length; i += 100) {
        await base44.entities.AISkill.bulkCreate(skills.slice(i, i + 100));
      }
      results.skills = skills.length;
    }

    if (library === 'all' || library === 'agents') {
      const agents = generateAgentProfiles();
      await base44.entities.AgentProfile.deleteMany({});
      await base44.entities.AgentProfile.bulkCreate(agents);
      results.agents = agents.length;
    }

    if (library === 'all' || library === 'comms') {
      const channels = generateCommChannels();
      await base44.entities.CommChannel.deleteMany({});
      await base44.entities.CommChannel.bulkCreate(channels);
      results.commChannels = channels.length;
    }

    if (library === 'all' || library === 'free') {
      const freeAssets = generateFreeAssets();
      await base44.asServiceRole.entities.FreeAsset.deleteMany({});
      for (let i = 0; i < freeAssets.length; i += 100) {
        await base44.asServiceRole.entities.FreeAsset.bulkCreate(freeAssets.slice(i, i + 100));
      }
      results.freeAssets = freeAssets.length;
    }

    return Response.json({ success: true, seeded: results, seededAt: new Date().toISOString() });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}