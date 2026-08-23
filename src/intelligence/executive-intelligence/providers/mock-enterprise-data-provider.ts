import type { OutcomePortfolio } from "@/lib/outcomes/types";
import type { EnterpriseDataProvider } from "@/intelligence/executive-intelligence/providers/enterprise-data-provider";
import type {
  EnterpriseDecisionSignal,
  EnterpriseOutcomeSignal,
  EnterpriseSignals,
} from "@/intelligence/executive-intelligence/types";

/**
 * Mock provider — adapts current OutcomePortfolio SoT into
 * provider-agnostic enterprise signals.
 * Replace with Salesforce / M365 / Jira connectors without changing engines.
 */
export function createMockEnterpriseDataProvider(
  portfolio: OutcomePortfolio,
): EnterpriseDataProvider {
  return {
    id: "mock-portfolio",
    label: "Mock Enterprise Portfolio",
    getSignals(): EnterpriseSignals {
      return {
        asOf: portfolio.refreshedAt,
        executiveName: portfolio.executiveName,
        overallScore: portfolio.overallScore,
        outcomes: portfolio.outcomes.map(toOutcomeSignal),
        decisions: portfolio.decisions.map(toDecisionSignal),
      };
    },
  };
}

function toOutcomeSignal(
  outcome: OutcomePortfolio["outcomes"][number],
): EnterpriseOutcomeSignal {
  const systems = new Set<string>(["Outcome Engine"]);
  for (const insight of outcome.contributingInsights) {
    if (insight.sourceLabel) systems.add(insight.sourceLabel);
  }
  for (const signal of outcome.overnightSignals) {
    systems.add("Overnight Signal Bus");
  }
  if (outcome.calendarContext.length > 0) systems.add("Calendar");
  if (outcome.pendingActions.length > 0) systems.add("Action Tracker");

  return {
    id: outcome.id,
    name: outcome.name,
    description: outcome.description,
    status: outcome.status,
    healthScore: outcome.healthScore,
    yesterdayMovement: outcome.yesterdayMovement,
    yesterdayMovementLabel: outcome.yesterdayMovementLabel,
    confidence: outcome.confidence,
    owner: outcome.owner,
    businessImpact: outcome.businessImpact,
    decisionIds: outcome.decisionIds,
    blockers: outcome.blockers.map((blocker) => ({
      id: blocker.id,
      title: blocker.title,
      severity: blocker.severity,
    })),
    overnightSignals: outcome.overnightSignals.map((signal) => ({
      id: signal.id,
      severity: signal.severity,
      whatChanged: signal.whatChanged,
      why: signal.why,
    })),
    pendingActions: outcome.pendingActions.map((action) => ({
      id: action.id,
      label: action.actionLabel,
      status: action.status,
      why: action.why,
      expectedOutcomeImpact: action.recommendation.expectedOutcomeImpact,
    })),
    meetings: outcome.calendarContext.map((meeting) => ({
      id: meeting.id,
      title: meeting.title,
      startsAt: meeting.startsAt,
    })),
    history: outcome.history.map((point) => ({
      date: point.date,
      healthScore: point.healthScore,
      note: point.note,
    })),
    forecast: {
      direction: outcome.forecast.direction,
      expectedScore: outcome.forecast.expectedScore,
      narrative: outcome.forecast.narrative,
    },
    contributingSystems: [...systems],
  };
}

function toDecisionSignal(
  decision: OutcomePortfolio["decisions"][number],
): EnterpriseDecisionSignal {
  return {
    id: decision.id,
    question: decision.question,
    status: decision.status,
    owner: decision.owner,
    deadline: decision.deadline,
    confidence: decision.confidence,
    businessImpact: decision.businessImpact,
    expectedOutcomeImpact: decision.expectedOutcomeImpact,
    costOfDelay: decision.costOfDelay,
    whatChanged: decision.whatChanged,
    why: decision.why,
    outcomeIds: decision.outcomeIds,
    stakeholderCount: decision.stakeholders.length,
    evidenceCount: decision.evidence.length,
    systems: ["Decision Engine", "Outcome Engine"],
  };
}
