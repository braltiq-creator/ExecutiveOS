import {
  outcomeStatusClass,
  outcomeStatusLabel,
} from "@/components/briefing/status";
import type { OutcomeStatus } from "@/lib/outcomes/types";
import { cn } from "@/lib/utils/cn";

export function OutcomeStatusBadge({
  status,
  className,
}: {
  status: OutcomeStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",
        outcomeStatusClass(status),
        className,
      )}
    >
      {outcomeStatusLabel(status)}
    </span>
  );
}
