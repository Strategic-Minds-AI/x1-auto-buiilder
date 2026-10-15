// AI Skills Library — 300 skills across 30 categories
// Shared module imported by seedLibraries backend function

const SKILL_CATEGORIES = [
  { key: 'text_generation', name: 'Text Generation', skills: ['Blog post writing','Article creation','Social media posts','Email drafting','Ad copywriting','Product descriptions','Landing page copy','Press release writing','Newsletter content','Whitepaper drafting'] },
  { key: 'code_generation', name: 'Code Generation', skills: ['Code completion','Bug fixing','Code review','Refactoring assistance','Test generation','Documentation writing','API design','Architecture planning','Debugging assistance','Performance optimization'] },
  { key: 'image_editing', name: 'Image Editing', skills: ['Background removal','Color correction','Object removal','Style transfer','Image upscaling','Photo restoration','Image compression','Format conversion','Smart cropping','Image annotation'] },
  { key: 'data_extraction', name: 'Data Extraction', skills: ['PDF parsing','Table extraction','OCR recognition','Receipt scanning','Invoice processing','Form recognition','Entity extraction','Field mapping','Data cleaning','Data validation'] },
  { key: 'sentiment_analysis', name: 'Sentiment Analysis', skills: ['Social media monitoring','Review analysis','Customer feedback scoring','Brand tracking','Competitor analysis','Market sentiment','Trend detection','Crisis alerting','NPS scoring','Opinion mining'] },
  { key: 'summarization', name: 'Summarization', skills: ['Document summarization','Meeting notes summary','Article digest','Video transcript summary','Email thread summary','Legal brief summary','Financial report summary','Research paper summary','Book summary','News digest'] },
  { key: 'translation', name: 'Translation', skills: ['Document translation','Real-time interpretation','Subtitle generation','Content localization','Transcreation','Glossary management','Quality assessment','Batch translation','Voice translation','Cultural adaptation'] },
  { key: 'speech_transcription', name: 'Speech Transcription', skills: ['Meeting transcription','Interview transcription','Podcast transcription','Video subtitling','Voicemail transcription','Medical transcription','Legal transcription','Real-time captioning','Speaker diarization','Audio indexing'] },
  { key: 'content_optimization', name: 'Content Optimization', skills: ['SEO optimization','Readability improvement','Tone adjustment','Keyword density analysis','Meta description writing','Title optimization','Content scoring','Plagiarism checking','Grammar correction','Style guide enforcement'] },
  { key: 'lead_scoring', name: 'Lead Scoring', skills: ['Behavior scoring','Demographic scoring','Intent detection','Engagement tracking','Pipeline prediction','Conversion likelihood','Churn prediction','Account scoring','Contact scoring','Opportunity scoring'] },
  { key: 'email_automation', name: 'Email Automation', skills: ['Drip campaigns','Welcome series','Onboarding sequence','Re-engagement campaigns','Abandoned cart recovery','Newsletter scheduling','A/B testing','Send time optimization','Subject line optimization','Personalization engine'] },
  { key: 'social_scheduling', name: 'Social Scheduling', skills: ['Content calendar management','Post scheduling','Cross-platform posting','Best time optimization','Hashtag suggestions','Caption generation','Visual selection','Platform adaptation','Story planning','Reel scripting'] },
  { key: 'ad_creative', name: 'Ad Creative', skills: ['Headline generation','Copy variations','Visual suggestions','A/B testing','Audience targeting','Budget optimization','Bid strategy','Campaign structure','Performance prediction','Creative refresh'] },
  { key: 'customer_segmentation', name: 'Customer Segmentation', skills: ['Behavioral segmentation','Demographic segmentation','Geographic segmentation','Psychographic segmentation','Value segmentation','Lifecycle segmentation','Predictive segmentation','Lookalike audiences','Custom audiences','Retargeting lists'] },
  { key: 'price_optimization', name: 'Price Optimization', skills: ['Competitor pricing analysis','Dynamic pricing','Bundle pricing','Tier design','Discount strategy','Margin analysis','Price testing','Elasticity modeling','Revenue optimization','Profit maximization'] },
  { key: 'inventory_forecast', name: 'Inventory Forecast', skills: ['Demand prediction','Stock optimization','Reorder point calculation','Seasonal planning','Trend analysis','Supplier management','Lead time calculation','Safety stock','SKU rationalization','Waste reduction'] },
  { key: 'churn_prevention', name: 'Churn Prevention', skills: ['Risk scoring','Intervention triggers','Win-back campaigns','Satisfaction surveys','Usage monitoring','Engagement scoring','Predictive alerts','Retention offers','Lifecycle marketing','Loyalty programs'] },
  { key: 'recommendation', name: 'Recommendation Engine', skills: ['Product recommendations','Content recommendations','Related items','Cross-sell suggestions','Upsell suggestions','Personalized feed','Similar items','Trending items','Seasonal picks','Bundle suggestions'] },
  { key: 'search_optimization', name: 'Search Optimization', skills: ['Query expansion','Result ranking','Relevance tuning','Faceted search','Autocomplete','Spell correction','Synonym management','Query understanding','Intent detection','Result filtering'] },
  { key: 'workflow_automation', name: 'Workflow Automation', skills: ['Task routing','Approval chains','Status updates','Notification triggers','Data synchronization','File processing','Report generation','Calendar management','Email triage','Document approval'] },
  { key: 'document_generation', name: 'Document Generation', skills: ['Contract generation','Proposal writing','Invoice creation','Report generation','Presentation creation','Spreadsheet building','Form creation','Letter writing','Memo drafting','Policy documentation'] },
  { key: 'data_visualization', name: 'Data Visualization', skills: ['Chart creation','Graph generation','Dashboard building','Heatmap creation','Treemap design','Scatter plot generation','Bar chart creation','Line graph plotting','Pie chart design','Sankey diagram'] },
  { key: 'anomaly_detection', name: 'Anomaly Detection', skills: ['Fraud detection','Outlier identification','Pattern deviation','Threshold alerting','Behavioral anomaly','Network anomaly','System anomaly','Data quality check','Performance anomaly','Security anomaly'] },
  { key: 'forecasting', name: 'Forecasting', skills: ['Revenue forecast','Demand forecast','Traffic forecast','Sales forecast','Weather forecast','Market forecast','Trend forecast','Capacity forecast','Resource forecast','Growth forecast'] },
  { key: 'classification', name: 'Classification', skills: ['Text classification','Image classification','Document classification','Email classification','Support ticket routing','Intent classification','Sentiment classification','Topic classification','Spam detection','Priority classification'] },
  { key: 'entity_recognition', name: 'Entity Recognition', skills: ['Person extraction','Organization extraction','Location extraction','Date extraction','Product extraction','Event extraction','Money extraction','Custom entity','Relationship extraction','Entity linking'] },
  { key: 'question_answering', name: 'Question Answering', skills: ['FAQ automation','Knowledge base search','Document Q&A','Contextual answers','Multi-turn dialogue','Clarifying questions','Source citation','Confidence scoring','Answer ranking','Follow-up suggestions'] },
  { key: 'content_moderation', name: 'Content Moderation', skills: ['Text moderation','Image moderation','Video moderation','Spam filtering','Toxicity detection','NSFW detection','Hate speech detection','PII detection','Copyright check','Compliance check'] },
  { key: 'process_mining', name: 'Process Mining', skills: ['Workflow discovery','Bottleneck analysis','Process compliance','Performance monitoring','Variant analysis','Root cause analysis','Process simulation','Conformance checking','Event log analysis','Process optimization'] },
  { key: 'risk_assessment', name: 'Risk Assessment', skills: ['Credit risk scoring','Operational risk','Market risk analysis','Compliance risk','Security risk','Reputation risk','Strategic risk','Financial risk','Vendor risk','Project risk'] },
];

