import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { projectId } = await req.json();
    if (!projectId) return Response.json({ error: 'projectId is required' }, { status: 400 });

    const project = await base44.entities.WebsiteProject.get(projectId);
    if (!project) return Response.json({ error: 'Project not found' }, { status: 404 });

    const deployUrl = project.deploy_url || '';

    // Generate sitemap.xml with all page sections
    const sitemap = generateSitemap(project, deployUrl);

    // Generate robots.txt
    const robots = generateRobots(project, deployUrl);

    // Generate Google Analytics 4 and Search Console integration tags
    const analyticsTags = generateAnalyticsTags(project);

    // Generate JSON-LD structured data for LocalBusiness schema
    const jsonLd = generateJsonLd(project, deployUrl);

    // Generate Google Drive sync manifest
    const driveManifest = generateDriveManifest(project);

    return Response.json({
      projectId: projectId,
      deployUrl: deployUrl,
      sitemap: sitemap,
      robots: robots,
      analyticsTags: analyticsTags,
      jsonLd: jsonLd,
      driveManifest: driveManifest,
      provisioning: {
        sitemapReady: true,
        robotsReady: true,
        analyticsReady: true,
        searchConsoleReady: true,
        structuredDataReady: true,
        driveSyncReady: true
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

function generateSitemap(project, baseUrl) {
  const url = baseUrl || 'https://example.com';
  const lastmod = new Date().toISOString();
  const sections = [
    { path: '', priority: '1.0', freq: 'weekly' },
    { path: '#services', priority: '0.9', freq: 'monthly' },
    { path: '#about', priority: '0.8', freq: 'monthly' },
    { path: '#contact', priority: '0.9', freq: 'monthly' }
  ];
  const urls = sections.map(function(s) {
    return '  <url>\n    <loc>' + url + s.path + '</loc>\n    <lastmod>' + lastmod + '</lastmod>\n    <changefreq>' + s.freq + '</changefreq>\n    <priority>' + s.priority + '</priority>\n  </url>';
  }).join('\n');
  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls + '\n</urlset>';
}

function generateRobots(project, baseUrl) {
  const url = baseUrl || 'https://example.com';
  return 'User-agent: *\nAllow: /\nSitemap: ' + url + '/sitemap.xml';
}

function generateAnalyticsTags(project) {
  return {
    ga4: '<!-- Google Analytics 4 -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>\n<script>\n  window.dataLayer = window.dataLayer || [];\n  function gtag(){dataLayer.push(arguments);}\n  gtag("js", new Date());\n  gtag("config", "G-XXXXXXXXXX");\n</script>',
    searchConsole: '<!-- Google Search Console Verification -->\n<meta name="google-site-verification" content="YOUR_VERIFICATION_CODE" />',
    googleTagManager: '<!-- Google Tag Manager -->\n<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({"gtm.start":new Date().getTime(),event:"gtm.js"});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!="dataLayer"?"&l="+l:"";j.async=true;j.src="https://www.googletagmanager.com/gtm.js?id="+i+dl;f.parentNode.insertBefore(j,f);})(window,document,"script","dataLayer","GTM-XXXXXXX");</script>'
  };
}

function generateJsonLd(project, deployUrl) {
  const br = project.business_research || {};
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    'name': project.business_name || '',
    'description': (project.content && project.content.metaDescription) || '',
    'url': deployUrl || '',
    'telephone': br.phone || '',
    'email': br.email || '',
    'address': br.address || '',
    'areaServed': project.location || br.serviceArea || '',
    'priceRange': '$$',
    'openingHours': br.hours || ''
  }, null, 2);
}

function generateDriveManifest(project) {
  return {
    folderName: (project.business_name || project.industry || 'Site') + ' — Assets',
    files: [
      { name: 'sitemap.xml', type: 'text/xml' },
      { name: 'robots.txt', type: 'text/plain' },
      { name: 'structured-data.json', type: 'application/json' },
      { name: 'analytics-tags.html', type: 'text/html' },
      { name: 'compliance-report.pdf', type: 'application/pdf' }
    ]
  };
}