import type { InitiativeStatus } from "@/lib/initiatives/types";
import { formatInitiativeStatus } from "@/lib/initiatives/types";

const STATUS_STYLES: Record<InitiativeStatus, string> = {
  planned: "border-zinc-200 bg-zinc-50 text-zinc-600",
  active: "border-blue-200 bg-blue-50 text-blue-700",
  on_hold: "border-amber-200 bg-amber-50 text-amber-700",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  archived: "border-zinc-200 bg-zinc-100 text-zinc-500",
};

type InitiativeStatusBadgeProps = {
  status: InitiativeStatus;
};

export function InitiativeStatusBadge({ status }: InitiativeStatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {formatInitiativeStatus(status)}
    </span>
  );
}
