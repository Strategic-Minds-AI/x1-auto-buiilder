/**
 * CANONICAL INDUSTRY REGISTRY
 * Source truth for all industry classification across the factory.
 * Extensible — new families added here propagate to generators, agents, and libraries.
 *
 * Each family has:
 *   - stable_id: never changes, used as foreign key
 *   - name: display label
 *   - sub_industries: array of niches with their own intelligence profiles
 *   - urgency_score: 1-5 how time-sensitive leads typically are
 *   - lead_value: average lead value range (low/medium/high/premium)
 *   - buyer_density: 1-5 how concentrated the buyer pool is
 *   - digital_maturity: 1-5 how sophisticated the typical web presence is
 *   - recommended_platforms: platform_pack stable_ids from platformRegistry
 *   - visual_dna_hints: art direction guidance for the TemplateGenome engine
 */

export const INDUSTRY_FAMILIES = [
  {
    stable_id: "home-services",
    name: "Home Services & Contractors",
    sub_industries: [
      "roofing", "hvac", "plumbing", "electrical", "epoxy-flooring",
      "painting", "landscaping", "pools", "concrete", "pest-control",
      "cleaning", "restoration", "garage-doors", "windows", "siding",
      "insulation", "fencing", "decking", "gutters", "tree-service",
    ],
    urgency_score: 5,
    lead_value: "high",
    buyer_density: 4,
    digital_maturity: 2,
    recommended_platforms: ["lead-gen-funnel", "service-marketplace", "multi-location", "quote-estimator-funnel"],
    visual_dna_hints: {
      energy: "confident-reliable",
      palette_tendency: "warm-trust",
      hero_archetype: "immersive-image",
      trust_architecture: "license-insurance-warranty",
      conversion_pattern: "quote-form-primary",
    },
  },
  {
    stable_id: "construction-remodeling",
    name: "Construction & Remodeling",
    sub_industries: [
      "general-contracting", "kitchen-remodel", "bathroom-remodel",
      "additions", "custom-homes", "commercial-construction",
      "renovation", "drywall", "flooring", "tile-stone",
      "cabinetry", "countertops", "framing", "roofing-construction",
    ],
    urgency_score: 3,
    lead_value: "premium",
    buyer_density: 3,
    digital_maturity: 3,
    recommended_platforms: ["premium-marketing-site", "portfolio", "quote-estimator-funnel", "project-portal"],
    visual_dna_hints: {
      energy: "premium-craftsmanship",
      palette_tendency: "earth-architectural",
      hero_archetype: "cinematic",
      trust_architecture: "portfolio-process-warranty",
      conversion_pattern: "consultation-booking",
    },
  },
  {
    stable_id: "real-estate",
    name: "Real Estate & Property Services",
    sub_industries: [
      "residential-brokerage", "commercial-brokerage", "property-management",
      "rentals", "apartments", "luxury-homes", "new-construction",
      "investment-properties", "relocation", "title-escrow", "appraisal",
      "home-inspection", "hoa-management",
    ],
    urgency_score: 3,
    lead_value: "premium",
    buyer_density: 4,
    digital_maturity: 4,
    recommended_platforms: ["real-estate-search", "premium-marketing-site", "client-portal", "marketplace"],
    visual_dna_hints: {
      energy: "aspirational-editorial",
      palette_tendency: "neutral-luxury",
      hero_archetype: "immersive-image",
      trust_architecture: "credentials-listings-testimonials",
      conversion_pattern: "search-inquiry",
    },
  },
  {
    stable_id: "legal-services",
    name: "Legal Services",
    sub_industries: [
      "personal-injury", "family-law", "criminal-defense", "estate-planning",
      "corporate-law", "immigration", "bankruptcy", "workers-comp",
      "medical-malpractice", "tax-law", "real-estate-law", "ip-law",
    ],
    urgency_score: 5,
    lead_value: "premium",
    buyer_density: 3,
    digital_maturity: 3,
    recommended_platforms: ["premium-marketing-site", "lead-gen-funnel", "intake-form-funnel", "client-portal"],
    visual_dna_hints: {
      energy: "authoritative-trustworthy",
      palette_tendency: "navy-gold-classic",
      hero_archetype: "editorial",
      trust_architecture: "bar-admissions-verdicts-media",
      conversion_pattern: "free-consultation",
    },
  },
  {
    stable_id: "healthcare-medical",
    name: "Healthcare & Medical",
    sub_industries: [
      "primary-care", "urgent-care", "pediatrics", "internal-medicine",
      "cardiology", "orthopedics", "dermatology", "ophthalmology",
      "mental-health", "physical-therapy", "chiropractic", "telemedicine",
    ],
    urgency_score: 4,
    lead_value: "medium",
    buyer_density: 5,
    digital_maturity: 4,
    recommended_platforms: ["premium-marketing-site", "booking-funnel", "patient-portal", "marketplace"],
    visual_dna_hints: {
      energy: "calm-professional-clean",
      palette_tendency: "soft-clinical-blues",
      hero_archetype: "social-proof",
      trust_architecture: "board-certifications-accreditations",
      conversion_pattern: "appointment-booking",
    },
  },
  {
    stable_id: "dental-orthodontics",
    name: "Dental & Orthodontics",
    sub_industries: [
      "general-dentistry", "cosmetic-dentistry", "orthodontics",
      "pediatric-dentistry", "oral-surgery", "periodontics",
      "endodontics", "dental-implants", "clear-aligners", "emergency-dental",
    ],
    urgency_score: 3,
    lead_value: "high",
    buyer_density: 5,
    digital_maturity: 4,
    recommended_platforms: ["premium-marketing-site", "booking-funnel", "patient-portal", "membership-platform"],
    visual_dna_hints: {
      energy: "warm-welcoming-modern",
      palette_tendency: "fresh-whites-soft-blues",
      hero_archetype: "social-proof",
      trust_architecture: "before-after-smiles-credentials",
      conversion_pattern: "new-patient-special",
    },
  },
  {
    stable_id: "beauty-spa-wellness",
    name: "Beauty, Spa & Wellness",
    sub_industries: [
      "med-spa", "hair-salon", "nail-salon", "barber", "massage-therapy",
      "facials", "laser-hair-removal", "botox-fillers", "tattoo",
      "piercing", "makeup", "waxing", "wellness-coaching", "yoga-studio",
    ],
    urgency_score: 2,
    lead_value: "medium",
    buyer_density: 5,
    digital_maturity: 4,
    recommended_platforms: ["premium-marketing-site", "booking-funnel", "membership-platform", "ecommerce"],
    visual_dna_hints: {
      energy: "sensuous-aspirational",
      palette_tendency: "soft-pastels-warm-tones",
      hero_archetype: "immersive-image",
      trust_architecture: "before-after-reviews-certifications",
      conversion_pattern: "online-booking",
    },
  },
  {
    stable_id: "fitness-sports",
    name: "Fitness & Sports",
    sub_industries: [
      "gym", "personal-training", "crossfit", "yoga", "pilates",
      "martial-arts", "boxing", "dance-studio", "swim-school",
      "sports-coaching", "nutrition-coaching", "recovery-wellness",
    ],
    urgency_score: 2,
    lead_value: "medium",
    buyer_density: 4,
    digital_maturity: 4,
    recommended_platforms: ["premium-marketing-site", "membership-platform", "booking-funnel", "community-platform"],
    visual_dna_hints: {
      energy: "energetic-motivational-bold",
      palette_tendency: "high-contrast-vibrant",
      hero_archetype: "cinematic",
      trust_architecture: "transformations-coaches-community",
      conversion_pattern: "free-trial",
    },
  },
  {
    stable_id: "restaurants-food",
    name: "Restaurants & Food Service",
    sub_industries: [
      "fine-dining", "casual-dining", "fast-casual", "cafe-coffee",
      "bakery", "bar-lounge", "catering", "food-truck", "ghost-kitchen",
      "meal-prep", "delivery", "private-chef", "winery-brewery",
    ],
    urgency_score: 2,
    lead_value: "low",
    buyer_density: 5,
    digital_maturity: 3,
    recommended_platforms: ["restaurant-ordering", "premium-marketing-site", "booking-funnel", "ecommerce"],
    visual_dna_hints: {
      energy: "appetizing-inviting-atmospheric",
      palette_tendency: "warm-rich-appetizing",
      hero_archetype: "immersive-image",
      trust_architecture: "menu-reviews-ambiance",
      conversion_pattern: "reserve-order",
    },
  },
  {
    stable_id: "hospitality-travel",
    name: "Hospitality & Travel",
    sub_industries: [
      "hotel-resort", "boutique-hotel", "bed-breakfast", "vacation-rental",
      "tour-operator", "adventure-experiences", "event-venue", "wedding-venue",
      "conference-center", "travel-agency", "cruise", "airbnb-management",
    ],
    urgency_score: 2,
    lead_value: "high",
    buyer_density: 4,
    digital_maturity: 4,
    recommended_platforms: ["hospitality-booking", "premium-marketing-site", "marketplace", "booking-funnel"],
    visual_dna_hints: {
      energy: "escapist-aspirational-serene",
      palette_tendency: "destination-inspired",
      hero_archetype: "cinematic",
      trust_architecture: "amenities-reviews-awards",
      conversion_pattern: "book-stay",
    },
  },
  {
    stable_id: "automotive",
    name: "Automotive & Transportation",
    sub_industries: [
      "auto-repair", "auto-body", "oil-change", "tires", "transmission",
      "brakes", "detailing", "towing", "used-cars", "auto-dealer",
      "motorcycle", "rv", "boat-marine", "fleet-services", "mobile-mechanic",
    ],
    urgency_score: 4,
    lead_value: "medium",
    buyer_density: 4,
    digital_maturity: 3,
    recommended_platforms: ["premium-marketing-site", "booking-funnel", "quote-estimator-funnel", "marketplace"],
    visual_dna_hints: {
      energy: "reliable-precise-confident",
      palette_tendency: "industrial-bold",
      hero_archetype: "product-ui",
      trust_architecture: "ase-certifications-warranty-reviews",
      conversion_pattern: "schedule-service",
    },
  },
  {
    stable_id: "retail-commerce",
    name: "Retail & Local Commerce",
    sub_industries: [
      "apparel-boutique", "electronics", "home-goods", "gift-shop",
      "bookstore", "hardware", "garden-center", "pet-store", "jewelry",
      "sporting-goods", "specialty-retail", "pop-up-shop",
    ],
    urgency_score: 2,
    lead_value: "low",
    buyer_density: 5,
    digital_maturity: 3,
    recommended_platforms: ["ecommerce", "premium-marketing-site", "marketplace", "directory"],
    visual_dna_hints: {
      energy: "curated-merchandised",
      palette_tendency: "brand-driven",
      hero_archetype: "product-ui",
      trust_architecture: "inventory-reviews-returns",
      conversion_pattern: "shop-now",
    },
  },
  {
    stable_id: "ecommerce-dtc",
    name: "Ecommerce & Direct-to-Consumer",
    sub_industries: [
      "fashion-dtc", "beauty-dtc", "supplements", "food-beverage-dtc",
      "home-dtc", "pet-dtc", "electronics-dtc", "subscription-box",
      "print-on-demand", "dropshipping", "wholesale", "marketplace-seller",
    ],
    urgency_score: 2,
    lead_value: "medium",
    buyer_density: 5,
    digital_maturity: 5,
    recommended_platforms: ["dtc-ecommerce", "subscription-commerce", "sales-funnel", "affiliate-platform"],
    visual_dna_hints: {
      energy: "brand-led-conversion-optimized",
      palette_tendency: "brand-personality-driven",
      hero_archetype: "product-ui",
      trust_architecture: "reviews-social-proof-guarantees",
      conversion_pattern: "add-to-cart-subscribe",
    },
  },
  {
    stable_id: "professional-services",
    name: "Professional Services & Consulting",
    sub_industries: [
      "management-consulting", "marketing-agency", "accounting",
      "bookkeeping", "hr-consulting", "it-consulting", "design-agency",
      "pr-agency", "seo-agency", "web-development", "business-coaching",
      "executive-coaching", " fractional-services",
    ],
    urgency_score: 2,
    lead_value: "premium",
    buyer_density: 3,
    digital_maturity: 5,
    recommended_platforms: ["premium-marketing-site", "agency-site", "lead-gen-funnel", "client-portal"],
    visual_dna_hints: {
      energy: "expert-confident-minimal",
      palette_tendency: "sophisticated-neutral",
      hero_archetype: "editorial",
      trust_architecture: "case-studies-team-credentials",
      conversion_pattern: "discovery-call",
    },
  },
  {
    stable_id: "b2b-industrial",
    name: "B2B & Industrial",
    sub_industries: [
      "manufacturing", "wholesale-distribution", "industrial-supplies",
      "equipment-rental", "logistics", "warehousing", "freight",
      "construction-supplies", "safety-equipment", "janitorial-supplies",
      "packaging", "metal-fabrication", "plastics", "chemical-supply",
    ],
    urgency_score: 2,
    lead_value: "high",
    buyer_density: 2,
    digital_maturity: 3,
    recommended_platforms: ["b2b-corporate-site", "b2b-lead-platform", "marketplace", "operations-console"],
    visual_dna_hints: {
      energy: "industrial-precise-authoritative",
      palette_tendency: "steel-gray-industrial-bold",
      hero_archetype: "product-ui",
      trust_architecture: "certifications-capabilities-clients",
      conversion_pattern: "rfq-quote-request",
    },
  },
  {
    stable_id: "saas-technology",
    name: "SaaS & Technology",
    sub_industries: [
      "b2b-saas", "developer-tools", "data-platform", "ai-ml-platform",
      "cybersecurity", "devops", "api-services", "analytics",
      "crm-software", "project-management", "communication-tools",
      "automation-platform", "infrastructure", "edge-computing",
    ],
    urgency_score: 2,
    lead_value: "premium",
    buyer_density: 3,
    digital_maturity: 5,
    recommended_platforms: ["saas-application", "ai-chat-ui", "ai-agent-interface", "analytics-platform"],
    visual_dna_hints: {
      energy: "clean-technical-precise",
      palette_tendency: "modern-gradient-tech",
      hero_archetype: "product-ui",
      trust_architecture: "soc2-uptime-integrations",
      conversion_pattern: "free-trial-demo",
    },
  },
  {
    stable_id: "financial-services",
    name: "Financial Services & Insurance",
    sub_industries: [
      "insurance-agency", "wealth-management", "financial-planning",
      "tax-preparation", "bookkeeping", "payroll-services", "lending",
      "mortgage-broker", "credit-repair", "investment-advisory",
      "retirement-planning", "estate-planning-finance", "business-loans",
    ],
    urgency_score: 3,
    lead_value: "premium",
    buyer_density: 4,
    digital_maturity: 4,
    recommended_platforms: ["premium-marketing-site", "lead-gen-funnel", "quote-estimator-funnel", "client-portal"],
    visual_dna_hints: {
      energy: "stable-trustworthy-precise",
      palette_tendency: "navy-green-gold-trust",
      hero_archetype: "editorial",
      trust_architecture: "licenses-fiduciary-credentials",
      conversion_pattern: "free-consultation-quote",
    },
  },
  {
    stable_id: "education-coaching",
    name: "Education & Coaching",
    sub_industries: [
      "online-courses", "coaching-programs", "certification-programs",
      "tutoring", "test-prep", "language-learning", "music-lessons",
      "art-classes", "professional-development", "corporate-training",
      "mentorship", "knowledge-base", "lms-platform",
    ],
    urgency_score: 2,
    lead_value: "medium",
    buyer_density: 4,
    digital_maturity: 4,
    recommended_platforms: ["learning-lms", "membership-platform", "premium-marketing-site", "sales-funnel"],
    visual_dna_hints: {
      energy: "inspiring-structured-approachable",
      palette_tendency: "warm-educational-friendly",
      hero_archetype: "social-proof",
      trust_architecture: "credentials-outcomes-curriculum",
      conversion_pattern: "enroll-free-lesson",
    },
  },
  {
    stable_id: "nonprofit-community",
    name: "Nonprofit & Community",
    sub_industries: [
      "charity", "foundation", "religious-organization", "community-center",
      "youth-programs", "animal-rescue", "environmental", "food-bank",
      "homeless-services", "advocacy", "arts-organization", "veterans",
    ],
    urgency_score: 2,
    lead_value: "low",
    buyer_density: 3,
    digital_maturity: 2,
    recommended_platforms: ["premium-marketing-site", "donation-funnel", "community-platform", "membership-platform"],
    visual_dna_hints: {
      energy: "warm-mission-driven-empathetic",
      palette_tendency: "hopeful-warm-meaningful",
      hero_archetype: "social-proof",
      trust_architecture: "mission-impact-transparency",
      conversion_pattern: "donate-volunteer",
    },
  },
  {
    stable_id: "events-entertainment",
    name: "Events, Entertainment & Media",
    sub_industries: [
      "event-planning", "wedding-planning", "corporate-events",
      "concerts-live-music", "festivals", "conference", "expo-trade-show",
      "photography", "videography", "dj-services", "entertainment",
      "podcast", "media-publication", "gaming-esports",
    ],
    urgency_score: 3,
    lead_value: "high",
    buyer_density: 4,
    digital_maturity: 4,
    recommended_platforms: ["event-platform", "premium-marketing-site", "booking-funnel", "portfolio"],
    visual_dna_hints: {
      energy: "dynamic-experiential-bold",
      palette_tendency: "vibrant-expressive",
      hero_archetype: "cinematic",
      trust_architecture: "portfolio-press-reviews",
      conversion_pattern: "book-tickets-inquire",
    },
  },
];

/**
 * Lookup helpers
 */
export function getFamilyById(id) {
  return INDUSTRY_FAMILIES.find((f) => f.stable_id === id);
}

export function getAllSubIndustries() {
  return INDUSTRY_FAMILIES.flatMap((f) =>
    f.sub_industries.map((s) => ({
      family_id: f.stable_id,
      family_name: f.name,
      sub_industry: s,
      label: `${f.name} → ${s}`,
    }))
  );
}

export function getFamiliesForPlatform(platformId) {
  return INDUSTRY_FAMILIES.filter((f) =>
    f.recommended_platforms.includes(platformId)
  );
}

export const INDUSTRY_REGISTRY_VERSION = "1.0.0";
export const INDUSTRY_REGISTRY_SHA = "industry-registry-v1.0.0";