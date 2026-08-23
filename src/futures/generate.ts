import type { IntelligentExecutiveSnapshot } from "@/intelligence/executive-intelligence/types";
import type { EnterpriseDigitalTwin } from "@/digital-twin";
import type {
  BusinessDriverId,
  Future,
  FutureCaseKind,
  FuturesBrief,
  Intervention,
  PotentialImpact,
} from "@/futures/models/types";
import { FUTURE_CASE_TEMPLATES } from "@/futures/scenarios/cases";
import { selectPrimaryHorizon, getTimeHorizon } from "@/futures/timelines";
import { buildLeadingIndicators } from "@/futures/signals";
import { buildFutureExplanation } from "@/futures/explainability";
import { reviewFuturesWithCouncil } from "@/futures/council-review";
import { selectSpotlights } from "@/futures/spotlights";

type PressureContext = {
  asOf: string;
  urgentDecisions: IntelligentExecutiveSnapshot["decisions"];
  openDecisions: IntelligentExecutiveSnapshot["decisions"];
  decliningOutcomes: IntelligentExecutiveSnapshot["outcomes"];
  atRiskOutcomes: IntelligentExecutiveSnapshot["outcomes"];
  improvingOutcomes: IntelligentExecutiveSnapshot["outcomes"];
  capacityConstrained: boolean;
  attentionContested: boolean;
  pulseState: IntelligentExecutiveSnapshot["pulse"]["state"];
  twinRiskLabels: string[];
  twinEventCount: number;
  activeDrivers: BusinessDriverId[];
  primaryHorizon: ReturnType<typeof selectPrimaryHorizon>;
};

/**
 * Project possible futures from current Digital Twin + intelligent snapshot.
 * Deterministic scenario reasoning — not ML forecasting.
 */
export function projectPossibleFutures(input: {
  snapshot: IntelligentExecutiveSnapshot;
  twin?: EnterpriseDigitalTwin;
}): FuturesBrief {
  const ctx = buildPressureContext(input.snapshot, input.twin);
  const futures = FUTURE_CASE_TEMPLATES.map((template) =>
    buildFuture(template.kind, ctx, input.snapshot),
  );

  const normalised = normaliseProbabilities(futures);
  const spotlights = selectSpotlights(normalised);
  const councilReviews = reviewFuturesWithCouncil({
    snapshot: input.snapshot,
    futures: normalised,
  });

  const mostLikely = normalised.find((f) => f.caseKind === "most_likely");
  const framing = [
    `Possible futures over the ${getTimeHorizon(ctx.primaryHorizon).label.toLowerCase()} horizon,`,
    `grounded in ${ctx.atRiskOutcomes.length} at-risk outcome(s)`,
    `and ${ctx.urgentDecisions.length} immediate decision(s).`,
    mostLikely
      ? `Most likely: ${mostLikely.title}.`
      : "Most likely path still forming.",
  ].join(" ");

  return {
    asOf: ctx.asOf,
    framing,
    futures: normalised,
    spotlights,
    councilReviews,
    closingNote:
      "These futures explain plausible paths — they do not decide. Bind only where evidence and judgement meet.",
  };
}

function buildPressureContext(
  snapshot: IntelligentExecutiveSnapshot,
  twin?: EnterpriseDigitalTwin,
): PressureContext {
  const openDecisions = snapshot.decisions.filter(
    (d) => d.priority !== "resolved",
  );
  const urgentDecisions = openDecisions.filter(
    (d) => d.priority === "immediate",
  );
  const decliningOutcomes = snapshot.outcomes.filter(
    (o) => o.momentum === "drifting" || o.trajectory === "declining",
  );
  const atRiskOutcomes = snapshot.outcomes.filter(
    (o) => o.status === "at_risk" || o.status === "off_track",
  );
  const improvingOutcomes = snapshot.outcomes.filter(
    (o) => o.momentum === "building" || o.trajectory === "improving",
  );

  const twinRiskLabels =
    twin
      ?.query({ type: "Risk", minImportance: 40, limit: 6 })
      .map((entity) => entity.label) ?? [];

  const activeDrivers = deriveActiveDrivers({
    urgentDecisions,
    atRiskOutcomes,
    capacityConstrained: snapshot.capacity.capacity !== "available",
    attentionContested: snapshot.capacity.attentionBudget === "contested",
    twinRiskLabels,
    strategicPressure: snapshot.capacity.strategicInitiatives > 0,
  });

  return {
    asOf: snapshot.asOf,
    urgentDecisions,
    openDecisions,
    decliningOutcomes,
    atRiskOutcomes,
    improvingOutcomes,
    capacityConstrained: snapshot.capacity.capacity !== "available",
    attentionContested: snapshot.capacity.attentionBudget === "contested",
    pulseState: snapshot.pulse.state,
    twinRiskLabels,
    twinEventCount: twin?.getState().eventCount ?? 0,
    activeDrivers,
    primaryHorizon: selectPrimaryHorizon({
      urgentDecisionCount: urgentDecisions.length,
      decliningOutcomeCount: decliningOutcomes.length,
      capacityConstrained: snapshot.capacity.capacity !== "available",
      strategicInitiativePressure: snapshot.capacity.strategicInitiatives > 0,
    }),
  };
}

