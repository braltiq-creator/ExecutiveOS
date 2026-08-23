import type { IntelligentExecutiveSnapshot } from "@/intelligence/executive-intelligence/types";
import type { DecisionBrief } from "@/intelligence/executive-judgement/types";
import type { ExecutiveContextBrief } from "@/providers/microsoft365/executive-context/types";
import type { CommercialContextBrief } from "@/providers/salesforce/executive-context/types";
import type { OperationalContextBrief } from "@/providers/simpro/executive-context/types";

/**
 * Shared read-only context — agents reason only from these artefacts.
 */
export type AgentContext = {
  snapshot: IntelligentExecutiveSnapshot;
  briefs: DecisionBrief[];
  asOf: string;
  /** Portable executive context from productivity providers — never vendor objects */
  executiveContext?: ExecutiveContextBrief;
  /** Portable commercial context from CRM providers — never vendor objects */
  commercialContext?: CommercialContextBrief;
  /** Portable operational context from field-service providers — never vendor objects */
  operationalContext?: OperationalContextBrief;
};

export function createAgentContext(
  snapshot: IntelligentExecutiveSnapshot,
): AgentContext {
  return {
    snapshot,
    briefs: snapshot.judgementBriefs ?? [],
    asOf: snapshot.asOf,
    executiveContext: snapshot.executiveContextBrief,
    commercialContext: snapshot.commercialContextBrief,
    operationalContext: snapshot.operationalContextBrief,
  };
}

export function openDecisions(ctx: AgentContext) {
  return ctx.snapshot.decisions.filter((d) => d.priority !== "resolved");
}

export function topBrief(ctx: AgentContext): DecisionBrief | undefined {
  return ctx.briefs[0];
}

export function evidenceFromSnapshot(ctx: AgentContext): string[] {
  const items: string[] = [
    `Pulse: ${ctx.snapshot.pulse.label} — ${ctx.snapshot.pulse.narrative}`,
    `Capacity: ${ctx.snapshot.capacity.capacity} / attention ${ctx.snapshot.capacity.attentionBudget}`,
  ];
  for (const outcome of ctx.snapshot.outcomes.slice(0, 4)) {
    items.push(
      `Outcome ${outcome.shortName}: ${outcome.status}, health ${outcome.healthScore}`,
    );
  }
  for (const decision of openDecisions(ctx).slice(0, 3)) {
    items.push(`Decision: ${decision.question}`);
  }
  for (const brief of ctx.briefs.slice(0, 2)) {
    items.push(`Judgement brief: ${brief.question}`);
    items.push(...brief.evidence.slice(0, 2));
  }
  if (ctx.executiveContext) {
    items.push(`Executive context: ${ctx.executiveContext.framing}`);
    items.push(
      `Board readiness: ${ctx.executiveContext.boardReadiness.label} — ${ctx.executiveContext.boardReadiness.detail}`,
    );
    for (const commitment of ctx.executiveContext.commitments.slice(0, 2)) {
      items.push(
        `Commitment: ${commitment.title} (${commitment.kind}, prep ${commitment.preparationRisk})`,
      );
    }
  }
  if (ctx.commercialContext) {
    items.push(`Commercial context: ${ctx.commercialContext.framing}`);
    items.push(
      `Pipeline: ${ctx.commercialContext.pipelineHealth.detail}`,
    );
    items.push(
      `Forecast confidence: ${ctx.commercialContext.revenueForecast.accuracyPct}% — ${ctx.commercialContext.revenueForecast.detail}`,
    );
    items.push(
      `Customer health: ${ctx.commercialContext.customerHealth.label}`,
    );
  }
  if (ctx.operationalContext) {
    items.push(`Operational context: ${ctx.operationalContext.framing}`);
    items.push(
      `Operational health: ${ctx.operationalContext.operationalHealth.label}`,
    );
    items.push(`Capacity: ${ctx.operationalContext.capacity.detail}`);
    items.push(
      `Cash collection: ${ctx.operationalContext.cashCollection.detail}`,
    );
    if (ctx.operationalContext.jobsAtRisk[0]) {
      items.push(
        `Job at risk: ${ctx.operationalContext.jobsAtRisk[0].title}`,
      );
    }
  }
  return items;
}

export function operationalDeliveryPressure(ctx: AgentContext): boolean {
  const brief = ctx.operationalContext;
  if (!brief) return false;
  return (
    brief.jobsAtRisk.length > 0 ||
    brief.serviceDelivery.criticalJobs > 0 ||
    brief.operationalHealth.level === "strained" ||
    brief.operationalHealth.level === "critical"
  );
}

export function operationalCashPressure(ctx: AgentContext): boolean {
  const brief = ctx.operationalContext;
  if (!brief) return false;
  return (
    brief.cashCollection.overdueInvoices > 0 ||
    brief.cashCollection.riskLevel === "strained" ||
    brief.cashCollection.riskLevel === "critical"
  );
}

export function operationalSafetyPressure(ctx: AgentContext): boolean {
  const brief = ctx.operationalContext;
  if (!brief) return false;
  return brief.safetySignals.length > 0;
}

export function commercialContextSignals(ctx: AgentContext) {
  return ctx.commercialContext?.signals ?? [];
}

export function commercialForecastSoft(ctx: AgentContext): boolean {
  const brief = ctx.commercialContext;
  if (!brief) return false;
  return (
    brief.revenueForecast.accuracyPct < 75 ||
    brief.revenueForecast.level === "strained" ||
    brief.revenueForecast.level === "critical"
  );
}

export function commercialGrowthPressure(ctx: AgentContext): boolean {
  const brief = ctx.commercialContext;
  if (!brief) return false;
  return (
    brief.largeDealsAtRisk.length > 0 ||
    brief.commercialHealth.level === "strained" ||
    brief.commercialHealth.level === "critical" ||
    brief.commercialMomentum.level === "strained"
  );
}

export function executiveContextSignals(ctx: AgentContext) {
  return ctx.executiveContext?.signals ?? [];
}

export function boardPreparationRisk(ctx: AgentContext): boolean {
  const brief = ctx.executiveContext;
  if (!brief) return false;
  return (
    brief.boardReadiness.level === "not_ready" ||
    brief.commitments.some(
      (c) => c.kind === "governance_event" && c.preparationRisk === "high",
    )
  );
}
