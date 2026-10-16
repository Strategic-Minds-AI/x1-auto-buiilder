# X1 Autonomous GPT Builder | Phase 1 Integration Handoff

**2026-10-15 | Branch-only / Draft | DO NOT MERGE OR PUBLISH**

## Mission / source truth

Use this repository as the **website application** source at commit `acfa8e57d2a10f9070b8acb7aa2b2ed6d2af9361`. GPT is the operator's conversational planning, drafting and verification interface. Durable jobs must run in the already-authoritative X1 queue/worker only after verifying identity, lease ownership and current active scheduler. **Do not create a second cron, queue, agent controller, or payment provider.**

The independently verified Auto Builder 2 MCP bridge is healthy, but its own topology identifies `Strategic-Minds/AUTO_BUILDER` and `Strategic-Minds/SANDBOX`, not this repository. Identity convergence is an explicit blocker until the connector is mapped to the correct X1 app.

## Completed local-only Phase 1 packet

An additive package, `X1_AUTONOMOUS_GPT_FACTORY_PHASE1_20261015.zip`, has been built and checksum-verified in the operator's ChatGPT conversation. Its `x1-factory/` directory contains:

- `contracts/authority.mjs`: deny-by-default, tenant-scoped, identity-verifying GPT command allowlist. Protected actions never accept caller-supplied approval booleans.
- `contracts/sitepack.mjs`: versioned immutable SHA-256 SitePack; the three selected premium visual families Northline / Monolith / Forme.
- `contracts/sync.mjs`: redacted draft-only, versioned sync and authenticated inbound command gateway contract. Caller-provided `signature_verified` flags do not grant trust.
- `provisioning/local-composer.mjs`: **real adapter to existing Digital Dominance Visual Factory V3.1**, not a generic screenshot renderer. Local-only `noindex` HTML/asset compilation with receipt/hash verification.
- `provisioning/preview.mjs`: dry-run Vercel preview plan, independent-receipt acceptance criteria and production-target rejection.
- `analytics/google.mjs`: read-only Search Console and GA4 normalization; **not** a claim of X1-side OAuth or configured event tagging.
- `templates/registry.json`: approved design directions and exact V3.1 source references.
- `docs/`: source truth, frontend/backend, 30-step workflow, workflows/cron, agents/Codex, n8n/Google Chat/social, Google analytics, smoke/rollback and environment checks.
- `tests/core.test.mjs`: 11/11 deterministic Node tests PASS; `npm run canary`: PASS dry run; local real epoxy site compilation: PASS; zero protected/production actions.

The packet includes an actual generated epoxy HTML example, bundled photo asset, `robots.txt`, SHA-256 build receipt, and recorded Chromium **environment BLOCKED** evidence. Browser visual fidelity was NOT independently certified.

**Installation state**: contract package locally packaged only, **NOT pushed as executable X1 application code**. This file is a source-truth handoff. The original Visual Factory V3.1 binary/source ZIP is separately owned by the operator and must be installed from a verified SHA before a cloud worker can compile sites.

## High-severity defects found in the existing live app

1. `base44/functions/deploySite/entry.ts` directly sets Vercel `target:'production'`.
2. `base44/functions/provisionPreview/entry.ts` calls that production function and creates an optimistic `result:'pass'` without independent HTTP, noindex or browser proof.
3. `base44/functions/createBrandManifest/entry.ts` assigns `status:'approved'` from generated content.
4. `base44/functions/runValidation/entry.ts` rates a content JSON blob with a model instead of testing rendered visuals, forms, a11y, auth and security.
5. `base44/functions/gptSyncEngine/entry.ts` and `gptAutonomousSync/entry.ts` declare broad write/delete/execution actions; existing scheduled 5-minute and 10-minute workflows must be reconciled rather than duplicated.
6. `base44/functions/provisionSite/entry.ts` generates a placeholder `G-XXXXXXXXXX` measurement ID and optimistic provision status.
7. `base44/functions/syncAllAnalytics/entry.ts` invokes GSC only despite its GA4-related name.

**Do not enable mass launch, unattended production deploy, or generic GPT function invocation until these are repaired, tested and independently verified.**

## Verified connectors and correct interpretation

- Vercel project `prj_GGJKog8cbo35OtfCC6IXV2itS8Ul` and production READY deployment `dpl_Es2JHkhS6XH2SEaBhrPNVKb21Fa4` at the observed source SHA.
- Supabase X1 staging `uvdkzsbjackpjvpoxtyk`, X1 production `vgsmyhqqtkkluhypxyua`; reuse existing `x1_work_queue`, `x1_task_leases`, and `x1_audit_receipts`, with tenant policy and lease checks.
- Windsor.ai connected three GA4 accounts and four Search Console properties. **Actual read-only** sample data from Strategic Minds AI GA4 and `sc-domain:strategicmindsai.com` was returned on 2026-10-15. X1 app OAuth and scheduled cross-tenant ingestion remain **UNKNOWN**. GSC Wizard access was blocked by expired subscription.
- The existing Digital Dominance donor repo `XTREME-SYSTEMS/digital-dominance` branch `feature/premium-master-concepts-20261015` contains the original premium Northline/Monolith/Forme pages.

## Required next narrow milestone

1. Import local tested `x1-factory/` into **this feature branch only** and run `npm test`; no default branch or Base44 publish.
2. Verify the signed GPT gateway identity, tenant policy and existing X1 staging lease/scheduler owner. Disable arbitrary command/function execution.
3. Repair the preview-vs-production deployment adapter in **isolated dev scope**, and do not self-certify receipt validity.
4. Run one synthetic SitePack through an X1 staging job to the existing V3.1 compiler; emit durable immutable receipts. Use a browser environment that can open the HTTP preview and capture 1440/768/390 screenshots with actual functional tests.
5. Bind provider-authorized read-only GA4/GSC properties and attribute real future leads/sales only with verified event instrumentation and tenant consent.
6. Request explicit operator release approval **after** independent test matrix and rollback proof. Only then consider one commercial canary, later 10, later batches.

Protected actions: production publishing, domain/DNS, credentials, spend, mass customer data, live messages, database/RLS, merging default branch or irreversible modifications. No protected action is authorized by this draft.

## Quality contract

**Visual**: selected approved reference locked; measure 99% parity at specified desktop/tablet/mobile viewports when measurable. **Functional**: 100% of declared executable tests pass. Untested behavior remains UNKNOWN. Google content must be useful, verified, non-doorway, free of invented local presence/reviews/claims. Autonomous throughput is a measured outcome, not a promised launch rate.

### Receipt truth

VERIFIED: static contracts, 11 tests, local site compilation, source and provider reads.  
INFERRED: integration should reuse existing queue and V3.1 compiler; native X1 bindings not established.  
COULD NOT VERIFY: independent browser visual QA in restricted container, OAuth inside X1, real preview deploy, live lead capture/attribution, single active worker.  
BLOCKERS: source/app identity mapping, release-path bugs, server-side auth and native measurement bindings.  
WORKAROUNDS: local NOINDEX preview, draft-only sync, Windsor read-only evidence, branch-only docs.  
NEXT: import tested source to this branch, validate, run one staging canary, then request protected release review.
