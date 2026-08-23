import { createAgentContext } from "@/agents/context";
import { listCouncilAgents } from "@/agents/registry";
import type {
  AgentStance,
  CouncilConflict,
  CouncilPerspective,
  ExecutiveCouncilBrief,
  ExecutiveCouncilView,
} from "@/agents/types";
import type { IntelligentExecutiveSnapshot } from "@/intelligence/executive-intelligence/types";
import { ensureSentence } from "@/intelligence/executive-intelligence/lib/helpers";

const OPPOSING: Record<AgentStance, AgentStance[]> = {
  proceed: ["delay", "watch"],
  delay: ["proceed"],
  investigate: [],
  escalate: [],
  delegate: [],
  watch: ["proceed"],
  challenge: ["proceed"],
};

const NO_MATERIAL_DISAGREEMENT =
  "No material Council disagreement identified from available evidence.";

/**
 * Convene the permanent Executive Council over an Intelligent snapshot.
 * Exactly five seats. Conflicts are preserved — never averaged.
 */
export function conveneExecutiveCouncil(
  snapshot: IntelligentExecutiveSnapshot,
): ExecutiveCouncilBrief {
  const ctx = createAgentContext(snapshot);
  const agents = listCouncilAgents();

  const perspectives: CouncilPerspective[] = agents.map((agent) => ({
    agentId: agent.id as CouncilPerspective["agentId"],
    title: agent.title,
    shortTitle: agent.shortTitle,
    focusAreas: agent.focusAreas,
    review: agent.review(ctx),
  }));

  const conflicts = detectConflicts(perspectives, snapshot);
  const ceo = perspectives.find((p) => p.agentId === "ceo");
  const decisionSequence =
    ceo?.review.priorities.length
      ? ceo.review.priorities
      : snapshot.decisions
          .filter((d) => d.priority !== "resolved")
          .slice(0, 3)
          .map((d) => d.question);

  const framing = ensureSentence(
    conflicts.length > 0
      ? `Executive Council is split on ${conflicts.length} material point(s) — disagreement is preserved for your judgement.`
      : NO_MATERIAL_DISAGREEMENT,
  );

  return {
    asOf: snapshot.asOf,
    framing,
    perspectives,
    conflicts,
    decisionSequence,
    closingNote: ensureSentence(
      [
        "ExecutiveOS presents an executive discussion, not a single recommendation.",
        "You remain the decision maker.",
        conflicts[0]
          ? conflicts[0].facilitation
          : NO_MATERIAL_DISAGREEMENT,
      ].join(" "),
    ),
  };
}

function evidenceGroundedConflict(
  left: CouncilPerspective,
  right: CouncilPerspective,
  snapshot: IntelligentExecutiveSnapshot,
): boolean {
  const openDecisions = snapshot.decisions.filter(
    (d) => d.priority !== "resolved",
  );
  if (openDecisions.length === 0 && snapshot.outcomes.length === 0) {
    return false;
  }
  const leftEvidence = left.review.recommendations.flatMap((r) => r.evidence);
  const rightEvidence = right.review.recommendations.flatMap((r) => r.evidence);
  return leftEvidence.length > 0 && rightEvidence.length > 0;
}

