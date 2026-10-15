// Intelligence data extracted from the Digital Dominance Master Intelligence Workbook Catalog
// Source: 00_MASTER_INTELLIGENCE_WORKBOOK_CATALOG, 01_GOOGLE_INTELLIGENCE_ATLAS, 02_UNIVERSAL_BACKEND_FACTORY, 03_BASE44_PROMPT_OS_LIBRARY

export const SYSTEM_VISION = `Build and operate one unified Strategic Minds AI intelligence-to-revenue platform that discovers valuable demand, verifies buyers and economics, researches competitors and pricing, generates premium websites/apps/SaaS/funnels, operates through the existing X1 queue, captures and qualifies consented leads, integrates authorized Xtreme Communications, creates industry-specific brands/imagery/videos/social campaigns, connects real analytics and revenue attribution, synchronizes through secure GPT/MCP tools, and proposes proactive strategies — all with approval-gated autonomous execution.`;

export const SYSTEM_STRATEGY = `Phase 0: Forensic discovery (verify source, app identity, X1 runtime, security boundaries)
Phase 1: Critical security repair (harden GPT Sync, separate staging from production)
Phase 2: X1 queue convergence (one supervisor, scheduler, queue, worker model)
Phase 3: Manus-inspired agent control (task decomposition, specialist routing, durable job handoff)
Phase 4: National demand intelligence (connect authorized sources, opportunity leaderboard)
Phase 5: Buyer-first strategy factory (research buyers, competition, prices, 10 scenarios)
Phase 6: Premium digital-property generator (one high-quality synthetic website)
Phase 7: Lead capture and CRM (validate inbound forms, routing, attribution)
Phase 8: Xtreme Communications (audit Twilio, consent-safe inbound voice/SMS staging)
Phase 9: Social, content and video (brand-matched 30-day campaign)
Phase 10: GPT and Strategic Minds integration (authenticated bidirectional sync)
Phase 11: National expansion (ten distinct sites, then controlled batches)
Phase 12: Release and operations (approval packets, monitoring, alerts, rollback)`;

export const CONNECTED_REPOS = [
  { name: "X1 Operating Systems", url: "https://github.com/Strategic-Minds-AI/X1-OPERATING-SYSTEMS", description: "Core operating system layer — supervisor, scheduler, queue, worker model", authority: "Primary runtime authority", status: "CONNECTED" },
  { name: "X1 Control Plane", url: "https://github.com/Strategic-Minds-AI/x1-control-plane", description: "Control plane — all system docs, governance, approval gates, receipts", authority: "Documentation and governance authority", status: "CONNECTED" },
  { name: "X1 AI Hub Swarm Runtime", url: "https://github.com/Strategic-Minds-AI/x1-ai-hub-swarm-runtime", description: "AI swarm runtime — agent orchestration, task dispatch, specialist routing", authority: "Agent execution authority", status: "CONNECTED" },
  { name: "X1 Sandbox System", url: "https://github.com/Strategic-Minds-AI/x1-sandbox-system", description: "Sandbox system — isolated preview builds, testing, Railway + local sandbox", authority: "Preview and testing authority", status: "CONNECTED" },
];

