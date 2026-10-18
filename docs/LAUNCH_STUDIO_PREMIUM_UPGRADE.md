# Launch Studio Premium Industry Builder Upgrade

## Included in this branch

- A shared 20-palette library with role-based colors: page background, surface, primary/secondary text, muted text, accent, secondary accent, and gradient.
- The default guided-builder direction is black / near-black with white text and an electric deep-blue-to-cyan accent.
- Brand identity step supports palette selection, custom accent editing, a live preview, and logo generation prompts that use the selected palette.
- Visual Builder theme panel reuses the same 20-palette library and exposes a custom accent and preview.
- The guided builder now captures an industry profile before strategy/template generation. Profiles define art direction, proof points, conversion patterns, and SEO/AEO/GEO topic direction.
- Template recommendations receive the human-readable industry label rather than only the internal slug.
- Website generation accepts a structured design context including the selected industry profile, palette, template, requested pages, target image count, optional modules, and SEO/AEO/GEO requirements.
- Generation prompts explicitly require industry-appropriate logo/hero image prompts and prohibit invented credentials, reviews, awards, service areas, prices, and statistics.
- Requested pages, modules, image target, optimization flags, and design context are retained in the returned blueprint for downstream steps.

## Important integration boundary

The module choices in the Website Generation step are build requirements and blueprint metadata. This branch does **not** claim that selecting a module alone provisions a production CRM, admin portal, funnel, bid/estimate generator, invoice system, booking integration, or analytics pipeline. Those require their own authorized server functions, data entities, access-control rules, payment/communications integrations where applicable, and end-to-end tests.

## Recommended next implementation phases

1. **Template library:** add a first-class industry-template entity with versioning, preview assets, palette tokens, reusable section schemas, and quality scores; connect it to industry-specific ranking and save/reuse flows.
2. **Website editing:** make page/section operations persist to the website project model; add duplicate/reorder/delete, image library selection, logo replacement, responsive preview, and version history.
3. **Funnel + CRM:** implement funnel steps and form schemas, lead capture with validation/rate limiting, server-side persistence, CRM pipeline stages, audit logs, and role-scoped admin access.
4. **Bid / estimate generator:** build structured line items, quantity/unit/price inputs, labor/material/tax/contingency assumptions, editable drafts, explicit approval, and export. Do not present AI prices as verified estimates without user review.
5. **Invoice generator:** create invoices from approved estimates, stable numbering, payment terms, tax configuration, line items, status history, and PDF/email delivery with authorization and audit logs.
6. **Quality and release gates:** automated build/lint, schema validation, broken-link checks, image/alt-text checks, SEO metadata checks, structured-data validation, accessibility checks, responsive browser tests, and human approval before publishing.
7. **Production release:** test the exact Vercel deployment and connected Base44 environment, then promote only after integration checks pass.

## Validation status

The changes were committed to a feature branch for review. A live production deployment has not been changed by this branch. Run the repository's build, lint, Base44 function checks, and browser QA before merging or deploying.
