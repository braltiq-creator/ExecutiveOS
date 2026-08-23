import type { IntelligentExecutiveSnapshot } from "@/intelligence/executive-intelligence/types";
import {
  formatRefresh,
  shortLine,
  shortOwner,
} from "@/intelligence/executive-intelligence/lib/helpers";
import type {
  BusinessPulseLevel,
  ExecutiveSnapshot,
  OutcomeMomentum,
  SnapshotTrend,
} from "@/lib/snapshot/types";
import { MOMENTUM_LABELS, PULSE_LABELS } from "@/lib/snapshot/types";
import { toCouncilView } from "@/agents";
import { toPossibleFuturesView } from "@/futures";
import { toExecutiveAgendaView } from "@/agenda";
import { toExecutiveContextView } from "@/providers/microsoft365";
import { toOperationalContextView } from "@/providers/simpro";
import { toCommercialContextView } from "@/providers/salesforce";

/**
 * Presentation adapter — maps IntelligentExecutiveSnapshot → UI ExecutiveSnapshot.
 * UI remains a pure render surface.
 */
export function toPresentationSnapshot(
  intelligent: IntelligentExecutiveSnapshot,
): ExecutiveSnapshot {
  const pulseLevel = toUiPulseLevel(intelligent.pulse.state);

  const openDecisions = intelligent.decisions
    .filter((decision) => decision.priority !== "resolved")
    .slice(0, 3);

  const actionRecs = intelligent.recommendations
    .filter((rec) =>
      intelligent.attention.selected.some((item) => item.id === rec.id) ||
      rec.relatedDecisionIds.length > 0,
    )
    .slice(0, 3);

  // Prefer decision-linked recommendations first for Today strip
  const preferredActions =
    actionRecs.length > 0
      ? actionRecs
      : intelligent.recommendations.slice(0, 3);

  return {
    greeting: intelligent.greeting,
    asOf: intelligent.asOf,
    pulse: {
      level: pulseLevel,
      label: PULSE_LABELS[pulseLevel],
      why: intelligent.pulse.narrative.endsWith(".")
        ? intelligent.pulse.narrative
        : `${intelligent.pulse.narrative}.`,
      confidence: intelligent.pulse.confidence.value,
      aiConfidence: Math.max(
        55,
        intelligent.pulse.confidence.value - 4,
      ),
      refreshedAt: intelligent.asOf,
      refreshedLabel: formatRefresh(intelligent.asOf),
      href: "/outcomes",
    },
    compass: {
      dimensions: intelligent.compass.dimensions.map((dimension) => ({
        id: dimension.id,
        label: dimension.label,
        strength: dimension.strength,
        direction: dimension.direction,
      })),
    },
    executiveState: {
      decisionLoad: intelligent.capacity.leadershipLoad,
      capacity: intelligent.capacity.capacity,
      attentionBudget: intelligent.capacity.attentionBudget,
      summary: intelligent.capacity.reasoning,
      href: "/decisions",
    },
    outcomes: intelligent.outcomes.slice(0, 6).map((outcome) => {
      const trend = toTrend(outcome.trajectory);
      const momentum = outcome.momentum as OutcomeMomentum;
      return {
        id: outcome.id,
        name: outcome.shortName,
        href: `/outcomes/${outcome.id}`,
        trend,
        momentum,
        momentumLabel: MOMENTUM_LABELS[momentum],
        movementLabel: outcome.movementLabel,
        sparkline: outcome.healthHistory,
        status: outcome.status,
        lastChange: outcome.lastSignificantChange,
      };
    }),
    metrics: intelligent.metrics.map((metric) => ({
      id: metric.id,
      label: metric.label,
      value: metric.value,
      numericValue: metric.numericValue,
      href: metric.href,
      emphasis: metric.emphasis,
    })),
    sinceYesterday: intelligent.narrative.sinceYesterday,
    priorityDecisions: openDecisions.map((decision) => ({
      id: decision.id,
      title: decision.question.trim(),
      href: `/decisions/${decision.id}`,
      owner: shortOwner(decision.owner),
      decisionTimeLabel: `${decision.estimatedEffortMinutes} min`,
      businessImpact: shortLine(decision.businessNarrative, 7),
    })),
    recommendedActions: preferredActions.map((rec) => ({
      id: rec.id,
      title: shortLine(rec.title, 10),
      why: shortLine(rec.reason, 8),
      expectedOutcome: rec.expectedBenefit,
      href: rec.href,
    })),
    executiveCouncil: intelligent.councilBrief
      ? toCouncilView(intelligent.councilBrief)
      : undefined,
    possibleFutures: intelligent.futuresBrief
      ? toPossibleFuturesView(intelligent.futuresBrief)
      : undefined,
    executiveAgenda: intelligent.agendaBrief
      ? toExecutiveAgendaView(intelligent.agendaBrief)
      : undefined,
    executiveContext: intelligent.executiveContextBrief
      ? toExecutiveContextView(intelligent.executiveContextBrief)
      : undefined,
    operationalContext: intelligent.operationalContextBrief
      ? toOperationalContextView(intelligent.operationalContextBrief)
      : undefined,
    commercialContext: intelligent.commercialContextBrief
      ? toCommercialContextView(intelligent.commercialContextBrief)
      : undefined,
  };
}

function toUiPulseLevel(
  state: IntelligentExecutiveSnapshot["pulse"]["state"],
): BusinessPulseLevel {
  switch (state) {
    case "healthy":
      return "improving";
    case "attention_required":
      return "attention";
    case "critical":
      return "critical";
    case "stable":
    default:
      return "stable";
  }
}

function toTrend(
  trajectory: IntelligentExecutiveSnapshot["outcomes"][number]["trajectory"],
): SnapshotTrend {
  if (trajectory === "improving") return "up";
  if (trajectory === "declining") return "down";
  return "flat";
}
