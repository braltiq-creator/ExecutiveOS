/**
 * Presentation projection: ManufacturingAnalysis → Decision Intelligence immersion.
 * Reuses buildManufacturingDecisionPaper — no fabricated financials or measured outcomes.
 * Scenario contrasts are evidence-framed options (not recommendations).
 * Decision confidence remains unestablished until an executive records a decision.
 */

import type { ManufacturingAnalysis } from "@/executive-snapshot-studio/intelligence/manufacturing-analysis";
import { buildManufacturingDecisionPaper } from "@/executive-snapshot-studio/intelligence/manufacturing-decision-frame";
import { readinessLabel } from "@/lib/decisions/decision-readiness";
import { projectManufacturingEvidenceNetwork } from "@/experience/immersion/projectManufacturingNetwork";
import { projectManufacturingOperationsMap } from "@/experience/immersion/projectManufacturingMap";
import type {
  GlobalIntelligenceMapModel,
  ImmersionNetworkModel,
  IntelligenceProvenance,
} from "@/experience/immersion/types";

export type DecisionEvidenceCard = {
  id: string;
  role: "primary" | "counter" | "operational" | "missing";
  label: string;
  detail: string;
  provenance: IntelligenceProvenance;
  /** Period / coverage freshness from analysis — never invented. */
  freshnessLabel: string;
  relatedEntities: string[];
  assertionKind: "evidence" | "inference";
};

export type DecisionOptionCard = {
  id: string;
  label: string;
  shortLabel: string;
  summary: string;
  strategicRationale: string;
  operationalImplications: string[];
  upsides: string[];
  downsides: string[];
  supportingEvidenceIds: string[];
  unresolvedAssumptions: string[];
  /** Explicit: never a recommendation. */
  isRecommendation: false;
};

export type DecisionScenarioLane = {
  id: "base" | "protect" | "defer";
  optionId: string | null;
  label: string;
  framing: string;
  honesty: string;
  points: Array<{
    label: string;
    value: string;
    polarity?: "up" | "down" | "neutral";
  }>;
};

export type JudgementAnalysis = {
  score: number | null;
  scoreLabel: string;
  supportingFactors: string[];
  limitingFactors: string[];
  assumptions: string[];
  informationToResolve: string[];
  /** Explicit: no invented numeric uplift from missing evidence. */
  honestyNote: string;
};

export type ConfidenceInstrument = {
  id: "dataset" | "judgement" | "decision";
  title: string;
  valueLabel: string;
  score: number | null;
  status: "established" | "partial" | "unestablished";
  explanation: string;
  factors: string[];
};

export type RecommendedNextStep = {
  /** Derived framing — not an AI bind and not an executive decision. */
  kind: "derived_next_step";
  label: string;
  why: string;
  distinction: string;
};

export type DecisionIntelligenceImmersionModel = {
  title: string;
  kicker: string;
  demonstrationData: boolean;
  sourceLabel: string;
  decisionId: string | null;
  decisionQuestion: string;
  whyItMatters: string;
  whyNow: string;
  businessImpact: string;
  urgency: string;
  urgencyTone: "attention" | "watching" | "intelligence";
  leadJudgement: string;
  readinessLabel: string;
  readinessExplanation: string;
  selectionMessage: string;
  actionHref: string;
  confidence: {
    dataset: ConfidenceInstrument;
    judgement: ConfidenceInstrument;
    decision: ConfidenceInstrument;
    /** Legacy strip labels for tests / compact surfaces */
    datasetLabel: string;
    judgementLabel: string;
    decisionConfidenceLabel: string;
  };
  judgementAnalysis: JudgementAnalysis;
  evidence: DecisionEvidenceCard[];
  options: DecisionOptionCard[];
  scenarios: DecisionScenarioLane[];
  missingEvidence: Array<{ label: string; why: string }>;
  costOfDelay: string;
  executiveValueStatus: string;
  councilStatus: string;
  recommendedNextStep: RecommendedNextStep;
  nextAction: string;
  evidenceWindowLabel: string;
  map: GlobalIntelligenceMapModel;
  network: ImmersionNetworkModel;
};

