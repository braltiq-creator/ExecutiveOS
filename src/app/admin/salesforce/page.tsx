import { requireAppAccess } from "@/lib/auth/access";
import { requireSystemAdmin } from "@/lib/observability/health";
import { ForbiddenError } from "@/lib/errors";
import { AppShell } from "@/components/layout/AppShell";
import { SalesforceAdminDashboard } from "@/components/admin/SalesforceAdminDashboard";
import {
  SALESFORCE_SERVICES,
  getSalesforceConnectionRegistry,
  type SalesforceAdminStatus,
} from "@/providers/salesforce";

function disconnectedStatus(): SalesforceAdminStatus {
  return {
    tenantStatus: "disconnected",
    authenticationStatus: "disconnected",
    orgId: null,
    instanceUrl: null,
    permissions: [],
    syncHealth: "idle",
    lastSynchronisation: null,
    webhookStatus: {
      active: 0,
      expired: 0,
      failed: 0,
      lastDeliveryAt: null,
    },
    cdcStatus: {
      channels: [],
      active: 0,
      gaps: 0,
      lastCommitAt: null,
    },
    rateLimits: { remaining: null },
    errors: [],
    retryQueue: 0,
    dataQuality: {
      briefPresent: false,
      openDeals: 0,
      signals: 0,
      recommendations: 0,
    },
    enabledServices: [...SALESFORCE_SERVICES],
    syncFrequency: "every_15_minutes",
    platformEventsEnabled: true,
    cdcEnabled: true,
  };
}

export default async function AdminSalesforcePage() {
  const user = await requireAppAccess({ requireOnboarding: false });
  const allowed = await requireSystemAdmin(user.id, user.email ?? null);

  if (!allowed) {
    throw new ForbiddenError("System administration access is required.");
  }

  const registry = getSalesforceConnectionRegistry();
  registry.getOrCreate("tenant-northline");
  const status =
    registry.adminStatus("tenant-northline") ?? disconnectedStatus();

  return (
    <AppShell breadcrumb="Salesforce" maxWidth="6xl">
      <SalesforceAdminDashboard
        status={status}
        services={[...SALESFORCE_SERVICES]}
      />
    </AppShell>
  );
}
