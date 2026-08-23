/**
 * Strategic outcome registry — portable across tenants, never shared.
 */

import type { IntelligenceProfileId } from "@/profiles";
import type {
  StrategicImportance,
  StrategicOutcome,
  StrategicOutcomeHealth,
} from "@/strategy/framework/types";

const outcomes = new Map<string, StrategicOutcome>();

export function resetStrategicOutcomes(): void {
  outcomes.clear();
}

export function listStrategicOutcomes(tenantId: string): StrategicOutcome[] {
  return [...outcomes.values()]
    .filter((o) => o.tenantId === tenantId)
    .sort((a, b) => importanceRank(b.strategicImportance) - importanceRank(a.strategicImportance));
}

export function getStrategicOutcome(id: string): StrategicOutcome | undefined {
  return outcomes.get(id);
}

function importanceRank(i: StrategicImportance): number {
  return { critical: 4, high: 3, moderate: 2, supporting: 1 }[i];
}

export function upsertStrategicOutcome(
  input: Partial<StrategicOutcome> & {
    tenantId: string;
    name: string;
    profileId: IntelligenceProfileId;
  },
): StrategicOutcome {
  const asOf = input.updatedAt ?? new Date().toISOString();
  const id =
    input.id ??
    `sout-${input.tenantId}-${input.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 40)}`;
  const existing = outcomes.get(id);
  const next: StrategicOutcome = {
    id,
    tenantId: input.tenantId,
    name: input.name,
    description: input.description ?? existing?.description ?? input.name,
    executiveOwner:
      input.executiveOwner ?? existing?.executiveOwner ?? "Executive Sponsor",
    profileId: input.profileId,
    targetDate:
      input.targetDate !== undefined
        ? input.targetDate
        : (existing?.targetDate ?? null),
    currentHealth: input.currentHealth ?? existing?.currentHealth ?? "watching",
    confidence: input.confidence ?? existing?.confidence ?? 55,
    successMeasures:
      input.successMeasures ?? existing?.successMeasures ?? [],
    supportingKpis: input.supportingKpis ?? existing?.supportingKpis ?? [],
    businessCapabilities:
      input.businessCapabilities ?? existing?.businessCapabilities ?? [],
    strategicImportance:
      input.strategicImportance ?? existing?.strategicImportance ?? "high",
    dependencyIds: input.dependencyIds ?? existing?.dependencyIds ?? [],
    evidence: input.evidence ?? existing?.evidence ?? [],
    source: input.source ?? existing?.source ?? "manual",
    createdAt: existing?.createdAt ?? asOf,
    updatedAt: asOf,
  };
  outcomes.set(id, next);
  return next;
}

export function updateStrategicOutcomeHealth(input: {
  id: string;
  health: StrategicOutcomeHealth;
  confidence?: number;
  evidence?: string[];
}): StrategicOutcome | null {
  const existing = outcomes.get(input.id);
  if (!existing) return null;
  const next: StrategicOutcome = {
    ...existing,
    currentHealth: input.health,
    confidence: input.confidence ?? existing.confidence,
    evidence: input.evidence
      ? [...existing.evidence, ...input.evidence].slice(-20)
      : existing.evidence,
    updatedAt: new Date().toISOString(),
  };
  outcomes.set(next.id, next);
  return next;
}

/** Seed from Discovery: three most important strategic outcomes. */
export function seedStrategicOutcomesFromDiscovery(input: {
  tenantId: string;
  profileId: IntelligenceProfileId;
  names: string[];
  owner?: string;
  asOf?: string;
}): StrategicOutcome[] {
  const asOf = input.asOf ?? new Date().toISOString();
  const target = new Date(asOf);
  target.setFullYear(target.getFullYear() + 1);
  const targetDate = target.toISOString().slice(0, 10);

  return input.names
    .map((name) => name.trim())
    .filter(Boolean)
    .slice(0, 3)
    .map((name, index) =>
      upsertStrategicOutcome({
        tenantId: input.tenantId,
        name,
        profileId: input.profileId,
        description: `Strategic outcome declared during Executive Discovery: ${name}`,
        executiveOwner: input.owner ?? "Executive Sponsor",
        targetDate,
        currentHealth: "watching",
        confidence: 50,
        successMeasures: [`Progress toward ${name}`],
        supportingKpis: [],
        businessCapabilities: [],
        strategicImportance: index === 0 ? "critical" : "high",
        evidence: ["Declared in Executive Discovery"],
        source: "discovery",
        updatedAt: asOf,
      }),
    );
}

/** Refine outcomes over time from observed behaviour (non-Core). */
export function refineStrategicOutcomeFromSignals(input: {
  id: string;
  evidence: string[];
  health?: StrategicOutcomeHealth;
  confidenceDelta?: number;
}): StrategicOutcome | null {
  const existing = outcomes.get(input.id);
  if (!existing) return null;
  return upsertStrategicOutcome({
    ...existing,
    currentHealth: input.health ?? existing.currentHealth,
    confidence: Math.max(
      0,
      Math.min(100, existing.confidence + (input.confidenceDelta ?? 2)),
    ),
    evidence: [...existing.evidence, ...input.evidence].slice(-20),
    source: "refined",
  });
}
