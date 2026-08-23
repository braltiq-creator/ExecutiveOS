/**
 * EIPF Reference Pack — framework demonstration only.
 *
 * NOT a customer industry pack.
 * NOT Manufacturing / Mining / Utilities.
 *
 * Exists so pack authors and Reality Lab can validate the contract
 * without embedding industry logic in Core.
 */

import { defineIntelligencePack } from "@/intelligence-packs/define";
import type { ExecutiveIntelligencePack } from "@/intelligence-packs/contract";
import type { ExecutiveScenario, SimulationContext } from "@/simulation/types";

function referenceScenario(
  id: string,
  name: string,
  description: string,
  severity: ExecutiveScenario["severity"],
): ExecutiveScenario {
  return {
    id,
    kind: "reference_pack_pressure",
    name,
    description,
    severity,
    apply(context: SimulationContext): SimulationContext {
      // Reference pack does not mutate Core providers — identity apply.
      return context;
    },
  };
}

/**
 * Minimal contract-complete pack for EIPF tests and author guidance.
 */
export function createReferenceIntelligencePack(): ExecutiveIntelligencePack {
  return defineIntelligencePack({
    id: "pack-eipf-reference",
    name: "EIPF Reference Pack",
    industry: "reference",
    description:
      "Framework reference pack proving the Intelligence Pack contract. Not an industry vertical.",
    provides: [
      "outcomes",
      "ontology",
      "kpis",
      "council",
      "reality-lab",
      "benchmarks",
      "reference",
    ],
    outcomes: [
      {
        id: "ref-outcome-clarity",
        name: "Decision clarity",
        description: "Executives reach prepared judgements with explainable evidence.",
        ownerRole: "ceo",
        successMeasures: [
          "Judgement briefs include alternatives and unknowns",
          "Council consensus confidence ≥ 60",
        ],
        supportingKpiIds: ["ref-kpi-prep", "ref-kpi-explain"],
        strategicImportance: "critical",
        ontologyTerms: ["Signal", "Judgement", "Focus Outcome"],
      },
      {
        id: "ref-outcome-loop",
        name: "Operating loop integrity",
        description: "Events flow Command Centre → Brief without manual bridging.",
        ownerRole: "coo",
        successMeasures: ["All eight loop stages pass under simulation"],
        supportingKpiIds: ["ref-kpi-loop"],
        strategicImportance: "high",
        ontologyTerms: ["Operating Loop", "Meeting Pack"],
      },
    ],
    ontology: [
      {
        id: "ref-term-signal",
        term: "Signal",
        definition: "Material change warranting executive attention",
        executiveMeaning: "Something the Council should notice today",
        aliases: ["alert", "pressure"],
        relatedOutcomeIds: ["ref-outcome-clarity"],
      },
      {
        id: "ref-term-judgement",
        term: "Judgement",
        definition: "Executive decision under uncertainty",
        executiveMeaning: "A prepared choice with trade-offs made explicit",
        relatedOutcomeIds: ["ref-outcome-clarity"],
      },
      {
        id: "ref-term-loop",
        term: "Operating Loop",
        definition: "Command Centre through Executive Brief flow",
        executiveMeaning: "The automatic path from event to brief",
        relatedOutcomeIds: ["ref-outcome-loop"],
      },
      {
        id: "ref-term-pack",
        term: "Meeting Pack",
        definition: "Cadence-ready executive discussion materials",
        executiveMeaning: "What the ELT should walk into the room with",
        relatedOutcomeIds: ["ref-outcome-loop"],
      },
      {
        id: "ref-term-focus",
        term: "Focus Outcome",
        definition: "Strategic outcome currently under executive attention",
        executiveMeaning: "The outcome that frames today's judgement",
        relatedOutcomeIds: ["ref-outcome-clarity"],
      },
    ],
    kpis: [
      {
        id: "ref-kpi-prep",
        label: "Executive preparation score",
        unit: "pts",
        polarity: "higher_better",
        executiveMeaning: "How ready the executive is before judgement",
        linkedOutcomeIds: ["ref-outcome-clarity"],
      },
      {
        id: "ref-kpi-explain",
        label: "Explainability score",
        unit: "pts",
        polarity: "higher_better",
        executiveMeaning: "Whether recommendations can be defended",
        linkedOutcomeIds: ["ref-outcome-clarity"],
      },
      {
        id: "ref-kpi-loop",
        label: "Loop pass rate",
        unit: "%",
        polarity: "higher_better",
        executiveMeaning: "Share of stages that complete without intervention",
        linkedOutcomeIds: ["ref-outcome-loop"],
      },
    ],
    councilKnowledge: [
      {
        roleId: "ceo",
        monitoringDomains: ["portfolio coherence", "judgement quality"],
        typicalConcerns: ["Are we deciding the right thing today?"],
        questionsBeforeRecommend: [
          "Which Focus Outcome frames this judgement?",
        ],
        decisionFramework: "Protect organisational coherence over local optimisations.",
        reasoningHints: [
          "Prefer pack-agnostic Focus Outcomes; refuse industry custom forks.",
        ],
        focusOntologyTermIds: ["ref-term-focus", "ref-term-judgement"],
      },
      {
        roleId: "cfo",
        monitoringDomains: ["attention cost", "value of delay"],
        typicalConcerns: ["Is the cost of delay quantified?"],
        questionsBeforeRecommend: ["What capital or cash is at stake?"],
        decisionFramework: "Quantify delay cost before endorsing deferral.",
        reasoningHints: [
          "Translate pack signals into capital and forecast language.",
        ],
        focusOntologyTermIds: ["ref-term-signal"],
      },
      {
        roleId: "coo",
        monitoringDomains: ["operating loop", "execution load"],
        typicalConcerns: ["Will this break the operating cadence?"],
        questionsBeforeRecommend: ["Can delivery absorb this decision?"],
        decisionFramework: "Stabilise the loop before adding load.",
        reasoningHints: [
          "Challenge recommendations that skip Operating Loop stages.",
        ],
        focusOntologyTermIds: ["ref-term-loop", "ref-term-pack"],
      },
      {
        roleId: "cro",
        monitoringDomains: ["commitment quality", "external narrative"],
        typicalConcerns: ["Does this create an external commitment we cannot keep?"],
        questionsBeforeRecommend: ["What did we promise externally?"],
        decisionFramework: "Defend commitment quality over optimism.",
        reasoningHints: [
          "Map pack events to customer and revenue commitments.",
        ],
        focusOntologyTermIds: ["ref-term-signal"],
      },
      {
        roleId: "cso",
        monitoringDomains: ["strategic alignment", "board readiness"],
        typicalConcerns: ["Is the strategic narrative still true?"],
        questionsBeforeRecommend: ["What would the board ask next?"],
        decisionFramework: "Keep strategy and disclosure decision-ready.",
        reasoningHints: [
          "Ensure pack vocabulary does not leak into Core models.",
        ],
        focusOntologyTermIds: ["ref-term-focus", "ref-term-judgement"],
      },
    ],
    decisionFrameworks: [
      {
        id: "ref-framework-judgement",
        name: "Reference judgement framework",
        description: "Question → evidence → alternatives → decision → learning",
        applicableOutcomeIds: ["ref-outcome-clarity"],
        steps: [
          "Frame the executive question",
          "Assemble evidence",
          "Surface alternatives and unknowns",
          "Form Council-aware judgement",
          "Capture learning",
        ],
        escalationTriggers: [
          "Missing evidence under critical severity",
          "Council consensus below threshold",
        ],
      },
    ],
    reasoningRules: [
      {
        id: "ref-rule-no-core-fork",
        title: "No Core industry forks",
        description: "Industry logic must live in packs, never Core.",
        evaluateKey: "no_core_industry_fork",
        relatedOutcomeIds: ["ref-outcome-clarity"],
      },
      {
        id: "ref-rule-loop-intact",
        title: "Operating loop intact",
        description: "Events must traverse all eight stages.",
        evaluateKey: "loop_intact",
        relatedOutcomeIds: ["ref-outcome-loop"],
      },
    ],
    benchmarks: [
      {
        id: "ref-bench-prep",
        label: "Preparation peer median",
        metricId: "ref-kpi-prep",
        peerMedian: 70,
        peerTopQuartile: 85,
        unit: "pts",
      },
    ],
    businessEvents: [
      {
        id: "ref-event-pressure",
        label: "Reference executive pressure",
        description: "Synthetic pressure event for framework validation.",
        severity: "high",
        eventClass: "reference_pressure",
        relatedOutcomeIds: ["ref-outcome-clarity"],
        relatedOntologyTermIds: ["ref-term-signal"],
        executiveQuestion: "Is the Intelligence Pack contract intact under pressure?",
      },
    ],
    realityLab: {
      scenarios: [
        referenceScenario(
          "ref-scenario-pressure",
          "Reference pressure",
          "Validate pack contract under executive pressure.",
          "high",
        ),
        referenceScenario(
          "ref-scenario-multi-pack",
          "Multi-pack coexistence",
          "Validate multiple packs active without Core changes.",
          "moderate",
        ),
      ],
      validationDatasets: [
        {
          id: "ref-dataset-contract",
          label: "Contract validation set",
          description: "Scenarios that prove EIPF self-review questions.",
          scenarioIds: ["ref-scenario-pressure", "ref-scenario-multi-pack"],
        },
      ],
      successMeasures: [
        "Pack registers without Core edits",
        "Outcome seed shape matches all packs",
        "Council overlays exist for all five roles",
        "Reality Lab discovers pack scenarios",
      ],
      failureConditions: [
        "Pack requires Core industry branching",
        "Switching packs breaks Outcome Engine contract",
        "Council roles diverge from permanent model",
      ],
      executiveQuestions: [
        "Can any new industry be added without changing Core?",
        "Can ExecutiveOS support multiple packs simultaneously?",
        "Can Executive Council adapt automatically to industry context?",
        "Can Reality Lab validate new industries?",
      ],
      expectedOutcomes: [
        {
          scenarioId: "ref-scenario-pressure",
          expectation: "Contract validation passes; no Core imports of industry types.",
        },
        {
          scenarioId: "ref-scenario-multi-pack",
          expectation: "Two packs active; consumers return uniform shapes.",
        },
      ],
    },
    meetingPacks: [
      {
        id: "ref-meeting-elt",
        name: "Reference ELT",
        cadence: "weekly",
        purpose: "Validate Meeting Pack templates from packs.",
        discussionSequence: ["Pulse", "Council", "Decisions"],
        requiredOutcomeIds: ["ref-outcome-clarity"],
        prepMinutes: 15,
      },
    ],
    reports: [
      {
        id: "ref-report-readiness",
        name: "EIPF readiness report",
        audience: "Braltiq platform",
        sections: ["Contract", "Council", "Reality Lab", "Gaps"],
        linkedOutcomeIds: ["ref-outcome-clarity", "ref-outcome-loop"],
      },
    ],
    recommendations: [
      {
        id: "ref-rec-pack-first",
        situation: "new_industry_request",
        title: "Add an Intelligence Pack",
        rationale: "Enter the market through a pack — never a Core fork.",
        linkedOutcomeIds: ["ref-outcome-clarity"],
        placeholders: ["{{industry}}"],
      },
    ],
    validationRules: [
      {
        id: "ref-val-roles",
        description: "All five Council roles must have pack knowledge",
        evaluateKey: "council_roles_complete",
        severity: "blocker",
      },
    ],
    learningRules: [
      {
        id: "ref-learn-disagreement",
        description: "Retain Council disagreements that later proved correct",
        trigger: "outcome_improved_after_challenge",
        retentionHint: "Store challenging role + rationale",
      },
    ],
    supportedConnectors: [],
  });
}
