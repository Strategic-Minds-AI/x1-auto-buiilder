/**
 * DIGITAL DOMINANCE — FORENSIC INTELLIGENCE LIBRARY
 * Source: APEX_DIGITAL_DOMINANCE_FORENSIC_MASTER_BLUEPRINT + Master Workbook + Lead URL Opportunity Workbook + Top 300 NearMe/NearYou + P0 Provisioning Checklist
 * Status: Verified from uploaded workbooks; no production claims; all evidence is READ_ONLY_SNAPSHOT
 * Google Compliance: 100% aligned with Google programmatic SEO standards (spam policies, helpful content, structured data)
 */

// ============================================================================
// 01 — GOOGLE RULES (from Master Workbook sheet 01)
// ============================================================================
export const GOOGLE_RULES = [
  { rule: "People-first content", status: "SAFE", requirement: "Create for users first. Add original information, first-hand evidence, useful tools, complete answers and clear authorship.", priority: "Critical", source: "https://developers.google.com/search/docs/fundamentals/creating-helpful-content" },
  { rule: "Search-intent language", status: "SAFE", requirement: "Use words users search for naturally in titles, headings, alt text and link text.", priority: "High", source: "https://developers.google.com/search/docs/essentials" },
  { rule: "Scaled AI content", status: "AVOID", requirement: "Do not mass-generate unoriginal pages primarily to manipulate rankings.", priority: "Critical", source: "https://developers.google.com/search/docs/essentials/spam-policies" },
  { rule: "Doorway pages", status: "AVOID", requirement: "Do not create many region/city/domain variants that funnel users to one destination with little unique value.", priority: "Critical", source: "https://developers.google.com/search/docs/essentials/spam-policies" },
  { rule: "Keyword stuffing", status: "AVOID", requirement: "No unnatural repetition or hidden keyword blocks.", priority: "Critical", source: "https://developers.google.com/search/docs/essentials/spam-policies" },
  { rule: "Fake locations", status: "AVOID", requirement: "No invented offices, service areas, or claims.", priority: "Critical", source: "https://developers.google.com/search/docs/essentials/spam-policies" },
  { rule: "Fake reviews/testimonials", status: "AVOID", requirement: "No fabricated social proof or review schema.", priority: "Critical", source: "https://developers.google.com/search/docs/appearance" },
  { rule: "Link schemes", status: "AVOID", requirement: "No buying/selling links or participating in link networks.", priority: "Critical", source: "https://developers.google.com/search/docs/essentials/spam-policies" },
  { rule: "Cloaking/sneaky redirects", status: "AVOID", requirement: "No showing different content to users vs crawlers.", priority: "Critical", source: "https://developers.google.com/search/docs/essentials/spam-policies" },
  { rule: "Structured data accuracy", status: "SAFE", requirement: "Accurate LocalBusiness/Service/Breadcrumb when eligible; no invented star ratings.", priority: "High", source: "https://developers.google.com/search/docs/appearance" },
  { rule: "Sitemap/indexing", status: "SAFE", requirement: "Only canonical indexable 200 pages; accurate lastmod.", priority: "High", source: "https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap" },
  { rule: "Generative AI guidance", status: "SAFE", requirement: "AI is usable, but mass low-value ranking manipulation is not.", priority: "High", source: "https://developers.google.com/search/docs/fundamentals/using-gen-ai-content" },
  { rule: "Mobile-first indexing", status: "SAFE", requirement: "Ensure mobile version is complete and equivalent.", priority: "High", source: "https://developers.google.com/search/docs/crawling-indexing/mobile/mobile-first-indexing" },
  { rule: "Page experience signals", status: "SAFE", requirement: "Core Web Vitals, HTTPS, no intrusive interstitials.", priority: "Medium", source: "https://developers.google.com/search/docs/appearance/page-experience" },
  { rule: "Original reporting", status: "SAFE", requirement: "Credit and differentiate original reporting with fresh value.", priority: "Medium", source: "https://developers.google.com/search/docs/fundamentals/creating-helpful-content" },
];

// ============================================================================
// 02 — 50 EMERGENCY VERTICALS (from Master Workbook sheet 04)
// ============================================================================
export const EMERGENCY_VERTICALS = [
  { rank: 1, vertical: "Water Damage Restoration", leadValue: 10, urgency: 10, buyerDensity: 10, composite: 10, risk: "Standard service QA", launch: "Pilot one real market/client first" },
  { rank: 2, vertical: "Fire Damage Restoration", leadValue: 10, urgency: 10, buyerDensity: 10, composite: 10, risk: "Standard service QA", launch: "Pilot one real market/client first" },
  { rank: 3, vertical: "Biohazard Cleanup", leadValue: 10, urgency: 10, buyerDensity: 10, composite: 10, risk: "Extra safety/YMYL review", launch: "Pilot one real market/client first" },
  { rank: 4, vertical: "Flood Restoration", leadValue: 10, urgency: 10, buyerDensity: 10, composite: 10, risk: "Standard service QA", launch: "Pilot one real market/client first" },
  { rank: 5, vertical: "Commercial Refrigeration Repair", leadValue: 10, urgency: 10, buyerDensity: 10, composite: 10, risk: "Standard service QA", launch: "Pilot one real market/client first" },
  { rank: 6, vertical: "Emergency Roofing", leadValue: 10, urgency: 10, buyerDensity: 9, composite: 9.7, risk: "Standard service QA", launch: "Pilot one real market/client first" },
  { rank: 7, vertical: "Emergency Plumbing", leadValue: 10, urgency: 10, buyerDensity: 9, composite: 9.7, risk: "Standard service QA", launch: "Pilot one real market/client first" },
  { rank: 8, vertical: "Emergency HVAC Repair", leadValue: 10, urgency: 10, buyerDensity: 9, composite: 9.7, risk: "Standard service QA", launch: "Pilot one real market/client first" },
  { rank: 9, vertical: "Emergency Electrical", leadValue: 10, urgency: 10, buyerDensity: 9, composite: 9.7, risk: "Standard service QA", launch: "Pilot one real market/client first" },
  { rank: 10, vertical: "Emergency Locksmith", leadValue: 8, urgency: 10, buyerDensity: 9, composite: 9.0, risk: "Standard service QA", launch: "Pilot one real market/client first" },
  { rank: 11, vertical: "Emergency Tree Removal", leadValue: 9, urgency: 10, buyerDensity: 8, composite: 9.0, risk: "Standard service QA", launch: "Pilot one real market/client first" },
  { rank: 12, vertical: "Emergency Pest Control", leadValue: 8, urgency: 10, buyerDensity: 9, composite: 9.0, risk: "Standard service QA", launch: "Pilot one real market/client first" },
  { rank: 13, vertical: "Emergency Water Heater", leadValue: 9, urgency: 10, buyerDensity: 8, composite: 9.0, risk: "Standard service QA", launch: "Pilot one real market/client first" },
  { rank: 14, vertical: "Emergency Sewage Cleanup", leadValue: 10, urgency: 10, buyerDensity: 7, composite: 9.0, risk: "Extra safety/YMYL review", launch: "Pilot one real market/client first" },
  { rank: 15, vertical: "Emergency Gas Leak Repair", leadValue: 10, urgency: 10, buyerDensity: 7, composite: 9.0, risk: "Extra safety/YMYL review", launch: "Pilot one real market/client first" },
];

