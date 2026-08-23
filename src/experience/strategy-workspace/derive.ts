/**
 * Strategy Workspace presentation models.
 * Derives from existing StrategyDashboard + ExecutiveSnapshot — no Core changes.
 */

import type { ExecutiveSnapshot } from "@/lib/snapshot/types";
import type { StrategyDashboard, StrategicOutcome } from "@/strategy";
import { orgHealthScore } from "@/experience/mission-control/derive";
import type { McSeverity, McTrend } from "@/experience/mission-control/types";
import type {
  StrategyEntryFrom,
  StrategySectionId,
  StrategyWorkspaceModel,
  SwDecision,
  SwDriver,
  SwDriverId,
  SwKnowledge,
  SwOpportunity,
  SwOrgHealth,
  SwOutcomeCard,
  SwRisk,
} from "@/experience/strategy-workspace/types";

export function parseStrategyEntry(from: string | null | undefined): StrategyEntryFrom {
  switch (from) {
    case "organisation_health":
    case "strategic_outcomes":
    case "strategy_outcomes":
      return from === "strategy_outcomes" ? "strategic_outcomes" : from;
    case "commercial_health":
    case "priority":
    case "activity":
      return from;
    default:
      return "nav";
  }
}

export function resolveEntryFocus(entry: StrategyEntryFrom): {
  focusSection: StrategySectionId;
  highlightDriverId: SwDriverId | null;
} {
  switch (entry) {
    case "organisation_health":
    case "activity":
      return { focusSection: "organisation-health", highlightDriverId: null };
    case "strategic_outcomes":
      return { focusSection: "outcome-portfolio", highlightDriverId: null };
    case "commercial_health":
      return {
        focusSection: "business-drivers",
        highlightDriverId: "commercial",
      };
    case "priority":
      return {
        focusSection: "recommended-decisions",
        highlightDriverId: null,
      };
    default:
      return { focusSection: "organisation-health", highlightDriverId: null };
  }
}

function pulseTrend(level: ExecutiveSnapshot["pulse"]["level"]): McTrend {
  if (level === "improving") return "up";
  if (level === "critical" || level === "attention") return "down";
  return "flat";
}

function trendSeverity(trend: McTrend): McSeverity {
  if (trend === "up") return "positive";
  if (trend === "down") return "negative";
  return "neutral";
}

function healthSeverity(
  health: StrategicOutcome["currentHealth"],
): McSeverity {
  if (health === "on_track" || health === "achieved") return "positive";
  if (health === "watching") return "warning";
  if (health === "at_risk") return "warning";
  return "critical";
}

function healthTrend(health: StrategicOutcome["currentHealth"]): McTrend {
  if (health === "on_track" || health === "achieved") return "up";
  if (health === "watching") return "flat";
  return "down";
}

function brief(text: string, maxWords = 14): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return "";
  const clause = cleaned.split(/(?<=[.!?])\s+|;\s+|—\s+/)[0] || cleaned;
  const words = clause.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return clause.replace(/[.!?]+$/, "");
  return `${words.slice(0, maxWords).join(" ")}…`;
}

function buildHistory(score: number, sparkline?: number[]): number[] {
  if (sparkline && sparkline.length >= 4) {
    return sparkline.slice(-7).map((n) => Math.round(n));
  }
  const base = Math.max(20, score - 12);
  return [base, base + 3, base + 1, base + 6, base + 4, score - 2, score];
}

function buildOrgHealth(
  snapshot: ExecutiveSnapshot,
  dashboard: StrategyDashboard,
): SwOrgHealth {
  const score = orgHealthScore(snapshot);
  const trend = pulseTrend(snapshot.pulse.level);
  const atRisk = dashboard.outcomes.filter(
    (o) => o.currentHealth === "at_risk" || o.currentHealth === "off_track",
  );
  const onTrack = dashboard.outcomes.filter(
    (o) => o.currentHealth === "on_track" || o.currentHealth === "achieved",
  );

  const primaryDrivers = [
    onTrack[0]
      ? `${onTrack[0].name} supporting health`
      : dashboard.progress.explanation,
    atRisk[0]
      ? `${atRisk[0].name} pulling health down`
      : snapshot.executiveState.summary,
    dashboard.alignment.explanation || snapshot.pulse.why,
  ]
    .map((d) => brief(d, 10))
    .filter(Boolean)
    .slice(0, 3);

  const whyMoved =
    trend === "up"
      ? brief(
          `Health improved as ${onTrack[0]?.name ?? "core outcomes"} stabilised while attention pressure eased.`,
          18,
        )
      : trend === "down"
        ? brief(
            `Health softened because ${atRisk[0]?.name ?? "key outcomes"} need judgment and capacity is constrained.`,
            18,
          )
        : brief(
            `Health is steady — ${dashboard.progress.explanation || snapshot.pulse.why}`,
            18,
          );

  return {
    score,
    trend,
    severity: trendSeverity(trend),
    confidence: snapshot.pulse.confidence,
    updatedLabel: snapshot.pulse.refreshedLabel.replace(/^Updated\s+/i, ""),
    summary: brief(
      `Organisation Health is ${score}. ${snapshot.pulse.label}.`,
      12,
    ),
    whyMoved,
    primaryDrivers,
    history: buildHistory(score, snapshot.outcomes[0]?.sparkline),
  };
}

