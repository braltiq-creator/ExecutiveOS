import {
  getStudioIntelligenceQuestion,
  getStudioProfileQuestion,
} from "../profile-detection";
import type { StudioBusinessProfileId, StudioWizardStepId } from "../types";

export type StudioStepMeta = {
  index: number;
  label: string;
  question: string;
};

/**
 * Shared step chrome (index + label). Profile/intelligence questions are
 * resolved via {@link resolveStudioStepMeta} from profile metadata SoT.
 */
export const STUDIO_STEP_META: Record<StudioWizardStepId, StudioStepMeta> = {
  welcome: {
    index: 1,
    label: "Welcome",
    question: "Let's establish your Executive Forecasting Environment.",
  },
  upload: {
    index: 2,
    label: "Data",
    question: "Upload your forecasting dataset.",
  },
  profile: {
    index: 3,
    label: "Profile",
    question: "Confirm your Executive Intelligence profile.",
  },
  mapping: {
    index: 4,
    label: "Mapping",
    question: "Confirm source fields.",
  },
  validation: {
    index: 5,
    label: "Validation",
    question: "What is ready — and what is missing?",
  },
  snapshot: {
    index: 6,
    label: "Snapshot",
    question: "Create an immutable Executive Snapshot.",
  },
  intelligence: {
    index: 7,
    label: "Intelligence",
    question: "Generate Executive Intelligence.",
  },
  brief: {
    index: 8,
    label: "Command Centre",
    question: "What requires executive judgement today?",
  },
};

/**
 * Resolve wizard step copy for the active business profile.
 * Profile + Intelligence questions come from profile-detection metadata.
 */
export function resolveStudioStepMeta(
  step: StudioWizardStepId,
  profileId?: StudioBusinessProfileId | null,
): StudioStepMeta {
  const base = STUDIO_STEP_META[step];
  if (!profileId) return base;

  if (step === "profile") {
    return { ...base, question: getStudioProfileQuestion(profileId) };
  }
  if (step === "intelligence") {
    return { ...base, question: getStudioIntelligenceQuestion(profileId) };
  }
  return base;
}
