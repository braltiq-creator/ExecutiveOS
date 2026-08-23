/**
 * Presentation copy helpers for Executive Snapshot v2.2.
 * No Core / data-model changes — narrative packaging only.
 */

import type { ExecutiveSnapshot } from "@/lib/snapshot/types";

export function parseGreetingName(greeting: string): string {
  const match = greeting.match(/,\s*(.+)$/);
  return match?.[1]?.trim() || "Executive";
}

export function estimateReviewMinutes(snapshot: ExecutiveSnapshot): number {
  const metric = snapshot.metrics.find((m) => m.id === "review_time");
  if (metric?.numericValue != null && metric.numericValue > 0) {
    return Math.max(3, Math.min(18, Math.round(metric.numericValue)));
  }
  const decisions = Math.min(3, snapshot.priorityDecisions.length);
  const actions = Math.min(5, snapshot.recommendedActions.length);
  const insights = Math.min(3, snapshot.sinceYesterday.length);
  return Math.max(4, Math.min(12, 3 + decisions + Math.ceil(actions / 2) + insights));
}

export function countJudgementAreas(snapshot: ExecutiveSnapshot): number {
  let areas = 0;
  if (snapshot.priorityDecisions.length > 0) areas += 1;
  if (snapshot.recommendedActions.length > 0) areas += 1;
  if (
    snapshot.outcomes.some(
      (o) => o.status === "at_risk" || o.status === "off_track",
    )
  ) {
    areas += 1;
  }
  if (areas === 0) areas = snapshot.pulse.level === "stable" ? 1 : 2;
  return Math.min(3, areas);
}

export function dayPartLabel(asOf: string): string {
  const hour = new Date(asOf).getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/** Cap lead judgement prose at ~120 words for snapshot discipline. */
export function clampWords(text: string, maxWords = 120): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text.trim();
  return `${words.slice(0, maxWords).join(" ")}…`;
}

export function buildLeadJudgementProse(snapshot: ExecutiveSnapshot): string {
  const parts = [snapshot.pulse.why, snapshot.executiveState.summary].filter(
    Boolean,
  );
  return clampWords(parts.join(" "));
}

export function evidenceSourcesLabel(snapshot: ExecutiveSnapshot): string {
  const sources: string[] = [];
  if (snapshot.sinceYesterday.length > 0) sources.push("Overnight signals");
  if (snapshot.outcomes.length > 0) sources.push("Strategic outcomes");
  if (snapshot.recommendedActions.length > 0) sources.push("Recommendations");
  if (snapshot.executiveAgenda || snapshot.executiveContext) {
    sources.push("Calendar context");
  }
  if (sources.length === 0) sources.push("Executive signals");
  return sources.slice(0, 3).join(" · ");
}
