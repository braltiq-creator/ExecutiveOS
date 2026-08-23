import type { ExecutiveReviewVerdict } from "@/trust/framework/types";

export const REVIEW_VERDICT_LABELS: Record<ExecutiveReviewVerdict, string> = {
  agree: "Agree",
  disagree: "Disagree",
  needs_more_evidence: "Needs more evidence",
  incorrect_assumption: "Incorrect assumption",
  insufficient_context: "Insufficient context",
};