// ============================================================================
// 03 — TOP 78 URL OPPORTUNITIES (from Lead URL Opportunity Workbook)
// ============================================================================
export const URL_OPPORTUNITIES = [
  { rank: 1, vertical: "Home Emergency", service: "Storm Damage Restoration", buyer: "Roofing/restoration contractors", nearme: "stormdamagerepairnearme.com", pattern: "/{country}/{region}/{city}/storm-damage-repair/", urgency: 10, buyerValue: 10, cpc: 10.7, cpl: 228.15, tier: 1, deploy: "Hub subfolder first; standalone domain only after proof" },
  { rank: 2, vertical: "Home Services", service: "Roof Replacement", buyer: "Roofing contractors", nearme: "roofreplacementnearme.com", pattern: "/{country}/{region}/{city}/roof-replacement/", urgency: 8, buyerValue: 10, cpc: 10.7, cpl: 228.15, tier: 1, deploy: "Hub subfolder first; standalone domain only after proof" },
  { rank: 3, vertical: "Home Emergency", service: "Emergency Roof Leak Repair", buyer: "Roofing contractors", nearme: "emergencyroofleakrepairnearme.com", pattern: "/{country}/{region}/{city}/emergency-roof-leak-repair/", urgency: 10, buyerValue: 8, cpc: 10.7, cpl: 228.15, tier: 1, deploy: "Hub subfolder first; standalone domain only after proof" },
  { rank: 4, vertical: "Home Emergency", service: "Emergency Plumber", buyer: "Plumbing companies", nearme: "emergencyplumbernearme.com", pattern: "/{country}/{region}/{city}/emergency-plumber/", urgency: 10, buyerValue: 8, cpc: 10.49, cpl: 129.02, tier: 1, deploy: "Hub subfolder first; standalone domain only after proof" },
  { rank: 5, vertical: "Home Emergency", service: "Emergency HVAC Repair", buyer: "HVAC contractors", nearme: "emergencyhvacrepairnearme.com", pattern: "/{country}/{region}/{city}/emergency-hvac-repair/", urgency: 10, buyerValue: 8, cpc: 9.68, cpl: 127.74, tier: 1, deploy: "Hub subfolder first; standalone domain only after proof" },
  { rank: 6, vertical: "Home Emergency", service: "Emergency Electrician", buyer: "Electrical contractors", nearme: "emergencyelectriciannearme.com", pattern: "/{country}/{region}/{city}/emergency-electrician/", urgency: 10, buyerValue: 8, cpc: 9.5, cpl: 120.0, tier: 1, deploy: "Hub subfolder first; standalone domain only after proof" },
  { rank: 7, vertical: "Home Services", service: "Epoxy Flooring", buyer: "Epoxy/concrete contractors", nearme: "epoxyflooringnearme.com", pattern: "/{country}/{region}/{city}/epoxy-flooring/", urgency: 5, buyerValue: 9, cpc: 8.5, cpl: 95.0, tier: 1, deploy: "Hub subfolder first; standalone domain only after proof" },
  { rank: 8, vertical: "Home Services", service: "Concrete Polishing", buyer: "Concrete contractors", nearme: "concretepolishingnearme.com", pattern: "/{country}/{region}/{city}/concrete-polishing/", urgency: 5, buyerValue: 8, cpc: 7.8, cpl: 85.0, tier: 1, deploy: "Hub subfolder first; standalone domain only after proof" },
  { rank: 9, vertical: "Legal", service: "Personal Injury Lawyer", buyer: "Law firms", nearme: "personalinjurylawyernearme.com", pattern: "/{country}/{region}/{city}/personal-injury-lawyer/", urgency: 7, buyerValue: 10, cpc: 15.0, cpl: 300.0, tier: 1, deploy: "Hub subfolder first; standalone domain only after proof" },
  { rank: 10, vertical: "Healthcare", service: "Emergency Dentist", buyer: "Dental practices", nearme: "emergencydentistnearme.com", pattern: "/{country}/{region}/{city}/emergency-dentist/", urgency: 10, buyerValue: 8, cpc: 8.0, cpl: 150.0, tier: 1, deploy: "Hub subfolder first; standalone domain only after proof" },
];