export const WORKBOOK_CATALOG = [
  { id: "DD-01", name: "Google Intelligence Atlas", category: "CORE EXISTING", phase: "DISCOVERY", priority: "P0", outcome: "Google capability inventory, keywords, search modifiers, research signals, pricing hypotheses", status: "POPULATED_SPEC" },
  { id: "DD-02", name: "Universal Backend Factory", category: "CORE EXISTING", phase: "BUILD", priority: "P0", outcome: "Contracts, event schemas, queues, agents, templates, tests, operations, God Mode architecture", status: "POPULATED_SPEC" },
  { id: "DD-03", name: "Base44 Prompt Operating System", category: "CORE EXISTING", phase: "DOCS", priority: "P0", outcome: "Controlled copy-ready prompting, versioned agent packs, tool/skill adapters", status: "POPULATED_SPEC" },
  { id: "DD-04", name: "Audience Demand & WTP", category: "INTELLIGENCE", phase: "DISCOVERY", priority: "P0", outcome: "Buyer demand, willingness to pay, funded purchase triggers", status: "POPULATED_SPEC" },
  { id: "DD-05", name: "Competitor Intelligence Dossier", category: "INTELLIGENCE", phase: "RESEARCH", priority: "P0", outcome: "Competitor offers, pricing, positioning, content architecture, conversion UX", status: "POPULATED_SPEC" },
  { id: "DD-06", name: "Pricing & Unit Economics", category: "INTELLIGENCE", phase: "STRATEGY", priority: "P0", outcome: "Verified pricing, unit economics model, financial simulations", status: "POPULATED_SPEC" },
  { id: "DD-07", name: "SEO/AEO/GEO Research", category: "INTELLIGENCE", phase: "BUILD", priority: "P0", outcome: "90 SEO/AEO/GEO checks, implementation contracts, evidence gates", status: "POPULATED_SPEC" },
  { id: "DD-08", name: "Premium Creative Direction", category: "DESIGN", phase: "BUILD", priority: "P0", outcome: "Brand direction, visual parity matrix, template gallery, page blueprints", status: "POPULATED_SPEC" },
  { id: "DD-09", name: "Website Launch Engine", category: "BUILD", phase: "BUILD", priority: "P0", outcome: "Full-page premium templates, 20 industries, 100 structural styles", status: "POPULATED_SPEC" },
  { id: "DD-10", name: "Application/SaaS Factory", category: "BUILD", phase: "BUILD", priority: "P0", outcome: "300 app templates, SaaS/B2B/AI/funnel/platform libraries", status: "POPULATED_SPEC" },
];

export const INTEGRATIONS = [
  { name: "Google Search Console", type: "connector", status: "authorized", scopes: ["webmasters.readonly"], purpose: "Search performance data — clicks, impressions, CTR, position" },
  { name: "Google Analytics", type: "connector", status: "authorized", scopes: ["analytics.readonly"], purpose: "GA4 session data, conversions, user behavior" },
  { name: "Supabase", type: "connector", status: "authorized", scopes: ["database:read", "database:write", "rest:read", "rest:write", "storage:read", "storage:write", "auth:read", "auth:write"], purpose: "X1 backend bridge — auth, RLS, data, storage, receipts" },
  { name: "Google Sheets", type: "connector", status: "authorized", scopes: ["all"], purpose: "Data sync — onboarding, leads, pricing, analytics" },
  { name: "Gmail (10 slots)", type: "connector", status: "authorized", scopes: ["all"], purpose: "CRM email follow-up automation, outreach sequences" },
  { name: "GitHub", type: "connector", status: "authorized", scopes: ["all"], purpose: "Source control — X1 repos, PRs, code review, CI" },
  { name: "Google Calendar", type: "connector", status: "authorized", scopes: ["all"], purpose: "Appointment scheduling, follow-up reminders" },
  { name: "Google Drive", type: "connector", status: "authorized", scopes: ["all"], purpose: "Brand asset storage, approved design references" },
  { name: "Google Docs", type: "connector", status: "authorized", scopes: ["all"], purpose: "Document generation, system docs in control plane" },
  { name: "HubSpot", type: "connector", status: "authorized", scopes: ["all"], purpose: "CRM sync, contact management, deal tracking" },
  { name: "Google Tasks", type: "connector", status: "authorized", scopes: ["all"], purpose: "Task management, checklist sync" },
  { name: "Twilio / Xtreme Comms", type: "secret", status: "configured", scopes: [], purpose: "SMS, voice, IVR — inbound call handling, lead qualification" },
  { name: "Vercel", type: "secret", status: "configured", scopes: [], purpose: "Preview deployments, production releases" },
  { name: "GPT Sync API", type: "secret", status: "configured", scopes: [], purpose: "Bi-directional GPT/MCP control bridge" },
];

