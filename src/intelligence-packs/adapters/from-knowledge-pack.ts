/**
 * Bridge existing Executive Knowledge Packs into EIPF.
 * Field Services (and future legacy packs) plug in without Core changes.
 */

import type { ExecutiveKnowledgePack } from "@/platform/contracts/knowledge-pack";
import type { CouncilRoleId } from "@/experience/executive-council/members";
import { defineIntelligencePack } from "@/intelligence-packs/define";
import type { ExecutiveIntelligencePack } from "@/intelligence-packs/contract";

const ROLE_DEFAULTS: Array<{
  roleId: CouncilRoleId;
  monitoringDomains: string[];
  decisionFramework: string;
}> = [
  {
    roleId: "ceo",
    monitoringDomains: ["enterprise coherence", "outcome portfolio"],
    decisionFramework: "Resolve cross-functional trade-offs for Focus Outcomes.",
  },
  {
    roleId: "cfo",
    monitoringDomains: ["cash", "margin", "capital"],
    decisionFramework: "Protect capital efficiency and forecast integrity.",
  },
  {
    roleId: "coo",
    monitoringDomains: ["delivery", "utilisation", "SLA"],
    decisionFramework: "Stabilise operations before committing growth load.",
  },
  {
    roleId: "cro",
    monitoringDomains: ["pipeline", "retention", "revenue quality"],
    decisionFramework: "Defend revenue quality and customer commitments.",
  },
  {
    roleId: "cso",
    monitoringDomains: ["strategic risk", "board posture"],
    decisionFramework: "Keep strategy and risk disclosure decision-ready.",
  },
];

/**
 * Adapt a platform Knowledge Pack into a full Intelligence Pack contract.
 * Fills EIPF surfaces from available knowledge-pack data; leaves gaps empty.
 */
