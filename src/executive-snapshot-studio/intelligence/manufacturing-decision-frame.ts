/**
 * Phase 60 — Manufacturing → Executive Decision frame.
 * Composition over existing analysis / Decision Engine types.
 * Does not change manufacturing formulas or invent financial value / consensus.
 */

import type { Decision } from "@/lib/decisions/engine-types";
import {
  deriveDecisionQuestion,
  type DecisionEvidenceItem,
  type DecisionOptionFrame,
  type DecisionReadinessClass,
  type ExecutiveDecisionPaper,
  type MissingEvidenceItem,
} from "@/lib/decisions/decision-readiness";
import type { ManufacturingAnalysis } from "./manufacturing-analysis";
import type { ManufacturingExecutiveBrief } from "./manufacturing-brief";

function isGenericFramingTitle(text: string): boolean {
  return /manufacturing forecast requires executive judgement/i.test(text);
}

function resolveLeadJudgement(
  analysis: ManufacturingAnalysis,
  brief: ManufacturingExecutiveBrief | undefined,
): string {
  const demand = analysis.insights.find((i) => i.category === "demand_movement");
  const fromBrief = brief?.whatChanged?.[0]?.trim();
  if (fromBrief && !isGenericFramingTitle(fromBrief)) return fromBrief.slice(0, 220);
  if (demand?.title && !isGenericFramingTitle(demand.title)) {
    return demand.title.slice(0, 220);
  }
  return (
    demand?.title ??
    analysis.insights.find((i) => i.category === "capacity_implication")?.title ??
    "Manufacturing forecast evidence is establishing — material judgement has not yet been framed."
  ).slice(0, 220);
}

function resolveLeadModel(
  analysis: ManufacturingAnalysis,
  leadJudgement: string,
): string | null {
  const accel = analysis.insights.find((i) => i.id === "demand-acceleration");
  if (accel) {
    const m = accel.title.match(/^(Model\s+\S+)/i);
    if (m) return m[1]!;
  }
  const fromLead = leadJudgement.match(/\b(Model\s+\S+)/i);
  return fromLead ? fromLead[1]! : null;
}

function resolveJudgementConfidence(
  analysis: ManufacturingAnalysis,
  leadJudgement: string,
): number {
  const leadModel = resolveLeadModel(analysis, leadJudgement);
  if (leadModel) {
    const slice = analysis.confidenceSlices.find(
      (s) =>
        s.id === `model-${leadModel}` ||
        s.scope.toLowerCase() === leadModel.toLowerCase(),
    );
    if (slice?.score != null) return slice.score;
  }
  const demand = analysis.insights.find((i) => i.category === "demand_movement");
  return demand?.confidence ?? 55;
}

function whyItMatters(
  analysis: ManufacturingAnalysis,
  brief: ManufacturingExecutiveBrief | undefined,
): string {
  const framing = analysis.insights.find(
    (i) => i.category === "executive_judgement",
  );
  return (
    brief?.whatRequiresJudgement?.[0] ??
    brief?.whyItMatters ??
    framing?.implication ??
    analysis.insights.find((i) => i.category === "capacity_implication")
      ?.implication ??
    "Forecast movement without ranked judgement creates capacity and inventory exposure."
  ).slice(0, 280);
}

function coverageRate(
  analysis: ManufacturingAnalysis,
  field: string,
): number | null {
  const row = analysis.fieldCoverage.find((f) => f.field === field);
  return row ? row.rate : null;
}

function classifyReadiness(input: {
  hasPrimary: boolean;
  hasDemandInsight: boolean;
  optionsFramed: boolean;
}): { readiness: DecisionReadinessClass; explanation: string } {
  if (!input.hasDemandInsight && !input.hasPrimary) {
    return {
      readiness: "NOT_DECISION_READY",
      explanation:
        "Material demand or capacity evidence is not yet established — a decision cannot be framed.",
    };
  }
  if (input.optionsFramed) {
    return {
      readiness: "DECISION_REQUIRES_EXECUTIVE_JUDGEMENT",
      explanation:
        "Options are identified from evidence. Executive selection is required — ExecutiveOS does not recommend a bind.",
    };
  }
  return {
    readiness: "DECISION_REQUIRES_EVIDENCE",
    explanation:
      "This requires executive judgement before a decision can be framed — supporting options are not yet evidence-complete.",
  };
}

