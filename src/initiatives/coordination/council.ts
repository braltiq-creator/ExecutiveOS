import type { CouncilAgentId, AgentStance } from "@/agents/types";
import { listCouncilAgents } from "@/agents";
import type { IntelligentExecutiveSnapshot } from "@/intelligence/executive-intelligence/types";
import type {
  InitiativeCoordination,
  CouncilInitiativePerspective,
  InitiativePriority,
} from "@/initiatives/models/types";
import type { InitiativeTemplate } from "@/initiatives/planner/catalogue";

/**
 * Every permanent Council member contributes. Disagreement is preserved.
 */
export function coordinateInitiative(input: {
  template: InitiativeTemplate;
  snapshot: IntelligentExecutiveSnapshot;
  priority: InitiativePriority;
  evidence: string[];
}): InitiativeCoordination {
  const agents = listCouncilAgents();
  const perspectives = agents.map((agent) =>
    perspectiveFor(
      agent.id as CouncilAgentId,
      agent.title,
      agent.shortTitle,
      input,
    ),
  );

  return {
    perspectives,
    disagreements: detectDisagreements(input.template, perspectives),
    sequencingNote: `CEO sequences "${input.template.title}" against attention budget (${input.snapshot.capacity.attentionBudget}) — do not collapse council dissent into a single task list.`,
  };
}

function perspectiveFor(
  agentId: CouncilAgentId,
  title: string,
  shortTitle: string,
  input: {
    template: InitiativeTemplate;
    snapshot: IntelligentExecutiveSnapshot;
    priority: InitiativePriority;
    evidence: string[];
  },
): CouncilInitiativePerspective {
  const isSponsor = agentId === input.template.defaultSponsor;
  const isSupporter = input.template.defaultSupporters.includes(agentId);
  const profile = CONTRIBUTION[agentId];
  const agreement = agreementFor(agentId, input.template, isSponsor);
  const stance = stanceFor(agentId, agreement, input.priority);

  return {
    agentId,
    title,
    shortTitle,
    stance,
    contribution: profile.contribute(input.template, input.snapshot),
    agreement,
    prioritiesNamed: profile.priorities(input.template),
    confidence: Math.max(
      42,
      Math.min(
        90,
        60 +
          (isSponsor ? 12 : 0) +
          (isSupporter ? 6 : 0) +
          (agreement === "challenges" ? -4 : 0),
      ),
    ),
    reasoning: [
      `${shortTitle} frames this under ${profile.lens}.`,
      isSponsor
        ? "Acts as executive sponsor — accountable for outcome, not task delivery."
        : isSupporter
          ? "Supporting council member — contributes domain pressure without owning the PM plan."
          : "Reviews for cross-enterprise impact; may challenge sequencing.",
      input.evidence[0] ?? "Evidence drawn from current intelligence snapshot.",
    ],
  };
}

const CONTRIBUTION: Record<
  CouncilAgentId,
  {
    lens: string;
    contribute: (
      template: InitiativeTemplate,
      snapshot: IntelligentExecutiveSnapshot,
    ) => string;
    priorities: (template: InitiativeTemplate) => string[];
  }
> = {
  ceo: {
    lens: "enterprise judgement",
    contribute: (t, s) =>
      `Sequence "${t.title}" inside a ${s.reviewMinutes}-minute review load; protect Focus for Decision binds.`,
    priorities: (t) => ["ELT sequencing", t.strategicTheme],
  },
  cfo: {
    lens: "financial priorities",
    contribute: (t) =>
      t.drivers.includes("cash_flow")
        ? "Prioritise cash and cost-of-delay before discretionary investment."
        : "Require a capital and runway read before scaling this initiative.",
    priorities: () => ["Cash discipline", "Investment gating"],
  },
  coo: {
    lens: "operational improvements",
    contribute: (t) =>
      `Operationalise "${t.title}" through capability and reliability — not a longer task backlog.`,
    priorities: () => ["Execution capacity", "Reliability"],
  },
  cro: {
    lens: "growth initiatives",
    contribute: (t) =>
      t.drivers.includes("revenue") || t.drivers.includes("customer_demand")
        ? "Tie growth and retention outcomes explicitly to this initiative."
        : "Growth upside is secondary unless commercial evidence strengthens.",
    priorities: () => ["Pipeline quality", "Retention"],
  },
  cso: {
    lens: "long-term alignment",
    contribute: (t) =>
      `Keep "${t.title}" aligned to multi-horizon strategy; resist collapsing it into quarterly busywork.`,
    priorities: () => ["Strategic alignment", "Horizon discipline"],
  },
};

function agreementFor(
  agentId: CouncilAgentId,
  template: InitiativeTemplate,
  isSponsor: boolean,
): CouncilInitiativePerspective["agreement"] {
  if (isSponsor) return "supports";
  if (agentId === "cfo" && !template.drivers.includes("cash_flow")) {
    return template.defaultPriority === "critical" ? "conditional" : "challenges";
  }
  if (agentId === "cfo" && template.id === "expand_new_markets") {
    return "challenges";
  }
  if (
    agentId === "coo" &&
    (template.id === "accelerate_digital_transformation" ||
      template.id === "expand_new_markets")
  ) {
    return "conditional";
  }
  if (template.defaultSupporters.includes(agentId)) return "supports";
  return "conditional";
}

function stanceFor(
  agentId: CouncilAgentId,
  agreement: CouncilInitiativePerspective["agreement"],
  priority: InitiativePriority,
): AgentStance {
  if (agentId === "cfo" && agreement === "challenges") return "delay";
  if (agreement === "supports" && priority === "critical") return "proceed";
  if (agreement === "supports") return "proceed";
  if (agreement === "challenges") return "challenge";
  return "investigate";
}

function detectDisagreements(
  template: InitiativeTemplate,
  perspectives: CouncilInitiativePerspective[],
): InitiativeCoordination["disagreements"] {
  const cfo = perspectives.find((p) => p.agentId === "cfo");
  const coo = perspectives.find((p) => p.agentId === "coo");
  const cso = perspectives.find((p) => p.agentId === "cso");
  const cro = perspectives.find((p) => p.agentId === "cro");
  const out: InitiativeCoordination["disagreements"] = [];

  if (cfo && coo && cfo.agreement !== coo.agreement) {
    out.push({
      topic: `Funding vs operations on "${template.title}"`,
      positions: [
        {
          agent: cfo.title,
          stance: cfo.stance,
          statement: cfo.contribution,
        },
        {
          agent: coo.title,
          stance: coo.stance,
          statement: coo.contribution,
        },
      ],
      facilitation:
        "Preserve both positions for ELT — do not average cash caution with operational urgency.",
    });
  }

  if (cso && cro && cso.agreement === "supports" && cro.agreement === "challenges") {
    out.push({
      topic: `Strategic pace vs commercial caution on "${template.title}"`,
      positions: [
        {
          agent: cso.title,
          stance: cso.stance,
          statement: cso.contribution,
        },
        {
          agent: cro.title,
          stance: cro.stance,
          statement: cro.contribution,
        },
      ],
      facilitation:
        "CEO preserves both positions — do not average strategy ambition with commercial caution.",
    });
  }

  return out;
}
