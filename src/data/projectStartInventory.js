// Universal Project Start Inventory
// Every project receives this inventory. Every line has the same 12 fields.
// Status can only be: VERIFIED | MISSING | UNKNOWN | BLOCKED | NOT_APPLICABLE | STALE
// No blank boxes. Every item is explicitly VERIFIED or NOT_APPLICABLE before BOOTSTRAP_READY.

export const STATUS_OPTIONS = ["VERIFIED", "MISSING", "UNKNOWN", "BLOCKED", "NOT_APPLICABLE", "STALE"];

export const REQUIREMENT_OPTIONS = ["REQUIRED", "CONDITIONAL", "N/A"];

// Helper to create a line item with all 12 fields
function item(id, category, requirement, expectedValue, source, owner, verificationMethod) {
  return {
    id,
    category,
    requirement,
    expectedValue,
    actualValue: "",
    source,
    owner,
    verificationMethod,
    status: "UNKNOWN",
    receiptId: "",
    blocker: "",
    lastVerified: "",
  };
}

// ── SECTION 1: Accounts & Provider Identities ──────────────────────────
const SECTION_1_ACCOUNTS = {
  title: "Accounts & Provider Identities",
  description: "Store identifiers and secret references, never plaintext secrets.",
  items: [
    item("ACC-001", "Accounts", "REQUIRED", "Workspace identity + accessible capabilities", "ChatGPT admin", "Operator", "Check workspace membership + capability list"),
    item("ACC-002", "Accounts", "REQUIRED", "Project ID/name or COULD_NOT_VERIFY", "ChatGPT Projects", "Operator", "Verify project exists and is accessible"),
    item("ACC-003", "Accounts", "REQUIRED", "Authorized account identity", "Google Workspace admin", "Operator", "Verify OAuth token + account email"),
    item("ACC-004", "Accounts", "REQUIRED", "Canonical project-root binding", "Google Drive", "Operator", "Verify folder ID + sharing permissions"),
    item("ACC-005", "Accounts", "REQUIRED", "Operational account", "Gmail", "Operator", "Send/receive test email"),
    item("ACC-006", "Accounts", "REQUIRED", "Operational calendar", "Google Calendar", "Operator", "Create/read test event"),
    item("ACC-007", "Accounts", "REQUIRED", "Control-center spreadsheet", "Google Sheets", "Operator", "Verify sheet ID + read/write access"),
    item("ACC-008", "Accounts", "CONDITIONAL", "When client/contact workflows apply", "Google Contacts", "Operator", "Verify API access when needed"),
    item("ACC-009", "Accounts", "REQUIRED", "Organization + repo + permissions", "GitHub", "Operator", "Verify org membership + repo create access"),
    item("ACC-010", "Accounts", "REQUIRED", "Team + project + environment", "Vercel", "Operator", "Verify team membership + deploy access"),
    item("ACC-011", "Accounts", "REQUIRED", "Organization + project + environment", "Supabase", "Operator", "Verify project ref + API keys access"),
    item("ACC-012", "Accounts", "CONDITIONAL", "Project + service when used", "Railway", "Operator", "Verify service exists when used"),
    item("ACC-013", "Accounts", "CONDITIONAL", "App ID when used", "Base44", "Operator", "Verify app access when used"),
    item("ACC-014", "Accounts", "REQUIRED", "Control-plane/runtime identity", "X1", "Operator", "Verify runtime registration"),
    item("ACC-015", "Accounts", "REQUIRED", "Provider/account, no secret values", "Domain registrar", "Operator", "Verify account access (no secrets stored)"),
    item("ACC-016", "Accounts", "REQUIRED", "Provider/zone", "DNS provider", "Operator", "Verify zone management access"),
    item("ACC-017", "Accounts", "CONDITIONAL", "Verified property when relevant", "Google Search Console", "Operator", "Verify property ownership"),
    item("ACC-018", "Accounts", "CONDITIONAL", "Property/data-stream IDs", "Google Analytics", "Operator", "Verify property access"),
    item("ACC-019", "Accounts", "CONDITIONAL", "Container when relevant", "Tag Manager", "Operator", "Verify container access"),
    item("ACC-020", "Accounts", "CONDITIONAL", "Provider/account", "CRM", "Operator", "Verify CRM access when used"),
    item("ACC-021", "Accounts", "CONDITIONAL", "Sender/domain status", "Email provider", "Operator", "Verify sending domain"),
    item("ACC-022", "Accounts", "CONDITIONAL", "Provider/account", "SMS/voice provider", "Operator", "Verify account access"),
    item("ACC-023", "Accounts", "CONDITIONAL", "Provider/account if applicable", "Payments", "Operator", "Verify payment provider access"),
    item("ACC-024", "Accounts", "CONDITIONAL", "Only when project requires them", "Social accounts", "Operator", "Verify account access when needed"),
    item("ACC-025", "Accounts", "CONDITIONAL", "Semrush/etc. if applicable", "SEO/research tools", "Operator", "Verify tool access when needed"),
  ],
};

