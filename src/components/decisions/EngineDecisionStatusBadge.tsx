import type { EngineDecisionStatus } from "@/lib/decisions/engine-types";
import { ExecutiveStatus } from "@/design-system";
import { cn } from "@/lib/utils/cn";

const TONE: Record<
  EngineDecisionStatus,
  "critical" | "watch" | "neutral" | "positive"
> = {
  due_today: "critical",
  under_review: "watch",
  pending: "neutral",
  deferred: "neutral",
  approved: "positive",
  decided: "positive",
};

export function EngineDecisionStatusBadge({
  status,
  className,
}: {
  status: EngineDecisionStatus;
  className?: string;
}) {
  return (
    <ExecutiveStatus tone={TONE[status]} className={cn("capitalize", className)}>
      {status.replaceAll("_", " ")}
    </ExecutiveStatus>
  );
}
