import type { IntelligentExecutiveSnapshot } from "@/intelligence/executive-intelligence/types";
import { listCouncilAgents } from "@/agents";
import type { AgentStance, CouncilAgentId } from "@/agents/types";
import type {
  Future,
  FutureCouncilDisagreement,
  FutureCouncilPerspective,
  FutureCouncilReview,
} from "@/futures/models/types";

/**
 * Each council member reviews every future independently.
 * Disagreement is preserved — never averaged.
 */
export function reviewFuturesWithCouncil(input: {
  snapshot: IntelligentExecutiveSnapshot;
  futures: Future[];
}): FutureCouncilReview[] {
  const agents = listCouncilAgents();

  return input.futures.map((future) => {
    const perspectives = agents.map((agent) =>
      reviewFutureAsAgent(
        agent.id as CouncilAgentId,
        agent.title,
        agent.shortTitle,
        future,
        input.snapshot,
      ),
    );
    return {
      futureId: future.id,
      futureTitle: future.title,
      perspectives,
      disagreements: detectFutureDisagreements(future, perspectives),
    };
  });
}

function reviewFutureAsAgent(
  agentId: CouncilAgentId,
  title: string,
  shortTitle: string,
  future: Future,
  snapshot: IntelligentExecutiveSnapshot,
): FutureCouncilPerspective {
  const profile = AGENT_FUTURE_PROFILES[agentId];
  const agreement = agreementFor(agentId, future);
  const stance = stanceFor(agentId, future, agreement);
  const challenged = assumptionsToChallenge(agentId, future);
  const favoured = interventionsFavoured(agentId, future);

  const summary = profile.summarise(future, snapshot, agreement);
  const reasoning = [
    `${shortTitle} reads this as a ${future.caseKind.replace("_", " ")} path.`,
    ...profile.reason(future, snapshot),
    agreement === "challenges"
      ? "This perspective challenges the dominant framing — do not average it away."
      : agreement === "conditional"
        ? "Support is conditional on named assumptions holding."
        : "This perspective supports the path as framed, given current evidence.",
  ];

  return {
    agentId,
    title,
    shortTitle,
    stance,
    summary,
    agreement,
    assumptionsChallenged: challenged,
    interventionsFavoured: favoured,
    confidence: clamp(
      future.confidence + profile.confidenceDelta(future) + (agreement === "challenges" ? -4 : 0),
      40,
      90,
    ),
    reasoning,
  };
}

type Agreement = FutureCouncilPerspective["agreement"];

type AgentFutureProfile = {
  summarise: (
    future: Future,
    snapshot: IntelligentExecutiveSnapshot,
    agreement: Agreement,
  ) => string;
  reason: (
    future: Future,
    snapshot: IntelligentExecutiveSnapshot,
  ) => string[];
  confidenceDelta: (future: Future) => number;
};

const AGENT_FUTURE_PROFILES: Record<CouncilAgentId, AgentFutureProfile> = {
  ceo: {
    summarise: (future, snapshot, agreement) =>
      `Sequence attention around this ${future.caseKind.replace("_", " ")} — review load is ${snapshot.reviewMinutes} min and attention is ${snapshot.capacity.attentionBudget}. ${agreementLabel(agreement)}`,
    reason: (future) => [
      `Spotlight interventions: ${future.recommendedInterventions
        .filter((i) => i.kind === "urgent" || i.kind === "high_impact")
        .map((i) => i.title)
        .slice(0, 2)
        .join("; ") || "protect Focus time"}.`,
    ],
    confidenceDelta: () => 2,
  },
  cfo: {
    summarise: (future, _s, agreement) =>
      future.drivers.includes("cash_flow") || future.caseKind === "worst_case"
        ? `Cash risk is increasing along this path — protect runway before upside bets. ${agreementLabel(agreement)}`
        : `Financial exposure looks contained if assumptions hold; still watch collections. ${agreementLabel(agreement)}`,
    reason: (future) => [
      future.drivers.includes("cash_flow")
        ? "Cash-flow driver is active — delay expansion until indicators cool."
        : "Cash is not the primary driver, but every path still needs a cost-of-delay read.",
    ],
    confidenceDelta: (future) =>
      future.caseKind === "worst_case" || future.caseKind === "black_swan" ? 6 : -2,
  },
  coo: {
    summarise: (future, snapshot, agreement) =>
      snapshot.capacity.capacity !== "available"
        ? `Operational improvements can offset part of this risk if execution stays disciplined. ${agreementLabel(agreement)}`
        : `Operations have headroom to absorb this path if leading indicators stay green. ${agreementLabel(agreement)}`,
    reason: (future) => [
      future.drivers.includes("labour_availability") ||
      future.drivers.includes("asset_reliability")
        ? "Operating drivers (labour/assets) dominate — execution quality decides the path."
        : "Operating cadence can still change the trajectory inside the horizon.",
    ],
    confidenceDelta: (future) =>
      future.caseKind === "best_case" || future.caseKind === "expected_case" ? 4 : 0,
  },
  cro: {
    summarise: (future, _s, agreement) =>
      `Revenue path hinges on customer demand and win/renewal quality under this future. ${agreementLabel(agreement)}`,
    reason: (future) => [
      future.drivers.includes("customer_demand") || future.drivers.includes("revenue")
        ? "Demand/revenue drivers are live — commercial intervention matters."
        : "Commercial upside is secondary unless customer signals worsen.",
    ],
    confidenceDelta: (future) => (future.caseKind === "best_case" ? 5 : 0),
  },
  cso: {
    summarise: (future, _s, agreement) =>
      future.caseKind === "best_case" || future.caseKind === "most_likely"
        ? `Recommend protecting the strategic investment path despite short-term pressure. ${agreementLabel(agreement)}`
        : `Strategy should retain optionality — do not abandon the long game under temporary pressure. ${agreementLabel(agreement)}`,
    reason: (future) => [
      future.drivers.includes("strategic_initiatives")
        ? "Strategic initiative driver is active — investment timing is the lever."
        : "Even without initiative pressure, path choice shapes 90-day positioning.",
    ],
    confidenceDelta: (future) =>
      future.caseKind === "best_case" || future.caseKind === "most_likely" ? 5 : 2,
  },
};

