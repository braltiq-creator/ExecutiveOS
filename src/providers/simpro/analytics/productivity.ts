/**
 * Operational analytics — field productivity and utilisation helpers.
 */

import type { OperationalHealthLevel } from "@/providers/simpro/executive-context/types";

export function computeFieldProductivity(input: {
  availableTechnicians: number;
  unavailableTechnicians: number;
  openJobs: number;
  completedToday: number;
  overtimeHours: number;
  productiveHours: number;
}): {
  level: OperationalHealthLevel;
  label: string;
  utilisationPct: number;
  overtimeHours: number;
  detail: string;
} {
  const headcount = Math.max(
    1,
    input.availableTechnicians + input.unavailableTechnicians,
  );
  const utilisationPct = Math.min(
    100,
    Math.round(
      (input.productiveHours / Math.max(1, headcount * 8)) * 100 ||
        (input.openJobs / (headcount * 3)) * 100,
    ),
  );
  let level: OperationalHealthLevel = "healthy";
  if (utilisationPct >= 95 || input.overtimeHours >= 8) level = "strained";
  else if (utilisationPct >= 80 || input.overtimeHours > 0) level = "watch";

  return {
    level,
    label:
      level === "healthy"
        ? "Field productivity steady"
        : level === "watch"
          ? "Field productivity elevated"
          : "Field productivity strained",
    utilisationPct,
    overtimeHours: input.overtimeHours,
    detail: `${utilisationPct}% utilised · ${input.overtimeHours}h overtime · ${input.completedToday} completed`,
  };
}

export function computeServicePerformance(input: {
  openJobs: number;
  criticalJobs: number;
  completedToday: number;
  delayedJobs: number;
}): {
  level: OperationalHealthLevel;
  label: string;
  completedToday: number;
  criticalOpen: number;
  onTimePct: number;
  detail: string;
} {
  const denom = Math.max(1, input.openJobs + input.completedToday);
  const onTimePct = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        ((denom - input.delayedJobs - input.criticalJobs) / denom) * 100,
      ),
    ),
  );
  let level: OperationalHealthLevel = "healthy";
  if (input.criticalJobs >= 2 || onTimePct < 60) level = "strained";
  else if (input.criticalJobs > 0 || onTimePct < 80) level = "watch";

  return {
    level,
    label:
      level === "healthy"
        ? "Service performance on track"
        : level === "watch"
          ? "Service performance on watch"
          : "Service performance strained",
    completedToday: input.completedToday,
    criticalOpen: input.criticalJobs,
    onTimePct,
    detail: `${onTimePct}% on-time signal · ${input.criticalJobs} critical open · ${input.completedToday} delivered`,
  };
}

export function computeOperationalOpportunities(input: {
  acceptedQuotesValue: number;
  availableTechnicians: number;
  openJobs: number;
}): Array<{
  id: string;
  title: string;
  detail: string;
  relatedEntityIds: string[];
}> {
  const items: Array<{
    id: string;
    title: string;
    detail: string;
    relatedEntityIds: string[];
  }> = [];
  if (input.acceptedQuotesValue > 0 && input.availableTechnicians > 0) {
    items.push({
      id: "opp-convert-capacity",
      title: "Convert accepted work with available capacity",
      detail: `$${input.acceptedQuotesValue.toLocaleString()} accepted with ${input.availableTechnicians} technician(s) available.`,
      relatedEntityIds: [],
    });
  }
  if (input.openJobs > 0 && input.availableTechnicians > input.openJobs) {
    items.push({
      id: "opp-clear-backlog",
      title: "Clear service backlog while capacity is free",
      detail: "Available field capacity exceeds open commitments.",
      relatedEntityIds: [],
    });
  }
  return items;
}