function deriveActiveDrivers(input: {
  urgentDecisions: IntelligentExecutiveSnapshot["decisions"];
  atRiskOutcomes: IntelligentExecutiveSnapshot["outcomes"];
  capacityConstrained: boolean;
  attentionContested: boolean;
  twinRiskLabels: string[];
  strategicPressure: boolean;
}): BusinessDriverId[] {
  const drivers = new Set<BusinessDriverId>();

  if (input.capacityConstrained || input.attentionContested) {
    drivers.add("capacity");
  }
  if (input.atRiskOutcomes.length > 0) {
    drivers.add("revenue");
    drivers.add("customer_demand");
  }
  if (input.urgentDecisions.some((d) => /cash|budget|cost|runway/i.test(d.question))) {
    drivers.add("cash_flow");
  }
  if (input.urgentDecisions.some((d) => /customer|churn|renew|escalat/i.test(d.question))) {
    drivers.add("customer_demand");
  }
  if (input.twinRiskLabels.some((l) => /labour|technician|staff|people/i.test(l))) {
    drivers.add("labour_availability");
  }
  if (input.twinRiskLabels.some((l) => /asset|fail|outage|reliability/i.test(l))) {
    drivers.add("asset_reliability");
  }
  if (input.twinRiskLabels.some((l) => /regulat|compliance|audit|licence/i.test(l))) {
    drivers.add("regulatory");
  }
  if (input.strategicPressure) {
    drivers.add("strategic_initiatives");
  }

  drivers.add("market_conditions");
  if (drivers.size < 3) {
    drivers.add("cash_flow");
    drivers.add("strategic_initiatives");
  }

  return [...drivers].slice(0, 6);
}

function buildFuture(
  caseKind: FutureCaseKind,
  ctx: PressureContext,
  snapshot: IntelligentExecutiveSnapshot,
): Future {
  const template = FUTURE_CASE_TEMPLATES.find((t) => t.kind === caseKind)!;
  const primaryOutcome =
    ctx.atRiskOutcomes[0] ??
    ctx.decliningOutcomes[0] ??
    snapshot.outcomes[0];
  const primaryDecision = ctx.urgentDecisions[0] ?? ctx.openDecisions[0];

  const supporting = collectSupportingEvidence(caseKind, ctx, snapshot);
  const weakening = collectWeakeningEvidence(caseKind, ctx, snapshot);
  const assumptions = collectAssumptions(caseKind, ctx, primaryDecision);
  const title = titleFor(caseKind, primaryOutcome?.shortName ?? "the enterprise");
  const description = descriptionFor(caseKind, ctx, primaryOutcome, primaryDecision);

  const baseProbability = clamp(
    40 + template.probabilityBias + pressureBias(ctx, caseKind),
    5,
    85,
  );
  const confidence = clamp(
    62 +
      template.confidenceBias +
      Math.min(10, supporting.length * 2) -
      Math.min(12, weakening.length * 3) +
      (ctx.twinEventCount > 0 ? 4 : -6),
    35,
    88,
  );

  const interventions = buildInterventions(caseKind, ctx, primaryDecision, primaryOutcome);
  const influenceLevers = interventions
    .filter((i) => i.kind === "high_impact" || i.kind === "urgent")
    .map((i) => i.title);

  const id = `future-${caseKind}-${ctx.primaryHorizon}`;

  return {
    id,
    title,
    description,
    caseKind,
    probability: baseProbability,
    confidence,
    timeHorizon: ctx.primaryHorizon,
    drivers: ctx.activeDrivers,
    supportingEvidence: supporting,
    keyAssumptions: assumptions,
    dependencies: collectDependencies(ctx, primaryDecision),
    potentialImpacts: collectImpacts(caseKind, ctx),
    recommendedInterventions: interventions,
    leadingIndicators: buildLeadingIndicators({
      futureId: id,
      caseKind,
      drivers: ctx.activeDrivers,
    }),
    alternativeOutcomes: alternativesFor(caseKind),
    explanation: buildFutureExplanation({
      caseKind,
      title,
      assumptions,
      supporting,
      weakening,
      influenceLevers:
        influenceLevers.length > 0
          ? influenceLevers
          : ["Bind the top open Decision", "Protect Focus time this week"],
    }),
  };
}

