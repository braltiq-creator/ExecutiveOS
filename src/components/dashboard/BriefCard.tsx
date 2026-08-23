import type { BriefItem } from "@/lib/briefing/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type BriefCardProps = {
  item: BriefItem;
  compact?: boolean;
};

function formatBadge(badge: string): string {
  return badge.charAt(0).toUpperCase() + badge.slice(1);
}

export function BriefCard({ item, compact = false }: BriefCardProps) {
  return (
    <Card hover padding="md">
      <CardContent className="p-0">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-medium tracking-tight text-zinc-900">
            {item.title}
          </h3>
          {item.badge ? <Badge>{formatBadge(item.badge)}</Badge> : null}
        </div>
        {!compact ? (
          <p className="mt-3 text-sm leading-6 text-zinc-600">{item.summary}</p>
        ) : (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-600">
            {item.summary}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
