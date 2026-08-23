import type { RecommendationFields } from "@/lib/briefing/executive-briefing-types";
import { cn } from "@/lib/utils/cn";

type RecommendationMetaProps = {
  recommendation: RecommendationFields;
  className?: string;
  compact?: boolean;
};

export function RecommendationMeta({
  recommendation,
  className,
  compact = false,
}: RecommendationMetaProps) {
  const items = [
    { label: "Business Impact", value: recommendation.businessImpact },
    {
      label: "Expected Outcome Impact",
      value: recommendation.expectedOutcomeImpact,
    },
    {
      label: "Confidence",
      value: `${recommendation.confidence}%`,
      mono: true,
    },
    { label: "Owner", value: recommendation.owner },
    { label: "Deadline", value: recommendation.deadline, mono: true },
  ];

  return (
    <dl
      className={cn(
        "grid gap-3 border-t border-border pt-4",
        compact
          ? "sm:grid-cols-2"
          : "sm:grid-cols-2 xl:grid-cols-3",
        className,
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="min-w-0 space-y-1">
          <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
            {item.label}
          </dt>
          <dd
            className={cn(
              "text-sm leading-6 text-secondary",
              item.mono && "font-mono text-foreground",
            )}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
