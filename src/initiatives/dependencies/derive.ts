import type { IntelligentExecutiveSnapshot } from "@/intelligence/executive-intelligence/types";
import type {
  InitiativeDependency,
  InitiativeProgressState,
  InitiativePriority,
} from "@/initiatives/models/types";
import type { InitiativeTemplate } from "@/initiatives/planner/catalogue";

export function deriveDependencies(input: {
  template: InitiativeTemplate;
  snapshot: IntelligentExecutiveSnapshot;
  relatedDecisionIds: string[];
  relatedOutcomeIds: string[];
}): InitiativeDependency[] {
  const deps: InitiativeDependency[] = [];

  deps.push({
    id: `${input.template.id}-xf`,
    kind: "cross_functional",
    label: `Cross-functional ownership across ${input.template.defaultSupporters
      .slice(0, 2)
      .join(" + ")}`,
    detail: `${input.template.title} requires coordinated executive action, not a single function silo.`,
    relatedEntityIds: [],
    blocking: false,
  });

  deps.push({
    id: `${input.template.id}-cap`,
    kind: "capability",
    label: "Business capability readiness",
    detail: `Capability behind ${input.template.strategicTheme} must absorb the initiative without overdraw.`,
    relatedEntityIds: input.relatedOutcomeIds.slice(0, 2),
    blocking: input.snapshot.capacity.capacity === "overdrawn",
  });

  if (input.relatedDecisionIds[0]) {
    deps.push({
      id: `${input.template.id}-dec`,
      kind: "decision_point",
      label: "Executive Decision bind on critical path",
      detail: `Progress depends on binding ${input.relatedDecisionIds[0]}.`,
      relatedEntityIds: [input.relatedDecisionIds[0]],
      blocking: true,
    });
  }

  deps.push({
    id: `${input.template.id}-path`,
    kind: "critical_path",
    label: "Critical path through Outcomes and Decisions",
    detail: "Outcome health and Decision sequencing gate strategic momentum.",
    relatedEntityIds: [
      ...input.relatedOutcomeIds.slice(0, 2),
      ...input.relatedDecisionIds.slice(0, 1),
    ],
    blocking: false,
  });

  if (
    input.snapshot.capacity.capacity !== "available" ||
    input.snapshot.capacity.attentionBudget === "contested"
  ) {
    deps.push({
      id: `${input.template.id}-res`,
      kind: "resource",
      label: "Executive attention constraint",
      detail: `Attention is ${input.snapshot.capacity.attentionBudget}; capacity ${input.snapshot.capacity.capacity}.`,
      relatedEntityIds: [],
      blocking: input.snapshot.capacity.capacity === "overdrawn",
    });
  }

  deps.push({
    id: `${input.template.id}-asm`,
    kind: "assumption",
    label: "Strategic assumptions hold",
    detail: `Assumes ${input.template.drivers.join(", ")} remain the dominant drivers.`,
    relatedEntityIds: [],
    blocking: false,
  });

  const eventIds =
    input.snapshot.futuresBrief?.futures
      .flatMap((f) => f.supportingEvidence)
      .slice(0, 0) ?? [];
  void eventIds;

  deps.push({
    id: `${input.template.id}-evt`,
    kind: "business_event",
    label: "Business Events influencing progress",
    detail:
      "Status changes, risks raised, and decision-required events move initiative confidence.",
    relatedEntityIds: [],
    blocking: false,
  });

  return deps;
}

export function deriveProgress(input: {
  priority: InitiativePriority;
  snapshot: IntelligentExecutiveSnapshot;
  relatedOutcomeIds: string[];
  relatedDecisionIds: string[];
  blockingDeps: number;
}): {
  progress: InitiativeProgressState;
  progressPercent: number;
  confidence: number;
  attentionRequired: boolean;
  strategicMomentum: "building" | "steady" | "drifting" | "stalled";
} {
  const outcomes = input.snapshot.outcomes.filter((o) =>
    input.relatedOutcomeIds.includes(o.id),
  );
  const decisions = input.snapshot.decisions.filter((d) =>
    input.relatedDecisionIds.includes(d.id),
  );
  const atRisk = outcomes.some(
    (o) => o.status === "at_risk" || o.status === "off_track",
  );
  const improving = outcomes.some((o) => o.momentum === "building");
  const drifting = outcomes.some((o) => o.momentum === "drifting");
  const immediate = decisions.some((d) => d.priority === "immediate");

  let progress: InitiativeProgressState = "mobilising";
  if (input.blockingDeps > 0 && immediate) progress = "blocked";
  else if (atRisk && drifting) progress = "at_risk";
  else if (atRisk || immediate) progress = "watch";
  else if (improving) progress = "on_track";
  else if (outcomes.length === 0) progress = "not_started";
  else progress = "mobilising";

  const progressPercent =
    progress === "on_track"
      ? 55
      : progress === "watch"
        ? 40
        : progress === "at_risk"
          ? 30
          : progress === "blocked"
            ? 20
            : progress === "mobilising"
              ? 25
              : 10;

  const confidence = Math.max(
    40,
    Math.min(
      88,
      58 +
        (improving ? 10 : 0) -
        (atRisk ? 12 : 0) -
        (immediate ? 6 : 0) -
        input.blockingDeps * 4 +
        (input.snapshot.pulse.confidence.value > 70 ? 6 : 0),
    ),
  );

  const strategicMomentum =
    progress === "blocked"
      ? "stalled"
      : improving && !atRisk
        ? "building"
        : drifting || atRisk
          ? "drifting"
          : "steady";

  return {
    progress,
    progressPercent,
    confidence,
    attentionRequired:
      progress === "blocked" ||
      progress === "at_risk" ||
      input.priority === "critical" ||
      immediate,
    strategicMomentum,
  };
}