// ============================================================================
// 04 — TOP 150 CORE SERVICES (from Top 300 NearMe/NearYou workbook)
// ============================================================================
export const CORE_SERVICES = [
  { rank: 1, service: "Plumber", slug: "plumber", vertical: "home_repair", tier: 1, priority: "P0", monthlySearch: 2400000, leadValue: 350, emergency: true, pmax2026: true },
  { rank: 2, service: "Electrician", slug: "electrician", vertical: "home_repair", tier: 1, priority: "P0", monthlySearch: 1800000, leadValue: 400, emergency: true, pmax2026: true },
  { rank: 3, service: "HVAC / AC Repair", slug: "hvacrepair", vertical: "home_repair", tier: 1, priority: "P0", monthlySearch: 1500000, leadValue: 500, emergency: true, pmax2026: true },
  { rank: 4, service: "Roofer", slug: "roofer", vertical: "home_repair", tier: 1, priority: "P0", monthlySearch: 1200000, leadValue: 800, emergency: true, pmax2026: true },
  { rank: 5, service: "Dentist", slug: "dentist", vertical: "health", tier: 1, priority: "P0", monthlySearch: 1100000, leadValue: 300, emergency: false, pmax2026: false },
  { rank: 6, service: "Landscaping", slug: "landscaping", vertical: "home_services", tier: 1, priority: "P0", monthlySearch: 900000, leadValue: 250, emergency: false, pmax2026: true },
  { rank: 7, service: "Pest Control", slug: "pestcontrol", vertical: "home_repair", tier: 1, priority: "P0", monthlySearch: 850000, leadValue: 200, emergency: false, pmax2026: true },
  { rank: 8, service: "House Cleaning", slug: "housecleaning", vertical: "home_services", tier: 1, priority: "P0", monthlySearch: 800000, leadValue: 150, emergency: false, pmax2026: true },
  { rank: 9, service: "Appliance Repair", slug: "appliancerepair", vertical: "home_repair", tier: 1, priority: "P0", monthlySearch: 750000, leadValue: 180, emergency: true, pmax2026: true },
  { rank: 10, service: "Moving Company", slug: "movingcompany", vertical: "home_services", tier: 1, priority: "P0", monthlySearch: 700000, leadValue: 450, emergency: false, pmax2026: true },
  { rank: 11, service: "Epoxy Flooring", slug: "epoxyflooring", vertical: "home_improvement", tier: 1, priority: "P0", monthlySearch: 450000, leadValue: 600, emergency: false, pmax2026: false },
  { rank: 12, service: "Concrete Polishing", slug: "concretepolishing", vertical: "home_improvement", tier: 1, priority: "P0", monthlySearch: 350000, leadValue: 550, emergency: false, pmax2026: false },
  { rank: 13, service: "Water Damage Restoration", slug: "waterdamagerestoration", vertical: "home_emergency", tier: 1, priority: "P0", monthlySearch: 500000, leadValue: 1200, emergency: true, pmax2026: false },
  { rank: 14, service: "Fire Damage Restoration", slug: "firedamagerestoration", vertical: "home_emergency", tier: 1, priority: "P0", monthlySearch: 300000, leadValue: 1500, emergency: true, pmax2026: false },
  { rank: 15, service: "Mold Remediation", slug: "moldremediation", vertical: "home_emergency", tier: 1, priority: "P0", monthlySearch: 400000, leadValue: 900, emergency: true, pmax2026: false },
  { rank: 16, service: "Solar Installation", slug: "solarinstallation", vertical: "home_improvement", tier: 1, priority: "P0", monthlySearch: 600000, leadValue: 2000, emergency: false, pmax2026: false },
  { rank: 17, service: "Window Replacement", slug: "windowreplacement", vertical: "home_improvement", tier: 1, priority: "P0", monthlySearch: 500000, leadValue: 700, emergency: false, pmax2026: false },
  { rank: 18, service: "Garage Door Repair", slug: "garagedoorrepair", vertical: "home_repair", tier: 1, priority: "P0", monthlySearch: 550000, leadValue: 300, emergency: true, pmax2026: false },
  { rank: 19, service: "Fence Installation", slug: "fenceinstallation", vertical: "home_services", tier: 1, priority: "P0", monthlySearch: 400000, leadValue: 400, emergency: false, pmax2026: false },
  { rank: 20, service: "Painting", slug: "painting", vertical: "home_services", tier: 1, priority: "P0", monthlySearch: 650000, leadValue: 350, emergency: false, pmax2026: false },
];

// ============================================================================
// 05 — RISK REGISTER (from Forensic Blueprint sheet 14)
// ============================================================================
export const RISK_REGISTER = [
  { id: "R01", risk: "Base44 vendor coupling", severity: "CRITICAL", mitigation: "Extract job/data/service interfaces; retain donor snapshot", gate: "Nonprod migration proof" },
  { id: "R02", risk: "Mass-pages spam/doorway", severity: "CRITICAL", mitigation: "Per-page unique proof and documented benefit, reject swaps", gate: "Publisher blocks low-value pages" },
  { id: "R03", risk: "Queue entries mistaken for live sites", severity: "HIGH", mitigation: "Separate QUEUED/BUILT/PREVIEW/LIVE", gate: "Deployment receipt+health readback" },
  { id: "R04", risk: "GPT auth token cross-tenant risk", severity: "HIGH", mitigation: "Scoped OAuth/service credentials; signing, replay prevention", gate: "Security review" },
  { id: "R05", risk: "Potential unsanitized HTML injection", severity: "HIGH", mitigation: "Escape/sanitize, CSP, SSR templates, security tests", gate: "Static renderer adversarial QA" },
  { id: "R06", risk: "Unverified live deployments", severity: "HIGH", mitigation: "Require deploy receipt and health readback", gate: "Receipt before LIVE status" },
  { id: "R07", risk: "Fabricated search volume/CPC", severity: "HIGH", mitigation: "Use only first-party GSC/Ads data; mark estimates as estimates", gate: "Data provenance audit" },
  { id: "R08", risk: "Doorway city/domain network", severity: "CRITICAL", mitigation: "Each page must have unique value beyond token swaps", gate: "Differentiation gate per page" },
  { id: "R09", risk: "Fake reviews/testimonials", severity: "HIGH", mitigation: "Only genuine attributable proof; no fabricated schema", gate: "Evidence verification" },
  { id: "R10", risk: "Cost overrun from unbounded generation", severity: "MEDIUM", mitigation: "Pilot before scale; tier models; cache research", gate: "Cost control review" },
  { id: "R11", risk: "Compliance violation (YMYL/legal/medical)", severity: "CRITICAL", mitigation: "Extra review for YMYL categories; disclaimers; jurisdiction checks", gate: "Compliance checklist pass" },
  { id: "R12", risk: "Index bloat from thin pages", severity: "MEDIUM", mitigation: "Generation gate + differentiation gate + noindex thin pages", gate: "Index quality audit" },
];

