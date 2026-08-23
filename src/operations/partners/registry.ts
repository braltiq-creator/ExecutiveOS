/**
 * Design Partner operational records (CS metadata — not tenant business data).
 */

import { listPilots, getPilotByTenant } from "@/pilot";
import type { DesignPartnerOpsRecord } from "@/operations/types";

const partners = new Map<string, DesignPartnerOpsRecord>();

export function resetPartnerOpsRegistry(): void {
  partners.clear();
}

export function getPartnerOpsRecord(
  tenantId: string,
): DesignPartnerOpsRecord | undefined {
  return partners.get(tenantId);
}

export function listPartnerOpsRecords(): DesignPartnerOpsRecord[] {
  return [...partners.values()];
}

export function upsertPartnerOpsRecord(
  input: Partial<DesignPartnerOpsRecord> & {
    tenantId: string;
    companyName: string;
    intelligenceProfileId: DesignPartnerOpsRecord["intelligenceProfileId"];
    industry: string;
  },
): DesignPartnerOpsRecord {
  const existing = partners.get(input.tenantId);
  const asOf = input.updatedAt ?? new Date().toISOString();
  const next: DesignPartnerOpsRecord = {
    id: existing?.id ?? `ops-${input.tenantId}`,
    tenantId: input.tenantId,
    companyName: input.companyName,
    intelligenceProfileId: input.intelligenceProfileId,
    industry: input.industry,
    customerSuccessManager:
      input.customerSuccessManager ??
      existing?.customerSuccessManager ??
      "Unassigned",
    implementationOwner:
      input.implementationOwner ??
      existing?.implementationOwner ??
      "Unassigned",
    technicalContact:
      input.technicalContact ?? existing?.technicalContact ?? "Unassigned",
    executiveSponsor:
      input.executiveSponsor ?? existing?.executiveSponsor ?? "Unassigned",
    nextReviewDate:
      input.nextReviewDate !== undefined
        ? input.nextReviewDate
        : (existing?.nextReviewDate ?? null),
    successPlan:
      input.successPlan ??
      existing?.successPlan ??
      "Establish first Executive Brief and weekly engagement cadence.",
    outstandingRisks:
      input.outstandingRisks ?? existing?.outstandingRisks ?? [],
    lastExecutiveLoginAt:
      input.lastExecutiveLoginAt !== undefined
        ? input.lastExecutiveLoginAt
        : (existing?.lastExecutiveLoginAt ?? null),
    createdAt: existing?.createdAt ?? asOf,
    updatedAt: asOf,
  };
  partners.set(input.tenantId, next);
  return next;
}

/** Sync operational shells from Pilot Readiness Toolkit (metadata only). */
export function syncPartnersFromPilots(asOf = new Date().toISOString()): DesignPartnerOpsRecord[] {
  const pilots = listPilots();
  for (const pilot of pilots) {
    upsertPartnerOpsRecord({
      tenantId: pilot.tenantId,
      companyName: pilot.partnerName,
      intelligenceProfileId: pilot.intelligenceProfileId,
      industry: pilot.industry,
      updatedAt: asOf,
      technicalContact: pilot.administratorEmail,
    });
  }
  return listPartnerOpsRecords();
}

export function ensurePartnerForTenant(
  tenantId: string,
  asOf = new Date().toISOString(),
): DesignPartnerOpsRecord | null {
  const existing = partners.get(tenantId);
  if (existing) return existing;
  const pilot = getPilotByTenant(tenantId);
  if (!pilot) return null;
  return upsertPartnerOpsRecord({
    tenantId,
    companyName: pilot.partnerName,
    intelligenceProfileId: pilot.intelligenceProfileId,
    industry: pilot.industry,
    technicalContact: pilot.administratorEmail,
    updatedAt: asOf,
  });
}
