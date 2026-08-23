export const DEFAULT_AI_PROVIDER = "openai" as const;

export const AI_MODELS = {
  chiefOfStaff: "gpt-4o-mini",
} as const;

export const AI_DEFAULTS = {
  temperature: 0.4,
  maxTokens: 1200,
  maxHistoryTurns: 12,
} as const;

export function getConfiguredProviderName(): string {
  return process.env.AI_PROVIDER ?? DEFAULT_AI_PROVIDER;
}

export function getChiefOfStaffModel(): string {
  return process.env.AI_CHIEF_OF_STAFF_MODEL ?? AI_MODELS.chiefOfStaff;
}
