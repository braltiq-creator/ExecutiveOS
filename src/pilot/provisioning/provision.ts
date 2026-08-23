/**
 * One-click Design Partner tenant provisioning.
 */

import { registerTenant } from "@/runtime/tenant";
import { selectTenantIntelligenceProfile } from "@/profiles";
import {
  buildTenantFromTemplate,
  getTenantTemplate,
} from "@/pilot/tenant-templates";
import {
  advancePilotStage,
  createPilotRecord,
} from "@/pilot/deployment";
import { buildProviderChecklists } from "@/pilot/checklists";
import type {
  PilotRecord,
  ProvisionPilotInput,
  ProvisionPilotResult,
} from "@/pilot/types";

const pilots = new Map<string, PilotRecord>();

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

export function provisionDesignPartner(
  input: ProvisionPilotInput,
): ProvisionPilotResult {
  const asOf = input.asOf ?? new Date().toISOString();
  const slug = input.tenantSlug ?? slugify(input.partnerName);
  const tenantId = `tenant-${slug}`;
  const template = getTenantTemplate(
    input.intelligenceProfileId,
    input.focusModule,
  );
  const region = input.region ?? "au";
  const environment = input.environment ?? "pilot";
  const seats = input.seats ?? 10;

  const tenant = buildTenantFromTemplate({
    tenantId,
    slug,
    partnerName: input.partnerName,
    industry: input.industry || template.industryDefault,
    region,
    environment,
    seats,
    template,
    asOf,
  });
  registerTenant(tenant);

  selectTenantIntelligenceProfile({
    tenantId,
    profileId: input.intelligenceProfileId,
    source: "manual",
    recommendedProfileId: input.intelligenceProfileId,
    explanation: `Provisioned with ${template.name}`,
    asOf,
  });

  let pilot = createPilotRecord({
    id: `pilot-${slug}`,
    tenantId,
    organisationId: tenant.organisationId,
    partnerName: input.partnerName,
    industry: input.industry || template.industryDefault,
    intelligenceProfileId: input.intelligenceProfileId,
    environment,
    region,
    administratorEmail: input.administratorEmail,
    asOf,
    pilotStartedAt: input.pilotStartedAt ?? null,
    focusModule: input.focusModule ?? null,
    retentionConfigured: false,
    retentionAuditDays: tenant.retention.auditDays,
  });
  pilot = advancePilotStage(pilot, "invited", asOf, "Invitation issued");
  pilot = advancePilotStage(
    pilot,
    "provisioning",
    asOf,
    "Tenant provisioned from template",
  );
  pilots.set(pilot.id, pilot);

  const checklist = buildProviderChecklists({
    tenantId,
    profileId: input.intelligenceProfileId,
    asOf,
  });

  return {
    pilot,
    tenantId,
    checklist,
    playbookId:
      input.focusModule === "manufacturing_forecasting"
        ? "playbook-manufacturing-forecasting"
        : input.intelligenceProfileId === "commercial_executive"
          ? "playbook-commercial-executive"
          : "playbook-operations-executive",
    message: `Provisioned ${input.partnerName} as ${template.name}`,
  };
}

export function getPilot(pilotId: string): PilotRecord | undefined {
  return pilots.get(pilotId);
}

export function getPilotByTenant(tenantId: string): PilotRecord | undefined {
  return [...pilots.values()].find((p) => p.tenantId === tenantId);
}

/** Bind Pilot Day N to the organisation on the active Executive Snapshot. */
export function getPilotByOrganisation(
  organisationId: string,
): PilotRecord | undefined {
  const direct = [...pilots.values()].find(
    (p) => p.organisationId === organisationId,
  );
  if (direct) return direct;
  return getPilotByTenant(organisationId);
}

export function listPilots(): PilotRecord[] {
  return [...pilots.values()];
}

export function savePilot(pilot: PilotRecord): PilotRecord {
  pilots.set(pilot.id, pilot);
  return pilot;
}

export function resetPilotRegistry(): void {
  pilots.clear();
}

/**
 * Start the 30-day pilot clock. Does not invent a date — caller must supply it.
 */
export function markPilotStarted(input: {
  pilotId: string;
  startedAt: string;
}): PilotRecord | null {
  const existing = pilots.get(input.pilotId);
  if (!existing) return null;
  if (existing.pilotStartedAt) return existing;
  const next: PilotRecord = {
    ...existing,
    pilotStartedAt: input.startedAt,
    updatedAt: input.startedAt,
    notes: [
      ...existing.notes,
      `${input.startedAt}: Pilot clock started (Day 1 of 30).`,
    ],
  };
  pilots.set(next.id, next);
  return next;
}

export function updatePilotStage(input: {
  pilotId: string;
  stage: PilotRecord["stage"];
  asOf?: string;
  note?: string;
}): PilotRecord | null {
  const existing = pilots.get(input.pilotId);
  if (!existing) return null;
  const next = advancePilotStage(
    existing,
    input.stage,
    input.asOf ?? new Date().toISOString(),
    input.note,
  );
  pilots.set(next.id, next);
  return next;
}
