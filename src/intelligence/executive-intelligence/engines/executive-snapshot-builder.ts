import { allocateAttention } from "@/intelligence/executive-intelligence/engines/attention-engine";
import { deriveBusinessNarrative } from "@/intelligence/executive-intelligence/engines/business-narrative-engine";
import { deriveBusinessPulse } from "@/intelligence/executive-intelligence/engines/business-pulse-engine";
import { deriveDecisionIntelligence } from "@/intelligence/executive-intelligence/engines/decision-intelligence-engine";
import { deriveExecutiveCapacity } from "@/intelligence/executive-intelligence/engines/executive-capacity-engine";
import { deriveOutcomeIntelligence } from "@/intelligence/executive-intelligence/engines/outcome-intelligence-engine";
import { deriveRecommendations } from "@/intelligence/executive-intelligence/engines/recommendation-engine";
import type { EnterpriseDataProvider } from "@/intelligence/executive-intelligence/providers/enterprise-data-provider";
import { clamp } from "@/intelligence/executive-intelligence/lib/helpers";
import type {
  IntelligentCompass,
  IntelligentExecutiveSnapshot,
  IntelligentMetric,
  ReasoningGraph,
} from "@/intelligence/executive-intelligence/types";
import type { KnowledgeGraph } from "@/knowledge-graph";
import { getKnowledgeGraph } from "@/knowledge-graph";
import type { ExecutiveIntentProfile } from "@/intelligence/executive-intent";
import {
  applyExecutiveIntent,
  getExecutiveIntent,
} from "@/intelligence/executive-intent";
import type { ExecutiveMemoryStore } from "@/intelligence/executive-memory";
import {
  applyExecutiveMemory,
  getExecutiveMemoryStore,
} from "@/intelligence/executive-memory";
import { applyExecutiveJudgement } from "@/intelligence/executive-judgement";
import type { EnterpriseDigitalTwin } from "@/digital-twin";
import { applyFieldServicesIndustry } from "@/industry/field-services/simpro/apply-industry";
import { conveneExecutiveCouncil } from "@/agents";
import { applyExecutiveFutures } from "@/futures";
import { applyExecutiveAgenda } from "@/agenda";
import { applyMicrosoft365ExecutiveContext } from "@/providers/microsoft365";
import { applySimproExecutiveContext } from "@/providers/simpro";
import { applySalesforceExecutiveContext } from "@/providers/salesforce";

export type SnapshotBuilderOptions = {
  /** Activate Industry Intelligence Pack language / health model */
  industryPack?: "field-services-simpro";
  /**
   * Real customer snapshots must not inherit demo twin / provider / agenda overlays.
   * When true: skip M365/Simpro/Salesforce demo context, twin futures/agenda, and industry pack.
   */
  isolateFromDemoContext?: boolean;
};

/**
 * Executive Snapshot Builder — single object for Today.
 * Orchestrates signals + graph + intent + memory + judgement (+ optional industry pack).
 * UI never derives.
 */