function titleFor(caseKind: FutureCaseKind, subject: string): string {
  switch (caseKind) {
    case "best_case":
      return `${subject} recovers and compounds`;
    case "expected_case":
      return `${subject} holds to plan with managed pressure`;
    case "worst_case":
      return `${subject} deteriorates under compounding pressure`;
    case "most_likely":
      return `${subject} follows the current trajectory`;
    case "black_swan":
      return `A shock event forces a reset around ${subject}`;
  }
}

function descriptionFor(
  caseKind: FutureCaseKind,
  ctx: PressureContext,
  outcome: IntelligentExecutiveSnapshot["outcomes"][number] | undefined,
  decision: IntelligentExecutiveSnapshot["decisions"][number] | undefined,
): string {
  const outcomeBit = outcome
    ? `${outcome.shortName} is ${outcome.status.replace("_", " ")}`
    : "Material outcomes are under watch";
  const decisionBit = decision
    ? `with "${decision.question}" still unbound`
    : "with the decision queue relatively clear";
  const capacityBit = ctx.capacityConstrained
    ? "Capacity is constrained."
    : "Capacity has headroom.";

  switch (caseKind) {
    case "best_case":
      return `${outcomeBit}, ${decisionBit}. Interventions land early; ${capacityBit} Upside materialises within the horizon.`;
    case "expected_case":
      return `${outcomeBit}, ${decisionBit}. The operating plan largely holds; pressure is managed rather than eliminated. ${capacityBit}`;
    case "worst_case":
      return `${outcomeBit}, ${decisionBit}. Pressure compounds across ${ctx.activeDrivers.slice(0, 2).join(" and ")}; recovery slips. ${capacityBit}`;
    case "most_likely":
      return `${outcomeBit}, ${decisionBit}. Absent a decisive bind, the organisation continues on today's evidence trail. ${capacityBit}`;
    case "black_swan":
      return `A low-probability shock (reliability, regulatory, or demand) intersects current pressure. ${outcomeBit}. Plans re-sequence under crisis attention.`;
  }
}

function collectSupportingEvidence(
  caseKind: FutureCaseKind,
  ctx: PressureContext,
  snapshot: IntelligentExecutiveSnapshot,
): string[] {
  const evidence: string[] = [];
  evidence.push(`Business pulse: ${snapshot.pulse.state} — ${snapshot.pulse.reasoning}`);
  evidence.push(
    `Capacity: ${snapshot.capacity.capacity}; attention ${snapshot.capacity.attentionBudget}.`,
  );

  for (const outcome of ctx.atRiskOutcomes.slice(0, 2)) {
    evidence.push(
      `Outcome ${outcome.shortName}: health ${outcome.healthScore}, ${outcome.momentum}, ${outcome.lastSignificantChange}`,
    );
  }
  for (const decision of ctx.urgentDecisions.slice(0, 2)) {
    evidence.push(
      `Immediate decision: ${decision.question} (${decision.businessNarrative})`,
    );
  }
  for (const label of ctx.twinRiskLabels.slice(0, 2)) {
    evidence.push(`Twin risk signal: ${label}`);
  }

  if (caseKind === "best_case" || caseKind === "expected_case") {
    for (const outcome of ctx.improvingOutcomes.slice(0, 2)) {
      evidence.push(
        `Improving outcome: ${outcome.shortName} (${outcome.momentum})`,
      );
    }
  }

  return evidence.slice(0, 8);
}

