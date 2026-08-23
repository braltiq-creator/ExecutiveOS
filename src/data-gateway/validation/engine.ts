import type {
  UdgCanonicalRecord,
  UdgFieldMapping,
  UdgFieldValue,
  UdgRawRecord,
  UdgValidationIssue,
  UdgValidationResult,
  UdgValidationStatus,
} from "../contracts";

export type ValidateOptions = {
  requiredFields?: string[];
  /** Canonical field keys that must be numeric when present. */
  numericFields?: string[];
  /** Canonical field keys that must parse as ISO dates when present. */
  dateFields?: string[];
  /** Parent/child hierarchy checks: childField must exist when parentField set. */
  hierarchy?: Array<{ parent: string; child: string }>;
  /** Relationship: field A values must appear in allowed set (or reference field). */
  relationships?: Array<{
    field: string;
    allowed?: Array<string | number | boolean>;
    /** Soft check — warning only. */
    soft?: boolean;
  }>;
  asOf?: string;
};

function isBlank(value: UdgFieldValue): boolean {
  return value === null || value === undefined || value === "";
}

function fingerprint(record: UdgCanonicalRecord | UdgRawRecord): string {
  return JSON.stringify(record.fields);
}

/**
 * Reusable validation — no customer-specific rules.
 */
export function validateRecords(
  records: Array<UdgCanonicalRecord | UdgRawRecord>,
  options: ValidateOptions = {},
): UdgValidationResult {
  const issues: UdgValidationIssue[] = [];
  const asOf = options.asOf ?? new Date().toISOString();

  if (records.length === 0) {
    issues.push({
      code: "empty_dataset",
      severity: "error",
      message: "Dataset contains no records.",
    });
  }

  const required = options.requiredFields ?? [];
  const numeric = new Set(options.numericFields ?? []);
  const dates = new Set(options.dateFields ?? ["asOfDate"]);
  const seen = new Map<string, number>();

  for (const record of records) {
    const fp = fingerprint(record);
    const prior = seen.get(fp);
    if (prior !== undefined) {
      issues.push({
        code: "duplicate_row",
        severity: "warning",
        message: `Duplicate of row ${prior}.`,
        rowIndex: record.rowIndex,
      });
    } else {
      seen.set(fp, record.rowIndex);
    }

    for (const field of required) {
      if (isBlank(record.fields[field] ?? null)) {
        issues.push({
          code: "missing_field",
          severity: "error",
          message: `Missing required field "${field}".`,
          rowIndex: record.rowIndex,
          field,
        });
      }
    }

    for (const [field, value] of Object.entries(record.fields)) {
      if (isBlank(value)) continue;

      if (numeric.has(field) && typeof value !== "number") {
        issues.push({
          code: "invalid_value",
          severity: "error",
          message: `Expected numeric value for "${field}".`,
          rowIndex: record.rowIndex,
          field,
          value,
        });
      }

      if (dates.has(field)) {
        const asString = String(value);
        if (Number.isNaN(Date.parse(asString))) {
          issues.push({
            code: "date",
            severity: "error",
            message: `Invalid date for "${field}".`,
            rowIndex: record.rowIndex,
            field,
            value,
          });
        }
      }
    }

    for (const rule of options.hierarchy ?? []) {
      const parent = record.fields[rule.parent];
      const child = record.fields[rule.child];
      if (!isBlank(parent ?? null) && isBlank(child ?? null)) {
        issues.push({
          code: "hierarchy",
          severity: "warning",
          message: `"${rule.child}" expected when "${rule.parent}" is set.`,
          rowIndex: record.rowIndex,
          field: rule.child,
        });
      }
    }

    for (const rel of options.relationships ?? []) {
      const value = record.fields[rel.field];
      if (isBlank(value ?? null) || !rel.allowed) continue;
      if (!rel.allowed.includes(value as string | number | boolean)) {
        issues.push({
          code: "relationship",
          severity: rel.soft ? "warning" : "error",
          message: `Unexpected value for "${rel.field}".`,
          rowIndex: record.rowIndex,
          field: rel.field,
          value,
        });
      }
    }
  }

  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;
  let status: UdgValidationStatus = "passed";
  if (errorCount > 0) status = "failed";
  else if (warningCount > 0) status = "passed_with_warnings";

  return {
    status,
    issues,
    errorCount,
    warningCount,
    checkedAt: asOf,
  };
}

export function suggestRequiredFromMapping(
  mappings: UdgFieldMapping[],
): string[] {
  return mappings.filter((m) => m.required).map((m) => m.canonicalField);
}