// ── SECTION 2: Client / Business Identity ──────────────────────────────
const SECTION_2_CLIENT = {
  title: "Client / Business Identity",
  description: "Every project must establish client identity before any build work begins.",
  items: [
    item("CLI-001", "Client", "REQUIRED", "Client/customer ID", "Intake form", "Intake Agent", "Verify unique ID assigned"),
    item("CLI-002", "Client", "REQUIRED", "Legal or operating business name", "Client intake", "Intake Agent", "Verify legal name on file"),
    item("CLI-003", "Client", "REQUIRED", "Website display name", "Client intake", "Intake Agent", "Verify display name approved"),
    item("CLI-004", "Client", "REQUIRED", "Primary contact", "Client intake", "Intake Agent", "Verify contact person identified"),
    item("CLI-005", "Client", "REQUIRED", "Contact email", "Client intake", "Intake Agent", "Verify email is valid and reachable"),
    item("CLI-006", "Client", "REQUIRED", "Website email", "Client intake", "Intake Agent", "Verify website email configured"),
    item("CLI-007", "Client", "REQUIRED", "Phone (or explicitly N/A)", "Client intake", "Intake Agent", "Verify phone or N/A documented"),
    item("CLI-008", "Client", "REQUIRED", "Public address (verified, private, or N/A)", "Client intake", "Intake Agent", "Verify address status"),
    item("CLI-009", "Client", "CONDITIONAL", "Required for rebrand/enhancement", "Client intake", "Intake Agent", "Verify existing URL captured"),
    item("CLI-010", "Client", "REQUIRED", "Desired URL (or recommendation requested)", "Client intake", "Intake Agent", "Verify domain decision documented"),
    item("CLI-011", "Client", "REQUIRED", "Industry", "Client intake", "Intake Agent", "Verify industry classified"),
    item("CLI-012", "Client", "REQUIRED", "Services/products", "Client intake", "Intake Agent", "Verify service list captured"),
    item("CLI-013", "Client", "REQUIRED", "Service markets", "Client intake", "Intake Agent", "Verify geographic markets"),
    item("CLI-014", "Client", "REQUIRED", "New / Rebrand / AI Enhancement", "Client intake", "Intake Agent", "Verify project type classified"),
    item("CLI-015", "Client", "REQUIRED", "Client's stated problem", "Client intake", "Intake Agent", "Verify problem statement captured"),
    item("CLI-016", "Client", "REQUIRED", "Client's vision", "Client intake", "Intake Agent", "Verify vision statement captured"),
    item("CLI-017", "Client", "REQUIRED", "Primary conversion", "Client intake", "Intake Agent", "Verify conversion goal defined"),
    item("CLI-018", "Client", "REQUIRED", "Definition of Done (HARD GATE)", "Client + Operator", "Intake Agent", "Verify DoD signed off — blocks all builds"),
    item("CLI-019", "Client", "REQUIRED", "Success metrics", "Client intake", "Intake Agent", "Verify metrics defined and measurable"),
    item("CLI-020", "Client", "REQUIRED", "Known exclusions", "Client intake", "Intake Agent", "Verify exclusions documented"),
  ],
};

