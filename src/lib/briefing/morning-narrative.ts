import { deriveDecisionQueue } from "@/lib/decisions/derive";
import type {
  BriefingPriorityDecision,
  BriefingRecommendation,
  MorningNarrative,
  OutcomeMovement,
  RecommendationStance,
  StrategicObservation,
} from "@/lib/briefing/morning-narrative-types";
import { STANCE_LABELS } from "@/lib/briefing/morning-narrative-types";
import type { Outcome, OutcomePortfolio } from "@/lib/outcomes/types";

export type {
  BriefingPriorityDecision,
  BriefingRecommendation,
  MorningNarrative,
  OutcomeMovement,
  RecommendationStance,
  StrategicObservation,
} from "@/lib/briefing/morning-narrative-types";
export { STANCE_LABELS } from "@/lib/briefing/morning-narrative-types";

function estimateDecisionMinutes(decision: {
  status: string;
  stakeholders: { length: number };
  evidence: { length: number };
}): number {
  let minutes = 8;
  if (decision.status === "due_today") minutes += 4;
  if (decision.stakeholders.length >= 4) minutes += 3;
  if (decision.evidence.length >= 3) minutes += 2;
  return Math.min(20, minutes);
}

function inferStance(label: string, why: string): RecommendationStance {
  const text = `${label} ${why}`.toLowerCase();
  if (text.includes("wait") || text.includes("defer") || text.includes("hold")) {
    return "wait";
  }
  if (text.includes("escalat")) return "escalate";
  if (
    text.includes("schedule") ||
    text.includes("workshop") ||
    text.includes("slot") ||
    text.includes("meeting")
  ) {
    return "schedule";
  }
  if (
    text.includes("delegate") ||
    text.includes("circulate") ||
    text.includes("owner") ||
    text.includes("assign")
  ) {
    return "delegate";
  }
  if (
    text.includes("approve") ||
    text.includes("exception") ||
    text.includes("sign") ||
    text.includes("commit")
  ) {
    return "approve";
  }
  return "schedule";
}

function movementForOutcome(outcome: Outcome): OutcomeMovement | null {
  const overnight =
    outcome.overnightSignals.find((signal) => signal.severity === "critical") ??
    outcome.overnightSignals[0] ??
    null;

  const meaningful =
    outcome.yesterdayMovement !== 0 ||
    overnight?.severity === "critical" ||
    overnight?.severity === "attention";

  if (!meaningful) return null;

  const direction =
    outcome.yesterdayMovement < 0
      ? "declined"
      : outcome.yesterdayMovement > 0
        ? "improved"
        : "stable";

  return {
    id: `move-${outcome.id}`,
    outcomeId: outcome.id,
    outcomeName: outcome.name,
    direction,
    changeLabel: outcome.yesterdayMovementLabel,
    why: outcome.expectedTrajectory.summary,
    overnightNote: overnight
      ? overnight.whatChanged
      : null,
  };
}

/**
 * Crafted Northline morning narrative — continuous CoS voice.
 * Falls back to portfolio-derived content for other portfolios.
 */
