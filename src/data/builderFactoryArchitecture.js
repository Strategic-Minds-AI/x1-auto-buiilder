// Repository architecture and ranking for the GPT Builder Factory mission

export const ARCHITECTURE_LAYERS = [
  {
    name: "GPT BUILDER FACTORY",
    role: "Orchestration brain — ChatGPT decomposes, routes, and approves",
    color: "from-[#00d4ff] to-[#0066ff]",
    items: [],
  },
  {
    name: "universal-product-factory-template",
    role: "Canonical project starter — bootstrap, schemas, visual contracts, product packs, build docs, testing, receipts, preview generation",
    color: "from-[#6366f1] to-[#8b5cf6]",
    items: [
      "project bootstrap", "schemas", "visual contracts", "product packs",
      "build docs", "testing", "receipts", "preview generation",
    ],
  },
  {
    name: "X1 / CONTROL PLANE",
    role: "Runtime and orchestration — queue, workers, leases, approvals, persistent execution",
    color: "from-[#f59e0b] to-[#ef4444]",
    items: ["queue", "workers", "leases", "approvals", "persistent execution", "orchestration"],
  },
  {
    name: "SPECIALIZED DONORS",
    role: "Donor repositories — selected by the meta-template, not cloned wholesale",
    color: "from-[#10b981] to-[#14b8a6]",
    items: [
      "Google-first SEO", "XPS service template", "Digital Dominance", "Website-specific starters",
    ],
  },
];

export const REPO_RANKINGS = [
  { rank: 1, medal: "🥇", name: "universal-product-factory-template", role: "Canonical GPT Builder Factory project starter", status: "HALFWAY THERE", statusColor: "emerald" },
  { rank: 2, medal: "🥈", name: "strategic-minds-control-plane", role: "Runtime / control-plane integration", status: "EXISTS", statusColor: "emerald" },
  { rank: 3, medal: "🥉", name: "google-first-programmatic-seo-template", role: "SEO / location / content donor", status: "EXISTS", statusColor: "emerald" },
  { rank: 4, medal: "4️⃣", name: "x1-auto-buiilder", role: "Existing Base44 factory / runtime donor", status: "EXISTS", statusColor: "emerald" },
  { rank: 5, medal: "5️⃣", name: "xps-service-dominance-template", role: "Service-business visual / template donor", status: "EXISTS", statusColor: "emerald" },
  { rank: 6, medal: "6️⃣", name: "digital-dominance-universal-template", role: "Website-specific donor", status: "EXISTS", statusColor: "emerald" },
  { rank: 7, medal: "7️⃣", name: "universal-website-starter", role: "Lightweight website donor", status: "EXISTS", statusColor: "emerald" },
  { rank: 8, medal: "8️⃣", name: "universal-auto-builder-digital-dominance-template", role: "Currently mostly an empty shell", status: "EMPTY SHELL", statusColor: "amber" },
];

export const EMPTY_REPO_DISCOVERY = {
  title: "Important Discovery",
  repo: "universal-auto-builder-digital-dominance-template",
  finding: "The repository root contains essentially only README.md, and the README is only:",
  readmeContent: "Strategic Minds reusable Universal Auto Builder and Digital Dominance template factory",
  conclusion: "Despite the excellent name, it currently has almost no implementation behind it. Do not make it the canonical foundation unless we intentionally populate it from the better repo. The name is arguably perfect. The codebase is not there yet.",
};

export const FACTORY_PIPELINE = [
  "approved visual direction",
  "ProductPack schema",
  "validation",
  "distinct frontend rendering",
  "safe interactions",
  "deterministic hash",
  "preview",
  "Chrome mobile + desktop validation",
  "independent Guardian receipt",
  "separate production approval",
];

export const EXPANSION_FOLDERS = [
  "00_CONTROL_PLANE/", "01_CLIENT_VISION/", "02_VISUAL_REFERENCES/",
  "03_RESEARCH/", "04_BRAND/", "05_FRONTEND/", "06_BACKEND/",
  "07_INTEGRATIONS/", "08_SEO_GEO_AEO/", "09_DETERMINISTIC_BUILD/",
  "10_SANDBOX_RUNTIME/", "11_ROADMAP/", "12_QA_VALIDATION/",
  "13_STAGE_GATES/", "14_RELEASE/", "15_OPERATIONS/",
  "16_ARTIFACT_VAULT/", "17_CLIENT_HANDOFF/",
];

export const EXPANSION_SCHEMAS = [
  "project", "client", "business", "requirement", "task", "queue_job",
  "approval", "artifact", "artifact_receipt", "session",
  "provider_binding", "account_binding", "template_binding",
  "prompt_binding", "agent_binding", "validation",
  "deployment", "release", "rollback", "incident",
];