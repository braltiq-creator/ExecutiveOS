/**
 * Council validation — observe every Executive Council member under simulation.
 */

import { buildExecutiveCouncilView } from "@/experience/executive-council/derive";
import { EXECUTIVE_COUNCIL } from "@/experience/executive-council/members";
import type { ExperienceSurface } from "@/simulation/enterprise/experience-bridge";
import type {
  CouncilMemberValidation,
  CouncilValidation,
  OperatingMode,
} from "@/simulation/enterprise/types";

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function scoreMember(input: {
  hasOpinion: boolean;
  hasObservation: boolean;
  opinionConfidence: number;
  position: string;
  stanceCount: number;
  urgency: string | null;
  learningPresent: boolean;
  mode: OperatingMode;
}): Omit<CouncilMemberValidation, "roleId" | "shortTitle" | "notes"> {
  const observationQuality = input.hasObservation
    ? clamp(55 + input.opinionConfidence * 0.35)
    : input.hasOpinion
      ? 48
      : 20;

  const timing =
    input.urgency === "today"
      ? 90
      : input.urgency === "this_week"
        ? 72
        : input.hasObservation
          ? 58
          : input.mode === "crisis"
            ? 35
            : 60;

  const reasoning = input.hasOpinion
    ? clamp(50 + input.opinionConfidence * 0.4)
    : 25;

  const collaboration = clamp(40 + input.stanceCount * 18);

  const escalation =
    input.position === "defer" || input.position === "watch"
      ? 78
      : input.urgency === "today"
        ? 84
        : 62;

  const decisionQuality = input.hasOpinion
    ? clamp(48 + input.opinionConfidence * 0.42)
    : 30;

  const learning = input.learningPresent ? 70 : 45;

  return {
    observationQuality,
    timing,
    reasoning,
    collaboration,
    escalation,
    decisionQuality,
    learning,
    hasOpinion: input.hasOpinion,
    hasObservation: input.hasObservation,
  };
}

/**
 * Validate CEO / CFO / COO / CRO / CSO behaviour on a stressed experience surface.
 */
export function validateCouncil(
  surface: ExperienceSurface,
  mode: OperatingMode,
): CouncilValidation {
  const council = buildExecutiveCouncilView({
    snapshot: surface.snapshot,
    strategicOutcomes: surface.strategicOutcomes,
    decisions: surface.decisions,
  });

  const observations = council.agency?.observations ?? [];
  const collaborations = council.agency?.collaborations ?? [];
  const unexpectedBehaviours: string[] = [];

  const members: CouncilMemberValidation[] = EXECUTIVE_COUNCIL.map((member) => {
    const opinion = council.opinions.find((item) => item.roleId === member.id);
    const observation = observations.find((item) => item.roleId === member.id);
    const memberStances = collaborations.filter(
      (item) =>
        item.fromRoleId === member.id || item.toRoleId === member.id,
    );

    const scores = scoreMember({
      hasOpinion: Boolean(opinion),
      hasObservation: Boolean(observation),
      opinionConfidence: opinion?.confidence ?? 0,
      position: opinion?.position ?? "watch",
      stanceCount: memberStances.length,
      urgency: observation?.urgency ?? null,
      learningPresent: Boolean(
        council.learning || council.agency?.discussionLearning,
      ),
      mode,
    });

    const notes: string[] = [];
    if (!opinion) {
      notes.push("No opinion produced");
      unexpectedBehaviours.push(`${member.shortTitle} silent under ${mode}`);
    }
    if (mode === "crisis" && !observation) {
      notes.push("No proactive observation in crisis mode");
      unexpectedBehaviours.push(
        `${member.shortTitle} did not observe during crisis`,
      );
    }
    if (observation) {
      notes.push(`Observed: ${observation.urgency}`);
    }
    if (memberStances.length > 0) {
      notes.push(`${memberStances.length} collaboration stances`);
    }

    return {
      roleId: member.id,
      shortTitle: member.shortTitle,
      ...scores,
      notes,
    };
  });

  const consensusScore = clamp(council.consensus?.confidence ?? 0);
  const collaborationScore = clamp(
    members.reduce((sum, item) => sum + item.collaboration, 0) /
      Math.max(1, members.length),
  );

  const opinionsComplete = members.every((item) => item.hasOpinion);
  const crisisCoverage =
    mode !== "crisis" || observations.length >= 1;

  if (!council.consensus) {
    unexpectedBehaviours.push("Council failed to form consensus");
  }

  return {
    pass: opinionsComplete && crisisCoverage && Boolean(council.consensus),
    consensusScore,
    collaborationScore,
    members,
    unexpectedBehaviours,
  };
}
