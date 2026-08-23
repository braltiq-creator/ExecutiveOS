import { resetExplanations } from "@/trust/explainability";
import { resetTrustEvidence } from "@/trust/evidence";
import { resetProvenance } from "@/trust/provenance";
import { resetTrustAudit } from "@/trust/audit";
import { resetTrustReviews } from "@/trust/review";

export function resetTrustFramework(): void {
  resetExplanations();
  resetTrustEvidence();
  resetProvenance();
  resetTrustAudit();
  resetTrustReviews();
}
