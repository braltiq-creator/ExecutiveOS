"use client";

import type { CommercialDashboard } from "@/commercial";
import { PageHeader } from "@/components/ui/page-header";

type Props = {
  dashboard: CommercialDashboard;
};

export function CommercialReadinessDashboard({ dashboard }: Props) {
  return (
    <div className="space-y-10">
      <PageHeader
        overline="Administration"
        title="Commercial Readiness"
        description="Braltiq-internal only. Package, license, implement, measure value, and expand ExecutiveOS without changing Core."
      />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Metric label="Active licenses" value={String(dashboard.summary.activeLicenses)} />
        <Metric
          label="In implementation"
          value={String(dashboard.summary.pilotsInImplementation)}
        />
        <Metric
          label="Production ready"
          value={String(dashboard.summary.productionReady)}
        />
        <Metric
          label="Expansion opportunities"
          value={String(dashboard.summary.expansionOpportunities)}
        />
        <Metric
          label="Renewals upcoming"
          value={String(dashboard.summary.renewalsUpcoming)}
        />
        <Metric
          label="Avg ROI confidence"
          value={`${dashboard.summary.avgRoiConfidence}%`}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Editions</h2>
        <ul className="grid gap-3 lg:grid-cols-2">
          {dashboard.editions.map((edition) => (
            <li
              key={edition.id}
              className="rounded-lg border border-border px-4 py-3"
            >
              <p className="font-medium">{edition.name}</p>
              <p className="mt-1 text-sm text-secondary">
                {edition.targetExecutive}
              </p>
              <p className="mt-2 text-sm">
                Providers: {edition.includedProviders.join(", ")}
              </p>
              <p className="mt-1 text-xs text-muted">
                Expand: {edition.expansionOpportunities.join(" · ")}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Licenses</h2>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-3 py-2">Tenant</th>
                <th className="px-3 py-2">Edition</th>
                <th className="px-3 py-2">Tier</th>
                <th className="px-3 py-2">Seats</th>
                <th className="px-3 py-2">Renewal</th>
                <th className="px-3 py-2">Expansion</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.licenses.map((license) => (
                <tr
                  key={license.id}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-3 py-2.5">{license.tenantId}</td>
                  <td className="px-3 py-2.5">
                    {license.editionId.replace(/_/g, " ")}
                  </td>
                  <td className="px-3 py-2.5">{license.tier}</td>
                  <td className="px-3 py-2.5">
                    {license.usage.seatsUsed}/{license.entitlements.seats}
                  </td>
                  <td className="px-3 py-2.5">
                    {new Date(license.renewalAt).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2.5">
                    {license.expansionEligible ? "Yes" : "No"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">
            Implementation
          </h2>
          <ul className="space-y-2">
            {dashboard.implementationPlans.map((plan) => (
              <li
                key={plan.id}
                className="rounded-lg border border-border px-3 py-2.5"
              >
                <p className="font-medium">{plan.tenantId}</p>
                <p className="mt-1 text-sm text-secondary">
                  Stage: {plan.currentStageId.replace(/_/g, " ")}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {
                    plan.stages.filter((s) => s.status === "complete").length
                  }
                  /{plan.stages.length} stages complete
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">
            Success plans
          </h2>
          <ul className="space-y-2">
            {dashboard.successPlans.map((plan) => (
              <li
                key={plan.id}
                className="rounded-lg border border-border px-3 py-2.5"
              >
                <p className="font-medium">
                  {plan.tenantId} · {plan.health}
                </p>
                <p className="mt-1 text-sm text-secondary">
                  Sponsors: {plan.executiveSponsors.join(", ")} ·{" "}
                  {plan.reviewCadence}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {plan.customerObjectives[0]}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">ROI reports</h2>
          <ul className="space-y-2">
            {dashboard.roiReports.map((report) => (
              <li
                key={report.id}
                className="rounded-lg border border-border px-3 py-2.5"
              >
                <p className="font-medium">{report.tenantId}</p>
                <p className="mt-1 text-sm text-secondary">
                  Hours saved {report.executiveHoursSaved.low}–
                  {report.executiveHoursSaved.high} (
                  {report.executiveHoursSaved.confidence}% conf) · Recs adopted{" "}
                  {report.recommendationsAdopted.mid}
                </p>
                <p className="mt-1 text-xs text-muted line-clamp-2">
                  {report.narrative}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">Expansion</h2>
          <ul className="space-y-2">
            {dashboard.expansion.slice(0, 8).map((item) => (
              <li
                key={item.id}
                className="rounded-lg border border-border px-3 py-2.5"
              >
                <p className="text-xs uppercase tracking-wide text-muted">
                  {item.confidence}% confidence
                </p>
                <p className="mt-1 font-medium">
                  {item.fromEditionId.replace(/_/g, " ")} → {item.toLabel}
                </p>
                <p className="mt-1 text-sm text-secondary">{item.rationale}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">
          Security pack
        </h2>
        <p className="text-sm text-secondary">
          Version {dashboard.securityPack.version} — procurement-ready overview
        </p>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {dashboard.securityPack.sections.map((section) => (
            <li
              key={section.id}
              className="rounded-lg border border-border px-3 py-2.5"
            >
              <p className="font-medium text-sm">{section.title}</p>
              <p className="mt-1 text-xs text-secondary">{section.summary}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">
          Sales enablement
        </h2>
        <ul className="space-y-2">
          {dashboard.salesAssets.map((asset) => (
            <li
              key={asset.id}
              className="rounded-lg border border-border px-3 py-2.5"
            >
              <p className="font-medium">{asset.title}</p>
              <p className="mt-1 text-xs text-muted">{asset.audience}</p>
              <p className="mt-1 text-sm text-secondary">{asset.body[0]}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}
