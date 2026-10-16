/**
 * SUPER AGENT ORCHESTRATOR
 *
 * Deterministic project compilation and WorkPacket assignment.
 * No vague commands like "make it amazing" — every agent receives a bounded
 * WorkPacket with explicit requirements, inputs, allowed tools, expected outputs,
 * tests, and rollback.
 *
 * The orchestrator is NOT a commander — it compiles and routes.
 * Authority hierarchy is enforced by the control contract.
 */

import { INDUSTRY_FAMILIES, getFamilyById } from "./industryRegistry.js";
import { PLATFORM_PACKS, getPlatformById } from "./platformRegistry.js";
import { HERO_ARCHETYPES, QUALITY_RUBRIC, calculateQualityScore, getVerdict } from "./visualPackContract.js";

// ─── AGENT ROSTER ───────────────────────────────────────────────────
export const AGENT_ROSTER = [
  {
    agent_id: "intake-compiler",
    pod: "Strategy",
    name: "Intake Compiler",
    role: "Collects and structures project intake into a deterministic spec",
    authority: "READ",
    inputs: ["project_idea", "onboarding_answers", "visual_references"],
    outputs: ["IntakePacket", "project_spec"],
    tools: ["industryRegistry", "platformRegistry"],
  },
  {
    agent_id: "intelligence-enricher",
    pod: "Research",
    name: "Business Intelligence Enricher",
    role: "Enriches intake with verified public business intelligence",
    authority: "READ",
    inputs: ["IntakePacket"],
    outputs: ["BusinessIntelligencePack"],
    tools: ["webResearch", "industryRegistry"],
    classification: ["CLIENT_PROVIDED", "VERIFIED_PUBLIC", "INFERRED", "UNKNOWN"],
  },
  {
    agent_id: "visual-dna-analyst",
    pod: "Design",
    name: "Visual DNA Analyst",
    role: "Extracts visual DNA from reference images and compiles VisualPack",
    authority: "READ",
    inputs: ["visual_references", "industry_family_id"],
    outputs: ["VISUAL_DNA.json", "VisualPack"],
    tools: ["imageAnalysis", "visualPackContract"],
  },
  {
    agent_id: "brand-generator",
    pod: "Design",
    name: "Brand Generator",
    role: "Produces 3 distinct brand directions with 5 logo concepts each",
    authority: "DRAFT",
    inputs: ["VisualPack", "BusinessIntelligencePack"],
    outputs: ["BrandPack[]", "LogoConcept[]"],
    tools: ["generateImage", "visualPackContract"],
    constraint: "Must produce genuinely different compositions, not recolored variants",
  },
  {
    agent_id: "template-genome-selector",
    pod: "Build",
    name: "Template Genome Selector",
    role: "Selects or generates the TemplateGenome for industry+platform",
    authority: "DRAFT",
    inputs: ["industry_family_id", "platform_id", "VisualPack"],
    outputs: ["TemplateGenome"],
    tools: ["templateGenomeRegistry", "visualPackContract"],
  },
  {
    agent_id: "content-architect",
    pod: "Content",
    name: "Content Architect",
    role: "Generates industry-intelligent content from combined intelligence packs",
    authority: "DRAFT",
    inputs: ["BusinessIntelligencePack", "IndustryPack", "VisualPack", "TemplateGenome"],
    outputs: ["ContentPack"],
    tools: ["invokeLLM", "industryIntelligence"],
    constraints: "No keyword soup, no fabricated testimonials, no fake statistics",
  },
  {
    agent_id: "site-builder",
    pod: "Build",
    name: "Site Builder",
    role: "Assembles the site from VisualPack, TemplateGenome, and ContentPack",
    authority: "BRANCH_WRITE",
    inputs: ["VisualPack", "TemplateGenome", "ContentPack", "BrandPack"],
    outputs: ["generated_frontend", "deploy_url"],
    tools: ["codeGenerator", "vercel", "github"],
    constraints: "Must produce noindex preview. Production requires separate approval.",
  },
  {
    agent_id: "seo-audit-agent",
    pod: "Content",
    name: "SEO/AEO/GEO Agent",
    role: "Validates search intent, structured data, and content quality",
    authority: "READ",
    inputs: ["generated_frontend", "ContentPack"],
    outputs: ["SEOAuditReport"],
    tools: ["seoValidator", "structuredDataValidator"],
  },
  {
    agent_id: "performance-agent",
    pod: "QA",
    name: "Performance Agent",
    role: "Validates Core Web Vitals: LCP ≤2.5s, INP ≤200ms, CLS ≤0.1",
    authority: "READ",
    inputs: ["deploy_url"],
    outputs: ["PerformanceReport"],
    tools: ["lighthouse", "webVitalsCollector"],
  },
  {
    agent_id: "accessibility-agent",
    pod: "QA",
    name: "Accessibility Agent",
    role: "Validates WCAG 2.2 AA compliance",
    authority: "READ",
    inputs: ["deploy_url"],
    outputs: ["AccessibilityReport"],
    tools: ["axeCore", "keyboardTestRunner"],
  },
  {
    agent_id: "qa-agent",
    pod: "QA",
    name: "QA Agent",
    role: "Independent from builders — runs full test suite",
    authority: "READ",
    inputs: ["deploy_url", "generated_frontend"],
    outputs: ["QAResult"],
    tools: ["browserTest", "formTest", "navigationTest", "responsiveTest"],
    results: ["PASS", "FAIL", "BLOCKED", "NOT_TESTED"],
    constraint: "NOT_TESTED is never PASS",
  },
  {
    agent_id: "independent-validator",
    pod: "Governance",
    name: "Independent Validator",
    role: "Re-fetches all evidence independently — no builder self-report accepted",
    authority: "READ",
    inputs: ["deploy_url", "source_sha", "approval_state"],
    outputs: ["ValidationReceipt", "verdict"],
    tools: ["evidenceFetcher", "screenshotComparator", "shaVerifier"],
    constraint: "Only this validator may issue VALIDATED for release-critical work",
  },
  {
    agent_id: "artifact-vault",
    pod: "Operations",
    name: "Artifact Vault",
    role: "Preserves all artifacts with CREATE→CLASSIFY→ROUTE→SCAN→HASH→UPLOAD→VERIFY→RECEIPT",
    authority: "DRAFT",
    inputs: ["all_outputs"],
    outputs: ["ArtifactReceipts"],
    tools: ["github", "googleDrive", "ledger"],
    constraint: "No verified receipt = NOT COMPLETE",
  },
];

