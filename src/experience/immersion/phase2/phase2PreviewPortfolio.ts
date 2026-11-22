/**
 * Stage 4 — Phase 2 preview portfolio hydration.
 * Reuses manufacturing → OutcomePortfolio bridge and the existing portfolio store /
 * mockRepository UI cache so recorded decisions survive refresh in the preview.
 * Production durability remains pilot_decisions via persistPilotPortfolioAction
 * when an organisation snapshot is active — no second persistence system.
 */

import type { ManufacturingAnalysis } from "@/executive-snapshot-studio/intelligence/manufacturing-analysis";
import { portfolioFromManufacturingAnalysis } from "@/executive-snapshot-studio/intelligence/manufacturing-portfolio-bridge";
import type { Decision } from "@/lib/decisions/engine-types";
import type { OutcomePortfolio } from "@/lib/outcomes/types";
import { mockPortfolioRepository } from "@/services/portfolio/mock-repository";

export const PHASE2_PREVIEW_SNAPSHOT_ID = "phase2-preview-manufacturing";
export const PHASE2_PREVIEW_STORAGE_MARKER = "intent-manufacturing-forecast";

export function isPhase2ManufacturingPortfolio(
  portfolio: OutcomePortfolio | null | undefined,
): boolean {
  return portfolio?.intent?.id === PHASE2_PREVIEW_STORAGE_MARKER;
}

/**
 * Load a manufacturing-backed portfolio for the Phase 2 preview.
 * Prefer a previously recorded manufacturing portfolio from the UI cache so
 * executive recordings survive refresh; otherwise seed from analysis.
 */
export function resolvePhase2PreviewPortfolio(
  analysis: ManufacturingAnalysis,
): OutcomePortfolio {
  const cached = mockPortfolioRepository.load();
  if (isPhase2ManufacturingPortfolio(cached)) {
    // Keep recorded decisions; refresh outcome framing from analysis only when
    // the primary manufacturing decision has not yet been recorded.
    const paperId = cached.decisions.find((d) =>
      d.id.startsWith("decision-demand"),
    );
    if (paperId?.executiveRecording || paperId?.selectedAlternativeId) {
      return cached;
    }
  }
  return portfolioFromManufacturingAnalysis(analysis, "Executive");
}

export function findPriorityManufacturingDecision(
  portfolio: OutcomePortfolio,
  decisionId: string | null | undefined,
): Decision | null {
  if (!decisionId) return null;
  return portfolio.decisions.find((d) => d.id === decisionId) ?? null;
}

export function lifecycleLabelFromDecision(decision: Decision | null): string {
  if (!decision) return "Requires executive judgement";
  if (decision.executiveRecording) {
    return "Recorded";
  }
  switch (decision.executiveSelectionState) {
    case "OPTION_SELECTED":
      return "Recorded · option selected";
    case "DECISION_APPROVED":
      return "Approved";
    case "DECISION_REJECTED":
      return "Rejected";
    case "DECISION_DEFERRED":
      return "Deferred";
    case "OPTION_IDENTIFIED":
    default:
      if (decision.status === "approved") return "Approved";
      if (decision.status === "deferred") return "Deferred";
      if (decision.status === "decided") return "Completed";
      return "Pending review";
  }
}
