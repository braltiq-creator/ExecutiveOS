/** Presentation-only Mission Control models. */

export type McTrend = "up" | "down" | "flat";

export type McSeverity = "positive" | "negative" | "neutral" | "warning" | "critical";

export type McKpiId =
  | "organisation_health"
  | "executive_intelligence"
  | "executive_value"
  | "strategic_outcomes"
  | "priority_decisions"
  | "critical_risks"
  | "customer_health"
  | "system_health"
  | "people_health"
  | "commercial_health";

export type McKpi = {
  id: McKpiId;
  label: string;
  value: string;
  /** Short trend / status label (Improving, Waiting, High). */
  status: string;
  trend: McTrend;
  severity: McSeverity;
  confidence: number;
  href: string;
  /** Optional relative update stamp for live feel. */
  updatedLabel?: string;
  /** Subtle indication after Operating Loop recalculation. */
  changed?: boolean;
};

export type McSnapshotCard = {
  id: string;
  headline: string;
  /** One-line summary. */
  sentence: string;
  /** Business impact — one short line. */
  impact: string;
  href: string;
  cta: string;
};

export type McActivityItem = {
  id: string;
  timeLabel: string;
  at: string;
  headline: string;
  href: string;
  /** Loop-generated organisational event. */
  highlight?: boolean;
};

export type McPulseSignal = {
  id: string;
  mark: "up" | "down" | "dot" | "stable";
  text: string;
  severity: McSeverity;
};

export type McPulse = {
  headline: string;
  signals: McPulseSignal[];
  confidence: number;
};
