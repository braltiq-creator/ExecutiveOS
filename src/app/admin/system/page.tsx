import { requireAppAccess } from "@/lib/auth/access";
import {
  collectSystemHealthSnapshot,
  requireSystemAdmin,
} from "@/lib/observability/health";
import { ForbiddenError } from "@/lib/errors";
import { AppShell } from "@/components/layout/AppShell";
import { SystemHealthDashboard } from "@/components/admin/SystemHealthDashboard";

export default async function AdminSystemPage() {
  const user = await requireAppAccess({ requireOnboarding: false });
  const allowed = await requireSystemAdmin(user.id, user.email ?? null);

  if (!allowed) {
    throw new ForbiddenError("System administration access is required.");
  }

  const snapshot = await collectSystemHealthSnapshot();

  return (
    <AppShell breadcrumb="System" maxWidth="6xl">
      <SystemHealthDashboard snapshot={snapshot} />
    </AppShell>
  );
}
