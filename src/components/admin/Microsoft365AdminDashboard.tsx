"use client";

import { PageHeader } from "@/components/ui/page-header";
import { MetricCard } from "@/components/ui/metric-card";
import { ResponsiveGrid } from "@/components/ui/responsive-grid";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import type { M365AdminStatus } from "@/providers/microsoft365";
import { Microsoft365AdminControls } from "@/components/admin/Microsoft365AdminControls";

type Microsoft365AdminDashboardProps = {
  status: M365AdminStatus;
  services: string[];
};

function variant(
  value: string,
): "success" | "warning" | "danger" | "neutral" {
  if (
    value === "connected" ||
    value === "healthy" ||
    value === "active"
  ) {
    return "success";
  }
  if (value === "degraded" || value === "expired" || value === "idle") {
    return "warning";
  }
  if (
    value === "failed" ||
    value === "disconnected" ||
    value === "revoked"
  ) {
    return "danger";
  }
  return "neutral";
}

export function Microsoft365AdminDashboard({
  status,
  services,
}: Microsoft365AdminDashboardProps) {
  return (
    <div className="space-y-8">
      <PageHeader
        overline="Administration"
        title="Microsoft 365"
        description="Tenant connection, consent, synchronisation health, and production Graph observability."
      />

      <Microsoft365AdminControls
        connected={status.tenantStatus === "connected"}
      />

      <ResponsiveGrid columns={4}>
        <MetricCard
          label="Tenant"
          value={status.tenantStatus}
          hint={status.microsoftTenantId ?? "Not connected"}
        />
        <MetricCard
          label="Authentication"
          value={status.authenticationStatus}
        />
        <MetricCard label="Sync health" value={status.syncHealth} />
        <MetricCard
          label="Last sync"
          value={
            status.lastSynchronisation
              ? new Date(status.lastSynchronisation).toLocaleString()
              : "—"
          }
        />
      </ResponsiveGrid>

      <section className="space-y-3">
        <SectionHeader title="Connection status" />
        <ResponsiveGrid columns={3}>
          <Card padding="md">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-zinc-900">
                  Microsoft tenant
                </p>
                <p className="mt-1 text-xs leading-5 text-zinc-600">
                  {status.microsoftTenantId ?? "Awaiting consent"}
                </p>
              </div>
              <StatusBadge
                label={status.tenantStatus}
                variant={variant(status.tenantStatus)}
              />
            </div>
          </Card>
          <Card padding="md">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-zinc-900">Webhooks</p>
                <p className="mt-1 text-xs leading-5 text-zinc-600">
                  {status.webhookStatus.active} active ·{" "}
                  {status.webhookStatus.expired} expired
                </p>
              </div>
              <StatusBadge
                label={
                  status.webhookStatus.active > 0 ? "active" : "idle"
                }
                variant={
                  status.webhookStatus.active > 0 ? "success" : "warning"
                }
              />
            </div>
          </Card>
          <Card padding="md">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-zinc-900">
                  Rate limits
                </p>
                <p className="mt-1 text-xs leading-5 text-zinc-600">
                  Remaining {status.rateLimits.remaining ?? "—"}
                </p>
              </div>
              <StatusBadge
                label={status.retryQueue > 0 ? "retry queue" : "clear"}
                variant={status.retryQueue > 0 ? "warning" : "success"}
              />
            </div>
          </Card>
        </ResponsiveGrid>
      </section>

      <section className="space-y-3">
        <SectionHeader title="Permissions granted" />
        <Card padding="md">
          {status.permissions.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {status.permissions.map((scope) => (
                <li
                  key={scope}
                  className="border border-zinc-200 px-2 py-1 text-xs text-zinc-700"
                >
                  {scope}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-zinc-600">
              No consent granted. Connect Microsoft 365 to begin.
            </p>
          )}
        </Card>
      </section>

      <section className="space-y-3">
        <SectionHeader title="Enabled services" />
        <Card padding="md">
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {(status.enabledServices.length > 0
              ? status.enabledServices
              : services
            ).map((service) => (
              <li key={service} className="text-sm text-zinc-700">
                {service}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-zinc-500">
            Sync frequency: {status.syncFrequency}
          </p>
        </Card>
      </section>

      <section className="space-y-3">
        <SectionHeader title="Data quality" />
        <ResponsiveGrid columns={4}>
          <MetricCard
            label="Brief"
            value={status.dataQuality.briefPresent ? "Present" : "Missing"}
          />
          <MetricCard
            label="Commitments"
            value={status.dataQuality.commitments}
          />
          <MetricCard label="Signals" value={status.dataQuality.signals} />
          <MetricCard
            label="Documents"
            value={status.dataQuality.documents}
          />
        </ResponsiveGrid>
      </section>

      <section className="space-y-3">
        <SectionHeader title="Errors & retry queue" />
        <Card padding="md">
          <p className="text-sm text-zinc-600">
            Retry queue depth: {status.retryQueue}
          </p>
          {status.errors.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {status.errors.map((error) => (
                <li
                  key={`${error.at}-${error.message}`}
                  className="text-sm text-zinc-700"
                >
                  <span className="text-xs text-zinc-500">
                    {new Date(error.at).toLocaleString()}
                  </span>
                  <span className="mt-0.5 block">{error.message}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-zinc-500">No recent errors.</p>
          )}
        </Card>
      </section>
    </div>
  );
}
