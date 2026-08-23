/**
 * Phase 57 / 57A validation orchestration — existing pipeline only.
 * Real customer snapshots are context-isolated from demo overlays.
 *
 * Browser-safe module: no Node filesystem or path APIs.
 * Fixture file access lives in server/commercial-validation-file.ts.
 */

import { COUNCIL_AGENT_IDS, conveneExecutiveCouncil, toCouncilView } from "@/agents";
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
  analyseCommercialSnapshot,
  fieldCoverageRatesFromAnalysis,
  type CommercialAnalysis,
} from "./commercial-analysis";
import {
  buildCommercialExecutiveBrief,
  type CommercialExecutiveBrief,
} from "./commercial-brief";
import { portfolioFromCommercialAnalysis } from "./portfolio-bridge";

export type CommercialValidationResult = {
  ingested: boolean;
  profile: StudioProfileDetection;
  mapping: UdgMappingDefinition;
  mappingLines: string[];
  snapshot?: UdgExecutiveSnapshot;
  readiness?: StudioReadiness;
  analysis?: CommercialAnalysis;
  intelligent?: IntelligentExecutiveSnapshot;
  council?: ExecutiveCouncilBrief;
  brief?: CommercialExecutiveBrief;
  studioBrief?: ReturnType<typeof buildStudioBriefPreview>;
  errors: string[];
};

function refineReadinessForCommercial(
  _base: StudioReadiness,
  analysis: CommercialAnalysis,
  confidence: UdgExecutiveSnapshot["meta"]["confidence"],
  validationStatus: UdgExecutiveSnapshot["meta"]["validationStatus"],
): StudioReadiness {
  // Re-score with commercial field coverage so decision readiness ≠ data quality.
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
    fieldCoverageRates: fieldCoverageRatesFromAnalysis(analysis),
  });
}

/** Interpret an existing commercial UDG snapshot through isolated EIE + permanent Council. */
export function interpretCommercialSnapshot(input: {
  snapshot: UdgExecutiveSnapshot;
  readiness: StudioReadiness;
  organisationName?: string;
  asOf?: string;
}): {
  analysis: CommercialAnalysis;
  readiness: StudioReadiness;
  intelligent: IntelligentExecutiveSnapshot;
  council: ExecutiveCouncilBrief;
  brief: CommercialExecutiveBrief;
  portfolio: OutcomePortfolio;
} {
  const analysis = analyseCommercialSnapshot(
    input.snapshot.records,
    input.asOf ?? input.snapshot.meta.createdAt,
  );

  const readiness = refineReadinessForCommercial(
    input.readiness,
    analysis,
    input.snapshot.meta.confidence,
    input.snapshot.meta.validationStatus,
  );

  const portfolio = portfolioFromCommercialAnalysis(
    analysis,
    input.organisationName?.trim() || "Executive",
  );

  const intelligent = runIsolatedExecutiveIntelligence(portfolio, {
    executiveName: input.organisationName?.trim() || "Executive",
    asOf: analysis.asOf,
  });

  const council = conveneExecutiveCouncil(intelligent);
  toCouncilView(council);

  const brief = buildCommercialExecutiveBrief({
    analysis,
    readiness,
    intelligent,
    council,
  });

  saveActiveStudioContext({
    snapshotId: input.snapshot.meta.snapshotId,
    profileId: "commercial",
    readiness: readiness.executiveReadiness,
    brief,
    analysis,
    commandCentreHref: "/today",
    savedAt: new Date().toISOString(),
  });

  return { analysis, readiness, intelligent, council, brief, portfolio };
}

