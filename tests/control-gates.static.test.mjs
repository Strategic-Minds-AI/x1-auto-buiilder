import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const source = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const config = JSON.parse(source('base44/config.jsonc'));
const factory = source('base44/functions/autonomousFactoryCycle/entry.ts');
const sync = source('base44/functions/gptSyncEngine/entry.ts');
const autonomous = source('base44/functions/gptAutonomousSync/entry.ts');
const library = source('base44/functions/gptLibraryControl/entry.ts');
const bridge = source('base44/functions/gptControlBridge/entry.ts');
const release = source('base44/functions/authorizeRelease/entry.ts');
const receiptSchema = JSON.parse(source('base44/entities/SyncReceipt.jsonc'));
const validatorSchema = JSON.parse(source('base44/entities/ValidationReceipt.jsonc'));

test('source truth is explicitly bound to the intended GitHub repository', () => {
  assert.equal(config.name, 'ULTIMATE_AUTO_BUILDER_BIDIRECTIONAL_CONTROL');
  assert.equal(config.source_truth.repository, 'Strategic-Minds-AI/x1-auto-buiilder');
  assert.equal(config.source_truth.default_branch, 'main');
  assert.equal(config.release_gate.require_operator_approval_for_production, true);
});

test('factory does not accept an anonymous scheduled request', () => {
  assert.match(factory, /!user\s*\|\|\s*user\.role\s*!==\s*'admin'/);
});

test('factory can only deploy preview-ready sites to Vercel preview', () => {
  assert.match(factory, /status:\s*'preview_ready'/);
  assert.doesNotMatch(factory, /target:\s*['"]production['"]/);
  assert.match(factory, /noindex,nofollow,noarchive/);
  assert.match(factory, /Cannot enforce preview noindex/);
});

test('factory cannot create Railway projects without approval', () => {
  assert.doesNotMatch(factory, /projectCreate\s*\(/);
  assert.match(factory, /Railway project creation requires scoped approval/);
});

test('factory cannot record a schema-invalid partial status', () => {
  assert.deepEqual(receiptSchema.properties.status.enum, ['success', 'error', 'duplicate']);
  assert.doesNotMatch(factory, /status:\s*result\.errors\.length\s*===\s*0\s*\?\s*'success'\s*:\s*'partial'/);
  assert.match(factory, /status:\s*result\.success\s*\?\s*'success'\s*:\s*'error'/);
});

test('sync bridge requires write idempotency and concurrency preconditions', () => {
  assert.match(sync, /A stable idempotency_key is required for writes/);
  assert.match(sync, /expected_updated_date is required to prevent stale writes/);
  assert.match(sync, /Unable to verify existing record version/);
});

test('protected execution requires a scoped independent approval', () => {
  assert.doesNotMatch(sync, /if\s*\(isProtected\s*&&\s*!body\.approved\)/);
  assert.match(sync, /ApprovalRequest\.get\(body\.approval_id\)/);
  assert.match(sync, /approval\.status\s*===\s*'APPROVED'/);
  assert.match(sync, /INDEPENDENT_CONTROL_ENTITIES\.has\(body\.entity\)/);
});

test('release pathway cannot self-approve or publish', () => {
  assert.match(release, /status:\s*'PENDING'/);
  assert.match(release, /authorized:\s*false/);
  assert.doesNotMatch(release, /status:\s*'approved'/);
  assert.doesNotMatch(release, /WebsiteProject\.update\s*\(/);
  assert.doesNotMatch(release, /GenerationJob\.create\s*\(/);
});

test('release requires linked pipeline and source SHA', () => {
  assert.ok(validatorSchema.properties.pipeline_run_id);
  assert.ok(!validatorSchema.properties.project_id);
  assert.match(release, /pipeline_run_id:\s*pipelineRunId/);
  assert.match(release, /PipelineRun\.get\(pipelineRunId\)/);
  assert.match(release, /sourceSha/);
});

test('sync result checks both legs and acknowledges command failures', () => {
  assert.match(autonomous, /result\.pushed\?\.ok\s*===\s*true/);
  assert.match(autonomous, /result\.pulled\?\.ok\s*===\s*true/);
  assert.match(autonomous, /Pull HTTP/);
  assert.match(autonomous, /Ack HTTP/);
  assert.doesNotMatch(autonomous, /Lead:\s*\['id',\s*'name',\s*'email'/);
});

test('library control does not fabricate stop/disable acknowledgments', () => {
  assert.match(library, /No enforced disable path exists/);
  assert.match(library, /Scheduled workflow has not been disabled/);
  assert.match(library, /Sync did not pass both directions/);
});

test('GPT service-role bridge requires administrator identity on all tools', () => {
  assert.match(bridge, /authenticatedUser\.role\s*!==\s*'admin'/);
  assert.match(bridge, /bearer\s*&&\s*validKey\s*&&\s*bearer\s*===\s*validKey/);
  assert.doesNotMatch(bridge, /apiKey\s*&&\s*validKey/);
  assert.match(bridge, /Administrator authority required for service-role operations/);
});

test('GPT bridge cannot create its own approved release or invalid approval records', () => {
  assert.match(bridge, /status:\s*'PENDING'/);
  assert.match(bridge, /action_class:\s*p\.actionClass/);
  assert.match(bridge, /rollback_ref:\s*p\.rollbackRef/);
  assert.match(bridge, /ValidationReceipt\.filter\(\{ verdict:\s*'FAIL' \}/);
  assert.doesNotMatch(bridge, /status:\s*'pending'/);
});
