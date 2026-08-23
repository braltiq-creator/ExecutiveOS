import { requireAppAccess } from "@/lib/auth/access";
import { requireSystemAdmin } from "@/lib/observability/health";
import { ForbiddenError } from "@/lib/errors";
import { AppShell } from "@/components/layout/AppShell";
import { OperationsCentreDashboardView } from "@/components/admin/OperationsCentreDashboard";
import {
  buildOperationsCentreDashboard,
  listOpenIncidents,
  openIncident,
  syncPartnersFromPilots,
} from "@/operations";
import { listPilots, provisionDesignPartner } from "@/pilot";

function seedOperationsIfEmpty() {
  if (listPilots().length === 0) {
    provisionDesignPartner({
      partnerName: "Ops Visibility Pilot",
      industry: "Field Services",
      intelligenceProfileId: "operations_executive",
      administratorEmail: "admin@ops-visibility.test",
      region: "au",
    });
    provisionDesignPartner({
      partnerName: "Commercial Pulse Pilot",
      industry: "B2B Services",
      intelligenceProfileId: "commercial_executive",
      administratorEmail: "admin@commercial-pulse.test",
      region: "au",
    });
    syncPartnersFromPilots();
  }

  if (listOpenIncidents().length === 0) {
    openIncident({
      title: "Elevated Simpro sync latency (synthetic)",
      severity: "sev3",
      providerId: "simpro",
      note: "Pre-impact watch — customers not yet affected.",
    });
  }
}

export default async function AdminOperationsPage() {
  const user = await requireAppAccess({ requireOnboarding: false });
  const allowed = await requireSystemAdmin(user.id, user.email ?? null);

  if (!allowed) {
    throw new ForbiddenError("System administration access is required.");
  }

  seedOperationsIfEmpty();
  const dashboard = buildOperationsCentreDashboard();

  return (
    <AppShell breadcrumb="Operations" maxWidth="6xl">
      <OperationsCentreDashboardView dashboard={dashboard} />
    </AppShell>
  );
}
