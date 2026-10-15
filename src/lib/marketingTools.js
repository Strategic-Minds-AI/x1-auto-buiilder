// Marketing Tools Catalog — SEO, GEO, AEO, and general marketing capabilities
export const MARKETING_TOOL_CATEGORIES = [
  { key: "seo", label: "SEO", icon: "Search", color: "#10b981", desc: "Search Engine Optimization tools for ranking and visibility" },
  { key: "geo", label: "GEO", icon: "Globe", color: "#6366f1", desc: "Generative Engine Optimization for AI-powered search discovery" },
  { key: "aeo", label: "AEO", icon: "MessageSquare", color: "#f59e0b", desc: "Answer Engine Optimization for voice and AI assistants" },
  { key: "content", label: "Content", icon: "PenTool", color: "#ec4899", desc: "Content creation, planning, and optimization tools" },
  { key: "social", label: "Social", icon: "Share2", color: "#8b5cf6", desc: "Social media management and content distribution" },
  { key: "ads", label: "Ads", icon: "DollarSign", color: "#3b82f6", desc: "Advertising and paid media management" },
  { key: "analytics", label: "Analytics", icon: "BarChart3", color: "#06b6d4", desc: "Performance tracking and measurement tools" },
  { key: "local", label: "Local SEO", icon: "MapPin", color: "#ef4444", desc: "Local search, Google Business Profile, and citations" },
  { key: "technical", label: "Technical", icon: "Code", color: "#64748b", desc: "Technical SEO, schema, and site health tools" },
  { key: "email", label: "Email", icon: "Mail", color: "#f97316", desc: "Email marketing and automation tools" },
];