function detectConflicts(
  perspectives: CouncilPerspective[],
  snapshot: IntelligentExecutiveSnapshot,
): CouncilConflict[] {
  const conflicts: CouncilConflict[] = [];

  // Pairwise stance conflicts on overlapping decisions — only when evidence-grounded
  for (let i = 0; i < perspectives.length; i += 1) {
    for (let j = i + 1; j < perspectives.length; j += 1) {
      const left = perspectives[i]!;
      const right = perspectives[j]!;
      if (!evidenceGroundedConflict(left, right, snapshot)) continue;

      for (const leftRec of left.review.recommendations) {
        for (const rightRec of right.review.recommendations) {
          const sharedDecision = leftRec.relatedDecisionIds.find((id) =>
            rightRec.relatedDecisionIds.includes(id),
          );
          const opposing = OPPOSING[leftRec.stance]?.includes(rightRec.stance);
          if (!opposing) continue;

          const classic =
            (left.agentId === "cfo" &&
              right.agentId === "coo" &&
              leftRec.stance === "delay" &&
              rightRec.stance === "proceed") ||
            (left.agentId === "coo" &&
              right.agentId === "cfo" &&
              leftRec.stance === "proceed" &&
              rightRec.stance === "delay");

          if (!sharedDecision && !classic) continue;

          const topic =
            sharedDecision ??
            `Operating tempo — ${left.shortTitle} vs ${right.shortTitle}`;

          const id = `conflict-${left.agentId}-${right.agentId}-${sharedDecision ?? "tempo"}`;
          if (conflicts.some((item) => item.id === id)) continue;

          conflicts.push({
            id,
            topic:
              typeof topic === "string" && topic.startsWith("decision")
                ? `Decision path: ${leftRec.title} vs ${rightRec.title}`
                : String(topic),
            relatedDecisionId: sharedDecision,
            positions: [
              {
                agentId: left.agentId,
                agentTitle: left.title,
                stance: leftRec.stance,
                statement: leftRec.rationale,
              },
              {
                agentId: right.agentId,
                agentTitle: right.title,
                stance: rightRec.stance,
                statement: rightRec.rationale,
              },
            ],
            facilitation:
              "CEO: escalate to executive review — do not average these positions.",
          });
        }
      }
    }
  }

  // Ensure CFO delay vs COO proceed surfaces with CEO facilitation
  const cfo = perspectives.find((p) => p.agentId === "cfo");
  const coo = perspectives.find((p) => p.agentId === "coo");
  const cfoDelay = cfo?.review.recommendations.find((r) => r.stance === "delay");
  const cooProceed = coo?.review.recommendations.find(
    (r) => r.stance === "proceed",
  );
  if (
    cfoDelay &&
    cooProceed &&
    evidenceGroundedConflict(cfo!, coo!, snapshot)
  ) {
    const existing = conflicts.find(
      (item) =>
        item.positions.some((p) => p.agentId === "cfo") &&
        item.positions.some((p) => p.agentId === "coo"),
    );
    const triad: CouncilConflict = {
      id: "conflict-cfo-coo-tempo",
      topic: "Project / Decision tempo",
      relatedDecisionId:
        cfoDelay.relatedDecisionIds[0] ?? cooProceed.relatedDecisionIds[0],
      positions: [
        {
          agentId: "cfo",
          agentTitle: "Chief Financial Officer",
          stance: "delay",
          statement: cfoDelay.rationale,
        },
        {
          agentId: "coo",
          agentTitle: "Chief Operating Officer",
          stance: "proceed",
          statement: cooProceed.rationale,
        },
        {
          agentId: "ceo",
          agentTitle: "Chief Executive Officer",
          stance: "escalate",
          statement:
            "Escalate to executive review — both commercial caution and delivery urgency are material.",
        },
      ],
      facilitation:
        "CEO: escalate to executive review. Present all three positions.",
    };
    if (existing) {
      existing.id = triad.id;
      existing.topic = triad.topic;
      existing.positions = triad.positions;
      existing.facilitation = triad.facilitation;
      existing.relatedDecisionId = triad.relatedDecisionId;
    } else {
      conflicts.unshift(triad);
    }
  }

  return conflicts.slice(0, 5);
}

/** Map council brief → Today presentation view */
export function toCouncilView(
  brief: ExecutiveCouncilBrief,
): ExecutiveCouncilView {
  return {
    framing: brief.framing,
    perspectives: brief.perspectives.map((perspective) => {
      const primary = perspective.review.recommendations[0];
      return {
        agentId: perspective.agentId,
        title: perspective.title,
        shortTitle: perspective.shortTitle,
        summary: perspective.review.summary,
        stanceLabel: primary
          ? `${primary.stance.replaceAll("_", " ")} — ${primary.title}`
          : "watch",
        priorities: perspective.review.priorities,
        recommendations: perspective.review.recommendations.map(
          (item) => `${item.stance}: ${item.title}`,
        ),
        challenges: perspective.review.challenges.map((item) => item.challenge),
        risks: perspective.review.risks.map((item) => item.label),
        opportunities: perspective.review.opportunities.map(
          (item) => item.label,
        ),
        confidence: perspective.review.confidence.value,
        reasoning: perspective.review.reasoning,
      };
    }),
    conflicts: brief.conflicts.map((conflict) => ({
      topic: conflict.topic,
      positions: conflict.positions.map((position) => ({
        agent: position.agentTitle,
        stance: position.stance,
        statement: position.statement,
      })),
      facilitation: conflict.facilitation,
    })),
    decisionSequence: brief.decisionSequence,
    closingNote: brief.closingNote,
  };
}