// ─── DETERMINISTIC PIPELINE STAGES ──────────────────────────────────
export const PIPELINE_STAGES = [
  {
    stage_id: "intake",
    label: "Project Intake",
    agent: "intake-compiler",
    risk_class: "READ",
    executor: "BASE44",
    outputs: ["IntakePacket"],
    next: "enrichment",
  },
  {
    stage_id: "enrichment",
    label: "Business Intelligence Enrichment",
    agent: "intelligence-enricher",
    risk_class: "READ",
    executor: "BASE44",
    outputs: ["BusinessIntelligencePack"],
    next: "visual-dna",
  },
  {
    stage_id: "visual-dna",
    label: "Visual DNA Extraction",
    agent: "visual-dna-analyst",
    risk_class: "READ",
    executor: "BASE44",
    outputs: ["VISUAL_DNA.json", "VisualPack"],
    next: "brand-approval",
  },
  {
    stage_id: "brand-approval",
    label: "Brand Direction Approval",
    agent: "brand-generator",
    risk_class: "DRAFT",
    executor: "BASE44",
    outputs: ["BrandPack[]", "LogoConcept[]"],
    next: "genome-selection",
    requires_approval: true,
    approval_type: "VISUAL_APPROVAL",
  },
  {
    stage_id: "genome-selection",
    label: "Template Genome Selection",
    agent: "template-genome-selector",
    risk_class: "DRAFT",
    executor: "BASE44",
    outputs: ["TemplateGenome"],
    next: "content",
  },
  {
    stage_id: "content",
    label: "Content Architecture",
    agent: "content-architect",
    risk_class: "DRAFT",
    executor: "BASE44",
    outputs: ["ContentPack"],
    next: "build",
  },
  {
    stage_id: "build",
    label: "Site Build & Preview",
    agent: "site-builder",
    risk_class: "BRANCH_WRITE",
    executor: "BASE44",
    outputs: ["generated_frontend", "deploy_url"],
    next: "seo-audit",
    constraint: "Must produce noindex preview",
  },
  {
    stage_id: "seo-audit",
    label: "SEO/AEO/GEO Audit",
    agent: "seo-audit-agent",
    risk_class: "READ",
    executor: "BASE44",
    outputs: ["SEOAuditReport"],
    next: "performance",
  },
  {
    stage_id: "performance",
    label: "Performance Validation",
    agent: "performance-agent",
    risk_class: "READ",
    executor: "BASE44",
    outputs: ["PerformanceReport"],
    next: "accessibility",
  },
  {
    stage_id: "accessibility",
    label: "Accessibility Validation",
    agent: "accessibility-agent",
    risk_class: "READ",
    executor: "BASE44",
    outputs: ["AccessibilityReport"],
    next: "qa",
  },
  {
    stage_id: "qa",
    label: "QA Agent Full Suite",
    agent: "qa-agent",
    risk_class: "READ",
    executor: "BASE44",
    outputs: ["QAResult"],
    next: "validation",
  },
  {
    stage_id: "validation",
    label: "Independent Validation",
    agent: "independent-validator",
    risk_class: "READ",
    executor: "BASE44",
    outputs: ["ValidationReceipt"],
    next: "artifact-preservation",
  },
  {
    stage_id: "artifact-preservation",
    label: "Artifact Vault Preservation",
    agent: "artifact-vault",
    risk_class: "DRAFT",
    executor: "BASE44",
    outputs: ["ArtifactReceipts"],
    next: null,
    constraint: "No verified receipt = NOT COMPLETE",
  },
];

