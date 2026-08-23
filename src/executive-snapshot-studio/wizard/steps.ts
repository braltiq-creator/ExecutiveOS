import type { StudioWizardStepId } from "../types";

export const STUDIO_STEP_META: Record<
  StudioWizardStepId,
  { index: number; label: string; question: string }
> = {
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
    question: "Confirm Manufacturing · Forecasting.",
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
    question: "Generate Manufacturing Forecast Intelligence.",
  },
  brief: {
    index: 8,
    label: "Command Centre",
    question: "What requires executive judgement today?",
  },
};
