import type {
  UdgCanonicalRecord,
  UdgConfidenceScore,
  UdgValidationResult,
} from "../contracts";

export type ScoreConfidenceInput = {
  records: UdgCanonicalRecord[];
  validation: UdgValidationResult;
  /** Expected canonical fields for coverage. */
  expectedFields?: string[];
  /** Hours since data as-of; lower is fresher. */
  ageHours?: number;
  asOf?: string;
};

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

/**
 * Score Completeness · Consistency · Freshness · Coverage · Quality · Overall.
 */
export function scoreConfidence(input: ScoreConfidenceInput): UdgConfidenceScore {
  const { records, validation } = input;
  const expected = input.expectedFields ?? [];
  const asOf = input.asOf ?? new Date().toISOString();

  let filled = 0;
  let slots = 0;
  for (const record of records) {
    const keys = expected.length > 0 ? expected : Object.keys(record.fields);
    for (const key of keys) {
      slots += 1;
      const v = record.fields[key];
      if (v !== null && v !== undefined && v !== "") filled += 1;
    }
  }
  const completeness = slots === 0 ? 0 : (filled / slots) * 100;

  const errorPenalty = Math.min(60, validation.errorCount * 12);
  const warnPenalty = Math.min(25, validation.warningCount * 4);
  const consistency = 100 - errorPenalty - warnPenalty * 0.5;

  const age = input.ageHours ?? 0;
  const freshness =
    age <= 24 ? 100 : age <= 72 ? 85 : age <= 168 ? 70 : age <= 720 ? 50 : 30;

  let coverage = 100;
  if (expected.length > 0 && records.length > 0) {
    const present = new Set<string>();
    for (const record of records) {
      for (const [k, v] of Object.entries(record.fields)) {
        if (v !== null && v !== undefined && v !== "") present.add(k);
      }
    }
    const hit = expected.filter((f) => present.has(f)).length;
    coverage = (hit / expected.length) * 100;
  } else if (records.length === 0) {
    coverage = 0;
  }

  const quality =
    validation.status === "failed"
      ? Math.max(20, 70 - validation.errorCount * 8)
      : validation.status === "passed_with_warnings"
        ? 82
        : 95;

  const overall =
    completeness * 0.25 +
    consistency * 0.25 +
    freshness * 0.15 +
    coverage * 0.15 +
    quality * 0.2;

  return {
    completeness: clamp(completeness),
    consistency: clamp(consistency),
    freshness: clamp(freshness),
    coverage: clamp(coverage),
    quality: clamp(quality),
    overall: clamp(overall),
    scoredAt: asOf,
  };
}
