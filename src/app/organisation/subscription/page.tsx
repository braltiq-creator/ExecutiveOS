import Link from "next/link";
import { PortalShell } from "@/components/organisation-portal/PortalShell";
import {
  PortalSection,
  PortalStat,
} from "@/components/organisation-portal/PortalSection";
import { loadOrganisationPortal } from "@/lib/organisation-portal/load";

export default async function OrganisationSubscriptionPage() {
  const { snapshot } = await loadOrganisationPortal();
  const sub = snapshot.subscription;

  return (
    <PortalShell
      title="Subscription"
      description="Plan, trial, renewal, invoices, and upgrades — self-serve billing for your organisation."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <PortalStat label="Plan" value={sub.planName} hint={sub.status} />
        <PortalStat
          label="Trial"
          value={
            sub.trial.active ? `${sub.trial.daysRemaining} days` : "Not active"
          }
          hint={sub.trial.endsAt ? `Ends ${sub.trial.endsAt.slice(0, 10)}` : undefined}
        />
        <PortalStat
          label="Usage"
          value={`${sub.usage.seatsUsed}/${sub.usage.seatsLimit}`}
          hint={`${sub.usage.executivesActive} executives`}
        />
      </div>

      <PortalSection
        title="Billing"
        description="Payment method and renewal."
        action={
          <Link
            href={sub.upgradePath}
            className="inline-flex min-h-9 items-center rounded-[var(--ex-radius)] bg-[var(--ex-text)] px-3 text-sm font-medium text-[var(--ex-canvas)]"
          >
            Upgrade
          </Link>
        }
      >
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="ex-caption">Payment method</dt>
            <dd className="ex-body mt-1">{sub.paymentMethod}</dd>
          </div>
          <div>
            <dt className="ex-caption">Renewal</dt>
            <dd className="ex-body mt-1">
              {sub.renewalAt ? sub.renewalAt.slice(0, 10) : "—"}
            </dd>
          </div>
        </dl>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/settings/billing"
            className="text-sm font-medium text-[var(--ex-text)] underline-offset-4 hover:underline"
          >
            Invoices & payment portal
          </Link>
          <Link
            href={sub.cancelPath}
            className="text-sm text-[var(--eos-text-secondary)] underline-offset-4 hover:underline"
          >
            Cancel subscription
          </Link>
        </div>
      </PortalSection>

      <PortalSection title="Invoices">
        <ul className="space-y-2">
          {sub.invoices.map((inv) => (
            <li
              key={inv.id}
              className="flex justify-between border-t border-[var(--eos-border)] pt-2 text-sm first:border-0 first:pt-0"
            >
              <span className="ex-body">
                {inv.id} · {inv.issuedAt.slice(0, 10)}
              </span>
              <span className="ex-heading text-sm">
                {inv.amountLabel} · {inv.status}
              </span>
            </li>
          ))}
        </ul>
      </PortalSection>
    </PortalShell>
  );
}
