// Industry-specific prompt libraries for all generators.
// Each industry has tailored prompts for content, social, video, SEO, and more.

export const INDUSTRY_PROMPTS = {
  roofing: {
    website_content: 'You are writing website content for a premium roofing contractor. Focus on: storm damage repair, roof replacement, inspection services, insurance claims assistance, material warranties, emergency tarping, commercial vs residential expertise, local building codes, GAF/Owens Corning certifications, safety record, free estimates, financing options, and seasonal maintenance tips. Use confident, trustworthy language that addresses homeowner anxiety about roof damage.',
    social_content: 'Create social content for a roofing contractor. Mix educational posts (how to spot hail damage, when to replace vs repair), before/after project showcases, seasonal maintenance reminders, insurance claim tips, customer testimonials, and community involvement. Avoid fear-based marketing; lead with expertise and reliability.',
    video_script: 'Write a video script for a roofing company. Show the inspection process, explain different roofing materials, demonstrate storm damage assessment, feature crew safety practices, and include a strong CTA for free inspections.',
    seo_audit: 'Audit for roofing SEO: check for local city/neighborhood targeting, roof type keywords (asphalt, metal, tile, flat), emergency services, insurance keywords, commercial roofing terms, and seasonal search patterns.',
    tone: 'professional, trustworthy, reassuring',
  },
  hvac: {
    website_content: 'You are writing website content for an HVAC contractor. Focus on: AC repair, heating installation, indoor air quality, smart thermostat installation, energy efficiency, seasonal maintenance plans, emergency service, duct cleaning, commercial HVAC, and NATE certification. Address both comfort and energy cost concerns.',
    social_content: 'Create social content for an HVAC company. Mix seasonal tips (spring AC prep, winter heating checks), energy-saving advice, indoor air quality education, maintenance plan benefits, before/after installations, and emergency service availability.',
    video_script: 'Write a video script for an HVAC company. Show a seasonal tune-up, explain smart thermostat benefits, demonstrate air quality improvements, and feature a maintenance plan CTA.',
    seo_audit: 'Audit for HVAC SEO: check for seasonal keywords, emergency repair terms, installation vs repair, commercial HVAC, indoor air quality, and local service area targeting.',
    tone: 'helpful, knowledgeable, comfort-focused',
  },
  plumbing: {
    website_content: 'You are writing website content for a plumbing contractor. Focus on: emergency repairs, drain cleaning, water heater installation, leak detection, repiping, sewer line services, bathroom/kitchen remodeling, backflow prevention, and hydro-jetting. Address urgency and water damage prevention.',
    social_content: 'Create social content for a plumbing company. Mix emergency tips (what to do while waiting for a plumber), prevention advice, water-saving tips, fixture trends, before/after remodels, and maintenance reminders.',
    video_script: 'Write a video script for a plumbing company. Show a common repair, explain water heater options, demonstrate leak detection technology, and feature an emergency service CTA.',
    seo_audit: 'Audit for plumbing SEO: check for emergency keywords, drain/sewer terms, water heater types, remodeling keywords, and local service area targeting.',
    tone: 'reliable, fast, problem-solving',
  },
  dental: {
    website_content: 'You are writing website content for a dental practice. Focus on: cosmetic dentistry, implants, Invisalign, emergency dental care, family dentistry, teeth whitening, sedation options, technology (digital X-rays, 3D scanning), insurance and financing, and patient comfort. Address dental anxiety directly.',
    social_content: 'Create social content for a dental practice. Mix oral health tips, procedure explainers, patient transformations, technology showcases, team introductions, community involvement, and appointment reminders.',
    video_script: 'Write a video script for a dental practice. Show a patient-friendly office tour, explain a popular procedure, address common fears, and feature a new patient special CTA.',
    seo_audit: 'Audit for dental SEO: check for procedure keywords, emergency dental, family/cosmetic terms, insurance/financing, and neighborhood/location targeting.',
    tone: 'warm, comforting, professional',
  },
  legal: {
    website_content: 'You are writing website content for a law firm. Focus on: practice areas, case results, attorney bios, client testimonials, free consultation, contingency representation, bar admissions, awards, and FAQ. Address client concerns about cost, process, and outcomes without guaranteeing results.',
    social_content: 'Create social content for a law firm. Mix legal education posts, case result highlights (anonymized), FAQ content, attorney introductions, community involvement, and consultation CTAs. Avoid specific legal advice in posts.',
    video_script: 'Write a video script for a law firm. Introduce the attorneys, explain the consultation process, walk through a case timeline, and feature a free consultation CTA.',
    seo_audit: 'Audit for legal SEO: check for practice area keywords, local bar/jurisdiction terms, consultation keywords, case result language, and attorney name searches.',
    tone: 'authoritative, empathetic, trustworthy',
  },
  restaurant: {
    website_content: 'You are writing website content for a restaurant. Focus on: menu highlights, chef story, ambiance, private events, catering, reservations, seasonal specials, dietary accommodations, loyalty program, and location/parking. Emphasize the dining experience and food quality.',
    social_content: 'Create social content for a restaurant. Mix dish features, behind-the-scenes kitchen, chef stories, seasonal specials, customer photos, event announcements, and reservation CTAs.',
    video_script: 'Write a video script for a restaurant. Show signature dishes being prepared, capture the ambiance, introduce the chef, and feature a reservation CTA.',
    seo_audit: 'Audit for restaurant SEO: check for cuisine keywords, menu terms, reservation/delivery, private events, local neighborhood, and dietary restriction keywords.',
    tone: 'inviting, appetizing, warm',
  },
  fitness: {
    website_content: 'You are writing website content for a fitness studio/gym. Focus on: class types, trainer bios, membership options, trial offers, class schedule, nutrition coaching, transformation stories, equipment, and community culture. Address fitness goals and motivation.',
    social_content: 'Create social content for a fitness studio. Mix workout tips, member transformations, class previews, trainer features, nutrition advice, motivational content, and trial/membership CTAs.',
    video_script: 'Write a video script for a fitness studio. Show a class in action, introduce trainers, feature member testimonials, and include a free trial CTA.',
    seo_audit: 'Audit for fitness SEO: check for class type keywords, membership/trial terms, personal training, nutrition, local gym/studio, and fitness goal keywords.',
    tone: 'energetic, motivating, community-focused',
  },
  realestate: {
    website_content: 'You are writing website content for a real estate agent/brokerage. Focus on: listings, market expertise, buying/selling process, home valuation, neighborhood guides, first-time buyer help, investment properties, and client testimonials. Address both buyers and sellers.',
    social_content: 'Create social content for a real estate agent. Mix new listing features, market updates, neighborhood spotlights, buying/selling tips, open house announcements, client testimonials, and contact CTAs.',
    video_script: 'Write a video script for a real estate agent. Show a property tour, explain the buying/selling process, feature a neighborhood guide, and include a consultation CTA.',
    seo_audit: 'Audit for real estate SEO: check for neighborhood/city keywords, listing types, buying/selling process, home valuation, and agent name searches.',
    tone: 'professional, knowledgeable, aspirational',
  },
  accounting: {
    website_content: 'You are writing website content for an accounting/CPA firm. Focus on: tax preparation, bookkeeping, payroll, business advisory, audit support, financial planning, tax strategy, industry specialization, and free consultation. Address both individual and business client needs.',
    social_content: 'Create social content for an accounting firm. Mix tax tips, deadline reminders, business finance education, industry updates, team introductions, and consultation CTAs.',
    video_script: 'Write a video script for an accounting firm. Explain a common tax situation, introduce the team, walk through the onboarding process, and feature a free consultation CTA.',
    seo_audit: 'Audit for accounting SEO: check for tax/bookkeeping keywords, business size terms, industry specialization, local market, and consultation keywords.',
    tone: 'precise, trustworthy, advisory',
  },
  medspa: {
    website_content: 'You are writing website content for a medical spa. Focus on: treatment menu, technology, practitioner credentials, before/after gallery, pricing transparency, consultation process, safety protocols, and membership/loyalty. Address treatment concerns and emphasize results.',
    social_content: 'Create social content for a medical spa. Mix treatment explainers, before/after results, technology features, practitioner introductions, special offers, and consultation CTAs.',
    video_script: 'Write a video script for a medical spa. Show a popular treatment, explain the technology, feature practitioner expertise, and include a consultation CTA.',
    seo_audit: 'Audit for medspa SEO: check for treatment keywords, technology terms, practitioner credentials, local market, and consultation/booking keywords.',
    tone: 'luxurious, results-focused, reassuring',
  },
  automotive: {
    website_content: 'You are writing website content for an auto repair shop. Focus on: services (brakes, transmission, oil change, diagnostics), certifications (ASE), warranties, financing, shuttle service, fleet services, and maintenance schedules. Address trust and transparency concerns.',
    social_content: 'Create social content for an auto repair shop. Mix maintenance tips, common repair explainers, seasonal checklists, before/after repairs, team introductions, and appointment CTAs.',
    video_script: 'Write a video script for an auto repair shop. Show a common service, explain diagnostic technology, feature ASE certification, and include an appointment CTA.',
    seo_audit: 'Audit for automotive SEO: check for service keywords, make/model specialization, maintenance terms, local service area, and appointment keywords.',
    tone: 'honest, knowledgeable, straightforward',
  },
  construction: {
    website_content: 'You are writing website content for a construction company. Focus on: project types (residential, commercial, renovation), capabilities, safety record, portfolio, team expertise, timeline/process, licensing/insurance, and free estimates. Address project scope and budget concerns.',
    social_content: 'Create social content for a construction company. Mix project progress photos, completed project showcases, safety highlights, team features, industry tips, and estimate CTAs.',
    video_script: 'Write a video script for a construction company. Show a project timeline, explain the build process, feature safety practices, and include a free estimate CTA.',
    seo_audit: 'Audit for construction SEO: check for project type keywords, service area, licensing/insurance, commercial/residential terms, and estimate keywords.',
    tone: 'professional, reliable, quality-focused',
  },
};

