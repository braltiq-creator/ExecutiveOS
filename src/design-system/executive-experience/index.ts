/**
 * Executive Experience Design System (EXDS) — Phase 54
 *
 * Presentation-layer components that elevate every workspace to the
 * premium executive standard. Core architecture is untouched.
 *
 * Philosophy: executives operate the business — not the software.
 * Every screen answers: What changed? Why? What judgement is required?
 */

export type {
  ExdsSemanticTone,
  ExdsTrendDirection,
  ExdsHealthLevel,
  ExdsConfidence,
  ExdsNavItem,
  ExdsHeatCell,
  ExdsTimelineStage,
  ExdsTimelineEvent,
  ExdsCouncilSeat,
  ExdsAdvisorView,
  ExdsImpactDimension,
  ExdsBusinessImpact,
  ExdsDigitalTwinDomain,
  ExdsDigitalTwinNode,
  ExdsRelationshipNode,
} from "./types";

export {
  EXDS_TONE_VAR,
  EXDS_TONE_SOFT_VAR,
  EXDS_TONE_LABEL,
  toneFromHealth,
  toneFromTrend,
  clampConfidence,
} from "./colour";

export { ExecutiveSidebar } from "./components/ExecutiveSidebar";
export { ExecutiveKpiCard } from "./components/ExecutiveKpiCard";
export { BusinessImpactCard } from "./components/BusinessImpactCard";
export { ExecutiveNarrative } from "./components/ExecutiveNarrative";
export type { NarrativeEvidenceMetric } from "./components/ExecutiveNarrative";
export { ExecutiveHero } from "./components/ExecutiveHero";
export type { ExecutiveHeroMetric } from "./components/ExecutiveHero";
export { ExecutiveJudgementPanel } from "./components/ExecutiveJudgementPanel";
export type { ExecutiveJudgementEvidence, ExecutiveJudgementStripItem } from "./components/ExecutiveJudgementPanel";
export { ExecutiveEvidenceSurface } from "./components/ExecutiveEvidenceSurface";
export { ExecutiveChartSurface } from "./components/ExecutiveChartSurface";
export { ExecutiveSectionDivider } from "./components/ExecutiveSectionDivider";
export { ExecutiveDecisionStatement } from "./components/ExecutiveDecisionStatement";
export { ExecutiveContextRail } from "./components/ExecutiveContextRail";
export type {
  ExecutiveContextWalkItem,
  ExecutiveBriefIndexItem,
} from "./components/ExecutiveContextRail";
export { ExecutiveFocusDiagram } from "./components/ExecutiveFocusDiagram";
export type { ExecutiveFocusDomain } from "./components/ExecutiveFocusDiagram";
export { ExecutiveInsightBar } from "./components/ExecutiveInsightBar";
export { ExecutiveOvernightChanges } from "./components/ExecutiveOvernightChanges";
export type { ExecutiveOvernightItem } from "./components/ExecutiveOvernightChanges";
export { ExecutiveForecastActualChart } from "./components/ExecutiveForecastActualChart";
export type { ForecastActualPoint } from "./components/ExecutiveForecastActualChart";
export { DigitalTwinStrip } from "./components/DigitalTwinStrip";
export { ExecutiveHeatMap } from "./components/ExecutiveHeatMap";
export { RelationshipGraph } from "./components/RelationshipGraph";
export { ExecutiveTimeline } from "./components/ExecutiveTimeline";
export { CouncilExperience } from "./components/CouncilExperience";
export { DomainAdvisorCard } from "./components/DomainAdvisorCard";

export {
  MiniSparkline,
  ConfidenceBand,
  TrendBar,
  CapacityBar,
  HealthRing,
  ForecastRange,
  DistributionBar,
  MovementIndicator,
} from "./components/micro";
export type { DistributionSegment } from "./components/micro";
