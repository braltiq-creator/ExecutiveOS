export type ExperienceTone =
  | "neutral"
  | "accent"
  | "success"
  | "attention"
  | "critical";

/** Map common health/status strings to Experience badge tones. */
export function statusToTone(status: string): ExperienceTone {
  const normalized = status.toLowerCase().replace(/\s+/g, "_");
  if (
    normalized.includes("on_track") ||
    normalized.includes("stable") ||
    normalized.includes("improving") ||
    normalized.includes("achieved")
  ) {
    return "success";
  }
  if (
    normalized.includes("at_risk") ||
    normalized.includes("attention") ||
    normalized.includes("watching")
  ) {
    return "attention";
  }
  if (
    normalized.includes("off_track") ||
    normalized.includes("critical") ||
    normalized.includes("blocked")
  ) {
    return "critical";
  }
  return "neutral";
}
