/**
 * Billing-ready surface — no payment integration required.
 * Prepares commercial deployment hooks for Stripe / invoice later.
 */

import type { TenantLicense } from "@/runtime/licensing";
import type { UsageCounter } from "@/runtime/usage";

export type BillingReadySnapshot = {
  tenantId: string;
  planId: string;
  status: TenantLicense["status"];
  seats: { licensed: number; used: number; remaining: number };
  modules: string[];
  usage: UsageCounter[];
  readyForCheckout: boolean;
  paymentProviderReady: Array<"stripe" | "invoice" | "app_store">;
};

export function buildBillingReadySnapshot(input: {
  license: TenantLicense;
  usedSeats: number;
  usage: UsageCounter[];
}): BillingReadySnapshot {
  const seatEntitlement = input.license.entitlements.find(
    (e) => e.kind === "user",
  );
  const licensed = seatEntitlement?.quantity ?? 0;
  return {
    tenantId: input.license.tenantId,
    planId: input.license.planId,
    status: input.license.status,
    seats: {
      licensed,
      used: input.usedSeats,
      remaining: Math.max(0, licensed - input.usedSeats),
    },
    modules: input.license.entitlements
      .filter((e) => e.kind === "module")
      .map((e) => e.sku),
    usage: input.usage,
    readyForCheckout: input.license.status === "trial" || input.license.status === "active",
    paymentProviderReady: ["stripe", "invoice", "app_store"],
  };
}
