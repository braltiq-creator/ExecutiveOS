import type { BusinessEvent } from "@/connectors/types";
import type { EnterpriseSignals } from "@/intelligence/executive-intelligence/types";
import type { EnterpriseDataProvider } from "@/intelligence/executive-intelligence/providers/enterprise-data-provider";
import type {
  ExecutiveScenario,
  ScenarioKind,
  SimulationContext,
} from "@/simulation/types";
import { FIELD_SERVICES_SCENARIOS } from "@/industry/field-services/simpro/scenarios";

export { FIELD_SERVICES_SCENARIOS };

/**
 * Scenario catalogue — realistic executive pressure tests.
 * Each scenario overlays Twin events and signal pressure deterministically.
 */
export const EXECUTIVE_SCENARIOS: ExecutiveScenario[] = [
  scenario({
    id: "scenario-customer-churn",
    kind: "major_customer_churn",
    name: "Major customer churn",
    description: "A strategic logo signals intent to churn within the quarter.",
    severity: "critical",
    outcomeId: "outcome-enterprise-arr",
    healthDelta: -18,
    decisionQuestion: "How should leadership respond to strategic logo churn risk?",
    events: (asOf) => [
      event(asOf, "evt-churn-signal", "Signal", "signal-churn", "signal_emitted", 95, {
        label: "Strategic logo churn signal",
      }),
      event(asOf, "evt-churn-risk", "Risk", "risk-churn", "risk_raised", 92, {
        name: "Logo churn risk",
      }, ["outcome-enterprise-arr"]),
    ],
  }),
  scenario({
    id: "scenario-cyber-incident",
    kind: "cyber_incident",
    name: "Cyber incident",
    description: "Active security incident with customer and board exposure.",
    severity: "critical",
    outcomeId: "outcome-board",
    healthDelta: -22,
    decisionQuestion: "What is the executive bind on incident disclosure and containment?",
    events: (asOf) => [
      event(asOf, "evt-cyber", "Risk", "risk-cyber", "risk_raised", 98, {
        name: "Active cyber incident",
      }, ["outcome-board", "outcome-enterprise-arr"]),
    ],
  }),
  scenario({
    id: "scenario-board-prep",
    kind: "board_preparation",
    name: "Board preparation",
    description: "Board pack freeze approaching with incomplete risk language.",
    severity: "high",
    outcomeId: "outcome-board",
    healthDelta: -10,
    decisionQuestion: "Approve honest board disclosure language before pack freeze?",
    events: (asOf) => [
      event(asOf, "evt-board-meeting", "Meeting", "meeting-board-prep", "meeting_scheduled", 85, {
        subject: "Board pack working session",
      }, ["outcome-board"]),
    ],
  }),
  scenario({
    id: "scenario-acquisition",
    kind: "acquisition_opportunity",
    name: "Acquisition opportunity",
    description: "Inbound acquisition opportunity with diligence window.",
    severity: "high",
    outcomeId: "outcome-enterprise-arr",
    healthDelta: 4,
    decisionQuestion: "Pursue diligence on the inbound acquisition opportunity?",
    events: (asOf) => [
      event(asOf, "evt-acq", "Opportunity", "opp-acquisition", "opportunity_moved", 88, {
        name: "Inbound acquisition opportunity",
        stage: "Diligence",
      }, ["outcome-enterprise-arr"]),
    ],
  }),
  scenario({
    id: "scenario-budget-reduction",
    kind: "budget_reduction",
    name: "Budget reduction",
    description: "Forced opex reduction mid-quarter.",
    severity: "high",
    outcomeId: "outcome-efficiency",
    healthDelta: -12,
    decisionQuestion: "Where should budget reduction land without breaking Focus Outcomes?",
    events: (asOf) => [
      event(asOf, "evt-budget", "Signal", "signal-budget-cut", "signal_emitted", 80, {
        label: "Opex reduction mandate",
      }, ["outcome-efficiency"]),
    ],
  }),
  scenario({
    id: "scenario-regulatory",
    kind: "regulatory_investigation",
    name: "Regulatory investigation",
    description: "Regulator opens an investigation touching customer commitments.",
    severity: "critical",
    outcomeId: "outcome-board",
    healthDelta: -16,
    decisionQuestion: "Set executive posture for the regulatory investigation?",
    events: (asOf) => [
      event(asOf, "evt-reg", "Risk", "risk-regulatory", "risk_raised", 94, {
        name: "Regulatory investigation",
      }, ["outcome-board"]),
    ],
  }),
  scenario({
    id: "scenario-outage",
    kind: "operational_outage",
    name: "Operational outage",
    description: "Material operational outage affecting customers and SLA credits.",
    severity: "critical",
    outcomeId: "outcome-retention",
    healthDelta: -20,
    decisionQuestion: "Executive response to material operational outage?",
    events: (asOf) => [
      event(asOf, "evt-outage", "Risk", "risk-outage", "risk_raised", 96, {
        name: "Operational outage",
      }, ["outcome-retention", "outcome-enterprise-arr"]),
    ],
  }),
  scenario({
    id: "scenario-resignation",
    kind: "leadership_resignation",
    name: "Leadership resignation",
    description: "Key lieutenant resigns during a critical operating window.",
    severity: "high",
    outcomeId: "outcome-efficiency",
    healthDelta: -8,
    decisionQuestion: "Stabilize leadership coverage after resignation?",
    events: (asOf) => [
      event(asOf, "evt-resign", "Signal", "signal-resignation", "signal_emitted", 78, {
        label: "Leadership resignation",
      }, ["outcome-efficiency"]),
    ],
  }),
  scenario({
    id: "scenario-expansion",
    kind: "market_expansion",
    name: "Market expansion",
    description: "Greenfield market expansion proposal competing for attention.",
    severity: "moderate",
    outcomeId: "outcome-enterprise-arr",
    healthDelta: 6,
    decisionQuestion: "Commit capital and attention to market expansion this quarter?",
    events: (asOf) => [
      event(asOf, "evt-expand", "Opportunity", "opp-expansion", "opportunity_moved", 76, {
        name: "Market expansion proposal",
        stage: "Proposal",
      }, ["outcome-enterprise-arr"]),
    ],
  }),
  scenario({
    id: "scenario-large-deal-won",
    kind: "large_deal_won",
    name: "Large deal won",
    description: "Strategic logo closed; delivery and capacity commitments now bind.",
    severity: "moderate",
    outcomeId: "outcome-enterprise-arr",
    healthDelta: 10,
    decisionQuestion: "Protect delivery for the new strategic logo without starving the core?",
    events: (asOf) => [
      event(asOf, "evt-deal-won", "Opportunity", "opp-deal-won", "opportunity_moved", 90, {
        name: "Strategic logo closed",
        stage: "Closed Won",
      }, ["outcome-enterprise-arr"]),
    ],
  }),
  scenario({
    id: "scenario-safety-incident",
    kind: "safety_incident",
    name: "Safety incident",
    description: "Material safety incident requiring executive posture and board awareness.",
    severity: "critical",
    outcomeId: "outcome-board",
    healthDelta: -18,
    decisionQuestion: "Set executive posture after the material safety incident?",
    events: (asOf) => [
      event(asOf, "evt-safety", "Risk", "risk-safety", "risk_raised", 97, {
        name: "Material safety incident",
      }, ["outcome-board", "outcome-efficiency"]),
    ],
  }),
  scenario({
    id: "scenario-forecast-miss",
    kind: "forecast_miss",
    name: "Forecast miss",
    description: "Material revenue forecast miss mid-quarter.",
    severity: "high",
    outcomeId: "outcome-enterprise-arr",
    healthDelta: -14,
    decisionQuestion: "Reset forecast narrative and recovery plan for the board?",
    events: (asOf) => [
      event(asOf, "evt-forecast", "Signal", "signal-forecast-miss", "signal_emitted", 88, {
        label: "Material forecast miss",
      }, ["outcome-enterprise-arr"]),
    ],
  }),
  scenario({
    id: "scenario-rapid-growth",
    kind: "rapid_growth",
    name: "Rapid growth",
    description: "Demand surge stressing delivery, cash, and leadership attention.",
    severity: "high",
    outcomeId: "outcome-enterprise-arr",
    healthDelta: 8,
    decisionQuestion: "Scale capacity and controls to absorb rapid growth safely?",
    events: (asOf) => [
      event(asOf, "evt-growth", "Opportunity", "opp-rapid-growth", "opportunity_moved", 84, {
        name: "Demand surge",
        stage: "Scale",
      }, ["outcome-enterprise-arr", "outcome-efficiency"]),
    ],
  }),
  scenario({
    id: "scenario-market-contraction",
    kind: "market_contraction",
    name: "Market contraction",
    description: "Demand contraction forces portfolio and cost trade-offs.",
    severity: "high",
    outcomeId: "outcome-enterprise-arr",
    healthDelta: -12,
    decisionQuestion: "Defend margin and Focus Outcomes under market contraction?",
    events: (asOf) => [
      event(asOf, "evt-contraction", "Signal", "signal-contraction", "signal_emitted", 86, {
        label: "Market contraction pressure",
      }, ["outcome-enterprise-arr", "outcome-efficiency"]),
    ],
  }),
  scenario({
    id: "scenario-supply-chain",
    kind: "supply_chain_disruption",
    name: "Supply chain disruption",
    description: "Critical supplier disruption threatens delivery commitments.",
    severity: "critical",
    outcomeId: "outcome-efficiency",
    healthDelta: -16,
    decisionQuestion: "Stabilize supply and customer commitments after disruption?",
    events: (asOf) => [
      event(asOf, "evt-supply", "Risk", "risk-supply", "risk_raised", 93, {
        name: "Critical supplier disruption",
      }, ["outcome-efficiency", "outcome-enterprise-arr"]),
    ],
  }),
  scenario({
    id: "scenario-budget-overrun",
    kind: "budget_overrun",
    name: "Budget overrun",
    description: "Material opex overrun against board-approved plan.",
    severity: "high",
    outcomeId: "outcome-efficiency",
    healthDelta: -11,
    decisionQuestion: "Contain the budget overrun without breaking strategic delivery?",
    events: (asOf) => [
      event(asOf, "evt-overrun", "Signal", "signal-budget-overrun", "signal_emitted", 82, {
        label: "Material budget overrun",
      }, ["outcome-efficiency"]),
    ],
  }),
];

