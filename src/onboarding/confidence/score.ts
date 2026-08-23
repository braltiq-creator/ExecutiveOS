/**
 * Confidence scoring across discovery, organisation, profile, and graph.
 */

import type { DiscoveryItem, LearningMaturity } from "@/onboarding/types";
import {
  DEFAULT_MATURITY_HIDE_THRESHOLD,
  LEARNING_BANNER_DAYS,
} from "@/onboarding/types";
import { averageDiscoveryConfidence } from "@/onboarding/discovery";

export type ConfidenceSummary = {
  discoveryConfidence: number;
  organisationCoverage: number;
  executiveProfileConfidence: number;
  knowledgeGraphCompleteness: number;
  overall: number;
};

export function scoreConfidence(input: {
  discoveries: DiscoveryItem[];
  organisationConfidence: number;
  profileConfidence: number;
  graphCompleteness: number;
}): ConfidenceSummary {
  const discoveryConfidence = averageDiscoveryConfidence(input.discoveries);
  const kinds = new Set(input.discoveries.map((d) => d.kind)).size;
  const organisationCoverage = Math.min(100, Math.round((kinds / 18) * 100));
  const overall = Math.round(
    discoveryConfidence * 0.3 +
      organisationCoverage * 0.2 +
      input.organisationConfidence * 0.15 +
      input.profileConfidence * 0.2 +
      input.graphCompleteness * 0.15,
  );
  return {
    discoveryConfidence,
    organisationCoverage,
    executiveProfileConfidence: input.profileConfidence,
    knowledgeGraphCompleteness: input.graphCompleteness,
    overall,
  };
}

export function buildLearningMaturity(input: {
  tenantId: string;
  startedAt: string;
  asOf: string;
  connectedSystems: string[];
  confidence: ConfidenceSummary;
  knowledgeGraphGrowth: number;
  hideBannerThreshold?: number;
}): LearningMaturity {
  const started = new Date(input.startedAt).getTime();
  const now = new Date(input.asOf).getTime();
  const daysActive = Math.max(
    0,
    Math.floor((now - started) / (1000 * 60 * 60 * 24)),
  );
  const threshold =
    input.hideBannerThreshold ?? DEFAULT_MATURITY_HIDE_THRESHOLD;
  const withinWindow = daysActive < LEARNING_BANNER_DAYS;
  const showLearningBanner =
    withinWindow && input.confidence.overall < threshold;

  return {
    tenantId: input.tenantId,
    startedAt: input.startedAt,
    daysActive,
    discoveryConfidence: input.confidence.discoveryConfidence,
    organisationCoverage: input.confidence.organisationCoverage,
    connectedSystems: input.connectedSystems,
    knowledgeGraphGrowth: input.knowledgeGraphGrowth,
    executiveProfileConfidence: input.confidence.executiveProfileConfidence,
    hideBannerThreshold: threshold,
    showLearningBanner,
  };
}
