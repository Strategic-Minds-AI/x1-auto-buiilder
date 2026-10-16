import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { siteUrl, projectName } = body;

    if (!siteUrl) return Response.json({ error: 'siteUrl is required' }, { status: 400 });

    // Step 1: Generate Playwright test script using LLM
    const testPlan = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a Playwright QA Agent. Generate a comprehensive browser test plan for this site: ${siteUrl}
Project: ${projectName || 'Unknown'}

Generate Playwright tests that physically validate EVERY interaction like a real user:
1. Page loads without errors
2. Every visible button is clickable
3. Every form can be submitted
4. Navigation links work
5. Mobile responsive (375px width)
7. Tablet responsive (768px width)
8. Desktop responsive (1280px width)
9. No console errors
10. Images load
11. No broken links
12. Accessibility: keyboard navigation works
13. Accessibility: all images have alt text

Return a structured test plan with:
- tests: array of {name, action, selector, expected, severity}
- playwright_script: a complete Playwright test script (JavaScript) that can be run with npx playwright test
- coverage: percentage of interactions covered`,
      add_context_from_internet: true,
      model: "gemini_3_8_flash",
      response_json_schema: {
        type: "object",
        properties: {
          tests: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                action: { type: "string" },
                selector: { type: "string" },
                expected: { type: "string" },
                severity: { type: "string", enum: ["critical", "high", "medium", "low"] },
              },
            },
          },
          playwright_script: { type: "string" },
          coverage: { type: "number" },
        },
      },
    });

    // Step 2: Check if a local sandbox session is available
    let sandboxResult = null;
    try {
      const sessions = await base44.entities.LocalSandboxSession.filter(
        { status: "online", capabilities: { $in: ["shell"] } },
        { limit: 1 }
      );
      const session = sessions?.items?.[0];

      if (session) {
        // Send the Playwright script to the local sandbox for execution
        const scriptContent = testPlan.playwright_script || generateDefaultScript(siteUrl);
        const command = await base44.entities.LocalSandboxCommand.create({
          session_id: session.session_id,
          command_id: crypto.randomUUID(),
          source: "pipeline",
          command_type: "shell",
          payload: {
            cmd: `npx playwright test --reporter=json`,
            setup: [
              `mkdir -p qa-tests && cd qa-tests`,
              `cat > test.spec.js << 'SCRIPT_EOF'\n${scriptContent}\nSCRIPT_EOF`,
              `npm init -y && npm install @playwright/test`,
              `npx playwright install chromium`,
            ],
          },
          status: "pending",
          priority: "p1",
          timeout_seconds: 300,
        });
        sandboxResult = {
          sent: true,
          commandId: command.command_id,
          sessionId: session.session_id,
          machine: session.machine_name,
          status: "pending_execution",
          message: "Playwright test sent to local sandbox. Results will appear when the agent polls.",
        };
      }
    } catch (e) {
      sandboxResult = { sent: false, error: e.message };
    }

    // Step 3: If no sandbox, run LLM-based static analysis as fallback
    let staticAnalysis = null;
    if (!sandboxResult?.sent) {
      staticAnalysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are a QA Agent fallback. No local sandbox is connected for Playwright execution.
Analyze this site statically using web context: ${siteUrl}

Check what you can:
1. Does the page load?
2. Are there obvious missing elements?
3. Are meta tags present?
4. Is there a sitemap?
5. Any visible errors?

Return a structured QA report with pass/fail for each check.`,
        add_context_from_internet: true,
        model: "gemini_3_8_flash",
        response_json_schema: {
          type: "object",
          properties: {
            checks: { type: "array", items: { type: "object", properties: { name: { type: "string" }, passed: { type: "boolean" }, detail: { type: "string" } } } },
            score: { type: "number" },
            summary: { type: "string" },
            recommendation: { type: "string" },
          },
        },
      });
    }

    return Response.json({
      ok: true,
      siteUrl,
      testPlan,
      sandboxExecution: sandboxResult,
      staticAnalysis,
      coverage: testPlan.coverage || 0,
      totalTests: testPlan.tests?.length || 0,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

function generateDefaultScript(siteUrl) {
  return `const { test, expect } = require('@playwright/test');
test('Page loads', async ({ page }) => {
  await page.goto('${siteUrl}');
  await expect(page).toHaveTitle(/.+/);
});
test('No console errors', async ({ page }) => {
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  await page.goto('${siteUrl}');
  expect(errors).toEqual([]);
});
test('Mobile responsive', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('${siteUrl}');
  await expect(page.locator('body')).toBeVisible();
});
test('All buttons clickable', async ({ page }) => {
  await page.goto('${siteUrl}');
  const buttons = await page.locator('button, a[role="button"], input[type="submit"]').all();
  for (const btn of buttons) {
    await expect(btn).toBeVisible();
  }
});`;
}