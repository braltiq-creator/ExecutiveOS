import Link from "next/link";
import type { ExecutiveInsightCard } from "@/lib/intelligence-center/types";

type InsightCardProps = {
  card: ExecutiveInsightCard;
  featured?: boolean;
};

function priorityTone(score: number): string {
  if (score >= 80) return "border-red-200/80 bg-red-50/40";
  if (score >= 65) return "border-amber-200/80 bg-amber-50/30";
  return "border-zinc-200/80 bg-white";
}

export function InsightCard({ card, featured = false }: InsightCardProps) {
  const content = (
    <article
      className={[
        "group rounded-xl border p-4 transition-all hover:shadow-md sm:p-5",
        priorityTone(card.priorityScore),
        featured ? "sm:p-6" : "",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
            {card.categoryLabel}
          </p>
          <h3
            className={[
              "mt-1 font-semibold tracking-tight text-zinc-900",
              featured ? "text-base sm:text-lg" : "text-sm sm:text-base",
            ].join(" ")}
          >
            {card.title}
          </h3>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-semibold text-white">
            {card.priorityScore}
          </span>
          {card.badge ? (
            <span className="rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[10px] font-medium capitalize text-zinc-600">
              {card.badge}
            </span>
          ) : null}
        </div>
      </div>
      <p
        className={[
          "mt-3 leading-6 text-zinc-600",
          featured ? "text-sm sm:text-[15px]" : "line-clamp-3 text-xs sm:text-sm",
        ].join(" ")}
      >
        {card.summary}
      </p>
    </article>
  );

  if (card.href) {
    return (
      <Link href={card.href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
