// Complete workflow catalog — all workflows across the platform
export const WORKFLOW_CATALOG = [
  // AI & Agents
  { name: "Strategy to GPT Mission Sync", file: "StrategyToGPTMission", trigger: "entity", triggerEntity: "BuildProject", status: "active", category: "AI & Agents",
    desc: "When generateStrategies completes, converts strategies to GPTMission objects and notifies communications_director to review mission alignment.",
    steps: [{ name: "sync_missions", function: "syncStrategiesToMissions", title: "Sync strategies to GPT missions" }] },

  // Operations
  { name: "Build Project Auto Deploy", file: "BuildProjectAutoDeploy", trigger: "entity", triggerEntity: "BuildProject", status: "active", category: "Operations",
    desc: "When a new BuildProject is created, researches templates, instantiates, deploys, and notifies master_orchestrator.",
    steps: [{ name: "run_pipeline", function: "buildProjectPipeline", title: "Run build pipeline" }] },

  { name: "Compliance Review and Deploy", file: "ComplianceReviewWorkflow", trigger: "entity", triggerEntity: "WebsiteProject", status: "active", category: "Operations",
    desc: "When a WebsiteProject moves to Ready for Review, runs compliance check. If pass, deploys. If fail, assigns fix task to super_agent.",
    steps: [{ name: "process_compliance", function: "processComplianceReview", title: "Process compliance review" }] },

  { name: "Auto Project Sandbox", file: "AutoProjectSandbox", trigger: "entity", triggerEntity: "WebsiteProject", status: "active", category: "Operations",
    desc: "Auto-provisions a Railway sandbox when a new project is created.",
    steps: [{ name: "provision", function: "provisionSandbox", title: "Provision sandbox" }] },

  { name: "Auto Sandbox Provision", file: "AutoSandboxProvision", trigger: "scheduled", status: "active", category: "Operations",
    desc: "Periodically provisions pending sandboxes for active projects.",
    steps: [{ name: "provision", function: "provisionSandbox", title: "Provision pending sandboxes" }] },

  { name: "Proactive System Audit", file: "ProactiveSystemAudit", trigger: "scheduled", status: "active", category: "Operations",
    desc: "Runs proactive system-wide audits on a recurring schedule.",
    steps: [{ name: "audit", function: "runSystemTests", title: "Run system audit" }] },

  { name: "Onboarding Sheet Sync", file: "OnboardingSheetSync", trigger: "entity", triggerEntity: "Lead", status: "inactive", category: "Operations",
    desc: "Syncs onboarding data to Google Sheets when onboarding completes.",
    steps: [{ name: "sync", function: "syncOnboardingToSheet", title: "Sync to Google Sheets" }] },

  // Sales
  { name: "Lead Follow-Up Sequence", file: "LeadFollowUpSequence", trigger: "scheduled", status: "inactive", category: "Sales",
    desc: "Automated follow-up email sequence for leads to keep them engaged.",
    steps: [{ name: "follow_up", function: "processFollowUps", title: "Process follow-ups" }] },

  // Marketing
  { name: "New Project Social Generation", file: "NewProjectSocialGeneration", trigger: "entity", triggerEntity: "WebsiteProject", status: "inactive", category: "Marketing",
    desc: "Generates social media content when a new project is created.",
    steps: [{ name: "generate_social", function: "generateSocialCreative", title: "Generate social content" }] },

  { name: "Website Project Auto Pipeline", file: "WebsiteProjectAutoPipeline", trigger: "entity", triggerEntity: "WebsiteProject", status: "active", category: "Operations",
    desc: "When a new WebsiteProject is created, automatically runs the full pipeline: business research, template selection, content generation, brand assets, deployment, social calendar, compliance check, and orchestrator notification.",
    steps: [
      { name: "research", function: "researchBusiness", title: "Research business" },
      { name: "templates", function: "researchIndustryTemplates", title: "Research templates" },
      { name: "instantiate", function: "instantiateTemplate", title: "Instantiate template" },
      { name: "content", function: "generateWebsite", title: "Generate content" },
      { name: "assets", function: "generateAssets", title: "Generate assets" },
      { name: "deploy", function: "deploySite", title: "Deploy site" },
      { name: "social", function: "generateSocialScheduleV2", title: "Generate social calendar" },
      { name: "compliance", function: "runComplianceCheck", title: "Run compliance" },
      { name: "notify", function: "websiteProjectPipeline", title: "Notify orchestrator" },
    ] },

  // Analytics
  { name: "Scheduled Analytics Sync", file: "ScheduledAnalyticsSync", trigger: "scheduled", status: "inactive", category: "Analytics",
    desc: "Syncs Google Analytics and Search Console data on a schedule.",
    steps: [{ name: "sync_analytics", function: "syncAllAnalytics", title: "Sync analytics data" }] },
];

export const WORKFLOW_CATEGORIES = ["All", "AI & Agents", "Operations", "Sales", "Marketing", "Analytics"];

// ChatGPT bi-directional sync info
export const GPT_SYNC_INFO = {
  endpoint: "/functions/gptSyncEngine",
  auth: "Bearer GPT_SYNC_API_KEY",
  entities: ["WebsiteProject", "Template", "LaunchCampaign"],
  functions: ["generateWebsite", "massLaunch", "researchIndustryTemplates", "generateAssets"],
  actions: ["read", "create", "update", "delete", "execute", "snapshot", "events"],
  desc: "Bi-directional JSON sync between ChatGPT and the platform. ChatGPT can read/write entities and execute functions via the gptSyncEngine endpoint. The Strategy to GPT Mission Sync workflow automatically converts strategies into GPTMission objects for ChatGPT execution.",
};