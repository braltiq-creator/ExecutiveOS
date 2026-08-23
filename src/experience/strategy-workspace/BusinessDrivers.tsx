import {
  Handshake,
  Server,
  ShieldAlert,
  Target,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import { ExsOpenLink, ExsSectionHeader, ExsTrend } from "@/experience/exs";
import { Reveal } from "@/experience/motion/Reveal";
import type { SwDriver, SwDriverId } from "@/experience/strategy-workspace/types";
import { cn } from "@/lib/utils/cn";

const DRIVER_ICONS: Record<SwDriverId, LucideIcon> = {
  commercial: TrendingUp,
  customers: Handshake,
  people: Users,
  operations: Target,
  technology: Server,
  risk: ShieldAlert,
};

type Props = {
  drivers: SwDriver[];
  focused?: boolean;
  highlightDriverId?: SwDriverId | null;
};

export function BusinessDrivers({
  drivers,
  focused,
  highlightDriverId,
}: Props) {
  return (
    <Reveal delay={3}>
      <section
        id="business-drivers"
        aria-label="Business Drivers"
        className={cn(
          "scroll-mt-6",
          focused && "exs-entry-focus rounded-[var(--exs-radius)]",
        )}
      >
        <ExsSectionHeader label="Business Drivers" icon={TrendingUp} />
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {drivers.map((driver) => {
            const Icon = DRIVER_ICONS[driver.id];
            const highlight = highlightDriverId === driver.id;
            return (
              <li key={driver.id}>
                <article
                  className={cn(
                    "exs-card h-full",
                    highlight && "exs-entry-focus",
                  )}
                >
                  <header className="flex items-start justify-between gap-2">
                    <p className="exs-label flex items-center gap-1.5">
                      <Icon
                        className="h-3.5 w-3.5"
                        strokeWidth={1.75}
                        aria-hidden="true"
                      />
                      {driver.label}
                    </p>
                    <ExsOpenLink href={driver.href}>Open Analysis →</ExsOpenLink>
                  </header>
                  <p className="exs-value mt-2 text-[length:1.1rem]">
                    {driver.status}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-[length:0.75rem] text-[var(--exs-text-secondary)]">
                    <ExsTrend trend={driver.trend} severity={driver.severity} />
                    {driver.confidence}% confidence
                  </p>
                  <p className="exs-body mt-2 line-clamp-2 text-[length:0.8rem]">
                    {driver.impact}
                  </p>
                </article>
              </li>
            );
          })}
        </ul>
      </section>
    </Reveal>
  );
}
