import { InitiativeHealthBadge } from "@/components/initiatives/InitiativeHealthBadge";
import { InitiativeProgress } from "@/components/initiatives/InitiativeProgress";
import { InitiativeStatusBadge } from "@/components/initiatives/InitiativeStatusBadge";
import type { InitiativeWithLinks } from "@/lib/initiatives/types";
import { formatInitiativePriority } from "@/lib/initiatives/types";

type InitiativeCardProps = {
  item: InitiativeWithLinks;
  onEdit: (item: InitiativeWithLinks) => void;
  onArchive: (initiativeId: string) => void;
  archiving?: boolean;
};

function formatDate(value: string | null): string {
  if (!value) {
    return "Not set";
  }

  return new Date(value).toLocaleDateString(undefined, {
    dateStyle: "medium",
  });
}

export function InitiativeCard({
  item,
  onEdit,
  onArchive,
  archiving = false,
}: InitiativeCardProps) {
  const { initiative, links } = item;

  return (
    <article className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <InitiativeStatusBadge status={initiative.status} />
            <InitiativeHealthBadge health={initiative.health_status} />
          </div>
          <h3 className="text-lg font-semibold tracking-tight text-zinc-900">
            {initiative.title}
          </h3>
        </div>
        <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
          {formatInitiativePriority(initiative.priority)} priority
        </span>
      </div>

      {initiative.description ? (
        <p className="mt-4 text-sm leading-6 text-zinc-600">
          {initiative.description}
        </p>
      ) : null}

      <div className="mt-5">
        <InitiativeProgress percentage={initiative.progress_percentage} />
      </div>

      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-zinc-500">Owner</dt>
          <dd className="font-medium text-zinc-900">{initiative.owner}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Start date</dt>
          <dd className="font-medium text-zinc-900">
            {formatDate(initiative.start_date)}
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500">Target date</dt>
          <dd className="font-medium text-zinc-900">
            {formatDate(initiative.target_date)}
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500">Linked items</dt>
          <dd className="font-medium text-zinc-900">{links.length}</dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onEdit(item)}
          className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3.5 text-sm font-medium text-zinc-900 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onArchive(initiative.id)}
          disabled={archiving}
          className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3.5 text-sm font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-50 disabled:opacity-60"
        >
          Archive
        </button>
      </div>
    </article>
  );
}
