/**
 * Evidence-based commercial interpretation of a UDG snapshot.
 * No hard-coded conclusions — insights emerge from the records present.
 * Implications only when evidence supports them — never invent financial impact.
 */

import type { UdgCanonicalRecord, UdgFieldValue } from "@/data-gateway";

export type InsightPosture =
  | "monitor"
  | "investigate"
  | "insufficient_evidence"
  | "act";

export type CommercialInsight = {
  id: string;
  category:
    | "material_change"
    | "concentration"
    | "pipeline_risk"
    | "forecast_risk"
    | "stale_opportunity"
    | "stage_risk"
    | "data_quality"
    | "commercial_opportunity"
    | "executive_judgement";
  title: string;
  detail: string;
  /** Executive implication — only when evidence supports it. */
  implication?: string;
  confidence: number;
  posture: InsightPosture;
  evidence: string[];
  evidenceCoverage: number;
};

export type FieldCoverage = {
  field: string;
  present: number;
  total: number;
  rate: number;
};

export type CommercialExecutiveValue = {
  pipelineInView: number;
  potentialRevenue: number | null;
  forecastExposure: number | null;
  valueAtRisk: number | null;
  valueProtected: number | null;
  narrative: string;
  quantified: boolean;
};

export type CommercialAnalysis = {
  recordCount: number;
  openCount: number;
  closedCount: number;
  totalPipelineValue: number;
  openPipelineValue: number;
  recurringOpenValue: number;
  pastCloseOpenValue: number;
  ageingOpenValue: number;
  fieldCoverage: FieldCoverage[];
  stageDistribution: Array<{ stage: string; count: number; value: number }>;
  ownerConcentration: Array<{ owner: string; count: number; share: number }>;
  productConcentration: Array<{ product: string; count: number; share: number }>;
  insights: CommercialInsight[];
  missingInformation: string[];
  unsupportedConclusions: string[];
  executiveValue: CommercialExecutiveValue;
  asOf: string;
};

function num(value: UdgFieldValue | undefined): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value.replace(/[$,\s]/g, ""));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function str(value: UdgFieldValue | undefined): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function isClosedStage(stage: string): boolean {
  return /closed/i.test(stage);
}

function lineValue(fields: UdgCanonicalRecord["fields"]): number {
  if (fields.pipelineValue !== undefined && fields.pipelineValue !== null) {
    return num(fields.pipelineValue);
  }
  return (
    num(fields.saasValue) +
    num(fields.maintenanceValue) +
    num(fields.licenseValue) +
    num(fields.oneTimeServicesValue) +
    num(fields.recurringValue) +
    num(fields.amount)
  );
}

function coverageFor(
  records: UdgCanonicalRecord[],
  field: string,
): FieldCoverage {
  let present = 0;
  for (const record of records) {
    const v = record.fields[field];
    if (v !== null && v !== undefined && str(v) !== "") present += 1;
  }
  const total = records.length;
  return {
    field,
    present,
    total,
    rate: total === 0 ? 0 : Math.round((present / total) * 100),
  };
}

function topShare(
  counts: Map<string, number>,
  total: number,
): Array<{ key: string; count: number; share: number }> {
  return Array.from(counts.entries())
    .filter(([k]) => k.length > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([key, count]) => ({
      key,
      count,
      share: total === 0 ? 0 : Math.round((count / total) * 100),
    }));
}

/**
 * Analyse canonical commercial records. Insights only where evidence supports them.
 */
