/**
 * Licensing — commercial readiness without payment integration.
 */

export type LicenseKind =
  | "tenant"
  | "user"
  | "module"
  | "provider"
  | "knowledge_pack";

export type LicenseEntitlement = {
  kind: LicenseKind;
  sku: string;
  quantity: number;
  unlimited?: boolean;
};

export type TenantLicense = {
  tenantId: string;
  planId: string;
  status: "trial" | "active" | "past_due" | "cancelled" | "suspended";
  entitlements: LicenseEntitlement[];
  validFrom: string;
  validTo: string | null;
};

export function createEnterpriseLicense(
  tenantId: string,
  asOf = "2026-07-26T08:00:00+10:00",
): TenantLicense {
  return {
    tenantId,
    planId: "enterprise",
    status: "active",
    validFrom: asOf,
    validTo: null,
    entitlements: [
      { kind: "tenant", sku: "eos-enterprise", quantity: 1 },
      { kind: "user", sku: "eos-seat", quantity: 25 },
      { kind: "module", sku: "module-intelligence", quantity: 1 },
      { kind: "module", sku: "module-council", quantity: 1 },
      { kind: "module", sku: "module-futures", quantity: 1 },
      { kind: "module", sku: "module-agenda", quantity: 1 },
      { kind: "module", sku: "module-connectivity", quantity: 1 },
      { kind: "provider", sku: "provider-microsoft365", quantity: 1 },
      { kind: "provider", sku: "provider-simpro", quantity: 1 },
      { kind: "provider", sku: "provider-salesforce", quantity: 1 },
      { kind: "knowledge_pack", sku: "pack-field-services", quantity: 1 },
    ],
  };
}

export function assertLicensed(
  license: TenantLicense,
  kind: LicenseKind,
  sku: string,
): { ok: boolean; reason: string } {
  if (license.status !== "active" && license.status !== "trial") {
    return { ok: false, reason: `License status is ${license.status}` };
  }
  const hit = license.entitlements.find((e) => e.kind === kind && e.sku === sku);
  if (!hit) return { ok: false, reason: `Missing entitlement ${kind}:${sku}` };
  if (!hit.unlimited && hit.quantity <= 0) {
    return { ok: false, reason: `Entitlement exhausted for ${sku}` };
  }
  return { ok: true, reason: "Licensed" };
}

export function seatsRemaining(
  license: TenantLicense,
  usedSeats: number,
): number {
  const seats = license.entitlements.find(
    (e) => e.kind === "user" && e.sku === "eos-seat",
  );
  if (!seats || seats.unlimited) return Number.POSITIVE_INFINITY;
  return Math.max(0, seats.quantity - usedSeats);
}
