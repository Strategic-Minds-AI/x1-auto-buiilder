// Frontend-safe copy of the super agent roster and pipeline stages.
// The canonical source is base44/shared/superAgentOrchestrator.js, but that
// module imports backend-only packages (industryRegistry, platformRegistry,
// visualPackContract) so it cannot be imported in the browser. This file
// mirrors the static AGENT_ROSTER and PIPELINE_STAGES for UI rendering.

export const AGENT_ROSTER = [
  { agent_id: "intake-compiler", pod: "Strategy", name: "Intake Compiler", role: "Collects and structures project intake into a deterministic spec", authority: "READ" },
  { agent_id: "intelligence-enricher", pod: "Research", name: "Business Intelligence Enricher", role: "Enriches intake with verified public business intelligence", authority: "READ" },
  { agent_id: "visual-dna-analyst", pod: "Design", name: "Visual DNA Analyst", role: "Extracts visual DNA from reference images and compiles VisualPack", authority: "READ" },
  { agent_id: "brand-generator", pod: "Design", name: "Brand Generator", role: "Produces 3 distinct brand directions with 5 logo concepts each", authority: "DRAFT" },
  { agent_id: "template-genome-selector", pod: "Build", name: "Template Genome Selector", role: "Selects or generates the TemplateGenome for industry+platform", authority: "DRAFT" },
  { agent_id: "content-architect", pod: "Content", name: "Content Architect", role: "Generates industry-intelligent content from combined intelligence packs", authority: "DRAFT" },
  { agent_id: "site-builder", pod: "Build", name: "Site Builder", role: "Assembles the site from VisualPack, TemplateGenome, and ContentPack", authority: "BRANCH_WRITE" },
  { agent_id: "seo-audit-agent", pod: "Content", name: "SEO/AEO/GEO Agent", role: "Validates search intent, structured data, and content quality", authority: "READ" },
  { agent_id: "performance-agent", pod: "QA", name: "Performance Agent", role: "Validates Core Web Vitals: LCP ≤2.5s, INP ≤200ms, CLS ≤0.1", authority: "READ" },
  { agent_id: "accessibility-agent", pod: "QA", name: "Accessibility Agent", role: "Validates WCAG 2.2 AA compliance", authority: "READ" },
  { agent_id: "qa-agent", pod: "QA", name: "QA Agent", role: "Independent from builders — runs full test suite", authority: "READ" },
  { agent_id: "independent-validator", pod: "Governance", name: "Independent Validator", role: "Re-fetches all evidence independently — no builder self-report accepted", authority: "READ" },
  { agent_id: "artifact-vault", pod: "Operations", name: "Artifact Vault", role: "Preserves all artifacts with hash + receipt verification", authority: "DRAFT" },
];

export const PIPELINE_STAGES = [
  { stage_id: "intake", label: "Project Intake", agent: "intake-compiler" },
  { stage_id: "enrichment", label: "Business Intelligence", agent: "intelligence-enricher" },
  { stage_id: "visual-dna", label: "Visual DNA Extraction", agent: "visual-dna-analyst" },
  { stage_id: "brand-approval", label: "Brand Direction Approval", agent: "brand-generator" },
  { stage_id: "genome-selection", label: "Template Genome Selection", agent: "template-genome-selector" },
  { stage_id: "content", label: "Content Architecture", agent: "content-architect" },
  { stage_id: "build", label: "Site Build & Preview", agent: "site-builder" },
  { stage_id: "seo-audit", label: "SEO/AEO/GEO Audit", agent: "seo-audit-agent" },
  { stage_id: "performance", label: "Performance Validation", agent: "performance-agent" },
  { stage_id: "accessibility", label: "Accessibility Validation", agent: "accessibility-agent" },
  { stage_id: "qa", label: "QA Agent Full Suite", agent: "qa-agent" },
  { stage_id: "validation", label: "Independent Validation", agent: "independent-validator" },
  { stage_id: "artifact-preservation", label: "Artifact Vault Preservation", agent: "artifact-vault" },
];