export function intelligencePackFromKnowledgePack(
  knowledgePack: ExecutiveKnowledgePack,
): ExecutiveIntelligencePack {
  const vocabulary = knowledgePack.vocabulary();
  const kpis = knowledgePack.executiveKpis();
  const scenarios = knowledgePack.realityLabScenarios();
  const benchmarks = knowledgePack.benchmarks();
  const rules = knowledgePack.judgementRules();
  const narratives = knowledgePack.narrativeTemplates();
  const industry =
    knowledgePack.supportedDomains()[0] ?? knowledgePack.manifest.name;

  const outcomeId = `${knowledgePack.manifest.id}-outcome-primary`;

  return defineIntelligencePack({
    id: `eipf-${knowledgePack.manifest.id}`,
    name: `${knowledgePack.manifest.name} (EIPF)`,
    industry,
    description: knowledgePack.manifest.description,
    version: knowledgePack.manifest.version,
    provides: [
      ...knowledgePack.manifest.provides,
      "eipf",
      "council",
      "ontology",
    ],
    author: knowledgePack.manifest.author,
    outcomes: [
      {
        id: outcomeId,
        name: `${industry} executive performance`,
        description:
          "Primary pack outcome projected from Knowledge Pack health model.",
        ownerRole: "ceo",
        successMeasures: knowledgePack
          .healthModels()
          .flatMap((model) => model.dimensions)
          .slice(0, 4),
        supportingKpiIds: kpis.map((kpi) => kpi.id),
        strategicImportance: "critical",
        ontologyTerms: vocabulary.slice(0, 6).map((entry) => entry.term),
      },
    ],
    ontology: vocabulary.map((entry, index) => ({
      id: `${knowledgePack.manifest.id}-term-${index}`,
      term: entry.term,
      definition: entry.executiveMeaning,
      executiveMeaning: entry.executiveMeaning,
      aliases: entry.aliases,
      relatedOutcomeIds: [outcomeId],
    })),
    kpis: kpis.map((kpi) => ({
      id: kpi.id,
      label: kpi.label,
      unit: kpi.unit,
      polarity: kpi.polarity,
      executiveMeaning: kpi.executiveMeaning,
      linkedOutcomeIds: [outcomeId],
    })),
    councilKnowledge: ROLE_DEFAULTS.map((role) => ({
      roleId: role.roleId,
      monitoringDomains: role.monitoringDomains,
      typicalConcerns: [
        `How does ${industry} pressure change ${role.roleId.toUpperCase()} judgement?`,
      ],
      questionsBeforeRecommend: [
        `Which ${industry} signals are material to Focus Outcomes?`,
      ],
      decisionFramework: role.decisionFramework,
      reasoningHints: [
        `Apply ${industry} vocabulary when forming ${role.roleId.toUpperCase()} opinion.`,
      ],
      focusOntologyTermIds: vocabulary.slice(0, 3).map(
        (_, index) => `${knowledgePack.manifest.id}-term-${index}`,
      ),
    })),
    decisionFrameworks: [
      {
        id: `${knowledgePack.manifest.id}-framework`,
        name: `${industry} executive decision framework`,
        description: "Projected from Knowledge Pack judgement rules.",
        applicableOutcomeIds: [outcomeId],
        steps: rules.slice(0, 4).map((rule) => rule.title),
        escalationTriggers: [
          "Material health dimension breach",
          "Board-visible operational failure",
        ],
      },
    ],
    reasoningRules: rules.map((rule) => ({
      id: rule.id,
      title: rule.title,
      description: rule.description,
      evaluateKey: rule.evaluateKey,
      relatedOutcomeIds: [outcomeId],
    })),
    benchmarks: benchmarks.flatMap((benchmark) =>
      Object.entries(benchmark.medians).map(([metricId, peerMedian]) => ({
        id: `${benchmark.id}-${metricId}`,
        label: `${benchmark.label} · ${metricId}`,
        metricId,
        peerMedian,
        peerTopQuartile: Math.round(peerMedian * 1.1),
        unit: "%",
        notes: `Scale: ${benchmark.scale}`,
      })),
    ),
    businessEvents: scenarios.slice(0, 8).map((scenario) => ({
      id: `evt-${scenario.id}`,
      label: scenario.name,
      description: scenario.description,
      severity: scenario.severity,
      eventClass: String(scenario.kind),
      relatedOutcomeIds: [outcomeId],
      executiveQuestion: scenario.description,
    })),
    realityLab: {
      scenarios,
      validationDatasets: [
        {
          id: `${knowledgePack.manifest.id}-validation`,
          label: `${industry} validation set`,
          description: "Scenarios projected from Knowledge Pack Reality Lab.",
          scenarioIds: scenarios.map((scenario) => scenario.id),
        },
      ],
      successMeasures: [
        "Recommendations pass evaluation gates",
        "Council produces role-complete opinions",
        "Operating loop stages remain intact",
      ],
      failureConditions: [
        "Empty judgement artefacts under critical severity",
        "Missing Council opinions",
        "Pack scenarios fail to load",
      ],
      executiveQuestions: scenarios.slice(0, 5).map(
        (scenario) => scenario.description,
      ),
      expectedOutcomes: scenarios.slice(0, 5).map((scenario) => ({
        scenarioId: scenario.id,
        expectation: `ExecutiveOS surfaces judgement for ${scenario.name}`,
      })),
    },
    meetingPacks: [
      {
        id: `${knowledgePack.manifest.id}-weekly-elt`,
        name: "Weekly ELT",
        cadence: "weekly",
        purpose: `Review ${industry} Focus Outcomes and material risks.`,
        discussionSequence: [
          "Pulse",
          "Council observations",
          "Priority decisions",
          "Actions",
        ],
        requiredOutcomeIds: [outcomeId],
        prepMinutes: 20,
      },
    ],
    reports: [
      {
        id: `${knowledgePack.manifest.id}-exec-report`,
        name: `${industry} executive report`,
        audience: "ELT",
        sections: ["Pulse", "Outcomes", "Risks", "Decisions"],
        linkedOutcomeIds: [outcomeId],
      },
    ],
    recommendations: narratives.map((narrative) => ({
      id: narrative.id,
      situation: narrative.situation,
      title: narrative.situation,
      rationale: narrative.template,
      linkedOutcomeIds: [outcomeId],
      placeholders: narrative.placeholders,
    })),
    validationRules: [
      {
        id: `${knowledgePack.manifest.id}-has-kpis`,
        description: "Pack must expose executive KPIs",
        evaluateKey: "has_kpis",
        severity: "warning",
      },
    ],
    learningRules: [
      {
        id: `${knowledgePack.manifest.id}-retain-judgement`,
        description: "Retain judgement outcomes that improved Focus Outcomes.",
        trigger: "decision_closed",
        retentionHint: "Store Council disagreement that proved correct.",
      },
    ],
    supportedConnectors: knowledgePack.supportedConnectors(),
  });
}
