/**
 * Executive Intent Engine (EInE) — understands the executive, not just the business.
 * Pure TypeScript. Independently replaceable.
 */

export type ExecutiveRole = "CEO" | "COO" | "CFO" | "ChiefOfStaff";

export type TimeHorizon =
  | "this_week"
  | "this_quarter"
  | "6_months"
  | "12_months"
  | "multi_year";

export type RiskAppetite = "conservative" | "balanced" | "aggressive";

export type DelegationStyle =
  | "hands_on"
  | "selective"
  | "empowering"
  | "fully_delegates";

export type StrategicAlignmentLevel =
  | "high"
  | "medium"
  | "low"
  | "conflicts";

export const ALIGNMENT_LABELS: Record<StrategicAlignmentLevel, string> = {
  high: "High Alignment",
  medium: "Medium Alignment",
  low: "Low Alignment",
  conflicts: "Conflicts With Executive Intent",
};

export type StrategicPriority = {
  id: string;
  title: string;
  /** 0–100 importance to this executive */
  weight: number;
  timeHorizon: TimeHorizon;
  ownerRole: ExecutiveRole;
  /** Outcome / initiative ids this priority maps to */
  relatedOutcomeIds: string[];
  relatedThemeIds?: string[];
  narrative?: string;
};

export type LeadershipTheme = {
  id: string;
  title: string;
  weight: number;
  description: string;
};

export type QuarterlyObjective = {
  id: string;
  title: string;
  weight: number;
  quarter: string;
  relatedOutcomeIds: string[];
  successSignal: string;
};

export type DecisionPreferences = {
  /** Prefer binding today vs gathering more info */
  biasTowardAction: number;
  /** Prefer option papers before bind */
  requiresOptionPaper: boolean;
  /** Escalate cross-functional risk above this score */
  escalateAboveRisk: number;
  preferredActs: Array<
    "approve" | "delegate" | "escalate" | "wait" | "investigate" | "schedule"
  >;
};

export type AttentionPreferences = {
  /** Minutes reserved for Focus work */
  focusBlockMinutes: number;
  maxOpenDecisions: number;
  preferDeepWorkMorning: boolean;
  interruptTolerance: "low" | "medium" | "high";
};

export type MeetingPreferences = {
  maxMeetingsPerDay: number;
  preferAsyncUpdates: boolean;
  protectStrategyBlocks: boolean;
  declineDuplicateForums: boolean;
};

export type ExecutivePreferences = {
  decision: DecisionPreferences;
  attention: AttentionPreferences;
  meeting: MeetingPreferences;
};

export type IntentTargetKind =
  | "decision"
  | "recommendation"
  | "outcome"
  | "action"
  | "risk"
  | "opportunity"
  | "meeting";

export type IntentScorable = {
  id: string;
  kind: IntentTargetKind;
  label: string;
  /** Linked strategic outcomes */
  outcomeIds?: string[];
  /** Free-text keywords for theme/priority matching */
  themes?: string[];
  /** Business importance 0–100 from Intelligence Engine */
  businessImportance?: number;
  /** Estimated effort minutes */
  estimatedMinutes?: number;
  /** Optional act for delegation advice */
  recommendedAct?: string;
  riskSignal?: number;
};

export type IntentScore = {
  targetId: string;
  kind: IntentTargetKind;
  /** 0–100 intent fit */
  intentScore: number;
  businessImportance: number;
  /** Combined rank signal — business AND intent */
  attentionPriority: number;
  alignment: StrategicAlignmentLevel;
  alignmentLabel: string;
  matchedPriorities: Array<{ id: string; title: string; weight: number }>;
  conflicts: string[];
  reasoning: string;
};

export type DelegationAdvice = {
  shouldDelegate: boolean;
  act: "delegate" | "keep" | "escalate" | "schedule";
  reason: string;
  suggestedOwnerRole?: ExecutiveRole | "team";
};

export type ExecutiveIntentProfile = {
  id: string;
  role: ExecutiveRole;
  executiveName: string;
  title: string;
  asOf: string;
  strategicPriorities: StrategicPriority[];
  leadershipThemes: LeadershipTheme[];
  quarterlyObjectives: QuarterlyObjective[];
  preferences: ExecutivePreferences;
  riskAppetite: RiskAppetite;
  timeHorizon: TimeHorizon;
  delegationStyle: DelegationStyle;
  /** Soft capacity: how much judgement load they will absorb */
  leadershipCapacity: "protected" | "standard" | "stretched";
  narrative: string;
};

export type IntentNarrative = {
  morningFocus: string;
  priorityLens: string;
  /** Replaces "what happened" with "what affects YOUR priorities" */
  sinceYesterdayLens: string;
  operatingPosture: string;
};
