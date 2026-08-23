import type { Explanation } from "@/trust/framework/types";

const explanations = new Map<string, Explanation>();

export function resetExplanations(): void {
  explanations.clear();
}

export function upsertExplanation(explanation: Explanation): Explanation {
  explanations.set(explanation.id, explanation);
  return explanation;
}

export function getExplanation(id: string): Explanation | undefined {
  return explanations.get(id);
}

export function listExplanations(tenantId: string): Explanation[] {
  return [...explanations.values()]
    .filter((item) => item.tenantId === tenantId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getExplanationForRecommendation(
  tenantId: string,
  recommendationId: string,
): Explanation | undefined {
  return listExplanations(tenantId).find(
    (item) => item.recommendationId === recommendationId,
  );
}