// ── SECTION 3: Visual-Intent Inventory ─────────────────────────────────
const SECTION_3_VISUAL = {
  title: "Visual-Intent Inventory",
  description: "Hard requirement for visual builds. Words like premium, modern, clean, bold are insufficient by themselves.",
  items: [
    item("VIS-001", "Visual", "REQUIRED", "Visual example #1 (URL or upload)", "Client intake", "Visual Research Agent", "Verify reference captured"),
    item("VIS-002", "Visual", "REQUIRED", "Visual example #2 (URL or upload)", "Client intake", "Visual Research Agent", "Verify reference captured"),
    item("VIS-003", "Visual", "REQUIRED", "Visual example #3 (URL or upload)", "Client intake", "Visual Research Agent", "Verify reference captured"),
    item("VIS-004", "Visual", "REQUIRED", "Why they like #1", "Client intake", "Visual Research Agent", "Verify reasoning captured"),
    item("VIS-005", "Visual", "REQUIRED", "Why they like #2", "Client intake", "Visual Research Agent", "Verify reasoning captured"),
    item("VIS-006", "Visual", "REQUIRED", "Why they like #3", "Client intake", "Visual Research Agent", "Verify reasoning captured"),
    item("VIS-007", "Visual", "REQUIRED", "What they dislike", "Client intake", "Visual Research Agent", "Verify dislikes captured"),
    item("VIS-008", "Visual", "REQUIRED", "Preferred colors (or recommendation requested)", "Client intake", "Visual Research Agent", "Verify color direction"),
    item("VIS-009", "Visual", "REQUIRED", "Light mode preference", "Client intake", "Visual Research Agent", "Verify light mode direction"),
    item("VIS-010", "Visual", "REQUIRED", "Dark mode preference", "Client intake", "Visual Research Agent", "Verify dark mode direction"),
    item("VIS-011", "Visual", "REQUIRED", "Desktop direction", "Client intake", "Visual Research Agent", "Verify desktop layout direction"),
    item("VIS-012", "Visual", "REQUIRED", "Mobile direction", "Client intake", "Visual Research Agent", "Verify mobile layout direction"),
    item("VIS-013", "Visual", "REQUIRED", "Logo status: Existing / new / recommendation", "Client intake", "Brand Agent", "Verify logo decision"),
    item("VIS-014", "Visual", "REQUIRED", "Photo direction", "Client intake", "Visual Research Agent", "Verify photo direction"),
    item("VIS-015", "Visual", "REQUIRED", "Motion preference", "Client intake", "Visual Research Agent", "Verify motion direction"),
    item("VIS-016", "Visual", "REQUIRED", "Reference rights/provenance recorded", "Client intake", "Artifact Vault Agent", "Verify provenance documented"),
    item("VIS-017", "Visual", "CONDITIONAL", "If no references: GPT Builder Factory must show visual examples", "Builder Factory", "Visual Research Agent", "Verify examples generated when client has none"),
  ],
};

// ── SECTION 4: Folder Inventory ────────────────────────────────────────
const FOLDER_NAMES = [
  "00_CONTROL_PLANE", "01_CLIENT_VISION", "02_VISUAL_REFERENCES", "03_RESEARCH",
  "04_BRAND", "05_FRONTEND", "06_BACKEND", "07_INTEGRATIONS",
  "08_SEO_GEO_AEO", "09_DETERMINISTIC_BUILD", "10_SANDBOX_RUNTIME", "11_ROADMAP",
  "12_QA_VALIDATION", "13_STAGE_GATES", "14_RELEASE", "15_OPERATIONS",
  "16_ARTIFACT_VAULT", "17_CLIENT_HANDOFF",
];

const FOLDER_LOCATIONS = ["ChatGPT Project", "Google Drive", "GitHub repo", "Sandbox/worktree", "X1 registry", "Control spreadsheet"];

const SECTION_4_FOLDERS = {
  title: "Folder Inventory",
  description: "Every project must bind or create these 18 folders across all relevant locations.",
  items: FOLDER_NAMES.flatMap((folder) =>
    FOLDER_LOCATIONS.map((loc, i) =>
      item(`FOL-${folder.slice(0, 3)}-${loc.slice(0, 3).toUpperCase()}`, "Folders", "REQUIRED", `${folder} in ${loc}`, "Project setup", "Source Truth Agent", `Verify ${loc} folder exists`)
    )
  ),
};