export function deriveMorningNarrative(
  portfolio: OutcomePortfolio,
): MorningNarrative {
  const isNorthline = portfolio.executiveName === "Alex";
  const queue = deriveDecisionQueue(portfolio);

  const movements = portfolio.outcomes
    .map(movementForOutcome)
    .filter((item): item is OutcomeMovement => item !== null)
    .sort((a, b) => {
      const rank = { declined: 0, stable: 1, improved: 2 } as const;
      return rank[a.direction] - rank[b.direction];
    })
    .slice(0, 4);

  const openDecisions = queue
    .filter(
      (item) =>
        item.status === "due_today" ||
        item.status === "under_review" ||
        item.status === "pending",
    )
    .slice(0, 3);

  const priorityDecisions: BriefingPriorityDecision[] = openDecisions.map(
    (decision) => ({
      id: decision.id,
      title: decision.question,
      whyNow: decision.why,
      expectedImpact: decision.expectedOutcomeImpact,
      estimatedMinutes: estimateDecisionMinutes(decision),
      href: `/decisions/${decision.id}`,
    }),
  );

  const helixStatus =
    portfolio.decisions.find((decision) => decision.id === "decision-residency")
      ?.status ?? null;
  const helixApproved = helixStatus === "approved";
  const helixRejected = helixStatus === "decided";

  const observations: StrategicObservation[] = isNorthline
    ? helixApproved
      ? [
          {
            id: "obs-helix-locked",
            observation:
              "Helix residency is written — conversion risk shifts from posture to workshop lock.",
            implication:
              "ARR recovery is now an execution problem, not a judgement gap.",
          },
          {
            id: "obs-board",
            observation:
              "Board risk language can be completed from the recorded Decision.",
            implication:
              "Board Preparation and enterprise ARR finally share one written posture.",
          },
          {
            id: "obs-calendar",
            observation:
              "Leadership meeting load still crowds the week — protect FY27 focus once the workshop is set.",
            implication:
              "Clearing Helix does not clear calendar debt; protect deep work next.",
          },
        ]
      : helixRejected
        ? [
            {
              id: "obs-harder-path",
              observation:
                "You chose full regional deploy over the residency exception — commercial pacing resets.",
              implication:
                "Forecast and board disclosure must describe the harder path honestly.",
            },
            {
              id: "obs-calendar",
              observation:
                "Leadership meeting load remains high while the Helix timeline is rebuilt.",
              implication:
                "Protect focus — rebuild work will compete with every standing meeting.",
            },
            {
              id: "obs-board",
              observation:
                "Board risk language must disclose delay and a harder compliance posture.",
              implication:
                "Board Preparation is now downstream of the rejection, not waiting on a Decision.",
            },
          ]
        : [
            {
              id: "obs-pipeline",
              observation:
                "Enterprise pipeline coverage has thinned just as Helix’s procurement clock continues — two signals pointing at the same conversion risk.",
              implication:
                "A residency posture today does more than unblock one deal; it restores forecast credibility for the half.",
            },
            {
              id: "obs-calendar",
              observation:
                "Leadership meeting load is still crowding the week. Focus time for FY27 planning is the first casualty when Helix slips.",
              implication:
                "Protecting calendar is not personal preference — it is how strategic Outcomes stay solvable.",
            },
            {
              id: "obs-board",
              observation:
                "Board risk language cannot be finished honestly until the Helix decision is written down.",
              implication:
                "Board Preparation and enterprise ARR are the same morning, not two separate tracks.",
            },
          ]
    : portfolio.outcomes
        .flatMap((outcome) => outcome.contributingInsights)
        .slice(0, 3)
        .map((insight) => ({
          id: insight.id,
          observation: insight.whatChanged,
          implication: insight.why,
        }));

  const recommendations: BriefingRecommendation[] = isNorthline
    ? helixApproved
      ? [
          {
            id: "rec-schedule",
            stance: "schedule",
            stanceLabel: STANCE_LABELS.schedule,
            title: "Lock the Helix security workshop slot",
            reason:
              "The Decision is recorded — two time options with the compensating-controls draft keep procurement motion alive this week.",
            href: "/actions",
          },
          {
            id: "rec-delegate",
            stance: "delegate",
            stanceLabel: STANCE_LABELS.delegate,
            title: "Have counsel circulate the exception memo",
            reason:
              "Workshop attendees need the written posture attached — delegate circulation; keep the Decision authority.",
            href: "/actions",
          },
          {
            id: "rec-wait",
            stance: "wait",
            stanceLabel: STANCE_LABELS.wait,
            title: "Hold non-Focus retention experiments",
            reason:
              "Nothing overnight changed the retention thesis. Finish workshop lock and board language first.",
          },
        ]
      : helixRejected
        ? [
            {
              id: "rec-schedule",
              stance: "schedule",
              stanceLabel: STANCE_LABELS.schedule,
              title: "Rebuild the Helix commercial timeline",
              reason:
                "Full regional deploy needs a credible date path before the next forecast review.",
              href: "/actions",
            },
            {
              id: "rec-delegate",
              stance: "delegate",
              stanceLabel: STANCE_LABELS.delegate,
              title: "Have Legal update board risk language",
              reason:
                "Disclose delay and the harder compliance posture from the recorded rejection.",
              href: "/actions",
            },
            {
              id: "rec-wait",
              stance: "wait",
              stanceLabel: STANCE_LABELS.wait,
              title: "Hold non-Focus retention experiments",
              reason:
                "Rebuild work for Helix and board takes precedence until the harder path is stable.",
            },
          ]
        : [
            {
              id: "rec-approve",
              stance: "approve",
              stanceLabel: STANCE_LABELS.approve,
              title: "Take a written Helix residency position today",
              reason:
                "Security and Legal diverge; without your posture the expansion workshop cannot be scheduled and ARR health keeps drifting.",
              href: "/decisions/decision-residency",
            },
            {
              id: "rec-schedule",
              stance: "schedule",
              stanceLabel: STANCE_LABELS.schedule,
              title: "Lock the Helix security workshop slot",
              reason:
                "Two time options with the compensating-controls draft keep procurement motion alive this week.",
              href: "/actions",
            },
            {
              id: "rec-delegate",
              stance: "delegate",
              stanceLabel: STANCE_LABELS.delegate,
              title: "Have counsel circulate the exception memo",
              reason:
                "You need a clean option paper, not a drafting session. Delegate the memo; keep the Decision.",
              href: "/actions",
            },
            {
              id: "rec-wait",
              stance: "wait",
              stanceLabel: STANCE_LABELS.wait,
              title: "Hold non-Focus retention experiments",
              reason:
                "Nothing overnight changed the retention thesis. Wait until Helix and board language are settled.",
            },
          ]
    : portfolio.outcomes
        .flatMap((outcome) => outcome.pendingActions)
        .slice(0, 4)
        .map((action) => {
          const stance = inferStance(action.actionLabel, action.why);
          return {
            id: action.id,
            stance,
            stanceLabel: STANCE_LABELS[stance],
            title: action.actionLabel,
            reason: action.why,
            href: "/actions",
          };
        });

  return {
    transitionToOutcomes: isNorthline
      ? helixApproved
        ? "Helix is decided — see which Outcomes moved with the judgement."
        : "Before you decide, see which Outcomes moved overnight — and which did not."
      : "Here is what changed in the Outcome portfolio overnight.",
    transitionToDecisions: isNorthline
      ? helixApproved
        ? "With Helix recorded, remaining judgements are thinner — and more about follow-through."
        : "Those movements concentrate into a short list of judgements only you can make."
      : "These are the Decisions that require your judgement today.",
    transitionToInsights: isNorthline
      ? "A few observations explain the pattern behind the Decisions."
      : "These observations frame how to read the business this morning.",
    transitionToActions: isNorthline
      ? helixApproved
        ? "Given that picture, preparation recommends workshop lock next — you still decide the calendar."
        : "Given that picture, here is what preparation recommends — you still decide."
      : "Recommended next moves — proposals only.",
    closingLine: isNorthline
      ? helixApproved
        ? "You know what matters today: workshop lock, board language, and protected focus. Helix judgement is behind you."
        : "You know what matters today: Helix, board language, and protected focus. Everything else can wait."
      : "You know what matters today. Leave the rest.",
    outcomeMovements: movements,
    priorityDecisions,
    observations: observations.slice(0, 3),
    recommendations: recommendations.slice(0, 5),
  };
}
