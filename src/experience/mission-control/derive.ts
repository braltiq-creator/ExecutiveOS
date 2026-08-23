/**
 * Derive Mission Control presentation from existing snapshot signals.
 * No Core / data-model changes.
 */

import type { ExecutiveSnapshot } from "@/lib/snapshot/types";
import type { StrategicOutcome } from "@/strategy";
import { deriveTodaysFocus } from "@/experience/executive-brief/briefFocus";
import {
  buildLeadJudgementProse,
  parseGreetingName,
} from "@/experience/executive-brief/briefCopy";
import type {
  McActivityItem,
  McKpi,
  McPulse,
  McSeverity,
  McSnapshotCard,
  McTrend,
} from "@/experience/mission-control/types";

function pulseTrend(level: ExecutiveSnapshot["pulse"]["level"]): McTrend {
  if (level === "improving") return "up";
  if (level === "critical" || level === "attention") return "down";
  return "flat";
}

function trendStatus(trend: McTrend): string {
  if (trend === "up") return "Improving";
  if (trend === "down") return "Softening";
  return "Steady";
}

function trendSeverity(trend: McTrend): McSeverity {
  if (trend === "up") return "positive";
  if (trend === "down") return "negative";
  return "neutral";
}

/** Shared with Strategy Workspace — presentation only. */
export function orgHealthScore(snapshot: ExecutiveSnapshot): number {
  const outcomeScores = snapshot.outcomes.map((o) => {
    if (o.status === "on_track") return 85;
    if (o.status === "watching") return 65;
    if (o.status === "at_risk") return 45;
    return 25;
  });
  const base =
    outcomeScores.length === 0
      ? snapshot.pulse.confidence
      : Math.round(
          outcomeScores.reduce((a, b) => a + b, 0) / outcomeScores.length,
        );
  const blend = Math.round(base * 0.55 + snapshot.pulse.confidence * 0.45);
  return Math.max(5, Math.min(99, blend));
}

/** Chief-of-Staff brevity — first clause, capped. */
function briefLine(text: string, maxWords = 12): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return "";
  const clause = cleaned.split(/(?<=[.!?])\s+|;\s+|—\s+/)[0] || cleaned;
  const words = clause.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) {
    return clause.replace(/[.!?]+$/, "");
  }
  return `${words.slice(0, maxWords).join(" ")}…`;
}