export const MARKETING_TOOLS = [
  // SEO
  { name: "Keyword Research Engine", category: "seo", desc: "Discovers high-intent keywords with search volume, difficulty, and SERP features", caps: ["Keyword gap analysis", "Search volume estimation", "SERP feature detection", "Long-tail discovery"], platform: "Built-in", type: "ai_powered" },
  { name: "Rank Tracker", category: "seo", desc: "Tracks keyword rankings across search engines with daily position monitoring", caps: ["Daily rank tracking", "Competitor rank comparison", "SERP feature tracking", "Local rank tracking"], platform: "Built-in", type: "automated" },
  { name: "On-Page Optimizer", category: "seo", desc: "Analyzes and optimizes page content for target keywords with density and LSI suggestions", caps: ["Keyword density analysis", "LSI keyword suggestions", "Content scoring", "Meta tag optimization"], platform: "Built-in", type: "ai_powered" },
  { name: "Backlink Analyzer", category: "seo", desc: "Monitors backlink profile, identifies link building opportunities, and tracks domain authority", caps: ["Backlink profile audit", "Link opportunity finder", "Domain authority tracking", "Toxic link detection"], platform: "Built-in", type: "automated" },
  { name: "SERP Analyzer", category: "seo", desc: "Analyzes search engine results pages to identify ranking patterns and content gaps", caps: ["SERP feature mapping", "Content gap analysis", "Competitor content audit", "Intent classification"], platform: "Built-in", type: "ai_powered" },
  { name: "SEO Audit Scanner", category: "seo", desc: "Runs comprehensive technical and content SEO audits with prioritized fix recommendations", caps: ["Technical SEO audit", "Content SEO audit", "Prioritized fixes", "Score tracking"], platform: "Built-in", type: "automated" },

  // GEO (Generative Engine Optimization)
  { name: "AI Discovery Optimizer", category: "geo", desc: "Optimizes content for discovery by AI search engines like ChatGPT, Perplexity, and Google SGE", caps: ["AI citation tracking", "Entity optimization", "Source authority scoring", "Content structure analysis"], platform: "Built-in", type: "ai_powered" },
  { name: "Entity Builder", category: "geo", desc: "Builds and manages entity relationships for knowledge graph inclusion", caps: ["Entity mapping", "Relationship building", "Knowledge graph submission", "Entity deduplication"], platform: "Built-in", type: "ai_powered" },
  { name: "Citation Tracker", category: "geo", desc: "Tracks when and where your content is cited by AI engines and LLMs", caps: ["AI citation monitoring", "Source attribution tracking", "Citation gap analysis", "Authority scoring"], platform: "Built-in", type: "automated" },
  { name: "E-E-A-T Enhancer", category: "geo", desc: "Analyzes and improves Expertise, Experience, Authority, and Trust signals", caps: ["E-E-A-T scoring", "Author authority building", "Trust signal audit", "Expertise demonstration"], platform: "Built-in", type: "ai_powered" },
  { name: "Structured Data Generator", category: "geo", desc: "Generates JSON-LD structured data for enhanced AI and search understanding", caps: ["Schema generation", "Entity markup", "Relationship markup", "Validation"], platform: "Built-in", type: "automated" },

  // AEO (Answer Engine Optimization)
  { name: "FAQ Generator", category: "aeo", desc: "Creates FAQ sections optimized for answer engines and voice search", caps: ["Question mining", "Answer optimization", "FAQPage schema", "Voice search formatting"], platform: "Built-in", type: "ai_powered" },
  { name: "Answer Block Builder", category: "aeo", desc: "Creates concise answer blocks optimized for featured snippets and AI responses", caps: ["Snippet-eligible formatting", "Answer extraction", "Table/list optimization", "Paragraph answers"], platform: "Built-in", type: "ai_powered" },
  { name: "Voice Search Optimizer", category: "aeo", desc: "Optimizes content for voice queries and conversational search", caps: ["Conversational keyword targeting", "Question phrase optimization", "Local voice search", "Answer conciseness"], platform: "Built-in", type: "ai_powered" },
  { name: "Featured Snippet Hunter", category: "aeo", desc: "Identifies and optimizes for featured snippet opportunities", caps: ["Snippet opportunity detection", "Content format matching", "Position tracking", "Competitor snippet analysis"], platform: "Built-in", type: "automated" },

  // Content
  { name: "Content Strategy Planner", category: "content", desc: "Plans content calendars and strategies based on keyword research and competitor analysis", caps: ["Editorial calendar", "Topic clustering", "Content gap analysis", "Pillar page planning"], platform: "Built-in", type: "ai_powered" },
  { name: "Blog Post Generator", category: "content", desc: "Generates SEO-optimized blog posts with target keywords and structured formatting", caps: ["SEO blog writing", "Keyword integration", "Internal linking", "Meta generation"], platform: "Built-in", type: "ai_powered" },
  { name: "Content Repurposer", category: "content", desc: "Transforms existing content into different formats for multi-channel distribution", caps: ["Blog to social", "Blog to email", "Video script generation", "Infographic outlines"], platform: "Built-in", type: "ai_powered" },
  { name: "Headline Optimizer", category: "content", desc: "Generates and scores headlines for click-through rate and SEO impact", caps: ["Headline generation", "CTR scoring", "A/B testing", "Emotional trigger analysis"], platform: "Built-in", type: "ai_powered" },
  { name: "Landing Page Copywriter", category: "content", desc: "Writes conversion-optimized landing page copy with clear CTAs and benefit framing", caps: ["Hero copy", "Feature sections", "Testimonial frameworks", "CTA optimization"], platform: "Built-in", type: "ai_powered" },

  // Social
  { name: "Social Calendar Generator", category: "social", desc: "Generates 30-day social media calendars with platform-native content", caps: ["30-day planning", "Platform-specific formatting", "Hashtag optimization", "Best time scheduling"], platform: "Built-in", type: "ai_powered" },
  { name: "Social Creative Kit", category: "social", desc: "Creates platform-specific creative kits with images, captions, and hashtags", caps: ["Platform-native images", "Caption generation", "Hashtag research", "Story/reel formats"], platform: "Built-in", type: "ai_powered" },
  { name: "Social Post Scheduler", category: "social", desc: "Schedules and publishes posts across Facebook, Instagram, LinkedIn, TikTok, and more", caps: ["Multi-platform publishing", "Best time optimization", "Content calendar", "Post queue management"], platform: "Built-in", type: "automated" },
  { name: "Social Listening Monitor", category: "social", desc: "Monitors brand mentions, sentiment, and trending topics across social platforms", caps: ["Brand mention tracking", "Sentiment analysis", "Trend detection", "Competitor monitoring"], platform: "Built-in", type: "automated" },

  // Ads
  { name: "Google Ads Campaign Builder", category: "ads", desc: "Creates and manages Google Ads campaigns with keyword targeting and ad copy", caps: ["Campaign creation", "Keyword targeting", "Ad copy generation", "Budget optimization"], platform: "Google Ads", type: "ai_powered" },
  { name: "Ad Copy Generator", category: "ads", desc: "Generates ad copy variations for A/B testing across search and display networks", caps: ["Headline generation", "Description writing", "A/B variant creation", "CTR optimization"], platform: "Built-in", type: "ai_powered" },
  { name: "Bid Optimizer", category: "ads", desc: "Automatically adjusts ad bids based on performance data and conversion goals", caps: ["Smart bidding", "Conversion tracking", "Budget allocation", "ROAS optimization"], platform: "Google Ads", type: "automated" },
  { name: "Ad Performance Tracker", category: "ads", desc: "Tracks ad performance metrics including CTR, CPC, conversions, and ROAS", caps: ["Real-time metrics", "Conversion tracking", "A/B test results", "Budget pacing"], platform: "Google Ads", type: "automated" },

  // Analytics
  { name: "Google Analytics Sync", category: "analytics", desc: "Syncs Google Analytics 4 data for traffic, engagement, and conversion tracking", caps: ["GA4 data sync", "Traffic analysis", "Conversion tracking", "Audience insights"], platform: "Google Analytics", type: "automated" },
  { name: "Search Console Sync", category: "analytics", desc: "Syncs Google Search Console data for search performance and indexing status", caps: ["Query performance", "Page indexing", "Click-through rates", "Impression tracking"], platform: "Google Search Console", type: "automated" },
  { name: "ROI Calculator", category: "analytics", desc: "Calculates marketing ROI across channels with attribution modeling", caps: ["Multi-touch attribution", "Channel ROI", "Cost per acquisition", "Lifetime value"], platform: "Built-in", type: "automated" },
  { name: "Dashboard Reporter", category: "analytics", desc: "Generates comprehensive marketing performance reports with visualizations", caps: ["Visual dashboards", "KPI tracking", "Trend analysis", "Automated reporting"], platform: "Built-in", type: "automated" },

  // Local SEO
  { name: "Google Business Profile Manager", category: "local", desc: "Manages Google Business Profile listings with posts, reviews, and updates", caps: ["Profile optimization", "Post scheduling", "Review management", "Photo updates"], platform: "Google Business", type: "automated" },
  { name: "Local Citation Builder", category: "local", desc: "Builds and manages local business citations across directories", caps: ["Directory submissions", "NAP consistency", "Citation tracking", "Duplicate cleanup"], platform: "Built-in", type: "automated" },
  { name: "Review Manager", category: "local", desc: "Monitors and responds to customer reviews across Google, Yelp, and other platforms", caps: ["Review monitoring", "Response generation", "Rating tracking", "Review generation prompts"], platform: "Built-in", type: "ai_powered" },
  { name: "Local Rank Tracker", category: "local", desc: "Tracks local search rankings by geographic area and map pack position", caps: ["Map pack tracking", "Local keyword ranks", "Geographic targeting", "Competitor comparison"], platform: "Built-in", type: "automated" },

  // Technical
  { name: "Site Speed Optimizer", category: "technical", desc: "Analyzes and optimizes page load speed and Core Web Vitals", caps: ["LCP optimization", "CLS reduction", "FID improvement", "Image optimization"], platform: "Built-in", type: "automated" },
  { name: "Schema Markup Validator", category: "technical", desc: "Validates structured data markup against Google's schema requirements", caps: ["JSON-LD validation", "Schema coverage", "Error detection", "Rich result eligibility"], platform: "Built-in", type: "automated" },
  { name: "Crawl Diagnostics", category: "technical", desc: "Identifies crawl errors, broken links, and indexing issues", caps: ["Crawl error detection", "Broken link finder", "Indexing status", " robots.txt validation"], platform: "Built-in", type: "automated" },
  { name: "Mobile Friendliness Tester", category: "technical", desc: "Tests mobile usability and responsive design compliance", caps: ["Mobile rendering test", "Touch element sizing", "Viewport validation", "Font size check"], platform: "Built-in", type: "automated" },

  // Email
  { name: "Email Sequence Designer", category: "email", desc: "Designs automated email sequences for onboarding, nurture, and re-engagement", caps: ["Drip campaign design", "Trigger mapping", "Personalization tokens", "A/B subject testing"], platform: "Built-in", type: "ai_powered" },
  { name: "Newsletter Generator", category: "email", desc: "Creates branded newsletters from recent content and business updates", caps: ["Content curation", "Template design", "Subject line optimization", "Send scheduling"], platform: "Built-in", type: "ai_powered" },
  { name: "Email Deliverability Checker", category: "email", desc: "Checks email authentication, spam score, and deliverability health", caps: ["SPF/DKIM/DMARC check", "Spam score analysis", "Blacklist monitoring", "Inbox placement testing"], platform: "Built-in", type: "automated" },
];

