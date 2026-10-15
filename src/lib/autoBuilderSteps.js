// Auto Builder step library + proven vision catalog + addon catalog + accent palette.
// Single source of truth for the guided journey timeline and the strategy addons.

import {
  FolderPlus, Eye, Compass, PenTool, Shirt, Globe, Share2, Rocket,
} from "lucide-react";

// The full intended journey. Steps beyond "strategy" are staged for later turns —
// they render in the timeline as "coming soon" so the path is visible end-to-end.
export const AUTO_STEPS = [
  { key: "project",  label: "Project",   icon: FolderPlus, ready: true },
  { key: "vision",   label: "Vision",    icon: Eye,        ready: true },
  { key: "strategy", label: "Strategy",  icon: Compass,    ready: true },
  { key: "name",     label: "Name & Domain", icon: PenTool, ready: false },
  { key: "brand",    label: "Brand",     icon: Shirt,      ready: false },
  { key: "website",  label: "Website",   icon: Globe,     ready: false },
  { key: "social",   label: "Social",    icon: Share2,    ready: false },
  { key: "launch",   label: "Launch",    icon: Rocket,    ready: false },
];

// 10 proven, most-desired vision starting points.
export const PROVEN_VISIONS = [
  { type: "Build a Website",          icon: Globe,   blurb: "A high-performance website that converts visitors into leads." },
  { type: "Start a Business",         icon: Rocket,  blurb: "A full new venture — brand, site, systems and go-to-market." },
  { type: "Start a Social Media System", icon: Share2, blurb: "An automated content + scheduling engine across channels." },
  { type: "Build a SaaS System",      icon: Compass, blurb: "A software product with auth, billing and a user dashboard." },
  { type: "Build an Ecomm Business",  icon: Shirt,   blurb: "An online store with products, checkout and fulfillment." },
  { type: "Launch an Agency",         icon: FolderPlus, blurb: "A client services agency with intake, delivery and reporting." },
  { type: "Build an App",             icon: PenTool, blurb: "A mobile-first app with onboarding and core flows." },
  { type: "Start a Podcast",          icon: Eye,     blurb: "A show with publishing, clips and audience growth." },
  { type: "Open a Local Service",     icon: Share2,  blurb: "A local service business with booking and lead capture." },
  { type: "Create a Personal Brand",  icon: Rocket,  blurb: "A personal brand site, content and monetization system." },
];

// Capability addons offered on the strategy step (the checklist you described).
export const ADDON_CATALOG = [
  { key: "digital_business_card",  label: "Digital Business Card" },
  { key: "digital_flyers",         label: "Digital Flyers" },
  { key: "social_media_assets",    label: "Social Media Assets" },
  { key: "seo",                    label: "SEO Enhancements" },
  { key: "geo",                    label: "GEO (Local) Enhancements" },
  { key: "aeo",                    label: "AEO (Answer Engine) Enhancements" },
  { key: "mass_launch",           label: "Mass Launch System (Digital Domination)" },
  { key: "auto_backlinking",       label: "Auto Backlinking Network" },
  { key: "google_workspace",       label: "Google Workspace Sync (Gmail, Drive, Calendar, Vault)" },
  { key: "super_agent_team",       label: "Super Agent Team" },
  { key: "admin_client_portal",    label: "Admin & Client Portal" },
  { key: "payment_stripe",         label: "Payment System (Stripe)" },
  { key: "ai_sms_mms",             label: "AI SMS / MMS" },
  { key: "ai_voice",               label: "AI Voice" },
  { key: "ai_email",               label: "AI Email (Outbound + Inbound)" },
  { key: "ecom_saas_dropship",     label: "Ecom / SaaS / Dropship Modules" },
];

// Accent color palette — flows through every generation step.
export const ACCENT_COLORS = [
  { name: "Cyan",   value: "#00d4ff" },
  { name: "Blue",   value: "#3b82f6" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Violet", value: "#8b5cf6" },
  { name: "Emerald",value: "#10b981" },
  { name: "Amber",  value: "#f59e0b" },
  { name: "Rose",   value: "#f43f5e" },
  { name: "Orange", value: "#f97316" },
];