// ── SECTION 5: Mandatory Files ─────────────────────────────────────────
const MANDATORY_FILES = [
  "README.md", "PROJECT_MANIFEST.json", "PROJECT_START_INVENTORY.json", "SOURCE_TRUTH.md",
  "CLIENT_VISION.md", "DEFINITION_OF_DONE.md", "REQUIREMENTS.md", "REQUIREMENTS_MATRIX.csv",
  "ASSUMPTIONS.md", "KNOWN_UNKNOWNS.md", "DECISION_LOG.md", "RISK_REGISTER.md",
  "APPROVALS.md", "MASTER_TODO.md", "MASTER_CHECKLIST.md", "BLUEPRINT.md",
  "ROADMAP.md", "DEPENDENCY_MAP.md", "CHANGELOG.md", "ROLLBACK.md",
  "ARTIFACT_POLICY.md", "ARTIFACT_REGISTRY.json", "CAPABILITY_REGISTRY.json",
  "PROVIDER_BINDINGS.json", "TEMPLATE_BINDINGS.json", "PROMPT_BINDINGS.json",
  "AGENT_BINDINGS.json", "config/autonomy/bidirectional-control.json",
];

const SECTION_5_FILES = {
  title: "Mandatory Files",
  description: "The start pack must include at minimum these files in 00_CONTROL_PLANE.",
  items: MANDATORY_FILES.map((file, i) =>
    item(`FILE-${String(i + 1).padStart(3, "0")}`, "Files", "REQUIRED", file, "Project setup", "Source Truth Agent", `Verify ${file} exists and is non-empty`)
  ),
};

// ── SECTION 6: Template Inventory ──────────────────────────────────────
const TEMPLATE_CLASSES = [
  "website", "landing page", "funnel", "SaaS", "PWA", "dashboard", "client portal",
  "admin portal", "commerce", "CRM", "automation", "content site", "SEO/location site",
  "mobile shell", "email", "proposal", "brand", "workflow", "database",
];

const SECTION_6_TEMPLATES = {
  title: "Template Inventory",
  description: "Do not copy every template. Register them. Select the right one, do not clone all.",
  items: TEMPLATE_CLASSES.map((cls, i) =>
    item(`TPL-${String(i + 1).padStart(3, "0")}`, "Templates", "CONDITIONAL", `Template binding for: ${cls}`, "GitHub org", "Frontend Builder", "Verify template repo + SHA + license")
  ),
};

// ── SECTION 7: Code Inventory ───────────────────────────────────────────
const CODE_CHECKS = [
  ["Framework", "verified"],
  ["Package manager", "locked"],
  ["Lockfile", "present"],
  ["Runtime", "declared"],
  ["Build command", "declared"],
  ["Lint", "declared"],
  ["Typecheck", "declared"],
  ["Unit tests", "declared"],
  ["Integration tests", "declared"],
  ["E2E tests", "declared"],
  ["Browser tests", "declared"],
  ["Env example", "no secrets"],
  ["CI workflow", "present"],
  ["Preview config", "present"],
  ["Production config", "gated"],
  ["Migrations", "versioned"],
  ["Seed/test data", "safe"],
  ["API contracts", "documented"],
  ["Auth contracts", "documented"],
  ["Error handling", "documented"],
  ["Logging", "safe"],
  ["Telemetry", "documented"],
  ["Rollback", "executable"],
];

const SECTION_7_CODE = {
  title: "Code Inventory",
  description: "Every code project checks these areas. Supabase projects need versioned migrations.",
  items: CODE_CHECKS.map(([area, expected], i) =>
    item(`CODE-${String(i + 1).padStart(3, "0")}`, "Code", "REQUIRED", `${area}: ${expected}`, "GitHub repo", "Frontend Builder", `Verify ${area} in repo`)
  ),
};

// ── SECTION 8: Repository Inventory ────────────────────────────────────
const REPO_FIELDS = [
  "canonical_repo", "template_repo", "donor_repos", "control_plane_repo",
  "worker_repo", "prompt_library_repo", "visual_template_repo", "data/schema repo when separate",
  "default_branch", "working_branch", "base_SHA", "head_SHA",
  "PR", "checks", "release tag", "rollback SHA",
];

const SECTION_8_REPOS = {
  title: "Repository Inventory",
  description: "Meta-template selects the right template repo rather than cloning them all into itself.",
  items: REPO_FIELDS.map((field, i) =>
    item(`REPO-${String(i + 1).padStart(3, "0")}`, "Repositories", "REQUIRED", field, "GitHub", "Source Truth Agent", `Verify ${field} resolved`)
  ),
};