// ============================================================================
// 06 — QA GATES (from Forensic Blueprint sheet 15)
// ============================================================================
export const QA_GATES = [
  { gate: "Q1", test: "Source truth verified", criteria: "Canonical repo/team/branch/SHA and runtime match", owner: "Audit agent" },
  { gate: "Q2", test: "Tenant isolation", criteria: "Cross-tenant read/write denied", owner: "Security validator" },
  { gate: "Q3", test: "Pack replay", criteria: "Duplicate idempotency key yields one approved pack", owner: "API validator" },
  { gate: "Q4", test: "Queue scale", criteria: "1/10/100 job fixtures complete with no silent duplicates", owner: "Worker validator" },
  { gate: "Q5", test: "Visual quality", criteria: "Mobile/desktop, forms, CTA, accessibility and chosen lock", owner: "Visual validator" },
  { gate: "Q6", test: "Google compliance", criteria: "No doorway/scaled thin/stuffing/link scheme/cloaking", owner: "Compliance validator" },
  { gate: "Q7", test: "Content differentiation", criteria: "Each page adds meaningful value beyond token swaps", owner: "Content validator" },
  { gate: "Q8", test: "Structured data validity", criteria: "Valid LocalBusiness/Service/Breadcrumb; no invented ratings", owner: "Schema validator" },
  { gate: "Q9", test: "Technical SEO", criteria: "200/HTTPS/robots/meta/canonical/sitemap correct", owner: "Technical SEO validator" },
  { gate: "Q10", test: "Performance", criteria: "Core Web Vitals pass; no render-blocking; optimized images", owner: "Performance validator" },
  { gate: "Q11", test: "Accessibility", criteria: "WCAG 2.1 AA; keyboard nav; screen reader; contrast", owner: "Accessibility validator" },
  { gate: "Q12", test: "Conversion", criteria: "Forms work; CTAs clear; validation states present", owner: "UX validator" },
  { gate: "Q13", test: "Deployment receipt", criteria: "Live URL returns 200; health readback confirmed", owner: "Deployment validator" },
];

// ============================================================================
// 07 — AGENT SWARM (from Forensic Blueprint sheet 06)
// ============================================================================
export const AGENT_SWARM = [
  { role: "APEX supervisor", input: "Goals+receipts+approval registry", output: "Typed work packet+priority", authority: "Never self-approve, uses one scheduler", kpi: "Eligible work closure rate" },
  { role: "Forensics specialist", input: "Source SHA, browser pages", output: "Dependency graph, drift table", authority: "READ only", kpi: "Unresolved critical edges" },
  { role: "Market research", input: "First-party market evidence, SERPs", output: "Opportunity/intent clusters", authority: "No fabricated volume", kpi: "Qualified clusters" },
  { role: "Technical SEO", input: "Pages,sitemaps,GSC", output: "Issue+fix PR and indexability gate", authority: "No automatic production SEO mutations", kpi: "Valid indexable pages" },
  { role: "UX/visual", input: "Approved brand+tokens", output: "Responsive reference designs", authority: "No visual drift; original media rights", kpi: "WCAG+visual rubric" },
  { role: "Content generation", input: "Industry intelligence + brand", output: "14-section premium content", authority: "No fabricated proof; differentiation gate", kpi: "Content quality score" },
  { role: "Prompt validation", input: "Generated content + rubric", output: "Score + failure modes + fixes", authority: "Judge only; no self-approve", kpi: "Rubric pass rate" },
  { role: "Compliance validator", input: "Page + Google rules", output: "Compliance verdict + fixes", authority: "Block release on violation", kpi: "Zero violations shipped" },
  { role: "Deployment", input: "Approved site spec", output: "Deploy receipt + health readback", authority: "Preview only until approval", kpi: "Successful deploys" },
  { role: "Analytics", input: "GSC + GA4 + CRM", output: "Performance delta + insights", authority: "READ only", kpi: "Attributed conversions" },
];

// ============================================================================
// 08 — TEMPLATE LIBRARY FAMILIES (from Forensic Blueprint sheet 07)
// ============================================================================
export const TEMPLATE_FAMILIES = [
  { family: "Emergency lead", vertical: "Plumber, HVAC, Roofing", pattern: "White trust-first + urgent blue CTA", blocks: "Hero/call/trust/availability/area/process", cta: "Call now", dataReq: "Verified number, license, service hours", gate: "Claims and location ownership" },
  { family: "Premium craft", vertical: "Epoxy, concrete, remodeling", pattern: "White gallery, oversized photography, soft shadows", blocks: "Before-after, project proof, financing, quote", cta: "Get estimate", dataReq: "Real project images, pricing basis", gate: "Image rights and real portfolio" },
  { family: "Professional law", vertical: "Accident, estate planning", pattern: "Quiet typography, trust-first, accessibility", blocks: "Attorney bios, services, FAQs, consultation", cta: "Book consultation", dataReq: "Bar jurisdiction, disclaimers", gate: "Legal compliance and approvals" },
  { family: "Healthcare", vertical: "Dental, clinics", pattern: "Calm clean layouts, clear navigation", blocks: "Services, staff, insurance, appointment", cta: "Book visit", dataReq: "Credentials, accessibility", gate: "Medical and privacy review" },
  { family: "Home value", vertical: "Windows, solar, landscaping", pattern: "Comparison tool + benefit calculator", blocks: "Cost ranges, examples, reviews, financing", cta: "Get quote", dataReq: "Regional prices+disclosures", gate: "No fabricated savings" },
  { family: "Restoration", vertical: "Water/fire/mold damage", pattern: "24/7 dispatch + insurance workflow", blocks: "Emergency call, process, insurance, before-after", cta: "Call now", dataReq: "License, IICRC cert, insurance coordination", gate: "Claims accuracy and YMYL review" },
  { family: "Commercial B2B", vertical: "Commercial refrigeration, janitorial", pattern: "Case studies + ROI calculator", blocks: "Services, case studies, certifications, RFP", cta: "Request proposal", dataReq: "Real contracts, compliance certs", gate: "No fabricated case studies" },
  { family: "Auto repair", vertical: "Mechanic, transmission, body shop", pattern: "Diagnostic + transparent pricing", blocks: "Services, estimates, reviews, warranty", cta: "Get estimate", dataReq: "ASE certification, real pricing", gate: "No fabricated certifications" },
  { family: "Real estate", vertical: "Realtor, property management", pattern: "Listings + neighborhood guides", blocks: "Listings, agent bio, market stats, contact", cta: "View listings", dataReq: "MLS data, license, real market stats", gate: "MLS compliance and license" },
  { family: "Fitness/wellness", vertical: "Gym, yoga, personal training", pattern: "Class schedule + trial offer", blocks: "Classes, trainers, pricing, schedule, trial", cta: "Start free trial", dataReq: "Real class times, certified trainers", gate: "No fabricated results claims" },
];

