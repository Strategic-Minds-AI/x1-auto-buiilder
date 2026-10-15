// AI Tools Library — 300 tools across 30 categories
// Shared module imported by seedLibraries backend function

const TOOL_CATEGORIES = [
  { key: 'content_generation', name: 'Content Generation', tools: ['Jasper AI','Copy.ai','Writesonic','Rytr','Anyword','Peppertype','ContentBot','Article Forge','AI Writer','Texta'] },
  { key: 'code_generation', name: 'Code Generation', tools: ['GitHub Copilot','Tabnine','Codeium','Cursor','Sourcegraph Cody','Amazon Q','CodiumAI','Mutable AI','CodeT5','AlphaCode'] },
  { key: 'image_generation', name: 'Image Generation', tools: ['Midjourney','DALL-E 3','Stable Diffusion','Leonardo AI','Adobe Firefly','Ideogram','RunwayML','Jasper Art','Canva AI','Photoroom'] },
  { key: 'video_generation', name: 'Video Generation', tools: ['Runway','Synthesia','Pictory','Descript','HeyGen','InVideo','Lumen5','Elai','DeepBrain','Fliki'] },
  { key: 'audio_generation', name: 'Audio Generation', tools: ['ElevenLabs','Murf','PlayHT','Resemble AI','Speechify','LOVO AI','Wellsaid','Replica','Coqui','Descript Voice'] },
  { key: 'data_analysis', name: 'Data Analysis', tools: ['Tableau AI','Power BI Copilot','ThoughtSpot','Akkio','Obviously AI','Julius AI','Polymer','Rows','Equals','Gigasheet'] },
  { key: 'nlp', name: 'Natural Language Processing', tools: ['OpenAI GPT','Anthropic Claude','Google Gemini','Cohere','Hugging Face','AI21 Labs','Mistral AI','Perplexity','You.com','Phind'] },
  { key: 'computer_vision', name: 'Computer Vision', tools: ['Google Vision','Amazon Rekognition','Azure Computer Vision','Clarifai','Roboflow','Scale AI','Labelbox','V7','SuperAnnotate','Hive AI'] },
  { key: 'speech', name: 'Speech Recognition', tools: ['OpenAI Whisper','Deepgram','AssemblyAI','Otter.ai','Rev','Speechmatics','Voiceflow','SoundHound','Nuance','Verbit'] },
  { key: 'translation', name: 'Translation', tools: ['DeepL','Google Translate','Amazon Translate','Azure Translator','Unbabel','Lilt','Smartling','Phrase','Memsource','Weglot'] },
  { key: 'chatbot', name: 'Chatbot Platforms', tools: ['Intercom Fin','Drift','Tidio','ManyChat','Chatfuel','MobileMonkey','Landbot','Botpress','Rasa','Dialogflow'] },
  { key: 'assistant', name: 'AI Assistants', tools: ['ChatGPT','Claude','Gemini','Microsoft Copilot','Perplexity','Notion AI','Cursor','Replit AI','GitHub Copilot','You.com'] },
  { key: 'knowledge_mgmt', name: 'Knowledge Management', tools: ['Notion AI','Mem','Obsidian','Roam Research','Guru','Slite','Tettra','Slab','Document360','Confluence'] },
  { key: 'seo', name: 'SEO Optimization', tools: ['Surfer SEO','Clearscope','Frase','MarketMuse','Semrush','Ahrefs','SE Ranking','SEObility','Outranking','NeuronWriter'] },
  { key: 'marketing', name: 'Marketing Automation', tools: ['HubSpot AI','Salesforce Einstein','Adobe Marketo','Pardot','ActiveCampaign','Mailchimp','Klaviyo','Braze','Iterable','Optimizely'] },
  { key: 'sales', name: 'Sales Intelligence', tools: ['Gong','Chorus.ai','Outreach','Salesloft','Apollo','ZoomInfo','LinkedIn Sales Navigator','HubSpot Sales','Pipedrive','Freshsales'] },
  { key: 'customer_support', name: 'Customer Support AI', tools: ['Zendesk AI','Intercom','Freshdesk','Help Scout','Ada','Forethought','Decagon','Sierra','Cresta','Glia'] },
  { key: 'design', name: 'AI Design Tools', tools: ['Figma AI','Canva','Adobe Express','Framer AI','Webflow AI','Uizard','Galileo AI','Khroma','Coolors','Fontjoy'] },
  { key: 'prototyping', name: 'Prototyping Tools', tools: ['Framer','Webflow','Bubble','Adalo','Glide','Draftbit','Backendless','Outsystems','Mendix','Retool AI'] },
  { key: 'testing', name: 'AI Testing', tools: ['Testim','Mabl','Applitools','Perfecto','Sauce Labs','BrowserStack','LambdaTest','Katalon','Cypress','Playwright'] },
  { key: 'devops', name: 'DevOps Monitoring', tools: ['Datadog','New Relic','Splunk','Grafana','Prometheus','PagerDuty','Statuspage','Sentry','Rollbar','Bugsnag'] },
  { key: 'automation', name: 'Workflow Automation', tools: ['Zapier','Make','n8n','Workato','Tray.io','Pipedream','Bardeen','Activepieces','Relay.app','Parabola'] },
  { key: 'research', name: 'AI Research', tools: ['Perplexity','Elicit','Consensus','SciSpace','Semantic Scholar','Connected Papers','Research Rabbit','Litmaps','Inciteful','Scite'] },
  { key: 'analytics', name: 'Web Analytics', tools: ['Google Analytics 4','Mixpanel','Amplitude','Heap','PostHog','Plausible','Fathom','Vercel Analytics','Simple Analytics','Matomo'] },
  { key: 'security', name: 'Security Scanning', tools: ['Snyk','SonarQube','Veracode','Checkmarx','CrowdStrike','Wiz','Lacework','Prisma Cloud','Aqua Security','Sysdig'] },
  { key: 'database', name: 'AI Database', tools: ['Supabase','PlanetScale','Neon','Turso','Xata','Convex','Fauna','MongoDB Atlas','Prisma','Drizzle'] },
  { key: 'cloud', name: 'Cloud Platforms', tools: ['Vercel','Netlify','Railway','Render','Fly.io','Cloudflare Workers','AWS','Google Cloud','Azure','DigitalOcean'] },
  { key: 'collaboration', name: 'Team Collaboration', tools: ['Slack AI','Microsoft Teams','Notion','Asana AI','Monday.com','ClickUp','Linear','Jira','Trello','Basecamp'] },
  { key: 'productivity', name: 'AI Productivity', tools: ['Todoist AI','TickTick','Things 3','OmniFocus','Superhuman','Shortwave','Motion','Reclaim','Sunsama','Akiflow'] },
  { key: 'education', name: 'AI Education', tools: ['Khan Academy AI','Duolingo Max','Coursera AI','Udemy AI','edX','Brilliant','Skillshare','MasterClass','Pluralsight','LinkedIn Learning'] },
];

