import type { AdoptionHealthSnapshot } from "@/operations/observability/types";
import { listPilots } from "@/pilot";
import { measureAdoption } from "@/operations/adoption";

export function monitorAdoptionHealth(
  asOf = new Date().toISOString(),
): AdoptionHealthSnapshot {
  const pilots = listPilots();
  if (pilots.length === 0) {
    return {
      asOf,
      briefAdoptionPct: 0,
      moduleAdoptionPct: 0,
      providerAdoptionPct: 0,
      state: "unknown",
      explanation: "No design partners provisioned yet.",
      trend: [{ at: asOf, value: 0 }],
    };
  }

  let brief = 0;
  let modules = 0;
  let providers = 0;
  for (const pilot of pilots) {
    const adoption = measureAdoption({
      tenantId: pilot.tenantId,
      profileId: pilot.intelligenceProfileId,
      asOf,
    });
    brief += adoption.briefAdoptionPct;
    modules += adoption.score;
    providers += adoption.providersConnectedPct;
  }

  const n = pilots.length;
  const briefAdoptionPct = Math.round(brief / n);
  const moduleAdoptionPct = Math.round(modules / n);
  const providerAdoptionPct = Math.round(providers / n);
  const composite = Math.round(
    (briefAdoptionPct + moduleAdoptionPct + providerAdoptionPct) / 3,
  );
  const state =
    composite < 40 ? "critical" : composite < 65 ? "degraded" : "healthy";

  return {
    asOf,
    briefAdoptionPct,
    moduleAdoptionPct,
    providerAdoptionPct,
    state,
    explanation: `Portfolio adoption ${composite}% (brief ${briefAdoptionPct}%, modules ${moduleAdoptionPct}%, providers ${providerAdoptionPct}%).`,
    trend: [{ at: asOf, value: composite }],
  };
}
