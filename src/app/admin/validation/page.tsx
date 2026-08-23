import { requireAppAccess } from "@/lib/auth/access";
import { requireSystemAdmin } from "@/lib/observability/health";
import { ForbiddenError } from "@/lib/errors";
import { AppShell } from "@/components/layout/AppShell";
import { ValidationDashboard } from "@/components/admin/ValidationDashboard";
import { buildValidationSuite } from "@/validation";

export default async function AdminValidationPage() {
  const user = await requireAppAccess({ requireOnboarding: false });
  const allowed = await requireSystemAdmin(user.id, user.email ?? null);

  if (!allowed) {
    throw new ForbiddenError("System administration access is required.");
  }

  const dashboard = buildValidationSuite({
    tenantId: "tenant-northline",
    asOf: new Date().toISOString(),
  });

  return (
    <AppShell breadcrumb="Validation" maxWidth="6xl">
      <ValidationDashboard dashboard={dashboard} />
    </AppShell>
  );
}
