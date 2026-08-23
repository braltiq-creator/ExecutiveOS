/**
 * Executive Validation Suite — orchestrates trust & quality measurement.
 */

import { loadDiscoverySession } from "@/onboarding";
import { getKnowledgeGraph } from "@/knowledge-graph";
import { measureDiscoveryCoverage } from "@/validation/coverage";
import { assessKnowledgeGraphHealth } from "@/validation/quality/graph-health";
import { assessExecutiveProfileHealth } from "@/validation/quality/profile-health";
import { assessContextProviderHealth } from "@/validation/quality/provider-health";
import { measureRecommendationQuality } from "@/validation/recommendations";
import { buildExecutiveMaturity } from "@/validation/maturity";
import { buildTenantHealth } from "@/validation/tenant-health";
import { buildValidationHistory } from "@/validation/history";
import { assessLearning } from "@/validation/learning";
import { measureDiscoveryAccuracy } from "@/validation/accuracy";
import { listExecutiveFeedback } from "@/validation/feedback";
import { adjustScoreWithFeedback } from "@/validation/confidence";
import { measureValidationSuccess } from "@/validation/metrics";
import { benchmarkTenant } from "@/validation/benchmarking";
import type {
  DesignPartnerDashboard,
  OutstandingValidationRequest,
} from "@/validation/types";
import {
  getTenantProfileSelection,
  runProfileValidationScenarios,
  type IntelligenceProfileId,
} from "@/profiles";
import { runExecutiveIntelligence } from "@/intelligence/executive-intelligence";
import { MOCK_OUTCOME_PORTFOLIO } from "@/lib/outcomes/mock-portfolio";

export function buildValidationSuite(input: {
  tenantId: string;
  asOf?: string;
}): DesignPartnerDashboard {
  const asOf = input.asOf ?? new Date().toISOString();
  const session = loadDiscoverySession(input.tenantId);
  const graph = session?.graph ?? getKnowledgeGraph();

  const coverage = measureDiscoveryCoverage({
    tenantId: input.tenantId,
    asOf,
    discoveries: session?.discoveries ?? [],
  });

  const graphHealth = assessKnowledgeGraphHealth({
    tenantId: input.tenantId,
    asOf,
    graph,
    previousEntityCount: session?.bootstrap
      ? Math.max(0, (session.bootstrap.entitiesCreated ?? 0) - 4)
      : undefined,
  });

  const profileHealth = assessExecutiveProfileHealth({
    tenantId: input.tenantId,
    asOf,
    profile: session?.profile,
  });

  const providers = assessContextProviderHealth({
    tenantId: input.tenantId,
    asOf,
  });

  const recommendations = measureRecommendationQuality({
    tenantId: input.tenantId,
    asOf,
  });

  let maturity = buildExecutiveMaturity({
    tenantId: input.tenantId,
    asOf,
    coverage,
    graph: graphHealth,
    profile: profileHealth,
    providers,
    recommendations,
  });

  maturity = {
    ...maturity,
    overall: adjustScoreWithFeedback(maturity.overall, input.tenantId),
  };

  const history = buildValidationHistory({
    tenantId: input.tenantId,
    current: {
      at: asOf,
      overallScore: maturity.overall.score,
      organisationCoverage: coverage.overallCoveragePct,
      knowledgeGraphEntities: graphHealth.entities,
      recommendationUsefulness: recommendations.usefulnessPct,
      confidence: maturity.components.evidence_quality.score,
    },
  });

  const accuracy = measureDiscoveryAccuracy({
    tenantId: input.tenantId,
    discoveries: session?.discoveries ?? [],
  });

  const feedback = listExecutiveFeedback(input.tenantId);
  const learning = assessLearning({
    history: history.daily,
    graphGrowth: graphHealth.growth,
    feedbackCount: feedback.length,
    validationsCompleted: accuracy.confirmed + accuracy.edited,
  });

  const tenantHealth = buildTenantHealth({
    tenantId: input.tenantId,
    asOf,
    maturity,
    coverage,
    graph: graphHealth,
    providers,
    learning,
  });

  const successMetrics = measureValidationSuccess({
    tenantId: input.tenantId,
    timeToFirstBriefSeconds: session?.metrics?.timeToFirstBriefingSeconds ?? null,
    history,
    recommendations,
    providers,
    learningVelocity: learning.velocity,
  });

  const outstandingValidationRequests = buildOutstandingRequests(
    input.tenantId,
    session?.discoveries ?? [],
    maturity.overall.gaps,
  );

  const platformMaturity = {
    ...maturity.overall,
    id: "platform_maturity",
    label: "Platform Maturity",
    explanation: `Platform maturity mirrors Executive Intelligence at ${maturity.overall.score}%.`,
  };

  // Benchmark available for CS tooling
  void benchmarkTenant({
    tenantId: input.tenantId,
    overallScore: maturity.overall.score,
  });

  const profileId: IntelligenceProfileId =
    session?.intelligenceProfileId ??
    getTenantProfileSelection(input.tenantId)?.profileId ??
    "operations_executive";
  const intelligentSnapshot = runExecutiveIntelligence(MOCK_OUTCOME_PORTFOLIO);
  const intelligenceProfileValidation = runProfileValidationScenarios({
    tenantId: input.tenantId,
    profileId,
    snapshot: intelligentSnapshot,
    asOf,
  });

  return {
    tenantId: input.tenantId,
    asOf,
    executiveIntelligenceScore: maturity.overall,
    platformMaturity,
    connectorHealth: tenantHealth.connectorHealth,
    organisationCoverage: {
      id: "organisation_coverage",
      label: "Organisation Coverage",
      score: coverage.overallCoveragePct,
      explanation: `Discovered coverage across ${coverage.dimensions.length} dimensions.`,
      evidence: coverage.dimensions
        .slice(0, 4)
        .map((d) => `${d.label}: ${d.discovered}/${d.estimated}`),
      gaps: coverage.dimensions
        .filter((d) => d.coveragePct < 50)
        .map((d) => `Improve ${d.label.toLowerCase()} coverage`)
        .slice(0, 4),
      trend: learning.trend,
    },
    learningTrend: learning.trend,
    recommendationQuality: recommendations,
    dailyImprovements: learning.dailyImprovements,
    outstandingValidationRequests,
    maturity,
    coverage,
    graphHealth,
    profileHealth,
    providers,
    tenantHealth,
    history,
    successMetrics,
    intelligenceProfileValidation,
  };
}

function buildOutstandingRequests(
  tenantId: string,
  discoveries: Array<{
    id: string;
    label: string;
    summary: string;
    confidence: number;
    status: string;
  }>,
  gaps: string[],
): OutstandingValidationRequest[] {
  const fromDiscoveries = discoveries
    .filter((d) => d.status === "proposed")
    .sort((a, b) => a.confidence - b.confidence)
    .slice(0, 5)
    .map((d) => ({
      id: `val-req-${d.id}`,
      tenantId,
      label: d.label,
      reason: d.summary,
      priority:
        d.confidence < 70 ? ("high" as const) : ("medium" as const),
      confidence: d.confidence,
    }));

  const fromGaps = gaps.slice(0, 3).map((gap, index) => ({
    id: `val-gap-${index}`,
    tenantId,
    label: gap,
    reason: "Identified as a maturity gap",
    priority: "medium" as const,
    confidence: 50,
  }));

  return [...fromDiscoveries, ...fromGaps].slice(0, 8);
}