// Google compliance checklist items
export const GOOGLE_COMPLIANCE_CHECKLIST = [
  { id: "seo-meta-titles", category: "SEO", requirement: "Unique meta title on every page", weight: 5, status: "check", fix: "Add unique meta titles under 60 characters to every page" },
  { id: "seo-meta-desc", category: "SEO", requirement: "Meta description on every page", weight: 4, status: "check", fix: "Add compelling meta descriptions between 120-160 characters" },
  { id: "seo-schema", category: "SEO", requirement: "Schema markup (JSON-LD)", weight: 4, status: "check", fix: "Add JSON-LD structured data for rich results" },
  { id: "seo-sitemap", category: "SEO", requirement: "XML sitemap", weight: 3, status: "check", fix: "Generate and submit XML sitemap to Google" },
  { id: "seo-robots", category: "SEO", requirement: "robots.txt file", weight: 3, status: "check", fix: "Create robots.txt with proper directives" },
  { id: "seo-canonical", category: "SEO", requirement: "Canonical URLs", weight: 3, status: "check", fix: "Add canonical URL tags to prevent duplicate content" },
  { id: "seo-mobile", category: "SEO", requirement: "Mobile-responsive design", weight: 5, status: "check", fix: "Ensure site is fully responsive on all devices" },
  { id: "seo-cwv", category: "SEO", requirement: "Core Web Vitals (LCP, FID, CLS)", weight: 5, status: "check", fix: "Optimize LCP < 2.5s, FID < 100ms, CLS < 0.1" },
  { id: "seo-h1", category: "SEO", requirement: "Single H1 per page", weight: 3, status: "check", fix: "Ensure each page has exactly one H1 heading" },
  { id: "seo-alt", category: "SEO", requirement: "Image alt text", weight: 3, status: "check", fix: "Add descriptive alt attributes to all images" },
  { id: "seo-internal", category: "SEO", requirement: "Internal linking structure", weight: 3, status: "check", fix: "Add contextual internal links between related pages" },
  { id: "aeo-faq", category: "AEO", requirement: "FAQ section with questions", weight: 4, status: "check", fix: "Add FAQ page with common questions and answers" },
  { id: "aeo-schema", category: "AEO", requirement: "FAQPage schema markup", weight: 3, status: "check", fix: "Add FAQPage JSON-LD schema to FAQ content" },
  { id: "aeo-answers", category: "AEO", requirement: "Concise answer paragraphs", weight: 3, status: "check", fix: "Write clear, concise answers in first paragraph" },
  { id: "aeo-snippets", category: "AEO", requirement: "Featured snippet optimization", weight: 3, status: "check", fix: "Use tables, lists, and step-by-step formats" },
  { id: "geo-citations", category: "GEO", requirement: "Authoritative citations and sources", weight: 3, status: "check", fix: "Link to authoritative sources and include citations" },
  { id: "geo-entities", category: "GEO", requirement: "Entity and knowledge graph optimization", weight: 3, status: "check", fix: "Use structured data to define entities and relationships" },
  { id: "geo-ai", category: "GEO", requirement: "AI/LLM discovery optimization", weight: 4, status: "check", fix: "Use clear, factual, structured content for AI discovery" },
  { id: "geo-eeat", category: "GEO", requirement: "E-E-A-T signals", weight: 5, status: "check", fix: "Add author bios, credentials, and expertise markers" },
  { id: "tech-https", category: "Technical", requirement: "HTTPS enforcement", weight: 5, status: "check", fix: "Enable HTTPS and redirect HTTP to HTTPS" },
  { id: "tech-compression", category: "Technical", requirement: "Gzip/Brotli compression", weight: 3, status: "check", fix: "Enable text compression via CDN" },
  { id: "tech-cdn", category: "Technical", requirement: "CDN caching", weight: 4, status: "check", fix: "Serve static assets via CDN" },
  { id: "tech-redirects", category: "Technical", requirement: "301 redirects for moved pages", weight: 3, status: "check", fix: "Configure 301 redirects for any moved URLs" },
  { id: "tech-404", category: "Technical", requirement: "Custom 404 error page", weight: 2, status: "check", fix: "Create branded 404 page with navigation" },
  { id: "tech-hreflang", category: "Technical", requirement: "hreflang for multi-language", weight: 2, status: "check", fix: "Add hreflang tags if targeting multiple languages" },
  { id: "content-original", category: "Content", requirement: "Original, unique content", weight: 5, status: "check", fix: "Generate original content from research, not duplicates" },
  { id: "content-keywords", category: "Content", requirement: "Target keywords per page", weight: 4, status: "check", fix: "Research and assign target keywords per page" },
  { id: "content-depth", category: "Content", requirement: "Sufficient content depth", weight: 3, status: "check", fix: "Aim for 300+ words per page, 1000+ for pillar pages" },
  { id: "content-cta", category: "Content", requirement: "Clear call-to-action on every page", weight: 4, status: "check", fix: "Add clear CTA buttons on every page" },
  { id: "content-contact", category: "Content", requirement: "Contact page with NAP", weight: 4, status: "check", fix: "Add contact page with consistent Name, Address, Phone" },
  { id: "content-fresh", category: "Content", requirement: "Fresh, regularly updated content", weight: 2, status: "check", fix: "Schedule regular content updates" },
];