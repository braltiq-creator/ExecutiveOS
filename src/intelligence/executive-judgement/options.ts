import type { RecommendationAct } from "@/intelligence/executive-intelligence/types";
import type { DecisionOption } from "@/intelligence/executive-judgement/types";

/**
 * Viable alternatives for Northline material Decisions.
 * EJE never presents a sole course when alternatives exist here.
 */
export function optionsForDecision(decisionId: string): DecisionOption[] {
  if (decisionId === "decision-residency") {
    return [
      {
        id: "opt-helix-approve-controls",
        label: "Approve written compensating-controls posture",
        act: "approve",
        summary:
          "Bind a written EU residency / compensating-controls position so Helix commercial motion can resume.",
        dimensionHints: {
          strategic_alignment: 88,
          financial_impact: 84,
          customer_impact: 90,
          compliance: 52,
          risk_profile: 48,
          opportunity_cost: 86,
          timing: 88,
        },
      },
      {
        id: "opt-helix-investigate",
        label: "Investigate via security workshop before bind",
        act: "investigate",
        summary:
          "Use the scheduled Helix security workshop to close unknowns, then bind within the procurement window.",
        dimensionHints: {
          strategic_alignment: 72,
          financial_impact: 60,
          compliance: 78,
          risk_profile: 70,
          opportunity_cost: 48,
          timing: 55,
          confidence: 68,
        },
      },
      {
        id: "opt-helix-delegate-memo",
        label: "Delegate memo; retain CEO bind",
        act: "delegate",
        summary:
          "Delegate exception-memo drafting to counsel; keep the bind decision with the CEO.",
        dimensionHints: {
          people_impact: 80,
          operational_impact: 74,
          strategic_alignment: 70,
          timing: 64,
          compliance: 66,
        },
      },
      {
        id: "opt-helix-wait",
        label: "Wait for fuller security package",
        act: "wait",
        summary:
          "Defer the bind until a fuller security package lands — accepts procurement-window risk.",
        dimensionHints: {
          compliance: 82,
          risk_profile: 40,
          opportunity_cost: 28,
          timing: 30,
          financial_impact: 35,
          customer_impact: 32,
        },
      },
    ];
  }

  if (decisionId === "decision-forum") {
    return [
      {
        id: "opt-forum-approve",
        label: "Collapse duplicate leadership forums",
        act: "approve",
        summary: "Merge Ops/Product forums to reclaim judgement time.",
        dimensionHints: {
          operational_impact: 88,
          people_impact: 70,
          strategic_alignment: 75,
          timing: 70,
        },
      },
      {
        id: "opt-forum-delegate",
        label: "Delegate forum redesign to CoS",
        act: "delegate",
        summary: "Chief of Staff runs the operating-cadence redesign; CEO ratifies.",
        dimensionHints: {
          people_impact: 85,
          operational_impact: 78,
          strategic_alignment: 68,
        },
      },
      {
        id: "opt-forum-wait",
        label: "Wait until after board week",
        act: "wait",
        summary: "Protect board prep; revisit forum collapse next week.",
        dimensionHints: {
          timing: 45,
          opportunity_cost: 40,
          operational_impact: 50,
        },
      },
    ];
  }

  if (decisionId === "decision-board-risk") {
    return [
      {
        id: "opt-board-approve",
        label: "Approve honest Helix disclosure language",
        act: "approve",
        summary: "Lock board-pack language that states residual residency risk clearly.",
        dimensionHints: {
          compliance: 88,
          strategic_alignment: 86,
          risk_profile: 72,
          timing: 84,
        },
      },
      {
        id: "opt-board-investigate",
        label: "Investigate residual wording with counsel",
        act: "investigate",
        summary: "Stress-test disclosure language before pack freeze.",
        dimensionHints: {
          compliance: 90,
          timing: 60,
          opportunity_cost: 55,
        },
      },
      {
        id: "opt-board-escalate",
        label: "Escalate contested wording to Chair prep",
        act: "escalate",
        summary: "Surface contested disclosure to Chair before Friday freeze.",
        dimensionHints: {
          compliance: 80,
          people_impact: 58,
          timing: 75,
        },
      },
    ];
  }

  return defaultOptionsForAct("approve");
}

export function defaultOptionsForAct(primary: RecommendationAct): DecisionOption[] {
  const primaryOption: DecisionOption = {
    id: `opt-primary-${primary}`,
    label: labelForAct(primary),
    act: primary,
    summary: `Primary path under consideration: ${primary}.`,
  };

  const catalogue: DecisionOption[] = [
    {
      id: "opt-alt-investigate",
      label: "Investigate further before bind",
      act: "investigate",
      summary: "Close material unknowns, then return for judgement.",
    },
    {
      id: "opt-alt-wait",
      label: "Wait for a clearer signal",
      act: "wait",
      summary: "Defer bind; accept delay cost explicitly.",
    },
    {
      id: "opt-alt-delegate",
      label: "Delegate preparation; retain bind",
      act: "delegate",
      summary: "Move preparation off the executive; keep the bind.",
    },
  ];
  const alternatives = catalogue.filter((option) => option.act !== primary);

  return [primaryOption, ...alternatives];
}

function labelForAct(act: RecommendationAct): string {
  switch (act) {
    case "approve":
      return "Approve the recommended path";
    case "reject":
      return "Reject the path";
    case "delegate":
      return "Delegate with retained oversight";
    case "escalate":
      return "Escalate for broader judgement";
    case "wait":
      return "Wait";
    case "defer":
      return "Defer";
    case "investigate":
      return "Investigate";
    case "schedule":
      return "Schedule structured review";
    default:
      return act;
  }
}
