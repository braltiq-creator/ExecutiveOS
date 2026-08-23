/**
 * Council judgement — preserve differing states; never average them away.
 */

import { getJudgementState, judgementStateIntensity } from "@/judgement-framework/states";
import type {
  CouncilJudgement,
  JudgementStateId,
  RoleJudgementAssessment,
} from "@/judgement-framework/types";

function uniqueStates(assessments: RoleJudgementAssessment[]): JudgementStateId[] {
  return [...new Set(assessments.map((a) => a.state))];
}

/**
 * Consensus is a working next move for the Council — not the mean of states.
 *
 * Rules (in order):
 * 1. Any Crisis → Crisis (contain first; dissent recorded for after-action)
 * 2. Any Escalate + any Investigate/Challenge/lower disagreement → Investigate
 *    before decision (mission example pattern)
 * 3. Any Escalate without investigative dissent → Escalate
 * 4. Any Challenge → Challenge
 * 5. Any Investigate → Investigate
 * 6. Any Recommend with Monitor/Observe dissent → Investigate (do not rubber-stamp)
 * 7. Uniform Recommend → Recommend
 * 8. Else highest non-crisis shared watch posture (Monitor/Observe)
 */
export function deriveCouncilConsensus(
  assessments: RoleJudgementAssessment[],
): {
  consensusState: JudgementStateId;
  narrative: string;
  requiresInvestigationBeforeDecision: boolean;
  escalateImmediately: boolean;
} {
  if (assessments.length === 0) {
    return {
      consensusState: "observe",
      narrative: "No executive judgements supplied.",
      requiresInvestigationBeforeDecision: false,
      escalateImmediately: false,
    };
  }

  const states = uniqueStates(assessments);
  const has = (id: JudgementStateId) => states.includes(id);

  if (has("crisis")) {
    return {
      consensusState: "crisis",
      narrative:
        "At least one executive judges Crisis — contain immediately. Differing judgements preserved for after-action review.",
      requiresInvestigationBeforeDecision: false,
      escalateImmediately: true,
    };
  }

  if (has("escalate")) {
    const investigativeDissent = assessments.some((a) =>
      ["investigate", "challenge", "monitor", "observe"].includes(a.state),
    );
    if (investigativeDissent && (has("investigate") || has("challenge") || has("monitor"))) {
      return {
        consensusState: "investigate",
        narrative:
          "Council Consensus: Investigate before decision. Escalation pressure exists, but other executives hold Monitor/Investigate/Challenge — preserve dissent; do not average into silent escalate.",
        requiresInvestigationBeforeDecision: true,
        escalateImmediately: false,
      };
    }
    return {
      consensusState: "escalate",
      narrative:
        "Council alignment on Escalate — raise altitude with the specific ask. Minority states remain on record.",
      requiresInvestigationBeforeDecision: false,
      escalateImmediately: true,
    };
  }

  if (has("challenge")) {
    return {
      consensusState: "challenge",
      narrative:
        "Council Consensus: Challenge the forming narrative before recommending. Minority postures preserved.",
      requiresInvestigationBeforeDecision: true,
      escalateImmediately: false,
    };
  }

  if (has("investigate")) {
    return {
      consensusState: "investigate",
      narrative:
        "Council Consensus: Investigate before decision. Executives do not yet share a recommendation posture.",
      requiresInvestigationBeforeDecision: true,
      escalateImmediately: false,
    };
  }

  if (has("recommend")) {
    const dissent = assessments.some((a) =>
      ["monitor", "observe", "investigate", "challenge"].includes(a.state),
    );
    if (dissent) {
      return {
        consensusState: "investigate",
        narrative:
          "Some executives Recommend while others withhold or challenge — Investigate before decision; do not average into Recommend.",
        requiresInvestigationBeforeDecision: true,
        escalateImmediately: false,
      };
    }
    return {
      consensusState: "recommend",
      narrative: "Council alignment on Recommend — advice is owned; human still decides.",
      requiresInvestigationBeforeDecision: false,
      escalateImmediately: false,
    };
  }

  if (has("monitor")) {
    return {
      consensusState: "monitor",
      narrative: "Council Consensus: Monitor — action not required; blindness would be.",
      requiresInvestigationBeforeDecision: false,
      escalateImmediately: false,
    };
  }

  return {
    consensusState: "observe",
    narrative: "Council Consensus: Observe — no material posture required.",
    requiresInvestigationBeforeDecision: false,
    escalateImmediately: false,
  };
}

export function formCouncilJudgement(
  assessments: RoleJudgementAssessment[],
  asOf: string = new Date().toISOString(),
): CouncilJudgement {
  const { consensusState, narrative, requiresInvestigationBeforeDecision, escalateImmediately } =
    deriveCouncilConsensus(assessments);

  const dissentingStates = assessments.map((a) => ({
    roleId: a.roleId,
    state: a.state,
  }));

  const minority = assessments
    .filter((a) => a.state !== consensusState)
    .map((a) => ({
      roleId: a.roleId,
      state: a.state,
      note: `${a.stateLabel} retained — not averaged into ${getJudgementState(consensusState).label}.`,
    }));

  // Stable order by intensity for explainability
  const ordered = [...assessments].sort(
    (a, b) => judgementStateIntensity(b.state) - judgementStateIntensity(a.state),
  );

  return {
    asOf,
    assessments: ordered,
    dissentingStates,
    consensusState,
    consensusNarrative: narrative,
    minority,
    requiresInvestigationBeforeDecision,
    escalateImmediately,
  };
}
