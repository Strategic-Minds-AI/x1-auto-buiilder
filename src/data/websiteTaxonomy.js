// Comprehensive website taxonomy: 40 website types × 10+ layouts each.
// Each type has industry-appropriate color palettes, copy, and layout assignments.
// This drives the Design Template Library seed data.

// 20 layout types available
const LAYOUTS = [
  'centered', 'split-left', 'split-right', 'fullscreen-image', 'video-bg',
  'asymmetric', 'product-focus', 'grid-cards', 'carousel', 'minimal',
  'magazine', 'sidebar', 'stats', 'testimonial', 'dashboard',
  'logo-wall', 'booking', 'gallery', 'timeline', 'bento',
];

// 40 website types with palettes, copy, and layout assignments
export const WEBSITE_TYPES = [
  {
    type: 'business-corporate',
    name: 'Corporate Business',
    palettes: [
      { tone: '#0b1523', ink: '#ffffff', accent: '#00d4ff' },
      { tone: '#1a1a2e', ink: '#ffffff', accent: '#e94560' },
      { tone: '#f8f9fa', ink: '#1a1a2e', accent: '#0066ff' },
      { tone: '#1c1c3c', ink: '#ffffff', accent: '#ffd700' },
    ],
    copies: [
      { eyebrow: 'Enterprise Solutions', head: 'Transforming Business Through Innovation', sub: 'We help enterprises scale with cutting-edge technology and proven strategies.', cta: 'Schedule Consultation' },
      { eyebrow: 'Trusted Partner', head: 'Your Partner in Digital Transformation', sub: 'From strategy to execution, we deliver results that matter.', cta: 'Learn More' },
      { eyebrow: 'Global Reach', head: 'Building the Future of Enterprise', sub: 'Powering 500+ companies worldwide with intelligent solutions.', cta: 'Get Started' },
    ],
    photos: ['photo-1454165804606-c3d57bc86b40', 'photo-1497366216548-37526070297c', 'photo-1486406146926-c627a92ad1ab'],
    layouts: ['centered', 'split-left', 'split-right', 'stats', 'logo-wall', 'grid-cards', 'sidebar', 'bento', 'timeline', 'testimonial', 'asymmetric'],
  },
  {
    type: 'ecommerce',
    name: 'E-Commerce Store',
    palettes: [
      { tone: '#ffffff', ink: '#1a1a1a', accent: '#ff4757' },
      { tone: '#0c0c0c', ink: '#ffffff', accent: '#ffa502' },
      { tone: '#f1f2f6', ink: '#2f3542', accent: '#3742fa' },
      { tone: '#fff5f5', ink: '#2d3436', accent: '#e84393' },
    ],
    copies: [
      { eyebrow: 'New Collection', head: 'Style That Defines You', sub: 'Discover curated pieces crafted for the modern individual.', cta: 'Shop Now' },
      { eyebrow: 'Free Shipping', head: 'Premium Products, Unbeatable Prices', sub: 'Shop thousands of products with fast, free delivery.', cta: 'Browse Products' },
      { eyebrow: 'Limited Time', head: 'Up to 50% Off Everything', sub: 'Your favorite brands at prices you will love.', cta: 'Shop Sale' },
    ],
    photos: ['photo-1441986300917-64674bd600d8', 'photo-1567401893414-76b7b1e5a7a5', 'photo-1556742502-ec7c0e9f34b1'],
    layouts: ['product-focus', 'split-left', 'carousel', 'grid-cards', 'minimal', 'gallery', 'bento', 'stats', 'fullscreen-image', 'centered', 'asymmetric'],
  },
  {
    type: 'saas-landing',
    name: 'SaaS Product Landing',
    palettes: [
      { tone: '#0a0e27', ink: '#ffffff', accent: '#6c5ce7' },
      { tone: '#1a1a2e', ink: '#ffffff', accent: '#00d4ff' },
      { tone: '#ffffff', ink: '#1a1a2e', accent: '#0066ff' },
      { tone: '#0f0f23', ink: '#ffffff', accent: '#00ff88' },
    ],
    copies: [
      { eyebrow: 'New: AI-Powered', head: 'The All-in-One Platform for Modern Teams', sub: 'Manage projects, track time, and automate workflows in one place.', cta: 'Start Free Trial' },
      { eyebrow: 'Trusted by 10,000+ Teams', head: 'Ship Faster, Scale Smarter', sub: 'The platform that grows with your business.', cta: 'Get Started Free' },
      { eyebrow: 'No Credit Card Required', head: 'Your Workflow, Supercharged', sub: 'Join thousands of teams already shipping faster.', cta: 'Start Building' },
    ],
    photos: ['photo-1551288049-bebda4e38f71', 'photo-1460925895917-afdab827c52f', 'photo-1551434678-e076c223a692'],
    layouts: ['dashboard', 'split-left', 'centered', 'stats', 'logo-wall', 'grid-cards', 'bento', 'testimonial', 'timeline', 'sidebar', 'minimal'],
  },
  {
    type: 'portfolio',
    name: 'Creative Portfolio',
    palettes: [
      { tone: '#0a0a0a', ink: '#ffffff', accent: '#ff006e' },
      { tone: '#f5f5f5', ink: '#0a0a0a', accent: '#ff006e' },
      { tone: '#1a1a1a', ink: '#ffffff', accent: '#fbbf24' },
      { tone: '#0f0f0f', ink: '#ffffff', accent: '#06ffa5' },
    ],
    copies: [
      { eyebrow: 'Designer & Director', head: 'Creating Visual Stories That Resonate', sub: 'A multidisciplinary designer crafting brands, products, and experiences.', cta: 'View Work' },
      { eyebrow: 'Selected Works', head: 'Design That Moves People', sub: 'Twelve years of crafting memorable digital experiences.', cta: 'See Portfolio' },
      { eyebrow: 'Available for Projects', head: 'Hello, I Make Things', sub: 'Brand identity, art direction, and digital design.', cta: 'Get in Touch' },
    ],
    photos: ['photo-156107079-db1f0b9f3b6d', 'photo-1507003211169-0cff1ed7a6a6', 'photo-1542038784456-1ea8c45f40e6'],
    layouts: ['minimal', 'gallery', 'asymmetric', 'fullscreen-image', 'split-left', 'centered', 'magazine', 'product-focus', 'grid-cards', 'bento', 'carousel'],
  },
  {
    type: 'agency',
    name: 'Agency / Studio',
    palettes: [
      { tone: '#0c0c0c', ink: '#ffffff', accent: '#ff5722' },
      { tone: '#1a1a2e', ink: '#ffffff', accent: '#e94560' },
      { tone: '#f8f9fa', ink: '#1a1a2e', accent: '#7c3aed' },
      { tone: '#0f0e17', ink: '#fffffe', accent: '#ff8906' },
    ],
    copies: [
      { eyebrow: 'Digital Agency', head: 'We Build Brands That Stand Out', sub: 'Strategy, design, and development for ambitious companies.', cta: 'Start a Project' },
      { eyebrow: 'Award-Winning Studio', head: 'Where Ideas Come to Life', sub: 'We craft digital experiences that drive real results.', cta: 'Work With Us' },
      { eyebrow: 'Est. 2015', head: 'Creative That Converts', sub: 'A full-service agency helping brands grow online.', cta: 'Get in Touch' },
    ],
    photos: ['photo-1542744173-8e7e53415bb0', 'photo-1522071820081-009f0129c71c', 'photo-1556761175-597acbe5e7c1'],
    layouts: ['asymmetric', 'split-left', 'fullscreen-image', 'grid-cards', 'minimal', 'centered', 'stats', 'testimonial', 'logo-wall', 'bento', 'magazine'],
  },
  {
    type: 'restaurant',
    name: 'Restaurant / Cafe',
    palettes: [
      { tone: '#1a1a1a', ink: '#f5f5f5', accent: '#d4af37' },
      { tone: '#fff8f0', ink: '#3d2817', accent: '#c0392b' },
      { tone: '#1c1c1c', ink: '#ffffff', accent: '#e74c3c' },
      { tone: '#fdf5e6', ink: '#2c1810', accent: '#8b4513' },
    ],
    copies: [
      { eyebrow: 'Farm to Table', head: 'A Taste of Excellence', sub: 'Locally sourced ingredients, globally inspired flavors.', cta: 'View Menu' },
      { eyebrow: 'Open Daily', head: 'Where Every Meal Tells a Story', sub: 'Authentic cuisine in a warm, inviting atmosphere.', cta: 'Reserve a Table' },
      { eyebrow: 'Award-Winning Chef', head: 'Fine Dining, Reimagined', sub: 'Seasonal menus crafted with passion and precision.', cta: 'Book Now' },
    ],
    photos: ['photo-1517248135467-4c7edcad34d4', 'photo-1414235077428-338989a2e8c0', 'photo-1555396273-367ea4eb4db5'],
    layouts: ['fullscreen-image', 'split-left', 'booking', 'centered', 'gallery', 'minimal', 'testimonial', 'magazine', 'carousel', 'product-focus', 'stats'],
  },
  {
    type: 'real-estate',
    name: 'Real Estate',
    palettes: [
      { tone: '#0a1929', ink: '#ffffff', accent: '#00d4ff' },
      { tone: '#1c1c3c', ink: '#ffffff', accent: '#ffd700' },
      { tone: '#f8f9fa', ink: '#1a1a2e', accent: '#0066ff' },
      { tone: '#0f1c2e', ink: '#ffffff', accent: '#3498db' },
    ],
    copies: [
      { eyebrow: 'Luxury Properties', head: 'Find Your Dream Home', sub: 'Browse exclusive listings in the most sought-after neighborhoods.', cta: 'Search Homes' },
      { eyebrow: 'Top 1% Agent', head: 'Your Trusted Real Estate Partner', sub: 'Buying, selling, or investing — we make it seamless.', cta: 'Schedule Viewing' },
      { eyebrow: '500+ Properties Sold', head: 'Live Where You Belong', sub: 'From cozy starter homes to luxury estates.', cta: 'Browse Listings' },
    ],
    photos: ['photo-1564013799919-ab6000f0a3e5', 'photo-1568605114967-8130f3a46994', 'photo-1582407947304-fd86f028f716'],
    layouts: ['split-left', 'gallery', 'stats', 'grid-cards', 'booking', 'fullscreen-image', 'sidebar', 'centered', 'carousel', 'testimonial', 'logo-wall'],
  },
  {
    type: 'healthcare',
    name: 'Healthcare / Medical',
    palettes: [
      { tone: '#f0f7ff', ink: '#1a3a5c', accent: '#0096d6' },
      { tone: '#ffffff', ink: '#1a3a5c', accent: '#00a86b' },
      { tone: '#eef5ff', ink: '#0a2e4f', accent: '#2563eb' },
      { tone: '#f8fbff', ink: '#1a3a5c', accent: '#06b6d4' },
    ],
    copies: [
      { eyebrow: 'Patient-First Care', head: 'Your Health, Our Priority', sub: 'Compassionate, comprehensive care for every stage of life.', cta: 'Book Appointment' },
      { eyebrow: 'Trusted Since 1985', head: 'Excellence in Healthcare', sub: 'State-of-the-art facilities with a personal touch.', cta: 'Schedule Visit' },
      { eyebrow: '24/7 Emergency Care', head: 'Compassionate Care, Close to Home', sub: 'Your family deserves the best. We deliver.', cta: 'Find a Doctor' },
    ],
    photos: ['photo-1576091160399-1ba83890b3b8', 'photo-1583912267550-2b6e9e6f5b9c', 'photo-1505751172876-fa3ad9f7e0e0'],
    layouts: ['centered', 'booking', 'split-left', 'stats', 'grid-cards', 'testimonial', 'logo-wall', 'timeline', 'sidebar', 'bento', 'minimal'],
  },
  {
    type: 'legal',
    name: 'Law Firm',
    palettes: [
      { tone: '#0a1628', ink: '#ffffff', accent: '#c5a572' },
      { tone: '#1a1a2e', ink: '#ffffff', accent: '#d4af37' },
      { tone: '#f8f8f8', ink: '#1a1a2e', accent: '#1a3a5c' },
      { tone: '#0c1c2e', ink: '#ffffff', accent: '#b8860b' },
    ],
    copies: [
      { eyebrow: 'Experienced Counsel', head: 'Justice Demands Experience', sub: 'Trusted legal representation for over three decades.', cta: 'Schedule Consultation' },
      { eyebrow: 'Results That Matter', head: 'Your Case Is Our Commitment', sub: 'Personal injury, corporate law, and litigation excellence.', cta: 'Free Consultation' },
      { eyebrow: 'Award-Winning Firm', head: 'Strength. Integrity. Results.', sub: 'We fight for the compensation you deserve.', cta: 'Contact Us' },
    ],
    photos: ['photo-1589994965851-a0a1f1f0f1f1', 'photo-1505664194779-8addace6d1be', 'photo-1521587760476-6c12a4b040da'],
    layouts: ['centered', 'split-left', 'stats', 'testimonial', 'logo-wall', 'timeline', 'grid-cards', 'sidebar', 'minimal', 'booking', 'bento'],
  },
  {
    type: 'education',
    name: 'Education / Course',
    palettes: [
      { tone: '#0c1c2e', ink: '#ffffff', accent: '#fbbf24' },
      { tone: '#ffffff', ink: '#1a1a2e', accent: '#7c3aed' },
      { tone: '#1a1a2e', ink: '#ffffff', accent: '#06b6d4' },
      { tone: '#f0f4ff', ink: '#1a1a2e', accent: '#3b82f6' },
    ],
    copies: [
      { eyebrow: 'Online Learning', head: 'Learn Without Limits', sub: 'Access 10,000+ courses from world-class instructors.', cta: 'Start Learning' },
      { eyebrow: 'Join 2M+ Students', head: 'Your Future Starts Here', sub: 'Master new skills with flexible, affordable courses.', cta: 'Browse Courses' },
      { eyebrow: 'Certified Programs', head: 'Education That Opens Doors', sub: 'Industry-recognized certifications and degrees.', cta: 'Enroll Now' },
    ],
    photos: ['photo-1523050854058-8a406f9f26f6', 'photo-1503676262388-9b3b1a1e1f1f', 'photo-1513258496018-7e2b7b3f3f3f'],
    layouts: ['centered', 'grid-cards', 'stats', 'split-left', 'logo-wall', 'timeline', 'bento', 'testimonial', 'sidebar', 'carousel', 'dashboard'],
  },
  {
    type: 'nonprofit',
    name: 'Non-Profit / Charity',
    palettes: [
      { tone: '#0a4d2e', ink: '#ffffff', accent: '#fbbf24' },
      { tone: '#ffffff', ink: '#1a1a2e', accent: '#e74c3c' },
      { tone: '#1a3a5c', ink: '#ffffff', accent: '#f59e0b' },
      { tone: '#f0f9ff', ink: '#0c4a6e', accent: '#0891b2' },
    ],
    copies: [
      { eyebrow: 'Make a Difference', head: 'Together We Can Change Lives', sub: 'Your support provides hope to those who need it most.', cta: 'Donate Now' },
      { eyebrow: 'Join the Movement', head: 'Be the Change You Wish to See', sub: 'Every contribution creates lasting impact.', cta: 'Get Involved' },
      { eyebrow: 'Since 2005', head: 'Building a Better Tomorrow', sub: 'Join 50,000+ supporters making a real difference.', cta: 'Donate Today' },
    ],
    photos: ['photo-1532629345422-7515383ef1c4', 'photo-1469571486292-0ba58a3f063b', 'photo-1488521787991-ed7bbaae7f4f'],
    layouts: ['centered', 'stats', 'testimonial', 'split-left', 'grid-cards', 'timeline', 'logo-wall', 'fullscreen-image', 'bento', 'booking', 'minimal'],
  },
  {
    type: 'event',
    name: 'Event / Conference',
    palettes: [
      { tone: '#0a0a1e', ink: '#ffffff', accent: '#e94560' },
      { tone: '#1a0a2e', ink: '#ffffff', accent: '#a855f7' },
      { tone: '#0c0c1c', ink: '#ffffff', accent: '#00d4ff' },
      { tone: '#1a1a2e', ink: '#ffffff', accent: '#ff6b6b' },
    ],
    copies: [
      { eyebrow: 'Oct 15-17, 2026', head: 'The Future of Tech, Today', sub: 'Three days of innovation, networking, and inspiration.', cta: 'Get Tickets' },
      { eyebrow: 'Early Bird Ends Soon', head: 'Join 5,000+ Innovators', sub: 'World-class speakers, hands-on workshops, and networking.', cta: 'Register Now' },
      { eyebrow: 'Las Vegas 2026', head: 'Where Ideas Meet Opportunity', sub: 'The premier event for forward-thinking professionals.', cta: 'Save Your Spot' },
    ],
    photos: ['photo-1492684323066-81362ee5ff30', 'photo-1540575467063-178bec5bf738', 'photo-1531058020387-2ae5f2c0ad3f'],
    layouts: ['fullscreen-image', 'centered', 'stats', 'split-left', 'timeline', 'grid-cards', 'logo-wall', 'bento', 'carousel', 'testimonial', 'video-bg'],
  },
  {
    type: 'fitness',
    name: 'Fitness / Gym',
    palettes: [
      { tone: '#0a0a0a', ink: '#ffffff', accent: '#00ff88' },
      { tone: '#1a1a1a', ink: '#ffffff', accent: '#ff4757' },
      { tone: '#0c0c0c', ink: '#ffffff', accent: '#ffa502' },
      { tone: '#0f0f0f', ink: '#ffffff', accent: '#06ffa5' },
    ],
    copies: [
      { eyebrow: 'No Excuses', head: 'Train Hard, Transform Faster', sub: 'State-of-the-art equipment and expert coaching.', cta: 'Join Now' },
      { eyebrow: 'First Month Free', head: 'Your Body, Your Temple', sub: 'Group classes, personal training, and 24/7 access.', cta: 'Start Free Trial' },
      { eyebrow: 'Results Guaranteed', head: 'Stronger Every Day', sub: 'Join 2,000+ members who transformed their lives.', cta: 'Get Started' },
    ],
    photos: ['photo-1534438327276-14e5300c3a48', 'photo-1571902943202-507ec2618e8f', 'photo-1517836357463-dde6ba5f1f1f'],
    layouts: ['fullscreen-image', 'video-bg', 'split-left', 'stats', 'grid-cards', 'centered', 'testimonial', 'carousel', 'booking', 'asymmetric', 'minimal'],
  },
  {
    type: 'beauty',
    name: 'Beauty / Salon / Spa',
    palettes: [
      { tone: '#fdf2f8', ink: '#831843', accent: '#ec4899' },
      { tone: '#1a0a1e', ink: '#ffffff', accent: '#f472b6' },
      { tone: '#fff5f7', ink: '#831843', accent: '#d946ef' },
      { tone: '#0c0a0e', ink: '#fff', accent: '#fbbf24' },
    ],
    copies: [
      { eyebrow: 'Luxury Salon', head: 'Reveal Your Natural Beauty', sub: 'Premium treatments tailored to you.', cta: 'Book Appointment' },
      { eyebrow: 'Award-Winning Spa', head: 'Relax, Renew, Rejuvenate', sub: 'Escape the everyday with our signature treatments.', cta: 'Reserve Now' },
      { eyebrow: 'Trusted Since 2010', head: 'Where Beauty Meets Artistry', sub: 'Expert stylists and estheticians at your service.', cta: 'Book Now' },
    ],
    photos: ['photo-1560066984-138dadb4c035', 'photo-1522335789203-aabd1fc54bc9', 'photo-1487412947147-5cebf100ffc2'],
    layouts: ['booking', 'fullscreen-image', 'split-left', 'gallery', 'centered', 'testimonial', 'minimal', 'carousel', 'product-focus', 'grid-cards', 'magazine'],
  },
  {
    type: 'automotive',
    name: 'Automotive / Car Dealer',
    palettes: [
      { tone: '#0a0a0a', ink: '#ffffff', accent: '#ef4444' },
      { tone: '#1a1a1a', ink: '#ffffff', accent: '#3b82f6' },
      { tone: '#0c0c0c', ink: '#ffffff', accent: '#fbbf24' },
      { tone: '#0f0f0f', ink: '#ffffff', accent: '#06b6d4' },
    ],
    copies: [
      { eyebrow: 'Premium Selection', head: 'Find Your Perfect Drive', sub: 'New and pre-owned vehicles, unbeatable financing.', cta: 'Browse Inventory' },
      { eyebrow: '0% APR Available', head: 'Drive Home Today', sub: 'The area\'s largest selection of quality vehicles.', cta: 'Schedule Test Drive' },
      { eyebrow: 'Family Owned', head: 'Built on Trust, Driven by Value', sub: 'Serving our community for over 30 years.', cta: 'View Cars' },
    ],
    photos: ['photo-1494976108592-4d2e9e1c1f1f', 'photo-1503376780353-7e6692767b70', 'photo-1542362567-b07e54358753'],
    layouts: ['fullscreen-image', 'product-focus', 'carousel', 'split-left', 'gallery', 'stats', 'grid-cards', 'video-bg', 'centered', 'testimonial', 'logo-wall'],
  },
  {
    type: 'travel',
    name: 'Travel / Tourism',
    palettes: [
      { tone: '#e0f7ff', ink: '#0c4a6e', accent: '#0ea5e9' },
      { tone: '#0c1c2e', ink: '#ffffff', accent: '#fbbf24' },
      { tone: '#fffbeb', ink: '#78350f', accent: '#f59e0b' },
      { tone: '#0a1929', ink: '#ffffff', accent: '#06b6d4' },
    ],
    copies: [
      { eyebrow: 'Explore the World', head: 'Your Next Adventure Awaits', sub: 'Curated experiences in 100+ destinations worldwide.', cta: 'Plan Your Trip' },
      { eyebrow: 'Best Price Guarantee', head: 'Wander Further, Discover More', sub: 'Flights, hotels, and experiences in one place.', cta: 'Search Deals' },
      { eyebrow: 'Trusted by Millions', head: 'Travel Made Effortless', sub: 'Book your dream vacation with confidence.', cta: 'Explore Now' },
    ],
    photos: ['photo-1488646953014-85cb44e25828', 'photo-1503226697458-2ce3e1f1f1f1', 'photo-1469854523086-cc02fe5d8800'],
    layouts: ['fullscreen-image', 'gallery', 'carousel', 'split-left', 'centered', 'grid-cards', 'stats', 'testimonial', 'bento', 'video-bg', 'minimal'],
  },
  {
    type: 'construction',
    name: 'Construction / Contractor',
    palettes: [
      { tone: '#1a1a1a', ink: '#ffffff', accent: '#f59e0b' },
      { tone: '#f8f8f8', ink: '#1a1a1a', accent: '#ea580c' },
      { tone: '#0c0c0c', ink: '#ffffff', accent: '#fbbf24' },
      { tone: '#1c1c1c', ink: '#ffffff', accent: '#f97316' },
    ],
    copies: [
      { eyebrow: 'Licensed & Insured', head: 'Building Excellence Since 1995', sub: 'Commercial and residential construction you can trust.', cta: 'Get a Quote' },
      { eyebrow: 'Free Estimates', head: 'From Foundation to Finish', sub: 'Quality craftsmanship on every project, big or small.', cta: 'Request Quote' },
      { eyebrow: '500+ Projects Completed', head: 'We Build Your Vision', sub: 'Design-build, renovation, and project management.', cta: 'Start Project' },
    ],
    photos: ['photo-1503387762-592deb58ef4f', 'photo-1541888946425-d81bb19240f9', 'photo-1429608937028-26c5601f3e1f'],
    layouts: ['split-left', 'stats', 'grid-cards', 'timeline', 'centered', 'testimonial', 'logo-wall', 'fullscreen-image', 'gallery', 'booking', 'bento'],
  },
  {
    type: 'finance',
    name: 'Finance / Accounting',
    palettes: [
      { tone: '#0a1929', ink: '#ffffff', accent: '#10b981' },
      { tone: '#0c1c2e', ink: '#ffffff', accent: '#34d399' },
      { tone: '#f0fdf4', ink: '#0a1929', accent: '#059669' },
      { tone: '#0f1c2e', ink: '#ffffff', accent: '#6ee7b7' },
    ],
    copies: [
      { eyebrow: 'Smart Investing', head: 'Grow Your Wealth with Confidence', sub: 'Personalized financial strategies for your future.', cta: 'Schedule Consultation' },
      { eyebrow: 'CPA-Reviewed', head: 'Your Financial Future, Secured', sub: 'Tax, accounting, and wealth management under one roof.', cta: 'Get Started' },
      { eyebrow: 'Trusted Since 2000', head: 'Numbers That Work for You', sub: 'Helping businesses and individuals thrive financially.', cta: 'Book a Call' },
    ],
    photos: ['photo-1554224155-6729b68f1f1f', 'photo-1460925895917-afdab827c52f', 'photo-1611974789855-9c2a0a7236a3'],
    layouts: ['dashboard', 'stats', 'split-left', 'centered', 'testimonial', 'logo-wall', 'grid-cards', 'timeline', 'sidebar', 'booking', 'bento'],
  },
  {
    type: 'photography',
    name: 'Photography',
    palettes: [
      { tone: '#0a0a0a', ink: '#ffffff', accent: '#f5f5f5' },
      { tone: '#1a1a1a', ink: '#ffffff', accent: '#fbbf24' },
      { tone: '#0c0c0c', ink: '#ffffff', accent: '#e94560' },
      { tone: '#0f0f0f', ink: '#ffffff', accent: '#a78bfa' },
    ],
    copies: [
      { eyebrow: 'Visual Storyteller', head: 'Capturing Moments That Last', sub: 'Wedding, portrait, and editorial photography.', cta: 'View Gallery' },
      { eyebrow: 'Available Worldwide', head: 'Light, Shadow, Emotion', sub: 'Every photograph tells a story. Let me tell yours.', cta: 'Book a Session' },
      { eyebrow: 'Award-Winning', head: 'Through the Lens', sub: 'Fine art and commercial photography that moves.', cta: 'See Portfolio' },
    ],
    photos: ['photo-1503174938741-1ea4e26c7c1f', 'photo-1542038784456-1ea8c45f40e6', 'photo-1500530855697-b586d89ba3ee'],
    layouts: ['gallery', 'fullscreen-image', 'minimal', 'split-left', 'asymmetric', 'centered', 'carousel', 'magazine', 'grid-cards', 'product-focus', 'testimonial'],
  },
  {
    type: 'music',
    name: 'Music / Band',
    palettes: [
      { tone: '#0a0a0a', ink: '#ffffff', accent: '#e94560' },
      { tone: '#1a0a2e', ink: '#ffffff', accent: '#a855f7' },
      { tone: '#0c0c1c', ink: '#ffffff', accent: '#06ffa5' },
      { tone: '#0f0a1e', ink: '#ffffff', accent: '#f472b6' },
    ],
    copies: [
      { eyebrow: 'New Album Out Now', head: 'Sound That Moves You', sub: 'Stream the latest tracks and catch us on tour.', cta: 'Listen Now' },
      { eyebrow: 'World Tour 2026', head: 'Feel the Music Live', sub: 'Tickets on sale now for 40+ cities worldwide.', cta: 'Get Tickets' },
      { eyebrow: 'Platinum Artists', head: 'Where Rhythm Meets Soul', sub: 'New music, exclusive merch, and behind-the-scenes.', cta: 'Stream Now' },
    ],
    photos: ['photo-1493225457124-a3eb161ffa5f', 'photo-1470229722913-7c0e2dbbafd3', 'photo-1511671782779-c97d3d27a1d4'],
    layouts: ['fullscreen-image', 'video-bg', 'minimal', 'split-left', 'centered', 'carousel', 'gallery', 'stats', 'asymmetric', 'timeline', 'grid-cards'],
  },
  {
    type: 'wedding',
    name: 'Wedding',
    palettes: [
      { tone: '#fdf5f5', ink: '#831843', accent: '#e11d48' },
      { tone: '#fffbeb', ink: '#78350f', accent: '#d97706' },
      { tone: '#f8fafc', ink: '#1e293b', accent: '#a855f7' },
      { tone: '#fdf4ff', ink: '#581c87', accent: '#c026d3' },
    ],
    copies: [
      { eyebrow: 'Your Special Day', head: 'Forever Starts Here', sub: 'Creating unforgettable weddings, one couple at a time.', cta: 'Start Planning' },
      { eyebrow: 'Bespoke Ceremonies', head: 'Love, Beautifully Celebrated', sub: 'Full-service wedding planning and coordination.', cta: 'Book Consultation' },
      { eyebrow: '500+ Weddings', head: 'The Day You Will Never Forget', sub: 'From intimate elopements to grand celebrations.', cta: 'Plan Your Wedding' },
    ],
    photos: ['photo-1519741497674-611481863552', 'photo-1469371670807-013ccf25f16a', 'photo-1606800052052-a08af7762def'],
    layouts: ['fullscreen-image', 'gallery', 'split-left', 'centered', 'minimal', 'testimonial', 'carousel', 'magazine', 'booking', 'timeline', 'grid-cards'],
  },
  {
    type: 'crypto',
    name: 'Crypto / Web3',
    palettes: [
      { tone: '#0a0a1e', ink: '#ffffff', accent: '#8b5cf6' },
      { tone: '#0c0c1c', ink: '#ffffff', accent: '#00ff88' },
      { tone: '#0f0a1e', ink: '#ffffff', accent: '#f7931a' },
      { tone: '#0a0e27', ink: '#ffffff', accent: '#6366f1' },
    ],
    copies: [
      { eyebrow: 'Decentralized Finance', head: 'The Future of Money is Here', sub: 'Trade, stake, and earn with the leading DeFi platform.', cta: 'Start Trading' },
      { eyebrow: 'Audited & Secure', head: 'Own Your Digital Future', sub: 'Non-custodial wallet with bank-grade security.', cta: 'Get the App' },
      { eyebrow: '2M+ Users', head: 'Trade Anything, Anywhere', sub: 'The fastest, most secure way to buy and sell crypto.', cta: 'Create Account' },
    ],
    photos: ['photo-1639762681485-4c80b3d1f1f1', 'photo-1621761192179-7e6e6b1f1f1f', 'photo-1518546410211-4c2b3f1f1f1f'],
    layouts: ['dashboard', 'video-bg', 'split-left', 'stats', 'centered', 'grid-cards', 'logo-wall', 'bento', 'minimal', 'asymmetric', 'testimonial'],
  },
  {
    type: 'ai-tool',
    name: 'AI Tool / Platform',
    palettes: [
      { tone: '#0a0a1e', ink: '#ffffff', accent: '#6366f1' },
      { tone: '#0c0c1c', ink: '#ffffff', accent: '#06b6d4' },
      { tone: '#0a0e27', ink: '#ffffff', accent: '#a855f7' },
      { tone: '#0f0a1e', ink: '#ffffff', accent: '#3b82f6' },
    ],
    copies: [
      { eyebrow: 'Powered by GPT-5', head: 'AI That Understands Your Business', sub: 'Automate workflows, generate content, and scale faster.', cta: 'Try Free' },
      { eyebrow: '10M+ Prompts Generated', head: 'Your AI Copilot for Everything', sub: 'Write, code, analyze, and create with one AI platform.', cta: 'Start Free Trial' },
      { eyebrow: 'No Code Required', head: 'Build with AI, Not Complexity', sub: 'The simplest way to integrate AI into your workflow.', cta: 'Get Started' },
    ],
    photos: ['photo-1677442136019-21780ecad995', 'photo-1620712943543-bcc4689e39f8', 'photo-1655720828062-9b8a1f1f1f1f'],
    layouts: ['dashboard', 'split-left', 'centered', 'video-bg', 'stats', 'grid-cards', 'bento', 'logo-wall', 'testimonial', 'timeline', 'minimal'],
  },
  {
    type: 'marketplace',
    name: 'Marketplace',
    palettes: [
      { tone: '#ffffff', ink: '#1a1a1a', accent: '#ff4757' },
      { tone: '#0c0c0c', ink: '#ffffff', accent: '#ffa502' },
      { tone: '#f8f9fa', ink: '#1a1a2e', accent: '#7c3aed' },
      { tone: '#ffffff', ink: '#0f172a', accent: '#06b6d4' },
    ],
    copies: [
      { eyebrow: 'Buy & Sell', head: 'Everything You Need, All in One Place', sub: 'Millions of products from trusted sellers worldwide.', cta: 'Start Shopping' },
      { eyebrow: 'Secure Payments', head: 'The Marketplace for Everything', sub: 'Find unique items from independent sellers.', cta: 'Browse Now' },
      { eyebrow: 'Join 10M+ Users', head: 'Shop Smarter, Save More', sub: 'Best deals on new and used products every day.', cta: 'Explore' },
    ],
    photos: ['photo-1607082348824-0a96f2a4b9da', 'photo-1556742502-ec7c0e9f34b1', 'photo-1441986300917-64674bd600d8'],
    layouts: ['grid-cards', 'split-left', 'product-focus', 'carousel', 'centered', 'gallery', 'stats', 'logo-wall', 'bento', 'testimonial', 'minimal'],
  },
  {
    type: 'news',
    name: 'News / Magazine',
    palettes: [
      { tone: '#ffffff', ink: '#0a0a0a', accent: '#dc2626' },
      { tone: '#0a0a0a', ink: '#ffffff', accent: '#dc2626' },
      { tone: '#f8f8f8', ink: '#1a1a1a', accent: '#2563eb' },
      { tone: '#0c0c0c', ink: '#ffffff', accent: '#f59e0b' },
    ],
    copies: [
      { eyebrow: 'Breaking News', head: 'The Stories That Shape Our World', sub: 'Independent journalism you can trust, 24/7.', cta: 'Read More' },
      { eyebrow: 'Subscribe Today', head: 'Stay Informed, Stay Ahead', sub: 'In-depth reporting on politics, tech, and culture.', cta: 'Subscribe' },
      { eyebrow: 'Since 1985', head: 'News That Matters', sub: 'Award-winning reporting from around the globe.', cta: 'View Latest' },
    ],
    photos: ['photo-1495020689067-8582a4f1f1f1', 'photo-1504711434969-e33886168f5c', 'photo-1585829365295-ab7cd400c1f1'],
    layouts: ['magazine', 'split-left', 'grid-cards', 'centered', 'sidebar', 'carousel', 'gallery', 'stats', 'testimonial', 'minimal', 'bento'],
  },
  {
    type: 'podcast',
    name: 'Podcast',
    palettes: [
      { tone: '#0a0a1e', ink: '#ffffff', accent: '#f472b6' },
      { tone: '#1a0a2e', ink: '#ffffff', accent: '#a855f7' },
      { tone: '#0c0c1c', ink: '#ffffff', accent: '#fbbf24' },
      { tone: '#0f0a1e', ink: '#ffffff', accent: '#06b6d4' },
    ],
    copies: [
      { eyebrow: 'New Episodes Weekly', head: 'Conversations That Matter', sub: 'Deep dives with the world\'s most fascinating people.', cta: 'Listen Now' },
      { eyebrow: 'Top 10 on Apple', head: 'Your Weekly Dose of Insight', sub: 'Subscribe on your favorite platform.', cta: 'Subscribe' },
      { eyebrow: '2M+ Downloads', head: 'Stories Worth Hearing', sub: 'New episodes every Tuesday and Thursday.', cta: 'Play Latest' },
    ],
    photos: ['photo-1478737270239-2f0392ce0c1f', 'photo-1590602847861-fb7a8df1f1f1', 'photo-1607799273144-9c1f1f1f1f1f'],
    layouts: ['video-bg', 'split-left', 'centered', 'minimal', 'stats', 'testimonial', 'grid-cards', 'carousel', 'logo-wall', 'bento', 'asymmetric'],
  },
  {
    type: 'personal',
    name: 'Personal / Resume',
    palettes: [
      { tone: '#0a0a0a', ink: '#ffffff', accent: '#06b6d4' },
      { tone: '#f8f9fa', ink: '#1a1a2e', accent: '#7c3aed' },
      { tone: '#0c0c1c', ink: '#ffffff', accent: '#f472b6' },
      { tone: '#ffffff', ink: '#0a0a0a', accent: '#f59e0b' },
    ],
    copies: [
      { eyebrow: 'Product Designer', head: 'Hi, I\'m Alex', sub: 'I design products people love to use.', cta: 'Get in Touch' },
      { eyebrow: 'Full-Stack Developer', head: 'Building Things That Matter', sub: '10 years of crafting digital experiences.', cta: 'View Resume' },
      { eyebrow: 'Available for Work', head: 'Designer, Developer, Thinker', sub: 'Let\'s build something great together.', cta: 'Contact Me' },
    ],
    photos: ['photo-1507003211169-0cff1ed7a6a6', 'photo-1535713875002-d1d0cf377fde', 'photo-1547425260-76bcadfb4f2c'],
    layouts: ['minimal', 'split-left', 'centered', 'asymmetric', 'gallery', 'grid-cards', 'timeline', 'testimonial', 'magazine', 'product-focus', 'bento'],
  },
  {
    type: 'directory',
    name: 'Directory / Listing',
    palettes: [
      { tone: '#f8f9fa', ink: '#1a1a2e', accent: '#0066ff' },
      { tone: '#0a1929', ink: '#ffffff', accent: '#00d4ff' },
      { tone: '#ffffff', ink: '#0f172a', accent: '#7c3aed' },
      { tone: '#0c1c2e', ink: '#ffffff', accent: '#fbbf24' },
    ],
    copies: [
      { eyebrow: '10,000+ Listings', head: 'Find the Best Local Businesses', sub: 'Reviews, ratings, and recommendations you can trust.', cta: 'Search Now' },
      { eyebrow: 'Verified Reviews', head: 'Your Local Business Directory', sub: 'Discover top-rated services in your area.', cta: 'Browse Categories' },
      { eyebrow: 'List Your Business', head: 'Connect Customers with Businesses', sub: 'The comprehensive directory for everything local.', cta: 'Add Listing' },
    ],
    photos: ['photo-1486312338126-9c2b1f1f1f1f', 'photo-1556761175-5972c1f1f1f1', 'photo-1517248135467-4c7edcad34d4'],
    layouts: ['sidebar', 'grid-cards', 'split-left', 'centered', 'stats', 'gallery', 'logo-wall', 'bento', 'testimonial', 'search', 'minimal'],
  },
  {
    type: 'membership',
    name: 'Membership / Community',
    palettes: [
      { tone: '#0a0a1e', ink: '#ffffff', accent: '#a855f7' },
      { tone: '#0c0c1c', ink: '#ffffff', accent: '#06b6d4' },
      { tone: '#1a0a2e', ink: '#ffffff', accent: '#f472b6' },
      { tone: '#0f0a1e', ink: '#ffffff', accent: '#fbbf24' },
    ],
    copies: [
      { eyebrow: 'Join 50,000+ Members', head: 'Your Community Awaits', sub: 'Exclusive content, events, and connections.', cta: 'Join Now' },
      { eyebrow: 'Premium Access', head: 'Be Part of Something Bigger', sub: 'Connect, learn, and grow with like-minded people.', cta: 'Become a Member' },
      { eyebrow: '7-Day Free Trial', head: 'Where Members Thrive', sub: 'Unlock premium resources and a vibrant community.', cta: 'Start Trial' },
    ],
    photos: ['photo-1522071820081-009f0129c71c', 'photo-1556761175-b413da4b4f1f', 'photo-1543269865-cbf427abf1f1'],
    layouts: ['centered', 'split-left', 'stats', 'testimonial', 'grid-cards', 'logo-wall', 'bento', 'timeline', 'pricing', 'minimal', 'carousel'],
  },
  {
    type: 'app-landing',
    name: 'Mobile App Landing',
    palettes: [
      { tone: '#0a0a1e', ink: '#ffffff', accent: '#6366f1' },
      { tone: '#0c0c1c', ink: '#ffffff', accent: '#06ffa5' },
      { tone: '#0f0a1e', ink: '#ffffff', accent: '#f472b6' },
      { tone: '#0a0e27', ink: '#ffffff', accent: '#fbbf24' },
    ],
    copies: [
      { eyebrow: 'Download on App Store', head: 'Your Life, Simplified', sub: 'The app that changes everything. Available now.', cta: 'Download Free' },
      { eyebrow: '4.9 Star Rating', head: 'There\'s an App for That', sub: 'Join 1M+ users already loving our app.', cta: 'Get the App' },
      { eyebrow: 'Featured by Apple', head: 'The App You Have Been Waiting For', sub: 'Beautiful design. Powerful features. Free to start.', cta: 'Download Now' },
    ],
    photos: ['photo-1512941937669-90a1b59e7bda', 'photo-1551650975-87deced9c1f1', 'photo-1511707174473-9b1f1f1f1f1f'],
    layouts: ['product-focus', 'split-left', 'centered', 'stats', 'grid-cards', 'testimonial', 'logo-wall', 'bento', 'minimal', 'carousel', 'video-bg'],
  },
  {
    type: 'startup',
    name: 'Startup / Tech',
    palettes: [
      { tone: '#0a0a1e', ink: '#ffffff', accent: '#06ffa5' },
      { tone: '#0c0c1c', ink: '#ffffff', accent: '#6366f1' },
      { tone: '#0f0a1e', ink: '#ffffff', accent: '#fbbf24' },
      { tone: '#0a0e27', ink: '#ffffff', accent: '#06b6d4' },
    ],
    copies: [
      { eyebrow: 'Seed Funded', head: 'Reimagining What\'s Possible', sub: 'We are building the infrastructure of tomorrow.', cta: 'Join Us' },
      { eyebrow: 'Now Hiring', head: 'Build the Future With Us', sub: 'Series A startup backed by top VCs.', cta: 'See Open Roles' },
      { eyebrow: 'Y Combinator W26', head: 'The Next Big Thing Starts Here', sub: 'Join our mission to transform an industry.', cta: 'Get Started' },
    ],
    photos: ['photo-1559136555-9303e0e0f1f1', 'photo-1531973576160-7125cd663d2f', 'photo-1542744173-8e7e53415b1f'],
    layouts: ['centered', 'split-left', 'stats', 'grid-cards', 'logo-wall', 'bento', 'minimal', 'testimonial', 'timeline', 'dashboard', 'asymmetric'],
  },
  {
    type: 'government',
    name: 'Government / Civic',
    palettes: [
      { tone: '#0a1929', ink: '#ffffff', accent: '#3b82f6' },
      { tone: '#f8fafc', ink: '#0f172a', accent: '#1d4ed8' },
      { tone: '#0c1c2e', ink: '#ffffff', accent: '#60a5fa' },
      { tone: '#ffffff', ink: '#0a1929', accent: '#2563eb' },
    ],
    copies: [
      { eyebrow: 'Official Website', head: 'Serving Our Community', sub: 'Access services, information, and resources 24/7.', cta: 'Find Services' },
      { eyebrow: 'Your City, Online', head: 'Government That Works for You', sub: 'Pay bills, apply for permits, and stay informed.', cta: 'Get Started' },
      { eyebrow: 'Public Resources', head: 'Transparent, Accessible, Responsive', sub: 'Your trusted source for official information.', cta: 'Learn More' },
    ],
    photos: ['photo-1517292987719-0349f1f1f1f1', 'photo-1486328551f1f1f1f1f1f1f1', 'photo-1518306727298-1f1f1f1f1f1f'],
    layouts: ['centered', 'sidebar', 'grid-cards', 'split-left', 'stats', 'logo-wall', 'timeline', 'testimonial', 'bento', 'minimal', 'booking'],
  },
  {
    type: 'church',
    name: 'Church / Religious',
    palettes: [
      { tone: '#1a1a2e', ink: '#ffffff', accent: '#d4af37' },
      { tone: '#f8f4e8', ink: '#3d2817', accent: '#b8860b' },
      { tone: '#0c1c2e', ink: '#ffffff', accent: '#fbbf24' },
      { tone: '#fffbeb', ink: '#78350f', accent: '#d97706' },
    ],
    copies: [
      { eyebrow: 'Welcome Home', head: 'A Place to Belong', sub: 'Join us this Sunday for worship and community.', cta: 'Plan Your Visit' },
      { eyebrow: 'Service Times', head: 'Come as You Are', sub: 'A welcoming community for all ages and stages.', cta: 'Learn More' },
      { eyebrow: 'Growing Together', head: 'Faith, Family, Fellowship', sub: 'Find your purpose and connect with others.', cta: 'Get Connected' },
    ],
    photos: ['photo-1438119188123-9e1f1f1f1f1f', 'photo-1518306727298-1f1f1f1f1f1f1', 'photo-1507692049790-f1f1f1f1f1f1'],
    layouts: ['centered', 'split-left', 'timeline', 'testimonial', 'grid-cards', 'stats', 'logo-wall', 'booking', 'minimal', 'fullscreen-image', 'bento'],
  },
  {
    type: 'cleaning',
    name: 'Cleaning Services',
    palettes: [
      { tone: '#eef5ff', ink: '#0a3d5c', accent: '#0ea5e9' },
      { tone: '#f0fdf4', ink: '#14532d', accent: '#22c55e' },
      { tone: '#ffffff', ink: '#0f172a', accent: '#06b6d4' },
      { tone: '#f8fafc', ink: '#1e293b', accent: '#3b82f6' },
    ],
    copies: [
      { eyebrow: 'Eco-Friendly', head: 'Spotless Clean, Every Time', sub: 'Professional cleaning for homes and offices.', cta: 'Book Now' },
      { eyebrow: '100% Satisfaction', head: 'We Clean, You Relax', sub: 'Trusted, insured, and background-checked cleaners.', cta: 'Get a Quote' },
      { eyebrow: 'Same-Day Available', head: 'A Cleaner Space, A Clearer Mind', sub: 'Book online in 60 seconds. Satisfaction guaranteed.', cta: 'Schedule Cleaning' },
    ],
    photos: ['photo-1581578731540-c1f1f1f1f1f1', 'photo-1521791136701-1f1f1f1f1f1f1', 'photo-1581578731540-c1f1f1f1f1f1f'],
    layouts: ['booking', 'split-left', 'stats', 'grid-cards', 'centered', 'testimonial', 'logo-wall', 'timeline', 'minimal', 'bento', 'gallery'],
  },
  {
    type: 'plumbing',
    name: 'Plumbing / HVAC',
    palettes: [
      { tone: '#0a1929', ink: '#ffffff', accent: '#0ea5e9' },
      { tone: '#f8fafc', ink: '#0f172a', accent: '#2563eb' },
      { tone: '#0c1c2e', ink: '#ffffff', accent: '#06b6d4' },
      { tone: '#eef5ff', ink: '#0a3d5c', accent: '#0284c7' },
    ],
    copies: [
      { eyebrow: '24/7 Emergency', head: 'Fast, Reliable Plumbing Service', sub: 'Licensed plumbers ready when you need us.', cta: 'Call Now' },
      { eyebrow: 'Licensed & Insured', head: 'Your Comfort Is Our Business', sub: 'Heating, cooling, and plumbing experts since 1998.', cta: 'Book Service' },
      { eyebrow: 'Upfront Pricing', head: 'Fix It Right the First Time', sub: 'Trusted home services with a satisfaction guarantee.', cta: 'Schedule Now' },
    ],
    photos: ['photo-1581094794329-c1f1f1f1f1f1', 'photo-1607472586893-1f1f1f1f1f1f', 'photo-1581094289338-1f1f1f1f1f1f1'],
    layouts: ['booking', 'split-left', 'stats', 'grid-cards', 'centered', 'testimonial', 'logo-wall', 'timeline', 'minimal', 'bento', 'fullscreen-image'],
  },
  {
    type: 'landscaping',
    name: 'Landscaping',
    palettes: [
      { tone: '#f0fdf4', ink: '#14532d', accent: '#16a34a' },
      { tone: '#1a3a1a', ink: '#ffffff', accent: '#4ade80' },
      { tone: '#ffffff', ink: '#14532d', accent: '#22c55e' },
      { tone: '#0c1c0c', ink: '#ffffff', accent: '#86efac' },
    ],
    copies: [
      { eyebrow: 'Free Estimates', head: 'Your Yard, Beautifully Done', sub: 'Professional landscaping and lawn care services.', cta: 'Get a Quote' },
      { eyebrow: '20+ Years Experience', head: 'Bringing Your Outdoor Vision to Life', sub: 'Design, installation, and maintenance you can trust.', cta: 'Schedule Consultation' },
      { eyebrow: 'Fully Insured', head: 'The Grass Is Greener Here', sub: 'Complete lawn care and landscape management.', cta: 'Book Now' },
    ],
    photos: ['photo-1558904562-f1f1f1f1f1f1', 'photo-1416879595882-3373a0480205', 'photo-1599627516111-1f1f1f1f1f1f'],
    layouts: ['fullscreen-image', 'gallery', 'split-left', 'grid-cards', 'centered', 'stats', 'testimonial', 'timeline', 'logo-wall', 'booking', 'bento'],
  },
  {
    type: 'pet',
    name: 'Pet Services',
    palettes: [
      { tone: '#fffbeb', ink: '#78350f', accent: '#f59e0b' },
      { tone: '#fdf4ff', ink: '#581c87', accent: '#c026d3' },
      { tone: '#f0fdfa', ink: '#134e4a', accent: '#14b8a6' },
      { tone: '#fff7ed', ink: '#7c2d12', accent: '#ea580c' },
    ],
    copies: [
      { eyebrow: 'Loving Care', head: 'Your Pets Deserve the Best', sub: 'Grooming, boarding, and daycare with love.', cta: 'Book Now' },
      { eyebrow: 'Certified Groomers', head: 'Pamper Your Best Friend', sub: 'Professional pet care in a safe, fun environment.', cta: 'Schedule Service' },
      { eyebrow: 'Open 7 Days', head: 'Happy Pets, Happy Owners', sub: 'Everything your pet needs, all in one place.', cta: 'Get Started' },
    ],
    photos: ['photo-1583511655826-1f1f1f1f1f1f', 'photo-1450778869180-41d0601e046e', 'photo-1583337130417-3346a1f1f1f1'],
    layouts: ['gallery', 'booking', 'split-left', 'grid-cards', 'centered', 'testimonial', 'carousel', 'stats', 'minimal', 'bento', 'product-focus'],
  },
  {
    type: 'consulting',
    name: 'Consulting',
    palettes: [
      { tone: '#0a1929', ink: '#ffffff', accent: '#0ea5e9' },
      { tone: '#1a1a2e', ink: '#ffffff', accent: '#c5a572' },
      { tone: '#f8fafc', ink: '#0f172a', accent: '#2563eb' },
      { tone: '#0c1c2e', ink: '#ffffff', accent: '#64748b' },
    ],
    copies: [
      { eyebrow: 'Strategy Consulting', head: 'Clarity in a Complex World', sub: 'We help leaders make decisions that drive growth.', cta: 'Schedule a Call' },
      { eyebrow: 'Trusted Advisors', head: 'Your Partner in Strategy', sub: 'From vision to execution, we guide every step.', cta: 'Get Started' },
      { eyebrow: 'Proven Results', head: 'Insight That Drives Impact', sub: 'Helping organizations navigate change and scale.', cta: 'Book Consultation' },
    ],
    photos: ['photo-1556761175-b413da4b4f1f', 'photo-1573497620053-ea5300f94f1f', 'photo-1521791136701-1f1f1f1f1f1f'],
    layouts: ['centered', 'split-left', 'stats', 'testimonial', 'logo-wall', 'grid-cards', 'timeline', 'sidebar', 'minimal', 'booking', 'bento'],
  },
];

// Generate template records from the taxonomy
export function generateTemplates() {
  const templates = [];
  let counter = 1;

  for (const wt of WEBSITE_TYPES) {
    wt.layouts.forEach((layout, layoutIdx) => {
      const palette = wt.palettes[layoutIdx % wt.palettes.length];
      const copy = wt.copies[layoutIdx % wt.copies.length];
      const photo = wt.photos[layoutIdx % wt.photos.length];

      templates.push({
        template_id: `WT${String(counter).padStart(3, '0')}`,
        name: `${wt.name} ${layoutIdx + 1}`,
        category: 'website',
        industry: wt.type,
        family: `${layout} layout`,
        layout,
        tone: palette.tone,
        ink: palette.ink,
        accent: palette.accent,
        head: copy.head,
        sub: copy.sub,
        eyebrow: copy.eyebrow,
        cta: copy.cta,
        feature: copy.head,
        feature_copy: copy.sub,
        photo,
        source_package: 'website-taxonomy-v2',
      });
      counter++;
    });
  }

  return templates;
}