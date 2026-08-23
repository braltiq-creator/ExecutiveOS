/**
 * Bridge manufacturing analysis → OutcomePortfolio for existing EIE + Council.
 */

import type { Decision } from "@/lib/decisions/engine-types";
import type { ExecutiveIntent } from "@/lib/intent/engine-types";
import type {
  Outcome,
  OutcomePortfolio,
  OutcomeStatus,
} from "@/lib/outcomes/types";
import type {
  ManufacturingAnalysis,
  ManufacturingInsight,
} from "./manufacturing-analysis";
import {
  applyDecisionPaperToDecision,
  buildManufacturingDecisionPaper,
} from "./manufacturing-decision-frame";

function emptyRec(confidence = 0) {
  return {
    businessImpact: "",
    expectedOutcomeImpact: "",
    confidence,
    owner: "Executive Council",
    deadline: "This week",
  };
}

function statusFromInsight(insight: ManufacturingInsight): OutcomeStatus {
  if (insight.posture === "act" || insight.posture === "investigate") {
    return insight.confidence >= 80 ? "at_risk" : "watching";
  }
  if (insight.posture === "insufficient_evidence") return "watching";
  return "on_track";
}

function healthFromInsight(insight: ManufacturingInsight): number {
  if (insight.posture === "insufficient_evidence") return 55;
  if (insight.posture === "investigate")
    return Math.max(35, 90 - insight.confidence / 2);
  if (insight.posture === "act") return Math.max(40, 85 - insight.confidence / 3);
  return Math.min(88, 60 + insight.confidence / 5);
}

function buildOutcome(
  insight: ManufacturingInsight,
  decisionId: string,
): Outcome {
  const health = Math.round(healthFromInsight(insight));
  return {
    id: `outcome-${insight.id}`,
    name: insight.title,
    description: insight.detail,
    status: statusFromInsight(insight),
    healthScore: health,
    yesterdayMovement: 0,
    yesterdayMovementLabel: "Unchanged vs prior snapshot baseline",
    expectedTrajectory: {
      direction:
        insight.posture === "act" || insight.posture === "investigate"
          ? "declining"
          : "stable",
      summary: insight.detail,
      horizonLabel: "This planning cycle",
    },
    decisionIds: [decisionId],
    contributingInsights: [
      {
        id: `ins-${insight.id}`,
        sourceLabel: "Manufacturing Forecast Snapshot",
        whatChanged: insight.title,
        why: insight.detail,
        whatShouldHappenNext:
          insight.posture === "insufficient_evidence"
            ? "Gather missing evidence before binding a recommendation."
            : insight.posture === "monitor"
              ? "Monitor — do not force a recommendation."
              : "Investigate with advisors and decide whether to act.",
        recommendation: {
          ...emptyRec(insight.confidence),
          businessImpact: insight.detail,
          expectedOutcomeImpact:
            insight.posture === "insufficient_evidence"
              ? "Insufficient evidence"
              : insight.posture === "monitor"
                ? "Monitor"
                : "Investigate",
        },
      },
    ],
    pendingActions: [],
    confidence: insight.confidence,
    owner: "Executive Council",
    targetDate: new Date().toISOString().slice(0, 10),
    businessImpact: insight.detail,
    timeline: [],
    contributors: [],
    blockers:
      insight.posture === "investigate" || insight.posture === "act"
        ? [
            {
              id: `blk-${insight.id}`,
              title: insight.title,
              description: insight.detail,
              severity: insight.posture === "act" ? "critical" : "attention",
              owner: "COO",
              since: new Date().toISOString().slice(0, 10),
            },
          ]
        : [],
    recommendations: [
      {
        id: `orec-${insight.id}`,
        title:
          insight.posture === "insufficient_evidence"
            ? "Insufficient evidence — do not bind"
            : insight.posture === "monitor"
              ? "Monitor"
              : "Investigate before bind",
        whatChanged: insight.title,
        why: insight.detail,
        whatShouldHappenNext: insight.evidence[0] ?? insight.detail,
        recommendation: {
          ...emptyRec(insight.confidence),
          businessImpact: insight.detail,
          expectedOutcomeImpact:
            insight.posture === "insufficient_evidence"
              ? "Insufficient evidence"
              : insight.posture === "monitor"
                ? "Monitor"
                : "Investigate",
        },
      },
    ],
    forecast: {
      horizonLabel: "Near term",
      expectedScore: health,
      direction:
        insight.posture === "act" || insight.posture === "investigate"
          ? "declining"
          : "stable",
      narrative: insight.detail,
      assumptions: insight.evidence,
    },
    history: [],
    relationships: [],
    overnightSignals: [],
    calendarContext: [],
  };
}

