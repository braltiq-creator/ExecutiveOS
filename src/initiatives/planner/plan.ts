import type { IntelligentExecutiveSnapshot } from "@/intelligence/executive-intelligence/types";
import type { EnterpriseDigitalTwin } from "@/digital-twin";
import type {
  InitiativePriority,
  StrategicInitiative,
} from "@/initiatives/models/types";
import {
  INITIATIVE_TEMPLATES,
  type InitiativeTemplate,
} from "@/initiatives/planner/catalogue";
import { deriveDependencies, deriveProgress } from "@/initiatives/dependencies";
import { coordinateInitiative } from "@/initiatives/coordination/council";
import { buildInitiativeGovernance, reviewCadenceFor } from "@/initiatives/governance/define";
import { buildInitiativeExplanation } from "@/initiatives/explainability/explain";
import { toExecutionSystemRefs } from "@/initiatives/integration/execution-systems";
import type { BusinessDriverId } from "@/futures/models/types";

/**
 * Strategic Initiative Planner — generates coordinated initiatives
 * from Council, Intelligence, Judgement, Foresight, Memory, Intent, Graph.
 * Never produces a project plan.
 */
export function planStrategicInitiatives(input: {
  snapshot: IntelligentExecutiveSnapshot;
  twin?: EnterpriseDigitalTwin;
  maxInitiatives?: number;
}): StrategicInitiative[] {
  const max = input.maxInitiatives ?? 5;
  const ranked = rankTemplates(input.snapshot, input.twin).slice(0, max);
  return ranked.map(({ template, score, priority }) =>
    materialiseInitiative({
      template,
      score,
      priority,
      snapshot: input.snapshot,
      twin: input.twin,
    }),
  );
}

function rankTemplates(
  snapshot: IntelligentExecutiveSnapshot,
  twin?: EnterpriseDigitalTwin,
): Array<{ template: InitiativeTemplate; score: number; priority: InitiativePriority }> {
  const corpus = evidenceCorpus(snapshot, twin);

  return INITIATIVE_TEMPLATES.map((template) => {
    let score = 10;
    for (const hint of template.evidenceHints) {
      if (hint.test(corpus)) score += 18;
    }
    for (const driver of template.drivers) {
      if (activeDrivers(snapshot).includes(driver)) score += 8;
    }
    if (
      snapshot.futuresBrief?.futures.some((f) =>
        f.drivers.some((d) => template.drivers.includes(d)),
      )
    ) {
      score += 10;
    }
    if (
      snapshot.judgementBriefs?.some((b) =>
        template.evidenceHints.some((h) => h.test(b.question + b.executiveSummary)),
      )
    ) {
      score += 8;
    }

    // Always surface board prep when review load is heavy
    if (
      template.id === "prepare_board_strategy_review" &&
      snapshot.reviewMinutes >= 40
    ) {
      score += 15;
    }

    const priority = elevatePriority(template, score, snapshot);
    return { template, score, priority };
  }).sort((a, b) => b.score - a.score);
}

function elevatePriority(
  template: InitiativeTemplate,
  score: number,
  snapshot: IntelligentExecutiveSnapshot,
): InitiativePriority {
  if (score >= 55 || template.defaultPriority === "critical") {
    if (
      template.id === "reduce_customer_churn" &&
      snapshot.outcomes.some(
        (o) => o.status === "at_risk" || o.status === "off_track",
      )
    ) {
      return "critical";
    }
    return score >= 70 ? "critical" : "high";
  }
  if (score >= 35) return "high";
  if (score >= 20) return template.defaultPriority;
  return "watch";
}

function evidenceCorpus(
  snapshot: IntelligentExecutiveSnapshot,
  twin?: EnterpriseDigitalTwin,
): string {
  const parts = [
    snapshot.pulse.reasoning,
    snapshot.pulse.narrative,
    snapshot.capacity.reasoning,
    ...snapshot.outcomes.map(
      (o) => `${o.name} ${o.shortName} ${o.status} ${o.reasoning}`,
    ),
    ...snapshot.decisions.map(
      (d) => `${d.question} ${d.businessNarrative}`,
    ),
    ...snapshot.recommendations.map((r) => `${r.title} ${r.reason}`),
    ...(snapshot.futuresBrief?.futures.flatMap((f) => [
      f.title,
      f.description,
      ...f.supportingEvidence,
    ]) ?? []),
    ...(twin
      ?.query({ minImportance: 30, limit: 12 })
      .map((e) => `${e.label} ${e.type} ${e.status ?? ""}`) ?? []),
  ];
  return parts.join(" | ");
}

function activeDrivers(snapshot: IntelligentExecutiveSnapshot): BusinessDriverId[] {
  const drivers = new Set<BusinessDriverId>();
  if (snapshot.capacity.capacity !== "available") drivers.add("capacity");
  if (snapshot.outcomes.some((o) => o.status !== "on_track")) {
    drivers.add("revenue");
    drivers.add("customer_demand");
  }
  for (const future of snapshot.futuresBrief?.futures ?? []) {
    for (const d of future.drivers) drivers.add(d);
  }
  drivers.add("strategic_initiatives");
  return [...drivers];
}

