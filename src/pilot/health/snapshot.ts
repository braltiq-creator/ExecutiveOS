/**
 * Operational health snapshot for a Design Partner pilot.
 */

import type { IntelligenceProfileId } from "@/profiles";
import { buildValidationSuite } from "@/validation";
import type { DesignPartnerDashboard } from "@/validation";
import { getPilotByTenant } from "@/pilot/provisioning";
import { buildProviderChecklists, requiredProvidersConnected } from "@/pilot/checklists";
import { computePilotReadinessScore } from "@/pilot/readiness";
import { diagnosePilot } from "@/pilot/diagnostics";
import { measurePilotSuccess } from "@/pilot/success";
import type { PilotHealthSnapshot } from "@/pilot/types";

export function buildPilotHealthSnapshot(input: {
  tenantId: string;
  profileId: IntelligenceProfileId;
  asOf?: string;
  suite?: DesignPartnerDashboard;
}): PilotHealthSnapshot {
  const asOf = input.asOf ?? new Date().toISOString();
  const pilot = getPilotByTenant(input.tenantId);
  const suite =
    input.suite ?? buildValidationSuite({ tenantId: input.tenantId, asOf });
  const checklist = buildProviderChecklists({
    tenantId: input.tenantId,
    profileId: input.profileId,
    asOf,
  });
  const readiness = computePilotReadinessScore({
    ...input,
    asOf,
    suite,
    checklists: checklist,
  });
  const providers = requiredProvidersConnected(checklist);
  return {
    tenantId: input.tenantId,
    asOf,
    lifecycleStage: pilot?.stage ?? "prospect",
    readiness,
    diagnostics: diagnosePilot({
      ...input,
      asOf,
      suite,
      checklists: checklist,
    }),
    checklist,
    success: measurePilotSuccess({
      ...input,
      asOf,
      suite,
      readiness,
    }),
    providersHealthy: providers.connected,
    providersRequired: providers.required,
  };
}
