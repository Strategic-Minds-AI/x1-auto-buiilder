# Ultimate Auto Builder control v1.0.0: read-only discovery, guarded repair, and release blockers

**Audit date:** 2026-10-18 UTC
**Declared authority:** `Strategic-Minds-AI/x1-auto-buiilder`, `main`
**Observed base SHA:** `e1ba06d7750ef95fc65d4b5f7f58df238c4c6884`
**Repair branch:** `security/ultimate-builder-gates-20261018`
**Execution class:** authenticated READ and reversible BRANCH_WRITE only. No default-branch merge, Base44 publish, production database change, secret edit, Railway provisioning, customer message, DNS, or production release was authorized or performed.

## Discoveries and receipts

1. GitHub repository exists, unarchived, public, and authenticated connector permits admin/push. The `main` branch was **not protected** at inspection.
2. `base44/config.jsonc` already contains `ULTIMATE_AUTO_BUILDER_BIDIRECTIONAL_CONTROL` v1.0.0 and user-specified source-truth identity. A declarative manifest does not itself grant provider capabilities.
3. Existing code has 108 Base44 functions, including `gptSyncEngine`, `gptAutonomousSync`, `gptLibraryControl`, `autonomousFactoryCycle`, `authorizeRelease`; entities include `SyncReceipt`, `ValidationReceipt`, `ApprovalRequest`, `WorkPacket`.
4. Connected Base44 app `GPT AUTO BUILDER`, ID `6acfedce320afe2f706c6bfd`, has a recent `SyncReceipt` for `push` at 2026-10-18 02:52:56 UTC, status **error**, summary `Pushed 20 records across 18 entities (HTTP 404)`. A pull had no commands; the wrapper incorrectly logged overall success. This is not a passing two-way sync.
5. Existing auto-factory code could call Vercel with `target: 'production'` for `preview_ready` projects and create Railway projects without an independently confirmed release/spend approval. Prior bridge accepted caller-controlled `approved: true`; `authorizeRelease` self-created approved state. These are release-blocking security defects.
6. Baseline legacy AUTO_BUILDER_2 control-plane health was `ok`, but its bundled source map pointed to `Strategic-Minds/AUTO_BUILDER`, not this operator-selected repo. No registry migration or competing supervisor was created.
7. Vercel rendered `691e0c194e01b7cf77f94e79edc6c0bc5a22da47` as deployment `dpl_2eVjYyqUtdyY7LywvUPtrB4qNTBg`, state `READY`, target `null` (preview). GET root returned HTTP 200 with `x-robots-tag: noindex`. This is a frontend-preview transport check, **not** proof that Deno/Base44 functions execute correctly.

## Changes on repair branch

- `24d025869993821c1802cccdedf9b0d04e810b89`: require admin on factory cycle; restrict automated Vercel to noindex preview; disable unapproved Railway project provisioning; reflect failed phases in receipts.
- `64001b536a47baadfa7a26d2d376a7601f0159dc`: prevent false-positive GPT sync, stop, and disable responses.
- `d20e28edf18443517ad743c106431835b5db835f`: require idempotency/version preconditions, independently scoped approval references, and protect approval/validation evidence from the sync bridge.
- `b6628d0506781dcf3d1916ca331338de54b57415`: replace auto-approved production release with PENDING request and evidence gates.
- `691e0c194e01b7cf77f94e79edc6c0bc5a22da47`: propagate HTTP push/pull/ack/command failures, remove Lead name/email from external snapshot.
- `2d4a4de10ef7c36f711db7e7c613a0bb41a6b93b`: use `ValidationReceipt.pipeline_run_id` instead of nonexistent `project_id`; bind release readiness to pipeline and immutable SHA.
- `90b45a9220a77bfcb52802a80c59498410d5f8c4`: 11 static control-gate regression tests.
- `72b2c90164f1a77504dc480a17383bc4d741be97`: pull-request CI for regression tests, build, lint, and typecheck.

## Validation and limitations

**VERIFIED:** authenticated repository access; base source SHA; diff/branch commit receipts; live Base44 error receipts; Vercel preview READY/HTTP 200/noindex at the noted preview SHA.

**PENDING:** CI results for latest branch SHA, independent full-code review, Base44 Deno runtime tests, negative authorization tests, web/browser/E2E/mobile, fresh two-way synthetic message acknowledgment, durable duplicate-delivery tests, independently verified per-action approvals, reliable external engine routing, source reconciliation and publish receipts.

**KNOWN RISKS:**
- The real `ENGINE_URL` push still returned 404 in the most recent inspected live receipt. Do not mask the failure or send real Lead PII to an unverified endpoint.
- The scheduled factory now fails closed without verified administrator/service identity; an existing scheduler may be blocked until a separately authorized supported identity is implemented. This preserves safety, but it is not seamless autonomous operation.
- Current receipt idempotency keys use timestamps/random values; single-effect guarantees across retries/concurrent runs are **not proven**. Require existing X1/worker durable uniqueness and lease receipts, not a duplicate queue.
- Base44 Git-sync inbound from GitHub has not been demonstrated on an isolated writable Base44 branch. Base44 branch listing showed only `main`, so do not conduct a destructive or default-branch canary.
- `main` was unprotected during discovery. Branch protection and permission changes require separately scoped operator approval.
- External commands and indirect function calls require more exhaustive route-by-route permission and side-effect audits. Manifest booleans do not enforce policy.
- `authorizeRelease` is intentionally PENDING-only; its pipeline-to-project name binding and source SHA syntax checks do not independently verify upstream repository contents. Release remains blocked.
- Current branch Vercel frontend readiness is not Base44 backend deployment/sync validation.

## Approval gates and safe next work

1. Complete CI and independent review; repair failures on the same branch, verify fresh branch SHA and diff for every write.
2. Identify and test the external engine's expected snapshot route with a non-secret read-only/health call, then request separate approval before changing secret-bound `ENGINE_URL`, permissions, or production integration.
3. Confirm a supported nonhuman scheduled-worker identity for the existing singleton reconcilers. Reuse existing X1 queues, leases, and receipts rather than creating a second scheduler.
4. Add an isolated synthetic canary: GitHub branch -> Base44 builder -> GitHub, both with source/hash/receipt and an explicit no-production-data condition. Require an independent validator verdict and one committed idempotent effect.
5. Block the PR merge and all release actions until independent validation has passed; preserve any operator-approved rollback reference.

## Rollback

Because these changes are limited to an unmerged branch, leave `main` unchanged to revert the proposal. Revert each commit on the branch or close the draft PR after recording its diff. A merged-production rollback would be a protected action requiring fresh operator approval.

## Current disposition

**BRANCH REPAIRS: COMMITTED. PREVIEW: VERIFIED AT IDENTIFIED SHA. BIDIRECTIONAL LIVE SYNC: FAIL. CI/INDEPENDENT END-TO-END VALIDATION: UNKNOWN. PRODUCTION RELEASE: BLOCKED.**
