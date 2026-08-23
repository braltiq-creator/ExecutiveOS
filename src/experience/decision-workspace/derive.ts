/**
 * Decision Workspace presentation models.
 * Uses Decision engine + snapshot + outcomes — no Core / business-logic changes.
 */

import type { Decision } from "@/lib/decisions/engine-types";
import type { Outcome } from "@/lib/outcomes/types";
import type { ExecutiveSnapshot } from "@/lib/snapshot/types";
import type { StrategicOutcome } from "@/strategy";
import { orgHealthScore } from "@/experience/mission-control/derive";
import type { McTrend } from "@/experience/mission-control/types";
import type {
  DecisionEntryFrom,
  DecisionSectionId,
  DecisionWorkspaceView,
  DwPortfolioCard,
  DwSimulator,
} from "@/experience/decision-workspace/types";

export function parseDecisionEntry(
  from: string | null | undefined,
): DecisionEntryFrom {
  switch (from) {
    case "priority_decisions":
    case "critical_risks":
    case "priority":
    case "activity":
    case "strategy_decisions":
    case "strategy_outcomes":
    case "manufacturing_judgement":
      return from;
    default:
      return "nav";
  }
}

export function resolveDecisionFocus(
  entry: DecisionEntryFrom,
): DecisionSectionId {
  switch (entry) {
    case "critical_risks":
      return "impact-simulator";
    case "strategy_outcomes":
      return "related-strategy";
    case "strategy_decisions":
    case "priority_decisions":
    case "priority":
    case "manufacturing_judgement":
      return "highest-impact";
    case "activity":
      return "decision-portfolio";
    default:
      return "decision-portfolio";
  }
}

function brief(text: string, maxWords = 14): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return "";
  const clause = cleaned.split(/(?<=[.!?])\s+|;\s+|—\s+/)[0] || cleaned;
  const words = clause.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return clause.replace(/[.!?]+$/, "");
  return `${words.slice(0, maxWords).join(" ")}…`;
}

function statusPriority(status: Decision["status"]): number {
  switch (status) {
    case "due_today":
      return 40;
    case "pending":
      return 30;
    case "under_review":
      return 25;
    case "deferred":
      return 10;
    default:
      return 5;
  }
}

function delayUrgency(cost: string): number {
  const t = cost.toLowerCase();
  if (t.includes("day") || t.includes("compound")) return 20;
  if (t.includes("week")) return 12;
  return 6;
}

function rankDecision(d: Decision): number {
  return d.confidence + statusPriority(d.status) + delayUrgency(d.costOfDelay);
}

function expectedValueLabel(d: Decision): string {
  const impact = d.expectedOutcomeImpact || d.businessImpact;
  if (/\d/.test(impact)) return brief(impact, 8);
  return brief(impact || "Material organisational value", 8);
}

function healthImpactLabel(d: Decision, orgHealth: number): string {
  const delta = Math.max(2, Math.round((d.confidence / 100) * 8));
  if (d.status === "approved" || d.status === "decided") {
    return `Supports health near ${orgHealth}`;
  }
  return `+${delta} Organisation Health if approved`;
}

function buildPortfolio(
  decisions: Decision[],
  orgHealth: number,
): DwPortfolioCard[] {
  return decisions
    .map((d) => ({
      id: d.id,
      name: brief(d.question, 14),
      expectedValue: expectedValueLabel(d),
      healthImpact: healthImpactLabel(d, orgHealth),
      confidence: d.confidence,
      costOfDelay: brief(d.costOfDelay, 10),
      status: d.status.replace(/_/g, " "),
      rankScore: rankDecision(d),
      href: `/decisions/${d.id}`,
    }))
    .sort((a, b) => b.rankScore - a.rankScore);
}

function pickSelectedId(
  portfolio: DwPortfolioCard[],
  selectParam: string | null | undefined,
  snapshot: ExecutiveSnapshot,
  entry: DecisionEntryFrom,
): string | null {
  if (selectParam && portfolio.some((p) => p.id === selectParam)) {
    return selectParam;
  }
  if (entry === "activity" || entry === "priority") {
    const fromSnap = snapshot.priorityDecisions[0]?.id;
    if (fromSnap && portfolio.some((p) => p.id === fromSnap)) return fromSnap;
    // Match by title fragment
    const title = snapshot.priorityDecisions[0]?.title?.toLowerCase();
    if (title) {
      const match = portfolio.find((p) =>
        p.name.toLowerCase().includes(title.slice(0, 18)),
      );
      if (match) return match.id;
    }
  }
  return portfolio[0]?.id ?? null;
}

function buildSimulator(
  decision: Decision,
  snapshot: ExecutiveSnapshot,
  outcomesById: Map<string, Outcome>,
): DwSimulator {
  const before = orgHealthScore(snapshot);
  const delta = Math.max(2, Math.min(12, Math.round(decision.confidence / 12)));
  const after = Math.min(99, before + delta);
  const commercialSoft =
    snapshot.pulse.level === "attention" ||
    snapshot.pulse.level === "critical";

  const outcomeNames = decision.outcomeIds
    .map((id) => outcomesById.get(id)?.name)
    .filter(Boolean) as string[];

  const trend: McTrend = after > before ? "up" : after < before ? "down" : "flat";

  return {
    decisionId: decision.id,
    decisionName: brief(decision.question, 16),
    organisationHealth: { before, after, trend },
    commercialHealth: {
      before: commercialSoft ? "Watch" : "Strong",
      after: commercialSoft ? "Improving" : "Strong",
      trend: commercialSoft ? "up" : "flat",
    },
    strategicOutcomeImpact: brief(
      outcomeNames.length
        ? `Improves ${outcomeNames.slice(0, 2).join(" · ")}`
        : decision.expectedOutcomeImpact,
      16,
    ),
    executiveValueImpact: brief(
      decision.businessImpact || decision.expectedOutcomeImpact,
      12,
    ),
    confidence: decision.confidence,
    recommendation: brief(
      decision.recommendationSummary ||
        decision.whatShouldHappenNext ||
        "Approve to improve Organisation Health; delay compounds cost.",
      22,
    ),
    severity: after > before ? "positive" : "warning",
  };
}

