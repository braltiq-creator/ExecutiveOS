import type { InterviewRecord } from "@/experiments/framework/types";

const interviews = new Map<string, InterviewRecord>();
let seq = 0;

export function resetInterviews(): void {
  interviews.clear();
  seq = 0;
}

export function recordInterview(input: Omit<InterviewRecord, "id"> & {
  id?: string;
}): InterviewRecord {
  seq += 1;
  const record: InterviewRecord = {
    ...input,
    id: input.id ?? `int-${seq}`,
    executiveLabel: input.executiveLabel.startsWith("Exec ")
      ? input.executiveLabel
      : `Exec ${input.executiveRole}`,
    overallSatisfaction: Math.max(
      0,
      Math.min(10, Math.round(input.overallSatisfaction)),
    ),
  };
  interviews.set(record.id, record);
  return record;
}

export function listInterviews(tenantId?: string): InterviewRecord[] {
  const rows = [...interviews.values()].filter((item) =>
    tenantId ? item.tenantId === tenantId : true,
  );
  return rows.sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
}

export function listInterviewsForExperiment(
  experimentId: string,
): InterviewRecord[] {
  return listInterviews().filter((item) =>
    item.experimentIds.includes(experimentId),
  );
}
