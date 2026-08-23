import { cn } from "@/lib/utils/cn";
import { ds } from "@/design-system/tokens";
import type { UdgValidationResult } from "../contracts";

type ValidationSummaryProps = {
  validation: UdgValidationResult;
  className?: string;
};

export function ValidationSummary({
  validation,
  className,
}: ValidationSummaryProps) {
  return (
    <section
      className={cn(
        "rounded-[var(--exds-card-radius)] border border-[var(--exds-card-border)]",
        "bg-[var(--exds-card-bg)] p-[var(--eos-space-lg)]",
        className,
      )}
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className={ds.type.label}>Validation</p>
        <p
          className="eos-type-caption"
          style={{
            color:
              validation.status === "failed"
                ? "var(--exds-attention)"
                : validation.status === "passed_with_warnings"
                  ? "var(--exds-watching)"
                  : "var(--exds-improving)",
          }}
        >
          {validation.status.replaceAll("_", " ")}
        </p>
      </div>
      <p className="eos-type-supporting mt-2">
        {validation.errorCount} errors · {validation.warningCount} warnings
      </p>
      {validation.issues.length > 0 ? (
        <ul className="mt-[var(--eos-space-md)] max-h-40 space-y-1.5 overflow-y-auto">
          {validation.issues.slice(0, 12).map((issue, i) => (
            <li
              key={`${issue.code}-${issue.rowIndex ?? "x"}-${i}`}
              className="eos-type-supporting border-l-2 pl-2.5"
              style={{
                borderColor:
                  issue.severity === "error"
                    ? "var(--exds-attention)"
                    : "var(--exds-watching)",
              }}
            >
              {issue.rowIndex != null ? `Row ${issue.rowIndex}: ` : null}
              {issue.message}
            </li>
          ))}
        </ul>
      ) : (
        <p className="eos-type-body mt-3 text-[var(--eos-color-text)]">
          No issues detected.
        </p>
      )}
    </section>
  );
}