export function buildMissionKpis(input: {
  snapshot: ExecutiveSnapshot;
  strategicOutcomes: StrategicOutcome[];
  /** null = evidence-safe "Not yet quantified" (never inherit demo $ values). */
  monthlyValue: number | null;
  valueTrend: McTrend;
  valueConfidence: number;
}): McKpi[] {
  const { snapshot, strategicOutcomes, monthlyValue, valueTrend, valueConfidence } =
    input;
  const health = orgHealthScore(snapshot);
  const healthTrend = pulseTrend(snapshot.pulse.level);
  const outcomes = strategicOutcomes.length ? strategicOutcomes : null;
  const onTrack = outcomes
    ? outcomes.filter(
        (o) => o.currentHealth === "on_track" || o.currentHealth === "achieved",
      ).length
    : snapshot.outcomes.filter((o) => o.status === "on_track").length;
  const outcomeTotal = outcomes?.length || snapshot.outcomes.length || 0;
  const decisions = snapshot.priorityDecisions.length;
  const risks =
    snapshot.outcomes.filter(
      (o) => o.status === "at_risk" || o.status === "off_track",
    ).length +
    snapshot.recommendedActions.filter((a) => Boolean(a.potentialRisk)).length;
  const focus = deriveTodaysFocus(snapshot);
  const commercialSoft =
    focus === "Commercial" || focus === "Growth" || healthTrend === "down";

  const peopleScore =
    snapshot.executiveState.capacity === "available"
      ? 82
      : snapshot.executiveState.capacity === "constrained"
        ? 58
        : 36;

  const systemScore =
    snapshot.pulse.level === "critical"
      ? 42
      : snapshot.pulse.level === "attention"
        ? 68
        : 88;

  const customerScore = Math.round(
    (snapshot.pulse.confidence + (100 - Math.min(40, risks * 12))) / 2,
  );

  const updated = snapshot.pulse.refreshedLabel.replace(/^Updated\s+/i, "");

  return [
    {
      id: "organisation_health",
      label: "Organisation Health",
      value: String(health),
      status: trendStatus(healthTrend),
      trend: healthTrend,
      severity: trendSeverity(healthTrend),
      confidence: snapshot.pulse.confidence,
      href: "/strategy?from=organisation_health",
      updatedLabel: updated,
    },
    {
      id: "executive_value",
      label: "Executive Value",
      value:
        monthlyValue == null
          ? "Not yet quantified"
          : `$${monthlyValue.toLocaleString()}`,
      status:
        monthlyValue == null ? "Pending evidence" : trendStatus(valueTrend),
      trend: monthlyValue == null ? "flat" : valueTrend,
      severity: monthlyValue == null ? "neutral" : trendSeverity(valueTrend),
      confidence: valueConfidence,
      href: "/reports",
      updatedLabel: updated,
    },
    {
      id: "strategic_outcomes",
      label: "Strategic Outcomes",
      value: outcomeTotal ? `${onTrack}/${outcomeTotal}` : "Not established",
      status: outcomeTotal
        ? onTrack >= Math.ceil(outcomeTotal / 2)
          ? "On track"
          : "Watching"
        : "Priorities pending",
      trend: outcomeTotal
        ? onTrack >= Math.ceil(outcomeTotal / 2)
          ? "up"
          : "down"
        : "flat",
      severity: outcomeTotal
        ? onTrack >= Math.ceil(outcomeTotal / 2)
          ? "positive"
          : "warning"
        : "neutral",
      confidence: snapshot.pulse.confidence,
      href: "/strategy?from=strategic_outcomes",
      updatedLabel: updated,
    },
    {
      id: "priority_decisions",
      label: "Priority Decisions",
      value: String(decisions),
      status: decisions > 0 ? "Waiting" : "Clear",
      trend: decisions > 2 ? "down" : decisions > 0 ? "flat" : "up",
      severity:
        decisions > 2 ? "critical" : decisions > 0 ? "warning" : "positive",
      confidence: 80,
      href: "/decisions?from=priority_decisions",
      updatedLabel: updated,
    },
    {
      id: "critical_risks",
      label: "Critical Risks",
      value: String(Math.min(9, risks)),
      status: risks >= 2 ? "High" : risks === 1 ? "Watch" : "Low",
      trend: risks >= 2 ? "down" : risks === 1 ? "flat" : "up",
      severity: risks >= 2 ? "critical" : risks === 1 ? "warning" : "positive",
      confidence: 75,
      href: "/decisions?from=critical_risks",
      updatedLabel: updated,
    },
    {
      id: "customer_health",
      label: "Customer Health",
      value: String(customerScore),
      status: customerScore >= 70 ? "Healthy" : "Watch",
      trend: customerScore >= 70 ? "up" : "down",
      severity: customerScore >= 70 ? "positive" : "warning",
      confidence: 70,
      href: "/knowledge?from=customer_health",
      updatedLabel: updated,
    },
    {
      id: "system_health",
      label: "System Health",
      value: String(systemScore),
      status: systemScore >= 80 ? "Healthy" : "Watch",
      trend: systemScore >= 80 ? "up" : "flat",
      severity: systemScore >= 80 ? "positive" : "warning",
      confidence: 85,
      href: "/administration",
      updatedLabel: updated,
    },
    {
      id: "people_health",
      label: "People Health",
      value: String(peopleScore),
      status:
        snapshot.executiveState.capacity === "available"
          ? "Available"
          : snapshot.executiveState.capacity === "constrained"
            ? "Constrained"
            : "Overdrawn",
      trend:
        snapshot.executiveState.capacity === "available"
          ? "up"
          : snapshot.executiveState.capacity === "overdrawn"
            ? "down"
            : "flat",
      severity:
        snapshot.executiveState.capacity === "available"
          ? "positive"
          : snapshot.executiveState.capacity === "overdrawn"
            ? "critical"
            : "warning",
      confidence: 72,
      href: "/team",
      updatedLabel: updated,
    },
    {
      id: "commercial_health",
      label: "Commercial Health",
      value: commercialSoft ? "Watch" : "Strong",
      status: focus === "Commercial" ? "Focus" : "Steady",
      trend: commercialSoft ? "down" : "up",
      severity: commercialSoft ? "warning" : "positive",
      confidence: snapshot.pulse.confidence,
      href: "/strategy?from=commercial_health",
      updatedLabel: updated,
    },
  ];
}

