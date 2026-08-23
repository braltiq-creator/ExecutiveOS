/**
 * Executive Maturity Model — every score explains itself.
 */

import type {
  ExecutiveMaturityModel,
  ExplainedScore,
  MaturityComponentId,
} from "@/validation/types";
import type { DiscoveryCoverage } from "@/validation/types";
import type { KnowledgeGraphHealth } from "@/validation/types";
import type { ExecutiveProfileHealth } from "@/validation/types";
import type { ContextProviderHealth } from "@/validation/types";
import type { RecommendationQuality } from "@/validation/types";

function score(
  id: MaturityComponentId,
  label: string,
  value: number,
  explanation: string,
  evidence: string[],
  gaps: string[],
  trend?: ExplainedScore["trend"],
): ExplainedScore {
  return {
    id,
    label,
    score: clamp(value),
    explanation,
    evidence,
    gaps,
    trend,
  };
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export type MaturityInput = {
  tenantId: string;
  asOf: string;
  coverage: DiscoveryCoverage;
  graph: KnowledgeGraphHealth;
  profile: ExecutiveProfileHealth;
  providers: ContextProviderHealth;
  recommendations: RecommendationQuality;
};

export function buildExecutiveMaturity(
  input: MaturityInput,
): ExecutiveMaturityModel {
  const dim = (id: string) =>
    input.coverage.dimensions.find((d) => d.id === id);

  const organisation = score(
    "organisation_understanding",
    "Organisation Understanding",
    input.coverage.overallCoveragePct * 0.7 +
      (dim("business_units")?.coveragePct ?? 0) * 0.3,
    "How completely ExecutiveOS has mapped the organisation structure.",
    [
      `${input.coverage.overallCoveragePct}% overall discovery coverage`,
      `${dim("departments")?.discovered ?? 0} departments discovered`,
    ],
    gapsIfBelow(dim("business_units")?.coveragePct ?? 0, 70, "Map remaining business units"),
  );

  const executive = score(
    "executive_understanding",
    "Executive Understanding",
    input.profile.briefingConfidence * 0.5 + input.profile.learningProgress * 0.5,
    "How well ExecutiveOS understands the executive's preferences and decision style.",
    [
      `Briefing confidence ${input.profile.briefingConfidence}%`,
      `Decision style: ${input.profile.decisionStyle}`,
    ],
    input.profile.gaps,
    input.profile.confidenceTrend,
  );

  const m365 = input.providers.providers.find((p) => p.providerId === "microsoft365");
  const simpro = input.providers.providers.find((p) => p.providerId === "simpro");

  const operational = score(
    "operational_understanding",
    "Operational Understanding",
    simpro?.connected
      ? (simpro.coveragePct * 0.6 + (dim("jobs")?.coveragePct ?? 0) * 0.4)
      : 25,
    "Depth of live operational intelligence from field-service systems.",
    [
      simpro?.connected
        ? `Operational provider coverage ${simpro.coveragePct}%`
        : "Operational provider not connected",
      `${dim("jobs")?.discovered ?? 0} jobs discovered`,
    ],
    simpro?.connected
      ? gapsIfBelow(simpro.coveragePct, 70, "Increase operational sync coverage")
      : ["Connect Simpro (or equivalent) for operational understanding"],
  );

  const customer = score(
    "customer_understanding",
    "Customer Understanding",
    dim("customers")?.coveragePct ?? 0,
    "Coverage of customers, sites, and delivery relationships.",
    [
      `${dim("customers")?.discovered ?? 0} of ~${dim("customers")?.estimated ?? 0} customers`,
    ],
    gapsIfBelow(dim("customers")?.coveragePct ?? 0, 60, "Sync more customer records"),
  );

  const financial = score(
    "financial_understanding",
    "Financial Understanding",
    clamp(
      (dim("projects")?.coveragePct ?? 0) * 0.4 +
        (simpro?.connected ? 35 : 10) +
        (input.recommendations.businessImpactScore > 0 ? 15 : 0),
    ),
    "Visibility into cash, margin, and commercial signals.",
    [
      simpro?.connected
        ? "Cash and margin signals available from operations"
        : "Limited financial signals without operational connection",
    ],
    simpro?.connected
      ? []
      : ["Connect operational finance signals (invoices, margins)"],
  );

  const strategic = score(
    "strategic_understanding",
    "Strategic Understanding",
    clamp(
      (dim("strategic_documents")?.coveragePct ?? 0) * 0.4 +
        (dim("committees")?.coveragePct ?? 0) * 0.3 +
        input.profile.learningProgress * 0.3,
    ),
    "Clarity on strategic themes, governance, and priorities.",
    [
      `${dim("strategic_documents")?.discovered ?? 0} strategic documents`,
      `${dim("committees")?.discovered ?? 0} committees`,
    ],
    gapsIfBelow(dim("strategic_documents")?.coveragePct ?? 0, 50, "Connect board packs and strategy docs"),
  );

  const relationship = score(
    "relationship_understanding",
    "Relationship Understanding",
    dim("relationships")?.coveragePct ?? 0,
    "Strength of mapped executive, customer, and operational relationships.",
    [
      `${dim("relationships")?.discovered ?? 0} relationships`,
      `${dim("people")?.discovered ?? 0} people`,
    ],
    gapsIfBelow(dim("relationships")?.coveragePct ?? 0, 65, "Validate key reporting lines"),
  );

  const kg = score(
    "knowledge_graph_completeness",
    "Knowledge Graph Completeness",
    input.graph.confidence,
    input.graph.explanation,
    [
      `${input.graph.entities} entities`,
      `${input.graph.relationships} relationships`,
    ],
    input.graph.gaps,
  );

  const evidence = score(
    "evidence_quality",
    "Evidence Quality",
    clamp(
      100 -
        input.graph.conflictingEvidence * 8 -
        input.graph.duplicateEntities * 5 -
        Math.min(40, input.graph.evidenceFreshnessHours / 2),
    ),
    "Freshness, consistency, and conflict rate of supporting evidence.",
    [
      `Evidence freshness ~${input.graph.evidenceFreshnessHours}h`,
      `${input.graph.conflictingEvidence} conflicts`,
    ],
    [
      ...(input.graph.conflictingEvidence > 0
        ? ["Resolve conflicting evidence"]
        : []),
      ...(input.graph.evidenceFreshnessHours > 24
        ? ["Refresh connector sync"]
        : []),
    ],
  );

  const recommendation = score(
    "recommendation_confidence",
    "Recommendation Confidence",
    input.recommendations.usefulnessPct,
    input.recommendations.explanation,
    [
      `${input.recommendations.accepted} accepted of ${input.recommendations.generated} generated`,
    ],
    input.recommendations.incorrect > 0
      ? ["Review incorrect recommendations"]
      : [],
  );

  const components: ExecutiveMaturityModel["components"] = {
    organisation_understanding: organisation,
    executive_understanding: executive,
    operational_understanding: operational,
    customer_understanding: customer,
    financial_understanding: financial,
    strategic_understanding: strategic,
    relationship_understanding: relationship,
    knowledge_graph_completeness: kg,
    evidence_quality: evidence,
    recommendation_confidence: recommendation,
    overall: score("overall", "Overall", 0, "", [], []),
  };

  const weights: Array<[MaturityComponentId, number]> = [
    ["organisation_understanding", 0.12],
    ["executive_understanding", 0.12],
    ["operational_understanding", 0.12],
    ["customer_understanding", 0.1],
    ["financial_understanding", 0.08],
    ["strategic_understanding", 0.1],
    ["relationship_understanding", 0.1],
    ["knowledge_graph_completeness", 0.1],
    ["evidence_quality", 0.08],
    ["recommendation_confidence", 0.08],
  ];

  const overallValue = clamp(
    weights.reduce(
      (sum, [id, w]) => sum + components[id].score * w,
      0,
    ),
  );

  const overall = score(
    "overall",
    "Executive Intelligence Score",
    overallValue,
    "Composite measure of how accurately ExecutiveOS understands the organisation.",
    weights.map(
      ([id]) => `${components[id].label}: ${components[id].score}`,
    ),
    Object.values(components)
      .flatMap((c) => c.gaps)
      .slice(0, 5),
    overallValue >= 70 ? "up" : overallValue >= 45 ? "flat" : "down",
  );

  components.overall = overall;

  return {
    tenantId: input.tenantId,
    asOf: input.asOf,
    components,
    overall,
  };
}

function gapsIfBelow(score: number, threshold: number, gap: string): string[] {
  return score < threshold ? [gap] : [];
}
