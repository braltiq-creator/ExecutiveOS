import type { ProductFeedbackRecord } from "@/experiments/framework/types";
import type { IntelligenceProfileId } from "@/profiles";

const feedback = new Map<string, ProductFeedbackRecord>();
let seq = 0;

export function resetProductFeedback(): void {
  feedback.clear();
  seq = 0;
}

export function recordProductFeedback(input: {
  tenantId: string;
  profileId: IntelligenceProfileId;
  source: ProductFeedbackRecord["source"];
  theme: string;
  sentiment: ProductFeedbackRecord["sentiment"];
  experimentId?: string | null;
  at?: string;
}): ProductFeedbackRecord {
  seq += 1;
  const record: ProductFeedbackRecord = {
    id: `pfb-${seq}`,
    tenantId: input.tenantId,
    profileId: input.profileId,
    source: input.source,
    theme: input.theme,
    sentiment: input.sentiment,
    experimentId: input.experimentId ?? null,
    at: input.at ?? new Date().toISOString(),
  };
  feedback.set(record.id, record);
  return record;
}

export function listProductFeedback(
  tenantId?: string,
): ProductFeedbackRecord[] {
  return [...feedback.values()]
    .filter((item) => (tenantId ? item.tenantId === tenantId : true))
    .sort((a, b) => b.at.localeCompare(a.at));
}
