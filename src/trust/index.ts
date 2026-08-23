/**
 * Executive Trust & Explainability Framework
 *
 * Makes every recommendation transparent, evidence-based, and auditable.
 * Sits above existing intelligence — Core architecture unchanged.
 */

export type * from "@/trust/framework/types";
export { attachTrustExplanationsToTodayActions } from "@/trust/framework";

export {
  buildExplanationForAction,
  getExplanation,
  listExplanations,
  getExplanationForRecommendation,
  resetExplanations,
  upsertExplanation,
} from "@/trust/explainability";

export {
  collectEvidenceForAction,
  listExplanationEvidence,
  setExplanationEvidence,
  resetTrustEvidence,
} from "@/trust/evidence";

export { explainConfidence } from "@/trust/confidence";
export { buildReasoningPath } from "@/trust/reasoning";
export { decisionPathLabels, findDecisionPathStep } from "@/trust/decision-path";
export {
  citationsFromEvidence,
  formatCitationLine,
} from "@/trust/citations";

export {
  recordProvenance,
  listProvenance,
  listProvenanceForExplanation,
  resetProvenance,
} from "@/trust/provenance";

export {
  appendTrustAudit,
  listTrustAudit,
  listTrustAuditForExplanation,
  buildExplanationAuditPack,
  resetTrustAudit,
} from "@/trust/audit";

export {
  recordExecutiveReview,
  listExecutiveReviews,
  listReviewsForExplanation,
  resetTrustReviews,
  REVIEW_VERDICT_LABELS,
} from "@/trust/review";

export {
  DEFAULT_TRUST_GOVERNANCE,
  getTrustGovernance,
  assertTrustPayload,
} from "@/trust/governance";

export { buildTrustDashboard } from "@/trust/dashboard/build";
export { resetTrustFramework } from "@/trust/reset";
