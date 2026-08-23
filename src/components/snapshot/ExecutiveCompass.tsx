"use client";

import type { ExecutiveCompass } from "@/lib/snapshot/types";
import { ExecutiveBadge, ExecutiveIndicator } from "@/design-system";
import { cn } from "@/lib/utils/cn";

type ExecutiveCompassProps = {
  compass: ExecutiveCompass;
};

const TONE = {
  focus: "focus",
  risk: "risk",
  opportunity: "opportunity",
  capacity: "capacity",
} as const;

export function ExecutiveCompassView({ compass }: ExecutiveCompassProps) {
  return (
    <section aria-labelledby="executive-compass-label" className="eos-compass">
      <ExecutiveBadge id="executive-compass-label">
        Executive Compass
      </ExecutiveBadge>
      <div
        className={cn(
          "mt-[var(--eos-space-md)] grid grid-cols-2",
          "gap-x-[var(--eos-space-xl)] gap-y-[var(--eos-space-md)]",
          "lg:grid-cols-4 lg:gap-x-[var(--eos-space-2xl)]",
        )}
      >
        {compass.dimensions.map((dimension) => (
          <ExecutiveIndicator
            key={dimension.id}
            label={dimension.label}
            value={dimension.strength}
            direction={dimension.direction}
            tone={TONE[dimension.id]}
          />
        ))}
      </div>
    </section>
  );
}
