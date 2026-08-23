/**
 * Validation history — daily / weekly / monthly maturity trends.
 */

import type { ValidationHistory, ValidationHistoryPoint } from "@/validation/types";

const historyStore = new Map<string, ValidationHistoryPoint[]>();

export function resetValidationHistory(): void {
  historyStore.clear();
}

export function recordHistoryPoint(
  tenantId: string,
  point: ValidationHistoryPoint,
): void {
  const list = historyStore.get(tenantId) ?? [];
  list.push(point);
  historyStore.set(tenantId, list.slice(-120));
}

export function buildValidationHistory(input: {
  tenantId: string;
  seedIfEmpty?: boolean;
  current?: ValidationHistoryPoint;
}): ValidationHistory {
  let points = historyStore.get(input.tenantId) ?? [];

  if (input.current) {
    recordHistoryPoint(input.tenantId, input.current);
    points = historyStore.get(input.tenantId) ?? [];
  }

  if (points.length === 0 && input.seedIfEmpty !== false) {
    points = seedHistory(input.tenantId);
    historyStore.set(input.tenantId, points);
  }

  const daily = points.slice(-14);
  const weekly = aggregate(points, 7).slice(-12);
  const monthly = aggregate(points, 30).slice(-12);

  return {
    tenantId: input.tenantId,
    daily,
    weekly,
    monthly,
  };
}

function aggregate(
  points: ValidationHistoryPoint[],
  windowDays: number,
): ValidationHistoryPoint[] {
  if (points.length === 0) return [];
  const buckets = new Map<string, ValidationHistoryPoint[]>();
  for (const point of points) {
    const day = new Date(point.at);
    const key =
      windowDays >= 30
        ? `${day.getUTCFullYear()}-${day.getUTCMonth()}`
        : `${day.getUTCFullYear()}-W${Math.floor(day.getUTCDate() / windowDays)}-${day.getUTCMonth()}`;
    const list = buckets.get(key) ?? [];
    list.push(point);
    buckets.set(key, list);
  }
  return [...buckets.values()].map((group) => {
    const last = group[group.length - 1]!;
    const avg = (fn: (p: ValidationHistoryPoint) => number) =>
      Math.round(group.reduce((s, p) => s + fn(p), 0) / group.length);
    return {
      at: last.at,
      overallScore: avg((p) => p.overallScore),
      organisationCoverage: avg((p) => p.organisationCoverage),
      knowledgeGraphEntities: avg((p) => p.knowledgeGraphEntities),
      recommendationUsefulness: avg((p) => p.recommendationUsefulness),
      confidence: avg((p) => p.confidence),
    };
  });
}

function seedHistory(tenantId: string): ValidationHistoryPoint[] {
  void tenantId;
  const base = new Date("2026-07-12T08:00:00.000Z").getTime();
  return Array.from({ length: 14 }, (_, i) => {
    const progress = i / 13;
    return {
      at: new Date(base + i * 86_400_000).toISOString(),
      overallScore: Math.round(38 + progress * 28),
      organisationCoverage: Math.round(30 + progress * 35),
      knowledgeGraphEntities: Math.round(8 + progress * 40),
      recommendationUsefulness: Math.round(40 + progress * 30),
      confidence: Math.round(35 + progress * 32),
    };
  });
}
