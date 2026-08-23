import { requireAppAccess } from "@/lib/auth/access";
import { requireSystemAdmin } from "@/lib/observability/health";
import { ForbiddenError } from "@/lib/errors";
import { AppShell } from "@/components/layout/AppShell";
import { ProvisioningDashboard } from "@/components/admin/ProvisioningDashboard";
import { buildProvisioningAdminSnapshot } from "@/provisioning";

export default async function AdminProvisioningPage() {
  const user = await requireAppAccess({ requireOnboarding: false });
  const allowed = await requireSystemAdmin(user.id, user.email ?? null);

  if (!allowed) {
    throw new ForbiddenError("System administration access is required.");
  }

  const snapshot = buildProvisioningAdminSnapshot();

  return (
    <AppShell breadcrumb="Provisioning" maxWidth="6xl">
      <ProvisioningDashboard snapshot={snapshot} />
    </AppShell>
  );
}
