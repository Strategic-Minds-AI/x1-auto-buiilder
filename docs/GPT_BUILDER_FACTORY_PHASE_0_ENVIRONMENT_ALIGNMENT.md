# PHASE 0: ENVIRONMENT ALIGNMENT GATE

Status: MANDATORY PRE-BUILD GATE
Owner: GPT Builder Factory PRIME
Applies to: every generated website, app, SaaS, funnel, portal, automation, Digital Dominance project, agent build, and reusable pack.

## Purpose

Before any project reaches BUILD_READY, GPT Builder Factory PRIME must reconcile and verify the complete operating path:

GPT Project -> Google Drive -> GitHub -> Local Folder -> Docker -> Railway -> Supabase -> Vercel -> X1 Queue -> Super Agents -> Artifact Vault -> QA -> Independent Validator.

The gate exists to prevent source drift, duplicate runtimes, false READY states, unsaved artifacts, and mismatched deployments.

## Required Systems

1. GPT Project / ChatGPT Business workspace
2. Canonical Google Drive project folder
3. Canonical GitHub repository
4. Canonical local project folder
5. Local Docker Engine + Docker Compose
6. Existing Railway Strategic Sandbox System
7. Required Supabase environment
8. Vercel project / preview target when applicable
9. Existing X1 authoritative queue/runtime
10. Registered Super Agents / specialist agents
11. Artifact Vault
12. QA Agent
13. Independent Validator

## Hard Rule

A project MAY NOT enter BUILD_READY unless every required alignment row is VERIFIED or NOT_APPLICABLE.

Allowed states:
- VERIFIED
- STALE
- MISSING
- BLOCKED
- UNKNOWN
- NOT_APPLICABLE

## Canonical Authority

- GitHub = code source truth
- Google Drive = human-readable project evidence/assets
- Local folder = working cache/sandbox only
- Supabase / X1 = durable task/runtime state
- GPT Project = operator reasoning and project-control surface
- Vercel = preview/customer-facing deployment
- Railway = durable isolated workers/runtime
- Docker = reproducible local runtime

No two systems may claim equal authority for the same state class.

## Environment Alignment Manifest

Create ENVIRONMENT_ALIGNMENT_MANIFEST.json before generation.

Each row records:
- system
- provider
- account/workspace
- project_id
- environment_id
- repo_or_path
- branch
- source_sha
- runtime_id
- connection_status
- read_status
- write_status
- execute_status
- last_verified_at
- receipt_id
- rollback_ref
- status
- blocker

## Source Identity Invariant

For a validated build:

LOCAL_GIT_SHA
=
GITHUB_SOURCE_SHA
=
RAILWAY_DEPLOY_SHA where used
=
VERCEL_PREVIEW_SHA
=
QA_SOURCE_SHA
=
VALIDATOR_SOURCE_SHA

Any mismatch => SOURCE_DRIFT => gate FAIL.

## Local Folder Contract

Canonical local root for GPT Builder Factory:

C:\\_Strategic_Minds_AI_OS\\66_GPT BUILDER FACTORY\\

Per project:

projects\\<project_slug>\\
  repo\\
  00_CONTROL_PLANE\\
  01_CLIENT_VISION\\
  02_VISUAL_REFERENCES\\
  03_RESEARCH\\
  04_BRAND\\
  05_FRONTEND\\
  06_BACKEND\\
  07_INTEGRATIONS\\
  08_SEO_GEO_AEO\\
  09_DETERMINISTIC_BUILD\\
  10_SANDBOX_RUNTIME\\
  11_ROADMAP\\
  12_QA_VALIDATION\\
  13_STAGE_GATES\\
  14_RELEASE\\
  15_OPERATIONS\\
  16_ARTIFACT_VAULT\\
  17_CLIENT_HANDOFF\\

The repo folder is a Git working tree. The remaining folders hold local working evidence and caches.

## Docker Gate

Verify before BUILD_READY:
- Docker installed
- Docker Engine healthy
- Docker Compose available
- expected image builds
- container healthcheck passes
- network strategy valid
- volume strategy valid
- no host-only dependency prevents reproduction
- runtime environment contract matches Railway where applicable

Required project files when Docker is applicable:
- Dockerfile
- compose.yaml or docker-compose.yml
- .dockerignore
- docker/README.md
- healthcheck definition

If a clean-machine build cannot be reproduced, status = SANDBOX_NOT_REPRODUCIBLE.

## Local / Railway Runtime Parity

Both local Docker and Railway must consume the same RuntimePack.

RuntimePack must define:
- runtime_version
- node_version
- package_manager
- install_command
- build_command
- start_command
- worker_command
- ports
- environment_schema
- healthcheck
- queue_binding
- storage_binding
- database_binding
- network_requirements

