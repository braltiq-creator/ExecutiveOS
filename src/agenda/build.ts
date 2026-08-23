import type { IntelligentExecutiveSnapshot } from "@/intelligence/executive-intelligence/types";
import type { EnterpriseDigitalTwin } from "@/digital-twin";
import type {
  AgendaHealth,
  ExecutiveAgenda,
  ExecutiveAgendaItem,
} from "@/agenda/models/types";
import {
  boardReadinessFrom,
  planStrategicInitiatives,
  type StrategicInitiative,
} from "@/initiatives";

/**
 * Build the Executive Agenda from planned Strategic Initiatives.
 */
export function buildExecutiveAgenda(input: {
  snapshot: IntelligentExecutiveSnapshot;
  twin?: EnterpriseDigitalTwin;
  initiatives?: StrategicInitiative[];
}): ExecutiveAgenda {
  const initiatives =
    input.initiatives ??
    planStrategicInitiatives({
      snapshot: input.snapshot,
      twin: input.twin,
    });

  const items = initiatives.map((initiative) => toAgendaItem(initiative));
  const boardReadiness = boardReadinessFrom({ initiatives });
  const overallHealth = aggregateHealth(items);
  const confidence =
    items.length === 0
      ? 40
      : Math.round(
          items.reduce((sum, item) => sum + item.confidence, 0) / items.length,
        );
  const strategicMomentum = aggregateMomentum(initiatives);

  return {
    id: "executive-agenda",
    asOf: input.snapshot.asOf,
    title: "Executive Agenda",
    framing: [
      `Leadership priorities for ELT coordination — ${items.length} strategic item(s).`,
      `Overall health ${overallHealth.replace("_", " ")}; board ${boardReadiness.label.toLowerCase()}.`,
      "ExecutiveOS aligns intent and decisions; execution systems deliver the work.",
    ].join(" "),
    items,
    initiatives,
    boardReadiness,
    overallHealth,
    confidence,
    strategicMomentum,
    closingNote:
      "This agenda prepares ELT and Board discussion. It is not a project plan — sponsors own outcomes; operational platforms own delivery.",
  };
}

function toAgendaItem(initiative: StrategicInitiative): ExecutiveAgendaItem {
  return {
    id: `agenda-${initiative.id}`,
    title: initiative.title,
    strategicTheme: themeFromAlignment(initiative.strategicAlignment),
    executiveSponsor: initiative.executiveSponsor,
    executiveCouncilParticipants: [
      initiative.executiveSponsor,
      ...initiative.supportingCouncilMembers,
    ],
    priority: initiative.priority,
    businessDrivers: initiative.businessDrivers,
    relatedStrategicInitiativeIds: [initiative.id],
    relatedFutureIds: initiative.relatedFutureIds,
    relatedDecisionIds: initiative.relatedDecisionIds,
    relatedRiskIds: initiative.relatedRiskIds,
    relatedOpportunityIds: initiative.relatedOpportunityIds,
    overallHealth: healthFromProgress(initiative),
    confidence: initiative.confidence,
    reviewCadence: initiative.reviewCadence,
    evidence: initiative.evidence,
    primaryInitiativeId: initiative.id,
    strategicMomentum: initiative.strategicMomentum,
    attentionRequired: initiative.attentionRequired,
  };
}

function themeFromAlignment(alignment: string): string {
  const theme = alignment.split("—")[0]?.trim();
  return theme && theme.length > 0 ? theme : "Strategic priority";
}

function healthFromProgress(initiative: StrategicInitiative): AgendaHealth {
  switch (initiative.progress) {
    case "on_track":
      return "healthy";
    case "mobilising":
    case "not_started":
      return "stable";
    case "watch":
      return "watch";
    case "at_risk":
      return "at_risk";
    case "blocked":
      return "critical";
    case "completed":
      return "healthy";
    case "cancelled":
      return "watch";
  }
}

function aggregateHealth(items: ExecutiveAgendaItem[]): AgendaHealth {
  if (items.some((i) => i.overallHealth === "critical")) return "critical";
  if (items.some((i) => i.overallHealth === "at_risk")) return "at_risk";
  if (items.some((i) => i.overallHealth === "watch")) return "watch";
  if (items.every((i) => i.overallHealth === "healthy")) return "healthy";
  return "stable";
}

function aggregateMomentum(
  initiatives: StrategicInitiative[],
): ExecutiveAgenda["strategicMomentum"] {
  if (initiatives.some((i) => i.strategicMomentum === "stalled")) return "stalled";
  if (initiatives.some((i) => i.strategicMomentum === "drifting")) return "drifting";
  if (initiatives.some((i) => i.strategicMomentum === "building")) return "building";
  return "steady";
}