// ── SECTION 9: Schema Inventory ────────────────────────────────────────
const SCHEMA_TYPES = [
  "project", "client", "business", "requirement", "task", "queue_job", "agent_job",
  "approval", "decision", "risk", "visual_reference", "template_binding",
  "prompt_binding", "provider_binding", "account_binding", "artifact",
  "artifact_receipt", "session", "validation", "test_result", "deployment",
  "release", "rollback", "incident", "metric", "lead", "tenant", "role", "audit_event",
];

const SECTION_9_SCHEMAS = {
  title: "Schema Inventory",
  description: "Meta-template ships reusable schemas. Every project activates only applicable schemas.",
  items: SCHEMA_TYPES.map((schema, i) =>
    item(`SCH-${String(i + 1).padStart(3, "0")}`, "Schemas", "CONDITIONAL", `Schema: ${schema}`, "Schema library", "Data Architect", `Verify ${schema} schema exists and is activated if applicable`)
  ),
};

// ── SECTION 10: Prompt Inventory ───────────────────────────────────────
const PROMPT_TYPES = [
  "intake", "clarification", "naming", "research", "competitive research", "industry research",
  "market research", "visual analysis", "brand generation", "logo directions",
  "website directions", "workflow directions", "content", "SEO", "AEO", "GEO",
  "schema markup", "frontend build", "backend build", "database", "auth", "integration",
  "migration", "QA", "security audit", "visual parity", "accessibility", "performance",
  "SEO audit", "independent validation", "repair", "release", "rollback", "client handoff", "operations",
];

const SECTION_10_PROMPTS = {
  title: "Prompt Inventory",
  description: "Prompts receive IDs, versions, hashes, owners, purpose, and validation status.",
  items: PROMPT_TYPES.map((prompt, i) =>
    item(`PRM-${String(i + 1).padStart(3, "0")}`, "Prompts", "CONDITIONAL", `Prompt: ${prompt}`, "Prompt library", "Content Agent", `Verify ${prompt} prompt registered with ID + version + hash`)
  ),
};

// ── SECTION 11: Agent-Type Inventory ────────────────────────────────────
const AGENT_ROLES = [
  ["Project Orchestrator", "owns lifecycle and routing"],
  ["Intake Agent", "compiles client requirements"],
  ["Source Truth Agent", "resolves current authority"],
  ["Research Agent", "business/market/industry evidence"],
  ["Visual Research Agent", "references and visual DNA"],
  ["Brand Agent", "identity system"],
  ["UX/Conversion Agent", "funnel and user journey"],
  ["Frontend Builder", "implementation"],
  ["Backend Builder", "API/data/auth"],
  ["Data Architect", "schema/RLS/tenant model"],
  ["Integration Agent", "external providers"],
  ["SEO/AEO/GEO Agent", "organic/search architecture"],
  ["Content Agent", "truthful content"],
  ["Artifact Vault Agent", "save/hash/upload/verify/receipt"],
  ["Security Agent", "adversarial/security validation"],
  ["Browser QA Agent", "real browser flow testing"],
  ["QA Agent", "functional/system test owner"],
  ["Independent Validator", "independent release evidence"],
  ["Repair Agent", "bounded fixes"],
  ["Deployment Agent", "preview/release mechanics"],
  ["Client Handoff Agent", "final delivery package"],
  ["Operations Agent", "monitoring/optimization"],
];

const SECTION_11_AGENTS = {
  title: "Agent-Type Inventory",
  description: "Canonical roles regardless of which model/provider fulfills them.",
  items: AGENT_ROLES.map(([role, responsibility], i) =>
    item(`AGT-${String(i + 1).padStart(3, "0")}`, "Agents", "REQUIRED", `${role} — ${responsibility}`, "Agent registry", "Project Orchestrator", `Verify ${role} assigned and configured`)
  ),
};

// ── SECTION 12: Independent QA Agent ────────────────────────────────────
const QA_TEST_AREAS = [
  "routes", "buttons", "navigation", "forms", "uploads", "API behavior", "auth",
  "role boundaries", "RLS", "tenant isolation", "database writes", "error states",
  "loading states", "mobile", "tablet", "desktop", "light mode", "dark mode",
  "keyboard", "accessibility", "performance", "SEO", "schema", "analytics",
  "queue behavior", "retry behavior", "idempotency", "preview deployment", "rollback",
];