function materialiseInitiative(input: {
  template: InitiativeTemplate;
  score: number;
  priority: InitiativePriority;
  snapshot: IntelligentExecutiveSnapshot;
  twin?: EnterpriseDigitalTwin;
}): StrategicInitiative {
  const { template, snapshot, priority } = input;
  const relatedDecisionIds = matchDecisions(template, snapshot);
  const relatedOutcomeIds = matchOutcomes(template, snapshot);
  const relatedFutureIds =
    snapshot.futuresBrief?.futures
      .filter((f) => f.drivers.some((d) => template.drivers.includes(d)))
      .map((f) => f.id)
      .slice(0, 3) ?? [];

  const twinRisks =
    input.twin
      ?.query({ type: "Risk", minImportance: 40, limit: 4 })
      .map((e) => e.id) ?? [];
  const twinOpps =
    input.twin
      ?.query({ type: "Opportunity", minImportance: 40, limit: 4 })
      .map((e) => e.id) ?? [];
  const relatedEvents =
    input.twin
      ?.history()
      .filter((e) =>
        template.evidenceHints.some(
          (h) =>
            h.test(e.eventType) ||
            h.test(JSON.stringify(e.payload)) ||
            h.test(e.entityId),
        ),
      )
      .map((e) => e.id)
      .slice(0, 6) ?? [];

  const evidence = collectEvidence(template, snapshot, relatedDecisionIds, relatedOutcomeIds);
  const dependencies = deriveDependencies({
    template,
    snapshot,
    relatedDecisionIds,
    relatedOutcomeIds,
  });
  const tracking = deriveProgress({
    priority,
    snapshot,
    relatedDecisionIds,
    relatedOutcomeIds,
    blockingDeps: dependencies.filter((d) => d.blocking).length,
  });

  const coordination = coordinateInitiative({
    template,
    snapshot,
    priority,
    evidence,
  });

  const boundary = buildInitiativeExplanation({
    template,
    evidence,
    relatedDecisionIds,
  });

  return {
    id: `initiative-${template.id}`,
    title: template.title,
    executiveOutcome: template.executiveOutcome,
    businessObjective: template.businessObjective,
    strategicAlignment: `${template.strategicTheme} — aligned to current Intent and Outcome pressure.`,
    executiveSponsor: template.defaultSponsor,
    supportingCouncilMembers: template.defaultSupporters,
    priority,
    timeHorizon: template.timeHorizon,
    businessDrivers: template.drivers,
    relatedFutureIds,
    relatedDecisionIds,
    relatedRiskIds: twinRisks,
    relatedOpportunityIds: twinOpps,
    relatedBusinessEventIds: relatedEvents,
    relatedOutcomeIds,
    dependencies,
    successMeasures: template.successMeasureLabels.map((label, index) => ({
      id: `${template.id}-sm-${index}`,
      label,
      target: "Inside executive tolerance",
      linkedOutcomeIds: relatedOutcomeIds.slice(0, 1),
    })),
    leadingIndicators: template.drivers.slice(0, 2).map((driver, index) => ({
      id: `${template.id}-li-${index}`,
      label: `${driver.replace(/_/g, " ")} leading indicator`,
      monitor: `Movement in ${driver.replace(/_/g, " ")} linked to ${template.title}`,
      threshold: "Adverse move for two refresh cycles",
      relatedDriverIds: [driver],
    })),
    progress: tracking.progress,
    progressPercent: tracking.progressPercent,
    confidence: tracking.confidence,
    evidence,
    reviewCadence: reviewCadenceFor(template.timeHorizon),
    completionCriteria: template.completionCriteria,
    operationalSystems: toExecutionSystemRefs(template.preferredExecution),
    governance: buildInitiativeGovernance({
      title: template.title,
      timeHorizon: template.timeHorizon,
      relatedDecisionIds,
    }),
    coordination,
    attentionRequired: tracking.attentionRequired,
    strategicMomentum: tracking.strategicMomentum,
    explanation: boundary,
  };
}

function matchDecisions(
  template: InitiativeTemplate,
  snapshot: IntelligentExecutiveSnapshot,
): string[] {
  return snapshot.decisions
    .filter((d) => d.priority !== "resolved")
    .filter((d) =>
      template.evidenceHints.some((h) =>
        h.test(`${d.question} ${d.businessNarrative}`),
      ),
    )
    .map((d) => d.id)
    .slice(0, 3);
}

function matchOutcomes(
  template: InitiativeTemplate,
  snapshot: IntelligentExecutiveSnapshot,
): string[] {
  const matched = snapshot.outcomes
    .filter((o) =>
      template.evidenceHints.some((h) =>
        h.test(`${o.name} ${o.shortName} ${o.status}`),
      ),
    )
    .map((o) => o.id);
  if (matched.length > 0) return matched.slice(0, 3);
  return snapshot.outcomes
    .filter((o) => o.status === "at_risk" || o.status === "off_track")
    .map((o) => o.id)
    .slice(0, 2);
}

function collectEvidence(
  template: InitiativeTemplate,
  snapshot: IntelligentExecutiveSnapshot,
  decisionIds: string[],
  outcomeIds: string[],
): string[] {
  const evidence: string[] = [
    `Pulse: ${snapshot.pulse.state} — ${snapshot.pulse.narrative}`,
    `Capacity: ${snapshot.capacity.capacity}; attention ${snapshot.capacity.attentionBudget}`,
  ];
  for (const outcome of snapshot.outcomes.filter((o) =>
    outcomeIds.includes(o.id),
  )) {
    evidence.push(
      `Outcome ${outcome.shortName}: ${outcome.status}, momentum ${outcome.momentum}`,
    );
  }
  for (const decision of snapshot.decisions.filter((d) =>
    decisionIds.includes(d.id),
  )) {
    evidence.push(`Decision: ${decision.question}`);
  }
  const future = snapshot.futuresBrief?.futures.find((f) =>
    f.drivers.some((d) => template.drivers.includes(d)),
  );
  if (future) {
    evidence.push(`Related future: ${future.title} (${future.caseKind})`);
  }
  return evidence.slice(0, 8);
}
