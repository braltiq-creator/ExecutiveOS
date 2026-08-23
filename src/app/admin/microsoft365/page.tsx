import { requireAppAccess } from "@/lib/auth/access";
import {
  requireSystemAdmin,
} from "@/lib/observability/health";
import { ForbiddenError } from "@/lib/errors";
import { AppShell } from "@/components/layout/AppShell";
import { Microsoft365AdminDashboard } from "@/components/admin/Microsoft365AdminDashboard";
import {
  M365_SERVICES,
  getM365ConnectionRegistry,
  type M365AdminStatus,
} from "@/providers/microsoft365";

function disconnectedStatus(): M365AdminStatus {
  return {
    tenantStatus: "disconnected",
    authenticationStatus: "disconnected",
    microsoftTenantId: null,
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
      commitments: 0,
      signals: 0,
      documents: 0,
    },
    enabledServices: [...M365_SERVICES],
    syncFrequency: "every_15_minutes",
  };
}

export default async function AdminMicrosoft365Page() {
  const user = await requireAppAccess({ requireOnboarding: false });
  const allowed = await requireSystemAdmin(user.id, user.email ?? null);

  if (!allowed) {
    throw new ForbiddenError("System administration access is required.");
  }

  const registry = getM365ConnectionRegistry();
  registry.getOrCreate("tenant-northline");
  const status =
    registry.adminStatus("tenant-northline") ?? disconnectedStatus();

  return (
    <AppShell breadcrumb="Microsoft 365" maxWidth="6xl">
      <Microsoft365AdminDashboard
        status={status}
        services={[...M365_SERVICES]}
      />
    </AppShell>
  );
}
