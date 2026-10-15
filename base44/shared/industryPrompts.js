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
  electrical: {
    website_content: 'You are writing website content for an electrical contractor. Focus on: residential and commercial wiring, panel upgrades, lighting installation, safety inspections, emergency repairs, EV charger installation, smart home integration, and code compliance. Address safety and code compliance concerns.',
    social_content: 'Create social content for an electrical contractor. Mix safety tips, energy-saving advice, smart home features, code compliance education, before/after panel upgrades, and emergency service availability.',
    video_script: 'Write a video script for an electrical company. Show a panel upgrade, explain smart home integration, demonstrate safety inspections, and feature an emergency service CTA.',
    seo_audit: 'Audit for electrical SEO: check for service keywords (panel upgrade, wiring, lighting), emergency terms, EV charger, smart home, and local service area targeting.',
    tone: 'safety-focused, knowledgeable, reliable',
  },
  landscaping: {
    website_content: 'You are writing website content for a landscaping company. Focus on: design/build services, lawn maintenance, hardscaping (patios, retaining walls), irrigation, seasonal cleanups, outdoor lighting, and commercial grounds management. Emphasize curb appeal and outdoor living.',
    social_content: 'Create social content for a landscaping company. Mix before/after transformations, seasonal tips, design inspiration, plant care guides, hardscaping showcases, and free consultation CTAs.',
    video_script: 'Write a video script for a landscaping company. Show a backyard transformation, explain the design process, feature hardscaping work, and include a free consultation CTA.',
    seo_audit: 'Audit for landscaping SEO: check for service keywords (design, maintenance, hardscaping), seasonal terms, commercial/residential, and local service area targeting.',
    tone: 'creative, professional, nature-inspired',
  },
  painting: {
    website_content: 'You are writing website content for a painting contractor. Focus on: interior/exterior painting, cabinet refinishing, commercial painting, color consultation, surface preparation, eco-friendly options, and warranty. Address quality and durability concerns.',
    social_content: 'Create social content for a painting contractor. Mix before/after transformations, color trend features, preparation tips, seasonal painting advice, and free estimate CTAs.',
    video_script: 'Write a video script for a painting company. Show surface preparation, demonstrate painting technique, feature color consultation, and include a free estimate CTA.',
    seo_audit: 'Audit for painting SEO: check for interior/exterior keywords, cabinet refinishing, commercial painting, color consultation, and local service area targeting.',
    tone: 'detail-oriented, quality-focused, creative',
  },
  cleaning: {
    website_content: 'You are writing website content for a cleaning service. Focus on: residential cleaning, commercial cleaning, deep cleaning, move-in/move-out, recurring schedules, eco-friendly products, bonded/insured, and online booking. Address trust and reliability.',
    social_content: 'Create social content for a cleaning service. Mix cleaning tips, before/after results, eco-friendly product features, team introductions, seasonal cleaning checklists, and booking CTAs.',
    video_script: 'Write a video script for a cleaning service. Show a deep cleaning process, explain eco-friendly products, feature the team, and include an online booking CTA.',
    seo_audit: 'Audit for cleaning SEO: check for residential/commercial keywords, deep cleaning, move-in/move-out, recurring service, and local service area targeting.',
    tone: 'trustworthy, thorough, refreshing',
  },
  veterinary: {
    website_content: 'You are writing website content for a veterinary clinic. Focus on: wellness exams, surgery, dental care, emergency services, exotic pets, boarding, grooming, online pharmacy, and pet insurance. Address pet owner anxiety and emphasize compassionate care.',
    social_content: 'Create social content for a veterinary clinic. Mix pet health tips, behind-the-scenes, team introductions, patient success stories, seasonal reminders, and appointment CTAs.',
    video_script: 'Write a video script for a veterinary clinic. Show a wellness exam, introduce the team, address common pet owner concerns, and feature a new patient CTA.',
    seo_audit: 'Audit for veterinary SEO: check for service keywords, emergency vet, exotic pets, boarding/grooming, and local area targeting.',
    tone: 'compassionate, professional, reassuring',
  },
  chiropractic: {
    website_content: 'You are writing website content for a chiropractic clinic. Focus on: spinal adjustment, injury recovery, sports medicine, wellness care, massage therapy, posture correction, insurance acceptance, and new patient specials. Address pain relief and holistic health.',
    social_content: 'Create social content for a chiropractic clinic. Mix posture tips, pain relief education, adjustment explainers, wellness advice, patient testimonials, and new patient CTAs.',
    video_script: 'Write a video script for a chiropractic clinic. Show an adjustment, explain the benefits, feature patient testimonials, and include a new patient special CTA.',
    seo_audit: 'Audit for chiropractic SEO: check for adjustment keywords, injury/pain terms, wellness care, insurance, and local area targeting.',
    tone: 'healing, professional, holistic',
  },
  marketing: {
    website_content: 'You are writing website content for a marketing agency. Focus on: digital marketing, SEO, PPC, social media management, content marketing, branding, web design, analytics/reporting, and industry specialization. Address ROI and measurable results.',
    social_content: 'Create social content for a marketing agency. Mix marketing tips, case study highlights, industry trends, tool reviews, team spotlights, and free consultation CTAs.',
    video_script: 'Write a video script for a marketing agency. Show a campaign strategy session, explain the process, feature client results, and include a free audit CTA.',
    seo_audit: 'Audit for marketing agency SEO: check for service keywords (SEO, PPC, social), industry specialization, case studies, and local/national targeting.',
    tone: 'strategic, data-driven, creative',
  },
  it: {
    website_content: 'You are writing website content for an IT services company. Focus on: managed services, cloud solutions, cybersecurity, network installation, backup/recovery, helpdesk support, VoIP, and compliance. Address business continuity and security.',
    social_content: 'Create social content for an IT services company. Mix cybersecurity tips, cloud adoption guides, tech trends, backup best practices, team introductions, and free assessment CTAs.',
    video_script: 'Write a video script for an IT services company. Show a network setup, explain managed services, demonstrate cybersecurity, and include a free assessment CTA.',
    seo_audit: 'Audit for IT services SEO: check for managed services, cloud, cybersecurity, network, helpdesk, and local/national targeting.',
    tone: 'technical, trustworthy, solutions-oriented',
  },
  insurance: {
    website_content: 'You are writing website content for an insurance agency. Focus on: auto, home, life, business, health insurance, bundling discounts, claims process, free quotes, carrier partnerships, and risk assessment. Address cost concerns and coverage clarity.',
    social_content: 'Create social content for an insurance agency. Mix coverage tips, seasonal reminders (winterizing, storm prep), claims guidance, bundling benefits, and free quote CTAs.',
    video_script: 'Write a video script for an insurance agency. Explain coverage options, walk through a claims scenario, feature the team, and include a free quote CTA.',
    seo_audit: 'Audit for insurance SEO: check for insurance type keywords, quote/claim terms, bundling, local market, and carrier partnerships.',
    tone: 'trustworthy, clear, protective',
  },
  mortgage: {
    website_content: 'You are writing website content for a mortgage broker. Focus on: purchase loans, refinance, first-time buyer programs, pre-approval, rates, FHA/VA/conventional, investment properties, and closing process. Address rate and approval anxiety.',
    social_content: 'Create social content for a mortgage broker. Mix market updates, buyer tips, refinance guides, first-time buyer education, rate trends, and pre-approval CTAs.',
    video_script: 'Write a video script for a mortgage broker. Explain the pre-approval process, walk through a loan scenario, feature team expertise, and include a pre-approval CTA.',
    seo_audit: 'Audit for mortgage SEO: check for loan type keywords, refinance, pre-approval, first-time buyer, rates, and local market targeting.',
    tone: 'knowledgeable, trustworthy, supportive',
  },
  photography: {
    website_content: 'You are writing website content for a photography studio. Focus on: portrait, wedding, event, commercial, real estate, and product photography. Emphasize portfolio, style, packages, booking process, and turnaround time.',
    social_content: 'Create social content for a photography studio. Mix behind-the-scenes, recent shoots, editing tips, gear reviews, client features, and booking CTAs.',
    video_script: 'Write a video script for a photography studio. Show a photoshoot, explain the editing process, feature client testimonials, and include a booking CTA.',
    seo_audit: 'Audit for photography SEO: check for photography type keywords, portfolio, packages, booking, and local area targeting.',
    tone: 'artistic, professional, creative',
  },
  catering: {
    website_content: 'You are writing website content for a catering company. Focus on: event catering, corporate catering, wedding catering, dietary accommodations, tasting process, menu customization, pricing/packages, and service area. Emphasize food quality and service.',
    social_content: 'Create social content for a catering company. Mix dish features, event highlights, behind-the-scenes kitchen, seasonal menus, client testimonials, and booking CTAs.',
    video_script: 'Write a video script for a catering company. Show a catering setup, explain the tasting process, feature signature dishes, and include a booking CTA.',
    seo_audit: 'Audit for catering SEO: check for event type keywords, menu terms, dietary, tasting, packages, and local service area targeting.',
    tone: 'inviting, professional, appetizing',
  },
  homecare: {
    website_content: 'You are writing website content for a home health care agency. Focus on: personal care, companion care, skilled nursing, medication management, dementia care, respite care, insurance/coverage, and caregiver screening. Address family concerns about loved ones.',
    social_content: 'Create social content for a home health care agency. Mix caregiver tips, aging-in-place advice, family resources, caregiver spotlights, health tips, and free consultation CTAs.',
    video_script: 'Write a video script for a home health care agency. Show a caregiver visit, explain services, address family concerns, and include a free consultation CTA.',
    seo_audit: 'Audit for home health care SEO: check for service keywords, caregiver, dementia/skilled nursing, insurance/coverage, and local area targeting.',
    tone: 'compassionate, trustworthy, professional',
  },
  moving: {
    website_content: 'You are writing website content for a moving company. Focus on: residential moving, commercial moving, long-distance, packing services, storage, specialty items (piano, art), insurance/valuation, and free estimates. Address trust and damage concerns.',
    social_content: 'Create social content for a moving company. Mix packing tips, moving checklists, before/after moves, team spotlights, seasonal moving advice, and free estimate CTAs.',
    video_script: 'Write a video script for a moving company. Show a move in progress, explain packing services, feature the team, and include a free estimate CTA.',
    seo_audit: 'Audit for moving SEO: check for moving type keywords, packing, storage, long-distance, and local service area targeting.',
    tone: 'reliable, careful, efficient',
  },
  solar: {
    website_content: 'You are writing website content for a solar installation company. Focus on: residential and commercial solar, battery storage, energy savings, tax credits/incentives, financing options, installation process, warranties, and maintenance. Address ROI and energy independence.',
    social_content: 'Create social content for a solar company. Mix energy saving tips, installation showcases, tax credit updates, battery storage education, customer testimonials, and free consultation CTAs.',
    video_script: 'Write a video script for a solar company. Show an installation, explain the savings, feature a customer testimonial, and include a free consultation CTA.',
    seo_audit: 'Audit for solar SEO: check for solar installation, battery storage, tax credits, financing, and local service area targeting.',
    tone: 'innovative, trustworthy, savings-focused',
  },
  tutoring: {
    website_content: 'You are writing website content for a tutoring service. Focus on: subject tutoring, test prep (SAT/ACT), college counseling, online tutoring, group vs individual, tutor qualifications, progress tracking, and guarantee. Address academic improvement and confidence.',
    social_content: 'Create social content for a tutoring service. Mix study tips, test prep strategies, success stories, tutor spotlights, seasonal prep advice, and free assessment CTAs.',
    video_script: 'Write a video script for a tutoring service. Show a tutoring session, explain the methodology, feature student success, and include a free assessment CTA.',
    seo_audit: 'Audit for tutoring SEO: check for subject keywords, test prep terms, online tutoring, and local area targeting.',
    tone: 'encouraging, knowledgeable, results-focused',
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