export function buildSnapshotCards(input: {
  snapshot: ExecutiveSnapshot;
}): McSnapshotCard[] {
  const { snapshot } = input;
  const focus = deriveTodaysFocus(snapshot);
  const lead = briefLine(buildLeadJudgementProse(snapshot), 14);
  const topAction = snapshot.recommendedActions[0];
  const riskAction =
    snapshot.recommendedActions.find((a) => a.potentialRisk) ??
    snapshot.recommendedActions[1];
  const riskOutcome = snapshot.outcomes.find(
    (o) => o.status === "at_risk" || o.status === "off_track",
  );

  const open = "Open →";

  const cards: McSnapshotCard[] = [
    {
      id: "lead",
      headline: "Lead Judgement",
      sentence: lead,
      impact: briefLine(snapshot.pulse.label, 6),
      href: "/strategy?from=priority",
      cta: open,
    },
    {
      id: "focus",
      headline: focus === "Commercial" ? "Commercial Capacity" : focus,
      sentence: briefLine(snapshot.pulse.why, 12),
      impact: briefLine(snapshot.executiveState.summary, 10),
      href:
        focus === "Risk"
          ? "/decisions?from=priority"
          : "/strategy?from=priority",
      cta: open,
    },
  ];

  if (topAction) {
    cards.push({
      id: "opportunity",
      headline: "Revenue Opportunity",
      sentence: briefLine(topAction.title, 10),
      impact: briefLine(
        topAction.expectedImpact ?? topAction.expectedOutcome,
        8,
      ),
      href: topAction.href,
      cta: open,
    });
  }

  const recommendation =
    snapshot.recommendedActions[1] &&
    snapshot.recommendedActions[1]?.id !== topAction?.id
      ? snapshot.recommendedActions[1]
      : topAction;
  if (recommendation) {
    const href = withDecisionEntry(
      recommendation.href || "/decisions",
      "priority",
    );
    cards.push({
      id: "recommendation",
      headline: "Executive Recommendation",
      sentence: briefLine(recommendation.why, 12),
      impact: briefLine(
        recommendation.supportsOutcome
          ? `Supports ${recommendation.supportsOutcome}`
          : recommendation.expectedOutcome,
        8,
      ),
      href,
      cta: open,
    });
  }

  const riskHref = withDecisionEntry(
    riskAction?.href || riskOutcome?.href || "/decisions",
    "priority",
  );
  cards.push({
    id: "risk",
    headline: "Critical Risk",
    sentence: briefLine(
      riskAction?.potentialRisk ||
        riskOutcome?.movementLabel ||
        "No critical risk elevated this morning.",
      12,
    ),
    impact: briefLine(
      riskAction?.title || riskOutcome?.name || "Risk posture steady",
      8,
    ),
    href: riskHref,
    cta: open,
  });

  if (!cards.some((c) => c.href.startsWith("/knowledge"))) {
    cards.splice(2, 0, {
      id: "evidence-trust",
      headline: "Evidence Trust",
      sentence: briefLine(
        `Confidence ${snapshot.pulse.confidence}%. ${snapshot.pulse.why}`,
        14,
      ),
      impact: briefLine("Trace recommendation to evidence", 8),
      href: "/knowledge?from=priority",
      cta: open,
    });
  }

  return cards.slice(0, 5);
}

export function buildExecutivePulse(input: {
  snapshot: ExecutiveSnapshot;
  valueTrend: McTrend;
}): McPulse {
  const { snapshot, valueTrend } = input;
  const health = orgHealthScore(snapshot);
  const decisions = snapshot.priorityDecisions.length;
  const risks = snapshot.outcomes.filter(
    (o) => o.status === "at_risk" || o.status === "off_track",
  ).length;

  const headline =
    snapshot.pulse.level === "critical"
      ? "Organisation Critical"
      : snapshot.pulse.level === "attention"
        ? "Organisation Attention"
        : health >= 70
          ? "Organisation Stable"
          : "Organisation Watching";

  const customerImproving =
    snapshot.pulse.level === "improving" || snapshot.pulse.confidence >= 72;

  const signals: McPulse["signals"] = [
    {
      id: "revenue",
      mark: valueTrend === "down" ? "down" : valueTrend === "up" ? "up" : "dot",
      text:
        valueTrend === "up"
          ? "Revenue improving"
          : valueTrend === "down"
            ? "Revenue softening"
            : "Revenue steady",
      severity: trendSeverity(valueTrend),
    },
    {
      id: "capacity",
      mark:
        snapshot.executiveState.capacity === "available"
          ? "up"
          : snapshot.executiveState.capacity === "overdrawn"
            ? "down"
            : "dot",
      text:
        snapshot.executiveState.capacity === "available"
          ? "Leadership capacity clear"
          : snapshot.executiveState.capacity === "constrained"
            ? "Leadership capacity constrained"
            : "Leadership capacity overdrawn",
      severity:
        snapshot.executiveState.capacity === "available"
          ? "positive"
          : snapshot.executiveState.capacity === "overdrawn"
            ? "critical"
            : "warning",
    },
  ];

  if (decisions > 0) {
    signals.push({
      id: "decision",
      mark: decisions > 1 ? "down" : "dot",
      text:
        decisions === 1
          ? "One critical decision waiting"
          : `${decisions} strategic decisions waiting`,
      severity: decisions > 1 ? "critical" : "warning",
    });
  } else if (risks > 0) {
    signals.push({
      id: "risk",
      mark: "down",
      text: risks === 1 ? "One outcome at risk" : `${risks} outcomes at risk`,
      severity: risks >= 2 ? "critical" : "warning",
    });
  } else {
    signals.push({
      id: "customer",
      mark: customerImproving ? "up" : "dot",
      text: customerImproving
        ? "Customer health improving"
        : "Customer health steady",
      severity: customerImproving ? "positive" : "neutral",
    });
  }

  return {
    headline,
    signals: signals.slice(0, 4),
    confidence: snapshot.pulse.confidence,
  };
}

