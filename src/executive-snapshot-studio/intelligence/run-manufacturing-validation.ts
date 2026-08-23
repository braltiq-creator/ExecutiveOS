/**
 * Manufacturing Forecasting validation orchestration — existing pipeline only.
 * Browser-safe: no Node filesystem APIs.
 */

import { conveneExecutiveCouncil, toCouncilView } from "@/agents";
import type { ExecutiveCouncilBrief } from "@/agents/types";
import {
  describeMapping,
  inferMappingFromHeaders,
  parseTabularText,
  type UdgExecutiveSnapshot,
  type UdgMappingDefinition,
} from "@/data-gateway";
import { runIsolatedExecutiveIntelligence } from "@/intelligence/executive-intelligence";
import type { IntelligentExecutiveSnapshot } from "@/intelligence/executive-intelligence/types";
import type { OutcomePortfolio } from "@/lib/outcomes/types";
import {
  activateStudioIntelligence,
  buildStudioBriefPreview,
} from "../brief";
import { saveActiveStudioContext } from "../launch/active-context";
import {
  detectBusinessProfile,
  getStudioIndustryLabel,
} from "../profile-detection";
import type { StudioProfileDetection } from "../types";
import { createStudioSnapshot } from "../snapshot";
import type { StudioReadiness } from "../types";
import { scoreExecutiveReadiness } from "../readiness";
import {
  analyseManufacturingSnapshot,
  fieldCoverageRatesFromManufacturingAnalysis,
  type ManufacturingAnalysis,
} from "./manufacturing-analysis";
import {
  buildManufacturingExecutiveBrief,
  type ManufacturingExecutiveBrief,
} from "./manufacturing-brief";
import { portfolioFromManufacturingAnalysis } from "./manufacturing-portfolio-bridge";
import {
  applyDecisionPaperToDecision,
  buildManufacturingDecisionPaper,
} from "./manufacturing-decision-frame";

export type ManufacturingValidationResult = {
  ingested: boolean;
  profile: StudioProfileDetection;
  mapping: UdgMappingDefinition;
  mappingLines: string[];
  snapshot?: UdgExecutiveSnapshot;
  readiness?: StudioReadiness;
  analysis?: ManufacturingAnalysis;
  intelligent?: IntelligentExecutiveSnapshot;
  council?: ExecutiveCouncilBrief;
  brief?: ManufacturingExecutiveBrief;
  studioBrief?: ReturnType<typeof buildStudioBriefPreview>;
  /** OutcomePortfolio with Decision Engine objects (Phase 60 enriched). */
  portfolio?: OutcomePortfolio;
  errors: string[];
};

function refineReadinessForManufacturing(
  analysis: ManufacturingAnalysis,
  confidence: UdgExecutiveSnapshot["meta"]["confidence"],
  validationStatus: UdgExecutiveSnapshot["meta"]["validationStatus"],
): StudioReadiness {
  return scoreExecutiveReadiness({
    confidence,
    validation: {
      status: validationStatus === "failed" ? "failed" : "passed",
      issues: [],
      errorCount: validationStatus === "failed" ? 1 : 0,
      warningCount: 0,
      checkedAt: analysis.asOf,
    },
    asOf: analysis.asOf,
    fieldCoverageRates: fieldCoverageRatesFromManufacturingAnalysis(analysis),
    datasetShape: "hierarchical",
  });
}

/** Interpret an existing manufacturing UDG snapshot through isolated EIE + Council. */
export function interpretManufacturingSnapshot(input: {
  snapshot: UdgExecutiveSnapshot;
  readiness: StudioReadiness;
  organisationName?: string;
  asOf?: string;
}): {
  analysis: ManufacturingAnalysis;
  readiness: StudioReadiness;
  intelligent: IntelligentExecutiveSnapshot;
  council: ExecutiveCouncilBrief;
  brief: ManufacturingExecutiveBrief;
  portfolio: OutcomePortfolio;
} {
  const analysis = analyseManufacturingSnapshot(
    input.snapshot.records,
    input.asOf ?? input.snapshot.meta.createdAt,
  );

  const readiness = refineReadinessForManufacturing(
    analysis,
    input.snapshot.meta.confidence,
    input.snapshot.meta.validationStatus,
  );

  const portfolio = portfolioFromManufacturingAnalysis(
    analysis,
    input.organisationName?.trim() || "Executive",
  );

  const intelligent = runIsolatedExecutiveIntelligence(portfolio, {
    executiveName: input.organisationName?.trim() || "Executive",
    asOf: analysis.asOf,
  });

  const council = conveneExecutiveCouncil(intelligent);
  toCouncilView(council);

  const brief = buildManufacturingExecutiveBrief({
    analysis,
    readiness,
    intelligent,
    council,
  });

  const paper = buildManufacturingDecisionPaper(analysis, brief);
  if (paper.decisionId) {
    const idx = portfolio.decisions.findIndex((d) => d.id === paper.decisionId);
    if (idx >= 0) {
      portfolio.decisions[idx] = {
        ...applyDecisionPaperToDecision(portfolio.decisions[idx]!, paper),
        originSnapshotId: input.snapshot.meta.snapshotId,
      };
    }
  }

  saveActiveStudioContext({
    snapshotId: input.snapshot.meta.snapshotId,
    profileId: "manufacturing",
    readiness: readiness.executiveReadiness,
    brief,
    analysis,
    commandCentreHref: "/today",
    savedAt: new Date().toISOString(),
  });

  return { analysis, readiness, intelligent, council, brief, portfolio };
}

