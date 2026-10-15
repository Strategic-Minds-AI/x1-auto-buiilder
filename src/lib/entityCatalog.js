// Complete entity catalog — all entities available for use across future projects
export const ENTITY_CATALOG = [
  // Core Projects
  { name: "Client", category: "Core", icon: "Building2", description: "Multi-tenant client accounts with isolated Supabase/Vercel resources", keyFields: ["name", "slug", "status", "industry"] },
  { name: "WebsiteProject", category: "Core", icon: "Globe", description: "Generated website projects with content, branding, and deployment data", keyFields: ["business_name", "industry", "status", "client_id"] },
  { name: "LaunchCampaign", category: "Core", icon: "Rocket", description: "Mass launch campaigns targeting multiple locations", keyFields: ["name", "status", "industry"] },
  { name: "BuildProject", category: "Core", icon: "Hammer", description: "Active build projects in the Auto Builder pipeline", keyFields: ["name", "status"] },

  // AI & Agents
  { name: "AgentProfile", category: "AI & Agents", icon: "Bot", description: "Agent profiles with capabilities, system prompts, and autonomy levels", keyFields: ["name", "skill_category", "autonomy_level"] },
  { name: "AgentTask", category: "AI & Agents", icon: "ListTodo", description: "Tasks assigned to agents with status and priority tracking", keyFields: ["title", "status", "assigned_agent"] },
  { name: "AgentInstruction", category: "AI & Agents", icon: "SlidersHorizontal", description: "Custom instructions that override Super Agent behavior", keyFields: ["title", "active", "priority", "category"] },
  { name: "AITool", category: "AI & Agents", icon: "Wrench", description: "AI tool registry with capabilities, providers, and integration types", keyFields: ["name", "category", "provider"] },
  { name: "AISkill", category: "AI & Agents", icon: "Zap", description: "AI skills with input/output schemas and implementation types", keyFields: ["name", "category", "complexity"] },
  { name: "AIToolTemplate", category: "AI & Agents", icon: "FileCode", description: "Reusable AI tool templates with prompt patterns and test cases", keyFields: ["name", "tool_category", "industry"] },
  { name: "GPTMission", category: "AI & Agents", icon: "Radio", description: "GPT sync missions for bi-directional ChatGPT integration", keyFields: ["title", "status"] },
  { name: "PromptPack", category: "AI & Agents", icon: "Package", description: "Curated prompt packs for industry-specific generation", keyFields: ["name", "category"] },

  // Templates
  { name: "Template", category: "Templates", icon: "LayoutTemplate", description: "Master website templates for instant project creation", keyFields: ["name", "industry", "type"] },
  { name: "SiteTemplate", category: "Templates", icon: "Globe", description: "Site-specific templates with layout and content blueprints", keyFields: ["name", "industry"] },
  { name: "PlatformTemplate", category: "Templates", icon: "LayoutGrid", description: "Platform-level templates for SaaS and web apps", keyFields: ["name", "platform"] },
  { name: "B2BTemplate", category: "Templates", icon: "Briefcase", description: "B2B-focused website templates with lead-gen layouts", keyFields: ["name", "industry"] },
  { name: "SaaSTemplate", category: "Templates", icon: "Boxes", description: "SaaS application templates with pricing and feature pages", keyFields: ["name", "category"] },
  { name: "ChatUITemplate", category: "Templates", icon: "MessageSquare", description: "Chat interface templates for AI agent conversations", keyFields: ["name", "type"] },
  { name: "FunnelTemplate", category: "Templates", icon: "Filter", description: "Lead funnel templates with multi-step conversion flows", keyFields: ["name", "industry"] },
  { name: "WorkflowTemplate", category: "Templates", icon: "Workflow", description: "Automation workflow templates for common business processes", keyFields: ["name", "category"] },
  { name: "DesignTemplate", category: "Templates", icon: "Palette", description: "Design system templates with color, typography, and layout presets", keyFields: ["name", "style"] },
  { name: "StyleGuide", category: "Templates", icon: "SlidersHorizontal", description: "Brand style guides with color tokens and typography rules", keyFields: ["name", "brand_color"] },
  { name: "FontSystem", category: "Templates", icon: "Type", description: "Font pairing systems for consistent typography across projects", keyFields: ["name", "heading_font"] },

  // Media & Creative
  { name: "MediaAsset", category: "Media & Creative", icon: "Image", description: "Generated and uploaded media assets with provenance tracking", keyFields: ["asset_type", "url", "project_id"] },
  { name: "VideoAsset", category: "Media & Creative", icon: "Video", description: "AI-generated video assets with pipeline tracking", keyFields: ["title", "url", "status"] },
  { name: "SocialCreativeKit", category: "Media & Creative", icon: "Sparkles", description: "Social media creative kits with platform-specific assets", keyFields: ["name", "platform", "status"] },
  { name: "SocialPost", category: "Media & Creative", icon: "Share2", description: "Scheduled social media posts with platform and campaign tracking", keyFields: ["content", "platform", "status"] },
  { name: "SocialCampaign", category: "Media & Creative", icon: "Megaphone", description: "Social media campaigns with multi-platform publishing", keyFields: ["name", "status", "platforms"] },
  { name: "DigitalCardFlyer", category: "Media & Creative", icon: "CreditCard", description: "Digital business cards and flyers with custom styling", keyFields: ["name", "type", "status"] },

  // Operations
  { name: "GenerationJob", category: "Operations", icon: "Loader", description: "Generation job queue with priority, dependencies, and cost tracking", keyFields: ["job_type", "status", "priority"] },
  { name: "ApprovalRequest", category: "Operations", icon: "CheckCircle", description: "Approval requests for protected and production-class operations", keyFields: ["title", "status", "approval_class"] },
  { name: "ValidationReceipt", category: "Operations", icon: "ShieldCheck", description: "Validation receipts proving compliance and quality checks passed", keyFields: ["job_id", "status"] },
  { name: "SyncReceipt", category: "Operations", icon: "RefreshCw", description: "Sync receipts for GPT and Google Sheets data synchronization", keyFields: ["sync_type", "status"] },
  { name: "ComplianceReport", category: "Operations", icon: "Shield", description: "Compliance check reports with issue tracking and auto-fix status", keyFields: ["site_url", "score", "status"] },
  { name: "SystemTestReport", category: "Operations", icon: "Activity", description: "System-wide test reports with validation scores and fix tracking", keyFields: ["test_suite", "status", "score"] },
  { name: "Sandbox", category: "Operations", icon: "Server", description: "Railway and Vercel sandbox environments for dev/test deployments", keyFields: ["platform", "status", "url"] },
  { name: "MeasurementBinding", category: "Operations", icon: "BarChart3", description: "Analytics measurement bindings linking sites to tracking IDs", keyFields: ["project_id", "platform"] },

  // Intelligence
  { name: "IntelligenceTask", category: "Intelligence", icon: "Brain", description: "Intelligence hub tasks with phases, priorities, and evidence tracking", keyFields: ["title", "category", "status", "phase"] },
  { name: "FaultLineScan", category: "Intelligence", icon: "AlertTriangle", description: "Website fault line scans with outreach message generation", keyFields: ["website_url", "status", "problem_count"] },
  { name: "MockupProject", category: "Intelligence", icon: "Scan", description: "Mock-up ingestion projects with AI component analysis", keyFields: ["name", "status", "industry"] },
  { name: "PricingIntelligence", category: "Intelligence", icon: "DollarSign", description: "Competitor pricing intelligence with ranges and tiers", keyFields: ["industry", "competitor_name", "service_or_product"] },
  { name: "GoogleStandard", category: "Intelligence", icon: "Search", description: "Google standards and best practices for SEO compliance", keyFields: ["name", "category"] },

  // Communications
  { name: "CommChannel", category: "Communications", icon: "Radio", description: "Communication channels (SMS, voice, email, WhatsApp) with providers", keyFields: ["name", "channel_type", "status"] },
  { name: "ChannelConnection", category: "Communications", icon: "Plug", description: "Active channel connections with provider credentials", keyFields: ["name", "channel_id", "status"] },

  // Security
  { name: "AppApiKey", category: "Security", icon: "Key", description: "API keys for external app access with scope and expiry management", keyFields: ["name", "status", "scopes"] },

  // Leads
  { name: "Lead", category: "Leads", icon: "Users", description: "Captured leads from website forms with follow-up tracking", keyFields: ["name", "email", "form_type", "status"] },

  // Branding
  { name: "ApprovedBrandManifest", category: "Branding", icon: "Sparkles", description: "Approved brand manifests with logos, colors, and typography", keyFields: ["business_name", "status", "project_id"] },
];

export const ENTITY_CATEGORIES = ["All", "Core", "AI & Agents", "Templates", "Media & Creative", "Operations", "Intelligence", "Communications", "Security", "Leads", "Branding"];