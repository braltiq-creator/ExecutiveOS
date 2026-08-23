import type { EnterpriseDigitalTwin } from "@/digital-twin/twin";
import type { EnterpriseDataProvider } from "@/intelligence/executive-intelligence/providers/enterprise-data-provider";
import type {
  EnterpriseDecisionSignal,
  EnterpriseOutcomeSignal,
  EnterpriseSignals,
} from "@/intelligence/executive-intelligence/types";

/**
 * EnterpriseDataProvider backed by the Digital Twin.
 * Intelligence reasons over Twin state — never connector payloads.
 */
export function createTwinEnterpriseDataProvider(
  twin: EnterpriseDigitalTwin,
  meta?: { executiveName?: string; overallScore?: number },
): EnterpriseDataProvider {
  return {
    id: "provider-digital-twin",
    label: "Enterprise Digital Twin",
    getSignals(): EnterpriseSignals {
      return deriveSignalsFromTwin(twin, meta);
    },
  };
}

export function deriveSignalsFromTwin(
  twin: EnterpriseDigitalTwin,
  meta?: { executiveName?: string; overallScore?: number },
): EnterpriseSignals {
  const state = twin.getState();
  const asOf = state.asOf || "2026-07-20T06:15:00+10:00";
  const risks = twin.query({ type: "Risk", limit: 20 });
  const meetings = twin.query({ type: "Meeting", limit: 20 });
  const actions = twin.query({ type: "Action", limit: 20 });
  const signals = twin.query({ type: "Signal", limit: 20 });
  const decisions = twin.query({ type: "Decision", limit: 20 });

  const outcomeIds = [
    "outcome-enterprise-arr",
    "outcome-board",
    "outcome-efficiency",
    "outcome-retention",
  ];

  const outcomeSignals: EnterpriseOutcomeSignal[] = outcomeIds.map((id) => {
    const entity = twin.getEntity(id);
    const linkedRisks = risks.filter(
      (risk) =>
        risk.relatedIds.includes(id) ||
        risk.id.includes(id.replace("outcome-", "")),
    );
    const linkedMeetings = meetings.filter((meeting) =>
      meeting.relatedIds.includes(id),
    );
    const linkedActions = actions.filter((action) =>
      action.relatedIds.includes(id),
    );
    const linkedSignals = signals.filter((signal) =>
      signal.relatedIds.includes(id),
    );
    const linkedDecisions = decisions.filter((decision) =>
      decision.relatedIds.includes(id),
    );

    const pressure = linkedRisks.length * 12 + linkedSignals.length * 8;
    const healthScore = clamp(
      entity
        ? 100 - Math.round(entity.importance * 0.25) - pressure
        : 68 - pressure,
      28,
      92,
    );
    const status =
      healthScore < 48
        ? ("off_track" as const)
        : healthScore < 70
          ? ("at_risk" as const)
          : ("on_track" as const);

    const systems = unique([
      ...(entity?.sourceSystems ?? []),
      ...linkedSignals.flatMap((signal) => signal.sourceSystems),
      "Enterprise Digital Twin",
    ]);

    return {
      id,
      name: entity && !entity.properties.stub ? entity.label : labelForOutcome(id),
      description: `${labelForOutcome(id)} projected from the Enterprise Digital Twin.`,
      status,
      healthScore,
      yesterdayMovement: id === "outcome-enterprise-arr" ? -6 : linkedRisks.length > 0 ? -2 : 0,
      yesterdayMovementLabel:
        id === "outcome-enterprise-arr"
          ? "Helix delay signal via Salesforce"
          : linkedRisks[0]?.label ?? "No material overnight movement",
      confidence: entity?.confidence ?? 72,
      owner: "Alex",
      businessImpact: "Material to the executive agenda this week.",
      decisionIds:
        linkedDecisions.length > 0
          ? linkedDecisions.map((decision) => decision.id)
          : id === "outcome-enterprise-arr"
            ? ["decision-residency"]
            : [],
      blockers: linkedRisks.slice(0, 3).map((risk) => ({
        id: risk.id,
        title: risk.label,
        severity:
          risk.importance >= 85
            ? ("critical" as const)
            : risk.importance >= 70
              ? ("attention" as const)
              : ("watch" as const),
      })),
      overnightSignals: linkedSignals.slice(0, 3).map((signal) => ({
        id: signal.id,
        severity:
          signal.importance >= 90
            ? ("critical" as const)
            : signal.importance >= 70
              ? ("attention" as const)
              : ("info" as const),
        whatChanged: signal.label,
        why: `Observed via ${signal.sourceSystems.join(", ") || "twin"}.`,
      })),
      pendingActions: linkedActions.slice(0, 4).map((action) => ({
        id: action.id,
        label: action.label,
        status: action.status?.toLowerCase().includes("progress")
          ? ("in_progress" as const)
          : ("pending" as const),
        why: stringProp(action.properties, "summary") ?? action.label,
        expectedOutcomeImpact: `Unblocks ${labelForOutcome(id)}.`,
      })),
      meetings: linkedMeetings.slice(0, 3).map((meeting) => ({
        id: meeting.id,
        title: meeting.label,
        startsAt: stringProp(meeting.properties, "startsAt") ?? asOf,
      })),
      history: [
        {
          date: asOf.slice(0, 10),
          healthScore,
          note: "Twin projection",
        },
      ],
      forecast: {
        direction:
          healthScore < 60
            ? ("declining" as const)
            : healthScore > 75
              ? ("improving" as const)
              : ("stable" as const),
        expectedScore: clamp(healthScore + (linkedDecisions.length > 0 ? 4 : -2), 30, 95),
        narrative:
          linkedDecisions.length > 0
            ? "Forecast improves once open Decisions clear Twin blockers."
            : "Forecast holds pending new Twin events.",
      },
      contributingSystems: systems,
    };
  });

  // Seed relationship: Helix risk always pressures ARR
  const helixRisk = twin.getEntity("risk-helix-window");
  if (helixRisk) {
    const arr = outcomeSignals.find((o) => o.id === "outcome-enterprise-arr");
    if (arr && !arr.blockers.some((b) => b.id === helixRisk.id)) {
      arr.blockers.unshift({
        id: helixRisk.id,
        title: helixRisk.label,
        severity: "critical",
      });
      arr.status = "at_risk";
      arr.healthScore = Math.min(arr.healthScore, 58);
    }
  }

  const decisionEntities =
    decisions.length > 0
      ? decisions
      : twin.getEntity("decision-residency")
        ? [twin.getEntity("decision-residency")!]
        : [];

  const decisionSignals: EnterpriseDecisionSignal[] = decisionEntities.map(
    (decision) => ({
      id: decision.id,
      question: decision.label,
      status:
        decision.status ??
        (decision.importance >= 90 ? "due_today" : "pending"),
      owner: "Alex",
      deadline: asOf.slice(0, 10),
      confidence: decision.confidence,
      businessImpact: "Strategic commercial and governance exposure.",
      expectedOutcomeImpact: "Protects Enterprise ARR and board honesty.",
      costOfDelay: "Procurement window continues to compress.",
      whatChanged:
        stringProp(decision.properties, "stage") ??
        "Twin recorded a decision_required event.",
      why: `Digital Twin entity ${decision.id} (v${decision.version}) from ${decision.sourceSystems.join(", ")}.`,
      outcomeIds:
        decision.relatedIds.filter((id) => id.startsWith("outcome-")).length > 0
          ? decision.relatedIds.filter((id) => id.startsWith("outcome-"))
          : ["outcome-enterprise-arr"],
      stakeholderCount: 3,
      evidenceCount: twin.history(decision.id).length,
      systems: unique([...decision.sourceSystems, "Enterprise Digital Twin"]),
    }),
  );

  if (decisionSignals.length === 0) {
    decisionSignals.push({
      id: "decision-residency",
      question: "Take a written Helix EU residency position?",
      status: "due_today",
      owner: "Alex",
      deadline: asOf.slice(0, 10),
      confidence: 80,
      businessImpact: "Strategic commercial exposure.",
      expectedOutcomeImpact: "Unblocks Helix expansion path.",
      costOfDelay: "Window risk rises daily.",
      whatChanged: "Awaiting Twin decision events.",
      why: "Default Focus Decision while Twin warms.",
      outcomeIds: ["outcome-enterprise-arr"],
      stakeholderCount: 3,
      evidenceCount: 0,
      systems: ["Enterprise Digital Twin"],
    });
  }

  const overallScore =
    meta?.overallScore ??
    Math.round(
      outcomeSignals.reduce((sum, outcome) => sum + outcome.healthScore, 0) /
        Math.max(1, outcomeSignals.length),
    );

  return {
    asOf,
    executiveName: meta?.executiveName ?? "Alex",
    overallScore,
    outcomes: outcomeSignals,
    decisions: decisionSignals,
  };
}

function labelForOutcome(id: string): string {
  switch (id) {
    case "outcome-enterprise-arr":
      return "Enterprise ARR";
    case "outcome-board":
      return "Board Readiness";
    case "outcome-efficiency":
      return "Executive Efficiency";
    case "outcome-retention":
      return "Net Retention";
    default:
      return id;
  }
}

function stringProp(
  properties: Record<string, unknown> | undefined,
  key: string,
): string | undefined {
  const value = properties?.[key];
  return typeof value === "string" ? value : undefined;
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}