export function buildIntelligentExecutiveSnapshot(
  provider: EnterpriseDataProvider,
  graph: KnowledgeGraph = getKnowledgeGraph(),
  intent: ExecutiveIntentProfile = getExecutiveIntent(),
  memory: ExecutiveMemoryStore = getExecutiveMemoryStore(),
  twin?: EnterpriseDigitalTwin,
  options?: SnapshotBuilderOptions,
): IntelligentExecutiveSnapshot {
  const signals = provider.getSignals();
  const pulse = deriveBusinessPulse(signals);
  const capacity = deriveExecutiveCapacity(signals);
  const baseOutcomes = deriveOutcomeIntelligence(signals);
  const baseDecisions = deriveDecisionIntelligence(signals);
  const baseRecommendations = deriveRecommendations({
    signals,
    decisions: baseDecisions,
    outcomes: baseOutcomes,
    graph,
  });
  const baseNarrative = deriveBusinessNarrative({
    signals,
    pulse,
    capacity,
    outcomes: baseOutcomes,
    decisions: baseDecisions,
  });

  const intentApplied = applyExecutiveIntent({
    intent,
    decisions: baseDecisions,
    outcomes: baseOutcomes,
    recommendations: baseRecommendations,
    narrative: baseNarrative,
  });

  const memoryApplied = applyExecutiveMemory({
    store: memory,
    intent,
    narrative: intentApplied.narrative,
    recommendations: intentApplied.recommendations,
    asOf: signals.asOf,
  });

  const judgementApplied = applyExecutiveJudgement({
    intent,
    decisions: intentApplied.decisions,
    outcomes: intentApplied.outcomes,
    recommendations: memoryApplied.recommendations,
    narrative: memoryApplied.narrative,
    asOf: signals.asOf,
    graph,
    memory,
    twin,
  });

  const decisions = intentApplied.decisions;
  const outcomes = intentApplied.outcomes;
  const recommendations = judgementApplied.recommendations;
  const narrative = judgementApplied.narrative;

  const attention = allocateAttention({
    capacity,
    decisions,
    outcomes,
    recommendations,
  });
  const compass = deriveCompass(signals, capacity, decisions, outcomes);
  const reviewMinutes = decisions
    .filter((d) => d.priority !== "resolved")
    .slice(0, 3)
    .reduce((sum, d) => sum + d.estimatedEffortMinutes, 0);
  const metrics = buildMetrics({
    decisions,
    outcomes,
    capacity,
    reviewMinutes,
    signalsMeetingCount: signals.outcomes.reduce(
      (count, outcome) => count + outcome.meetings.length,
      0,
    ),
    waitingCount: signals.outcomes.reduce(
      (count, outcome) =>
        count +
        outcome.pendingActions.filter(
          (action) =>
            action.status === "pending" || action.status === "blocked",
        ).length,
      0,
    ),
  });

  const reasoningIndex: Record<string, ReasoningGraph> = {
    pulse: pulse.reasoningGraph,
  };
  for (const outcome of outcomes) {
    reasoningIndex[outcome.id] = outcome.reasoningGraph;
  }
  for (const decision of decisions) {
    reasoningIndex[decision.id] = decision.reasoningGraph;
  }
  for (const recommendation of recommendations) {
    reasoningIndex[recommendation.id] = recommendation.reasoningGraph;
  }

  const baseSnapshot: IntelligentExecutiveSnapshot = {
    asOf: signals.asOf,
    greeting: narrative.greeting,
    pulse,
    capacity,
    compass,
    outcomes,
    decisions,
    recommendations,
    narrative,
    attention,
    metrics,
    reviewMinutes,
    reasoningIndex,
    judgementBriefs: judgementApplied.briefs,
  };

  const isolate = options?.isolateFromDemoContext === true;

  const withIndustry =
    !isolate && options?.industryPack === "field-services-simpro"
      ? applyFieldServicesIndustry({
          snapshot: baseSnapshot,
          twin,
          benchmarkId: "bench-medium",
        }).snapshot
      : baseSnapshot;

  if (isolate) {
    const withCouncil: IntelligentExecutiveSnapshot = {
      ...withIndustry,
      councilBrief: conveneExecutiveCouncil(withIndustry),
    };
    return withCouncil;
  }

  // Collaboration (M365) → operations (Simpro) → commercial (Salesforce) before Council.
  // Each prefers live connection briefs when the tenant is connected.
  const withCollabContext = applyMicrosoft365ExecutiveContext({
    snapshot: withIndustry,
    twin,
    graph,
    options: {
      executiveosTenantId: "tenant-northline",
      tenantId: "northline-tenant",
      asOf: withIndustry.asOf,
    },
  }).snapshot;

  const withOpsContext = applySimproExecutiveContext({
    snapshot: withCollabContext,
    twin,
    graph,
    options: {
      executiveosTenantId: "tenant-northline",
      companyId: "northline-simpro",
      asOf: withCollabContext.asOf,
    },
  }).snapshot;

  const withContext = applySalesforceExecutiveContext({
    snapshot: withOpsContext,
    twin,
    graph,
    options: {
      executiveosTenantId: "tenant-northline",
      orgId: "northline-sf",
      asOf: withOpsContext.asOf,
    },
  }).snapshot;

  const withCouncil: IntelligentExecutiveSnapshot = {
    ...withContext,
    councilBrief: conveneExecutiveCouncil(withContext),
  };

  const withFutures = applyExecutiveFutures({
    snapshot: withCouncil,
    twin,
  }).snapshot;

  return applyExecutiveAgenda({
    snapshot: withFutures,
    twin,
  }).snapshot;
}

