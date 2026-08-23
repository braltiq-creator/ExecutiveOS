import type { Decision } from "@/lib/decisions/engine-types";
import type { Outcome } from "@/lib/outcomes/types";

export type DecisionAct =
  | "approve"
  | "reject"
  | "delegate"
  | "escalate"
  | "defer"
  | "more_information";

export type OutcomeImpactProjection = {
  outcomeId: string;
  outcomeName: string;
  healthScore: number;
  status: Outcome["status"];
  ifApprove: string;
  ifReject: string;
  ifWait: string;
};

export type MaterialEvidence = {
  id: string;
  title: string;
  source: string;
  asOf: string;
  summary: string;
  whyItMatters: string;
};

export type StrategicRisk = {
  id: string;
  title: string;
  explanation: string;
};

export type DecisionWorkspaceModel = {
  decisionId: string;
  title: string;
  status: Decision["status"];
  statusLabel: string;
  owner: string;
  deadline: string;
  estimatedMinutes: number;
  executiveContext: string;
  whyNow: string;
  whatChanged: string;
  businessImpact: string;
  outcomeImpacts: OutcomeImpactProjection[];
  evidence: MaterialEvidence[];
  risks: StrategicRisk[];
  ifWait: string;
  ifApprove: string;
  ifReject: string;
  advisorRecommendation: {
    summary: string;
    rationale: string;
    confidence: number;
    preferredPath: string;
    caveats: string;
  };
  nextStep: string;
};

function statusLabel(status: Decision["status"]): string {
  return status.replaceAll("_", " ");
}

function estimateMinutes(decision: Decision): number {
  let minutes = 8;
  if (decision.status === "due_today") minutes += 4;
  if (decision.stakeholders.length >= 4) minutes += 3;
  if (decision.evidence.length >= 3) minutes += 2;
  if (decision.alternatives.length >= 3) minutes += 2;
  return Math.min(25, minutes);
}

function preferredAlternative(decision: Decision) {
  return (
    decision.alternatives.find((alt) =>
      alt.label.toLowerCase().includes("exception"),
    ) ??
    decision.alternatives.find((alt) =>
      alt.label.toLowerCase().includes("approve"),
    ) ??
    decision.alternatives[0]
  );
}

function rejectAlternative(decision: Decision) {
  return (
    decision.alternatives.find((alt) =>
      alt.label.toLowerCase().includes("require"),
    ) ??
    decision.alternatives.find((alt) =>
      alt.label.toLowerCase().includes("regional"),
    ) ??
    decision.alternatives[1] ??
    decision.alternatives[0]
  );
}

/**
 * Derive a calm Decision Workspace model from Decision + Outcomes SoT.
 */
export function deriveDecisionWorkspace(
  decision: Decision,
  outcomesById: Map<string, Outcome>,
): DecisionWorkspaceModel {
  const prefer = preferredAlternative(decision);
  const reject = rejectAlternative(decision);

  const outcomeImpacts: OutcomeImpactProjection[] = decision.outcomeIds.map(
    (outcomeId) => {
      const outcome = outcomesById.get(outcomeId);
      const name = outcome?.name ?? outcomeId;
      return {
        outcomeId,
        outcomeName: name,
        healthScore: outcome?.healthScore ?? 0,
        status: outcome?.status ?? "watching",
        ifApprove:
          outcomeId === "outcome-enterprise-arr"
            ? "ARR health recovers an estimated 8–10 points; Helix commercial motion resumes this week."
            : outcomeId === "outcome-board"
              ? "Board risk language can be completed honestly for Friday’s pack."
              : `${name} improves if the preferred path holds.`,
        ifReject:
          outcomeId === "outcome-enterprise-arr"
            ? "Near-term ARR pacing slips; Helix likely exits this procurement window."
            : outcomeId === "outcome-board"
              ? "Board disclosure must name a harder delay and residual commercial risk."
              : `${name} absorbs delay and rebuild cost.`,
        ifWait:
          outcomeId === "outcome-enterprise-arr"
            ? "Each day of wait compounds ARR decline (about 3–5 points) and workshop risk."
            : "Waiting leaves Outcome language incomplete while the calendar moves.",
      };
    },
  );

  const evidence: MaterialEvidence[] = decision.evidence.slice(0, 4).map(
    (item) => ({
      id: item.id,
      title: item.title,
      source: item.source,
      asOf: item.asOf,
      summary: item.summary,
      whyItMatters:
        item.source.toLowerCase().includes("counsel")
          ? "Defines the legal envelope the executive can responsibly choose inside."
          : item.source.toLowerCase().includes("cro")
            ? "Sets the commercial clock — delay here is not free."
            : "Material to the judgement; omit noise that does not change the call.",
    }),
  );

  const risks: StrategicRisk[] = [
    {
      id: "risk-delay",
      title: "Cost of waiting",
      explanation: decision.costOfDelay,
    },
    ...decision.tradeOffs.slice(0, 2).map((trade) => ({
      id: trade.id,
      title: trade.dimension,
      explanation: `${trade.choice} — ${trade.consequence}`,
    })),
    ...(reject
      ? [
          {
            id: "risk-reject-path",
            title: "Reject / hard path downside",
            explanation: reject.downside,
          },
        ]
      : []),
  ].slice(0, 4);

  const executiveContext = [
    decision.why,
    decision.whatChanged,
    decision.businessImpact,
  ].join(" ");

  return {
    decisionId: decision.id,
    title: decision.question,
    status: decision.status,
    statusLabel: statusLabel(decision.status),
    owner: decision.owner,
    deadline: decision.deadline,
    estimatedMinutes: estimateMinutes(decision),
    executiveContext,
    whyNow: decision.why,
    whatChanged: decision.whatChanged,
    businessImpact: decision.businessImpact,
    outcomeImpacts,
    evidence,
    risks,
    ifWait: decision.costOfDelay,
    ifApprove: prefer
      ? `${prefer.upside} ${prefer.summary}`
      : decision.expectedOutcomeImpact,
    ifReject: reject
      ? `${reject.downside} ${reject.summary}`
      : "Rejecting closes the faster path and forces a slower rebuild of posture.",
    advisorRecommendation: {
      summary: decision.recommendationSummary,
      rationale: decision.whatShouldHappenNext,
      confidence: decision.confidence,
      preferredPath: prefer?.label ?? "Preferred path not labelled",
      caveats:
        "This is preparation, not authority. Residual risk remains yours to accept or refuse.",
    },
    nextStep: decision.whatShouldHappenNext,
  };
}

export const DECISION_ACT_LABELS: Record<DecisionAct, string> = {
  approve: "Approve",
  reject: "Reject",
  delegate: "Delegate",
  escalate: "Escalate",
  defer: "Defer",
  more_information: "Require more information",
};

export const DECISION_ACT_DESCRIPTIONS: Record<DecisionAct, string> = {
  approve:
    "Bind organisational judgement to the preferred path. This becomes the Decision of record.",
  reject:
    "Refuse the preferred path and commit to the harder alternative. Recorded with equal permanence.",
  delegate:
    "Assign preparation or execution ownership — authority for the Decision remains clear.",
  escalate:
    "Route to a higher or adjacent authority with full context intact. Does not auto-decide.",
  defer:
    "Choose timing — not never. Urgency is removed; stakes and history remain.",
  more_information:
    "Pause binding until a named gap is closed. Silence until then is intentional.",
};
