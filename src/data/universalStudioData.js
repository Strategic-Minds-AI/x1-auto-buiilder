export const INDUSTRY_TREE = {
  "Construction & Contracting": {
    icon: "HardHat",
    categories: {
      "Concrete & Flooring": ["Polishing", "Epoxy Coating", "Stamping", "Resurfacing", "Staining", "Sealing"],
      "General Contracting": ["Remodeling", "New Construction", "Commercial", "Residential", "Renovation"],
      "Roofing": ["Residential Roofing", "Commercial Roofing", "Roof Repair", "Storm Damage"],
      "Plumbing": ["Residential Plumbing", "Commercial Plumbing", "Emergency Plumbing", "Drain Cleaning"],
      "Electrical": ["Residential Electrical", "Commercial Electrical", "Panel Upgrades", "Lighting"],
      "HVAC": ["Installation", "Repair", "Maintenance", "Commercial HVAC"],
      "Landscaping": ["Design", "Maintenance", "Hardscaping", "Irrigation"],
      "Painting": ["Interior", "Exterior", "Commercial", "Decorative"],
    },
  },
  "Professional Services": {
    icon: "Briefcase",
    categories: {
      "Legal": ["Personal Injury", "Family Law", "Criminal Defense", "Corporate Law", "Estate Planning", "Immigration Law"],
      "Financial": ["Accounting", "Tax Services", "Financial Planning", "Investment Management", "Mortgage & Lending"],
      "Consulting": ["Management Consulting", "IT Consulting", "HR Consulting", "Strategy Consulting"],
      "Insurance": ["Life Insurance", "Property & Casualty", "Health Insurance", "Commercial Insurance"],
    },
  },
  "Health & Wellness": {
    icon: "Heart",
    categories: {
      "Medical": ["Primary Care", "Urgent Care", "Dental", "Chiropractic", "Physical Therapy", "Optometry"],
      "Aesthetics": ["Med Spa", "Dermatology", "Plastic Surgery", "Wellness Center"],
      "Mental Health": ["Therapy", "Counseling", "Psychiatry", "Life Coaching"],
      "Fitness": ["Gym", "Personal Training", "Yoga Studio", "Martial Arts", "Dance Studio"],
    },
  },
  "Retail & E-commerce": {
    icon: "ShoppingBag",
    categories: {
      "Stores": ["Boutique", "Electronics", "Home Goods", "Sporting Goods", "Jewelry"],
      "E-commerce": ["Dropshipping", "Subscription Box", "Marketplace", "Direct-to-Consumer"],
      "Food & Beverage": ["Restaurant", "Cafe", "Bar", "Food Truck", "Catering", "Bakery"],
      "Beauty": ["Salon", "Spa", "Nail Salon", "Barbershop", "Massage Therapy"],
    },
  },
  "Real Estate": {
    icon: "Home",
    categories: {
      "Residential": ["Brokerage", "Property Management", "Investment", "House Flipping"],
      "Commercial": ["Office", "Retail Space", "Industrial", "Investment Properties"],
      "Services": ["Home Inspection", "Appraisal", "Title Company", "Mortgage Lending"],
    },
  },
  "Technology & SaaS": {
    icon: "Cpu",
    categories: {
      "Software": ["SaaS Platform", "Mobile App", "Web Application", "Desktop App"],
      "AI & ML": ["AI Tools", "ML Models", "Chatbots", "Automation", "AI Consultant"],
      "Infrastructure": ["Cloud Services", "Hosting", "CDN", "DevOps"],
      "Security": ["Cybersecurity", "Compliance", "Security Audit", "Security Training"],
    },
  },
  "Marketing & Media": {
    icon: "Megaphone",
    categories: {
      "Agencies": ["SEO Agency", "Social Media Agency", "Content Marketing", "PR & Communications"],
      "Production": ["Photography", "Videography", "Graphic Design", "Web Design"],
      "Advertising": ["PPC Management", "Display Ads", "Social Ads", "Print Advertising"],
    },
  },
  "Automotive": {
    icon: "Car",
    categories: {
      "Services": ["Auto Repair", "Body Shop & Collision", "Auto Detailing", "Towing"],
      "Sales": ["New Cars", "Used Cars", "Auto Parts", "Accessories"],
      "Specialty": ["Performance", "Restoration", "Custom Builds", "Racing"],
    },
  },
  "Education & Training": {
    icon: "GraduationCap",
    categories: {
      "Schools": ["Preschool", "K-12", "College & University", "Trade School"],
      "Tutoring": ["Academic Tutoring", "Test Prep", "Music Lessons", "Language Learning"],
      "Professional": ["Certification", "Corporate Training", "Workshops", "Online Courses"],
    },
  },
  "Home Services": {
    icon: "Wrench",
    categories: {
      "Maintenance": ["Cleaning Services", "Lawn Care", "Pest Control", "Pool & Spa Service"],
      "Repair": ["Appliance Repair", "Garage Door", "Handyman", "Locksmith"],
      "Improvement": ["Kitchen & Bath", "Deck & Patio", "Windows & Doors", "Fencing", "Siding"],
      "Outdoor": ["Tree Service", "Pressure Washing", "Septic Services", "Junk Removal"],
    },
  },
  "Transportation & Logistics": {
    icon: "Truck",
    categories: {
      "Freight": ["Trucking", "Shipping", "Warehousing", "Distribution"],
      "Passenger": ["Taxi", "Rideshare", "Bus Service", "Charter"],
      "Specialty": ["Moving Company", "Storage", "Courier", "Aviation"],
    },
  },
  "Hospitality & Travel": {
    icon: "Plane",
    categories: {
      "Lodging": ["Hotel", "Bed & Breakfast", "Vacation Rental", "Resort"],
      "Events": ["Wedding Planning", "Event Venue", "Catering", "Florist"],
      "Tourism": ["Tour Operator", "Travel Agency", "Tour Guide", "Activity Provider"],
    },
  },
  "Manufacturing & Industrial": {
    icon: "Factory",
    categories: {
      "Production": ["Custom Manufacturing", "Mass Production", "3D Printing", "CNC Machining"],
      "Materials": ["Metal Fabrication", "Plastics", "Woodworking", "Textile"],
      "Equipment": ["Heavy Machinery", "Industrial Tools", "Parts Supply", "Industrial Supplies"],
    },
  },
  "Non-Profit & Government": {
    icon: "Building",
    categories: {
      "Non-Profit": ["Charity", "Foundation", "Religious Organization", "Community Service"],
      "Government": ["Municipal", "State Agency", "Federal Agency", "Public Education"],
      "Advocacy": ["Environmental", "Social Advocacy", "Political Organization", "Professional Association"],
    },
  },
  "Custom / Other": {
    icon: "Users",
    categories: {
      "General": ["General Business", "Startup", "Side Hustle", "Passion Project", "Other"],
    },
  },
};

