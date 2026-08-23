import type {
  ExecutiveDecisionRecord,
} from "@/lib/decisions/types";
import type { ExecutiveDecisionsContext } from "@/types/intelligence";
import { mapExecutiveDecisions } from "@/lib/intelligence/decisions";

export function mapDecisionRecordsToContext(
  decisions: ExecutiveDecisionRecord[],
): ExecutiveDecisionsContext {
  if (decisions.length === 0) {
    return { decisions: [], lastUpdatedAt: null };
  }

  const mapped = mapExecutiveDecisions(decisions);
  const lastUpdatedAt = decisions.reduce<string | null>((latest, decision) => {
    if (!latest) {
      return decision.updated_at;
    }

    return new Date(decision.updated_at) > new Date(latest)
      ? decision.updated_at
      : latest;
  }, null);

  return {
    decisions: mapped,
    lastUpdatedAt,
  };
}
