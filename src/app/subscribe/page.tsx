import Link from "next/link";
import { requireAppAccess } from "@/lib/auth/access";
import { AppFrame } from "@/components/layout/AppFrame";
import { ExperiencePage } from "@/experience/layouts/ExperiencePage";
import { ExperienceCardShell } from "@/experience/design-system/Card";
import { ExperienceBadge } from "@/experience/design-system/Badge";
import {
  GROWTH_PLANS,
  beginSelfServiceCheckout,
  buildUsageDashboard,
  getSubscriptionForOrganization,
} from "@/growth";

export default async function SubscribePage() {
  await requireAppAccess({ requireOnboarding: false });

  const organizationId = "tenant-northline";
  const existing = getSubscriptionForOrganization(organizationId);
  if (!existing) {
    beginSelfServiceCheckout({
      organizationId,
      planId: "professional",
      mode: "trial",
    });
  }
  const usage = buildUsageDashboard(organizationId);

  return (
    <AppFrame title="Subscribe" density="snapshot">
      <ExperiencePage width="brief" className="space-y-8 pb-16">
        <header className="space-y-3 pt-2">
          <ExperienceBadge tone="accent">Self-service plans</ExperienceBadge>
          <h1 className="ex-display">Choose your plan</h1>
          <p className="ex-body max-w-xl">
            Start a free trial or subscribe with card billing. Upgrade, downgrade,
            or cancel anytime from Billing.
          </p>
        </header>

        <ExperienceCardShell className="space-y-2">
          <p className="ex-caption">Current subscription</p>
          <p className="ex-heading text-base">
            {usage.planId ?? "None"} · {usage.status}
          </p>
          <p className="ex-body">
            Seats {usage.seats.used}/{usage.seats.limit}
            {usage.trialEndsAt
              ? ` · Trial ends ${new Date(usage.trialEndsAt).toLocaleDateString()}`
              : ""}
          </p>
          <Link
            href="/settings/billing"
            className="inline-flex min-h-9 items-center rounded-[var(--ex-radius)] border border-[var(--eos-border)] px-3 text-sm font-medium text-[var(--ex-text)]"
          >
            Receipts, invoices & portal
          </Link>
        </ExperienceCardShell>

        <ul className="space-y-3">
          {GROWTH_PLANS.map((plan) => (
            <li key={plan.id}>
              <ExperienceCardShell className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="ex-heading">{plan.name}</p>
                    <p className="ex-body mt-1">{plan.tagline}</p>
                  </div>
                  <p className="text-sm font-medium text-[var(--ex-text)]">
                    from ${plan.monthlyFrom.toLocaleString()}/mo
                  </p>
                </div>
                <ul className="space-y-1">
                  {plan.highlights.map((h) => (
                    <li key={h} className="ex-body">
                      · {h}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/activate"
                    className="inline-flex min-h-9 items-center rounded-[var(--ex-radius)] bg-[var(--ex-accent)] px-3 text-sm font-medium text-white"
                  >
                    Start trial
                  </Link>
                  <Link
                    href="/settings/billing"
                    className="inline-flex min-h-9 items-center rounded-[var(--ex-radius)] border border-[var(--eos-border)] px-3 text-sm font-medium text-[var(--ex-text)]"
                  >
                    Checkout with card
                  </Link>
                </div>
              </ExperienceCardShell>
            </li>
          ))}
        </ul>
      </ExperiencePage>
    </AppFrame>
  );
}
