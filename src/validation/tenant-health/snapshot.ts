/**
 * Tenant health — overall readiness for Customer Success.
 */

import type {
  ExplainedScore,
  TenantHealthSnapshot,
  ExecutiveMaturityModel,
  DiscoveryCoverage,
  KnowledgeGraphHealth,
  ContextProviderHealth,
} from "@/validation/types";
import type { LearningAssessment } from "@/validation/learning";

function explained(
  id: string,
  label: string,
  score: number,
  explanation: string,
  evidence: string[],
  gaps: string[],
): ExplainedScore {
  return {
    id,
    label,
    score: Math.max(0, Math.min(100, Math.round(score))),
    explanation,
    evidence,
    gaps,
  };
}

export function buildTenantHealth(input: {
  tenantId: string;
  asOf: string;
  maturity: ExecutiveMaturityModel;
  coverage: DiscoveryCoverage;
  graph: KnowledgeGraphHealth;
  providers: ContextProviderHealth;
  learning: LearningAssessment;
}): TenantHealthSnapshot {
  const connected = input.providers.providers.filter((p) => p.connected).length;
  const totalProviders = input.providers.providers.length;

  const connectorHealth = explained(
    "connector_health",
    "Connector Health",
    totalProviders === 0 ? 0 : (connected / totalProviders) * 100,
    `${connected} of ${totalProviders} providers connected.`,
    input.providers.providers.map((p) => `${p.label}: ${p.status}`),
    input.providers.providers
      .filter((p) => !p.connected)
      .map((p) => `Connect ${p.label}`),
  );

  const kgHealth = explained(
    "kg_health",
    "Knowledge Graph Health",
    input.graph.confidence,
    input.graph.explanation,
    [
      `${input.graph.entities} entities`,
      `${input.graph.relationships} relationships`,
    ],
    input.graph.gaps,
  );

  const learningProgress = explained(
    "learning_progress",
    "Learning Progress",
    Math.min(100, 40 + input.learning.velocity * 4),
    input.learning.explanation,
    input.learning.dailyImprovements,
    input.learning.trend === "down" ? ["Investigate confidence drop"] : [],
  );

  const executiveConfidence = explained(
    "executive_confidence",
    "Executive Confidence",
    input.maturity.components.executive_understanding.score,
    input.maturity.components.executive_understanding.explanation,
    input.maturity.components.executive_understanding.evidence,
    input.maturity.components.executive_understanding.gaps,
  );

  const strategicCoverage = explained(
    "strategic_coverage",
    "Strategic Coverage",
    input.maturity.components.strategic_understanding.score,
    input.maturity.components.strategic_understanding.explanation,
    input.maturity.components.strategic_understanding.evidence,
    input.maturity.components.strategic_understanding.gaps,
  );

  const operationalCoverage = explained(
    "operational_coverage",
    "Operational Coverage",
    input.maturity.components.operational_understanding.score,
    input.maturity.components.operational_understanding.explanation,
    input.maturity.components.operational_understanding.evidence,
    input.maturity.components.operational_understanding.gaps,
  );

  const tenantHealth = explained(
    "tenant_health",
    "Tenant Health",
    (connectorHealth.score + kgHealth.score + learningProgress.score) / 3,
    "Composite of connectors, graph, and learning.",
    [
      `Connectors ${connectorHealth.score}%`,
      `Graph ${kgHealth.score}%`,
      `Learning ${learningProgress.score}%`,
    ],
    [...connectorHealth.gaps, ...kgHealth.gaps].slice(0, 4),
  );

  const overallReadiness = explained(
    "overall_readiness",
    "Overall Readiness",
    input.maturity.overall.score * 0.5 +
      tenantHealth.score * 0.3 +
      input.coverage.overallCoveragePct * 0.2,
    "Readiness for reliable Executive Intelligence.",
    [
      `Intelligence ${input.maturity.overall.score}%`,
      `Coverage ${input.coverage.overallCoveragePct}%`,
    ],
    input.maturity.overall.gaps.slice(0, 4),
  );

  return {
    tenantId: input.tenantId,
    asOf: input.asOf,
    tenantHealth,
    connectorHealth,
    knowledgeGraphHealth: kgHealth,
    learningProgress,
    executiveConfidence,
    strategicCoverage,
    operationalCoverage,
    overallReadiness,
  };
}