const SECTION_12_QA = {
  title: "Independent QA Agent",
  description: "Must be separate from the builder. Outputs: QA_REPORT.json, QA_REPORT.md, screenshots/, browser traces/, test logs/. Verdicts: PASS | FAIL | BLOCKED | NOT_TESTED.",
  items: QA_TEST_AREAS.map((area, i) =>
    item(`QA-${String(i + 1).padStart(3, "0")}`, "QA", "REQUIRED", `Test: ${area}`, "Browser QA Agent", "QA Agent", `Verify ${area} tested with evidence`)
  ),
};

// ── SECTION 13: Independent Validator ────────────────────────────────────
const VALIDATOR_CHECKS = [
  "requirements", "approved design", "source SHA", "PR SHA", "deployment identity",
  "test receipts", "browser evidence", "artifact receipts", "provider state",
  "approval state", "rollback reference",
];

const VALIDATOR_QUESTIONS = [
  "Is this the exact approved build?",
  "Did the correct commit deploy?",
  "Did required tests actually run?",
  "Are the screenshots from that deployment?",
  "Do receipts match?",
  "Are unknowns still present?",
  "Was anything silently skipped?",
  "Can the system be rolled back?",
];

const SECTION_13_VALIDATOR = {
  title: "Independent Validator",
  description: "Deliberately not the QA Agent. Checks the QA Agent AND builder. Cannot rely on 'the coding agent said it passed.' Only the independent validator can issue VALIDATED.",
  items: [
    ...VALIDATOR_CHECKS.map((check, i) =>
      item(`VAL-${String(i + 1).padStart(3, "0")}`, "Validator", "REQUIRED", `Re-fetch: ${check}`, "Independent Validator", "Independent Validator", `Independently verify ${check}`)
    ),
    ...VALIDATOR_QUESTIONS.map((q, i) =>
      item(`VAL-Q${String(i + 1).padStart(2, "0")}`, "Validator", "REQUIRED", q, "Independent Validator", "Independent Validator", `Answer with evidence: ${q}`)
    ),
  ],
};

// ── SECTION 14: Plugin + Skill Inventory ────────────────────────────────
const CAPABILITY_TYPES = [
  "Skills", "Plugins", "MCPs", "Connectors", "Agents",
  "Browser capability", "Computer capability", "GitHub capability", "Drive capability",
  "Calendar capability", "Gmail capability", "Vercel capability", "Supabase capability",
  "Railway capability", "Base44 capability", "X1 capability", "QA capability",
];

const SECTION_14_CAPABILITIES = {
  title: "Plugin + Skill Inventory",
  description: "Dynamically scan available capabilities at bootstrap. Write CAPABILITY_REGISTRY.json. Prevents yesterday's inventory from becoming tomorrow's fiction.",
  items: CAPABILITY_TYPES.map((cap, i) =>
    item(`CAP-${String(i + 1).padStart(3, "0")}`, "Capabilities", "REQUIRED", `Scan: ${cap} (name, type, ID, installed, connected, authorized, read, write, execute, environment, last_verified, required_for_project, fallback)`, "Runtime scan", "Source Truth Agent", `Dynamically verify ${cap} availability`)
  ),
};

// ── SECTION 15: Mandatory External Standards Packet ─────────────────────
const STANDARDS = [
  "Google Search spam/helpful-content rules",
  "WCAG 2.2",
  "Responsive behavior",
  "Semantic HTML",
  "Core Web Vitals/performance",
  "Privacy requirements",
  "Security requirements",
  "Structured data",
  "Robots/indexation",
  "Sitemap",
  "Canonical URLs",
  "Accessibility",
  "Browser compatibility",
];

const SECTION_15_STANDARDS = {
  title: "Mandatory External Standards Packet",
  description: "Google's guidance is critical: mass-generating pages with little added value may constitute scaled-content abuse.",
  items: STANDARDS.map((std, i) =>
    item(`STD-${String(i + 1).padStart(3, "0")}`, "Standards", "REQUIRED", `Check: ${std}`, "External standards", "QA Agent", `Verify ${std} checked and compliant`)
  ),
};

// ── SECTION 16: Artifact Inventory ─────────────────────────────────────
const ARTIFACT_STEPS = ["CLASSIFY", "ROUTE", "SCAN", "HASH", "UPLOAD", "VERIFY", "RECORD"];