export function runManufacturingValidationFromTabular(input: {
  tabularText: string;
  organisationId: string;
  organisationName?: string;
  profileId?: string;
  productId?: string;
  filename?: string;
  asOf?: string;
  forceManufacturingProfile?: boolean;
}): ManufacturingValidationResult {
  const errors: string[] = [];
  const parsed = parseTabularText(input.tabularText);
  if (parsed.records.length === 0) {
    return {
      ingested: false,
      profile: detectBusinessProfile({ headers: parsed.headers }),
      mapping: inferMappingFromHeaders(parsed.headers, {
        organisationId: input.organisationId,
      }),
      mappingLines: [],
      errors: ["No records parsed from tabular payload."],
    };
  }

  const profile = detectBusinessProfile({
    headers: parsed.headers,
    records: parsed.records,
  });

  if (input.forceManufacturingProfile !== false) {
    if (profile.profileId !== "manufacturing") {
      profile.rationale = [
        ...profile.rationale,
        "Manufacturing forecast ontology confirmed — profile set to Manufacturing Forecast Intelligence.",
      ];
    }
    profile.profileId = "manufacturing";
    profile.label = "Manufacturing Forecast Intelligence";
    profile.industryLabel = "manufacturing";
  }

  const mapping = inferMappingFromHeaders(parsed.headers, {
    organisationId: input.organisationId,
    profileId: input.profileId ?? "manufacturing",
    productId: input.productId ?? "executiveos",
    name: input.filename ?? "Manufacturing forecast mapping",
    asOf: input.asOf,
  });

  const bundle = createStudioSnapshot({
    organisationId: input.organisationId,
    profileId: input.profileId ?? "manufacturing",
    productId: input.productId ?? "executiveos",
    sourceKind: "excel",
    tabularText: input.tabularText,
    filename: input.filename,
    mapping,
  });

  if (!bundle.ingestion.ok || !bundle.ingestion.snapshot || !bundle.readiness) {
    return {
      ingested: false,
      profile,
      mapping,
      mappingLines: describeMapping(mapping),
      readiness: bundle.readiness,
      errors: bundle.ingestion.errors.length
        ? bundle.ingestion.errors
        : ["Snapshot creation failed validation."],
    };
  }

  const interpreted = interpretManufacturingSnapshot({
    snapshot: bundle.ingestion.snapshot,
    readiness: bundle.readiness,
    organisationName: input.organisationName,
    asOf: input.asOf,
  });

  const intelligence = activateStudioIntelligence({
    profileId: "manufacturing",
    industryLabel: getStudioIndustryLabel("manufacturing"),
    readiness: interpreted.readiness,
    recordCount: bundle.ingestion.snapshot.meta.recordCount,
    organisationName: input.organisationName,
  });

  const studioBrief = buildStudioBriefPreview({
    profileId: "manufacturing",
    readiness: interpreted.readiness,
    confidenceOverall: bundle.ingestion.snapshot.meta.confidence.overall,
    recordCount: bundle.ingestion.snapshot.meta.recordCount,
    intelligence,
  });

  return {
    ingested: true,
    profile,
    mapping,
    mappingLines: describeMapping(mapping),
    snapshot: bundle.ingestion.snapshot,
    readiness: interpreted.readiness,
    analysis: interpreted.analysis,
    intelligent: interpreted.intelligent,
    council: interpreted.council,
    brief: interpreted.brief,
    portfolio: interpreted.portfolio,
    studioBrief,
    errors,
  };
}

export function formatManufacturingValidationReport(
  result: ManufacturingValidationResult,
): string {
  const lines: string[] = [
    "# Manufacturing Forecasting Validation Report",
    "",
    "**DEMONSTRATION / VALIDATION** — not customer confidential.",
    "",
    `Ingested: ${result.ingested}`,
    `Profile: ${result.profile.label} (${result.profile.confidence}% confidence)`,
    `Records: ${result.snapshot?.meta.recordCount ?? 0}`,
  ];

  if (result.analysis) {
    lines.push(
      "",
      "## Analysis",
      `Periods: ${result.analysis.periods.length}`,
      `Regions: ${result.analysis.regions.join(", ")}`,
      `Models: ${result.analysis.models.join(", ")}`,
      `Factories: ${result.analysis.factories.join(", ")}`,
      `Heat cells: ${result.analysis.heatMap.length}`,
      `Insights: ${result.analysis.insights.length}`,
      `Executive value: ${result.analysis.executiveValue.narrative}`,
    );
    for (const insight of result.analysis.insights.slice(0, 8)) {
      lines.push(`- [${insight.category}] ${insight.title} (${insight.confidence}%)`);
    }
  }

  if (result.brief) {
    lines.push(
      "",
      "## Executive Brief",
      result.brief.executiveJudgement,
      `Confidence: ${result.brief.confidence}%`,
      `Forecast confidence: ${result.brief.forecastConfidence}`,
      `Council: ${result.brief.councilPosition}`,
    );
  }

  if (result.errors.length > 0) {
    lines.push("", "## Errors", ...result.errors.map((e) => `- ${e}`));
  }

  return lines.join("\n");
}