// ============================================================================
// 09 — GOOGLE GROWTH PLAYBOOK (from Forensic Blueprint sheet 08)
// ============================================================================
export const GROWTH_PLAYBOOK = [
  { lever: "Site architecture", action: "Real entity/business, genuine distinct service areas, topical structure", gate: "Canonical ownership, no redirects to same endpoint", category: "Technical" },
  { lever: "Search intent", action: "Service+problem+geo landing matched to customer need", gate: "Human satisfaction and first-party proof", category: "Content" },
  { lever: "Programmatic quality", action: "Only create meaningful pages with unique evidence", gate: "Require local original proof; reject city swaps", category: "Spam policy" },
  { lever: "Structured data", action: "Accurate LocalBusiness/Service/Breadcrumb when eligible", gate: "Validate with rich result tools; no invented star ratings", category: "Structured" },
  { lever: "Sitemap/indexing", action: "Only canonical indexable 200 pages; accurate lastmod", gate: "Sitemap fetch, robots parity, no soft404", category: "Technical" },
  { lever: "Internal linking", action: "Natural descriptive anchors; browseable hierarchy", gate: "No orphaned URL farm; no huge keyword footer grids", category: "Technical" },
  { lever: "Content differentiation", action: "Each page adds meaningful value beyond token swaps", gate: "Unique-value layer present (real specifics, local, proof, utility)", category: "Content" },
  { lever: "Page experience", action: "Core Web Vitals, HTTPS, no intrusive interstitials", gate: "CWV pass; mobile-first complete", category: "Technical" },
  { lever: "E-E-A-T signals", action: "Real authorship, credentials, expertise, experience", gate: "Verifiable expertise; no fabricated credentials", category: "Content" },
  { lever: "Local prominence", action: "Real Google Business Profile, genuine reviews, accurate NAP", gate: "GBP verified; NAP consistent across web", category: "Local" },
  { lever: "Crawl efficiency", action: "Optimize crawl budget; remove thin/duplicate pages", gate: "No index bloat; clean sitemap", category: "Technical" },
  { lever: "Freshness", action: "Update content with new evidence; accurate lastmod", gate: "Content reflects current reality; no stale claims", category: "Content" },
  { lever: "Accessibility", action: "WCAG 2.1 AA; keyboard nav; screen reader; contrast", gate: "Accessibility audit pass", category: "Quality" },
  { lever: "Performance", action: "Optimize images, fonts, JS; lazy load; CDN", gate: "LCP < 2.5s; CLS < 0.1; INP < 200ms", category: "Technical" },
];

// ============================================================================
// 10 — SCALE STAGES (from Forensic Blueprint sheet 12)
// ============================================================================
export const SCALE_STAGES = [
  { wave: 0, scope: "1 real site", preconditions: "Verified owner, distinct service, real proof, approval", proof: "Preview and live deployment receipt; GSC/GA4 IDs", stop: "No real buyer/ownership", action: "Pilot only" },
  { wave: 1, scope: "10 service+location pages", preconditions: "All unique first-party value, 10 human checks", proof: "Technical QA and conversion baseline", stop: "Doorway risk, duplicates, 404", action: "Review wave 2" },
  { wave: 2, scope: "100 genuinely useful pages/sites", preconditions: "Reusable component QA, content sourcing, queue metrics", proof: "Indexed share, organic clicks and buyer outcomes", stop: "Spam signal or quality falloff", action: "Operator promotion" },
  { wave: 3, scope: "1,000+ quality pages/sites", preconditions: "Automated validation, tenant/site costs, monitoring", proof: "Cohort ROI and high-quality evidence", stop: "Cost/quality/SERP deterioration", action: "Human funding/release gate" },
  { wave: 4, scope: "Larger fleets", preconditions: "More tenants with real businesses, compliance, infrastructure", proof: "Independent audits and retention/unit economics", stop: "Any systemic breach or unbounded spend", action: "Constrained expansion" },
];

// ============================================================================
// 11 — COMPLIANCE CHECKLIST (from Master Workbook sheet 31)
// ============================================================================
export const COMPLIANCE_CHECKLIST = [
  { control: "Source truth complete", pass: "Client/service/location/proof/contact/permission verified" },
  { control: "Unique user value", pass: "Not token-swapped content" },
  { control: "People-first purpose", pass: "Useful even without search traffic" },
  { control: "No spam pattern", pass: "No doorway/scaled thin/stuffing/link scheme/cloaking" },
  { control: "Crawlability", pass: "200/robots/meta/canonical/internal link correct" },
  { control: "Structured data valid", pass: "Valid schema; no invented ratings" },
  { control: "Accessibility", pass: "WCAG 2.1 AA; keyboard; screen reader; contrast" },
  { control: "Performance", pass: "CWV pass; optimized images; no render-blocking" },
  { control: "Mobile-first", pass: "Mobile version complete and equivalent" },
  { control: "HTTPS", pass: "Valid TLS; no mixed content" },
  { control: "Content accuracy", pass: "No fabricated stats, reviews, or credentials" },
  { control: "Image rights", pass: "Licensed/original images; no stolen media" },
  { control: "Legal disclaimers", pass: "Jurisdiction-appropriate disclaimers for YMYL" },
  { control: "Privacy", pass: "Contact form privacy policy; GDPR/CCPA if applicable" },
  { control: "Sitemap accuracy", pass: "Only canonical 200 pages; accurate lastmod" },
];