function scenario(input: {
  id: string;
  kind: ScenarioKind;
  name: string;
  description: string;
  severity: ExecutiveScenario["severity"];
  outcomeId: string;
  healthDelta: number;
  decisionQuestion: string;
  events: (asOf: string) => BusinessEvent[];
}): ExecutiveScenario {
  return {
    id: input.id,
    kind: input.kind,
    name: input.name,
    description: input.description,
    severity: input.severity,
    apply(context: SimulationContext): SimulationContext {
      const events = input.events(context.asOf);
      context.twin.apply(events);

      const baseSignals = context.provider.getSignals();
      const overlayProvider = createOverlayProvider(
        baseSignals,
        input.outcomeId,
        input.healthDelta,
        input.decisionQuestion,
        input.severity,
        context.organisationId,
      );

      // Ensure graph has scenario risk/opportunity nodes
      for (const evt of events) {
        if (!context.graph.getEntity(evt.entityId)) {
          context.graph.addEntity({
            id: evt.entityId,
            type: mapEntity(evt.entityType),
            label:
              String(evt.payload.name ?? evt.payload.label ?? evt.payload.subject ?? evt.entityId),
          });
        }
        for (const rel of evt.relationships) {
          if (!context.graph.getEntity(rel.targetEntityId)) {
            context.graph.addEntity({
              id: rel.targetEntityId,
              type: "Outcome",
              label: rel.targetEntityId,
            });
          }
          const relId = `sim-rel-${evt.id}-${rel.targetEntityId}`;
          if (!context.graph.getRelationship(relId)) {
            try {
              context.graph.addRelationship({
                id: relId,
                type: rel.type === "increases" ? "increases" : "affects",
                fromId: evt.entityId,
                toId: rel.targetEntityId,
              });
            } catch {
              // endpoints may still be missing in light graphs — ignore
            }
          }
        }
      }

      return {
        ...context,
        provider: overlayProvider,
        seedEvents: [...context.seedEvents, ...events],
      };
    },
  };
}

