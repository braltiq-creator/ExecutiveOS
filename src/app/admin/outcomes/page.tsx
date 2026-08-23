import { requireAppAccess } from "@/lib/auth/access";
import { requireSystemAdmin } from "@/lib/observability/health";
import { ForbiddenError } from "@/lib/errors";
import { AppShell } from "@/components/layout/AppShell";
import { OutcomesEngineDashboard } from "@/components/admin/OutcomesEngineDashboard";
import {
  buildOutcomesDashboard,
  generatePilotSuccessReport,
  listExecutiveOutcomes,
  trackRecommendation,
  createExecutiveOutcome,
  recordExecutiveAction,
} from "@/outcomes";
import { listPilots } from "@/pilot";
import { getTenant } from "@/runtime/tenant";

function resolveTenantContext(): {
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
    typeof northline?.configuration.intelligenceProfileId === "string" &&
    northline.configuration.intelligenceProfileId === "commercial_executive"
      ? ("commercial_executive" as const)
      : ("operations_executive" as const);
  return { tenantId: "tenant-northline", profileId };
}

export default async function AdminOutcomesPage() {
  const user = await requireAppAccess({ requireOnboarding: false });
  const allowed = await requireSystemAdmin(user.id, user.email ?? null);

  if (!allowed) {
    throw new ForbiddenError("System administration access is required.");
  }

  const { tenantId, profileId } = resolveTenantContext();

  // Seed a lightweight demo trail when empty so the command centre is usable
  if (listExecutiveOutcomes(tenantId).length === 0) {
    const rec = trackRecommendation({
      tenantId,
      profileId,
      title: "Prioritise today's top executive focus",
      businessQuestion: "What should I focus on today?",
      scenarioId:
        profileId === "commercial_executive"
          ? "com-prioritise-today"
          : "ops-focus-today",
      evidence: ["Today recommended actions"],
    });
    const action = recordExecutiveAction({
      tenantId,
      kind:
        profileId === "commercial_executive"
          ? "contacted_strategic_customer"
          : "reassigned_operational_resources",
      recommendationId: rec.id,
      detail: "Captured from Outcomes admin seed",
    });
    createExecutiveOutcome({
      tenantId,
      profileId,
      name: "Executive orientation improved",
      businessQuestion: rec.businessQuestion,
      recommendation: rec.title,
      recommendationId: rec.id,
      executiveActionId: action.id,
      scenarioId: rec.scenarioId,
      businessOutcomeKind: "executive_time_saved",
      observedOutcome: "Executive acted on Today priority without inbox triage",
      evidence: ["Recommendation accepted", "Action captured"],
      confidence: 62,
    });
  }

  const dashboard = buildOutcomesDashboard({ tenantId, profileId });
  const report = generatePilotSuccessReport({
    tenantId,
    profileId,
    kind: "day_30",
  });

  return (
    <AppShell breadcrumb="Outcomes" maxWidth="6xl">
      <OutcomesEngineDashboard
        dashboard={dashboard}
        reportMarkdown={report.markdown}
      />
    </AppShell>
  );
}