export function analyseCommercialSnapshot(
  records: UdgCanonicalRecord[],
  asOf = new Date().toISOString(),
): CommercialAnalysis {
  const asOfDate = asOf.slice(0, 10);
  const trackedFields = [
    "opportunity",
    "owner",
    "product",
    "stage",
    "transactionType",
    "saasValue",
    "maintenanceValue",
    "licenseValue",
    "oneTimeServicesValue",
    "recurringValue",
    "lastStageChangeDate",
    "stageDuration",
    "nextStep",
    "industry",
    "closeDate",
  ];

  const fieldCoverage = trackedFields
    .map((field) => coverageFor(records, field))
    .filter((c) => c.total > 0 && records.some((r) => c.field in r.fields));

  const stageCounts = new Map<string, { count: number; value: number }>();
  const ownerCounts = new Map<string, number>();
  const productCounts = new Map<string, number>();

  let openCount = 0;
  let closedCount = 0;
  let totalPipelineValue = 0;
  let openPipelineValue = 0;
  let recurringOpenValue = 0;
  let pastCloseOpenValue = 0;
  let ageingOpenValue = 0;
  let staleOpen = 0;
  let pastCloseOpen = 0;
  let openWithDuration = 0;
  let durationSum = 0;

  for (const record of records) {
    const stage = str(record.fields.stage) || str(record.fields.status);
    const closed = isClosedStage(stage);
    const value = lineValue(record.fields);
    totalPipelineValue += value;
    if (closed) closedCount += 1;
    else {
      openCount += 1;
      openPipelineValue += value;
      recurringOpenValue +=
        num(record.fields.recurringValue) + num(record.fields.saasValue);
      const duration = num(record.fields.stageDuration);
      if (
        record.fields.stageDuration !== undefined &&
        record.fields.stageDuration !== null
      ) {
        openWithDuration += 1;
        durationSum += duration;
        if (duration >= 120) {
          staleOpen += 1;
          ageingOpenValue += value;
        }
      }
      const close = str(record.fields.closeDate);
      if (close && close < asOfDate) {
        pastCloseOpen += 1;
        pastCloseOpenValue += value;
      }
    }

    const stageKey = stage || "(unspecified)";
    const prev = stageCounts.get(stageKey) ?? { count: 0, value: 0 };
    stageCounts.set(stageKey, {
      count: prev.count + 1,
      value: prev.value + value,
    });

    const owner = str(record.fields.owner);
    ownerCounts.set(owner, (ownerCounts.get(owner) ?? 0) + 1);
    const product = str(record.fields.product);
    productCounts.set(product, (productCounts.get(product) ?? 0) + 1);
  }

  const stageDistribution = Array.from(stageCounts.entries())
    .map(([stage, v]) => ({ stage, count: v.count, value: Math.round(v.value) }))
    .sort((a, b) => b.count - a.count);

  const ownerConcentration = topShare(ownerCounts, records.length).map((r) => ({
    owner: r.key,
    count: r.count,
    share: r.share,
  }));
  const productConcentration = topShare(productCounts, records.length).map(
    (r) => ({
      product: r.key,
      count: r.count,
      share: r.share,
    }),
  );

  const insights: CommercialInsight[] = [];
  const missingInformation: string[] = [];
  const unsupportedConclusions: string[] = [];

  const nextStepCov = fieldCoverage.find((f) => f.field === "nextStep");
  const industryCov = fieldCoverage.find((f) => f.field === "industry");
  const stageMoveCov = fieldCoverage.find(
    (f) => f.field === "lastStageChangeDate",
  );

  if (nextStepCov && nextStepCov.rate < 40) {
    missingInformation.push(
      `Next Step is sparsely populated (${nextStepCov.rate}% coverage).`,
    );
    insights.push({
      id: "dq-next-step",
      category: "data_quality",
      title: "Next-step evidence is thin",
      detail:
        "Activity evidence for what should happen next is largely absent — commercial judgement cannot rely on next-step narrative.",
      implication:
        "Activity-based judgement is insufficient. Do not treat the dataset as decision-complete for next-step or activity cadence claims.",
      confidence: Math.min(95, 40 + (100 - nextStepCov.rate) * 0.5),
      posture: nextStepCov.rate === 0 ? "insufficient_evidence" : "investigate",
      evidence: [
        `${nextStepCov.present}/${nextStepCov.total} records carry Next Step.`,
      ],
      evidenceCoverage: nextStepCov.rate,
    });
  }

  if (industryCov && industryCov.rate < 85) {
    missingInformation.push(
      `Industry is incomplete (${industryCov.rate}% coverage).`,
    );
    insights.push({
      id: "dq-industry",
      category: "data_quality",
      title: "Industry coverage is incomplete",
      detail:
        "Segment and concentration views by industry are only partially evidenced.",
      confidence: Math.min(92, 35 + (100 - industryCov.rate) * 0.55),
      posture: "monitor",
      evidence: [
        `${industryCov.present}/${industryCov.total} records include Industry.`,
      ],
      evidenceCoverage: industryCov.rate,
    });
  }

  if (stageMoveCov && stageMoveCov.rate < 90) {
    missingInformation.push(
      `Stage movement timestamps are incomplete (${stageMoveCov.rate}% coverage).`,
    );
  }

  if (openCount > 0 && openWithDuration > 0) {
    const staleRate = Math.round((staleOpen / openCount) * 100);
    const avgDuration = Math.round(durationSum / openWithDuration);
    if (staleOpen > 0) {
      insights.push({
        id: "stale-open",
        category: "stale_opportunity",
        title: "Open opportunities are ageing in stage",
        detail: `${staleOpen} open opportunities exceed the stage-duration threshold (≥ 120 days). Average open stage duration is ${avgDuration} days.`,
        implication: `${staleOpen} open opportunities exceed the stage-duration threshold. This may create forecast exposure and requires CRO judgement on which opportunities remain credible.`,
        confidence: Math.min(
          90,
          50 + Math.round((openWithDuration / openCount) * 40),
        ),
        posture: staleRate >= 25 ? "investigate" : "monitor",
        evidence: [
          `${staleOpen}/${openCount} open records exceed duration threshold.`,
          `Stage Duration present on ${openWithDuration}/${openCount} open records.`,
          ageingOpenValue > 0
            ? `Ageing open value in view ≈ ${Math.round(ageingOpenValue).toLocaleString()} (pipeline in view — not value at risk).`
            : "Ageing open value not separately quantified.",
        ],
        evidenceCoverage: Math.round((openWithDuration / openCount) * 100),
      });
    }
  } else if (openCount > 0) {
    unsupportedConclusions.push(
      "Stale-opportunity conclusions are unsupported — Stage Duration evidence is absent on open records.",
    );
  }

  if (pastCloseOpen > 0) {
    insights.push({
      id: "forecast-past-close",
      category: "forecast_risk",
      title: "Open records carry past close dates",
      detail: `${pastCloseOpen} open records have Close Date before ${asOfDate}. Forecast confidence should treat these as uncertain.`,
      implication: `${pastCloseOpen} open opportunities carry past close dates. Forecast confidence is constrained until CRO judgement confirms which remain credible.`,
      confidence: 88,
      posture: "investigate",
      evidence: [
        `${pastCloseOpen} open records with Close Date < ${asOfDate}.`,
        pastCloseOpenValue > 0
          ? `Past-close open value in view ≈ ${Math.round(pastCloseOpenValue).toLocaleString()} (forecast exposure candidate — not claimed as value at risk).`
          : "Past-close open value not separately quantified.",
      ],
      evidenceCoverage: Math.round(
        (pastCloseOpen / Math.max(1, openCount)) * 100,
      ),
    });
  }

  const topOwner = ownerConcentration[0];
  if (topOwner && topOwner.share >= 25) {
    insights.push({
      id: "owner-concentration",
      category: "concentration",
      title: "Owner concentration is material",
      detail: `${topOwner.owner} holds ${topOwner.share}% of records (${topOwner.count}).`,
      implication: `${topOwner.owner} holds ${topOwner.share}% of the commercial book. Concentration elevates single-book exposure and requires CRO judgement on coverage risk — without inventing conversion or churn probabilities.`,
      confidence: 86,
      posture: topOwner.share >= 40 ? "investigate" : "monitor",
      evidence: ownerConcentration
        .slice(0, 3)
        .map((o) => `${o.owner}: ${o.share}% (${o.count})`),
      evidenceCoverage: 100,
    });
  }

  const topProduct = productConcentration[0];
  if (topProduct && topProduct.share >= 25) {
    insights.push({
      id: "product-concentration",
      category: "concentration",
      title: "Product family concentration is material",
      detail: `${topProduct.product || "(unspecified)"} represents ${topProduct.share}% of records.`,
      implication: `${topProduct.product || "(unspecified)"} concentration is material. Portfolio diversity and product-risk judgement sit with CRO/CSO — no conversion probability is inferred.`,
      confidence: productConcentration.some((p) => p.product === "") ? 70 : 88,
      posture: "monitor",
      evidence: productConcentration
        .slice(0, 3)
        .map((p) => `${p.product || "(blank)"}: ${p.share}%`),
      evidenceCoverage: coverageFor(records, "product").rate,
    });
  }

  if (openCount > 0) {
    insights.push({
      id: "pipeline-shape",
      category: "pipeline_risk",
      title: "Open commercial book requires judgement",
      detail: `${openCount} open records · pipeline in view ≈ ${Math.round(openPipelineValue).toLocaleString()} · recurring/SaaS open ≈ ${Math.round(recurringOpenValue).toLocaleString()}.`,
      implication: `${openCount} open opportunities remain in the commercial book. Pipeline in view is evidenced; conversion probability and value protected are not claimed without further evidence.`,
      confidence: fieldCoverage.find((f) => f.field === "saasValue")?.rate ?? 70,
      posture: "act",
      evidence: [
        `Open ${openCount} / Closed ${closedCount}`,
        `Stage mix: ${stageDistribution
          .filter((s) => !isClosedStage(s.stage))
          .slice(0, 4)
          .map((s) => `${s.stage} (${s.count})`)
          .join("; ")}`,
      ],
      evidenceCoverage: 100,
    });
  }

  const midStages = stageDistribution.filter((s) =>
    /stage\s*[3-7]|discovery|evaluation|developing|favored|procurement|deal review/i.test(
      s.stage,
    ),
  );
  if (midStages.length > 0) {
    const midCount = midStages.reduce((n, s) => n + s.count, 0);
    insights.push({
      id: "stage-risk",
      category: "stage_risk",
      title: "Active-stage volume is material",
      detail: `${midCount} records sit in active commercial stages — conversion and stage hygiene matter.`,
      implication: `${midCount} opportunities sit in active stages. Stage hygiene and forecast credibility require CRO attention — conversion rates are not invented from this snapshot.`,
      confidence: 84,
      posture: "monitor",
      evidence: midStages.slice(0, 5).map((s) => `${s.stage}: ${s.count}`),
      evidenceCoverage: 100,
    });
  }

  const judgementParents = insights.filter((i) =>
    ["investigate", "act"].includes(i.posture),
  );
  for (const parent of judgementParents.slice(0, 4)) {
    insights.push({
      id: `judge-${parent.id}`,
      category: "executive_judgement",
      title: `Judgement: ${parent.title}`,
      detail: parent.implication ?? parent.detail,
      implication: parent.implication,
      confidence: parent.confidence,
      posture: parent.posture,
      evidence: parent.evidence,
      evidenceCoverage: parent.evidenceCoverage,
    });
  }

  if (!fieldCoverage.some((f) => f.field === "activityEvidence" && f.rate > 0)) {
    unsupportedConclusions.push(
      "Activity-evidence conclusions are unsupported — no Activity Evidence field is present in the snapshot.",
    );
  }

  if (openPipelineValue <= 0 && openCount > 0) {
    unsupportedConclusions.push(
      "Open pipeline value conclusions are weak — value fields sum to zero on open records.",
    );
  }

  unsupportedConclusions.push(
    "Value Protected and Value at Risk are not claimed — no defensible win/loss or risk-probability calculation is evidenced in this snapshot.",
  );

  const pipelineInView = Math.round(openPipelineValue);
  const forecastExposureCandidate =
    Math.round(pastCloseOpenValue + ageingOpenValue) || null;

  const executiveValue: CommercialExecutiveValue = {
    pipelineInView,
    potentialRevenue: pipelineInView > 0 ? pipelineInView : null,
    forecastExposure:
      forecastExposureCandidate && forecastExposureCandidate > 0
        ? forecastExposureCandidate
        : null,
    valueAtRisk: null,
    valueProtected: null,
    quantified: false,
    narrative:
      pipelineInView > 0
        ? [
            `Pipeline in View ≈ ${pipelineInView.toLocaleString()} (evidence-based sum of mapped open value fields).`,
            forecastExposureCandidate && forecastExposureCandidate > 0
              ? `Forecast Exposure candidate ≈ ${forecastExposureCandidate.toLocaleString()} (past-close + ageing open value in view — not claimed as Value at Risk).`
              : null,
            "Executive value not yet quantified for Value at Risk / Value Protected — no defensible probability model is evidenced.",
          ]
            .filter(Boolean)
            .join(" ")
        : "Executive value not yet quantified.",
  };

  return {
    recordCount: records.length,
    openCount,
    closedCount,
    totalPipelineValue: Math.round(totalPipelineValue),
    openPipelineValue: pipelineInView,
    recurringOpenValue: Math.round(recurringOpenValue),
    pastCloseOpenValue: Math.round(pastCloseOpenValue),
    ageingOpenValue: Math.round(ageingOpenValue),
    fieldCoverage,
    stageDistribution,
    ownerConcentration,
    productConcentration,
    insights,
    missingInformation,
    unsupportedConclusions,
    executiveValue,
    asOf,
  };
}

export function fieldCoverageRatesFromAnalysis(
  analysis: CommercialAnalysis,
): Record<string, number> {
  const rates: Record<string, number> = {};
  for (const field of analysis.fieldCoverage) {
    rates[field.field] = field.rate;
  }
  return rates;
}
