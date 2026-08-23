export type InsightSource =
  | "executive_health"
  | "knowledge_graph"
  | "executive_memory"
  | "calendar"
  | "meetings"
  | "decisions"
  | "objectives"
  | "initiatives"
  | "organization"
  | "billing"
  | "integrations"
  | "advisors";

export type InsightCategory =
  | "critical_attention"
  | "strategic_opportunities"
  | "recommended_decisions"
  | "upcoming_risks"
  | "delegated_actions"
  | "people_issues"
  | "meeting_preparation"
  | "sales_highlights"
  | "financial_highlights";

export type DigestType =
  | "morning_brief"
  | "lunch_update"
  | "end_of_day"
  | "weekly_review";

export type TimelineBucket = "yesterday" | "today" | "this_week" | "next_week";

export type TimelineEventType =
  | "meeting"
  | "deadline"
  | "board_event"
  | "initiative"
  | "decision";

export type InsightScores = {
  impact: number;
  urgency: number;
  confidence: number;
  strategicAlignment: number;
  risk: number;
  priorityScore: number;
};

export type IntelligenceSignal = {
  id: string;
  source: InsightSource;
  category: InsightCategory;
  title: string;
  summary: string;
  badge?: string;
  href?: string;
  entityId?: string;
  scores: InsightScores;
  metadata?: Record<string, string | number | boolean>;
};

export type ExecutiveInsightCard = {
  id: string;
  category: InsightCategory;
  categoryLabel: string;
  title: string;
  summary: string;
  badge?: string;
  href?: string;
  priorityScore: number;
  scores: InsightScores;
};

export type AdvisorInsightSummary = {
  agentId: string;
  agentName: string;
  agentTitle: string;
  insight: string;
  recommendation: string;
  confidence: number;
  accentColor: string;
};

export type TimelineEvent = {
  id: string;
  bucket: TimelineBucket;
  type: TimelineEventType;
  typeLabel: string;
  title: string;
  summary: string;
  startsAt: string;
  endsAt?: string;
  badge?: string;
};

export type ExecutiveTimeline = {
  yesterday: TimelineEvent[];
  today: TimelineEvent[];
  this_week: TimelineEvent[];
  next_week: TimelineEvent[];
};

export type DigestSection = {
  id: string;
  title: string;
  items: Array<{ id: string; title: string; summary: string }>;
};

export type ExecutiveDigest = {
  type: DigestType;
  typeLabel: string;
  headline: string;
  summary: string;
  sections: DigestSection[];
  generatedAt: string;
};

export type IntelligenceCenterData = {
  generatedAt: string;
  greeting: string;
  preferredName: string;
  jobTitle: string;
  company: string;
  activeDigest: DigestType;
  digest: ExecutiveDigest;
  topInsights: ExecutiveInsightCard[];
  cards: Record<InsightCategory, ExecutiveInsightCard[]>;
  advisorSummaries: AdvisorInsightSummary[];
  timeline: ExecutiveTimeline;
  healthScore: number;
  insightCount: number;
};

export const INSIGHT_CATEGORY_LABELS: Record<InsightCategory, string> = {
  critical_attention: "Critical Attention",
  strategic_opportunities: "Strategic Opportunities",
  recommended_decisions: "Recommended Decisions",
  upcoming_risks: "Upcoming Risks",
  delegated_actions: "Delegated Actions",
  people_issues: "People Issues",
  meeting_preparation: "Meeting Preparation",
  sales_highlights: "Sales Highlights",
  financial_highlights: "Financial Highlights",
};

export const DIGEST_TYPE_LABELS: Record<DigestType, string> = {
  morning_brief: "Morning Brief",
  lunch_update: "Lunch Update",
  end_of_day: "End-of-Day Summary",
  weekly_review: "Weekly Executive Review",
};

export class IntelligenceCenterError extends Error {
  readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "IntelligenceCenterError";
    this.code = code;
  }
}