function createOverlayProvider(
  base: EnterpriseSignals,
  outcomeId: string,
  healthDelta: number,
  decisionQuestion: string,
  severity: ExecutiveScenario["severity"],
  organisationId: string,
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
      yesterdayMovementLabel: `Scenario pressure on ${outcome.name}`,
      overnightSignals: [
        ...outcome.overnightSignals,
        {
          id: ` overnight-${organisationId}-${outcomeId}`,
          severity:
            severity === "critical"
              ? ("critical" as const)
              : severity === "high"
                ? ("attention" as const)
                : ("info" as const),
          whatChanged: `Scenario pressure applied to ${outcome.name}`,
          why: decisionQuestion,
        },
      ],
      blockers: [
        {
          id: `blocker-scenario-${outcomeId}`,
          title: "Scenario-driven blocker",
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
      id: `decision-scenario-${organisationId}`,
      question: decisionQuestion,
      status: "due_today",
      owner: base.executiveName,
      deadline: base.asOf.slice(0, 10),
      confidence: severity === "critical" ? 62 : 72,
      businessImpact: "Material to Focus Outcomes under scenario pressure.",
      expectedOutcomeImpact: "Stabilises or unlocks the stressed Outcome.",
      costOfDelay: "Delay compounds scenario damage.",
      whatChanged: "Reality Lab scenario applied.",
      why: decisionQuestion,
      outcomeIds: [outcomeId],
      stakeholderCount: 4,
      evidenceCount: 3,
      systems: ["Reality Lab", "Enterprise Digital Twin"],
    },
    ...base.decisions,
  ];

  const overallScore = Math.round(
    outcomes.reduce((sum, outcome) => sum + outcome.healthScore, 0) /
      Math.max(1, outcomes.length),
  );

  return {
    id: `provider-scenario-${organisationId}`,
    label: "Reality Lab scenario provider",
    getSignals: () => ({
      ...base,
      overallScore,
      outcomes,
      decisions,
    }),
  };
}