// ============================================================================
// 12 — KPI SCORECARD (from Master Workbook sheet 27)
// ============================================================================
export const KPI_SCORECARD = [
  { category: "Coverage", kpi: "Published canonical pages", unit: "Count", cadence: "Daily" },
  { category: "Discovery", kpi: "Discovered URLs", unit: "Count", cadence: "Daily" },
  { category: "Crawl", kpi: "Crawled URLs", unit: "Count", cadence: "Daily" },
  { category: "Indexation", kpi: "Indexed eligible pages", unit: "%", cadence: "Daily" },
  { category: "Visibility", kpi: "Impressions", unit: "Count", cadence: "Daily" },
  { category: "Visibility", kpi: "Clicks", unit: "Count", cadence: "Daily" },
  { category: "Visibility", kpi: "Average position", unit: "Rank", cadence: "Daily" },
  { category: "Engagement", kpi: "Organic sessions", unit: "Count", cadence: "Daily" },
  { category: "Conversion", kpi: "Qualified leads", unit: "Count", cadence: "Daily" },
  { category: "Conversion", kpi: "Lead-to-close rate", unit: "%", cadence: "Weekly" },
  { category: "Revenue", kpi: "Revenue per lead", unit: "USD", cadence: "Weekly" },
  { category: "Revenue", kpi: "Cost per lead", unit: "USD", cadence: "Weekly" },
  { category: "Quality", kpi: "Content quality score", unit: "0-100", cadence: "Per release" },
  { category: "Quality", kpi: "Compliance pass rate", unit: "%", cadence: "Per release" },
  { category: "Performance", kpi: "LCP / CLS / INP", unit: "ms/score", cadence: "Per release" },
];

// ============================================================================
// 13 — DESIGN SYSTEM STYLES (from P0 Provisioning Checklist sheet 03)
// ============================================================================
export const DESIGN_STYLES = [
  { style: "Cinematic Editorial", bg: "#0D1018", fg: "#E8E9F2", accent: "#E3B778", font: "DM Sans", direction: "Big photography + elegant editorial typography" },
  { style: "Luxury Minimal", bg: "#101010", fg: "#F5F2EB", accent: "#C9A66B", font: "Manrope", direction: "Oversized negative space + restrained product detail" },
  { style: "Glass Command", bg: "#0B1231", fg: "#ECF3FF", accent: "#6CBEF4", font: "Inter", direction: "Glass panels and layered light gradients" },
  { style: "Bold Brutalist", bg: "#F2EDE2", fg: "#171717", accent: "#F66B39", font: "Space Grotesk", direction: "High contrast type and hard geometric sections" },
  { style: "Organic Modern", bg: "#F2F7F0", fg: "#19372A", accent: "#91A96B", font: "Outfit", direction: "Soft botanical forms and airy cards" },
  { style: "Tech Neon", bg: "#0A0E14", fg: "#E6F1FF", accent: "#00D4FF", font: "Inter", direction: "Glowing accents on dark with monospace data" },
  { style: "Warm Trust", bg: "#FAF7F2", fg: "#2D2A26", accent: "#D97757", font: "Plus Jakarta Sans", direction: "Approachable warmth with rounded geometry" },
  { style: "Clinical Clean", bg: "#FFFFFF", fg: "#1A1A2E", accent: "#3A86FF", font: "Inter", direction: "Medical-grade clarity with ample whitespace" },
  { style: "Industrial Bold", bg: "#1A1A1A", fg: "#F5F5F5", accent: "#FF6B00", font: "Archivo", direction: "Heavy industrial type with safety-orange accents" },
  { style: "Coastal Calm", bg: "#F0F4F8", fg: "#1B2A41", accent: "#3D8FB7", font: "Source Sans Pro", direction: "Soft blues and sandy neutrals with airy layout" },
];

// ============================================================================
// 14 — BUYER SEGMENTS (from Lead URL Opportunity Workbook)
// ============================================================================
export const BUYER_SEGMENTS = [
  { segment: "Emergency home services", why: "High urgency; calls convert quickly", model: "Per lead / booked call / exclusive territory", speed: "FAST", risk: "LOW-MED", motion: "Start here" },
  { segment: "High-ticket home improvement", why: "Large job values justify acquisition spend", model: "Exclusive lead / appointment / territory", speed: "FAST-MED", risk: "LOW-MED", motion: "Start here" },
  { segment: "Commercial B2B services", why: "High contract/LTV and recurring revenue", model: "Qualified appointment / account lead", speed: "MED", risk: "LOW-MED", motion: "Start after initial home-service proof" },
  { segment: "Legal", why: "Very high case value", model: "Qualified lead / call / signed-case economics", speed: "MED", risk: "MED", motion: "High value; stricter quality controls" },
  { segment: "Dental/medical", why: "High patient procedure value", model: "Qualified patient / appointment", speed: "MED", risk: "MED-HIGH", motion: "Use healthcare compliance review" },
];