export function buildActivityFeed(snapshot: ExecutiveSnapshot): McActivityItem[] {
  const base = new Date(snapshot.asOf);
  const items: McActivityItem[] = [];

  snapshot.sinceYesterday.slice(0, 4).forEach((update, index) => {
    const at = new Date(base.getTime() - index * 7 * 60_000);
    items.push({
      id: `overnight-${update.id}`,
      at: at.toISOString(),
      timeLabel: formatTime(at),
      headline: briefLine(update.sentence, 14),
      href: update.href || "/knowledge?from=activity",
    });
  });

  snapshot.priorityDecisions.slice(0, 3).forEach((decision, index) => {
    const at = new Date(base.getTime() - (index + 2) * 11 * 60_000);
    items.push({
      id: `decision-${decision.id}`,
      at: at.toISOString(),
      timeLabel: formatTime(at),
      headline: `Decision awaiting approval · ${briefLine(decision.title, 8)}`,
      href: `/decisions?from=activity&select=${encodeURIComponent(decision.id)}`,
    });
  });

  snapshot.recommendedActions.slice(0, 3).forEach((action, index) => {
    const at = new Date(base.getTime() - (index + 1) * 9 * 60_000);
    items.push({
      id: `action-${action.id}`,
      at: at.toISOString(),
      timeLabel: formatTime(at),
      headline: action.potentialRisk
        ? `Risk detected · ${briefLine(action.title, 8)}`
        : briefLine(action.title, 12),
      href: action.href,
    });
  });

  if (snapshot.pulse.level === "improving" || snapshot.pulse.confidence >= 70) {
    const at = new Date(base.getTime() - 3 * 60_000);
    items.push({
      id: "health-pulse",
      at: at.toISOString(),
      timeLabel: formatTime(at),
      headline: `Organisation Health ${snapshot.pulse.label.toLowerCase()}`,
      href: "/strategy?from=activity",
    });
  }

  const agenda = snapshot.executiveAgenda?.items.slice(0, 2) ?? [];
  agenda.forEach((item, index) => {
    const at = new Date(base.getTime() + (index + 1) * 25 * 60_000);
    items.push({
      id: `agenda-${item.id}`,
      at: at.toISOString(),
      timeLabel: formatTime(at),
      headline: briefLine(item.title, 12),
      href: "/calendar",
    });
  });

  return items
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 16);
}

export function missionHeaderModel(snapshot: ExecutiveSnapshot) {
  return {
    name: parseGreetingName(snapshot.greeting),
    health: orgHealthScore(snapshot),
    refreshedLabel: snapshot.pulse.refreshedLabel,
    asOf: snapshot.asOf,
  };
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/** Prefer Decision Workspace portfolio entry; keep deep L3 links intact. */
function withDecisionEntry(href: string, from: string): string {
  if (href.startsWith("/decisions/") && href !== "/decisions/") {
    return href.includes("?") ? href : `${href}`;
  }
  if (href.startsWith("/decisions")) {
    const url = new URL(href, "http://local");
    url.searchParams.set("from", from);
    return `${url.pathname}?${url.searchParams.toString()}`;
  }
  return href;
}
