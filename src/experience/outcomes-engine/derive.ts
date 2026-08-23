/**
 * Executive Outcomes Engine — presentation synthesis.
 * Strategic outcomes are the organising principle across workspaces.
 * No Core / provider / routing / EXS changes.
 */

import type { Decision } from "@/lib/decisions/engine-types";
import type { ExecutiveSnapshot } from "@/lib/snapshot/types";
import type { StrategicOutcome } from "@/strategy";
import type { LoopImpactRecord } from "@/experience/executive-loop/types";
import { orgHealthScore } from "@/experience/mission-control/derive";
import type {
  OutcomeContext,
  OutcomeHealthView,
  OutcomeImpactView,
  OutcomePortfolioItem,
  OutcomeRelation,
  OutcomeTimelineEvent,
  OutcomesEngineView,
} from "@/experience/outcomes-engine/types";
import type { McSeverity, McTrend } from "@/experience/mission-control/types";

function brief(text: string, maxWords = 14): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return "";
  const clause = cleaned.split(/(?<=[.!?])\s+|;\s+|—\s+/)[0] || cleaned;
  const words = clause.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return clause.replace(/[.!?]+$/, "");
  return `${words.slice(0, maxWords).join(" ")}…`;
}

function healthLabel(h: StrategicOutcome["currentHealth"]): string {
  return h.replace(/_/g, " ");
}

function healthTone(h: StrategicOutcome["currentHealth"]): McSeverity {
  if (h === "on_track" || h === "achieved") return "positive";
  if (h === "watching") return "warning";
  if (h === "at_risk") return "warning";
  return "critical";
}

function healthTrend(h: StrategicOutcome["currentHealth"]): McTrend {
  if (h === "on_track" || h === "achieved") return "up";
  if (h === "watching") return "flat";
  return "down";
}

function trajectory(h: StrategicOutcome["currentHealth"]): string {
  if (h === "on_track") return "Improving";
  if (h === "achieved") return "Achieved";
  if (h === "watching") return "Watching";
  if (h === "at_risk") return "Softening";
  return "Off track";
}

function outcomeHref(id: string, from = "strategic_outcomes"): string {
  return `/strategy?from=${from}&outcome=${encodeURIComponent(id)}#outcome-portfolio`;
}

export function buildOutcomePortfolio(
  outcomes: StrategicOutcome[],
): OutcomePortfolioItem[] {
  const importanceRank: Record<StrategicOutcome["strategicImportance"], number> =
    {
      critical: 0,
      high: 1,
      moderate: 2,
      supporting: 3,
    };

  return [...outcomes]
    .sort(
      (a, b) =>
        importanceRank[a.strategicImportance] -
          importanceRank[b.strategicImportance] ||
        b.confidence - a.confidence,
    )
    .map((o) => ({
      id: o.id,
      name: o.name,
      health: healthLabel(o.currentHealth),
      healthTone: healthTone(o.currentHealth),
      trajectory: trajectory(o.currentHealth),
      trend: healthTrend(o.currentHealth),
      businessImpact: brief(o.description || o.evidence[0] || o.name, 16),
      confidence: o.confidence,
      owner: o.executiveOwner,
      targetDate: o.targetDate
        ? o.targetDate.slice(0, 10)
        : "Open",
      href: outcomeHref(o.id),
    }));
}

