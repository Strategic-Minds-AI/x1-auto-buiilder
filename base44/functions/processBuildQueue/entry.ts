import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { waitUntil, secrets } from 'base44:runtime';
import { buildWebsiteBlueprint } from '../../shared/generation.js';

// Build Queue processor — runs on a schedule (BuildQueueProcessor workflow).
// 1. Picks up pending BuildQueue items (sorted by priority).
// 2. Checks if the external GPT engine is "logged in" via GPTMemory.
// 3. If GPT is available: creates a GPTMission for the item and marks it "assigned".
//    The GPT engine picks up the mission via gptAutonomousSync and processes it.
// 4. If GPT is NOT available: the autonomous coder generates the website content
//    directly using buildWebsiteBlueprint, creates a WebsiteProject, and marks
//    the item "completed".
// 5. Also checks "assigned" items — if the linked GPTMission is "complete",
//    copies the result and marks the BuildQueue item "completed".

const PRIORITY_ORDER = { p0: 0, p1: 1, p2: 2, p3: 3 };

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin required' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const { action = 'process', limit = 5 } = body;

    const result: any = {
      action,
      timestamp: new Date().toISOString(),
      assigned: [],
      completed: [],
      failed: [],
      checked: 0,
      gpt_online: false,
    };

    // ── Check if GPT engine is "logged in" ──────────────────────
    const gptOnline = await checkGptOnline(base44);
    result.gpt_online = gptOnline;

    // ── CHECK ASSIGNED ITEMS: did GPT complete any? ─────────────
    const { items: assignedItems } = await base44.asServiceRole.entities.BuildQueue.filter(
      { status: 'assigned', assigned_to: 'gpt_engine' },
      { sort: '-created_date', limit: 20 }
    );

    for (const item of assignedItems) {
      if (!item.mission_id) continue;
      try {
        const mission = await base44.asServiceRole.entities.GPTMission.get(item.mission_id);
        if (mission && mission.status === 'complete') {
          await base44.asServiceRole.entities.BuildQueue.update(item.id, {
            status: 'completed',
            result: { mission_report: mission.final_report, artifacts: mission.artifacts },
            completed_at: new Date().toISOString(),
          });
          result.completed.push({ id: item.id, title: item.title, via: 'gpt_engine' });
        } else if (mission && mission.status === 'failed') {
          // GPT failed — reassign to autonomous coder
          await processWithAutonomousCoder(base44, item);
          result.failed.push({ id: item.id, title: item.title, reason: 'GPT mission failed — reassigned to autonomous coder' });
        }
      } catch (err: any) {
        // Mission might not exist anymore — skip
      }
      result.checked++;
    }

    // ── PROCESS PENDING ITEMS ───────────────────────────────────
    if (action === 'process') {
      const { items: pendingItems } = await base44.asServiceRole.entities.BuildQueue.filter(
        { status: 'pending' },
        { sort: '-created_date', limit: 100 }
      );

      // Sort by priority (p0 first), then by created_date (oldest first)
      pendingItems.sort((a, b) => {
        const pa = PRIORITY_ORDER[a.priority] ?? 2;
        const pb = PRIORITY_ORDER[b.priority] ?? 2;
        if (pa !== pb) return pa - pb;
        return new Date(a.created_date).getTime() - new Date(b.created_date).getTime();
      });

      const batch = pendingItems.slice(0, limit);

      for (const item of batch) {
        try {
          if (gptOnline) {
            // ── GPT PATH: create a mission for the GPT engine ──
            const mission = await base44.asServiceRole.entities.GPTMission.create({
              mission_text: `Build: ${item.title}${item.description ? '\n\nDetails: ' + item.description : ''}${item.industry ? '\n\nIndustry: ' + item.industry : ''}${item.location ? '\n\nLocation: ' + item.location : ''}`,
              status: 'planning',
              steps: [],
              artifacts: [],
              receipts: [],
            });

            await base44.asServiceRole.entities.BuildQueue.update(item.id, {
              status: 'assigned',
              assigned_to: 'gpt_engine',
              mission_id: mission.id,
              started_at: new Date().toISOString(),
            });

            result.assigned.push({ id: item.id, title: item.title, mission_id: mission.id });
          } else {
            // ── AUTONOMOUS CODER PATH: generate directly ──
            await processWithAutonomousCoder(base44, item);
            result.completed.push({ id: item.id, title: item.title, via: 'autonomous_coder' });
          }
        } catch (err: any) {
          await base44.asServiceRole.entities.BuildQueue.update(item.id, {
            status: 'failed',
            error: err.message,
            completed_at: new Date().toISOString(),
          });
          result.failed.push({ id: item.id, title: item.title, reason: err.message });
        }
      }
    }

    // ── WHATSAPP NOTIFICATION: alert on completions or failures ──
    if (result.completed.length > 0 || result.failed.length > 0) {
      waitUntil(sendWhatsAppAlert(result));
    }

    result.success = true;
    return Response.json(result);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// Send a WhatsApp summary message to the admin's phone via Twilio
