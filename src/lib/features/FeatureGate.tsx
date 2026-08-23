"use client";

import Link from "next/link";
import type { FeatureEntitlements } from "@/lib/features/types";
import type { FeatureKey } from "@/lib/billing/types";
import { hasFeature } from "@/lib/features/types";

type FeatureGateProps = {
  feature: FeatureKey;
  entitlements: FeatureEntitlements;
  children?: React.ReactNode;
  fallback?: React.ReactNode;
};

export function FeatureGate({
  feature,
  entitlements,
  children,
  fallback,
}: FeatureGateProps) {
  if (hasFeature(entitlements, feature)) {
    return children ? <>{children}</> : null;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/70 p-6 text-center">
      <p className="text-sm font-medium text-zinc-900">Upgrade required</p>
      <p className="mt-2 text-sm leading-6 text-zinc-600">
        This capability is not included in your current {entitlements.plan.name} plan.
      </p>
      <Link
        href="/settings/billing"
        className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
      >
        View Plans
      </Link>
    </div>
  );
}