If local is unavailable, use the existing Railway Strategic Sandbox System. Do not create a duplicate worker fleet.

## GPT Project Alignment

PROJECT_MANIFEST.json must include:
- project_id
- project_slug
- github_repo
- github_branch
- github_sha
- drive_folder_id
- local_folder_path
- railway_project_id
- railway_environment_id
- supabase_project_ref
- vercel_project_id
- x1_queue_binding
- artifact_vault_binding
- qa_binding
- validator_binding

GPT Project sources must point to the current project manifest/source truth rather than stale copied IDs.

## Google Drive Alignment

Drive stores:
- intake
- client vision
- visual references
- research
- approvals
- screenshots
- QA/validation reports
- release/client handoff
- verified artifact receipts

Code must not use Drive as its authoritative source repository.

## Auto-Save Contract

Every material GPT-created artifact follows:

CREATE -> CLASSIFY -> ROUTE -> SCAN -> HASH -> SAVE -> READ BACK -> VERIFY -> RECEIPT

Routing:
- code/schemas/workflows -> Git branch + commit receipt
- client/research/visual/QA docs -> Drive + verified file ID/revision
- local mirror -> canonical local project folder when local control is available
- runtime/task state -> X1/Supabase
- release evidence -> Artifact Vault

No read-back receipt => not complete.

## Required Agents

- Project Orchestrator
- Source Truth Agent
- Environment Alignment Agent
- Research Agent
- Visual Research Agent
- Brand Agent
- Frontend Builder
- Backend Builder
- Data Architect
- Integration Agent
- DevOps Agent
- Docker Sandbox Agent
- Railway Runtime Agent
- Supabase Agent
- Vercel Deployment Agent
- Artifact Vault Agent
- Security Agent
- Playwright QA Agent
- QA Agent
- Independent Validator
- Repair Agent
- Client Handoff Agent
- Operations Agent

Builder != QA != Independent Validator.

## Required Builder Documents

- PROJECT_MANIFEST.json
- ENVIRONMENT_ALIGNMENT_MANIFEST.json
- SOURCE_TRUTH.md
- PROJECT_START_INVENTORY.json
- CLIENT_VISION.md
- DEFINITION_OF_DONE.md
- REQUIREMENTS.md
- REQUIREMENTS_MATRIX.csv
- VISUAL_DNA.md
- BRAND_SPEC.md
- FRONTEND_ARCHITECTURE.md
- BACKEND_ARCHITECTURE.md
- DATA_MODEL.md
- AUTH_SPEC.md
- INTEGRATION_MATRIX.md
- RUNTIME_PACK.json
- DOCKER_RUNTIME.md
- RAILWAY_BINDING.json
- SUPABASE_BINDING.json
- VERCEL_BINDING.json
- GITHUB_BINDING.json
- DRIVE_BINDING.json
- GPT_PROJECT_BINDING.json
- TASK_GRAPH.json
- QA_PLAN.md
- VALIDATION_PLAN.md
- RELEASE_PLAN.md
- ROLLBACK.md
- OPERATIONS_RUNBOOK.md
- CLIENT_HANDOFF.md

## Provisioning Order

Validated BuildPack
-> Git branch
-> local Docker build where available
-> builder tests
-> existing X1 queue
-> Railway sandbox where needed
-> Supabase staging where needed
-> Vercel noindex preview
-> Playwright/browser QA
-> security QA
-> QA Agent
-> Independent Validator
-> client review
-> explicit production approval

## Environment Alignment Validator

The independent alignment validator verifies:
- canonical local folder exists
- repo remote is correct
- local branch is correct
- local SHA equals GitHub SHA
- Docker Engine healthy
- Docker Compose healthy
- required containers healthy
- Railway binding correct
- Supabase binding correct
- Vercel binding correct
- Drive folder correct
- GPT Project identity correct
- X1 queue binding correct
- agent registry available
- Artifact Vault available
- QA available
- Independent Validator available

Verdicts:
- ALIGNMENT_PASS
- ALIGNMENT_FAIL
- ALIGNMENT_BLOCKED

## Protected Actions

Phase 0 does not authorize:
- production release/rollback
- merge to default/protected branch
- production DB/RLS changes
- secrets/OAuth changes
- DNS/domain changes
- permission changes
- payments/spend
- customer outbound email/SMS/calls
- destructive changes
- irreversible migrations

## Acceptance Canary

Before the plugin is production-ready, prove one complete alignment canary:

one project ID
-> one GPT Project
-> one Drive folder
-> one Git repo/SHA
-> one local project folder
-> one Docker build
-> one existing Railway sandbox binding
-> one Supabase staging binding
-> one Vercel noindex preview
-> one QA receipt
-> one Independent Validator receipt

Do not claim alignment complete until this canary passes with receipts.
