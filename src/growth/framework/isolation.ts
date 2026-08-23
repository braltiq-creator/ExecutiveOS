const FORBIDDEN = [
  "discoveries",
  "opportunities",
  "jobs",
  "emails",
  "messages",
  "decisionContent",
  "rawProviderPayload",
  "cardNumber",
  "cvv",
] as const;

export function assertGrowthPayload(payload: Record<string, unknown>): void {
  for (const key of FORBIDDEN) {
    if (key in payload) {
      throw new Error(`Growth isolation violation: forbidden key "${key}"`);
    }
  }
}
