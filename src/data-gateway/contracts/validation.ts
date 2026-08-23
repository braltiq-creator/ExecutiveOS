/**
 * Validation contracts.
 */

export type UdgValidationSeverity = "error" | "warning" | "info";

export type UdgValidationIssueCode =
  | "missing_field"
  | "invalid_value"
  | "duplicate_row"
  | "unexpected_value"
  | "relationship"
  | "date"
  | "hierarchy"
  | "empty_dataset"
  | "unknown_column";

export type UdgValidationIssue = {
  code: UdgValidationIssueCode;
  severity: UdgValidationSeverity;
  message: string;
  rowIndex?: number;
  field?: string;
  value?: string | number | boolean | null;
};

export type UdgValidationStatus =
  | "pending"
  | "passed"
  | "passed_with_warnings"
  | "failed";

export type UdgValidationResult = {
  status: UdgValidationStatus;
  issues: UdgValidationIssue[];
  errorCount: number;
  warningCount: number;
  checkedAt: string;
};
