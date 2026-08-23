import type { InitiativeHealthStatus } from "@/lib/initiatives/types";
import { formatInitiativeHealth } from "@/lib/initiatives/types";

const HEALTH_STYLES: Record<InitiativeHealthStatus, string> = {
  on_track: "border-emerald-200 bg-emerald-50 text-emerald-700",
  at_risk: "border-amber-200 bg-amber-50 text-amber-700",
  off_track: "border-red-200 bg-red-50 text-red-700",
  completed: "border-blue-200 bg-blue-50 text-blue-700",
};

type InitiativeHealthBadgeProps = {
  health: InitiativeHealthStatus;
};

export function InitiativeHealthBadge({ health }: InitiativeHealthBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${HEALTH_STYLES[health]}`}
    >
      {formatInitiativeHealth(health)}
    </span>
  );
}