/** Pick the outcome currently in executive focus. */
export function resolveFocusOutcome(input: {
  outcomes: StrategicOutcome[];
  snapshot: ExecutiveSnapshot;
  outcomeId?: string | null;
  decisions?: Decision[];
}): StrategicOutcome | null {
  const { outcomes, snapshot, decisions = [] } = input;
  if (outcomes.length === 0) return null;

  if (input.outcomeId) {
    const match = outcomes.find((o) => o.id === input.outcomeId);
    if (match) return match;
  }

  const atRisk = outcomes.filter(
    (o) => o.currentHealth === "at_risk" || o.currentHealth === "off_track",
  );
  if (atRisk[0]) return atRisk[0];

  const linked = decisions.find((d) => d.outcomeIds.length > 0);
  if (linked) {
    const byId = outcomes.find((o) => linked.outcomeIds.includes(o.id));
    if (byId) return byId;
    const byName = outcomes.find((o) =>
      linked.outcomeIds.some((id) =>
        o.name.toLowerCase().includes(id.toLowerCase()),
      ),
    );
    if (byName) return byName;
  }

  const fromAction = snapshot.recommendedActions[0]?.supportsOutcomeId;
  if (fromAction) {
    const match = outcomes.find((o) => o.id === fromAction);
    if (match) return match;
  }

  const fromName = snapshot.recommendedActions[0]?.supportsOutcome;
  if (fromName) {
    const match = outcomes.find(
      (o) => o.name.toLowerCase() === fromName.toLowerCase(),
    );
    if (match) return match;
  }

  return (
    outcomes.find((o) => o.strategicImportance === "critical") ??
    outcomes[0] ??
    null
  );
}

export function buildOutcomeContext(
  outcome: StrategicOutcome,
  workspace:
    | "today"
    | "strategy"
    | "decision"
    | "knowledge"
    | "loop",
): OutcomeContext {
  const labels = {
    today: "Current Priority Outcome",
    strategy: "Outcome Drivers Focus",
    decision: "Expected Outcome Impact",
    knowledge: "Evidence Supporting Outcome",
    loop: "Outcome Progress",
  } as const;

  const details = {
    today: brief(
      `Judgement today should improve ${outcome.name}.`,
      12,
    ),
    strategy: brief(
      `Drivers and risks explained for ${outcome.name}.`,
      12,
    ),
    decision: brief(
      outcome.description || `This decision moves ${outcome.name}.`,
      14,
    ),
    knowledge: brief(
      `Trace why ExecutiveOS believes ${outcome.name} will move.`,
      12,
    ),
    loop: brief(
      `Track predicted vs actual progress on ${outcome.name}.`,
      12,
    ),
  } as const;

  return {
    outcomeId: outcome.id,
    name: outcome.name,
    health: healthLabel(outcome.currentHealth),
    healthTone: healthTone(outcome.currentHealth),
    label: labels[workspace],
    detail: details[workspace],
    href: outcomeHref(outcome.id),
  };
}

export function buildOutcomeHealth(input: {
  outcome: StrategicOutcome;
  snapshot: ExecutiveSnapshot;
  decisions: Decision[];
}): OutcomeHealthView {
  const { outcome, snapshot, decisions } = input;
  const linked = decisions.filter(
    (d) =>
      d.outcomeIds.includes(outcome.id) ||
      d.question.toLowerCase().includes(outcome.name.toLowerCase().slice(0, 12)),
  );

  const risks = [
    ...outcome.evidence
      .filter((e) => /risk|soft|drift|delay/i.test(e))
      .slice(0, 2)
      .map((e) => brief(e, 12)),
    ...snapshot.recommendedActions
      .filter((a) => a.potentialRisk)
      .slice(0, 2)
      .map((a) => brief(a.potentialRisk || a.title, 12)),
  ].slice(0, 3);

  const opportunities = snapshot.recommendedActions
    .filter((a) => !a.potentialRisk)
    .slice(0, 3)
    .map((a) => brief(a.title, 12));

  return {
    outcomeId: outcome.id,
    name: outcome.name,
    currentState: healthLabel(outcome.currentHealth),
    trajectory: trajectory(outcome.currentHealth),
    trend: healthTrend(outcome.currentHealth),
    severity: healthTone(outcome.currentHealth),
    confidence: outcome.confidence,
    drivers: [
      ...outcome.supportingKpis.slice(0, 2).map((k) => brief(k, 8)),
      ...outcome.successMeasures.slice(0, 2).map((m) => brief(m, 10)),
      brief(snapshot.pulse.why, 10),
    ]
      .filter(Boolean)
      .slice(0, 4),
    risks:
      risks.length > 0
        ? risks
        : [brief("No elevated risk attached to this outcome", 10)],
    opportunities:
      opportunities.length > 0
        ? opportunities
        : [brief("Hold current trajectory", 8)],
    recommendedDecisions: [
      ...linked.slice(0, 3).map((d) => ({
        id: d.id,
        title: brief(d.question, 12),
        href: `/decisions/${d.id}`,
      })),
      ...snapshot.priorityDecisions.slice(0, 2).map((d) => ({
        id: d.id,
        title: brief(d.title, 12),
        href: d.href,
      })),
    ].slice(0, 3),
    explanation: brief(
      `${outcome.name} is ${healthLabel(outcome.currentHealth)}. Organisation Health (${orgHealthScore(snapshot)}) is a derived indicator of portfolio progress — not the destination.`,
      36,
    ),
  };
}

