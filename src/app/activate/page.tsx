import Link from "next/link";
import { requireAppAccess } from "@/lib/auth/access";
import { AppFrame } from "@/components/layout/AppFrame";
import { ExperiencePage } from "@/experience/layouts/ExperiencePage";
import { ExperienceBadge } from "@/experience/design-system/Badge";
import { ActivationProgress } from "@/growth/components/ActivationProgress";
import {
  getCustomerJourney,
  hasMinimumProviders,
  markProviderConnected,
  runFiveMinuteActivationPath,
  startCustomerJourney,
  startTrialSubscription,
} from "@/growth";

export default async function ActivatePage() {
  await requireAppAccess({ requireOnboarding: false });

  const organizationId = "tenant-northline";
  const tenantId = "tenant-northline";
  const profileId = "operations_executive" as const;

  let journey = getCustomerJourney(organizationId);
  if (!journey) {
    journey = startCustomerJourney({
      organizationId,
      tenantId,
      profileId,
      planId: "professional",
    });
    startTrialSubscription({ organizationId, planId: "professional" });
  }

  if (!hasMinimumProviders(organizationId, profileId)) {
    markProviderConnected({
      organizationId,
      providerId: "microsoft365",
    });
    markProviderConnected({
      organizationId,
      providerId: "simpro",
    });
    journey = getCustomerJourney(organizationId) ?? journey;
  }

  // Demo fast-path completion for self-service readiness
  if (
    journey.steps.filter((s) => s.status === "complete").length <
    journey.steps.length
  ) {
    const result = runFiveMinuteActivationPath({
      organizationId,
      tenantId,
      profileId,
      secondaryProvider: "simpro",
    });
    journey = result.journey;
  }

  return (
    <AppFrame title="Activate" density="snapshot">
      <ExperiencePage width="brief" className="space-y-8 pb-16">
        <header className="space-y-3 pt-2">
          <ExperienceBadge tone="accent">Self-service activation</ExperienceBadge>
          <h1 className="ex-display">Go live in five minutes</h1>
          <p className="ex-body max-w-xl">
            Purchase → connect Microsoft 365 and Simpro or Salesforce → complete
            Discovery → receive your first Executive Brief → see estimated
            business value.
          </p>
        </header>

        <ActivationProgress journey={journey} />

        <div className="flex flex-wrap gap-3">
          <Link
            href="/settings/integrations"
            className="inline-flex min-h-11 items-center rounded-[var(--ex-radius)] bg-[var(--ex-accent)] px-4 text-sm font-medium text-white"
          >
            Connect providers
          </Link>
          <Link
            href="/onboarding"
            className="inline-flex min-h-11 items-center rounded-[var(--ex-radius)] border border-[var(--eos-border)] bg-[var(--ex-surface)] px-4 text-sm font-medium text-[var(--ex-text)]"
          >
            Executive Discovery
          </Link>
          <Link
            href="/today"
            className="inline-flex min-h-11 items-center rounded-[var(--ex-radius)] border border-[var(--eos-border)] bg-[var(--ex-surface)] px-4 text-sm font-medium text-[var(--ex-text)]"
          >
            Open Executive Brief
          </Link>
          <Link
            href="/value"
            className="inline-flex min-h-11 items-center px-4 text-sm font-medium text-[var(--ex-accent)] underline-offset-4 hover:underline"
          >
            View value
          </Link>
        </div>
      </ExperiencePage>
    </AppFrame>
  );
}
