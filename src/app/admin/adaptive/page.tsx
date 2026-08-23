import { requireAppAccess } from "@/lib/auth/access";
import { requireSystemAdmin } from "@/lib/observability/health";
import { ForbiddenError } from "@/lib/errors";
import { AppShell } from "@/components/layout/AppShell";
import { AdaptiveIntelligenceDashboard } from "@/components/admin/AdaptiveIntelligenceDashboard";
import {
  buildAdaptiveDashboard,
  captureExecutiveFeedback,
  listAdaptiveProfiles,
  recordAdaptiveBehaviour,
  runAdaptiveLearningCycle,
} from "@/adaptive";
import { listPilots, provisionDesignPartner } from "@/pilot";
import { syncPartnersFromPilots } from "@/operations";

function seedAdaptiveIfEmpty() {
  if (listAdaptiveProfiles().length > 0) return;

  if (listPilots().length === 0) {
    provisionDesignPartner({
      partnerName: "Adaptive Ops Pilot",
      industry: "Field Services",
      intelligenceProfileId: "operations_executive",
      administratorEmail: "admin@adaptive-ops.test",
      region: "au",
    });
    syncPartnersFromPilots();
  }

  const pilot = listPilots()[0];
  if (!pilot) return;

  const tenantId = pilot.tenantId;
  const executiveId = "executive-primary";
  const profileId = pilot.intelligenceProfileId;

  runAdaptiveLearningCycle({ tenantId, executiveId, profileId });
  recordAdaptiveBehaviour({
    tenantId,
    executiveId,
    profileId,
    kind: "recommendation_view",
    recommendationId: "rec-adaptive-1",
  });
  captureExecutiveFeedback({
    tenantId,
    executiveId,
    profileId,
    recommendationId: "rec-adaptive-1",
    disposition: "accepted",
  });
  captureExecutiveFeedback({
    tenantId,
    executiveId,
    profileId,
    recommendationId: "rec-adaptive-2",
    disposition: "ignored",
  });
  captureExecutiveFeedback({
    tenantId,
    executiveId,
    profileId,
    recommendationId: "rec-adaptive-1",
    disposition: "roi_confirmed",
  });
}

export default async function AdminAdaptivePage() {
  const user = await requireAppAccess({ requireOnboarding: false });
  const allowed = await requireSystemAdmin(user.id, user.email ?? null);
  if (!allowed) {
    throw new ForbiddenError("System administration access is required.");
  }

  seedAdaptiveIfEmpty();
  const dashboard = buildAdaptiveDashboard();

  return (
    <AppShell breadcrumb="Adaptive Intelligence" maxWidth="6xl">
      <AdaptiveIntelligenceDashboard dashboard={dashboard} />
    </AppShell>
  );
}
