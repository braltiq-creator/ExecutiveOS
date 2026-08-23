/**
 * Pack-local Reality Lab apply helpers.
 * Mutates simulation context via Twin events + provider overlay.
 * Does not introduce Core manufacturing entity types.
 */

import type { BusinessEvent } from "@/connectors/types";
import type { EnterpriseDataProvider } from "@/intelligence/executive-intelligence/providers/enterprise-data-provider";
import type { EnterpriseSignals } from "@/intelligence/executive-intelligence/types";
import type { ExecutiveScenario, SimulationContext } from "@/simulation/types";

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

/** Map pack Focus Outcomes onto common mock portfolio outcome ids when present. */
const OUTCOME_PRESSURE_FALLBACKS: Record<string, string[]> = {
  "mfg-outcome-inventory": ["outcome-efficiency", "outcome-board"],
  "mfg-outcome-working-capital": ["outcome-board", "outcome-efficiency"],
  "mfg-outcome-forecast": ["outcome-enterprise-arr", "outcome-retention"],
  "mfg-outcome-dealer": ["outcome-retention", "outcome-enterprise-arr"],
  "mfg-outcome-utilisation": ["outcome-efficiency"],
  "mfg-outcome-lead-time": ["outcome-efficiency", "outcome-retention"],
  "mfg-outcome-supply-resilience": ["outcome-efficiency", "outcome-board"],
  "mfg-outcome-margin": ["outcome-efficiency", "outcome-enterprise-arr"],
  "mfg-outcome-share": ["outcome-enterprise-arr", "outcome-retention"],
  "mfg-outcome-future-fit": ["outcome-board", "outcome-enterprise-arr"],
};

function resolvePressureOutcomeId(
  signals: EnterpriseSignals,
  packOutcomeId: string,
): string {
  const ids = new Set(signals.outcomes.map((o) => o.id));
  if (ids.has(packOutcomeId)) return packOutcomeId;
  for (const candidate of OUTCOME_PRESSURE_FALLBACKS[packOutcomeId] ?? []) {
    if (ids.has(candidate)) return candidate;
  }
  return signals.outcomes[0]?.id ?? packOutcomeId;
}

function createManufacturingOverlayProvider(
  base: EnterpriseSignals,
  outcomeId: string,
  healthDelta: number,
  decisionQuestion: string,
  severity: ExecutiveScenario["severity"],
  organisationId: string,
  decisionId: string,
): EnterpriseDataProvider {
  const outcomes = base.outcomes.map((outcome) => {
    if (outcome.id !== outcomeId) return outcome;
    const healthScore = clamp(outcome.healthScore + healthDelta, 20, 95);
    return {
      ...outcome,
      healthScore,
      status:
        healthScore < 48
          ? ("off_track" as const)
          : healthScore < 70
            ? ("at_risk" as const)
            : outcome.status,
      yesterdayMovement: healthDelta,
      yesterdayMovementLabel: `Manufacturing scenario pressure on ${outcome.name}`,
      overnightSignals: [
        ...outcome.overnightSignals,
        {
          id: `overnight-mfg-${organisationId}-${outcomeId}`,
          severity:
            severity === "critical"
              ? ("critical" as const)
              : severity === "high"
                ? ("attention" as const)
                : ("info" as const),
          whatChanged: `Manufacturing Reality Lab pressure on ${outcome.name}`,
          why: decisionQuestion,
        },
      ],
      blockers: [
        {
          id: `blocker-mfg-${outcomeId}`,
          title: "Manufacturing scenario-driven blocker",
          severity:
            severity === "critical"
              ? ("critical" as const)
              : ("attention" as const),
        },
        ...outcome.blockers,
      ],
    };
  });

  const decisions = [
    {
      id: decisionId,
      question: decisionQuestion,
      status: "due_today" as const,
      owner: base.executiveName,
      deadline: base.asOf.slice(0, 10),
      confidence: severity === "critical" ? 58 : 70,
      businessImpact:
        "Material to manufacturing Focus Outcomes under Reality Lab pressure.",
      expectedOutcomeImpact:
        "Stabilises cash, capacity, or channel under scenario stress.",
      costOfDelay: "Delay compounds factory, dealer, or working-capital damage.",
      whatChanged: "Manufacturing Executive Intelligence Pack scenario applied.",
      why: decisionQuestion,
      outcomeIds: [outcomeId],
      stakeholderCount: 5,
      evidenceCount: 4,
      systems: [
        "Manufacturing Intelligence Pack",
        "Reality Lab",
        "Enterprise Digital Twin",
      ],
    },
    ...base.decisions,
  ];

  const overallScore = Math.round(
    outcomes.reduce((sum, outcome) => sum + outcome.healthScore, 0) /
      Math.max(1, outcomes.length),
  );

  return {
    id: `provider-mfg-scenario-${organisationId}`,
    label: "Manufacturing Reality Lab scenario provider",
    getSignals: () => ({
      ...base,
      overallScore,
      outcomes,
      decisions,
    }),
  };
}

export function manufacturingScenarioEvent(input: {
  asOf: string;
  id: string;
  label: string;
  importance: number;
  packEventId: string;
  relatedOutcomeIds: string[];
}): BusinessEvent {
  return {
    id: input.id,
    timestamp: input.asOf,
    sourceSystem: "manual",
    entityType: "Signal",
    entityId: `signal-${input.packEventId}`,
    eventType: "signal_emitted",
    importance: input.importance,
    confidence: 78,
    relationships: input.relatedOutcomeIds.map((outcomeId) => ({
      type: "affects",
      targetEntityId: outcomeId,
      targetEntityType: "Outcome" as const,
    })),
    payload: {
      label: input.label,
      packEventId: input.packEventId,
      industry: "manufacturing",
    },
    metadata: {
      connectorId: "pack-manufacturing-executive",
      labels: ["manufacturing", "reality-lab", input.packEventId],
    },
  };
}

export function defineManufacturingScenario(input: {
  id: string;
  kind: string;
  name: string;
  description: string;
  severity: ExecutiveScenario["severity"];
  packOutcomeId: string;
  healthDelta: number;
  decisionQuestion: string;
  packEventId: string;
  relatedOutcomeIds: string[];
}): ExecutiveScenario {
  return {
    id: input.id,
    kind: input.kind,
    name: input.name,
    description: input.description,
    severity: input.severity,
    apply(context: SimulationContext): SimulationContext {
      const importance =
        input.severity === "critical" ? 92 : input.severity === "high" ? 82 : 68;
      const events = [
        manufacturingScenarioEvent({
          asOf: context.asOf,
          id: `${input.id}-evt`,
          label: input.name,
          importance,
          packEventId: input.packEventId,
          relatedOutcomeIds: input.relatedOutcomeIds,
        }),
      ];
      context.twin.apply(events);

      const baseSignals = context.provider.getSignals();
      const pressureOutcomeId = resolvePressureOutcomeId(
        baseSignals,
        input.packOutcomeId,
      );
      const overlayProvider = createManufacturingOverlayProvider(
        baseSignals,
        pressureOutcomeId,
        input.healthDelta,
        input.decisionQuestion,
        input.severity,
        context.organisationId,
        `decision-${input.id}`,
      );

      return {
        ...context,
        provider: overlayProvider,
        seedEvents: [...context.seedEvents, ...events],
      };
    },
  };
}
