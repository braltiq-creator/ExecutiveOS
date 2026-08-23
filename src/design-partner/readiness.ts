/**
 * Dataset readiness vs Executive Judgement readiness — never collapsed.
 */

import type { ManufacturingAnalysis } from "@/executive-snapshot-studio/intelligence/manufacturing-analysis";
import type { StudioReadiness } from "@/executive-snapshot-studio/types";
import type {
  DesignPartnerDataIssue,
  DesignPartnerReadinessSummary,
} from "./types";

function coverageRate(
  analysis: ManufacturingAnalysis | null | undefined,
  field: string,
): number | null {
  const row = analysis?.fieldCoverage.find((f) => f.field === field);
  return row ? row.rate : null;
}

export function buildDesignPartnerReadinessSummary(input: {
  readiness: StudioReadiness;
  analysis?: ManufacturingAnalysis | null;
  recordCount?: number;
  sourceLabel?: string;
}): DesignPartnerReadinessSummary {
  const { readiness, analysis } = input;
  const forecastCompleteness = coverageRate(analysis, "forecast");
  const actualDemandCoverage = coverageRate(analysis, "actual");
  const capacityCoverage = coverageRate(analysis, "capacity");
  const inventoryCoverage = coverageRate(analysis, "inventoryDays");

  const issues: DesignPartnerDataIssue[] = [];

  for (const rec of readiness.recommendations) {
    issues.push({
      id: rec.id,
      severity: rec.priority === "now" ? "material" : "info",
      title: rec.title,
      detail: rec.detail,
    });
  }

  if (analysis?.missingInformation?.length) {
    for (const [i, missing] of analysis.missingInformation.entries()) {
      issues.push({
        id: `missing-${i}`,
        severity: "material",
        title: missing,
        detail: "Material gap for executive interpretation — flagged, not repaired.",
      });
    }
  }

  if (forecastCompleteness != null && forecastCompleteness < 80) {
    issues.push({
      id: "forecast-completeness",
      severity: "material",
      title: "Missing forecast periods",
      detail: `Forecast field coverage ${forecastCompleteness}%.`,
    });
  }
  if (actualDemandCoverage != null && actualDemandCoverage < 70) {
    issues.push({
      id: "actual-demand",
      severity: "material",
      title: "Incomplete actual demand",
      detail: `Actual demand coverage ${actualDemandCoverage}%.`,
    });
  }
  if (capacityCoverage != null && capacityCoverage < 50) {
    issues.push({
      id: "capacity-coverage",
      severity: "material",
      title: "Missing factory / capacity assignments",
      detail: `Capacity coverage ${capacityCoverage}%.`,
    });
  }
  if (inventoryCoverage != null && inventoryCoverage < 50) {
    issues.push({
      id: "inventory-days",
      severity: "material",
      title: "Missing inventory days",
      detail: `Inventory days coverage ${inventoryCoverage}%.`,
    });
  }

  const whatWeReceived = [
    input.sourceLabel
      ? `Source: ${input.sourceLabel}`
      : "Customer-provided tabular export",
    input.recordCount != null
      ? `${input.recordCount} records ingested through the Universal Data Gateway`
      : "Dataset ingested through the Universal Data Gateway",
  ];

  const whatWeUnderstood = [
    `Quality ${readiness.dataQuality}%`,
    `Coverage ${readiness.coverage}%`,
    `Freshness ${readiness.freshness}%`,
    `Relationships ${readiness.relationshipIntegrity}%`,
  ];

  const whatIsMissing = [
    ...(analysis?.missingInformation ?? []),
    ...issues
      .filter((i) => i.severity === "material")
      .map((i) => i.title),
  ].filter((v, i, a) => a.indexOf(v) === i);

  const whatWeCanInterpret = [
    ...(analysis?.insights
      .filter((i) => i.posture !== "insufficient_evidence")
      .slice(0, 4)
      .map((i) => i.title) ?? []),
  ];

  const whatWeCannotInterpret = [
    ...(analysis?.unsupportedConclusions ?? []),
    ...readiness.judgementReadiness.narrative,
  ].filter((v, i, a) => a.indexOf(v) === i);

  const datasetReadiness = Math.round(
    (readiness.dataQuality +
      readiness.coverage +
      readiness.freshness +
      readiness.relationshipIntegrity +
      (forecastCompleteness ?? readiness.evidenceCoverage)) /
      5,
  );

  return {
    datasetReadiness,
    quality: readiness.dataQuality,
    coverage: readiness.coverage,
    freshness: readiness.freshness,
    relationships: readiness.relationshipIntegrity,
    forecastCompleteness,
    actualDemandCoverage,
    capacityCoverage,
    inventoryCoverage,
    executiveJudgementReadiness: readiness.executiveReadiness,
    issues,
    whatWeReceived,
    whatWeUnderstood,
    whatIsMissing,
    whatWeCanInterpret:
      whatWeCanInterpret.length > 0
        ? whatWeCanInterpret
        : ["Dataset structure established; judgement signals still forming."],
    whatWeCannotInterpret:
      whatWeCannotInterpret.length > 0
        ? whatWeCannotInterpret
        : ["Unsupported conclusions are listed when evidence is insufficient."],
    scoredAt: readiness.scoredAt,
  };
}
