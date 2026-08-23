import { DecisionCard } from "@/components/decisions/DecisionCard";
import type { ExecutiveDecisionRecord } from "@/lib/decisions/types";

type DecisionListProps = {
  decisions: ExecutiveDecisionRecord[];
  onEdit: (decision: ExecutiveDecisionRecord) => void;
  onArchive: (decisionId: string) => void;
  archivingId?: string | null;
};

export function DecisionList({
  decisions,
  onEdit,
  onArchive,
  archivingId = null,
}: DecisionListProps) {
  if (decisions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50 px-6 py-12 text-center">
        <p className="text-sm leading-6 text-zinc-600">
          No decisions recorded yet. Capture your first executive decision to
          begin building your decision register.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {decisions.map((decision) => (
        <DecisionCard
          key={decision.id}
          decision={decision}
          onEdit={onEdit}
          onArchive={onArchive}
          archiving={archivingId === decision.id}
        />
      ))}
    </div>
  );
}
