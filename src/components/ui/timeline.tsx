import { cn } from "@/lib/utils/cn";

export type TimelineItem = {
  id: string;
  time: string;
  title: string;
  summary?: string;
  badge?: string;
  typeLabel?: string;
};

type TimelineProps = {
  items: TimelineItem[];
  emptyMessage?: string;
  className?: string;
};

export function Timeline({
  items,
  emptyMessage = "No timeline events.",
  className,
}: TimelineProps) {
  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-200 px-5 py-8 text-center text-sm text-zinc-600">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ol className={cn("space-y-3", className)}>
      {items.map((item) => (
        <li
          key={item.id}
          className="relative flex gap-4 rounded-xl border border-zinc-100 bg-zinc-50/50 px-4 py-3"
        >
          <div className="w-28 shrink-0 text-xs leading-5 text-zinc-500">{item.time}</div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {item.typeLabel ? (
                <span className="rounded-full bg-zinc-200/80 px-2 py-0.5 text-[10px] font-medium text-zinc-700">
                  {item.typeLabel}
                </span>
              ) : null}
              {item.badge ? (
                <span className="text-[10px] capitalize text-zinc-500">{item.badge}</span>
              ) : null}
            </div>
            <p className="mt-1 text-sm font-medium text-zinc-900">{item.title}</p>
            {item.summary ? (
              <p className="mt-0.5 text-xs leading-5 text-zinc-600">{item.summary}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
