/**
 * Portable Executive Context — vendor-independent.
 * Microsoft 365 (or Google Workspace) produces this shape; Core never sees vendor objects.
 */

export const EXECUTIVE_SIGNAL_IDS = [
  "board_readiness",
  "decision_overload",
  "meeting_saturation",
  "stakeholder_neglect",
  "follow_up_risk",
  "communication_gaps",
  "executive_availability",
  "collaboration_health",
  "decision_velocity",
] as const;

export type ExecutiveSignalId = (typeof EXECUTIVE_SIGNAL_IDS)[number];

export type ExecutiveSignalSeverity = "critical" | "high" | "moderate" | "low" | "healthy";

export type ExecutiveSignal = {
  id: ExecutiveSignalId;
  label: string;
  severity: ExecutiveSignalSeverity;
  score: number;
  summary: string;
  evidence: string[];
  relatedEntityIds: string[];
};

export type ExecutiveCommitmentKind =
  | "executive_commitment"
  | "governance_event"
  | "strategic_coordination"
  | "operational_review"
  | "customer_engagement"
  | "focus_block";

export type ExecutiveCommitment = {
  id: string;
  title: string;
  kind: ExecutiveCommitmentKind;
  startsAt: string;
  endsAt: string;
  stakeholders: string[];
  relatedDecisionIds: string[];
  relatedOutcomeIds: string[];
  preparationRisk: "none" | "low" | "moderate" | "high";
  whyItMatters: string;
};

export type StrategicEvidenceDoc = {
  id: string;
  title: string;
  kind: "board_pack" | "strategy" | "decision_memo" | "operating_report" | "other";
  whyItMatters: string;
  relatedDecisionIds: string[];
  relatedOutcomeIds: string[];
};

export type ExecutiveCollaborationSignal = {
  id: string;
  topic: string;
  channel: "teams" | "email" | "meeting" | "planner";
  summary: string;
  stakeholders: string[];
  relatedInitiativeIds: string[];
  urgency: "low" | "moderate" | "high";
};

export type StakeholderRelationship = {
  id: string;
  name: string;
  roleHint: string;
  relationship:
    | "board"
    | "executive_team"
    | "committee"
    | "customer"
    | "partner"
    | "supplier"
    | "internal";
  lastTouchAt: string | null;
  neglectRisk: boolean;
  relatedEntityIds: string[];
};

export type ExecutiveCommunicationSignal = {
  id: string;
  subject: string;
  from: string;
  receivedAt: string;
  attention: "critical" | "attention" | "fyi";
  whyItMatters: string;
  relatedDecisionIds: string[];
};

export type InitiativeProgressSignal = {
  id: string;
  title: string;
  progressHint: string;
  relatedInitiativeIds: string[];
  status: "on_track" | "watch" | "at_risk" | "blocked";
};

export type ExecutiveContextBrief = {
  asOf: string;
  /** Provider that produced this brief — never vendor payload */
  providerId: "microsoft365" | "google_workspace" | "mock";
  framing: string;
  commitments: ExecutiveCommitment[];
  signals: ExecutiveSignal[];
  stakeholders: StakeholderRelationship[];
  documents: StrategicEvidenceDoc[];
  conversations: ExecutiveCollaborationSignal[];
  communications: ExecutiveCommunicationSignal[];
  initiativeProgress: InitiativeProgressSignal[];
  boardReadiness: {
    level: "ready" | "nearly" | "not_ready";
    label: string;
    detail: string;
  };
  upcomingDecisionIds: string[];
  closingNote: string;
};

/** Today presentation model — still vendor-free */
export type ExecutiveContextView = {
  framing: string;
  boardReadiness: {
    level: string;
    label: string;
    detail: string;
  };
  calendar: Array<{
    id: string;
    title: string;
    kindLabel: string;
    when: string;
    preparationRisk: string;
    whyItMatters: string;
    stakeholders: string[];
  }>;
  keyRelationships: Array<{
    name: string;
    roleHint: string;
    relationship: string;
    neglectRisk: boolean;
  }>;
  meetingRisks: string[];
  upcomingDecisions: string[];
  criticalDocuments: Array<{ title: string; whyItMatters: string }>;
  strategicConversations: Array<{ topic: string; summary: string; urgency: string }>;
  signals: Array<{
    label: string;
    severity: string;
    summary: string;
  }>;
  closingNote: string;
};