function agreementFor(agentId: CouncilAgentId, future: Future): Agreement {
  if (agentId === "cfo") {
    if (future.caseKind === "best_case") return "challenges";
    if (future.caseKind === "worst_case" || future.caseKind === "black_swan")
      return "supports";
    return "conditional";
  }
  if (agentId === "coo") {
    if (future.caseKind === "worst_case") return "challenges";
    if (future.caseKind === "best_case" || future.caseKind === "expected_case")
      return "supports";
    return "conditional";
  }
  if (agentId === "cso") {
    if (future.caseKind === "worst_case") return "challenges";
    if (future.caseKind === "best_case" || future.caseKind === "most_likely")
      return "supports";
    return "conditional";
  }
  if (agentId === "cro") {
    if (future.caseKind === "best_case") return "supports";
    if (future.caseKind === "black_swan") return "challenges";
    return "conditional";
  }
  return "conditional";
}

function stanceFor(
  agentId: CouncilAgentId,
  future: Future,
  agreement: Agreement,
): AgentStance {
  if (agentId === "cfo" && future.caseKind === "best_case") return "delay";
  if (agentId === "coo" && future.caseKind === "worst_case") return "proceed";
  if (agentId === "cso" && future.caseKind !== "black_swan") return "proceed";
  if (agentId === "ceo" && future.caseKind === "black_swan") return "escalate";
  if (agreement === "challenges") return "challenge";
  if (agreement === "supports") return "proceed";
  if (future.caseKind === "black_swan") return "watch";
  return "investigate";
}

function assumptionsToChallenge(agentId: CouncilAgentId, future: Future): string[] {
  if (agentId === "cfo") {
    return future.keyAssumptions
      .filter((a) => /lands within|sufficient|no black-swan/i.test(a))
      .slice(0, 2);
  }
  if (agentId === "coo") {
    return future.keyAssumptions
      .filter((a) => /slips|poorly|constrained/i.test(a))
      .slice(0, 2);
  }
  if (agentId === "ceo") {
    return future.keyAssumptions.filter((a) => /no black-swan/i.test(a)).slice(0, 1);
  }
  return future.keyAssumptions.slice(0, 1);
}

function interventionsFavoured(agentId: CouncilAgentId, future: Future): string[] {
  const prefer: Record<
    CouncilAgentId,
    Future["recommendedInterventions"][number]["kind"][]
  > = {
    ceo: ["urgent", "high_impact"],
    cfo: ["preventative", "deferred"],
    coo: ["urgent", "low_effort"],
    cro: ["high_impact", "urgent"],
    cso: ["high_impact", "deferred"],
  };
  const kinds = prefer[agentId];
  return future.recommendedInterventions
    .filter((i) => kinds.includes(i.kind))
    .map((i) => i.title)
    .slice(0, 2);
}

function detectFutureDisagreements(
  future: Future,
  perspectives: FutureCouncilPerspective[],
): FutureCouncilDisagreement[] {
  const cfo = perspectives.find((p) => p.agentId === "cfo");
  const coo = perspectives.find((p) => p.agentId === "coo");
  const cso = perspectives.find((p) => p.agentId === "cso");
  const disagreements: FutureCouncilDisagreement[] = [];

  if (cfo && coo && cfo.agreement !== coo.agreement) {
    disagreements.push({
      topic: `Cash vs operations on "${future.title}"`,
      positions: [
        {
          agent: cfo.title,
          stance: cfo.stance,
          statement: cfo.summary,
        },
        {
          agent: coo.title,
          stance: coo.stance,
          statement: coo.summary,
        },
      ],
      facilitation:
        "Escalate the tension to executive review — do not average CFO delay with COO proceed.",
    });
  }

  if (cso && cfo && cso.agreement === "supports" && cfo.agreement === "challenges") {
    disagreements.push({
      topic: `Investment timing under "${future.title}"`,
      positions: [
        {
          agent: cfo.title,
          stance: cfo.stance,
          statement: "Short-term cash pressure argues for delay.",
        },
        {
          agent: cso.title,
          stance: cso.stance,
          statement: cso.summary,
        },
      ],
      facilitation:
        "CEO should surface both clocks — cash runway and strategic window — without forcing consensus.",
    });
  }

  return disagreements;
}

function agreementLabel(agreement: Agreement): string {
  if (agreement === "supports") return "Supports this framing.";
  if (agreement === "challenges") return "Challenges this framing.";
  return "Conditional — assumptions must hold.";
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
