// Autonomous AI Software Company — Platform Dissection & Integration Checklist
// This is the master architecture document for building a credit-independent autonomous company.

export const ARCHITECTURE_CHECKLIST = `# AUTONOMOUS AI SOFTWARE COMPANY
## Platform Dissection & Integration Checklist
### Goal: Build a fully autonomous AI company that NEVER stops when Base44 credits run out

---

## THE CORE PRINCIPLE
**SEPARATE BUILD FROM RUNTIME**

- **BUILD layer** (credit-dependent, acceptable to lose): Base44 + ChatGPT
- **RUNTIME layer** (credit-independent, must never fail): Vercel + Supabase + Railway + Docker
- **FALLBACK layer** (free, always available): Ollama + Google Workspace

If Base44 dies → runtime survives. If ChatGPT dies → runtime survives. If both die → runtime survives on Railway + Supabase + Vercel.

---

## PLATFORM 1: SUPABASE — The Data Backbone

### OPEN (What it is)
PostgreSQL + Auth + Storage + Realtime + Edge Functions + pgvector. Open-source Firebase alternative.

### DISSECT (Capabilities)
- [x] **Database**: Full PostgreSQL with RLS, full-text search, JSON, arrays
- [x] **Auth**: Email/OAuth/phone, JWT tokens, row-level security policies
- [x] **Storage**: File uploads with signed URLs, public/private buckets
- [x] **Realtime**: WebSocket subscriptions on table changes (insert/update/delete)
- [x] **Edge Functions**: Deno-based serverless functions (no credit cost)
- [x] **pgvector**: Native vector embeddings for AI/RAG/memory
- [x] **Migrations**: Version-controlled schema changes via CLI
- [x] **Dashboard**: Admin UI for data management
- [x] **Backups**: Automated daily backups + point-in-time recovery
- [x] **Branching**: Preview branches for schema changes

### INTEGRATE (Where it enhances)
- [ ] **PRIMARY database** for ALL production data (replaces Base44 entities)
- [ ] **Auth** for all end-user authentication (replaces Base44 auth)
- [ ] **Storage** for user-uploaded files (replaces Base44 file storage)
- [ ] **Realtime** for live dashboards, chat, notifications (replaces Base44 subscriptions)
- [ ] **pgvector** for AI memory, knowledge base, semantic search
- [ ] **Edge Functions** for lightweight API endpoints (zero credit cost)
- [ ] **Migrations** stored in Git for reproducibility
- [ ] **RLS** for multi-tenant isolation (one Supabase project, many clients)

### CREDIT INDEPENDENCE: ✅ 100% independent of Base44 credits
### ROLE: The data backbone. Everything persists here. If nothing else works, Supabase works.

---

## PLATFORM 2: VERCEL — The Deployment Target

### OPEN (What it is)
Frontend hosting + serverless functions + cron jobs + edge network. Built by the Next.js team.

### DISSECT (Capabilities)
- [x] **Frontend**: Next.js/React/Vite hosting with global CDN
- [x] **Serverless Functions**: API routes (Node.js, Python, Go, Ruby)
- [x] **Cron Jobs**: Scheduled function calls (free tier: 2 cron jobs)
- [x] **Edge Functions**: Global low-latency functions (V8 isolates)
- [x] **Preview Deployments**: Automatic per-branch preview URLs
- [x] **Environment Variables**: Per-environment config (dev/preview/prod)
- [x] **Analytics**: Web vitals + traffic analytics
- [x] **Domains**: Custom domain management + auto SSL
- [x] **Image Optimization**: On-the-fly image resizing/optimization
- [x] **ISR**: Incremental static regeneration

### INTEGRATE (Where it enhances)
- [ ] **PRIMARY hosting** for all generated websites and apps
- [ ] **Serverless functions** for API endpoints (replaces Base44 functions)
- [ ] **Cron jobs** for scheduled tasks (replaces Base44 workflows)
- [ ] **Preview deployments** for QA validation before production
- [ ] **Edge functions** for geolocation, A/B testing, auth checks
- [ ] **Environment variables** for secrets management (synced from vault)
- [ ] **ISR** for content sites that update periodically

### CREDIT INDEPENDENCE: ✅ 100% independent of Base44 credits
### ROLE: The deployment target. Everything ships here. Generated sites live here forever.

---

## PLATFORM 3: GITHUB (GIT) — The Source of Truth

### OPEN (What it is)
Version control + CI/CD + project management + package registry.

### DISSECT (Capabilities)
- [x] **Repositories**: Source code storage with full history
- [x] **Branches**: Isolated development streams
- [x] **Pull Requests**: Code review + approval workflow
- [x] **Actions**: CI/CD workflows (build, test, deploy on push)
- [x] **Issues**: Task/bug tracking with labels, milestones, assignees
- [x] **Projects**: Kanban boards (v2) for project management
- [x] **Webhooks**: Event triggers for external services
- [x] **GitHub Pages**: Static site hosting
- [x] **GHCR**: Container registry (free for public, included for private)
- [x] **Codespaces**: Cloud dev environments
- [x] **Actions cache**: Speed up CI builds

### INTEGRATE (Where it enhances)
- [ ] **SOURCE OF TRUTH** for all code (every app, service, migration)
- [ ] **Actions** for CI/CD (auto-build on push, auto-deploy on merge)
- [ ] **Issues** for task management (GPT creates/assignes/closes issues)
- [ ] **Projects** for sprint/roadmap visibility
- [ ] **Webhooks** to trigger Railway rebuilds, Vercel deploys
- [ ] **Branches** for each feature/fix (GPT creates PRs, auto-reviewed)
- [ ] **GHCR** for Docker image storage (free)
- [ ] **Actions** can run tests, lint, typecheck before deploy

### CREDIT INDEPENDENCE: ✅ 100% independent of Base44 credits
### ROLE: The source of truth and CI/CD engine. Code lives here, deploys from here.

---

## PLATFORM 4: GOOGLE WORKSPACE — The Collaboration Layer

### OPEN (What it is)
Gmail + Calendar + Drive + Docs + Sheets + Slides + Forms + Apps Script.

### DISSECT (Capabilities)
- [x] **Gmail**: Email send/receive, labels, filters, aliases
- [x] **Calendar**: Event creation, scheduling, reminders, availability
- [x] **Drive**: File storage, sharing, versioning, folder structure
- [x] **Docs**: Collaborative real-time documents
- [x] **Sheets**: Spreadsheets with formulas, scripts, data validation
- [x] **Slides**: Presentations
- [x] **Forms**: Data collection, surveys, intake
- [x] **Apps Script**: Serverless JavaScript automation (FREE, no credits)
- [x] **Admin**: User management, security, compliance
- [x] **Vault**: E-discovery and retention

### INTEGRATE (Where it enhances)
- [ ] **Gmail** for all external communication (client emails, notifications)
- [ ] **Calendar** for scheduling (meetings, deadlines, agent schedules)
- [ ] **Drive** for document storage (contracts, specs, receipts, deliverables)
- [ ] **Sheets** for tracking (project status, KPIs, client data, billing)
- [ ] **Docs** for documentation (builder docs, SOPs, architecture, runbooks)
- [ ] **Forms** for client intake and data collection
- [ ] **Apps Script** for lightweight automation (FREE — no credit cost)
  - Auto-sort emails, generate reports, sync sheets, send reminders
- [ ] **Drive folder structure** mirrors the project taxonomy (00-99)

### CREDIT INDEPENDENCE: ✅ 100% independent of Base44 credits
### ROLE: The human-readable collaboration layer. Where humans and AI meet.

---

## PLATFORM 5: CLOUD (AWS/GCP) — The Overflow Infrastructure

### OPEN (What it is)
General-purpose cloud infrastructure for anything Supabase/Vercel/Railway can't handle.

### DISSECT (Capabilities)
- [x] **Compute**: EC2/VMs for long-running or GPU-intensive processes
- [x] **Storage**: S3/Cloud Storage for large file storage (videos, backups)
- [x] **CDN**: CloudFront/Cloud CDN for content delivery
- [x] **DNS**: Route53/Cloud DNS for domain management
- [x] **Queue**: SQS/Pub-Sub for message queues
- [x] **Lambda/Cloud Functions**: Serverless compute
- [x] **IAM**: Fine-grained access management
- [x] **Monitoring**: CloudWatch/Stackdriver for observability
- [x] **GPU**: EC2 GPU instances for local AI inference at scale

### INTEGRATE (Where it enhances)
- [ ] **S3/Cloud Storage** for large media (videos, generated images, backups)
- [ ] **DNS** for domain management (cheaper than Vercel for many domains)
- [ ] **SQS/Pub-Sub** for high-throughput async job processing
- [ ] **Monitoring** for cross-platform observability
- [ ] **GPU instances** for running Ollama at scale (when local GPU isn't enough)
- [ ] **ONLY use** when Supabase/Vercel/Railway genuinely can't do the job
- [ ] **Backups**: Supabase → S3 for cross-region backup redundancy

### CREDIT INDEPENDENCE: ✅ 100% independent of Base44 credits
### ROLE: The overflow infrastructure. Only used when other platforms hit limits.

---

## PLATFORM 6: RAILWAY — The Backend Runtime

### OPEN (What it is)
Backend hosting for long-running services + databases + cron. Deploy from Git or Docker.

### DISSECT (Capabilities)
- [x] **Services**: Deploy from Git repo, Docker image, or CLI
- [x] **Databases**: PostgreSQL, Redis, MongoDB (managed)
- [x] **Variables**: Environment variable management
- [x] **Volumes**: Persistent storage for services
- [x] **Cron**: Scheduled task execution
- [x] **Webhooks**: Deployment triggers from GitHub
- [x] **Private networking**: Service-to-service communication (internal)
- [x] **Logs**: Real-time log streaming
- [x] **Health checks**: Automatic restart on failure
- [x] **Auto-scale**: Horizontal scaling (paid plans)

### INTEGRATE (Where it enhances)
- [ ] **Host the SYNC ENGINE** (bidirectional GPT ↔ app bridge)
- [ ] **Host long-running workers** (queue consumers, background jobs)
- [ ] **Host the local sandbox bridge server** (persistent endpoint)
- [ ] **Redis** for caching, job queues, session storage
- [ ] **Cron** for scheduled maintenance tasks (cleanup, health checks)
- [ ] **Private networking** for secure service-to-service calls
- [ ] **Health checks** for autonomous monitoring and self-healing
- [ ] **Deploy from GitHub** — every push to main auto-deploys

### CREDIT INDEPENDENCE: ✅ 100% independent of Base44 credits
### ROLE: The backend runtime for services that must stay alive 24/7.

---

## PLATFORM 7: DOCKER — The Packaging Standard

### OPEN (What it is)
Containerization platform for reproducible, portable, isolated environments.

### DISSECT (Capabilities)
- [x] **Images**: Reproducible environment definitions (Dockerfile)
- [x] **Containers**: Isolated runtime instances
- [x] **Compose**: Multi-container orchestration (docker-compose.yml)
- [x] **Registry**: Image storage (Docker Hub, GHCR, ECR)
- [x] **Volumes**: Persistent data across container restarts
- [x] **Networks**: Container-to-container communication
- [x] **Health checks**: Built-in health monitoring
- [x] **Multi-stage builds**: Optimized production images
- [x] **BuildKit**: Fast, cached builds

### INTEGRATE (Where it enhances)
- [ ] **Package every Railway service** as a Docker container
- [ ] **Reproducible dev environments** for GPT to work in (same as prod)
- [ ] **Docker Compose** for local development (mirrors production exactly)
- [ ] **GHCR** for image storage (free with GitHub, versioned)
- [ ] **Health checks** for autonomous monitoring
- [ ] **Multi-stage builds** for small, fast-deploying production images
- [ ] **Every service has a Dockerfile** — no "it works on my machine"

### CREDIT INDEPENDENCE: ✅ 100% independent of Base44 credits
### ROLE: The packaging standard. Everything runs in containers. Reproducible everywhere.

---

## PLATFORM 8: OLLAMA (LOCAL) — The Free LLM Fallback

### OPEN (What it is)
Local LLM inference engine. Runs Llama, Mistral, Qwen, Phi, and more on your hardware. 100% free.

### DISSECT (Capabilities)
- [x] **Models**: Run open-source LLMs locally (Llama 3, Mistral, Qwen, Phi-3)
- [x] **API**: OpenAI-compatible REST API (drop-in replacement)
- [x] **No credits**: 100% free, runs on your CPU/GPU
- [x] **Streaming**: Token streaming for real-time output
- [x] **Embeddings**: Local embedding generation (for RAG)
- [x] **Multi-modal**: Some models support vision (LLaVA)
- [x] **Offline**: No internet required
- [x] **Fine-tuning**: Can be fine-tuned with additional tooling
- [x] **Model library**: Pull models with one command (ollama pull llama3)

### INTEGRATE (Where it enhances)
- [ ] **FALLBACK LLM** when Base44 credits are low or exhausted
- [ ] **Simple tasks** (classification, extraction, formatting, summarization) → Ollama
- [ ] **Complex tasks** (reasoning, code generation, creative writing) → ChatGPT
- [ ] **Embeddings** for RAG (free, local, no credit cost — replaces Base44 vector calls)
- [ ] **Code review** and linting suggestions (runs in CI, no cost)
- [ ] **Content moderation** / filtering (runs locally, no API cost)
- [ ] **Routing logic** (deciding which tasks need ChatGPT vs Ollama)
- [ ] **API compatibility**: Same OpenAI-format API, so switching is a base URL change

### CREDIT INDEPENDENCE: ✅ 100% free, no credits, no internet needed
### ROLE: The free LLM fallback. Keeps the AI running when credits are gone.

### ROUTING LOGIC
\`\`\`
Task arrives →
  Is it simple (classify, extract, format, summarize)?
    YES → Ollama (free)
    NO → Is it complex (reason, code, create)?
      YES → ChatGPT (better quality, costs credits)
      NO → Ollama (free)
  Are Base44 credits low?
    YES → Route ALL tasks to Ollama
    NO → Use ChatGPT for complex, Ollama for simple
\`\`\`

---

## PLATFORM 9: BASE44 — The Builder (NOT the Runtime)

### OPEN (What it is)
AI-powered app builder with backend-as-a-service. Fast prototyping, but credit-dependent.

### DISSECT (Capabilities)
- [x] **Builder**: AI generates pages, entities, functions from chat
- [x] **Entities**: Database schema + auto-generated CRUD API
- [x] **Functions**: Backend functions (HTTP handlers in TypeScript)
- [x] **Workflows**: Scheduled/triggered automations (CNCF SWF format)
- [x] **Integrations**: Core integrations (LLM, email, file upload, image gen)
- [x] **Connectors**: OAuth connectors (Google, GitHub, Slack, etc.)
- [x] **Agents**: In-app AI agents with tool permissions
- [x] **Hosting**: Built-in hosting on base44.app domain
- [x] **CREDITS**: Integration credits consumed by LLM calls, file ops, etc.
- [x] **RLS**: Row-level security on entities

### INTEGRATE (Where it enhances)
- [ ] **PROTOTYPING**: Rapid app generation and iteration (days → minutes)
- [ ] **ENTITY DESIGN**: Schema prototyping (then migrate to Supabase)
- [ ] **FUNCTION DESIGN**: API prototyping (then port to Vercel/Railway)
- [ ] **CONNECTOR MANAGEMENT**: OAuth flow setup and testing
- [ ] **ADMIN UI**: Internal dashboards and management interfaces
- [ ] **GENERATION ENGINE**: Use Base44's AI to generate code, then export to Git
- [ ] **NOT for production runtime** (credit risk — system dies if credits run out)
- [ ] **NOT for critical data storage** (migrate to Supabase before going live)

### CREDIT INDEPENDENCE: ❌ DEPENDENT on credits — THIS IS THE RISK
### ROLE: The builder/prototyper. Generates code, then exports to credit-independent platforms.

### THE MIGRATION PROTOCOL
1. Build in Base44 (fast iteration, AI-assisted)
2. Export generated code to GitHub
3. Migrate entities → Supabase migrations
4. Port functions → Vercel serverless or Railway services
5. Port workflows → Vercel cron or Railway cron
6. Set up direct OAuth connectors (not through Base44)
7. Deploy to Vercel/Railway (credit-independent)
8. Base44 is now optional — system runs without it

---

## PLATFORM 10: CHATGPT (HIGHLY AUTONOMOUS) — The Brain

### OPEN (What it is)
Advanced LLM with tools, agents, code execution, projects, scheduled tasks, and MCP.

### DISSECT (Capabilities)
- [x] **Reasoning**: Advanced multi-step reasoning (o1/o3-class models)
- [x] **Code Generation**: Write/fix/refactor code in any language
- [x] **Tool Use**: Call APIs, search web, execute code, read files
- [x] **Agents**: Autonomous multi-step task execution with tools
- [x] **Projects**: Persistent context, instructions, and knowledge per domain
- [x] **Custom GPTs**: Specialized assistants with custom instructions
- [x] **Work**: Long-running cloud tasks (minutes to hours)
- [x] **Scheduled Tasks**: Cron-like automation (hourly recurrence)
- [x] **MCP**: Connect to external tools (Supabase, GitHub, Vercel, Google)
- [x] **File handling**: Read/write/analyze files (CSV, XLSX, PDF, code)
- [x] **Canvas**: Collaborative editing interface
- [x] **Memory**: Persistent memory across conversations
- [x] **Code Interpreter**: Run Python in sandbox, analyze data

### INTEGRATE (Where it enhances)
- [ ] **PRIMARY BRAIN**: Orchestrates the entire autonomous company
- [ ] **Code generation**: Writes code that deploys to Vercel/Railway
- [ ] **Task decomposition**: Breaks missions into specialist subtasks
- [ ] **QA**: Reviews and validates generated code before deploy
- [ ] **Communication**: Drafts client emails, reports, documentation
- [ ] **Decision making**: Routes work, approves safe actions, flags protected
- [ ] **MCP connections** to: Supabase (read/write data), GitHub (code), Vercel (deploy), Google (email/calendar)
- [ ] **Scheduled tasks**: Monitoring, health checks, daily briefings
- [ ] **Projects**: One per domain (P00 Command, P01 Build, P02 Research, etc.)
- [ ] **Code Interpreter**: Analyzes CSVs, generates reports, validates data

### CREDIT INDEPENDENCE: ✅ Uses OpenAI credits (separate from Base44)
### ROLE: The autonomous operator. The brain that runs everything.

### MCP ARCHITECTURE
\`\`\`
ChatGPT
  ├── MCP → Supabase (read/write production data)
  ├── MCP → GitHub (create repos, PRs, issues, trigger Actions)
  ├── MCP → Vercel (deploy, manage domains, check status)
  ├── MCP → Google Drive (read/write docs, sheets)
  ├── MCP → Gmail (send/receive emails)
  ├── MCP → Google Calendar (schedule, check availability)
  ├── MCP → Railway (deploy services, check logs)
  └── MCP → Ollama (local LLM fallback, when needed)
\`\`\`

---

## INTEGRATION ARCHITECTURE

### The Credit-Independent Runtime Stack
\`\`\`
                    ┌─────────────────────────┐
                    │   ChatGPT (Brain/Operator) │
                    │   Uses OpenAI credits      │
                    └──────────┬──────────────┘
                               │ MCP connections
                    ┌──────────┼──────────────┐
                    ▼          ▼              ▼
              ┌─────────┐ ┌─────────┐  ┌──────────┐
              │ Supabase │ │ GitHub  │  │  Vercel   │
              │ (data)  │ │ (code)  │  │ (hosting) │
              └────┬────┘ └────┬───┘  └─────┬────┘
                   │           │            │
                   │     ┌─────┘            │
                   │     ▼                  │
              ┌────┴──────────┐    ┌────────┘
              │   Railway     │    │
              │ (workers+sync)│◄───┘
              └────┬──────────┘
                   │
              ┌────┴────┐
              │ Docker  │ (packaging)
              └────┬────┘
                   │
              ┌────┴────┐
              │ Ollama  │ (free LLM fallback)
              └─────────┘

  Google Workspace (collaboration) ── connected via MCP
  Cloud/AWS (overflow) ── connected when needed
\`\`\`

### Base44's Role (BUILD ONLY)
\`\`\`
Base44 → generates code → pushes to GitHub → deploys to Vercel
Base44 → prototypes schema → migrates to Supabase
Base44 → prototypes functions → ports to Railway/Vercel
Base44 → manages OAuth connectors → shares config with production
Base44 → NOT in the runtime path
\`\`\`

### Credit Exhaustion Protocol
\`\`\`
1. Base44 credits LOW (< 20% remaining)
   → Switch all LLM calls to Ollama (local, free)
   → Stop new Base44 generation (use ChatGPT directly)
   → Continue all runtime operations normally

2. Base44 credits OUT (0 remaining)
   → System continues on Vercel + Supabase + Railway
   → ChatGPT operates via MCP to all platforms directly
   → Ollama handles all LLM tasks (free)
   → Base44 only needed for NEW builds (ChatGPT can do this)
   → Production apps keep running INDEFINITELY

3. ChatGPT credits OUT (unlikely, but plan for it)
   → Ollama takes over ALL LLM tasks
   → Scheduled tasks pause (no brain to run them)
   → Runtime continues (Vercel + Supabase + Railway)
   → Manual intervention needed for new work
\`\`\`

---

## THE MASTER CHECKLIST

### Phase 1: Foundation (Credit-Independent Core)
- [ ] Create Supabase project (production database + auth + storage)
- [ ] Create GitHub organization (source of truth)
- [ ] Create Vercel team (deployment target)
- [ ] Create Railway project (backend runtime)
- [ ] Install Docker locally + create Dockerfiles for each service
- [ ] Install Ollama locally + pull models (llama3, mistral, nomic-embed-text)
- [ ] Set up Google Workspace APIs (Gmail, Calendar, Drive, Sheets)
- [ ] Configure environment variables across ALL platforms
- [ ] Store all secrets in a vault (NOT in code, NOT in Base44)
- [ ] Document the architecture in Google Docs

### Phase 2: Migration (Move OFF Base44 runtime)
- [ ] Audit all Base44 entities → create Supabase migrations
- [ ] Audit all Base44 functions → port to Vercel serverless or Railway
- [ ] Audit all Base44 workflows → port to Vercel cron or Railway cron
- [ ] Audit all Base44 connectors → set up direct OAuth in production
- [ ] Audit all Base44 integrations → replace with direct API calls
- [ ] Test each migrated component independently
- [ ] Deploy migrated stack to Vercel + Railway
- [ ] Verify production works WITHOUT Base44 (kill test)
- [ ] Set up Supabase → S3 backup pipeline

### Phase 3: Autonomous Operation (ChatGPT as operator)
- [ ] Configure ChatGPT MCP → Supabase (read/write data)
- [ ] Configure ChatGPT MCP → GitHub (code, PRs, issues, Actions)
- [ ] Configure ChatGPT MCP → Vercel (deploy, status, domains)
- [ ] Configure ChatGPT MCP → Google Workspace (email, calendar, drive)
- [ ] Configure ChatGPT MCP → Railway (deploy, logs, health)
- [ ] Set up ChatGPT scheduled tasks (monitoring, health checks, briefings)
- [ ] Create ChatGPT Projects for each domain (P00-P12 from the workbook)
- [ ] Set up Ollama as fallback in the sync engine routing logic
- [ ] Create health check endpoints on ALL services
- [ ] Set up alerting (email via Gmail, SMS via Twilio)
- [ ] Create rollback procedures for each service
- [ ] Document the runbook for credit exhaustion

### Phase 4: Hardening (Resilience)
- [ ] Every service has a health check endpoint
- [ ] Every service has a Dockerfile (reproducible)
- [ ] Every service has automated backups (Supabase → S3 daily)
- [ ] Every service has monitoring (logs + metrics + alerts)
- [ ] Every critical path has a fallback:
  - LLM: ChatGPT → Ollama
  - Database: Supabase primary → Supabase replica
  - Hosting: Vercel → Railway (backup)
  - Email: Gmail → Twilio SMS
- [ ] Every secret is in a vault (not in code, not in Base44, not in Git)
- [ ] Every deployment is from Git (not manual, not Base44)
- [ ] Every change has a rollback plan (Git revert + redeploy)
- [ ] Kill test: turn off Base44 → verify everything still works

### Phase 5: Scale (Growth)
- [ ] Multi-tenant Supabase setup (RLS per client or one project per client)
- [ ] Vercel edge functions for global performance
- [ ] Railway auto-scaling for workers
- [ ] Docker registry (GHCR) for image versioning
- [ ] Cloud overflow for large compute/storage
- [ ] ChatGPT agent swarm for parallel work (multiple Projects)
- [ ] Ollama model upgrades (larger models as hardware allows)
- [ ] Supabase read replicas for high-traffic databases

---

## CREDIT RISK MITIGATION SUMMARY

| Component | Base44 Dependent? | Fallback | Status |
|-----------|-----------------|----------|--------|
| Database | NO | Supabase (independent) | ✅ Safe |
| Auth | NO | Supabase Auth (independent) | ✅ Safe |
| Frontend hosting | NO | Vercel (independent) | ✅ Safe |
| API endpoints | NO | Vercel/Railway (independent) | ✅ Safe |
| Scheduled tasks | NO | Vercel cron/Railway cron | ✅ Safe |
| LLM calls | YES (credits) | Ollama (local, free) | ⚠️ Fallback ready |
| File uploads | NO | Supabase Storage (independent) | ✅ Safe |
| OAuth connectors | PARTIAL | Direct OAuth in production | ⚠️ Migrate |
| Email | NO | Gmail API (independent) | ✅ Safe |
| Build/prototype | YES (credits) | ChatGPT can build directly | ⚠️ Fallback ready |
| Runtime | NO | Vercel + Supabase + Railway | ✅ Safe |
| Realtime | NO | Supabase Realtime | ✅ Safe |
| Vector/RAG | YES (credits) | Ollama embeddings (free) | ⚠️ Fallback ready |

### BOTTOM LINE
If Base44 credits hit zero, the ONLY things that stop:
1. New app generation through Base44 (ChatGPT can build directly)
2. LLM calls through Base44 (Ollama covers this — free)

**Everything else keeps running. Production never goes down.**

---

## DECISION ROUTING (For ChatGPT to follow)

\`\`\`
When a task arrives:

1. CLASSIFY the task:
   - READ (search, analyze, inspect) → Auto, no approval
   - DRAFT (create content, code, docs) → Auto, no approval
   - BUILD (create app, service, site) → Auto in sandbox, approval for prod
   - DEPLOY (ship to production) → ALWAYS requires approval
   - COMMUNICATE (email, message client) → ALWAYS requires approval
   - SPEND (pay for services, ads) → ALWAYS requires approval

2. ROUTE the task:
   - Needs LLM?
     → Simple task? Use Ollama (free)
     → Complex task? Use ChatGPT
     → Base44 credits low? Use Ollama
   - Needs database?
     → Read/write Supabase directly (via MCP)
   - Needs deploy?
     → Push to GitHub → Vercel auto-deploys
     → Or push to GitHub → Railway auto-deploys
   - Needs email?
     → Send via Gmail API (via MCP)
   - Needs scheduling?
     → Create ChatGPT scheduled task
     → Or Vercel cron / Railway cron

3. VALIDATE the result:
   - Code? Run lint + typecheck + tests in GitHub Actions
   - Site? Take screenshot, compare to mockup, check console errors
   - Data? Verify in Supabase, check RLS
   - Deploy? Check health endpoint, verify status

4. REPORT:
   - VERIFIED (evidence-backed)
   - INFERRED (best guess, needs human check)
   - COULD NOT VERIFY (flag for human)
   - BLOCKERS (what stopped progress)
   - NEXT ACTIONS (what to do next)
\`\`\`

---

## SOURCE AUTHORITY (Priority order)

1. **Current operator instruction** (Jeremy) — highest priority
2. **Approved workbook/visual/contract** — immutable approved artifact
3. **Fresh runtime evidence** — live test/deploy/browser result
4. **Base44 registry** — can be stale, verify before trusting
5. **Historical docs** — may be outdated, verify before using

Never turn inference into fact. Never claim something works without evidence.
`;

export const PLATFORM_SUMMARY = [
  { name: "Supabase", role: "Data Backbone", creditIndependent: true, critical: true },
  { name: "Vercel", role: "Deployment Target", creditIndependent: true, critical: true },
  { name: "GitHub", role: "Source of Truth", creditIndependent: true, critical: true },
  { name: "Google Workspace", role: "Collaboration Layer", creditIndependent: true, critical: true },
  { name: "Cloud (AWS/GCP)", role: "Overflow Infrastructure", creditIndependent: true, critical: false },
  { name: "Railway", role: "Backend Runtime", creditIndependent: true, critical: true },
  { name: "Docker", role: "Packaging Standard", creditIndependent: true, critical: true },
  { name: "Ollama (Local)", role: "Free LLM Fallback", creditIndependent: true, critical: true },
  { name: "Base44", role: "Builder (NOT Runtime)", creditIndependent: false, critical: false },
  { name: "ChatGPT", role: "The Brain/Operator", creditIndependent: true, critical: true },
];