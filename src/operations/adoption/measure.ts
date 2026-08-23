/**
 * Adoption measurement from isolation-safe telemetry.
 */

import type { IntelligenceProfileId } from "@/profiles";
import {
  extractTenantTelemetry,
  trafficLightFromScore,
} from "@/operations/isolation";
import type { AdoptionSnapshot } from "@/operations/types";

export function measureAdoption(input: {
  tenantId: string;
  profileId: IntelligenceProfileId;
  asOf?: string;
}): AdoptionSnapshot {
  const asOf = input.asOf ?? new Date().toISOString();
  const t = extractTenantTelemetry({ ...input, asOf });
  const providersConnectedPct =
    t.providersRequired === 0
      ? 0
      : Math.round((t.providersHealthy / t.providersRequired) * 100);
  const briefAdoptionPct = Math.min(100, t.morningBriefOpens * 10);
  const validationAdoptionPct = t.validationProgressPct;
  const score = Math.round(
    providersConnectedPct * 0.4 +
      briefAdoptionPct * 0.3 +
      validationAdoptionPct * 0.3,
  );
  const modulesInUse =
    (providersConnectedPct > 0 ? 1 : 0) +
    (briefAdoptionPct > 20 ? 1 : 0) +
    (validationAdoptionPct > 40 ? 1 : 0) +
    (t.recommendationsViewed > 0 ? 1 : 0);

  return {
    tenantId: input.tenantId,
    asOf,
    score,
    trafficLight: trafficLightFromScore(score),
    modulesInUse,
    providersConnectedPct,
    briefAdoptionPct,
    validationAdoptionPct,
    explanation: `Adoption ${score}/100 — providers ${providersConnectedPct}%, briefs ${briefAdoptionPct}%, validation ${validationAdoptionPct}%.`,
    evidence: [
      `${modulesInUse} modules in use`,
      `${t.providersHealthy}/${t.providersRequired} providers`,
    ],
  };
}
