import { requireAppAccess } from "@/lib/auth/access";
import { requireSystemAdmin } from "@/lib/observability/health";
import { ForbiddenError } from "@/lib/errors";
import { AppShell } from "@/components/layout/AppShell";
import { PilotReadinessDashboard } from "@/components/admin/PilotReadinessDashboard";
import {
  listPilots,
  buildPilotHealthSnapshot,
  getPlaybook,
  buildSupportGuidance,
  exportAllPilotDocuments,
} from "@/pilot";

export default async function AdminPilotsPage() {
  const user = await requireAppAccess({ requireOnboarding: false });
  const allowed = await requireSystemAdmin(user.id, user.email ?? null);

  if (!allowed) {
    throw new ForbiddenError("System administration access is required.");
  }

  const pilots = listPilots();
  const rows = pilots.map((pilot) => {
    const profileId = pilot.intelligenceProfileId;
    return {
      pilot,
      health: buildPilotHealthSnapshot({
        tenantId: pilot.tenantId,
        profileId,
      }),
      playbook: getPlaybook(profileId),
      support: buildSupportGuidance({
        tenantId: pilot.tenantId,
        profileId,
      }),
      exports: exportAllPilotDocuments({
        tenantId: pilot.tenantId,
        profileId,
      }),
    };
  });

  return (
    <AppShell breadcrumb="Pilots" maxWidth="6xl">
      <PilotReadinessDashboard rows={rows} />
    </AppShell>
  );
}
