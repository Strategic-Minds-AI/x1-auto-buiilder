import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { compileProject, routeExecution, checkCompletion, PIPELINE_STAGES } from "../../shared/superAgentOrchestrator.js";
import { validateAgainstMasterDirectory } from "../../shared/bidirectionalControlContract.js";
import { INDUSTRY_FAMILIES, getFamilyById } from "../../shared/industryRegistry.js";
import { PLATFORM_PACKS, getPlatformById } from "../../shared/platformRegistry.js";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action } = body;

    if (action === 'compile') {
      // Validate against master directory
      const validation = validateAgainstMasterDirectory(body, {
        industryRegistry: INDUSTRY_FAMILIES,
        platformRegistry: PLATFORM_PACKS,
      });

      if (validation.has_blocks) {
        return Response.json({
          status: 'BLOCKED',
          validation,
          message: 'Master directory validation failed — cannot proceed',
        }, { status: 400 });
      }

      // Compile project into WorkPackets
      const compiled = compileProject(body);
      if (compiled.status === 'BLOCKED') {
        return Response.json(compiled, { status: 400 });
      }

      // Create PipelineRun
      const pipelineRun = await base44.entities.PipelineRun.create({
        project_name: body.business_name || body.project_idea || 'Untitled Project',
        status: 'processing',
        current_stage: 'intake',
        current_stage_index: 0,
        stages: PIPELINE_STAGES.map((s, i) => ({
          id: s.stage_id,
          label: s.label,
          status: i === 0 ? 'IN_PROGRESS' : 'PENDING',
          agent: s.agent,
        })),
        auto_launch: false,
      });

      // Create WorkPackets
      const packets = await base44.entities.WorkPacket.bulkCreate(
        compiled.work_packets.map((wp) => ({
          ...wp,
          pipeline_run_id: pipelineRun.id,
        }))
      );

      return Response.json({
        status: 'COMPILED',
        project_id: compiled.project_id,
        pipeline_run_id: pipelineRun.id,
        industry_family: compiled.industry_family,
        platform: compiled.platform,
        total_packets: compiled.total_packets,
        work_packets: packets,
        validation_warnings: validation.has_warnings ? validation.violations.filter(v => v.severity === 'WARN') : [],
      });
    }

    if (action === 'route') {
      const { local_available, railway_available } = body;
      const routing = routeExecution(local_available, railway_available);
      return Response.json(routing);
    }

    if (action === 'check_completion') {
      const { pipeline_run_id } = body;
      const { items: packets } = await base44.entities.WorkPacket.filter(
        { pipeline_run_id },
        { sort: 'packet_id', limit: 50 }
      );
      const completion = checkCompletion(packets);
      return Response.json({
        pipeline_run_id,
        ...completion,
      });
    }

    if (action === 'get_stages') {
      return Response.json({
        stages: PIPELINE_STAGES,
        total: PIPELINE_STAGES.length,
      });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}