async function sendWhatsAppAlert(result: any): Promise<void> {
  try {
    const accountSid = secrets.get('TWILIO_ACCOUNT_SID');
    const authToken = secrets.get('TWILIO_AUTH_TOKEN');
    const fromNumber = secrets.get('TWILIO_PHONE_NUMBER');
    const toPhone = secrets.get('WHATSAPP_ADMIN_PHONE');
    if (!accountSid || !authToken || !fromNumber || !toPhone) return;

    const lines: string[] = [];
    if (result.completed.length > 0) {
      lines.push(`✅ ${result.completed.length} build(s) completed:`);
      for (const c of result.completed.slice(0, 5)) {
        lines.push(`  • ${c.title} (${c.via || 'done'})`);
      }
    }
    if (result.failed.length > 0) {
      lines.push(`❌ ${result.failed.length} build(s) failed:`);
      for (const f of result.failed.slice(0, 5)) {
        lines.push(`  • ${f.title}`);
      }
    }
    lines.push(`\nGPT: ${result.gpt_online ? 'Online' : 'Offline (autonomous coder)'}`);
    lines.push(`Checked: ${result.checked} | Assigned: ${result.assigned.length}`);

    const cleanTo = toPhone.replace(/[^0-9]/g, '');
    const cleanFrom = fromNumber.replace(/[^0-9]/g, '');

    const params = new URLSearchParams();
    params.append('To', `whatsapp:+${cleanTo}`);
    params.append('From', `whatsapp:+${cleanFrom}`);
    params.append('Body', lines.join('\n'));

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const authHeader = 'Basic ' + btoa(`${accountSid}:${authToken}`);

    await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
      signal: AbortSignal.timeout(15000),
    });
  } catch { /* best-effort — don't fail the build on notification error */ }
}

// Check if the external GPT engine has an active session in GPTMemory
async function checkGptOnline(base44: any): Promise<boolean> {
  try {
    const { items } = await base44.asServiceRole.entities.GPTMemory.filter(
      { status: 'logged_in', agent_id: { $regex: 'gpt', $options: 'i' } },
      { sort: '-last_activity', limit: 1 }
    );
    if (items.length === 0) return false;
    // Check if the session is recent (within 15 minutes)
    const lastActivity = new Date(items[0].last_activity || items[0].login_time || items[0].created_date);
    const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000);
    return lastActivity > fifteenMinAgo;
  } catch {
    return false;
  }
}

// Generate website content using the autonomous coder (InvokeLLM via buildWebsiteBlueprint)
async function processWithAutonomousCoder(base44: any, item: any): Promise<void> {
  await base44.asServiceRole.entities.BuildQueue.update(item.id, {
    status: 'processing',
    assigned_to: 'autonomous_coder',
    started_at: new Date().toISOString(),
  });

  const blueprint = await buildWebsiteBlueprint(base44, {
    businessWebsiteUrl: '',
    industry: item.industry || item.title,
    businessName: item.business_name || '',
  });

  const project = await base44.asServiceRole.entities.WebsiteProject.create({
    business_name: item.business_name || blueprint.businessResearch?.businessName || item.title,
    business_website: '',
    industry: item.industry || '',
    status: 'generated',
    business_research: blueprint.businessResearch,
    benchmark: blueprint.benchmark,
    content: blueprint.content,
  });

  await base44.asServiceRole.entities.BuildQueue.update(item.id, {
    status: 'completed',
    assigned_to: 'autonomous_coder',
    project_id: project.id,
    result: {
      business_research: blueprint.businessResearch,
      content: blueprint.content,
      project_id: project.id,
    },
    completed_at: new Date().toISOString(),
  });
}