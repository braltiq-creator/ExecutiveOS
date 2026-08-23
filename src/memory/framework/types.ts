/**
 * Executive Organisational Memory Engine — types.
 * Extends institutional knowledge without changing Core architecture.
 * Distinct from src/lib/memory and src/intelligence/executive-memory.
 */

import type { IntelligenceProfileId } from "@/profiles";

export type MemoryEpisode = {
  id: string;
  tenantId: string;
  name: string;
  profileId: IntelligenceProfileId;
  scenarioId: string | null;
  businessQuestion: string;
  context: string;
  evidence: string[];
  decision: string | null;
  actionsTaken: string[];
  observedOutcome: string | null;
  lessonsLearned: string[];
  confidence: number;
  participants: string[];
  relatedBusinessEventIds: string[];
  timestamp: string;
  createdAt: string;
  updatedAt: string;
};

export type SignificantDecisionKind =
  | "major_customer_intervention"
  | "executive_escalation"
  | "operational_restructuring"
  | "forecast_adjustment"
  | "resource_reallocation"
  | "investment_approval"
  | "strategic_planning"
  | "other";

export type MemoryDecisionRecord = {
  id: string;
  tenantId: string;
  kind: SignificantDecisionKind;
  title: string;
  profileId: IntelligenceProfileId;
  scenarioId: string | null;
  recommendationId: string | null;
  outcomeId: string | null;
  episodeId: string | null;
  businessEvidence: string[];
  decidedAt: string;
  decidedBy: string;
  summary: string;
};

export type TimelineEventKind =
  | "business_event"
  | "executive_decision"
  | "business_outcome"
  | "operational_disruption"
  | "commercial_milestone"
  | "leadership_change"
  | "strategic_initiative"
  | "memory_episode";

export type OrganisationalTimelineEvent = {
  id: string;
  tenantId: string;
  kind: TimelineEventKind;
  title: string;
  detail: string;
  at: string;
  relatedEpisodeId: string | null;
  relatedDecisionId: string | null;
  importance: "critical" | "high" | "moderate" | "low";
};

export type MemoryPatternKind =
  | "forecast_confidence_decline"
  | "capacity_shortage"
  | "customer_churn_signal"
  | "repeated_safety_risk"
  | "pipeline_deterioration"
  | "operational_bottleneck"
  | "recurring_executive_intervention"
  | "custom";

export type MemoryPattern = {
  id: string;
  tenantId: string;
  kind: MemoryPatternKind;
  name: string;
  description: string;
  occurrenceCount: number;
  episodeIds: string[];
  firstSeenAt: string;
  lastSeenAt: string;
  confidence: number;
  reusableGuidance: string;
};

export type LessonLearned = {
  id: string;
  tenantId: string;
  episodeId: string | null;
  decisionId: string | null;
  whatWorked: string[];
  whatFailed: string[];
  unexpectedOutcomes: string[];
  futureRecommendations: string[];
  capturedBy: string;
  capturedAt: string;
  tags: string[];
};

export type LivingPlaybookKind =
  | "strategic_account_recovery"
  | "operational_incident_response"
  | "forecast_recovery"
  | "major_customer_escalation"
  | "executive_crisis_management"
  | "custom";

export type LivingExecutivePlaybook = {
  id: string;
  tenantId: string;
  kind: LivingPlaybookKind;
  title: string;
  summary: string;
  steps: string[];
  sourceEpisodeIds: string[];
  sourceLessonIds: string[];
  evolutionNotes: string[];
  confidence: number;
  updatedAt: string;
  createdAt: string;
};

export type MemoryRecallResult = {
  tenantId: string;
  query: string;
  asOf: string;
  similarEpisodes: Array<{
    episodeId: string;
    name: string;
    businessQuestion: string;
    similarity: number;
    lessons: string[];
  }>;
  previousDecisions: Array<{
    decisionId: string;
    title: string;
    kind: SignificantDecisionKind;
    similarity: number;
  }>;
  comparableOutcomes: string[];
  lessons: string[];
  relatedStakeholders: string[];
  relevantInitiatives: string[];
  supportingEvidence: string[];
  overallSimilarityConfidence: number;
  explanation: string;
};

export type MemoryInsight = {
  id: string;
  tenantId: string;
  title: string;
  detail: string;
  kind: "pattern" | "lesson" | "playbook" | "timeline";
  confidence: number;
  asOf: string;
};

export type MemoryGrowthMetrics = {
  tenantId: string;
  asOf: string;
  episodeCount: number;
  decisionCount: number;
  patternCount: number;
  lessonCount: number;
  playbookCount: number;
  timelineEventCount: number;
  recallQuality: number;
  explanation: string;
};

export type MemoryDashboard = {
  asOf: string;
  tenantId: string;
  growth: MemoryGrowthMetrics;
  timeline: OrganisationalTimelineEvent[];
  decisions: MemoryDecisionRecord[];
  patterns: MemoryPattern[];
  lessons: LessonLearned[];
  playbooks: LivingExecutivePlaybook[];
  insights: MemoryInsight[];
  recentRecalls: MemoryRecallResult[];
};

/** Today presentation — memory supporting evidence on recommendations */
export type MemoryActionReference = {
  previousSituations: string[];
  pastDecisions: string[];
  observedOutcomes: string[];
  lessonsLearned: string[];
  similarityConfidence: number;
};

export type AnonymisedMemoryTelemetry = {
  asOf: string;
  partnerCount: number;
  avgEpisodes: number;
  avgRecallQuality: number;
  avgPatterns: number;
  explanation: string;
};