export function buildDecisionWorkspaceView(input: {
  decisions: Decision[];
  snapshot: ExecutiveSnapshot;
  outcomes: Outcome[];
  strategicOutcomes: StrategicOutcome[];
  entryFrom?: string | null;
  selectId?: string | null;
}): DecisionWorkspaceView {
  const entry = parseDecisionEntry(input.entryFrom);
  const focusSection = resolveDecisionFocus(entry);
  const orgHealth = orgHealthScore(input.snapshot);
  const portfolio = buildPortfolio(input.decisions, orgHealth);
  const selectedId = pickSelectedId(
    portfolio,
    input.selectId,
    input.snapshot,
    entry,
  );
  const selected =
    input.decisions.find((d) => d.id === selectedId) ?? input.decisions[0];
  const outcomesById = new Map(input.outcomes.map((o) => [o.id, o]));

  const highestImpact = portfolio[0] ?? null;
  const simulator = selected
    ? buildSimulator(selected, input.snapshot, outcomesById)
    : null;

  const evidence =
    selected?.evidence.slice(0, 5).map((e) => ({
      id: e.id,
      title: brief(e.title, 12),
      source: e.source,
      summary: brief(e.summary, 16),
      href: `/knowledge?from=evidence&topic=${encodeURIComponent(e.title)}`,
    })) ?? [];

  const stakeholders =
    selected?.stakeholders.slice(0, 6).map((s) => ({
      id: s.id,
      name: s.name,
      role: s.role,
      stance: s.stance,
      note: brief(s.note, 12),
    })) ?? [];

  const dependencies =
    selected?.relationships.slice(0, 5).map((r) => ({
      id: r.id,
      label: brief(r.relatedDecisionLabel, 12),
      relationship: r.relationship.replace(/_/g, " "),
      explanation: brief(r.explanation, 14),
      href: `/decisions/${r.relatedDecisionId}`,
    })) ?? [];

  const relatedStrategy = (() => {
    if (!selected) return [];
    const fromEngine = selected.outcomeIds
      .map((id) => {
        const o = outcomesById.get(id);
        if (!o) return null;
        return {
          id: o.id,
          outcomeName: o.name,
          impact: brief(
            selected.expectedOutcomeImpact ||
              "Improves if this decision is approved",
            14,
          ),
          href: `/strategy?from=strategic_outcomes#outcome-portfolio`,
        };
      })
      .filter(Boolean) as DecisionWorkspaceView["relatedStrategy"];

    if (fromEngine.length > 0) return fromEngine;

    return input.strategicOutcomes.slice(0, 3).map((o) => ({
      id: o.id,
      outcomeName: o.name,
      impact: brief(
        selected.expectedOutcomeImpact || o.description,
        14,
      ),
      href: `/strategy?from=strategic_outcomes`,
    }));
  })();

  const knowledge = [
    ...(selected?.evidence.slice(0, 2).map((e) => ({
      id: `k-${e.id}`,
      kind: "Evidence",
      title: brief(e.title, 12),
      href: `/knowledge?from=evidence&topic=${encodeURIComponent(e.title)}`,
    })) ?? []),
    ...input.snapshot.sinceYesterday.slice(0, 2).map((u) => ({
      id: `insight-${u.id}`,
      kind: "Insight",
      title: brief(u.sentence, 12),
      href: "/knowledge?from=evidence",
    })),
  ].slice(0, 5);

  const timeline =
    selected?.timeline.slice(0, 8).map((t) => ({
      id: t.id,
      at: t.at,
      title: brief(t.title, 10),
      detail: brief(t.detail, 14),
      kind: t.kind,
    })) ??
    selected?.history.slice(0, 6).map((h) => ({
      id: h.id,
      at: h.at,
      title: h.status.replace(/_/g, " "),
      detail: brief(h.note, 14),
      kind: "status",
    })) ??
    [];

  return {
    entry,
    focusSection,
    selectedId,
    portfolio,
    highestImpact,
    simulator,
    evidence,
    stakeholders,
    dependencies,
    relatedStrategy,
    knowledge,
    timeline,
  };
}

export function decisionEntryLabel(entry: DecisionEntryFrom): string {
  switch (entry) {
    case "priority_decisions":
      return "Arrived from Priority Decisions";
    case "critical_risks":
      return "Arrived from Critical Risks";
    case "priority":
      return "Arrived from Executive Priorities";
    case "activity":
      return "Arrived from Activity Feed";
    case "strategy_decisions":
      return "Arrived from Strategy · Recommended Decisions";
    case "strategy_outcomes":
      return "Arrived from Strategy · Outcomes";
    case "manufacturing_judgement":
      return "Arrived from Manufacturing Command Centre · Lead judgement";
    default:
      return "Judgement that improves organisational outcomes";
  }
}
