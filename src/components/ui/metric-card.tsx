import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { Card } from "@/components/ui/card";

type MetricCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  trend?: string;
  icon?: ReactNode;
  className?: string;
};

export function MetricCard({
  label,
  value,
  hint,
  trend,
  icon,
  className,
}: MetricCardProps) {
  return (
    <Card padding="md" className={className}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">{value}</p>
          {hint ? <p className="mt-1 text-xs text-zinc-500">{hint}</p> : null}
        </div>
        {icon ? <div className="text-zinc-400">{icon}</div> : null}
      </div>
      {trend ? <p className="mt-3 text-xs font-medium text-zinc-600">{trend}</p> : null}
    </Card>
  );
}