function buildOutcomes(
  dashboard: StrategyDashboard,
  snapshot: ExecutiveSnapshot,
): SwOutcomeCard[] {
  return dashboard.outcomes.map((outcome) => {
    const progress = dashboard.progress.outcomes.find(
      (p) => p.outcomeId === outcome.id,
    );
    const snap = snapshot.outcomes.find(
      (o) =>
        o.name.toLowerCase() === outcome.name.toLowerCase() ||
        o.id === outcome.id,
    );
    const next =
      dashboard.alignment.recommendationAlignments.find(
        (a) => a.outcomeId === outcome.id,
      )?.recommendationTitle ||
      snapshot.priorityDecisions[0]?.title ||
      "Review outcome posture";

    return {
      id: outcome.id,
      name: outcome.name,
      health: outcome.currentHealth.replace(/_/g, " "),
      healthTone: healthSeverity(outcome.currentHealth),
      trajectory:
        snap?.momentumLabel ||
        (progress
          ? `${progress.progressPct}% progress`
          : outcome.currentHealth.replace(/_/g, " ")),
      trend: healthTrend(outcome.currentHealth),
      owner: outcome.executiveOwner,
      impact: brief(
        outcome.description ||
          outcome.evidence[0] ||
          "Material to organisational direction",
        12,
      ),
      nextDecision: brief(next, 10),
      detail: brief(
        [
          outcome.description,
          outcome.evidence[0],
          dashboard.initiatives
            .filter((i) => i.outcomeId === outcome.id)
            .map((i) => `${i.name} (${i.progressPct}%)`)
            .slice(0, 2)
            .join(" · "),
        ]
          .filter(Boolean)
          .join(" "),
        40,
      ),
      measures: outcome.successMeasures.slice(0, 3),
      href: snap?.href || `/strategy#outcome-${outcome.id}`,
    };
  });
}

