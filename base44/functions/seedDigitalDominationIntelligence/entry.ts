import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import {
  GOOGLE_RULES, EMERGENCY_VERTICALS, URL_OPPORTUNITIES, CORE_SERVICES,
  RISK_REGISTER, QA_GATES, AGENT_SWARM, TEMPLATE_FAMILIES, GROWTH_PLAYBOOK,
  SCALE_STAGES, COMPLIANCE_CHECKLIST, KPI_SCORECARD, DESIGN_STYLES,
  BUYER_SEGMENTS, SERVICE_FUNNELS, PERSISTENCE_RULES, EVIDENCE_POLICY,
  GPT_SYNC_API, DIFFERENTIATION_LAYERS, TECHNICAL_SEO_QA, SOURCE_REGISTRY
} from '../../shared/digitalDominationIntelligence.js';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });

    const results = { workbooks: 0, keywords: 0, agents: 0, questions: 0, risks: 0, metrics: 0, useCases: 0, errors: [] };

    // === 1. IntelligenceWorkbook records ===
    const workbookRecords = [
      ...GOOGLE_RULES.map((r, i) => ({
        workbook_id: `DD-GOOGLE-${String(i + 1).padStart(3, '0')}`,
        title: `Google Rule: ${r.rule}`,
        category: 'GOVERNANCE',
        phase: 'DISCOVERY',
        priority: r.priority === 'Critical' ? 'P0' : 'P1',
        intended_outcome: r.requirement,
        first_question: `Does this page comply with the Google rule "${r.rule}" (${r.status})?`,
        filename: 'Digital_Dominance_Master_Workbook.xlsx',
        artifact_status: 'POPULATED_SPEC',
        system_installed: true,
        how_to_consume: `Apply during content generation and QA validation. Status: ${r.status}.`,
        key_prerequisite: 'Source truth verified',
        routing_rule: 'Apply to every generated page before release',
        sheets_summary: `Rule ${i + 1} of ${GOOGLE_RULES.length}: ${r.rule}`,
        install_notes: `Source: ${r.source}`,
      })),
      ...TEMPLATE_FAMILIES.map((t, i) => ({
        workbook_id: `DD-TEMPLATE-${String(i + 1).padStart(3, '0')}`,
        title: `Template Family: ${t.family}`,
        category: 'BUILD',
        phase: 'BUILD',
        priority: 'P1',
        intended_outcome: `Visual pattern: ${t.pattern}. Blocks: ${t.blocks}. CTA: ${t.cta}.`,
        first_question: `Does this industry match the "${t.family}" template family?`,
        filename: 'APEX_DIGITAL_DOMINANCE_FORENSIC_MASTER_BLUEPRINT.xlsx',
        artifact_status: 'POPULATED_SPEC',
        system_installed: true,
        how_to_consume: `Use for verticals: ${t.vertical}. Data requirement: ${t.dataReq}.`,
        key_prerequisite: 'Real proof and verified data',
        routing_rule: `Release gate: ${t.gate}`,
        sheets_summary: `Family ${i + 1}: ${t.family}`,
        install_notes: `CTA: ${t.cta}`,
      })),
      ...GROWTH_PLAYBOOK.map((g, i) => ({
        workbook_id: `DD-GROWTH-${String(i + 1).padStart(3, '0')}`,
        title: `Growth Lever: ${g.lever}`,
        category: 'LAUNCH',
        phase: 'LAUNCH',
        priority: 'P1',
        intended_outcome: g.action,
        first_question: `Is the "${g.lever}" lever implemented and passing its gate?`,
        filename: 'APEX_DIGITAL_DOMINANCE_FORENSIC_MASTER_BLUEPRINT.xlsx',
        artifact_status: 'POPULATED_SPEC',
        system_installed: true,
        how_to_consume: `Category: ${g.category}. Gate: ${g.gate}.`,
        key_prerequisite: 'Source truth and content differentiation',
        routing_rule: 'Apply before any page goes live',
        sheets_summary: `Lever ${i + 1}: ${g.lever}`,
        install_notes: g.gate,
      })),
      ...SCALE_STAGES.map((s, i) => ({
        workbook_id: `DD-SCALE-${String(i).padStart(3, '0')}`,
        title: `Scale Wave ${s.wave}: ${s.scope}`,
        category: 'OPERATIONS',
        phase: 'LAUNCH',
        priority: s.wave <= 1 ? 'P0' : 'P2',
        intended_outcome: s.scope,
        first_question: `Are all preconditions met for Wave ${s.wave}?`,
        filename: 'APEX_DIGITAL_DOMINANCE_FORENSIC_MASTER_BLUEPRINT.xlsx',
        artifact_status: 'POPULATED_SPEC',
        system_installed: true,
        how_to_consume: `Preconditions: ${s.preconditions}. Proof: ${s.proof}.`,
        key_prerequisite: s.preconditions,
        routing_rule: `Stop threshold: ${s.stop}`,
        sheets_summary: `Wave ${s.wave}`,
        install_notes: `Action: ${s.action}`,
      })),
      ...PERSISTENCE_RULES.map((p, i) => ({
        workbook_id: `DD-PERSIST-${String(i + 1).padStart(3, '0')}`,
        title: `Persistence: ${p.component}`,
        category: 'OPERATIONS',
        phase: 'BUILD',
        priority: 'P1',
        intended_outcome: p.rule,
        first_question: `Is the "${p.component}" persistence rule implemented?`,
        filename: 'Digital_Dominance_Master_Workbook.xlsx',
        artifact_status: 'POPULATED_SPEC',
        system_installed: true,
        how_to_consume: p.rule,
        key_prerequisite: 'Queue and worker infrastructure',
        routing_rule: 'Apply to all automated jobs',
        sheets_summary: `Component ${i + 1}: ${p.component}`,
        install_notes: p.rule,
      })),
      ...EVIDENCE_POLICY.map((e, i) => ({
        workbook_id: `DD-EVIDENCE-${String(i + 1).padStart(3, '0')}`,
        title: `Evidence Policy: ${e.rule}`,
        category: 'GOVERNANCE',
        phase: 'QA',
        priority: 'P0',
        intended_outcome: e.action,
        first_question: `Is the evidence policy "${e.rule}" enforced?`,
        filename: 'DIGITAL_DOMINANCE_P0_MASTER_PROVISIONING_CHECKLIST.xlsx',
        artifact_status: 'POPULATED_SPEC',
        system_installed: true,
        how_to_consume: e.action,
        key_prerequisite: 'Independent QA process',
        routing_rule: 'Block release if evidence is missing or fabricated',
        sheets_summary: `Policy ${i + 1}`,
        install_notes: e.rule,
      })),
      ...DIFFERENTIATION_LAYERS.map((d, i) => ({
        workbook_id: `DD-DIFF-${String(i + 1).padStart(3, '0')}`,
        title: `Differentiation: ${d.layer}`,
        category: 'BUILD',
        phase: 'BUILD',
        priority: d.requirement === 'Required' ? 'P0' : 'P1',
        intended_outcome: `Examples: ${d.examples}. Requirement: ${d.requirement}.`,
        first_question: `Does this page include the "${d.layer}" differentiation layer?`,
        filename: 'Digital_Dominance_Master_Workbook.xlsx',
        artifact_status: 'POPULATED_SPEC',
        system_installed: true,
        how_to_consume: `Requirement level: ${d.requirement}. Examples: ${d.examples}.`,
        key_prerequisite: 'Real industry and local data',
        routing_rule: 'Generation gate checks all required layers',
        sheets_summary: `Layer ${i + 1}: ${d.layer}`,
        install_notes: d.requirement,
      })),
      ...SERVICE_FUNNELS.map((f, i) => ({
        workbook_id: `DD-FUNNEL-${String(i + 1).padStart(3, '0')}`,
        title: `Funnel: ${f.funnel}`,
        category: 'BUILD',
        phase: 'BUILD',
        priority: 'P1',
        intended_outcome: `Layout: ${f.layout}. CTA: ${f.cta}.`,
        first_question: `Which funnel pattern best matches this industry's buyer intent?`,
        filename: 'Digital_Dominance_Master_Workbook.xlsx',
        artifact_status: 'POPULATED_SPEC',
        system_installed: true,
        how_to_consume: `Apply layout: ${f.layout}`,
        key_prerequisite: 'Industry and buyer intent identified',
        routing_rule: 'Match funnel to buyer archetype',
        sheets_summary: `Funnel ${i + 1}: ${f.funnel}`,
        install_notes: `Primary CTA: ${f.cta}`,
      })),
      ...GPT_SYNC_API.map((a, i) => ({
        workbook_id: `DD-GPTAPI-${String(i + 1).padStart(3, '0')}`,
        title: `GPT Sync API: ${a.method} ${a.endpoint}`,
        category: 'CORE EXISTING',
        phase: 'BUILD',
        priority: 'P1',
        intended_outcome: a.contract,
        first_question: `Is the ${a.method} ${a.endpoint} endpoint implemented with scope ${a.scope}?`,
        filename: 'APEX_DIGITAL_DOMINANCE_FORENSIC_MASTER_BLUEPRINT.xlsx',
        artifact_status: 'POPULATED_SPEC',
        system_installed: true,
        how_to_consume: `Contract: ${a.contract}. Proof: ${a.proof}.`,
        key_prerequisite: 'Authenticated API gateway',
        routing_rule: `Security: ${a.security}`,
        sheets_summary: `Endpoint ${i + 1}`,
        install_notes: a.security,
      })),
      {
        workbook_id: 'DD-SOURCE-REGISTRY',
        title: 'Digital Dominance Source Registry',
        category: 'DOCS',
        phase: 'DISCOVERY',
        priority: 'P0',
        intended_outcome: 'Immutable source registry of all uploaded workbooks and archives',
        first_question: 'Are all source artifacts verified and hashed?',
        filename: 'APEX_DIGITAL_DOMINANCE_FORENSIC_MASTER_BLUEPRINT.xlsx',
        artifact_status: 'POPULATED_SPEC',
        system_installed: true,
        how_to_consume: 'Reference for all source truth verification',
        key_prerequisite: 'All workbooks uploaded and verified',
        routing_rule: 'Verify source before any production action',
        sheets_summary: JSON.stringify(SOURCE_REGISTRY),
        install_notes: 'All artifacts VERIFIED_LOCAL',
      },
    ];

    // === 2. KeywordCandidate records ===
    const keywordRecords = [
      ...CORE_SERVICES.map((s, i) => ({
        keyword_id: `KW-CORE-${String(i + 1).padStart(3, '0')}`,
        industry: s.vertical,
        search_phrase: `${s.service} near me`,
        intent: 'Transactional',
        geo_caution: 'LOCAL INTENT',
        industry_context: `Core service rank ${s.rank}. Vertical: ${s.vertical}. Emergency: ${s.emergency ? 'Yes' : 'No'}.`,
        validate_with: 'Google Ads historical metrics + GSC data',
        monthly_searches: s.monthlySearch,
        competition: null,
        top_page_bid: null,
        modeled_evidence_score: s.leadValue * 10,
        status: 'RESEARCH_CANDIDATE',
        source_url: 'https://github.com/Strategic-Minds-AI/strategic-digital-dominance',
        modifier_group: 'Near Me',
        reusable_suffix: 'near me',
      })),
      ...URL_OPPORTUNITIES.map((u, i) => ({
        keyword_id: `KW-URL-${String(i + 1).padStart(3, '0')}`,
        industry: u.vertical,
        search_phrase: u.service,
        intent: 'Transactional',
        geo_caution: 'LOCAL INTENT',
        industry_context: `Rank ${u.rank}. Buyer: ${u.buyer}. CPC: $${u.cpc}. CPL: $${u.cpl}.`,
        validate_with: 'Google Ads historical metrics + GSC data',
        monthly_searches: null,
        competition: null,
        top_page_bid: u.cpc,
        modeled_evidence_score: u.urgency * 10 + u.buyerValue * 10,
        status: 'RESEARCH_CANDIDATE',
        source_url: 'https://localiq.com/blog/home-services-search-advertising-benchmarks/',
        modifier_group: 'Service',
        reusable_suffix: u.pattern,
      })),
      ...EMERGENCY_VERTICALS.map((v, i) => ({
        keyword_id: `KW-EMERG-${String(i + 1).padStart(3, '0')}`,
        industry: 'Home Emergency',
        search_phrase: `emergency ${v.vertical.toLowerCase()} near me`,
        intent: 'Transactional',
        geo_caution: 'LOCAL INTENT — EMERGENCY',
        industry_context: `Rank ${v.rank}. Composite: ${v.composite}. Lead value: ${v.leadValue}. Urgency: ${v.urgency}.`,
        validate_with: 'Google Ads historical metrics + GSC data',
        monthly_searches: null,
        competition: null,
        top_page_bid: null,
        modeled_evidence_score: v.composite * 10,
        status: 'RESEARCH_CANDIDATE',
        source_url: 'Digital_Dominance_Master_Workbook.xlsx',
        modifier_group: 'Emergency',
        reusable_suffix: 'emergency',
      })),
    ];

    // === 3. AgentPlaybook records ===
    const agentRecords = AGENT_SWARM.map((a, i) => ({
      agent_id: `AG-${String(i + 1).padStart(3, '0')}`,
      pod: i < 2 ? 'Strategy' : i < 4 ? 'Discovery' : i < 7 ? 'Build' : i < 9 ? 'QA' : 'Operations',
      agent_name: a.role,
      system_prompt: `You are the ${a.role} in the Digital Dominance system. Input: ${a.input}. Output: ${a.output}. Authority: ${a.authority}. KPI: ${a.kpi}. Never fabricate evidence. Always produce real, verifiable output.`,
      inputs: a.input,
      tool_route: 'Base44 SDK + industry intelligence + Google compliance rules',
      allowed_authority: a.authority,
      definition_of_success: `Produce ${a.output} with zero fabricated evidence`,
      required_proof: 'Immutable receipt with evidence references',
      failure_escalation: 'Escalate to APEX supervisor on failure or missing evidence',
      governance_rule: a.authority,
      installation_state: 'INSTALLED',
    }));

    // === 4. IntelligenceQuestion records ===
    const questionRecords = [
      ...COMPLIANCE_CHECKLIST.map((c, i) => ({
        question_id: `DD-COMP-Q${String(i + 1).padStart(2, '0')}`,
        intelligence_area: 'Compliance',
        question: `Does the page pass the "${c.control}" compliance check?`,
        required_evidence: c.pass,
        verification_method: 'Automated compliance scan + manual review',
        expected_answer_format: 'Answer: PASS/FAIL + evidence + impact + confidence + next action',
        module_workbook: 'Digital_Dominance_Master_Workbook.xlsx',
        answer_status: 'NOT_ANSWERED',
        priority: 'P0',
      })),
      ...TECHNICAL_SEO_QA.map((t, i) => ({
        question_id: `DD-TECH-Q${String(i + 1).padStart(2, '0')}`,
        intelligence_area: 'Technical SEO',
        question: `Does the page pass the "${t.check}" technical SEO check?`,
        required_evidence: t.pass,
        verification_method: 'Automated SEO audit + Rich Results Test',
        expected_answer_format: 'Answer: PASS/FAIL + evidence + impact + confidence + next action',
        module_workbook: 'Digital_Dominance_Master_Workbook.xlsx',
        answer_status: 'NOT_ANSWERED',
        priority: t.gate === 'Block release' ? 'P0' : 'P1',
      })),
      ...DIFFERENTIATION_LAYERS.map((d, i) => ({
        question_id: `DD-DIFF-Q${String(i + 1).padStart(2, '0')}`,
        intelligence_area: 'Content Differentiation',
        question: `Does the page include the "${d.layer}" differentiation layer?`,
        required_evidence: `Examples: ${d.examples}`,
        verification_method: 'Content quality scan + prompt validation agent',
        expected_answer_format: 'Answer: YES/NO + evidence + impact + confidence + next action',
        module_workbook: 'Digital_Dominance_Master_Workbook.xlsx',
        answer_status: 'NOT_ANSWERED',
        priority: d.requirement === 'Required' ? 'P0' : 'P1',
      })),
    ];

    // === 5. RiskControl records ===
    const riskRecords = [
      ...RISK_REGISTER.map(r => ({
        risk_id: r.id,
        risk: r.risk,
        control_stage: 'Prevention',
        failure_scenario: r.risk,
        mitigation: r.mitigation,
        default_severity: r.severity,
        owner: 'Guardian',
        current_evidence: 'Workbook-verified',
        source_reference: 'APEX_DIGITAL_DOMINANCE_FORENSIC_MASTER_BLUEPRINT.xlsx',
        status: 'OPEN',
      })),
      ...COMPLIANCE_CHECKLIST.map((c, i) => ({
        risk_id: `RISK-COMP-${String(i + 1).padStart(3, '0')}`,
        risk: `Compliance failure: ${c.control}`,
        control_stage: 'Detection',
        failure_scenario: `Page fails: ${c.pass}`,
        mitigation: c.pass,
        default_severity: 'HIGH',
        owner: 'Compliance validator',
        current_evidence: 'Checklist defined',
        source_reference: 'Digital_Dominance_Master_Workbook.xlsx',
        status: 'OPEN',
      })),
    ];

    // === 6. MetricDefinition records ===
    const metricRecords = KPI_SCORECARD.map((k, i) => ({
      metric_id: `MET-${String(i + 1).padStart(3, '0')}`,
      area: k.category,
      kpi: k.kpi,
      definition: `Unit: ${k.unit}. Cadence: ${k.cadence}.`,
      qualification: `Measured ${k.cadence.toLowerCase()}`,
      authoritative_source: k.category === 'Visibility' || k.category === 'Discovery' || k.category === 'Crawl' || k.category === 'Indexation' ? 'GSC' : k.category === 'Engagement' || k.category === 'Conversion' ? 'GA4' : k.category === 'Revenue' ? 'CRM' : 'X1 ledger',
      statistical_honesty: 'Never invent sample size; use first-party data only',
      status: 'CONFIGURED',
      current_value: null,
      target_value: null,
      unit: k.unit,
    }));

    // === 7. IndustryUseCase records ===
    const useCaseRecords = EMERGENCY_VERTICALS.slice(0, 15).map((v, i) => ({
      use_case_id: `X1-01-01-${String(i + 1).padStart(2, '0')}`,
      industry: 'Home Emergency',
      subindustry: v.vertical,
      system_archetype: 'Autonomous Intake & Qualification Engine',
      system_idea: `${v.vertical} lead generation and dispatch system with 24/7 emergency response`,
      core_outcome: `Capture and qualify ${v.vertical} leads with verified local proof`,
      frontend_surfaces: 'Landing page + emergency call CTA + service area + FAQ + contact form',
      backend_components: 'Lead capture + qualification + dispatch routing + analytics',
      agents_ai: 'Market research + content generation + prompt validation + compliance validator',
      key_connectors: 'GSC + GA4 + CRM + Twilio',
      autonomy_score: 4,
      monetization_score: Math.round(v.composite),
      complexity_score: 3,
      repeatability_score: 4,
      monetization_model: 'Per qualified lead / exclusive territory',
      setup_price: 2500,
      monthly_price: 500,
      risk_class: v.risk.includes('YMYL') ? 'HIGH' : 'MEDIUM',
      protected_gates: 'Compliance checklist + content differentiation + deployment receipt',
      recommended_stack: 'Base44 + Vercel + Supabase + GSC + GA4',
      opportunity_score: Math.round(v.composite * 10),
      status: 'available',
    }));

    // Bulk create all records in parallel batches
    const batches = [
      { entity: 'IntelligenceWorkbook', records: workbookRecords, key: 'workbooks' },
      { entity: 'KeywordCandidate', records: keywordRecords, key: 'keywords' },
      { entity: 'AgentPlaybook', records: agentRecords, key: 'agents' },
      { entity: 'IntelligenceQuestion', records: questionRecords, key: 'questions' },
      { entity: 'RiskControl', records: riskRecords, key: 'risks' },
      { entity: 'MetricDefinition', records: metricRecords, key: 'metrics' },
      { entity: 'IndustryUseCase', records: useCaseRecords, key: 'useCases' },
    ];

    // Process in batches of 6 parallel calls, 500 records per bulkCreate
    for (const batch of batches) {
      try {
        const chunks = [];
        for (let i = 0; i < batch.records.length; i += 500) {
          chunks.push(batch.records.slice(i, i + 500));
        }
        const chunkResults = await Promise.allSettled(
          chunks.map(chunk => base44.asServiceRole.entities[batch.entity].bulkCreate(chunk))
        );
        let created = 0;
        chunkResults.forEach(r => {
          if (r.status === 'fulfilled') {
            const val = r.value;
            if (Array.isArray(val)) created += val.length;
            else if (val?.created) created += val.created;
            else if (val?.records) created += val.records.length;
          } else {
            results.errors.push(`${batch.entity} chunk failed: ${r.reason?.message || r.reason}`);
          }
        });
        results[batch.key] = created;
      } catch (e) {
        results.errors.push(`${batch.entity}: ${e.message}`);
      }
    }

    return Response.json({
      success: true,
      message: 'Digital Domination intelligence installed',
      results,
      sourceArtifacts: Object.keys(SOURCE_REGISTRY).length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}