function periodWindow(analysis: ManufacturingAnalysis): string {
  if (analysis.periods.length === 0) return "Period window not established";
  if (analysis.periods.length === 1) return `Period ${analysis.periods[0]}`;
  return `Periods ${analysis.periods[0]} → ${analysis.periods[analysis.periods.length - 1]} (${analysis.periods.length} in view)`;
}

function shortOptionLabel(label: string, id: string): string {
  if (/protect|realloc/i.test(label) || /protect|realloc/i.test(id)) {
    return "Reallocate capacity";
  }
  if (/maintain|accept/i.test(label) || /maintain/i.test(id)) {
    return "Maintain allocation";
  }
  if (/defer/i.test(label) || /defer/i.test(id)) {
    return "Defer decision";
  }
  return label.slice(0, 42);
}

export function projectManufacturingDecisionIntelligence(
  analysis: ManufacturingAnalysis,
): DecisionIntelligenceImmersionModel {
  const paper = buildManufacturingDecisionPaper(analysis, undefined);
  const windowLabel = periodWindow(analysis);
  const national = analysis.confidenceSlices.find((s) => s.id === "national");
  const hotFactory = [...analysis.capacity].sort(
    (a, b) => (b.loadPct ?? 0) - (a.loadPct ?? 0),
  )[0];
  const latest = analysis.nationalSeries[analysis.nationalSeries.length - 1];
  const leadModelMatch = paper.leadJudgement.match(/\b(Model\s+\S+)/i);
  const leadModel = leadModelMatch?.[1] ?? null;
  const modelSlice = leadModel
    ? analysis.confidenceSlices.find(
        (s) =>
          s.id === `model-${leadModel}` ||
          s.scope.toLowerCase().includes(leadModel.toLowerCase()),
      )
    : undefined;

  const evidence: DecisionEvidenceCard[] = [
    ...paper.primaryEvidence.map((e) => ({
      id: e.id,
      role: "primary" as const,
      label: e.label,
      detail: e.detail ?? e.value,
      provenance: "derived" as const,
      freshnessLabel: windowLabel,
      relatedEntities: e.label.split("·").map((p) => p.trim()).filter(Boolean),
      assertionKind: "evidence" as const,
    })),
    ...paper.counterSignals.map((e) => ({
      id: e.id,
      role: "counter" as const,
      label: e.label,
      detail: e.detail ?? e.value,
      provenance: "derived" as const,
      freshnessLabel: windowLabel,
      relatedEntities: e.label.split("·").map((p) => p.trim()).filter(Boolean),
      assertionKind: "evidence" as const,
    })),
    ...paper.operationalImplications.map((e) => ({
      id: e.id,
      role: "operational" as const,
      label: e.label,
      detail: e.detail ?? e.value,
      provenance: "derived" as const,
      freshnessLabel: latest?.period
        ? `Latest period ${latest.period}`
        : windowLabel,
      relatedEntities: [e.label.split("·")[0]?.trim() ?? e.label].filter(
        Boolean,
      ),
      assertionKind: "evidence" as const,
    })),
    ...paper.missingEvidence.map((m) => ({
      id: `missing-${m.label}`,
      role: "missing" as const,
      label: m.label,
      detail: m.whyItWouldHelp,
      provenance: "derived" as const,
      freshnessLabel: "Not present in snapshot",
      relatedEntities: [] as string[],
      assertionKind: "inference" as const,
    })),
  ];

  const sharedAssumptions = [
    "Demand movement continues on the observed trajectory unless new evidence arrives.",
    "Capacity load signals reflect the latest period in the snapshot — not live plant telemetry.",
    "Financial contribution of Model H demand is not established in this evidence set.",
  ];

  const options: DecisionOptionCard[] = paper.options.map((o) => {
    const upsides = o.tradeOffs
      .filter((t) => t.polarity === "upside")
      .map((t) => t.text);
    const downsides = o.tradeOffs
      .filter((t) => t.polarity === "downside")
      .map((t) => t.text);
    const supportingEvidenceIds = o.tradeOffs
      .map((t) => t.evidenceId)
      .filter((id): id is string => Boolean(id));
    return {
      id: o.id,
      label: o.label,
      shortLabel: shortOptionLabel(o.label, o.id),
      summary: o.summary?.trim() || o.label,
      strategicRationale: o.upside,
      operationalImplications: [
        o.summary?.trim() || o.label,
        ...(hotFactory?.loadPct != null
          ? [
              `${hotFactory.factory} load ${hotFactory.loadPct}% in latest period — operational pressure is evidenced, not modelled.`,
            ]
          : []),
      ],
      upsides,
      downsides,
      supportingEvidenceIds,
      unresolvedAssumptions: [
        ...sharedAssumptions.slice(0, 2),
        ...(downsides[0] ? [`Accepted downside framing: ${downsides[0]}`] : []),
      ],
      isRecommendation: false,
    };
  });

  const protectOpt = options.find((o) => /protect|realloc/i.test(o.id));
  const maintainOpt = options.find((o) => /maintain/i.test(o.id));
  const deferOpt = options.find((o) => /defer/i.test(o.id));

  const scenarios: DecisionScenarioLane[] = [
    {
      id: "protect",
      optionId: protectOpt?.id ?? null,
      label: "Reallocate production capacity",
      framing:
        protectOpt?.summary ??
        "Protect strategic Model H demand by changing production allocation.",
      honesty:
        "Option framing from decision paper trade-offs — consequences are qualitative until measured.",
      points: [
        {
          label: "Strategic intent",
          value: protectOpt?.strategicRationale?.slice(0, 80) ?? "Protect above-plan demand",
          polarity: "up",
        },
        {
          label: "Operational risk",
          value:
            protectOpt?.downsides[0]?.slice(0, 72) ??
            "May create pressure elsewhere under constrained plant load",
          polarity: "down",
        },
        {
          label: "Evidence support",
          value: `${paper.primaryEvidence.length} primary · ${paper.operationalImplications.length} operational`,
          polarity: "neutral",
        },
      ],
    },
    {
      id: "base",
      optionId: maintainOpt?.id ?? null,
      label: "Maintain current allocation",
      framing:
        maintainOpt?.summary ??
        "Maintain the existing production plan and accept potential demand deferral.",
      honesty:
        "Modelled framing from evidence options — not a measured financial forecast.",
      points: [
        {
          label: "National variance",
          value:
            latest?.variancePct == null
              ? "Not established"
              : `${latest.variancePct > 0 ? "+" : ""}${latest.variancePct}%`,
          polarity: "neutral",
        },
        {
          label: "Capacity posture",
          value:
            hotFactory?.loadPct == null
              ? "Not established"
              : `${hotFactory.factory} ${hotFactory.loadPct}%`,
          polarity: (hotFactory?.loadPct ?? 0) >= 95 ? "down" : "neutral",
        },
        {
          label: "Deferral risk",
          value:
            maintainOpt?.downsides[0]?.slice(0, 72) ??
            "Above-plan demand may defer",
          polarity: "down",
        },
      ],
    },
    {
      id: "defer",
      optionId: deferOpt?.id ?? null,
      label: "Defer the decision",
      framing:
        deferOpt?.summary ??
        "Obtain additional evidence before changing the production plan.",
      honesty:
        "Illustrative pathway from option trade-offs — not live outcome measurement.",
      points: [
        {
          label: "Evidence still required",
          value: `${paper.missingEvidence.length} gaps listed in this frame`,
          polarity: "neutral",
        },
        {
          label: "Demand risk while waiting",
          value:
            "Strategic demand may wait or divert — evidence does not quantify loss",
          polarity: "down",
        },
        {
          label: "Cost of delay",
          value: paper.costOfDelay,
          polarity: "neutral",
        },
      ],
    },
  ];

  const judgementScore = paper.confidence.judgementConfidence;
  const supportingFactors = [
    ...paper.primaryEvidence.map(
      (e) => `${e.label}: ${e.detail ?? e.value}`,
    ),
    ...paper.operationalImplications.map(
      (e) => `Operational: ${e.label} — ${e.detail ?? e.value}`,
    ),
  ].slice(0, 4);

  const limitingFactors = [
    ...(paper.counterSignals.length === 0
      ? [
          "No contradictory demand signals established in this snapshot — judgement is one-sided until counters appear.",
        ]
      : paper.counterSignals.map(
          (e) => `Counter: ${e.label} — ${e.detail ?? e.value}`,
        )),
    ...paper.missingEvidence
      .slice(0, 3)
      .map((m) => `Missing: ${m.label} — ${m.whyItWouldHelp}`),
    ...(modelSlice?.why ?? []).slice(0, 2),
  ];

  const judgementAnalysis: JudgementAnalysis = {
    score: judgementScore,
    scoreLabel:
      judgementScore == null
        ? "Judgement confidence not established"
        : `Judgement confidence ${judgementScore}%`,
    supportingFactors:
      supportingFactors.length > 0
        ? supportingFactors
        : ["Primary demand evidence not yet framed."],
    limitingFactors,
    assumptions: sharedAssumptions,
    informationToResolve: paper.missingEvidence.map(
      (m) => `${m.label}: ${m.whyItWouldHelp}`,
    ),
    honestyNote:
      "Additional evidence could strengthen or overturn this assessment — numerical confidence uplift is not simulated when evidence is absent.",
  };

  const datasetFactors = [
    ...(national?.why ?? []),
    `${analysis.recordCount} snapshot records in view`,
    windowLabel,
    analysis.demonstrationData
      ? "Demonstration fixture — not live customer intelligence"
      : "Organisational manufacturing forecast snapshot",
  ].slice(0, 5);

  const capacityPressure =
    hotFactory?.loadPct != null && hotFactory.loadPct >= 95;
  const urgency = capacityPressure
    ? `${hotFactory!.factory} is under evidenced load pressure (${hotFactory!.loadPct}%) while ${paper.leadJudgement.toLowerCase()} — timing of allocation judgement is material.`
    : "Demand movement is evidenced; capacity pressure is not at the attention threshold in the latest period.";
  const urgencyTone: "attention" | "watching" | "intelligence" =
    capacityPressure ? "attention" : "watching";

  const businessImpact = capacityPressure
    ? `Allocation posture affects continuity of ${leadModel ?? "strategic"} demand while ${hotFactory!.factory} is under evidenced overload (${hotFactory!.loadPct}%). Financial contribution of that demand is not yet quantified in evidence.`
    : `Allocation posture affects demand continuity and plant load. ${paper.costOfDelay} Executive value remains: ${paper.executiveValueStatus}.`;

  const recommendedNextStep: RecommendedNextStep = {
    kind: "derived_next_step",
    label: paper.selectionRequired
      ? "Review options, inspect evidence and uncertainty, then record an executive selection."
      : "Evidence is still establishing — do not bind a decision yet.",
    why: paper.readinessExplanation,
    distinction:
      "This is a derived next-step framing from evidence readiness — not an AI recommendation, not an approved executive decision, and not an automatic action.",
  };

  return {
    title: "Decision Intelligence",
    kicker: "Manufacturing Forecast Intelligence",
    demonstrationData: analysis.demonstrationData,
    sourceLabel: analysis.demonstrationData
      ? "Demonstration manufacturing forecast"
      : "Manufacturing forecast snapshot",
    decisionId: paper.decisionId,
    decisionQuestion: paper.decisionQuestion,
    whyItMatters: paper.leadJudgement,
    whyNow: paper.whyNow,
    businessImpact,
    urgency,
    urgencyTone,
    leadJudgement: paper.leadJudgement,
    readinessLabel: readinessLabel(paper.readiness),
    readinessExplanation: paper.readinessExplanation,
    selectionMessage: paper.selectionMessage,
    actionHref: paper.href,
    confidence: {
      dataset: {
        id: "dataset",
        title: "Dataset confidence",
        valueLabel: paper.confidence.datasetLabel,
        score: paper.confidence.datasetConfidence,
        status:
          paper.confidence.datasetConfidence == null
            ? "unestablished"
            : paper.confidence.datasetConfidence >= 70
              ? "established"
              : "partial",
        explanation:
          "Quality and coverage of the underlying manufacturing forecast evidence — independent of judgement or decision.",
        factors: datasetFactors,
      },
      judgement: {
        id: "judgement",
        title: "Judgement confidence",
        valueLabel: paper.confidence.judgementLabel,
        score: paper.confidence.judgementConfidence,
        status:
          paper.confidence.judgementConfidence == null
            ? "unestablished"
            : paper.confidence.judgementConfidence >= 70
              ? "established"
              : "partial",
        explanation:
          "How strongly available evidence supports this interpretation — reduced by missing counters, financial contribution and allocation flexibility.",
        factors: limitingFactors.slice(0, 4),
      },
      decision: {
        id: "decision",
        title: "Decision confidence",
        valueLabel: paper.confidence.decisionConfidenceLabel,
        score: null,
        status: "unestablished",
        explanation:
          "Confidence in an actual executive decision. Remains unestablished until an executive records a selection with rationale — never inherits dataset or judgement confidence.",
        factors: [
          "No executive decision recorded yet",
          "AI or derived framing cannot establish decision confidence",
        ],
      },
      datasetLabel: paper.confidence.datasetLabel,
      judgementLabel: paper.confidence.judgementLabel,
      decisionConfidenceLabel: paper.confidence.decisionConfidenceLabel,
    },
    judgementAnalysis,
    evidence,
    options,
    scenarios,
    missingEvidence: paper.missingEvidence.map((m) => ({
      label: m.label,
      why: m.whyItWouldHelp,
    })),
    costOfDelay: paper.costOfDelay,
    executiveValueStatus: paper.executiveValueStatus,
    councilStatus: paper.councilStatus,
    recommendedNextStep,
    nextAction: recommendedNextStep.label,
    evidenceWindowLabel: windowLabel,
    map: projectManufacturingOperationsMap(analysis),
    network: projectManufacturingEvidenceNetwork(analysis),
  };
}

/**
 * Session-local decision recording completeness — never inherits dataset/judgement %.
 * Used only after an executive explicitly records a decision in the immersion UI.
 */
export function deriveRecordedDecisionConfidence(input: {
  rationale: string;
  acceptedAssumptions: string[];
  acceptedRisks: string[];
  owner: string;
  followUps: string[];
  evidenceIds: string[];
}): {
  established: true;
  label: string;
  explanation: string;
  recordingCompletenessLabel: string;
} {
  const checks = [
    input.rationale.trim().length >= 24,
    input.acceptedAssumptions.length > 0,
    input.acceptedRisks.length > 0,
    input.owner.trim().length > 0,
    input.followUps.some((f) => f.trim().length > 0),
    input.evidenceIds.length > 0,
  ];
  const met = checks.filter(Boolean).length;
  const total = checks.length;
  return {
    established: true,
    label: "Decision confidence established by executive record",
    explanation:
      "Established from the recorded rationale, evidence considered, accepted assumptions/risks, owner and follow-ups — not copied from dataset or judgement confidence.",
    recordingCompletenessLabel: `Recording artefacts ${met}/${total} complete`,
  };
}
