import { requireAppAccess } from "@/lib/auth/access";
import { requireSystemAdmin } from "@/lib/observability/health";
import { ForbiddenError } from "@/lib/errors";
import { AppShell } from "@/components/layout/AppShell";
import { TrustExplainabilityDashboard } from "@/components/admin/TrustExplainabilityDashboard";
import {
  attachTrustExplanationsToTodayActions,
  buildTrustDashboard,
  listExplanations,
} from "@/trust";
import { buildExecutiveSnapshotForUi } from "@/intelligence/executive-intelligence";
import { MOCK_OUTCOME_PORTFOLIO } from "@/lib/outcomes/mock-portfolio";
import { attachScenariosToTodayActions } from "@/scenarios";
import { attachMemoryRecallToTodayActions } from "@/memory";
import { attachStrategicOutcomesToTodayActions } from "@/strategy";
import { listPilots } from "@/pilot";
import { getTenant } from "@/runtime/tenant";

function resolveTenant(): {
  tenantId: string;
  profileId: "operations_executive" | "commercial_executive";
} {
  const pilots = listPilots();
  if (pilots[0]) {
    return {
      tenantId: pilots[0].tenantId,
      profileId: pilots[0].intelligenceProfileId,
    };
  }
  const northline = getTenant("tenant-northline");
  const profileId =
    northline?.configuration.intelligenceProfileId === "commercial_executive"
      ? ("commercial_executive" as const)
      : ("operations_executive" as const);
  return { tenantId: "tenant-northline", profileId };
}

export default async function AdminTrustPage() {
  const user = await requireAppAccess({ requireOnboarding: false });
  const allowed = await requireSystemAdmin(user.id, user.email ?? null);

  if (!allowed) {
    throw new ForbiddenError("System administration access is required.");
  }

  const { tenantId, profileId } = resolveTenant();

  if (listExplanations(tenantId).length === 0) {
    const core = buildExecutiveSnapshotForUi(MOCK_OUTCOME_PORTFOLIO);
    const withScenarios = attachScenariosToTodayActions(
      core,
      profileId,
      tenantId,
    );
    const withMemory = attachMemoryRecallToTodayActions(
      withScenarios,
      tenantId,
      profileId,
    );
    const withStrategy = attachStrategicOutcomesToTodayActions(
      withMemory,
      tenantId,
      profileId,
    );
    attachTrustExplanationsToTodayActions(withStrategy, tenantId, profileId);
  }

  const dashboard = buildTrustDashboard({ tenantId });

  return (
    <AppShell breadcrumb="Trust" maxWidth="6xl">
      <TrustExplainabilityDashboard dashboard={dashboard} />
    </AppShell>
  );
}
