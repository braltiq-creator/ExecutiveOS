import type { ReactNode } from "react";

/** Semantic colour language — never decorative. */
export type ExdsSemanticTone =
  | "intelligence" // Blue — Executive Intelligence / Evidence
  | "improving" // Green — positive / healthy / protected
  | "watching" // Amber — uncertainty / monitor
  | "attention" // Red — judgement required / risk / exposure
  | "historical" // Grey — reference / completed
  | "strategy" // Purple — future planning
  | "decision"; // Orange — executive attention / decision

export type ExdsTrendDirection = "up" | "down" | "flat";

export type ExdsHealthLevel =
  | "healthy"
  | "watch"
  | "attention"
  | "neutral"
  | "unknown";

export type ExdsConfidence = number; // 0–100

export type ExdsNavItem = {
  id: string;
  label: string;
  href: string;
  active?: boolean;
  icon?: ReactNode;
};

export type ExdsHeatCell = {
  id: string;
  label: string;
  value: number;
  /** Optional display override (e.g. count or "65%"). */
  detail?: string;
  /** Optional href into an existing workspace — no new routes. */
  href?: string;
  tone?: ExdsSemanticTone;
};

export type ExdsTimelineStage =
  | "observation"
  | "analysis"
  | "council"
  | "recommendation"
  | "decision"
  | "outcome"
  | "learning";

export type ExdsTimelineEvent = {
  id: string;
  stage: ExdsTimelineStage;
  title: string;
  summary?: string;
  timestamp?: string;
  href?: string;
  tone?: ExdsSemanticTone;
};

export type ExdsCouncilSeat = {
  id: string;
  role: string;
  position: string;
  confidence: ExdsConfidence;
  reasoning: string;
  evidence?: string[];
  challenges?: string[];
  agreement: number; // 0–100
  learning?: string;
};

export type ExdsAdvisorView = {
  id: string;
  name: string;
  domain: string;
  status: "active" | "watching" | "escalated" | "idle";
  observation: string;
  recommendation: string;
  confidence: ExdsConfidence;
  indicators?: Array<{ label: string; value: string; tone?: ExdsSemanticTone }>;
  escalation?: string;
  councilRelationship?: string;
};

export type ExdsImpactDimension =
  | "revenue"
  | "workingCapital"
  | "customer"
  | "risk"
  | "people"
  | "operations";

export type ExdsBusinessImpact = {
  dimensions: Partial<Record<ExdsImpactDimension, string>>;
  confidence: ExdsConfidence;
  expectedOutcome: string;
  predicted?: string;
  actual?: string;
};

export type ExdsDigitalTwinDomain =
  | "organisation"
  | "operations"
  | "commercial"
  | "people"
  | "capital"
  | "customers"
  | "technology"
  | "risk";

export type ExdsDigitalTwinNode = {
  domain: ExdsDigitalTwinDomain;
  label: string;
  health: ExdsHealthLevel;
  summary?: string;
  href?: string;
};

export type ExdsRelationshipNode = {
  id: string;
  label: string;
  tone?: ExdsSemanticTone;
  href?: string;
};
