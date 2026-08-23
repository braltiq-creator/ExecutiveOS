/**
 * Executive Readiness — separates data quality from decision readiness.
 */

import type { UdgConfidenceScore, UdgValidationResult } from "@/data-gateway";
import type {
  StudioReadiness,
  StudioReadinessRecommendation,
} from "../types";

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function scoreExecutiveReadiness(input: {
  confidence: UdgConfidenceScore;
  validation: UdgValidationResult;
  asOf?: string;
  /** Optional field coverage rates from commercial analysis (0–100). */
  fieldCoverageRates?: Record<string, number>;
  /**
   * Flat commercial opportunity exports are not hierarchical org models.
   * Missing Region/Branch hierarchy is a dataset limitation — not a parse failure.
   */
  datasetShape?: "flat_commercial" | "hierarchical" | "unknown";
}): StudioReadiness {
  const { confidence, validation } = input;
  const asOf = input.asOf ?? new Date().toISOString();
  const rates = input.fieldCoverageRates ?? {};
  const flatCommercial = input.datasetShape === "flat_commercial";
  const hierarchical = input.datasetShape === "hierarchical";

  const hierarchyIssues = validation.issues.filter((i) =>
    ["relationship", "hierarchy"].includes(i.code),
  );
  const duplicateIssues = validation.issues.filter(
    (i) => i.code === "duplicate_row",
  );

  // Flat commercial books: do not treat absent org hierarchy as integrity failure.
  const relationshipPenalty = flatCommercial
    ? duplicateIssues.length * 4
    : hierarchyIssues.length * 8 + duplicateIssues.length * 8;

  const relationshipIntegrity = clamp(
    100 - relationshipPenalty - (flatCommercial ? 0 : validation.errorCount * 10),
  );

  const dataQuality = clamp(
    (confidence.quality + confidence.consistency) / 2,
  );
  const coverage = confidence.coverage;
  const freshness = confidence.freshness;
  const conf = confidence.overall;

  const nextStepRate = rates.nextStep ?? rates.NextStep;
  const closeDateRate = rates.closeDate ?? rates.CloseDate;
  const stageDurationRate = rates.stageDuration ?? rates.StageDuration;
  const ownerRate = rates.owner ?? rates.Owner;
  const productRate = rates.product ?? rates.Product;

  // Manufacturing forecasting evidence axes
  const forecastQtyRate = rates.forecastQuantity;
  const actualQtyRate = rates.actualQuantity;
  const capacityRate = rates.productionCapacity;
  const inventoryDaysRate = rates.inventoryDays;
  const modelRate = rates.model;
  const regionRate = rates.region;

  const evidenceParts: number[] = [];
  if (hierarchical) {
    if (typeof forecastQtyRate === "number") evidenceParts.push(forecastQtyRate);
    if (typeof actualQtyRate === "number") evidenceParts.push(actualQtyRate);
    if (typeof capacityRate === "number") evidenceParts.push(capacityRate);
    if (typeof inventoryDaysRate === "number")
      evidenceParts.push(inventoryDaysRate);
    if (typeof modelRate === "number") evidenceParts.push(modelRate);
    if (typeof regionRate === "number") evidenceParts.push(regionRate);
  } else {
    if (typeof nextStepRate === "number") evidenceParts.push(nextStepRate);
    if (typeof closeDateRate === "number") evidenceParts.push(closeDateRate);
    if (typeof stageDurationRate === "number")
      evidenceParts.push(stageDurationRate);
    if (typeof ownerRate === "number") evidenceParts.push(ownerRate);
    if (typeof productRate === "number") evidenceParts.push(productRate);
  }

  const evidenceCoverage =
    evidenceParts.length > 0
      ? clamp(
          evidenceParts.reduce((n, r) => n + r, 0) / evidenceParts.length,
        )
      : coverage;

  const commercialDatasetReadiness = clamp(
    dataQuality * 0.35 +
      coverage * 0.25 +
      freshness * 0.2 +
      relationshipIntegrity * 0.2,
  );

  const narrative: string[] = [];
  let forecastOpportunityEvidence: StudioReadiness["judgementReadiness"]["forecastOpportunityEvidence"] =
    "sufficient";
  let activityBasedJudgement: StudioReadiness["judgementReadiness"]["activityBasedJudgement"] =
    "sufficient";
  let concentrationJudgement: StudioReadiness["judgementReadiness"]["concentrationJudgement"] =
    "sufficient";

  if (flatCommercial) {
    narrative.push(
      "Flat commercial opportunity dataset detected. Organisational hierarchy is not present in this source.",
    );
  }

  if (hierarchical) {
    narrative.push(
      "Manufacturing forecast dataset detected. Dataset readiness is separate from executive judgement readiness.",
    );
    if (typeof actualQtyRate === "number") {
      if (actualQtyRate === 0) {
        forecastOpportunityEvidence = "insufficient";
        narrative.push(
          "Forecast accuracy judgement: insufficient evidence (Actual Demand coverage 0%).",
        );
      } else if (actualQtyRate < 40) {
        forecastOpportunityEvidence = "constrained";
        narrative.push(
          `Forecast accuracy judgement: constrained (Actual Demand coverage ${actualQtyRate}%).`,
        );
      }
    }
    if (typeof capacityRate === "number" && capacityRate < 40) {
      concentrationJudgement = "constrained";
      narrative.push(
        `Capacity implication judgement: constrained (Production Capacity coverage ${capacityRate}%).`,
      );
    }
    if (typeof inventoryDaysRate === "number" && inventoryDaysRate === 0) {
      activityBasedJudgement = "insufficient";
      narrative.push(
        "Inventory implication judgement: insufficient evidence (Inventory Days not available).",
      );
    } else if (
      typeof inventoryDaysRate === "number" &&
      inventoryDaysRate < 40
    ) {
      activityBasedJudgement = "constrained";
      narrative.push(
        `Inventory implication judgement: constrained (Inventory Days coverage ${inventoryDaysRate}%).`,
      );
    }
  }

  if (!hierarchical && typeof nextStepRate === "number") {
    if (nextStepRate === 0) {
      activityBasedJudgement = "insufficient";
      narrative.push(
        "Activity-based judgement: insufficient evidence (Next Step coverage 0%).",
      );
    } else if (nextStepRate < 40) {
      activityBasedJudgement = "constrained";
      narrative.push(
        `Activity-based judgement: constrained (Next Step coverage ${nextStepRate}%).`,
      );
    }
  }

  if (!hierarchical) {
    const forecastSignals = [
      typeof closeDateRate === "number" ? closeDateRate : 100,
      typeof stageDurationRate === "number" ? stageDurationRate : 100,
    ];
    const forecastMin = Math.min(...forecastSignals);
    if (forecastMin < 50) {
      forecastOpportunityEvidence = "insufficient";
      narrative.push(
        "Forecast/opportunity decision evidence: insufficient for close-date / stage-duration judgements.",
      );
    } else if (forecastMin < 75) {
      forecastOpportunityEvidence = "constrained";
      narrative.push(
        "Forecast/opportunity decision evidence: constrained by close-date / stage-duration coverage.",
      );
    }

    if (
      (typeof ownerRate === "number" && ownerRate < 70) ||
      (typeof productRate === "number" && productRate < 70)
    ) {
      concentrationJudgement = "constrained";
      narrative.push(
        "Concentration judgement: constrained by incomplete owner/product coverage.",
      );
    }
  }

  const datasetLabel = hierarchical
    ? "Dataset Readiness"
    : "Commercial Dataset Readiness";

  if (narrative.length === 0) {
    narrative.push(
      `${datasetLabel}: ${commercialDatasetReadiness >= 80 ? "high" : commercialDatasetReadiness >= 55 ? "moderate" : "low"}.`,
    );
  } else {
    narrative.unshift(
      `${datasetLabel}: ${commercialDatasetReadiness >= 80 ? "high" : commercialDatasetReadiness >= 55 ? "moderate" : "low"}.`,
    );
  }

  const judgementPenalty =
    (activityBasedJudgement === "insufficient"
      ? 12
      : activityBasedJudgement === "constrained"
        ? 6
        : 0) +
    (forecastOpportunityEvidence === "insufficient"
      ? 14
      : forecastOpportunityEvidence === "constrained"
        ? 7
        : 0) +
    (concentrationJudgement === "constrained" ? 5 : 0);

  // Executive readiness ≠ data quality. Clean data with missing evidence is not decision-ready.
  const executiveReadiness = clamp(
    commercialDatasetReadiness * 0.55 +
      evidenceCoverage * 0.35 +
      conf * 0.1 -
      judgementPenalty,
  );

  const recommendations: StudioReadinessRecommendation[] = [];

  if (dataQuality < 75) {
    recommendations.push({
      id: "quality",
      title: "Strengthen data quality",
      detail:
        "Resolve missing or invalid values before leadership relies on this snapshot.",
      priority: "now",
    });
  }
  if (coverage < 70) {
    recommendations.push({
      id: "coverage",
      title: "Widen business coverage",
      detail:
        "Add the fields executives expect — demand, capacity, capital, or customers.",
      priority: "soon",
    });
  }
  if (freshness < 70) {
    recommendations.push({
      id: "freshness",
      title: "Refresh the source",
      detail: "Leadership confidence rises when the snapshot reflects this week.",
      priority: "soon",
    });
  }
  if (relationshipIntegrity < 75 && !flatCommercial) {
    recommendations.push({
      id: "relationships",
      title: "Clarify relationships",
      detail:
        "Confirm hierarchies and unique rows so the organisation model stays trustworthy.",
      priority: "now",
    });
  }
  if (flatCommercial) {
    recommendations.push({
      id: "flat-commercial",
      title: "Flat commercial book",
      detail:
        "Organisational hierarchy is not present in this source. Opportunity → Owner / Product / Stage relationships are inferred from fields.",
      priority: "later",
    });
  }
  if (activityBasedJudgement !== "sufficient" && !hierarchical) {
    recommendations.push({
      id: "activity-evidence",
      title: "Restore activity evidence",
      detail:
        "Next Step coverage is too thin for activity-based commercial judgement — do not equate dataset cleanliness with decision confidence.",
      priority: "now",
    });
  }
  if (activityBasedJudgement !== "sufficient" && hierarchical) {
    recommendations.push({
      id: "inventory-evidence",
      title: "Strengthen inventory evidence",
      detail:
        "Inventory Days coverage constrains inventory-implication judgement even when the forecast book is clean.",
      priority: "now",
    });
  }
  if (forecastOpportunityEvidence !== "sufficient" && !hierarchical) {
    recommendations.push({
      id: "forecast-evidence",
      title: "Strengthen forecast evidence",
      detail:
        "Close-date and stage-duration evidence constrain forecast confidence even when the dataset is technically clean.",
      priority: "soon",
    });
  }
  if (forecastOpportunityEvidence !== "sufficient" && hierarchical) {
    recommendations.push({
      id: "actual-demand-evidence",
      title: "Strengthen actual demand evidence",
      detail:
        "Actual vs forecast coverage constrains manufacturing forecast confidence — do not force accuracy conclusions.",
      priority: "soon",
    });
  }
  if (recommendations.length === 0) {
    recommendations.push({
      id: "ready",
      title: "Ready for executive judgement",
      detail:
        "Dataset quality and evidence coverage support opening the Command Centre with calibrated confidence.",
      priority: "later",
    });
  }

  return {
    dataQuality,
    coverage,
    freshness,
    confidence: conf,
    relationshipIntegrity,
    evidenceCoverage,
    commercialDatasetReadiness,
    executiveReadiness,
    judgementReadiness: {
      forecastOpportunityEvidence,
      activityBasedJudgement,
      concentrationJudgement,
      narrative,
    },
    recommendations,
    scoredAt: asOf,
  };
}
