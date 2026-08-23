import Link from "next/link";
import { SectionShell } from "@/components/shared/SectionShell";
import { MOCK_DECISIONS } from "@/lib/decisions/mock-decisions";

export function PriorityDecisionsPlaceholder() {
  const due = MOCK_DECISIONS.filter(
    (decision) =>
      decision.status === "due_today" || decision.status === "under_review",
  ).slice(0, 3);

  return (
    <SectionShell
      id="today-priority-decisions"
      label="Priority decisions"
      description="Sparse Decision survivors requiring judgement — deep link into the register."
    >
      {due.length === 0 ? (
        <p className="text-sm text-secondary">No Decisions due in the mock set.</p>
      ) : (
        <ul className="max-w-2xl space-y-4">
          {due.map((decision) => (
            <li key={decision.id}>
              <Link
                href={`/decisions/${decision.id}`}
                className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <p className="text-sm font-medium text-foreground group-hover:underline">
                  {decision.question}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {decision.status.replaceAll("_", " ")} · {decision.deadline}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </SectionShell>
  );
}