function buildDrivers(
  snapshot: ExecutiveSnapshot,
  dashboard: StrategyDashboard,
): SwDriver[] {
  const commercialSoft =
    snapshot.pulse.level === "attention" ||
    snapshot.pulse.level === "critical" ||
    dashboard.outcomes.some(
      (o) =>
        /revenue|commercial|growth|retention/i.test(o.name) &&
        (o.currentHealth === "at_risk" || o.currentHealth === "off_track"),
    );
  const riskElevated = dashboard.outcomes.some(
    (o) => o.currentHealth === "at_risk" || o.currentHealth === "off_track",
  );
  const people =
    snapshot.executiveState.capacity === "available"
      ? { status: "Available", trend: "up" as McTrend, severity: "positive" as McSeverity }
      : snapshot.executiveState.capacity === "constrained"
        ? {
            status: "Constrained",
            trend: "flat" as McTrend,
            severity: "warning" as McSeverity,
          }
        : {
            status: "Overdrawn",
            trend: "down" as McTrend,
            severity: "critical" as McSeverity,
          };

  const opsOutcome = dashboard.outcomes.find((o) =>
    /operat|reliab|deliver/i.test(o.name),
  );
  const customerOutcome = dashboard.outcomes.find((o) =>
    /customer|retention|account/i.test(o.name),
  );

  return [
    {
      id: "commercial",
      label: "Commercial",
      status: commercialSoft ? "Watch" : "Strong",
      trend: commercialSoft ? "down" : "up",
      severity: commercialSoft ? "warning" : "positive",
      confidence: snapshot.pulse.confidence,
      impact: brief(
        commercialSoft
          ? "Commercial posture is softening organisational health."
          : "Commercial strength is supporting organisational health.",
        12,
      ),
      href: "/strategy?from=commercial_health#business-drivers",
    },
    {
      id: "customers",
      label: "Customers",
      status: customerOutcome
        ? customerOutcome.currentHealth.replace(/_/g, " ")
        : snapshot.pulse.confidence >= 70
          ? "Healthy"
          : "Watch",
      trend: customerOutcome
        ? healthTrend(customerOutcome.currentHealth)
        : snapshot.pulse.confidence >= 70
          ? "up"
          : "flat",
      severity: customerOutcome
        ? healthSeverity(customerOutcome.currentHealth)
        : snapshot.pulse.confidence >= 70
          ? "positive"
          : "warning",
      confidence: customerOutcome?.confidence ?? 70,
      impact: brief(
        customerOutcome?.description ||
          "Customer signal informs retention and revenue outcomes.",
        12,
      ),
      href: "/knowledge?from=customer_health",
    },
    {
      id: "people",
      label: "People",
      status: people.status,
      trend: people.trend,
      severity: people.severity,
      confidence: 72,
      impact: brief(snapshot.executiveState.summary, 12),
      href: "/team",
    },
    {
      id: "operations",
      label: "Operations",
      status: opsOutcome
        ? opsOutcome.currentHealth.replace(/_/g, " ")
        : "Steady",
      trend: opsOutcome ? healthTrend(opsOutcome.currentHealth) : "flat",
      severity: opsOutcome
        ? healthSeverity(opsOutcome.currentHealth)
        : "neutral",
      confidence: opsOutcome?.confidence ?? dashboard.validation.confidence,
      impact: brief(
        opsOutcome?.description ||
          "Operational reliability underpins delivery confidence.",
        12,
      ),
      href: opsOutcome ? `/strategy#outcome-${opsOutcome.id}` : "/strategy",
    },
    {
      id: "technology",
      label: "Technology",
      status:
        snapshot.pulse.level === "critical"
          ? "Watch"
          : snapshot.pulse.level === "attention"
            ? "Watch"
            : "Healthy",
      trend: snapshot.pulse.level === "critical" ? "down" : "flat",
      severity:
        snapshot.pulse.level === "critical"
          ? "warning"
          : snapshot.pulse.level === "attention"
            ? "warning"
            : "positive",
      confidence: 80,
      impact: "Platform and system fitness affect signal trust.",
      href: "/administration",
    },
    {
      id: "risk",
      label: "Risk",
      status: riskElevated ? "Elevated" : "Contained",
      trend: riskElevated ? "down" : "up",
      severity: riskElevated ? "critical" : "positive",
      confidence: 75,
      impact: brief(
        riskElevated
          ? "Strategic risk is material to Organisation Health."
          : "Strategic risk posture is contained.",
        12,
      ),
      href: "/decisions?from=strategy_decisions",
    },
  ];
}

function buildRisks(
  dashboard: StrategyDashboard,
  snapshot: ExecutiveSnapshot,
): SwRisk[] {
  const fromOutcomes: SwRisk[] = dashboard.outcomes
    .filter(
      (o) => o.currentHealth === "at_risk" || o.currentHealth === "off_track",
    )
    .map((o) => ({
      id: `risk-outcome-${o.id}`,
      risk: brief(`${o.name} is ${o.currentHealth.replace(/_/g, " ")}`, 12),
      likelihood: o.currentHealth === "off_track" ? "High" : "Medium",
      impact: brief(o.description || o.evidence[0] || "Strategic drift", 10),
      owner: o.executiveOwner,
      mitigation: brief(
        dashboard.alignment.recommendationAlignments.find(
          (a) => a.outcomeId === o.id,
        )?.expectedImpact ||
          o.evidence[0] ||
          "Protect outcome with focused judgment this week",
        12,
      ),
      href: "/decisions?from=strategy_decisions",
    }));

  const fromActions: SwRisk[] = snapshot.recommendedActions
    .filter((a) => a.potentialRisk)
    .slice(0, 3)
    .map((a) => ({
      id: `risk-action-${a.id}`,
      risk: brief(a.potentialRisk || a.title, 12),
      likelihood: "Medium",
      impact: brief(a.expectedImpact || a.expectedOutcome, 10),
      owner: "Executive",
      mitigation: brief(a.title, 10),
      href: a.href?.startsWith("/decisions/")
        ? a.href
        : "/decisions?from=strategy_decisions",
    }));

  return [...fromOutcomes, ...fromActions].slice(0, 5);
}

