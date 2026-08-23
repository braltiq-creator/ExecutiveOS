/**
 * Overall Pilot Health — explained scores for Operations Centre.
 */

import type { IntelligenceProfileId } from "@/profiles";
import { extractTenantTelemetry, trafficLightFromScore } from "@/operations/isolation";
import { listSupportIssuesForTenant } from "@/operations/support/tickets";
import type {
  ExplainedOpsScore,
  PilotOpsHealth,
  TenantOperationalTelemetry,
} from "@/operations/types";

function score(
  id: string,
  label: string,
  value: number,
  explanation: string,
  evidence: string[],
  gaps: string[],
): ExplainedOpsScore {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return {
    id,
    label,
    score: clamped,
    trafficLight: trafficLightFromScore(clamped),
    explanation,
    evidence,
    gaps,
  };
}

export function computePilotOpsHealth(input: {
  tenantId: string;
  profileId: IntelligenceProfileId;
  asOf?: string;
  telemetry?: TenantOperationalTelemetry;
}): PilotOpsHealth {
  const asOf = input.asOf ?? new Date().toISOString();
  const t =
    input.telemetry ??
    extractTenantTelemetry({
      tenantId: input.tenantId,
      profileId: input.profileId,
      asOf,
    });

  const openSupport = listSupportIssuesForTenant(input.tenantId).filter(
    (i) => i.status === "open" || i.status === "in_progress",
  );
  const criticalSupport = openSupport.filter((i) => i.severity === "critical");
  const supportLoadScore = Math.max(
    0,
    100 - openSupport.length * 12 - criticalSupport.length * 20,
  );

  const providerPct =
    t.providersRequired === 0
      ? 0
      : (t.providersHealthy / t.providersRequired) * 100;

  const adoption = score(
    "adoption",
    "Adoption",
    (providerPct + t.validationProgressPct + Math.min(100, t.morningBriefOpens * 8)) /
      3,
    `Providers ${t.providersHealthy}/${t.providersRequired}; validation ${t.validationProgressPct}%; brief opens ${t.morningBriefOpens}.`,
    [
      `Provider connect ${Math.round(providerPct)}%`,
      `Validation progress ${t.validationProgressPct}%`,
    ],
    providerPct < 100 ? ["Connect remaining required providers"] : [],
  );

  const engagement = score(
    "engagement",
    "Engagement",
    t.engagementPct,
    `DAU ${t.dailyActiveExecutives}, WAU ${t.weeklyActiveExecutives}, engagement ${t.engagementPct}%.`,
    [`DAU ${t.dailyActiveExecutives}`, `Brief opens ${t.morningBriefOpens}`],
    t.engagementPct < 50 ? ["Increase morning brief cadence coaching"] : [],
  );

  const learning = score(
    "learning",
    "Learning Progress",
    t.learningProgress,
    `Learning progress ${t.learningProgress}% (trend ${t.learningTrend}).`,
    [`Coverage ${t.discoveryCoveragePct}%`, `Trend ${t.learningTrend}`],
    t.learningProgress < 55 ? ["Clear validation queue to accelerate learning"] : [],
  );

  const acceptance = score(
    "recommendation_acceptance",
    "Recommendation Acceptance",
    t.recommendationAccuracy,
    `Acceptance/usefulness proxy ${t.recommendationAccuracy}% (${t.recommendationsAccepted} accepted).`,
    [`Accepted ${t.recommendationsAccepted}`, `Viewed ${t.recommendationsViewed}`],
    t.recommendationAccuracy < 60
      ? ["Review recommendation quality with CS"]
      : [],
  );

  const providers = score(
    "provider_health",
    "Provider Health",
    t.connectorUptimePct || providerPct,
    `${t.providersHealthy}/${t.providersRequired} required providers healthy; uptime ${t.connectorUptimePct}%.`,
    t.providerStatuses.map((p) => `${p.label}: ${p.status}`),
    t.providerStatuses
      .filter((p) => p.status !== "green")
      .map((p) => `Restore ${p.label}`),
  );

  const graph = score(
    "knowledge_graph",
    "Knowledge Graph Maturity",
    t.knowledgeGraphConfidence,
    `Confidence ${t.knowledgeGraphConfidence}%; growth ${t.knowledgeGraphGrowth}.`,
    [`Growth ${t.knowledgeGraphGrowth}`, `Confidence ${t.knowledgeGraphConfidence}`],
    t.knowledgeGraphConfidence < 55 ? ["Enrich graph via provider sync"] : [],
  );

  const supportLoad = score(
    "support_load",
    "Support Load",
    supportLoadScore,
    `${openSupport.length} open issue(s), ${criticalSupport.length} critical.`,
    [`Open ${openSupport.length}`, `Critical ${criticalSupport.length}`],
    openSupport.length > 0 ? ["Triage open support issues"] : [],
  );

  const satisfaction = score(
    "executive_satisfaction",
    "Executive Satisfaction",
    Math.round(
      (t.recommendationAccuracy * 0.5 + t.engagementPct * 0.3 + learning.score * 0.2),
    ),
    "Composite of recommendation usefulness, engagement, and learning progress.",
    [
      `Usefulness ${t.recommendationAccuracy}%`,
      `Engagement ${t.engagementPct}%`,
    ],
    [],
  );

  const components = [
    adoption,
    engagement,
    learning,
    acceptance,
    providers,
    graph,
    supportLoad,
    satisfaction,
  ];

  const overallValue = Math.round(
    adoption.score * 0.15 +
      engagement.score * 0.2 +
      learning.score * 0.1 +
      acceptance.score * 0.15 +
      providers.score * 0.15 +
      graph.score * 0.1 +
      supportLoad.score * 0.1 +
      satisfaction.score * 0.05,
  );

  const overall = score(
    "overall",
    "Overall Pilot Health",
    overallValue,
    `Composite health ${overallValue}/100 across adoption, engagement, learning, recommendations, providers, graph, support, and satisfaction.`,
    components.map((c) => `${c.label}: ${c.score}`),
    components.flatMap((c) => c.gaps).slice(0, 4),
  );

  const successProbability = score(
    "success_probability",
    "Overall Success Probability",
    Math.round(
      overallValue * 0.7 +
        (t.readinessScore >= 70 ? 20 : t.readinessScore / 5) +
        (criticalSupport.length === 0 ? 10 : 0),
    ),
    "Likelihood the pilot reaches successful outcomes based on health, readiness, and support load.",
    [`Health ${overallValue}`, `Readiness ${t.readinessScore}`],
    overallValue < 60 ? ["Intervene with CS playbook before 30-day review"] : [],
  );

  return {
    tenantId: input.tenantId,
    asOf,
    overall,
    adoption,
    engagement,
    learningProgress: learning,
    recommendationAcceptance: acceptance,
    providerHealth: providers,
    knowledgeGraphMaturity: graph,
    supportLoad,
    executiveSatisfaction: satisfaction,
    successProbability,
    components: [...components, successProbability],
  };
}
