import type { ExdsHealthLevel, ExdsSemanticTone, ExdsTrendDirection } from "./types";

/** Maps semantic tones to CSS custom properties. */
export const EXDS_TONE_VAR: Record<ExdsSemanticTone, string> = {
  intelligence: "var(--exds-intelligence)",
  improving: "var(--exds-improving)",
  watching: "var(--exds-watching)",
  attention: "var(--exds-attention)",
  historical: "var(--exds-historical)",
  strategy: "var(--exds-strategy)",
  decision: "var(--exds-decision)",
};

export const EXDS_TONE_SOFT_VAR: Record<ExdsSemanticTone, string> = {
  intelligence: "var(--exds-intelligence-soft)",
  improving: "var(--exds-improving-soft)",
  watching: "var(--exds-watching-soft)",
  attention: "var(--exds-attention-soft)",
  historical: "var(--exds-historical-soft)",
  strategy: "var(--exds-strategy-soft)",
  decision: "var(--exds-decision-soft)",
};

export const EXDS_TONE_LABEL: Record<ExdsSemanticTone, string> = {
  intelligence: "Intelligence / Evidence",
  improving: "Improving / Protected",
  watching: "Watching / Uncertainty",
  attention: "Attention / Exposure",
  historical: "Historical",
  strategy: "Strategic",
  decision: "Executive attention / Decision",
};

export function toneFromHealth(health: ExdsHealthLevel): ExdsSemanticTone {
  switch (health) {
    case "healthy":
      return "improving";
    case "watch":
      return "watching";
    case "attention":
      return "attention";
    case "unknown":
      return "historical";
    default:
      return "intelligence";
  }
}

export function toneFromTrend(
  direction: ExdsTrendDirection,
  invert = false,
): ExdsSemanticTone {
  if (direction === "flat") return "historical";
  const positive = invert ? direction === "down" : direction === "up";
  return positive ? "improving" : "attention";
}

export function clampConfidence(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}