function buildDecision(
  insight: ManufacturingInsight,
  outcomeId: string,
): Decision {
  const postureLabel =
    insight.posture === "insufficient_evidence"
      ? "Insufficient evidence"
      : insight.posture === "monitor"
        ? "Monitor"
        : "Investigate";

  return {
    id: `decision-${insight.id}`,
    question: insight.title,
    outcomeIds: [outcomeId],
    status: "under_review",
    owner: "COO",
    deadline: "This week",
    confidence: insight.confidence,
    businessImpact: insight.detail,
    expectedOutcomeImpact: insight.detail,
    costOfDelay:
      insight.posture === "monitor"
        ? "Low if monitored"
        : "Capacity and inventory exposure compound while unexamined",
    whatChanged: insight.title,
    why: insight.detail,
    whatShouldHappenNext: postureLabel,
    stakeholders: [
      {
        id: "sh-coo",
        name: "COO",
        role: "Operations",
        stance: "sponsor",
        note: "Primary operations judgement",
      },
      {
        id: "sh-cfo",
        name: "CFO",
        role: "Finance",
        stance: "approver",
        note: "Working capital and forecast confidence",
      },
    ],
    evidence: insight.evidence.map((summary, i) => ({
      id: `ev-${insight.id}-${i}`,
      title: `Evidence ${i + 1}`,
      source: "Executive Snapshot",
      summary,
      asOf: new Date().toISOString(),
    })),
    alternatives: [
      {
        id: `alt-monitor-${insight.id}`,
        label: "Monitor",
        summary: "Watch without forcing a bind.",
        upside: "Avoids false certainty",
        downside: "May delay needed action",
      },
      {
        id: `alt-investigate-${insight.id}`,
        label: "Investigate",
        summary: "Seek missing evidence before recommendation.",
        upside: "Raises confidence",
        downside: "Consumes executive attention",
      },
    ],
    tradeOffs: [],
    relationships: [],
    timeline: [],
    history: [],
    approvalWorkflow: [],
    recommendationSummary: postureLabel,
  };
}

function buildIntent(analysis: ManufacturingAnalysis): ExecutiveIntent {
  const focus = analysis.insights
    .filter((i) => i.category === "executive_judgement")
    .slice(0, 3)
    .map((i) => `outcome-${i.id}`);

  return {
    id: "intent-manufacturing-forecast",
    title: "Protect forecast clarity and capacity discipline",
    narrative:
      "Interpret manufacturing demand through evidence — not MRP execution. Raise confidence where coverage is weak; force judgement only where evidence supports it.",
    priority: "high",
    horizon: "This planning cycle",
    reviewDate: new Date().toISOString().slice(0, 10),
    reviewCadence: "Weekly",
    focusOutcomeIds: focus,
    watchingOutcomeIds: analysis.insights
      .filter((i) => i.posture === "monitor")
      .slice(0, 3)
      .map((i) => `outcome-${i.id}`),
    nonFocusOutcomeIds: [],
    constraints: analysis.missingInformation.slice(0, 4).map((label, i) => ({
      id: `c-${i}`,
      label: "Evidence gap",
      explanation: label,
    })),
    successSignals: [
      {
        id: "ss-1",
        label: "Forecast confidence",
        narrative: "Demand plan is interpretable with transparent confidence.",
      },
    ],
    status: "active",
    history: [],
  };
}

/**
 * Convert manufacturing analysis into an OutcomePortfolio for existing engines.
 */
export function portfolioFromManufacturingAnalysis(
  analysis: ManufacturingAnalysis,
  executiveName = "Executive",
): OutcomePortfolio {
  const primary = analysis.insights.filter(
    (i) => i.category !== "executive_judgement",
  );
  const selected = primary.slice(0, 6);

  const outcomes: Outcome[] = [];
  const decisions: Decision[] = [];

  for (const insight of selected) {
    const decisionId = `decision-${insight.id}`;
    const outcomeId = `outcome-${insight.id}`;
    outcomes.push(buildOutcome(insight, decisionId));
    decisions.push(buildDecision(insight, outcomeId));
  }

  const paper = buildManufacturingDecisionPaper(analysis, undefined);
  if (paper.decisionId) {
    const idx = decisions.findIndex((d) => d.id === paper.decisionId);
    if (idx >= 0) {
      decisions[idx] = applyDecisionPaperToDecision(decisions[idx]!, paper);
    }
  }

  const riskWeight = selected.filter((i) =>
    ["investigate", "act"].includes(i.posture),
  ).length;
  const overallScore = Math.max(35, Math.min(88, 78 - riskWeight * 6));

  return {
    overallScore,
    statusLabel:
      riskWeight > 0
        ? "Manufacturing forecast attention required — evidence-based judgements prepared"
        : "Manufacturing forecast stable enough to monitor",
    refreshedAt: analysis.asOf,
    executiveName,
    outcomes,
    decisions,
    intent: buildIntent(analysis),
    intentHistory: [],
  };
}
