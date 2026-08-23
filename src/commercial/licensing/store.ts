import type {
  CommercialEditionId,
  CommercialLicense,
  LicenseTier,
  LicenseEntitlements,
} from "@/commercial/framework/types";
import { getEdition } from "@/commercial/editions";

const licenses = new Map<string, CommercialLicense>();
let seq = 0;

const TIER_DEFAULTS: Record<
  LicenseTier,
  Omit<LicenseEntitlements, "providerEntitlements" | "featureEntitlements"> & {
    months: number;
  }
> = {
  trial: { seats: 3, executives: 1, months: 1 },
  design_partner: { seats: 8, executives: 2, months: 3 },
  pilot: { seats: 10, executives: 3, months: 3 },
  production: { seats: 25, executives: 5, months: 12 },
  enterprise: { seats: 100, executives: 15, months: 12 },
};

export function resetLicenses(): void {
  licenses.clear();
  seq = 0;
}

function addMonths(iso: string, months: number): string {
  const d = new Date(iso);
  d.setUTCMonth(d.getUTCMonth() + months);
  return d.toISOString();
}

export function issueLicense(input: {
  tenantId: string;
  editionId: CommercialEditionId;
  tier: LicenseTier;
  seats?: number;
  executives?: number;
  startsAt?: string;
  notes?: string | null;
}): CommercialLicense {
  const edition = getEdition(input.editionId);
  if (!edition) throw new Error(`Unknown edition: ${input.editionId}`);

  const defaults = TIER_DEFAULTS[input.tier];
  const startsAt = input.startsAt ?? new Date().toISOString();
  seq += 1;

  const featureEntitlements =
    input.tier === "enterprise"
      ? ["all_modules", "advanced_reporting", "sso", "audit_export"]
      : input.tier === "production"
        ? ["core_modules", "reporting", "trust_explainability"]
        : ["core_modules", "pilot_features"];

  const record: CommercialLicense = {
    id: `lic-${seq}`,
    tenantId: input.tenantId,
    editionId: input.editionId,
    tier: input.tier,
    entitlements: {
      seats: input.seats ?? defaults.seats,
      executives: input.executives ?? defaults.executives,
      providerEntitlements: [...edition.includedProviders],
      featureEntitlements,
    },
    startsAt,
    renewalAt: addMonths(startsAt, defaults.months),
    usage: {
      seatsUsed: Math.min(2, input.seats ?? defaults.seats),
      executivesActive: Math.min(1, input.executives ?? defaults.executives),
      providersConnected: 0,
    },
    expansionEligible:
      input.tier === "pilot" ||
      input.tier === "design_partner" ||
      input.tier === "production",
    notes: input.notes ?? null,
    createdAt: startsAt,
    updatedAt: startsAt,
  };

  licenses.set(record.id, record);
  return record;
}

export function updateLicenseUsage(input: {
  licenseId: string;
  seatsUsed?: number;
  executivesActive?: number;
  providersConnected?: number;
}): CommercialLicense | null {
  const current = licenses.get(input.licenseId);
  if (!current) return null;
  const next: CommercialLicense = {
    ...current,
    usage: {
      seatsUsed: input.seatsUsed ?? current.usage.seatsUsed,
      executivesActive:
        input.executivesActive ?? current.usage.executivesActive,
      providersConnected:
        input.providersConnected ?? current.usage.providersConnected,
    },
    updatedAt: new Date().toISOString(),
  };
  licenses.set(next.id, next);
  return next;
}

export function getLicense(id: string): CommercialLicense | undefined {
  return licenses.get(id);
}

export function listLicenses(tenantId?: string): CommercialLicense[] {
  return [...licenses.values()]
    .filter((l) => (tenantId ? l.tenantId === tenantId : true))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getLicenseForTenant(
  tenantId: string,
): CommercialLicense | undefined {
  return listLicenses(tenantId)[0];
}