export function buildOutcomeRelationships(input: {
  outcome: StrategicOutcome;
  snapshot: ExecutiveSnapshot;
  decisions: Decision[];
}): OutcomeRelation[] {
  const { outcome, snapshot, decisions } = input;
  const items: OutcomeRelation[] = [
    {
      id: "rel-health",
      kind: "Organisation Health",
      label: `Supports Organisation Health ${orgHealthScore(snapshot)}`,
      href: "/strategy?from=organisation_health",
    },
    {
      id: "rel-strategy",
      kind: "Strategy",
      label: brief(outcome.name, 10),
      href: outcomeHref(outcome.id),
    },
  ];

  for (const d of decisions.slice(0, 2)) {
    items.push({
      id: `rel-dec-${d.id}`,
      kind: "Decision",
      label: brief(d.question, 10),
      href: `/decisions/${d.id}`,
    });
  }

  items.push({
    id: "rel-knowledge",
    kind: "Knowledge",
    label: brief(
      outcome.evidence[0] || "Evidence supporting this outcome",
      10,
    ),
    href: `/knowledge?from=strategy&outcome=${encodeURIComponent(outcome.id)}`,
  });

  if (
    outcome.currentHealth === "at_risk" ||
    outcome.currentHealth === "off_track"
  ) {
    items.push({
      id: "rel-risk",
      kind: "Risk",
      label: `${healthLabel(outcome.currentHealth)} posture`,
      href: "/decisions?from=critical_risks",
    });
  }

  const opp = snapshot.recommendedActions.find((a) => !a.potentialRisk);
  if (opp) {
    items.push({
      id: "rel-opp",
      kind: "Opportunity",
      label: brief(opp.title, 10),
      href: opp.href || "/decisions?from=priority",
    });
  }

  for (const cap of outcome.businessCapabilities.slice(0, 1)) {
    items.push({
      id: `rel-proj-${cap}`,
      kind: "Project",
      label: brief(cap, 8),
      href: "/strategy?from=strategic_outcomes",
    });
  }

  items.push({
    id: "rel-customer",
    kind: "Customer",
    label: "Customer Health signal",
    href: "/knowledge?from=customer_health",
  });

  return items.slice(0, 8);
}

export function buildOutcomeTimeline(input: {
  outcome: StrategicOutcome;
  snapshot: ExecutiveSnapshot;
  loopImpacts?: LoopImpactRecord[];
}): OutcomeTimelineEvent[] {
  const { outcome, snapshot } = input;
  const loopImpacts = input.loopImpacts ?? [];
  const events: OutcomeTimelineEvent[] = [];

  for (const imp of loopImpacts.slice(0, 2)) {
    events.push({
      id: `ot-dec-${imp.decisionId}`,
      at: imp.approvedAt,
      title: "Decision Approved",
      detail: brief(imp.decisionTitle, 12),
      kind: "decision",
    });
    events.push({
      id: `ot-health-${imp.decisionId}`,
      at: imp.approvedAt,
      title: "Organisation Health Changed",
      detail: `${imp.healthBefore} → ${imp.healthAfter}`,
      kind: "health",
    });
    events.push({
      id: `ot-out-${imp.decisionId}`,
      at: imp.approvedAt,
      title: "Outcome Improved",
      detail: brief(outcome.name, 10),
      kind: "outcome",
    });
    events.push({
      id: `ot-conf-${imp.decisionId}`,
      at: imp.approvedAt,
      title: "Confidence Updated",
      detail: `${imp.confidenceBefore}% → ${imp.confidenceAfter}%`,
      kind: "confidence",
    });
  }

  if (snapshot.recommendedActions[0]) {
    events.push({
      id: "ot-rec",
      at: snapshot.asOf,
      title: "Recommendation Generated",
      detail: brief(snapshot.recommendedActions[0].title, 12),
      kind: "recommendation",
    });
  }

  if (events.length === 0) {
    events.push({
      id: "ot-base",
      at: outcome.updatedAt,
      title: "Outcome Watching",
      detail: brief(
        `${outcome.name} · ${healthLabel(outcome.currentHealth)}`,
        12,
      ),
      kind: "outcome",
    });
  }

  return events.slice(0, 8);
}

