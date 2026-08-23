import type { OutcomeStatus } from "@/lib/outcomes/types";

export function outcomeStatusLabel(status: OutcomeStatus): string {
  switch (status) {
    case "on_track":
      return "On track";
    case "at_risk":
      return "At risk";
    case "off_track":
      return "Off track";
    case "watching":
      return "Watching";
  }
}

export function outcomeStatusClass(status: OutcomeStatus): string {
  switch (status) {
    case "on_track":
      return "border-success/40 bg-success-surface text-success";
    case "at_risk":
      return "border-warning/40 bg-warning-surface text-warning";
    case "off_track":
      return "border-critical/40 bg-critical-surface text-critical";
    case "watching":
      return "border-border bg-surface-inset text-secondary";
  }
}

export function severityClass(
  severity: "critical" | "attention" | "info",
): string {
  switch (severity) {
    case "critical":
      return "border-critical/40 bg-critical-surface text-critical";
    case "attention":
      return "border-warning/40 bg-warning-surface text-warning";
    case "info":
      return "border-border bg-surface-inset text-secondary";
  }
}