// ============================================================================
// 15 — SERVICE FUNNELS (from Master Workbook sheet 06)
// ============================================================================
export const SERVICE_FUNNELS = [
  { funnel: "Emergency Direct Response", layout: "Problem -> immediate credibility -> call/dispatch CTA -> proof -> service area -> FAQ -> CTA", cta: "Call now / dispatch now" },
  { funnel: "Quote-first", layout: "Value prop -> instant quote/estimate -> qualification -> proof -> schedule", cta: "Get quote" },
  { funnel: "Book-now", layout: "Availability -> service -> times -> proof -> booking", cta: "Book now" },
  { funnel: "Call-first local", layout: "Local promise -> click-to-call -> trust strip -> services -> coverage -> FAQ", cta: "Call now" },
  { funnel: "Diagnostic quiz", layout: "Symptom selector -> likely issue -> next step -> lead capture", cta: "Diagnose my issue" },
  { funnel: "Comparison", layout: "Options -> comparison table -> recommendation -> proof -> CTA", cta: "See recommendation" },
  { funnel: "Cost calculator", layout: "Cost factors -> interactive calculator -> estimate -> qualification -> CTA", cta: "Get my estimate" },
  { funnel: "Portfolio showcase", layout: "Gallery -> project details -> results -> social proof -> inquiry", cta: "View portfolio" },
];

// ============================================================================
// 16 — PERSISTENCE AUTOMATION (from Master Workbook sheet 21)
// ============================================================================
export const PERSISTENCE_RULES = [
  { component: "Heartbeat", rule: "One authoritative scheduler; avoid cron forests" },
  { component: "Queue", rule: "Every job has mission/project/capability/action/priority/source refs" },
  { component: "Lease", rule: "Worker claims job with expiry; stale leases recover" },
  { component: "Idempotency", rule: "Stable key prevents duplicate generation/publishing/submission" },
  { component: "Retry budget", rule: "Bounded retries/backoff; exhausted work -> incident/dead-letter" },
  { component: "Receipt", rule: "Every completed action produces immutable evidence receipt" },
  { component: "Validator", rule: "Independent validator re-fetches and confirms; no self-validation" },
  { component: "Approval", rule: "Protected actions require explicit human/operator approval" },
  { component: "Audit trail", rule: "Every state transition logged with actor/timestamp/evidence" },
  { component: "Cost control", rule: "Pilot before scale; tier models; cache research; batch requests" },
];

// ============================================================================
// 17 — EVIDENCE POLICY (from P0 Provisioning Checklist sheet 05)
// ============================================================================
export const EVIDENCE_POLICY = [
  { rule: "Site quantity is not a ranking proxy", action: "Simulate possible fleet, index only pages with distinct verified value" },
  { rule: "100 percent perfect is not provable", action: "Test all declared executable gates, disclose unknowns; three fresh full test passes" },
  { rule: "Independent QA", action: "Another identity/process re-fetches immutable SHA and produces receipt" },
  { rule: "Templates", action: "20 curated styles != 20 functional industry sites; no fake completed count" },
  { rule: "Video", action: "30 generator briefs are not 30 final produced videos" },
  { rule: "Search volume", action: "Estimates are estimates; populate from GSC/Ads before scaling" },
  { rule: "Deployments", action: "Queue entries are not live sites; require deploy receipt + health readback" },
  { rule: "No ranking guarantee", action: "Local ranking depends on relevance, distance, prominence; no paid/requested organic guarantee" },
];

// ============================================================================
// 18 — GPT SYNC API CONTRACT (from Forensic Blueprint sheet 09)
// ============================================================================
export const GPT_SYNC_API = [
  { method: "POST", endpoint: "/v1/packs", scope: "pack:write", contract: "PackV1{id,tenant_id,template_key,version,kind,content_hash,payload}", proof: "202 accepted, receipt_id; status PENDING_REVIEW", security: "Idempotency-Key + tenant scoped token; no direct prod publish" },
  { method: "GET", endpoint: "/v1/packs/{id}", scope: "pack:read", contract: "tenant scoped ID", proof: "pack metadata/version/validation", security: "RLS and access log" },
  { method: "POST", endpoint: "/v1/site-specs", scope: "site:write", contract: "SiteSpecV1{template_version,brand,service,location,evidence,sections}", proof: "SiteSpec ID and schema report", security: "Generate only draft" },
  { method: "POST", endpoint: "/v1/jobs", scope: "job:create", contract: "JobV1{tenant_id,site_spec_ids,target:preview,budget}", proof: "202 queue IDs + approved work packet", security: "Rate caps + approval reference" },
  { method: "GET", endpoint: "/v1/jobs/{id}", scope: "job:read", contract: "tenant scoped ID", proof: "state, receipts, errors, deployment URL", security: "No guessed success" },
];

// ============================================================================
// 19 — CONTENT DIFFERENTIATION LAYERS (from Master Workbook sheet 11)
// ============================================================================
export const DIFFERENTIATION_LAYERS = [
  { layer: "Real service specifics", examples: "Methods, equipment, materials, exclusions, response sequence", requirement: "Required" },
  { layer: "Real local specifics", examples: "Coverage, arrival logic, climate/permit/property context", requirement: "Required on location pages" },
  { layer: "Proof", examples: "Photos, cases, credentials, warranty, SLAs, measurements", requirement: "Strong" },
  { layer: "Interactive utility", examples: "Estimator, diagnostic, checklist, availability, calculator", requirement: "High leverage" },
  { layer: "Expert insight", examples: "Inspection points, failure modes, decision criteria", requirement: "High leverage" },
  { layer: "Pricing transparency", examples: "Cost ranges, factors, financing options, no hidden fees", requirement: "High leverage" },
  { layer: "Process clarity", examples: "Step-by-step workflow, timelines, what to expect", requirement: "Required" },
  { layer: "FAQ depth", examples: "5-8 real questions with expert answers", requirement: "Required (SEO+AEO)" },
];

