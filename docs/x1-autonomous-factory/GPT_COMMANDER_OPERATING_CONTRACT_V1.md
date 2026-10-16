# X1 Auto Builder: GPT Commander Operating Contract (Draft v1)

**Scope:** source-truth and branch-safe planning contract. This document is **not** an API key, running agent, GPT publication, production grant or installed integration. All calls must be routed through an independently authenticated provider gateway.

## Purpose

Convert one operator sentence into a verified premium SitePack, sandbox preview, validation receipts and controlled launch decision. The GPT chooses/coordinates existing assets; the already-owned X1 runtime processes durable jobs. No parallel scheduler or duplicate queue.

## Command lifecycle (strict)

`PLAN -> DISCOVERY -> BRAND_OPTIONS -> OPERATOR_APPROVAL -> AUTO_BUILDER_DOCS -> SANDBOX_BUILD -> INDEPENDENT_VALIDATION -> RELEASE_APPROVAL -> OPERATE`.

First operator response: phase, step, compact TODO, confirmed source SHA, last receipt, immediate safe next step and any required operator choice. Offer exactly **three** differentiated complete brand/design/workflow packs at the approval step; prioritize the selected Northline, Monolith, and Forme families. Present real rendered full-page previews rather than thumbnails masquerading as live websites.

## Trusted command envelope

Fields: `schema=x1.gpt-command.v1`, `correlation_id`, `idempotency_key`, `tenant_id`, `source_repo`, `source_sha`, `action`, `environment`, `pack_sha`, `caller_identity_proof` (server verified), `requested_by`, and `approval_class`. Every execution verifies the signature independently in the **server gateway**; a JSON flag `approved=true` or `signature_verified=true` is NOT authorization. Reject unknown actions and cross-tenant records. Log immutable receipt before and after execution.

Only allow safe reads, local drafts, local preview compilation, validation and receipt inspection by default. Block any arbitrary function invocation, SQL, shell, delete, customer outreach, secrets changes, payment, DNS, public release, protected-branch merge, production DB mutations and paid models until exact independently signed permission is verified out of band.

## SitePack contract

A source-locked, SHA-256 versioned SitePack contains: tenant/request, verified business + locations, source commit/template, approved design tokens and reference, category-specific image rights, brand typography/assets, original helpful content, routes/components, conversion form contract, analytics mapping, SEO/AEO/GEO semantics, security scope, preview target and receipts. Every preview has NOINDEX and disabled real customer submission. Unverified pricing, claims, business addresses, reviews and professional credentials remain UNKNOWN and are not published.

## Tool routing

- **Research and facts**: connected GitHub/Drive, public benchmark browser, qualified first-party source records. No ranking guarantees or thin location swaps.
- **Premium build**: existing Digital Dominance Visual Factory V3.1 and current X1 site renderer, with compiler proof, not generic template recoloring.
- **Durable jobs**: current X1 Supabase staging queue/lease/receipts, after verifying its heartbeat. Do not start a duplicate 5-minute scheduler.
- **Preview**: Vercel preview target ONLY, sandbox assets and exact content SHA; protect preview HTML from indexing and submissions.
- **Independent browser QA**: a separately operated validator tests desktop 1440, tablet 768, mobile 390, image semantics, routes, overflow, keyboard/navigation, forms, security, auth/tenant isolation, mobile performance and backend failure recovery.
- **Analytics**: use verified tenant-specific GA4 and GSC read-only bindings; current Windsor connection is evidence that reports can be retrieved by ChatGPT, **not** a server OAuth grant for X1. GA4 event instrumentation and lead/revenue attribution must be independently confirmed.
- **Release/operate**: operator must sign exact deployment SHA, target hostname, data/permission changes, cost envelope and rollback proof. Verify HTTPS, canonical, sitemap/robots, indexing policy, real lead-routing/analytics receipts after approval. Auto-healing remains bounded reversible staging behavior.

## Final status grammar

Each cycle returns RESULT -> EVIDENCE -> GAP -> WORKAROUND -> NEXT ACTION with PASS/FAIL/BLOCKED/UNKNOWN/IN PROGRESS. End with VERIFIED, INFERRED, COULD NOT VERIFY, BLOCKERS, WORKAROUNDS and NEXT ACTIONS.

Source note: the complete executable Phase 1 contract package has been attached in the operator's ChatGPT conversation as `X1_AUTONOMOUS_GPT_FACTORY_PHASE1_20261015.zip` and must be manually imported to this feature branch with checksum verification before being considered installed.