export function buildOutcomeImpact(input: {
  outcome: StrategicOutcome;
  loopImpact?: LoopImpactRecord | null;
  decisionTitle?: string;
}): OutcomeImpactView {
  const { outcome, loopImpact } = input;

  if (!loopImpact) {
    return {
      outcomeId: outcome.id,
      outcomeName: outcome.name,
      predictedImprovement: "Pending judgement",
      actualImprovement: "Not yet measured",
      variance: "—",
      learning:
        "Approve a decision to close the loop and compare predicted vs actual outcome movement.",
      href: outcomeHref(outcome.id),
    };
  }

  const predicted = loopImpact.predictedHealthDelta;
  const actual = loopImpact.actualHealthDelta;
  const variance = actual - predicted;

  return {
    outcomeId: outcome.id,
    outcomeName: outcome.name,
    predictedImprovement: `+${predicted} outcome health points`,
    actualImprovement: `+${actual} outcome health points`,
    variance:
      variance === 0
        ? "On prediction"
        : variance > 0
          ? `+${variance} vs predicted`
          : `${variance} vs predicted`,
    learning: brief(
      variance >= 0
        ? `${input.decisionTitle || loopImpact.decisionTitle} strengthened ${outcome.name} as predicted — reinforce this pattern.`
        : `${outcome.name} moved less than predicted — recalibrate confidence before the next similar call.`,
      28,
    ),
    href: outcomeHref(outcome.id),
  };
}

export function buildOutcomesEngineView(input: {
  strategicOutcomes: StrategicOutcome[];
  snapshot: ExecutiveSnapshot;
  decisions?: Decision[];
  loopImpacts?: LoopImpactRecord[];
  outcomeId?: string | null;
  workspace?:
    | "today"
    | "strategy"
    | "decision"
    | "knowledge"
    | "loop";
}): OutcomesEngineView {
  const decisions = input.decisions ?? [];
  const loopImpacts = input.loopImpacts ?? [];
  const workspace = input.workspace ?? "today";
  const portfolio = buildOutcomePortfolio(input.strategicOutcomes);
  const focusOutcome = resolveFocusOutcome({
    outcomes: input.strategicOutcomes,
    snapshot: input.snapshot,
    outcomeId: input.outcomeId,
    decisions,
  });

  if (!focusOutcome) {
    return {
      portfolio,
      focus: null,
      health: null,
      relationships: [],
      timeline: [],
      impact: null,
    };
  }

  return {
    portfolio,
    focus: buildOutcomeContext(focusOutcome, workspace),
    health: buildOutcomeHealth({
      outcome: focusOutcome,
      snapshot: input.snapshot,
      decisions,
    }),
    relationships: buildOutcomeRelationships({
      outcome: focusOutcome,
      snapshot: input.snapshot,
      decisions,
    }),
    timeline: buildOutcomeTimeline({
      outcome: focusOutcome,
      snapshot: input.snapshot,
      loopImpacts,
    }),
    impact: buildOutcomeImpact({
      outcome: focusOutcome,
      loopImpact: loopImpacts[0] ?? null,
    }),
  };
}