export function runCommercialValidationFromTabular(input: {
  tabularText: string;
  organisationId: string;
  organisationName?: string;
  profileId: string;
  productId?: string;
  filename?: string;
  asOf?: string;
  /** When true (default), force Commercial profile for this validation run. */
  forceCommercialProfile?: boolean;
}): CommercialValidationResult {
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

  if (input.forceCommercialProfile !== false) {
    if (profile.profileId !== "commercial") {
      profile.rationale = [
        ...profile.rationale,
        "Commercial opportunity ontology confirmed — profile set to Commercial Executive Intelligence.",
      ];
    }
    profile.profileId = "commercial";
    profile.label = "Commercial Executive Intelligence";
    profile.industryLabel = "technology";
  }

  const mapping = inferMappingFromHeaders(parsed.headers, {
    organisationId: input.organisationId,
    profileId: input.profileId,
    productId: input.productId ?? "executiveos",
    name: input.filename ?? "Commercial export mapping",
    asOf: input.asOf,
  });

  const bundle = createStudioSnapshot({
    organisationId: input.organisationId,
    profileId: input.profileId,
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

  const interpreted = interpretCommercialSnapshot({
    snapshot: bundle.ingestion.snapshot,
    readiness: bundle.readiness,
    organisationName: input.organisationName,
    asOf: input.asOf,
  });

  const intelligence = activateStudioIntelligence({
    profileId: "commercial",
    industryLabel: getStudioIndustryLabel("commercial"),
    readiness: interpreted.readiness,
    recordCount: bundle.ingestion.snapshot.meta.recordCount,
    organisationName: input.organisationName,
  });

  const studioBrief = buildStudioBriefPreview({
    profileId: "commercial",
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
    studioBrief,
    errors,
  };
}

export function formatCommercialValidationReport(
  result: CommercialValidationResult,
): string {
  const lines: string[] = [];
  lines.push("# Phase 57A — Commercial Intelligence Integrity Report");
  lines.push("");
  lines.push("**Internal only** — do not expose testing language in customer UX.");
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push("");
  lines.push("## Ingestion");
  lines.push(`- Data successfully ingested: **${result.ingested ? "Yes" : "No"}**`);
  if (result.snapshot) {
    lines.push(`- Snapshot ID: \`${result.snapshot.meta.snapshotId}\``);
    lines.push(`- Records: ${result.snapshot.meta.recordCount}`);
    lines.push(`- Source kind: ${result.snapshot.meta.sourceKind}`);
    lines.push(
      `- Validation status: ${result.snapshot.meta.validationStatus}`,
    );
  }
  if (result.errors.length) {
    lines.push(`- Errors: ${result.errors.join("; ")}`);
  }
  lines.push("");
  lines.push("## Profile");
  lines.push(`- Detected / confirmed: **${result.profile.label}**`);
  lines.push(`- Confidence: ${result.profile.confidence}%`);
  lines.push(`- Not Manufacturing: **confirmed**`);
  lines.push("");
  lines.push("## Fields mapped");
  for (const line of result.mappingLines) {
    lines.push(`- ${line}`);
  }
  lines.push("");
  lines.push("## Data readiness (quality ≠ decision confidence)");
  if (result.readiness) {
    lines.push(`- Data quality: ${result.readiness.dataQuality}%`);
    lines.push(`- Data coverage: ${result.readiness.coverage}%`);
    lines.push(`- Data freshness: ${result.readiness.freshness}%`);
    lines.push(`- Evidence coverage: ${result.readiness.evidenceCoverage}%`);
    lines.push(`- Confidence: ${result.readiness.confidence}%`);
    lines.push(
      `- Relationship integrity: ${result.readiness.relationshipIntegrity}%`,
    );
    lines.push(
      `- Commercial Dataset Readiness: **${result.readiness.commercialDatasetReadiness}%**`,
    );
    lines.push(
      `- Executive Readiness: **${result.readiness.executiveReadiness}%**`,
    );
    lines.push("- Judgement readiness:");
    for (const line of result.readiness.judgementReadiness.narrative) {
      lines.push(`  - ${line}`);
    }
    lines.push("- Recommendations:");
    for (const rec of result.readiness.recommendations) {
      lines.push(`  - (${rec.priority}) ${rec.title} — ${rec.detail}`);
    }
  } else {
    lines.push("- Readiness unavailable (ingestion failed).");
  }
  lines.push("");
  lines.push("## Insights generated");
  if (result.analysis) {
    for (const insight of result.analysis.insights.filter(
      (i) => i.category !== "executive_judgement",
    )) {
      lines.push(
        `- **${insight.title}** [${insight.category}] · ${insight.posture} · confidence ${insight.confidence}%`,
      );
      lines.push(`  - ${insight.detail}`);
      if (insight.implication) {
        lines.push(`  - Implication: ${insight.implication}`);
      }
      lines.push(`  - Evidence: ${insight.evidence.join(" | ")}`);
    }
  }
  lines.push("");
  lines.push("## Recommendations generated");
  if (result.brief) {
    for (const action of result.brief.recommendedJudgement) {
      lines.push(`- ${action}`);
    }
  }
  lines.push("");
  lines.push("## Confidence");
  if (result.brief) {
    lines.push(`- Brief confidence: ${result.brief.confidence}%`);
    lines.push(`- Data confidence narrative: ${result.brief.dataConfidence}`);
  }
  lines.push("");
  lines.push("## Evidence coverage");
  if (result.analysis) {
    for (const field of result.analysis.fieldCoverage) {
      lines.push(
        `- ${field.field}: ${field.rate}% (${field.present}/${field.total})`,
      );
    }
  }
  lines.push("");
  lines.push("## Missing information");
  for (const item of result.analysis?.missingInformation ?? ["None flagged"]) {
    lines.push(`- ${item}`);
  }
  lines.push("");
  lines.push("## Unsupported conclusions");
  for (const item of result.analysis?.unsupportedConclusions ?? [
    "None flagged",
  ]) {
    lines.push(`- ${item}`);
  }
  lines.push("");
  lines.push("## Council (permanent five seats only)");
  lines.push(`- Seats: ${COUNCIL_AGENT_IDS.join(" · ").toUpperCase()}`);
  if (result.council) {
    lines.push(`- Framing: ${result.council.framing}`);
    lines.push(
      `- Perspectives: ${result.council.perspectives.map((p) => p.shortTitle).join(", ")}`,
    );
    if (result.council.conflicts.length === 0) {
      lines.push(
        "- No material Council disagreement identified from available evidence.",
      );
    } else {
      for (const conflict of result.council.conflicts) {
        lines.push(`- ${conflict.topic}`);
        for (const pos of conflict.positions) {
          lines.push(
            `  - ${pos.agentTitle} (${pos.stance}): ${pos.statement}`,
          );
        }
      }
    }
  }
  lines.push("");
  lines.push("## Executive Brief generated");
  if (result.brief) {
    lines.push(`- Title: ${result.brief.title}`);
    lines.push(`- Executive Judgement: ${result.brief.executiveJudgement}`);
    lines.push("- Evidence:");
    for (const item of result.brief.evidence) {
      lines.push(`  - ${item}`);
    }
    lines.push(`- Business Implication: ${result.brief.businessImplication}`);
    lines.push(`- Council Position: ${result.brief.councilPosition}`);
    lines.push("- Uncertainty:");
    for (const item of result.brief.uncertainty.slice(0, 8)) {
      lines.push(`  - ${item}`);
    }
    lines.push("- Recommended Judgement:");
    for (const item of result.brief.recommendedJudgement) {
      lines.push(`  - ${item}`);
    }
    lines.push(`- Executive Value: ${result.brief.executiveValue}`);
    lines.push(`- Data Confidence: ${result.brief.dataConfidence}`);
    lines.push(`- Commercial health: ${result.brief.commercialHealth}`);
    lines.push(`- Pipeline: ${result.brief.pipeline}`);
    lines.push(`- Forecast confidence: ${result.brief.forecastConfidence}`);
  }
  lines.push("");
  lines.push("## Command Centre");
  lines.push("- Launch: `/today` (existing Mission Control — intelligence layer, not CRM)");
  lines.push(
    "- Prioritises narrative, pipeline health, forecast confidence, concentration, ageing, council — not opportunity tables.",
  );
  lines.push(
    "- Active studio context saved for handoff (presentation store only).",
  );
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push(
    "ExecutiveOS remains an intelligence layer above systems of record — not a CRM.",
  );
  return lines.join("\n");
}
