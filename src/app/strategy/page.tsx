import { Suspense } from "react";
import { requireAppAccess } from "@/lib/auth/access";
import { AppFrame } from "@/components/layout/AppFrame";
import { DecisionEngineProviders } from "@/components/providers/DecisionEngineProviders";
import { StrategyWorkspace } from "@/experience/strategy-workspace";
import {
  buildStrategyDashboard,
  listStrategicOutcomes,
  seedStrategicOutcomesFromDiscovery,
  linkStrategicInitiative,
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

export default async function StrategyPage() {
  await requireAppAccess({ requireOnboarding: false });

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
    <DecisionEngineProviders>
      <AppFrame title="Strategy" density="snapshot">
        <Suspense fallback={<StrategyWorkspaceFallback />}>
          <StrategyWorkspace dashboard={dashboard} />
        </Suspense>
      </AppFrame>
    </DecisionEngineProviders>
  );
}

function StrategyWorkspaceFallback() {
  return (
    <div
      className="mx-auto w-full max-w-[1200px] space-y-4 pb-16"
      aria-hidden="true"
    >
      <div className="ex-skeleton h-24 w-full" />
      <div className="ex-skeleton h-40 w-full" />
      <div className="ex-skeleton h-32 w-full" />
    </div>
  );
}
