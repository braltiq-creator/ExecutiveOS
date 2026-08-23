import { requireAppAccess } from "@/lib/auth/access";
import { requireSystemAdmin } from "@/lib/observability/health";
import { ForbiddenError } from "@/lib/errors";
import { AppShell } from "@/components/layout/AppShell";
import { OrganisationalMemoryDashboard } from "@/components/admin/OrganisationalMemoryDashboard";
import {
  buildMemoryDashboard,
  listEpisodes,
  recordMemoryEpisode,
  recordMemoryDecision,
  captureLesson,
  addTimelineEvent,
  recallOrganisationalMemory,
} from "@/memory";
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

export default async function AdminMemoryPage() {
  const user = await requireAppAccess({ requireOnboarding: false });
  const allowed = await requireSystemAdmin(user.id, user.email ?? null);

  if (!allowed) {
    throw new ForbiddenError("System administration access is required.");
  }

  const { tenantId, profileId } = resolveTenant();

  if (listEpisodes(tenantId).length === 0) {
    const ep1 = recordMemoryEpisode({
      tenantId,
      profileId,
      name: "Capacity shortage — field rebalance",
      businessQuestion: "Where is operational capacity constrained?",
      context:
        "Overnight capacity shortage in northern crew; executive reallocated technicians.",
      scenarioId: "ops-capacity-constrained",
      decision: "Reallocate two technicians for 48 hours",
      actionsTaken: ["Reassigned operational resources"],
      observedOutcome: "Bottleneck cleared same day",
      lessonsLearned: [
        "Early reallocation beats late overtime",
        "Confirm crew lead before moving people",
      ],
      participants: ["COO", "Ops Manager"],
      evidence: ["Capacity signal", "Utilisation spike"],
      confidence: 78,
      timestamp: "2026-07-20T08:00:00.000Z",
    });
    recordMemoryEpisode({
      tenantId,
      profileId,
      name: "Capacity shortage — repeat pattern",
      businessQuestion: "Where is operational capacity constrained?",
      context:
        "Second capacity shortage within two weeks; same region under pressure.",
      scenarioId: "ops-capacity-constrained",
      decision: "Approve temporary contractor cover",
      actionsTaken: ["Approved investment"],
      observedOutcome: "Service levels stabilised",
      lessonsLearned: ["Track regional capacity weekly"],
      participants: ["COO"],
      confidence: 72,
      timestamp: "2026-07-24T08:00:00.000Z",
    });
    recordMemoryDecision({
      tenantId,
      kind: "resource_reallocation",
      title: "Northern crew reallocation",
      profileId,
      summary: "Moved capacity to clear bottleneck before customer impact.",
      decidedBy: "COO",
      scenarioId: "ops-capacity-constrained",
      episodeId: ep1.id,
      businessEvidence: ["Capacity constrained", "Jobs at risk rising"],
      decidedAt: "2026-07-20T09:00:00.000Z",
    });
    captureLesson({
      tenantId,
      episodeId: ep1.id,
      whatWorked: ["Same-day reallocation"],
      whatFailed: ["Late detection on first occurrence"],
      futureRecommendations: ["Watch regional utilisation thresholds daily"],
      tags: ["capacity", "operations"],
      capturedBy: "COO",
    });
    addTimelineEvent({
      tenantId,
      kind: "operational_disruption",
      title: "Northern capacity disruption",
      detail: "Crew utilisation exceeded sustainable threshold",
      at: "2026-07-20T07:30:00.000Z",
      importance: "high",
    });
    recallOrganisationalMemory({
      tenantId,
      query: "Where is operational capacity constrained?",
    });
  }

  const dashboard = buildMemoryDashboard({ tenantId });

  return (
    <AppShell breadcrumb="Memory" maxWidth="6xl">
      <OrganisationalMemoryDashboard dashboard={dashboard} />
    </AppShell>
  );
}