const COMPLEXITY_LEVELS = ['simple', 'moderate', 'advanced', 'expert'];
const IMPL_TYPES = ['prompt', 'api', 'function', 'workflow', 'model', 'pipeline'];

export function generateAISkills() {
  const skills = [];
  let counter = 1;
  for (const cat of SKILL_CATEGORIES) {
    cat.skills.forEach((skillName, i) => {
      skills.push({
        skill_id: `AS${String(counter).padStart(3, '0')}`,
        name: skillName,
        category: cat.key,
        description: `${skillName} — AI skill for ${cat.name.toLowerCase()} that can be integrated into any AI system`,
        input_schema: { type: 'object', properties: { input: { type: 'string', description: 'Input data for ' + skillName } }, required: ['input'] },
        output_schema: { type: 'object', properties: { result: { type: 'string', description: 'Generated output' }, confidence: { type: 'number' } } },
        implementation_type: IMPL_TYPES[i % IMPL_TYPES.length],
        complexity: COMPLEXITY_LEVELS[i % COMPLEXITY_LEVELS.length],
        integration_points: ['API endpoint', 'Workflow step', 'Agent tool', 'Pipeline stage'],
        example_use_cases: [`${skillName} for business automation`, `${skillName} for data processing`, `${skillName} for customer engagement`],
        required_tools: ['LLM API', 'Data processor'],
        model_requirements: 'Any modern LLM (GPT-4, Claude, Gemini) or specialized model',
      });
      counter++;
    });
  }
  return skills;
}