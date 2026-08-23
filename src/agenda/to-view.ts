import type {
  AgendaHealth,
  ExecutiveAgenda,
  ExecutiveAgendaView,
  AgendaItemView,
} from "@/agenda/models/types";
import {
  MOMENTUM_LABELS,
  PRIORITY_LABELS,
  PROGRESS_LABELS,
  type StrategicInitiative,
} from "@/initiatives";
import { getCouncilAgent } from "@/agents";
import { getBusinessDriver } from "@/futures/drivers";

const HEALTH_LABELS: Record<AgendaHealth, string> = {
  healthy: "Healthy",
  stable: "Stable",
  watch: "Watch",
  at_risk: "At Risk",
  critical: "Critical",
};

/**
 * Map ExecutiveAgenda → Today presentation model.
 */
export function toExecutiveAgendaView(
  agenda: ExecutiveAgenda,
): ExecutiveAgendaView {
  const byId = new Map(
    agenda.initiatives.map((initiative) => [initiative.id, initiative]),
  );

  const items: AgendaItemView[] = agenda.items.map((item) => {
    const initiative = byId.get(item.primaryInitiativeId);
    return toItemView(item, initiative);
  });

  return {
    title: agenda.title,
    framing: agenda.framing,
    overallHealth: agenda.overallHealth,
    overallHealthLabel: HEALTH_LABELS[agenda.overallHealth],
    confidence: agenda.confidence,
    strategicMomentum: agenda.strategicMomentum,
    momentumLabel: MOMENTUM_LABELS[agenda.strategicMomentum],
    boardReadiness: agenda.boardReadiness,
    items,
    closingNote: agenda.closingNote,
  };
}

function toItemView(
  item: ExecutiveAgenda["items"][number],
  initiative: StrategicInitiative | undefined,
): AgendaItemView {
  const sponsor = getCouncilAgent(item.executiveSponsor);
  const progress = initiative?.progress ?? "mobilising";

  return {
    id: item.id,
    title: item.title,
    strategicTheme: item.strategicTheme,
    priority: item.priority,
    priorityLabel: PRIORITY_LABELS[item.priority],
    executiveSponsor: sponsor?.shortTitle ?? item.executiveSponsor,
    executiveSponsorTitle: sponsor?.title ?? item.executiveSponsor,
    health: item.overallHealth,
    healthLabel: HEALTH_LABELS[item.overallHealth],
    confidence: item.confidence,
    strategicMomentum: item.strategicMomentum,
    momentumLabel: MOMENTUM_LABELS[item.strategicMomentum],
    attentionRequired: item.attentionRequired,
    reviewCadence: item.reviewCadence,
    businessDrivers: item.businessDrivers.map(
      (id) => getBusinessDriver(id).label,
    ),
    relatedFutures: item.relatedFutureIds,
    upcomingDecisions: item.relatedDecisionIds,
    criticalDependencies:
      initiative?.dependencies
        .filter((d) => d.blocking || d.kind === "critical_path")
        .map((d) => d.label) ?? [],
    evidence: item.evidence,
    councilAlignment:
      initiative?.coordination.perspectives.map((p) => ({
        agent: p.title,
        shortTitle: p.shortTitle,
        agreement: p.agreement,
        contribution: p.contribution,
        stance: p.stance,
      })) ?? [],
    disagreements: initiative?.coordination.disagreements ?? [],
    initiative: {
      id: initiative?.id ?? item.primaryInitiativeId,
      title: initiative?.title ?? item.title,
      executiveOutcome: initiative?.executiveOutcome ?? "",
      businessObjective: initiative?.businessObjective ?? "",
      progress,
      progressLabel: PROGRESS_LABELS[progress],
      progressPercent: initiative?.progressPercent ?? 0,
      successMeasures:
        initiative?.successMeasures.map((m) => m.label) ?? [],
      completionCriteria: initiative?.completionCriteria ?? [],
      whyItExists: initiative?.explanation.whyItExists ?? "",
      whyNow: initiative?.explanation.whyNow ?? "",
      whatSuccessLooksLike:
        initiative?.explanation.whatSuccessLooksLike ?? "",
      operationalLinks:
        initiative?.operationalSystems.map((s) => ({
          system: s.label,
          owns: s.ownsInSystem,
        })) ?? [],
      reasoning: initiative?.coordination.perspectives[0]?.reasoning ?? [],
    },
  };
}