function event(
  asOf: string,
  id: string,
  entityType: BusinessEvent["entityType"],
  entityId: string,
  eventType: BusinessEvent["eventType"],
  importance: number,
  payload: Record<string, unknown>,
  related: string[] = [],
): BusinessEvent {
  return {
    id,
    timestamp: asOf,
    sourceSystem: "mock",
    entityType,
    entityId,
    eventType,
    importance,
    confidence: 85,
    relationships: related.map((targetEntityId) => ({
      type: "affects",
      targetEntityId,
      targetEntityType: "Outcome",
    })),
    payload,
    metadata: { connectorId: "reality-lab", labels: ["scenario"] },
  };
}

function mapEntity(
  type: BusinessEvent["entityType"],
): "Outcome" | "Decision" | "Risk" | "Opportunity" | "Meeting" | "Signal" {
  if (
    type === "Outcome" ||
    type === "Decision" ||
    type === "Risk" ||
    type === "Opportunity" ||
    type === "Meeting" ||
    type === "Signal"
  ) {
    return type;
  }
  return "Signal";
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

/** Core + industry scenario catalogues. */
export function getAllScenarios(): ExecutiveScenario[] {
  return [...EXECUTIVE_SCENARIOS, ...FIELD_SERVICES_SCENARIOS];
}

export function getScenario(id: string): ExecutiveScenario | undefined {
  return getAllScenarios().find((scenario) => scenario.id === id);
}