function buildEvidenceFromAnalysis(
  analysis: ManufacturingAnalysis,
  leadModel: string | null,
): {
  primary: DecisionEvidenceItem[];
  counter: DecisionEvidenceItem[];
  operational: DecisionEvidenceItem[];
} {
  const accelerators = analysis.heatMap
    .filter((c) => c.variancePct != null && c.variancePct >= 10)
    .sort((a, b) => (b.variancePct ?? 0) - (a.variancePct ?? 0));
  const primaryPool = leadModel
    ? accelerators.filter((c) => c.model === leadModel)
    : accelerators;

  const primary: DecisionEvidenceItem[] = primaryPool.slice(0, 2).map((c) => ({
    id: c.id,
    label: `${c.region} · ${c.model}`,
    value: `${c.variancePct! > 0 ? "+" : ""}${c.variancePct}%`,
    role: "PRIMARY_SUPPORT",
    presence: "DERIVED",
    detail: "6-period actual vs forecast",
  }));

  const decliners = analysis.heatMap
    .filter((c) => c.variancePct != null && c.variancePct <= -10)
    .sort((a, b) => (a.variancePct ?? 0) - (b.variancePct ?? 0));

  const counter: DecisionEvidenceItem[] = [];
  for (const c of decliners) {
    if (leadModel && c.model === leadModel) continue;
    counter.push({
      id: c.id,
      label: `${c.region} · ${c.model}`,
      value: `${c.variancePct! > 0 ? "+" : ""}${c.variancePct}%`,
      role: "COUNTER_SIGNAL",
      presence: "DERIVED",
      detail: "6-period actual vs forecast",
    });
    break;
  }

  const plants = [...analysis.capacity]
    .filter((c) => c.loadPct != null && c.loadPct >= 95)
    .sort((a, b) => (b.loadPct ?? 0) - (a.loadPct ?? 0));

  const operational: DecisionEvidenceItem[] = plants.slice(0, 1).map((p) => {
    const multiple = (p.loadPct! / 100).toFixed(2);
    return {
      id: `cap-${p.factory}`,
      label: p.factory,
      value: `${p.loadPct}%`,
      role: "OPERATIONAL_IMPLICATION" as const,
      presence: "DERIVED" as const,
      detail:
        p.capacity != null
          ? `of plant capacity · ${p.demonstratedDemand} units demand vs ${p.capacity} capacity (${multiple}×)`
          : "of plant capacity",
    };
  });

  return { primary, counter, operational };
}

function buildMissingEvidence(
  analysis: ManufacturingAnalysis,
): MissingEvidenceItem[] {
  const items: MissingEvidenceItem[] = [];

  const orderBank = coverageRate(analysis, "orderBankQuantity");
  if (orderBank == null || orderBank < 40) {
    items.push({
      id: "miss-order-bank",
      label: "Order bank commitments",
      presence: "MISSING",
      whyItWouldHelp:
        "Would clarify whether above-plan demand is backed by firm orders vs forecast lift alone.",
      source: orderBank == null ? "dataset_absent" : "coverage_insufficient",
    });
  }

  if (!analysis.executiveValue.quantified) {
    items.push({
      id: "miss-financial-contribution",
      label: "Financial contribution / unit economics",
      presence: "MISSING",
      whyItWouldHelp:
        "Would allow cost of delay and Executive Value to be quantified rather than left honest-unknown.",
      source: "not_in_contract",
    });
  }

  items.push({
    id: "miss-capacity-flexibility",
    label: "Confirmed capacity allocation flexibility",
    presence: "REQUIRES_EXECUTIVE_JUDGEMENT",
    whyItWouldHelp:
      "Plant load shows pressure, but whether slots can be reallocated is an operations policy judgement not present in the forecast rows.",
    source: "not_in_contract",
  });

  items.push({
    id: "miss-customer-priority",
    label: "Customer / strategic priority",
    presence: "REQUIRES_EXECUTIVE_JUDGEMENT",
    whyItWouldHelp:
      "Would clarify whether protecting the lead demand model outranks other regional or model commitments.",
    source: "not_in_contract",
  });

  const dealerRate = coverageRate(analysis, "dealer");
  if (dealerRate != null && dealerRate > 0) {
    items.push({
      id: "miss-dealer-commitments",
      label: "Dealer commitment strength",
      presence: "MISSING",
      whyItWouldHelp:
        "Dealer rows exist, but commitment firmness is not established as a field for decisioning.",
      source: "not_in_contract",
    });
  }

  return items.slice(0, 6);
}

