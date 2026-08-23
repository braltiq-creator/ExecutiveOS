import type { McSeverity } from "@/experience/mission-control/types";

export type KnowledgeEntryFrom =
  | "priority"
  | "activity"
  | "memory"
  | "strategy"
  | "evidence"
  | "simulator"
  | "impact"
  | "customer_health"
  | "intelligence"
  | "nav";

export type KnowledgeSectionId =
  | "executive-question"
  | "executive-answer"
  | "confidence"
  | "intelligence-diagnostics"
  | "evidence-stack"
  | "knowledge-relationships"
  | "related-strategy"
  | "related-decisions"
  | "related-activity"
  | "source-explorer"
  | "timeline";

export type KwEvidenceBucket =
  | "Executive Decisions"
  | "Strategy"
  | "CRM"
  | "Financials"
  | "Projects"
  | "Meetings"
  | "Documents"
  | "AI Analysis";

export type KwEvidenceItem = {
  id: string;
  bucket: KwEvidenceBucket;
  source: string;
  date: string;
  relevance: string;
  contribution: string;
  href: string;
};

export type KwRelation = {
  id: string;
  kind: string;
  label: string;
  href: string;
};

export type KwLink = {
  id: string;
  title: string;
  detail: string;
  href: string;
};

export type KwSource = {
  id: string;
  label: string;
  summary: string;
  href: string;
};

export type KwTimelineEvent = {
  id: string;
  at: string;
  title: string;
  detail: string;
  kind: "evidence" | "confidence" | "recommendation";
};

export type KnowledgeWorkspaceView = {
  entry: KnowledgeEntryFrom;
  focusSection: KnowledgeSectionId;
  question: string;
  answer: {
    summary: string;
    drivers: string[];
    impact: string;
    focus: string;
    confidence: number;
  };
  confidence: {
    score: number;
    strength: string;
    freshness: string;
    coverage: string;
    quality: string;
    explanation: string;
    severity: McSeverity;
  };
  evidence: KwEvidenceItem[];
  relationships: KwRelation[];
  relatedStrategy: KwLink[];
  relatedDecisions: KwLink[];
  relatedActivity: KwLink[];
  sources: KwSource[];
  timeline: KwTimelineEvent[];
};
