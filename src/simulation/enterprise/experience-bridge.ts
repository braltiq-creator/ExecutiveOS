/**
 * Bridge Reality Lab org portfolios into experience-layer views.
 * Presentation-only — no provider or routing changes.
 */

import { buildExecutiveSnapshotForUi } from "@/intelligence/executive-intelligence";
import type { Decision } from "@/lib/decisions/engine-types";
import type { Outcome, OutcomePortfolio } from "@/lib/outcomes/types";
import type { ExecutiveSnapshot } from "@/lib/snapshot/types";
import {
  buildStrategyDashboard,
  listStrategicOutcomes,
  seedStrategicOutcomesFromDiscovery,
  type StrategicOutcome,
} from "@/strategy";
import type { StrategyDashboard } from "@/strategy/framework/types";
import type { ExecutiveScenario, SimulatedOrganisation } from "@/simulation/types";

export type ExperienceSurface = {
  tenantId: string;
  snapshot: ExecutiveSnapshot;
  decisions: Decision[];
  outcomes: Outcome[];
  strategicOutcomes: StrategicOutcome[];
  dashboard: StrategyDashboard;
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

const SCENARIO_OUTCOME_TARGET: Record<string, string> = {
  "scenario-customer-churn": "outcome-enterprise-arr",
  "scenario-cyber-incident": "outcome-board",
  "scenario-board-prep": "outcome-board",
  "scenario-acquisition": "outcome-enterprise-arr",
  "scenario-budget-reduction": "outcome-efficiency",
  "scenario-regulatory": "outcome-board",
  "scenario-outage": "outcome-enterprise-arr",
  "scenario-resignation": "outcome-efficiency",
  "scenario-expansion": "outcome-enterprise-arr",
  "scenario-large-deal-won": "outcome-enterprise-arr",
  "scenario-safety-incident": "outcome-board",
  "scenario-forecast-miss": "outcome-enterprise-arr",
  "scenario-rapid-growth": "outcome-enterprise-arr",
  "scenario-market-contraction": "outcome-enterprise-arr",
  "scenario-supply-chain": "outcome-efficiency",
  "scenario-budget-overrun": "outcome-efficiency",
};

function healthDeltaFor(severity: ExecutiveScenario["severity"]): number {
  if (severity === "critical") return -18;
  if (severity === "high") return -12;
  return 6;
}

function scenarioDecision(
  portfolio: OutcomePortfolio,
  scenario: ExecutiveScenario,
  organisationId: string,
  outcomeId: string,
): Decision {
  return {
    id: `decision-scenario-${organisationId}`,
    question: scenario.description,
    outcomeIds: [outcomeId],
    status: "due_today",
    owner: portfolio.executiveName,
    deadline: "Today",
    confidence: scenario.severity === "critical" ? 62 : 72,
    businessImpact: "Material to Focus Outcomes under scenario pressure.",
    expectedOutcomeImpact: "Stabilises or unlocks the stressed Outcome.",
    costOfDelay: "Delay compounds scenario damage.",
    whatChanged: `${scenario.name} applied in Enterprise Simulation.`,
    why: scenario.description,
    whatShouldHappenNext: "Form executive judgement with Council input.",
    stakeholders: [],
    evidence: [
      {
        id: `ev-${scenario.id}`,
        title: scenario.name,
        source: "Enterprise Simulation",
        summary: scenario.description,
        asOf: portfolio.refreshedAt,
      },
    ],
    alternatives: [
      {
        id: "alt-act",
        label: "Act now",
        summary: "Commit executive posture today.",
        upside: "Contains scenario damage.",
        downside: "Consumes attention budget.",
      },
      {
        id: "alt-watch",
        label: "Watch",
        summary: "Defer until more evidence arrives.",
        upside: "Preserves optionality.",
        downside: "Delay compounds risk.",
      },
    ],
    tradeOffs: [
      {
        id: "to-speed",
        dimension: "Speed vs certainty",
        choice: "Bias to decisive action under pressure",
        consequence: "Accept residual uncertainty for containment.",
      },
    ],
    relationships: [],
    timeline: [
      {
        id: `tl-${scenario.id}`,
        at: portfolio.refreshedAt,
        title: scenario.name,
        detail: scenario.description,
        kind: "opened",
      },
    ],
    history: [],
    approvalWorkflow: [
      {
        id: "step-1",
        label: "Executive judgement",
        owner: portfolio.executiveName,
        status: "current",
      },
    ],
    recommendationSummary:
      "Act with compensating controls, clear owners, and Council challenge.",
  };
}

/**
 * Apply scenario pressure onto a cloned portfolio so experience derives
 * observe the same stress as Reality Lab overlays.
 */
export function applyScenarioPressureToPortfolio(
  portfolio: OutcomePortfolio,
  scenario: ExecutiveScenario,
  organisationId: string,
): OutcomePortfolio {
  const targetId =
    SCENARIO_OUTCOME_TARGET[scenario.id] ?? "outcome-enterprise-arr";
  const delta = healthDeltaFor(scenario.severity);

  return {
    ...portfolio,
    outcomes: portfolio.outcomes.map((outcome) => {
      if (outcome.id !== targetId) return outcome;
      const nextHealth = clamp(outcome.healthScore + delta, 20, 95);
      return {
        ...outcome,
        healthScore: nextHealth,
        yesterdayMovement: delta,
        yesterdayMovementLabel: `Scenario pressure on ${outcome.name}`,
        status:
          nextHealth < 48
            ? ("off_track" as const)
            : nextHealth < 70
              ? ("at_risk" as const)
              : outcome.status,
        overnightSignals: [
          {
            id: `sim-overnight-${organisationId}-${scenario.id}`,
            occurredAt: portfolio.refreshedAt,
            severity:
              scenario.severity === "critical"
                ? ("critical" as const)
                : scenario.severity === "high"
                  ? ("attention" as const)
                  : ("info" as const),
            whatChanged: `${scenario.name} pressure applied`,
            why: scenario.description,
            whatShouldHappenNext:
              "Route through Command Centre → Council → Decision without delay.",
            recommendation: {
              businessImpact: "Contains enterprise damage under scenario pressure.",
              expectedOutcomeImpact: `Stabilises ${outcome.name}.`,
              confidence: scenario.severity === "critical" ? 70 : 78,
              owner: portfolio.executiveName,
              deadline: "Today",
            },
          },
          ...outcome.overnightSignals,
        ],
        blockers: [
          {
            id: `sim-blocker-${scenario.id}`,
            title: `${scenario.name} blocker`,
            description: scenario.description,
            severity:
              scenario.severity === "critical"
                ? ("critical" as const)
                : ("attention" as const),
            owner: portfolio.executiveName,
            since: portfolio.refreshedAt.slice(0, 10),
          },
          ...outcome.blockers,
        ],
      };
    }),
    decisions: [
      scenarioDecision(portfolio, scenario, organisationId, targetId),
      ...portfolio.decisions,
    ],
  };
}

function ensureStrategicOutcomes(tenantId: string): StrategicOutcome[] {
  const existing = listStrategicOutcomes(tenantId);
  if (existing.length > 0) return existing;
  return seedStrategicOutcomesFromDiscovery({
    tenantId,
    profileId: "operations_executive",
    names: [
      "Improve operational reliability",
      "Grow profitable revenue",
      "Strengthen strategic customer retention",
    ],
    owner: "CEO",
  });
}

/**
 * Build experience surfaces from an organisation × scenario without
 * mutating global providers.
 */
export function buildExperienceSurface(input: {
  organisation: SimulatedOrganisation;
  scenario: ExecutiveScenario;
}): ExperienceSurface {
  const base = input.organisation.createContext();
  if (!base.portfolio) {
    throw new Error(
      `Enterprise simulation requires a portfolio-backed organisation (${input.organisation.id}).`,
    );
  }

  const portfolio = applyScenarioPressureToPortfolio(
    base.portfolio,
    input.scenario,
    input.organisation.id,
  );

  const tenantId = `tenant-sim-${input.organisation.id}`;
  const strategicOutcomes = ensureStrategicOutcomes(tenantId);
  const snapshot = buildExecutiveSnapshotForUi(portfolio);
  const dashboard = buildStrategyDashboard({
    tenantId,
    asOf: snapshot.asOf,
    recommendations: snapshot.recommendedActions.slice(0, 3).map((action) => ({
      id: action.id,
      title: action.title,
      detail: action.why,
    })),
  });

  return {
    tenantId,
    snapshot,
    decisions: portfolio.decisions,
    outcomes: portfolio.outcomes,
    strategicOutcomes,
    dashboard,
  };
}