// Default fallback prompt for industries not in the map
export const DEFAULT_PROMPTS = {
  website_content: 'You are writing website content for a professional {industry} business. Create comprehensive, original, people-first content that addresses the target audience\'s needs, demonstrates expertise, and drives conversions. Include a compelling hero, detailed services, value propositions, about section, process steps, testimonials, FAQs, and a strong final CTA.',
  social_content: 'Create social media content for a {industry} business. Mix educational posts, service highlights, customer testimonials, behind-the-scenes content, industry tips, and promotional offers.',
  video_script: 'Write a video script for a {industry} business. Introduce the business, explain key services, showcase expertise, and include a clear call-to-action.',
  seo_audit: 'Audit for {industry} SEO: check for industry-specific keywords, local targeting, service terms, and conversion-focused content.',
  tone: 'professional, trustworthy, engaging',
};

export function getIndustryPrompt(industry, type) {
  const key = (industry || '').toLowerCase().replace(/\s+/g, '');
  const prompts = INDUSTRY_PROMPTS[key] || DEFAULT_PROMPTS;
  let prompt = prompts[type] || DEFAULT_PROMPTS[type] || '';
  return prompt.replace(/{industry}/g, industry || 'professional');
}

export const INDUSTRY_LIST = Object.keys(INDUSTRY_PROMPTS);