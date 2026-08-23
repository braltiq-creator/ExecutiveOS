/**
 * Pilot Readiness Score (0–100) with explained components.
 */

import { buildValidationSuite } from "@/validation";
import type { DesignPartnerDashboard } from "@/validation";
import type { IntelligenceProfileId } from "@/profiles";
import {
  buildProviderChecklists,
  checklistCompletionPct,
  requiredProvidersConnected,
} from "@/pilot/checklists";
import type {
  ExplainedReadinessComponent,
  PilotReadinessScore,
  PilotProviderChecklist,
} from "@/pilot/types";

function component(
  id: string,
  label: string,
  score: number,
  weight: number,
  explanation: string,
  evidence: string[],
  gaps: string[],
): ExplainedReadinessComponent {
  return {
    id,
    label,
    score: Math.max(0, Math.min(100, Math.round(score))),
    weight,
    explanation,
    evidence,
    gaps,
  };
}

export function computePilotReadinessScore(input: {
  tenantId: string;
  profileId: IntelligenceProfileId;
  asOf?: string;
  suite?: DesignPartnerDashboard;
  checklists?: PilotProviderChecklist[];
}): PilotReadinessScore {
  const asOf = input.asOf ?? new Date().toISOString();
  const suite =
    input.suite ??
    buildValidationSuite({
      tenantId: input.tenantId,
      asOf,
    });
  const checklists =
    input.checklists ??
    buildProviderChecklists({
      tenantId: input.tenantId,
      profileId: input.profileId,
      asOf,
    });
  const checklistPct = checklistCompletionPct(checklists);
  const providers = requiredProvidersConnected(checklists);
  const providerScore =
    providers.required === 0
      ? 0
      : (providers.connected / providers.required) * 100;

  const components: ExplainedReadinessComponent[] = [
    component(
      "provider_connectivity",
      "Provider connectivity",
      providerScore,
      0.2,
      `${providers.connected}/${providers.required} required providers connected.`,
      checklists
        .filter((c) => c.required)
        .map((c) => `${c.label}: ${c.overallStatus}`),
      providers.connected < providers.required
        ? ["Connect remaining required providers"]
        : [],
    ),
    component(
      "discovery_coverage",
      "Discovery coverage",
      suite.coverage.overallCoveragePct,
      0.15,
      `Organisation coverage at ${suite.coverage.overallCoveragePct}%.`,
      suite.coverage.dimensions
        .slice(0, 3)
        .map((d) => `${d.label}: ${d.coveragePct}%`),
      suite.coverage.overallCoveragePct < 60
        ? ["Complete Executive Discovery and confirm discoveries"]
        : [],
    ),
    component(
      "knowledge_graph",
      "Knowledge Graph maturity",
      suite.graphHealth.confidence,
      0.15,
      suite.graphHealth.explanation,
      [
        `${suite.graphHealth.entities} entities`,
        `${suite.graphHealth.relationships} relationships`,
      ],
      suite.graphHealth.gaps.slice(0, 2),
    ),
    component(
      "executive_profile",
      "Executive profile confidence",
      suite.profileHealth.briefingConfidence,
      0.1,
      suite.profileHealth.explanation,
      [
        `Decision style: ${suite.profileHealth.decisionStyle}`,
        `Preferences known: ${suite.profileHealth.preferencesKnown}`,
      ],
      suite.profileHealth.gaps.slice(0, 2),
    ),
    component(
      "validation",
      "Validation completion",
      Math.max(
        0,
        100 - suite.outstandingValidationRequests.length * 15,
      ),
      0.15,
      suite.outstandingValidationRequests.length === 0
        ? "No outstanding validation requests."
        : `${suite.outstandingValidationRequests.length} outstanding validation request(s).`,
      suite.outstandingValidationRequests
        .slice(0, 3)
        .map((r) => r.label),
      suite.outstandingValidationRequests.length > 0
        ? ["Clear outstanding validation requests with the executive"]
        : [],
    ),
    component(
      "engagement",
      "Executive engagement",
      suite.successMetrics.executiveEngagementPct,
      0.1,
      `Engagement at ${suite.successMetrics.executiveEngagementPct}%.`,
      [`DAU ${suite.successMetrics.dailyActiveExecutives}`],
      suite.successMetrics.executiveEngagementPct < 50
        ? ["Coach executive through first week of Daily Brief"]
        : [],
    ),
    component(
      "recommendations",
      "Recommendation quality",
      suite.recommendationQuality.usefulnessPct,
      0.1,
      suite.recommendationQuality.explanation,
      [`Usefulness ${suite.recommendationQuality.usefulnessPct}%`],
      suite.recommendationQuality.usefulnessPct < 60
        ? ["Review recommendation feedback with customer success"]
        : [],
    ),
    component(
      "checklist",
      "Implementation checklist",
      checklistPct,
      0.05,
      `Checklist ${checklistPct}% complete.`,
      [`${checklistPct}% items complete`],
      checklistPct < 80 ? ["Close remaining checklist items"] : [],
    ),
  ];

  const overall = Math.round(
    components.reduce((sum, c) => sum + c.score * c.weight, 0),
  );
  const readyForActivePilot =
    overall >= 70 &&
    providers.connected === providers.required &&
    suite.outstandingValidationRequests.length <= 2;

  return {
    tenantId: input.tenantId,
    asOf,
    overall,
    components,
    readyForActivePilot,
    explanation: readyForActivePilot
      ? `Readiness ${overall}/100 — ready for Active Pilot.`
      : `Readiness ${overall}/100 — continue implementation before Active Pilot.`,
  };
}
