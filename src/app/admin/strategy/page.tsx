import { requireAppAccess } from "@/lib/auth/access";
import { requireSystemAdmin } from "@/lib/observability/health";
import { ForbiddenError } from "@/lib/errors";
import { AppShell } from "@/components/layout/AppShell";
import { StrategicOutcomesDashboard } from "@/components/admin/StrategicOutcomesDashboard";
import {
  buildStrategyDashboard,
  listStrategicOutcomes,
  seedStrategicOutcomesFromDiscovery,
  linkStrategicInitiative,
  recordStrategicMetric,
  updateStrategicOutcomeHealth,
} from "@/strategy";
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

export default async function AdminStrategyPage() {
  const user = await requireAppAccess({ requireOnboarding: false });
  const allowed = await requireSystemAdmin(user.id, user.email ?? null);

  if (!allowed) {
    throw new ForbiddenError("System administration access is required.");
  }

  const { tenantId, profileId } = resolveTenant();

  if (listStrategicOutcomes(tenantId).length === 0) {
    const seeded = seedStrategicOutcomesFromDiscovery({
      tenantId,
      profileId,
      names: [
        "Improve operational reliability",
        "Grow profitable revenue",
        "Strengthen strategic customer retention",
      ],
      owner: "CEO",
    });
    if (seeded[0]) {
      updateStrategicOutcomeHealth({
        id: seeded[0].id,
        health: "on_track",
        confidence: 68,
        evidence: ["Initiative progress improving"],
      });
      linkStrategicInitiative({
        tenantId,
        outcomeId: seeded[0].id,
        name: "Reliability operating rhythm",
        owner: "COO",
        status: "active",
        progressPct: 45,
        scenarioIds: ["ops-capacity-constrained", "ops-focus-today"],
        evidence: ["Capacity rebalance episodes"],
      });
      recordStrategicMetric({
        tenantId,
        outcomeId: seeded[0].id,
        label: "On-time delivery",
        currentValue: 82,
        targetValue: 95,
        unit: "percent",
        trend: "up",
      });
    }
    if (seeded[1]) {
      linkStrategicInitiative({
        tenantId,
        outcomeId: seeded[1].id,
        name: "Commercial focus discipline",
        owner: "CRO",
        status: "active",
        progressPct: 30,
        scenarioIds: ["com-prioritise-today"],
      });
    }
  }

  const dashboard = buildStrategyDashboard({
    tenantId,
    recommendations: [
      {
        id: "demo-rec-1",
        title: "Rebalance capacity for at-risk jobs",
        detail: "Operational reliability and delivery risk",
      },
      {
        id: "demo-rec-2",
        title: "Contact strategic account this week",
        detail: "Customer retention and commercial relationship",
      },
    ],
  });

  return (
    <AppShell breadcrumb="Strategy" maxWidth="6xl">
      <StrategicOutcomesDashboard dashboard={dashboard} />
    </AppShell>
  );
}