function collectWeakeningEvidence(
  caseKind: FutureCaseKind,
  ctx: PressureContext,
  snapshot: IntelligentExecutiveSnapshot,
): string[] {
  const weakening: string[] = [];

  if (caseKind === "best_case") {
    for (const outcome of ctx.atRiskOutcomes.slice(0, 2)) {
      weakening.push(`${outcome.shortName} remains ${outcome.status}`);
    }
    if (ctx.capacityConstrained) {
      weakening.push("Constrained capacity reduces likelihood of clean recovery.");
    }
  }

  if (caseKind === "worst_case" || caseKind === "black_swan") {
    for (const outcome of ctx.improvingOutcomes.slice(0, 2)) {
      weakening.push(`${outcome.shortName} is still ${outcome.momentum}`);
    }
    if (!ctx.capacityConstrained) {
      weakening.push("Available capacity can still absorb shocks.");
    }
  }

  if (caseKind === "most_likely" || caseKind === "expected_case") {
    if (ctx.urgentDecisions.length > 0) {
      weakening.push(
        "An unbound immediate Decision can bend the trajectory either way.",
      );
    }
    if (snapshot.pulse.state === "critical") {
      weakening.push("Critical pulse elevates downside relative to base case.");
    }
  }

  if (weakening.length === 0) {
    weakening.push("Evidence remains incomplete — confidence is intentionally capped.");
  }

  return weakening.slice(0, 5);
}

function collectAssumptions(
  caseKind: FutureCaseKind,
  ctx: PressureContext,
  decision: IntelligentExecutiveSnapshot["decisions"][number] | undefined,
): string[] {
  const assumptions: string[] = [];

  if (decision) {
    assumptions.push(
      caseKind === "best_case"
        ? `The bind on "${decision.question}" lands within the horizon.`
        : caseKind === "worst_case"
          ? `The bind on "${decision.question}" slips or lands poorly.`
          : `"${decision.question}" remains the pivotal unbound Decision.`,
    );
  } else {
    assumptions.push("No single Decision dominates — portfolio health drives the path.");
  }

  assumptions.push(
    ctx.capacityConstrained
      ? "Leadership capacity stays constrained unless meetings are cut."
      : "Leadership capacity remains sufficient for the planned sequence.",
  );

  assumptions.push(
    caseKind === "black_swan"
      ? "A shock arrives that current leading indicators only partially cover."
      : "No black-swan shock arrives inside the horizon.",
  );

  assumptions.push(
    `Primary drivers (${ctx.activeDrivers.slice(0, 3).join(", ")}) continue to dominate.`,
  );

  return assumptions;
}

function collectDependencies(
  ctx: PressureContext,
  decision: IntelligentExecutiveSnapshot["decisions"][number] | undefined,
): string[] {
  const deps: string[] = [];
  if (decision) {
    deps.push(`Decision: ${decision.id}`);
    for (const outcomeId of decision.outcomeIds.slice(0, 2)) {
      deps.push(`Outcome: ${outcomeId}`);
    }
  }
  for (const outcome of ctx.atRiskOutcomes.slice(0, 2)) {
    deps.push(`Outcome: ${outcome.id}`);
  }
  return [...new Set(deps)].slice(0, 6);
}

function collectImpacts(
  caseKind: FutureCaseKind,
  ctx: PressureContext,
): PotentialImpact[] {
  const direction =
    caseKind === "best_case"
      ? "positive"
      : caseKind === "worst_case" || caseKind === "black_swan"
        ? "negative"
        : "mixed";

  return [
    {
      area: "Outcome health",
      direction,
      detail:
        caseKind === "best_case"
          ? "At-risk outcomes stabilise or recover."
          : caseKind === "worst_case"
            ? "At-risk outcomes decline further."
            : "Outcome health tracks today's trajectory with limited swing.",
      driverIds: ctx.activeDrivers.filter((d) =>
        ["revenue", "customer_demand", "strategic_initiatives"].includes(d),
      ),
    },
    {
      area: "Cash & capacity",
      direction:
        caseKind === "best_case"
          ? "positive"
          : caseKind === "black_swan"
            ? "negative"
            : ctx.capacityConstrained
              ? "negative"
              : "mixed",
      detail: ctx.capacityConstrained
        ? "Cash and attention stay tight unless interventions free Focus."
        : "Cash and attention remain manageable under plan.",
      driverIds: ["cash_flow", "capacity"],
    },
    {
      area: "Strategic position",
      direction:
        caseKind === "best_case"
          ? "positive"
          : caseKind === "worst_case"
            ? "negative"
            : "mixed",
      detail:
        caseKind === "black_swan"
          ? "Strategy is forced into crisis re-sequencing."
          : "Strategic initiatives advance only if Decision binds land.",
      driverIds: ["strategic_initiatives", "market_conditions"],
    },
  ];
}

