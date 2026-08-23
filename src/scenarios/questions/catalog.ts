/**
 * Portable question catalogue — profile executive questions as first-class IDs.
 */

import type { IntelligenceProfileId } from "@/profiles";
import { listScenariosForProfile } from "@/scenarios/framework";

export type ExecutiveQuestionRef = {
  id: string;
  profileId: IntelligenceProfileId;
  question: string;
  scenarioId: string;
};

export function listExecutiveQuestions(
  profileId: IntelligenceProfileId,
): ExecutiveQuestionRef[] {
  return listScenariosForProfile(profileId).map((s) => ({
    id: `q-${s.id}`,
    profileId,
    question: s.businessQuestion,
    scenarioId: s.id,
  }));
}

export function findQuestionByText(
  profileId: IntelligenceProfileId,
  question: string,
): ExecutiveQuestionRef | undefined {
  const normalised = question.trim().toLowerCase();
  return listExecutiveQuestions(profileId).find(
    (q) => q.question.toLowerCase() === normalised,
  );
}
