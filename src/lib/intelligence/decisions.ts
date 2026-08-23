import { fetchActiveDecisionsForIntelligence } from "@/lib/decisions/queries";
import type { ExecutiveDecisionRecord } from "@/lib/decisions/types";
import {
  formatDecisionRiskLevel,
  formatDecisionStatus,
} from "@/lib/decisions/types";
import type { ExecutiveDecisionContext } from "@/types/intelligence";

export async function loadExecutiveDecisionRecords(
  userId: string,
): Promise<ExecutiveDecisionRecord[]> {
  return fetchActiveDecisionsForIntelligence(userId);
}

export function mapExecutiveDecisions(
  decisions: ExecutiveDecisionRecord[],
): ExecutiveDecisionContext[] {
  return decisions.map((decision) => ({
    id: decision.id,
    title: decision.title,
    summary: decision.summary,
    decisionReason: decision.decision_reason,
    alternativesConsidered: decision.alternatives_considered,
    expectedOutcome: decision.expected_outcome,
    status: decision.status,
    statusLabel: formatDecisionStatus(decision.status),
    owner: decision.owner,
    decisionDate: decision.decision_date,
    reviewDate: decision.review_date,
    strategicObjectiveId: decision.strategic_objective_id,
    riskLevel: decision.risk_level,
    riskLevelLabel: formatDecisionRiskLevel(decision.risk_level),
    updatedAt: decision.updated_at,
  }));
}
