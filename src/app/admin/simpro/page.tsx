import { requireAppAccess } from "@/lib/auth/access";
import { requireSystemAdmin } from "@/lib/observability/health";
import { ForbiddenError } from "@/lib/errors";
import { AppShell } from "@/components/layout/AppShell";
import { SimproAdminDashboard } from "@/components/admin/SimproAdminDashboard";
import {
  SIMPRO_SERVICES,
  getSimproConnectionRegistry,
  type SimproAdminStatus,
} from "@/providers/simpro";

function disconnectedStatus(): SimproAdminStatus {
  return {
    tenantStatus: "disconnected",
    authenticationStatus: "disconnected",
    companyId: null,
    authStrategy: null,
    permissions: [],
    syncHealth: "idle",
    lastSynchronisation: null,
    webhookStatus: {
      active: 0,
      expired: 0,
      failed: 0,
      lastDeliveryAt: null,
    },
    rateLimits: { remaining: null },
    errors: [],
    retryQueue: 0,
    dataQuality: {
      briefPresent: false,
      openJobs: 0,
      signals: 0,
      recommendations: 0,
    },
    enabledServices: [...SIMPRO_SERVICES],
    syncFrequency: "every_15_minutes",
  };
}

export default async function AdminSimproPage() {
  const user = await requireAppAccess({ requireOnboarding: false });
  const allowed = await requireSystemAdmin(user.id, user.email ?? null);

  if (!allowed) {
    throw new ForbiddenError("System administration access is required.");
  }

  const registry = getSimproConnectionRegistry();
  registry.getOrCreate("tenant-northline");
  const status =
    registry.adminStatus("tenant-northline") ?? disconnectedStatus();

  return (
    <AppShell breadcrumb="Simpro" maxWidth="6xl">
      <SimproAdminDashboard status={status} services={[...SIMPRO_SERVICES]} />
    </AppShell>
  );
}
