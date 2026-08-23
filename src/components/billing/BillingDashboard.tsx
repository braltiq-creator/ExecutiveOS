"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  cancelSubscriptionAction,
  downgradePlanAction,
  openBillingPortalAction,
  reactivateSubscriptionAction,
  startCheckoutAction,
  upgradePlanAction,
} from "@/lib/billing/actions";
import {
  formatCurrency,
  formatStorageLimit,
  type BillingOverview,
  type PlanRecord,
} from "@/lib/billing/types";

type BillingDashboardProps = {
  overview: BillingOverview;
  plans: PlanRecord[];
};

const inputClassName =
  "rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 transition-colors hover:border-zinc-300 hover:bg-zinc-50 disabled:opacity-60";

export function BillingDashboard({ overview, plans }: BillingDashboardProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { subscription, plan, usage, payments } = overview;

  function runAction(action: () => Promise<{ error: string | null }>) {
    setError(null);

    startTransition(async () => {
      const result = await action();

      if (result.error) {
        setError(result.error);
        return;
      }

      router.refresh();
    });
  }

  function handleUpgrade(planId: PlanRecord["id"]) {
    runAction(() =>
      upgradePlanAction({ planId, billingCycle: subscription.billing_cycle }),
    );
  }

  function handleCheckout(planId: PlanRecord["id"]) {
    setError(null);

    startTransition(async () => {
      const result = await startCheckoutAction({
        planId,
        billingCycle: subscription.billing_cycle,
      });

      if (result.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="space-y-10">
      <div>
        <p className="text-sm font-medium text-zinc-500">Billing</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          Subscription & Licensing
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 sm:text-base">
          Manage your ExecutiveOS plan, seats, usage, and payment history.
        </p>
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
        >
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Current Plan" value={plan.name} />
        <MetricCard
          label="Seats Used"
          value={`${overview.seatsUsed} / ${subscription.seat_limit}`}
        />
        <MetricCard
          label="AI Usage"
          value={`${usage.ai_requests} / ${plan.ai_request_limit}`}
        />
        <MetricCard
          label="Storage"
          value={`${formatStorageLimit(Number(usage.storage_bytes))} / ${formatStorageLimit(plan.storage_limit)}`}
        />
      </div>

      <section className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
              {plan.name}
            </h2>
            <p className="mt-1 text-sm text-zinc-600">{plan.description}</p>
            <p className="mt-3 text-sm text-zinc-500">
              Status: <span className="font-medium capitalize text-zinc-900">{subscription.status.replace("_", " ")}</span>
            </p>
            {subscription.renews_at ? (
              <p className="mt-1 text-sm text-zinc-500">
                Renews:{" "}
                {new Date(subscription.renews_at).toLocaleDateString(undefined, {
                  dateStyle: "medium",
                })}
              </p>
            ) : subscription.trial_ends_at ? (
              <p className="mt-1 text-sm text-zinc-500">
                Trial ends:{" "}
                {new Date(subscription.trial_ends_at).toLocaleDateString(undefined, {
                  dateStyle: "medium",
                })}
              </p>
            ) : null}
            {overview.paymentMethodSummary ? (
              <p className="mt-1 text-sm text-zinc-500">
                Payment method: {overview.paymentMethodSummary}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                setError(null);
                startTransition(async () => {
                  const result = await openBillingPortalAction();
                  if (result.error) {
                    setError(result.error);
                  }
                });
              }}
              className={inputClassName}
            >
              Manage Billing
            </button>
            {subscription.cancelled_at ? (
              <button
                type="button"
                disabled={isPending}
                onClick={() => runAction(reactivateSubscriptionAction)}
                className={inputClassName}
              >
                Reactivate
              </button>
            ) : (
              <button
                type="button"
                disabled={isPending}
                onClick={() => runAction(cancelSubscriptionAction)}
                className={inputClassName}
              >
                Cancel Subscription
              </button>
            )}
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <UsageBar
            label="AI Requests"
            value={overview.aiUsagePercent}
            caption={`${usage.ai_requests} of ${plan.ai_request_limit}`}
          />
          <UsageBar
            label="Storage"
            value={overview.storageUsagePercent}
            caption={`${formatStorageLimit(Number(usage.storage_bytes))} of ${formatStorageLimit(plan.storage_limit)}`}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-lg font-semibold tracking-tight text-zinc-900 sm:text-xl">
          Available Plans
        </h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {plans.map((availablePlan) => {
            const isCurrent = availablePlan.id === plan.id;
            const isHigher =
              availablePlan.display_order > plan.display_order;

            return (
              <article
                key={availablePlan.id}
                className={`rounded-2xl border p-6 shadow-sm ${
                  isCurrent
                    ? "border-zinc-900 bg-zinc-50/50"
                    : "border-zinc-200/80 bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-900">
                      {availablePlan.name}
                    </h3>
                    <p className="mt-1 text-sm text-zinc-600">
                      {availablePlan.description}
                    </p>
                  </div>
                  {isCurrent ? (
                    <span className="rounded-full border border-zinc-900 bg-zinc-900 px-2.5 py-0.5 text-xs font-medium text-white">
                      Current
                    </span>
                  ) : null}
                </div>
                <p className="mt-4 text-2xl font-semibold text-zinc-900">
                  {formatCurrency(
                    subscription.billing_cycle === "annual"
                      ? availablePlan.annual_price
                      : availablePlan.monthly_price,
                  )}
                  <span className="text-sm font-normal text-zinc-500">
                    /{subscription.billing_cycle === "annual" ? "year" : "month"}
                  </span>
                </p>
                <ul className="mt-4 space-y-2 text-sm text-zinc-600">
                  <li>{availablePlan.seat_limit} seats</li>
                  <li>{availablePlan.ai_request_limit.toLocaleString()} AI requests</li>
                  <li>{formatStorageLimit(availablePlan.storage_limit)} storage</li>
                </ul>
                {!isCurrent ? (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() =>
                      subscription.stripe_subscription_id
                        ? isHigher
                          ? handleUpgrade(availablePlan.id)
                          : runAction(() =>
                              downgradePlanAction({
                                planId: availablePlan.id,
                                billingCycle: subscription.billing_cycle,
                              }),
                            )
                        : handleCheckout(availablePlan.id)
                    }
                    className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-60"
                  >
                    {subscription.stripe_subscription_id
                      ? isHigher
                        ? "Upgrade"
                        : "Downgrade"
                      : "Upgrade"}
                  </button>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
          Billing History
        </h2>
        {payments.length > 0 ? (
          <div className="mt-6 space-y-3">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-zinc-900">
                    {formatCurrency(payment.amount, payment.currency)}
                  </p>
                  <p className="mt-1 text-sm capitalize text-zinc-600">
                    {payment.status.replace("_", " ")} ·{" "}
                    {new Date(payment.created_at).toLocaleDateString(undefined, {
                      dateStyle: "medium",
                    })}
                  </p>
                </div>
                {payment.invoice_url ? (
                  <a
                    href={payment.invoice_url}
                    target="_blank"
                    rel="noreferrer"
                    className={inputClassName}
                  >
                    View Invoice
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-zinc-600">
            No payment history yet. Invoices will appear here after your first
            successful charge.
          </p>
        )}
      </section>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200/80 bg-white px-5 py-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-zinc-900">{value}</p>
    </div>
  );
}

function UsageBar({
  label,
  value,
  caption,
}: {
  label: string;
  value: number;
  caption: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-zinc-700">{label}</p>
        <p className="text-sm text-zinc-500">{caption}</p>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-100">
        <div
          className="h-2 rounded-full bg-zinc-900 transition-all"
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}