const INTEGRATION_TYPES = ['api','sdk','webhook','rest','oauth','cli','graphql'];
const PRICING_MODELS = ['free','freemium','paid','enterprise','usage_based'];
const CAPABILITY_TEMPLATES = {
  content_generation: ['Long-form content','Brand voice','SEO optimization','Multi-language'],
  code_generation: ['Code completion','Bug detection','Refactoring','Test generation'],
  image_generation: ['Text-to-image','Style transfer','Inpainting','Upscaling'],
  video_generation: ['Text-to-video','Avatar creation','Auto-editing','Subtitles'],
  audio_generation: ['Text-to-speech','Voice cloning','Music generation','Audio editing'],
  data_analysis: ['Predictive analytics','Data visualization','Anomaly detection','Forecasting'],
  nlp: ['Text understanding','Sentiment analysis','Entity extraction','Summarization'],
  computer_vision: ['Object detection','Image classification','OCR','Facial recognition'],
  speech: ['Speech-to-text','Real-time transcription','Speaker ID','Voice commands'],
  translation: ['Real-time translation','Document translation','Localization','Glossary'],
  chatbot: ['Conversational AI','Intent detection','Multi-turn dialogue','Handoff'],
  assistant: ['Task automation','Knowledge retrieval','Code assistance','Research'],
  knowledge_mgmt: ['Document search','Knowledge base','Auto-tagging','Linking'],
  seo: ['Keyword research','Content scoring','SERP analysis','Backlink tracking'],
  marketing: ['Campaign automation','Lead scoring','Email sequences','Attribution'],
  sales: ['Call analysis','Pipeline management','Lead enrichment','Forecasting'],
  customer_support: ['Ticket routing','Auto-response','Sentiment detection','Resolution'],
  design: ['Auto-layout','Color suggestions','Component generation','Design-to-code'],
  prototyping: ['No-code builder','AI generation','Responsive preview','Export'],
  testing: ['Auto-test generation','Visual regression','Cross-browser','Load testing'],
  devops: ['Log analysis','Anomaly detection','Auto-scaling','Incident response'],
  automation: ['Workflow builder','App integration','Data sync','Trigger actions'],
  research: ['Literature search','Citation analysis','Data extraction','Summarization'],
  analytics: ['Traffic analysis','Funnel tracking','Cohort analysis','Real-time stats'],
  security: ['Vulnerability scanning','Threat detection','Compliance check','Code analysis'],
  database: ['Query optimization','Schema design','Migration','Backup'],
  cloud: ['Auto-deploy','Scaling','Edge functions','CI/CD'],
  collaboration: ['Task management','Real-time editing','AI summaries','Smart search'],
  productivity: ['Task prioritization','Schedule optimization','Focus mode','Auto-organize'],
  education: ['Personalized learning','Progress tracking','Quiz generation','Tutoring'],
};

export function generateAITools() {
  const tools = [];
  let counter = 1;
  for (const cat of TOOL_CATEGORIES) {
    cat.tools.forEach((toolName, i) => {
      const slug = toolName.toLowerCase().replace(/[^a-z0-9]/g, '');
      tools.push({
        tool_id: `AT${String(counter).padStart(3, '0')}`,
        name: toolName,
        category: cat.key,
        description: `${toolName} — AI-powered ${cat.name.toLowerCase()} platform for scalable business integration`,
        provider: toolName.split(/[\s.]/)[0],
        capabilities: CAPABILITY_TEMPLATES[cat.key] || ['AI-powered', 'Scalable', 'Integration-ready'],
        integration_type: INTEGRATION_TYPES[i % INTEGRATION_TYPES.length],
        pricing_model: PRICING_MODELS[i % PRICING_MODELS.length],
        use_cases: [cat.name, 'Business automation', 'Integration', 'Scaling'],
        website_url: `https://${slug}.com`,
        api_docs_url: `https://docs.${slug}.com`,
        popularity_score: 98 - (i * 2) - (counter % 3),
        skill_tags: [cat.key, 'ai', 'automation', 'integration'],
      });
      counter++;
    });
  }
  return tools;
}