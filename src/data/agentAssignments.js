// Agent assignments — each agent is signed to a specific position
// with defined failure points and mitigations

export const AGENT_ASSIGNMENTS = [
  {
    id: "mockup_ingestor",
    name: "Mockup Ingestor",
    position: "Intake Specialist",
    role: "Receives visual mockups from GPT attachments or user uploads. Normalizes file format, validates image quality, registers in system.",
    skills: ["file_handling", "image_validation", "format_normalization"],
    failurePoints: [
      { point: "Corrupted or unreadable file format", mitigation: "Auto-convert to standard PNG/JPG before processing" },
      { point: "Image too low resolution for analysis", mitigation: "Reject and request higher resolution (min 1024px)" },
    ],
    pipelineStage: "MOCKUP_INTAKE",
  },
  {
    id: "design_normalizer",
    name: "Design Normalizer",
    position: "Visual Analysis Lead",
    role: "Runs the visual parity engine to extract colors, typography, layout structure, and component breakdown from the mockup.",
    skills: ["visual_analysis", "color_extraction", "layout_mapping", "pixel_comparison"],
    failurePoints: [
      { point: "LLM vision fails to detect all components", mitigation: "Re-run with enhanced prompt + fallback to manual annotation" },
      { point: "Color extraction inaccurate", mitigation: "Cross-reference with CSS color picker on raw pixels" },
    ],
    pipelineStage: "NORMALIZATION",
  },
  {
    id: "doc_transcriber",
    name: "Document Transcriber",
    position: "Spec Writer",
    role: "Converts visual analysis into structured builder documents: component specs, layout system, content structure, interaction map.",
    skills: ["specification_writing", "component_documentation", "layout_systems"],
    failurePoints: [
      { point: "Missing interaction states in docs", mitigation: "Validator cross-checks against standard interaction patterns" },
      { point: "Ambiguous component descriptions", mitigation: "Auto-expand with component library references" },
    ],
    pipelineStage: "TRANSCRIPTION",
  },
  {
    id: "frontend_builder",
    name: "Frontend Builder",
    position: "React Engineer",
    role: "Replicates builder documents into production React + Tailwind code. Every component, every responsive breakpoint, every interaction.",
    skills: ["react", "tailwind_css", "responsive_design", "component_architecture"],
    failurePoints: [
      { point: "Generated code doesn't match mockup layout", mitigation: "Visual parity check post-generation, fixer adjusts" },
      { point: "Missing responsive breakpoints", mitigation: "Validator checks all 4 breakpoints, fixer adds missing ones" },
    ],
    pipelineStage: "FRONTEND_GENERATION",
  },
  {
    id: "backend_coordinator",
    name: "Backend Coordinator",
    position: "Backend Architect",
    role: "Determines if a backend is needed from the system specs. If yes, generates Supabase schema, API routes, and Railway service config.",
    skills: ["supabase", "api_design", "database_schema", "railway"],
    failurePoints: [
      { point: "Backend not needed but generated anyway", mitigation: "Validator checks if all features are static, skips backend" },
      { point: "Schema doesn't match frontend data needs", mitigation: "Cross-reference frontend data calls against schema" },
    ],
    pipelineStage: "BACKEND_COORDINATION",
  },
  {
    id: "validator_agent",
    name: "Independent Validator",
    position: "Quality Gatekeeper",
    role: "Cold-start LLM validator with no context from the builder. Independently verifies every gate: gaps, spec compliance, OpenAI quality checklist.",
    skills: ["code_review", "accessibility_audit", "performance_audit", "security_scan", "compliance_check"],
    failurePoints: [
      { point: "Validator has bias from seeing builder output", mitigation: "Cold-start — no prior context, fresh LLM call each gate" },
      { point: "Validator misses an issue", mitigation: "Multiple independent validators run in parallel, consensus required" },
    ],
    pipelineStage: "VALIDATION_GATE_1",
  },
  {
    id: "fixer_agent",
    name: "Autonomous Fixer",
    position: "Repair Engineer",
    role: "Takes every gap from the validator and fixes it autonomously. Loops until 100% pass or max retries (3). No human intervention needed.",
    skills: ["code_repair", "css_fixing", "accessibility_fixing", "performance_optimization"],
    failurePoints: [
      { point: "Fix introduces new issue", mitigation: "Re-validate after every fix, rollback if new issues appear" },
      { point: "Max retries reached without resolution", mitigation: "Escalate to human review with full diagnostic report" },
    ],
    pipelineStage: "AUTO_FIX_1",
  },
  {
    id: "qa_agent",
    name: "Playwright QA Agent",
    position: "Browser Test Engineer",
    role: "Generates and runs Playwright tests against the live build. Every button, every form, every navigation path tested like a real user.",
    skills: ["playwright", "browser_automation", "e2e_testing", "responsive_testing"],
    failurePoints: [
      { point: "Local sandbox not connected", mitigation: "Fall back to LLM-based static interaction analysis" },
      { point: "Test flakiness from async loading", mitigation: "Auto-add wait-for selectors, retry failed tests 3x" },
    ],
    pipelineStage: "QA_PLAYWRIGHT",
  },
  {
    id: "seo_agent",
    name: "SEO & Google Systems Agent",
    position: "Search Engineer",
    role: "Generates sitemap.xml, robots.txt, injects Google Analytics, verifies Search Console, optimizes meta tags and structured data.",
    skills: ["seo", "google_analytics", "search_console", "sitemap_generation", "structured_data"],
    failurePoints: [
      { point: "Google Analytics ID not configured", mitigation: "Auto-generate placeholder, flag for user to replace" },
      { point: "Search Console verification fails", mitigation: "Retry with alternate verification method (HTML tag vs DNS)" },
    ],
    pipelineStage: "SEO_SYNC",
  },
  {
    id: "devops_agent",
    name: "DevOps Provisioner",
    position: "Infrastructure Engineer",
    role: "Creates GitHub repo, triggers Vercel deployment, provisions Supabase project, deploys Railway service if backend needed.",
    skills: ["github", "vercel", "supabase", "railway", "ci_cd"],
    failurePoints: [
      { point: "Vercel deploy fails", mitigation: "Auto-retry with build log analysis, fixer addresses build errors" },
      { point: "Supabase provisioning timeout", mitigation: "Poll until ready, fallback to existing project" },
    ],
    pipelineStage: "PROVISIONING",
  },
  {
    id: "launch_agent",
    name: "Launch Coordinator",
    position: "Release Manager",
    role: "Executes the final launch sequence once all checks pass. Promotes staging to production, configures DNS, verifies live site.",
    skills: ["deployment", "dns_configuration", "production_release"],
    failurePoints: [
      { point: "Production deploy fails after launch", mitigation: "Auto-rollback to previous version, alert team" },
      { point: "DNS propagation delay", mitigation: "Poll until DNS resolves, then verify" },
    ],
    pipelineStage: "LAUNCH",
  },
  {
    id: "document_agent",
    name: "System Document Generator",
    position: "Technical Writer",
    role: "Generates production-grade system documentation: system name, description, specs, architecture, API docs, deployment guide.",
    skills: ["technical_writing", "architecture_documentation", "api_documentation"],
    failurePoints: [
      { point: "Documentation out of sync with code", mitigation: "Auto-regenerate on every pipeline completion" },
    ],
    pipelineStage: null,
  },
];

export const AGENT_MAP = Object.fromEntries(AGENT_ASSIGNMENTS.map((a) => [a.id, a]));