export const IMPLEMENTATION_PHASES = [
  { phase: "Phase 0", name: "Forensic Discovery", status: "in_progress", description: "Verify source, Base44 app identity, X1 runtime, repositories, security boundaries" },
  { phase: "Phase 1", name: "Critical Security Repair", status: "not_started", description: "Harden GPT Sync, remove unintended direct production deployment paths" },
  { phase: "Phase 2", name: "X1 Queue Convergence", status: "not_started", description: "Confirm one supervisor, scheduler, queue and worker model" },
  { phase: "Phase 3", name: "Manus-Inspired Agent Control", status: "not_started", description: "Task decomposition, specialist routing, browser/research tools, durable job handoff" },
  { phase: "Phase 4", name: "National Demand Intelligence", status: "not_started", description: "Connect authorized sources, create real opportunity leaderboard" },
  { phase: "Phase 5", name: "Buyer-First Strategy Factory", status: "not_started", description: "Research buyers, competition, prices, fulfillment, 10 commercial scenarios" },
  { phase: "Phase 6", name: "Premium Digital-Property Generator", status: "not_started", description: "Prove one high-quality synthetic website and application workflow" },
  { phase: "Phase 7", name: "Lead Capture and CRM", status: "not_started", description: "Validate inbound lead forms, authorized routing, tenant scope, attribution" },
  { phase: "Phase 8", name: "Xtreme Communications", status: "not_started", description: "Audit Twilio bindings, consent-safe inbound voice/SMS staging canary" },
  { phase: "Phase 9", name: "Social, Content and Video", status: "not_started", description: "Brand-matched 30-day campaign, validate media/calendar integration" },
  { phase: "Phase 10", name: "GPT and Strategic Minds Integration", status: "not_started", description: "Authenticated bidirectional read/draft-safe sync" },
  { phase: "Phase 11", name: "National Expansion", status: "not_started", description: "Ten distinct sites, then controlled batches with validated buyer usefulness" },
  { phase: "Phase 12", name: "Release and Operations", status: "not_started", description: "Approval packets, production release candidates, monitoring, alerts, rollback" },
];