export const GENERATION_TYPES = [
  { value: "report", label: "Report", icon: "FileText", color: "#3b82f6", complexity: "standard", desc: "Professional reports" },
  { value: "proposal", label: "Proposal", icon: "FileSignature", color: "#8b5cf6", complexity: "standard", desc: "Business proposals" },
  { value: "bid", label: "Bid / Tender", icon: "Gavel", color: "#f59e0b", complexity: "standard", desc: "Bid & tender responses" },
  { value: "document", label: "Document", icon: "FileText", color: "#6366f1", complexity: "standard", desc: "Professional documents" },
  { value: "content", label: "Content", icon: "PenLine", color: "#14b8a6", complexity: "standard", desc: "Marketing & web content" },
  { value: "code", label: "Code", icon: "Code", color: "#f97316", complexity: "standard", desc: "Code generation" },
  { value: "strategy", label: "Strategy", icon: "Target", color: "#dc2626", complexity: "standard", desc: "Business strategy" },
  { value: "email", label: "Email", icon: "Mail", color: "#0ea5e9", complexity: "standard", desc: "Email sequences" },
  { value: "social", label: "Social Media", icon: "Share2", color: "#a855f7", complexity: "standard", desc: "Social media kits" },
  { value: "brand", label: "Brand Identity", icon: "Palette", color: "#d946ef", complexity: "standard", desc: "Brand identity kits" },
  { value: "website", label: "Website", icon: "Globe", color: "#06b6d4", complexity: "complex", desc: "Full website blueprints" },
  { value: "landing", label: "Landing Page", icon: "LayoutTemplate", color: "#22c55e", complexity: "complex", desc: "High-converting landing pages" },
  { value: "funnel", label: "Lead Funnel", icon: "Filter", color: "#eab308", complexity: "complex", desc: "Lead generation funnels" },
  { value: "workflow", label: "Workflow", icon: "Workflow", color: "#10b981", complexity: "complex", desc: "Automation workflows" },
  { value: "platform", label: "Platform", icon: "LayoutGrid", color: "#ec4899", complexity: "complex", desc: "Platform architecture" },
  { value: "system", label: "Full System", icon: "Boxes", color: "#ef4444", complexity: "complex", desc: "Complete system design" },
  { value: "custom", label: "Custom", icon: "Sparkles", color: "#00d4ff", complexity: "standard", desc: "Anything you want" },
];

export const FILE_TYPES = [
  { value: "markdown", label: "Markdown", ext: "md", mime: "text/markdown" },
  { value: "text", label: "Plain Text", ext: "txt", mime: "text/plain" },
  { value: "html", label: "HTML", ext: "html", mime: "text/html" },
  { value: "pdf", label: "PDF Document", ext: "pdf", mime: "application/pdf" },
  { value: "json", label: "JSON", ext: "json", mime: "application/json" },
];