function buildOptions(input: {
  leadModel: string | null;
  hasCapacityPressure: boolean;
  hasCounter: boolean;
  primaryIds: string[];
  counterIds: string[];
  capacityIds: string[];
}): DecisionOptionFrame[] {
  const model = input.leadModel ?? "strategic demand";

  const options: DecisionOptionFrame[] = [
    {
      id: "opt-protect",
      label: `Protect ${model} demand through capacity reallocation`,
      summary:
        "Reallocate capacity toward the accelerating demand signal while accepting operational disruption elsewhere.",
      upside: "Responds to evidence that demand has moved above plan",
      downside: "May create pressure elsewhere under constrained plant load",
      isRecommendation: false,
      tradeOffs: [
        {
          polarity: "upside",
          text: "Potentially protects the above-plan demand signal",
          evidenceId: input.primaryIds[0],
        },
        {
          polarity: "downside",
          text: input.hasCapacityPressure
            ? "Plant capacity is already under demonstrated load pressure"
            : "Reallocation may create pressure elsewhere",
          evidenceId: input.capacityIds[0],
        },
      ],
    },
    {
      id: "opt-maintain",
      label: `Maintain current allocation and accept potential ${model} deferral`,
      summary:
        "Hold the current allocation posture and accept that above-plan demand may defer.",
      upside: "Avoids immediate reallocation disruption",
      downside: `Potential ${model} deferral risk while demand remains above plan`,
      isRecommendation: false,
      tradeOffs: [
        {
          polarity: "upside",
          text: "Avoids immediate capacity reallocation",
        },
        {
          polarity: "downside",
          text: "Potential deferral risk against the lead demand signal",
          evidenceId: input.primaryIds[0],
        },
      ],
    },
    {
      id: "opt-defer",
      label: "Defer a decision until additional evidence is available",
      summary:
        "Hold commitment until missing evidence (order bank, allocation flexibility, financial contribution) is established.",
      upside: "Avoids premature commitment under incomplete evidence",
      downside: "Potentially allows capacity and demand exposure to persist",
      isRecommendation: false,
      tradeOffs: [
        {
          polarity: "upside",
          text: "Avoids premature commitment while evidence gaps remain",
        },
        {
          polarity: "downside",
          text: input.hasCapacityPressure
            ? "Demonstrated plant load pressure may persist unexamined"
            : "Exposure may persist while waiting",
          evidenceId: input.capacityIds[0],
        },
      ],
    },
  ];

  if (input.hasCounter) {
    options[0]!.tradeOffs.push({
      polarity: "downside",
      text: "Material softening elsewhere may free capacity — or create inventory exposure if misread",
      evidenceId: input.counterIds[0],
    });
  }

  return options;
}

/**
 * Build the manufacturing executive decision paper from existing intelligence.
 */
