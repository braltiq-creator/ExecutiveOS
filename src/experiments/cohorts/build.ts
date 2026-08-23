import type { IntelligenceProfileId } from "@/profiles";
import { listPilots } from "@/pilot";
import type {
  CohortAnalytics,
  CohortId,
  PilotIntelligenceSnapshot,
} from "@/experiments/framework/types";
import { measurePilotIntelligence } from "@/experiments/pilot-intelligence";
import { countBehaviourEvents } from "@/experiments/behaviour";

function cohortForPilot(stage: string, profileId: IntelligenceProfileId): CohortId[] {
  const ids: CohortId[] = [profileId];
  if (
    stage === "prospect" ||
    stage === "invited" ||
    stage === "provisioning" ||
    stage === "connecting_providers" ||
    stage === "executive_discovery"
  ) {
    ids.push("early_stage");
  }
  if (stage === "active_pilot" || stage === "first_executive_brief") {
    ids.push("active_pilot");
  }
  if (stage === "review" || stage === "pilot_complete") {
    ids.push("review_stage");
  }
  return ids;
}

const LABELS: Record<CohortId, string> = {
  operations_executive: "Operations Executive",
  commercial_executive: "Commercial Executive",
  early_stage: "Early-stage pilots",
  active_pilot: "Active pilots",
  review_stage: "Review / complete",
};

function effectivenessPct(tenantId: string, acceptance: number): number {
  const ignores = countBehaviourEvents({
    tenantId,
    kind: "recommendation_ignore",
  });
  const accepts = countBehaviourEvents({
    tenantId,
    kind: "recommendation_accept",
  });
  if (accepts + ignores === 0) return acceptance;
  return Math.round((accepts / Math.max(1, accepts + ignores)) * 100);
}

export function buildCohortAnalytics(
  asOf?: string,
  intelligence?: PilotIntelligenceSnapshot[],
): CohortAnalytics[] {
  const pilots = listPilots();
  const snapByTenant = new Map<string, PilotIntelligenceSnapshot>();

  if (intelligence) {
    for (const snap of intelligence) {
      snapByTenant.set(snap.tenantId, snap);
    }
  }

  const buckets = new Map<
    CohortId,
    {
      tenants: Array<{ tenantId: string; profileId: IntelligenceProfileId }>;
    }
  >();

  for (const id of Object.keys(LABELS) as CohortId[]) {
    buckets.set(id, { tenants: [] });
  }

  for (const pilot of pilots) {
    for (const cohortId of cohortForPilot(
      pilot.stage,
      pilot.intelligenceProfileId,
    )) {
      buckets.get(cohortId)?.tenants.push({
        tenantId: pilot.tenantId,
        profileId: pilot.intelligenceProfileId,
      });
    }
  }

  return (Object.keys(LABELS) as CohortId[]).map((cohortId) => {
    const tenants = buckets.get(cohortId)?.tenants ?? [];
    if (tenants.length === 0) {
      return {
        cohortId,
        label: LABELS[cohortId],
        partnerCount: 0,
        activationPct: 0,
        retentionPct: 0,
        engagementPct: 0,
        recommendationEffectivenessPct: 0,
        explanation: "No Design Partners currently in this cohort.",
      };
    }

    const snapshots = tenants.map((t) => {
      const cached = snapByTenant.get(t.tenantId);
      if (cached) return cached;
      const measured = measurePilotIntelligence({ ...t, asOf });
      snapByTenant.set(t.tenantId, measured);
      return measured;
    });

    const avg = (values: number[]) =>
      Math.round(values.reduce((a, b) => a + b, 0) / values.length);

    const activationPct = avg(
      snapshots.map((s) => s.metrics.executiveAdoption.value),
    );
    const retentionPct = avg(
      snapshots.map((s) => s.metrics.executiveEngagement.value),
    );
    const recommendationEffectivenessPct = avg(
      snapshots.map((s) =>
        effectivenessPct(
          s.tenantId,
          s.metrics.recommendationAcceptance.value,
        ),
      ),
    );

    return {
      cohortId,
      label: LABELS[cohortId],
      partnerCount: tenants.length,
      activationPct,
      retentionPct,
      engagementPct: retentionPct,
      recommendationEffectivenessPct,
      explanation: `Cohort aggregates ${tenants.length} partner(s) using anonymised adoption, engagement, and recommendation effectiveness.`,
    };
  });
}
