import Link from "next/link";
import { SectionShell } from "@/components/shared/SectionShell";
import { MOCK_ACTIONS } from "@/lib/mock/actions";

export function ActionsPlaceholder() {
  const open = MOCK_ACTIONS.filter((action) => action.status !== "done").slice(
    0,
    3,
  );

  return (
    <SectionShell
      id="today-actions"
      label="Actions"
      description="Recommended commitments toward Outcomes — execution depth under Actions."
    >
      <ul className="max-w-2xl space-y-3">
        {open.map((action) => (
          <li key={action.id} className="text-sm">
            <p className="font-medium text-foreground">{action.label}</p>
            <p className="mt-0.5 text-xs text-muted">
              {action.owner} · {action.deadline}
              {action.blocker ? ` · Blocked: ${action.blocker}` : null}
            </p>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm">
        <Link
          href="/actions"
          className="text-secondary underline-offset-4 hover:text-foreground hover:underline"
        >
          Open Actions
        </Link>
      </p>
    </SectionShell>
  );
}
