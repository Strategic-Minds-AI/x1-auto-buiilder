// System Intelligence — comprehensive knowledge base for the Digital Dominance Factory
// platform. Contains the full architecture, capabilities, entity catalog, function
// catalog, connector catalog, and operational knowledge.
// Used by the Super Agent and the proactive system audit for end-to-end intelligence.

export const SYSTEM_INTELLIGENCE = {
  platform: {
    name: "Digital Dominance Factory",
    version: "1.0.0",
    url: "https://x1-auto-builder.base44.app",
    publishedUrl: "https://unlimitedwebsites.net",
    description:
      "Autonomous AI-powered platform for generating high-performance business websites with integrated lead-gen, automated client onboarding, and AI agent orchestration.",
    mission:
      "Generate, deploy, and manage high-performance business websites at scale with full automation, multi-tenant isolation, and AI-driven operations.",
  },

  architecture: {
    frontend: "React + Tailwind CSS + Vite (responsive, mobile + desktop)",
    backend: "Base44 platform (backend-as-a-service: auth, database, integrations, hosting)",
    database: "Base44 entities (JSON schema-based, with RLS support)",
    integrations: "Base44 connectors (OAuth) + backend functions with secrets",
    deployment: "Vercel (multi-team, multi-tenant support)",
    supabase: "X1 AI Hub (production) + XPS dedicated project (isolated)",
    ai: "InvokeLLM (multiple models) + AI Gateway for code agents",
  },

  entities: {
    core: {
      WebsiteProject: "Website generation pipeline — research, content, brand, deploy",
      BuildProject: "Auto Builder 12-step guided project creation",
      Client: "Multi-tenant client isolation (Supabase ref, Vercel team, config)",
      LaunchCampaign: "Mass launch campaigns with location-specific variants",
    },
    crm: {
      Lead: "Inbound leads from contact, quotation, newsletter, pricing, search forms",
      CrmContact: "CRM contacts with follow-up email scheduling and pipeline tracking",
    },
    social: {
      SocialCampaign: "Social media campaigns across 9 platforms",
      SocialPost: "Individual social media posts",
      SocialCreativeKit: "Platform-specific creative kits (profile, cover, promo, etc)",
    },
    generation: {
      GenerationJob: "Typed job queue for all generation operations",
      ApprovalRequest: "Approval gates for design, strategy, release, publishing",
      MediaAsset: "Generated media (logos, hero images, social graphics, etc)",
      VideoAsset: "Video generation pipeline (script, storyboard, render)",
      DigitalCardFlyer: "Digital business cards and promotional flyers",
      ApprovedBrandManifest: "Approved brand identity (colors, typography, positioning)",
    },
    intelligence: {
      IntelligenceTask: "System intelligence tasks and audit findings",
      MockupProject: "Mockup image ingestion and code generation",
      FaultLineScan: "Website problem scanning and outreach generation",
      PricingIntelligence: "Competitor pricing data and market intelligence",
      AgentTask: "Agent task assignments and tracking",
      MeasurementBinding: "Analytics measurement bindings (GA4, GSC)",
      ComplianceReport: "Compliance audit reports",
    },
    templates: {
      Template: "Site templates for reuse",
      DesignTemplate: "Design templates with visual rendering",
      SiteTemplate: "Site structure templates",
      StyleGuide: "Brand style guides",
      FontSystem: "Font system templates",
    },
    ai: {
      AITool: "AI tool library (100+ categories)",
      AISkill: "AI skill library with input/output schemas",
      AIToolTemplate: "Industry-specific AI tool templates",
      AgentProfile: "Agent profiles with capabilities and system prompts",
      CommChannel: "Communication channels (SMS, voice, email, WhatsApp)",
    },
    system: {
      AppApiKey: "API key management with SHA-256 hashing",
      SyncReceipt: "Sync operation receipts",
      ValidationReceipt: "Validation receipts for compliance",
      ChannelConnection: "Channel connection configurations",
    },
  },

  functions: {
    generation: [
      "generateWebsite", "researchBusiness", "generateContent", "generateAssets",
      "generateVision", "generateStrategies", "generateBusinessNames",
      "generateDesignTemplates", "generateIndustryPrompts", "generateCardFlyerContent",
      "universalGenerator",
    ],
    deployment: [
      "deploySite", "batchDeploy", "provisionSite", "provisionPreview",
      "autoConvergeSite", "provisionDomain",
    ],
    compliance: [
      "runComplianceCheck", "autoFixCompliance", "authorizeRelease", "runValidation",
      "batchValidateTemplates",
    ],
    analytics: [
      "syncSearchConsole", "syncGoogleAnalytics", "syncAllAnalytics",
    ],
    communication: [
      "sendGmailEmail", "createCalendarEvent", "sendTwilioSMS", "processFollowUps",
    ],
    social: [
      "generateSocialCreative", "generateSocialSchedule", "generateSocialScheduleV2",
    ],
    brand: [
      "createBrandManifest", "generatePricingStrategy", "discoverPricing",
    ],
    mass: [
      "massLaunch", "massLaunchFromMaster",
    ],
    templates: [
      "suggestTemplates", "instantiateTemplate", "universalizeTemplate",
    ],
    media: [
      "generateVideo", "generateVideoPipeline", "generateAssetBatch",
      "generateLibraryBatch", "populateLibraries", "seedLibraries",
    ],
    intelligence: [
      "apexDecomposeCommand", "gptSyncEngine", "gptControlBridge",
      "supabaseBridge", "webScraper", "systemAudit",
    ],
    utility: [
      "checkDomainAvailability", "generateApiKey", "ingestMockup",
      "scanWebsiteFaults", "syncOnboardingToSheet", "syncGoogleSheet",
      "researchIndustryTemplates",
    ],
  },

  connectors: {
    authorized: [
      { name: "Google Calendar", type: "googlecalendar", scopes: ["calendar", "calendar.events", "email"], webhooks: true },
      { name: "Gmail", type: "gmail", scopes: ["gmail.send", "gmail.readonly", "email"], webhooks: true },
      { name: "Supabase", type: "supabase", scopes: ["database", "rest", "storage", "auth"] },
      { name: "Google Analytics", type: "google_analytics", scopes: ["analytics.readonly"] },
      { name: "Google Search Console", type: "google_search_console", scopes: ["webmasters.readonly"] },
    ],
    workspace: [
      "Multiple Gmail accounts (Agency slots 4-10, Strategic Minds AI, Xtreme Polishing System)",
      "Multiple Google Calendar accounts",
      "Google Sheets, Google Docs, Google Drive, Google Tasks",
      "GitHub, HubSpot, Supabase",
    ],
  },

  workflows: [
    "LeadFollowUpSequence — hourly CRM follow-up email processing",
    "ScheduledAnalyticsSync — daily analytics sync for all projects",
    "NewProjectSocialGeneration — social content generation on new project",
    "OnboardingSheetSync — onboarding data sync to Google Sheets",
    "ProactiveSystemAudit — daily proactive system audit and optimization suggestions",
  ],

  agents: [
    "super_agent — full platform access, autonomous operations manager",
    "master_orchestrator — orchestrates the super-agent fleet",
    "social_media_manager — manages social media content and scheduling",
    "seo_sentinel — monitors SEO performance and compliance",
    "analytics_watcher — tracks analytics and alerts on anomalies",
    "communications_director — manages email and communication flows",
    "monetization_agent — identifies revenue opportunities",
  ],

  capabilities: {
    websiteGeneration: "Full pipeline: research → content → brand → assets → deploy",
    massLaunch: "Generate location-specific websites at scale from a master template",
    multiTenant: "Client isolation with dedicated Supabase projects and Vercel teams",
    crm: "Lead capture, pipeline management, automated follow-up emails",
    socialMedia: "Content generation, scheduling, campaign management across 9 platforms",
    analytics: "Google Analytics 4 + Search Console sync, performance dashboards",
    compliance: "Automated compliance checks, auto-fix, release authorization",
    email: "Gmail integration for sending emails to registered users",
    calendar: "Google Calendar event creation",
    sms: "Twilio/Xtreme Comms SMS sending",
    videoGeneration: "AI video script, storyboard, and render pipeline",
    brandIdentity: "AI-generated brand manifests with colors, typography, positioning",
    pricing: "Competitor pricing discovery and strategy generation",
    domainManagement: "Vercel domain check, purchase, assign, verify, remove",
    webScraping: "URL content extraction, link discovery, metadata parsing, AI analysis",
    gptSync: "Bi-directional sync with ChatGPT for external AI operations",
    supabaseBridge: "Data bridging to X1 AI Hub and XPS dedicated project",
    universalGeneration: "Generate any type of content, code, or feature via LLM",
    proactiveAudit: "Daily system audit with optimization and upgrade suggestions",
    agentOrchestration: "Super Agent with full entity and function access",
  },

  secrets: [
    "VERCEL_TOKEN, VERCEL_TEAM_ID — main Vercel deployment",
    "XPS_VERCEL_TOKEN, XPS_VERCEL_TEAM_ID — XPS client Vercel deployment",
    "ENGINE_URL, ENGINE_API_KEY — APEX Universal Build Command engine",
    "TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER — SMS",
    "GPT_SYNC_API_KEY — ChatGPT sync bridge",
    "GOOGLE_SHEET_ID — Google Sheets sync",
    "MY_PERSONAL_ACCESS_TOKEN — Base44 SDK personal access",
  ],

  operationalProcedures: {
    generateWebsite: "Use researchBusiness → generateContent → generateAssets → deploySite",
    deploySite: "Ensure compliance check passes → provisionSite → deploySite → authorizeRelease",
    massLaunch: "Create LaunchCampaign → massLaunch or massLaunchFromMaster → batchDeploy",
    newClient: "Create Client record with Supabase ref and Vercel team → setup_xps_schema in Supabase",
    syncAnalytics: "Call syncAllAnalytics for all projects or syncSearchConsole/syncGoogleAnalytics per project",
    sendEmail: "Use sendGmailEmail function with Gmail connector",
    createEvent: "Use createCalendarEvent function with Google Calendar connector",
    scrapeWebsite: "Use webScraper function with URL and extract_type",
    provisionDomain: "Use provisionDomain function: check → purchase → assign → verify",
    auditSystem: "Use systemAudit function for proactive audit and optimization suggestions",
    universalGenerate: "Use universalGenerator function with action: generate/assist/install",
  },

  knownIssues: [
    "GPT Sync function lacks granular permission scoping — needs server-side allowlisting",
    "PerformanceDashboard chart rendering pending validation with corrected API data shape",
  ],

  optimizationOpportunities: [
    "Wire CRM lead capture into the website launch pipeline for automatic lead generation",
    "Configure automated email triggers based on CRM lead stage transitions",
    "Finalize X1 repository bridge and worker heartbeat connectivity",
    "Implement agent autonomous execution loop for continuous operation",
    "Add real-time agent activity monitoring dashboard",
    "Implement predictive analytics for website performance forecasting",
    "Add A/B testing framework for generated websites",
    "Implement automatic SEO optimization based on Search Console data",
    "Add multi-language support for generated websites",
    "Implement automatic social media posting from generated content",
  ],
};