function buildOpportunities(
  dashboard: StrategyDashboard,
  snapshot: ExecutiveSnapshot,
): SwOpportunity[] {
  const fromAlignment = dashboard.alignment.recommendationAlignments
    .slice()
    .sort((a, b) => b.estimatedContribution - a.estimatedContribution)
    .slice(0, 4)
    .map((a) => ({
      id: a.id,
      title: brief(a.recommendationTitle, 12),
      expectedValue:
        a.estimatedContribution > 0
          ? `~${a.estimatedContribution}% contribution`
          : brief(a.expectedImpact, 8),
      confidence: a.confidence,
      action: brief(a.expectedImpact || "Advance aligned recommendation", 10),
      href: a.decisionId
        ? `/decisions/${a.decisionId}`
        : "/decisions?from=strategy_decisions",
    }));

  if (fromAlignment.length > 0) return fromAlignment;

  return snapshot.recommendedActions.slice(0, 4).map((a) => ({
    id: a.id,
    title: brief(a.title, 12),
    expectedValue: brief(a.expectedImpact || a.expectedOutcome, 8),
    confidence: a.confidence ?? a.strategyConfidence ?? 70,
    action: brief(a.why, 10),
    href: a.href?.startsWith("/decisions/")
      ? a.href
      : "/decisions?from=strategy_decisions",
  }));
}

function buildDecisions(
  snapshot: ExecutiveSnapshot,
  dashboard: StrategyDashboard,
): SwDecision[] {
  const fromPriority = snapshot.priorityDecisions.slice(0, 4).map((d) => ({
    id: d.id,
    title: brief(d.title, 12),
    expectedImprovement: brief(
      d.businessImpact || "Improves Organisation Health posture",
      10,
    ),
    confidence: 78,
    costOfDelay: brief(d.decisionTimeLabel || "Rises with each day deferred", 8),
    href: `/decisions?from=strategy_decisions&select=${encodeURIComponent(d.id)}`,
  }));

  if (fromPriority.length > 0) return fromPriority;

  return dashboard.alignment.decisionAlignments.slice(0, 4).map((a) => ({
    id: a.id,
    title: brief(a.recommendationTitle, 12),
    expectedImprovement: brief(a.expectedImpact, 10),
    confidence: a.confidence,
    costOfDelay: "Strategic drift compounds",
    href: a.decisionId
      ? `/decisions/${a.decisionId}`
      : "/decisions?from=strategy_decisions",
  }));
}

function buildKnowledge(snapshot: ExecutiveSnapshot): SwKnowledge[] {
  const items: SwKnowledge[] = [];

  snapshot.sinceYesterday.slice(0, 3).forEach((u) => {
    items.push({
      id: `insight-${u.id}`,
      kind: "Insight",
      title: brief(u.sentence, 14),
      href: "/knowledge?from=strategy",
    });
  });

  snapshot.executiveAgenda?.items.slice(0, 2).forEach((m) => {
    items.push({
      id: `meeting-${m.id}`,
      kind: "Meeting",
      title: brief(m.title, 12),
      href: "/calendar",
    });
  });

  if (snapshot.recommendedActions[0]?.evidenceSummary?.[0]) {
    items.push({
      id: "doc-evidence",
      kind: "Document",
      title: brief(snapshot.recommendedActions[0].evidenceSummary[0], 12),
      href: "/knowledge?from=strategy",
    });
  }

  if (snapshot.pulse.why) {
    items.push({
      id: "ai-pulse",
      kind: "AI Analysis",
      title: brief(snapshot.pulse.why, 14),
      href: "/knowledge?from=strategy",
    });
  }

  return items.slice(0, 6);
}

export function buildStrategyWorkspaceModel(input: {
  dashboard: StrategyDashboard;
  snapshot: ExecutiveSnapshot;
  entryFrom?: string | null;
}): StrategyWorkspaceModel {
  const entry = parseStrategyEntry(input.entryFrom);
  const { focusSection, highlightDriverId } = resolveEntryFocus(entry);

  return {
    entry,
    focusSection,
    highlightDriverId,
    orgHealth: buildOrgHealth(input.snapshot, input.dashboard),
    outcomes: buildOutcomes(input.dashboard, input.snapshot),
    drivers: buildDrivers(input.snapshot, input.dashboard),
    risks: buildRisks(input.dashboard, input.snapshot),
    opportunities: buildOpportunities(input.dashboard, input.snapshot),
    decisions: buildDecisions(input.snapshot, input.dashboard),
    knowledge: buildKnowledge(input.snapshot),
  };
}