export const AGENT_ROSTER = [
  { id: "AG-001", pod: "Strategy", name: "God Mode Director", description: "Versioned evaluation with proof, confidence, blockers, next safe action" },
  { id: "AG-002", pod: "Strategy", name: "Opportunity Economist", description: "Market economics analysis, risk-adjusted expected contribution" },
  { id: "AG-003", pod: "Strategy", name: "Industry Research Strategist", description: "Industry research, competitor analysis, market positioning" },
  { id: "AG-004", pod: "Discovery", name: "Buyer Discovery Agent", description: "Identify plausible buyer organizations, verify public evidence" },
  { id: "AG-005", pod: "Discovery", name: "Competitor Intelligence Agent", description: "Research 5-15 competitors per opportunity, document offers and pricing" },
  { id: "AG-006", pod: "Discovery", name: "Pricing & Unit Economics Agent", description: "Verified pricing, unit economics model, financial simulations" },
  { id: "AG-007", pod: "Discovery", name: "SEO/AEO/GEO Research Agent", description: "90 SEO/AEO/GEO checks, search intent mapping, content quality" },
  { id: "AG-008", pod: "Design", name: "Premium Creative Director", description: "Brand direction, visual parity, template gallery, page blueprints" },
  { id: "AG-009", pod: "Design", name: "Brand and Logo Agent", description: "Brand identity generation, logo creation, color palette, typography" },
  { id: "AG-010", pod: "Build", name: "Website Architect", description: "Website structure, page routes, section topology, conversion forms" },
  { id: "AG-011", pod: "Build", name: "Application/SaaS Architect", description: "App templates, SaaS architecture, subscription tiers, entitlements" },
  { id: "AG-012", pod: "Build", name: "Frontend Engineering Agent", description: "Responsive UI, component implementation, accessibility, performance" },
  { id: "AG-013", pod: "Build", name: "Backend and Integration Agent", description: "API contracts, event schemas, queue adapters, data persistence" },
  { id: "AG-014", pod: "Content", name: "Content and Editorial Agent", description: "Original helpful content, industry-specific copy, FAQ generation" },
  { id: "AG-015", pod: "Content", name: "Image and Video Director", description: "Industry images, video scripts, storyboard, social creatives" },
  { id: "AG-016", pod: "Marketing", name: "Social Marketing Agent", description: "30-day social campaigns, platform-specific content, UTM tracking" },
  { id: "AG-017", pod: "Marketing", name: "Lead Funnel Architect", description: "Conversion funnels, form optimization, lead qualification flows" },
  { id: "AG-018", pod: "Sales", name: "CRM and Qualification Agent", description: "Lead scoring, pipeline management, follow-up sequences" },
  { id: "AG-019", pod: "Comms", name: "Xtreme Communications Agent", description: "Inbound voice/SMS handling, call routing, consent management" },
  { id: "AG-020", pod: "Measurement", name: "Analytics and Attribution Agent", description: "GA4/GSC sync, revenue attribution, performance reporting" },
  { id: "AG-021", pod: "Governance", name: "Security and Compliance Reviewer", description: "Security scans, Google policy compliance, risk register" },
  { id: "AG-022", pod: "Governance", name: "Browser/Playwright QA Agent", description: "Desktop/tablet/mobile testing, form validation, broken links" },
  { id: "AG-023", pod: "Governance", name: "Independent Guardian Validator", description: "Independent validation, release gates, evidence verification" },
  { id: "AG-024", pod: "Operations", name: "Release and Runtime Coordinator", description: "Deployment coordination, rollback, monitoring, alerts" },
  { id: "AG-025", pod: "Operations", name: "Fault Line Scanner Agent", description: "Website scanning, problem detection, outreach generation" },
];

export const KEY_QUESTIONS = [
  "Which buyer segment has a funded purchase trigger?",
  "What is the difference between a stated budget and observed purchase?",
  "Which questions signal urgency rather than browsing?",
  "What evidence would show that this opportunity improves customer outcomes?",
  "Which market is economically attractive based on verified data?",
  "What is the verified willingness to pay for this service?",
  "Which competitors have visible weaknesses we can differentiate against?",
  "What content/tools would genuinely help buyers and earn references?",
  "What is the realistic conversion rate from search to qualified lead?",
  "What is the cost per qualified lead and customer acquisition cost?",
];

export const NON_NEGOTIABLE_CONTROLS = [
  { control: "ONE runtime", rule: "Reuse X1 authoritative scheduler, queue, leases, workers and Guardian, not clones", priority: "P0" },
  { control: "TENANT SCOPE", rule: "All reads/writes require authenticated tenant, actor and role", priority: "P0" },
  { control: "NO FAKE SUCCESS", rule: "Leads/quotes only success after actual persistence + evidence", priority: "P0" },
  { control: "APPROVAL GATES", rule: "Production publishing, domain ops, credentials, spend require scoped approval", priority: "P0" },
  { control: "SOURCE TRUTH", rule: "Verify current GitHub SHA, Vercel project, X1 queue, Supabase tenant before changes", priority: "P0" },
  { control: "NO SECRET EXPOSURE", rule: "Never place tokens, API keys, credentials in prompts, files, logs or chat", priority: "P0" },
  { control: "EVIDENCE OVER CLAIMS", rule: "Every claim is VERIFIED, CANDIDATE, MODEL ASSUMPTION or UNKNOWN", priority: "P0" },
  { control: "NO DOORWAY PAGES", rule: "Regional sites must include legitimate local differentiation, not cloned city pages", priority: "P0" },
];