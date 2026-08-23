import type { MeetingPreparation } from "@/lib/intelligence/providers/types";

type MeetingPreparationProps = {
  preparation: MeetingPreparation[];
};

function PreparationGroup({
  title,
  items,
}: {
  title: string;
  items: MeetingPreparation["relatedDecisions"];
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">{title}</p>
      <ul className="mt-2 space-y-2">
        {items.map((item) => (
          <li key={item.id} className="text-sm text-zinc-700">
            <span className="font-medium text-zinc-900">{item.title}</span>
            <span className="text-zinc-500"> — {item.summary}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MeetingPreparationPanel({ preparation }: MeetingPreparationProps) {
  const highlighted = preparation
    .filter((item) => item.preparationScore >= 60)
    .slice(0, 4);

  if (highlighted.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/60 px-6 py-10 text-center">
        <p className="text-sm text-zinc-600">
          No high-priority meeting preparation flagged for today.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {highlighted.map((item) => (
        <article
          key={item.meetingId}
          className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                {new Date(item.startsAt).toLocaleTimeString(undefined, {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
              <h3 className="mt-1 text-lg font-semibold tracking-tight text-zinc-900">
                {item.meetingTitle}
              </h3>
            </div>
            <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700">
              Prep score {item.preparationScore}
            </span>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <PreparationGroup title="Related initiatives" items={item.relatedInitiatives} />
            <PreparationGroup title="Related decisions" items={item.relatedDecisions} />
            <PreparationGroup title="Risks" items={item.relatedRisks} />
            <PreparationGroup title="Opportunities" items={item.relatedOpportunities} />
            <PreparationGroup title="Executive memory" items={item.relevantMemory} />
            <PreparationGroup title="Previous meetings" items={item.previousMeetings} />
          </div>
        </article>
      ))}
    </div>
  );
}
