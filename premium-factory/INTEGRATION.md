# PREMIUM REAL-SITE FACTORY | X1 BRANCH-SAFE INTEGRATION

**Source:** Strategic-Minds-AI/x1-auto-buiilder `2a2059ec614c326bf429a69f524c133a5a03761f`.
**Stage:** development implementation pack; no default-branch merge, live publish, DNS, cost, customer messaging or credentials changed.

The user-approved high-end source-master families (Argent, Monolith, Atelier) are checked into `premium-factory/templates` as **text source of truth**. The optional full portable generator and three real bundled canaries are delivered separately in the ChatGPT artifact named `Strategic_Minds_Premium_Real_Site_Factory_Canary_V1.zip`. This repository's binary design artwork is **NOT** mirrored into the new repo because the current binary file connector cannot read that content from the old source. Do not claim this branch alone can deploy these masters yet. The downloadable pilot bundle contains the complete artworks and can be run without network.

## Verified root causes

- `src/lib/visualRender/websiteLayouts.js` produces small preview compositions; `base44/shared/siteRenderer.js` emits a generic actual website. High-end preview selection was not tied to the real site generation path.
- `deploySite` targeted Vercel `production` even when called from `provisionPreview`.
- `provisionPreview` wrote PASS without independently validating HTTP/noindex.
- `runValidation` conflated LLM content opinions with visual, security and accessibility proof.

## Branch-only changes

1. `siteRenderer.js` rejects *premium* content without its immutable source-locked bundle rather than silently exporting the generic page. Legacy projects without a premium selection still use their existing renderer.
2. `deploySite` explicitly rejects production attempts, creates a preview-target request (by omitting Vercel's production target), and injects search exclusion markers. **Actual Vercel project identity, preview target and HTTP header behavior are still unverified**.
3. `provisionPreview` records an UNKNOWN receipt and demands independent browser validation; returning a Vercel URL is not a visual/operational PASS.
4. `runValidation` declassifies blueprint-only LLM reviews from release-critical PASS status.
5. `scripts/verify-premium-preview-safety.mjs` tests the local safety contracts.

## Using the actual standalone canaries

Unzip the artifact, open `gallery/index.html`, then inspect each generated `output/*/index.html`. You can also run `node bridge/build-batch.cjs fixtures/website-projects.json output/new-batch` within the artifact. The user-selected design architecture remains unchanged except for controlled brand, headline and introductory copy slots.

## Next integration gate

Import the artwork to an **owned, versioned** Vercel/Supabase asset bucket with rights verification. Implement a governed adapter that produces `WebsiteProject -> approved visual lock -> portable render bundle -> preview -> independent screenshots and receipts`. Do not blindly pass the large standalone HTML through a database field until storage limits and isolation are verified. Validate 1440x900 / 768x1024 / 390x844, image relevance, semantics, form delivery (only when intentionally connected), CSP, robots headers, tenant isolation and safe rollback.

**Important:** One CI PASS does not validate image rights, 99% parity, live leads, backend, production publishing or customer claims.