const SECTION_16_ARTIFACTS = {
  title: "Artifact Inventory",
  description: "Every meaningful deliverable runs: CLASSIFY → ROUTE → SCAN → HASH → UPLOAD → VERIFY → RECORD. No receipt = project cannot advance.",
  items: ARTIFACT_STEPS.map((step, i) =>
    item(`ART-${String(i + 1).padStart(3, "0")}`, "Artifacts", "REQUIRED", `Step: ${step}`, "Artifact Vault Agent", "Artifact Vault Agent", `Verify ${step} completed with receipt`)
  ),
};

// ── SECTION 17: Session / Accounting Inventory ──────────────────────────
const SESSION_FIELDS = [
  "project", "phase", "step", "task", "agent", "start", "stop", "duration",
  "calendar event", "email receipt", "sheet row", "source SHA", "artifacts",
  "QA", "validator result", "blockers", "next action",
];

const SECTION_17_SESSIONS = {
  title: "Session / Accounting Inventory",
  description: "Every meaningful work session records these fields. Feeds the log-in/log-out system.",
  items: SESSION_FIELDS.map((field, i) =>
    item(`SES-${String(i + 1).padStart(3, "0")}`, "Sessions", "REQUIRED", `Record: ${field}`, "Session log", "Operations Agent", `Verify ${field} captured per session`)
  ),
};

// ── SECTION 18: Gate Inventory ──────────────────────────────────────────
const GATES = [
  ["GATE 00", "CLIENT INTAKE"],
  ["GATE 01", "SOURCE TRUTH"],
  ["GATE 02", "INVENTORY COMPLETE"],
  ["GATE 03", "RESEARCH COMPLETE"],
  ["GATE 04", "VISUAL REFERENCES COMPLETE"],
  ["GATE 05", "VISUAL APPROVAL"],
  ["GATE 06", "REQUIREMENTS LOCK"],
  ["GATE 07", "BUILD READY"],
  ["GATE 08", "SANDBOX BUILD"],
  ["GATE 09", "BUILDER TESTS"],
  ["GATE 10", "QA AGENT"],
  ["GATE 11", "INDEPENDENT VALIDATOR"],
  ["GATE 12", "PREVIEW ACCEPTANCE"],
  ["GATE 13", "CLIENT ACCEPTANCE"],
  ["GATE 14", "RELEASE APPROVAL"],
  ["GATE 15", "PRODUCTION"],
  ["GATE 16", "POST-RELEASE VALIDATION"],
  ["GATE 17", "OPERATIONS"],
];

const SECTION_18_GATES = {
  title: "Gate Inventory",
  description: "Universal project lifecycle. Each gate must be VERIFIED or NOT_APPLICABLE before advancing.",
  items: GATES.map(([gate, name], i) =>
    item(`GATE-${String(i).padStart(2, "0")}`, "Gates", "REQUIRED", `${gate}: ${name}`, "Stage gate registry", "Project Orchestrator", `Verify ${gate} passed with evidence`)
  ),
};

// ── Export all sections ─────────────────────────────────────────────────
export const ALL_SECTIONS = [
  SECTION_1_ACCOUNTS,
  SECTION_2_CLIENT,
  SECTION_3_VISUAL,
  SECTION_4_FOLDERS,
  SECTION_5_FILES,
  SECTION_6_TEMPLATES,
  SECTION_7_CODE,
  SECTION_8_REPOS,
  SECTION_9_SCHEMAS,
  SECTION_10_PROMPTS,
  SECTION_11_AGENTS,
  SECTION_12_QA,
  SECTION_13_VALIDATOR,
  SECTION_14_CAPABILITIES,
  SECTION_15_STANDARDS,
  SECTION_16_ARTIFACTS,
  SECTION_17_SESSIONS,
  SECTION_18_GATES,
];

// ── Project Start Generator outputs ────────────────────────────────────
export const GENERATOR_OUTPUTS = [
  "project ID", "client ID", "intake packet", "visual-reference request",
  "project inventory", "Drive plan", "ChatGPT Project plan", "repo plan",
  "control workbook", "provider registry", "capability registry",
  "template bindings", "prompt bindings", "agent roster", "schemas",
  "master requirements", "task graph", "QA plan", "validator plan",
  "artifact policy", "calendar/session policy", "release gates", "definition of done",
];

// Calculate total items
export const TOTAL_ITEMS = ALL_SECTIONS.reduce((sum, s) => sum + s.items.length, 0);