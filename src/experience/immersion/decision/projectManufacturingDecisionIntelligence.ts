/**
 * Presentation projection: ManufacturingAnalysis → Decision Intelligence immersion.
 * Reuses buildManufacturingDecisionPaper — no fabricated financials or measured outcomes.
 * Scenario contrasts are evidence-framed options (not recommendations).
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
  role: "primary" | "counter" | "operational";
  label: string;
  detail: string;
  provenance: IntelligenceProvenance;
};

export type DecisionOptionCard = {
  id: string;
  label: string;
  summary: string;
  upsides: string[];
  downsides: string[];
  /** Explicit: never a recommendation. */
  isRecommendation: false;
};

export type DecisionScenarioLane = {
  id: "base" | "protect" | "defer";
  label: string;
  framing: string;
  honesty: string;
  points: Array<{ label: string; value: string; polarity?: "up" | "down" | "neutral" }>;
};

export type DecisionIntelligenceImmersionModel = {
  title: string;
  kicker: string;
  demonstrationData: boolean;
  sourceLabel: string;
  decisionQuestion: string;
  whyItMatters: string;
  whyNow: string;
  leadJudgement: string;
  readinessLabel: string;
  readinessExplanation: string;
  selectionMessage: string;
  actionHref: string;
  confidence: {
    datasetLabel: string;
    judgementLabel: string;
    decisionConfidenceLabel: string;
  };
  evidence: DecisionEvidenceCard[];
  options: DecisionOptionCard[];
  scenarios: DecisionScenarioLane[];
  missingEvidence: Array<{ label: string; why: string }>;
  costOfDelay: string;
  executiveValueStatus: string;
  councilStatus: string;
  nextAction: string;
  map: GlobalIntelligenceMapModel;
  network: ImmersionNetworkModel;
};

export function projectManufacturingDecisionIntelligence(
  analysis: ManufacturingAnalysis,
): DecisionIntelligenceImmersionModel {
  const paper = buildManufacturingDecisionPaper(analysis, undefined);

  const evidence: DecisionEvidenceCard[] = [
    ...paper.primaryEvidence.map((e) => ({
      id: e.id,
      role: "primary" as const,
      label: e.label,
      detail: e.detail ?? e.value,
      provenance: "derived" as const,
    })),
    ...paper.counterSignals.map((e) => ({
      id: e.id,
      role: "counter" as const,
      label: e.label,
      detail: e.detail ?? e.value,
      provenance: "derived" as const,
    })),
    ...paper.operationalImplications.map((e) => ({
      id: e.id,
      role: "operational" as const,
      label: e.label,
      detail: e.detail ?? e.value,
      provenance: "derived" as const,
    })),
  ];

  const options: DecisionOptionCard[] = paper.options.map((o) => ({
    id: o.id,
    label: o.label,
    summary: o.summary?.trim() || o.label,
    upsides: o.tradeOffs
      .filter((t) => t.polarity === "upside")
      .map((t) => t.text),
    downsides: o.tradeOffs
      .filter((t) => t.polarity === "downside")
      .map((t) => t.text),
    isRecommendation: false,
  }));

  const hotFactory = [...analysis.capacity].sort(
    (a, b) => (b.loadPct ?? 0) - (a.loadPct ?? 0),
  )[0];
  const latest = analysis.nationalSeries[analysis.nationalSeries.length - 1];

  // Scenario lanes are illustrative framings over the same evidence options —
  // explicitly labelled modelled / not measured financial outcomes.
  const scenarios: DecisionScenarioLane[] = [
    {
      id: "base",
      label: "Base case · maintain course",
      framing:
        "Continue current allocation while demand and capacity signals remain under watch.",
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
          polarity:
            (hotFactory?.loadPct ?? 0) >= 95 ? "down" : "neutral",
        },
        {
          label: "Executive value",
          value: paper.executiveValueStatus,
          polarity: "neutral",
        },
      ],
    },
    {
      id: "protect",
      label: "Protect demand · reallocate",
      framing:
        options.find((o) => /protect|realloc/i.test(o.label))?.summary ??
        "Protect strategic demand by reallocating production attention.",
      honesty:
        "Option framing from decision paper trade-offs — consequences are qualitative until measured.",
      points: [
        {
          label: "Upside",
          value:
            options
              .flatMap((o) => o.upsides)
              .find((t) => /demand|protect|model/i.test(t))
              ?.slice(0, 72) ?? "Protect demand continuity where evidence concentrates",
          polarity: "up",
        },
        {
          label: "Downside",
          value:
            options
              .flatMap((o) => o.downsides)
              .find((t) => /defer|elsewhere|risk/i.test(t))
              ?.slice(0, 72) ?? "May defer other demand or stretch capacity",
          polarity: "down",
        },
        {
          label: "Evidence stance",
          value: `${paper.primaryEvidence.length} primary · ${paper.operationalImplications.length} operational`,
          polarity: "neutral",
        },
      ],
    },
    {
      id: "defer",
      label: "Downside / defer pathway",
      framing:
        options.find((o) => /defer|maintain|accept/i.test(o.label))?.summary ??
        "Accept deferral risk while preserving capacity headroom elsewhere.",
      honesty:
        "Illustrative pathway from option trade-offs — not live outcome measurement.",
      points: [
        {
          label: "Capacity relief",
          value:
            hotFactory?.availableSlots == null
              ? "Slots not established"
              : `${hotFactory.availableSlots} slots available (snapshot)`,
          polarity: "up",
        },
        {
          label: "Demand risk",
          value: "Strategic demand may wait or divert — evidence does not quantify loss",
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

  return {
    title: "Decision Intelligence",
    kicker: "Manufacturing Forecast Intelligence",
    demonstrationData: analysis.demonstrationData,
    sourceLabel: analysis.demonstrationData
      ? "Demonstration manufacturing forecast"
      : "Manufacturing forecast snapshot",
    decisionQuestion: paper.decisionQuestion,
    // Lead judgement = what moved; paper.whyNow = stakes of acting (same field as
    // executiveJudgementRequired on the decision paper — keep them distinct here).
    whyItMatters: paper.leadJudgement,
    whyNow: paper.whyNow,
    leadJudgement: paper.leadJudgement,
    readinessLabel: readinessLabel(paper.readiness),
    readinessExplanation: paper.readinessExplanation,
    selectionMessage: paper.selectionMessage,
    actionHref: paper.href,
    confidence: {
      datasetLabel: paper.confidence.datasetLabel,
      judgementLabel: paper.confidence.judgementLabel,
      decisionConfidenceLabel: paper.confidence.decisionConfidenceLabel,
    },
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
    nextAction: paper.selectionRequired
      ? "Executive selection required before execution tracking."
      : "Evidence is still establishing — a decision cannot yet be framed.",
    map: projectManufacturingOperationsMap(analysis),
    network: projectManufacturingEvidenceNetwork(analysis),
  };
}