export function buildManufacturingDecisionPaper(
  analysis: ManufacturingAnalysis,
  brief: ManufacturingExecutiveBrief | undefined,
): ExecutiveDecisionPaper {
  const leadJudgement = resolveLeadJudgement(analysis, brief);
  const leadModel = resolveLeadModel(analysis, leadJudgement);
  const implication = whyItMatters(analysis, brief);
  const framing = analysis.insights.find(
    (i) => i.category === "executive_judgement",
  );
  const demandInsight =
    analysis.insights.find((i) => i.id === "demand-acceleration") ??
    analysis.insights.find((i) => i.category === "demand_movement");

  const { primary, counter, operational } = buildEvidenceFromAnalysis(
    analysis,
    leadModel,
  );

  const hasCapacityPressure = analysis.capacity.some(
    (c) => c.loadPct != null && c.loadPct >= 95,
  );
  const missingEvidence = buildMissingEvidence(analysis);

  const options =
    demandInsight || primary.length > 0
      ? buildOptions({
          leadModel,
          hasCapacityPressure,
          hasCounter: counter.length > 0,
          primaryIds: primary.map((e) => e.id),
          counterIds: counter.map((e) => e.id),
          capacityIds: operational.map((e) => e.id),
        })
      : [];

  const { readiness, explanation } = classifyReadiness({
    hasPrimary: primary.length > 0,
    hasDemandInsight: Boolean(demandInsight),
    optionsFramed: options.length > 0,
  });

  const decisionQuestion = deriveDecisionQuestion({
    implication:
      framing?.implication ?? brief?.whatRequiresJudgement?.[0] ?? implication,
    leadJudgement,
    leadModel,
  });

  const national = analysis.confidenceSlices.find((s) => s.id === "national");
  const judgementConfidence = resolveJudgementConfidence(
    analysis,
    leadJudgement,
  );

  const decisionId = demandInsight ? `decision-${demandInsight.id}` : null;

  const tradeOffs = options.flatMap((opt) =>
    opt.tradeOffs.map((t, i) => ({
      id: `${opt.id}-to-${i}`,
      dimension: opt.label,
      choice: t.polarity === "upside" ? "+" : "−",
      consequence: t.text,
    })),
  );

  const selectionRequired =
    readiness === "DECISION_REQUIRES_EXECUTIVE_JUDGEMENT" ||
    readiness === "DECISION_READY";

  return {
    module: "manufacturing_forecasting",
    readiness,
    readinessExplanation: explanation,
    decisionId,
    leadJudgement,
    decisionQuestion,
    whyNow: implication.slice(0, 320),
    primaryEvidence: primary,
    counterSignals: counter,
    operationalImplications: operational,
    options,
    tradeOffs,
    missingEvidence,
    executiveJudgementRequired: implication.slice(0, 320),
    confidence: {
      datasetConfidence: national?.score ?? null,
      datasetLabel:
        national?.score != null
          ? `Dataset confidence ${national.level.toUpperCase()} (${national.score}%)`
          : "Dataset confidence not established",
      judgementConfidence,
      judgementLabel: `Judgement confidence ${judgementConfidence}%`,
      decisionReadiness: readiness,
      decisionConfidence: null,
      decisionConfidenceLabel: "Decision confidence not yet established",
    },
    costOfDelay: analysis.executiveValue.quantified
      ? "Cost of delay requires financial evidence review"
      : "Cost of delay not quantified.",
    executiveValueStatus: analysis.executiveValue.quantified
      ? analysis.executiveValue.narrative.slice(0, 80)
      : "Not yet quantified",
    councilStatus: "Council position not yet established.",
    selectionRequired,
    selectionMessage: selectionRequired
      ? "Options identified. Executive selection required."
      : "A decision cannot yet be framed from the available evidence.",
    href: decisionId
      ? `/decisions?from=manufacturing_judgement&select=${encodeURIComponent(decisionId)}`
      : "/decisions?from=manufacturing_judgement",
  };
}

/**
 * Enrich a Decision Engine object from the manufacturing decision paper.
 */
export function applyDecisionPaperToDecision(
  decision: Decision,
  paper: ExecutiveDecisionPaper,
): Decision {
  if (paper.decisionId && decision.id !== paper.decisionId) {
    return decision;
  }
  return {
    ...decision,
    question: paper.decisionQuestion,
    whatChanged: paper.leadJudgement,
    why: paper.whyNow,
    whatShouldHappenNext: paper.selectionMessage,
    costOfDelay: paper.costOfDelay,
    businessImpact: paper.whyNow,
    expectedOutcomeImpact: paper.executiveJudgementRequired,
    confidence: paper.confidence.judgementConfidence ?? decision.confidence,
    executiveSelectionState: decision.selectedAlternativeId
      ? decision.executiveSelectionState
      : "OPTION_IDENTIFIED",
    alternatives: paper.options.map((o) => ({
      id: o.id,
      label: o.label,
      summary: `${o.summary} (Option — not a recommendation)`,
      upside: o.upside,
      downside: o.downside,
    })),
    tradeOffs: paper.tradeOffs,
    recommendationSummary: paper.selectionMessage,
    evidence: [
      ...paper.primaryEvidence.map((e) => ({
        id: e.id,
        title: e.label,
        source: "Manufacturing forecast — primary support",
        summary: `${e.value}${e.detail ? ` · ${e.detail}` : ""}`,
        asOf: new Date().toISOString(),
      })),
      ...paper.counterSignals.map((e) => ({
        id: e.id,
        title: e.label,
        source: "Manufacturing forecast — counter-signal",
        summary: `${e.value}${e.detail ? ` · ${e.detail}` : ""}`,
        asOf: new Date().toISOString(),
      })),
      ...paper.operationalImplications.map((e) => ({
        id: e.id,
        title: e.label,
        source: "Manufacturing forecast — operational implication",
        summary: `${e.value}${e.detail ? ` · ${e.detail}` : ""}`,
        asOf: new Date().toISOString(),
      })),
    ],
  };
}
