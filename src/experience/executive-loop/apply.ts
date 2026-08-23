/**
 * Apply loop state onto Mission Control presentation models.
 */

import type {
  McActivityItem,
  McKpi,
  McPulse,
} from "@/experience/mission-control/types";
import type {
  LoopMemory,
  LoopState,
} from "@/experience/executive-loop/types";

export function applyLoopToKpis(
  kpis: McKpi[],
  loop: LoopState,
): McKpi[] {
  if (loop.impacts.length === 0) return kpis;

  const latest = loop.impacts[0]!;
  const stamp = new Date(loop.lastRecalculatedAt ?? latest.approvedAt);
  const updatedLabel = stamp.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return kpis.map((kpi) => {
    const changed = loop.changedKpiIds.includes(kpi.id);
    if (kpi.id === "organisation_health") {
      return {
        ...kpi,
        value: String(latest.healthAfter),
        status: "Improving",
        trend: "up" as const,
        severity: "positive" as const,
        confidence: Math.min(99, kpi.confidence + loop.confidenceBoost),
        updatedLabel,
        changed,
      };
    }
    if (kpi.id === "executive_intelligence") {
      const next = Math.min(99, Number(kpi.value) + loop.confidenceBoost + 2);
      return {
        ...kpi,
        value: String(next),
        status: "Improving",
        trend: "up" as const,
        severity: "positive" as const,
        confidence: Math.min(99, kpi.confidence + loop.confidenceBoost),
        updatedLabel,
        changed: true,
      };
    }
    if (kpi.id === "executive_value") {
      const base = Number(kpi.value.replace(/[^0-9.-]/g, "")) || 0;
      const next = base + loop.valueDeltaCumulative;
      return {
        ...kpi,
        value: `$${next.toLocaleString()}`,
        status: "Improving",
        trend: "up" as const,
        severity: "positive" as const,
        updatedLabel,
        changed,
      };
    }
    if (kpi.id === "priority_decisions") {
      const n = Math.max(0, Number(kpi.value) - loop.impacts.length);
      return {
        ...kpi,
        value: String(n),
        status: n > 0 ? "Waiting" : "Clear",
        trend: n > 0 ? "flat" : "up",
        severity: n > 0 ? "warning" : "positive",
        updatedLabel,
        changed,
      };
    }
    if (kpi.id === "commercial_health") {
      return {
        ...kpi,
        value: "Strong",
        status: "Improving",
        trend: "up" as const,
        severity: "positive" as const,
        updatedLabel,
        changed,
      };
    }
    return { ...kpi, changed: false };
  });
}

export function applyLoopToPulse(
  pulse: McPulse,
  loop: LoopState,
): McPulse {
  if (loop.impacts.length === 0) return pulse;

  const signals: McPulse["signals"] = [
    {
      id: "loop-yesterday",
      mark: "up",
      text: "Yesterday's decisions improved Organisation Health",
      severity: "positive",
    },
    {
      id: "loop-commercial",
      mark: "up",
      text: "Commercial momentum increasing",
      severity: "positive",
    },
    {
      id: "loop-risk",
      mark: "dot",
      text:
        loop.impacts.length > 2
          ? "One new strategic risk detected"
          : "Strategic risk contained",
      severity: loop.impacts.length > 2 ? "warning" : "neutral",
    },
    {
      id: "loop-opp",
      mark: "up",
      text: "Three high-value opportunities emerging",
      severity: "positive",
    },
  ];

  return {
    headline: "Organisation Improving",
    confidence: Math.min(99, pulse.confidence + loop.confidenceBoost),
    signals: signals.slice(0, 4),
  };
}

export function applyLoopToFeed(
  feed: McActivityItem[],
  loop: LoopState,
): McActivityItem[] {
  if (loop.feedEvents.length === 0) return feed;
  const loopItems: McActivityItem[] = loop.feedEvents.map((e) => ({
    id: e.id,
    at: e.at,
    timeLabel: e.timeLabel,
    headline: e.headline,
    href: e.href,
    highlight: true,
  }));
  return [...loopItems, ...feed]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 20);
}

export function buildLoopMemory(loop: LoopState): LoopMemory | null {
  if (loop.impacts.length === 0) return null;
  const latest = loop.impacts[0]!;
  return {
    yesterday: loop.impacts.slice(0, 3).map((i) => ({
      decisionTitle: `${i.decisionTitle} approved`,
      href: `/decisions/${i.decisionId}`,
    })),
    today: [
      {
        label: "Commercial Health",
        value: "improved",
      },
      {
        label: "Executive Value",
        value: `+£${loop.valueDeltaCumulative.toLocaleString()}`,
      },
      {
        label: "Organisation Health",
        value: `+${loop.healthDeltaCumulative}`,
      },
      {
        label: "Latest",
        value: `${latest.healthBefore} → ${latest.healthAfter}`,
      },
    ],
  };
}

export function loopHealthOverride(
  baseHealth: number,
  loop: LoopState,
): number {
  if (loop.impacts.length === 0) return baseHealth;
  return loop.impacts[0]!.healthAfter;
}
