import type {
  InitiativeGovernance,
  InitiativeProgressState,
} from "@/initiatives/models/types";
import type { TimeHorizonId } from "@/futures/models/types";

export function buildInitiativeGovernance(input: {
  title: string;
  timeHorizon: TimeHorizonId;
  relatedDecisionIds: string[];
}): InitiativeGovernance {
  const cadence =
    input.timeHorizon === "30d"
      ? "Weekly executive checkpoint; board update monthly"
      : input.timeHorizon === "90d"
        ? "Fortnightly executive checkpoint; board update quarterly"
        : "Monthly executive checkpoint; board update quarterly";

  return {
    executiveCheckpoints: [
      `Sponsor review: ${input.title}`,
      "Council alignment check on disagreements",
      "Outcome health vs success measures",
    ],
    boardReportingCadence: cadence.split("; ")[1] ?? "Board update quarterly",
    decisionMilestones: input.relatedDecisionIds.length
      ? input.relatedDecisionIds.map(
          (id) => `Decision bind milestone: ${id}`,
        )
      : ["Identify the next executive Decision bind for this initiative"],
    reviewMeetings: [
      "Executive Leadership Team agenda item",
      "Sponsor 1:1 with Chief of Staff",
    ],
    evidenceCollection: [
      "Outcome health and overnight signals",
      "Business Events linked to initiative drivers",
      "Council perspectives and unresolved disagreements",
    ],
    businessEventSubscriptions: [
      "status_changed",
      "risk_raised",
      "decision_required",
      "signal_emitted",
    ],
    councilReviewTriggers: [
      "Progress moves to at_risk or blocked",
      "Material Decision milestone slips",
      "Leading indicator breaches threshold",
      "Board pack window opens",
    ],
  };
}

export function reviewCadenceFor(horizon: TimeHorizonId): string {
  if (horizon === "24h" || horizon === "7d") return "Daily leadership pulse";
  if (horizon === "30d") return "Weekly ELT checkpoint";
  if (horizon === "90d") return "Fortnightly sponsor review";
  return "Monthly strategic review";
}

export function boardReadinessFrom(input: {
  initiatives: Array<{
    progress: InitiativeProgressState;
    confidence: number;
    attentionRequired: boolean;
  }>;
}): {
  level: "ready" | "nearly" | "not_ready";
  label: string;
  detail: string;
} {
  if (input.initiatives.length === 0) {
    return {
      level: "not_ready",
      label: "Not ready",
      detail: "No strategic initiatives on the agenda yet.",
    };
  }
  const blocked = input.initiatives.filter(
    (i) => i.progress === "blocked" || i.progress === "at_risk",
  ).length;
  const avgConfidence =
    input.initiatives.reduce((s, i) => s + i.confidence, 0) /
    input.initiatives.length;
  const attention = input.initiatives.filter((i) => i.attentionRequired).length;

  if (blocked === 0 && avgConfidence >= 65 && attention <= 1) {
    return {
      level: "ready",
      label: "Board ready",
      detail: "Priorities have evidence, sponsors, and manageable attention load.",
    };
  }
  if (blocked <= 1 && avgConfidence >= 55) {
    return {
      level: "nearly",
      label: "Nearly ready",
      detail: "Close remaining at-risk items and Decision binds before board.",
    };
  }
  return {
    level: "not_ready",
    label: "Not board ready",
    detail: "Material initiative risk or thin confidence — escalate in ELT first.",
  };
}
