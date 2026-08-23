import { cn } from "@/lib/utils/cn";

export type ExecutiveContextWalkItem = {
  id: string;
  index: string;
  title: string;
  detail: string;
};

export type ExecutiveBriefIndexItem = {
  id: string;
  index: string;
  label: string;
  value: string;
};

export type ExecutiveContextRailProps = {
  brand?: string;
  domainLabel: string;
  experienceLabel?: string;
  talkTrack: string[];
  walkItems: ExecutiveContextWalkItem[];
  /** Phase 68 — executive briefing index (not a second report). */
  briefIndex?: ExecutiveBriefIndexItem[];
  className?: string;
};

/**
 * Editorial context rail — briefing index / orientation, not a content column.
 */
export function ExecutiveContextRail({
  brand = "ExecutiveOS",
  domainLabel,
  experienceLabel = "Executive Command Centre",
  talkTrack,
  walkItems,
  briefIndex,
  className,
}: ExecutiveContextRailProps) {
  const indexItems =
    briefIndex && briefIndex.length > 0
      ? briefIndex.slice(0, 4)
      : null;

  return (
    <aside
      data-exds-context-rail="true"
      data-exds-briefing-index={indexItems ? "true" : undefined}
      className={cn(
        "exds-reveal-up flex h-full min-h-0 flex-col overflow-hidden",
        "rounded-[calc(var(--exds-card-radius)+2px)] border bg-[var(--exds-navy)]",
        "px-[var(--eos-space-md)] py-[var(--eos-space-md)] text-[var(--exds-navy-fg)]",
        className,
      )}
      style={{
        borderColor: "var(--exds-electric-border)",
        boxShadow: "var(--exds-electric-glow)",
      }}
      aria-label="Executive context"
    >
      <div
        className="shrink-0 space-y-1 border-b pb-3"
        style={{ borderColor: "var(--exds-electric-border)" }}
      >
        <p
          className="text-[length:0.9rem] font-semibold tracking-tight"
          style={{ color: "var(--exds-electric)" }}
        >
          {brand}
        </p>
        <p className="mt-2 text-[length:0.8rem] font-medium leading-snug">
          {domainLabel}
        </p>
        <p
          className="eos-type-caption mt-1"
          style={{ color: "var(--exds-navy-muted)" }}
        >
          {experienceLabel}
        </p>
      </div>

      <div className="mt-4 min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain pr-1">
        {indexItems ? (
          <div>
            <p
              className="exds-editorial-label"
              style={{ color: "var(--exds-electric)" }}
            >
              Executive Brief
            </p>
            <ol className="mt-3 space-y-3">
              {indexItems.map((item) => (
                <li
                  key={item.id}
                  className="grid grid-cols-[2rem_minmax(0,1fr)] gap-2"
                >
                  <span
                    className="tabular-nums text-[length:0.75rem] font-semibold"
                    style={{ color: "var(--exds-electric)" }}
                  >
                    {item.index}
                  </span>
                  <div className="min-w-0">
                    <p
                      className="exds-editorial-label"
                      style={{ color: "var(--exds-navy-muted)" }}
                    >
                      {item.label}
                    </p>
                    <p className="mt-0.5 text-[length:0.78rem] font-semibold leading-snug tracking-tight">
                      {item.value}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <div>
            <p
              className="exds-editorial-label"
              style={{ color: "var(--exds-electric)" }}
            >
              Talk track
            </p>
            <div
              className="mt-3 space-y-2.5 border-l-2 pl-3"
              style={{ borderColor: "var(--exds-electric)" }}
            >
              {talkTrack.slice(0, 3).map((line) => (
                <p
                  key={line}
                  className="text-[length:0.78rem] leading-snug"
                  style={{ color: "var(--exds-navy-fg)" }}
                >
                  {line}
                </p>
              ))}
            </div>
          </div>
        )}

        <div>
          <p
            className="exds-editorial-label"
            style={{ color: "var(--exds-electric)" }}
          >
            Walk the experience
          </p>
          <ol className="mt-3 space-y-2">
            {walkItems.slice(0, 4).map((item) => (
              <li
                key={item.id}
                className="grid grid-cols-[2rem_minmax(0,1fr)] items-baseline gap-2"
              >
                <span
                  className="tabular-nums text-[length:0.75rem] font-semibold"
                  style={{ color: "var(--exds-electric)" }}
                >
                  {item.index}
                </span>
                <p className="text-[length:0.78rem] font-semibold tracking-tight">
                  {item.title}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </aside>
  );
}
