import type { DecisionStatus } from "@/lib/decisions/types";
import { formatDecisionStatus } from "@/lib/decisions/types";
import { ExecutiveStatus } from "@/design-system";
import { cn } from "@/lib/utils/cn";

const TONE: Record<
  DecisionStatus,
  "neutral" | "positive" | "watch" | "critical"
> = {
  draft: "neutral",
  approved: "positive",
  in_progress: "watch",
  implemented: "positive",
  under_review: "watch",
  archived: "neutral",
};

export function DecisionStatusBadge({
  status,
  className,
}: {
  status: DecisionStatus;
  className?: string;
}) {
  return (
    <ExecutiveStatus tone={TONE[status]} className={cn(className)}>
      {formatDecisionStatus(status)}
    </ExecutiveStatus>
  );
}