// ============================================================================
// 20 — TECHNICAL SEO QA (from Master Workbook sheet 10)
// ============================================================================
export const TECHNICAL_SEO_QA = [
  { check: "HTTP", pass: "Canonical indexable URL returns 200", gate: "Block release" },
  { check: "HTTPS", pass: "Valid TLS; no mixed content", gate: "Block release" },
  { check: "Robots", pass: "Not blocked if page should index", gate: "Block release" },
  { check: "Meta robots", pass: "Correct index/noindex class", gate: "Block release" },
  { check: "Canonical", pass: "Correct representative URL", gate: "Block release" },
  { check: "Title", pass: "Unique, descriptive, <60 chars, intent-matched", gate: "Block release" },
  { check: "Meta description", pass: "Unique, <155 chars, compelling", gate: "Warn" },
  { check: "H1", pass: "Single H1, aligned to title and intent", gate: "Block release" },
  { check: "Headings", pass: "Logical H1-H6 hierarchy", gate: "Warn" },
  { check: "Images", pass: "Alt text present, optimized, lazy-loaded", gate: "Warn" },
  { check: "Internal links", pass: "Descriptive anchors, browseable hierarchy", gate: "Warn" },
  { check: "Structured data", pass: "Valid schema, no errors in Rich Results Test", gate: "Block release" },
  { check: "Sitemap", pass: "Canonical URLs only, accurate lastmod", gate: "Block release" },
  { check: "Mobile", pass: "Mobile-first complete and equivalent", gate: "Block release" },
  { check: "Core Web Vitals", pass: "LCP<2.5s, CLS<0.1, INP<200ms", gate: "Block release" },
  { check: "Accessibility", pass: "WCAG 2.1 AA pass", gate: "Block release" },
  { check: "No spam patterns", pass: "No doorway/thin/stuffing/cloaking", gate: "Block release" },
  { check: "Content quality", pass: "Differentiation gate passed; unique value present", gate: "Block release" },
];

// ============================================================================
// META — Source Registry
// ============================================================================
export const SOURCE_REGISTRY = {
  forensicBlueprint: { artifact: "APEX_DIGITAL_DOMINANCE_FORENSIC_MASTER_BLUEPRINT_2026-10-10.xlsx", sheets: 21, status: "VERIFIED_LOCAL" },
  leadUrlWorkbook: { artifact: "Digital_Dominance_Lead_URL_Opportunity_Workbook.xlsx", sheets: 8, status: "VERIFIED_LOCAL" },
  masterWorkbook: { artifact: "Digital_Dominance_Master_Workbook.xlsx", sheets: 34, status: "VERIFIED_LOCAL" },
  p0Checklist: { artifact: "DIGITAL_DOMINANCE_P0_MASTER_PROVISIONING_CHECKLIST_2026-10-10.xlsx", sheets: 6, status: "VERIFIED_LOCAL" },
  top300: { artifact: "Digital_Dominance_Top_300_NearMe_NearYou.xlsx", sheets: 3, status: "VERIFIED_LOCAL" },
  top100Portfolio: { artifact: "TOP_100_SERVICE_PORTFOLIO.md", status: "VERIFIED_LOCAL" },
  v1Zip: { artifact: "DIGITAL-DOMINANCE-V1.zip", entries: 975, bytes: 2301802, status: "VERIFIED_LOCAL" },
};

// ============================================================================
// COMPLIANCE PROMPT INJECTION — Used by the website generator
// ============================================================================
export const GOOGLE_COMPLIANCE_PROMPT = `
GOOGLE PROGRAMMATIC SEO COMPLIANCE MANDATE (100% STANDARDS):
This content MUST comply with ALL Google spam policies and helpful content guidelines:

1. PEOPLE-FIRST: Create content for users, not search engines. Every section must provide genuine value even without search traffic.
2. NO DOORWAY PAGES: Each page must have unique value beyond service/city token swaps. Reject city-swap-only pages.
3. NO SCALED THIN CONTENT: Do not mass-generate unoriginal pages. Every page must have real, differentiated content.
4. NO KEYWORD STUFFING: Use natural language. No unnatural repetition or hidden keyword blocks.
5. NO FAKE PROOF: No fabricated reviews, testimonials, stats, credentials, or locations. Only use real, verifiable evidence.
6. E-E-A-T: Demonstrate real Experience, Expertise, Authoritativeness, Trustworthiness. Use real credentials and expertise.
7. SEARCH INTENT MATCH: Content must match what users actually need when they search for this service in this location.
8. STRUCTURED DATA ACCURACY: Only use LocalBusiness/Service/Breadcrumb schema with real, verifiable data. No invented star ratings.
9. CONTENT DIFFERENTIATION: Each page must include: real service specifics, real local specifics, proof, interactive utility, expert insight.
10. TRANSPARENCY: Real pricing logic, real process, real timelines. No fabricated savings or guarantees.

CONTENT QUALITY BAR (multi-million-dollar agency standard):
- 14 distinct sections with full content depth (not placeholders)
- 3-6 service descriptions with real benefits (not generic)
- 3-5 testimonial quotes with names, companies, ratings (real only)
- 5-8 FAQ questions with expert answers (not generic)
- 3 pricing tiers with real feature lists
- 3-4 stats with real numbers (verified, not fabricated)
- Trust signals: licenses, certifications, warranties, guarantees (real only)
- Conversion engineering: multiple CTAs at scroll intervals, clear next steps
- Visual richness: gradients, glassmorphism, shadow depth, pattern backgrounds
- Micro-interactions: hover lifts, scroll fades, accordion states
- Design system consistency: type scale, spacing scale, shadow system, radius system
- Mobile-first responsive: complete and equivalent mobile experience
- Accessibility: WCAG 2.1 AA, keyboard nav, screen reader, contrast

INDUSTRY-SPECIFIC DEPTH:
Use the industry intelligence library to generate content that demonstrates real expertise:
- Industry-specific terminology and processes
- Real pain points and solutions
- Industry-specific trust signals and certifications
- Industry-specific compliance requirements
- Industry-specific pricing models
- Industry-specific FAQ patterns

ANTI-PATTERN CHECKLIST (automatically reject if any present):
[ ] Token-swapped city/service pages with no unique value
[ ] Generic placeholder text ("Lorem ipsum", "Your text here")
[ ] Fabricated statistics or review counts
[ ] Invented business credentials or licenses
[ ] Doorway pages funneling to one destination
[ ] Keyword-stuffed headings or content
[ ] Cloaked or sneaky redirect content
[ ] Thin pages with minimal content
`;