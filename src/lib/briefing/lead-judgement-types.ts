/**
 * Lead Judgement — the defining Today experience model.
 * Derived for the Briefing; not a KPI dashboard.
 */

export type AttentionBand = "critical" | "strategic" | "routine";

export type ExecutiveReadiness =
  | "ready"
  | "stable"
  | "watch_closely"
  | "high_attention";

export type AttentionTallyKind =
  | "urgent_decision"
  | "strategic_opportunity"
  | "operational_risk"
  | "clear";

export type AttentionTallyItem = {
  id: string;
  kind: AttentionTallyKind;
  /** Human line, e.g. "1 urgent decision" */
  label: string;
};

export type LeadJudgementModel = {
  /** Display greeting, e.g. "Good morning, Alex" */
  greeting: string;
  /** One-line framing of the day */
  framingLine: string;
  /** Sparse tally of what the day contains */
  attentionTally: AttentionTallyItem[];
  /** Explicit calm — what does not need the executive now */
  canWait: string;
  /**
   * Chief of Staff prose — multi-sentence summary.
   * Institutional voice; never chatbot tone.
   */
  executiveSummary: string;
  /** Named focus areas for the morning */
  focusAreas: string[];
  /** Dominant attention band — only one is primary */
  attentionBand: AttentionBand;
  attentionBandLabel: string;
  attentionBandWhy: string;
  readiness: ExecutiveReadiness;
  readinessLabel: string;
  readinessWhy: string;
  /** Estimated review minutes — confidence, not a stopwatch KPI */
  reviewMinutes: number;
  asOf: string;
  primaryOutcomeId: string;
  /** Short answer: what requires attention */
  whatRequiresAttention: string;
  /** Short answer: why it matters */
  whyItMatters: string;
};

export const READINESS_LABELS: Record<ExecutiveReadiness, string> = {
  ready: "Ready",
  stable: "Stable",
  watch_closely: "Watch Closely",
  high_attention: "High Attention Required",
};

export const ATTENTION_BAND_LABELS: Record<AttentionBand, string> = {
  critical: "Critical",
  strategic: "Strategic",
  routine: "Routine",
};