// ─── PROJECT COMPILATION ────────────────────────────────────────────
// Takes a simple idea and compiles it into a deterministic sequence of WorkPackets.

export function compileProject(intake) {
  const {
    project_idea,
    industry_family_id,
    platform_id,
    business_name,
    visual_references = [],
    onboarding_answers = {},
  } = intake;

  // Resolve industry
  const family = getFamilyById(industry_family_id);
  if (!family) {
    return {
      status: "BLOCKED",
      error: `Unknown industry family: ${industry_family_id}`,
      work_packets: [],
    };
  }

  // Resolve platform
  const platform = getPlatformById(platform_id);
  if (!platform) {
    return {
      status: "BLOCKED",
      error: `Unknown platform: ${platform_id}`,
      work_packets: [],
    };
  }

  // Generate project ID and idempotency key
  const project_id = `PRJ-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const idempotency_key = `${industry_family_id}:${platform_id}:${business_name || "untitled"}`;

  // Compile WorkPackets from pipeline stages
  const work_packets = PIPELINE_STAGES.map((stage, index) => {
    const agent = AGENT_ROSTER.find((a) => a.agent_id === stage.agent);

    return {
      packet_id: `${project_id}-WP-${String(index + 1).padStart(3, "0")}`,
      pipeline_run_id: project_id,
      stage_id: stage.stage_id,
      title: stage.label,
      description: `${agent.role} — ${stage.label}`,
      risk_class: stage.risk_class,
      executor: stage.executor,
      dependencies: index === 0 ? [] : [`${project_id}-WP-${String(index).padStart(3, "0")}`],
      acceptance_criteria: getAcceptanceCriteria(stage.stage_id),
      validation_requirements: getValidationRequirements(stage.stage_id),
      status: index === 0 ? "READY" : "PENDING",
      assigned_agent: stage.agent,
      approval_required: stage.requires_approval || false,
      approval_type: stage.approval_type || null,
      inputs: agent.inputs,
      expected_outputs: agent.outputs,
      allowed_tools: agent.tools,
      forbidden_actions: agent.authority === "READ" ? ["write", "deploy", "delete"] : [],
      timeout: getTimeout(stage.stage_id),
      max_retries: 3,
      rollback: getRollbackPlan(stage.stage_id),
    };
  });

  return {
    status: "COMPILED",
    project_id,
    idempotency_key,
    industry_family: family.name,
    platform: platform.name,
    work_packets,
    total_packets: work_packets.length,
    estimated_stages: PIPELINE_STAGES.length,
  };
}

// ─── ACCEPTANCE CRITERIA PER STAGE ──────────────────────────────────
function getAcceptanceCriteria(stageId) {
  const criteria = {
    intake: [
      "IntakePacket contains project identity, vision, and design intake",
      "Industry family and platform resolved from registries",
      "Idempotency key generated",
    ],
    enrichment: [
      "BusinessIntelligencePack classifies all claims as CLIENT_PROVIDED, VERIFIED_PUBLIC, INFERRED, or UNKNOWN",
      "No fabricated private information",
      "Industry-specific onboarding questions generated",
    ],
    "visual-dna": [
      "VISUAL_DNA.json contains all required fields (colors, typography, grid, composition, etc.)",
      "VisualPack tokens are deterministic, not adjectives",
      "Accessibility contrast ratios validated",
    ],
    "brand-approval": [
      "3 genuinely different brand directions (not recolored variants)",
      "5 logo concepts per direction with transparent SVG/PNG",
      "Light and dark background versions for each",
      "Operator/client selection recorded",
    ],
    "genome-selection": [
      "TemplateGenome selected with hero archetype, section grammar, and component architecture",
      "Genome is structurally distinct from other genomes in the same industry",
    ],
    content: [
      "ContentPack contains all required sections (hero, problem, services, differentiators, process, proof, FAQ, CTA)",
      "No keyword soup, filler, or fabricated testimonials",
      "Search intent mapped for primary pages",
    ],
    build: [
      "Generated frontend renders without console errors",
      "noindex meta tag present on preview",
      "Responsive at mobile, tablet, desktop breakpoints",
      "Vercel preview URL accessible",
    ],
    "seo-audit": [
      "Title/meta tags present and correct length",
      "Structured data validates in Google Rich Results test",
      "Canonical URLs set",
      "Sitemap and robots.txt present",
    ],
    performance: [
      "LCP <= 2.5s at 75th percentile",
      "INP <= 200ms at 75th percentile",
      "CLS <= 0.1 at 75th percentile",
      "Performance budget not exceeded",
    ],
    accessibility: [
      "WCAG 2.2 AA: no critical violations",
      "Keyboard navigation works for all interactive elements",
      "Focus indicators visible",
      "Color contrast meets AA thresholds",
      "Touch targets >= 44x44px",
    ],
    qa: [
      "All forms submit and validate correctly",
      "Navigation works on all breakpoints",
      "No console errors or warnings",
      "Mobile, tablet, desktop all pass",
    ],
    validation: [
      "Source SHA matches deployed SHA",
      "Screenshots are fresh (not stale)",
      "All test outputs independently re-fetched",
      "No silent skips detected",
      "Artifact receipts verified",
    ],
    "artifact-preservation": [
      "All outputs hashed and uploaded",
      "Receipts written with evidence references",
      "Artifacts persisted to GitHub, Drive, or ledger",
    ],
  };
  return criteria[stageId] || ["Stage completed successfully"];
}

// ─── VALIDATION REQUIREMENTS PER STAGE ──────────────────────────────
function getValidationRequirements(stageId) {
  const reqs = {
    "visual-dna": ["visual_pack_token_validation", "contrast_ratio_audit"],
    "brand-approval": ["operator_selection_recorded"],
    build: ["responsive_test", "console_error_audit", "noindex_verification"],
    "seo-audit": ["google_rich_results_test", "meta_coverage_check"],
    performance: ["lighthouse_report", "field_data_at_75th_percentile"],
    accessibility: ["axe_core_scan", "keyboard_test", "contrast_audit"],
    qa: ["form_test", "navigation_test", "responsive_test", "mobile_test"],
    validation: ["sha_verification", "screenshot_freshness", "evidence_re_fetch"],
  };
  return reqs[stageId] || [];
}

// ─── TIMEOUTS PER STAGE ─────────────────────────────────────────────
function getTimeout(stageId) {
  const timeouts = {
    intake: 60,
    enrichment: 120,
    "visual-dna": 180,
    "brand-approval": 300,
    "genome-selection": 120,
    content: 180,
    build: 600,
    "seo-audit": 120,
    performance: 180,
    accessibility: 180,
    qa: 300,
    validation: 180,
    "artifact-preservation": 120,
  };
  return (timeouts[stageId] || 120) * 1000;
}

// ─── ROLLBACK PLANS ─────────────────────────────────────────────────
function getRollbackPlan(stageId) {
  const plans = {
    build: "Delete preview deployment, revert branch to previous SHA",
    "brand-approval": "Discard unselected brand directions, keep only approved",
    content: "Regenerate content from previous ContentPack version",
    "artifact-preservation": "Re-upload from local cache, verify checksums",
  };
  return plans[stageId] || "Revert to previous stage output";
}

// ─── EXECUTION ROUTER ────────────────────────────────────────────────
// Local sandbox preferred, Railway fallback. No guessing.
export function routeExecution(localAvailable, railwayAvailable) {
  if (localAvailable) {
    return { executor: "LOCAL_SANDBOX", reason: "Local sandbox available — preferred for latency" };
  }
  if (railwayAvailable) {
    return { executor: "RAILWAY", reason: "Local unavailable — routed to Railway" };
  }
  return { executor: "BLOCKED", reason: "Neither local nor Railway available — execution blocked" };
}

// ─── COMPLETION CHECK ───────────────────────────────────────────────
export function checkCompletion(workPackets) {
  const required = [
    "requirements_satisfied",
    "approved_design_preserved",
    "correct_sha_deployed",
    "responsive_layouts_pass",
    "browser_tests_pass",
    "forms_pass",
    "accessibility_pass",
    "performance_pass",
    "seo_checks_pass",
    "security_checks_pass",
    "artifact_receipts_verified",
    "qa_agent_pass",
    "independent_validator_pass",
    "rollback_exists",
    "client_ready_preview_exists",
  ];

  const allCompleted = workPackets.every((wp) => wp.status === "COMPLETED");
  const allValidated = workPackets.some((wp) => wp.stage_id === "validation" && wp.status === "COMPLETED");

  return {
    complete: allCompleted && allValidated,
    production_ready: false, // Production always requires separate approval
    checklist: required.map((item) => ({
      item,
      status: allCompleted ? "PASS" : "PENDING",
    })),
  };
}

export const ORCHESTRATOR_VERSION = "1.0.0";