function deriveCompass(
  signals: ReturnType<EnterpriseDataProvider["getSignals"]>,
  capacity: IntelligentExecutiveSnapshot["capacity"],
  decisions: IntelligentExecutiveSnapshot["decisions"],
  outcomes: IntelligentExecutiveSnapshot["outcomes"],
): IntelligentCompass {
  const urgent = decisions.filter((d) => d.priority === "immediate").length;
  const open = decisions.filter((d) => d.priority !== "resolved").length;
  const declining = outcomes.filter((o) => o.momentum === "drifting").length;
  const improving = outcomes.filter((o) => o.momentum === "building").length;
  const atRisk = outcomes.filter(
    (o) => o.status === "at_risk" || o.status === "off_track",
  ).length;
  const meetings = capacity.meetingLoad;
  const opportunities = outcomes.filter(
    (o) =>
      o.status === "at_risk" ||
      o.id === "outcome-board" ||
      o.id === "outcome-efficiency",
  ).length;

  const focus = clampStrength(100 - urgent * 28 - open * 4);
  const risk = clampStrength(atRisk * 22 + declining * 14 + urgent * 18);
  const opportunity = clampStrength(
    opportunities * 24 + improving * 12 + (signals.overallScore < 70 ? 10 : 0),
  );
  const capacityStrength = clampStrength(
    100 - meetings * 14 - capacity.decisionLoad * 6 - (open > 3 ? 16 : 0),
  );

  return {
    dimensions: [
      {
        id: "focus",
        label: "Focus",
        strength: focus,
        direction: directionFrom(focus - 55),
        reasoning: `Focus falls as urgent Decisions (${urgent}) and open backlog (${open}) compete.`,
      },
      {
        id: "risk",
        label: "Risk",
        strength: risk,
        direction: directionFrom(risk - 40),
        reasoning: `Risk rises with ${atRisk} stressed Outcomes and ${declining} drifting trajectories.`,
      },
      {
        id: "opportunity",
        label: "Opportunity",
        strength: opportunity,
        direction: directionFrom(opportunity - 45),
        reasoning: `Opportunity tracks recoverable Outcomes and building momentum (${improving}).`,
      },
      {
        id: "capacity",
        label: "Capacity",
        strength: capacityStrength,
        direction: directionFrom(capacityStrength - 50),
        reasoning: capacity.reasoning,
      },
    ],
  };
}

function buildMetrics(input: {
  decisions: IntelligentExecutiveSnapshot["decisions"];
  outcomes: IntelligentExecutiveSnapshot["outcomes"];
  capacity: IntelligentExecutiveSnapshot["capacity"];
  reviewMinutes: number;
  signalsMeetingCount: number;
  waitingCount: number;
}): IntelligentMetric[] {
  const urgent = input.decisions.filter((d) => d.priority === "immediate").length;
  const opportunities = Math.min(
    3,
    input.outcomes.filter(
      (o) =>
        o.status === "at_risk" ||
        o.id === "outcome-board" ||
        o.id === "outcome-efficiency",
    ).length,
  );
  const criticalRisks = input.outcomes.reduce((count, outcome) => {
    const signalRisks = outcome.supportingEvidence.filter(
      (e) => e.kind === "signal" || e.kind === "risk",
    ).length;
    return count + signalRisks + (outcome.status === "off_track" ? 1 : 0);
  }, 0);
  const waiting = input.waitingCount;
  const meetings = input.signalsMeetingCount;

  const metrics: IntelligentMetric[] = [
    {
      id: "urgent_decisions",
      label: "Urgent Decisions",
      value: String(urgent),
      numericValue: urgent,
      href: "/decisions",
      emphasis: false,
      reasoning: `${urgent} Decisions ranked immediate by importance.`,
    },
    {
      id: "strategic_opportunities",
      label: "Opportunities",
      value: String(opportunities),
      numericValue: opportunities,
      href: "/insights",
      emphasis: false,
      reasoning: "Outcomes with recoverable strategic upside.",
    },
    {
      id: "critical_risks",
      label: "Critical Risks",
      value: String(criticalRisks),
      numericValue: criticalRisks,
      href: "/outcomes",
      emphasis: false,
      reasoning: "Blockers, critical signals, and off-track Outcomes.",
    },
    {
      id: "waiting_on_others",
      label: "Waiting",
      value: String(waiting),
      numericValue: waiting,
      href: "/actions",
      emphasis: false,
      reasoning: "Work awaiting others before the executive can close the loop.",
    },
    {
      id: "executive_meetings",
      label: "Meetings",
      value: String(meetings),
      numericValue: meetings,
      href: "/meetings",
      emphasis: false,
      reasoning: "Calendar load contributing to capacity pressure.",
    },
    {
      id: "review_time",
      label: "Review",
      value: `${input.reviewMinutes} min`,
      numericValue: input.reviewMinutes,
      href: "/decisions",
      emphasis: false,
      reasoning: "Estimated minutes to clear top judgements.",
    },
  ];

  const emphasisId =
    urgent > 0
      ? "urgent_decisions"
      : criticalRisks > 0
        ? "critical_risks"
        : "review_time";

  return metrics.map((metric) => ({
    ...metric,
    emphasis: metric.id === emphasisId,
  }));
}

function clampStrength(value: number): number {
  return clamp(Math.round(value), 8, 100);
}

function directionFrom(delta: number): "rising" | "falling" | "steady" {
  if (delta > 2) return "rising";
  if (delta < -2) return "falling";
  return "steady";
}
