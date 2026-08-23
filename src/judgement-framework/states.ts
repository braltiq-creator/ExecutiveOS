/**
 * Canonical judgement states — reusable posture definitions.
 */

import type { JudgementStateDefinition, JudgementStateId } from "@/judgement-framework/types";

export const JUDGEMENT_STATES: Record<JudgementStateId, JudgementStateDefinition> = {
  observe: {
    id: "observe",
    label: "Observe",
    purpose:
      "Hold attention without intervening. Situation is visible but does not yet warrant action or formal monitoring cadence.",
    entryConditions: [
      "Signals are weak or early",
      "Business impact and urgency are low",
      "No material outcome misalignment",
      "Confidence that inaction is safe for now",
    ],
    exitConditions: [
      "Signal strengthens into a pattern",
      "Impact or urgency rises",
      "Stakeholder or outcome risk becomes material",
    ],
    confidence: { enterMin: 40, exitMax: 85 },
    escalationRules: [
      "Do not escalate from Observe on a single weak signal",
      "Move to Monitor when recurrence or trend appears",
    ],
    expectedExecutiveBehaviour: [
      "Note the signal",
      "Avoid premature recommendations",
      "Protect attention for higher-intensity matters",
    ],
    typicalCouncilInteraction: "Silent or one-line acknowledgement; no council agenda item.",
    communicationStyle: "Sparse. Factual. No alarm language.",
  },
  monitor: {
    id: "monitor",
    label: "Monitor",
    purpose:
      "Track a known condition on a cadence. Action is not required yet; blindness would be irresponsible.",
    entryConditions: [
      "Material enough to track, not yet to decide",
      "Leading indicators present",
      "Reversibility still high if delayed modestly",
    ],
    exitConditions: [
      "Condition stabilises → Observe or close",
      "Uncertainty or impact rises → Investigate",
      "Clear ask emerges → Recommend",
    ],
    confidence: { enterMin: 45, exitMax: 80 },
    escalationRules: [
      "Escalate monitoring cadence before escalating the decision",
      "If cost of delay rises sharply, leave Monitor",
    ],
    expectedExecutiveBehaviour: [
      "Set review cadence",
      "Name the kill/continue criteria",
      "Resist converting every monitor into a project",
    ],
    typicalCouncilInteraction: "Listed on watchlist; not a decision item.",
    communicationStyle: "Calm. Criteria-led. Time-boxed.",
  },
  investigate: {
    id: "investigate",
    label: "Investigate",
    purpose:
      "Reduce uncertainty before judgement hardens. Seek evidence, alternatives, and root cause — not yet a recommendation.",
    entryConditions: [
      "Stakes material but confidence or evidence quality insufficient",
      "Competing explanations exist",
      "Decision complexity high relative to available facts",
    ],
    exitConditions: [
      "Evidence quality crosses recommend floor → Recommend or Challenge",
      "Risk crosses force threshold → Escalate",
      "Signal falsified → Monitor or Observe",
    ],
    confidence: { enterMin: 25, exitMax: 70 },
    escalationRules: [
      "Investigation has an owner and a deadline",
      "If investigation stalls under rising urgency → Escalate for capacity/attention",
    ],
    expectedExecutiveBehaviour: [
      "Frame the question tightly",
      "Demand disconfirming evidence",
      "Do not dress investigation as a decision",
    ],
    typicalCouncilInteraction:
      "Council commissions inquiry; dissenters' concerns become investigation questions.",
    communicationStyle: "Curious. Precise. Explicit about unknowns.",
  },
  challenge: {
    id: "challenge",
    label: "Challenge",
    purpose:
      "Pressure-test a forming narrative or recommendation. Prevent false confidence from becoming action.",
    entryConditions: [
      "A recommendation or consensus is forming",
      "Evidence quality or confidence is uneven across roles",
      "Strategic drift, bias, or single-lens framing suspected",
    ],
    exitConditions: [
      "Challenge resolved → Recommend, Monitor, or Escalate with eyes open",
      "Challenge unanswered under time pressure → Escalate",
    ],
    confidence: { enterMin: 35, exitMax: 75 },
    escalationRules: [
      "Challenge is not obstruction — time-box it",
      "If challenge reveals existential risk → Crisis or Escalate",
    ],
    expectedExecutiveBehaviour: [
      "Ask the uncomfortable questions",
      "Surface alternative explanations",
      "Protect the enterprise from comfortable errors",
    ],
    typicalCouncilInteraction:
      "Formal challenge round; minority views recorded before vote or advice.",
    communicationStyle: "Direct. Respectful. Evidence-demanding.",
  },
  recommend: {
    id: "recommend",
    label: "Recommend",
    purpose:
      "Advise a course of action with enough confidence and evidence that the executive is willing to put their name on it.",
    entryConditions: [
      "Confidence at or above role recommend floor",
      "Evidence quality adequate for the stakes",
      "Outcome alignment tested",
      "Trade-offs and reversibility understood",
    ],
    exitConditions: [
      "New contradictory evidence → Investigate or Challenge",
      "Impact/risk spikes → Escalate",
      "Decision taken → Monitor execution",
    ],
    confidence: { enterMin: 60, exitMax: 95 },
    escalationRules: [
      "Recommend does not equal decide — human remains accountable",
      "If stakeholder impact extreme, pair Recommend with Escalate for visibility",
    ],
    expectedExecutiveBehaviour: [
      "State the recommendation clearly",
      "Name risks, trade-offs, and what would change the mind",
      "Accept that peers may still Investigate or Challenge",
    ],
    typicalCouncilInteraction:
      "Proposal on the table; other roles may hold different states.",
    communicationStyle: "Clear. Owned. Conditional on stated assumptions.",
  },
  escalate: {
    id: "escalate",
    label: "Escalate",
    purpose:
      "Raise organisational altitude. Attention, capital, or authority beyond the current forum is required.",
    entryConditions: [
      "Risk or business impact crosses role force threshold",
      "Cost of delay is unacceptable",
      "Local authority insufficient",
      "Cross-functional conflict blocks timely action",
    ],
    exitConditions: [
      "Authority engaged and path clear → Recommend or Investigate with sponsorship",
      "Threat becomes existential → Crisis",
      "Escalation absorbed and risk reduced → Monitor",
    ],
    confidence: { enterMin: 40, exitMax: 90 },
    escalationRules: [
      "Escalate with a specific ask (decision, capital, air cover)",
      "Do not escalate to offload ownership without a brief",
    ],
    expectedExecutiveBehaviour: [
      "Brief crisply",
      "State what happens if ignored",
      "Preserve optionality where possible",
    ],
    typicalCouncilInteraction:
      "Forced agenda item; CEO/board path named; dissent preserved in the brief.",
    communicationStyle: "Urgent but controlled. Ask-led. Consequence-clear.",
  },
  crisis: {
    id: "crisis",
    label: "Crisis",
    purpose:
      "Immediate coordinated response to existential, safety, liquidity, or irreversible franchise harm.",
    entryConditions: [
      "Existential or irreversible harm in motion or imminent",
      "Crisis force threshold crossed",
      "Normal cadence cannot protect the enterprise",
    ],
    exitConditions: [
      "Immediate threat contained → Escalate (stabilisation) then Investigate",
      "Never exit silently to Observe",
    ],
    confidence: { enterMin: 20, exitMax: 100 },
    escalationRules: [
      "Crisis overrides preference for more analysis",
      "All council roles converge on containment; judgement differences recorded for after-action",
    ],
    expectedExecutiveBehaviour: [
      "Stabilise first",
      "Single crisis owner",
      "Defer non-critical judgement disputes to after-action review",
    ],
    typicalCouncilInteraction:
      "War-room mode; consensusState = crisis even if some roles were still Investigating.",
    communicationStyle: "Command clarity. Short sentences. Facts and next actions only.",
  },
};

export function getJudgementState(id: JudgementStateId): JudgementStateDefinition {
  return JUDGEMENT_STATES[id];
}

export function judgementStateIntensity(id: JudgementStateId): number {
  const order: JudgementStateId[] = [
    "observe",
    "monitor",
    "investigate",
    "challenge",
    "recommend",
    "escalate",
    "crisis",
  ];
  return order.indexOf(id);
}