function buildInterventions(
  caseKind: FutureCaseKind,
  ctx: PressureContext,
  decision: IntelligentExecutiveSnapshot["decisions"][number] | undefined,
  outcome: IntelligentExecutiveSnapshot["outcomes"][number] | undefined,
): Intervention[] {
  const decisionIds = decision ? [decision.id] : [];
  const outcomeIds = outcome ? [outcome.id] : [];
  const items: Intervention[] = [];

  if (decision) {
    items.push({
      id: `${caseKind}-urgent-bind`,
      kind: "urgent",
      title: `Bind "${decision.question}"`,
      rationale: "Unbound immediate Decisions are the highest-leverage path changer.",
      relatedDecisionIds: decisionIds,
      relatedOutcomeIds: outcomeIds,
      effort: "moderate",
      impact: "high",
    });
  }

  items.push({
    id: `${caseKind}-high-focus`,
    kind: "high_impact",
    title: "Protect a Focus block for judgement on material Outcomes",
    rationale: "High-impact path changes require uninterrupted executive attention.",
    relatedDecisionIds: decisionIds,
    relatedOutcomeIds: outcomeIds,
    effort: "moderate",
    impact: "high",
  });

  items.push({
    id: `${caseKind}-low-meetings`,
    kind: "low_effort",
    title: "Collapse two non-critical meetings this week",
    rationale: "Low effort; immediately restores attention units.",
    relatedDecisionIds: [],
    relatedOutcomeIds: [],
    effort: "low",
    impact: "moderate",
  });

  items.push({
    id: `${caseKind}-prevent-signal`,
    kind: "preventative",
    title: "Stand up leading-indicator watch on active drivers",
    rationale: "Early warning prevents surprise migration into worst-case.",
    relatedDecisionIds: decisionIds,
    relatedOutcomeIds: outcomeIds,
    effort: "low",
    impact: "moderate",
  });

  if (caseKind === "best_case" || caseKind === "expected_case") {
    items.push({
      id: `${caseKind}-defer-secondary`,
      kind: "deferred",
      title: "Defer secondary initiatives until the top Outcome stabilises",
      rationale: "Protect the path that creates upside; delay noise.",
      relatedDecisionIds: [],
      relatedOutcomeIds: outcomeIds,
      effort: "low",
      impact: "moderate",
    });
  } else {
    items.push({
      id: `${caseKind}-defer-expansion`,
      kind: "deferred",
      title: "Defer expansion bets until downside indicators cool",
      rationale: "Preserve optionality while pressure is unresolved.",
      relatedDecisionIds: decisionIds,
      relatedOutcomeIds: outcomeIds,
      effort: "moderate",
      impact: "high",
    });
  }

  return items;
}

function alternativesFor(caseKind: FutureCaseKind): string[] {
  switch (caseKind) {
    case "most_likely":
      return [
        "Best case if interventions land early",
        "Worst case if immediate Decisions slip",
      ];
    case "best_case":
      return [
        "Expected case if recovery is partial",
        "Most likely if no decisive bind occurs",
      ];
    case "worst_case":
      return [
        "Expected case if urgent interventions land",
        "Black swan if a shock arrives on top of pressure",
      ];
    case "expected_case":
      return [
        "Most likely if plan assumptions hold loosely",
        "Best case if capacity is freed and binds land",
      ];
    case "black_swan":
      return [
        "Worst case without a discrete shock",
        "Expected case if shock is avoided and plan holds",
      ];
  }
}

function pressureBias(ctx: PressureContext, caseKind: FutureCaseKind): number {
  const pressure =
    ctx.atRiskOutcomes.length * 3 +
    ctx.urgentDecisions.length * 4 +
    (ctx.capacityConstrained ? 5 : 0) +
    (ctx.pulseState === "critical" ? 8 : ctx.pulseState === "attention_required" ? 4 : 0);

  if (caseKind === "worst_case") return Math.min(12, pressure);
  if (caseKind === "best_case") return -Math.min(12, pressure);
  if (caseKind === "black_swan") return Math.min(6, Math.floor(pressure / 2));
  if (caseKind === "most_likely") return Math.min(8, Math.floor(pressure / 3));
  return 0;
}

function normaliseProbabilities(futures: Future[]): Future[] {
  const total = futures.reduce((sum, f) => sum + f.probability, 0) || 1;
  return futures.map((future) => ({
    ...future,
    probability: clamp(Math.round((future.probability / total) * 100), 3, 55),
  }));
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
